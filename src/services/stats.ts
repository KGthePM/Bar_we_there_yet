import { supabase } from '@/lib/supabase';
import type { VenueStatsDaily } from '@/types/database';

export async function getVenueStats(
  venueId: string,
  days: number = 30,
): Promise<VenueStatsDaily[]> {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  const { data, error } = await supabase
    .from('venue_stats_daily')
    .select('*')
    .eq('venue_id', venueId)
    .gte('date', fromDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getTodayStats(venueId: string): Promise<{
  total_checkins: number;
  unique_visitors: number;
  repeat_visitors: number;
}> {
  const today = new Date().toISOString().split('T')[0];

  // Get from live checkins table for today's data
  const { data: checkins, error } = await supabase
    .from('checkins')
    .select('user_id')
    .eq('venue_id', venueId)
    .gte('checked_in_at', `${today}T00:00:00`)
    .lte('checked_in_at', `${today}T23:59:59`);

  if (error) throw error;

  const total = checkins?.length || 0;
  const uniqueUsers = new Set(checkins?.map(c => c.user_id).filter(Boolean));
  const unique = uniqueUsers.size;

  // For repeat visitors, we'd need historical data
  // Simplified: count users who've been here before today
  let repeat = 0;
  for (const userId of uniqueUsers) {
    const { count } = await supabase
      .from('checkins')
      .select('*', { count: 'exact', head: true })
      .eq('venue_id', venueId)
      .eq('user_id', userId)
      .lt('checked_in_at', `${today}T00:00:00`);

    if (count && count > 0) repeat++;
  }

  return { total_checkins: total, unique_visitors: unique, repeat_visitors: repeat };
}

export async function getHourlyBreakdown(
  venueId: string,
  days: number = 7,
): Promise<Record<string, Record<string, number>>> {
  const stats = await getVenueStats(venueId, days);

  // Aggregate hourly data across days of week
  const heatmap: Record<string, Record<string, number>> = {};
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  for (const stat of stats) {
    const date = new Date(stat.date);
    const dayName = dayNames[date.getDay()];

    if (!heatmap[dayName]) heatmap[dayName] = {};

    for (const [hour, count] of Object.entries(stat.hourly_breakdown)) {
      heatmap[dayName][hour] = (heatmap[dayName][hour] || 0) + count;
    }
  }

  return heatmap;
}
