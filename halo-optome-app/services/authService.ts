// services/authService.ts
import api from '../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'PATIENT' | 'OPTOMETRIST' | 'pasien' | 'optometris';
    avatar_url?: string;
  };
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: 'PATIENT' | 'OPTOMETRIST' | 'pasien' | 'optometris';
  str_number?: string;
}

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      // Simpan token ke AsyncStorage
      await AsyncStorage.setItem('authToken', token);

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    try {
      // Konversi role dari PATIENT/OPTOMETRIST ke pasien/optometris sesuai backend
      const backendRole = data.role === 'PATIENT' ? 'pasien' : 'optometris';

      const requestData = {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: backendRole,
        str_number: data.str_number
      };

      const response = await api.post('/auth/register', requestData);
      const { token, user } = response.data;

      // Simpan token ke AsyncStorage
      await AsyncStorage.setItem('authToken', token);

      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Hapus token dari AsyncStorage
      await AsyncStorage.removeItem('authToken');

      // Opsional: Panggil endpoint logout di backend
      // await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<LoginResponse['user'] | null> {
    try {
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        return null;
      }

      const response = await api.get('/auth/verify');
      return response.data.user;
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error('Get current user error:', error);
      }
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('authToken');
    return !!token;
  }
}

export const authService = new AuthService();
export default authService;
