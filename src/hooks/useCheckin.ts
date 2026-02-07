import { useState, useCallback } from 'react';
import { performCheckin } from '@/services/checkins';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface CheckinState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  message: string | null;
  checkin: () => Promise<void>;
  reset: () => void;
}

export function useCheckin(venueId: string | undefined): CheckinState {
  const { user, signInAnonymously } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const checkin = useCallback(async () => {
    if (!venueId) return;

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Auto sign in anonymously if not authenticated
      if (!user) {
        await signInAnonymously();
        // Wait for session to be available
        let retries = 0;
        while (retries < 10) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) break;
          await new Promise(r => setTimeout(r, 100));
          retries++;
        }
      }

      const result = await performCheckin(venueId);

      if (result.success) {
        setIsSuccess(true);
        setMessage(`Checked in to ${result.venue_name}!`);
      } else {
        setError(result.message || result.error || 'Check-in failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [venueId, user, signInAnonymously]);

  const reset = useCallback(() => {
    setIsSuccess(false);
    setError(null);
    setMessage(null);
  }, []);

  return { isLoading, isSuccess, error, message, checkin, reset };
}
