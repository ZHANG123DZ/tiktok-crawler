const path = require('path');
const {
  loadVideoLinksFromFile,
  loadDataFromFile,
} = require('../utils/crawler');
const TagService = require('../services/tag.service');

async function processTags(downloadPath) {
  const filePath = path.join(downloadPath, 'tags.json');
  const tagList = loadDataFromFile(filePath);

  if (!Array.isArray(tagList) || tagList.length === 0) {
    console.log('❌ Danh sách video rỗng.');
    return;
  }

  console.log(`📦 Bắt đầu xử lý ${tagList.length} tag...`);

  for (const tag of tagList) {
    console.log(`\n📹 Đang xử lý tag: ${tag}`);
    await TagService.createIfNotExists(tag);
  }
  console.log('\n✅ Đã xử lý xong toàn bộ tag.');
  return;
}

module.exports = {
  processTags,
};
