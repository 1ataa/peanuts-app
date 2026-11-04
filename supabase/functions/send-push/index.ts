import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { targetUserId, title, messageText } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: targetProfile } = await supabaseAdmin
      .from('profiles')
      .select('onesignal_id')
      .eq('id', targetUserId)
      .single();

    if (!targetProfile?.onesignal_id) {
      return new Response(JSON.stringify({ error: 'Target user has no onesignal_id' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const restKey = Deno.env.get('ONESIGNAL_REST_KEY') || '';
    const appId = Deno.env.get('ONESIGNAL_APP_ID') || '';

    // รองรับทั้ง Key รูปแบบใหม่ (os_v2_app_...) และรูปแบบเดิม
    const authHeader = restKey.startsWith('os_v2_app_') ? `Key ${restKey}` : `Basic ${restKey}`;

    const onesignalRes = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        app_id: appId,
        include_subscription_ids: [targetProfile.onesignal_id],
        headings: { en: title, th: title },
        contents: { en: messageText, th: messageText }
      })
    });

    const resData = await onesignalRes.json();

    return new Response(JSON.stringify({ success: true, resData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});