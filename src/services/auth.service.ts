import api from './api';
import { User } from '@/types/user.types';

export const authService = {
  login: async (credentials: Record<string, string>) => {
    const { data } = await api.post<{ success: boolean; data: { user: User; token: string } }>('/auth/login', credentials);
    if (data.data.token && typeof window !== 'undefined') {
      localStorage.setItem('auth_token', data.data.token);
    }
    return data.data.user;
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
    }
  },
  getMe: async () => {
    const { data } = await api.get<{ success: boolean; data: { user: User } }>('/auth/me');
    return data.data.user;
  },
};
