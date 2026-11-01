import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentApiBaseUrl } from '../../config/environment';

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
    config.baseURL = getCurrentApiBaseUrl();
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
        config.headers.Authorization = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNb2JpbGVOdW1iZXIiOiI5OTk1Mzg3NzQ5IiwiQ291bnRyeUNvZGUiOiJJTiIsIkxvY2FsZSI6IlVUQyIsIlBhc3NlbmdlcklkIjoiNzNlMmQ1ZDItMjFlMC00YTRkLWI1NTktNjk4ZDAyZDE2OTdmIiwiUGFydGl0aW9uS2V5IjoiS2VyYWxhIiwibmJmIjoxNzg0MTgyNzI0LCJleHAiOjE4MTU3MTg3MjQsImlhdCI6MTc4NDE4MjcyNCwiaXNzIjoiUGlrbWVJc3N1ZXIiLCJhdWQiOiJQaWttZUF1ZGllbmNlIn0.Vle3x-R1I0T4kAlW3Y9QUOJ83FwSFA3zj6oHLiCpG-o`;
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
