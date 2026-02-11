import axios from 'axios';
import AuthService from '../services/auth';

const instance = axios.create({
  baseURL: 'http://localhost:8000/api/', // Your Django API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
instance.interceptors.request.use(
  (config) => {
    const token = AuthService.getToken();
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried refreshing yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(
            'http://localhost:8000/api/token/refresh/',
            { refresh: refreshToken }
          );
          
          localStorage.setItem('access_token', response.data.access);
          originalRequest.headers['Authorization'] = 'Bearer ' + response.data.access;
          
          return instance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed, logout user
        AuthService.logout();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default instance;