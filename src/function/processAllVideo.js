const path = require('path');
const {
  loadVideoLinksFromFile,
  loadDataFromFile,
} = require('../utils/crawler');
const { processOneVideo } = require('./processOneVideo');
const postService = require('../services/post.service');

/**
 * Xử lý toàn bộ danh sách video TikTok
 * @param {Array<Object>} videoList - Danh sách video object ({ url, tiktokId, thumbnail })
 * @param {string} downloadPath - Đường dẫn lưu file .mp4 tạm thời
 */
async function processAllVideos(downloadPath) {
  const filePath = path.join(downloadPath, 'video-links.json');
  const videoList = loadDataFromFile(filePath);

  if (!Array.isArray(videoList) || videoList.length === 0) {
    console.log('❌ Danh sách video rỗng.');
    return;
  }

  console.log(`📦 Bắt đầu xử lý ${videoList.length} video...`);

  for (const video of videoList) {
    // const exits = await postService.checkExits(video.tiktokId);
    if (true) {
      await processOneVideo(video, downloadPath);
    }
  }

  console.log('\n✅ Đã xử lý xong toàn bộ video.');
  return;
}

module.exports = {
  processAllVideos,
};
