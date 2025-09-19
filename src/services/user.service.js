const { setupElasticUser } = require('../function/elasticSetup');
const { User } = require('../models');
const { uploadImageFromUrl } = require('../utils/uploader');

class UsersService {
  async createOrUpdate(data) {
    if (!data.username) {
      throw new Error('username is required');
    }

    let user = await User.findOne({ where: { username: data.username } });

    if (user) {
      return user;
    }

    const avatarUrl = await uploadImageFromUrl(data.avatar);
    if (!avatarUrl) {
      console.log(`❌ Upload avatar thất bại: ${data.username}`);
      return;
    }
    data.avatar = avatarUrl;
    user = await User.create(data);
    const elasticUser = {
      id: user.id,
      username: user.username,
      name: user.name,
      bio: user.bio,
    };
    await setupElasticUser(elasticUser);
    return user;
  }

  async getUser(username) {
    const user = await User.findOne({
      where: { username: username },
      attributes: ['id'],
    });
    return user;
  }
}

module.exports = new UsersService();
