import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import AuthOTP from './AuthOTP';
import PeanutsMain from './PeanutsMain';

const SUPABASE_URL = 'https://wvqdueookxtkposaeuuu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pEF2JfLNNVNSqP2EkWfLQA_07HIg3xu';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ดึงสถานะการเข้าสู่ระบบปัจจุบัน
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // ตรวจจับเมื่อมีการล็อกอิน/ล็อกเอาท์
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs">
        กำลังโหลดระบบ Peanuts...
      </div>
    );
  }

  // ยังไม่ล็อกอิน -> แสดงหน้า OTP
  if (!session) {
    return <AuthOTP />;
  }

  // ล็อกอินแล้ว -> แสดงหน้าจับคู่ PeanutsMain
  return <PeanutsMain session={session} />;
}
