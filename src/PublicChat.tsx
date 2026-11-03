import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, Send, Mic, Square, Loader2, Gamepad2, X, 
  RefreshCw, Trophy, ShieldCheck, Plus, Sparkles 
} from 'lucide-react';

const SUPABASE_URL = 'https://wvqdueookxtkposaeuuu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pEF2JfLNNVNSqP2EkWfLQA_07HIg3xu';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- BLACKJACK ENGINE CONSTANTS & TYPES ---
type Card = { suit: '♠' | '♥' | '♦' | '♣'; value: string; numVal: number };

const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const val of VALUES) {
      let numVal = parseInt(val);
      if (['J', 'Q', 'K'].includes(val)) numVal = 10;
      if (val === 'A') numVal = 11;
      deck.push({ suit, value: val, numVal });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
};

const calculateScore = (hand: Card[]) => {
  let score = hand.reduce((acc, c) => acc + c.numVal, 0);
  let aces = hand.filter((c) => c.value === 'A').length;
  while (score > 21 && aces > 0) {
    score -= 10;
    aces -= 1;
  }
  return score;
};

export default function PublicChat({ onBack }: { onBack: () => void }) {
  // Chat States
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [username, setUsername] = useState('');
  const [hasJoinedChat, setHasJoinedChat] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  // Mini-game Modal States
  const [showGameModal, setShowGameModal] = useState(false);
  const [activeMiniGame, setActiveMiniGame] = useState<'none' | 'blackjack'>('none');

  // Blackjack Game States
  const [chips, setChips] = useState(600);
  const [currentBet, setCurrentBet] = useState(0);
  const [gameState, setGameState] = useState<'lobby' | 'betting' | 'playing' | 'ended'>('lobby');
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameResult, setGameResult] = useState<string>('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Fetch Public Chat Messages
  useEffect(() => {
    fetchPublicMessages();
    const channel = supabase
      .channel('public_chat_room')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new as any;
        if (newMsg.receiver_id === 'PUBLIC_CHAT') {
          setMessages((prev) => [...prev, newMsg]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchPublicMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('receiver_id', 'PUBLIC_CHAT')
      .order('created_at', { ascending: true })
      .limit(50);

    if (data) setMessages(data);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const msg = chatInput.trim();
    setChatInput('');

    await supabase.from('messages').insert({
      sender_id: username || 'ผู้เยี่ยมชม',
      receiver_id: 'PUBLIC_CHAT',
      content: msg
    });
  };

  // --- BLACKJACK LOGIC ---
  const startNewBlackjack = () => {
    setGameState('betting');
    setCurrentBet(0);
    setPlayerHand([]);
    setDealerHand([]);
    setGameResult('');
  };

  const addBet = (amount: number) => {
    if (chips >= amount) {
      setChips((prev) => prev - amount);
      setCurrentBet((prev) => prev + amount);
    }
  };

  const clearBet = () => {
    setChips((prev) => prev + currentBet);
    setCurrentBet(0);
  };

  const allInBet = () => {
    setCurrentBet((prev) => prev + chips);
    setChips(0);
  };

  const dealCards = () => {
    if (currentBet <= 0) return alert('กรุณาลงชิปเดิมพันก่อนเริ่มเกม');
    const newDeck = createDeck();
    const pHand = [newDeck.pop()!, newDeck.pop()!];
    const dHand = [newDeck.pop()!, newDeck.pop()!];

    setDeck(newDeck);
    setPlayerHand(pHand);
    setDealerHand(dHand);
    setGameState('playing');

    // Check Immediate Blackjack
    if (calculateScore(pHand) === 21) {
      endGame(pHand, dHand, 'BLACKJACK! คุณได้ 21 แต้มทันที 🎉', Math.floor(currentBet * 2.5));
    }
  };

  const hitCard = () => {
    const tempDeck = [...deck];
    const newCard = tempDeck.pop()!;
    const updatedHand = [...playerHand, newCard];

    setDeck(tempDeck);
    setPlayerHand(updatedHand);

    if (calculateScore(updatedHand) > 21) {
      endGame(updatedHand, dealerHand, 'BUSTED! แต้มเกิน 21 คุณแพ้ ❌', 0);
    }
  };

  const standTurn = () => {
    let tempDeck = [...deck];
    let dHand = [...dealerHand];

    while (calculateScore(dHand) < 17) {
      dHand.push(tempDeck.pop()!);
    }

    setDealerHand(dHand);
    const pScore = calculateScore(playerHand);
    const dScore = calculateScore(dHand);

    if (dScore > 21 || pScore > dScore) {
      endGame(playerHand, dHand, 'YOU WIN! คุณชนะเจ้ามือ 🏆', currentBet * 2);
    } else if (pScore === dScore) {
      endGame(playerHand, dHand, 'PUSH! เสมอกัน ได้ชิปคืน 🤝', currentBet);
    } else {
      endGame(playerHand, dHand, 'DEALER WINS! เจ้ามือชนะ ❌', 0);
    }
  };

  const doubleBet = () => {
    if (chips < currentBet) return alert('ชิปไม่พอสำหรับ Double');
    setChips((prev) => prev - currentBet);
    const doubleBetVal = currentBet * 2;
    setCurrentBet(doubleBetVal);

    const tempDeck = [...deck];
    const newCard = tempDeck.pop()!;
    const updatedHand = [...playerHand, newCard];
    setPlayerHand(updatedHand);

    const pScore = calculateScore(updatedHand);
    if (pScore > 21) {
      endGame(updatedHand, dealerHand, 'BUSTED! แต้มเกิน 21 คุณแพ้ ❌', 0);
      return;
    }

    let dHand = [...dealerHand];
    while (calculateScore(dHand) < 17) {
      dHand.push(tempDeck.pop()!);
    }
    setDealerHand(dHand);

    const dScore = calculateScore(dHand);
    if (dScore > 21 || pScore > dScore) {
      endGame(updatedHand, dHand, 'YOU WIN! คุณชนะ DOUBLE 🏆', doubleBetVal * 2);
    } else if (pScore === dScore) {
      endGame(updatedHand, dHand, 'PUSH! เสมอกัน 🤝', doubleBetVal);
    } else {
      endGame(updatedHand, dHand, 'DEALER WINS! เจ้ามือชนะ ❌', 0);
    }
  };

  const endGame = (pHand: Card[], dHand: Card[], resultMsg: string, payout: number) => {
    setGameState('ended');
    setGameResult(resultMsg);
    setChips((prev) => prev + payout);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-950 font-sans p-0 sm:p-4 text-slate-100">
      <div className="w-full max-w-md h-[100vh] sm:h-[880px] bg-[#0b0e14] sm:rounded-[36px] shadow-2xl flex flex-col justify-between overflow-hidden border border-slate-800/80 relative">
        
        {/* HEADER */}
        <header className="px-4 py-3 bg-[#121721] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1.5 text-slate-400 hover:text-white bg-slate-900 rounded-full border border-slate-800">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>ห้องพูดคุยสาธารณะ & ข้อเสนอแนะ</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h2>
              <p className="text-[10px] text-slate-400">พูดคุยและเล่นมินิเกมสดร่วมกัน</p>
            </div>
          </div>

          <button 
            onClick={() => {
              setShowGameModal(true);
              if (activeMiniGame === 'none') setActiveMiniGame('blackjack');
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition"
          >
            <Gamepad2 className="w-4 h-4" /> มินิเกม
          </button>
        </header>

        {/* JOIN SCREEN FOR CHAT */}
        {!hasJoinedChat ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-950 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2">
              <Gamepad2 className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-black text-white">เข้าสู่ห้องพูดคุยสาธารณะ</h2>
            <p className="text-xs text-slate-400 max-w-xs">
              ตั้งชื่อเล่นของคุณเพื่อพูดคุย ส่งข้อความเสียง และประลองมินิเกม Blackjack
            </p>
            <input
              type="text"
              placeholder="ตั้งชื่อเล่นของคุณ..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full max-w-xs px-4 py-3 bg-[#121721] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 text-center"
            />
            <button
              onClick={() => {
                if (!username.trim()) return alert('กรุณากรอกชื่อเล่นก่อนเข้าห้อง');
                setHasJoinedChat(true);
              }}
              className="w-full max-w-xs py-3.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20"
            >
              เข้าสู่ห้องแชท 💬
            </button>
          </div>
        ) : (
          /* MESSAGES LIST */
          <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 text-xs bg-slate-950 font-sans">
            {messages.map((m) => {
              const isMe = m.sender_id === username;
              const isVoice = m.content.startsWith('[VOICE]:');
              const audioUrl = isVoice ? m.content.replace('[VOICE]:', '') : '';

              return (
                <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-slate-400 mb-1 px-1">{m.sender_id}</span>
                  <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs ${
                    isMe ? 'bg-amber-500 text-slate-950 font-medium' : 'bg-[#121721] text-white border border-slate-800'
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
        )}

        {/* INPUT BAR WITH MINI-GAME BUTTON NEXT TO MIC */}
        {hasJoinedChat && (
          <form onSubmit={handleSendMessage} className="p-3 bg-[#121721] border-t border-slate-800 flex items-center gap-2 shrink-0">
            {/* 🟢 ปุ่มเปิดมินิเกมข้างปุ่มไมค์ */}
            <button
              type="button"
              onClick={() => setShowGameModal(true)}
              className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 hover:bg-amber-500/20 transition"
              title="เปิดมินิเกม"
            >
              <Gamepad2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 flex items-center justify-center shrink-0"
              title="อัดเสียง"
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              type="text"
              placeholder="พิมพ์ข้อความ..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            />
            
            <button type="submit" className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* --- MINI GAME MODAL (BLACKJACK UI EXPLICITLY MATCHING REFERENCE SCREENSHOTS) --- */}
        {showGameModal && (
          <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col justify-between p-3 backdrop-blur-md animate-in zoom-in-95 duration-200">
            
            {/* MINI GAME HEADER & CHIP BALANCE */}
            <div className="flex justify-between items-center z-10">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-500/20 border border-emerald-400/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Chip Balance</span>
                  <span className="text-sm font-black text-emerald-400">${chips}</span>
                </div>
                <button 
                  onClick={() => setChips((prev) => prev + 500)} 
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-bold text-amber-400 hover:bg-slate-800"
                >
                  + Free $500
                </button>
              </div>

              <button 
                onClick={() => setShowGameModal(false)}
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* BLACKJACK TABLE VIEW (POLYGON TABLE) */}
            <div className="flex-1 my-2 bg-gradient-to-b from-slate-900 to-[#0d121c] border-2 border-slate-800 rounded-[32px] p-4 flex flex-col justify-between relative overflow-hidden shadow-2xl">
              
              {/* Hexagon Table Contour Line */}
              <div className="absolute inset-4 border border-emerald-500/20 rounded-[28px] pointer-events-none flex items-center justify-center">
                <span className="text-[40px] font-black text-white/5 tracking-widest select-none">BLACKJACK</span>
              </div>

              {/* GAME LOBBY PHASE */}
              {gameState === 'lobby' && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 z-10">
                  <div className="w-16 h-20 bg-slate-800 border-2 border-slate-600 rounded-xl flex items-center justify-center shadow-2xl rotate-6">
                    <span className="text-2xl">♠</span>
                  </div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">Pure Blackjack</h3>
                  <button
                    onClick={startNewBlackjack}
                    className="px-10 py-3.5 bg-white text-slate-950 text-xs font-black rounded-xl shadow-xl hover:bg-slate-200 active:scale-95 transition tracking-widest"
                  >
                    JOIN GAME
                  </button>
                </div>
              )}

              {/* GAME BETTING PHASE (UI MATCHING IMAGE 2) */}
              {gameState === 'betting' && (
                <div className="flex-1 flex flex-col justify-between items-center z-10 py-2">
                  <div className="text-center">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">วางเงินเดิมพันของคุณ</span>
                    <h3 className="text-2xl font-black text-emerald-400 mt-0.5">${currentBet}</h3>
                  </div>

                  {/* Circular Chip Selection (Matching Pure Poker Chips) */}
                  <div className="flex flex-wrap justify-center gap-3 max-w-[260px]">
                    {[
                      { val: 5, color: 'bg-rose-600 border-white text-white' },
                      { val: 25, color: 'bg-blue-600 border-white text-white' },
                      { val: 100, color: 'bg-emerald-600 border-white text-white' },
                      { val: 500, color: 'bg-amber-500 border-slate-950 text-slate-950' },
                      { val: 5000, color: 'bg-purple-600 border-white text-white' }
                    ].map((chip) => (
                      <button
                        key={chip.val}
                        onClick={() => addBet(chip.val)}
                        className={`w-12 h-12 rounded-full border-2 ${chip.color} text-xs font-black flex items-center justify-center shadow-lg active:scale-90 transition transform hover:scale-105`}
                      >
                        ${chip.val}
                      </button>
                    ))}
                  </div>

                  {/* Action Controls for Betting */}
                  <div className="flex gap-2 w-full max-w-xs">
                    <button
                      onClick={clearBet}
                      className="flex-1 py-2.5 bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300 rounded-xl hover:text-white"
                    >
                      CLEAR
                    </button>
                    <button
                      onClick={allInBet}
                      className="flex-1 py-2.5 bg-rose-500/20 border border-rose-500/40 text-xs font-bold text-rose-400 rounded-xl hover:bg-rose-500/30"
                    >
                      ALL-IN
                    </button>
                    <button
                      onClick={dealCards}
                      className="flex-1 py-2.5 bg-emerald-500 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 transition"
                    >
                      READY
                    </button>
                  </div>
                </div>
              )}

              {/* GAMEPLAY & ENDED PHASE (UI MATCHING IMAGE 3) */}
              {(gameState === 'playing' || gameState === 'ended') && (
                <div className="flex-1 flex flex-col justify-between z-10 py-1">
                  
                  {/* DEALER AREA */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      DEALER ({gameState === 'playing' ? '?' : calculateScore(dealerHand)})
                    </span>
                    <div className="flex gap-2 justify-center">
                      {dealerHand.map((c, i) => (
                        <div
                          key={i}
                          className={`w-12 h-16 rounded-lg border-2 border-slate-700 flex flex-col items-center justify-center text-xs font-black shadow-lg ${
                            i === 1 && gameState === 'playing'
                              ? 'bg-slate-800 text-slate-600'
                              : ['♥', '♦'].includes(c.suit) ? 'bg-white text-rose-600' : 'bg-white text-slate-900'
                          }`}
                        >
                          {i === 1 && gameState === 'playing' ? (
                            <span className="text-lg">🂠</span>
                          ) : (
                            <>
                              <span>{c.value}</span>
                              <span className="text-sm">{c.suit}</span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CENTER ACTION BUTTONS / RESULT OVERLAY */}
                  <div className="flex flex-col items-center justify-center my-auto">
                    {gameState === 'playing' ? (
                      <div className="flex flex-col gap-2 w-32">
                        <button
                          onClick={hitCard}
                          className="w-full py-2 bg-white text-slate-950 font-black text-xs rounded-xl shadow-lg hover:bg-slate-200 active:scale-95 transition tracking-widest"
                        >
                          HIT
                        </button>
                        <button
                          onClick={standTurn}
                          className="w-full py-2 bg-slate-900 border border-slate-700 text-white font-black text-xs rounded-xl hover:bg-slate-800 active:scale-95 transition tracking-widest"
                        >
                          STAND
                        </button>
                        {playerHand.length === 2 && (
                          <button
                            onClick={doubleBet}
                            className="w-full py-2 bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:bg-amber-400 active:scale-95 transition tracking-widest"
                          >
                            DOUBLE
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl text-center space-y-2 backdrop-blur-md">
                        <h4 className="text-sm font-black text-amber-400">{gameResult}</h4>
                        <button
                          onClick={startNewBlackjack}
                          className="px-6 py-2 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-lg"
                        >
                          เล่นอีกรอบ 🔄
                        </button>
                      </div>
                    )}
                  </div>

                  {/* PLAYER AREA */}
                  <div className="flex flex-col items-center">
                    <div className="flex gap-2 justify-center mb-1">
                      {playerHand.map((c, i) => (
                        <div
                          key={i}
                          className={`w-12 h-16 rounded-lg border-2 border-slate-700 flex flex-col items-center justify-center text-xs font-black shadow-lg ${
                            ['♥', '♦'].includes(c.suit) ? 'bg-white text-rose-600' : 'bg-white text-slate-900'
                          }`}
                        >
                          <span>{c.value}</span>
                          <span className="text-sm">{c.suit}</span>
                        </div>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-emerald-400">
                      PLAYER ({calculateScore(playerHand)}) • เดิมพัน ${currentBet}
                    </span>
                  </div>

                </div>
              )}

            </div>

            {/* MINI GAME FOOTER BAR */}
            <div className="flex justify-between items-center text-[10px] text-slate-400 px-2">
              <span>Pure Blackjack Table</span>
              <button onClick={() => setActiveMiniGame('blackjack')} className="text-amber-400 font-bold hover:underline">
                มินิเกมเพิ่มเติม (เร็วๆ นี้)
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
