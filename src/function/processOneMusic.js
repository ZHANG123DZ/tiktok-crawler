const path = require('path');
const fs = require('fs');
const { uploadImageFromUrl, uploadAudio } = require('../utils/uploader.js');
const { downloadAudio } = require('../utils/downloader.js');
const userService = require('../services/user.service.js');
const musicService = require('../services/music.service.js');
/**
 * Xử lý upload và lưu DB cho 1 music TikTok
 * @param {string} music.thumbnail - URL ảnh thumbnail
 * @param {string} music.id - ID music TikTok
 * @param {string} downloadPath - Đường dẫn thư mục lưu file .mp4
 */
async function processOneMusic(music, downloadPath) {
  try {
    // 1. Download music về máy
    const musicFilePath = await downloadAudio(music.link, downloadPath);
    if (!musicFilePath) {
      console.log(`❌ Không tải được music ${music.id}`);
      return;
    }

    if (!fs.existsSync(musicFilePath)) {
      console.error('❌ File không tồn tại:', musicFilePath);
      return;
    }

    const author = await userService.getUser(music.author);
    music.authorId = author?.id;
    await musicService.createOrUpdate(music, musicFilePath);

    console.log(`✅ Hoàn tất xử lý music ${music.id}`);
  } catch (err) {
    console.error(`❌ Lỗi khi xử lý music ${music.id}:`, err.message);
  } finally {
    try {
      if (fs.existsSync(musicFilePath)) {
        fs.unlinkSync(musicFilePath);
      }
    } catch (e) {
      console.warn(`⚠️ Không xoá được file tạm ${music.id}`);
    }
  }
}
module.exports = {
  processOneMusic,
};
