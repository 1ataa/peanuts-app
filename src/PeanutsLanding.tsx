import React from 'react';
import { ShieldCheck, ArrowRight, MessageSquare, BookOpen, AlertTriangle, Lock } from 'lucide-react';

export default function PeanutsLanding({ 
  onAccept, 
  onOpenPublicChat 
}: { 
  onAccept?: () => void; 
  onOpenPublicChat?: () => void; 
}) {
  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-950 font-sans p-0 sm:p-4 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      <div className="w-full max-w-md h-[100vh] sm:h-[880px] bg-[#0b0e14] sm:rounded-[36px] shadow-2xl flex flex-col justify-between overflow-hidden border border-slate-800/80 relative">
        
        {/* HEADER AREA */}
        <div className="p-6 text-center space-y-3 shrink-0 pt-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20">
            <span className="text-3xl">🔥</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Peanuts <span className="text-emerald-400">KU KPS</span>
          </h1>
          <p className="text-xs text-emerald-400 font-medium flex items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> สังคมนิสิต ม.เกษตรศาสตร์ กำแพงแสน
          </p>
        </div>

        {/* CONTENT BODY */}
        <div className="flex-1 overflow-y-auto px-6 space-y-4 text-xs font-sans">
          
          {/* วัตถุประสงค์ */}
          <div className="bg-[#121721] border border-slate-800 rounded-2xl p-4 space-y-2.5">
            <h3 className="font-bold text-amber-400 flex items-center gap-2 text-xs">
              <BookOpen className="w-4 h-4" /> วัตถุประสงค์ของแอปพลิเคชัน
            </h3>
            <ul className="space-y-2 text-slate-300 text-[11px] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 shrink-0">✓</span>
                <span>เพื่อเป็นพื้นที่พบปะ พูดคุย และหาเพื่อนใหม่สำหรับนิสิต KU KPS</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 shrink-0">✓</span>
                <span>เชื่อมต่อนิสิตที่มีไลฟ์สไตล์ งานอดิเรก หรือความสนใจตรงกัน</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 shrink-0">✓</span>
                <span>สร้างสังคมออนไลน์ที่ปลอดภัยเฉพาะภายในมหาวิทยาลัย ยืนยันตัวตนด้วยอีเมล @ku.th</span>
              </li>
            </ul>
          </div>

          {/* กฎข้อบังคับ */}
          <div className="bg-[#121721] border border-slate-800 rounded-2xl p-4 space-y-2.5">
            <h3 className="font-bold text-rose-400 flex items-center gap-2 text-xs">
              <AlertTriangle className="w-4 h-4" /> กฎข้อบังคับและข้อห้าม
            </h3>
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-[11px] text-rose-300 font-medium leading-relaxed">
              ⚠️ ห้ามใช้รูปภาพส่อไปในทางอนาจาร ลามก หรือแอบอ้างเป็นผู้อื่นเด็ดขาด
            </div>
            <ul className="space-y-1.5 text-slate-400 text-[11px] list-disc list-inside">
              <li>ห้ามใช้ถ้อยคำคุกคาม บูลลี่ หรือสร้างความเกลียดชัง</li>
              <li>ห้ามใช้แอปพลิเคชันเพื่อการซื้อขายของผิดกฎหมายหรือการพนัน</li>
              <li>หากพบการทำผิดกฎ บัญชีจะถูกระงับการใช้งานทันที</li>
            </ul>
          </div>

          {/* การรักษาความปลอดภัย */}
          <div className="bg-[#121721] border border-emerald-500/30 rounded-2xl p-3.5 flex items-center gap-3 text-emerald-400 text-[11px]">
            <Lock className="w-5 h-5 shrink-0" />
            <span>ข้อมูลของคุณจะถูกเก็บเป็นความลับและเปิดเผยเฉพาะกับคู่ Match ในระบบเท่านั้น</span>
          </div>

        </div>

        {/* BUTTONS FOOTER */}
        <div className="p-6 space-y-2.5 shrink-0 bg-[#0b0e14] border-t border-slate-900">
          <button
            onClick={onAccept}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
          >
            <span>ยอมรับเงื่อนไขและเข้าสู่ระบบจับคู่</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* 🟢 ปุ่มเข้าห้องแชทสาธารณะ (เปิดใช้ onClick เรียบร้อย) */}
          <button
            type="button"
            onClick={onOpenPublicChat}
            className="w-full py-3 bg-[#121721] border border-amber-500/40 text-amber-400 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-500/10 active:scale-95 transition"
          >
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span>ห้องแชทสาธารณะ & ข้อเสนอแนะ (ไม่ต้องล็อกอิน)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
