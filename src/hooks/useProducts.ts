import useSWR from 'swr';
import api from '@/services/api';
import { Product } from '@/types/product.types';

export function useProducts(filters?: { search?: string; category?: string; status?: string }) {
  const fetcher = async (url: string) => {
    const { data } = await api.get<{ success: boolean; data: Product[] }>(url, { params: filters });
    return data.data;
  };

  // SWR key array will trigger automatic fetch when filter values change
  const { data, error, isLoading, mutate } = useSWR(
    ['/products', filters?.search, filters?.category, filters?.status],
    () => fetcher('/products')
  );

  return {
    products: data || [],
    error,
    isLoading,
    mutate,
  };
}
