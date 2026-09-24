import axiosInstance from '../../api/axiosInstance';

export const getCommentsAPI = (postId) => axiosInstance.get(`/comments/post/${postId}`);
export const createCommentAPI = (payload) => axiosInstance.post('/comments', payload);
export const deleteCommentAPI = (id) => axiosInstance.delete(`/comments/${id}`);