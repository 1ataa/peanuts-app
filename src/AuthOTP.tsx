import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Mail, KeyRound, ArrowRight, ShieldCheck, Flame, ArrowLeft } from 'lucide-react';

const SUPABASE_URL = 'https://wvqdueookxtkposaeuuu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pEF2JfLNNVNSqP2EkWfLQA_07HIg3xu';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function AuthOTP({ onBack }: { onBack?: () => void }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. ส่งรหัส OTP ไปที่อีเมลมหาลัย
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail.endsWith('@ku.th')) {
      showToast('⚠️ กรุณาใช้อีเมลมหาลัยที่ลงท้ายด้วย @ku.th เท่านั้น', 'error');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: { shouldCreateUser: true }
    });
    setLoading(false);

    if (error) {
      showToast('❌ ส่ง OTP ไม่สำเร็จ: ' + error.message, 'error');
    } else {
      showToast('✉️ ส่งรหัส OTP ไปที่อีเมลเรียบร้อยแล้ว!', 'success');
      setStep('otp');
    }
  };

  // 2. ตรวจสอบรหัส OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: otp.trim(),
      type: 'email'
    });
    setLoading(false);

    if (error) {
      showToast('❌ รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง', 'error');
    } else {
      showToast('🎉 เข้าสู่ระบบสำเร็จ!', 'success');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-900 font-sans p-0 sm:p-4 text-slate-100">
      <div className="w-full max-w-md h-[100vh] sm:h-[880px] bg-slate-950 sm:rounded-3xl shadow-2xl flex flex-col justify-between overflow-hidden border border-slate-8
