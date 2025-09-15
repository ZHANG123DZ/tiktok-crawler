const { User } = require('../models');

class UsersService {
  async createOrUpdate(data) {
    if (!data.username) {
      throw new Error('username is required');
    }

    let user = await User.findOne({ where: { username: data.username } });

    if (user) {
      await user.update(data); // cập nhật với dữ liệu mới
      return user;
    }

    user = await User.create(data);
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
