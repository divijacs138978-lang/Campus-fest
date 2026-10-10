import React from 'react';
import { CampusPass } from '../../types';
import { QRCodeDisplay } from '../QRCodeDisplay';
import { RoundRubberStamp, PostageStamp, PaperClip } from '../PostalDecorations';

interface Props {
  pass: CampusPass;
  className?: string;
}

export const CampusIdPass: React.FC<Props> = ({ pass, className = '' }) => {
  const initials = pass.studentName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className={`relative inline-block select-none ${className}`}>
      {/* Kraft ID Card with Lanyard Slot */}
      <div className="relative w-[340px] sm:w-[390px] bg-[#A98258] border-[3.5px] border-[#2A1A14] rounded-3xl p-4 shadow-[6px_6px_0px_#2A1A14]">
        {/* Lanyard Hole Clip Graphic */}
        <div className="mx-auto w-16 h-4 bg-[#2A1A14] rounded-full border-2 border-[#F3E6CE] flex items-center justify-center -mt-2 mb-3">
          <div className="w-8 h-1.5 bg-[#FFF6E5] rounded-full opacity-60" />
        </div>

        {/* Paper Clip in corner */}
        <div className="absolute top-2 left-4 z-20">
          <PaperClip />
        </div>

        {/* Inner Cream Card Body */}
        <div className="bg-[#F3E6CE] border-2 border-[#2A1A14] rounded-2xl p-5 space-y-4">
          {/* Top Institution & Stamp Header */}
          <div className="flex items-start justify-between border-b-2 border-dashed border-[#2A1A14]/30 pb-3">
            <div>
              <span className="font-typewriter text-[9px] text-[#8E2A2A] font-black uppercase tracking-widest block">
                ★ CAMPUS POST // STUDENT ACCESS ID ★
              </span>
              <span className="font-typewriter text-xs font-black text-[#2A1A14] block mt-0.5">
                PASS #{pass.seatNo} • {pass.studentYear}
              </span>
            </div>
            <PostageStamp price="CAMPUS" title="ENTRY" color="#8E2A2A" className="w-10 h-12" />
          </div>

          {/* Student Avatar + Roll Number & Department */}
          <div className="flex items-center gap-3 bg-[#FFF6E5] p-3 rounded-xl border-2 border-[#2A1A14] shadow-[2px_2px_0px_#2A1A14]">
            {/* Initials Avatar */}
            <div className="w-14 h-14 rounded-xl bg-[#8E2A2A] text-[#FFF6E5] border-2 border-[#2A1A14] flex items-center justify-center font-display text-xl font-black shrink-0">
              {initials}
            </div>

            <div className="min-w-0 font-typewriter">
              <span className="font-display font-black text-lg text-[#2A1A14] leading-tight block truncate">
                {pass.studentName}
              </span>
              <span className="text-xs font-black text-[#8E2A2A] block">
                ROLL: {pass.studentRollNumber}
              </span>
              <span className="text-[10px] text-[#2A1A14]/75 block truncate">
                {pass.studentDepartment}
              </span>
            </div>
          </div>

          {/* Event Details Box */}
          <div className="p-3 bg-[#A98258]/25 border-2 border-[#2A1A14] rounded-xl font-typewriter text-xs text-[#2A1A14] space-y-1">
            <span className="text-[9px] font-black text-[#8E2A2A] uppercase block">
              ADMITTED EVENT:
            </span>
            <span className="font-display font-black text-base text-[#2A1A14] leading-tight block">
              {pass.eventTitle}
            </span>
            <div className="text-[11px] pt-1 border-t border-[#2A1A14]/20 flex justify-between font-bold">
              <span>{pass.eventDate}</span>
              <span className="text-[#8E2A2A]">{pass.eventTime}</span>
            </div>
            <span className="text-[10px] opacity-75 block truncate">{pass.eventVenue}</span>
          </div>

          {/* Round "ENTRY CONFIRMED" Stamp + QR */}
          <div className="pt-2 border-t-2 border-dashed border-[#2A1A14]/30 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <RoundRubberStamp
                text="ENTRY CONFIRMED"
                subtext="VERIFIED"
                color="olive"
                className="w-22 h-22"
              />
              <div className="font-typewriter text-xs font-black text-[#8E2A2A] tracking-wider pt-1">
                {pass.code}
              </div>
            </div>

            <div className="shrink-0 bg-white p-2 rounded-xl border-2 border-[#2A1A14] shadow-[2px_2px_0px_#2A1A14]">
              <QRCodeDisplay
                text={JSON.stringify({ regId: pass.code, eventId: pass.eventId, email: pass.studentEmail })}
                size={80}
                fgColor="#2A1A14"
                bgColor="#FFFFFF"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
