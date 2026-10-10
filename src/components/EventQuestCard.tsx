import React, { useState } from 'react';
import { CampusEvent } from '../types';
import { CAMPUS_CATEGORIES } from '../data/categories';
import { OrnateButton } from './ui/OrnateButton';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Bell,
  BellRing,
  Info,
  CheckCircle2,
  Sparkles,
  Layers,
  ChevronRight,
  Radio,
  Download,
  CalendarPlus,
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

  // Retrieve category design tokens
  const catInfo =
    CAMPUS_CATEGORIES.find((c) => c.id === event.category) || CAMPUS_CATEGORIES[0];
  const Icon = catInfo.icon;

  const isFull = event.status === 'FULL' || event.registeredCount >= event.capacity;
  const isLive = event.status === 'LIVE';
  const spotsLeft = Math.max(0, event.capacity - event.registeredCount);
  const fillPercentage = Math.min(
    100,
    Math.round((event.registeredCount / event.capacity) * 100)
  );

  // Derive "What to Expect" bullet list:
  // Use event tags if available, or fall back to category expectations
  const whatToExpectItems =
    event.tags && event.tags.length >= 2
      ? event.tags.slice(0, 3).map((tag) => tag.replace(/_/g, ' '))
      : catInfo.whatToExpect.slice(0, 3);

  const handleToggleReminder = async (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playClick();
    const nextState = toggleEventReminder(event.id);
    setHasReminder(nextState);

    if (nextState) {
      await requestAndSendNotification(event);
      onShowToast?.(
        '★ Reminder Set',
        `You will be notified before ${event.title}`,
        'reminder'
      );
    } else {
      onShowToast?.(
        'Reminder Removed',
        `Notification cancelled for ${event.title}`,
        'reminder'
      );
    }
  };

  const handleDownloadICS = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playConfirm();
    downloadEventICS(event);
    setShowReminderMenu(false);
    onShowToast?.('Calendar File Exported', 'iCal (.ics) saved to downloads', 'success');
  };

  const handleOpenGoogleCal = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playClick();
    window.open(getGoogleCalendarUrl(event), '_blank');
    setShowReminderMenu(false);
  };

  return (
    <article
      className="group relative flex flex-col justify-between rounded-2xl bg-[#060A1C]/90 border border-[#E8D9B0]/25 hover:border-[#E8D9B0]/60 transition-all duration-300 shadow-[0_12px_40px_rgba(0,0,0,0.65)] hover:shadow-[0_16px_50px_rgba(0,0,0,0.85)] hover:-translate-y-1 overflow-hidden"
      style={{
        boxShadow: `0 8px 30px -4px ${catInfo.accentGlow}`,
      }}
    >
      {/* Top Category Accent Line */}
      <div
        className="h-1.5 w-full transition-all duration-300"
        style={{ backgroundColor: catInfo.accentColor }}
      />

      {/* Gold Corner Filigree Brackets */}
      <span className="pointer-events-none absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 border-[#E8D9B0]/70" />
      <span className="pointer-events-none absolute top-2.5 right-2.5 w-3 h-3 border-t-2 border-r-2 border-[#E8D9B0]/70" />
      <span className="pointer-events-none absolute bottom-2.5 left-2.5 w-3 h-3 border-b-2 border-l-2 border-[#E8D9B0]/70" />
      <span className="pointer-events-none absolute bottom-2.5 right-2.5 w-3 h-3 border-b-2 border-r-2 border-[#E8D9B0]/70" />

      {/* Main Content Area */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Header Bar: Category Avatar, Eyebrow & Status Badge */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-10 h-10 rounded-xl overflow-hidden border border-[#E8D9B0]/40 flex items-center justify-center shrink-0 shadow-md bg-[#10142E]"
                style={{
                  boxShadow: `0 0 14px ${catInfo.accentGlow}`,
                }}
              >
                <img
                  src={catInfo.characterImg}
                  alt={catInfo.characterTitle}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] font-sans font-bold uppercase tracking-wider text-[#E8D9B0] truncate">
                  <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: catInfo.accentColor }} />
                  <span>{catInfo.displayName}</span>
                </div>
                <div
                  className="text-[10px] font-serif italic tracking-wide truncate"
                  style={{ color: catInfo.accentColor }}
                >
                  {catInfo.characterTitle.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="shrink-0 flex items-center gap-1.5">
              {isLive ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider bg-red-950/80 text-red-200 border border-red-500/50 animate-pulse">
                  <Radio className="w-3 h-3 text-red-400" />
                  <span>LIVE</span>
                </span>
              ) : isFull ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider bg-slate-900 text-slate-400 border border-slate-700">
                  FULL
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider border border-white/10"
                  style={{
                    backgroundColor: catInfo.badgeBg,
                    color: catInfo.accentColor,
                  }}
                >
                  <span>OPEN</span>
                </span>
              )}
            </div>
          </div>

          {/* Title & Club */}
          <div className="mb-3">
            <h3
              onClick={onOpenDetails}
              className="font-display font-bold text-lg sm:text-xl text-[#FFF6E5] hover:text-[#E8D9B0] transition-colors cursor-pointer leading-tight mb-1"
            >
              {event.title}
            </h3>
            <div className="text-xs font-serif italic text-[#E8D9B0]/80 flex items-center gap-1.5">
              <span>Organized by:</span>
              <span className="font-semibold text-[#FFF6E5]">{event.organizerClub}</span>
            </div>
          </div>

          {/* Schedule & Venue Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#10142E]/70 border border-[#E8D9B0]/15 mb-3.5 text-xs text-[#FFF6E5]/80 font-sans">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#E8D9B0]/70 shrink-0" />
              <span className="truncate">{event.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#E8D9B0]/70 shrink-0" />
              <span className="truncate">{event.time}</span>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <MapPin className="w-3.5 h-3.5 text-[#E04A7B] shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>

          {/* Description (Readable with Read More trigger) */}
          <div className="mb-4">
            <p className="font-sans text-xs text-[#FFF6E5]/85 leading-relaxed line-clamp-3">
              {event.description}
            </p>
            <button
              onClick={onOpenDetails}
              className="mt-1 text-[11px] font-semibold text-[#E8D9B0] hover:text-[#FFF6E5] inline-flex items-center gap-0.5 transition-colors underline-offset-2 hover:underline"
            >
              <span>Read more</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* WHAT TO EXPECT Section */}
          <div className="p-3 rounded-xl bg-[#0B1030]/80 border border-[#E8D9B0]/15 mb-4">
            <div className="flex items-center gap-1.5 text-[10px] font-display uppercase tracking-widest text-[#E8D9B0] mb-2 font-bold">
              <Sparkles className="w-3 h-3 text-[#E8D9B0]" />
              <span>WHAT TO EXPECT</span>
            </div>
            <ul className="space-y-1.5 text-[11px] font-sans text-[#FFF6E5]/85">
              {whatToExpectItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-snug">
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-1 shrink-0"
                    style={{ backgroundColor: catInfo.accentColor }}
                  />
                  <span className="capitalize">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section: Stat Chips & Progress Bar */}
        <div>
          {/* Eligibility & Duration Chips */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <span className="px-2 py-0.5 rounded-md bg-[#1B2257]/60 border border-[#E8D9B0]/20 text-[10px] font-mono text-[#E8D9B0]">
              {catInfo.typicalDuration}
            </span>
            {event.eligibilityYears && event.eligibilityYears[0] && (
              <span className="px-2 py-0.5 rounded-md bg-[#1B2257]/60 border border-[#E8D9B0]/20 text-[10px] font-mono text-[#FFF6E5]/75">
                {event.eligibilityYears[0]}
              </span>
            )}
            {event.eligibilityDepartments && event.eligibilityDepartments[0] && (
              <span className="px-2 py-0.5 rounded-md bg-[#1B2257]/60 border border-[#E8D9B0]/20 text-[10px] font-mono text-[#FFF6E5]/75 truncate max-w-[150px]">
                {event.eligibilityDepartments[0]}
              </span>
            )}
          </div>

          {/* Capacity Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#FFF6E5]/75 mb-1">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-[#E8D9B0]/70" />
                <span>Spots Left: <strong className="text-[#FFF6E5]">{spotsLeft}</strong> / {event.capacity}</span>
              </span>
              <span>{fillPercentage}% Full</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#10142E] overflow-hidden border border-[#E8D9B0]/20">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${fillPercentage}%`,
                  backgroundColor: isFull ? '#EF4444' : catInfo.accentColor,
                  boxShadow: `0 0 8px ${isFull ? '#EF4444' : catInfo.accentColor}`,
                }}
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="relative pt-3 border-t border-[#E8D9B0]/20 flex items-center gap-2">
            {/* Reminder Dropdown Button */}
            <div className="relative">
              <button
                onClick={handleToggleReminder}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setShowReminderMenu((prev) => !prev);
                }}
                className={`px-2.5 py-2 rounded-xl border transition-all flex items-center gap-1 text-xs font-sans font-medium ${
                  hasReminder
                    ? 'bg-[#E8D9B0] text-[#060A1C] border-[#E8D9B0] shadow-[0_0_12px_rgba(232,217,176,0.4)]'
                    : 'bg-[#10142E] text-[#E8D9B0] border-[#E8D9B0]/30 hover:border-[#E8D9B0]'
                }`}
                title={hasReminder ? 'Reminder Active (Click to cancel, right-click for iCal)' : 'Set Event Reminder'}
                aria-label="Toggle calendar reminder"
              >
                {hasReminder ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{hasReminder ? 'Reminded' : 'Remind'}</span>
              </button>

              {showReminderMenu && (
                <div className="absolute left-0 bottom-full mb-2 w-48 rounded-xl bg-[#060A1C] border border-[#E8D9B0]/30 shadow-2xl p-1.5 z-30 font-sans text-xs">
                  <button
                    onClick={handleDownloadICS}
                    className="w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-[#1B2257] text-[#FFF6E5] flex items-center gap-2 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[#E8D9B0]" />
                    <span>Download .ics File</span>
                  </button>
                  <button
                    onClick={handleOpenGoogleCal}
                    className="w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-[#1B2257] text-[#FFF6E5] flex items-center gap-2 transition-colors"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>Google Calendar</span>
                  </button>
                </div>
              )}
            </div>

            {/* Details Button */}
            <button
              onClick={onOpenDetails}
              className="px-3 py-2 rounded-xl bg-[#10142E] hover:bg-[#1B2257] border border-[#E8D9B0]/30 hover:border-[#E8D9B0] text-[#FFF6E5] text-xs font-sans font-medium transition-colors flex items-center gap-1.5"
            >
              <Info className="w-3.5 h-3.5 text-[#E8D9B0]" />
              <span>Details</span>
            </button>

            {/* Register / Claimed Button */}
            <div className="flex-1">
              {isRegistered ? (
                <button
                  onClick={onOpenDetails}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-sans font-bold flex items-center justify-center gap-1.5 shadow-[0_0_16px_rgba(16,185,129,0.25)] hover:brightness-110 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>★ Pass Claimed</span>
                </button>
              ) : isFull ? (
                <button
                  disabled
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-500 text-xs font-sans font-semibold cursor-not-allowed"
                >
                  Arena Full
                </button>
              ) : (
                <OrnateButton
                  variant="primary"
                  size="sm"
                  onClick={onQuickRegister}
                  className="w-full"
                >
                  <span>Register</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </OrnateButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
