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
import { ScrollStory } from './components/ScrollStory';
import { Flourish } from './components/Flourish';

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
  // Global Role: 'landing' | 'student' | 'organizer' | 'trail'
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
  const [curtainTargetTitle, setCurtainTargetTitle] = useState('CENTRAL CAMPUS GATE');

  // Active Modals
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

  // Toast notifications system
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, description?: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { id, title, description, type };
    setToasts((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Re-read data from dataService
  const refreshData = () => {
    setEvents(dataService.getEvents());
    setPasses(dataService.getPasses());
    setScans(dataService.getScans());
    setFeedbacks(dataService.getAllFeedbacks());
    const stu = dataService.getStudentSession();
    if (stu) setStudentProfile(stu);
    const org = dataService.getOrganizerSession();
    if (org) setOrganizerProfile(org);
  };

  // Sync profiles
  const handleUpdateStudentProfile = (profile: StudentProfile) => {
    dataService.setStudentSession(profile);
    setStudentProfile(profile);
    refreshData();
    showToast('★ Profile Saved', 'Your student details were updated successfully.', 'success');
  };

  // Parse deep-links from hash
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#pass=')) {
        const passCode = hash.replace('#pass=', '').trim().toUpperCase();
        const found = passes.find((p) => p.code.toUpperCase() === passCode);
        if (found) {
          setCelebrationPass(found);
        }
      } else if (hash.startsWith('#trail')) {
        setActiveRole('trail');
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, [passes]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 's' || e.key === 'S') {
        setShowScanner((prev) => !prev);
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
    <div className="relative min-h-screen dark-fantasy-bg text-[#FFF6E5] overflow-x-hidden selection:bg-[#B3345C] selection:text-[#FFF6E5] pb-24 md:pb-12">
      {/* Subtle Atmospheric Film Grain */}
      <div className="fixed inset-0 film-grain pointer-events-none z-30 opacity-40" />

      {/* Ruined Spires Silhouette Overlay along bottom of page */}
      <div className="fixed inset-x-0 bottom-0 h-44 spires-silhouette pointer-events-none z-0 opacity-40" />

      {/* Cinematic Dark Page Transition */}
      <CurtainTransition
        isActive={isCurtainActive}
        targetPageTitle={curtainTargetTitle}
      />

      {/* Translucent Glass Top Bar Navigation */}
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
            VIEW: LANDING PORTAL (DARK STORYBOOK SCROLL HERO + BOARD)
        ======================================================== */}
        {activeRole === 'landing' && (
          <div className="space-y-16">
            {/* SCROLL STORY 600vh HERO STAGE */}
            <ScrollStory
              events={events}
              onSelectRole={switchRoleWithCurtain}
              onSelectCategory={(cat) => setCategoryFilter(cat)}
            />

            {/* CINEMATIC STAT STRIP SECTION */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 select-none -mt-8 relative z-20">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 24, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="glass-panel p-5 rounded-2xl border border-[#E8D9B0]/20 hover:border-[#E8D9B0]/50 transition-all flex flex-col justify-between"
                >
                  <span className="font-display text-[10px] uppercase tracking-widest text-[#E8D9B0]/75 block">
                    ACTIVE NOTICES
                  </span>
                  <span className="font-display font-black text-3xl sm:text-4xl text-gold-gradient block my-1">
                    0{events.length} REALMS
                  </span>
                  <span className="font-sans text-xs text-[#FFF6E5]/70 block">
                    Tech, Cultural, Sports & Workshops
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 24, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="glass-panel p-5 rounded-2xl border border-[#E8D9B0]/20 hover:border-[#E8D9B0]/50 transition-all flex flex-col justify-between"
                >
                  <span className="font-display text-[10px] uppercase tracking-widest text-[#E8D9B0]/75 block">
                    ISSUED DISPATCHES
                  </span>
                  <span className="font-display font-black text-3xl sm:text-4xl text-gold-gradient block my-1">
                    {totalRegistered} PASSES
                  </span>
                  <span className="font-sans text-xs text-[#FFF6E5]/70 block">
                    Cryptographic passes minted
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 24, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="glass-panel p-5 rounded-2xl border border-[#E8D9B0]/20 hover:border-[#E8D9B0]/50 transition-all flex flex-col justify-between"
                >
                  <span className="font-display text-[10px] uppercase tracking-widest text-[#E8D9B0]/75 block">
                    VERIFIED ATTENDANCE
                  </span>
                  <span className="font-display font-black text-3xl sm:text-4xl text-[#E04A7B] block my-1">
                    {totalCheckedIn} ({checkInRate}%)
                  </span>
                  <span className="font-sans text-xs text-[#FFF6E5]/70 block">
                    Scanned at festival portal gates
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 24, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="glass-panel p-5 rounded-2xl border border-[#E8D9B0]/20 hover:border-[#E8D9B0]/50 transition-all flex flex-col justify-between"
                >
                  <span className="font-display text-[10px] uppercase tracking-widest text-[#E8D9B0]/75 block">
                    CRYPTOGRAPHIC SHIELD
                  </span>
                  <span className="font-display font-black text-3xl sm:text-4xl text-emerald-400 block my-1">
                    100% ATOMIC
                  </span>
                  <span className="font-sans text-xs text-[#FFF6E5]/70 block">
                    Zero duplicate scans permitted
                  </span>
                </motion.div>
              </div>
            </section>

            {/* PINNED BULLETIN BOARD NOTICES SECTION */}
            <section id="notice-board-preview" className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 select-none pt-4">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E8D9B0]/20 pb-6">
                <div>
                  <div className="font-eyebrow text-sm text-[#E8D9B0] uppercase tracking-[0.25em]">
                    Active Festival Dispatches
                  </div>
                  <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-wider text-gold-gradient mt-1">
                    NOTICE BOARD ARENA
                  </h2>
                  <Flourish className="w-52 h-6 mt-2" color="#E8D9B0" delay={0.1} />
                </div>

                {/* Category Filters as Glass Pills with Crimson Glow on active */}
                <div className="flex flex-wrap items-center gap-2">
                  {['ALL', 'Tech', 'Cultural', 'Sports', 'Workshop', 'Club Drive'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        postalSoundFx.playTypewriterTick();
                        setCategoryFilter(cat);
                      }}
                      className={`px-4 py-2 rounded-full text-xs font-sans font-medium transition-all ${
                        categoryFilter === cat
                          ? 'btn-crimson-pill text-[#FFF6E5] shadow-[0_0_20px_rgba(224,74,123,0.55)] scale-105'
                          : 'glass-pill text-[#FFF6E5]/80 hover:text-[#FFF6E5]'
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

                  return (
                    <EnvelopeEventCard
                      key={ev.id}
                      event={ev}
                      isRegistered={!!userPass}
                      onOpenDetails={() => setInspectingEvent(ev)}
                      onQuickRegister={() => setRegisteringEvent(ev)}
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
