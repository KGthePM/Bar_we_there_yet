import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Checkin } from '@/types/database';
import { getDeviceHash } from '@/lib/utils';

export async function performCheckin(venueId: string): Promise<{
  success: boolean;
  checkin?: Checkin;
  venue_name?: string;
  error?: string;
  message?: string;
}> {
  const deviceHash = await getDeviceHash();

  const { data, error } = await supabase.functions.invoke('check-in', {
    body: { venue_id: venueId, device_hash: deviceHash },
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const body = await error.context.json();
      return { success: false, error: body.error, message: body.message };
    }
    return { success: false, error: error.message };
  }

  return { success: true, checkin: data.checkin, venue_name: data.venue_name };
}

export async function getUserCheckins(userId: string): Promise<Checkin[]> {
  const { data, error } = await supabase
    .from('checkins')
    .select('*')
    .eq('user_id', userId)
    .order('checked_in_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getVenueCheckins(venueId: string, limit = 10): Promise<Checkin[]> {
  const { data, error } = await supabase
    .from('checkins')
    .select('*')
    .eq('venue_id', venueId)
    .order('checked_in_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getActiveCheckinCount(venueId: string): Promise<number> {
  const { count, error } = await supabase
    .from('checkins')
    .select('*', { count: 'exact', head: true })
    .eq('venue_id', venueId)
    .eq('is_active', true);

  if (error) throw error;
  return count || 0;
}
