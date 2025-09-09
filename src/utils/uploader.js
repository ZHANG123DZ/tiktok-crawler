const { default: axios } = require('axios');
const cloudinary = require('../configs/cloudinary');
const fs = require('fs');

async function uploadVideo(filePath) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      folder: 'tiktok-video',
    });

    console.log('✅ Uploaded to Cloudinary:', result.secure_url);
    return result.secure_url;
  } catch (err) {
    console.error('❌ Upload failed:', err);
    return null;
  }
}

async function uploadImageFromUrl(imageUrl) {
  try {
    const response = await axios({
      method: 'get',
      url: imageUrl,
      responseType: 'stream',
    });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'tiktok-image',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      response.data.pipe(stream);
    });

    console.log('✅ Uploaded to Cloudinary:', result.secure_url);
    return result.secure_url;
  } catch (err) {
    console.error('❌ Upload image failed:', err.message);
    return null;
  }
}
module.exports = {
  uploadVideo,
  uploadImageFromUrl,
};
