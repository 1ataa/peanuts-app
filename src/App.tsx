import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import PeanutsLanding from './PeanutsLanding';
import AuthOTP from './AuthOTP';
import PeanutsMain from './PeanutsMain';

const SUPABASE_URL = 'https://wvqdueookxtkposaeuuu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pEF2JfLNNVNSqP2EkWfLQA_07HIg3xu';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false); // ควบคุมการแสดงหน้า Landing

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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 text-xs">
        กำลังโหลด...
      </div>
    );
  }

  // 1. ถ้าล็อกอินอยู่แล้ว ให้เข้าหน้าแอปหลักทันที
  if (session) {
    return <PeanutsMain session={session} />;
  }

  // 2. ถ้ายังไม่ได้กดเริ่มใช้งานจากหน้า Landing ให้แสดงหน้า Landing Page ก่อน
  if (!hasStarted) {
    return <PeanutsLanding onStart={() => setHasStarted(true)} />;
  }

  // 3. เมื่อกดปุ่มยอมรับเงื่อนไข ให้ไปหน้าใส่กรอกอีเมล OTP
  return <AuthOTP />;
}
