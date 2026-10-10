import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CampusEvent, StudentProfile } from '../types';
import {
  PostageStamp,
  ImportantStamp,
  PaperClip,
} from './PostalDecorations';
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
    postalSoundFx.playTypewriterTick();
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
    postalSoundFx.playStampThump();
    downloadEventICS(event);
    onShowToast?.(
      '★ Calendar File Saved',
      `.ics file downloaded for ${event.title}`,
      'success'
    );
  };

  const handleGoogleCalendar = () => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        transition={{ type: 'spring', damping: 22, stiffness: 200 }}
        className="relative w-full max-w-2xl bg-[#A98258] border-[3px] border-[#2A1A14] rounded-[36px] p-2 shadow-[10px_10px_0px_#2A1A14] overflow-hidden max-h-[92vh] flex flex-col justify-between"
      >
        <div className="bg-[#F3E6CE] border-2 border-[#2A1A14] rounded-[30px] p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-dashed border-[#2A1A14]/30 pb-4">
            <div className="flex items-start gap-4">
              {/* 3D Visual Artwork Frame */}
              <div className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-[#2A1A14] shadow-[4px_4px_0px_#2A1A14] overflow-hidden bg-black/90">
                <img
                  src={asset3D}
                  alt={event.category}
                  className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-1 right-1 font-typewriter text-[9px] font-black text-[#FFF6E5] bg-[#2A1A14]/90 px-1 rounded uppercase">
                  3D
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-typewriter text-[10px] text-[#8E2A2A] font-black uppercase tracking-widest">
                    ★ CAMPUS NOTICE // REF #{event.id.replace('ev-', '').toUpperCase()}
                  </span>
                  <ImportantStamp text={event.category} className="text-[9px]" />
                </div>
                <h2 className="font-display font-black text-2xl sm:text-3xl text-[#2A1A14] uppercase leading-tight">
                  {event.title}
                </h2>
                <p className="font-serif-flourish italic text-sm text-[#2A1A14]/85">
                  Organized by {event.organizerClub}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#2A1A14]/10 text-[#2A1A14] transition-colors shrink-0 ml-3"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Event Reminders Toolbar */}
          <div className="p-3 bg-[#FFF6E5] border-2 border-[#2A1A14] rounded-2xl shadow-[2px_2px_0px_#2A1A14] flex flex-wrap items-center justify-between gap-3 font-typewriter text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#2A1A14] flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-[#8E2A2A]" />
                CALENDAR & REMINDER:
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleReminder}
                className={`px-3 py-1.5 rounded-xl border-2 border-[#2A1A14] text-[11px] font-bold shadow-[2px_2px_0px_#2A1A14] flex items-center gap-1.5 transition-all ${
                  hasReminder
                    ? 'bg-[#8E2A2A] text-[#FFF6E5]'
                    : 'bg-[#F3E6CE] text-[#2A1A14] hover:bg-[#A98258] hover:text-[#FFF6E5]'
                }`}
              >
                {hasReminder ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                <span>{hasReminder ? 'Reminder Active' : 'Set Web Reminder'}</span>
              </button>

              <button
                onClick={handleDownloadICS}
                className="px-3 py-1.5 rounded-xl border-2 border-[#2A1A14] bg-[#F3E6CE] text-[#2A1A14] hover:bg-[#A98258] hover:text-[#FFF6E5] text-[11px] font-bold shadow-[2px_2px_0px_#2A1A14] flex items-center gap-1.5 transition-all"
                title="Download iCal (.ics) format"
              >
                <Download className="w-3.5 h-3.5 text-[#5B7A3A]" />
                <span>Export .ICS</span>
              </button>

              <button
                onClick={handleGoogleCalendar}
                className="px-3 py-1.5 rounded-xl border-2 border-[#2A1A14] bg-[#F3E6CE] text-[#2A1A14] hover:bg-[#A98258] hover:text-[#FFF6E5] text-[11px] font-bold shadow-[2px_2px_0px_#2A1A14] flex items-center gap-1.5 transition-all"
                title="Add directly to Google Calendar"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-[#8A1F6E]" />
                <span>Google Cal</span>
              </button>
            </div>
          </div>

          {/* Date, Time & Venue in Kraft Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#FFF6E5] border-2 border-[#2A1A14] rounded-2xl p-4 shadow-[2px_2px_0px_#2A1A14] font-typewriter space-y-1">
              <span className="text-[10px] text-[#8E2A2A] font-black uppercase block">
                WHEN // DAY & HOUR:
              </span>
              <div className="inline-block bg-[#8A1F6E] text-[#FFF6E5] px-2 py-0.5 rounded font-black text-xs mr-2">
                {event.dayLabel || 'CAMPUS'}
              </div>
              <span className="font-display font-black text-lg text-[#2A1A14] block">
                {event.time}
              </span>
              <span className="text-xs text-[#2A1A14]/80 block font-bold">
                {event.date}
              </span>
            </div>

            <div className="bg-[#FFF6E5] border-2 border-[#2A1A14] rounded-2xl p-4 shadow-[2px_2px_0px_#2A1A14] font-typewriter space-y-1">
              <span className="text-[10px] text-[#8E2A2A] font-black uppercase block">
                WHERE // CAMPUS VENUE:
              </span>
              <span className="font-display font-black text-base text-[#2A1A14] block truncate">
                {event.venue}
              </span>
              <span className="text-xs text-[#2A1A14]/80 block">
                Coordinator: {event.organizerEmail}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-2xl bg-[#FFF6E5] border border-[#2A1A14]/30 space-y-2 font-typewriter text-xs text-[#2A1A14]">
            <span className="font-black uppercase text-[#8E2A2A] block">
              EVENT BRIEF:
            </span>
            <p className="leading-relaxed text-[#2A1A14]/90">
              {event.description}
            </p>
          </div>

          {/* Eligibility Checker */}
          <div className="p-4 rounded-2xl bg-[#A98258]/20 border-2 border-[#2A1A14] font-typewriter space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-xs text-[#2A1A14] uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#8E2A2A]" />
                ELIGIBILITY CHECKER:
              </span>
              {studentProfile && (
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border border-[#2A1A14] ${
                  isOverallEligible ? 'bg-[#5B7A3A] text-[#FFF6E5]' : 'bg-[#8E2A2A] text-[#FFF6E5]'
                }`}>
                  {isOverallEligible ? '✓ ELIGIBLE TO REGISTER' : '⚠ RESTRICTED CRITERIA'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#FFF6E5] border border-[#2A1A14]/20 space-y-1">
                <span className="text-[10px] text-[#8E2A2A] font-bold uppercase block">PERMITTED YEARS:</span>
                <span className="font-bold text-[#2A1A14] block">{event.eligibilityYears.join(', ')}</span>
                {studentProfile && (
                  <span className={`text-[10px] block ${isYearEligible ? 'text-[#5B7A3A] font-bold' : 'text-[#8E2A2A]'}`}>
                    {isYearEligible ? `✓ Your year (${studentProfile.year}) matches` : `✗ Open only to ${event.eligibilityYears.join(', ')}`}
                  </span>
                )}
              </div>

              <div className="p-2.5 rounded-xl bg-[#FFF6E5] border border-[#2A1A14]/20 space-y-1">
                <span className="text-[10px] text-[#8E2A2A] font-bold uppercase block">DEPARTMENTS:</span>
                <span className="font-bold text-[#2A1A14] block">{event.eligibilityDepartments.join(', ')}</span>
                {studentProfile && (
                  <span className={`text-[10px] block ${isDeptEligible ? 'text-[#5B7A3A] font-bold' : 'text-[#8E2A2A]'}`}>
                    {isDeptEligible ? `✓ Your department qualifies` : `✗ Department restricted`}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 font-typewriter text-[10px]">
            {event.tags.map((tag, idx) => (
              <span key={idx} className="bg-[#8E2A2A] text-[#FFF6E5] px-2 py-0.5 rounded font-bold uppercase">
                #{tag}
              </span>
            ))}
          </div>

          {/* Capacity Bar */}
          <div className="p-4 rounded-2xl bg-[#A98258]/25 border-2 border-[#2A1A14] space-y-2 font-typewriter">
            <div className="flex items-center justify-between text-xs text-[#2A1A14]">
              <span className="font-black uppercase flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> CAPACITY & SEATS:
              </span>
              <span className="font-black text-[#8E2A2A]">
                {event.registeredCount} / {event.capacity} ({spotsLeft} spots left)
              </span>
            </div>

            <div className="w-full bg-[#FFF6E5] h-3.5 rounded-full overflow-hidden border border-[#2A1A14] p-0.5">
              <div
                style={{
                  width: `${Math.min(100, Math.round((event.registeredCount / event.capacity) * 100))}%`,
                }}
                className="bg-[#8E2A2A] h-full rounded-full transition-all duration-500"
              />
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t-2 border-dashed border-[#2A1A14]/30 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="font-typewriter text-[10px] text-[#2A1A14]/60 uppercase block">STATUS:</span>
              <span className="font-typewriter font-black text-xs text-[#8E2A2A] uppercase">
                {isFull ? 'HOUSE FULL' : event.status}
              </span>
            </div>

            {isRegistered ? (
              <button
                onClick={() => {
                  onClose();
                  onViewPass?.();
                }}
                className="btn-postal-cream flex items-center gap-2 px-6 py-3 rounded-2xl text-xs uppercase font-bold"
              >
                <span>View In My Passes</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : isFull ? (
              <div className="font-typewriter text-xs font-black text-[#8E2A2A] uppercase">
                Event is fully booked.
              </div>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onStartRegistration(event);
                }}
                className="btn-postal-red flex items-center gap-2 px-6 py-3 rounded-2xl text-xs uppercase font-bold"
              >
                <span>Register for Pass ★</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
