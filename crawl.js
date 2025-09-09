const path = require('path');
const {
  crawlTikTokVideoLinks,
  saveVideoLinksToFile,
} = require('./src/utils/crawler');

const crawler = async (downloadPath) => {
  const filePath = path.join(downloadPath, 'video-links.json');
  const videoLinks = await crawlTikTokVideoLinks();
  console.log(`🔗 Tìm thấy ${videoLinks.length} video.`);
  saveVideoLinksToFile(videoLinks, filePath);
  console.log(`💾 Đã lưu vào: ${filePath}`);
};

module.exports = { crawler };
