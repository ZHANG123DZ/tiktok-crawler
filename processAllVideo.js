const { processOneVideo } = require('./processOneVideo');
const path = require('path');
const { loadVideoLinksFromFile } = require('./src/utils/crawler');

/**
 * Xử lý toàn bộ danh sách video TikTok
 * @param {Array<Object>} videoList - Danh sách video object ({ url, tiktokId, thumbnail })
 * @param {string} downloadPath - Đường dẫn lưu file .mp4 tạm thời
 */
async function processAllVideos(downloadPath) {
  const filePath = path.join(downloadPath, 'video-links.json');
  const videoList = loadVideoLinksFromFile(filePath);

  if (!Array.isArray(videoList) || videoList.length === 0) {
    console.log('❌ Danh sách video rỗng.');
    return;
  }

  console.log(`📦 Bắt đầu xử lý ${videoList.length} video...`);

  for (const video of videoList) {
    console.log(`\n📹 Đang xử lý video: ${video.tiktokId}`);
    await processOneVideo(video, downloadPath);
  }

  console.log('\n✅ Đã xử lý xong toàn bộ video.');
}

module.exports = {
  processAllVideos,
};
