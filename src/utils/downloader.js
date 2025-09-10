const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

function downloadVideo(url, downloadDir) {
  return new Promise((resolve) => {
    const cmd = `D:/yt-dlp -o "${downloadDir}/%(title).40s [%(id)s].%(ext)s" "${url}"`;

    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error(`❌ Lỗi khi tải: ${url}`);
        console.error(stderr || err.message);
        return resolve(null);
      }

      console.log(`✅ Tải xong: ${url}`);

      // Tìm file mới nhất trong thư mục
      const files = fs
        .readdirSync(downloadDir)
        .map((name) => ({
          name,
          time: fs.statSync(path.join(downloadDir, name)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time); // file mới nhất lên đầu

      if (files.length === 0) return resolve(null);

      const newestFile = path.join(downloadDir, files[0].name);
      resolve(newestFile);
    });
  });
}

function downloadAudio(url, downloadDir) {
  return new Promise((resolve) => {
    const cmd = `D:/yt-dlp --extract-audio --audio-format mp3 -o "${downloadDir}/%(title).40s [%(id)s].%(ext)s" "${url}"`;

    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error(`❌ Lỗi khi tải audio: ${url}`);
        console.error(stderr || err.message);
        return resolve(null);
      }

      console.log(`🎵 Tải xong audio: ${url}`);

      // Tìm file mới nhất trong thư mục
      const files = fs
        .readdirSync(downloadDir)
        .map((name) => ({
          name,
          time: fs.statSync(path.join(downloadDir, name)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time); // file mới nhất lên đầu

      if (files.length === 0) return resolve(null);

      const newestFile = path.join(downloadDir, files[0].name);
      resolve(newestFile);
    });
  });
}

module.exports = {
  downloadVideo,
  downloadAudio,
};
