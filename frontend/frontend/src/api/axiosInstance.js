import axios from 'axios';

// Env mein /api ho ya na ho, dono case sahi chalenge
const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const trimmed = RAW_URL.replace(/\/+$/, '');
const BASE_URL = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // sends the refreshToken httpOnly cookie automatically
});

// In-memory only — never localStorage, since that's readable by any injected script (XSS risk)
let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// In endpoints par 401 ka matlab "token expire" nahi hota, isliye refresh try nahi karna
const NO_REFRESH_URLS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

axiosInstance.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Network error / config missing: seedha reject
    if (!originalRequest || !error.response) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || '';
    const skipRefresh = NO_REFRESH_URLS.some((path) => requestUrl.includes(path));

    if (error.response.status === 401 && !originalRequest._retry && !skipRefresh) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue this request until the in-flight refresh resolves
        return new Promise((resolve) => {
          refreshSubscribers.push((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const { data } = await axiosInstance.post('/auth/refresh');
        const newToken = data.data.accessToken;
        setAccessToken(newToken);
        isRefreshing = false;
        onRefreshed(newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];
        setAccessToken(null);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;