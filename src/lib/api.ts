import axios from 'axios';

const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  if (url.endsWith('/api')) return url;
  return `${url}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect if it's a login failure (let the component handle it)
    if (error.response?.status === 401 && !error.config.url?.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
