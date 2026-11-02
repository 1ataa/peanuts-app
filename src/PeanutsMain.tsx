import React, { useState, useEffect } from 'react';
import { 
  Heart, X, Star, RotateCcw, MessageCircle, User, Compass, 
  ShieldCheck, MapPin, GraduationCap, Sparkles, Send, Image, 
  Settings, LogOut, ChevronLeft, ChevronRight, Info, CheckCircle, 
  SlidersHorizontal, Plus, Camera, Edit3, Flame, Search, Bell
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- Supabase Config ---
const SUPABASE_URL = 'https://wvqdueookxtkposaeuuu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pEF2JfLNNVNSqP2EkWfLQA_07HIg3xu';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Mock Data for Testing & Preview ---
const MOCK_PROFILES = [
  {
    id: '1',
    name: 'น้องแพรว',
    age: 20,
    studentId: '66xxxxx',
    faculty: 'คณะเกษตร กำแพงแสน',
    year: 'ชั้นปีที่ 2',
    verified: true,
    bio: 'สายคาเฟ่ ชอบถ่ายรูป ชอบเดินเล่นแปลงเกษตรตอนเย็น 🌾 หาเพื่อนกินชาบูหน้า ม.',
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800'
    ],
    tags: ['#ถ่ายรูป', '#ชาบูหน้าม', '#เดินเล่นแปลงวิจัย', '#CatLover', '#Valorant'],
    prompts: [
      { q: 'ร้านโปรดหน้า ม. ที่ต้องไปประจำ', a: 'ก๋วยเตี๋ยวเรือข้าง ม. กับ ร้านนมปังเย็น' },
      { q: 'กิจกรรมวันหยุดสุดสัปดาห์', a: 'ให้อาหารปลาที่สระพระพินิจ แล้วไปต่อคาเฟ่' }
    ]
  },
  {
    id: '2',
    name: 'พี่ภีม',
    age: 21,
    studentId: '65xxxxx',
    faculty: 'คณะวิศวกรรมศาสตร์ กำแพงแสน',
    year: 'ชั้นปีที่ 3',
    verified: true,
    bio: 'เด็กวิศวะเครื่องกล ชอบตีแบตกับเล่นเกมดึกๆ 🏸🎮 หาคนไปวิ่งสระน้ำมหาลัยด้วยกันครับ',
    photos: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800'
    ],
    tags: ['#วิศวะเครื่องกล', '#ตีแบต', '#วิ่งสระน้ำ', '#อนิเมะ', '#บอร์ดเกม'],
    prompts: [
      { q: 'สกิลพิเศษที่ไม่เหมือนใคร', a: 'ประกอบคอมได้ใน 20 นาที และจำทางใน ม. ได้ทุกซอก' },
      { q: 'ข้อดีของการมีฉันเป็นคู่ Match', a: 'พาไปกินของอร่อยยามดึกได้เสมอ' }
    ]
  },
  {
    id: '3',
    name: 'มินนี่',
    age: 19,
    studentId: '67xxxxx',
    faculty: 'คณะวิทยาศาสตร์การกีฬา',
    year: 'ชั้นปีที่ 1',
    verified: true,
    bio: 'เด็กปี 1 เฟรชชี่สดใส ⚽ ชอบเล่นบาสและฟิตเนส หาเพื่อนหารค่า Grab ยามเย็นค่ะ!',
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=800'
    ],
    tags: ['#วิทย์กีฬา', '#ฟิตเนส', '#FreshyKU85', '#ฟังเพลงอินดี้', '#หมูกระทะ'],
    prompts: [
      { q: 'วิธีมัดใจฉัน', a: 'พาไปกินไอติมหลังซ้อมกีฬาเสร็จ ✨' }
    ]
  },
  {
    id: '4',
    name: 'ตูน',
    age: 22,
    studentId: '64xxxxx',
    faculty: 'คณะศึกษาศาสตร์และวิทยาศาสตร์',
    year: 'ชั้นปีที่ 4',
    verified: true,
    bio: 'ปี 4 กำลังทำโปรเจกต์จบ ต้องการกาแฟและกำลังใจด่วนๆ ☕ ชอบคาเฟ่มินิมอล',
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800'
    ],
    tags: ['#เด็กปี4', '#Thesis', '#CoffeeLover', '#อ่านหนังสือหอสมุด'],
    prompts: [
      { q: 'เป้าหมายปีนี้', a: 'เรียนจบพร้อมเกียรตินิยม แล้วไปเที่ยวทะเล' }
    ]
  }
];

