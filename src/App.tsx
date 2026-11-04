import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import OneSignal from 'react-onesignal';
import PeanutsLanding from './PeanutsLanding';
import AuthOTP from './AuthOTP';
import PeanutsMain from './PeanutsMain';
import PublicChat from './PublicChat';

const SUPABASE_URL = 'https://wvqdueookxtkposaeuuu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pEF2JfLNNVNSqP2EkWfLQA_07HIg3xu';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ONESIGNAL_APP_ID = 'b0557601-dffe-4e26-8e78-b0695de8b150';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'landing' | 'otp' | 'public_chat'>('landing');

  useEffect(() => {
    // 🟢 Initialize OneSignal & ขอสิทธิ์ส่งแจ้งเตือน
    OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      allowLocalhostAsSecureOrigin: true,
      serviceWorkerPath: "OneSignalSDKWorker.js",
      serviceWorkerParam: { scope: "/" },
    }).then(() => {
      OneSignal.Notifications.requestPermission();
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) saveOneSignalSubscription(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) saveOneSignalSubscription(session.user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ฟังก์ชันบันทึกรหัสมือถือผู้ใช้ลง Supabase เพื่อให้ส่ง Push Notification หาเครื่องนี้ได้
  const saveOneSignalSubscription = async (userId: string) => {
    try {
      setTimeout(async () => {
        const subId = OneSignal.User.PushSubscription.id;
        if (subId && userId) {
          await supabase
            .from('profiles')
            .update({ onesignal_id: subId })
            .eq('id', userId);
        }
      }, 3000);
    } catch (err) {
      console.error('OneSignal Subscription Error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 text-xs font-sans">
        กำลังโหลดระบบ...
      </div>
    );
  }

  if (viewMode === 'public_chat') {
    return <PublicChat session={session} onBack={() => setViewMode('landing')} />;
  }

  if (session) {
    return (
      <PeanutsMain 
        session={session} 
        onOpenPublicChat={() => setViewMode('public_chat')} 
      />
    );
  }

  if (viewMode === 'otp') {
    return <AuthOTP onBack={() => setViewMode('landing')} />;
  }

  return (
    <PeanutsLanding 
      onAccept={() => setViewMode('otp')} 
      onOpenPublicChat={() => setViewMode('public_chat')} 
    />
  );
}