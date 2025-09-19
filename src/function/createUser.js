const path = require('path');
const { loadDataFromFile } = require('../utils/crawler');
const UsersService = require('../services/user.service');
const bcrypt = require('bcrypt');

async function createUsers(downloadPath) {
  const filePath = path.join(downloadPath, 'users.json');
  const userList = loadDataFromFile(filePath);

  if (!Array.isArray(userList) || userList.length === 0) {
    console.log('❌ Danh sách user rỗng.');
    return;
  }

  console.log(`📦 Bắt đầu xử lý ${userList.length} user...`);

  for (const user of userList) {
    console.log(`\n📹 Đang xử lý user: ${user.unique_id}`);
    const passwordHash = await bcrypt.hash('A123@abc', 10);

    const data = {
      avatar: user.avatar,
      username: user.unique_id,
      name: user.nickname,
      password: passwordHash,
    };
    await UsersService.createOrUpdate(data);
  }

  console.log('\n✅ Đã xử lý xong toàn bộ user.');
  return;
}

module.exports = {
  createUsers,
};
