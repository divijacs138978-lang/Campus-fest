import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CampusEvent } from '../types';
import { CAMPUS_CATEGORIES, CategoryInfo } from '../data/categories';
import { getEvent3DAsset } from '../assets/images';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Bell,
  BellRing,
  Download,
  CalendarPlus,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import {
  isReminderSet,
  toggleEventReminder,
  downloadEventICS,
  getGoogleCalendarUrl,
  requestAndSendNotification,
} from '../utils/calendarReminder';
import { soundFx } from '../utils/audio';

interface EventQuestCardProps {
  event: CampusEvent;
  isRegistered?: boolean;
  onOpenDetails: () => void;
  onQuickRegister: () => void;
  onShowToast?: (title: string, desc?: string, type?: 'success' | 'reminder') => void;
}

export const EventQuestCard: React.FC<EventQuestCardProps> = ({
  event,
  isRegistered = false,
  onOpenDetails,
  onQuickRegister,
  onShowToast,
}) => {
  const [hasReminder, setHasReminder] = useState(() => isReminderSet(event.id));
  const [showReminderMenu, setShowReminderMenu] = useState(false);

  // Match category info for gaming styling, icons, and fallbacks
  const catInfo: CategoryInfo | undefined = CAMPUS_CATEGORIES.find(
    (c) => c.id.toLowerCase() === event.category.toLowerCase()
  );

  const accentColor = catInfo?.accentColor || '#E8D9B0';
  const badgeBg = catInfo?.badgeBg || 'rgba(232, 217, 176, 0.12)';
  const characterTitle = catInfo?.characterTitle || event.category.toUpperCase();
  const Icon = catInfo?.icon || Sparkles;
  const asset3D = getEvent3DAsset(event.category, event.title);

  const isFull = event.status === 'FULL' || event.registeredCount >= event.capacity;
  const isLive = event.status === 'LIVE';
  const spotsLeft = Math.max(0, event.capacity - event.registeredCount);
  const fillPercentage = Math.min(
    100,
    Math.round((event.registeredCount / event.capacity) * 100)
  );

  // Build "WHAT TO EXPECT" items from event's own data or fallback to guild defaults
  const expectations: string[] = (() => {
    // If event has custom tags beyond the category name
    const validTags = (event.tags || []).filter(
      (t) =>
        t.toLowerCase() !== event.category.toLowerCase() &&
        t.toLowerCase() !== 'festora' &&
        !t.toLowerCase().includes('spots')
    );
    if (validTags.length >= 2) {
      return validTags.slice(0, 3).map((t) => `${t.charAt(0).toUpperCase() + t.slice(1)} focus track`);
    }
    return catInfo?.whatToExpect.slice(0, 3) || [
      'Official competition briefing & track mentorship',
      'Exclusive certified digital participation pass',
      'Live stage telemetry & networking opportunity',
    ];
  })();

  const handleToggleReminder = async (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playClick();
    const nextState = toggleEventReminder(event.id);
    setHasReminder(nextState);

    if (nextState) {
      await requestAndSendNotification(event);
      onShowToast?.(
        '★ Alert Activated',
        `Notification scheduled for ${event.title}`,
        'reminder'
      );
    } else {
      onShowToast?.(
        'Alert Disabled',
        `Reminder removed for ${event.title}`,
        'reminder'
      );
    }
  };

  const handleDownloadICS = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playClick();
    downloadEventICS(event);
    setShowReminderMenu(false);
    onShowToast?.(
      '★ Calendar File Exported',
      `.ics downloaded for ${event.title}`,
      'success'
    );
  };

  const handleOpenGoogleCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playClick();
    setShowReminderMenu(false);
    const url = getGoogleCalendarUrl(event);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={onOpenDetails}
      className="group relative rounded-2xl bg-[#060A1C]/92 border border-[#E8D9B0]/25 p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-2xl hover:border-[#E8D9B0]/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(232,217,176,0.18)] cursor-pointer select-none"
    >
      {/* 4 Gold Corner Brackets (Game UI / Guild Card visual signature) */}
      <span className="pointer-events-none absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#E8D9B0]/60 transition-colors group-hover:border-[#E8D9B0]" />
      <span className="pointer-events-none absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#E8D9B0]/60 transition-colors group-hover:border-[#E8D9B0]" />
      <span className="pointer-events-none absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#E8D9B0]/60 transition-colors group-hover:border-[#E8D9B0]" />
      <span className="pointer-events-none absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#E8D9B0]/60 transition-colors group-hover:border-[#E8D9B0]" />

      {/* Ambient background glow tinted by category accent color */}
      <div
        className="absolute top-0 right-0 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-500"
        style={{ backgroundColor: accentColor }}
      />

      {/* Top Header Row: Category Badge + Status + Remind Menu */}
      <div>
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E8D9B0]/15">
          {/* Eyebrow Label & Category Icon */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center border shadow-sm shrink-0"
              style={{
                backgroundColor: badgeBg,
                borderColor: `${accentColor}66`,
                color: accentColor,
              }}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <span
                className="font-mono text-[11px] font-bold uppercase tracking-wider block"
                style={{ color: accentColor }}
              >
                {characterTitle}
              </span>
              <span className="font-sans text-[10px] text-[#E8D9B0]/70 uppercase tracking-widest block">
                {event.category} Quest
              </span>
            </div>
          </div>

          {/* Right Status Badge & Reminder Bell */}
          <div className="flex items-center gap-2">
            {/* Status Badge */}
            <span
              className={`font-sans text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border transition-all ${
                isLive
                  ? 'bg-[#B3345C] text-[#FFF6E5] border-[#E04A7B] shadow-[0_0_12px_#E04A7B] animate-pulse'
                  : event.status === 'OPEN'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50'
                  : event.status === 'FULL'
                  ? 'bg-[#B3345C]/40 text-[#FFF6E5] border-[#B3345C]'
                  : 'bg-black/60 text-[#FFF6E5]/60 border-white/15'
              }`}
            >
              {isLive ? '🔴 LIVE' : event.status}
            </span>

            {/* Remind Me Button */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReminderMenu(!showReminderMenu);
                }}
                className={`p-1.5 rounded-full border transition-all ${
                  hasReminder
                    ? 'bg-[#B3345C] text-[#FFF6E5] border-[#E04A7B] shadow-[0_0_10px_rgba(224,74,123,0.5)]'
                    : 'bg-[#10142E] text-[#E8D9B0] border-[#E8D9B0]/30 hover:border-[#E8D9B0]'
                }`}
                title={hasReminder ? 'Reminder is Active' : 'Set Event Reminder'}
                aria-label="Toggle reminder menu"
              >
                {hasReminder ? (
                  <BellRing className="w-3.5 h-3.5 animate-bounce" />
                ) : (
                  <Bell className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Reminder Dropdown Menu */}
              <AnimatePresence>
                {showReminderMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-full mt-2 w-52 bg-[#060A1C] border border-[#E8D9B0]/50 rounded-2xl p-2 shadow-2xl z-40 font-sans text-xs space-y-1 backdrop-blur-xl"
                  >
                    <button
                      onClick={handleToggleReminder}
                      className="w-full text-left p-2 rounded-xl hover:bg-[#1B2257] flex items-center justify-between transition-colors font-medium text-[#FFF6E5]"
                    >
                      <span className="flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-[#E04A7B]" />
                        <span>{hasReminder ? 'Disable Alert' : 'Enable Web Alert'}</span>
                      </span>
                      <span className="text-[10px] font-bold text-[#E8D9B0]">
                        {hasReminder ? 'ON' : 'OFF'}
                      </span>
                    </button>

                    <button
                      onClick={handleDownloadICS}
                      className="w-full text-left p-2 rounded-xl hover:bg-[#1B2257] flex items-center gap-1.5 transition-colors font-medium text-[#FFF6E5]"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Export iCal (.ics)</span>
                    </button>

                    <button
                      onClick={handleOpenGoogleCalendar}
                      className="w-full text-left p-2 rounded-xl hover:bg-[#1B2257] flex items-center gap-1.5 transition-colors font-medium text-[#FFF6E5]"
                    >
                      <CalendarPlus className="w-3.5 h-3.5 text-[#38BDF8]" />
                      <span>Google Calendar</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Title, Club & 3D Character Preview */}
        <div className="flex items-start justify-between gap-3 mt-4">
          <div className="flex-1">
            <h3 className="font-display font-black text-lg sm:text-xl text-[#FFF6E5] uppercase leading-snug group-hover:text-gold-gradient transition-all">
              {event.title}
            </h3>
            <p className="font-eyebrow text-xs italic text-[#E8D9B0]/80 mt-1">
              Organized by {event.organizerClub}
            </p>
          </div>

          {/* 3D Visual Art Preview */}
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden shrink-0 border border-[#E8D9B0]/40 bg-[#10142E] shadow-md group-hover:scale-105 transition-transform duration-300 relative">
            <img
              src={asset3D}
              alt={event.category}
              className="w-full h-full object-cover object-top"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <span className="absolute bottom-1 right-1 font-mono text-[8px] font-black text-[#E8D9B0] bg-[#060A1C]/80 px-1 rounded uppercase">
              3D
            </span>
          </div>
        </div>

        {/* Date, Time & Venue Bar */}
        <div className="mt-4 p-3 rounded-xl bg-[#10142E]/80 border border-[#E8D9B0]/20 flex flex-col gap-1.5 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-[#FFF6E5]">
            <span className="flex items-center gap-1 text-[#E04A7B] font-semibold">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>{event.dayLabel || 'CAMPUS'}</span>
            </span>
            <span className="text-[#E8D9B0]/50">•</span>
            <span className="font-mono text-[#E8D9B0]">{event.date}</span>
            <span className="text-[#E8D9B0]/50">•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{event.time}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#FFF6E5]/80 pt-1 border-t border-[#E8D9B0]/10">
            <MapPin className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
            <span className="font-medium truncate">{event.venue}</span>
          </div>
        </div>

        {/* Event Description (short readable text + "Read more") */}
        <div className="mt-4">
          <p className="font-sans text-xs text-[#FFF6E5]/80 leading-relaxed line-clamp-3">
            {event.description}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails();
            }}
            className="mt-1 text-[11px] font-semibold text-[#E8D9B0] hover:text-[#FFF6E5] flex items-center gap-1 group/btn"
          >
            <span>Read full brief & rules</span>
            <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* WHAT TO EXPECT: Bullet list */}
        <div className="mt-4 pt-3 border-t border-[#E8D9B0]/15 flex flex-col gap-1.5">
          <span className="font-heading text-[10px] uppercase tracking-wider text-[#E8D9B0]/70 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#E8D9B0]" />
            What to Expect:
          </span>
          {expectations.map((bullet, idx) => (
            <div key={idx} className="flex items-start gap-1.5 text-[11px] text-[#FFF6E5]/75 leading-tight">
              <span className="text-[#E04A7B] shrink-0 text-xs leading-none mt-0.5">✦</span>
              <span>{bullet}</span>
            </div>
          ))}
        </div>

        {/* Eligibility & Duration Stat Chips */}
        <div className="flex flex-wrap items-center gap-1.5 mt-4 text-[10px] font-mono">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10142E] border border-[#E8D9B0]/25 text-[#E8D9B0]">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            {event.eligibilityYears.slice(0, 2).join(', ')}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10142E] border border-[#E8D9B0]/25 text-[#FFF6E5]/80">
            {event.eligibilityDepartments.slice(0, 2).join(', ')}
          </span>
          {catInfo?.typicalDuration && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10142E] border border-[#E8D9B0]/25 text-[#38BDF8]">
              <Clock className="w-3 h-3" />
              {catInfo.typicalDuration}
            </span>
          )}
        </div>

        {/* Capacity Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-sans">
            <span className="text-[#E8D9B0]/80 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#38BDF8]" />
              Capacity:
            </span>
            <span className="font-bold text-[#FFF6E5]">
              {event.registeredCount}/{event.capacity} ({spotsLeft} spots left)
            </span>
          </div>

          <div className="w-full bg-[#060A1C] h-2 rounded-full overflow-hidden border border-[#E8D9B0]/20 p-0.5">
            <div
              style={{
                width: `${fillPercentage}%`,
                backgroundColor: fillPercentage >= 95 ? '#B3345C' : accentColor,
              }}
              className="h-full rounded-full transition-all duration-300 shadow-[0_0_8px_currentColor]"
            />
          </div>
        </div>
      </div>

      {/* Card Action Buttons Toolbar (Inside the Same Card) */}
      <div className="mt-6 pt-4 border-t border-[#E8D9B0]/20 flex items-center justify-between gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails();
          }}
          className="px-3 py-2 rounded-xl text-xs font-semibold text-[#E8D9B0] hover:text-[#FFF6E5] bg-[#10142E] border border-[#E8D9B0]/30 hover:border-[#E8D9B0] transition-all flex items-center gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>Details</span>
        </button>

        {isRegistered ? (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-950/70 border border-emerald-400 text-xs font-bold text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Pass Claimed
          </span>
        ) : isFull ? (
          <span className="px-4 py-2 rounded-full bg-[#B3345C]/30 border border-[#B3345C] text-xs font-bold text-[#E04A7B]">
            House Full
          </span>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickRegister();
            }}
            className="btn-crimson-pill px-4 sm:px-5 py-2 text-xs uppercase tracking-wider font-bold gap-1.5 shadow-[0_0_16px_rgba(224,74,123,0.4)] hover:brightness-110 active:scale-95 transition-all"
          >
            <span>Register</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
