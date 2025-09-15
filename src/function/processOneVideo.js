const fs = require('fs');
const { uploadImageFromUrl, uploadVideo } = require('../utils/uploader.js');
const { downloadVideo } = require('../utils/downloader.js');
const postService = require('../services/post.service.js');
/**
 * Xử lý upload và lưu DB cho 1 video TikTok
 * @param {string} video.description - mô tả video
 * @param {string} video.title - tiêu đề video
 * @param {Object} video
 * @param {string} video.url - URL video gốc
 * @param {string} video.thumbnail - URL ảnh thumbnail
 * @param {string} video.tiktokId - ID video TikTok
 * @param {string} downloadPath - Đường dẫn thư mục lưu file .mp4
 */

async function processOneVideo(video, downloadPath) {
  try {
    // 1. Download video về máy
    const videoFilePath = await downloadVideo(video.url, downloadPath);
    if (!videoFilePath) {
      console.log(`❌ Không tải được video ${video.tiktokId}`);
      return;
    }
    if (!fs.existsSync(videoFilePath)) {
      console.error('❌ File không tồn tại:', videoFilePath);
      return;
    }
    // 2. Upload thumbnail lên Cloudinary
    const thumbnailUrl = await uploadImageFromUrl(video.thumbnail);
    if (!thumbnailUrl) {
      console.log(`❌ Upload thumbnail thất bại: ${video.tiktokId}`);
      return;
    }
    // 3. Upload video lên Cloudinary
    const uploadedVideoUrl = await uploadVideo(videoFilePath);
    if (!uploadedVideoUrl) {
      console.log(`❌ Upload video thất bại: ${video.tiktokId}`);
      return;
    }
    const data = {
      slug: video.tiktokId,
      title: video.title,
      type: 'video',
      status: 'public',
      description: video.description,
      thumbnail: thumbnailUrl,
      content: uploadedVideoUrl,
      musicId: video.music.id || null,
      tags: video.tags,
      topics: video.topics,
      author: video.author,
    };
    await postService.create(data);
    console.log(`✅ Hoàn tất xử lý video ${video.tiktokId}`);
  } catch (err) {
    console.error(`❌ Lỗi khi xử lý video ${video.tiktokId}:`, err.message);
  } finally {
    try {
      if (fs.existsSync(videoFilePath)) {
        fs.unlinkSync(videoFilePath);
      }
    } catch (e) {
      console.warn(`⚠️ Không xoá được file tạm ${video.tiktokId}`);
    }
  }
}
module.exports = {
  processOneVideo,
};
