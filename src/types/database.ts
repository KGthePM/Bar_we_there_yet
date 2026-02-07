export type CrowdLevel = 'empty' | 'chill' | 'getting_busy' | 'busy' | 'packed';

export type RewardStatus = 'in_progress' | 'redeemable' | 'redeemed';

export interface Venue {
  id: string;
  owner_id: string | null;
  name: string;
  slug: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  website: string | null;
  photo_url: string | null;
  hours: Record<string, { open: string; close: string }>;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Checkin {
  id: string;
  venue_id: string;
  user_id: string | null;
  device_hash: string | null;
  checked_in_at: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  total_points: number;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface VenueCrowdLevel {
  venue_id: string;
  slug: string;
  name: string;
  active_checkins: number;
  crowd_level: CrowdLevel;
}

export interface Reward {
  id: string;
  venue_id: string;
  name: string;
  description: string | null;
  checkins_required: number;
  is_active: boolean;
  created_at: string;
}

export interface UserReward {
  id: string;
  user_id: string;
  reward_id: string;
  venue_id: string;
  checkins_completed: number;
  status: RewardStatus;
  redeemed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VenueStatsDaily {
  id: string;
  venue_id: string;
  date: string;
  total_checkins: number;
  unique_visitors: number;
  repeat_visitors: number;
  peak_hour: number | null;
  hourly_breakdown: Record<string, number>;
  created_at: string;
}

export interface VenueWithCrowd extends Venue {
  crowd_level?: CrowdLevel;
  active_checkins?: number;
}

export interface RewardWithProgress extends Reward {
  user_reward?: UserReward | null;
}
