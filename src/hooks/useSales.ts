import useSWR from 'swr';
import { salesService } from '@/services/sales.service';

export function useSales(filters?: {
  page?: number;
  limit?: number;
  invoiceNumber?: string;
  customer?: string;
  paymentStatus?: string;
  saleStatus?: string;
  createdBy?: string;
  from?: string;
  to?: string;
  product?: string;
}) {
  const { data, error, isLoading, mutate } = useSWR(
    ['/sales', filters],
    () => salesService.getAll(filters)
  );

  return {
    sales: data?.sales || [],
    meta: data?.meta,
    error,
    isLoading,
    mutate,
  };
}
