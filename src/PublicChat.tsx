import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Send, Users, ShieldCheck, MessageSquare, Loader2 } from 'lucide-react';

const SUPABASE_URL = 'https://wvqdueookxtkposaeuuu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pEF2JfLNNVNSqP2EkWfLQA_07HIg3xu';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface PublicMessage {
  id: number;
  user_id: string;
  display_name: string;
  faculty: string;
  avatar_url: string;
  content: string;
  created_at: string;
}

export default function PeanutsPublicChat({ session, myProfile }: { session: any; myProfile: any }) {
  const [messages, setMessages] = useState<PublicMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPublicMessages();

    // ฟังเหตุการณ์ข้อความใหม่แบบ Realtime ผ่าน Supabase Broadcast/Postgres Changes
    const channel = supabase
      .channel('public_chat_room')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'public_messages' },
        (payload) => {
          const newMsg = payload.new as PublicMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchPublicMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('public_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100);

    if (!error && data) {
      setMessages(data);
    }
    setLoading(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || sending || !session?.user) return;

    const textToSend = chatInput.trim();
    setChatInput('');
    setSending(true);

    const { error } = await supabase.from('public_messages').insert({
      user_id: session.user.id,
      display_name: myProfile?.display_name || 'นิสิต KU KPS',
      faculty: myProfile?.faculty || 'ไม่ระบุ',
      avatar_url: myProfile?.avatar_url || (myProfile?.photos && myProfile.photos[0]) || '',
      content: textToSend
    });

    setSending(false);
    if (error) {
      alert('ส่งข้อความไม่สำเร็จ: ' + error.message);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans">
      {/* Header ห้องแชทสาธารณะ */}
      <header className="px-4 py-3 bg-[#121721] border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>ลานไทร พูดคุยสาธารณะ</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h2>
            <p className="text-[10px] text-slate-400">พื้นที่รวมนิสิต ม.เกษตร กำแพงแสน</p>
          </div>
        </div>
        <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
          <ShieldCheck className="w-3 h-3" /> @ku.th Only
        </span>
      </header>

      {/* รายการข้อความแชท */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b0e14]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            <span>กำลังโหลดข้อความ...</span>
          </div>
        ) : messages.length > 0 ? (
          messages.map((m) => {
            const isMe = m.user_id === session?.user?.id;

            return (
              <div key={m.id} className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* รูป Avatar */}
                <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-slate-700/80">
                  {m.avatar_url ? (
                    <img src={m.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-bold bg-slate-800">
                      {m.display_name ? m.display_name.substring(0, 1) : 'U'}
                    </div>
                  )}
                </div>

                {/* ข้อความและรายละเอียดผู้ส่ง */}
                <div className={`max-w-[78%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[11px] font-bold text-slate-300">{m.display_name}</span>
                    {m.faculty && (
                      <span className="text-[9px] text-amber-400/90 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                        {m.faculty}
                      </span>
                    )}
                  </div>

                  <div
                    className={`px-3.5 py-2 rounded-2xl text-xs break-all leading-relaxed ${
                      isMe
                        ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none'
                        : 'bg-[#121721] text-white border border-slate-800 rounded-tl-none shadow-md'
                    }`}
                  >
                    {m.content}
                  </div>

                  <span className="text-[9px] text-slate-500 mt-1 px-1">
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs gap-2">
            <MessageSquare className="w-8 h-8 text-slate-700" />
            <span>ยังไม่มีข้อความในห้องแชทสาธารณะ ทักทายเพื่อนๆ เป็นคนแรกเลย!</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      {/* ช่องส่งข้อความ */}
      <form onSubmit={handleSendMessage} className="p-3 bg-[#121721] border-t border-slate-800/80 flex items-center gap-2">
        <input
          type="text"
          placeholder="พิมพ์ข้อความทักทายเพื่อนๆ ใน ม.เกษตร..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition font-sans"
        />
        <button
          type="submit"
          disabled={!chatInput.trim() || sending}
          className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-bold flex items-center justify-center shrink-0 disabled:opacity-40 transition"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
