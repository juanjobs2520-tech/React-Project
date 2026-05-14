import axios from 'axios';
import { LocalStorageProvider } from '../storage/LocalStorageProvider';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const AUTH_URL = import.meta.env.VITE_API_URL_SECURITY || `${API_URL}/auth`;

const storage = new LocalStorageProvider();

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = storage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      window.location.href = '/auth/signin';
    }
    return Promise.reject(error);
  }
);

export const authClient = axios.create({
  baseURL: AUTH_URL,
  headers: { 'Content-Type': 'application/json' },
});
