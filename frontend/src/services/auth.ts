import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { AuthResponse, User } from '../types';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    console.log('Request interceptor - Token:', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request interceptor - Authorization header set:', config.headers.Authorization);
    } else {
      console.log('Request interceptor - No token found in localStorage');
    }
    console.log('Request interceptor - Full config:', {
      url: config.url,
      method: config.method,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.log('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    console.log('Response interceptor - Error received:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers
    });

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('Response interceptor - Attempting token refresh...');
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        console.log('Response interceptor - Refresh token:', refreshToken);
        
        if (refreshToken) {
          const response = await axios.post('http://localhost:3001/v1/auth/token/refresh', {
            refreshToken,
          });

          const { accessToken } = response.data;
          console.log('Response interceptor - New access token received:', accessToken);
          localStorage.setItem('accessToken', accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.log('Response interceptor - Refresh failed:', refreshError);
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    console.log('Login attempt with email:', email);
    const response = await apiClient.post('/v1/auth/login', { email, password });
    console.log('Login response:', response.data);
    console.log('Access token received:', response.data.accessToken);
    return response.data;
  },

  register: async (data: {
    email: string;
    password: string;
    name: string;
    roleId?: string;
    bio?: string;
  }): Promise<AuthResponse> => {
    // Map frontend data to backend expected format
    const requestData = {
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.roleId || 'learner', // Backend expects 'role', not 'roleId'
      bio: data.bio,
    };
    console.log('Register request data:', requestData);
    const response = await apiClient.post('/v1/auth/register', requestData);
    return response.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await apiClient.post('/v1/auth/logout', { refreshToken });
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await apiClient.post('/v1/auth/token/refresh', { refreshToken });
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    // Debug: Check if token exists in localStorage
    const token = localStorage.getItem('accessToken');
    console.log('Token from localStorage:', token);
    
    // Debug: Check the full request config
    const response = await apiClient.get('/v1/auth/me');
    console.log("response", response);
    return response.data;
  },
};

export default apiClient;
