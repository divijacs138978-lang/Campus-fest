/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CampusEvent,
  CampusPass,
  ScanRecord,
  CampusFeedback,
  ActiveRole,
  StudentProfile,
  OrganizerProfile,
  PassTemplateType,
} from './types';
import { dataService } from './services/dataService';
import { postalSoundFx } from './utils/audio';

// Components
import { TopBar } from './components/TopBar';
import { StudentDashboard } from './components/StudentDashboard';
import { OrganizerCommandCenter } from './components/OrganizerCommandCenter';
import { EnvelopeEventCard } from './components/EnvelopeEventCard';
import { StoryRegistrationModal } from './components/StoryRegistrationModal';
import { PassCelebrationModal } from './components/PassCelebrationModal';
import { EventDetailModal } from './components/EventDetailModal';
import { ScannerModal } from './components/ScannerModal';
import { StoryFeedbackModal } from './components/StoryFeedbackModal';
import { NewEventModal } from './components/NewEventModal';
import { CurtainTransition } from './components/CurtainTransition';
import { ToastContainer, ToastMessage } from './components/Toast';
import { CampusTrailMap } from './components/CampusTrailMap';
import {
  PostageStamp,
  PointingHand,
  ImportantStamp,
  WaxSeal,
  RoundRubberStamp,
  PaperClip,
} from './components/PostalDecorations';

import {
  Mail,
  Users,
  Compass,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  QrCode,
  FileText,
  UserCheck,
} from 'lucide-react';

const DEFAULT_STUDENT: StudentProfile = {
  id: 'stu-1',
  name: 'Aarav Sharma',
  collegeEmail: 'aarav.sharma@campuspost.edu',
  rollNumber: '22CS084',
  department: 'Computer Science',
  year: '3rd Year',
  phone: '+91 98765 43210',
};

const DEFAULT_ORGANIZER: OrganizerProfile = {
  id: 'org-1',
  name: 'Faculty Coordinator',
  clubName: 'IEEE Student Branch',
  collegeEmail: 'ieee@campuspost.edu',
  pin: '4421',
};

