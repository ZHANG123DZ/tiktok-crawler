const path = require('path');
const { loadDataFromFile } = require('../utils/crawler');
const TopicService = require('../services/topic.service');

async function processTopics(downloadPath) {
  const filePath = path.join(downloadPath, 'topics.json');
  const topicList = loadDataFromFile(filePath);

  if (!Array.isArray(topicList) || topicList.length === 0) {
    console.log('❌ Danh sách chủ đề rỗng.');
    return;
  }

  console.log(`📦 Bắt đầu xử lý ${topicList.length} chủ đề...`);

  for (const topic of topicList) {
    console.log(`\n📹 Đang xử lý chủ đề: ${topic}`);
    await TopicService.createIfNotExists(topic);
  }
  console.log('\n✅ Đã xử lý xong toàn bộ chủ đề.');
  return;
}

module.exports = {
  processTopics,
};
