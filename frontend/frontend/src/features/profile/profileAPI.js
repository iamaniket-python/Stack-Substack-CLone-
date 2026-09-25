import axiosInstance from '../../api/axiosInstance';

export const getMyPostsAPI = () => axiosInstance.get('/profile/posts');
export const getMyRepliesAPI = () => axiosInstance.get('/profile/replies');
export const getMyLikesAPI = () => axiosInstance.get('/profile/likes');
export const getMySubscriptionsAPI = () => axiosInstance.get('/profile/subscriptions');
export const getMyActivityAPI = () => axiosInstance.get('/profile/activity');