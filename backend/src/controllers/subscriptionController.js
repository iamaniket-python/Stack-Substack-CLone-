const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { notify } = require('../services/notificationService');
const { findUserById } = require('../models/userModel');
const {
  findSubscription,
  createOrReactivateSubscription,
  
  cancelSubscription,
  listSubscriptionsForUser,
  listSubscribersForAuthor,
  countActiveSubscribers,
} = require('../models/subscriptionModel');

// Free-tier subscribe. Paid-tier will redirect through Razorpay in the next step.
const subscribe = asyncHandler(async (req, res) => {
  const { authorId } = req.body;

  if (authorId === req.userId) {
    throw new ApiError(400, "You can't subscribe to yourself");
  }

  const author = await findUserById(authorId);
  if (!author) throw new ApiError(404, 'Author not found');

  const existing = await findSubscription(req.userId, authorId);
  if (existing && existing.status === 'active') {
    throw new ApiError(409, 'Already subscribed');
  }

  const subscription = await createOrReactivateSubscription({
    subscriberId: req.userId,
    authorId,
    tier: 'free',
  });

  await notify({
    recipientId: authorId,
    actorId: req.userId,
    type: 'new_subscriber',
    entityId: subscription.id,
    message: 'subscribed to you',
  });

  res.status(201).json({ success: true, data: { subscription } });
});

const unsubscribe = asyncHandler(async (req, res) => {
  const { authorId } = req.params;

  const subscription = await cancelSubscription(req.userId, authorId);
  if (!subscription) throw new ApiError(404, 'Subscription not found');

  res.json({ success: true, data: { subscription } });
});

const mySubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await listSubscriptionsForUser(req.userId);
  res.json({ success: true, data: { subscriptions } });
});

// For the author's dashboard
const myPublicationSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await listSubscribersForAuthor(req.userId);
  const count = await countActiveSubscribers(req.userId);
  res.json({ success: true, data: { subscribers, count } });
});

const subscriptionStatus = asyncHandler(async (req, res) => {
  const { authorId } = req.params;
  const subscription = await findSubscription(req.userId, authorId);
  res.json({
    success: true,
    data: { subscribed: !!(subscription && subscription.status === 'active'), subscription: subscription || null },
  });
});

module.exports = {
  subscribe,
  unsubscribe,
  mySubscriptions,
  myPublicationSubscribers,
  subscriptionStatus,
};