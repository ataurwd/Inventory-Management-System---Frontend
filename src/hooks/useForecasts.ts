import useSWR from 'swr';
import { forecastsService } from '../services/forecasts.service';

export function useForecasts() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/v1/forecasts',
    forecastsService.getAll,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    forecasts: data || [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
