const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer from multer
 * @param {Object} options - Upload options (folder, resource_type, etc.)
 * @returns {Promise} - Cloudinary upload result
 */
const uploadToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || 'edtech-uploads',
      resource_type: options.resource_type || 'auto',
      ...options
    };

    // Use upload_stream for buffer uploads
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Write buffer to the upload stream
    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - The public_id of the file to delete
 * @returns {Promise} - Cloudinary deletion result
 */
const deleteFromCloudinary = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

/**
 * Extract public_id from a Cloudinary URL
 * @param {string} url - The Cloudinary URL
 * @returns {string} - The public_id
 */
const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes('cloudinary')) return null;

  // Extract the public_id from URL
  // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.ext
  const parts = url.split('/');
  const uploadIndex = parts.indexOf('upload');
  if (uploadIndex === -1) return null;

  // Get everything after upload/version
  const relevantParts = parts.slice(uploadIndex + 2); // Skip 'upload' and version number
  const publicId = relevantParts.join('/').replace(/\.[^/.]+$/, ''); // Remove file extension

  return publicId;
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  getPublicIdFromUrl
};
