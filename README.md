# BarWeThereYet

Real-time bar crowd levels, check-ins, and rewards. Know how packed a bar is before you go.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 7, Tailwind CSS v4
- **Backend:** Supabase (Postgres, Auth, Edge Functions, Realtime, Storage)
- **Charts:** Recharts
- **QR Codes:** qrcode.react

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A [Supabase](https://supabase.com/) project (free tier works)

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd bar_we_there_yet
npm install
```

### 2. Configure Supabase

Create a `.env.local` file in the project root:

```
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

You can find these in your Supabase dashboard under **Project Settings > API**.

### 3. Run the database migration

Open the Supabase **SQL Editor** and run the contents of:

```
supabase/migrations/001_initial_schema.sql
```

This creates all tables, views, RLS policies, triggers, and seeds two demo venues (Crossroads Bar & Grill and The Shore House).

### 4. Enable Anonymous Auth

In the Supabase dashboard:

1. Go to **Authentication** > **Sign In / Up**
2. Scroll to **Anonymous Sign-Ins**
3. Toggle it **on**
4. Hit **Save**

This allows users to check in without creating an account.

### 5. Create the storage bucket

In the Supabase **SQL Editor**, run:

```sql
insert into storage.buckets (id, name, public)
values ('venue-photos', 'venue-photos', true)
on conflict (id) do nothing;
```

### 6. Deploy Edge Functions

The project includes two Edge Functions in `supabase/functions/`. Deploy them using the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase functions deploy check-in --project-ref <your-project-ref>
supabase functions deploy redeem-reward --project-ref <your-project-ref>
```

## Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build for Production

```bash
npm run build
npm run preview   # preview the production build locally
```

## How to Sign In and Test

### Quick check-in (no account needed)

1. Open [http://localhost:5173](http://localhost:5173) -- you'll see the two seed venues
2. Click on a venue or navigate directly to `/checkin/crossroads-bar-grill`
3. Tap **Check In** -- the app signs you in anonymously and records the check-in
4. Go back to the home/explore page and watch the crowd level update in real-time

### Create an account (for rewards + admin)

1. Go to `/signup` and register with an email and password
2. Once signed in, your check-ins count toward rewards progress
3. Visit `/me/rewards` to see reward progress and `/me/history` for check-in history

### Test the admin dashboard

A test admin account is pre-configured with ownership of both demo venues:

- **Email:** `admin@barwethereyet.com`
- **Password:** `TestAdmin123!`

To sign in:

1. On the homepage, scroll to the "Own a Bar?" section and click **Log In** (or go to `/login` directly)
2. Select the **Bar Owner** tab and enter the credentials above
3. You'll be redirected to `/admin` with both Crossroads Bar & Grill and The Shore House available

From the dashboard you can view live crowd gauges, check-in charts, peak hours, generate QR codes, and manage rewards.

#### Manual setup (optional)

To make your own account a venue owner instead:

1. Sign up at `/signup`
2. Copy your user ID from **Supabase Dashboard > Authentication > Users**
3. In the SQL Editor, assign yourself as an owner:
   ```sql
   update public.venues
   set owner_id = '<your-user-uuid>'
   where slug = 'crossroads-bar-grill';
   ```
4. Navigate to `/admin`

## App Routes

| Route | Description |
|---|---|
| `/` | Home page |
| `/explore` | Browse all venues with live crowd levels |
| `/venue/:slug` | Venue detail page |
| `/checkin/:slug` | Mobile-optimized check-in page (QR code target) |
| `/login` | Sign in (Customer / Bar Owner toggle) |
| `/signup` | Create account |
| `/me` | User profile |
| `/me/history` | Check-in history |
| `/me/rewards` | Rewards progress |
| `/admin` | Venue owner dashboard |
| `/admin/venue/new` | Add a new venue |
| `/admin/venue/:id/edit` | Edit venue details |
| `/admin/venue/:id/qr` | Generate QR codes for check-in |
| `/admin/venue/:id/rewards` | Manage venue rewards |

## Project Structure

```
src/
  components/
    admin/       # Dashboard widgets (CrowdGauge, Charts, QR)
    auth/        # ProtectedRoute, AdminRoute, LoginForm, SignUpForm
    checkin/     # CheckinButton, CheckinSuccess
    layout/      # PublicLayout, MobileLayout, AdminLayout
    rewards/     # RewardCard, RewardProgress
    ui/          # Button, Card, Badge, Input, Modal, Spinner, Toast
    venue/       # VenueCard, VenueList, CrowdIndicator
  context/       # AuthContext (session management)
  hooks/         # useAuth, useCheckin, useCrowdLevel, useVenues, useVenueStats
  lib/           # Supabase client, constants, utils
  pages/
    admin/       # AdminDashboard, VenueSetup, QRCode, AdminRewards
    public/      # Home, Explore, Venue, Checkin, Login, SignUp
    user/        # Profile, History, Rewards
  services/      # API layer (venues, checkins, rewards, stats)
  types/         # TypeScript types (database schema)
supabase/
  functions/     # Edge Functions (check-in, redeem-reward)
  migrations/    # SQL migration (001_initial_schema.sql)
```

## License

MIT
