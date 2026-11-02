import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Mail, KeyRound, ArrowRight, ShieldCheck, Flame, ArrowLeft, Camera, AlertTriangle, Info } from 'lucide-react';

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
      <div className="w-full max-w-md h-[100vh] sm:h-[880px] bg-slate-950 sm:rounded-3xl shadow-2xl flex flex-col justify-between overflow-y-auto border border-slate-800 relative p-6">
        
        {/* Header */}
        <div>
          {onBack && (
            <button 
              onClick={onBack}
              className="mb-2 text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-4 h-4" /> ย้อนกลับหน้าแนะนำ
            </button>
          )}

          <div className="text-center pt-4 pb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-orange-500/20 mx-auto mb-3">
              <Flame className="w-8 h-8 text-white fill-white" />
            </div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-amber-400 via-orange-300 to-emerald-400 bg-clip-text text-transparent">
              Peanuts KU KPS
            </h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> ยืนยันตัวตนด้วยอีเมลนิสิต @ku.th
            </p>
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className={`p-3 rounded-xl text-xs text-center font-medium border transition-all my-2 ${
            toast.type === 'error' 
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' 
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}>
            {toast.msg}
          </div>
        )}

        {/* GUIDELINE BOX / ข้อแนะนำเรื่องรูปภาพ */}
        <div className="my-2 p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 text-xs leading-relaxed space-y-1.5">
          <div className="font-bold text-amber-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <Camera className="w-4 h-4 text-amber-400" /> ข้อกำหนดเกี่ยวกับรูปภาพโปรไฟล์
          </div>
          <p className="text-slate-300 text-[11px]">
            • สามารถใช้รูปโชว์หุ่น รูปร่าง หรือแนวเซ็กซี่ที่ดูดีได้ตามความเหมาะสม
          </p>
          <p className="text-rose-300 font-medium text-[11px]">
            • <span className="underline font-bold">ไม่อนุญาต</span> รูปภาพเปลือย อวัยวะเพศ หรือภาพล่อแหลมอนาจารจนเกินไป
          </p>
          <div className="pt-1 text-[10px] text-rose-400 font-semibold flex items-center gap-1 border-t border-slate-800/80">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" /> หากพบการฝ่าฝืน ระงับบัญชี (Ban) ถาวรทุกกรณีทันที
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex flex-col justify-center my-2">
          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium block">
                  กรอกอีเมลมหาลัย (@ku.th)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="example@ku.th"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs rounded-xl hover:opacity-90 active:scale-95 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15 disabled:opacity-50"
              >
                <span>{loading ? 'กำลังส่งรหัส...' : 'ส่งรหัส OTP เข้าอีเมล'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* SPAM / JUNK NOTICE */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  หากไม่พบรหัส OTP ในกล่องข้อความหลัก กรุณาตรวจสอบใน <span className="text-amber-300 font-medium">โฟลเดอร์ขยะ (Junk / Spam)</span> ของอีเมลมหาลัย
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-slate-400 font-medium">
                    กรอกรหัส OTP 8 หลัก
                  </label>
                  <span className="text-[10px] text-emerald-400 font-mono truncate max-w-[180px]">
                    {email}
                  </span>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    maxLength={8}
                    placeholder="12345678"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-center font-mono tracking-[0.3em] text-base focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs rounded-xl hover:opacity-90 active:scale-95 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15 disabled:opacity-50"
              >
                <span>{loading ? 'กำลังตรวจสอบ...' : 'ยืนยันรหัส OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-center text-xs text-slate-400 hover:text-white transition py-1"
              >
                ย้อนกลับไปเปลี่ยนอีเมล
              </button>

              {/* SPAM / JUNK NOTICE */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  หากไม่ได้รับรหัส OTP กรุณาตรวจสอบใน <span className="text-amber-300 font-medium">โฟลเดอร์ขยะ (Junk / Spam)</span> หรือกดย้อนกลับเพื่อลองใหม่อีกครั้ง
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-slate-500 pb-2">
          เฉพาะนิสิต ม.เกษตรศาสตร์ กำแพงแสน เท่านั้น
        </div>

      </div>
    </div>
  );
}
