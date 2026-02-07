// Supabase Edge Function: redeem-reward
// Validates and processes reward redemption

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

    if (authError || !user || user.is_anonymous) {
      return new Response(JSON.stringify({ error: 'Must be authenticated to redeem rewards' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { user_reward_id } = await req.json();

    if (!user_reward_id) {
      return new Response(JSON.stringify({ error: 'user_reward_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch the user reward and verify ownership
    const { data: userReward, error: fetchError } = await supabaseAdmin
      .from('user_rewards')
      .select('*, rewards(*)')
      .eq('id', user_reward_id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !userReward) {
      return new Response(JSON.stringify({ error: 'Reward not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (userReward.status !== 'redeemable') {
      return new Response(JSON.stringify({
        error: 'Reward not redeemable',
        message: userReward.status === 'redeemed'
          ? 'This reward has already been redeemed.'
          : 'You haven\'t earned enough check-ins yet.',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mark as redeemed
    const { error: updateError } = await supabaseAdmin
      .from('user_rewards')
      .update({
        status: 'redeemed',
        redeemed_at: new Date().toISOString(),
      })
      .eq('id', user_reward_id);

    if (updateError) {
      return new Response(JSON.stringify({ error: 'Failed to redeem reward' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Reward redeemed! Show this to the bartender.',
      reward_name: userReward.rewards?.name,
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
