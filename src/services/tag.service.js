const { Tag } = require('../models');
const slugify = require('slugify');

class TagService {
  /**
   * Tạo tag mới nếu chưa tồn tại
   * @param {string} name - tên tag
   * @returns {Promise<Tag>} - bản ghi tag
   */
  static async createIfNotExists(name) {
    if (!name) throw new Error('Tag name is required');

    const slug = slugify(name, {
      lower: true,
      strict: true,
    });

    const [tag, created] = await Tag.findOrCreate({
      where: { slug },
      defaults: {
        name,
        slug,
      },
    });

    return tag;
  }

  async getTag(slug) {
    const data = await Tag.findOne({
      where: { slug: slug },
      attributes: ['id'],
    });
    return data;
  }
}

module.exports = TagService;
