import axios, { AxiosError } from 'axios';

const baseURL = (import.meta.env.VITE_API_BASE as string | undefined) || '';
export const TOKEN_KEY = 'ss_token';

export const api = axios.create({
  baseURL: baseURL ? `${baseURL}/api` : '/api',
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err: AxiosError<{ error?: string }>) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('ss_user');
    }
    const message = err.response?.data?.error || err.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

export const apiBaseUrl = baseURL || window.location.origin;
