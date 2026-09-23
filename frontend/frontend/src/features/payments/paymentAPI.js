import axiosInstance from '../../api/axiosInstance';

export const createOrderAPI = (authorId) => axiosInstance.post('/payments/create-order', { authorId });
export const verifyPaymentAPI = (payload) => axiosInstance.post('/payments/verify', payload);