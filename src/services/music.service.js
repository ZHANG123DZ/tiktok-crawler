const { Music } = require('../models');

class MusicsService {
  async createOrUpdate(data) {
    const existingMusic = await Music.findOne({
      where: { slug: data.slug },
    });

    if (existingMusic) {
      await existingMusic.update(data);
      return existingMusic;
    }

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
