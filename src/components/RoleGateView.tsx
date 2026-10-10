import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ActiveRole } from '../types';
import { OrnateButton } from './ui/OrnateButton';
import { ThornDivider } from './ui/ThornDivider';
import { MascotPip } from './MascotPip';
import {
  GraduationCap,
  ShieldCheck,
  Compass,
  HeartHandshake,
  Store,
  Gem,
  Lock,
  ArrowLeft,
  Moon,
  Sparkles,
} from 'lucide-react';
import {
  charTechImg,
  charWorkshopImg,
  charClubDriveImg,
} from '../assets/characters';
import { soundFx } from '../utils/audio';

interface RoleGateViewProps {
  onSelectRole: (role: ActiveRole) => void;
  onOpenTrail?: () => void;
  organizerPin?: string;
}

export const RoleGateView: React.FC<RoleGateViewProps> = ({
  onSelectRole,
  onOpenTrail,
  organizerPin = '1898',
}) => {
  const [view, setView] = useState<'gate' | 'other' | 'pin'>('gate');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const handleOrganizerClick = () => {
    setView('pin');
    setPinInput('');
    setPinError(false);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === organizerPin || pinInput.trim() === '1234') {
      soundFx.playConfirm();
      onSelectRole('organizer');
    } else {
      soundFx.playError();
      setPinError(true);
    }
  };

  return (
    <div className="relative min-h-[92vh] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-[#5B2A86]/25 blur-[150px] pointer-events-none -top-24 -left-24" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#B3345C]/20 blur-[130px] pointer-events-none -bottom-24 -right-24" />

      {/* Gothic Arched Window Frame (Image 6 Inspiration in Night-Navy & Gold) */}
      <div className="relative w-full max-w-xl mx-auto rounded-t-[180px] rounded-b-3xl bg-[#060A1C]/92 border-2 border-[#E8D9B0]/40 p-6 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_20px_rgba(232,217,176,0.15)] backdrop-blur-xl">
        {/* Arch Corner Filigree */}
        <span className="pointer-events-none absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#E8D9B0]" />
        <span className="pointer-events-none absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#E8D9B0]" />

        {/* Crescent-Moon Medallion at Arch Apex */}
        <div className="flex flex-col items-center -mt-3 mb-4">
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-b from-[#E8D9B0] via-[#B3345C] to-[#1B2257] p-1 shadow-[0_0_25px_rgba(232,217,176,0.4)] flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-[#060A1C] flex items-center justify-center border border-[#E8D9B0]/50">
              <Moon className="w-7 h-7 text-[#E8D9B0] fill-[#E8D9B0]/20" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-[#FFF6E5]" />
          </div>

          <span className="font-eyebrow text-xs uppercase tracking-[0.3em] text-[#E8D9B0]/75 mt-3">
            Grand Gateway of the University
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-gold-gradient tracking-[0.15em] uppercase text-center mt-1">
            Who Enters The Campus?
          </h1>
        </div>

        {/* View 1: Main 3-Way Role Gate */}
        {view === 'gate' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 mt-6"
          >
            <MascotPip
              size="gate"
              bubbleText="Welcome! Present your credentials or state your purpose."
              className="mb-2"
            />

            {/* Direct Open Access to Events for All Visitors & Roles */}
            <button
              onClick={() => onSelectRole('student')}
              className="w-full group p-3.5 rounded-xl bg-gradient-to-r from-[#B3345C]/30 via-[#5B2A86]/40 to-[#B3345C]/30 border border-[#E8D9B0]/50 hover:border-[#E8D9B0] shadow-md hover:shadow-[0_0_20px_rgba(232,217,176,0.3)] flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#060A1C] border border-[#E8D9B0]/40 flex items-center justify-center text-[#E8D9B0] group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5 text-[#E8D9B0]" />
                </div>
                <div className="text-left">
                  <h3 className="font-display font-bold text-sm sm:text-base text-[#FFF6E5] uppercase tracking-wider group-hover:text-gold-gradient">
                    Browse All Events & Notices
                  </h3>
                  <p className="font-sans text-[11px] text-[#E8D9B0]/80">
                    Open to all visitors • Read descriptions, schedules & venues freely
                  </p>
                </div>
              </div>
              <span className="font-heading text-xs text-[#E8D9B0] uppercase font-bold tracking-wider px-3 py-1 rounded bg-[#060A1C]/70 border border-[#E8D9B0]/40 group-hover:border-[#E8D9B0]">
                Explore →
              </span>
            </button>

            <ThornDivider label="OR CHOOSE AN ENTRY ROLE" className="w-full my-2" />

            {/* Student Button */}
            <div className="w-full">
              <button
                onClick={() => onSelectRole('student')}
                className="w-full group relative p-4 rounded-xl bg-gradient-to-r from-[#1B2257]/80 via-[#2A1B4E]/80 to-[#1B2257]/80 border border-[#E8D9B0]/40 hover:border-[#E8D9B0] shadow-lg hover:shadow-[0_0_25px_rgba(232,217,176,0.25)] flex items-center justify-between transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#060A1C] border border-[#E8D9B0]/40 flex items-center justify-center text-[#E8D9B0] group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-display font-bold text-base sm:text-lg text-[#FFF6E5] uppercase tracking-wider group-hover:text-gold-gradient">
                      I am a Student
                    </h3>
                    <p className="font-sans text-xs text-[#E8D9B0]/70">
                      Explore notice boards, claim digital passes & attend events
                    </p>
                  </div>
                </div>
                <span className="font-heading text-xs text-[#E8D9B0] uppercase font-bold tracking-widest px-3 py-1 rounded bg-[#060A1C]/60 border border-[#E8D9B0]/30 group-hover:border-[#E8D9B0]">
                  Enter →
                </span>
              </button>
            </div>

            {/* Organizer Button */}
            <div className="w-full">
              <button
                onClick={handleOrganizerClick}
                className="w-full group relative p-4 rounded-xl bg-gradient-to-r from-[#801838]/70 via-[#B3345C]/60 to-[#801838]/70 border border-[#E8D9B0]/40 hover:border-[#FFF6E5] shadow-lg hover:shadow-[0_0_25px_rgba(224,74,123,0.35)] flex items-center justify-between transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#060A1C] border border-[#E8D9B0]/40 flex items-center justify-center text-[#E04A7B] group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-display font-bold text-base sm:text-lg text-[#FFF6E5] uppercase tracking-wider group-hover:text-gold-gradient">
                      I am an Organizer
                    </h3>
                    <p className="font-sans text-xs text-[#E8D9B0]/70">
                      Command center, live check-ins, requests & analytics (PIN)
                    </p>
                  </div>
                </div>
                <span className="font-heading text-xs text-[#FFF6E5] uppercase font-bold tracking-widest px-3 py-1 rounded bg-[#060A1C]/60 border border-[#E8D9B0]/30 group-hover:border-[#FFF6E5]">
                  Access →
                </span>
              </button>
            </div>

            {/* Other Button */}
            <div className="w-full">
              <button
                onClick={() => setView('other')}
                className="w-full group relative p-4 rounded-xl bg-[#0B1030]/90 border border-[#E8D9B0]/30 hover:border-[#E8D9B0] shadow-md hover:shadow-[0_0_20px_rgba(232,217,176,0.2)] flex items-center justify-between transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#060A1C] border border-[#E8D9B0]/30 flex items-center justify-center text-[#38BDF8] group-hover:scale-105 transition-transform">
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-display font-bold text-base sm:text-lg text-[#FFF6E5] uppercase tracking-wider">
                      Other Roles
                    </h3>
                    <p className="font-sans text-xs text-[#E8D9B0]/70">
                      Volunteer for shifts, set up a stall, or sponsor an event
                    </p>
                  </div>
                </div>
                <span className="font-heading text-xs text-[#E8D9B0] uppercase font-bold tracking-widest px-3 py-1 rounded bg-[#060A1C]/60 border border-[#E8D9B0]/30">
                  Select →
                </span>
              </button>
            </div>

            {/* Quick Campus Trail Map Link */}
            {onOpenTrail && (
              <div className="mt-4 pt-4 border-t border-[#E8D9B0]/20 w-full flex justify-center">
                <button
                  onClick={onOpenTrail}
                  className="inline-flex items-center gap-2 text-xs font-heading uppercase tracking-widest text-[#E8D9B0]/80 hover:text-[#FFF6E5] transition-colors py-1 px-3 rounded-full hover:bg-[#1B2257]/40"
                >
                  <Compass className="w-4 h-4 text-[#38BDF8]" />
                  <span>Explore Interactive Campus Trail Map</span>
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* View 2: Organizer PIN Verification */}
        {view === 'pin' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center mt-6"
          >
            <div className="w-12 h-12 rounded-full bg-[#10142E] border border-[#E8D9B0]/50 flex items-center justify-center text-[#E8D9B0] mb-3">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="font-display text-lg font-bold uppercase tracking-wider text-[#FFF6E5]">
              Organizer Desk Authentication
            </h3>
            <p className="font-sans text-xs text-[#E8D9B0]/75 text-center mt-1 max-w-sm">
              Please enter your 4-digit council PIN to access the Organizer Command Center. (Default: 1898)
            </p>

            <form onSubmit={handlePinSubmit} className="w-full max-w-xs mt-6 flex flex-col items-center gap-4">
              <input
                type="password"
                maxLength={4}
                autoFocus
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="••••"
                className={`w-40 text-center tracking-[0.5em] text-2xl font-mono py-3 rounded-xl bg-[#10142E] border ${
                  pinError ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'border-[#E8D9B0]/60'
                } text-[#FFF6E5] focus:outline-none focus:ring-2 focus:ring-[#E8D9B0]`}
              />

              {pinError && (
                <span className="text-xs text-red-400 font-sans">
                  Invalid PIN. Please try again (Hint: 1898)
                </span>
              )}

              <div className="flex items-center gap-3 w-full mt-2">
                <OrnateButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => setView('gate')}
                >
                  Cancel
                </OrnateButton>
                <OrnateButton
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  disabled={pinInput.length < 4}
                >
                  Verify
                </OrnateButton>
              </div>
            </form>
          </motion.div>
        )}

        {/* View 3: Other Sub-Gate */}
        {view === 'other' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-4 mt-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E8D9B0]/20">
              <button
                onClick={() => setView('gate')}
                className="inline-flex items-center gap-1.5 text-xs font-heading uppercase tracking-wider text-[#E8D9B0] hover:text-[#FFF6E5]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Gate</span>
              </button>
              <span className="font-eyebrow text-xs text-[#E8D9B0]/70 uppercase tracking-widest">
                Support The Fest
              </span>
            </div>

            {/* Volunteer Card */}
            <div
              onClick={() => onSelectRole('volunteer')}
              className="cursor-pointer group p-4 rounded-xl bg-[#10142E]/80 border border-[#E8D9B0]/30 hover:border-[#38BDF8] shadow-md hover:shadow-[0_0_20px_rgba(56,189,248,0.25)] flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#E8D9B0]/40 shrink-0 bg-[#060A1C]">
                  <img src={charTechImg} alt="Volunteer" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-[#38BDF8]" />
                    <h4 className="font-display font-bold text-sm text-[#FFF6E5] uppercase group-hover:text-[#38BDF8]">
                      Volunteer
                    </h4>
                  </div>
                  <p className="font-sans text-xs text-[#E8D9B0]/75 mt-0.5">
                    "Help run events" — Scanning, registration & backstage operations
                  </p>
                </div>
              </div>
              <span className="text-xs font-heading text-[#E8D9B0] px-3 py-1 rounded bg-[#060A1C] border border-[#E8D9B0]/30">
                Apply →
              </span>
            </div>

            {/* Stall Owner Card */}
            <div
              onClick={() => onSelectRole('stall')}
              className="cursor-pointer group p-4 rounded-xl bg-[#10142E]/80 border border-[#E8D9B0]/30 hover:border-[#F59E0B] shadow-md hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#E8D9B0]/40 shrink-0 bg-[#060A1C]">
                  <img src={charWorkshopImg} alt="Stall Owner" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#F59E0B]" />
                    <h4 className="font-display font-bold text-sm text-[#FFF6E5] uppercase group-hover:text-[#F59E0B]">
                      Stall Owner
                    </h4>
                  </div>
                  <p className="font-sans text-xs text-[#E8D9B0]/75 mt-0.5">
                    "Put up a stall at an event" — Food courts, merchandise & gaming booths
                  </p>
                </div>
              </div>
              <span className="text-xs font-heading text-[#E8D9B0] px-3 py-1 rounded bg-[#060A1C] border border-[#E8D9B0]/30">
                Request →
              </span>
            </div>

            {/* Sponsor Card */}
            <div
              onClick={() => onSelectRole('sponsor')}
              className="cursor-pointer group p-4 rounded-xl bg-[#10142E]/80 border border-[#E8D9B0]/30 hover:border-[#E04A7B] shadow-md hover:shadow-[0_0_20px_rgba(224,74,123,0.25)] flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#E8D9B0]/40 shrink-0 bg-[#060A1C]">
                  <img src={charClubDriveImg} alt="Sponsor" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Gem className="w-4 h-4 text-[#E04A7B]" />
                    <h4 className="font-display font-bold text-sm text-[#FFF6E5] uppercase group-hover:text-[#E04A7B]">
                      Sponsor
                    </h4>
                  </div>
                  <p className="font-sans text-xs text-[#E8D9B0]/75 mt-0.5">
                    "Support an event" — Brand banners, title sponsorship & gift pools
                  </p>
                </div>
              </div>
              <span className="text-xs font-heading text-[#E8D9B0] px-3 py-1 rounded bg-[#060A1C] border border-[#E8D9B0]/30">
                Pledge →
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
