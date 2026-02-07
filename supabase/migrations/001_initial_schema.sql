-- BarWeThereYet: Initial Schema
-- Run this in Supabase SQL Editor or via CLI

-- Enable required extensions
create extension if not exists "pgcrypto";

-- ============================================
-- TABLES
-- ============================================

-- Venues table
create table public.venues (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  name text not null,
  slug text not null unique,
  address text,
  city text,
  state text,
  zip text,
  phone text,
  website text,
  photo_url text,
  hours jsonb default '{}',
  description text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_venues_slug on public.venues(slug);
create index idx_venues_owner on public.venues(owner_id);

-- User profiles table (auto-created on signup)
create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  total_points integer default 0,
  is_anonymous boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Checkins table
create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  device_hash text,
  checked_in_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '2 hours'),
  is_active boolean default true,
  created_at timestamptz default now()
);

create index idx_checkins_venue_active on public.checkins(venue_id, is_active) where is_active = true;
create index idx_checkins_user on public.checkins(user_id);
create index idx_checkins_expires on public.checkins(expires_at) where is_active = true;

-- Rewards table
create table public.rewards (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  name text not null,
  description text,
  checkins_required integer not null default 5,
  is_active boolean default true,
  created_at timestamptz default now()
);

create index idx_rewards_venue on public.rewards(venue_id);

-- User rewards progress table
create table public.user_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reward_id uuid not null references public.rewards(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  checkins_completed integer default 0,
  status text default 'in_progress' check (status in ('in_progress', 'redeemable', 'redeemed')),
  redeemed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, reward_id)
);

create index idx_user_rewards_user on public.user_rewards(user_id);

-- Venue stats daily table (for analytics)
create table public.venue_stats_daily (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  date date not null,
  total_checkins integer default 0,
  unique_visitors integer default 0,
  repeat_visitors integer default 0,
  peak_hour integer,
  hourly_breakdown jsonb default '{}',
  created_at timestamptz default now(),
  unique(venue_id, date)
);

create index idx_venue_stats_venue_date on public.venue_stats_daily(venue_id, date);

-- ============================================
-- VIEWS
-- ============================================

-- Real-time crowd level view
create or replace view public.venue_crowd_levels as
select
  v.id as venue_id,
  v.slug,
  v.name,
  count(c.id) as active_checkins,
  case
    when count(c.id) = 0 then 'empty'
    when count(c.id) between 1 and 5 then 'chill'
    when count(c.id) between 6 and 15 then 'getting_busy'
    when count(c.id) between 16 and 30 then 'busy'
    else 'packed'
  end as crowd_level
from public.venues v
left join public.checkins c on c.venue_id = v.id and c.is_active = true
where v.is_active = true
group by v.id, v.slug, v.name;

-- ============================================
-- RLS POLICIES
-- ============================================

alter table public.venues enable row level security;
alter table public.checkins enable row level security;
alter table public.user_profiles enable row level security;
alter table public.rewards enable row level security;
alter table public.user_rewards enable row level security;
alter table public.venue_stats_daily enable row level security;

-- Venues: anyone can read active venues
create policy "Anyone can read active venues"
  on public.venues for select
  using (is_active = true);

-- Venues: owners can insert their own venues
create policy "Authenticated users can create venues"
  on public.venues for insert
  to authenticated
  with check (auth.uid() = owner_id);

-- Venues: owners can update their own venues
create policy "Owners can update their venues"
  on public.venues for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Checkins: anyone can insert (validated via edge function)
create policy "Anyone can insert checkins"
  on public.checkins for insert
  to authenticated
  with check (true);

-- Checkins: users can read their own checkins
create policy "Users can read own checkins"
  on public.checkins for select
  to authenticated
  using (auth.uid() = user_id);

-- Checkins: venue owners can read their venue's checkins
create policy "Venue owners can read venue checkins"
  on public.checkins for select
  to authenticated
  using (
    exists (
      select 1 from public.venues
      where venues.id = checkins.venue_id
      and venues.owner_id = auth.uid()
    )
  );

-- Checkins: service role can update (for expiry cron)
create policy "Service can update checkins"
  on public.checkins for update
  using (true)
  with check (true);

-- User profiles: users can read their own profile
create policy "Users can read own profile"
  on public.user_profiles for select
  to authenticated
  using (auth.uid() = id);

-- User profiles: users can update their own profile
create policy "Users can update own profile"
  on public.user_profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Rewards: anyone can read active rewards
create policy "Anyone can read active rewards"
  on public.rewards for select
  using (is_active = true);

-- Rewards: venue owners can manage rewards
create policy "Owners can insert rewards"
  on public.rewards for insert
  to authenticated
  with check (
    exists (
      select 1 from public.venues
      where venues.id = rewards.venue_id
      and venues.owner_id = auth.uid()
    )
  );

