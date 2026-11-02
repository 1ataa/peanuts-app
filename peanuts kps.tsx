import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Heart, X, Star, RotateCcw, Zap, Sparkles, MessageSquare, 
  User, ShieldCheck, Mail, KeyRound, LogOut, Camera, Edit3, CheckCircle2 
} from 'lucide-react';

// เชื่อมต่อ Supabase ด้วย API Key ของคุณ
const SUPABASE_URL = 'https://wvqdueookxtkposaeuuu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pEF2JfLNNVNSqP2EkWfLQA_07HIg3xu';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const INITIAL_PROFILES = [
  {
    id: 1,
    name: 'Crispy Crunch',
    age: 20,
    faculty: 'คณะเกษตร KU KPS',
    year: 'ปี 2',
    bio: 'สายลุย ชอบทำกิจกรรม ชอบกินส้มตำหลังมหาลัย 🥜',
    aboutMe: 'หาเพื่อนไปนั่งอ่านหนังสือหอโดม หรือหาเพื่อนหารค่าชาบูหน้ามหาลัยครับ เป็นคนคุยง่าย ยิ้มเก่ง!',
    prompt: 'วิชาเรียนสุดโหดที่อยากได้คนช่วยติว',
    promptAnswer: 'Gen Chem!! ช่วยด้วยครับอาจารย์สอนไวมาก 😭',
    interests: ['อ่านหนังสือ', 'บาสเกตบอล', 'กินชาบู', 'ฟังเพลง'],
    verified: true,
    images: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800']
  },
  {
    id: 2,
    name: 'Roasted Almond',
    age: 21,
    faculty: 'คณะวิศวกรรมศาสตร์ กำแพงแสน',
    year: 'ปี 3',
    bio: 'เด็กวิศวะสายชิล ชอบถ่ายรูปฟิล์มรอบมหาลัย 📷',
    aboutMe: 'ชอบเดินเล่นตอนเย็นๆ แถวสระพระพิรุณ ใครสายถ่ายรูปทักมาคุยกันได้นะ',
    prompt: 'สถานที่โปรดใน KU KPS',
    promptAnswer: 'แปลงนาสาธิตตอนพระอาทิตย์ตกดิน แสงสวยมาก',
    interests: ['ถ่ายรูป', 'เล่นกีตาร์', 'กาแฟ', 'คาเฟ่'],
    verified: true,
    images: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800']
  }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email'); // 'email', 'otp', 'app'
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // 1. สั่งส่งรหัส OTP ไปที่อีเมลมหาลัยจริง
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.toLowerCase().endsWith('@ku.th')) {
      showToast('⚠️ กรุณาใช้อีเมลมหาลัยที่ลงท้ายด้วย @ku.th เท่านั้น');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true }
    });
    setLoading(false);

    if (error) {
      showToast('❌ ส่ง OTP ไม่สำเร็จ: ' + error.message);
    } else {
      showToast('✉️ ส่งรหัส OTP ไปที่อีเมลของคุณเรียบร้อยแล้ว!');
      setStep('otp');
    }
  };

  // 2. ตรวจสอบรหัส OTP ที่ผู้ใช้กรอก
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp.trim(),
      type: 'email'
    });
    setLoading(false);

    if (error) {
      showToast('❌ รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่');
    } else {
      setUser(data.user);
      setStep('app');
      showToast('🎉 เข้าสู่ระบบ Peanuts KU KPS สำเร็จ!');
    }
  };

  // หน้าจอล็อกอิน / กรอก OTP
  if (step !== 'app') {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-4">
        {toast && (
          <div className="fixed top-5 bg-amber-500 text-black font-bold px-4 py-2 rounded-full shadow-lg transition">
            {toast}
          </div>
        )}

        <div className="w-full max-w-md bg-neutral-800 p-8 rounded-3xl border border-neutral-700 shadow-2xl text-center">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/40">
            <span className="text-3xl">🥜</span>
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Peanuts KU KPS
          </h1>
          <p className="text-neutral-400 text-sm mt-1 mb-6">
            แอปจับคู่เฉพาะนิสิต ม.เกษตรศาสตร์ วิทยาเขตกำแพงแสน
          </p>

          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="text-left">
                <label className="text-xs text-neutral-400 mb-1 block font-medium">
                  กรอกอีเมลมหาลัย (@ku.th)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-neutral-400" />
                  <input
                    type="email"
                    required
                    placeholder="b68xxxxxxx@ku.th"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 font-bold rounded-xl text-black hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? 'กำลังส่งรหัส...' : 'ส่งรหัส OTP เข้าอีเมล'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-left">
                <label className="text-xs text-neutral-400 mb-1 block font-medium">
                  กรอกรหัส OTP 6 หลักที่ได้รับในอีเมล
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3.5 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-center tracking-widest text-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 font-bold rounded-xl text-black hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? 'กำลังตรวจสอบ...' : 'ยืนยันรหัส OTP'}
              </button>
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-xs text-neutral-400 hover:text-white underline mt-2"
              >
                ย้อนกลับไปเปลี่ยนอีเมล
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // หน้าแอปพลิเคชัน Peanuts หลักเมื่อเข้าสู่ระบบสำเร็จ
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 rounded-3xl border border-neutral-800 shadow-2xl overflow-hidden flex flex-col h-[650px]">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50 backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🥜</span>
            <span className="font-extrabold text-amber-500 text-lg">Peanuts KU KPS</span>
          </div>
          <button 
            onClick={() => { setStep('email'); setUser(null); }}
            className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-1.5 rounded-full flex items-center gap-1 border border-neutral-700"
          >
            <LogOut className="w-3.5 h-3.5" /> ออกจากระบบ
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
          <div className="relative mb-4">
            <img 
              src={INITIAL_PROFILES[0].images[0]} 
              alt="Profile" 
              className="w-48 h-64 object-cover rounded-2xl border-2 border-amber-500/40 shadow-xl"
            />
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{INITIAL_PROFILES[0].faculty}</span>
            </div>
          </div>
          <h2 className="text-xl font-bold">{INITIAL_PROFILES[0].name}, {INITIAL_PROFILES[0].age}</h2>
          <p className="text-xs text-amber-400 mt-0.5">{INITIAL_PROFILES[0].year}</p>
          <p className="text-sm text-neutral-300 mt-2 px-6">{INITIAL_PROFILES[0].aboutMe}</p>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-neutral-900 border-t border-neutral-800 flex justify-center gap-6">
          <button className="w-14 h-14 bg-neutral-800 border border-neutral-700 text-red-400 rounded-full flex items-center justify-center hover:scale-105 transition shadow-lg">
            <X className="w-6 h-6" />
          </button>
          <button className="w-14 h-14 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-full flex items-center justify-center hover:scale-105 transition shadow-lg font-bold">
            <Heart className="w-6 h-6 fill-black" />
          </button>
        </div>
      </div>
    </div>
  );
}
