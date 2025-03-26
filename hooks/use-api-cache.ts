
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';

const fetcher = async (url: string) => {
  const response = await supabase.from(url).select('*');
  return response.data;
};

export function useApiCache<T>(key: string, options = {}) {
  const { data, error, mutate } = useSWR<T>(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
    ...options
  });

  return {
    data,
    error,
    isLoading: !error && !data,
    mutate
  };
}
