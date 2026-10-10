import React, { useState, useEffect } from 'react';
import { CampusEvent, CampusPass, StudentProfile } from '../types';
import { dataService } from '../services/dataService';
import { EventQuestCard } from './EventQuestCard';
import { PassContainer } from './passes/PassContainer';
import { CinemaSeatMap } from './CinemaSeatMap';
import { EmptyNoticeState } from './EmptyNoticeState';
import { ScrollStory } from './ScrollStory';
import { OrnateButton } from './ui/OrnateButton';
import {
  Compass,
  Inbox,
  User,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  LogOut,
  LogIn,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface Props {
  events: CampusEvent[];
  myPasses: CampusPass[];
  studentProfile: StudentProfile | null;
  onUpdateProfile: (profile: StudentProfile) => void;
  onSelectEvent: (event: CampusEvent) => void;
  onQuickRegister: (event: CampusEvent) => void;
  onOpenFeedback: (pass: CampusPass, event: CampusEvent) => void;
  onUpdatePassTemplate: (passId: string, template: any) => void;
  onShowToast?: (title: string, desc?: string, type?: 'success' | 'reminder') => void;
  onOpenTrail?: () => void;
  onOpenSignIn?: () => void;
  onSignOut?: () => void;
}

export const StudentDashboard: React.FC<Props> = ({
  events,
  myPasses,
  studentProfile,
  onUpdateProfile,
  onSelectEvent,
  onQuickRegister,
  onOpenFeedback,
  onUpdatePassTemplate,
  onShowToast,
  onOpenTrail,
  onOpenSignIn,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<'board' | 'story' | 'passes' | 'profile'>('board');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPassId, setSelectedPassId] = useState<string>(myPasses[0]?.id || '');

  // Profile form state (no hardcoded fake defaults)
  const [profName, setProfName] = useState(studentProfile?.name || '');
  const [profEmail, setProfEmail] = useState(studentProfile?.collegeEmail || '');
  const [profRoll, setProfRoll] = useState(studentProfile?.rollNumber || '');
  const [profDept, setProfDept] = useState(studentProfile?.department || 'Computer Science');
  const [profYear, setProfYear] = useState(studentProfile?.year || '1st Year');
  const [profPhone, setProfPhone] = useState(studentProfile?.phone || '');
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  useEffect(() => {
    if (studentProfile) {
      setProfName(studentProfile.name || '');
      setProfEmail(studentProfile.collegeEmail || '');
      setProfRoll(studentProfile.rollNumber || '');
      setProfDept(studentProfile.department || 'Computer Science');
      setProfYear(studentProfile.year || '1st Year');
      setProfPhone(studentProfile.phone || '');
    } else {
      setProfName('');
      setProfEmail('');
      setProfRoll('');
      setProfPhone('');
    }
  }, [studentProfile]);

  const activePass = myPasses.find((p) => p.id === selectedPassId) || myPasses[0];
  const activePassEvent = events.find((e) => e.id === activePass?.eventId);

  const filteredEvents = events.filter((ev) => {
    if (categoryFilter !== 'ALL' && ev.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ev.title.toLowerCase().includes(q) ||
        ev.description.toLowerCase().includes(q) ||
        ev.venue.toLowerCase().includes(q) ||
        ev.organizerClub.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StudentProfile = {
      id: studentProfile?.id || `stu-${Date.now()}`,
      name: profName.trim(),
      collegeEmail: profEmail.trim(),
      rollNumber: profRoll.trim().toUpperCase(),
      department: profDept,
      year: profYear,
      phone: profPhone.trim(),
    };
    onUpdateProfile(updated);
    soundFx.playConfirm();
    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 2500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8 select-none">
      {/* Student Nav & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E8D9B0]/20 pb-6">
        <div>
          <div className="font-eyebrow text-xs text-[#E8D9B0] uppercase tracking-[0.25em]">
            Portal Domain // Festival Events & Notice Board
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-gold-gradient uppercase tracking-wider mt-1">
            FESTORA NOTICES
          </h1>
          {studentProfile ? (
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <p className="font-eyebrow text-sm text-[#FFF6E5]/80">
                Attendee Profile:{' '}
                <span className="font-bold underline text-[#E8D9B0]">
                  {studentProfile.name}
                </span>{' '}
                ({studentProfile.rollNumber})
              </p>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="inline-flex items-center gap-1 text-[11px] font-sans px-2.5 py-0.5 rounded-full bg-red-950/70 border border-red-500/40 text-red-200 hover:bg-red-900/80 transition-colors"
                  title="Sign out of student account"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <p className="font-eyebrow text-sm text-[#FFF6E5]/70">
                Browse notices freely • Sign in to claim digital passes
              </p>
              {onOpenSignIn && (
                <button
                  onClick={onOpenSignIn}
                  className="inline-flex items-center gap-1 text-[11px] font-sans font-semibold px-3 py-1 rounded-full btn-crimson-pill text-[#FFF6E5] shadow-sm"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 glass-pill border border-[#E8D9B0]/25">
          <button
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-sans text-xs transition-all ${
              activeTab === 'board'
                ? 'btn-crimson-pill text-[#FFF6E5]'
                : 'text-[#FFF6E5]/75 hover:text-[#FFF6E5]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Notice Board</span>
          </button>

          <button
            onClick={() => setActiveTab('story')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-sans text-xs transition-all ${
              activeTab === 'story'
                ? 'btn-crimson-pill text-[#FFF6E5]'
                : 'text-[#FFF6E5]/75 hover:text-[#FFF6E5]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Discover Story</span>
          </button>

          <button
            onClick={() => setActiveTab('passes')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-sans text-xs transition-all ${
              activeTab === 'passes'
                ? 'btn-crimson-pill text-[#FFF6E5]'
                : 'text-[#FFF6E5]/75 hover:text-[#FFF6E5]'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>My Passes ({myPasses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-sans text-xs transition-all ${
              activeTab === 'profile'
                ? 'btn-crimson-pill text-[#FFF6E5]'
                : 'text-[#FFF6E5]/75 hover:text-[#FFF6E5]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>ID Profile</span>
          </button>

          {onOpenTrail && (
            <button
              onClick={onOpenTrail}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1B2257]/80 text-[#E8D9B0] font-medium hover:border-[#E8D9B0]/50 transition-all border border-[#E8D9B0]/25"
              title="Open interactive campus trail road map"
            >
              <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Campus Trail ★</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: NOTICE BOARD */}
      {activeTab === 'board' && (
        <div className="space-y-8">
          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#E8D9B0]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hackathons, fests, workshops..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#10142E]/80 border border-[#E8D9B0]/25 font-sans text-xs text-[#FFF6E5] placeholder-[#FFF6E5]/50 focus:outline-none focus:border-[#E8D9B0]/60 shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
              />
            </div>

            {/* Category Pills (all 6 categories) */}
            <div className="flex flex-wrap items-center gap-1.5">
              {['ALL', 'Tech', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Club Drive'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-full font-sans text-xs transition-all ${
                    categoryFilter === cat
                      ? 'btn-crimson-pill text-[#FFF6E5] shadow-[0_0_16px_rgba(224,74,123,0.5)]'
                      : 'glass-pill text-[#FFF6E5]/80 hover:text-[#FFF6E5]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Real Event Quest Cards (Unified single card system) */}
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((ev) => {
                const userPass = myPasses.find((p) => p.eventId === ev.id);

                return (
                  <EventQuestCard
                    key={ev.id}
                    event={ev}
                    isRegistered={!!userPass}
                    onOpenDetails={() => onSelectEvent(ev)}
                    onQuickRegister={() => onQuickRegister(ev)}
                    onShowToast={onShowToast}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyNoticeState
              title="No events found under this filter"
              description="Try resetting your category or explore other festival horizons."
              actionLabel="Show All Events"
              onAction={() => {
                setCategoryFilter('ALL');
                setSearchQuery('');
              }}
            />
          )}
        </div>
      )}

      {/* TAB 2: DISCOVER STORY (PART 1.1) */}
      {activeTab === 'story' && (
        <div className="w-full">
          <ScrollStory
            events={events}
            onSelectRole={(role) => {
              if (role === 'trail' && onOpenTrail) {
                onOpenTrail();
              } else {
                setActiveTab('board');
              }
            }}
            onSelectCategory={(cat) => {
              setCategoryFilter(cat);
              setActiveTab('board');
            }}
          />
        </div>
      )}

      {/* TAB 3: MY PASSES WALLET */}
      {activeTab === 'passes' && (
        <div className="space-y-8">
          {myPasses.length === 0 ? (
            <EmptyNoticeState
              title="No claimed passes yet"
              description="Browse the notice board arena and claim your spot for upcoming campus events."
              actionLabel="Browse Notice Board ★"
              onAction={() => setActiveTab('board')}
            />
          ) : (
            <div className="space-y-8">
              {/* Passes Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {myPasses.map((p) => {
                  const isSelected = p.id === activePass?.id;
                  const ev = events.find((e) => e.id === p.eventId);

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPassId(p.id)}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? 'glass-panel border-[#E8D9B0] shadow-[0_0_24px_rgba(232,217,176,0.3)] scale-[1.02]'
                          : 'glass-panel-subtle border-[#E8D9B0]/20 hover:border-[#E8D9B0]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E8D9B0]/15 font-sans text-[10px]">
                        <span className="font-semibold text-[#E8D9B0]">
                          SEAT {p.seatLabel || `#${p.seatNo}`}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1 ${
                            p.checkedIn
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-[#B3345C]/30 text-[#E04A7B] border border-[#B3345C]/50'
                          }`}
                        >
                          {p.checkedIn ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> ATTENDED
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" /> CLAIMED
                            </>
                          )}
                        </span>
                      </div>

                      <h4 className="font-display font-black text-base text-[#FFF6E5] truncate uppercase">
                        {p.eventTitle}
                      </h4>

                      <div className="font-sans text-xs text-[#FFF6E5]/75 mt-1">
                        <span>{p.eventDate}</span>
                      </div>

                      <div className="flex items-center justify-between font-sans text-[10px] text-[#E8D9B0]/80 mt-3 pt-2 border-t border-[#E8D9B0]/15">
                        <span className="font-bold text-[#E04A7B]">{p.code}</span>
                        <span className="uppercase text-[#FFF6E5]/60">{p.template.replace('_', ' ')}</span>
                      </div>

                      {p.checkedIn && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (ev) onOpenFeedback(p, ev);
                          }}
                          className="mt-3 w-full py-1.5 px-3 rounded-lg bg-[#E8D9B0]/15 hover:bg-[#E8D9B0]/25 text-[#E8D9B0] text-[11px] font-heading uppercase flex items-center justify-center gap-1 transition-colors"
                        >
                          Submit Event Feedback
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Active Selected Pass Detail & Cinema Seat Map Preview */}
              {activePass && (
                <div className="space-y-8">
                  <div className="flex flex-col items-center">
                    <PassContainer
                      pass={activePass}
                      onUpdateTemplate={(tpl) => onUpdatePassTemplate(activePass.id, tpl)}
                      onGoToWallet={() => setActiveTab('passes')}
                    />
                  </div>

                  {/* Cinema Seat Map for this Event */}
                  {activePassEvent && (
                    <div className="pt-6 border-t border-[#E8D9B0]/20">
                      <div className="mb-4 text-center">
                        <span className="font-eyebrow text-xs uppercase text-[#E8D9B0] tracking-widest">
                          Your Allocated Position
                        </span>
                        <h3 className="font-display font-bold text-xl text-[#FFF6E5] uppercase">
                          Auditorium Seat Map for {activePassEvent.title}
                        </h3>
                      </div>
                      <CinemaSeatMap
                        event={activePassEvent}
                        passes={events ? dataService.getPasses() : []}
                        isOrganizer={false}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: STUDENT ID PROFILE */}
      {activeTab === 'profile' && (
        <div className="max-w-xl mx-auto glass-panel p-6 sm:p-8 rounded-3xl border border-[#E8D9B0]/25 shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-[#FFF6E5]">
          <div className="flex items-center justify-between border-b border-[#E8D9B0]/20 pb-3 mb-4">
            <div>
              <span className="font-eyebrow text-xs text-[#E8D9B0] uppercase tracking-[0.2em] block">
                Official University Credentials
              </span>
              <h3 className="font-display font-black text-2xl uppercase text-gold-gradient mt-0.5">
                Student Profile
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#1B2257] border border-[#E8D9B0]/40 flex items-center justify-center text-[#E8D9B0] font-display font-bold text-xs shadow-[0_0_12px_rgba(232,217,176,0.2)]">
              ID
            </div>
          </div>

          {!studentProfile ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#1B2257] border border-[#E8D9B0]/30 flex items-center justify-center mx-auto text-[#E8D9B0]">
                <User className="w-7 h-7" />
              </div>
              <h4 className="font-display font-bold text-lg text-[#FFF6E5]">
                Sign In to View Your Profile
              </h4>
              <p className="font-sans text-xs text-[#FFF6E5]/70 max-w-sm mx-auto">
                Connect your student credentials to manage claimed passes, view seat assignments, and enjoy quick one-click event registrations.
              </p>
              {onOpenSignIn && (
                <div className="pt-2">
                  <OrnateButton variant="primary" onClick={onOpenSignIn}>
                    Sign In to the Campus
                  </OrnateButton>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="font-eyebrow text-xs text-[#FFF6E5]/80 mb-5">
                These credentials autofill all your event registrations so you can claim cryptographic passes in one click.
              </p>

              <form onSubmit={handleSaveProfile} className="space-y-4 font-sans text-xs">
                <div>
                  <label className="block mb-1 font-medium text-[#E8D9B0] uppercase text-[11px]">
                    Full Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profName}
                    onChange={(e) => setProfName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#060A1C]/80 border border-[#E8D9B0]/25 text-[#FFF6E5] font-medium focus:outline-none focus:border-[#E8D9B0]/60 transition-colors shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-medium text-[#E8D9B0] uppercase text-[11px]">
                      Roll Number / ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={profRoll}
                      onChange={(e) => setProfRoll(e.target.value.toUpperCase())}
                      placeholder="e.g. 24CS101"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#060A1C]/80 border border-[#E8D9B0]/25 text-[#E04A7B] font-bold focus:outline-none focus:border-[#E8D9B0]/60 transition-colors shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium text-[#E8D9B0] uppercase text-[11px]">
                      College Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={profEmail}
                      onChange={(e) => setProfEmail(e.target.value)}
                      placeholder="you@college.edu"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#060A1C]/80 border border-[#E8D9B0]/25 text-[#FFF6E5] font-medium focus:outline-none focus:border-[#E8D9B0]/60 transition-colors shadow-inner"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-medium text-[#E8D9B0] uppercase text-[11px]">Department</label>
                    <select
                      value={profDept}
                      onChange={(e) => setProfDept(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#060A1C]/80 border border-[#E8D9B0]/25 text-[#FFF6E5] font-medium focus:outline-none focus:border-[#E8D9B0]/60"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Tech</option>
                      <option value="Electronics & Comm.">Electronics (ECE)</option>
                      <option value="Mechanical Eng.">Mechanical Eng.</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Biotechnology">Biotechnology</option>
                      <option value="Management Studies">Management Studies</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 font-medium text-[#E8D9B0] uppercase text-[11px]">Academic Year</label>
                    <select
                      value={profYear}
                      onChange={(e) => setProfYear(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#060A1C]/80 border border-[#E8D9B0]/25 text-[#FFF6E5] font-medium focus:outline-none focus:border-[#E8D9B0]/60"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Postgraduate">Postgraduate</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-medium text-[#E8D9B0] uppercase text-[11px]">Contact Phone Number</label>
                  <input
                    type="tel"
                    value={profPhone}
                    onChange={(e) => setProfPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#060A1C]/80 border border-[#E8D9B0]/25 text-[#FFF6E5] font-medium focus:outline-none focus:border-[#E8D9B0]/60 transition-colors shadow-inner"
                  />
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-[#E8D9B0]/20 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    {profileSavedToast ? (
                      <span className="text-emerald-400 font-mono text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Profile Updated
                      </span>
                    ) : (
                      <span className="text-[#FFF6E5]/60 text-[11px]">Auto-saved locally</span>
                    )}

                    {onSignOut && (
                      <button
                        type="button"
                        onClick={onSignOut}
                        className="text-[11px] text-red-300 hover:text-red-200 underline"
                      >
                        Sign Out
                      </button>
                    )}
                  </div>

                  <OrnateButton type="submit" variant="primary" size="md">
                    Save Profile
                  </OrnateButton>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
