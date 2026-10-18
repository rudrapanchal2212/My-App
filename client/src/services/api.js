import axios from 'axios';
import { Capacitor } from '@capacitor/core';

// Default Mobile IP pointing to computer on Wi-Fi
export const DEFAULT_MOBILE_HOST = '192.168.31.42';
export const DEFAULT_API_URL = `http://${DEFAULT_MOBILE_HOST}:5000/api`;

export const getApiBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  const custom = localStorage.getItem('quickbite_api_url');
  if (custom) return custom;
  if (Capacitor.isNativePlatform()) return DEFAULT_API_URL;
  return '/api';
};

const api = axios.create({
  baseURL: getApiBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach dynamic baseURL and JWT token
api.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseURL();
    const token = localStorage.getItem('quickbite_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, clear token
      const isAuthEndpoint = error.config.url?.includes('/auth/login') || error.config.url?.includes('/auth/register');
      if (!isAuthEndpoint) {
        localStorage.removeItem('quickbite_token');
        localStorage.removeItem('quickbite_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
