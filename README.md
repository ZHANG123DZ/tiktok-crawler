Cách chạy: npm run dev
ở đây em tạo ra 2 bảng ngoài luồng ko ảnh hướng đến chương trình chính là tiktok_videos và tiktok_musics, các bảng tags, topics em lấy hoàn toàn từ dữ liệu thật của tiktok
Lưu ý: máy phải cài yt-dlp: là một công cụ dòng lệnh (command-line tool), fork từ youtube-dl, dùng để tải video, audio, phụ đề từ YouTube và hàng ngàn website khác (TikTok, Facebook, Twitter, v.v).
Và em đang để nó ở ổ D,
Neues chạy llanaf đầu
- Tải yt-dlp để ở ổ D
- cài đặt enviroment variables, thêm path cho yt-dlp ở ổ D, lưu lại và test xem cài thành công chưa bằng cách mở cmd vào ổ D gõ yt-dlp --version
- Daaud tiên phải chạy npm run db:migrate
- sau đó chạy npm run dev

cảnh báo: em crawl khá nhiều đâu đó taamff 1k-2k bài post có đủ video, thumbnail, music, ... 