const MOCK_MATCHES = [
  {
    id: 'm1',
    name: 'น้องแพรว',
    faculty: 'คณะเกษตร',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    lastMessage: 'ตอนเย็นไปกินชาบูตรงข้าม ม. กันมั้ยคะ? 🍲',
    time: '18:32',
    unread: true,
    online: true
  },
  {
    id: 'm2',
    name: 'มินนี่',
    faculty: 'คณะวิทย์กีฬา',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    lastMessage: 'ยินดีที่ได้รู้จักน้าาา เฟรชชี่เหมือนกันเลย!',
    time: 'เมื่อวาน',
    unread: false,
    online: false
  }
];

export default function PeanutsMain({ session }: { session?: any }) {
  const [activeTab, setActiveTab] = useState<'discover' | 'matches' | 'profile'>('discover');
  
  // Discover State
  const [profiles, setProfiles] = useState(MOCK_PROFILES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [matchedUser, setMatchedUser] = useState<any | null>(null);

  // Chat State
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<Array<{ id: string; sender: 'me' | 'them'; text: string; time: string }>>([
    { id: '1', sender: 'them', text: 'สวัสดีค่าา นิสิต KU KPS เหมือนกันเลย 😊', time: '18:30' },
    { id: '2', sender: 'me', text: 'หวัดดีครับ! คณะเกษตรใช่ไหมครับ พอดีเห็นในโปรไฟล์', time: '18:31' },
    { id: '3', sender: 'them', text: 'ตอนเย็นไปกินชาบูตรงข้าม ม. กันมั้ยคะ? 🍲', time: '18:32' }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  // User Profile Settings State
  const [myProfile, setMyProfile] = useState({
    name: 'ตาต้า (Tata)',
    faculty: 'คณะเกษตร กำแพงแสน',
    year: 'ชั้นปีที่ 1',
    studentId: '6820103778',
    email: 'pitipat.k@ku.th',
    bio: 'ชอบเล่นเกม Valorant / Minecraft หาเพื่อนคุยเพื่อนเล่นเกม หรือหาคนไปเดินเล่นรอบ ม.',
    tags: ['#เกษตรKPS', '#Valorant', '#Minecraft', '#ฟังเพลงอินดี้', '#เด็กหอ'],
    photos: [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=800'
    ]
  });
// --- ดึงข้อมูลโปรไฟล์จาก Supabase เมื่อเปิดหน้า ---
  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (data) {
      setMyProfile({
        name: data.full_name || 'นิสิต KU KPS',
        faculty: data.faculty || 'คณะเกษตร กำแพงแสน',
        year: data.year || 'ชั้นปีที่ 1',
        studentId: data.student_id || session.user.email?.split('@')[0] || '',
        email: session.user.email || '',
        bio: data.bio || '',
        tags: data.tags || [],
        photos: data.photos && data.photos.length > 0 ? data.photos : myProfile.photos
      });
    }
  };

  // --- ฟังก์ชันบันทึกข้อมูลส่วนตัวลง Supabase Database ---
  const handleSaveProfile = async () => {
    if (!session?.user) return;
    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      full_name: myProfile.name,
      faculty: myProfile.faculty,
      year: myProfile.year,
      student_id: myProfile.studentId,
      bio: myProfile.bio,
      tags: myProfile.tags,
      photos: myProfile.photos,
      updated_at: new Date().toISOString()
    });

    if (error) {
      alert('บันทึกไม่สำเร็จ: ' + error.message);
    } else {
      alert('บันทึกข้อมูลเรียบร้อยแล้ว! ✨');
    }
  };

  // --- ฟังก์ชันอัปโหลดรูปภาพขึ้น Supabase Storage (Bucket: avatars) ---
  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user) return;

    const fileExt = file.name.split('.').pop();
    const filePath = `${session.user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('อัปโหลดรูปภาพไม่สำเร็จ: ' + uploadError.message + '\n(อย่าลืมสร้าง Public Bucket ชื่อ avatars ใน Supabase)');
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const newPhotos = [...myProfile.photos, data.publicUrl];

    setMyProfile((prev) => ({ ...prev, photos: newPhotos }));

    await supabase.from('profiles').upsert({
      id: session.user.id,
      photos: newPhotos,
      updated_at: new Date().toISOString()
    });
  };
  const currentProfile = profiles[currentIndex];

  // Action Handlers
  const handleNextPhoto = (e: React.MouseEvent, maxPhotos: number) => {
    e.stopPropagation();
    if (photoIndex < maxPhotos - 1) {
      setPhotoIndex(photoIndex + 1);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photoIndex > 0) {
      setPhotoIndex(photoIndex - 1);
    }
  };

  const handleSwipe = (direction: 'pass' | 'like' | 'superlike') => {
    if (!currentProfile) return;

    setLastAction(direction);
    setPhotoIndex(0);

    if (direction === 'like' || direction === 'superlike') {
      // Simulate 50% match chance for demo
      if (Math.random() > 0.3 || direction === 'superlike') {
        setMatchedUser(currentProfile);
      }
    }

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setLastAction(null);
    }, 250);
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setPhotoIndex(0);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg = {
      id: Date.now().toString(),
      sender: 'me' as const,
      text: inputMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMsg('');

    // Auto reply simulation
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'them' as const,
          text: 'ไว้เจอกันที่ ม. น้าาา ✨🌱',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1200);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-900 font-sans p-0 sm:p-4 text-slate-100">
      {/* Container Frame mimicking mobile app or responsive dashboard */}
      <div className="w-full max-w-md h-[100vh] sm:h-[880px] bg-slate-950 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-800 relative">

        {/* --- TOP HEADER --- */}
        <header className="px-5 py-4 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 flex justify-between items-center z-20">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Flame className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-amber-400 via-orange-300 to-emerald-400 bg-clip-text text-transparent leading-none">
                Peanuts KU KPS
              </h1>
              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium mt-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400 inline" /> นิสิต ม.เกษตร กำแพงแสน
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white relative transition">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500"></span>
            </button>
          </div>
        </header>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 overflow-hidden relative flex flex-col bg-slate-950">

          {/* ================= TAB 1: DISCOVER / MATCHING CARD STACK ================= */}
          {activeTab === 'discover' && (
            <div className="flex-1 flex flex-col p-4 relative overflow-hidden">
              {currentProfile ? (
                <div className="relative flex-1 w-full flex flex-col justify-between">
                  
                  {/* Background Next Card Preview Effect */}
                  {profiles[currentIndex + 1] && (
                    <div className="absolute inset-0 bg-slate-900 rounded-3xl scale-95 translate-y-3 opacity-40 border border-slate-800 pointer-events-none"></div>
                  )}

                  {/* Active Card */}
                  <div className={`relative flex-1 w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 flex flex-col transition-all duration-300 ${
                    lastAction === 'like' ? 'translate-x-32 rotate-12 opacity-0' :
                    lastAction === 'pass' ? '-translate-x-32 -rotate-12 opacity-0' :
                    lastAction === 'superlike' ? '-translate-y-32 scale-95 opacity-0' : ''
                  }`}>

                    {/* Image Carousel */}
                    <div className="relative flex-1 bg-slate-800 overflow-hidden group">
                      <img 
                        src={currentProfile.photos[photoIndex]} 
                        alt={currentProfile.name}
                        className="w-full h-full object-cover select-none"
                      />

                      {/* Photo Navigation Overlay (Left / Right Touch Zones) */}
                      <div className="absolute inset-0 flex justify-between z-10">
                        <div 
                          className="w-1/2 h-full cursor-pointer flex items-center justify-start pl-2"
                          onClick={(e) => handlePrevPhoto(e)}
                        >
                          {photoIndex > 0 && (
                            <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition">
                              <ChevronLeft className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div 
                          className="w-1/2 h-full cursor-pointer flex items-center justify-end pr-2"
                          onClick={(e) => handleNextPhoto(e, currentProfile.photos.length)}
                        >
                          {photoIndex < currentProfile.photos.length - 1 && (
                            <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition">
                              <ChevronRight className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Photo Index Bar */}
                      <div className="absolute top-3 inset-x-4 flex gap-1.5 z-20">
                        {currentProfile.photos.map((_, i) => (
                          <div 
                            key={i} 
                            className={`h-1 flex-1 rounded-full transition-all ${
                              i === photoIndex ? 'bg-white shadow-md' : 'bg-white/30 backdrop-blur-sm'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Top Verified Pill */}
                      <div className="absolute top-7 left-4 z-20">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                          <CheckCircle className="w-3.5 h-3.5" /> ยืนยันนิสิต @ku.th
                        </span>
                      </div>

                      {/* Gradient Info Gradient Bottom */}
                      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent z-10 pointer-events-none" />

                      {/* Card Content Layer */}
                      <div className="absolute bottom-0 inset-x-0 p-5 z-20 flex flex-col gap-3">
                        {/* Name & Age */}
                        <div>
                          <div className="flex items-baseline gap-2">
                            <h2 className="text-2xl font-black text-white tracking-tight">{currentProfile.name}</h2>
                            <span className="text-xl font-medium text-slate-300">{currentProfile.age}</span>
                          </div>

                          <div className="flex items-center gap-2 text-xs font-medium text-emerald-300 mt-1">
                            <GraduationCap className="w-4 h-4 text-emerald-400" />
                            <span>{currentProfile.faculty} • {currentProfile.year}</span>
                          </div>
                        </div>

                        {/* Bio */}
                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                          {currentProfile.bio}
                        </p>

                        {/* Lifestyle Tags */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {currentProfile.tags.map((tag, idx) => (
                            <span 
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-slate-800/80 backdrop-blur-md border border-slate-700/60 text-[11px] text-amber-300 font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Prompts Preview */}
                        {currentProfile.prompts[0] && (
                          <div className="mt-1 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
                              💬 {currentProfile.prompts[0].q}
                            </span>
                            <span className="text-slate-200 mt-0.5 block font-medium">
                              "{currentProfile.prompts[0].a}"
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* BOTTOM ACTION BUTTONS DECK */}
                  <div className="pt-4 pb-2 flex justify-center items-center gap-4 z-30">
                    {/* UNDO BUTTON */}
                    <button 
                      onClick={handleUndo}
                      disabled={currentIndex === 0}
                      className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-amber-400 flex items-center justify-center hover:scale-110 active:scale-95 disabled:opacity-30 disabled:scale-100 transition shadow-lg"
                      title="ย้อนกลับ"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>

                    {/* PASS BUTTON */}
                    <button 
                      onClick={() => handleSwipe('pass')}
                      className="w-14 h-14 rounded-full bg-slate-900 border border-rose-500/30 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white hover:border-rose-500 hover:scale-110 active:scale-95 transition shadow-lg shadow-rose-500/10"
                      title="ข้าม (Pass)"
                    >
                      <X className="w-7 h-7 stroke-[2.5]" />
                    </button>

                    {/* SUPER LIKE BUTTON */}
                    <button 
                      onClick={() => handleSwipe('superlike')}
                      className="w-12 h-12 rounded-full bg-slate-900 border border-sky-500/30 text-sky-400 flex items-center justify-center hover:bg-sky-500 hover:text-white hover:border-sky-500 hover:scale-110 active:scale-95 transition shadow-lg shadow-sky-500/10"
                      title="Super Like"
                    >
                      <Star className="w-5 h-5 fill-sky-400 hover:fill-white" />
                    </button>

                    {/* LIKE BUTTON */}
                    <button 
                      onClick={() => handleSwipe('like')}
                      className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center hover:scale-110 active:scale-95 transition shadow-lg shadow-emerald-500/30"
                      title="ถูกใจ (Like)"
                    >
                      <Heart className="w-7 h-7 fill-slate-950 stroke-[2.5]" />
                    </button>
                  </div>

                </div>
              ) : (
                /* EMPTY STATE */
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-900/50 rounded-3xl border border-slate-800">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">หมดการ์ดโปรไฟล์แล้ว!</h3>
                  <p className="text-xs text-slate-400 max-w-xs mb-6">
                    คุณได้เรียกดูโปรไฟล์นิสิต KU KPS ทั้งหมดในขณะนี้แล้ว ลองกลับมาใหม่ทีหลังหรือรีเซ็ตการ์ด
                  </p>
                  <button 
                    onClick={() => { setCurrentIndex(0); setPhotoIndex(0); }}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs hover:opacity-90 transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" /> เริ่มใหม่อีกครั้ง
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: MATCHES & CHATS LIST ================= */}
          {activeTab === 'matches' && (
            <div className="flex-1 flex flex-col h-full bg-slate-950">
              {activeChat ? (
                /* CHAT INTERFACE */
                <div className="flex-1 flex flex-col h-full bg-slate-900">
                  {/* Chat Header */}
                  <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setActiveChat(null)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <img 
                        src={activeChat.avatar} 
                        alt={activeChat.name}
                        className="w-10 h-10 rounded-full object-cover border border-emerald-500/40" 
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-1">
                          {activeChat.name}
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                        </h4>
                        <p className="text-[10px] text-slate-400">{activeChat.faculty}</p>
                      </div>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-white">
                      <Info className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Messages Scroll Area */}
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                    <div className="text-center my-2">
                      <span className="px-3 py-1 rounded-full bg-slate-800 text-[10px] text-slate-400">
                        คุณและ {activeChat.name} แมตช์กันเมื่อวานนี้ 🎉
                      </span>
                    </div>

                    {messages.map((m) => (
                      <div 
                        key={m.id} 
                        className={`flex flex-col max-w-[75%] ${m.sender === 'me' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                      >
                        <div className={`px-4 py-2.5 rounded-2xl text-xs ${
                          m.sender === 'me' 
                            ? 'bg-emerald-500 text-slate-950 font-medium rounded-br-xs' 
                            : 'bg-slate-800 text-slate-100 rounded-bl-xs border border-slate-700/50'
                        }`}>
                          {m.text}
                        </div>
                        <span className="text-[9px] text-slate-500 mt-1 px-1">{m.time}</span>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input Bar */}
                  <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
                    <input 
                      type="text" 
                      placeholder={`พิมพ์ข้อความถึง ${activeChat.name}...`}
                      value={inputMsg}
                      onChange={(e) => setInputMsg(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-full px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button 
                      type="submit" 
                      className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center hover:opacity-90 transition"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              ) : (
                /* MATCHES & CHAT LIST OVERVIEW */
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
                  {/* New Matches Row */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Matches ใหม่ของคุณ (New Matches)
                    </h3>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                      {MOCK_PROFILES.slice(0, 3).map((item) => (
                        <div 
                          key={item.id}
                          className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0 group"
                          onClick={() => setActiveChat({ id: item.id, name: item.name, faculty: item.faculty, avatar: item.photos[0] })}
                        >
                          <div className="relative">
                            <img 
                              src={item.photos[0]} 
                              alt={item.name}
                              className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 group-hover:scale-105 transition"
                            />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-bold border-2 border-slate-950">
                              ⚡
                            </div>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-200">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active Conversations */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      แชทข้อความ (Conversations)
                    </h3>
                    <div className="flex flex-col gap-2">
                      {MOCK_MATCHES.map((chat) => (
                        <div 
                          key={chat.id}
                          onClick={() => setActiveChat(chat)}
                          className="p-3 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-emerald-500/40 cursor-pointer flex items-center justify-between transition group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img 
                                src={chat.avatar} 
                                alt={chat.name}
                                className="w-12 h-12 rounded-xl object-cover" 
                              />
                              {chat.online && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition">{chat.name}</h4>
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">{chat.faculty}</span>
                              </div>
                              <p className={`text-xs mt-1 line-clamp-1 ${chat.unread ? 'text-slate-100 font-semibold' : 'text-slate-400'}`}>
                                {chat.lastMessage}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[9px] text-slate-500">{chat.time}</span>
                            {chat.unread && (
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: USER PROFILE & EDIT SETTINGS ================= */}
          {activeTab === 'profile' && (
            <div className="flex-1 overflow-y-auto p-4 bg-slate-950 flex flex-col gap-5">
              
              {/* Profile Card Header */}
              <div className="relative p-5 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex flex-col items-center text-center overflow-hidden">
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> ยืนยันแล้ว
                  </span>
                </div>

                <div className="relative mb-3 group">
                  <img 
                    src={myProfile.photos[0]} 
                    alt={myProfile.name} 
                    className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500/40 shadow-xl"
                  />
                  <button className="absolute bottom-0 right-0 p-2 rounded-full bg-emerald-500 text-slate-950 shadow-md hover:scale-110 transition">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <h2 className="text-lg font-bold text-white">{myProfile.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{myProfile.faculty} • {myProfile.year}</p>
                <p className="text-[11px] text-emerald-400 font-mono mt-1">ID: {myProfile.studentId} ({myProfile.email})</p>
              </div>

              {/* Photo Upload Grid */}
              <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Image className="w-4 h-4 text-emerald-400" /> รูปโปรไฟล์ของคุณ (สูงสุด 6 รูป)
                  </h3>
                  <span className="text-[10px] text-slate-500">ลากเพื่อเรียงลำดับ</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {myProfile.photos.map((url, idx) => (
                    <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-slate-700 group">
                      <img src={url} alt="profile" className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-emerald-500 text-[8px] font-bold text-slate-950">
                          หลัก
                        </span>
                      )}
                      <button className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

{/* Add Photo Slot */}
{Array.from({ length: 6 - myProfile.photos.length }).map((_, idx) => (
  <label 
    key={idx} 
    className="aspect-[3/4] rounded-xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600 hover:border-emerald-500/50 hover:text-emerald-400 cursor-pointer transition relative"
  >
    <input 
      type="file" 
      accept="image/*" 
      onChange={handleUploadPhoto} 
      className="hidden" 
    />
    <Plus className="w-6 h-6" />
    <span className="text-[9px] mt-1">เพิ่มรูป</span>
  </label>
))}
                </div>
              </div>

              {/* Profile Details Form */}
              <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-emerald-400" /> แก้ไขข้อมูลส่วนตัว
                </h3>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">ชื่อที่แสดง (Display Name)</label>
                  <input 
                    type="text" 
                    value={myProfile.name}
                    onChange={(e) => setMyProfile({ ...myProfile, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">ประวัติย่อ / Bio</label>
                  <textarea 
                    rows={3}
                    value={myProfile.bio}
                    onChange={(e) => setMyProfile({ ...myProfile, bio: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">แท็กไลฟ์สไตล์ (Lifestyle Tags)</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {myProfile.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-[10px] text-emerald-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:opacity-90 transition">
                  บันทึกการเปลี่ยนแปลง
                </button>
              </div>

              {/* Settings / Logout */}
              <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                <button className="w-full py-2.5 px-3 rounded-xl hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center justify-between transition">
                  <span className="flex items-center gap-2"><Settings className="w-4 h-4 text-slate-400" /> ตั้งค่าการค้นหาและแมตช์</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
               <button 
  onClick={async () => {
    await supabase.auth.signOut();
  }}
  className="w-full py-2.5 px-3 rounded-xl hover:bg-rose-500/10 text-rose-400 text-xs font-medium flex items-center gap-2 transition"
>
  <LogOut className="w-4 h-4" /> ออกจากระบบ
</button>
              </div>

            </div>
          )}

        </main>

        {/* --- BOTTOM NAVIGATION BAR --- */}
        <nav className="h-16 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 grid grid-cols-3 items-center z-20">
          <button 
            onClick={() => { setActiveTab('discover'); setActiveChat(null); }}
            className={`flex flex-col items-center justify-center gap-1 h-full transition ${
              activeTab === 'discover' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Flame className={`w-5 h-5 ${activeTab === 'discover' ? 'fill-emerald-400/20' : ''}`} />
            <span className="text-[10px]">ค้นหา</span>
          </button>

          <button 
            onClick={() => setActiveTab('matches')}
            className={`flex flex-col items-center justify-center gap-1 h-full relative transition ${
              activeTab === 'matches' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className="relative">
              <MessageCircle className={`w-5 h-5 ${activeTab === 'matches' ? 'fill-emerald-400/20' : ''}`} />
              <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-bold flex items-center justify-center">
                2
              </span>
            </div>
            <span className="text-[10px]">แชทคู่ Match</span>
          </button>

          <button 
            onClick={() => { setActiveTab('profile'); setActiveChat(null); }}
            className={`flex flex-col items-center justify-center gap-1 h-full transition ${
              activeTab === 'profile' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <User className={`w-5 h-5 ${activeTab === 'profile' ? 'fill-emerald-400/20' : ''}`} />
            <span className="text-[10px]">โปรไฟล์</span>
          </button>
        </nav>

        {/* --- IT'S A MATCH OVERLAY MODAL --- */}
        {matchedUser && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Sparkles className="w-10 h-10 animate-bounce" />
            </div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent mb-1">
              IT'S A MATCH!
            </h2>
            <p className="text-xs text-slate-300 mb-6">
              คุณและ <span className="text-emerald-400 font-bold">{matchedUser.name}</span> ต่างถูกใจซึ่งกันและกัน 🎉
            </p>

            <div className="flex items-center gap-4 mb-8">
              <img src={myProfile.photos[0]} alt="me" className="w-20 h-20 rounded-full border-4 border-emerald-500 object-cover shadow-xl" />
              <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-lg">💚</div>
              <img src={matchedUser.photos[0]} alt="them" className="w-20 h-20 rounded-full border-4 border-emerald-500 object-cover shadow-xl" />
            </div>

            <div className="w-full flex flex-col gap-3">
              <button 
                onClick={() => {
                  setActiveChat({ id: matchedUser.id, name: matchedUser.name, faculty: matchedUser.faculty, avatar: matchedUser.photos[0] });
                  setActiveTab('matches');
                  setMatchedUser(null);
                }}
                className="w-full py-3 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs hover:opacity-90 transition shadow-lg shadow-emerald-500/20"
              >
                ส่งข้อความเลยทันที
              </button>
              <button 
                onClick={() => setMatchedUser(null)}
                className="w-full py-3 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-semibold text-xs hover:text-white transition"
              >
                ไว้ทีหลัง ค้นหาต่อ
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
