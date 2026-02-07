import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow, format } from 'date-fns';
import type { Checkin } from '@/types/database';
import { supabase } from '@/lib/supabase';

interface CheckinWithVenue extends Checkin {
  venues?: { name: string; slug: string } | null;
}

export function HistoryPage() {
  const { user } = useAuth();
  const [checkins, setCheckins] = useState<CheckinWithVenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    supabase
      .from('checkins')
      .select('*, venues(name, slug)')
      .eq('user_id', user.id)
      .order('checked_in_at', { ascending: false })
      .then(({ data }) => {
        setCheckins((data as CheckinWithVenue[]) || []);
        setIsLoading(false);
      });
  }, [user]);

  if (isLoading) return <Spinner size="lg" className="py-24" />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Check-in History</h1>

      {checkins.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-2">📍</p>
          <p>No check-ins yet. Scan a QR code to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {checkins.map(c => (
            <Card key={c.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                  <span>📍</span>
                </div>
                <div>
                  <p className="font-medium text-white">
                    {c.venues?.name || 'Unknown Venue'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(c.checked_in_at), 'MMM d, yyyy · h:mm a')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  c.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-500'
                }`}>
                  {c.is_active ? 'Active' : 'Expired'}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(c.checked_in_at), { addSuffix: true })}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
