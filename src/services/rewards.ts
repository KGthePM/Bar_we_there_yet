import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Reward, UserReward, RewardWithProgress } from '@/types/database';

export async function getVenueRewards(venueId: string): Promise<Reward[]> {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('venue_id', venueId)
    .eq('is_active', true)
    .order('checkins_required');

  if (error) throw error;
  return data || [];
}

export async function getVenueRewardsWithProgress(
  venueId: string,
  userId: string,
): Promise<RewardWithProgress[]> {
  const rewards = await getVenueRewards(venueId);

  const { data: userRewards } = await supabase
    .from('user_rewards')
    .select('*')
    .eq('user_id', userId)
    .eq('venue_id', venueId);

  const progressMap = new Map<string, UserReward>();
  userRewards?.forEach(ur => progressMap.set(ur.reward_id, ur));

  return rewards.map(r => ({
    ...r,
    user_reward: progressMap.get(r.id) || null,
  }));
}

export async function getUserRewards(userId: string): Promise<(UserReward & { rewards: Reward })[]> {
  const { data, error } = await supabase
    .from('user_rewards')
    .select('*, rewards(*)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function redeemReward(userRewardId: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  const { data, error } = await supabase.functions.invoke('redeem-reward', {
    body: { user_reward_id: userRewardId },
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const body = await error.context.json();
      return { success: false, error: body.error, message: body.message };
    }
    return { success: false, error: error.message };
  }

  return { success: true, message: data.message };
}

export async function createReward(reward: Partial<Reward>): Promise<Reward> {
  const { data, error } = await supabase
    .from('rewards')
    .insert(reward)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateReward(id: string, updates: Partial<Reward>): Promise<Reward> {
  const { data, error } = await supabase
    .from('rewards')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAllVenueRewards(venueId: string): Promise<Reward[]> {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('venue_id', venueId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
