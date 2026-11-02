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

// รายชื่อคณะใน ม.เกษตรศาสตร์ วิทยาเขตกำแพงแสน
const KU_FACULTIES = [
  'คณะเกษตร กำแพงแสน',
  'คณะวิศวกรรมศาสตร์ กำแพงแสน',
  'คณะวิทยาศาสตร์การกีฬา',
  'คณะศึกษาศาสตร์และพัฒนศาสตร์',
  'คณะศิลปศาสตร์และวิทยาศาสตร์',
  'คณะอุตสาหกรรมบริการ',
  'คณะประมง กำแพงแสน',
  'คณะสัตวแพทยศาสตร์ (กำแพงแสน)'
];

const YEARS = ['ชั้นปีที่ 1', 'ชั้นปีที่ 2', 'ชั้นปีที่ 3', 'ชั้นปีที่ 4', 'บัณฑิตศึกษา (ป.โท/เอก)'];
const GENDERS = ['ชาย', 'หญิง', 'LGBTQ+ / ไม่จำกัดเพศ', 'ไม่ระบุ'];

// --- Mock Data for Discover Cards ---
const MOCK_PROFILES = [
  {
    id: '1',
    name: 'น้องแพรว',
    age: 20,
    studentId: '66xxxxx',
    faculty: 'คณะเกษตร กำแพงแสน',
    year: 'ชั้นปีที่ 2',
    gender: 'หญิง',
    verified: true,
    bio: 'สายคาเฟ่ ชอบถ่ายรูป ชอบเดินเล่นแปลงเกษตรตอนเย็น 🌾 หาเพื่อนกินชาบูหน้า ม.',
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800'
    ],
    tags: ['#ถ่ายรูป', '#ชาบูหน้าม', '#เดินเล่นแปลงวิจัย', '#CatLover', '#Valorant'],
    prompts: [
      { q: 'ร้านโปรดหน้า ม. ที่ต้องไปประจำ', a: 'ก๋วยเตี๋ยวเรือข้าง ม. กับ ร้านนมปังเย็น' }
    ]
  },
  {
    id: '2',
    name: 'พี่ภีม',
    age: 21,
    studentId: '65xxxxx',
    faculty: 'คณะวิศวกรรมศาสตร์ กำแพงแสน',
    year: 'ชั้นปีที่ 3',
    gender: 'ชาย',
    verified: true,
    bio: 'เด็กวิศวะเครื่องกล ชอบตีแบตกับเล่นเกมดึกๆ 🏸🎮 หาคนไปวิ่งสระน้ำมหาลัยด้วยกันครับ',
    photos: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800'
    ],
    tags: ['#วิศวะเครื่องกล', '#ตีแบต', '#วิ่งสระน้ำ', '#บอร์ดเกม'],
    prompts: [
      { q: 'ข้อดีของการมีฉันเป็นคู่ Match', a: 'พาไปกินของอร่อยยามดึกได้เสมอ' }
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
    { id: '2', sender: 'me', text: 'หวัดดีครับ! คณะเกษตรใช่ไหมครับ', time: '18:31' }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  // User Profile Settings State
  const [myProfile, setMyProfile] = useState({
    name: 'Unknown',
    faculty: 'Unknown',
    year: 'Unknown',
    gender: 'Unknown',
    studentId: 'Unknown',
    email: session?.user?.email || 'Unknown',
    bio: 'Unknown',
    tags: ['Unknown'],
    photos: [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=800'
    ]
  });

  // --- 1. ดึงข้อมูลโปรไฟล์จาก Supabase Database ---
  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
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
          gender: data.gender || 'ชาย',
          studentId: data.student_id || session.user.email?.split('@')[0] || '',
          email: session.user.email || '',
          bio: data.bio || '',
          tags: data.tags || [],
          photos: data.photos && data.photos.length > 0 ? data.photos : myProfile.photos
        });
      }
    } catch (e) {
      console.log('Error fetching profile:', e);
    }
  };

  // --- 2. บันทึกข้อมูลส่วนตัวลง Supabase ---
  const handleSaveProfile = async () => {
    if (!session?.user) return;
    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      full_name: myProfile.name,
      faculty: myProfile.faculty,
      year: myProfile.year,
      gender: myProfile.gender,
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

  // --- 3. อัปโหลดรูปภาพขึ้น Supabase Storage ---
  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user) return;

    const fileExt = file.name.split('.').pop();
    const filePath = `${session.user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('อัปโหลดรูปภาพไม่สำเร็จ: ' + uploadError.message);
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

  // --- 4. ลบรูปภาพโปรไฟล์ ---
  const handleDeletePhoto = async (indexToDelete: number) => {
    const updatedPhotos = myProfile.photos.filter((_, idx) => idx !== indexToDelete);
    setMyProfile((prev) => ({ ...prev, photos: updatedPhotos }));

    if (session?.user) {
      await supabase.from('profiles').upsert({
        id: session.user.id,
        photos: updatedPhotos,
        updated_at: new Date().toISOString()
      });
    }
  };

  const currentProfile = profiles[currentIndex];

  const handleNextPhoto = (e: React.MouseEvent, maxPhotos: number) => {
    e.stopPropagation();
    if (photoIndex < maxPhotos - 1) setPhotoIndex(photoIndex + 1);
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photoIndex > 0) setPhotoIndex(photoIndex - 1);
  };

  const handleSwipe = (direction: 'pass' | 'like' | 'superlike') => {
    if (!currentProfile) return;
    setLastAction(direction);
    setPhotoIndex(0);

    if (direction === 'like' || direction === 'superlike') {
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
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-900 font-sans p-0 sm:p-4 text-slate-100">
      <div className="w-full max-w-md h-[100vh] sm:h-[880px] bg-slate-950 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-800 relative">

        {/* TOP HEADER */}
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

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-hidden relative flex flex-col bg-slate-950">

          {/* TAB 1: DISCOVER */}
          {activeTab === 'discover' && (
            <div className="flex-1 flex flex-col p-4 relative overflow-hidden">
              {currentProfile ? (
                <div className="relative flex-1 w-full flex flex-col justify-between">
                  <div className={`relative flex-1 w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 flex flex-col transition-all duration-300 ${
                    lastAction === 'like' ? 'translate-x-32 rotate-12 opacity-0' :
                    lastAction === 'pass' ? '-translate-x-32 -rotate-12 opacity-0' :
                    lastAction === 'superlike' ? '-translate-y-32 scale-95 opacity-0' : ''
                  }`}>

                    <div className="relative flex-1 bg-slate-800 overflow-hidden group">
                      <img 
                        src={currentProfile.photos[photoIndex]} 
                        alt={currentProfile.name}
                        className="w-full h-full object-cover select-none"
                      />

                      <div className="absolute inset-0 flex justify-between z-10">
                        <div className="w-1/2 h-full cursor-pointer flex items-center justify-start pl-2" onClick={(e) => handlePrevPhoto(e)}>
                          {photoIndex > 0 && (
                            <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white">
                              <ChevronLeft className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="w-1/2 h-full cursor-pointer flex items-center justify-end pr-2" onClick={(e) => handleNextPhoto(e, currentProfile.photos.length)}>
                          {photoIndex < currentProfile.photos.length - 1 && (
                            <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white">
                              <ChevronRight className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="absolute top-3 inset-x-4 flex gap-1.5 z-20">
                        {currentProfile.photos.map((_, i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i === photoIndex ? 'bg-white shadow-md' : 'bg-white/30'}`} />
                        ))}
                      </div>

                      <div className="absolute top-7 left-4 z-20">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                          <CheckCircle className="w-3.5 h-3.5" /> ยืนยันนิสิต @ku.th
                        </span>
                      </div>

                      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent z-10 pointer-events-none" />

                      <div className="absolute bottom-0 inset-x-0 p-5 z-20 flex flex-col gap-3">
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

                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{currentProfile.bio}</p>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {currentProfile.tags.map((tag, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] text-amber-300 font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* BUTTONS */}
                  <div className="pt-4 pb-2 flex justify-center items-center gap-4 z-30">
                    <button onClick={handleUndo} disabled={currentIndex === 0} className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-amber-400 flex items-center justify-center hover:scale-110 active:scale-95 disabled:opacity-30">
                      <RotateCcw className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleSwipe('pass')} className="w-14 h-14 rounded-full bg-slate-900 border border-rose-500/30 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white hover:scale-110 active:scale-95">
                      <X className="w-7 h-7 stroke-[2.5]" />
                    </button>
                    <button onClick={() => handleSwipe('superlike')} className="w-12 h-12 rounded-full bg-slate-900 border border-sky-500/30 text-sky-400 flex items-center justify-center hover:bg-sky-500 hover:text-white hover:scale-110 active:scale-95">
                      <Star className="w-5 h-5 fill-sky-400 hover:fill-white" />
                    </button>
                    <button onClick={() => handleSwipe('like')} className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center hover:scale-110 active:scale-95">
                      <Heart className="w-7 h-7 fill-slate-950 stroke-[2.5]" />
                    </button>
                  </div>

                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-900/50 rounded-3xl border border-slate-800">
                  <Sparkles className="w-8 h-8 text-amber-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">หมดการ์ดโปรไฟล์แล้ว!</h3>
                  <button onClick={() => { setCurrentIndex(0); setPhotoIndex(0); }} className="mt-4 px-6 py-2.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs">
                    เริ่มใหม่อีกครั้ง
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MATCHES */}
          {activeTab === 'matches' && (
            <div className="flex-1 flex flex-col h-full bg-slate-950">
              {activeChat ? (
                <div className="flex-1 flex flex-col h-full bg-slate-900">
                  <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setActiveChat(null)} className="p-1 text-slate-400 hover:text-white">
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <img src={activeChat.avatar} alt={activeChat.name} className="w-10 h-10 rounded-full object-cover border border-emerald-500/40" />
                      <div>
                        <h4 className="text-sm font-bold text-white">{activeChat.name}</h4>
                        <p className="text-[10px] text-slate-400">{activeChat.faculty}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                    {messages.map((m) => (
                      <div key={m.id} className={`flex flex-col max-w-[75%] ${m.sender === 'me' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-xs ${m.sender === 'me' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-100'}`}>
                          {m.text}
                        </div>
                        <span className="text-[9px] text-slate-500 mt-1">{m.time}</span>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
                    <input type="text" placeholder="พิมพ์ข้อความ..." value={inputMsg} onChange={(e) => setInputMsg(e.target.value)} className="flex-1 bg-slate-900 border border-slate-800 rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" />
                    <button type="submit" className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Matches ใหม่ของคุณ</h3>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {MOCK_PROFILES.map((item) => (
                        <div key={item.id} className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0" onClick={() => setActiveChat({ id: item.id, name: item.name, faculty: item.faculty, avatar: item.photos[0] })}>
                          <img src={item.photos[0]} alt={item.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500" />
                          <span className="text-[11px] font-semibold text-slate-200">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">แชทข้อความ</h3>
                    {MOCK_MATCHES.map((chat) => (
                      <div key={chat.id} onClick={() => setActiveChat(chat)} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 cursor-pointer flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-xl object-cover" />
                          <div>
                            <h4 className="text-xs font-bold text-white">{chat.name}</h4>
                            <p className="text-xs text-slate-400">{chat.lastMessage}</p>
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-500">{chat.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROFILE */}
          {activeTab === 'profile' && (
            <div className="flex-1 overflow-y-auto p-4 bg-slate-950 flex flex-col gap-5">
              <div className="relative p-5 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex flex-col items-center text-center">
                <div className="relative mb-3">
                  <img src={myProfile.photos[0] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=800'} alt={myProfile.name} className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500/40 shadow-xl" />
                </div>
                <h2 className="text-lg font-bold text-white">{myProfile.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{myProfile.faculty} • {myProfile.year}</p>
                <p className="text-[11px] text-emerald-400 font-mono mt-1">{myProfile.email}</p>
              </div>

              {/* UPLOAD & DELETE PHOTOS */}
              <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Image className="w-4 h-4 text-emerald-400" /> รูปโปรไฟล์ของคุณ (สูงสุด 6 รูป)
                </h3>

                <div className="grid grid-cols-3 gap-2">
                  {myProfile.photos.map((url, idx) => (
                    <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-slate-700">
                      <img src={url} alt="profile" className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-emerald-500 text-[8px] font-bold text-slate-950">
                          หลัก
                        </span>
                      )}
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto(idx);
                        }}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-slate-950/80 text-rose-400 hover:bg-rose-500 hover:text-white flex items-center justify-center z-10 transition shadow"
                        title="ลบรูปนี้"
                      >
                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  ))}

                  {Array.from({ length: 6 - myProfile.photos.length }).map((_, idx) => (
                    <label key={idx} className="aspect-[3/4] rounded-xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600 hover:border-emerald-500/50 hover:text-emerald-400 cursor-pointer transition relative">
                      <input type="file" accept="image/*" onChange={handleUploadPhoto} className="hidden" />
                      <Plus className="w-6 h-6" />
                      <span className="text-[9px] mt-1">เพิ่มรูป</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* EDIT FORM */}
              <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-emerald-400" /> แก้ไขข้อมูลส่วนตัว
                </h3>

                {/* ชื่อที่แสดง */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">ชื่อที่แสดง (Display Name)</label>
                  <input type="text" value={myProfile.name} onChange={(e) => setMyProfile({ ...myProfile, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" />
                </div>

                {/* คณะ */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">คณะ (KU KPS)</label>
                  <select 
                    value={myProfile.faculty} 
                    onChange={(e) => setMyProfile({ ...myProfile, faculty: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {KU_FACULTIES.map((fac, idx) => (
                      <option key={idx} value={fac}>{fac}</option>
                    ))}
                  </select>
                </div>

                {/* ชั้นปี & เพศ */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">ชั้นปี</label>
                    <select 
                      value={myProfile.year} 
                      onChange={(e) => setMyProfile({ ...myProfile, year: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      {YEARS.map((yr, idx) => (
                        <option key={idx} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">เพศ</label>
                    <select 
                      value={myProfile.gender} 
                      onChange={(e) => setMyProfile({ ...myProfile, gender: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      {GENDERS.map((g, idx) => (
                        <option key={idx} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ประวัติย่อ */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">ประวัติย่อ / Bio</label>
                  <textarea rows={3} value={myProfile.bio} onChange={(e) => setMyProfile({ ...myProfile, bio: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none" />
                </div>

                <button onClick={handleSaveProfile} className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:opacity-90 active:scale-95 transition">
                  บันทึกการเปลี่ยนแปลง
                </button>
              </div>

              {/* LOGOUT */}
              <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800">
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

        {/* BOTTOM NAV */}
        <nav className="h-16 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 grid grid-cols-3 items-center z-20">
          <button onClick={() => { setActiveTab('discover'); setActiveChat(null); }} className={`flex flex-col items-center justify-center gap-1 h-full ${activeTab === 'discover' ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
            <Flame className="w-5 h-5" />
            <span className="text-[10px]">ค้นหา</span>
          </button>
          <button onClick={() => setActiveTab('matches')} className={`flex flex-col items-center justify-center gap-1 h-full ${activeTab === 'matches' ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px]">แชทคู่ Match</span>
          </button>
          <button onClick={() => { setActiveTab('profile'); setActiveChat(null); }} className={`flex flex-col items-center justify-center gap-1 h-full ${activeTab === 'profile' ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
            <User className="w-5 h-5" />
            <span className="text-[10px]">โปรไฟล์</span>
          </button>
        </nav>

        {/* MATCH MODAL */}
        {matchedUser && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center">
            <Sparkles className="w-10 h-10 text-emerald-400 mb-4 animate-bounce" />
            <h2 className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-amber-300 bg-clip-text text-transparent mb-1">
              IT'S A MATCH!
            </h2>
            <p className="text-xs text-slate-300 mb-6">คุณและ <span className="text-emerald-400 font-bold">{matchedUser.name}</span> ถูกใจซึ่งกันและกัน 🎉</p>
            <button onClick={() => setMatchedUser(null)} className="px-8 py-3 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs">
              ค้นหาต่อ
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
