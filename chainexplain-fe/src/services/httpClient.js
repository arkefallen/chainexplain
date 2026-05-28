import axios from 'axios';
import { ApiError } from '../errors/ApiError';
import { devLogger } from '../utils/devLogger';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const httpClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
});

// Request Interceptor
httpClient.interceptors.request.use(
  (config) => {
    // Record start time to measure duration
    config.metadata = { startTime: Date.now() };

    // Auto-detect FormData to set correct headers
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
      devLogger.info(`→ HTTP ${config.method?.toUpperCase()} ${config.url} [FormData]`, {
        bodySize: 'FormData payload'
      });
    } else {
      config.headers['Content-Type'] = 'application/json';
      devLogger.info(`→ HTTP ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    }

    return config;
  },
  (error) => {
    devLogger.info(`→ HTTP REQUEST ERROR`, error);
    return Promise.reject(ApiError.fromAxiosError(error));
  }
);

// Response Interceptor
httpClient.interceptors.response.use(
  (response) => {
    const duration = Date.now() - (response.config.metadata?.startTime || Date.now());
    devLogger.info(`← HTTP ${response.status} [${duration}ms] ${response.config.url}`, response.data);
    
    // Unwrap the response data envelope
    return response.data;
  },
  async (error) => {
    const config = error.config;
    const duration = config?.metadata ? Date.now() - config.metadata.startTime : 0;
    devLogger.info(`← HTTP ERROR [${duration}ms] ${config?.url || 'unknown'}`, error.message);

    if (!config) {
      return Promise.reject(ApiError.fromAxiosError(error));
    }

    // Custom Retry Logic on Network Error (1x retry with 2s delay)
    config.__retryCount = config.__retryCount || 0;
    
    const isNetworkError = !error.response && error.code !== 'ECONNABORTED';
    
    if (isNetworkError && config.__retryCount < 1) {
      config.__retryCount += 1;
      const delay = 2000;
      devLogger.info(`⚠️ Network error encountered. Retrying ${config.url} in ${delay}ms... (Attempt ${config.__retryCount})`);
      
      await new Promise((resolve) => setTimeout(resolve, delay));
      
      // Reset start time for accurate duration tracking of the retry
      config.metadata = { startTime: Date.now() };
      
      // Re-execute request with same instance config
      return httpClient(config);
    }

    // Return normalized custom ApiError instead of Axios error
    return Promise.reject(ApiError.fromAxiosError(error));
  }
);

export default httpClient;
