const { deleteFolder } = require('./src/utils/deleteFolder');
const { processAllVideos } = require('./src/function/processAllVideo');
const { crawl } = require('./src/function/crawl');
const { createUsers } = require('./src/function/createUser');
const { processTags } = require('./src/function/processTags');
const { processTopics } = require('./src/function/processTopics');
const { processAllMusics } = require('./src/function/processAllMusics');
const downloadPath = 'D:/tiktok-video';

const crawlerVideoTiktok = async () => {
  // await crawl(downloadPath);
  // await processTags(downloadPath);
  // await processTopics(downloadPath);
  // await createUsers(downloadPath);
  // await processAllMusics(downloadPath);
  await processAllVideos(downloadPath);
  // await deleteFolder(downloadPath);
};

crawlerVideoTiktok();
