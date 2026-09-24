import { io } from 'socket.io-client';
import { getAccessToken } from '../api/axiosInstance';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const connectSocket = () => {
  const token = getAccessToken();
  if (!token) return null;

  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    withCredentials: true,
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};