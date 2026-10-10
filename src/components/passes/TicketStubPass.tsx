import React from 'react';
import { CampusPass } from '../../types';
import { QRCodeDisplay } from '../QRCodeDisplay';
import { PostageStamp, RoundRubberStamp } from '../PostalDecorations';

interface Props {
  pass: CampusPass;
  className?: string;
}

export const TicketStubPass: React.FC<Props> = ({ pass, className = '' }) => {
  return (
    <div className={`relative inline-block select-none ${className}`}>
      {/* Horizontal Ticket Stub with Perforated Tear-off */}
      <div className="relative w-[340px] sm:w-[580px] md:w-[640px] bg-[#F3E6CE] border-[3.5px] border-[#2A1A14] rounded-3xl p-5 sm:p-6 shadow-[6px_6px_0px_#2A1A14] flex flex-col sm:flex-row gap-5">
        {/* Main Ticket Section */}
        <div className="flex-1 flex flex-col justify-between space-y-3">
          <div className="border-b-2 border-dashed border-[#2A1A14]/20 pb-2">
            <span className="font-typewriter text-[10px] text-[#8E2A2A] font-black tracking-widest uppercase">
              ★ CAMPUS POST OFFICIAL EVENT TICKET ★
            </span>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-[#2A1A14] uppercase leading-tight mt-1">
              {pass.eventTitle}
            </h3>
          </div>

          {/* Student Info */}
          <div className="space-y-1 font-typewriter">
            <div className="text-xs text-[#2A1A14]">
              <span className="opacity-70 font-bold">NAME: </span>
              <span className="font-display font-black text-base">{pass.studentName}</span>
            </div>
            <div className="text-xs text-[#8E2A2A] font-black">
              ROLL NO: {pass.studentRollNumber} • {pass.studentDepartment}
            </div>
          </div>

          {/* Date on Magenta label + Venue on Kraft block */}
          <div className="space-y-2 pt-1">
            <div className="inline-block bg-[#8A1F6E] text-[#FFF6E5] border-2 border-[#2A1A14] px-3 py-1 font-typewriter text-xs font-bold tracking-wider shadow-[2px_2px_0px_#2A1A14]">
              {pass.eventDate} • {pass.eventTime}
            </div>

            <div className="bg-[#A98258]/30 border-2 border-[#2A1A14] p-2.5 rounded-xl font-typewriter text-xs text-[#2A1A14]">
              <span className="font-bold block truncate">{pass.eventVenue}</span>
            </div>
          </div>

          {/* Bottom Seal */}
          <div className="pt-2 flex items-center justify-between font-typewriter text-xs">
            <span className="font-black text-[#5B7A3A]">SEAT #{pass.seatNo} VERIFIED</span>
            <span className="text-[10px] opacity-70">VALID FOR SINGLE ENTRY</span>
          </div>
        </div>

        {/* Perforated Vertical Tear-Off Divider */}
        <div className="hidden sm:block w-0 border-r-2 border-dashed border-[#2A1A14]/40 my-1" />
        <div className="sm:hidden h-0 border-b-2 border-dashed border-[#2A1A14]/40 my-1" />

        {/* Tear-off Stub (QR + Verification Code) */}
        <div className="w-full sm:w-[200px] flex flex-col justify-between items-center text-center space-y-3">
          <div className="w-full flex items-center justify-between">
            <span className="font-typewriter text-[9px] font-black uppercase text-[#8E2A2A]">
              TEAR STUB
            </span>
            <PostageStamp price="PASS" title="SCAN" color="#5B7A3A" className="w-8 h-10" />
          </div>

          <div className="bg-white p-2 rounded-xl border-2 border-[#2A1A14] shadow-[2px_2px_0px_#2A1A14]">
            <QRCodeDisplay
              text={JSON.stringify({ regId: pass.code, eventId: pass.eventId, email: pass.studentEmail })}
              size={84}
              fgColor="#2A1A14"
              bgColor="#FFFFFF"
            />
          </div>

          <div className="font-typewriter">
            <span className="font-black text-xs text-[#8E2A2A] block tracking-wider">
              {pass.code}
            </span>
            <span className="text-[9px] opacity-70 block mt-0.5">
              CHECK-IN DESK SCAN
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
