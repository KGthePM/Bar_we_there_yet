// Supabase Edge Function: check-in
// Validates venue, checks spam, inserts checkin, updates reward progress

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Auth client — verifies user via anon key + user's JWT
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );

    // Admin client — bypasses RLS for DB operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { venue_id, device_hash } = await req.json();

    if (!venue_id) {
      return new Response(JSON.stringify({ error: 'venue_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate venue exists and is active
    const { data: venue, error: venueError } = await supabaseAdmin
      .from('venues')
      .select('id, name')
      .eq('id', venue_id)
      .eq('is_active', true)
      .single();

    if (venueError || !venue) {
      return new Response(JSON.stringify({ error: 'Venue not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Spam check: max 1 check-in per venue per 2-hour window
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    const { data: recentCheckin } = await supabaseAdmin
      .from('checkins')
      .select('id')
      .eq('venue_id', venue_id)
      .eq('user_id', user.id)
      .gte('checked_in_at', twoHoursAgo)
      .limit(1)
      .maybeSingle();

    if (recentCheckin) {
      return new Response(JSON.stringify({
        error: 'Already checked in',
        message: 'You already checked in here recently. Try again in a bit!',
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Also check device_hash for anonymous spam prevention
    if (device_hash) {
      const { data: deviceCheckin } = await supabaseAdmin
        .from('checkins')
        .select('id')
        .eq('venue_id', venue_id)
        .eq('device_hash', device_hash)
        .gte('checked_in_at', twoHoursAgo)
        .limit(1)
        .maybeSingle();

      if (deviceCheckin) {
        return new Response(JSON.stringify({
          error: 'Already checked in',
          message: 'This device already checked in here recently.',
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Insert checkin
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const { data: checkin, error: checkinError } = await supabaseAdmin
      .from('checkins')
      .insert({
        venue_id,
        user_id: user.id,
        device_hash: device_hash || null,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (checkinError) {
      return new Response(JSON.stringify({ error: 'Failed to check in' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update reward progress for authenticated (non-anonymous) users
    if (!user.is_anonymous) {
      const { data: activeRewards } = await supabaseAdmin
        .from('rewards')
        .select('id, checkins_required')
        .eq('venue_id', venue_id)
        .eq('is_active', true);

      if (activeRewards && activeRewards.length > 0) {
        for (const reward of activeRewards) {
          // Upsert user_reward progress
          const { data: existing } = await supabaseAdmin
            .from('user_rewards')
            .select('id, checkins_completed, status')
            .eq('user_id', user.id)
            .eq('reward_id', reward.id)
            .maybeSingle();

          if (existing && existing.status === 'redeemed') {
            continue; // Skip already redeemed rewards
          }

          const newCount = (existing?.checkins_completed || 0) + 1;
          const newStatus = newCount >= reward.checkins_required ? 'redeemable' : 'in_progress';

          if (existing) {
            await supabaseAdmin
              .from('user_rewards')
              .update({ checkins_completed: newCount, status: newStatus })
              .eq('id', existing.id);
          } else {
            await supabaseAdmin
              .from('user_rewards')
              .insert({
                user_id: user.id,
                reward_id: reward.id,
                venue_id,
                checkins_completed: newCount,
                status: newStatus,
              });
          }
        }
      }
    }

    // Update user points
    await supabaseAdmin.rpc('increment_user_points', { uid: user.id, points: 1 }).catch(() => {
      // Non-critical, ignore if function doesn't exist yet
    });

    return new Response(JSON.stringify({
      success: true,
      checkin,
      venue_name: venue.name,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