export default function App() {
  // Global Role: 'landing' | 'student' | 'organizer'
  const [activeRole, setActiveRole] = useState<ActiveRole>('landing');
  const [studentTab, setStudentTab] = useState<'board' | 'passes' | 'profile'>('board');

  // Persistence data from dataService
  const [events, setEvents] = useState<CampusEvent[]>(() => dataService.getEvents());
  const [passes, setPasses] = useState<CampusPass[]>(() => dataService.getPasses());
  const [scans, setScans] = useState<ScanRecord[]>(() => dataService.getScans());
  const [feedbacks, setFeedbacks] = useState<CampusFeedback[]>(() => dataService.getAllFeedbacks());

  // Profiles
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(() => {
    return dataService.getStudentSession() || DEFAULT_STUDENT;
  });

  const [organizerProfile, setOrganizerProfile] = useState<OrganizerProfile | null>(() => {
    return dataService.getOrganizerSession() || DEFAULT_ORGANIZER;
  });

  // Category filter on landing
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Page Transition Curtain
  const [isCurtainActive, setIsCurtainActive] = useState(false);
  const [curtainTargetTitle, setCurtainTargetTitle] = useState('');

  // Modals
  const [registeringEvent, setRegisteringEvent] = useState<CampusEvent | null>(null);
  const [celebrationPass, setCelebrationPass] = useState<CampusPass | null>(null);
  const [inspectingEvent, setInspectingEvent] = useState<CampusEvent | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scannerEventId, setScannerEventId] = useState<string | undefined>(undefined);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CampusEvent | null>(null);
  const [feedbackSession, setFeedbackSession] = useState<{
    pass: CampusPass;
    event: CampusEvent;
  } | null>(null);

  // Toast notification state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (
    title: string,
    description?: string,
    type: 'success' | 'info' | 'reminder' | 'error' = 'success'
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state helper
  const refreshData = () => {
    setEvents(dataService.getEvents());
    setPasses(dataService.getPasses());
    setScans(dataService.getScans());
    setFeedbacks(dataService.getAllFeedbacks());
  };

  // Keyboard Shortcuts (N = new event, S = scanner)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.tagName === 'SELECT';

      if (isInput) return;

      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setShowScanner((prev) => !prev);
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setEditingEvent(null);
        setShowNewEventModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Role transition with kinetic curtain
  const switchRoleWithCurtain = (nextRole: ActiveRole) => {
    if (nextRole === activeRole) return;
    postalSoundFx.playTypewriterTick();

    const titles: Record<ActiveRole, string> = {
      landing: 'CENTRAL CAMPUS GATE',
      student: 'STUDENT NOTICE BOARD',
      organizer: 'ORGANIZER DESK',
      trail: 'CAMPUS TRAIL ROAD MAP',
    };

    setCurtainTargetTitle(titles[nextRole]);
    setIsCurtainActive(true);

    setTimeout(() => {
      setActiveRole(nextRole);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 320);

    setTimeout(() => {
      setIsCurtainActive(false);
    }, 650);
  };

  // Student Profile Update
  const handleUpdateStudentProfile = (updated: StudentProfile) => {
    setStudentProfile(updated);
    dataService.setStudentSession(updated);
  };

  // Registration Completed
  const handleRegistrationCompleted = (newPass: CampusPass) => {
    refreshData();
    setRegisteringEvent(null);
    setCelebrationPass(newPass);
    showToast(
      '★ Registration Stamped & Confirmed!',
      `Pass ${newPass.code} generated for ${newPass.studentName}.`,
      'success'
    );
  };

  // Save Event (Create or Edit)
  const handleSaveEvent = (eventData: any) => {
    dataService.saveEvent(eventData);
    refreshData();
  };

  // Pass template update
  const handleUpdatePassTemplate = (passId: string, template: PassTemplateType) => {
    dataService.updatePassTemplate(passId, template);
    refreshData();
  };

  // Filtered events for landing
  const filteredLandingEvents = events.filter((ev) => {
    if (categoryFilter === 'ALL') return true;
    return ev.category === categoryFilter;
  });

  // Calculate global summary stats
  const totalRegistered = passes.length;
  const totalCheckedIn = passes.filter((p) => p.checkedIn).length;
  const checkInRate = totalRegistered > 0 ? Math.round((totalCheckedIn / totalRegistered) * 100) : 0;

  return (
    <div className="relative min-h-screen city-bg text-[#2A1A14] overflow-x-hidden selection:bg-[#8E2A2A] selection:text-[#FFF6E5] pb-24 md:pb-12">
      {/* Background City Silhouette Texture */}
      <div className="fixed inset-0 city-facade pointer-events-none z-0 opacity-40" />

      {/* Paper & Ink Grain Overlay */}
      <div className="fixed inset-0 paper-grain pointer-events-none z-30 opacity-70" />

      {/* Kinetic Curtain Page Transition */}
      <CurtainTransition
        isActive={isCurtainActive}
        targetPageTitle={curtainTargetTitle}
      />

      {/* Top Bar Navigation with Quick Role Switcher */}
      <TopBar
        activeRole={activeRole}
        onSwitchRole={switchRoleWithCurtain}
        onOpenScanner={() => {
          setScannerEventId(undefined);
          setShowScanner(true);
        }}
        myPassesCount={passes.length}
        studentProfile={studentProfile}
        organizerProfile={organizerProfile}
        currentStudentTab={studentTab}
        onSetStudentTab={setStudentTab}
      />

      {/* MAIN VIEWPORT ROUTING */}
      <main className="relative z-10">
        {/* ========================================================
            VIEW: LANDING PORTAL (CAMPUS NOTICE BOARD & ROLE GATE)
        ======================================================== */}
        {activeRole === 'landing' && (
          <div className="space-y-16">
            {/* Landing Hero: Giant Campus Dispatch Envelope */}
            <section className="relative px-4 sm:px-6 pt-10 sm:pt-16 pb-6 max-w-5xl mx-auto select-none">
              <div className="relative bg-[#A98258] border-[4px] border-[#2A1A14] rounded-[44px] p-6 sm:p-10 shadow-[12px_12px_0px_#2A1A14] text-center space-y-6">
                {/* Envelope Top Triangle Flap */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-14 bg-[#8B6A47] border-t-2 border-x-2 border-[#2A1A14] rounded-t-3xl flex items-center justify-center">
                  <WaxSeal letter="C" className="w-14 h-14 -mt-3" />
                </div>

                {/* Subtitle Ribbon */}
                <div className="inline-block bg-[#8E2A2A] text-[#FFF6E5] border-2 border-[#2A1A14] px-4 py-1 font-typewriter text-xs font-black tracking-[0.25em] uppercase shadow-[3px_3px_0px_#2A1A14] mt-2">
                  ★ OFFICIAL UNIVERSITY DISPATCH ★
                </div>

                {/* Main Headline */}
                <div className="space-y-1 py-1">
                  <p className="font-script text-5xl sm:text-7xl text-[#FFF6E5] leading-none drop-shadow-[2px_2px_0px_#2A1A14]">
                    Welcome to
                  </p>
                  <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tight text-retro-outline-plum leading-tight">
                    CAMPUS POST
                  </h1>
                </div>

                {/* Problem Statement & Mission */}
                <p className="font-serif-flourish italic text-base sm:text-lg text-[#FFF6E5]/90 max-w-2xl mx-auto leading-relaxed">
                  No more messy Google Forms or manual spreadsheets. Discover college tech fests, cultural nights, workshops, and sports tournaments. Register with one click, get official stamped QR passes, and check in with tamper-proof duplicate prevention.
                </p>

                {/* Two Big Role Selection Buttons */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
                  {/* Option 1: Student */}
                  <div className="flex items-center gap-3">
                    <PointingHand direction="right" className="w-12 h-6" />
                    <button
                      onClick={() => switchRoleWithCurtain('student')}
                      className="btn-postal-red px-7 py-4 rounded-2xl text-xs uppercase font-bold tracking-wider shadow-[4px_4px_0px_#2A1A14]"
                    >
                      I'm a Student ★
                    </button>
                  </div>

                  {/* Option 2: Organizer */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => switchRoleWithCurtain('organizer')}
                      className="btn-postal-cream px-7 py-4 rounded-2xl text-xs uppercase font-bold tracking-wider shadow-[4px_4px_0px_#2A1A14]"
                    >
                      I'm an Organizer (Clubs & Faculty)
                    </button>
                    <PointingHand direction="left" className="w-12 h-6" />
                  </div>

                  {/* Option 3: Campus Trail Map */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => switchRoleWithCurtain('trail')}
                      className="btn-postal-kraft px-7 py-4 rounded-2xl text-xs uppercase font-bold tracking-wider shadow-[4px_4px_0px_#2A1A14] flex items-center gap-2"
                    >
                      <Compass className="w-4 h-4 text-[#FFF6E5]" />
                      <span>Campus Trail Map ★</span>
                    </button>
                  </div>
                </div>

                {/* Postage Stamps Bar at Bottom of Envelope */}
                <div className="pt-4 border-t-2 border-dashed border-[#2A1A14]/30 flex flex-wrap items-center justify-between text-left font-typewriter text-xs text-[#FFF6E5]/80 gap-3">
                  <div className="flex items-center gap-3">
                    <PostageStamp price="CAMPUS" title="NOTICE" color="#8E2A2A" className="w-10 h-12" />
                    <div>
                      <span className="font-bold block text-[#FFF6E5]">DISPATCH REGISTRY VERIFIED</span>
                      <span className="text-[10px] opacity-80 text-[#FFF6E5]/80">Unique 6-char entry codes · Real-time camera scanner</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold block text-[#FFF6E5]">ZERO SETUP REQUIRED</span>
                    <span className="text-[10px] opacity-80 text-[#FFF6E5]/80">5 realistic college events pre-loaded with live data</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Telegram Stat Strip Section */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 select-none">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-typewriter">
                <div className="p-4 rounded-2xl bg-[#F3E6CE] border-2 border-[#2A1A14] shadow-[4px_4px_0px_#2A1A14] space-y-1">
                  <span className="text-[9px] font-bold text-[#8E2A2A] uppercase block">NOTICE BOARD POSTINGS</span>
                  <span className="font-display font-black text-3xl text-[#2A1A14] block">
                    0{events.length} EVENTS
                  </span>
                  <span className="text-[10px] opacity-75 block">Tech, Cultural, Sports & Workshops</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F3E6CE] border-2 border-[#2A1A14] shadow-[4px_4px_0px_#2A1A14] space-y-1">
                  <span className="text-[9px] font-bold text-[#8E2A2A] uppercase block">DISPATCHED PASSES</span>
                  <span className="font-display font-black text-3xl text-[#2A1A14] block">
                    {totalRegistered} REGISTERED
                  </span>
                  <span className="text-[10px] opacity-75 block">Across all campus departments</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F3E6CE] border-2 border-[#2A1A14] shadow-[4px_4px_0px_#2A1A14] space-y-1">
                  <span className="text-[9px] font-bold text-[#8E2A2A] uppercase block">CHECK-IN TURN-OUT</span>
                  <span className="font-display font-black text-3xl text-[#5B7A3A] block">
                    {totalCheckedIn} ({checkInRate}%)
                  </span>
                  <span className="text-[10px] opacity-75 block">Verified at venue entrance desk</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F3E6CE] border-2 border-[#2A1A14] shadow-[4px_4px_0px_#2A1A14] space-y-1">
                  <span className="text-[9px] font-bold text-[#8E2A2A] uppercase block">DUPLICATE SHIELD</span>
                  <span className="font-display font-black text-3xl text-[#8E2A2A] block">
                    100% ATOMIC
                  </span>
                  <span className="text-[10px] opacity-75 block">Immediate duplicate pass rejection</span>
                </div>
              </div>
            </section>

            {/* Pinned Bulletin Board Notices Section */}
            <section id="notice-board-preview" className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6 select-none">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-2 border-[#2A1A14]/30 pb-4">
                <div>
                  <div className="flex items-center gap-2 font-typewriter text-xs text-[#FFF6E5]/80 uppercase tracking-widest">
                    <PaperClip className="w-4 h-6 text-[#F3E6CE]" />
                    <span>PINNED BULLETIN POSTERS</span>
                  </div>
                  <h2 className="font-display font-black text-3xl sm:text-4xl text-[#FFF6E5] uppercase tracking-tight text-retro-outline-plum mt-1">
                    ACTIVE CAMPUS EVENTS
                  </h2>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#A98258] border-2 border-[#2A1A14] rounded-2xl font-typewriter text-xs shadow-[3px_3px_0px_#2A1A14]">
                  {['ALL', 'Tech', 'Cultural', 'Sports', 'Workshop', 'Club Drive'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        postalSoundFx.playTypewriterTick();
                        setCategoryFilter(cat);
                      }}
                      className={`px-3 py-1 rounded-xl transition-all ${
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

              {/* Notice Board Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredLandingEvents.map((ev, idx) => {
                  const userPass = passes.find(
                    (p) =>
                      p.eventId === ev.id &&
                      studentProfile &&
                      (p.studentEmail.toLowerCase() === studentProfile.collegeEmail.toLowerCase() ||
                        p.studentRollNumber.toLowerCase() === studentProfile.rollNumber.toLowerCase())
                  );
                  const rotations = ['rotate-[-0.8deg]', 'rotate-[0.8deg]', 'rotate-0', 'rotate-[-1deg]'];

                  return (
                    <EnvelopeEventCard
                      key={ev.id}
                      event={ev}
                      isRegistered={!!userPass}
                      onOpenDetails={() => setInspectingEvent(ev)}
                      onQuickRegister={() => setRegisteringEvent(ev)}
                      rotation={rotations[idx % rotations.length]}
                      onShowToast={showToast}
                    />
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* ========================================================
            VIEW: STUDENT PORTAL (NOTICE BOARD, PASSES, PROFILE)
        ======================================================== */}
        {activeRole === 'student' && (
          <StudentDashboard
            events={events}
            myPasses={passes}
            studentProfile={studentProfile}
            onUpdateProfile={handleUpdateStudentProfile}
            onSelectEvent={(ev) => setInspectingEvent(ev)}
            onQuickRegister={(ev) => setRegisteringEvent(ev)}
            onOpenFeedback={(pass, event) => setFeedbackSession({ pass, event })}
            onUpdatePassTemplate={handleUpdatePassTemplate}
            onShowToast={showToast}
            onOpenTrail={() => switchRoleWithCurtain('trail')}
          />
        )}

        {/* ========================================================
            VIEW: ORGANIZER DESK (COMMAND CENTER, ROSTER, STATS)
        ======================================================== */}
        {activeRole === 'organizer' && (
          <OrganizerCommandCenter
            events={events}
            passes={passes}
            recentScans={scans}
            feedbacks={feedbacks}
            organizerProfile={organizerProfile}
            onRefreshData={refreshData}
            onOpenScanner={(evId) => {
              setScannerEventId(evId);
              setShowScanner(true);
            }}
            onOpenNewEvent={() => {
              setEditingEvent(null);
              setShowNewEventModal(true);
            }}
            onSelectPassToView={(pass) => {
              setCelebrationPass(pass);
            }}
            onSelectEventToEdit={(event) => {
              setEditingEvent(event);
              setShowNewEventModal(true);
            }}
          />
        )}

        {/* ========================================================
            VIEW: CAMPUS TRAIL ROAD MAP (VERTICAL SVG INTERACTIVE)
        ======================================================== */}
        {activeRole === 'trail' && (
          <CampusTrailMap
            events={events}
            onSelectEvent={(ev) => setInspectingEvent(ev)}
            onClose={() => switchRoleWithCurtain('landing')}
          />
        )}
      </main>

      {/* ========================================================
          ALL MODALS & CAMPUS POST EXPERIENCES
      ======================================================== */}

      {/* Student Stepper Registration Form */}
      {registeringEvent && (
        <StoryRegistrationModal
          event={registeringEvent}
          studentProfile={studentProfile}
          onClose={() => setRegisteringEvent(null)}
          onRegistered={handleRegistrationCompleted}
        />
      )}

      {/* Celebration Unsealing & Stamped Pass Arrival */}
      {celebrationPass && (
        <PassCelebrationModal
          pass={celebrationPass}
          onClose={() => setCelebrationPass(null)}
          onGoToMailbox={() => {
            setCelebrationPass(null);
            setActiveRole('student');
            setStudentTab('passes');
          }}
        />
      )}

      {/* Event Details Notice Modal with Eligibility Checker */}
      {inspectingEvent && (
        <EventDetailModal
          event={inspectingEvent}
          studentProfile={studentProfile}
          onClose={() => setInspectingEvent(null)}
          onStartRegistration={(ev) => setRegisteringEvent(ev)}
          isRegistered={passes.some((p) => p.eventId === inspectingEvent.id)}
          onViewPass={() => {
            setInspectingEvent(null);
            setActiveRole('student');
            setStudentTab('passes');
          }}
          onShowToast={showToast}
        />
      )}

      {/* Post Office / Entrance Gate Scanner Modal */}
      {showScanner && (
        <ScannerModal
          eventId={scannerEventId}
          passes={passes}
          recentScans={scans}
          onCheckInResult={refreshData}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Post-Event Feedback Modal */}
      {feedbackSession && (
        <StoryFeedbackModal
          event={feedbackSession.event as any}
          pass={feedbackSession.pass as any}
          onClose={() => setFeedbackSession(null)}
          onSubmitFeedback={(fb) => {
            dataService.submitFeedback(fb as any);
            refreshData();
          }}
        />
      )}

      {/* Pin / Edit Notice Event Modal */}
      {showNewEventModal && (
        <NewEventModal
          initialEvent={editingEvent}
          onClose={() => {
            setShowNewEventModal(false);
            setEditingEvent(null);
          }}
          onSaveEvent={handleSaveEvent}
        />
      )}

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
