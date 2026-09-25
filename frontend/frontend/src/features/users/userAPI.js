import axiosInstance from '../../api/axiosInstance';

export const updateProfileAPI = (formData) =>
  axiosInstance.patch('/users/me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });