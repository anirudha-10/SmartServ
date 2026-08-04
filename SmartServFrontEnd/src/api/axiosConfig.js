import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000/api', // Backend runs on PORT 8081
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor (Left blank or minimal if needed later)
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, config } = error.response;
      
      if (status === 401 || status === 403) {
        console.error('Unauthorized/Forbidden access');
        window.dispatchEvent(new Event('auth:unauthorized'));
      } else if (status >= 500 && config.method !== 'get') {
        // Only toast server errors for mutation requests (POST/PUT/DELETE), not background GET fetches
        toast.error('Server error. Please try again later.');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
