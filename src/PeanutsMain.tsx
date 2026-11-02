import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Flame, Heart, X, MessageSquare, User, LogOut, Sparkles, Send, 
  ShieldCheck, ArrowLeft, Camera, Loader2, Mic, Square, Plus, Trash2, 
  ChevronLeft, ChevronRight, Info, CheckCircle2, AlertCircle
} from 'lucide-react';

const SUPABASE_URL = 'https://wvqdueookxtkposaeuuu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pEF2JfLNNVNSqP2EkWfLQA_07HIg3xu';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const KU_FACULTIES = [
  'ไม่ระบุ',
  'คณะเกษตร กำแพงแสน',
  'คณะวิศวกรรมศาสตร์ กำแพงแสน',
  'คณะวิทยาศาสตร์การกีฬาและการออกกำลังกาย',
  'คณะศึกษาศาสตร์และเวชศาสตร์การกีฬา',
  'คณะศิลปศาสตร์และวิทยาศาสตร์',
  'คณะอุตสาหกรรมบริการ',
  'คณะประมง (กำแพงแสน)',
  'คณะสัตวแพทยศาสตร์',
  'คณะสิ่งแวดล้อม'
];

export default function PeanutsMain({ session }: { session: any }) {
  const [tab, setTab] = useState<'discover' | 'matches' | 'profile'>('discover');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardPhotoIndex, setCardPhotoIndex] = useState(0);
  const [myProfile, setMyProfile] = useState<any>(null);
  
  // Modals
  const [selectedProfile, setSelectedProfile] = useState<any>(null); // ดูรูป/ประวัติแบบเต็ม
  const [matchedUser, setMatchedUser] = useState<any>(null); // It's a Match Modal!

  // Profile Form States
  const [displayName, setDisplayName] = useState('');
  const [faculty, setFaculty] = useState('ไม่ระบุ');
  const [year, setYear] = useState('ชั้นปีที่ 1');
  const [gender, setGender] = useState('หญิง');
  const [interestedIn, setInterestedIn] = useState('all'); // 'all' | 'ชาย' | 'หญิง'
  const [bio, setBio] = useState('');
  const [photos, setPhotos] = useState<string[]>(['', '', '']); // 3 รูป
  const [saving, setSaving] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  // Chat & Match States
  const [matches, setMatches] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session?.user) {
      loadMyProfile();
      fetchMatches();
    }
  }, [session]);

  // Realtime Chat Subscription (Strategy A: เปิดเมื่อเปิดห้องแชท & ปิดเมื่อออกจากห้อง)
  useEffect(() => {
    if (!activeChat || !session?.user) return;

    fetchMessages(activeChat.id);

    const channel = supabase
      .channel(`match_chat_${activeChat.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new as any;
          if (
            (newMsg.sender_id === session.user.id && newMsg.receiver_id === activeChat.id) ||
            (newMsg.sender_id === activeChat.id && newMsg.receiver_id === session.user.id)
          ) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id.toString())) return prev;
              return [...prev, newMsg];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChat, session]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // โหลดข้อมูลโปรไฟล์ของตนเอง
  const loadMyProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (data) {
      setMyProfile(data);
      setDisplayName(data.display_name || '');
      setFaculty(data.faculty || 'ไม่ระบุ');
      setYear(data.year || 'ชั้นปีที่ 1');
      setGender(data.gender || 'หญิง');
      setInterestedIn(data.interested_in || 'all');
      setBio(data.bio || '');
      
      let loadedPhotos = ['', '', ''];
      if (Array.isArray(data.photos) && data.photos.length > 0) {
        loadedPhotos = [data.photos[0] || '', data.photos[1] || '', data.photos[2] || ''];
      } else if (data.avatar_url) {
        loadedPhotos[0] = data.avatar_url;
      }
      setPhotos(loadedPhotos);
      fetchDiscoverProfiles(data.interested_in || 'all');
    } else {
      const defaultProfile = {
        id: session.user.id,
        display_name: 'นิสิตใหม่',
        faculty: 'ไม่ระบุ',
        year: 'ชั้นปีที่ 1',
        gender: 'หญิง',
        interested_in: 'all',
        bio: '',
        photos: []
      };
      await supabase.from('profiles').insert(defaultProfile);
      setMyProfile(defaultProfile);
      fetchDiscoverProfiles('all');
    }
  };

  // ดึงรายการโปรไฟล์ที่จะปัด (กรองเพศที่เลือก)
  const fetchDiscoverProfiles = async (targetGender: string) => {
    // ดึงรายชื่อคนที่เคยปัด Like/Pass ไปแล้วเพื่อไม่ให้ขึ้นซ้ำ
    const { data: myLikes } = await supabase
      .from('likes')
      .select('liked_user_id')
      .eq('user_id', session.user.id);

    const swipedIds = myLikes ? myLikes.map((l) => l.liked_user_id) : [];
    swipedIds.push(session.user.id); // รวม ID ตนเองด้วย

    let query = supabase
      .from('profiles')
      .select('*')
      .not('id', 'in', `(${swipedIds.join(',')})`);

    if (targetGender && targetGender !== 'all') {
      query = query.eq('gender', targetGender);
    }

    const { data } = await query;
    if (data) {
      setProfiles(data);
      setCurrentIndex(0);
      setCardPhotoIndex(0);
    }
  };

  // ดึงรายชื่อคู่ Match พร้อมข้อความล่าสุด
  const fetchMatches = async () => {
    const { data: myLikes } = await supabase
      .from('likes')
      .select('liked_user_id')
      .eq('user_id', session.user.id);

    if (!myLikes || myLikes.length === 0) {
      setMatches([]);
      return;
    }

    const likedIds = myLikes.map((l) => l.liked_user_id);

    const { data: mutualLikes } = await supabase
      .from('likes')
      .select('user_id')
      .eq('liked_user_id', session.user.id)
      .in('user_id', likedIds);

    if (mutualLikes && mutualLikes.length > 0) {
      const matchIds = mutualLikes.map((m) => m.user_id);
      const { data: matchedProfiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', matchIds);

      if (matchedProfiles) {
        // ดึงข้อความล่าสุดของแต่ละคู่
        const matchesWithLastMsg = await Promise.all(
          matchedProfiles.map(async (profile) => {
            const { data: lastMsg } = await supabase
              .from('messages')
              .select('*')
              .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${profile.id}),and(sender_id.eq.${profile.id},receiver_id.eq.${session.user.id})`)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            return {
              ...profile,
              lastMessage: lastMsg ? (lastMsg.content.startsWith('[VOICE]:') ? '🎙️ ข้อความเสียง' : lastMsg.content) : 'เริ่มส่งข้อความทักทายกันเลย!'
            };
          })
        );
        setMatches(matchesWithLastMsg);
      }
    } else {
      setMatches([]);
    }
  };

  // กด Like
  const handleLike = async () => {
    if (currentIndex >= profiles.length) return;
    const targetUser = profiles[currentIndex];

    await supabase.from('likes').insert({
      user_id: session.user.id,
      liked_user_id: targetUser.id
    });

    // ตรวจสอบว่าฝ่ายตรงข้ามเคยกด Like เราไว้หรือยัง (Match!)
    const { data: isMutual } = await supabase
      .from('likes')
      .select('*')
      .eq('user_id', targetUser.id)
      .eq('liked_user_id', session.user.id)
      .single();

    if (isMutual) {
      setMatchedUser(targetUser);
    }

    setCurrentIndex((prev) => prev + 1);
    setCardPhotoIndex(0);
    fetchMatches();
  };

  // กด Pass
  const handlePass = () => {
    setCurrentIndex((prev) => prev + 1);
    setCardPhotoIndex(0);
  };

  // ดึงประวัติข้อความแชท
  const fetchMessages = async (targetId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${targetId}),and(sender_id.eq.${targetId},receiver_id.eq.${session.user.id})`)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  // ส่งข้อความแชท
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeChat) return;

    const textToSend = chatInput.trim();
    setChatInput('');

    await supabase.from('messages').insert({
      sender_id: session.user.id,
      receiver_id: activeChat.id,
      content: textToSend
    });
  };

  // --- ระบบอัดและส่งข้อความเสียงในแชทคู่ Match (รองรับทั้ง iOS & Android) ---
  const getAudioConfig = () => {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isIOS || MediaRecorder.isTypeSupported('audio/mp4')) {
      return { mimeType: 'audio/mp4', ext: 'm4a', contentType: 'audio/mp4' };
    }
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      return { mimeType: 'audio/webm;codecs=opus', ext: 'webm', contentType: 'audio/webm' };
    }
    return { mimeType: 'audio/webm', ext: 'webm', contentType: 'audio/webm' };
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const { mimeType } = getAudioConfig();
      const options = mimeType ? { mimeType } : undefined;
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const { mimeType: configMime, ext, contentType } = getAudioConfig();
        const recordedType = mediaRecorder.mimeType || configMime;
        const audioBlob = new Blob(audioChunksRef.current, { type: recordedType });
        stream.getTracks().forEach((track) => track.stop());
        await uploadAndSendAudio(audioBlob, ext, contentType);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert('ไม่สามารถเข้าถึงไมโครโฟนได้ กรุณาอนุญาตการใช้งานไมค์ในบราวเซอร์');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadAndSendAudio = async (blob: Blob, ext: string, contentType: string) => {
    if (!activeChat) return;
    setUploadingAudio(true);
    const fileName = `${session.user.id}_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('audio-messages')
      .upload(fileName, blob, { contentType, upsert: true });

    if (uploadError) {
      alert('ส่งข้อความเสียงไม่สำเร็จ: ' + uploadError.message);
      setUploadingAudio(false);
      return;
    }

    const { data } = supabase.storage.from('audio-messages').getPublicUrl(fileName);

    await supabase.from('messages').insert({
      sender_id: session.user.id,
      receiver_id: activeChat.id,
      content: `[VOICE]:${data.publicUrl}`
    });

    setUploadingAudio(false);
  };

  // --- ระบบจัดการรูปโปรไฟล์หลายรูป (3 Slots) ---
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingSlot(slotIndex);

    const fileExt = file.name.split('.').pop();
    const fileName = `${session.user.id}_slot${slotIndex}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      alert('อัปโหลดรูปไม่สำเร็จ: ' + uploadError.message);
      setUploadingSlot(null);
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    const newPhotos = [...photos];
    newPhotos[slotIndex] = data.publicUrl;
    setPhotos(newPhotos);
    setUploadingSlot(null);
  };

  const handleRemovePhoto = (slotIndex: number) => {
    const newPhotos = [...photos];
    newPhotos[slotIndex] = '';
    setPhotos(newPhotos);
  };

  // บันทึกโปรไฟล์
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const validPhotos = photos.filter((p) => p.trim() !== '');

    const updatedData = {
      display_name: displayName,
      faculty,
      year,
      gender,
      interested_in: interestedIn,
      bio,
      photos: validPhotos,
      avatar_url: validPhotos[0] || ''
    };

    const { error } = await supabase
      .from('profiles')
      .update(updatedData)
      .eq('id', session.user.id);

    setSaving(false);

    if (error) {
      alert('บันทึกข้อมูลไม่สำเร็จ: ' + error.message);
    } else {
      alert('บันทึกการเปลี่ยนแปลงโปรไฟล์เรียบร้อยแล้ว!');
      setMyProfile({ ...myProfile, ...updatedData });
      fetchDiscoverProfiles(interestedIn);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-900 font-sans p-0 sm:p-4 text-slate-100">
      <div className="w-full max-w-md h-[100vh] sm:h-[880px] bg-slate-950 sm:rounded-3xl shadow-2xl flex flex-col justify-between overflow-hidden border border-slate-800 relative">
        
        {/* --- MODAL 1: IT'S A MATCH! --- */}
        {matchedUser && (
          <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 flex items-center justify-center shadow-xl shadow-rose-500/20 mb-4 animate-bounce">
              <Heart className="w-10 h-10 text-white fill-white" />
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
              It's a Match!
            </h1>
            <p className="text-xs text-slate-300 mt-2">
              คุณและ <span className="font-bold text-amber-400">{matchedUser.display_name}</span> ถูกใจซึ่งกันและกัน
            </p>

            <div className="flex items-center justify-center gap-4 my-8">
              <div className="w-20 h-20 rounded-2xl bg-slate-900 border-2 border-emerald-400 overflow-hidden shadow-lg">
                <img src={myProfile?.avatar_url || photos[0]} alt="" className="w-full h-full object-cover" />
              </div>
              <Flame className="w-6 h-6 text-amber-400 fill-amber-400 animate-pulse" />
              <div className="w-20 h-20 rounded-2xl bg-slate-900 border-2 border-rose-400 overflow-hidden shadow-lg">
                <img src={matchedUser.avatar_url || (matchedUser.photos && matchedUser.photos[0])} alt="" className="w-full h-full object-cover" />
              </div>
            </div>

            <button
              onClick={() => {
                setActiveChat(matchedUser);
                setMatchedUser(null);
                setTab('matches');
              }}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs rounded-xl hover:opacity-90 active:scale-95 transition shadow-lg shadow-emerald-500/20 mb-3"
            >
              ส่งข้อความทักทายเลย 💬
            </button>
            <button
              onClick={() => setMatchedUser(null)}
              className="text-xs text-slate-400 hover:text-white py-2"
            >
              ไว้ทีหลัง
            </button>
          </div>
        )}

        {/* --- MODAL 2: FULL PROFILE DETAIL --- */}
        {selectedProfile && (
          <div className="absolute inset-0 bg-slate-950/90 z-40 flex flex-col overflow-y-auto p-4 animate-in fade-in duration-200">
            <button 
              onClick={() => setSelectedProfile(null)}
              className="self-start text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-3"
            >
              <ArrowLeft className="w-4 h-4" /> ปิดหน้าต่าง
            </button>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex-1 flex flex-col">
              <div className="h-80 bg-slate-950 relative">
                <img 
                  src={selectedProfile.photos?.[0] || selectedProfile.avatar_url} 
                  alt="" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="p-5 space-y-3">
                <h2 className="text-xl font-bold text-white">{selectedProfile.display_name}</h2>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full">
                    {selectedProfile.faculty}
                  </span>
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full">
                    {selectedProfile.year}
                  </span>
                  <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full">
                    เพศ: {selectedProfile.gender}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-slate-400 mb-1">เกี่ยวกับฉัน</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedProfile.bio || 'ไม่ได้ระบุข้อความแนะนำตัว'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- ACTIVE MATCH CHAT VIEW --- */}
        {activeChat ? (
          <div className="flex-1 flex flex-col bg-slate-950">
            <header className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveChat(null)} className="p-1 text-slate-400 hover:text-white">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-9 h-9 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                  {activeChat.photos?.[0] || activeChat.avatar_url ? (
                    <img src={activeChat.photos?.[0] || activeChat.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-full h-full p-2 text-slate-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{activeChat.display_name}</h3>
                  <span className="text-[10px] text-amber-400">{activeChat.faculty}</span>
                </div>
              </div>
            </header>

            {/* Chat Message Stream */}
            <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 font-sans text-xs bg-slate-950">
              {messages.map((m) => {
                const isMe = m.sender_id === session.user.id;
                const isVoice = m.content.startsWith('[VOICE]:');
                const audioUrl = isVoice ? m.content.replace('[VOICE]:', '') : '';

                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs ${
                      isMe ? 'bg-emerald-500 text-slate-950 font-medium' : 'bg-slate-900 text-white border border-slate-800'
                    }`}>
                      {isVoice ? (
                        <audio controls preload="metadata" playsInline src={audioUrl} className="h-8 max-w-[210px] my-0.5" />
                      ) : (
                        <span className="break-all">{m.content}</span>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </main>

            {/* Chat Input & Voice Recorder Form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
              {isRecording ? (
                <div className="flex-1 flex items-center justify-between bg-rose-500/10 border border-rose-500/40 rounded-xl px-4 py-2 text-xs text-rose-400 animate-pulse">
                  <span>กำลังอัดเสียง...</span>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="flex items-center gap-1 bg-rose-500 text-white font-bold px-3 py-1 rounded-lg text-[11px] hover:bg-rose-600 transition"
                  >
                    <Square className="w-3.5 h-3.5 fill-white" /> หยุดและส่ง
                  </button>
                </div>
              ) : uploadingAudio ? (
                <div className="flex-1 flex items-center justify-center gap-2 bg-slate-950 border border-slate-800 rounded-xl py-2.5 text-xs text-amber-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> กำลังส่งเสียง...
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={startRecording}
                    className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 flex items-center justify-center transition shrink-0"
                    title="กดเพื่ออัดเสียง"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    placeholder="พิมพ์ข้อความ..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                  />

                  <button
                    type="submit"
                    className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 font-bold flex items-center justify-center hover:opacity-90 active:scale-95 transition shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </>
              )}
            </form>
          </div>
        ) : (
          <>
            {/* --- MAIN TABS CONTENT --- */}
            <div className="flex-1 overflow-y-auto">
              
              {/* TAB 1: ค้นหา / ปัดการ์ด (DISCOVER) */}
              {tab === 'discover' && (
                <div className="p-4 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-center py-2">
                    <h1 className="text-lg font-black bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-1.5">
                      <Flame className="w-5 h-5 text-amber-400 fill-amber-400" /> Peanuts KU KPS
                    </h1>
                    <span className="text-[10px] bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full text-amber-400 font-mono">
                      ปัดเจอ: {interestedIn === 'all' ? 'ทุกเพศ' : interestedIn}
                    </span>
                  </div>

                  {/* CARD AREA */}
                  {profiles.length > 0 && currentIndex < profiles.length ? (
                    <div className="flex-1 my-3 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
                      
                      {/* Photo Carousel Area */}
                      <div className="flex-1 bg-slate-950 flex items-center justify-center relative group">
                        {(() => {
                          const currentCard = profiles[currentIndex];
                          const cardPhotos = Array.isArray(currentCard.photos) && currentCard.photos.length > 0 
                            ? currentCard.photos.filter((p: string) => p !== '')
                            : [currentCard.avatar_url];

                          const activePhoto = cardPhotos[cardPhotoIndex] || cardPhotos[0];

                          return (
                            <>
                              {activePhoto ? (
                                <img src={activePhoto} alt="Profile" className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-24 h-24 text-slate-700" />
                              )}

                              {/* Carousel Photo Dots Indicator */}
                              {cardPhotos.length > 1 && (
                                <div className="absolute top-3 inset-x-0 flex justify-center gap-1.5 z-10 px-4">
                                  {cardPhotos.map((_: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className={`h-1 rounded-full flex-1 transition-all ${
                                        idx === cardPhotoIndex ? 'bg-white' : 'bg-white/30'
                                      }`}
                                    />
                                  ))}
                                </div>
                              )}

                              {/* Tap left/right to change photo */}
                              {cardPhotos.length > 1 && (
                                <>
                                  <button
                                    onClick={() => setCardPhotoIndex((prev) => (prev > 0 ? prev - 1 : cardPhotos.length - 1))}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/40 text-white opacity-0 group-hover:opacity-100 transition"
                                  >
                                    <ChevronLeft className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => setCardPhotoIndex((prev) => (prev < cardPhotos.length - 1 ? prev + 1 : 0))}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/40 text-white opacity-0 group-hover:opacity-100 transition"
                                  >
                                    <ChevronRight className="w-5 h-5" />
                                  </button>
                                </>
                              )}
                            </>
                          );
                        })()}

                        {/* Card Info Overlay */}
                        <div 
                          onClick={() => setSelectedProfile(profiles[currentIndex])}
                          className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-5 cursor-pointer"
                        >
                          <h2 className="text-xl font-bold text-white flex items-center justify-between">
                            <span>{profiles[currentIndex].display_name}</span>
                            <span className="text-xs text-slate-400 font-normal">กดดูประวัติ ➔</span>
                          </h2>
                          <p className="text-xs text-amber-400 font-medium mt-0.5">
                            {profiles[currentIndex].faculty} • {profiles[currentIndex].year} ({profiles[currentIndex].gender})
                          </p>
                          <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                            {profiles[currentIndex].bio || 'ไม่มีข้อความแนะนำตัว'}
                          </p>
                        </div>
                      </div>

                      {/* SWIPE ACTION BUTTONS */}
                      <div className="p-4 bg-slate-950 flex justify-center gap-6 border-t border-slate-900">
                        <button 
                          onClick={handlePass}
                          className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center hover:text-rose-400 hover:border-rose-500/40 active:scale-90 transition shadow-lg"
                        >
                          <X className="w-6 h-6" />
                        </button>
                        <button 
                          onClick={handleLike}
                          className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center active:scale-90 transition shadow-lg shadow-emerald-500/20"
                        >
                          <Heart className="w-6 h-6 fill-slate-950" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 my-3 bg-slate-900/50 border border-slate-800/80 rounded-3xl flex flex-col items-center justify-center p-6 text-center">
                      <Sparkles className="w-12 h-12 text-slate-600 mb-3" />
                      <p className="text-sm font-bold text-slate-300">ไม่มีโปรไฟล์เพิ่มเติมในขณะนี้</p>
                      <p className="text-xs text-slate-500 mt-1">ลองสลับตัวกรอง "อยากปัดเจอเพศไหน" ในหน้าโปรไฟล์เพื่อเปิดกว้างการค้นหาดูครับ</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: แชทคู่ MATCH (MATCHES) */}
              {tab === 'matches' && (
                <div className="p-4 h-full flex flex-col">
                  <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-400" /> คู่ Match ของคุณ ({matches.length})
                  </h2>
                  
                  {matches.length > 0 ? (
                    <div className="space-y-2">
                      {matches.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => setActiveChat(m)}
                          className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center gap-3 hover:border-emerald-500/40 cursor-pointer active:scale-98 transition"
                        >
                          <div className="w-12 h-12 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                            {m.photos?.[0] || m.avatar_url ? (
                              <img src={m.photos?.[0] || m.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-full h-full p-2.5 text-slate-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <h3 className="text-xs font-bold text-white truncate">{m.display_name}</h3>
                              <span className="text-[10px] text-amber-400 shrink-0">{m.faculty}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{m.lastMessage}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-xs text-slate-500 gap-2">
                      <Heart className="w-8 h-8 text-slate-700" />
                      <span>ยังไม่มีคู่ Match ในขณะนี้ ลองไปปัดการ์ดเพิ่มดูนะ!</span>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: โปรไฟล์ & แก้ไขข้อมูล (PROFILE) */}
              {tab === 'profile' && (
                <div className="p-5 space-y-5">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-400" /> โปรไฟล์ของฉัน
                  </h2>

                  {/* MULTI-PHOTO SLOTS (3 SLOTS) */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      รูปโปรไฟล์ของคุณ (สูงสุด 3 รูป)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {photos.map((photoUrl, idx) => (
                        <div key={idx} className="aspect-[3/4] bg-slate-950 border border-slate-800 rounded-xl relative overflow-hidden flex flex-col items-center justify-center group">
                          {photoUrl ? (
                            <>
                              <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(idx)}
                                className="absolute top-1 right-1 p-1 rounded-lg bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-slate-500 hover:text-emerald-400 transition">
                              {uploadingSlot === idx ? (
                                <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                              ) : (
                                <>
                                  <Plus className="w-6 h-6 mb-1" />
                                  <span className="text-[10px]">เพิ่มรูป {idx + 1}</span>
                                </>
                              )}
                              <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, idx)} className="hidden" />
                            </label>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PROFILE FORM */}
                  <form onSubmit={handleSaveProfile} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">แก้ไขข้อมูลส่วนตัว</h3>

                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">ชื่อที่แสดง (Display Name)</label>
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">คณะ (KU KPS)</label>
                      <select
                        value={faculty}
                        onChange={(e) => setFaculty(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                      >
                        {KU_FACULTIES.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>

                    {/* Gender & Interested In Filter */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-400 font-medium block mb-1">เพศของคุณ</label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                        >
                          <option value="ชาย">ชาย</option>
                          <option value="หญิง">หญิง</option>
                          <option value="อื่นๆ">อื่นๆ</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-amber-400 font-medium block mb-1">อยากปัดเจอเพศไหน</label>
                        <select
                          value={interestedIn}
                          onChange={(e) => setInterestedIn(e.target.value)}
                          className="w-full px-3 py-2.5 bg
