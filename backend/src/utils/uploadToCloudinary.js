const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    // Without this, a stream-level error (e.g. connection drop mid-upload)
    // never hits the callback above — it throws unhandled and can crash the process.
    stream.on('error', (err) => reject(err));
    stream.end(buffer);
  });
};

// Extracts the Cloudinary public_id from a stored secure_url so we can delete
// the old avatar when a user replaces it. Cloudinary URLs look like:
// https://res.cloudinary.com/<cloud>/image/upload/v169.../folder/name.jpg
const extractPublicId = (url) => {
  if (!url) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
  return match ? match[1] : null;
};

const deleteFromCloudinary = async (url) => {
  const publicId = extractPublicId(url);
  if (!publicId) return; // nothing to delete, or URL format unexpected — fail silent, not fatal
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch {
    // Deletion failing shouldn't block a profile update — it's just an orphaned asset
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };