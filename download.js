const path = require('path');
const { loadVideoLinksFromFile } = require('./src/utils/crawler');
const { downloadAllVideos } = require('./src/utils/downloader');
const fs = require('fs');

const download = async (downloadPath) => {
  const filePath = path.join(downloadPath, 'video-links.json');
  const urls = loadVideoLinksFromFile(filePath).map((i) => i.url);
  if (urls.length === 0) {
    console.log('❌ Không có video nào để tải.');
    return;
  }
  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath, { recursive: true });
  }
  console.log(`📥 Bắt đầu tải ${urls.length} video...`);
  await downloadAllVideos(urls, downloadPath);
};

module.exports = { download };
