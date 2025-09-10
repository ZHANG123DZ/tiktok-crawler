const { Topic } = require('../models');
const slugify = require('slugify');

class TopicService {
  /**
   * Tạo topic mới nếu chưa tồn tại
   * @param {string} name - tên topic
   * @returns {Promise<Topic>} - bản ghi topic
   */
  static async createIfNotExists(name) {
    if (!name) throw new Error('Topic name is required');

    const slug = slugify(name, {
      lower: true,
      strict: true,
    });

    const [topic, created] = await Topic.findOrCreate({
      where: { slug },
      defaults: {
        name,
        slug,
      },
    });

    return topic;
  }
}

module.exports = TopicService;
