import axiosInstance from '../../api/axiosInstance';

export const forgotPasswordAPI = (email) =>
  axiosInstance.post('/auth/forgot-password', { email });

export const resetPasswordAPI = ({ token, password }) =>
  axiosInstance.post('/auth/reset-password', { token, password });