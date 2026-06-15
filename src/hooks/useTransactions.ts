import useSWR from 'swr';
import { transactionsService } from '@/services/transactions.service';

export function useTransactions(filters: {
  page?: number;
  limit?: number;
  type?: string;
  from?: string;
  to?: string;
  search?: string;
}) {
  const { data, error, isLoading, mutate } = useSWR(
    ['/transactions', filters],
    () => transactionsService.getAll(filters)
  );

  return {
    transactions: data?.data || [],
    meta: data?.meta,
    error,
    isLoading,
    mutate,
  };
}
