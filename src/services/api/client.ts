import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentApiBaseUrl, getApiBaseUrlForPath } from '../../config/environment';

// Create a configured Axios instance
const apiClient = axios.create({
  baseURL: getCurrentApiBaseUrl(),
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  async (config) => {
    config.baseURL = getApiBaseUrlForPath(config.url || '');
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url || ''}`, {
      baseURL: config.baseURL,
      headers: config.headers,
      params: config.params,
      data: config.data,
    });
    // Inject auth token
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // error reading token
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url || ''}`, {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error(`[API Error] ${error.config?.method?.toUpperCase() || ''} ${error.config?.url || ''}`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    // Global error handler
    if (error.response) {
      // The request was made and the server responded with a status code outside the 2xx range
      if (error.response.status === 401) {
         // e.g. Trigger logout logic
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error: No response received');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
