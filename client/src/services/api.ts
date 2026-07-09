import axios, { type AxiosError } from 'axios';
import toast from 'react-hot-toast';
import type { ApiErrorResponse } from '../types';

export const TOKEN_KEY = 'careerfit_token';
export const USER_KEY = 'careerfit_user';

const baseURL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
});

// Attach the auth token to every request if present.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handling: on 401 clear auth state and redirect to /login.
// Otherwise surface error.response.data.message via toast.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (window.location.pathname !== '/login') {
        toast.error(message || 'Session expired. Please log in again.');
        window.location.href = '/login';
      }
    } else if (message) {
      toast.error(message);
    } else if (error.message) {
      toast.error(error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
