const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

puppeteer.use(StealthPlugin());

async function getVideoData(url) {
  const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
  const res = await axios.get(apiUrl);
  return res.data;
}

function extractTiktokIdFromUrl(url) {
  const match = url.match(/\/video\/(\d+)/);
  return match ? match[1] : null;
}

function extractDescription(raw) {
  if (!raw) return null;

  const cutPoints = ['#', 'created by', 'original sound'];
  let cutIndex = raw.length;

  for (const point of cutPoints) {
    const idx = raw.toLowerCase().indexOf(point.toLowerCase());
    if (idx !== -1 && idx < cutIndex) {
      cutIndex = idx;
    }
  }

  const clean = raw.slice(0, cutIndex).trim();
  return clean;
}

function extractHashtags(alt) {
  const matches = alt.match(/#[\p{L}\p{N}_]+/gu) || [];
  return matches.map((tag) => tag.slice(1));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function crawlTikTokVideoLinks() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized'],
  });

  const page = await browser.newPage();
  await page.goto('https://www.tiktok.com/explore', {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForSelector('div.e1hq7i0k0');

  // Số lượng nút (để loop bằng index và re-query mỗi lần)
  const totalButtons = await page.$$eval(
    'div.e1hq7i0k0 > *',
    (els) => els.length
  );

  let musicData = [];
  let enrichedData = [];
  const tagSet = new Set();
  const topicData = [];

  // Bắt đầu từ 2 để bỏ phần tử đầu (nth-child là 1-based)
  for (let idx = 2; idx <= totalButtons; idx++) {
    const btnSelector = `div.e1hq7i0k0 > *:nth-child(${idx})`;

    // re-query handle mỗi lần (tránh detached)
    const btn = await page.$(btnSelector);
    if (!btn) continue;

    // Lấy topic từ span con (nếu có)
    const topic = await btn.evaluate((el) => {
      const s = el.querySelector('span');
      return s ? s.innerText.trim() : null;
    });
    if (topic) topicData.push(topic);

    // Click (try fallback nếu evaluate click fail)
    try {
      await btn.evaluate((el) => el.click());
      console.log(`Đã click vào topic: ${topic}`);
    } catch (e) {
      try {
        // fallback: click bằng selector
        await page.click(btnSelector);
        console.log(`Đã click vào topic: ${topic}`);
      } catch (err) {
        console.warn('Click failed for', btnSelector, err);
        continue;
      }
    }

    // Chờ video list xuất hiện hoặc fallback sleep
    try {
      await page.waitForSelector('div[data-e2e="explore-item"]', {
        timeout: 7000,
      });
    } catch (e) {
      await sleep(2000);
    }

    // Scroll để load thêm video (tùy chỉnh số lần / delay)
    for (let s = 0; s < 3; s++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await sleep(2000);
    }

    // Lấy danh sách video hiện có
    const videoData = await page.$$eval(
      'div[data-e2e="explore-item"] a',
      (anchors) =>
        anchors.map((a) => {
          const img = a.querySelector('img');
          return {
            url: a.href,
            music: { link: a.href },
            thumbnail: img?.src || null,
            rawAlt: img?.alt || '',
          };
        })
    );

    // Crawl từng video (thực thi tuần tự, có sleep để tránh rate-limit)
    for (const item of videoData) {
      await sleep(2000); // chậm lại ~1 request/giây
      let dataResp;
      try {
        const res = await getVideoData(item.url);
        // res có thể là { code: -1, msg: '...' } hoặc { data: { ... } }
        if (res && res.data) dataResp = res.data;
        else if (res && res.code === -1) {
          // rate-limit trả về: chờ và thử lại 1 lần
          await sleep(1500);
          const retry = await getVideoData(item.url);
          dataResp = retry?.data || {};
        } else {
          dataResp = res || {};
        }
      } catch (err) {
        console.warn('getVideoData error for', item.url, err);
        dataResp = {};
      }

      const newTags = extractHashtags(item.rawAlt) || [];
      newTags.forEach((t) => tagSet.add(t));

      const musicInfo = dataResp?.music_info || {};
      const tiktokId = extractTiktokIdFromUrl(item.url);

      if (tiktokId && !enrichedData.some((m) => m.tiktokId === tiktokId)) {
        enrichedData.push({
          ...item,
          tiktokId: tiktokId,
          description: extractDescription(item.rawAlt),
          title: extractDescription(item.rawAlt),
          topics: topic ? [topic] : [],
          tags: newTags,
          music: {
            ...(item.music || {}),
            thumbnail: musicInfo.cover || item.thumbnail || null,
            tiktokId: musicInfo.id || null,
          },
        });
      }
      if (musicInfo.id && !musicData.some((m) => m.tiktokId === musicInfo.id)) {
        musicData.push({
          ...(item.music || {}),
          thumbnail: musicInfo.cover || item.thumbnail || null,
          tiktokId: musicInfo.id,
        });
      }
    }

    // Reset scroll ngang của container topic (nếu cần)
    try {
      await page.$eval('div.e1hq7i0k0', (el) => {
        el.scrollLeft = 0;
      });
    } catch (e) {
      /* ignore */
    }

    // Nhỏ pause trước khi next button
    await sleep(500);
  }

  await browser.close();

  return {
    enrichedData: enrichedData.filter((i) => i.tiktokId && i.music?.thumbnail),
    topicData,
    tagData: [...tagSet],
    musicData,
  };
}

function saveDataToFile(data, filePath) {
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function loadVideoLinksFromFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')).map((i) => i.url);
}

function loadThumbnailLinksFromFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')).map((i) => i.thumbnail);
}

function loadDataFromFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

module.exports = {
  crawlTikTokVideoLinks,
  saveDataToFile,
  loadVideoLinksFromFile,
  loadThumbnailLinksFromFile,
  loadDataFromFile,
};
