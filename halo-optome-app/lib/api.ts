// lib/api.ts
import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, TIMEOUTS } from '../constants/config';

// Buat instance axios dengan konfigurasi dasar
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUTS.API_REQUEST,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor untuk request
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Ambil token dari AsyncStorage
    const token = await AsyncStorage.getItem('authToken');
    
    // Jika token ada, tambahkan ke header Authorization
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk response
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    // Jika error 401 (Unauthorized), hapus token dan redirect ke login
    if (error.response && error.response.status === 401) {
      await AsyncStorage.removeItem('authToken');
      // Redirect ke login akan ditangani oleh AuthContext
    }
    
    return Promise.reject(error);
  }
);

export default api;