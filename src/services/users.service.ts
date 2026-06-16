import api from './api';
import { User } from '@/types/user.types';

export interface CreateUserDto {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'manager' | 'cashier';
}

export const usersService = {
  getAll: async (): Promise<User[]> => {
    const { data } = await api.get<{ success: boolean; data: User[] }>('/users');
    return data.data;
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await api.get<{ success: boolean; data: User }>(`/users/${id}`);
    return data.data;
  },

  create: async (payload: CreateUserDto): Promise<User> => {
    const { data } = await api.post<{ success: boolean; data: User }>('/users', payload);
    return data.data;
  },

  update: async (id: string, payload: Partial<CreateUserDto>): Promise<User> => {
    const { data } = await api.put<{ success: boolean; data: User }>(`/users/${id}`, payload);
    return data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
