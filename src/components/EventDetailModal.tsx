import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CampusEvent, StudentProfile } from '../types';
import {
  X,
  Calendar,
  MapPin,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Users,
  Mail,
  ShieldCheck,
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
import { soundFx } from '../utils/audio';

interface Props {
  event: CampusEvent;
  studentProfile?: StudentProfile | null;
  onClose: () => void;
  onStartRegistration: (event: CampusEvent) => void;
  isRegistered?: boolean;
  onViewPass?: () => void;
  onShowToast?: (title: string, desc?: string, type?: 'success' | 'reminder') => void;
}

export const EventDetailModal: React.FC<Props> = ({
  event,
  studentProfile,
  onClose,
  onStartRegistration,
  isRegistered = false,
  onViewPass,
  onShowToast,
}) => {
  const [hasReminder, setHasReminder] = useState(() => isReminderSet(event.id));
  const isFull = event.status === 'FULL' || event.registeredCount >= event.capacity;
  const spotsLeft = Math.max(0, event.capacity - event.registeredCount);
  const asset3D = getEvent3DAsset(event.category, event.title);

  const handleToggleReminder = async () => {
    soundFx.playClick();
    const nextState = toggleEventReminder(event.id);
    setHasReminder(nextState);

    if (nextState) {
      await requestAndSendNotification(event);
      onShowToast?.(
        '★ Reminder Set',
        `Notification alert set for ${event.title}`,
        'reminder'
      );
    } else {
      onShowToast?.(
        'Reminder Disabled',
        `Alert disabled for ${event.title}`,
        'reminder'
      );
    }
  };

  const handleDownloadICS = () => {
    soundFx.playClick();
    downloadEventICS(event);
    onShowToast?.(
      '★ Calendar File Saved',
      `.ics file downloaded for ${event.title}`,
      'success'
    );
  };

  const handleGoogleCalendar = () => {
    soundFx.playClick();
    const url = getGoogleCalendarUrl(event);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Eligibility evaluation
  const isYearEligible =
    !studentProfile ||
    event.eligibilityYears.includes('All Years') ||
    event.eligibilityYears.includes(studentProfile.year);

  const isDeptEligible =
    !studentProfile ||
    event.eligibilityDepartments.includes('All Departments') ||
    event.eligibilityDepartments.some(
      (d) =>
        studentProfile.department.toLowerCase().includes(d.toLowerCase()) ||
        d.toLowerCase().includes(studentProfile.department.toLowerCase())
    );

  const isOverallEligible = isYearEligible && isDeptEligible;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 22, stiffness: 200 }}
        className="relative w-full max-w-2xl rounded-3xl bg-[#060A1C] border-2 border-[#E8D9B0]/40 p-1 shadow-[0_0_50px_rgba(0,0,0,0.85)] overflow-hidden max-h-[92vh] flex flex-col justify-between"
      >
        <div className="bg-[#0B1030] rounded-[22px] p-6 sm:p-8 overflow-y-auto space-y-6 text-[#FFF6E5]">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#E8D9B0]/20 pb-4">
            <div className="flex items-start gap-4">
              {/* 3D Visual Artwork Frame */}
              <div className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-[#E8D9B0]/40 shadow-xl overflow-hidden bg-[#10142E]">
                <img
                  src={asset3D}
                  alt={event.category}
                  className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-1 right-1 font-display text-[9px] font-black text-[#E8D9B0] bg-[#10142E]/90 px-1 rounded uppercase">
                  3D
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-sans text-[10px] text-[#E8D9B0] font-bold uppercase tracking-widest">
                    ★ FESTORA NOTICE // REF #{event.id.replace('ev-', '').toUpperCase()}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#1B2257] border border-[#E8D9B0]/30 text-[9px] font-bold text-[#E8D9B0] uppercase">
                    {event.category}
                  </span>
                </div>
                <h2 className="font-display font-black text-2xl sm:text-3xl text-gold-gradient uppercase leading-tight">
                  {event.title}
                </h2>
                <p className="font-eyebrow text-sm text-[#E8D9B0]/80">
                  Organized by {event.organizerClub}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#1B2257] text-[#E8D9B0] hover:text-[#FFF6E5] transition-colors shrink-0 ml-3"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Event Reminders Toolbar */}
          <div className="p-3 bg-[#10142E] border border-[#E8D9B0]/30 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#E8D9B0] flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-[#E04A7B]" />
                CALENDAR & REMINDER:
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleReminder}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                  hasReminder
                    ? 'bg-[#B3345C] text-[#FFF6E5] border-[#E04A7B] shadow-[0_0_12px_rgba(224,74,123,0.5)]'
                    : 'bg-[#1B2257] text-[#FFF6E5] border-[#E8D9B0]/30 hover:border-[#E8D9B0]'
                }`}
              >
                {hasReminder ? <BellRing className="w-3.5 h-3.5 animate-bounce" /> : <Bell className="w-3.5 h-3.5" />}
                <span>{hasReminder ? 'Reminder Active' : 'Set Web Reminder'}</span>
              </button>

              <button
                onClick={handleDownloadICS}
                className="px-3 py-1.5 rounded-xl border border-[#E8D9B0]/30 bg-[#1B2257] text-[#FFF6E5] hover:border-[#E8D9B0] text-[11px] font-bold flex items-center gap-1.5 transition-all"
                title="Download iCal (.ics) format"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export .ICS</span>
              </button>

              <button
                onClick={handleGoogleCalendar}
                className="px-3 py-1.5 rounded-xl border border-[#E8D9B0]/30 bg-[#1B2257] text-[#FFF6E5] hover:border-[#E8D9B0] text-[11px] font-bold flex items-center gap-1.5 transition-all"
                title="Add directly to Google Calendar"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Google Cal</span>
              </button>
            </div>
          </div>

          {/* Date, Time & Venue in Dark Storybook Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#10142E] border border-[#E8D9B0]/30 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] text-[#E04A7B] font-black uppercase tracking-wider block">
                WHEN // DAY & HOUR:
              </span>
              <div className="inline-block bg-[#B3345C] text-[#FFF6E5] px-2 py-0.5 rounded font-bold text-xs mr-2">
                {event.dayLabel || 'CAMPUS'}
              </div>
              <span className="font-display font-black text-lg text-[#FFF6E5] block">
                {event.time}
              </span>
              <span className="text-xs text-[#E8D9B0]/80 block font-medium">
                {event.date}
              </span>
            </div>

            <div className="bg-[#10142E] border border-[#E8D9B0]/30 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] text-[#E04A7B] font-black uppercase tracking-wider block">
                WHERE // CAMPUS VENUE:
              </span>
              <span className="font-display font-black text-base text-[#FFF6E5] block truncate">
                {event.venue}
              </span>
              <span className="text-xs text-[#E8D9B0]/80 block">
                Coordinator: {event.organizerEmail}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-2xl bg-[#10142E]/70 border border-[#E8D9B0]/25 space-y-2 text-xs text-[#FFF6E5]">
            <span className="font-bold uppercase text-[#E8D9B0] block tracking-wider">
              EVENT BRIEF:
            </span>
            <p className="leading-relaxed text-[#FFF6E5]/90 text-sm">
              {event.description}
            </p>
          </div>

          {/* Eligibility Checker */}
          <div className="p-4 rounded-2xl bg-[#1B2257]/40 border border-[#E8D9B0]/30 space-y-2 font-sans">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#E8D9B0] uppercase flex items-center gap-1.5 tracking-wider">
                <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
                ELIGIBILITY CHECKER:
              </span>
              {studentProfile && (
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                  isOverallEligible ? 'bg-emerald-900/60 border-emerald-400 text-emerald-200' : 'bg-red-950/60 border-red-400 text-red-200'
                }`}>
                  {isOverallEligible ? '✓ ELIGIBLE TO REGISTER' : '⚠ RESTRICTED CRITERIA'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#10142E] border border-[#E8D9B0]/20 space-y-1">
                <span className="text-[10px] text-[#E8D9B0]/80 font-bold uppercase block">PERMITTED YEARS:</span>
                <span className="font-bold text-[#FFF6E5] block">{event.eligibilityYears.join(', ')}</span>
                {studentProfile && (
                  <span className={`text-[10px] block ${isYearEligible ? 'text-emerald-400 font-bold' : 'text-red-400'}`}>
                    {isYearEligible ? `✓ Your year (${studentProfile.year}) matches` : `✗ Open only to ${event.eligibilityYears.join(', ')}`}
                  </span>
                )}
              </div>

              <div className="p-2.5 rounded-xl bg-[#10142E] border border-[#E8D9B0]/20 space-y-1">
                <span className="text-[10px] text-[#E8D9B0]/80 font-bold uppercase block">DEPARTMENTS:</span>
                <span className="font-bold text-[#FFF6E5] block">{event.eligibilityDepartments.join(', ')}</span>
                {studentProfile && (
                  <span className={`text-[10px] block ${isDeptEligible ? 'text-emerald-400 font-bold' : 'text-red-400'}`}>
                    {isDeptEligible ? `✓ Your department qualifies` : `✗ Department restricted`}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 text-[10px]">
            {event.tags.map((tag, idx) => (
              <span key={idx} className="bg-[#B3345C]/30 text-[#FFF6E5] border border-[#B3345C] px-2 py-0.5 rounded-full font-bold uppercase">
                #{tag}
              </span>
            ))}
          </div>

          {/* Capacity Bar */}
          <div className="p-4 rounded-2xl bg-[#10142E] border border-[#E8D9B0]/30 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#FFF6E5]">
              <span className="font-bold uppercase flex items-center gap-1.5 text-[#E8D9B0]">
                <Users className="w-3.5 h-3.5 text-[#38BDF8]" /> CAPACITY & SEATS:
              </span>
              <span className="font-bold text-[#E04A7B]">
                {event.registeredCount} / {event.capacity} ({spotsLeft} spots left)
              </span>
            </div>

            <div className="w-full bg-[#060A1C] h-3.5 rounded-full overflow-hidden border border-[#E8D9B0]/30 p-0.5">
              <div
                style={{
                  width: `${Math.min(100, Math.round((event.registeredCount / event.capacity) * 100))}%`,
                }}
                className="bg-gradient-to-r from-[#5B2A86] via-[#B3345C] to-[#E04A7B] h-full rounded-full transition-all duration-500"
              />
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-[#E8D9B0]/20 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-[#E8D9B0]/60 uppercase block">STATUS:</span>
              <span className="font-bold text-xs text-[#E8D9B0] uppercase">
                {isFull ? 'HOUSE FULL' : event.status}
              </span>
            </div>

            {isRegistered ? (
              <button
                onClick={() => {
                  onClose();
                  onViewPass?.();
                }}
                className="glass-pill flex items-center gap-2 px-6 py-3 rounded-2xl text-xs uppercase font-bold text-[#E8D9B0] hover:text-[#FFF6E5] border border-[#E8D9B0]/50"
              >
                <span>View In My Passes</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : isFull ? (
              <div className="text-xs font-bold text-[#E04A7B] uppercase">
                Event is fully booked.
              </div>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onStartRegistration(event);
                }}
                className="btn-crimson-pill flex items-center gap-2 px-6 py-3 rounded-2xl text-xs uppercase font-bold shadow-[0_0_20px_rgba(224,74,123,0.4)]"
              >
                <span>Register</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
