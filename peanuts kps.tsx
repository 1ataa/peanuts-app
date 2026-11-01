import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  X,
  Star,
  RotateCcw,
  Zap,
  MessageSquare,
  User,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Info,
  ShieldCheck,
  MapPin,
  Briefcase,
  Send,
  Volume2,
  VolumeX,
  Compass,
  ArrowLeft,
  Edit3,
  Plus,
  Search
} from 'lucide-react';

// --- CUSTOM PEANUT SVG ICON ---
function PeanutIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M12 2C9.5 2 7.8 3.8 7.8 6.2C7.8 7.8 8.6 9.1 9.8 9.9C8.4 10.7 7.5 12.3 7.5 14.1C7.5 16.8 9.5 19 12 19C14.5 19 16.5 16.8 16.5 14.1C16.5 12.3 15.6 10.7 14.2 9.9C15.4 9.1 16.2 7.8 16.2 6.2C16.2 3.8 14.5 2 12 2ZM10 6.5C10 5.4 10.9 4.5 12 4.5C13.1 4.5 14 5.4 14 6.5C14 7.6 13.1 8.5 12 8.5C10.9 8.5 10 7.6 10 6.5ZM12 17C10.3 17 9.5 15.5 9.5 14C9.5 12.5 10.3 11 12 11C13.7 11 14.5 12.5 14.5 14C14.5 15.5 13.7 17 12 17Z"/>
    </svg>
  );
}

// --- MOCK DATA FOR PEANUT PROFILES ---
const INITIAL_PROFILES = [
  {
    id: 'p1',
    name: 'Crispy Crunch',
    age: 22,
    verified: true,
    job: 'นิสิตปี 4 คณะวิศวกรรมศาสตร์',
    university: 'KU KPS (กำแพงแสน)',
    bio: 'Looking for someone smooth like peanut butter! 🥜 Always roasted to perfection, salted just right, and ready for late-night snacking adventures.',
    aboutMe: 'ชอบออกไปลองกินร้านอร่อยใกล้มหาลัย ทานชาบูตอนเย็นกับเพื่อนๆ และชอบฟังเพลงอินดี้ป๊อปยุค 90s',
    photos: [
      'https://images.unsplash.com/photo-1567892568625-32c0a4c19957?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1528751014936-863e6e4a319c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=800&q=80'
    ],
    passions: ['Roasted', 'Crunchy', 'KU KPS', 'Picnics', 'Coffee'],
    prompt: {
      question: 'Key to my heart...',
      answer: 'A generous sprinkling of sea salt and a warm oven 🍿'
    },
    isMatch: true,
    autoReply: "Hey there! Are you studying at KU KPS too? Let's settle the best shabu spot once and for all! 🥜✨"
  },
  {
    id: 'p2',
    name: 'Mr. Roasted',
    age: 25,
    verified: true,
    job: 'นิสิตปี 3 คณะเกษตร กำแพงแสน',
    university: 'KU KPS (กำแพงแสน)',
    bio: 'Always warm, salty, and slightly nutty 🪵. If you love honey-roasted snacks and cozy autumn vibes, we are going to get along great!',
    aboutMe: 'ชอบทำอาหารกินเองที่หอ เล่นบอร์ดเกมช่วงวันหยุด และหาเพื่อนไปนั่งทำงานวิจัยในห้องสมุด',
    photos: [
      'https://images.unsplash.com/photo-1528751014936-863e6e4a319c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509358271058-acd01cc9386a?auto=format&fit=crop&w=800&q=80'
    ],
    passions: ['Honey Roasted', 'Warm', 'Hiking', 'Craft Beer', 'Board Games'],
    prompt: {
      question: 'Ideal Sunday looks like...',
      answer: 'Slow roasted at 350°F with honey glaze and acoustic music 🍯'
    },
    isMatch: true,
    autoReply: "Hey! Ready for a salty & sweet adventure together around KU KPS? 🍯🥜"
  },
  {
    id: 'p3',
    name: 'Creamy Peanut',
    age: 21,
    verified: true,
    job: 'นิสิตปี 2 คณะศิลปศาสตร์และวิทยาศาสตร์',
    university: 'KU KPS (กำแพงแสน)',
    bio: '100% organic, ultra-smooth, and effortlessly spreadable 🍞. Spreading positivity and delicious energy everywhere I go.',
    aboutMe: 'ชอบเล่นโยคะตอนเช้า ทำแยมผลไม้สด และตามหาร้านคาเฟ่ถ่ายรูปสวยๆ',
    photos: [
      'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509358271058-acd01cc9386a?auto=format&fit=crop&w=800&q=80'
    ],
    passions: ['Smooth', 'Organic', 'Toast', 'Smoothies', 'Yoga'],
    prompt: {
      question: 'My most controversial opinion...',
      answer: 'Peanut butter goes well on EVERYTHING — even ramen! 🍜'
    },
    isMatch: true,
    autoReply: "Bonjour! Up for grabbing a coffee near KU KPS library? 🥄"
  },
  {
    id: 'p4',
    name: 'Nutty Shell',
    age: 24,
    verified: false,
    job: 'นิสิตปี 4 คณะศึกษาศาสตร์และพัฒนศาสตร์',
    university: 'KU KPS (กำแพงแสน)',
    bio: 'Hard shell on the outside, soft & sweet on the inside 🥜. Don’t worry, cracking my shell is worth the reward!',
    aboutMe: 'รักธรรมชาติ ชอบไปแคมปิ้ง ร้องเพลงและเล่นอูคูเลเล่',
    photos: [
      'https://images.unsplash.com/photo-1567892568625-32c0a4c19957?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1528751014936-863e6e4a319c?auto=format&fit=crop&w=800&q=80'
    ],
    passions: ['In-Shell', 'Raw', 'Gardening', 'Jazz', 'Camping'],
    prompt: {
      question: 'Simple pleasures...',
      answer: 'Cracking fresh peanut shells on a quiet patio sunset.'
    },
    isMatch: false,
    autoReply: "Hey! Ready to crack open a conversation? 🥜"
  },
  {
    id: 'p5',
    name: 'Peanut Butter',
    age: 23,
    verified: true,
    job: 'นิสิตปี 3 คณะวิทยาศาสตร์การกีฬา',
    university: 'KU KPS (กำแพงแสน)',
    bio: 'Pairs perfectly with Jam 🍓. Looking for my butter half to complete the ultimate sandwich of life!',
    aboutMe: 'ชอบทานโทสต์ขนมปังกับถั่วลิสงบดสดๆ ทุกเช้า หาเพื่อนเล่นบอร์ดเกมเสาร์-อาทิตย์ และไปนั่งชิวร้านกาแฟใกล้มหาลัย',
    photos: [
      'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1567892568625-32c0a4c19957?auto=format&fit=crop&w=800&q=80'
    ],
    passions: ['PB&J', 'Breakfast', 'Baking', 'Road Trips', 'Indie Music'],
    prompt: {
      question: 'A random fact I love...',
      answer: 'It takes about 540 peanuts to make a 12-ounce jar of peanut butter! 📊'
    },
    isMatch: true,
    autoReply: "Hey! You must be the Jelly to my Peanut Butter! 🍓🥜"
  }
];

