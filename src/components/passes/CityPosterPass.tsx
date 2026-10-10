import React from 'react';
import { CampusPass } from '../../types';
import { QRCodeDisplay } from '../QRCodeDisplay';
import { PointingHand, ImportantStamp } from '../PostalDecorations';

interface Props {
  pass: CampusPass;
  className?: string;
}

export const CityPosterPass: React.FC<Props> = ({ pass, className = '' }) => {
  return (
    <div className={`relative inline-block select-none ${className}`}>
      {/* 9:16 City Poster Container */}
      <div className="relative w-[340px] h-[604px] sm:w-[350px] sm:h-[622px] rounded-3xl overflow-hidden city-bg border-[3.5px] border-[#2A1A14] shadow-[8px_8px_0px_#2A1A14] flex flex-col justify-between p-5 text-[#FFF6E5]">
        {/* City Facade Silhouette Background */}
        <div className="absolute inset-0 city-facade opacity-40 pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 text-center space-y-1">
          <div className="flex items-center justify-between pb-1 border-b border-[#FFF6E5]/20">
            <span className="font-typewriter text-[10px] tracking-widest uppercase text-[#FFF6E5]/80">
              CAMPUS POST // STORY DISPATCH
            </span>
            <ImportantStamp text="CONFIRMED" className="text-[9px]" />
          </div>

          <p className="font-script text-3xl sm:text-4xl text-[#FFF6E5] leading-none pt-2">
            Campus Event Pass
          </p>
        </div>

        {/* Middle Envelope Block with Event Title & Pointing Hands */}
        <div className="relative z-10 my-auto space-y-3">
          <div className="flex items-center justify-start gap-2 -mb-1">
            <PointingHand direction="right" className="w-10 h-5" />
            <span className="font-typewriter text-[11px] font-bold tracking-widest text-[#FFF6E5] uppercase bg-[#2A1A14] px-2 py-0.5 border border-[#FFF6E5]/40 shadow-[2px_2px_0px_#2A1A14]">
              OFFICIAL ENTRY TICKET
            </span>
          </div>

          {/* Kraft Envelope Box with Event Title */}
          <div className="relative bg-[#A98258] border-[3px] border-[#2A1A14] rounded-2xl p-4 shadow-[4px_4px_0px_#2A1A14] text-center transform -rotate-1">
            <div className="border border-dashed border-[#FFF6E5]/50 rounded-xl p-3 bg-[#8B6A47]/40">
              <span className="font-typewriter text-[9px] text-[#FFF6E5] tracking-widest uppercase block mb-1">
                REGISTERED STUDENT:
              </span>
              <h2 className="font-display font-black text-2xl text-[#FFF6E5] leading-tight uppercase tracking-tight text-retro-outline-plum">
                {pass.eventTitle}
              </h2>
              <div className="font-script text-2xl text-[#FFF6E5] mt-1">
                {pass.studentName}
              </div>
              <div className="font-typewriter text-[11px] text-[#F3E6CE] mt-0.5 font-bold">
                {pass.studentRollNumber} • {pass.studentDepartment}
              </div>
            </div>
          </div>

          {/* Date & Venue on Kraft Boxes */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Box 1: Time & Date */}
            <div className="bg-[#F3E6CE] text-[#2A1A14] border-2 border-[#2A1A14] rounded-xl p-2.5 shadow-[2px_2px_0px_#2A1A14] font-typewriter text-center">
              <span className="text-[9px] font-black uppercase text-[#8E2A2A] block">SCHEDULE:</span>
              <span className="font-black text-xs block leading-tight">{pass.eventDate}</span>
              <span className="text-[11px] font-bold text-[#8A1F6E] block mt-0.5">{pass.eventTime}</span>
            </div>

            {/* Box 2: Venue */}
            <div className="bg-[#F3E6CE] text-[#2A1A14] border-2 border-[#2A1A14] rounded-xl p-2.5 shadow-[2px_2px_0px_#2A1A14] font-typewriter text-center">
              <span className="text-[9px] font-black uppercase text-[#8E2A2A] block">LOCATION:</span>
              <span className="font-black text-xs block truncate">{pass.eventVenue}</span>
              <span className="text-[10px] text-[#2A1A14]/70 block truncate">CAMPUS PREMISES</span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Circular Postmark Stamp QR & Verification */}
        <div className="relative z-10 pt-3 border-t border-[#FFF6E5]/20 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <PointingHand direction="up" className="w-8 h-4" />
              <span className="font-typewriter text-[10px] text-[#FFF6E5] tracking-widest uppercase font-bold">
                DOOR STAMP
              </span>
            </div>
            <div className="font-typewriter text-xs font-black text-[#FFF6E5] tracking-wider">
              {pass.code}
            </div>
            <div className="font-typewriter text-[9px] text-[#FFF6E5]/60">
              SLOT #{pass.seatNo} • NON-TRANSFERABLE
            </div>
          </div>

          {/* QR inside circular postmark container */}
          <div className="shrink-0 relative p-1.5 rounded-2xl bg-[#F3E6CE] border-2 border-[#2A1A14] shadow-[3px_3px_0px_#2A1A14]">
            <QRCodeDisplay
              text={JSON.stringify({ regId: pass.code, eventId: pass.eventId, email: pass.studentEmail })}
              size={76}
              fgColor="#2A1A14"
              bgColor="#F3E6CE"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
