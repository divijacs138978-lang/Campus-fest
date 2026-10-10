/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
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
import { soundFx } from './utils/audio';

// Components
import { TopBar } from './components/TopBar';
import { RoleGateView } from './components/RoleGateView';
import { StudentDashboard } from './components/StudentDashboard';
import { OrganizerCommandCenter } from './components/OrganizerCommandCenter';
import { VolunteerDashboard } from './components/VolunteerDashboard';
import { StallOwnerDashboard } from './components/StallOwnerDashboard';
import { SponsorDashboard } from './components/SponsorDashboard';
import { CampusTrailMap } from './components/CampusTrailMap';
import { PageTransition } from './components/PageTransition';
import { StoryRegistrationModal } from './components/StoryRegistrationModal';
import { PassCelebrationModal } from './components/PassCelebrationModal';
import { EventDetailModal } from './components/EventDetailModal';
import { ScannerModal } from './components/ScannerModal';
import { StoryFeedbackModal } from './components/StoryFeedbackModal';
import { NewEventModal } from './components/NewEventModal';
import { StudentAuthModal } from './components/StudentAuthModal';
import { OrganizerAuthModal } from './components/OrganizerAuthModal';
import { ToastContainer, ToastMessage } from './components/Toast';

const ROLE_TITLES: Record<ActiveRole, { title: string; eyebrow: string }> = {
  gate: { title: 'FESTORA GRAND GATE', eyebrow: 'CHOOSE YOUR ENTRY PERSONA' },
  landing: { title: 'DISCOVER FESTORA', eyebrow: 'THE FESTIVAL CHRONICLES' },
  student: { title: 'FESTORA NOTICE SANCTUARY', eyebrow: 'OFFICIAL NOTICE BOARD & PASSES' },
  organizer: { title: 'ORGANIZER COMMAND DESK', eyebrow: 'COUNCIL TELEMETRY & OPERATIONS' },
  volunteer: { title: 'VOLUNTEER OPERATIONS CORPS', eyebrow: 'STAGE & GATE CREW GUILD' },
  stall: { title: 'MERCHANT STALL BAZAAR', eyebrow: 'CAMPUS VENDOR & EXPO GUILD' },
  sponsor: { title: 'FESTIVAL SPONSOR GUILD', eyebrow: 'CORPORATE PARTNERS & BENEFACTORS' },
  trail: { title: 'CAMPUS TRAIL EXPEDITION', eyebrow: 'PARCHMENT SURVEYOR ROAD MAP' },
  other: { title: 'OTHER ENTRANCE ROLES', eyebrow: 'CREW, MERCHANTS & PATRONS' },
};

