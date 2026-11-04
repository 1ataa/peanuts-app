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

    if (!targetUserId || !title || !messageText) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const onesignalAppId = Deno.env.get('ONESIGNAL_APP_ID') ?? 'b0557601-dffe-4e26-8e78-b0695de8b150';
    const onesignalRestKey = Deno.env.get('ONESIGNAL_REST_KEY') ?? '';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('onesignal_id')
      .eq('id', targetUserId)
      .single();

    const payload: any = {
      app_id: onesignalAppId,
      headings: { en: title, th: title },
      contents: { en: messageText, th: messageText },
    };

    if (targetProfile?.onesignal_id) {
      payload.include_subscription_ids = [targetProfile.onesignal_id];
    } else {
      payload.include_external_user_ids = [targetUserId];
    }

    const cleanRestKey = onesignalRestKey.replace(/^Key\s+/i, '');

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Basic ${cleanRestKey}`,
      },
      body: JSON.stringify(payload),
    });

    const resData = await response.json();

    return new Response(JSON.stringify({ success: true, resData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});