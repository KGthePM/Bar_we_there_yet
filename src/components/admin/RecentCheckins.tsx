import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { getVenueCheckins } from '@/services/checkins';
import { formatDistanceToNow } from 'date-fns';
import type { Checkin } from '@/types/database';
import { supabase } from '@/lib/supabase';

interface RecentCheckinsProps {
  venueId: string;
}

export function RecentCheckins({ venueId }: RecentCheckinsProps) {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getVenueCheckins(venueId)
      .then(setCheckins)
      .finally(() => setIsLoading(false));

    // Subscribe to new checkins
    const channel = supabase
      .channel(`recent-${venueId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'checkins',
          filter: `venue_id=eq.${venueId}`,
        },
        (payload) => {
          setCheckins(prev => [payload.new as Checkin, ...prev.slice(0, 9)]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [venueId]);

  return (
    <Card className="space-y-4">
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
        Recent Check-ins
      </h3>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-800 rounded animate-pulse" />
          ))}
        </div>
      ) : checkins.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">No check-ins yet</p>
      ) : (
        <div className="space-y-2">
          {checkins.map(checkin => (
            <div
              key={checkin.id}
              className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center text-xs">
                  📍
                </div>
                <span className="text-sm text-gray-300">
                  {checkin.user_id ? 'User' : 'Anonymous'} checked in
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(checkin.checked_in_at), { addSuffix: true })}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
