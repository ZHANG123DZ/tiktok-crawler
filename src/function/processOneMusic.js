const path = require('path');
const fs = require('fs');
const { uploadImageFromUrl, uploadAudio } = require('../utils/uploader.js');
const { saveTiktokMusic } = require('../services/tiktok-music.service.js');
const { downloadAudio } = require('../utils/downloader.js');
/**
 * Xử lý upload và lưu DB cho 1 music TikTok
 * @param {string} music.thumbnail - URL ảnh thumbnail
 * @param {string} music.tiktokId - ID music TikTok
 * @param {string} downloadPath - Đường dẫn thư mục lưu file .mp4
 */
async function processOneMusic(music, downloadPath) {
  try {
    // 1. Download music về máy
    const musicFilePath = await downloadAudio(music.link, downloadPath);
    if (!musicFilePath) {
      console.log(`❌ Không tải được music ${music.tiktokId}`);
      return;
    }

    if (!fs.existsSync(musicFilePath)) {
      console.error('❌ File không tồn tại:', musicFilePath);
      return;
    }

    // 2. Upload thumbnail lên Cloudinary
    const thumbnailUrl = await uploadImageFromUrl(music.thumbnail);
    if (!thumbnailUrl) {
      console.log(`❌ Upload thumbnail thất bại: ${music.tiktokId}`);
      return;
    }

    // 3. Upload music lên Cloudinary
    const uploadedMusicUrl = await uploadAudio(musicFilePath);
    if (!uploadedMusicUrl) {
      console.log(`❌ Upload music thất bại: ${music.tiktokId}`);
      return;
    }

    // 4. Lưu vào DB
    await saveTiktokMusic({
      tiktokId: music.tiktokId,
      audio: uploadedMusicUrl,
      thumbnail: thumbnailUrl,
    });

    console.log(`✅ Hoàn tất xử lý music ${music.tiktokId}`);
  } catch (err) {
    console.error(`❌ Lỗi khi xử lý music ${music.tiktokId}:`, err.message);
  } finally {
    try {
      if (fs.existsSync(musicFilePath)) {
        fs.unlinkSync(musicFilePath);
      }
    } catch (e) {
      console.warn(`⚠️ Không xoá được file tạm ${music.tiktokId}`);
    }
  }
}
module.exports = {
  processOneMusic,
};
