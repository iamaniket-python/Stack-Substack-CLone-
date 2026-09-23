import axiosInstance from '../../api/axiosInstance';

export const getFeedAPI = (page = 1) => axiosInstance.get(`/posts?page=${page}`);
export const getPostBySlugAPI = (slug) => axiosInstance.get(`/posts/${slug}`);
export const createPostAPI = (payload) => axiosInstance.post('/posts', payload);
export const updatePostAPI = (id, payload) => axiosInstance.patch(`/posts/${id}`, payload);
export const getMyPostsAPI = () => axiosInstance.get('/posts/mine');
export const deletePostAPI = (id) => axiosInstance.delete(`/posts/${id}`);
export const getMySubscribersAPI = () => axiosInstance.get('/subscriptions/subscribers');
export const getAuthorProfileAPI = (id) => axiosInstance.get(`/users/${id}`);
export const getAuthorPostsAPI = (id, page = 1) => axiosInstance.get(`/users/${id}/posts?page=${page}`);

export const uploadCoverImageAPI = (formData) =>
  axiosInstance.post('/upload/cover', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });