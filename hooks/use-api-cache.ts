import useSWR from "swr";
import { supabase } from "@/lib/supabase";

const fetcher = async <T>(key: string): Promise<T[]> => {
  const { data, error } = await supabase
    .from(key)
    .select("*, profile:profiles(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as T[];
};

export function useApiCache<T>(key: string, options = {}) {
  const { data, error, mutate } = useSWR<T[]>(key, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 30000, // Refresh every 30 seconds
    ...options,
  });

  return {
    data,
    error,
    isLoading: !error && !data,
    mutate,
  };
}
