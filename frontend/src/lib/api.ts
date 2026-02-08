import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // 5 second timeout for faster feedback
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  // Increase timeout only for LLM calls (chat and H2H)
  if (config.url?.includes('/chat') && !config.url?.includes('/chat/search')) {
    config.timeout = 45000; // 45 seconds for chat requests (reduced from 60)
  }
  // Increase timeout for H2H formatting (LLM calls can take longer)
  if (config.url?.includes('/h2h')) {
    config.timeout = 20000; // 20 seconds for H2H formatting (reduced from 30)
  }
  // Keep admin requests fast - they should be optimized
  if (config.url?.includes('/admin')) {
    config.timeout = 10000; // 10 seconds for admin requests (reduced from 30)
  }
  // Increase timeout for progress requests (database queries can be slow)
  if (config.url?.includes('/progress')) {
    config.timeout = 15000; // 15 seconds for progress requests
  }
  return config;
});

// Handle token expiration and network errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on login endpoint - let the login page handle it
    const isLoginEndpoint = error.config?.url?.includes('/auth/login');
    
    if (error.response?.status === 401 && !isLoginEndpoint) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
