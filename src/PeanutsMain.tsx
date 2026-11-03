import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Flame, Heart, X, MessageSquare, User, LogOut, Sparkles, Send, 
  ArrowLeft, Loader2, Mic, Square, Plus, Trash2, 
  ChevronLeft, ChevronRight, Star, ShieldCheck, SlidersHorizontal, Bell, RotateCcw, BellOff, Image as ImageIcon
} from 'lucide-react';

const SUPABASE_URL = 'https://wvqdueookxtkposaeuuu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pEF2JfLNNVNSqP2EkWfLQA_07HIg3xu';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ONESIGNAL_APP_ID = 'b0557601-dffe-4e26-8e78-b0695de8b150';
const ONESIGNAL_REST_KEY = 'os_v2_app_wbkxmao77zhcndtywbuv32frkcmdqrwrua4ebjehqu7blhi45eajtlzx7nsuxseji2qlorzgpvrzidrwv6n3ouixuz4iqanwphzbjry';

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

export default function PeanutsMain({ 
  session, 
  onOpenPublicChat 
}: { 
  session: any; 
  onOpenPublicChat?: () => void;
}) {
  const [tab, setTab] = useState<'discover' | 'matches' | 'profile'>('discover');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardPhotoIndex, setCardPhotoIndex] = useState(0);
  const [detailPhotoIndex, setDetailPhotoIndex] = useState(0);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [historyStack, setHistoryStack] = useState<number[]>([]);
  
  // Swipe Animation State
  const [swipeDirection, setSwipeDirection] = useState<'like' | 'pass' | 'superlike' | 'rewind' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Modals
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [matchedUser, setMatchedUser] = useState<any>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Profile Form States
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('20');
  const [faculty, setFaculty] = useState('ไม่ระบุ');
  const [year, setYear] = useState('ชั้นปีที่ 1');
  const [gender, setGender] = useState('หญิง');
  const [interestedIn, setInterestedIn] = useState('all');
  const [bio, setBio] = useState('');
  const [photos, setPhotos] = useState<string[]>(['', '', '']);
  const [saving, setSaving] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  // Chat, Match & Notification States
  const [matches, setMatches] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingChatImage, setUploadingChatImage] = useState(false);
  
  // Notification States
  const [unreadCounts, setUnreadCounts] = useState<{ [userId: string]: number }>({});
  const [toastNotification, setToastNotification] = useState<{ senderName: string; text: string; senderObj: any } | null>(null);
  
  // Push Notification Subscribed State
  const [isPushSubscribed, setIsPushSubscribed] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ตรวจสอบสถานะ Push Subscription
  useEffect(() => {
    const checkNotificationStatus = () => {
      try {
        const OneSignal = (window as any).OneSignal;
        if (OneSignal?.User?.PushSubscription) {
          const optedIn = OneSignal.User.PushSubscription.optedIn;
          setIsPushSubscribed(!!optedIn);

          OneSignal.User.PushSubscription.addEventListener("change", (event: any) => {
            setIsPushSubscribed(!!event.current?.optedIn);
          });
        }
      } catch (e) {
        console.error("Notification status check error:", e);
      }
    };
    checkNotificationStatus();
  }, []);

