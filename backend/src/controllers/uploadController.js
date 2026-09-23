const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const { updateUserAvatar } = require('../models/userModel');

const uploadCoverImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');

  const result = await uploadToCloudinary(req.file.buffer, 'substack-clone/covers');

  res.json({
    success: true,
    data: { url: result.secure_url, publicId: result.public_id },
  });
});

const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');

  const result = await uploadToCloudinary(req.file.buffer, 'substack-clone/avatars');
  const user = await updateUserAvatar(req.userId, result.secure_url);

  res.json({ success: true, data: { user, url: result.secure_url } });
});

module.exports = { uploadCoverImage, uploadAvatar };