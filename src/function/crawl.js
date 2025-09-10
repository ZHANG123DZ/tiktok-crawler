const path = require('path');
const { crawlTikTokVideoLinks, saveDataToFile } = require('../utils/crawler');

const crawl = async (downloadPath) => {
  //File chứa các thông tin về video của TikTok
  const fileVideoPath = path.join(downloadPath, 'video-links.json');
  const fileMusicPath = path.join(downloadPath, 'music-links.json');
  const fileTopicPath = path.join(downloadPath, 'topics.json');
  const fileTagPath = path.join(downloadPath, 'tags.json');
  const { enrichedData, topicData, tagData, musicData } =
    await crawlTikTokVideoLinks();
  console.log(`🔗 Tìm thấy ${enrichedData.length} video.`);

  //Lưu topic info
  saveDataToFile(topicData, fileTopicPath);
  console.log(`💾 Đã lưu vào: ${fileTopicPath}`);

  //Lưu tag info
  saveDataToFile(tagData, fileTagPath);
  console.log(`💾 Đã lưu vào: ${fileTagPath}`);

  //Lưu music info
  saveDataToFile(musicData, fileMusicPath);
  console.log(`💾 Đã lưu vào: ${fileMusicPath}`);

  //Lưu video info
  saveDataToFile(enrichedData, fileVideoPath);
  console.log(`💾 Đã lưu vào: ${fileVideoPath}`);
};

module.exports = { crawl };
