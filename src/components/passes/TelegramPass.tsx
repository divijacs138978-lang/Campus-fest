import React from 'react';
import { CampusPass } from '../../types';
import { QRCodeDisplay } from '../QRCodeDisplay';
import { ImportantStamp, MailRoutingBarcode } from '../PostalDecorations';

interface Props {
  pass: CampusPass;
  className?: string;
}

export const TelegramPass: React.FC<Props> = ({ pass, className = '' }) => {
  return (
    <div className={`relative inline-block select-none ${className}`}>
      {/* Narrow Telegram Paper Strip */}
      <div className="relative w-[340px] sm:w-[480px] bg-[#F8EFE0] border-y-4 border-dashed border-[#2A1A14] border-x-[3px] border-x-[#2A1A14] p-6 shadow-[5px_5px_0px_#2A1A14] font-typewriter space-y-4">
        {/* Telegram Header */}
        <div className="flex items-center justify-between border-b-2 border-[#2A1A14] pb-3">
          <div className="flex items-center gap-2">
            <span className="bg-[#2A1A14] text-[#FFF6E5] px-2 py-0.5 text-xs font-black tracking-widest uppercase">
              CAMPUS DISPATCH WIRE
            </span>
            <ImportantStamp text="CONFIRMED" className="text-[10px]" />
          </div>
          <span className="text-[11px] font-bold text-[#8E2A2A]">
            SLOT #{pass.seatNo}
          </span>
        </div>

        {/* Telegram Content Body */}
        <div className="space-y-3 text-sm text-[#2A1A14] uppercase leading-relaxed font-bold">
          <div className="p-3 bg-[#F3E6CE] border border-[#2A1A14]/30 space-y-1">
            <p className="text-xs text-[#2A1A14]/70">
              STUDENT: {pass.studentName} // ROLL: {pass.studentRollNumber}
            </p>
            <p className="text-xs text-[#2A1A14]/70">
              DEPT: {pass.studentDepartment} ({pass.studentYear})
            </p>
          </div>

          <div className="text-base tracking-wide border-l-4 border-[#8E2A2A] pl-3 py-1">
            STOP. REGISTRATION CONFIRMED FOR {pass.eventTitle}. STOP.
          </div>

          <div className="text-xs space-y-1 pl-3 opacity-90">
            <p>DATE: {pass.eventDate} AT {pass.eventTime}. STOP.</p>
            <p>VENUE: {pass.eventVenue}. STOP.</p>
            <p>PRESENT THIS STAMPED WIRE AT CHECK-IN DESK. STOP.</p>
          </div>
        </div>

        {/* Perforated Stub Line */}
        <div className="pt-2 border-t-2 border-dashed border-[#2A1A14] flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-[#2A1A14]/60 tracking-wider block">
              ENTRY VERIFICATION CODE:
            </span>
            <span className="text-sm font-black text-[#8E2A2A] tracking-wider block">
              {pass.code}
            </span>
            <MailRoutingBarcode code={pass.code} className="w-36 pt-1" />
          </div>

          <div className="bg-white p-2 border-2 border-[#2A1A14] shadow-[2px_2px_0px_#2A1A14] rounded-lg">
            <QRCodeDisplay
              text={JSON.stringify({ code: pass.code, eventId: pass.eventId })}
              size={80}
              fgColor="#2A1A14"
              bgColor="#FFFFFF"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