export default function App() {
  // Global Active Role: defaults to 'gate'
  const [activeRole, setActiveRole] = useState<ActiveRole>(() => {
    if (typeof window !== 'undefined') {
      const saved =
        localStorage.getItem('festora_active_role') ||
        localStorage.getItem('campus_post_active_role');
      if (saved) return saved as ActiveRole;
    }
    return 'gate';
  });

  const [studentTab, setStudentTab] = useState<'board' | 'story' | 'passes' | 'profile'>('board');

  // Page History Stack for Back / Forward Navigation (PART 4.2)
  const [historyStack, setHistoryStack] = useState<ActiveRole[]>(() => [activeRole]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Persistence data from dataService
  const [events, setEvents] = useState<CampusEvent[]>(() => dataService.getEvents());
  const [passes, setPasses] = useState<CampusPass[]>(() => dataService.getPasses());
  const [scans, setScans] = useState<ScanRecord[]>(() => dataService.getScans());
  const [feedbacks, setFeedbacks] = useState<CampusFeedback[]>(() => dataService.getAllFeedbacks());

  // Profiles: initialized as null unless saved session exists (no hardcoded fake people)
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(() => {
    return dataService.getStudentSession();
  });

  const [organizerProfile, setOrganizerProfile] = useState<OrganizerProfile | null>(() => {
    return dataService.getOrganizerSession();
  });

  // Auth Modals state
  const [showStudentAuthModal, setShowStudentAuthModal] = useState(false);
  const [showOrganizerAuthModal, setShowOrganizerAuthModal] = useState(false);
  const [pendingRegisterEvent, setPendingRegisterEvent] = useState<CampusEvent | null>(null);

  // Page Transition state
  const [isTransitionActive, setIsTransitionActive] = useState(false);
  const [transitionTitle, setTransitionTitle] = useState('CENTRAL CAMPUS GATE');
  const [transitionEyebrow, setTransitionEyebrow] = useState('ENTERING THE REALM OF');

  // Modals state
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

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, description?: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { id, title, description, type };
    setToasts((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshData = useCallback(() => {
    setEvents(dataService.getEvents());
    setPasses(dataService.getPasses());
    setScans(dataService.getScans());
    setFeedbacks(dataService.getAllFeedbacks());
    const stu = dataService.getStudentSession();
    if (stu) setStudentProfile(stu);
    const org = dataService.getOrganizerSession();
    if (org) setOrganizerProfile(org);
  }, []);

  // Sync profile updates
  const handleUpdateStudentProfile = (profile: StudentProfile) => {
    dataService.setStudentSession(profile);
    setStudentProfile(profile);
    refreshData();
    showToast('★ Profile Saved', 'Your student credentials have been updated.', 'success');
  };

  const handleStudentSignInSuccess = (profile: StudentProfile) => {
    dataService.setStudentSession(profile);
    setStudentProfile(profile);
    setShowStudentAuthModal(false);
    refreshData();
    showToast('★ Welcome to Festora', `Signed in as ${profile.name} (${profile.rollNumber})`, 'success');
    if (pendingRegisterEvent) {
      setRegisteringEvent(pendingRegisterEvent);
      setPendingRegisterEvent(null);
    } else {
      switchRoleWithTransition('student');
    }
  };

  const handleStudentSignOut = () => {
    dataService.setStudentSession(null);
    setStudentProfile(null);
    refreshData();
    showToast('Signed Out', 'You have been signed out of student access.', 'info');
    switchRoleWithTransition('gate');
  };

  const handleOrganizerSignInSuccess = (profile: OrganizerProfile) => {
    dataService.setOrganizerSession(profile);
    setOrganizerProfile(profile);
    setShowOrganizerAuthModal(false);
    refreshData();
    showToast('Council Access Granted', `Welcome, ${profile.name} (${profile.clubName})`, 'success');
    switchRoleWithTransition('organizer');
  };

  const handleOrganizerSignOut = () => {
    dataService.setOrganizerSession(null);
    setOrganizerProfile(null);
    refreshData();
    showToast('Council Session Ended', 'Signed out of Organizer Command Desk.', 'info');
    switchRoleWithTransition('gate');
  };

  const handleQuickRegister = (event: CampusEvent) => {
    if (!studentProfile) {
      setPendingRegisterEvent(event);
      setShowStudentAuthModal(true);
    } else {
      setRegisteringEvent(event);
    }
  };

  // Cinematic Page Transition handler (PART 5.A)
  const switchRoleWithTransition = useCallback(
    (nextRole: ActiveRole) => {
      if (nextRole === activeRole) return;
      soundFx.playTransition();

      const meta = ROLE_TITLES[nextRole] || {
        title: nextRole.toUpperCase(),
        eyebrow: 'FESTORA REALM',
      };
      setTransitionTitle(meta.title);
      setTransitionEyebrow(meta.eyebrow);
      setIsTransitionActive(true);

      // Add to navigation history stack
      setHistoryStack((prev) => {
        const nextStack = prev.slice(0, historyIndex + 1);
        nextStack.push(nextRole);
        return nextStack;
      });
      setHistoryIndex((prev) => prev + 1);

      // Save choice to localStorage safely
      if (typeof window !== 'undefined') {
        localStorage.setItem('festora_active_role', nextRole);
        localStorage.setItem('campus_post_active_role', nextRole);
      }

      setTimeout(() => {
        setActiveRole(nextRole);
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 400);

      setTimeout(() => {
        setIsTransitionActive(false);
      }, 1150);
    },
    [activeRole, historyIndex]
  );

  // Back / Forward page navigation (PART 4.2)
  const handleGoBack = () => {
    if (historyIndex > 0) {
      const prevRole = historyStack[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setActiveRole(prevRole);
      soundFx.playTransition();
    }
  };

  const handleGoForward = () => {
    if (historyIndex < historyStack.length - 1) {
      const nextRole = historyStack[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setActiveRole(nextRole);
      soundFx.playTransition();
    }
  };

  // Keyboard shortcut: 'S' toggles camera scanner
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

  // Pass template updater
  const handleUpdatePassTemplate = (passId: string, template: PassTemplateType) => {
    dataService.updatePassTemplate(passId, template);
    refreshData();
    showToast('Pass Template Updated', `Remixed into ${template.replace('_', ' ')} style.`, 'success');
  };

  // Complete Registration handler
  const handleRegistrationCompleted = (pass: CampusPass) => {
    refreshData();
    setRegisteringEvent(null);
    setCelebrationPass(pass);
    soundFx.playConfirm();
  };

  // Save new/edited event
  const handleSaveEvent = (saved: CampusEvent) => {
    refreshData();
    setShowNewEventModal(false);
    setEditingEvent(null);
    showToast('Notice Pinned', `"${saved.title}" posted to the central board.`, 'success');
  };

  return (
    <div className="min-h-screen bg-[#0B1030] text-[#FFF6E5] flex flex-col font-sans selection:bg-[#B3345C] selection:text-[#FFF6E5]">
      {/* Cinematic Full-Bleed Page Transition (PART 5.A) */}
      <PageTransition
        isActive={isTransitionActive}
        pageTitle={transitionTitle}
        eyebrow={transitionEyebrow}
      />

      {/* Top Navigation Bar with Switch Role pill, mute toggle, and scanner */}
      <TopBar
        activeRole={activeRole}
        onSwitchRole={switchRoleWithTransition}
        onOpenScanner={() => {
          setScannerEventId(undefined);
          setShowScanner(true);
        }}
        myPassesCount={passes.length}
        studentProfile={studentProfile}
        organizerProfile={organizerProfile}
        currentStudentTab={studentTab}
        onSetStudentTab={setStudentTab}
        canGoBack={historyIndex > 0}
        canGoForward={historyIndex < historyStack.length - 1}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onOpenStudentSignIn={() => setShowStudentAuthModal(true)}
        onSignOut={handleStudentSignOut}
      />

      {/* Main Dynamic View Area */}
      <main className="flex-1 w-full pb-16">
        {/* ========================================================
            VIEW 1: GRAND ROLE GATE (PART 1.1)
            Entry screen replacing previous landing as first seen!
        ======================================================== */}
        {(activeRole === 'gate' || activeRole === 'landing') && (
          <RoleGateView
            onSelectRole={switchRoleWithTransition}
            onOpenTrail={() => switchRoleWithTransition('trail')}
            studentProfile={studentProfile}
            organizerProfile={organizerProfile}
            onOpenStudentSignIn={() => setShowStudentAuthModal(true)}
            onOpenOrganizerSignIn={() => setShowOrganizerAuthModal(true)}
          />
        )}

        {/* ========================================================
            VIEW 2: STUDENT SANCTUARY & NOTICE BOARD
        ======================================================== */}
        {activeRole === 'student' && (
          <StudentDashboard
            events={events}
            myPasses={passes}
            studentProfile={studentProfile}
            onUpdateProfile={handleUpdateStudentProfile}
            onSelectEvent={(event) => setInspectingEvent(event)}
            onQuickRegister={handleQuickRegister}
            onOpenFeedback={(pass, event) => setFeedbackSession({ pass, event })}
            onUpdatePassTemplate={handleUpdatePassTemplate}
            onShowToast={showToast}
            onOpenTrail={() => switchRoleWithTransition('trail')}
            onOpenSignIn={() => setShowStudentAuthModal(true)}
            onSignOut={handleStudentSignOut}
          />
        )}

        {/* ========================================================
            VIEW 3: ORGANIZER COMMAND CENTER (PART 3 & 4)
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
            onSelectPassToView={(pass) => setCelebrationPass(pass)}
            onSelectEventToEdit={(event) => {
              setEditingEvent(event);
              setShowNewEventModal(true);
            }}
            onShowToast={showToast}
            onSignOut={handleOrganizerSignOut}
          />
        )}

        {/* ========================================================
            VIEW 4: VOLUNTEER DASHBOARD (PART 1.3)
        ======================================================== */}
        {activeRole === 'volunteer' && (
          <VolunteerDashboard
            events={events}
            onShowToast={showToast}
            onSwitchRole={switchRoleWithTransition}
            onSelectEvent={(ev) => setInspectingEvent(ev)}
            onRegisterEvent={handleQuickRegister}
          />
        )}

        {/* ========================================================
            VIEW 5: STALL OWNER DASHBOARD (PART 1.4)
        ======================================================== */}
        {activeRole === 'stall' && (
          <StallOwnerDashboard
            events={events}
            onShowToast={showToast}
            onSwitchRole={switchRoleWithTransition}
            onSelectEvent={(ev) => setInspectingEvent(ev)}
            onRegisterEvent={handleQuickRegister}
          />
        )}

        {/* ========================================================
            VIEW 6: SPONSOR DASHBOARD (PART 1.5)
        ======================================================== */}
        {activeRole === 'sponsor' && (
          <SponsorDashboard
            events={events}
            onShowToast={showToast}
            onSwitchRole={switchRoleWithTransition}
            onSelectEvent={(ev) => setInspectingEvent(ev)}
            onRegisterEvent={handleQuickRegister}
          />
        )}

        {/* ========================================================
            VIEW 7: PARCHMENT CAMPUS TRAIL ROAD MAP (PART 6.A)
        ======================================================== */}
        {activeRole === 'trail' && (
          <CampusTrailMap
            events={events}
            onSelectEvent={(ev) => setInspectingEvent(ev)}
            onClose={() => switchRoleWithTransition('gate')}
          />
        )}
      </main>

      {/* ========================================================
          ALL FESTIVAL MODALS & EXPERIENCES
      ======================================================== */}

      {/* Registration Stepper Modal */}
      {registeringEvent && (
        <StoryRegistrationModal
          event={registeringEvent}
          studentProfile={studentProfile}
          onClose={() => setRegisteringEvent(null)}
          onRegistered={handleRegistrationCompleted}
        />
      )}

      {/* Celebration Stamped Pass Arrival Modal */}
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

      {/* Event Details Notice Modal */}
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

      {/* Gatekeeper Camera Scanner Modal */}
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

      {/* New Event Modal */}
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

      {/* Student Sign In Modal */}
      {showStudentAuthModal && (
        <StudentAuthModal
          initialProfile={studentProfile}
          onClose={() => {
            setShowStudentAuthModal(false);
            setPendingRegisterEvent(null);
          }}
          onSuccess={handleStudentSignInSuccess}
        />
      )}

      {/* Organizer Sign In Modal */}
      {showOrganizerAuthModal && (
        <OrganizerAuthModal
          initialProfile={organizerProfile}
          onClose={() => setShowOrganizerAuthModal(false)}
          onSuccess={handleOrganizerSignInSuccess}
        />
      )}

      {/* Toast Notifications Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