// Initial user profile
const INITIAL_USER = {
  name: 'Captain Peanut',
  age: 22,
  job: 'นิสิตปี 4 คณะวิศวกรรมศาสตร์',
  university: 'KU KPS (กำแพงแสน)',
  studentEmail: 'nont.s@ku.th',
  bio: 'Living life one shell at a time 🥜. Looking for my butter half!',
  aboutMe: 'ชอบกินชาบูหลังเลิกเรียน อินฟังเพลงอินดี้ป๊อปยามดึก ชอบหาเพื่อนไปติวหนังสือที่หอสมุดกลางช่วงใกล้สอบ และพร้อมไปลองร้านอร่อยรอบ KU KPS เสมอ 🍿',
  photos: [
    'https://images.unsplash.com/photo-1567892568625-32c0a4c19957?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1528751014936-863e6e4a319c?auto=format&fit=crop&w=800&q=80'
  ],
  passions: ['Roasted', 'Crunchy', 'KU KPS', 'Snacking'],
  verified: true,
  ageRange: [18, 25],
  showMe: 'Everyone',
  incognito: false,
  superlikesLeft: 5,
  boostsLeft: 2
};

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('deck'); // 'deck' | 'explore' | 'matches' | 'chat' | 'profile'
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [authStep, setAuthStep] = useState('email'); // 'email' | 'otp'
  const [authError, setAuthError] = useState('');

  // Data States
  const [profiles, setProfiles] = useState(INITIAL_PROFILES);
  const [swipedHistory, setSwipedHistory] = useState([]); // Stack for rewind
  const [matches, setMatches] = useState([
    {
      id: 'p1',
      name: 'Crispy Crunch',
      photo: 'https://images.unsplash.com/photo-1567892568625-32c0a4c19957?auto=format&fit=crop&w=800&q=80',
      lastMessage: 'Hey there! Are you a fan of crunchy or smooth?',
      time: '10m ago',
      unread: true
    },
    {
      id: 'p2',
      name: 'Mr. Roasted',
      photo: 'https://images.unsplash.com/photo-1528751014936-863e6e4a319c?auto=format&fit=crop&w=800&q=80',
      lastMessage: 'Ready for a salty & sweet adventure together? 🍯',
      time: '1h ago',
      unread: false
    }
  ]);

  // Audio / Photo / Gesture states
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [photoIndices, setPhotoIndices] = useState({});
  const [dragState, setDragState] = useState({
    isDragging: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    rotation: 0
  });

  // Active Chat State
  const [activeChatProfile, setActiveChatProfile] = useState(null);
  const [chatMessages, setChatMessages] = useState({
    p1: [
      { id: 1, sender: 'them', text: 'Hey there! Love your roasted energy! ✨', time: '10:15 AM' },
      { id: 2, sender: 'them', text: 'Are you a fan of crunchy or smooth peanut butter? 🥜', time: '10:16 AM' }
    ],
    p2: [
      { id: 1, sender: 'them', text: 'Yo! Ready to go nuts this weekend?', time: 'Yesterday' },
      { id: 2, sender: 'me', text: 'Haha absolutely! Honey roasted is my favorite.', time: 'Yesterday' },
      { id: 3, sender: 'them', text: 'Ready for a salty & sweet adventure together? 🍯', time: '1h ago' }
    ]
  });
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef(null);

  // Modals & Active overlays
  const [detailModalProfile, setDetailModalProfile] = useState(null);
  const [matchModalProfile, setMatchModalProfile] = useState(null);
  const [boostActive, setBoostActive] = useState(false);
  const [boostTimer, setBoostTimer] = useState(30);
  const [toastMessage, setToastMessage] = useState(null);

  // User Profile & Settings state
  const [userProfile, setUserProfile] = useState(INITIAL_USER);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState(INITIAL_USER);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  // Toast Helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync temp profile when editing starts
  useEffect(() => {
    if (isEditingProfile) {
      setTempProfile({ ...userProfile });
    }
  }, [isEditingProfile, userProfile]);

  // Scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeChatProfile, isTyping]);

  // Boost Timer Effect
  useEffect(() => {
    let interval;
    if (boostActive && boostTimer > 0) {
      interval = setInterval(() => setBoostTimer((prev) => prev - 1), 1000);
    } else if (boostTimer === 0) {
      setBoostActive(false);
      setBoostTimer(30);
      showToast('Boost ended!');
    }
    return () => clearInterval(interval);
  }, [boostActive, boostTimer]);

  const handleSaveProfile = (e) => {
    e?.preventDefault();
    setUserProfile({ ...tempProfile });
    setIsEditingProfile(false);
    showToast('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว! 🥜');
  };

  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    setTempProfile((prev) => ({
      ...prev,
      photos: [...prev.photos, newPhotoUrl.trim()]
    }));
    setNewPhotoUrl('');
    showToast('เพิ่มรูปภาพใหม่แล้ว!');
  };

  const handleRemovePhoto = (idx) => {
    if (tempProfile.photos.length <= 1) {
      showToast('ต้องมีรูปโปรไฟล์อย่างน้อย 1 รูป!');
      return;
    }
    setTempProfile((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== idx)
    }));
  };

  // Photo Carousel Controls
  const getPhotoIndex = (id) => photoIndices[id] || 0;
  
  const nextPhoto = (e, profile) => {
    e.stopPropagation();
    const current = getPhotoIndex(profile.id);
    const next = (current + 1) % profile.photos.length;
    setPhotoIndices((prev) => ({ ...prev, [profile.id]: next }));
  };

  const prevPhoto = (e, profile) => {
    e.stopPropagation();
    const current = getPhotoIndex(profile.id);
    const prev = (current - 1 + profile.photos.length) % profile.photos.length;
    setPhotoIndices((prev) => ({ ...prev, [profile.id]: prev }));
  };

  // Drag Card Handlers
  const handleStart = (x, y) => {
    setDragState({
      isDragging: true,
      startX: x,
      startY: y,
      offsetX: 0,
      offsetY: 0,
      rotation: 0
    });
  };

  const handleMove = (x, y) => {
    if (!dragState.isDragging) return;
    const offsetX = x - dragState.startX;
    const offsetY = y - dragState.startY;
    const rotation = offsetX * 0.08;
    setDragState((prev) => ({ ...prev, offsetX, offsetY, rotation }));
  };

  const handleEnd = () => {
    if (!dragState.isDragging) return;
    const threshold = 120;

    if (dragState.offsetX > threshold) {
      handleSwipe('right');
    } else if (dragState.offsetX < -threshold) {
      handleSwipe('left');
    } else if (dragState.offsetY < -130) {
      handleSuperlike();
    } else {
      setDragState({
        isDragging: false,
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0,
        rotation: 0
      });
    }
  };

  const handleMouseDown = (e) => handleStart(e.clientX, e.clientY);
  const handleMouseMove = (e) => handleMove(e.clientX, e.clientY);
  const handleMouseUp = () => handleEnd();

  const handleTouchStart = (e) => handleStart(e.touches[0].clientX, e.touches[0].clientY);
  const handleTouchMove = (e) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
  const handleTouchEnd = () => handleEnd();

  // Swiping Actions
  const handleSwipe = (direction, overrideProfile = null) => {
    if (profiles.length === 0) return;
    const currentProfile = overrideProfile || profiles[0];

    setSwipedHistory((prev) => [...prev, currentProfile]);
    setProfiles((prev) => prev.filter((p) => p.id !== currentProfile.id));

    setDragState({
      isDragging: false,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0,
      rotation: 0
    });

    if (direction === 'right') {
      showToast(`Crunch! You liked ${currentProfile.name}`);
      if (currentProfile.isMatch) {
        setMatchModalProfile(currentProfile);
        if (!matches.some((m) => m.id === currentProfile.id)) {
          setMatches((prev) => [
            {
              id: currentProfile.id,
              name: currentProfile.name,
              photo: currentProfile.photos[0],
              lastMessage: currentProfile.autoReply || 'Matched with you!',
              time: 'Just now',
              unread: true
            },
            ...prev
          ]);
        }
      }
    } else if (direction === 'left') {
      showToast(`Passed on ${currentProfile.name}`);
    }
  };

  const handleRewind = () => {
    if (swipedHistory.length === 0) return;
    const lastProfile = swipedHistory[swipedHistory.length - 1];
    setSwipedHistory((prev) => prev.slice(0, -1));
    setProfiles((prev) => [lastProfile, ...prev]);
    showToast(`Rewound profile: ${lastProfile.name}`);
  };

  const handleSuperlike = () => {
    if (profiles.length === 0) return;
    if (userProfile.superlikesLeft <= 0) {
      showToast('No Superlikes remaining!');
      return;
    }
    const currentProfile = profiles[0];
    setUserProfile((prev) => ({ ...prev, superlikesLeft: prev.superlikesLeft - 1 }));
    showToast(`Super Nut sent to ${currentProfile.name}! ⭐`);
    handleSwipe('right');
  };

  const handleBoost = () => {
    if (userProfile.boostsLeft <= 0) {
      showToast('No Boosts left!');
      return;
    }
    setUserProfile((prev) => ({ ...prev, boostsLeft: prev.boostsLeft - 1 }));
    setBoostActive(true);
    setBoostTimer(30);
    showToast('Boost activated! You are top peanut in area for 30s! ⚡');
  };

  // --- CHAT MESSAGE SEND & AUTOMATED BOT REPLY ---
  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!messageInput.trim() || !activeChatProfile) return;

    const chatKey = activeChatProfile.id;
    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => ({
      ...prev,
      [chatKey]: [...(prev[chatKey] || []), newMsg]
    }));

    setMatches((prev) =>
      prev.map((m) =>
        m.id === chatKey
          ? { ...m, lastMessage: `You: ${messageInput.trim()}`, time: 'Just now', unread: false }
          : m
      )
    );

    const sentText = messageInput.trim();
    setMessageInput('');

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let replyText = `That's super nutty! 🥜 Tell me more about that.`;
      
      if (sentText.toLowerCase().includes('butter') || sentText.toLowerCase().includes('smooth')) {
        replyText = `I know an amazing artisanal peanut butter workshop nearby! We should go! 🍞🥜`;
      } else if (sentText.toLowerCase().includes('hi') || sentText.toLowerCase().includes('hello')) {
        replyText = `Hey! So glad we nut-matched! How is your day roasting? 😄`;
      } else if (sentText.toLowerCase().includes('weekend') || sentText.toLowerCase().includes('free')) {
        replyText = `I'm actually free this Saturday! Up for coffee and peanut snacks? ☕🥜`;
      } else if (activeChatProfile.autoReply) {
        replyText = activeChatProfile.autoReply;
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: 'them',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages((prev) => ({
        ...prev,
        [chatKey]: [...(prev[chatKey] || []), botMsg]
      }));

      setMatches((prev) =>
        prev.map((m) =>
          m.id === chatKey
            ? { ...m, lastMessage: replyText, time: 'Just now', unread: false }
            : m
        )
      );
    }, 1800);
  };

  const likeOpacity = Math.min(Math.max(dragState.offsetX / 100, 0), 1);
  const nopeOpacity = Math.min(Math.max(-dragState.offsetX / 100, 0), 1);
  const superOpacity = Math.min(Math.max(-dragState.offsetY / 100, 0), 1);

  return (
    <div className="flex justify-center items-center min-h-screen bg-amber-950 font-sans text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950 p-0 sm:p-4">
      <div className="relative w-full max-w-md h-[100vh] sm:h-[880px] bg-slate-900 sm:rounded-[3rem] shadow-2xl overflow-hidden border border-amber-900/50 flex flex-col">
        
        {/* --- GLOBAL TOAST NOTIFICATION --- */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-amber-900/90 text-amber-100 backdrop-blur-md px-4 py-2 rounded-full text-xs font-semibold shadow-lg border border-amber-700 flex items-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* --- TOP HEADER NAVBAR --- */}
        <header className="px-5 py-3 bg-slate-900/90 backdrop-blur-md border-b border-amber-900/40 flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('deck')}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-500 flex items-center justify-center shadow-md shadow-amber-600/30">
              <PeanutIcon className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
            <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-400 bg-clip-text text-transparent">
              peanuts
            </span>
          </div>

          <div className="flex items-center gap-3">
            {boostActive && (
              <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{boostTimer}s</span>
              </div>
            )}

            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                showToast(soundEnabled ? 'Muted sound effects' : 'Sound effects enabled');
              }}
              className="p-2 rounded-full text-amber-400/70 hover:text-amber-300 hover:bg-slate-800 transition"
              title="Toggle Audio"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`relative rounded-full p-0.5 border-2 transition ${
                activeTab === 'profile' ? 'border-amber-400 scale-105' : 'border-transparent'
              }`}
            >
              <img
                src={userProfile.photos[0]}
                alt="My Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
            </button>
          </div>
        </header>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 relative overflow-hidden flex flex-col bg-slate-950">
          
          {/* 1. SWIPE DECK TAB */}
          {activeTab === 'deck' && (
            <div className="relative w-full h-full flex flex-col items-center justify-between p-3 select-none">
              
              <div
                className="relative w-full flex-1 max-h-[640px] my-auto flex items-center justify-center cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {profiles.length > 0 ? (
                  profiles.map((profile, index) => {
                    if (index > 2) return null;
                    const isTopCard = index === 0;

                    const style = isTopCard
                      ? {
                          transform: `translate3d(${dragState.offsetX}px, ${dragState.offsetY}px, 0px) rotate(${dragState.rotation}deg)`,
                          transition: dragState.isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }
                      : {
                          transform: `scale(${1 - index * 0.05}) translateY(${index * 12}px)`,
                          transition: 'transform 0.3s ease'
                        };

                    const activePhotoIdx = getPhotoIndex(profile.id);

                    return (
                      <div
                        key={profile.id}
                        style={style}
                        className={`absolute w-full h-full max-w-[380px] rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-amber-900/40 flex flex-col justify-between ${
                          isTopCard ? 'z-20' : index === 1 ? 'z-10 opacity-90' : 'z-0 opacity-70'
                        }`}
                      >
                        <div className="relative w-full h-full bg-slate-800 overflow-hidden">
                          <img
                            src={profile.photos[activePhotoIdx]}
                            alt={profile.name}
                            className="w-full h-full object-cover pointer-events-none select-none"
                          />

                          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/70 via-black/20 to-transparent pointer-events-none" />

                          {profile.photos.length > 1 && (
                            <div className="absolute top-3 left-3 right-3 flex gap-1.5 z-20">
                              {profile.photos.map((_, pIdx) => (
                                <div
                                  key={pIdx}
                                  className={`h-1 flex-1 rounded-full transition-all ${
                                    pIdx === activePhotoIdx ? 'bg-amber-400 shadow' : 'bg-white/40'
                                  }`}
                                />
                              ))}
                            </div>
                          )}

                          {isTopCard && (
                            <div className="absolute inset-0 flex z-10">
                              <div
                                className="w-1/2 h-full cursor-pointer"
                                onClick={(e) => prevPhoto(e, profile)}
                              />
                              <div
                                className="w-1/2 h-full cursor-pointer"
                                onClick={(e) => nextPhoto(e, profile)}
                              />
                            </div>
                          )}

                          {isTopCard && (
                            <>
                              <div
                                style={{ opacity: likeOpacity }}
                                className="absolute top-10 left-6 border-4 border-amber-400 text-amber-400 font-black text-3xl px-4 py-1.5 rounded-xl tracking-wider uppercase rotate-[-20deg] z-30 pointer-events-none shadow-lg"
                              >
                                CRUNCH!
                              </div>

                              <div
                                style={{ opacity: nopeOpacity }}
                                className="absolute top-10 right-6 border-4 border-rose-500 text-rose-500 font-black text-3xl px-4 py-1.5 rounded-xl tracking-wider uppercase rotate-[20deg] z-30 pointer-events-none shadow-lg"
                              >
                                PASS
                              </div>

                              <div
                                style={{ opacity: superOpacity }}
                                className="absolute bottom-32 left-1/2 -translate-x-1/2 border-4 border-yellow-400 text-yellow-400 font-black text-3xl px-6 py-1.5 rounded-xl tracking-wider uppercase rotate-[-5deg] z-30 pointer-events-none shadow-lg bg-slate-950/40 backdrop-blur-sm"
                              >
                                SUPER NUT!
                              </div>
                            </>
                          )}

                          <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent z-20 flex flex-col justify-end text-white pointer-events-auto">
                            <div className="flex items-end justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-3xl font-extrabold tracking-tight text-amber-100">
                                  {profile.name}
                                </h2>
                                <span className="text-2xl font-light text-amber-300">
                                  {profile.age}
                                </span>
                                {profile.verified && (
                                  <ShieldCheck className="w-6 h-6 text-amber-400 fill-amber-400/20" title="Verified Student" />
                                )}
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDetailModalProfile(profile);
                                }}
                                className="p-2.5 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition shadow-lg shrink-0"
                              >
                                <Info className="w-5 h-5" />
                              </button>
                            </div>

                            <div className="mt-1 flex flex-col gap-1 text-sm text-amber-200/80">
                              <div className="flex items-center gap-1.5">
                                <Briefcase className="w-4 h-4 text-amber-400" />
                                <span>{profile.job}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-amber-300/90 font-medium">
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                                <span>{profile.university || 'KU KPS (กำแพงแสน)'}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {profile.passions.slice(0, 3).map((passion, pKey) => (
                                <span
                                  key={pKey}
                                  className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 backdrop-blur-md text-amber-200 border border-amber-500/30"
                                >
                                  {passion}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-amber-900/40 w-full max-w-[360px] h-[480px]">
                    <div className="relative mb-6">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center animate-pulse shadow-xl shadow-amber-600/30">
                        <PeanutIcon className="w-12 h-12 text-slate-950 fill-slate-950" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-slate-950 p-2 rounded-full font-bold text-xs shadow-md">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-amber-100 mb-2">No More Peanuts Nearby!</h3>
                    <p className="text-xs text-amber-300/70 mb-6 leading-relaxed">
                      You've swiped through all available peanuts in your field. Reload to start snacking again!
                    </p>
                    <button
                      onClick={() => {
                        setProfiles(INITIAL_PROFILES);
                        showToast('Resetting Peanut deck!');
                      }}
                      className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-600/30 hover:opacity-95 transition"
                    >
                      Reload Peanuts
                    </button>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS ROW */}
              {profiles.length > 0 && (
                <div className="w-full max-w-[360px] flex items-center justify-between px-2 pt-2 pb-1 z-30">
                  <button
                    onClick={handleRewind}
                    disabled={swipedHistory.length === 0}
                    className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-amber-400 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition"
                    title="Rewind"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleSwipe('left')}
                    className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 text-rose-500 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition"
                    title="Nope"
                  >
                    <X className="w-7 h-7 stroke-[3]" />
                  </button>

                  <button
                    onClick={handleSuperlike}
                    className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-yellow-400 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition relative"
                    title="Super Nut"
                  >
                    <Star className="w-5 h-5 fill-yellow-400/20" />
                    {userProfile.superlikesLeft > 0 && (
                      <span className="absolute -top-1 -right-1 bg-yellow-400 text-slate-950 font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                        {userProfile.superlikesLeft}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => handleSwipe('right')}
                    className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 hover:scale-110 active:scale-95 transition"
                    title="Crunch / Like"
                  >
                    <Heart className="w-7 h-7 fill-slate-950 stroke-none" />
                  </button>

                  <button
                    onClick={handleBoost}
                    className={`w-12 h-12 rounded-full border border-slate-800 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition relative ${
                      boostActive
                        ? 'bg-amber-400 text-slate-950 animate-bounce'
                        : 'bg-slate-900 text-amber-400'
                    }`}
                    title="Boost"
                  >
                    <Zap className={`w-5 h-5 ${boostActive ? 'fill-slate-950' : 'fill-amber-400/20'}`} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. EXPLORE / TOP PICKS TAB */}
          {activeTab === 'explore' && (
            <div className="w-full h-full p-4 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-amber-100">Peanut Flavors</h2>
                  <p className="text-xs text-amber-300/70">Discover profiles by roast & texture</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1">
                  <PeanutIcon className="w-3.5 h-3.5" />
                  <span>Fresh Batch</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    title: 'Honey Roasted 🍯',
                    desc: 'Sweet & crunchy vibes',
                    img: 'https://images.unsplash.com/photo-1528751014936-863e6e4a319c?auto=format&fit=crop&w=400&q=80'
                  },
                  {
                    title: 'Smooth & Creamy 🍞',
                    desc: 'Spreadable perfection',
                    img: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=400&q=80'
                  },
                  {
                    title: 'Sea Salted 🧂',
                    desc: 'Salty & savory classic',
                    img: 'https://images.unsplash.com/photo-1567892568625-32c0a4c19957?auto=format&fit=crop&w=400&q=80'
                  },
                  {
                    title: 'In-Shell Pods 🥜',
                    desc: 'Hard outside, soft inside',
                    img: 'https://images.unsplash.com/photo-1509358271058-acd01cc9386a?auto=format&fit=crop&w=400&q=80'
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setActiveTab('deck');
                      showToast(`Filtered for ${item.title}`);
                    }}
                    className="relative h-40 rounded-2xl overflow-hidden cursor-pointer group shadow-lg border border-amber-900/40"
                  >
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="font-bold text-sm text-amber-100">{item.title}</h3>
                      <p className="text-[10px] text-amber-300/70">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. MATCHES & CHAT LIST TAB */}
          {activeTab === 'matches' && (
            <div className="w-full h-full flex flex-col bg-slate-950">
              <div className="p-4 border-b border-amber-900/30 bg-slate-900/50 backdrop-blur-md">
                <div className="relative">
                  <Search className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search nut matches..."
                    className="w-full pl-9 pr-4 py-2 rounded-full bg-slate-800/80 border border-amber-900/40 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1">
                    <PeanutIcon className="w-3.5 h-3.5 fill-amber-400" />
                    Nut Matches ({matches.length})
                  </h3>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                    {matches.map((match) => (
                      <div
                        key={match.id}
                        onClick={() => {
                          setActiveChatProfile(match);
                          setActiveTab('chat');
                          setMatches((prev) =>
                            prev.map((m) => (m.id === match.id ? { ...m, unread: false } : m))
                          );
                        }}
                        className="flex flex-col items-center cursor-pointer shrink-0 group"
                      >
                        <div className="relative">
                          <div className="w-16 h-20 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-amber-600 to-yellow-500 shadow-md group-hover:scale-105 transition">
                            <img
                              src={match.photo}
                              alt={match.name}
                              className="w-full h-full object-cover rounded-[14px]"
                            />
                          </div>
                          {match.unread && (
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-slate-950" />
                          )}
                        </div>
                        <span className="text-xs font-medium text-amber-100 mt-1.5 max-w-[64px] truncate text-center">
                          {match.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Conversations
                  </h3>
                  <div className="space-y-2">
                    {matches.map((match) => (
                      <div
                        key={match.id}
                        onClick={() => {
                          setActiveChatProfile(match);
                          setActiveTab('chat');
                          setMatches((prev) =>
                            prev.map((m) => (m.id === match.id ? { ...m, unread: false } : m))
                          );
                        }}
                        className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-900 transition cursor-pointer border border-transparent hover:border-amber-900/30"
                      >
                        <div className="relative shrink-0">
                          <img
                            src={match.photo}
                            alt={match.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {match.unread && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-slate-950" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <h4 className="text-sm font-bold text-amber-100 truncate">{match.name}</h4>
                            <span className="text-[10px] text-slate-400">{match.time}</span>
                          </div>
                          <p className="text-xs text-slate-400 truncate">{match.lastMessage}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. ACTIVE CHAT THREAD TAB */}
          {activeTab === 'chat' && activeChatProfile && (
            <div className="w-full h-full flex flex-col bg-slate-950">
              <div className="p-3 bg-slate-900/80 backdrop-blur-md border-b border-amber-900/30 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('matches')}
                    className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 transition"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => {
                      const fullProf = INITIAL_PROFILES.find((p) => p.id === activeChatProfile.id);
                      if (fullProf) setDetailModalProfile(fullProf);
                    }}
                  >
                    <img
                      src={activeChatProfile.photo}
                      alt={activeChatProfile.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-amber-100 leading-tight">
                        {activeChatProfile.name}
                      </h3>
                      <p className="text-[10px] text-amber-400 font-medium">Nut Matched 🥜</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950">
                <div className="text-center my-4">
                  <span className="text-[10px] uppercase tracking-widest text-amber-400/80 font-semibold bg-amber-900/30 px-3 py-1 rounded-full border border-amber-900/40">
                    You nut-matched with {activeChatProfile.name}
                  </span>
                </div>

                {(chatMessages[activeChatProfile.id] || []).map((msg) => {
                  const isMe = msg.sender === 'me';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                          isMe
                            ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 font-medium rounded-br-xs'
                            : 'bg-slate-800 text-slate-100 rounded-bl-xs border border-amber-900/30'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.time}</span>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-center gap-1.5 text-amber-400 bg-slate-800/50 border border-amber-900/30 px-3 py-1.5 rounded-full w-fit text-xs animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce delay-150" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce delay-300" />
                    <span className="text-[10px] ml-1">{activeChatProfile.name} is typing...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-slate-900/90 border-t border-amber-900/30 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Message ${activeChatProfile.name}...`}
                  className="flex-1 py-2.5 px-4 rounded-full bg-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 transition border border-amber-900/30"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-500 text-slate-950 font-bold flex items-center justify-center shadow-md disabled:opacity-40 transition shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* 5. USER PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="w-full h-full flex flex-col overflow-y-auto bg-slate-950 p-4 space-y-6">
              <div className="relative flex flex-col items-center text-center pt-2">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 shadow-xl">
                    <img
                      src={userProfile.photos[0]}
                      alt={userProfile.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="absolute bottom-1 right-1 p-2 rounded-full bg-amber-500 text-slate-950 border-2 border-slate-900 shadow-md hover:bg-amber-400 transition"
                    title={isEditingProfile ? "ปิดแก้ไข" : "แก้ไขโปรไฟล์"}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <h2 className="text-2xl font-black text-amber-100">
                    {userProfile.name}, {userProfile.age}
                  </h2>
                  <ShieldCheck className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                </div>
                <p className="text-xs text-amber-300/70 mt-0.5">
                  {userProfile.job} • {userProfile.company}
                </p>

                {!isEditingProfile && userProfile.aboutMe && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/40 text-left w-full max-w-xs shadow-inner">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      สิ่งที่คุณอยากให้คนอื่นรู้เกี่ยวกับตัวเอง
                    </span>
                    <p className="text-xs text-amber-100/90 leading-relaxed italic">
                      "{userProfile.aboutMe}"
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 w-full max-w-xs mt-4">
                  <div
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border cursor-pointer transition ${
                      isEditingProfile
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                        : 'bg-slate-900 text-slate-300 border-amber-900/40 hover:border-amber-700'
                    }`}
                  >
                    <Edit3 className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-bold uppercase">Edit Profile</span>
                  </div>

                  <div
                    onClick={handleBoost}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-amber-500/20 to-yellow-600/10 border border-amber-500/30 cursor-pointer hover:scale-105 transition"
                  >
                    <Zap className="w-5 h-5 text-amber-400 fill-amber-400 mb-1" />
                    <span className="text-[10px] font-bold text-amber-300 uppercase">Boost ({userProfile.boostsLeft})</span>
                  </div>

                  <div
                    onClick={() => showToast('Redirecting to Peanuts Premium')}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-yellow-500/20 to-amber-600/10 border border-yellow-500/30 cursor-pointer hover:scale-105 transition"
                  >
                    <Sparkles className="w-5 h-5 text-yellow-400 mb-1" />
                    <span className="text-[10px] font-bold text-yellow-300 uppercase">Gold</span>
                  </div>
                </div>
              </div>

              {/* FORM & PROFILE CONFIGURATION */}
              {isEditingProfile && (
                <form onSubmit={handleSaveProfile} className="space-y-5 border-t border-amber-900/40 pt-5 animate-in fade-in duration-200">
                  <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider">
                    ตั้งค่าโปรไฟล์ & สิ่งที่อยากบอก
                  </h3>

                  {/* PHOTO MANAGEMENT SECTION */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 block">
                      จัดการรูปถ่ายโปรไฟล์ (อย่างน้อย 1 รูป)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {tempProfile.photos.map((photo, pIdx) => (
                        <div key={pIdx} className="relative aspect-square rounded-xl overflow-hidden border border-amber-800/50 group">
                          <img src={photo} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(pIdx)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-80 hover:opacity-100 transition"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-2">
                      <input
                        type="url"
                        placeholder="วาง URL รูปภาพใหม่ที่นี่..."
                        value={newPhotoUrl}
                        onChange={(e) => setNewPhotoUrl(e.target.value)}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-slate-900 border border-amber-900/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddPhoto}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs hover:bg-amber-500/30 transition flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        เพิ่มรูป
                      </button>
                    </div>
                  </div>

                  {/* BASIC INFORMATION */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">สถาบันการศึกษา / วิทยาเขต</label>
                      <input
                        type="text"
                        disabled
                        value={tempProfile.university || 'KU KPS (กำแพงแสน)'}
                        className="w-full py-2 px-3 rounded-xl bg-slate-900/60 border border-amber-900/40 text-xs text-amber-300 font-bold opacity-80 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 block mb-1">คณะ / ชั้นปี</label>
                      <input
                        type="text"
                        value={tempProfile.job}
                        onChange={(e) => setTempProfile({ ...tempProfile, job: e.target.value })}
                        className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-amber-900/40 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 block mb-1">อีเมลมหาลัยที่ยืนยันแล้ว</label>
                      <input
                        type="email"
                        disabled
                        value={tempProfile.studentEmail || 'std@ku.th'}
                        className="w-full py-2 px-3 rounded-xl bg-slate-900/60 border border-amber-900/40 text-xs text-amber-400/80 font-mono opacity-80 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-amber-300 block mb-1">
                        สิ่งที่คุณอยากให้คนอื่นรู้เกี่ยวกับตัวเอง
                      </label>
                      <textarea
                        rows={3}
                        value={tempProfile.aboutMe || ''}
                        onChange={(e) => setTempProfile({ ...tempProfile, aboutMe: e.target.value })}
                        placeholder="เล่าเรื่องราว ความชอบ หรือไลฟ์สไตล์ของคุณให้เพื่อนๆ ใน KU KPS รู้..."
                        className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-amber-900/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-extrabold text-xs shadow-md hover:opacity-95 transition"
                    >
                      บันทึกการเปลี่ยนแปลง 🥜
                    </button>
                  </div>
                </form>
              )}

              {/* BUTTON TO TEST LOGOUT & AUTH SIMULATION */}
              <div className="pt-4 border-t border-amber-900/40">
                <button
                  type="button"
                  onClick={() => {
                    setIsAuthenticated(false);
                    setAuthStep('email');
                    setAuthEmail('');
                    setAuthError('');
                    showToast('ออกจากระบบเรียบร้อย');
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs font-bold hover:bg-rose-900/40 transition"
                >
                  ทดสอบออกจากระบบ (เข้าสู่ระบบด้วยเมลมหาลัย)
                </button>
              </div>
            </div>
          )}
        </main>

        {/* --- STUDENT EMAIL VERIFICATION AUTH MODAL SIMULATION --- */}
        {!isAuthenticated && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <div className="w-full max-w-xs space-y-5">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-xl shadow-amber-500/20">
                <PeanutIcon className="w-8 h-8 text-slate-950 fill-slate-950" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-amber-100">peanuts @ KU KPS</h2>
                <p className="text-xs text-amber-300/70 mt-1">
                  สำหรับนิสิต ม.เกษตรศาสตร์ (กำแพงแสน) เท่านั้น
                </p>
              </div>

              {authStep === 'email' ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setAuthError('');
                    const trimmed = authEmail.trim().toLowerCase();
                    if (!trimmed.endsWith('@ku.th') && !trimmed.endsWith('.ac.th')) {
                      setAuthError('ระบบอนุญาตเฉพาะอีเมลมหาวิทยาลัย (@ku.th) เท่านั้น!');
                      return;
                    }
                    setAuthStep('otp');
                    showToast('ส่งรหัส OTP ไปยังอีเมลนิสิตของคุณแล้ว!');
                  }}
                  className="space-y-3 text-left"
                >
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                      ระบุอีเมลนิสิต (@ku.th)
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="example@ku.th"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full py-2.5 px-3.5 rounded-xl bg-slate-900 border border-amber-800/60 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  {authError && (
                    <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-[11px] leading-tight">
                      ⚠️ {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs shadow-lg hover:opacity-95 transition"
                  >
                    ส่งรหัสยืนยันตัวตน (OTP)
                  </button>

                  <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                    *ทดลองพิมพ์อีเมลลงท้ายด้วย <span className="text-amber-400 font-mono">@ku.th</span> เพื่อเข้าใช้งาน
                  </p>
                </form>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setIsAuthenticated(true);
                    setUserProfile((prev) => ({ ...prev, studentEmail: authEmail }));
                    showToast('ยืนยันตัวตนด้วยเมลมหาลัยสำเร็จ! 🥜');
                  }}
                  className="space-y-3 text-left"
                >
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                      กรอกรหัส OTP 6 หลักที่ส่งไปยัง {authEmail}
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="1 2 3 4 5 6"
                      value={authOtp}
                      onChange={(e) => setAuthOtp(e.target.value)}
                      className="w-full py-2.5 px-3.5 rounded-xl bg-slate-900 border border-amber-800/60 text-center font-mono tracking-widest text-lg text-amber-300 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs shadow-lg hover:opacity-95 transition"
                  >
                    ยืนยันตัวตนและเริ่มปัด Peanuts 🥜
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthStep('email')}
                    className="w-full text-center text-xs text-amber-400 underline font-medium"
                  >
                    เปลี่ยนอีเมล
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* --- PROFILE DETAIL MODAL OVERLAY --- */}
        {detailModalProfile && (
          <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col overflow-y-auto animate-in fade-in duration-200">
            <div className="relative w-full h-[360px] shrink-0">
              <img
                src={detailModalProfile.photos[0]}
                alt={detailModalProfile.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setDetailModalProfile(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/60 backdrop-blur-md text-white hover:bg-slate-950 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-amber-100">
                    {detailModalProfile.name}, {detailModalProfile.age}
                  </h2>
                  <p className="text-xs text-amber-300">{detailModalProfile.job}</p>
                </div>
                {detailModalProfile.verified && (
                  <ShieldCheck className="w-7 h-7 text-amber-400 fill-amber-400/20" />
                )}
              </div>

              {/* DEDICATED BIO DISPLAY IN MODAL */}
              {(detailModalProfile.aboutMe || detailModalProfile.bio) && (
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/40 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    สิ่งที่คุณอยากให้คนอื่นรู้เกี่ยวกับตัวเอง
                  </span>
                  <p className="text-xs text-amber-100 leading-relaxed italic">
                    "{detailModalProfile.aboutMe || detailModalProfile.bio}"
                  </p>
                </div>
              )}

              {detailModalProfile.passions && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {detailModalProfile.passions.map((p, i) => (
                      <span key={i} className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  handleSwipe('right', detailModalProfile);
                  setDetailModalProfile(null);
                }}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/20 mt-4"
              >
                Crunch & Match 🥜
              </button>
            </div>
          </div>
        )}

        {/* --- BOTTOM TAB NAVIGATION BAR --- */}
        <nav className="px-6 py-2 bg-slate-900 border-t border-amber-900/40 flex items-center justify-between z-30 shrink-0">
          <button
            onClick={() => setActiveTab('deck')}
            className={`p-2.5 rounded-full transition flex flex-col items-center gap-0.5 ${
              activeTab === 'deck' ? 'text-amber-400 scale-110' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <PeanutIcon className={`w-6 h-6 ${activeTab === 'deck' ? 'fill-amber-400' : ''}`} />
          </button>

          <button
            onClick={() => setActiveTab('explore')}
            className={`p-2.5 rounded-full transition flex flex-col items-center gap-0.5 ${
              activeTab === 'explore' ? 'text-amber-400 scale-110' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Compass className="w-6 h-6" />
          </button>

          <button
            onClick={() => setActiveTab('matches')}
            className={`p-2.5 rounded-full transition relative flex flex-col items-center gap-0.5 ${
              activeTab === 'matches' || activeTab === 'chat'
                ? 'text-amber-400 scale-110'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <MessageSquare className="w-6 h-6" />
            {matches.some((m) => m.unread) && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-slate-900" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`p-2.5 rounded-full transition flex flex-col items-center gap-0.5 ${
              activeTab === 'profile' ? 'text-amber-400 scale-110' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <User className="w-6 h-6" />
          </button>
        </nav>

        {/* ANIMATED "IT'S A NUT MATCH!" OVERLAY MODAL */}
        {matchModalProfile && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-between p-8 text-center animate-in zoom-in-95 duration-300">
            <div className="w-full flex justify-end">
              <button
                onClick={() => setMatchModalProfile(null)}
                className="p-2 text-slate-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-2 my-auto">
              <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
                Roasted Perfection
              </span>
              <h1 className="text-4xl font-black italic tracking-tight bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-400 bg-clip-text text-transparent transform -rotate-2">
                It's a Nut Match! 🥜
              </h1>
              <p className="text-xs text-amber-200/80">
                You and <span className="font-bold text-white">{matchModalProfile.name}</span> cracked each other's shells.
              </p>

              <div className="flex items-center justify-center my-8">
                <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-amber-500 to-yellow-400 shadow-2xl z-10 -mr-4 animate-pulse">
                  <img
                    src={userProfile.photos[0]}
                    alt="Me"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-amber-500 to-yellow-400 shadow-2xl z-0 -ml-4 animate-pulse">
                  <img
                    src={matchModalProfile.photos[0]}
                    alt={matchModalProfile.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
            </div>

            <div className="w-full space-y-3">
              <button
                onClick={() => {
                  const matchedUser = matches.find((m) => m.id === matchModalProfile.id) || {
                    id: matchModalProfile.id,
                    name: matchModalProfile.name,
                    photo: matchModalProfile.photos[0]
                  };
                  setActiveChatProfile(matchedUser);
                  setMatchModalProfile(null);
                  setActiveTab('chat');
                }}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/30 hover:opacity-95 transition"
              >
                Send a Message
              </button>

              <button
                onClick={() => setMatchModalProfile(null)}
                className="w-full py-3.5 rounded-full bg-slate-900 border border-amber-900/40 text-amber-300 font-bold text-sm hover:bg-slate-800 transition"
              >
                Keep Swiping Peanuts
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}