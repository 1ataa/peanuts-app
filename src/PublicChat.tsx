import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Send, ArrowLeft, MessageSquare, Users, Sparkles, Terminal } from 'lucide-react';

const SUPABASE_URL = 'https://wvqdueookxtkposaeuuu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pEF2JfLNNVNSqP2EkWfLQA_07HIg3xu';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function PublicChat({ onBack }: { onBack: () => void }) {
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState<Array<{ id: number; username: TEXT; content: TEXT; created_at: string }>>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ดึงข้อความเก่า และเปิด Realtime Subscription
  useEffect(() => {
    if (!isJoined) return;

    fetchMessages();

    const channel = supabase
      .channel('public_chat_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'public_chat_messages' },
        (payload) => {
          const newMsg = payload.new as any;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isJoined]);

  // เลื่อนจอลงล่างสุดอัตโนมัติเมื่อมีข้อความใหม่
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('public_chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100);

    if (data) {
      setMessages(data as any);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsJoined(true);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const msgToSend = inputMsg.trim();
    setInputMsg('');

    await supabase.from('public_chat_messages').insert({
      username: username.trim(),
      content: msgToSend
    });
  };

  // 1. หน้าตั้งชื่อ Username ก่อนเข้าห้องแชท
  if (!isJoined) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-900 font-sans p-0 sm:p-4 text-slate-100">
        <div className="w-full max-w-md h-[100vh] sm:h-[880px] bg-slate-950 sm:rounded-3xl shadow-2xl flex flex-col justify-between p-6 border border-slate-800">
          <div>
            <button onClick={onBack} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition">
              <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
            </button>

            <div className="text-center pt-10 pb-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/10">
                <Terminal className="w-7 h-7" />
              </div>
              <h1 className="text-xl font-bold text-white">ห้องพูดคุยสาธารณะ & ข้อเสนอแนะ</h1>
              <p className="text-xs text-slate-400 mt-1">ตั้งชื่อเล่นเพื่อเข้าห้องคุยสด โดยไม่ต้องล็อกอิน</p>
            </div>
          </div>

          <form onSubmit={handleJoin} className="space-y-4 my-auto">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium block">ชื่อเล่นของคุณ (Display Username)</label>
              <input
                type="text"
                required
                maxLength={20}
                placeholder="เช่น DekKPS_68 / หมูหยอง"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs rounded-xl hover:opacity-90 active:scale-95 transition shadow-lg shadow-amber-500/15"
            >
              เข้าสู่ห้องแชท 💬
            </button>
          </form>

          <div className="text-center text-[11px] text-slate-500 pb-2">
            พูดคุยอย่างสุภาพและงดใช้ถ้อยคำรุนแรง
          </div>
        </div>
      </div>
    );
  }

  // 2. หน้าห้องแชทสไตล์ IRC[cite: 12]
  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-900 font-sans p-0 sm:p-4 text-slate-100">
      <div className="w-full max-w-md h-[100vh] sm:h-[880px] bg-slate-950 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-800">
        
        {/* Header */}
        <header className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="p-1 text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                #public-square (ข้อเสนอแนะ)
              </h2>
              <span className="text-[10px] text-amber-400 font-mono">ใช้งานในชื่อ: {username}</span>
            </div>
          </div>
        </header>

        {/* Message Log Area */}
        <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 font-mono text-xs bg-slate-950">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed mb-2">
            💬 ยินดีต้อนรับสู่ห้องแชทสาธารณะ! สามารถพูดคุยแลกเปลี่ยน หรือพิมพ์ข้อเสนอแนะฟีเจอร์สำหรับพัฒนา Peanuts KU KPS ได้ที่นี่เลยครับ
          </div>

          {messages.map((m) => {
            const isMe = m.username === username;
            const timeStr = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={m.id} className="flex items-start gap-1.5 leading-relaxed py-0.5">
                <span className="text-[10px] text-slate-600 shrink-0 font-sans">{timeStr}</span>
                <span className={`font-bold shrink-0 ${isMe ? 'text-amber-400' : 'text-emerald-400'}`}>
                  &lt;{m.username}&gt;
                </span>
                <span className="text-slate-200 break-all">{m.content}</span>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </main>

        {/* Send Input Form */}
        <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="พิมพ์ข้อความ / ข้อเสนอแนะ..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
          />
          <button type="submit" className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center hover:opacity-90 active:scale-95 transition">
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