create policy "Owners can update rewards"
  on public.rewards for update
  to authenticated
  using (
    exists (
      select 1 from public.venues
      where venues.id = rewards.venue_id
      and venues.owner_id = auth.uid()
    )
  );

-- User rewards: users can read their own progress
create policy "Users can read own rewards"
  on public.user_rewards for select
  to authenticated
  using (auth.uid() = user_id);

-- User rewards: service can insert/update (via edge function)
create policy "Service can manage user rewards"
  on public.user_rewards for all
  using (true)
  with check (true);

-- Venue stats: venue owners can read their stats
create policy "Owners can read venue stats"
  on public.venue_stats_daily for select
  to authenticated
  using (
    exists (
      select 1 from public.venues
      where venues.id = venue_stats_daily.venue_id
      and venues.owner_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, display_name, is_anonymous)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', 'Anonymous'),
    new.is_anonymous
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at trigger
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger venues_updated_at
  before update on public.venues
  for each row execute procedure public.update_updated_at();

create trigger user_profiles_updated_at
  before update on public.user_profiles
  for each row execute procedure public.update_updated_at();

create trigger user_rewards_updated_at
  before update on public.user_rewards
  for each row execute procedure public.update_updated_at();

-- Expire old checkins function (call via pg_cron or scheduled edge function)
create or replace function public.expire_old_checkins()
returns void as $$
begin
  update public.checkins
  set is_active = false
  where is_active = true
  and expires_at <= now();
end;
$$ language plpgsql security definer;

-- Daily stats aggregation function
create or replace function public.aggregate_daily_stats(target_date date default current_date - 1)
returns void as $$
begin
  insert into public.venue_stats_daily (venue_id, date, total_checkins, unique_visitors, repeat_visitors, peak_hour, hourly_breakdown)
  select
    c.venue_id,
    target_date,
    count(*) as total_checkins,
    count(distinct c.user_id) as unique_visitors,
    count(distinct c.user_id) filter (
      where c.user_id in (
        select user_id from public.checkins
        where venue_id = c.venue_id
        and checked_in_at::date < target_date
        group by user_id
      )
    ) as repeat_visitors,
    (
      select extract(hour from checked_in_at)::integer
      from public.checkins
      where venue_id = c.venue_id
      and checked_in_at::date = target_date
      group by extract(hour from checked_in_at)::integer
      order by count(*) desc
      limit 1
    ) as peak_hour,
    jsonb_object_agg(
      extract(hour from c.checked_in_at)::text,
      hour_counts.cnt
    ) as hourly_breakdown
  from public.checkins c
  join (
    select venue_id, extract(hour from checked_in_at)::integer as hr, count(*) as cnt
    from public.checkins
    where checked_in_at::date = target_date
    group by venue_id, extract(hour from checked_in_at)::integer
  ) hour_counts on hour_counts.venue_id = c.venue_id
  where c.checked_in_at::date = target_date
  group by c.venue_id
  on conflict (venue_id, date) do update set
    total_checkins = excluded.total_checkins,
    unique_visitors = excluded.unique_visitors,
    repeat_visitors = excluded.repeat_visitors,
    peak_hour = excluded.peak_hour,
    hourly_breakdown = excluded.hourly_breakdown;
end;
$$ language plpgsql security definer;

-- ============================================
-- REALTIME
-- ============================================

-- Enable realtime on checkins for crowd level updates
alter publication supabase_realtime add table public.checkins;

-- ============================================
-- SEED DATA
-- ============================================

-- Note: Run this after creating an owner account, or update the owner_id after
insert into public.venues (name, slug, address, city, state, zip, description, photo_url, hours) values
(
  'Crossroads Bar & Grill',
  'crossroads-bar-grill',
  '123 Main St',
  'Camden',
  'NJ',
  '08101',
  'Great food, cold drinks, and good times at the crossroads of South Jersey.',
  null,
  '{"monday": {"open": "16:00", "close": "02:00"}, "tuesday": {"open": "16:00", "close": "02:00"}, "wednesday": {"open": "16:00", "close": "02:00"}, "thursday": {"open": "16:00", "close": "02:00"}, "friday": {"open": "14:00", "close": "02:00"}, "saturday": {"open": "12:00", "close": "02:00"}, "sunday": {"open": "12:00", "close": "00:00"}}'
),
(
  'The Shore House',
  'the-shore-house-asbury',
  '456 Ocean Ave',
  'Asbury Park',
  'NJ',
  '07712',
  'Beachside vibes with craft cocktails and live music.',
  null,
  '{"monday": {"open": "17:00", "close": "01:00"}, "tuesday": {"open": "17:00", "close": "01:00"}, "wednesday": {"open": "17:00", "close": "01:00"}, "thursday": {"open": "17:00", "close": "02:00"}, "friday": {"open": "15:00", "close": "02:00"}, "saturday": {"open": "12:00", "close": "02:00"}, "sunday": {"open": "12:00", "close": "23:00"}}'
);
