const { Music } = require('../models');
const { uploadImageFromUrl, uploadAudio } = require('../utils/uploader');

class MusicsService {
  async createOrUpdate(musicData, musicFilePath) {
    const existingMusic = await Music.findOne({
      where: { slug: musicData.id },
    });
    const data = {
      slug: musicData.id,
      title: musicData?.title || '',
    };

    if (existingMusic) {
      // await existingMusic.update(data);
      return existingMusic;
    }
    data.authorId = musicData.authorId;
    const thumbnailUrl = await uploadImageFromUrl(musicData.thumbnail);
    if (!thumbnailUrl) {
      console.log(`❌ Upload thumbnail thất bại: ${data.slug}`);
      return;
    }

    const uploadedMusicUrl = await uploadAudio(musicFilePath);
    if (!uploadedMusicUrl) {
      console.log(`❌ Upload music thất bại: ${data.slug}`);
      return;
    }

    data.thumbnail = thumbnailUrl;
    data.audio = uploadedMusicUrl;

    const music = await Music.create(data);
    return music;
  }

  async getMusic(slug) {
    const music = await Music.findOne({
      where: { slug },
      attributes: ['id'],
    });
    return music;
  }
  async checkExists(slug) {
    const exists = await Music.findOne({ where: { slug } });
    return !!exists;
  }
}

module.exports = new MusicsService();
