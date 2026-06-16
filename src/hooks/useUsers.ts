import useSWR from 'swr';
import api from '@/services/api';
import { User } from '@/types/user.types';

export function useUsers() {
  const fetcher = async (url: string) => {
    const { data } = await api.get<{ success: boolean; data: User[] }>(url);
    return data.data;
  };

  const { data, error, isLoading, mutate } = useSWR('/users', fetcher);

  return {
    users: data || [],
    error,
    isLoading,
    mutate,
  };
}
