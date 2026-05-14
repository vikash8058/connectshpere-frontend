import axios from 'axios';

// Updated: 2026-05-10
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  //baseURL: '/api/v1',     -> for local 
  baseURL: `${BASE_URL}/api/v1`,
  withCredentials: true,
  headers: { 
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  // Add ngrok header to ALL requests including file uploads
  config.headers['ngrok-skip-browser-warning'] = 'true';
  
  return config;
});
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginRequest = err.config?.url?.includes('/auth/login');
    const isLoginPage = window.location.pathname === '/login';

    if (err.response?.status === 401 && !isLoginRequest && !isLoginPage) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;