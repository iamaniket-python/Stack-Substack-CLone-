const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware"); // FIXED — correct path, default export
const {
  getMyPosts,
  getMyReplies,
  getMyLikes,
  getMySubscriptions,
  getMyActivity,
} = require("../controllers/profile.controller");

router.use(protect);

router.get("/posts", getMyPosts);
router.get("/replies", getMyReplies);
router.get("/likes", getMyLikes);
router.get("/subscriptions", getMySubscriptions);
router.get("/activity", getMyActivity);

module.exports = router;