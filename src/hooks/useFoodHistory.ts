import { useState, useEffect } from 'react';
import { getUserFoodHistory, getFoodStats } from '@/lib/supabase';
import type { FoodSelection } from '@/types';

interface FoodStats {
  totalSelections: number;
  categoryCounts: Record<string, number>;
  foodCounts: Record<string, number>;
  recentSelections: any[];
}

interface UseFoodHistoryReturn {
  history: FoodSelection[];
  stats: FoodStats | null;
  isLoading: boolean;
  error: string | null;
  refreshHistory: () => Promise<void>;
}

export function useFoodHistory(userId: string | null): UseFoodHistoryReturn {
  const [history, setHistory] = useState<FoodSelection[]>([]);
  const [stats, setStats] = useState<FoodStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!userId) {
      setHistory([]);
      setStats(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [historyData, statsData] = await Promise.all([
        getUserFoodHistory(userId),
        getFoodStats(userId)
      ]);

      setHistory(historyData);
      setStats(statsData);
    } catch (error: any) {
      setError(error.message);
      console.error('음식 기록 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshHistory = async () => {
    await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  return {
    history,
    stats,
    isLoading,
    error,
    refreshHistory
  };
}