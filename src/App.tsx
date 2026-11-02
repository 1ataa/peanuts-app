import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import PeanutsLanding from './PeanutsLanding';
import AuthOTP from './AuthOTP';
import PeanutsMain from './PeanutsMain';
import PublicChat from './PublicChat';

const SUPABASE_URL = 'https://wvqdueookxtkposaeuuu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pEF2JfLNNVNSqP2EkWfLQA_07HIg3xu';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'landing' | 'otp' | 'public_chat'>('landing');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 text-xs font-sans">
        กำลังโหลดระบบ...
      </div>
    );
  }

  // 1. ล็อกอินแล้วเข้าแอปหลัก
  if (session) {
    return <PeanutsMain session={session} />;
  }

  // 2. ถ้าเลือกกดเข้าห้องแชทสาธารณะ
  if (viewMode === 'public_chat') {
    return <PublicChat onBack={() => setViewMode('landing')} />;
  }

  // 3. ถ้าเลือกกดเข้าหน้าล็อกอิน OTP
  if (viewMode === 'otp') {
    return <AuthOTP onBack={() => setViewMode('landing')} />;
  }

  // 4. หน้าแรกสุด (Landing Page)
  return (
    <PeanutsLanding 
      onStart={() => setViewMode('otp')} 
      onPublicChat={() => setViewMode('public_chat')} 
    />
  );
}
