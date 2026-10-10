import React, { useState } from 'react';
import { ActiveRole, StudentProfile, OrganizerProfile } from '../types';
import { QrCode, User, ShieldCheck, Sparkles, ChevronDown, Check, LogOut, Compass, Ticket } from 'lucide-react';
import { PostageStamp } from './PostalDecorations';

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
    <header className="sticky top-0 z-40 w-full border-b-2 border-[#2A1A14] bg-[#5E1250]/95 backdrop-blur-md transition-colors select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark & College Subtitle */}
        <div
          onClick={() => onSwitchRole('landing')}
          className="cursor-pointer flex items-center gap-2.5 group shrink-0"
        >
          <div className="shrink-0 -my-1">
            <PostageStamp price="POST" title="CAMPUS" color="#8E2A2A" className="w-9 h-11" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-xl sm:text-2xl tracking-tight text-[#FFF6E5] uppercase group-hover:text-[#F3E6CE] transition-colors text-retro-outline-plum">
                CAMPUS POST
              </span>
              <span className="hidden lg:inline-block bg-[#8E2A2A] text-[#FFF6E5] text-[9px] font-black px-1.5 py-0.5 rounded border border-[#2A1A14] font-typewriter uppercase">
                PORTAL
              </span>
            </div>
            <span className="font-typewriter text-[9px] text-[#F3E6CE]/80 tracking-widest uppercase block -mt-0.5">
              NOTICE BOARD & CHECK-IN DESK
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links when in Student / Organizer mode */}
        <nav className="hidden md:flex items-center gap-6 font-typewriter text-xs font-bold tracking-wider uppercase">
          {activeRole === 'student' && onSetStudentTab && (
            <>
              <button
                onClick={() => onSetStudentTab('board')}
                className={`transition-colors flex items-center gap-1.5 hover:text-[#FFF6E5] ${
                  currentStudentTab === 'board'
                    ? 'text-[#FFF6E5] underline underline-offset-8 decoration-2 decoration-[#8E2A2A]'
                    : 'text-[#FFF6E5]/75'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Notice Board</span>
              </button>

              <button
                onClick={() => onSetStudentTab('passes')}
                className={`flex items-center gap-1.5 transition-colors hover:text-[#FFF6E5] ${
                  currentStudentTab === 'passes'
                    ? 'text-[#FFF6E5] underline underline-offset-8 decoration-2 decoration-[#8E2A2A]'
                    : 'text-[#FFF6E5]/75'
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>My Passes</span>
                {myPassesCount > 0 && (
                  <span className="bg-[#8E2A2A] text-[#FFF6E5] text-[10px] font-black px-1.5 py-0.2 rounded border border-[#2A1A14]">
                    {myPassesCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => onSetStudentTab('profile')}
                className={`flex items-center gap-1.5 transition-colors hover:text-[#FFF6E5] ${
                  currentStudentTab === 'profile'
                    ? 'text-[#FFF6E5] underline underline-offset-8 decoration-2 decoration-[#8E2A2A]'
                    : 'text-[#FFF6E5]/75'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>My Profile</span>
              </button>
            </>
          )}

          {activeRole === 'organizer' && (
            <div className="flex items-center gap-2 text-[#FFF6E5] font-typewriter text-xs">
              <span className="bg-[#8E2A2A] text-[#FFF6E5] px-2 py-0.5 rounded border border-[#2A1A14] font-black">
                ORGANIZER COMMAND CENTER
              </span>
              <span className="text-[#F3E6CE]/80 text-[11px]">
                {organizerProfile?.clubName || 'IEEE Student Branch'}
              </span>
            </div>
          )}

          {activeRole === 'landing' && (
            <div className="flex items-center gap-4">
              <span className="text-[#FFF6E5]/70 font-typewriter text-xs italic">
                Official University Notice Board & Entry Gate
              </span>
              <button
                onClick={() => onSwitchRole('trail')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8E2A2A] text-[#FFF6E5] border border-[#2A1A14] text-xs font-typewriter font-bold hover:bg-[#A98258] transition-colors"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Trail Map</span>
              </button>
            </div>
          )}

          {activeRole === 'trail' && (
            <div className="flex items-center gap-2 text-[#FFF6E5] font-typewriter text-xs">
              <span className="bg-[#8E2A2A] text-[#FFF6E5] px-2 py-0.5 rounded border border-[#2A1A14] font-black">
                CAMPUS TRAIL ROAD MAP
              </span>
              <button
                onClick={() => onSwitchRole('landing')}
                className="text-[#F3E6CE] hover:underline text-[11px] ml-2"
              >
                ← Return to Notice Board
              </button>
            </div>
          )}
        </nav>

        {/* Zone 3: Quick Role Switcher Pill + Scan Button */}
        <div className="flex items-center gap-2.5">
          {/* Quick Role Switcher Dropdown Pill */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F3E6CE] border-2 border-[#2A1A14] text-[#2A1A14] shadow-[2px_2px_0px_#2A1A14] font-typewriter text-xs font-black transition-transform active:translate-y-0.5"
            >
              {activeRole === 'student' ? (
                <>
                  <User className="w-3.5 h-3.5 text-[#8E2A2A]" />
                  <span className="hidden sm:inline">Student:</span>
                  <span className="max-w-[90px] truncate">{studentProfile?.name?.split(' ')[0] || 'Aarav'}</span>
                </>
              ) : activeRole === 'organizer' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#5B7A3A]" />
                  <span className="hidden sm:inline">Organizer:</span>
                  <span className="max-w-[90px] truncate">{organizerProfile?.clubName?.split(' ')[0] || 'Club'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#8E2A2A]" />
                  <span>Switch Role</span>
                </>
              )}
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {/* Dropdown Menu */}
            {showRoleMenu && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#F3E6CE] border-3 border-[#2A1A14] shadow-[6px_6px_0px_#2A1A14] py-2 z-50 font-typewriter text-xs"
                onClick={() => setShowRoleMenu(false)}
              >
                <div className="px-3 py-1.5 border-b border-[#2A1A14]/20 text-[10px] font-bold text-[#8E2A2A] uppercase">
                  QUICK ROLE SWITCHER
                </div>

                <button
                  onClick={() => onSwitchRole('student')}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#A98258]/30 transition-colors ${
                    activeRole === 'student' ? 'font-black bg-[#A98258]/20 text-[#8E2A2A]' : 'text-[#2A1A14]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#8E2A2A]" />
                    <div>
                      <div className="font-bold">Student View</div>
                      <div className="text-[10px] opacity-75">Notice board, passes & profile</div>
                    </div>
                  </div>
                  {activeRole === 'student' && <Check className="w-3.5 h-3.5 text-[#5B7A3A]" />}
                </button>

                <button
                  onClick={() => onSwitchRole('organizer')}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#A98258]/30 transition-colors ${
                    activeRole === 'organizer' ? 'font-black bg-[#A98258]/20 text-[#5B7A3A]' : 'text-[#2A1A14]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#5B7A3A]" />
                    <div>
                      <div className="font-bold">Organizer Desk</div>
                      <div className="text-[10px] opacity-75">Command center, roster & stats</div>
                    </div>
                  </div>
                  {activeRole === 'organizer' && <Check className="w-3.5 h-3.5 text-[#5B7A3A]" />}
                </button>

                <button
                  onClick={() => onSwitchRole('trail')}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#A98258]/30 transition-colors ${
                    activeRole === 'trail' ? 'font-black bg-[#A98258]/20 text-[#8E2A2A]' : 'text-[#2A1A14]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#8E2A2A]" />
                    <div>
                      <div className="font-bold">Campus Trail Map</div>
                      <div className="text-[10px] opacity-75">Interactive road-map & navigation</div>
                    </div>
                  </div>
                  {activeRole === 'trail' && <Check className="w-3.5 h-3.5 text-[#5B7A3A]" />}
                </button>

                <div className="border-t border-[#2A1A14]/20 my-1" />

                <button
                  onClick={() => onSwitchRole('landing')}
                  className={`w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#A98258]/30 transition-colors ${
                    activeRole === 'landing' ? 'font-black text-[#8E2A2A]' : 'text-[#2A1A14]'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Landing Page / Gate</span>
                </button>
              </div>
            )}
          </div>

          {/* Scanner Button */}
          <button
            onClick={onOpenScanner}
            className="btn-postal-red flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs uppercase whitespace-nowrap font-bold"
            title="Open camera pass scanner & manual entry"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">SCANNER</span>
          </button>
        </div>
      </div>
    </header>
  );
};
