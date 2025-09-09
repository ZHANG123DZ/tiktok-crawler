const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

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

  await page.waitForSelector('div[data-e2e="explore-item-list"]');

  for (let i = 0; i < 2; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await new Promise((r) => setTimeout(r, 1500));
  }

  const videoData = await page.$$eval(
    'div[data-e2e="explore-item"] a',
    (anchors) => {
      return anchors.map((a) => {
        const img = a.querySelector('img');
        return {
          url: a.href,
          thumbnail: img ? img.src : null,
          rawAlt: img?.alt || '',
        };
      });
    }
  );

  const enrichedData = videoData
    .map((item) => ({
      ...item,
      tiktokId: extractTiktokIdFromUrl(item.url),
      description: extractDescription(item.rawAlt),
      title: extractDescription(item.rawAlt),
    }))
    .filter((item) => item.tiktokId && item.thumbnail);

  await browser.close();
  return enrichedData;
}

function saveVideoLinksToFile(videoLinks, filePath) {
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(videoLinks, null, 2), 'utf-8');
}

function loadVideoLinksFromFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')).map((i) => i.url);
}

function loadThumbnailLinksFromFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')).map((i) => i.thumbnail);
}

function loadVideoLinksFromFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

module.exports = {
  crawlTikTokVideoLinks,
  saveVideoLinksToFile,
  loadVideoLinksFromFile,
  loadThumbnailLinksFromFile,
  loadVideoLinksFromFile,
};
