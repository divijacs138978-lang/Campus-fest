import React from 'react';
import { motion } from 'motion/react';
import { CampusEvent } from '../types';
import {
  PostageStamp,
  PaperClip,
  ImportantStamp,
} from './PostalDecorations';
import { ArrowRight, CheckCircle2, MapPin, Calendar, Users, ShieldCheck } from 'lucide-react';

interface Props {
  event: CampusEvent;
  isRegistered?: boolean;
  onOpenDetails: () => void;
  onQuickRegister: () => void;
  rotation?: string;
}

export const EnvelopeEventCard: React.FC<Props> = ({
  event,
  isRegistered = false,
  onOpenDetails,
  onQuickRegister,
  rotation = 'rotate-0',
}) => {
  const isFull = event.status === 'FULL' || event.registeredCount >= event.capacity;
  const isLive = event.status === 'LIVE';
  const spotsLeft = Math.max(0, event.capacity - event.registeredCount);
  const fillPercentage = Math.min(
    100,
    Math.round((event.registeredCount / event.capacity) * 100)
  );

  return (
    <motion.div
      whileHover={{ scale: 1.015, y: -5 }}
      onClick={onOpenDetails}
      className={`relative cursor-pointer select-none rounded-[30px] p-2 bg-[#A98258] border-[3px] border-[#2A1A14] shadow-[6px_6px_0px_#2A1A14] transition-all ${rotation}`}
    >
      {/* Bulletin Card Header with Stamp and Club ID */}
      <div className="relative bg-[#8B6A47] border-2 border-[#2A1A14] rounded-t-[26px] py-2 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PostageStamp price={event.category.toUpperCase()} title="CAMPUS" color={event.posterColor || '#8E2A2A'} className="w-8 h-10" />
          <div>
            <span className="font-typewriter text-[10px] text-[#FFF6E5] font-black tracking-widest uppercase block">
              POSTING #{event.id.replace('ev-', '').toUpperCase().slice(0, 10)}
            </span>
            <span className="font-typewriter text-[9px] text-[#FFF6E5]/80 block truncate max-w-[180px]">
              {event.organizerClub}
            </span>
          </div>
        </div>

        {/* Live / Status Stamp */}
        <div
          className={`font-typewriter text-[10px] font-black uppercase px-2.5 py-0.5 rounded border border-[#2A1A14] shadow-[1px_1px_0px_#2A1A14] ${
            isLive
              ? 'bg-[#5B7A3A] text-[#FFF6E5] animate-pulse'
              : event.status === 'OPEN'
              ? 'bg-[#F3E6CE] text-[#8E2A2A]'
              : event.status === 'FULL'
              ? 'bg-[#8E2A2A] text-[#FFF6E5]'
              : 'bg-[#2A1A14] text-[#FFF6E5]'
          }`}
        >
          [ {event.status} ]
        </div>
      </div>

      {/* Notice Board Cream Poster Sheet */}
      <div className="bg-[#F3E6CE] border-2 border-[#2A1A14] rounded-b-[26px] p-5 sm:p-6 space-y-4">
        {/* Date, Time & Category Badge */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-[#8A1F6E] text-[#FFF6E5] px-2 py-0.5 font-typewriter text-[10px] font-black uppercase rounded shadow-[1px_1px_0px_#2A1A14]">
            {event.dayLabel || 'CAMPUS'}
          </span>
          <span className="font-typewriter text-xs font-bold text-[#2A1A14]">
            {event.time}
          </span>
          <span className="text-[#2A1A14]/40 font-typewriter text-xs">·</span>
          <span className="font-typewriter text-xs font-bold text-[#8E2A2A]">
            {event.date}
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="font-display font-black text-2xl text-[#2A1A14] uppercase leading-tight tracking-tight">
            {event.title}
          </h3>
          <p className="font-serif-flourish italic text-sm text-[#2A1A14]/85 mt-1 line-clamp-2">
            {event.description}
          </p>
        </div>

        {/* Venue & Organizer Details */}
        <div className="p-3 bg-[#A98258]/25 border-2 border-[#2A1A14] rounded-xl font-typewriter text-xs text-[#2A1A14] space-y-1">
          <div className="flex items-center gap-1.5 text-[#8E2A2A] font-bold text-[10px] uppercase">
            <MapPin className="w-3.5 h-3.5" />
            <span>VENUE // LOCATION:</span>
          </div>
          <span className="font-bold block truncate">{event.venue}</span>
        </div>

        {/* Eligibility Tags */}
        <div className="flex flex-wrap gap-1.5 font-typewriter text-[10px]">
          {event.eligibilityYears.map((yr) => (
            <span key={yr} className="bg-[#FFF6E5] text-[#2A1A14] px-2 py-0.5 rounded border border-[#2A1A14]/40 font-bold">
              {yr}
            </span>
          ))}
          {event.eligibilityDepartments.slice(0, 2).map((dept) => (
            <span key={dept} className="bg-[#FFF6E5] text-[#2A1A14] px-2 py-0.5 rounded border border-[#2A1A14]/40 font-bold">
              {dept}
            </span>
          ))}
        </div>

        {/* Capacity Bar */}
        <div className="space-y-1.5 font-typewriter">
          <div className="flex items-center justify-between text-[11px] text-[#2A1A14]">
            <span className="font-bold flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              CAPACITY:
            </span>
            <span className="font-black text-[#8E2A2A]">
              {event.registeredCount}/{event.capacity} ({spotsLeft} spots left)
            </span>
          </div>

          <div className="w-full bg-[#FFF6E5] h-3 rounded-full overflow-hidden border border-[#2A1A14] p-0.5">
            <div
              style={{ width: `${fillPercentage}%` }}
              className={`h-full rounded-full transition-all duration-300 ${
                fillPercentage >= 95 ? 'bg-[#8E2A2A]' : 'bg-[#5B7A3A]'
              }`}
            />
          </div>
        </div>

        {/* Card Actions */}
        <div className="pt-2 border-t-2 border-dashed border-[#2A1A14]/30 flex items-center justify-between gap-3">
          {isRegistered ? (
            <span className="inline-flex items-center gap-1.5 font-typewriter text-xs font-black text-[#5B7A3A]">
              <CheckCircle2 className="w-4 h-4" /> PASS IN MY PASSES
            </span>
          ) : isFull ? (
            <span className="font-typewriter text-xs font-bold text-[#8E2A2A] px-2 py-1 bg-[#8E2A2A]/10 rounded border border-[#8E2A2A]/30">
              HOUSE FULL
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickRegister();
              }}
              className="btn-postal-red flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs uppercase font-bold"
            >
              <span>REGISTER FOR PASS ★</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <span className="font-typewriter text-xs text-[#2A1A14]/75 hover:text-[#2A1A14] font-bold">
            Notice Details →
          </span>
        </div>
      </div>
    </motion.div>
  );
};
