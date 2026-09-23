import axiosInstance from '../../api/axiosInstance';

export const getMySubscribersAPI = () => axiosInstance.get('/subscriptions/subscribers');
export const getMySubscriptionsAPI = () => axiosInstance.get('/subscriptions/mine');
export const subscribeAPI = (authorId) => axiosInstance.post('/subscriptions', { authorId });
export const unsubscribeAPI = (authorId) => axiosInstance.delete(`/subscriptions/${authorId}`);
export const getSubscriptionStatusAPI = (authorId) => axiosInstance.get(`/subscriptions/status/${authorId}`);