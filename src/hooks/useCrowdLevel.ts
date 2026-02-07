import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getCrowdLevelFromCount } from '@/lib/utils';
import type { CrowdLevel } from '@/types/database';

interface CrowdState {
  count: number;
  level: CrowdLevel;
  isLoading: boolean;
}

export function useCrowdLevel(venueId: string | undefined): CrowdState {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    if (!venueId) return;

    const { data } = await supabase
      .from('venue_crowd_levels')
      .select('active_checkins')
      .eq('venue_id', venueId)
      .single();

    setCount(data?.active_checkins ?? 0);
    setIsLoading(false);
  }, [venueId]);

  useEffect(() => {
    fetchCount();

    if (!venueId) return;

    // Subscribe to realtime checkin changes
    const channel = supabase
      .channel(`crowd-${venueId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'checkins',
          filter: `venue_id=eq.${venueId}`,
        },
        (payload) => {
          if (payload.new && payload.new.is_active) {
            setCount(prev => prev + 1);
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'checkins',
          filter: `venue_id=eq.${venueId}`,
        },
        (payload) => {
          // Checkin expired (is_active went from true to false)
          if (payload.old?.is_active && !payload.new?.is_active) {
            setCount(prev => Math.max(0, prev - 1));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [venueId, fetchCount]);

  return {
    count,
    level: getCrowdLevelFromCount(count),
    isLoading,
  };
}
