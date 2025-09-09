const { crawler } = require('./crawl');
const { deleteFolder } = require('./src/utils/deleteFolder');
const { processAllVideos } = require('./processAllVideo');
const downloadPath = 'D:/tiktok-video';

const crawlerVideoTiktok = async () => {
  await crawler(downloadPath);
  await processAllVideos(downloadPath);
  await deleteFolder(downloadPath);
};

crawlerVideoTiktok();
