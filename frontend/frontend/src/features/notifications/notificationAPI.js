import axiosInstance from '../../api/axiosInstance';

export const getNotificationsAPI = (page = 1) => axiosInstance.get(`/notifications?page=${page}`);
export const markNotificationReadAPI = (id) => axiosInstance.patch(`/notifications/${id}/read`);
export const markAllNotificationsReadAPI = () => axiosInstance.patch('/notifications/read-all');