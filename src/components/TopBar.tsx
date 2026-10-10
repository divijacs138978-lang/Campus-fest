import React, { useState } from 'react';
import { ActiveRole, StudentProfile, OrganizerProfile } from '../types';
import {
  QrCode,
  User,
  ShieldCheck,
  ChevronDown,
  Check,
  Compass,
  Ticket,
  Sparkles,
  MapPin,
  Menu,
} from 'lucide-react';
import { postalSoundFx } from '../utils/audio';

interface Props {
  activeRole: ActiveRole;
  onSwitchRole: (role: ActiveRole) => void;
  onOpenScanner: () => void;
  myPassesCount: number;
  studentProfile: StudentProfile | null;
  organizerProfile: OrganizerProfile | null;
  currentStudentTab?: 'board' | 'passes' | 'profile';
  onSetStudentTab?: (tab: 'board' | 'passes' | 'profile') => void;
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
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E8D9B0]/18 bg-[#0B1030]/85 backdrop-blur-xl transition-all select-none shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* ========================================================
            ZONE 1 (LEFT): ROLE SWITCHER / MENU GLASS PILL
        ======================================================== */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => {
                postalSoundFx.playTypewriterTick();
                setShowRoleMenu((prev) => !prev);
              }}
              className="glass-pill px-3.5 py-1.5 flex items-center gap-2 text-xs font-sans text-[#FFF6E5] hover:border-[#E8D9B0]/50 transition-all min-h-[38px]"
              aria-label="Toggle role menu"
            >
              <Menu className="w-3.5 h-3.5 text-[#E8D9B0]" />
              {activeRole === 'student' ? (
                <>
                  <User className="w-3.5 h-3.5 text-[#E04A7B]" />
                  <span className="hidden sm:inline text-[#E8D9B0]/80">Student:</span>
                  <span className="max-w-[85px] truncate font-medium">
                    {studentProfile?.name?.split(' ')[0] || 'Aarav'}
                  </span>
                </>
              ) : activeRole === 'organizer' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline text-[#E8D9B0]/80">Organizer:</span>
                  <span className="max-w-[85px] truncate font-medium">
                    {organizerProfile?.clubName?.split(' ')[0] || 'Club'}
                  </span>
                </>
              ) : activeRole === 'trail' ? (
                <>
                  <Compass className="w-3.5 h-3.5 text-[#E8D9B0]" />
                  <span className="font-medium">Trail Map</span>
                </>
              ) : (
                <span className="font-medium text-[#E8D9B0]">Menu</span>
              )}
              <ChevronDown className="w-3 h-3 text-[#E8D9B0]/60 ml-0.5" />
            </button>

            {/* Dropdown Menu Glass Panel */}
            {showRoleMenu && (
              <div
                className="absolute left-0 mt-2 w-64 rounded-2xl glass-panel p-2 z-50 font-sans text-xs border border-[#E8D9B0]/25 shadow-[0_16px_40px_rgba(0,0,0,0.7)]"
                onClick={() => setShowRoleMenu(false)}
              >
                <div className="px-3 py-1.5 border-b border-[#E8D9B0]/15 text-[10px] font-display uppercase tracking-widest text-[#E8D9B0]/80">
                  Switch Portal Mode
                </div>

                <button
                  onClick={() => onSwitchRole('landing')}
                  className={`w-full px-3 py-2.5 mt-1 rounded-xl text-left flex items-center justify-between hover:bg-[#1B2257]/60 transition-colors ${
                    activeRole === 'landing' ? 'bg-[#1B2257]/80 text-[#E8D9B0] font-semibold' : 'text-[#FFF6E5]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#E8D9B0]" />
                    <div>
                      <div className="font-medium">Storybook Gateway</div>
                      <div className="text-[10px] text-[#FFF6E5]/60">Chapters & Notice Board</div>
                    </div>
                  </div>
                  {activeRole === 'landing' && <Check className="w-3.5 h-3.5 text-[#E8D9B0]" />}
                </button>

                <button
                  onClick={() => onSwitchRole('student')}
                  className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between hover:bg-[#1B2257]/60 transition-colors ${
                    activeRole === 'student' ? 'bg-[#1B2257]/80 text-[#E8D9B0] font-semibold' : 'text-[#FFF6E5]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-[#E04A7B]" />
                    <div>
                      <div className="font-medium">Student Desk</div>
                      <div className="text-[10px] text-[#FFF6E5]/60">Notice board, passes & profile</div>
                    </div>
                  </div>
                  {activeRole === 'student' && <Check className="w-3.5 h-3.5 text-[#E04A7B]" />}
                </button>

                <button
                  onClick={() => onSwitchRole('organizer')}
                  className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between hover:bg-[#1B2257]/60 transition-colors ${
                    activeRole === 'organizer' ? 'bg-[#1B2257]/80 text-[#E8D9B0] font-semibold' : 'text-[#FFF6E5]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-medium">Organizer Desk</div>
                      <div className="text-[10px] text-[#FFF6E5]/60">Command center, roster & stats</div>
                    </div>
                  </div>
                  {activeRole === 'organizer' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>

                <button
                  onClick={() => onSwitchRole('trail')}
                  className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between hover:bg-[#1B2257]/60 transition-colors ${
                    activeRole === 'trail' ? 'bg-[#1B2257]/80 text-[#E8D9B0] font-semibold' : 'text-[#FFF6E5]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Compass className="w-4 h-4 text-[#E8D9B0]" />
                    <div>
                      <div className="font-medium">Campus Trail Map</div>
                      <div className="text-[10px] text-[#FFF6E5]/60">Road-map & navigation guide</div>
                    </div>
                  </div>
                  {activeRole === 'trail' && <Check className="w-3.5 h-3.5 text-[#E8D9B0]" />}
                </button>
              </div>
            )}
          </div>

          {/* Student Tabs (When active role is student) */}
          {activeRole === 'student' && onSetStudentTab && (
            <div className="hidden lg:flex items-center gap-1 font-sans text-xs">
              <button
                onClick={() => onSetStudentTab('board')}
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  currentStudentTab === 'board'
                    ? 'text-[#E8D9B0] bg-[#1B2257]/70 border border-[#E8D9B0]/30 font-semibold'
                    : 'text-[#FFF6E5]/75 hover:text-[#FFF6E5]'
                }`}
              >
                Board
              </button>
              <button
                onClick={() => onSetStudentTab('passes')}
                className={`px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${
                  currentStudentTab === 'passes'
                    ? 'text-[#E8D9B0] bg-[#1B2257]/70 border border-[#E8D9B0]/30 font-semibold'
                    : 'text-[#FFF6E5]/75 hover:text-[#FFF6E5]'
                }`}
              >
                <span>Passes</span>
                {myPassesCount > 0 && (
                  <span className="bg-[#B3345C] text-[#FFF6E5] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {myPassesCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => onSetStudentTab('profile')}
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  currentStudentTab === 'profile'
                    ? 'text-[#E8D9B0] bg-[#1B2257]/70 border border-[#E8D9B0]/30 font-semibold'
                    : 'text-[#FFF6E5]/75 hover:text-[#FFF6E5]'
                }`}
              >
                Profile
              </button>
            </div>
          )}
        </div>

        {/* ========================================================
            ZONE 2 (CENTER): CENTERED ENGRAVED LOGO
        ======================================================== */}
        <div
          onClick={() => {
            postalSoundFx.playTypewriterTick();
            onSwitchRole('landing');
          }}
          className="cursor-pointer flex flex-col items-center text-center group"
        >
          <div className="flex items-center gap-2">
            <span className="text-[#E8D9B0] text-xs">✧</span>
            <span className="font-display font-black text-lg sm:text-2xl tracking-[0.2em] uppercase text-gold-gradient group-hover:brightness-110 transition-all">
              CAMPUS POST
            </span>
            <span className="text-[#E8D9B0] text-xs">✧</span>
          </div>
          <span className="font-eyebrow text-[10px] text-[#E8D9B0]/70 tracking-widest uppercase block -mt-1 hidden sm:block">
            Dark Storybook Festival Nexus
          </span>
        </div>

        {/* ========================================================
            ZONE 3 (RIGHT): TRAIL MAP LINK + CRIMSON SCANNER PILL
        ======================================================== */}
        <div className="flex items-center gap-2.5">
          {/* Quick Trail Map button */}
          <button
            onClick={() => {
              postalSoundFx.playTypewriterTick();
              onSwitchRole('trail');
            }}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans transition-all ${
              activeRole === 'trail'
                ? 'bg-[#1B2257] border border-[#E8D9B0]/50 text-[#E8D9B0]'
                : 'glass-pill text-[#FFF6E5]/85 hover:text-[#FFF6E5]'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#E8D9B0]" />
            <span>Trail Map</span>
          </button>

          {/* Scanner Button (Glowing Crimson Pill) */}
          <button
            onClick={() => {
              postalSoundFx.playTypewriterTick();
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
