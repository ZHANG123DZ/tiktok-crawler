const { TikTokVideo } = require('../models'); // Đảm bảo đúng path đến model của bạn

/**
 * Lưu video TikTok vào DB (tạo mới hoặc cập nhật nếu đã tồn tại)
 * @param {Object} data
 * @param {string} data.tiktokId
 * @param {string|null} data.title
 * @param {string|null} data.description
 * @param {string|null} data.content
 * @param {string|null} data.thumbnail
 * @param {string|null} data.videoUrl
 */
async function saveTiktokVideo(data) {
  if (!data?.tiktokId) {
    throw new Error('Thiếu tiktokId');
  }

  const existing = await TikTokVideo.findOne({
    where: { tiktokId: data.tiktokId },
  });

  if (existing) {
    // ✅ Cập nhật nếu đã tồn tại
    await existing.update({
      title: data.title,
      description: data.description,
      content: data.content,
      thumbnail: data.thumbnail,
      videoUrl: data.videoUrl,
    });
    console.log(`🔁 Cập nhật video ${data.tiktokId} vào DB`);
  } else {
    // ✅ Tạo mới
    await TikTokVideo.create({
      tiktokId: data.tiktokId,
      title: data.title,
      description: data.description,
      content: data.content,
      thumbnail: data.thumbnail,
      videoUrl: data.videoUrl,
    });
    console.log(`💾 Đã lưu video mới ${data.tiktokId} vào DB`);
  }
}

module.exports = {
  saveTiktokVideo,
};
