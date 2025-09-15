const path = require('path');
const { loadDataFromFile } = require('../utils/crawler');
const { processOneMusic } = require('./processOneMusic');
const musicService = require('../services/music.service');
/**
 * Xử lý toàn bộ danh sách music TikTok
 * @param {Array<Object>} musicList - Danh sách music object ({ url, tiktokId, thumbnail })
 * @param {string} downloadPath - Đường dẫn lưu file .mp4 tạm thời
 */
async function processAllMusics(downloadPath) {
  const filePath = path.join(downloadPath, 'music-links.json');
  const musicList = loadDataFromFile(filePath);

  if (!Array.isArray(musicList) || musicList.length === 0) {
    console.log('❌ Danh sách music rỗng.');
    return;
  }

  console.log(`📦 Bắt đầu xử lý ${musicList.length} music...`);

  for (const music of musicList) {
    console.log(`\n📹 Đang xử lý music: ${music.id}`);
    const exits = await musicService.checkExists(music.id);
    if (!exits) await processOneMusic(music, downloadPath);
  }

  console.log('\n✅ Đã xử lý xong toàn bộ music.');
}

module.exports = {
  processAllMusics,
};
