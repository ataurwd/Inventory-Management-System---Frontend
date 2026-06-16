import useSWR from 'swr';
import api from '@/services/api';
import { SupplierItem } from '@/services/suppliers.service';

export function useSuppliers() {
  const fetcher = async (url: string) => {
    const { data } = await api.get<{ success: boolean; data: SupplierItem[] }>(url);
    return data.data;
  };

  const { data, error, isLoading, mutate } = useSWR('/suppliers', fetcher);

  return {
    suppliers: data || [],
    error,
    isLoading,
    mutate,
  };
}