// ฟังก์ชันสลับเปิด/ปิดการแจ้งเตือน (รองรับ Safari บน iOS/iPadOS)
  const handleTogglePushNotification = async () => {
    try {
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;

      // ถ้าเป็น iOS/iPadOS แล้วเล่นใน Safari ปกติ (ยังไม่ได้เพิ่มลงหน้าโฮม)
      if (isIOS && !isStandalone) {
        alert("บน iPhone/iPad ต้องกดปุ่มแชร์ 📤 ด้านบน แล้วเลือก 'เพิ่มไปยังหน้าโฮม' (Add to Home Screen) ก่อน จึงจะสามารถเปิดการแจ้งเตือนได้ครับ");
        return;
      }

      if (typeof window === 'undefined' || !('Notification' in window)) {
        alert('เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน');
        return;
      }

      // 1. สิทธิ์ถูกบล็อกไว้ -> แจ้งเตือนวิธีปลดบล็อก
      if (Notification.permission === 'denied') {
        alert("เบราว์เซอร์ถูกบล็อกการแจ้งเตือนไว้ครับ! กรุณากดไอคอนแม่กุญแจ/การตั้งค่าสิทธิ์ แล้วเปลี่ยน Notifications เป็น 'Allow'");
        return;
      }

      // 2. สิทธิ์ยังไม่ได้ตั้งค่า (Default) -> เด้งป็อบอัพ Allow/Block ของเบราว์เซอร์ทันที
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setIsPushSubscribed(false);
          return;
        }
      }

      // 3. สลับสถานะเปิด / ปิด การรับ Push ใน OneSignal
      const OneSignal = (window as any).OneSignal;
      if (OneSignal?.User?.PushSubscription) {
        if (isPushSubscribed) {
          await OneSignal.User.PushSubscription.optOut();
          setIsPushSubscribed(false);
        } else {
          await OneSignal.User.PushSubscription.optIn();
          setIsPushSubscribed(true);
        }
      } else {
        setIsPushSubscribed(!isPushSubscribed);
      }
    } catch (err) {
      console.error("Toggle notification failed:", err);
    }
  };

      // 3. สลับสถานะเปิด / ปิด การรับ Push ใน OneSignal
      const OneSignal = (window as any).OneSignal;
      if (OneSignal?.User?.PushSubscription) {
        if (isPushSubscribed) {
          await OneSignal.User.PushSubscription.optOut();
          setIsPushSubscribed(false);
        } else {
          await OneSignal.User.PushSubscription.optIn();
          setIsPushSubscribed(true);
        }
      } else {
        setIsPushSubscribed(!isPushSubscribed);
      }
    } catch (err) {
      console.error("Toggle notification failed:", err);
    }
  };
    try {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        alert('เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน');
        return;
      }

      // 1. สิทธิ์ถูกบล็อกไว้ -> แจ้งเตือนวิธีปลดบล็อก
      if (Notification.permission === 'denied') {
        alert("เบราว์เซอร์ถูกบล็อกการแจ้งเตือนไว้ครับ! กรุณากดไอคอนแม่กุญแจหน้า URL แล้วเปลี่ยนสิทธิ์การแจ้งเตือนเป็น 'Allow'");
        return;
      }

      // 2. สิทธิ์ยังไม่ได้ตั้งค่า (Default) -> เด้งป็อบอัพ Allow/Block ของเบราว์เซอร์ทันทีเหมือนไมค์
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setIsPushSubscribed(false);
          return;
        }
      }

      // 3. สลับสถานะเปิด / ปิด การรับ Push ใน OneSignal
      const OneSignal = (window as any).OneSignal;
      if (OneSignal?.User?.PushSubscription) {
        if (isPushSubscribed) {
          await OneSignal.User.PushSubscription.optOut();
          setIsPushSubscribed(false);
        } else {
          await OneSignal.User.PushSubscription.optIn();
          setIsPushSubscribed(true);
        }
      } else {
        setIsPushSubscribed(!isPushSubscribed);
      }
    } catch (err) {
      console.error("Toggle notification failed:", err);
    }
  };

  const sendPushToDevice = async (targetUserId: string, title: string, messageText: string) => {
    try {
      const { data: targetProfile } = await supabase
        .from('profiles')
        .select('onesignal_id')
        .eq('id', targetUserId)
        .single();

      if (targetProfile?.onesignal_id) {
        await fetch('https://onesignal.com/api/v1/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Key ${ONESIGNAL_REST_KEY}`
          },
          body: JSON.stringify({
            app_id: ONESIGNAL_APP_ID,
            include_subscription_ids: [targetProfile.onesignal_id],
            headings: { en: title, th: title },
            contents: { en: messageText, th: messageText }
          })
        });
      }
    } catch (err) {
      console.error('Push send failed:', err);
    }
  };

  const playNotificationSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  const getProfilePhotos = (profile: any) => {
    if (!profile) return [];
    const list: string[] = [];
    
    let rawPhotos = profile.photos;
    if (typeof rawPhotos === 'string') {
      try {
        rawPhotos = JSON.parse(rawPhotos);
      } catch (e) {
        if (rawPhotos.trim() !== '') list.push(rawPhotos.trim());
      }
    }
    
    if (Array.isArray(rawPhotos)) {
      rawPhotos.forEach((p: any) => {
        if (p && typeof p === 'string' && p.trim() !== '') {
          list.push(p.trim());
        }
      });
    }
    
    if (list.length === 0 && profile.avatar_url && typeof profile.avatar_url === 'string' && profile.avatar_url.trim() !== '') {
      list.push(profile.avatar_url.trim());
    }
    
    return list;
  };

  const handleOpenProfileDetail = async (userProfile: any) => {
    if (!userProfile) return;
    setDetailPhotoIndex(0);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userProfile.id)
        .single();

      if (data) {
        setSelectedProfile(data);
      } else {
        setSelectedProfile(userProfile);
      }
    } catch (err) {
      setSelectedProfile(userProfile);
    }
  };

  const handleOpenChat = (matchUser: any) => {
    setActiveChat(matchUser);
    setUnreadCounts((prev) => {
      const copy = { ...prev };
      delete copy[matchUser.id];
      return copy;
    });
  };

  useEffect(() => {
    if (session?.user) {
      loadMyProfile();
      fetchMatches();
    }
  }, [session]);

  useEffect(() => {
    if (!session?.user) return;

    const globalChannel = supabase
      .channel(`global_messages_${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${session.user.id}`
        },
        (payload) => {
          const newMsg = payload.new as any;
          playNotificationSound();

          let msgPreview = newMsg.content;
          if (newMsg.content.startsWith('[VOICE]:')) msgPreview = '🎙️ ข้อความเสียง';
          if (newMsg.content.startsWith('[IMAGE]:')) msgPreview = '📷 รูปภาพ';

          setMatches((prevMatches) =>
            prevMatches.map((m) =>
              m.id === newMsg.sender_id ? { ...m, lastMessage: msgPreview } : m
            )
          );

          if (!activeChat || activeChat.id !== newMsg.sender_id) {
            setUnreadCounts((prev) => ({
              ...prev,
              [newMsg.sender_id]: (prev[newMsg.sender_id] || 0) + 1
            }));

            setMatches((prevMatches) => {
              const sender = prevMatches.find((m) => m.id === newMsg.sender_id);
              if (sender) {
                setToastNotification({
                  senderName: sender.display_name,
                  text: msgPreview,
                  senderObj: sender
                });
                setTimeout(() => setToastNotification(null), 4500);
              }
              return prevMatches;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(globalChannel);
    };
  }, [session, activeChat]);

  useEffect(() => {
    if (!activeChat || !session?.user) return;

    fetchMessages(activeChat.id);

    const channel = supabase
      .channel(`match_chat_${activeChat.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
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

  const loadMyProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (data) {
      setMyProfile(data);
      setDisplayName(data.display_name || '');
      setAge(data.age || '20');
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
        age: '20',
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

  const fetchDiscoverProfiles = async (targetGender: string) => {
    const { data: myLikes } = await supabase
      .from('likes')
      .select('liked_user_id')
      .eq('user_id', session.user.id);

    const swipedIds = myLikes ? myLikes.map((l) => l.liked_user_id) : [];
    swipedIds.push(session.user.id);

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
      setHistoryStack([]);
    }
  };

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
        const matchesWithLastMsg = await Promise.all(
          matchedProfiles.map(async (profile) => {
            const { data: lastMsg } = await supabase
              .from('messages')
              .select('*')
              .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${profile.id}),and(sender_id.eq.${profile.id},receiver_id.eq.${session.user.id})`)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            let msgPreview = 'เริ่มส่งข้อความทักทายกันเลย!';
            if (lastMsg) {
              if (lastMsg.content.startsWith('[VOICE]:')) msgPreview = '🎙️ ข้อความเสียง';
              else if (lastMsg.content.startsWith('[IMAGE]:')) msgPreview = '📷 รูปภาพ';
              else msgPreview = lastMsg.content;
            }

            return {
              ...profile,
              lastMessage: msgPreview
            };
          })
        );
        setMatches(matchesWithLastMsg);
      }
    } else {
      setMatches([]);
    }
  };

  const triggerSwipe = (dir: 'like' | 'pass' | 'superlike', action: () => void) => {
    if (isAnimating || currentIndex >= profiles.length) return;
    setIsAnimating(true);
    setSwipeDirection(dir);
    setTimeout(() => {
      action();
      setSwipeDirection(null);
      setIsAnimating(false);
    }, 220);
  };

  const handleLike = async (isSuperLike = false) => {
    if (currentIndex >= profiles.length) return;
    const targetUser = profiles[currentIndex];

    await supabase.from('likes').insert({
      user_id: session.user.id,
      liked_user_id: targetUser.id
    });

    const { data: isMutual } = await supabase
      .from('likes')
      .select('*')
      .eq('user_id', targetUser.id)
      .eq('liked_user_id', session.user.id)
      .single();

    if (isMutual || isSuperLike) {
      setMatchedUser(targetUser);
      sendPushToDevice(targetUser.id, "It's a Match! 🎉", `${displayName} ได้ถูกใจคุณกลับแล้ว เข้าไปทักทายเลย!`);
    }

    setHistoryStack((prev) => [...prev, currentIndex]);
    setCurrentIndex((prev) => prev + 1);
    setCardPhotoIndex(0);
    fetchMatches();
  };

  const onLikeClick = (isSuperLike = false) => {
    triggerSwipe(isSuperLike ? 'superlike' : 'like', () => handleLike(isSuperLike));
  };

  const onPassClick = () => {
    triggerSwipe('pass', () => {
      setHistoryStack((prev) => [...prev, currentIndex]);
      setCurrentIndex((prev) => prev + 1);
      setCardPhotoIndex(0);
    });
  };

  const onRewindClick = () => {
    if (historyStack.length === 0 || isAnimating) return;
    const lastIndex = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, -1));
    setCurrentIndex(lastIndex);
    setCardPhotoIndex(0);
    setSwipeDirection('rewind');
    setTimeout(() => setSwipeDirection(null), 250);
  };

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

    sendPushToDevice(activeChat.id, displayName || 'ข้อความใหม่', textToSend);
  };

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
      alert('ไม่สามารถเข้าถึงไมโครโฟนได้');
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
    sendPushToDevice(activeChat.id, displayName || 'ข้อความใหม่', '🎙️ ส่งข้อความเสียงถึงคุณ');
  };

  const convertToJpeg = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            resolve(blob || file);
          }, 'image/jpeg', 0.85);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const originalFile = e.target.files[0];
    setUploadingSlot(slotIndex);

    const imageBlob = await convertToJpeg(originalFile);
    const fileName = `${session.user.id}_slot${slotIndex}_${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, imageBlob, { contentType: 'image/jpeg', upsert: true });

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

  const handleChatImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !activeChat) return;
    const originalFile = e.target.files[0];
    setUploadingChatImage(true);

    try {
      const imageBlob = await convertToJpeg(originalFile);
      const fileName = `chat_${session.user.id}_${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, imageBlob, { contentType: 'image/jpeg', upsert: true });

      if (uploadError) {
        alert('ส่งรูปภาพไม่สำเร็จ: ' + uploadError.message);
        setUploadingChatImage(false);
        return;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);

      await supabase.from('messages').insert({
        sender_id: session.user.id,
        receiver_id: activeChat.id,
        content: `[IMAGE]:${data.publicUrl}`
      });

      sendPushToDevice(activeChat.id, displayName || 'ข้อความใหม่', '📷 ส่งรูปภาพถึงคุณ');
    } catch (err) {
      console.error('Chat image upload error:', err);
    } finally {
      setUploadingChatImage(false);
    }
  };

  const handleRemovePhoto = (slotIndex: number) => {
    const newPhotos = [...photos];
    newPhotos[slotIndex] = '';
    setPhotos(newPhotos);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const validPhotos = photos.filter((p) => p.trim() !== '');

    const updatedData = {
      display_name: displayName,
      age,
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
      alert('บันทึกไม่สำเร็จ: ' + error.message);
    } else {
      alert('บันทึกการเปลี่ยนแปลงเรียบร้อย!');
      setMyProfile({ ...myProfile, ...updatedData });
      fetchDiscoverProfiles(interestedIn);
    }
  };

  const totalUnreadCount = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-950 font-sans p-0 sm:p-4 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      <div className="w-full max-w-md h-[100vh] sm:h-[880px] bg-[#0b0e14] sm:rounded-[36px] shadow-2xl flex flex-col justify-between overflow-hidden border border-slate-800/80 relative">
        
        {/* TOAST NOTIFICATION FLOATING BANNER */}
        {toastNotification && (
          <div 
            onClick={() => {
              handleOpenChat(toastNotification.senderObj);
              setTab('matches');
              setToastNotification(null);
            }}
            className="absolute top-3 inset-x-3 z-50 bg-[#121721]/95 border border-amber-500/50 p-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md cursor-pointer hover:bg-slate-900 transition animate-in slide-in-from-top duration-300"
          >
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-amber-400 overflow-hidden shrink-0">
              <img src={getProfilePhotos(toastNotification.senderObj)[0] || toastNotification.senderObj.avatar_url} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white truncate">{toastNotification.senderName}</span>
                <span className="text-[9px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded-full">ข้อความใหม่</span>
              </div>
              <p className="text-[11px] text-slate-300 truncate font-sans">{toastNotification.text}</p>
            </div>
          </div>
        )}

        {/* --- FILTER MODAL --- */}
        {showFilterModal && (
          <div className="absolute inset-0 bg-slate-950/90 z-50 flex flex-col justify-end backdrop-blur-md animate-in slide-in-from-bottom duration-300">
            <div className="bg-[#121721] border-t border-slate-800 rounded-t-3xl p-6 space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-amber-400" /> ตัวกรองการค้นหา
                </h3>
                <button onClick={() => setShowFilterModal(false)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-2">อยากปัดเจอเพศไหน</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'all', label: 'ทั้งหมด / ทุกเพศ' },
                    { id: 'ชาย', label: 'เฉพาะผู้ชาย' },
                    { id: 'หญิง', label: 'เฉพาะผู้หญิง' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setInterestedIn(opt.id);
                        fetchDiscoverProfiles(opt.id);
                        setShowFilterModal(false);
                      }}
                      className={`py-3 rounded-xl text-xs font-bold transition border ${
                        interestedIn === opt.id
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- MATCH MODAL --- */}
        {matchedUser && (
          <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500 via-amber-400 to-emerald-400 p-0.5 shadow-2xl shadow-rose-500/30 mb-4 animate-bounce">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                <Heart className="w-10 h-10 text-rose-500 fill-rose-500" />
              </div>
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
              It&apos;s a Match!
            </h1>
            <p className="text-xs text-slate-300 mt-2">
              คุณและ <span className="font-bold text-amber-400">{matchedUser.display_name}</span> แมทช์กันแล้ว!
            </p>

            <div className="flex items-center justify-center gap-4 my-8">
              <div className="w-20 h-20 rounded-2xl bg-slate-900 border-2 border-emerald-400 overflow-hidden shadow-xl">
                <img src={myProfile?.avatar_url || photos[0]} alt="" className="w-full h-full object-cover" />
              </div>
              <Flame className="w-7 h-7 text-amber-400 fill-amber-400 animate-pulse" />
              <div className="w-20 h-20 rounded-2xl bg-slate-900 border-2 border-rose-400 overflow-hidden shadow-xl">
                <img src={matchedUser.avatar_url || (matchedUser.photos && matchedUser.photos[0])} alt="" className="w-full h-full object-cover" />
              </div>
            </div>

            <button
              onClick={() => {
                handleOpenChat(matchedUser);
                setMatchedUser(null);
                setTab('matches');
              }}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 mb-3"
            >
              ส่งข้อความทักทายเลย 💬
            </button>
            <button onClick={() => setMatchedUser(null)} className="text-xs text-slate-400 hover:text-white py-2">
              ไว้ทีหลัง
            </button>
          </div>
        )}

        {/* --- SELECTED PROFILE DETAIL MODAL --- */}
        {selectedProfile && (
          <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col overflow-y-auto p-4 backdrop-blur-md">
            <button 
              onClick={() => setSelectedProfile(null)} 
              className="self-start text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-3 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800"
            >
              <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
            </button>

            <div className="bg-[#121721] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex-1 flex flex-col">
              <div className="h-96 bg-slate-950 relative group shrink-0">
                {(() => {
                  const detailPhotos = getProfilePhotos(selectedProfile);
                  const activePhoto = detailPhotos[detailPhotoIndex] || detailPhotos[0];

                  return (
                    <>
                      {activePhoto ? (
                        <img src={activePhoto} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-600 gap-2">
                          <User className="w-20 h-20" />
                          <span className="text-xs text-slate-500">ไม่มีรูปภาพโปรไฟล์</span>
                        </div>
                      )}

                      {detailPhotos.length > 1 && (
                        <div className="absolute top-3 inset-x-0 flex justify-center gap-1.5 z-10 px-12">
                          {detailPhotos.map((_: any, idx: number) => (
                            <div 
                              key={idx} 
                              className={`h-1 rounded-full flex-1 transition-all ${idx === detailPhotoIndex ? 'bg-white shadow' : 'bg-white/30'}`} 
                            />
                          ))}
                        </div>
                      )}

                      {detailPhotos.length > 1 && (
                        <>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailPhotoIndex((prev) => (prev > 0 ? prev - 1 : detailPhotos.length - 1));
                            }} 
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/60 text-white hover:bg-slate-950 transition z-10"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailPhotoIndex((prev) => (prev < detailPhotos.length - 1 ? prev + 1 : 0));
                            }} 
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/60 text-white hover:bg-slate-950 transition z-10"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>

              <div className="p-5 space-y-3 flex-1 overflow-y-auto">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <span>{selectedProfile.display_name}</span>
                  <span className="text-lg font-normal text-slate-300">{selectedProfile.age || 20}</span>
                </h2>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center gap-1 font-medium">
                    🎓 {selectedProfile.faculty || 'ไม่ระบุ'} {selectedProfile.year || 'ชั้นปีที่ 1'} ({selectedProfile.gender || 'ไม่ระบุ'})
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-emerald-500/40 text-emerald-400 text-[10px] font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> ยืนยันนิสิต @ku.th
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-800/80">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">เกี่ยวกับฉัน</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                    {selectedProfile.bio || 'ไม่ได้ระบุข้อความแนะนำตัว'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- ACTIVE MATCH CHAT VIEW --- */}
        {activeChat ? (
          <div className="h-full flex flex-col bg-slate-950 overflow-hidden">
            <header className="px-4 py-3 bg-[#121721] border-b border-slate-800 flex items-center gap-3 shrink-0 z-10">
              <button onClick={() => setActiveChat(null)} className="p-1 text-slate-400 hover:text-white shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div 
                onClick={() => handleOpenProfileDetail(activeChat)}
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 hover:opacity-80 transition"
              >
                <div className="w-9 h-9 rounded-full bg-slate-800 overflow-hidden border border-emerald-500/40 shrink-0">
                  <img 
                    src={getProfilePhotos(activeChat)[0] || activeChat.avatar_url} 
                    alt="" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1 truncate">
                    <span>{activeChat.display_name}</span>
                  </h3>
                  <span className="text-[10px] text-amber-400 truncate block">{activeChat.faculty}</span>
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto min-h-0 p-4 flex flex-col gap-2.5 font-sans text-xs bg-slate-950">
              {messages.map((m) => {
                const isMe = m.sender_id === session.user.id;
                const isVoice = m.content.startsWith('[VOICE]:');
                const isImage = m.content.startsWith('[IMAGE]:');
                const audioUrl = isVoice ? m.content.replace('[VOICE]:', '') : '';
                const imageUrl = isImage ? m.content.replace('[IMAGE]:', '') : '';

                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs ${
                      isMe ? 'bg-emerald-500 text-slate-950 font-medium' : 'bg-slate-900 text-white border border-slate-800'
                    }`}>
                      {isVoice ? (
                        <audio controls preload="metadata" playsInline src={audioUrl} className="h-8 max-w-[210px] my-0.5" />
                      ) : isImage ? (
                        <img src={imageUrl} alt="Chat Attachment" className="rounded-xl max-w-full max-h-60 object-cover my-0.5 cursor-pointer hover:opacity-95" onClick={() => window.open(imageUrl, '_blank')} />
                      ) : (
                        <span className="break-all">{m.content}</span>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </main>

            <form onSubmit={handleSendMessage} className="p-3 bg-[#121721] border-t border-slate-800 flex items-center gap-2 shrink-0 z-10">
              {isRecording ? (
                <div className="flex-1 flex items-center justify-between bg-rose-500/10 border border-rose-500/40 rounded-xl px-4 py-2 text-xs text-rose-400 animate-pulse">
                  <span>กำลังอัดเสียง...</span>
                  <button type="button" onClick={stopRecording} className="flex items-center gap-1 bg-rose-500 text-white font-bold px-3 py-1 rounded-lg text-[11px]">
                    <Square className="w-3.5 h-3.5 fill-white" /> หยุดและส่ง
                  </button>
                </div>
              ) : uploadingAudio || uploadingChatImage ? (
                <div className="flex-1 flex items-center justify-center gap-2 bg-slate-950 border border-slate-800 rounded-xl py-2.5 text-xs text-amber-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> {uploadingChatImage ? 'กำลังอัปโหลดรูปภาพ...' : 'กำลังส่งเสียง...'}
                </div>
              ) : (
                <>
                  <label className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-emerald-400 flex items-center justify-center shrink-0 cursor-pointer transition">
                    <ImageIcon className="w-4 h-4" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleChatImageUpload} 
                      className="hidden" 
                      disabled={uploadingChatImage}
                    />
                  </label>

                  <button type="button" onClick={startRecording} className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 flex items-center justify-center shrink-0">
                    <Mic className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    placeholder="พิมพ์ข้อความ..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                  />
                  <button type="submit" className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 font-bold flex items-center justify-center shrink-0">
                    <Send className="w-4 h-4" />
                  </button>
                </>
              )}
            </form>
          </div>
        ) : (
          <>
            {/* --- MAIN TABS CONTENT --- */}
            <div className={`flex-1 min-h-0 ${tab === 'discover' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
              
              {/* TAB 1: DISCOVER */}
              {tab === 'discover' && (
                <div className="p-3 sm:p-4 h-full flex flex-col justify-between min-h-0 overflow-hidden">
                  <div className="flex justify-between items-center py-1 px-1 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Flame className="w-5 h-5 text-slate-950 fill-slate-950" />
                      </div>
                      <div>
                        <h1 className="text-sm font-black text-white leading-tight">
                          Peanuts KU KPS
                        </h1>
                        <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" /> นิสิต ม.เกษตร กำแพงแสน
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setShowFilterModal(true)} 
                        className="w-9 h-9 rounded-full bg-[#121721] border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition"
                        title="ตัวกรอง"
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {profiles.length > 0 && currentIndex < profiles.length ? (
                    <div className="flex-1 my-2 bg-[#121721] border border-slate-800/80 rounded-[28px] overflow-hidden shadow-2xl flex flex-col relative min-h-0">
                      <div className={`flex-1 bg-slate-950 relative group min-h-0 transition-all duration-300 ease-out transform ${
                        swipeDirection === 'like' ? 'translate-x-[120%] rotate-12 opacity-0' :
                        swipeDirection === 'pass' ? '-translate-x-[120%] -rotate-12 opacity-0' :
                        swipeDirection === 'superlike' ? '-translate-y-[120%] scale-95 opacity-0' :
                        swipeDirection === 'rewind' ? 'animate-in zoom-in-95 duration-300' : ''
                      }`}>
                        {(() => {
                          const currentCard = profiles[currentIndex];
                          const cardPhotos = getProfilePhotos(currentCard);
                          const activePhoto = cardPhotos[cardPhotoIndex] || cardPhotos[0];

                          return (
                            <>
                              <div className="absolute inset-0">
                                {activePhoto ? (
                                  <img src={activePhoto} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                    <User className="w-24 h-24 text-slate-700" />
                                  </div>
                                )}
                              </div>

                              <div className="absolute top-3 left-3 z-10 pointer-events-none">
                                <span className="px-2.5 py-1 rounded-full bg-slate-950/70 border border-emerald-500/40 text-emerald-400 text-[10px] font-medium flex items-center gap-1 backdrop-blur-md">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> ยืนยันนิสิต @ku.th
                                </span>
                              </div>

                              {swipeDirection === 'like' && (
                                <div className="absolute top-8 left-6 z-30 border-4 border-emerald-400 text-emerald-400 text-2xl font-black px-4 py-1 rounded-xl -rotate-12 uppercase tracking-wider backdrop-blur-sm bg-emerald-500/10 animate-in zoom-in-50 duration-150">
                                  LIKE
                                </div>
                              )}
                              {swipeDirection === 'pass' && (
                                <div className="absolute top-8 right-6 z-30 border-4 border-rose-500 text-rose-500 text-2xl font-black px-4 py-1 rounded-xl rotate-12 uppercase tracking-wider backdrop-blur-sm bg-rose-500/10 animate-in zoom-in-50 duration-150">
                                  NOPE
                                </div>
                              )}
                              {swipeDirection === 'superlike' && (
                                <div className="absolute bottom-24 inset-x-0 mx-auto w-max z-30 border-4 border-sky-400 text-sky-400 text-2xl font-black px-5 py-1 rounded-xl uppercase tracking-wider backdrop-blur-sm bg-sky-500/10 animate-in zoom-in-50 duration-150">
                                  SUPER LIKE
                                </div>
                              )}

                              {cardPhotos.length > 1 && (
                                <div className="absolute top-3 inset-x-0 flex justify-center gap-1.5 z-10 px-24">
                                  {cardPhotos.map((_: any, idx: number) => (
                                    <div key={idx} className={`h-1 rounded-full flex-1 transition-all ${idx === cardPhotoIndex ? 'bg-white shadow' : 'bg-white/30'}`} />
                                  ))}
                                </div>
                              )}

                              {cardPhotos.length > 1 && (
                                <>
                                  <button onClick={() => setCardPhotoIndex((prev) => (prev > 0 ? prev - 1 : cardPhotos.length - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/40 text-white opacity-0 group-hover:opacity-100 transition z-10">
                                    <ChevronLeft className="w-5 h-5" />
                                  </button>
                                  <button onClick={() => setCardPhotoIndex((prev) => (prev < cardPhotos.length - 1 ? prev + 1 : 0))} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/40 text-white opacity-0 group-hover:opacity-100 transition z-10">
                                    <ChevronRight className="w-5 h-5" />
                                  </button>
                                </>
                              )}
                            </>
                          );
                        })()}

                        <div 
                          onClick={() => handleOpenProfileDetail(profiles[currentIndex])} 
                          className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/80 to-transparent p-4 pb-3 cursor-pointer space-y-1 z-20 hover:opacity-90 transition"
                        >
                          <h2 className="text-xl font-black text-white flex items-center gap-2 drop-shadow">
                            <span>{profiles[currentIndex].display_name}</span>
                            <span className="text-lg font-normal text-slate-300">{profiles[currentIndex].age || 20}</span>
                          </h2>

                          <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                            🎓 {profiles[currentIndex].faculty} {profiles[currentIndex].year} ({profiles[currentIndex].gender || 'ไม่ระบุ'})
                          </p>

                          <p className="text-xs text-slate-300 line-clamp-2 pt-0.5 font-sans leading-snug">
                            {profiles[currentIndex].bio || 'ไม่มีข้อความแนะนำตัว'}
                          </p>
                        </div>
                      </div>

                      <div className="py-3 px-6 bg-[#0b0e14] flex justify-center items-center gap-4 border-t border-slate-900 shrink-0 z-20">
                        <button 
                          onClick={onRewindClick}
                          disabled={historyStack.length === 0 || isAnimating}
                          className="w-11 h-11 rounded-full bg-[#121721] border border-slate-800 text-slate-400 hover:text-amber-400 flex items-center justify-center active:scale-90 transition disabled:opacity-30"
                          title="ย้อนกลับ"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>

                        <button 
                          onClick={onPassClick} 
                          disabled={isAnimating}
                          className="w-14 h-14 rounded-full bg-[#121721] border border-rose-500/30 text-rose-400 flex items-center justify-center hover:bg-rose-500/10 active:scale-90 transition shadow-lg"
                          title="ข้าม"
                        >
                          <X className="w-6 h-6" />
                        </button>

                        <button 
                          onClick={() => onLikeClick(true)} 
                          disabled={isAnimating}
                          className="w-11 h-11 rounded-full bg-[#121721] border border-sky-500/40 text-sky-400 flex items-center justify-center hover:bg-sky-500/10 active:scale-90 transition shadow-lg"
                          title="Super Like!"
                        >
                          <Star className="w-5 h-5 fill-sky-400" />
                        </button>

                        <button 
                          onClick={() => onLikeClick(false)} 
                          disabled={isAnimating}
                          className="w-14 h-14 rounded-full bg-teal-400 text-slate-950 flex items-center justify-center hover:bg-teal-300 active:scale-90 transition shadow-xl shadow-teal-400/20"
                          title="ถูกใจ"
                        >
                          <Heart className="w-7 h-7 fill-slate-950" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 my-2 bg-[#121721] border border-slate-800/80 rounded-3xl flex flex-col items-center justify-center p-6 text-center">
                      <Sparkles className="w-12 h-12 text-slate-600 mb-3" />
                      <p className="text-sm font-bold text-slate-300">ไม่มีโปรไฟล์เพิ่มเติมในขณะนี้</p>
                      <p className="text-xs text-slate-500 mt-1">ลองเปลี่ยนตัวกรอง "อยากปัดเจอเพศไหน" ในเมนูด้านบนเพื่อค้นหาใหม่ดูครับ</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MATCHES */}
              {tab === 'matches' && (
                <div className="p-4 h-full flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-emerald-400" /> คู่ Match ของคุณ ({matches.length})
                    </h2>
                    
                    <button
                      onClick={handleTogglePushNotification}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition shadow-md ${
                        isPushSubscribed 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                          : 'bg-[#121721] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                      title={isPushSubscribed ? "คลิกเพื่อปิดการแจ้งเตือน" : "คลิกเพื่อเปิดการแจ้งเตือน"}
                    >
                      {isPushSubscribed ? (
                        <>
                          <Bell className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          <span>เปิดแจ้งเตือนแล้ว</span>
                        </>
                      ) : (
                        <>
                          <BellOff className="w-3.5 h-3.5 text-slate-400" />
                          <span>ปิดแจ้งเตือนอยู่</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {matches.length > 0 ? (
                    <div className="space-y-2">
                      {matches.map((m) => {
                        const unreadCount = unreadCounts[m.id] || 0;

                        return (
                          <div 
                            key={m.id} 
                            className={`p-3 bg-[#121721] border rounded-2xl flex items-center gap-3 transition ${
                              unreadCount > 0 ? 'border-amber-500/80 bg-amber-500/5' : 'border-slate-800 hover:border-emerald-500/40'
                            }`}
                          >
                            <div 
                              onClick={() => handleOpenProfileDetail(m)} 
                              className="w-12 h-12 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-emerald-500/30 cursor-pointer hover:opacity-80 transition relative group"
                              title="คลิกดูโปรไฟล์"
                            >
                              <img src={getProfilePhotos(m)[0] || m.avatar_url} alt="" className="w-full h-full object-cover" />
                            </div>

                            <div 
                              onClick={() => handleOpenChat(m)} 
                              className="flex-1 min-w-0 cursor-pointer"
                            >
                              <div className="flex justify-between items-center">
                                <h3 className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                                  <span>{m.display_name}</span>
                                  {unreadCount > 0 && (
                                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                                  )}
                                </h3>
                                <span className="text-[10px] text-amber-400 shrink-0">{m.faculty}</span>
                              </div>
                              <p className={`text-[11px] mt-0.5 truncate ${unreadCount > 0 ? 'text-amber-300 font-bold' : 'text-slate-400'}`}>
                                {m.lastMessage}
                              </p>
                            </div>

                            {unreadCount > 0 ? (
                              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                                {unreadCount}
                              </span>
                            ) : (
                              <button
                                onClick={() => handleOpenProfileDetail(m)}
                                className="p-2 text-slate-400 hover:text-emerald-400 rounded-xl hover:bg-slate-900 transition shrink-0"
                                title="ดูโปรไฟล์"
                              >
                                <User className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-xs text-slate-500 gap-2 py-16">
                      <Heart className="w-8 h-8 text-slate-700" />
                      <span>ยังไม่มีคู่ Match ในขณะนี้ ลองปัดการ์ดเพิ่มดูนะ!</span>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PROFILE FORM */}
              {tab === 'profile' && (
                <div className="p-5 space-y-5">
                  <div className="flex justify-between items-center">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <User className="w-5 h-5 text-emerald-400" /> โปรไฟล์ของฉัน
                    </h2>
                    <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> นิสิตยืนยันตัวตนแล้ว
                    </span>
                  </div>

                  <div className="bg-[#121721] border border-slate-800 rounded-2xl p-4 space-y-3">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      รูปโปรไฟล์ของคุณ (สูงสุด 3 รูป)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {photos.map((photoUrl, idx) => (
                        <div key={idx} className="aspect-[3/4] bg-slate-950 border border-slate-800 rounded-xl relative overflow-hidden flex flex-col items-center justify-center group">
                          {photoUrl ? (
                            <>
                              <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                              <button type="button" onClick={() => handleRemovePhoto(idx)} className="absolute top-1 right-1 p-1 rounded-lg bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 transition">
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

                  <form onSubmit={handleSaveProfile} className="bg-[#121721] border border-slate-800 rounded-2xl p-4 space-y-4">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">แก้ไขข้อมูลส่วนตัว</h3>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
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
                        <label className="text-xs text-slate-400 font-medium block mb-1">อายุ</label>
                        <input
                          type="number"
                          required
                          min={15}
                          max={60}
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white text-center focus:outline-none focus:border-emerald-500 transition"
                        />
                      </div>
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
                          className="w-full px-3 py-2.5 bg-slate-950 border border-amber-500/40 rounded-xl text-xs text-amber-300 font-medium focus:outline-none focus:border-amber-400 transition"
                        >
                          <option value="all">ทั้งหมด / ทุกเพศ</option>
                          <option value="ชาย">เฉพาะผู้ชาย</option>
                          <option value="หญิง">เฉพาะผู้หญิง</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">ชั้นปี</label>
                      <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                      >
                        <option value="ชั้นปีที่ 1">ชั้นปีที่ 1</option>
                        <option value="ชั้นปีที่ 2">ชั้นปีที่ 2</option>
                        <option value="ชั้นปีที่ 3">ชั้นปีที่ 3</option>
                        <option value="ชั้นปีที่ 4">ชั้นปีที่ 4</option>
                        <option value="บัณฑิตศึกษา">บัณฑิตศึกษา</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">ประวัติย่อ / Bio</label>
                      <textarea
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 transition resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/15 disabled:opacity-50"
                    >
                      {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                    </button>
                  </form>

                  <button
                    type="button"
                    onClick={onOpenPublicChat}
                    className="w-full py-3 bg-[#121721] border border-amber-500/40 text-amber-400 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-500/10 active:scale-95 transition shadow-lg shadow-amber-500/5"
                  >
                    <MessageSquare className="w-4 h-4 text-amber-400" /> 
                    ห้องพูดคุยสาธารณะ & ข้อเสนอแนะ 💬
                  </button>

                  <button
                    onClick={() => supabase.auth.signOut()}
                    className="w-full py-3 bg-[#121721] border border-slate-800 text-rose-400 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-rose-500/10 transition"
                  >
                    <LogOut className="w-4 h-4" /> ออกจากระบบ
                  </button>
                </div>
              )}

            </div>

            {/* Bottom Nav */}
            <nav className="h-16 bg-[#0b0e14] border-t border-slate-900 grid grid-cols-3 items-center text-xs shrink-0">
              <button onClick={() => setTab('discover')} className={`flex flex-col items-center gap-1 ${tab === 'discover' ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                <Flame className="w-5 h-5" />
                <span className="text-[10px]">ค้นหา</span>
              </button>
              
              <button onClick={() => setTab('matches')} className={`flex flex-col items-center gap-1 relative ${tab === 'matches' ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                <div className="relative">
                  <MessageSquare className="w-5 h-5" />
                  {totalUnreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-amber-400 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-slate-950 animate-bounce">
                      {totalUnreadCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px]">แชทคู่ Match</span>
              </button>

              <button onClick={() => setTab('profile')} className={`flex flex-col items-center gap-1 ${tab === 'profile' ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                <User className="w-5 h-5" />
                <span className="text-[10px]">โปรไฟล์</span>
              </button>
            </nav>
          </>
        )}

      </div>
    </div>
  );
}
