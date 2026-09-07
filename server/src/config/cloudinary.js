import { v2 as cloudinary } from 'cloudinary';

// Credentials come from the environment (names already declared in
// server/.env.example). Never hardcode them; never log them.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Streams an in-memory image buffer straight to Cloudinary.
 * Nothing is written to local disk — free-tier deploys have ephemeral
 * filesystems, so a saved file would vanish on the next restart (handbook D6).
 *
 * @param {Buffer} buffer - the raw file bytes from multer's memoryStorage
 * @returns {Promise<string>} the uploaded image's HTTPS URL
 */
export const uploadImageBuffer = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'neo-recipe', resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result.secure_url);
      },
    );

    stream.end(buffer);
  });

export default cloudinary;
