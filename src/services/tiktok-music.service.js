const { TikTokMusic } = require('../models'); // Đảm bảo đúng path đến model của bạn

/**
 * Lưu music TikTok vào DB (tạo mới hoặc cập nhật nếu đã tồn tại)
 * @param {Object} data
 * @param {string} data.tiktokId
 * @param {string|null} data.audio
 * @param {string|null} data.thumbnail
 */
async function saveTiktokMusic(data) {
  if (!data?.tiktokId) {
    throw new Error('Thiếu tiktokId');
  }

  const existing = await TikTokMusic.findOne({
    where: { tiktokId: data.tiktokId },
  });

  if (existing) {
    // ✅ Cập nhật nếu đã tồn tại
    await existing.update({
      audio: data.audio,
      thumbnail: data.thumbnail,
    });
    console.log(`🔁 Cập nhật music ${data.tiktokId} vào DB`);
  } else {
    // ✅ Tạo mới
    await TikTokMusic.create({
      tiktokId: data.tiktokId,
      audio: data.audio,
      thumbnail: data.thumbnail,
    });
    console.log(`💾 Đã lưu music mới ${data.tiktokId} vào DB`);
  }
}

async function getMusic(tiktokId) {
  if (!tiktokId) {
    throw new Error('Thiếu tiktokId');
  }

  const music = await TikTokMusic.findOne({
    where: { tiktokId },
  });

  return music;
}

module.exports = {
  saveTiktokMusic,
  getMusic,
};
