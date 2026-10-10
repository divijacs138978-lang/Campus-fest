import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CampusEvent, CampusPass, StudentProfile } from '../types';
import { EnvelopeEventCard } from './EnvelopeEventCard';
import { PassContainer } from './passes/PassContainer';
import {
  PostageStamp,
  PointingHand,
  ImportantStamp,
  PaperClip,
} from './PostalDecorations';
import {
  Compass,
  Inbox,
  User,
  Search,
  CheckCircle2,
  Clock,
  MessageSquarePlus,
  QrCode,
  Calendar,
} from 'lucide-react';

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
}) => {
  const [activeTab, setActiveTab] = useState<'board' | 'passes' | 'profile'>('board');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPassId, setSelectedPassId] = useState<string>(myPasses[0]?.id || '');

  // Profile form state
  const [profName, setProfName] = useState(studentProfile?.name || 'Aarav Sharma');
  const [profEmail, setProfEmail] = useState(studentProfile?.collegeEmail || 'aarav.sharma@campuspost.edu');
  const [profRoll, setProfRoll] = useState(studentProfile?.rollNumber || '22CS084');
  const [profDept, setProfDept] = useState(studentProfile?.department || 'Computer Science');
  const [profYear, setProfYear] = useState(studentProfile?.year || '3rd Year');
  const [profPhone, setProfPhone] = useState(studentProfile?.phone || '+91 98765 43210');
  const [profileSavedToast, setProfileSavedToast] = useState(false);

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
    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 2500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8 select-none">
      {/* Student Nav & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E8D9B0]/20 pb-6">
        <div>
          <div className="font-eyebrow text-xs text-[#E8D9B0] uppercase tracking-[0.25em]">
            Portal Domain // Student Sanctuary
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-gold-gradient uppercase tracking-wider mt-1">
            STUDENT DESK
          </h1>
          <p className="font-eyebrow text-sm text-[#FFF6E5]/80 mt-1">
            Authenticated as <span className="font-bold underline text-[#E8D9B0]">{studentProfile?.name || profName}</span> ({studentProfile?.rollNumber || profRoll})
          </p>
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
              <Compass className="w-3.5 h-3.5" />
              <span>Campus Trail ★</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: NOTICE BOARD (PINNED POSTERS) */}
      {activeTab === 'board' && (
        <div className="space-y-6">
          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Search Box */}
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

            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {['ALL', 'Tech', 'Cultural', 'Workshop', 'Sports', 'Seminar'].map((cat) => (
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

          {/* Grid of Pinned Posters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((ev, idx) => {
              const userPass = myPasses.find((p) => p.eventId === ev.id);
              const rotations = ['rotate-[-1deg]', 'rotate-[1deg]', 'rotate-0', 'rotate-[-1.5deg]'];

              return (
                <EnvelopeEventCard
                  key={ev.id}
                  event={ev}
                  isRegistered={!!userPass}
                  onOpenDetails={() => onSelectEvent(ev)}
                  onQuickRegister={() => onQuickRegister(ev)}
                  rotation={rotations[idx % rotations.length]}
                  onShowToast={onShowToast}
                />
              );
            })}
          </div>

          {filteredEvents.length === 0 && (
            <div className="py-16 text-center bg-[#F3E6CE] border-2 border-[#2A1A14] rounded-3xl p-8 max-w-md mx-auto shadow-[4px_4px_0px_#2A1A14] font-typewriter">
              <span className="text-3xl block mb-2">📌</span>
              <h3 className="font-display font-black text-xl uppercase">No events pinned under this tag</h3>
              <p className="text-xs opacity-75 mt-1">Try resetting the category filter or searching a different keyword.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY PASSES WALLET */}
      {activeTab === 'passes' && (
        <div className="space-y-6">
          {myPasses.length === 0 ? (
            <div className="py-16 text-center glass-panel rounded-3xl p-8 max-w-md mx-auto border border-[#E8D9B0]/25 font-sans">
              <span className="text-4xl block mb-2">✧</span>
              <h3 className="font-display font-black text-2xl uppercase text-gold-gradient">No Claimed Passes Yet</h3>
              <p className="text-xs text-[#FFF6E5]/75 mt-1 font-eyebrow">Browse the notice board arena and claim your spot for campus events.</p>
              <button
                onClick={() => setActiveTab('board')}
                className="btn-crimson-pill mt-5 px-6 py-2.5 text-xs uppercase font-semibold"
              >
                Browse Notice Board ★
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {myPasses.map((p, idx) => {
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
                        <span className="font-semibold text-[#E8D9B0]">SLOT #{p.seatNo}</span>
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
                          className="mt-2.5 w-full py-1.5 rounded-full bg-[#B3345C] text-[#FFF6E5] font-sans text-[10px] font-semibold uppercase text-center shadow-[0_0_12px_rgba(224,74,123,0.35)]"
                        >
                          ★ SUBMIT FEEDBACK
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Full Pass View & Action Toolbar */}
              {activePass && (
                <div className="p-6 sm:p-8 rounded-[36px] glass-panel border border-[#E8D9B0]/30 shadow-[0_16px_48px_rgba(0,0,0,0.6)] space-y-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-panel-subtle border border-[#E8D9B0]/20 text-[#FFF6E5]">
                    <div>
                      <span className="font-eyebrow text-xs text-[#E8D9B0] uppercase block">
                        Entrance Status:
                      </span>
                      <span className="font-display font-black text-base uppercase text-gold-gradient">
                        {activePass.checkedIn
                          ? 'ATTENDED • CHECKED IN AT THRESHOLD'
                          : 'REGISTERED • READY FOR CHECK-IN DESK'}
                      </span>
                    </div>

                    {activePass.checkedIn && activePassEvent && (
                      <button
                        onClick={() => onOpenFeedback(activePass, activePassEvent)}
                        className="btn-crimson-pill flex items-center gap-1.5 px-4 py-2 text-xs uppercase"
                      >
                        <MessageSquarePlus className="w-3.5 h-3.5" />
                        <span>Submit Feedback</span>
                      </button>
                    )}
                  </div>

                  <PassContainer
                    pass={activePass}
                    onUpdateTemplate={(newTpl) => onUpdatePassTemplate(activePass.id, newTpl)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STUDENT ID PROFILE & AUTOFILL */}
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

          <p className="font-eyebrow text-xs text-[#FFF6E5]/80 mb-5">
            These credentials autofill all your event replies so you can claim cryptographic passes in one click.
          </p>

          <form onSubmit={handleSaveProfile} className="space-y-4 font-sans text-xs">
            <div>
              <label className="block mb-1 font-medium text-[#E8D9B0] uppercase text-[11px]">Full Student Name *</label>
              <input
                type="text"
                required
                value={profName}
                onChange={(e) => setProfName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#060A1C]/80 border border-[#E8D9B0]/25 text-[#FFF6E5] font-medium focus:outline-none focus:border-[#E8D9B0]/60 transition-colors shadow-inner"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-medium text-[#E8D9B0] uppercase text-[11px]">Roll Number / ID *</label>
                <input
                  type="text"
                  required
                  value={profRoll}
                  onChange={(e) => setProfRoll(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#060A1C]/80 border border-[#E8D9B0]/25 text-[#E04A7B] font-bold focus:outline-none focus:border-[#E8D9B0]/60 transition-colors shadow-inner"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-[#E8D9B0] uppercase text-[11px]">College Email *</label>
                <input
                  type="email"
                  required
                  value={profEmail}
                  onChange={(e) => setProfEmail(e.target.value)}
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#060A1C]/80 border border-[#E8D9B0]/25 text-[#FFF6E5] font-medium focus:outline-none focus:border-[#E8D9B0]/60 transition-colors shadow-inner"
              />
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-[#E8D9B0]/20">
              {profileSavedToast ? (
                <span className="text-xs font-semibold text-emerald-400">★ Profile Saved Successfully!</span>
              ) : (
                <span className="text-[11px] text-[#FFF6E5]/60">Saved locally to this session</span>
              )}

              <button
                type="submit"
                className="btn-crimson-pill px-6 py-2.5 text-xs uppercase font-semibold"
              >
                Save Credentials ★
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
