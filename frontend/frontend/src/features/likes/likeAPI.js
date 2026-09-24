import axiosInstance from '../../api/axiosInstance';

export const getLikeStatusAPI = (postId) => axiosInstance.get(`/likes/post/${postId}`);
export const toggleLikeAPI = (postId) => axiosInstance.post(`/likes/post/${postId}`);