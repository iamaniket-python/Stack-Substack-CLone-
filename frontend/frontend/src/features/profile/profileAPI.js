import axiosInstance from '../../api/axiosInstance';

export const getProfilePostsAPI = (id) =>
  axiosInstance.get(id ? `/profile/${id}/posts` : '/profile/posts');

export const getProfileRepliesAPI = (id) =>
  axiosInstance.get(id ? `/profile/${id}/replies` : '/profile/replies');

export const getProfileLikesAPI = (id) =>
  axiosInstance.get(id ? `/profile/${id}/likes` : '/profile/likes');

export const getProfileSubscriptionsAPI = (id) =>
  axiosInstance.get(id ? `/profile/${id}/subscriptions` : '/profile/subscriptions');

export const getProfileActivityAPI = (id) =>
  axiosInstance.get(id ? `/profile/${id}/activity` : '/profile/activity');