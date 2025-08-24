import axios from 'axios';
import config from './config.js';

const api = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  withCredentials: true
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL
    });
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    
    // Handle different HTTP status codes
    const status = error.response.status;
    let message = error?.response?.data?.message || error.message || 'Request failed';
    
    switch (status) {
      case 401:
        message = error?.response?.data?.message || 'Authentication failed. Please login again.';
        // Clear authentication state
        localStorage.removeItem('isAuthenticated');
        console.error('🔐 Authentication error:', error.response.data);
        break;
      case 403:
        message = error?.response?.data?.message || 'Access denied. You don\'t have permission to perform this action.';
        break;
      case 404:
        message = error?.response?.data?.message || 'Resource not found.';
        break;
      case 500:
        message = error?.response?.data?.message || 'Server error. Please try again later.';
        console.error('🚨 Server error:', error.response.data);
        break;
      default:
        if (status >= 500) {
          message = error?.response?.data?.message || 'Server error. Please try again later.';
        } else if (status >= 400) {
          message = error?.response?.data?.message || 'Request failed. Please check your input.';
        }
    }
    
    // Log detailed error for debugging
    console.error('❌ API Error:', {
      status,
      message,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    
    return Promise.reject(new Error(message));
  }
);

export default api;


