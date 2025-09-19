// crawler.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

puppeteer.use(StealthPlugin());

// ---------- config ----------
const HEADLESS = true;
const NAV_TIMEOUT = 15000;
const API_TIMEOUT = 15000;
const VIDEO_API_RETRIES = 2;
const TOPIC_CLICK_RETRIES = 3;
const SCROLL_TIMES = 5;
const SLEEP_BETWEEN_VIDEOS = 2000;

// ---------- helpers ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function extractTiktokIdFromUrl(url) {
  const match = url?.match(/\/video\/(\d+)/);
  return match ? match[1] : null;
}
function extractDescription(raw) {
  if (!raw) return null;
  const cutPoints = ['#', 'created by', 'original sound'];
  let cutIndex = raw.length;
  for (const point of cutPoints) {
    const idx = raw.toLowerCase().indexOf(point.toLowerCase());
    if (idx !== -1 && idx < cutIndex) cutIndex = idx;
  }
  return raw.slice(0, cutIndex).trim();
}
function extractHashtags(alt) {
  try {
    const matches = alt.match(/#[\p{L}\p{N}_]+/gu) || [];
    return matches.map((tag) => tag.slice(1));
  } catch {
    return [];
  }
}

// ---------- Tikwm API with retry ----------
async function getVideoData(url, retries = VIDEO_API_RETRIES) {
  const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
  try {
    const res = await axios.get(apiUrl, { timeout: API_TIMEOUT });
    if (res.data?.code === -1 && retries > 0) {
      await sleep(1500);
      return getVideoData(url, retries - 1);
    }
    return res.data || {};
  } catch (err) {
    if (retries > 0) {
      await sleep(1500);
      return getVideoData(url, retries - 1);
    }
    console.warn('getVideoData fail:', err.message);
    return {};
  }
}

async function getUserInfo(username, retries = 1) {
  if (!username) return null;
  const apiUrl = `https://www.tikwm.com/api/user/info?unique_id=${encodeURIComponent(
    username
  )}`;
  try {
    const res = await axios.get(apiUrl, { timeout: API_TIMEOUT });
    return res.data?.data?.user || null;
  } catch (err) {
    if (retries > 0) {
      await sleep(1000);
      return getUserInfo(username, retries - 1);
    }
    return null;
  }
}

// ---------- robust click topic ----------
async function clickTopicByText(page, topicText) {
  return page.evaluate((text) => {
    try {
      const container = document.querySelector('div.e1hq7i0k0');
      if (!container) return false;
      for (const it of Array.from(container.children)) {
        const span = it.querySelector('span');
        const t = span?.innerText?.trim();
        if (!t) continue;
        if (t === text || t.includes(text) || text.includes(t)) {
          it.scrollIntoView({ block: 'center', inline: 'center' });
          (it.querySelector('a') || it.querySelector('button') || it).click();
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }, topicText);
}

// ---------- main crawler ----------
async function crawlTikTokVideoLinks() {
  const browser = await puppeteer.launch({
    headless: HEADLESS,
    defaultViewport: null,
    args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
  );

  try {
    await page.goto('https://www.tiktok.com/explore', {
      waitUntil: 'domcontentloaded',
      timeout: NAV_TIMEOUT,
    });
    await page.waitForSelector('div.e1hq7i0k0', { timeout: NAV_TIMEOUT });
  } catch (err) {
    console.error('Cannot open explore page:', err.message);
    await browser.close();
    throw err;
  }

  // get topics
  let topics = [];
  try {
    topics = await page.$$eval('div.e1hq7i0k0 > *', (els) =>
      els
        .map((el) => el.querySelector('span')?.innerText?.trim())
        .filter(Boolean)
    );
  } catch {}
  if (!topics.length) {
    topics = await page.$$eval('div.e1hq7i0k0 span', (els) =>
      els.map((s) => s.innerText?.trim()).filter(Boolean)
    );
  }
  console.log('Topics discovered:', topics.length);

  // collectors
  const enrichedData = [];
  const musicData = [];
  const userData = [];
  const tagSet = new Set();
  const topicData = [];

  // loop topics
  for (const topic of topics) {
    if (!topic) continue;
    topicData.push(topic);

    let clicked = false;
    for (let attempt = 1; attempt <= TOPIC_CLICK_RETRIES; attempt++) {
      try {
        await page.waitForSelector('div.e1hq7i0k0', { timeout: 5000 });
        clicked = await clickTopicByText(page, topic);
        if (!clicked) {
          await page.evaluate(() => {
            const c = document.querySelector('div.e1hq7i0k0');
            if (c) c.scrollLeft += 200;
          });
          await sleep(400);
          continue;
        }
        await page
          .waitForSelector('div[data-e2e="explore-item"]', { timeout: 8000 })
          .catch(() => {});
        break;
      } catch (err) {
        console.warn(
          `Attempt ${attempt} click topic "${topic}" failed:`,
          err.message
        );
        await sleep(500 * attempt);
      }
    }
    if (!clicked) {
      console.warn(`❌ Skip topic (cannot click): ${topic}`);
      continue;
    }

    // scroll page
    for (let s = 0; s < SCROLL_TIMES; s++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await sleep(1200);
    }

    // collect anchors
    let videoData = [];
    try {
      videoData = await page.$$eval(
        'div[data-e2e="explore-item"] a',
        (anchors) =>
          anchors.map((a) => {
            const img = a.querySelector('img');
            return {
              url: a.href,
              thumbnail: img?.src || null,
              rawAlt: img?.alt || '',
            };
          })
      );
    } catch (err) {
      console.warn('Failed collect anchors for topic', topic, err.message);
    }
    console.log(`Topic "${topic}" — ${videoData.length} videos`);

    // process videos
    for (const item of videoData) {
      try {
        await sleep(SLEEP_BETWEEN_VIDEOS);

        const apiRes = await getVideoData(item.url);
        const dataResp = apiRes?.data || {};
        const tiktokId = extractTiktokIdFromUrl(item.url);

        // hashtags
        const newTags = extractHashtags(item.rawAlt || '');
        newTags.forEach((t) => tagSet.add(t));

        // music
        const musicInfo = dataResp?.music_info || {};
        const musicDataInfo = {
          thumbnail: musicInfo?.cover || item.thumbnail || null,
          id: musicInfo?.id || null,
          author:
            musicInfo?.title?.split('original sound - ')[1] ||
            musicInfo?.author ||
            null,
          link: item.url,
          title: item?.title,
        };

        // user info from music author
        const musicAuthor = musicDataInfo.author;
        if (musicAuthor && !userData.some((u) => u.unique_id === musicAuthor)) {
          const user = await getUserInfo(musicAuthor);
          if (user) {
            userData.push({
              unique_id: user.uniqueId,
              avatar: user.avatarLarger,
              nickname: user.nickname,
              id: user.id,
            });
          }
        }

        const authorPost = dataResp?.author || null;

        // enriched
        if (tiktokId && !enrichedData.some((m) => m.tiktokId === tiktokId)) {
          enrichedData.push({
            url: item.url,
            tiktokId,
            thumbnail: item.thumbnail,
            description: extractDescription(item.rawAlt || ''),
            title: extractDescription(item.rawAlt || ''),
            topics: [topic],
            tags: newTags,
            music: musicDataInfo,
            author: authorPost,
          });
        }

        // unique music
        if (
          musicDataInfo.id &&
          !musicData.some((m) => m.id === musicDataInfo.id)
        ) {
          musicData.push(musicDataInfo);
        }

        // unique author
        if (authorPost?.id && !userData.some((u) => u.id === authorPost.id)) {
          userData.push(authorPost);
        }
      } catch (err) {
        console.warn('Error processing video:', err.message);
      }
    }

    // reset scroll
    await page
      .$eval('div.e1hq7i0k0', (el) => (el.scrollLeft = 0))
      .catch(() => {});
    await sleep(500);
  }

  await browser.close();

  return {
    enrichedData: enrichedData.filter((i) => i.tiktokId && i.music?.thumbnail),
    topicData,
    tagData: [...tagSet],
    musicData,
    userData,
  };
}

// ---------- file utils ----------
function saveDataToFile(data, filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
function loadDataFromFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.warn('loadDataFromFile parse error:', err.message);
    return [];
  }
}

module.exports = { crawlTikTokVideoLinks, saveDataToFile, loadDataFromFile };
