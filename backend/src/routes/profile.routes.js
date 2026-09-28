const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const { optionalAuth } = require("../middlewares/authMiddleware");
const {
  getProfilePosts,
  getProfileReplies,
  getProfileLikes,
  getProfileSubscriptions,
  getProfileActivity,
} = require("../controllers/profile.controller");

// Apna profile (req.userId use hoga) — login zaroori
router.get("/posts", protect, getProfilePosts);
router.get("/replies", protect, getProfileReplies);
router.get("/likes", protect, getProfileLikes);
router.get("/subscriptions", protect, getProfileSubscriptions);
router.get("/activity", protect, getProfileActivity);

// Kisi aur user ka profile — PUBLIC (login ho to viewer info use hoti hai)
router.get("/:id/posts", optionalAuth, getProfilePosts);
router.get("/:id/replies", optionalAuth, getProfileReplies);
router.get("/:id/activity", optionalAuth, getProfileActivity);

// Sirf logged-in users ke liye
router.get("/:id/likes", protect, getProfileLikes);
router.get("/:id/subscriptions", protect, getProfileSubscriptions);

module.exports = router;