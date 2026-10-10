import React, { useState, useEffect } from 'react';
import { ActiveRole, StudentProfile, OrganizerProfile } from '../types';
import {
  QrCode,
  User,
  ShieldCheck,
  ChevronDown,
  Check,
  Compass,
  Sparkles,
  Menu,
  Volume2,
  VolumeX,
  ArrowLeft,
  ArrowRight,
  HeartHandshake,
  Store,
  Gem,
  DoorOpen,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface Props {
  activeRole: ActiveRole;
  onSwitchRole: (role: ActiveRole) => void;
  onOpenScanner: () => void;
  myPassesCount: number;
  studentProfile: StudentProfile | null;
  organizerProfile: OrganizerProfile | null;
  currentStudentTab?: 'board' | 'story' | 'passes' | 'profile';
  onSetStudentTab?: (tab: 'board' | 'story' | 'passes' | 'profile') => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
  onGoBack?: () => void;
  onGoForward?: () => void;
}

export const TopBar: React.FC<Props> = ({
  activeRole,
  onSwitchRole,
  onOpenScanner,
  myPassesCount,
  studentProfile,
  organizerProfile,
  currentStudentTab,
  onSetStudentTab,
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(soundFx.getMuted());

  useEffect(() => {
    setIsMuted(soundFx.getMuted());
  }, []);

  const handleToggleMute = () => {
    const next = soundFx.toggleMute();
    setIsMuted(next);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E8D9B0]/20 bg-[#0B1030]/90 backdrop-blur-xl transition-all select-none shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* ========================================================
            ZONE 1 (LEFT): BACK/FORWARD + SWITCH ROLE PILL
        ======================================================== */}
        <div className="flex items-center gap-2">
          {/* Back & Forward Page Navigation (PART 4.2) */}
          {(onGoBack || onGoForward) && (
            <div className="hidden sm:flex items-center gap-1 bg-[#10142E] border border-[#E8D9B0]/30 rounded-full p-0.5">
              <button
                onClick={onGoBack}
                disabled={!canGoBack}
                title="Go Back"
                className={`p-1.5 rounded-full transition-colors ${
                  canGoBack
                    ? 'text-[#E8D9B0] hover:text-[#FFF6E5] hover:bg-[#1B2257]'
                    : 'text-slate-600 cursor-not-allowed'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onGoForward}
                disabled={!canGoForward}
                title="Go Forward"
                className={`p-1.5 rounded-full transition-colors ${
                  canGoForward
                    ? 'text-[#E8D9B0] hover:text-[#FFF6E5] hover:bg-[#1B2257]'
                    : 'text-slate-600 cursor-not-allowed'
                }`}
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick "Switch Role" Pill to Return to Gate (PART 1.1) */}
          <button
            onClick={() => {
              soundFx.playClick();
              onSwitchRole('gate');
            }}
            className="glass-pill px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-heading font-semibold uppercase text-[#E8D9B0] hover:text-[#FFF6E5] border border-[#E8D9B0]/35 hover:border-[#E8D9B0] transition-all"
            title="Return to Grand Gate and switch identity"
          >
            <DoorOpen className="w-3.5 h-3.5 text-[#E04A7B]" />
            <span className="hidden sm:inline">Switch Role</span>
          </button>

          {/* Role Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => {
                soundFx.playClick();
                setShowRoleMenu((prev) => !prev);
              }}
              className="glass-pill px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-sans text-[#FFF6E5] hover:border-[#E8D9B0]/50 transition-all"
              aria-label="Toggle role menu"
            >
              <Menu className="w-3.5 h-3.5 text-[#E8D9B0]" />
              <span className="capitalize text-xs font-medium">
                {activeRole === 'student'
                  ? 'Student'
                  : activeRole === 'organizer'
                  ? 'Organizer'
                  : activeRole === 'volunteer'
                  ? 'Volunteer'
                  : activeRole === 'stall'
                  ? 'Stall Owner'
                  : activeRole === 'sponsor'
                  ? 'Sponsor'
                  : activeRole === 'trail'
                  ? 'Trail Map'
                  : 'Role Gate'}
              </span>
              <ChevronDown className="w-3 h-3 text-[#E8D9B0]/60 ml-0.5" />
            </button>

            {/* Dropdown Menu Glass Panel */}
            {showRoleMenu && (
              <div
                className="absolute left-0 mt-2 w-64 rounded-2xl bg-[#060A1C]/95 p-2 z-50 font-sans text-xs border border-[#E8D9B0]/30 shadow-[0_16px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl"
                onClick={() => setShowRoleMenu(false)}
              >
                <div className="px-3 py-1.5 border-b border-[#E8D9B0]/15 text-[10px] font-display uppercase tracking-widest text-[#E8D9B0]/80">
                  Switch Portal Mode
                </div>

                <button
                  onClick={() => onSwitchRole('gate')}
                  className={`w-full px-3 py-2 mt-1 rounded-xl text-left flex items-center justify-between hover:bg-[#1B2257]/60 transition-colors ${
                    activeRole === 'gate' ? 'bg-[#1B2257]/80 text-[#E8D9B0] font-semibold' : 'text-[#FFF6E5]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <DoorOpen className="w-4 h-4 text-[#E04A7B]" />
                    <div>
                      <div className="font-medium">Grand Role Gate</div>
                      <div className="text-[10px] text-[#FFF6E5]/60">Select persona entry</div>
                    </div>
                  </div>
                  {activeRole === 'gate' && <Check className="w-3.5 h-3.5 text-[#E8D9B0]" />}
                </button>

                <button
                  onClick={() => onSwitchRole('student')}
                  className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between hover:bg-[#1B2257]/60 transition-colors ${
                    activeRole === 'student' ? 'bg-[#1B2257]/80 text-[#E8D9B0] font-semibold' : 'text-[#FFF6E5]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-[#38BDF8]" />
                    <div>
                      <div className="font-medium">Student Desk</div>
                      <div className="text-[10px] text-[#FFF6E5]/60">Notices, story, passes</div>
                    </div>
                  </div>
                  {activeRole === 'student' && <Check className="w-3.5 h-3.5 text-[#38BDF8]" />}
                </button>

                <button
                  onClick={() => onSwitchRole('organizer')}
                  className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between hover:bg-[#1B2257]/60 transition-colors ${
                    activeRole === 'organizer' ? 'bg-[#1B2257]/80 text-[#E8D9B0] font-semibold' : 'text-[#FFF6E5]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-medium">Organizer Desk</div>
                      <div className="text-[10px] text-[#FFF6E5]/60">Command center & graphs</div>
                    </div>
                  </div>
                  {activeRole === 'organizer' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>

                <button
                  onClick={() => onSwitchRole('volunteer')}
                  className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between hover:bg-[#1B2257]/60 transition-colors ${
                    activeRole === 'volunteer' ? 'bg-[#1B2257]/80 text-[#E8D9B0] font-semibold' : 'text-[#FFF6E5]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <HeartHandshake className="w-4 h-4 text-[#38BDF8]" />
                    <div>
                      <div className="font-medium">Volunteer Crew</div>
                      <div className="text-[10px] text-[#FFF6E5]/60">Shifts & digital badges</div>
                    </div>
                  </div>
                  {activeRole === 'volunteer' && <Check className="w-3.5 h-3.5 text-[#38BDF8]" />}
                </button>

                <button
                  onClick={() => onSwitchRole('stall')}
                  className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between hover:bg-[#1B2257]/60 transition-colors ${
                    activeRole === 'stall' ? 'bg-[#1B2257]/80 text-[#E8D9B0] font-semibold' : 'text-[#FFF6E5]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Store className="w-4 h-4 text-[#F59E0B]" />
                    <div>
                      <div className="font-medium">Stall Owner</div>
                      <div className="text-[10px] text-[#FFF6E5]/60">Permits & bazaar matrix</div>
                    </div>
                  </div>
                  {activeRole === 'stall' && <Check className="w-3.5 h-3.5 text-[#F59E0B]" />}
                </button>

                <button
                  onClick={() => onSwitchRole('sponsor')}
                  className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between hover:bg-[#1B2257]/60 transition-colors ${
                    activeRole === 'sponsor' ? 'bg-[#1B2257]/80 text-[#E8D9B0] font-semibold' : 'text-[#FFF6E5]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Gem className="w-4 h-4 text-[#E04A7B]" />
                    <div>
                      <div className="font-medium">Sponsor Guild</div>
                      <div className="text-[10px] text-[#FFF6E5]/60">Pledges & sponsor wall</div>
                    </div>
                  </div>
                  {activeRole === 'sponsor' && <Check className="w-3.5 h-3.5 text-[#E04A7B]" />}
                </button>

                <button
                  onClick={() => onSwitchRole('trail')}
                  className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between hover:bg-[#1B2257]/60 transition-colors ${
                    activeRole === 'trail' ? 'bg-[#1B2257]/80 text-[#E8D9B0] font-semibold' : 'text-[#FFF6E5]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Compass className="w-4 h-4 text-[#E8D9B0]" />
                    <div>
                      <div className="font-medium">Campus Trail Map</div>
                      <div className="text-[10px] text-[#FFF6E5]/60">Illustrated parchment map</div>
                    </div>
                  </div>
                  {activeRole === 'trail' && <Check className="w-3.5 h-3.5 text-[#E8D9B0]" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            ZONE 2 (CENTER): CENTERED ENGRAVED LOGO
        ======================================================== */}
        <div
          onClick={() => {
            soundFx.playClick();
            onSwitchRole('gate');
          }}
          className="cursor-pointer flex items-center justify-center text-center group py-1"
          title="Festora Portal Home"
        >
          <div className="flex items-center gap-2">
            <span className="text-[#E8D9B0] text-xs sm:text-sm">✧</span>
            <span className="font-display font-black text-xl sm:text-2xl md:text-3xl tracking-[0.25em] uppercase text-gold-gradient group-hover:brightness-110 transition-all">
              FESTORA
            </span>
            <span className="text-[#E8D9B0] text-xs sm:text-sm">✧</span>
          </div>
        </div>

        {/* ========================================================
            ZONE 3 (RIGHT): AUDIO MUTE + EVENTS + TRAIL + SCANNER
        ======================================================== */}
        <div className="flex items-center gap-2">
          {/* Events Notice Board Link - accessible for all roles */}
          <button
            onClick={() => {
              soundFx.playClick();
              onSwitchRole('student');
            }}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans transition-all ${
              activeRole === 'student'
                ? 'bg-[#1B2257] border border-[#E8D9B0]/50 text-[#E8D9B0]'
                : 'glass-pill text-[#FFF6E5]/85 hover:text-[#FFF6E5]'
            }`}
            title="Browse all festival events, descriptions & schedules"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E8D9B0]" />
            <span>Events</span>
          </button>

          {/* Audio Mute Toggle Button (PART 5.B) */}
          <button
            onClick={handleToggleMute}
            className="p-2 rounded-full glass-pill border border-[#E8D9B0]/30 text-[#E8D9B0] hover:text-[#FFF6E5] transition-colors"
            title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Trail Map Link */}
          <button
            onClick={() => {
              soundFx.playClick();
              onSwitchRole('trail');
            }}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans transition-all ${
              activeRole === 'trail'
                ? 'bg-[#1B2257] border border-[#E8D9B0]/50 text-[#E8D9B0]'
                : 'glass-pill text-[#FFF6E5]/85 hover:text-[#FFF6E5]'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Trail Map</span>
          </button>

          {/* Scanner Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenScanner();
            }}
            className="btn-crimson-pill px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs uppercase tracking-wider font-semibold gap-1.5 min-h-[38px]"
            title="Open camera pass scanner & manual entry"
          >
            <QrCode className="w-3.5 h-3.5 text-[#FFF6E5]" />
            <span className="hidden sm:inline">Scanner</span>
          </button>
        </div>
      </div>
    </header>
  );
};
