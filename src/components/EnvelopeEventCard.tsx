import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CampusEvent } from '../types';
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Calendar,
  Users,
  Bell,
  BellRing,
  Download,
  CalendarPlus,
  Sparkles,
} from 'lucide-react';
import { getEvent3DAsset } from '../assets/images';
import {
  isReminderSet,
  toggleEventReminder,
  downloadEventICS,
  getGoogleCalendarUrl,
  requestAndSendNotification,
} from '../utils/calendarReminder';
import { postalSoundFx } from '../utils/audio';

interface Props {
  event: CampusEvent;
  isRegistered?: boolean;
  onOpenDetails: () => void;
  onQuickRegister: () => void;
  rotation?: string;
  onShowToast?: (title: string, desc?: string, type?: 'success' | 'reminder') => void;
}

export const EnvelopeEventCard: React.FC<Props> = ({
  event,
  isRegistered = false,
  onOpenDetails,
  onQuickRegister,
  rotation = 'rotate-0',
  onShowToast,
}) => {
  const [hasReminder, setHasReminder] = useState(() => isReminderSet(event.id));
  const [showReminderMenu, setShowReminderMenu] = useState(false);

  const isFull = event.status === 'FULL' || event.registeredCount >= event.capacity;
  const isLive = event.status === 'LIVE';
  const spotsLeft = Math.max(0, event.capacity - event.registeredCount);
  const fillPercentage = Math.min(
    100,
    Math.round((event.registeredCount / event.capacity) * 100)
  );

  const asset3D = getEvent3DAsset(event.category, event.title);

  const handleToggleReminder = async (e: React.MouseEvent) => {
    e.stopPropagation();
    postalSoundFx.playTypewriterTick();
    const nextState = toggleEventReminder(event.id);
    setHasReminder(nextState);

    if (nextState) {
      await requestAndSendNotification(event);
      onShowToast?.(
        '★ Reminder Activated',
        `Alert scheduled for ${event.title}`,
        'reminder'
      );
    } else {
      onShowToast?.(
        'Reminder Removed',
        `Notification disabled for ${event.title}`,
        'reminder'
      );
    }
  };

  const handleDownloadICS = (e: React.MouseEvent) => {
    e.stopPropagation();
    postalSoundFx.playStampThump();
    downloadEventICS(event);
    setShowReminderMenu(false);
    onShowToast?.(
      '★ Calendar Event Exported',
      `.ics file downloaded for ${event.title}`,
      'success'
    );
  };

  const handleOpenGoogleCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReminderMenu(false);
    const url = getGoogleCalendarUrl(event);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      whileHover={{ y: -6, scale: 1.012 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      onClick={onOpenDetails}
      className={`group relative cursor-pointer select-none rounded-[28px] p-2 bg-[#1B2257]/80 border border-[#E8D9B0]/30 shadow-[0_8px_32px_rgba(0,0,0,0.45)] hover:border-[#E8D9B0]/70 hover:shadow-[0_0_32px_rgba(224,74,123,0.35)] transition-all ${rotation}`}
    >
      {/* Bulletin Envelope Header with Category Band & Status Stamp */}
      <div className="relative bg-[#10142E] border border-[#E8D9B0]/20 rounded-t-[22px] py-2.5 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#5B2A86]/70 border border-[#E8D9B0]/30 flex items-center justify-center font-display font-black text-xs text-[#E8D9B0]">
            {event.category.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="font-display text-[10px] text-[#E8D9B0] font-bold tracking-widest uppercase block">
              DISPATCH #{event.id.replace('ev-', '').toUpperCase().slice(0, 8)}
            </span>
            <span className="font-sans text-[10px] text-[#FFF6E5]/75 block truncate max-w-[170px]">
              {event.organizerClub}
            </span>
          </div>
        </div>

        {/* Live / Status Pill */}
        <div
          className={`font-sans text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border transition-all ${
            isLive
              ? 'bg-[#B3345C] text-[#FFF6E5] border-[#E04A7B] shadow-[0_0_12px_#E04A7B] animate-pulse'
              : event.status === 'OPEN'
              ? 'bg-[#1B2257] text-[#E8D9B0] border-[#E8D9B0]/30'
              : event.status === 'FULL'
              ? 'bg-[#B3345C]/40 text-[#FFF6E5] border-[#B3345C]'
              : 'bg-black/60 text-[#FFF6E5]/60 border-white/10'
          }`}
        >
          {isLive ? '🔴 LIVE' : event.status}
        </div>
      </div>

      {/* Notice Board Parchment Poster Sheet with High WCAG AA Contrast */}
      <div className="bg-[#F3E6CE] border border-[#E8D9B0]/60 rounded-b-[22px] p-5 sm:p-6 space-y-4 text-[#10142E]">
        {/* Date, Time & Reminder Toggle */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 font-sans text-xs">
            <span className="bg-[#B3345C] text-[#FFF6E5] px-2 py-0.5 font-semibold text-[10px] uppercase rounded-full">
              {event.dayLabel || 'CAMPUS'}
            </span>
            <span className="font-bold text-[#10142E]">
              {event.time}
            </span>
            <span className="text-[#10142E]/40 font-bold">·</span>
            <span className="font-semibold text-[#8E2A2A]">
              {event.date}
            </span>
          </div>

          {/* Set Reminder Button / Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowReminderMenu(!showReminderMenu);
              }}
              className={`px-2.5 py-1 rounded-full border flex items-center gap-1 font-sans text-[11px] font-semibold transition-all ${
                hasReminder
                  ? 'bg-[#B3345C] text-[#FFF6E5] border-[#E04A7B] shadow-[0_0_10px_rgba(224,74,123,0.4)]'
                  : 'bg-white/80 text-[#10142E] border-[#10142E]/30 hover:bg-white'
              }`}
              title={hasReminder ? 'Reminder is Active' : 'Set Event Reminder'}
            >
              {hasReminder ? (
                <BellRing className="w-3.5 h-3.5 animate-bounce" />
              ) : (
                <Bell className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {hasReminder ? 'Reminded' : 'Remind'}
              </span>
            </button>

            {/* Reminder Dropdown Menu */}
            <AnimatePresence>
              {showReminderMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1.5 w-52 bg-[#FFF6E5] border border-[#E8D9B0] rounded-2xl p-2 shadow-[0_8px_24px_rgba(0,0,0,0.3)] z-30 font-sans text-xs space-y-1"
                >
                  <button
                    onClick={handleToggleReminder}
                    className="w-full text-left p-1.5 rounded-xl hover:bg-[#E8D9B0]/40 flex items-center justify-between transition-colors font-medium text-[#10142E]"
                  >
                    <span className="flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-[#B3345C]" />
                      <span>{hasReminder ? 'Disable Alert' : 'Enable Web Alert'}</span>
                    </span>
                    <span className="text-[10px] font-bold text-[#B3345C]">
                      {hasReminder ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  <button
                    onClick={handleDownloadICS}
                    className="w-full text-left p-1.5 rounded-xl hover:bg-[#E8D9B0]/40 flex items-center gap-1.5 transition-colors font-medium text-[#10142E]"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Export iCal (.ics)</span>
                  </button>

                  <button
                    onClick={handleOpenGoogleCalendar}
                    className="w-full text-left p-1.5 rounded-xl hover:bg-[#E8D9B0]/40 flex items-center gap-1.5 transition-colors font-medium text-[#10142E]"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-[#5B2A86]" />
                    <span>Google Calendar</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Title, Description & 3D Artwork Emblem */}
        <div className="flex items-start gap-3.5">
          <div className="flex-1">
            <h3 className="font-display font-black text-xl sm:text-2xl text-[#10142E] uppercase leading-snug tracking-tight">
              {event.title}
            </h3>
            <p className="font-eyebrow text-xs sm:text-sm text-[#10142E]/80 mt-1 line-clamp-2">
              {event.description}
            </p>
          </div>

          {/* 3D Visual Artwork Frame */}
          <div className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-[#10142E]/20 shadow-[0_4px_16px_rgba(0,0,0,0.15)] overflow-hidden bg-[#10142E] group/art">
            <img
              src={asset3D}
              alt={event.category}
              className="w-full h-full object-cover transform group-hover/art:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <span className="absolute bottom-1 right-1 font-display text-[8px] font-black text-[#E8D9B0] bg-[#10142E]/80 px-1 rounded uppercase">
              3D
            </span>
          </div>
        </div>

        {/* Venue Location Details */}
        <div className="p-3 bg-white/70 border border-[#10142E]/15 rounded-xl font-sans text-xs text-[#10142E] space-y-0.5">
          <div className="flex items-center gap-1.5 text-[#B3345C] font-semibold text-[10px] uppercase">
            <MapPin className="w-3.5 h-3.5" />
            <span>Venue Location:</span>
          </div>
          <span className="font-bold block truncate text-[#10142E]">{event.venue}</span>
        </div>

        {/* Eligibility Tags */}
        <div className="flex flex-wrap gap-1.5 font-sans text-[10px]">
          {event.eligibilityYears.map((yr) => (
            <span key={yr} className="bg-white/80 text-[#10142E] px-2 py-0.5 rounded-full border border-[#10142E]/20 font-medium">
              {yr}
            </span>
          ))}
          {event.eligibilityDepartments.slice(0, 2).map((dept) => (
            <span key={dept} className="bg-white/80 text-[#10142E] px-2 py-0.5 rounded-full border border-[#10142E]/20 font-medium">
              {dept}
            </span>
          ))}
        </div>

        {/* Capacity Bar */}
        <div className="space-y-1.5 font-sans">
          <div className="flex items-center justify-between text-[11px] text-[#10142E]">
            <span className="font-medium flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Capacity:
            </span>
            <span className="font-bold text-[#B3345C]">
              {event.registeredCount}/{event.capacity} ({spotsLeft} spots left)
            </span>
          </div>

          <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-[#10142E]/20 p-0.5">
            <div
              style={{ width: `${fillPercentage}%` }}
              className={`h-full rounded-full transition-all duration-300 ${
                fillPercentage >= 95 ? 'bg-[#B3345C]' : 'bg-emerald-600'
              }`}
            />
          </div>
        </div>

        {/* Card Actions */}
        <div className="pt-2 border-t border-[#10142E]/15 flex items-center justify-between gap-3">
          {isRegistered ? (
            <span className="inline-flex items-center gap-1.5 font-sans text-xs font-bold text-emerald-700">
              <CheckCircle2 className="w-4 h-4" /> Pass Claimed
            </span>
          ) : isFull ? (
            <span className="font-sans text-xs font-bold text-[#B3345C] px-3 py-1 bg-[#B3345C]/10 rounded-full border border-[#B3345C]/30">
              House Full
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickRegister();
              }}
              className="btn-crimson-pill px-4 py-2 text-xs uppercase font-semibold gap-1.5"
            >
              <span>Register Pass</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <span className="font-sans text-xs text-[#10142E]/70 hover:text-[#10142E] font-semibold flex items-center gap-1">
            <span>Details</span>
            <span>→</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
};
