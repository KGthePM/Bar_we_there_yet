# Developer Commands
- `npm run dev` - Start dev server (requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local)
- `npm run build` - Typecheck and build (runs `tsc -b` then `vite build`)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

# Supabase Setup (First Time)
1. Run migration in Supabase SQL Editor: `supabase/migrations/001_initial_schema.sql`
2. Enable Anonymous Auth: Dashboard > Authentication > Sign In / Up > Anonymous Sign-Ins > Toggle on
3. Create storage bucket (in SQL Editor):
   ```sql
   insert into storage.buckets (id, name, public)
   values ('venue-photos', 'venue-photos', true)
   on conflict (id) do nothing;
   ```
4. Deploy Edge Functions:
   ```bash
   supabase functions deploy check-in --project-ref <your-project-ref>
   supabase functions deploy redeem-reward --project-ref <your-project-ref>
   ```

# Edge Functions
- `check-in`: Validates venue, spam prevention (2-hour cooldown per user/device), inserts checkin, updates reward progress
- `redeem-reward`: Validates and processes reward redemption
- Both use dual client pattern: auth client (anon key + user JWT) for user verification, admin client (SERVICE_ROLE_KEY) for DB operations bypassing RLS

# Database
- Tables: venues, user_profiles, checkins, rewards, user_rewards, venue_stats_daily
- Views: `venue_crowd_levels` (real-time crowd levels)
- Crowd levels: empty, chill, getting_busy, busy, packed
- Checkins expire after 2 hours

# Architecture
- All pages are lazy-loaded via React Router v7
- Public routes use PublicLayout, `/checkin/:slug` uses MobileLayout (no header/footer)
- Admin routes wrapped in AdminRoute component (verifies user has owner access)
- Auth: supports anonymous users (for quick check-ins) and authenticated users (for rewards + admin)
- Real-time crowd levels via Supabase real-time subscription to `venue_crowd_levels` view

# Path Alias
- Use `@/` for src imports (e.g., `@/services/venues`)

# Services Pattern
- All DB calls go through `src/services/` (venues, checkins, rewards, stats)
- Services use Supabase client from `@/lib/supabase`
- Edge functions invoked via `supabase.functions.invoke()`

# TypeScript
- Strict mode enabled, no test framework configured
- Types in `src/types/database.ts` mirror database schema
