import axiosInstance from '../../api/axiosInstance';

export const getStoryFeedAPI = () => axiosInstance.get('/stories/feed');
export const createStoryAPI = (formData) =>
  axiosInstance.post('/stories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const viewStoryAPI = (id) => axiosInstance.get(`/stories/${id}`);
export const deleteStoryAPI = (id) => axiosInstance.delete(`/stories/${id}`);