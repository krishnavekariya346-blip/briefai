import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: unknown) => {
    const message =
      axios.isAxiosError(err) && err.response?.data?.error
        ? String(err.response.data.error)
        : err instanceof Error
          ? err.message
          : 'Request failed';
    return Promise.reject(new Error(message));
  }
);
