const fs = require('fs');

const deleteFolder = async (folderPath) => {
  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, { recursive: true, force: true });
    console.log(`🗑️ Đã xóa folder: ${folderPath}`);
  } else {
    console.log(`⚠️ Folder không tồn tại: ${folderPath}`);
  }
};

module.exports = {
  deleteFolder,
};
