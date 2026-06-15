import api from './api';
import { User } from '@/types/user.types';

export const authService = {
  login: async (credentials: Record<string, string>) => {
    const { data } = await api.post<{ success: boolean; data: { user: User } }>('/auth/login', credentials);
    return data.data.user;
  },
  logout: async () => {
    await api.post('/auth/logout');
  },
  getMe: async () => {
    const { data } = await api.get<{ success: boolean; data: { user: User } }>('/auth/me');
    return data.data.user;
  },
};
