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

const KU_FACULTIES = [
  'คณะเกษตร กำแพงแสน',
  'คณะวิศวกรรมศาสตร์ กำแพงแสน',
  'คณะวิทยาศาสตร์การกีฬา',
  'คณะศึกษาศาสตร์และวิทยาศาสตร์',
  'คณะศิลปศาสตร์และวิทยาศาสตร์',
  'คณะอุตสาหกรรมบริการ',
  'คณะประมง (กำแพงแสน)',
  'คณะสัตวแพทยศาสตร์ (กำแพงแสน)'
  'ไม่ระบุ',
];

const YEARS = ['ชั้นปีที่ 1', 'ชั้นปีที่ 2', 'ชั้นปีที่ 3', 'ชั้นปีที่ 4', 'บัณฑิตศึกษา (ป.โท/เอก)'];
const GENDERS = ['ชาย', 'หญิง', 'LGBTQ+ / ไม่จำกัดเพศ', 'ไม่ระบุ'];

export default function PeanutsMain({ session }: { session?: any }) {
  const [activeTab, setActiveTab] = useState<'discover' | 'matches' | 'profile'>('discover');
  
  // Discover State
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [matchedUser, setMatchedUser] = useState<any | null>(null);

  // Real Matches State
  const [realMatches, setRealMatches] = useState<any[]>([]);

  // Chat State
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<Array<{ id: string; sender: 'me' | 'them'; text: string; time: string }>>([]);
  const [inputMsg, setInputMsg] = useState('');

  // User Profile State
  const [myProfile, setMyProfile] = useState({
    name: 'นิสิต KU KPS',
    faculty: 'คณะเกษตร กำแพงแสน',
    year: 'ชั้นปีที่ 1',
    gender: 'ชาย',
    studentId: '',
    email: session?.user?.email || '',
    bio: '',
    tags: ['#เกษตรKPS'],
    photos: ['https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=800']
  });

  // --- 1. โหลดโปรไฟล์ การ์ดค้นหา และรายการ Match ---
  useEffect(() => {
    if (session?.user) {
      fetchProfile();
      fetchDiscoverProfiles();
      fetchRealMatches();
    }
  }, [session]);

  // --- 2. ระบบดึงแชทสด & Supabase Realtime Subscription ---
  useEffect(() => {
    if (!activeChat || !session?.user) return;

    fetchMessages(activeChat.id);

    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new;
          if (
            (newMsg.sender_id === session.user.id && newMsg.receiver_id === activeChat.id) ||
            (newMsg.sender_id === activeChat.id && newMsg.receiver_id === session.user.id)
          ) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id.toString())) return prev;
              return [
                ...prev,
                {
                  id: newMsg.id.toString(),
                  sender: newMsg.sender_id === session.user.id ? 'me' : 'them',
                  text: newMsg.content,
                  time: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChat, session]);

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

  // --- ฟังก์ชันดึงการ์ดแบบรองรับการวนคนที่กด Pass กลับมาเมื่อการ์ดหมด ---
  const fetchDiscoverProfiles = async () => {
    if (!session?.user) return;
    try {
      // 1. ดึงการปัดทั้งหมดของคุณ (แยกแยะระหว่าง Like กับ Pass)
      const { data: allSwiped } = await supabase
        .from('likes')
        .select('to_user_id, action')
        .eq('from_user_id', session.user.id);

      const likedIds = allSwiped 
        ? allSwiped.filter((s) => s.action === 'like' || s.action === 'superlike').map((s) => s.to_user_id) 
        : [];
      
      const allSwipedIds = allSwiped ? allSwiped.map((s) => s.to_user_id) : [];

      // 2. ดึงโปรไฟล์นิสิตคนอื่นที่บันทึกข้อมูลเรียบร้อยแล้ว
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', session.user.id)
        .not('full_name', 'is', null);

      if (data) {
        // รอบแรก: ดึงเฉพาะคนที่ "ยังไม่เคยถูกปัดเลย" (ไม่เคยทั้ง Like และ Pass)
        let filtered = data.filter((p) => !allSwipedIds.includes(p.id));

        // ถ้านิสิตใหม่หมดแล้ว: นำคนที่เคยปัด Pass วนกลับมาแสดงใหม่ (ยกเว้นคนที่กด Like/Superlike ไว้แล้ว)
        if (filtered.length === 0) {
          filtered = data.filter((p) => !likedIds.includes(p.id));
        }

        const realProfiles = filtered.map((p) => ({
          id: p.id,
          name: p.full_name || 'นิสิต KU KPS',
          age: 20,
          studentId: p.student_id || '',
          faculty: p.faculty || 'ม.เกษตร กำแพงแสน',
          year: p.year || 'ชั้นปีที่ 1',
          gender: p.gender || 'ไม่ระบุ',
          verified: true,
          bio: p.bio || 'ยังไม่มีประวัติย่อ',
          photos: p.photos && p.photos.length > 0 
            ? p.photos 
            : ['https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=800'],
          tags: p.tags && p.tags.length > 0 ? p.tags : ['#KUKPS', '#นิสิตเกษตร']
        }));

        setProfiles(realProfiles);
        setCurrentIndex(0);
      }
    } catch (e) {
      console.log('Error fetching discover profiles:', e);
    }
  };

  const fetchRealMatches = async () => {
    if (!session?.user) return;
    try {
      const { data: matchesData } = await supabase
        .from('matches')
        .select('*')
        .or(`user_1.eq.${session.user.id},user_2.eq.${session.user.id}`);

      if (matchesData && matchesData.length > 0) {
        const partnerIds = matchesData.map((m) =>
          m.user_1 === session.user.id ? m.user_2 : m.user_1
        );

        const { data: partnersProfile } = await supabase
          .from('profiles')
          .select('*')
          .in('id', partnerIds);

        if (partnersProfile) {
          const list = partnersProfile.map((p) => ({
            id: p.id,
            name: p.full_name || 'นิสิต KU KPS',
            faculty: p.faculty || 'ม.เกษตร',
            avatar: p.photos && p.photos.length > 0 ? p.photos[0] : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=800',
            lastMessage: 'กดเพื่อเปิดห้องแชทสด 💬',
            time: 'ตอนนี้'
          }));
          setRealMatches(list);
        }
      } else {
        setRealMatches([]);
      }
    } catch (e) {
      console.log('Error fetching matches:', e);
    }
  };

  const fetchMessages = async (partnerId: string) => {
    if (!session?.user) return;
    const myId = session.user.id;

    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${myId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${myId})`)
      .order('created_at', { ascending: true });

    if (data) {
      const formatted = data.map((m) => ({
        id: m.id.toString(),
        sender: m.sender_id === myId ? ('me' as const) : ('them' as const),
        text: m.content,
        time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      setMessages(formatted);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !activeChat || !session?.user) return;

    const textToSend = inputMsg.trim();
    setInputMsg('');

    const { error } = await supabase.from('messages').insert({
      sender_id: session.user.id,
      receiver_id: activeChat.id,
      content: textToSend
    });

    if (error) {
      alert('ส่งข้อความไม่สำเร็จ: ' + error.message);
    }
  };

  const handleSwipe = async (direction: 'pass' | 'like' | 'superlike') => {
    if (!currentProfile || !session?.user) return;
    setLastAction(direction);
    setPhotoIndex(0);

    const myId = session.user.id;
    const targetId = currentProfile.id;

    await supabase.from('likes').upsert({
      from_user_id: myId,
      to_user_id: targetId,
      action: direction
    });

    if (direction === 'like' || direction === 'superlike') {
      const { data: mutualLike } = await supabase
        .from('likes')
        .select('*')
        .eq('from_user_id', targetId)
        .eq('to_user_id', myId)
        .in('action', ['like', 'superlike'])
        .maybeSingle();

      if (mutualLike) {
        await supabase.from('matches').insert({
          user_1: myId,
          user_2: targetId
        });

        setMatchedUser(currentProfile);
        fetchRealMatches();
      }
    }

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setLastAction(null);
    }, 250);
  };

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
      fetchDiscoverProfiles();
    }
  };

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
                        {currentProfile.photos.map((_: any, i: number) => (
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
                            <span className="text-sm font-medium text-amber-400">({currentProfile.gender})</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-medium text-emerald-300 mt-1">
                            <GraduationCap className="w-4 h-4 text-emerald-400" />
                            <span>{currentProfile.faculty} • {currentProfile.year}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{currentProfile.bio}</p>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {currentProfile.tags.map((tag: string, idx: number) => (
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
                    <button onClick={() => { setCurrentIndex(0); setPhotoIndex(0); }} className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-amber-400 flex items-center justify-center hover:scale-110 active:scale-95">
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
                  <h3 className="text-xl font-bold text-white mb-2">ยังไม่มีโปรไฟล์ใหม่ในขณะนี้</h3>
                  <p className="text-xs text-slate-400">กดปุ่มด้านล่างเพื่อเริ่มการค้นหาใหม่อีกครั้ง</p>
                  <button onClick={fetchDiscoverProfiles} className="mt-4 px-6 py-2.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs">
                    ค้นหาใหม่อีกครั้ง
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
                    {messages.length === 0 ? (
                      <div className="text-center text-slate-500 text-xs py-10">เริ่มส่งข้อความทักทายกับ {activeChat.name} ได้เลย! 👋</div>
                    ) : (
                      messages.map((m) => (
                        <div key={m.id} className={`flex flex-col max-w-[75%] ${m.sender === 'me' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                          <div className={`px-4 py-2.5 rounded-2xl text-xs ${m.sender === 'me' ? 'bg-emerald-500 text-slate-950 font-medium' : 'bg-slate-800 text-slate-100'}`}>
                            {m.text}
                          </div>
                          <span className="text-[9px] text-slate-500 mt-1">{m.time}</span>
                        </div>
                      ))
                    )}
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
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Matches ที่แมตช์กันจริง ({realMatches.length})</h3>
                    
                    {realMatches.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-slate-400 text-xs">
                        ยังไม่มีเพื่อนที่แมตช์ตรงกัน <br/>
                        <span className="text-[10px] text-slate-500 mt-1 block">เมื่อคุณและเพื่อนปัดขวา (Like) ตรงกัน รายชื่อจะแสดงขึ้นที่นี่</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {realMatches.map((chat) => (
                          <div key={chat.id} onClick={() => setActiveChat(chat)} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 cursor-pointer flex items-center justify-between transition">
                            <div className="flex items-center gap-3">
                              <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-xl object-cover border border-emerald-500/30" />
                              <div>
                                <h4 className="text-xs font-bold text-white">{chat.name}</h4>
                                <p className="text-[11px] text-slate-400">{chat.faculty}</p>
                                <p className="text-[10px] text-emerald-400 mt-0.5">{chat.lastMessage}</p>
                              </div>
                            </div>
                            <span className="text-[9px] text-slate-500">{chat.time}</span>
                          </div>
                        ))}
                      </div>
                    )}
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

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">ชื่อที่แสดง (Display Name)</label>
                  <input type="text" value={myProfile.name} onChange={(e) => setMyProfile({ ...myProfile, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" />
                </div>

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
          <button onClick={() => { setActiveTab('matches'); fetchRealMatches(); }} className={`flex flex-col items-center justify-center gap-1 h-full ${activeTab === 'matches' ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px]">แชทคู่ Match ({realMatches.length})</span>
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
