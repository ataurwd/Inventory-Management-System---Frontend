import useSWR from 'swr';
import { dashboardService } from '../services/dashboard.service';

export function useExpiryAlerts() {
  const { data, error, isLoading, mutate } = useSWR('/dashboard/waste-risk', dashboardService.getWasteRisk);

  return {
    alerts: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
