import axiosInstance from '../../api/axiosInstance';

export const registerAPI = (payload) => axiosInstance.post('/auth/register', payload);
export const loginAPI = (payload) => axiosInstance.post('/auth/login', payload);
export const logoutAPI = () => axiosInstance.post('/auth/logout');
export const getMeAPI = () => axiosInstance.get('/auth/me');