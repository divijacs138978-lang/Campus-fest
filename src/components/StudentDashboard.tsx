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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-[#2A1A14]/40 pb-6">
        <div>
          <div className="flex items-center gap-2 font-typewriter text-xs text-[#FFF6E5]/80 uppercase tracking-widest">
            <PaperClip className="w-4 h-6 text-[#F3E6CE]" />
            <span>CAMPUS POST // STUDENT PORTAL</span>
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-[#FFF6E5] uppercase tracking-tight mt-1 text-retro-outline-plum">
            STUDENT DESK
          </h1>
          <p className="font-serif-flourish italic text-sm text-[#FFF6E5]/80 mt-1">
            Logged in as <span className="font-bold underline text-[#F3E6CE]">{studentProfile?.name || profName}</span> ({studentProfile?.rollNumber || profRoll})
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 p-1 bg-[#A98258] border-2 border-[#2A1A14] rounded-2xl font-typewriter text-xs shadow-[3px_3px_0px_#2A1A14]">
          <button
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'board'
                ? 'bg-[#F3E6CE] text-[#2A1A14] font-black shadow-[2px_2px_0px_#2A1A14]'
                : 'text-[#FFF6E5] hover:text-[#FFF6E5]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Notice Board</span>
          </button>

          <button
            onClick={() => setActiveTab('passes')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'passes'
                ? 'bg-[#F3E6CE] text-[#2A1A14] font-black shadow-[2px_2px_0px_#2A1A14]'
                : 'text-[#FFF6E5] hover:text-[#FFF6E5]'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>My Passes ({myPasses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'profile'
                ? 'bg-[#F3E6CE] text-[#2A1A14] font-black shadow-[2px_2px_0px_#2A1A14]'
                : 'text-[#FFF6E5] hover:text-[#FFF6E5]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>ID Profile</span>
          </button>
        </div>
      </div>

      {/* TAB 1: NOTICE BOARD (PINNED POSTERS) */}
      {activeTab === 'board' && (
        <div className="space-y-6">
          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#2A1A14]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hackathons, fests, workshops..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F3E6CE] border-2 border-[#2A1A14] font-typewriter text-xs text-[#2A1A14] placeholder-[#2A1A14]/50 focus:outline-none shadow-[2px_2px_0px_#2A1A14]"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-[#A98258] border-2 border-[#2A1A14] rounded-2xl font-typewriter text-xs shadow-[3px_3px_0px_#2A1A14]">
              {['ALL', 'Tech', 'Cultural', 'Workshop', 'Sports', 'Seminar'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    categoryFilter === cat
                      ? 'bg-[#F3E6CE] text-[#2A1A14] font-black'
                      : 'text-[#FFF6E5] hover:text-[#FFF6E5]'
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
            <div className="py-16 text-center bg-[#F3E6CE] border-2 border-[#2A1A14] rounded-3xl p-8 max-w-md mx-auto shadow-[4px_4px_0px_#2A1A14] font-typewriter">
              <span className="text-4xl block mb-2">📭</span>
              <h3 className="font-display font-black text-2xl uppercase">No Stamped Passes Yet</h3>
              <p className="text-xs opacity-75 mt-1">Browse the notice board and stamp your spot for campus events.</p>
              <button
                onClick={() => setActiveTab('board')}
                className="btn-postal-red mt-4 px-5 py-2.5 rounded-xl text-xs uppercase font-bold"
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
                  const rotations = ['rotate-[-1.5deg]', 'rotate-[1deg]', 'rotate-[-0.5deg]'];
                  const ev = events.find((e) => e.id === p.eventId);

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPassId(p.id)}
                      className={`cursor-pointer p-4 rounded-2xl border-[3px] border-[#2A1A14] transition-all ${
                        rotations[idx % rotations.length]
                      } ${
                        isSelected
                          ? 'bg-[#F3E6CE] shadow-[6px_6px_0px_#2A1A14] ring-2 ring-[#FFF6E5]'
                          : 'bg-[#A98258] shadow-[3px_3px_0px_#2A1A14] hover:bg-[#B58E62]'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2A1A14]/20 font-typewriter text-[10px]">
                        <span className="font-black text-[#8E2A2A]">SLOT #{p.seatNo}</span>
                        <span
                          className={`px-2 py-0.5 rounded font-black uppercase flex items-center gap-1 ${
                            p.checkedIn
                              ? 'bg-[#5B7A3A] text-[#FFF6E5]'
                              : 'bg-[#8E2A2A] text-[#FFF6E5]'
                          }`}
                        >
                          {p.checkedIn ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> ATTENDED
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" /> REGISTERED
                            </>
                          )}
                        </span>
                      </div>

                      <h4 className="font-display font-black text-base text-[#2A1A14] truncate uppercase">
                        {p.eventTitle}
                      </h4>

                      <div className="font-typewriter text-xs text-[#2A1A14]/80 mt-1">
                        <span>{p.eventDate}</span>
                      </div>

                      <div className="flex items-center justify-between font-typewriter text-[10px] text-[#2A1A14]/75 mt-3 pt-2 border-t border-[#2A1A14]/20">
                        <span className="font-bold text-[#8E2A2A]">{p.code}</span>
                        <span className="uppercase">{p.template.replace('_', ' ')}</span>
                      </div>

                      {p.checkedIn && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (ev) onOpenFeedback(p, ev);
                          }}
                          className="mt-2 w-full py-1 rounded bg-[#8E2A2A] text-[#FFF6E5] font-typewriter text-[10px] font-black uppercase text-center"
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
                <div className="p-6 sm:p-8 rounded-[36px] bg-[#5E1250] border-[3px] border-[#2A1A14] shadow-[8px_8px_0px_#2A1A14] space-y-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#F3E6CE] border-2 border-[#2A1A14] shadow-[3px_3px_0px_#2A1A14] text-[#2A1A14]">
                    <div>
                      <span className="font-typewriter text-[10px] opacity-75 uppercase block font-bold">
                        DOOR ATTENDANCE STATUS:
                      </span>
                      <span className="font-display font-black text-base uppercase">
                        {activePass.checkedIn
                          ? 'ATTENDED • CHECKED IN AT THRESHOLD'
                          : 'REGISTERED • READY FOR CHECK-IN DESK'}
                      </span>
                    </div>

                    {activePass.checkedIn && activePassEvent && (
                      <button
                        onClick={() => onOpenFeedback(activePass, activePassEvent)}
                        className="btn-postal-red flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs uppercase"
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
        <div className="max-w-xl mx-auto bg-[#F3E6CE] border-[3px] border-[#2A1A14] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_#2A1A14]">
          <div className="flex items-center justify-between border-b-2 border-dashed border-[#2A1A14]/30 pb-3 mb-4">
            <div>
              <span className="font-typewriter text-[10px] text-[#8E2A2A] font-black uppercase tracking-widest block">
                CAMPUS ID CARD CREDENTIALS
              </span>
              <h3 className="font-display font-black text-2xl uppercase text-[#2A1A14]">
                Student Profile
              </h3>
            </div>
            <PostageStamp price="ID" title="CARD" color="#8E2A2A" className="w-10 h-12" />
          </div>

          <p className="font-serif-flourish italic text-xs text-[#2A1A14]/80 mb-4">
            These credentials autofill all your event reply cards so you can claim passes in one click.
          </p>

          <form onSubmit={handleSaveProfile} className="space-y-3 font-typewriter text-xs text-[#2A1A14]">
            <div>
              <label className="block mb-1 font-bold uppercase">FULL STUDENT NAME *</label>
              <input
                type="text"
                required
                value={profName}
                onChange={(e) => setProfName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FFF6E5] border-2 border-[#2A1A14] font-bold shadow-[2px_2px_0px_#2A1A14]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-bold uppercase">ROLL NUMBER / ID *</label>
                <input
                  type="text"
                  required
                  value={profRoll}
                  onChange={(e) => setProfRoll(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl bg-[#FFF6E5] border-2 border-[#2A1A14] font-black text-[#8E2A2A] shadow-[2px_2px_0px_#2A1A14]"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold uppercase">COLLEGE EMAIL *</label>
                <input
                  type="email"
                  required
                  value={profEmail}
                  onChange={(e) => setProfEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FFF6E5] border-2 border-[#2A1A14] font-bold shadow-[2px_2px_0px_#2A1A14]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-bold uppercase">DEPARTMENT</label>
                <select
                  value={profDept}
                  onChange={(e) => setProfDept(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl bg-[#FFF6E5] border-2 border-[#2A1A14] font-bold"
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
                <label className="block mb-1 font-bold uppercase">ACADEMIC YEAR</label>
                <select
                  value={profYear}
                  onChange={(e) => setProfYear(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl bg-[#FFF6E5] border-2 border-[#2A1A14] font-bold"
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
              <label className="block mb-1 font-bold uppercase">CONTACT PHONE NUMBER</label>
              <input
                type="tel"
                value={profPhone}
                onChange={(e) => setProfPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FFF6E5] border-2 border-[#2A1A14] font-bold shadow-[2px_2px_0px_#2A1A14]"
              />
            </div>

            <div className="pt-3 flex items-center justify-between border-t-2 border-dashed border-[#2A1A14]/30">
              {profileSavedToast ? (
                <span className="text-xs font-black text-[#5B7A3A]">★ Profile Saved Successfully!</span>
              ) : (
                <span className="text-[10px] opacity-70">Saved locally to this browser session</span>
              )}

              <button
                type="submit"
                className="btn-postal-red px-6 py-2.5 rounded-xl text-xs uppercase font-bold"
              >
                Save Profile ★
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
