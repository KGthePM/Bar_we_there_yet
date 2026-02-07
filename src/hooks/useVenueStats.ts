import { useEffect, useState } from 'react';
import { getVenueStats, getTodayStats, getHourlyBreakdown } from '@/services/stats';
import type { VenueStatsDaily } from '@/types/database';

export function useVenueStats(venueId: string | undefined, days: number = 30) {
  const [stats, setStats] = useState<VenueStatsDaily[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!venueId) return;

    getVenueStats(venueId, days)
      .then(setStats)
      .finally(() => setIsLoading(false));
  }, [venueId, days]);

  return { stats, isLoading };
}

export function useTodayStats(venueId: string | undefined) {
  const [stats, setStats] = useState({ total_checkins: 0, unique_visitors: 0, repeat_visitors: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!venueId) return;

    getTodayStats(venueId)
      .then(setStats)
      .finally(() => setIsLoading(false));
  }, [venueId]);

  return { ...stats, isLoading };
}

export function useHourlyBreakdown(venueId: string | undefined, days: number = 7) {
  const [heatmap, setHeatmap] = useState<Record<string, Record<string, number>>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!venueId) return;

    getHourlyBreakdown(venueId, days)
      .then(setHeatmap)
      .finally(() => setIsLoading(false));
  }, [venueId, days]);

  return { heatmap, isLoading };
}
