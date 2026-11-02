import React from 'react';
import { 
  Flame, ShieldCheck, Heart, AlertTriangle, CheckCircle2, 
  Users, ArrowRight, BookOpen, Lock, MessageSquare 
} from 'lucide-react';

export default function PeanutsLanding({ 
  onStart, 
  onPublicChat 
}: { 
  onStart: () => void; 
  onPublicChat: () => void; 
}) {
  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-900 font-sans p-0 sm:p-4 text-slate-100">
      <div className="w-full max-w-md h-[100vh] sm:h-[880px] bg-slate-950 sm:rounded-3xl shadow-2xl flex flex-col overflow-y-auto border border-slate-800 relative">
        
        {/* HERO HEADER */}
        <div className="p-6 pt-10 text-center flex flex-col items-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800/60">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4 animate-pulse">
            <Flame className="w-9 h-9 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-amber-400 via-orange-300 to-emerald-400 bg-clip-text text-transparent">
            Peanuts KU KPS
          </h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> สังคมนิสิต ม.เกษตรศาสตร์ กำแพงแสน
          </p>
        </div>

        {/* CONTENT BODY */}
        <div className="p-5 flex-1 flex flex-col gap-5">

          {/* OBJECTIVES */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" /> วัตถุประสงค์ของแอปพลิเคชัน
            </h2>
            <ul className="text-xs text-slate-300 leading-relaxed space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>เพื่อเป็นพื้นที่พบปะ พูดคุย และหาเพื่อนใหม่สำหรับนิสิต KU KPS</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>เชื่อมต่อนิสิตที่มีไลฟ์สไตล์ งานอดิเรก หรือความสนใจตรงกัน</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>สร้างสังคมออนไลน์ที่ปลอดภัยเฉพาะภายในมหาลัย ยืนยันตัวตนด้วยอีเมล @ku.th</span>
              </li>
            </ul>
          </div>

          {/* RULES */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
            <h2 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" /> กฎข้อบังคับและข้อห้าม
            </h2>
            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-rose-500/20 text-rose-200">
                ⚠️ ห้ามใช้รูปภาพส่อไปในทางอนาจาร ลามก หรือแอบอ้างเป็นผู้อื่นเด็ดขาด
              </div>
              <ul className="space-y-1.5 pl-1 list-disc list-inside text-slate-400 text-[11px]">
                <li>ห้ามใช้ถ้อยคำคุกคาม บูลลี่ หรือสร้างความเกลียดชัง</li>
                <li>ห้ามใช้แอปพลิเคชันเพื่อการซื้อขายของผิดกฎหมายหรือการพนัน</li>
                <li>หากพบการทำผิดกฎ บัญชีจะถูกระงับการใช้งานทันที</li>
              </ul>
            </div>
          </div>

          {/* PRIVACY NOTE */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-[11px] text-emerald-300 leading-tight">
              ข้อมูลของคุณจะถูกเก็บเป็นความลับและเปิดเผยเฉพาะกับคู่ Match ในระบบเท่านั้น
            </p>
          </div>

        </div>

        {/* FOOTER CTA BUTTONS */}
        <div className="p-5 bg-slate-950/90 border-t border-slate-800/80 sticky bottom-0 z-10 flex flex-col gap-2.5">
          {/* ปุ่มที่ 1: เข้าใช้งานแอปหลัก (ต้อง ยืนยัน OTP) */}
          <button 
            onClick={onStart}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs hover:opacity-90 active:scale-95 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <span>ยอมรับเงื่อนไขและเข้าสู่ระบบจับคู่</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* ปุ่มที่ 2: ปุ่มใหม่ เข้าห้องแชทสาธารณะ (ไม่ต้อง Login) */}
          <button 
            onClick={onPublicChat}
            className="w-full py-3 rounded-2xl bg-slate-900 border border-amber-500/40 text-amber-300 font-bold text-xs hover:bg-slate-800 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span>ห้องแชทสาธารณะ & ข้อเสนอแนะ (ไม่ต้องล็อกอิน)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
