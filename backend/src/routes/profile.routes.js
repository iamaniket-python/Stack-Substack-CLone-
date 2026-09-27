const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const {
  getProfilePosts,
  getProfileReplies,
  getProfileLikes,
  getProfileSubscriptions,
  getProfileActivity,
} = require("../controllers/profile.controller");

router.use(protect); // dekhne ke liye bhi login zaroori hai, sirf apna data likhne/badalne ka access nahi milta

// Apna profile (req.userId use hoga)
router.get("/posts", getProfilePosts);
router.get("/replies", getProfileReplies);
router.get("/likes", getProfileLikes);
router.get("/subscriptions", getProfileSubscriptions);
router.get("/activity", getProfileActivity);

// Kisi aur user ka profile (req.params.id use hoga)
router.get("/:id/posts", getProfilePosts);
router.get("/:id/replies", getProfileReplies);
router.get("/:id/likes", getProfileLikes);
router.get("/:id/subscriptions", getProfileSubscriptions);
router.get("/:id/activity", getProfileActivity);

module.exports = router;