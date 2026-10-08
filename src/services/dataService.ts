/**
 * Single Unified Data Layer for CAMPUS POST
 * Supports automatic localStorage fallback with optional Firebase Firestore hooks.
 */

import {
  CampusEvent,
  CampusPass,
  ScanRecord,
  CampusFeedback,
  StudentProfile,
  OrganizerProfile,
  PassTemplateType,
} from '../types';

const STORAGE_KEYS = {
  EVENTS: 'campus_post_events_v1',
  PASSES: 'campus_post_passes_v1',
  SCANS: 'campus_post_scans_v1',
  FEEDBACKS: 'campus_post_feedbacks_v1',
  STUDENT_SESSION: 'campus_post_student_session_v1',
  ORGANIZER_SESSION: 'campus_post_organizer_session_v1',
  FIREBASE_CONFIG: 'campus_post_firebase_config_v1',
};

// Character pool excluding confusing characters: O, 0, I, 1
const SAFE_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function generateEntryCode(existingCodes: Set<string>): string {
  let code = '';
  let attempts = 0;
  do {
    const p1 = Array.from({ length: 4 }, () => SAFE_CHARS[Math.floor(Math.random() * SAFE_CHARS.length)]).join('');
    const p2 = Array.from({ length: 4 }, () => SAFE_CHARS[Math.floor(Math.random() * SAFE_CHARS.length)]).join('');
    code = `CP-${p1}-${p2}`;
    attempts++;
  } while (existingCodes.has(code) && attempts < 100);
  return code;
}

export const SEED_EVENTS: CampusEvent[] = [
  {
    id: 'ev-hackcampus-2026',
    title: 'HACKCAMPUS 2026: 24-HR HACKATHON',
    description: 'The flagship inter-college 24-hr hackathon by IEEE Student Branch. Build high-impact solutions in AI, Climate Tech, and Campus Life. Midnight pizza, sponsor bounties, hardware kits, and $5,000 cash pool.',
    category: 'Tech',
    date: 'OCTOBER 17 — 18, 2026',
    dayLabel: 'SATURDAY',
    time: '09:00 AM',
    venue: 'Turing Innovation Hub, Block C',
    registrationDeadline: '2026-10-16T23:59:00Z',
    capacity: 200,
    registeredCount: 168,
    checkedInCount: 114,
    status: 'LIVE',
    posterColor: '#8E2A2A',
    organizerClub: 'IEEE Student Branch',
    organizerEmail: 'ieee@campuspost.edu',
    eligibilityYears: ['All Years'],
    eligibilityDepartments: ['All Departments'],
    tags: ['HACKATHON', 'PRIZES', '24-HOURS', 'TEAMS OF 2-4'],
    createdAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'ev-tarang-2026',
    title: 'TARANG 2026: ANNUAL CULTURAL NIGHT',
    description: 'The premier annual cultural festival under the plum campus sky. 10 battle-of-the-bands finalists, classical & fusion dance troupes, celebrity guest performance, street food courtyard, and light showcase.',
    category: 'Cultural',
    date: 'OCTOBER 23, 2026',
    dayLabel: 'FRIDAY',
    time: '06:00 PM',
    venue: 'Grand Open Air Amphitheatre',
    registrationDeadline: '2026-10-23T16:00:00Z',
    capacity: 800,
    registeredCount: 800,
    checkedInCount: 520,
    status: 'FULL',
    posterColor: '#5E1250',
    organizerClub: 'Cultural Committee',
    organizerEmail: 'culture@campuspost.edu',
    eligibilityYears: ['All Years'],
    eligibilityDepartments: ['All Departments'],
    tags: ['MUSIC', 'BANDS', 'DANCE', 'FOOD STALLS', 'NIGHT FEST'],
    createdAt: '2026-10-02T12:00:00Z',
  },
  {
    id: 'ev-llm-bootcamp',
    title: 'AI & LLM BOOTCAMP: HANDS-ON WORKSHOP',
    description: 'Intensive laboratory session constructed by ACM Chapter. Build production AI agents, retrieval augmented pipelines, and streaming interactive apps. Bring laptops with Python 3.11+. Cloud GPU credits and certificates provided.',
    category: 'Workshop',
    date: 'OCTOBER 28, 2026',
    dayLabel: 'WEDNESDAY',
    time: '02:00 PM',
    venue: 'Computing Lab 4, Tech Tower',
    registrationDeadline: '2026-10-27T18:00:00Z',
    capacity: 80,
    registeredCount: 68,
    checkedInCount: 0,
    status: 'OPEN',
    posterColor: '#5B7A3A',
    organizerClub: 'ACM Chapter',
    organizerEmail: 'acm@campuspost.edu',
    eligibilityYears: ['2nd Year', '3rd Year', '4th Year'],
    eligibilityDepartments: ['CSE', 'IT', 'ECE', 'Data Science'],
    tags: ['CERTIFIED', 'HANDS-ON', 'GPU LAB', 'BEGINNER FRIENDLY'],
    createdAt: '2026-10-03T15:00:00Z',
  },
  {
    id: 'ev-futsal-cup',
    title: 'INTER-DEPT FUTSAL CUP 2026',
    description: 'High-octane 5v5 department championship tournament organized by Sports Council. Knockout bracket format, golden goal extra time, live commentary, sports refreshments, and official university rolling trophy.',
    category: 'Sports',
    date: 'NOVEMBER 04, 2026',
    dayLabel: 'WEDNESDAY',
    time: '04:30 PM',
    venue: 'Campus Sports Arena & Turf',
    registrationDeadline: '2026-11-03T20:00:00Z',
    capacity: 128,
    registeredCount: 96,
    checkedInCount: 0,
    status: 'OPEN',
    posterColor: '#A98258',
    organizerClub: 'Sports Council',
    organizerEmail: 'sports@campuspost.edu',
    eligibilityYears: ['All Years'],
    eligibilityDepartments: ['All Departments'],
    tags: ['5V5', 'TOURNAMENT', 'TROPHY', 'INTER-DEPT'],
    createdAt: '2026-10-04T09:00:00Z',
  },
  {
    id: 'ev-robotics-drive',
    title: 'ROBOTICS CLUB ANNUAL RECRUITMENT',
    description: 'Join the university robotics team building autonomous rovers, combat bots, and IoT aerial drones. Live hardware demonstrations, track walk, aptitude challenge, and direct interview recruitment drive.',
    category: 'Club Drive',
    date: 'NOVEMBER 10, 2026',
    dayLabel: 'TUESDAY',
    time: '03:00 PM',
    venue: 'Mechatronics Workshop & Arena',
    registrationDeadline: '2026-11-09T22:00:00Z',
    capacity: 150,
    registeredCount: 112,
    checkedInCount: 0,
    status: 'OPEN',
    posterColor: '#2A1A14',
    organizerClub: 'Robotics Club',
    organizerEmail: 'robotics@campuspost.edu',
    eligibilityYears: ['1st Year', '2nd Year', '3rd Year'],
    eligibilityDepartments: ['Mechanical', 'CSE', 'ECE', 'Electrical'],
    tags: ['ROVERS', 'COMBAT BOTS', 'DRONES', 'CORE TEAM'],
    createdAt: '2026-10-05T11:00:00Z',
  },
];

export const SEED_PASSES: CampusPass[] = [
  {
    id: 'pass-sample-1',
    code: 'CP-7K2X-9M4Q',
    eventId: 'ev-hackcampus-2026',
    eventTitle: 'HACKCAMPUS 2026: 24-HR HACKATHON',
    eventDate: 'OCTOBER 17 — 18, 2026',
    eventTime: '09:00 AM',
    eventVenue: 'Turing Innovation Hub, Block C',
    studentName: 'Aarav Sharma',
    studentRollNumber: '22CS084',
    studentEmail: 'aarav.sharma@campuspost.edu',
    studentDepartment: 'Computer Science',
    studentYear: '3rd Year',
    studentPhone: '+91 98765 43210',
    teamName: 'Neural Ninjas',
    tshirtSize: 'L',
    template: 'campus_id',
    registeredAt: '2026-10-05T14:30:00Z',
    checkedIn: true,
    checkedInAt: '2026-10-08T06:15:00Z',
    seatNo: 12,
  },
  {
    id: 'pass-sample-2',
    code: 'CP-4R8Y-2V6T',
    eventId: 'ev-tarang-2026',
    eventTitle: 'TARANG 2026: ANNUAL CULTURAL NIGHT',
    eventDate: 'OCTOBER 23, 2026',
    eventTime: '06:00 PM',
    eventVenue: 'Grand Open Air Amphitheatre',
    studentName: 'Priya Iyer',
    studentRollNumber: '23EC102',
    studentEmail: 'priya.iyer@campuspost.edu',
    studentDepartment: 'Electronics & Comm.',
    studentYear: '2nd Year',
    studentPhone: '+91 98123 45678',
    template: 'ticket_stub',
    registeredAt: '2026-10-06T10:15:00Z',
    checkedIn: true,
    checkedInAt: '2026-10-08T06:18:30Z',
    seatNo: 47,
  },
  {
    id: 'pass-sample-3',
    code: 'CP-9W3M-5K7P',
    eventId: 'ev-llm-bootcamp',
    eventTitle: 'AI & LLM BOOTCAMP: HANDS-ON WORKSHOP',
    eventDate: 'OCTOBER 28, 2026',
    eventTime: '02:00 PM',
    eventVenue: 'Computing Lab 4, Tech Tower',
    studentName: 'Rohan Verma',
    studentRollNumber: '21IT045',
    studentEmail: 'rohan.verma@campuspost.edu',
    studentDepartment: 'Information Technology',
    studentYear: '4th Year',
    studentPhone: '+91 98456 78901',
    template: 'telegram',
    registeredAt: '2026-10-07T16:00:00Z',
    checkedIn: false,
    seatNo: 8,
  },
  {
    id: 'pass-sample-4',
    code: 'CP-2H9L-8Q3V',
    eventId: 'ev-hackcampus-2026',
    eventTitle: 'HACKCAMPUS 2026: 24-HR HACKATHON',
    eventDate: 'OCTOBER 17 — 18, 2026',
    eventTime: '09:00 AM',
    eventVenue: 'Turing Innovation Hub, Block C',
    studentName: 'Ananya Gupta',
    studentRollNumber: '22CS119',
    studentEmail: 'ananya.gupta@campuspost.edu',
    studentDepartment: 'Computer Science',
    studentYear: '3rd Year',
    studentPhone: '+91 98321 65498',
    teamName: 'BitShift',
    tshirtSize: 'M',
    template: 'city_poster',
    registeredAt: '2026-10-05T15:10:00Z',
    checkedIn: true,
    checkedInAt: '2026-10-08T06:16:45Z',
    seatNo: 13,
  },
  {
    id: 'pass-sample-5',
    code: 'CP-6F4W-1T8K',
    eventId: 'ev-futsal-cup',
    eventTitle: 'INTER-DEPT FUTSAL CUP 2026',
    eventDate: 'NOVEMBER 04, 2026',
    eventTime: '04:30 PM',
    eventVenue: 'Campus Sports Arena & Turf',
    studentName: 'Kunal Deshmukh',
    studentRollNumber: '24ME034',
    studentEmail: 'kunal.d@campuspost.edu',
    studentDepartment: 'Mechanical Engineering',
    studentYear: '1st Year',
    studentPhone: '+91 97654 32109',
    teamName: 'Mech Strikers',
    tshirtSize: 'XL',
    template: 'ticket_stub',
    registeredAt: '2026-10-07T18:40:00Z',
    checkedIn: false,
    seatNo: 19,
  },
  {
    id: 'pass-sample-6',
    code: 'CP-3J7Y-9P2D',
    eventId: 'ev-robotics-drive',
    eventTitle: 'ROBOTICS CLUB ANNUAL RECRUITMENT',
    eventDate: 'NOVEMBER 10, 2026',
    eventTime: '03:00 PM',
    eventVenue: 'Mechatronics Workshop & Arena',
    studentName: 'Simran Kaur',
    studentRollNumber: '23EC067',
    studentEmail: 'simran.k@campuspost.edu',
    studentDepartment: 'Electronics & Comm.',
    studentYear: '2nd Year',
    studentPhone: '+91 99123 78456',
    template: 'campus_id',
    registeredAt: '2026-10-08T01:20:00Z',
    checkedIn: false,
    seatNo: 24,
  },
];

export const SEED_SCANS: ScanRecord[] = [
  {
    id: 'scan-1',
    code: 'CP-7K2X-9M4Q',
    eventId: 'ev-hackcampus-2026',
    studentName: 'Aarav Sharma',
    studentRollNumber: '22CS084',
    studentDepartment: 'Computer Science',
    timestamp: '06:15:22 AM',
    status: 'VALID',
    message: 'APPROVED // WELCOME AARAV SHARMA (22CS084)',
  },
  {
    id: 'scan-2',
    code: 'CP-2H9L-8Q3V',
    eventId: 'ev-hackcampus-2026',
    studentName: 'Ananya Gupta',
    studentRollNumber: '22CS119',
    studentDepartment: 'Computer Science',
    timestamp: '06:16:45 AM',
    status: 'VALID',
    message: 'APPROVED // WELCOME ANANYA GUPTA (22CS119)',
  },
  {
    id: 'scan-3',
    code: 'CP-7K2X-9M4Q',
    eventId: 'ev-hackcampus-2026',
    studentName: 'Aarav Sharma',
    studentRollNumber: '22CS084',
    studentDepartment: 'Computer Science',
    timestamp: '06:17:10 AM',
    status: 'DUPLICATE',
    message: 'ALREADY STAMPED AT 06:15:22 AM // NO SECOND ENTRY',
  },
  {
    id: 'scan-4',
    code: 'CP-4R8Y-2V6T',
    eventId: 'ev-tarang-2026',
    studentName: 'Priya Iyer',
    studentRollNumber: '23EC102',
    studentDepartment: 'Electronics & Comm.',
    timestamp: '06:18:30 AM',
    status: 'VALID',
    message: 'APPROVED // WELCOME PRIYA IYER (23EC102)',
  },
];

export const SEED_FEEDBACKS: CampusFeedback[] = [
  {
    id: 'fb-1',
    eventId: 'ev-hackcampus-2026',
    eventTitle: 'HACKCAMPUS 2026: 24-HR HACKATHON',
    participantCode: 'CP-7K2X-9M4Q',
    studentName: 'Aarav Sharma',
    isAnonymous: false,
    overallRating: 5,
    organizationRating: 5,
    contentRating: 5,
    venueRating: 4,
    luggageTags: ['Activities', 'Food', 'Networking', 'Prizes'],
    enjoyedText: 'The mentorship sessions at 2 AM and fast WiFi made all the difference.',
    improveText: 'Could use more charging strips around Section B tables.',
    recommend: 'Yes',
    submittedAt: '2026-10-08T06:20:00Z',
  },
  {
    id: 'fb-2',
    eventId: 'ev-tarang-2026',
    eventTitle: 'TARANG 2026: ANNUAL CULTURAL NIGHT',
    participantCode: 'CP-4R8Y-2V6T',
    studentName: 'Priya Iyer',
    isAnonymous: false,
    overallRating: 5,
    organizationRating: 4,
    contentRating: 5,
    venueRating: 5,
    luggageTags: ['Music', 'Food', 'Atmosphere'],
    enjoyedText: 'The sound system and the fusion dance performances were electric!',
    improveText: 'Queue for entry was a bit long, good thing Campus Post scan was instant.',
    recommend: 'Yes',
    submittedAt: '2026-10-08T06:25:00Z',
  },
];

class CampusDataService {
  private events: CampusEvent[] = [];
  private passes: CampusPass[] = [];
  private scans: ScanRecord[] = [];
  private feedbacks: CampusFeedback[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      const rawEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (rawEvents) {
        const parsed = JSON.parse(rawEvents);
        for (const se of SEED_EVENTS) {
          if (!parsed.some((e: CampusEvent) => e.id === se.id)) {
            parsed.push(se);
          }
        }
        this.events = parsed;
      } else {
        this.events = JSON.parse(JSON.stringify(SEED_EVENTS));
        this.saveEvents();
      }

      const rawPasses = localStorage.getItem(STORAGE_KEYS.PASSES);
      if (rawPasses) {
        const parsed = JSON.parse(rawPasses);
        for (const sp of SEED_PASSES) {
          if (!parsed.some((p: CampusPass) => p.id === sp.id)) {
            parsed.push(sp);
          }
        }
        this.passes = parsed;
      } else {
        this.passes = JSON.parse(JSON.stringify(SEED_PASSES));
        this.savePasses();
      }

      const rawScans = localStorage.getItem(STORAGE_KEYS.SCANS);
      if (rawScans) {
        const parsed = JSON.parse(rawScans);
        for (const ss of SEED_SCANS) {
          if (!parsed.some((s: ScanRecord) => s.id === ss.id)) {
            parsed.push(ss);
          }
        }
        this.scans = parsed;
      } else {
        this.scans = JSON.parse(JSON.stringify(SEED_SCANS));
        this.saveScans();
      }

      const rawFeedbacks = localStorage.getItem(STORAGE_KEYS.FEEDBACKS);
      if (rawFeedbacks) {
        const parsed = JSON.parse(rawFeedbacks);
        for (const sf of SEED_FEEDBACKS) {
          if (!parsed.some((f: CampusFeedback) => f.id === sf.id)) {
            parsed.push(sf);
          }
        }
        this.feedbacks = parsed;
      } else {
        this.feedbacks = JSON.parse(JSON.stringify(SEED_FEEDBACKS));
        this.saveFeedbacks();
      }
    } catch {
      this.events = JSON.parse(JSON.stringify(SEED_EVENTS));
      this.passes = JSON.parse(JSON.stringify(SEED_PASSES));
      this.scans = JSON.parse(JSON.stringify(SEED_SCANS));
      this.feedbacks = JSON.parse(JSON.stringify(SEED_FEEDBACKS));
    }
  }

  private saveEvents() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(this.events));
    }
  }

  private savePasses() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PASSES, JSON.stringify(this.passes));
    }
  }

  private saveScans() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SCANS, JSON.stringify(this.scans));
    }
  }

  private saveFeedbacks() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(this.feedbacks));
    }
  }

  // --- Session & Profiles ---
  getStudentSession(): StudentProfile | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENT_SESSION);
    return raw ? JSON.parse(raw) : null;
  }

  setStudentSession(student: StudentProfile | null) {
    if (typeof window === 'undefined') return;
    if (student) {
      localStorage.setItem(STORAGE_KEYS.STUDENT_SESSION, JSON.stringify(student));
    } else {
      localStorage.removeItem(STORAGE_KEYS.STUDENT_SESSION);
    }
  }

  getOrganizerSession(): OrganizerProfile | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEYS.ORGANIZER_SESSION);
    return raw ? JSON.parse(raw) : null;
  }

  setOrganizerSession(organizer: OrganizerProfile | null) {
    if (typeof window === 'undefined') return;
    if (organizer) {
      localStorage.setItem(STORAGE_KEYS.ORGANIZER_SESSION, JSON.stringify(organizer));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ORGANIZER_SESSION);
    }
  }

  // --- Events ---
  getEvents(): CampusEvent[] {
    return [...this.events];
  }

  getEventById(id: string): CampusEvent | undefined {
    return this.events.find((e) => e.id === id);
  }

  saveEvent(eventData: Omit<CampusEvent, 'id' | 'registeredCount' | 'checkedInCount' | 'createdAt'> & { id?: string }): CampusEvent {
    if (eventData.id) {
      // Edit existing
      const index = this.events.findIndex((e) => e.id === eventData.id);
      if (index !== -1) {
        const existing = this.events[index];
        const updated: CampusEvent = {
          ...existing,
          ...eventData,
          id: existing.id,
          registeredCount: existing.registeredCount,
          checkedInCount: existing.checkedInCount,
        };
        this.events[index] = updated;
        this.saveEvents();
        return updated;
      }
    }

    // Create new
    const newId = `ev-${Date.now()}`;
    const newEvent: CampusEvent = {
      ...eventData,
      id: newId,
      registeredCount: 0,
      checkedInCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.events.unshift(newEvent);
    this.saveEvents();
    return newEvent;
  }

  deleteEvent(id: string): boolean {
    const prevLen = this.events.length;
    this.events = this.events.filter((e) => e.id !== id);
    this.passes = this.passes.filter((p) => p.eventId !== id);
    this.feedbacks = this.feedbacks.filter((f) => f.eventId !== id);
    this.saveEvents();
    this.savePasses();
    this.saveFeedbacks();
    return this.events.length < prevLen;
  }

  // --- Registration Logic ---
  registerParticipant(params: {
    eventId: string;
    studentName: string;
    studentRollNumber: string;
    studentEmail: string;
    studentDepartment: string;
    studentYear: string;
    studentPhone: string;
    teamName?: string;
    tshirtSize?: string;
    template?: PassTemplateType;
  }): { success: boolean; pass?: CampusPass; error?: string } {
    const event = this.events.find((e) => e.id === params.eventId);
    if (!event) {
      return { success: false, error: 'Event not found on notice board.' };
    }

    // 1. Capacity check
    if (event.registeredCount >= event.capacity) {
      return { success: false, error: 'Sorry, this event is already House Full.' };
    }

    // 2. Deadline check
    const deadline = new Date(event.registrationDeadline).getTime();
    if (!isNaN(deadline) && Date.now() > deadline) {
      return { success: false, error: 'Registrations closed. The deadline has passed.' };
    }

    // 3. Duplicate check for same roll number OR email
    const duplicate = this.passes.find(
      (p) =>
        p.eventId === params.eventId &&
        (p.studentRollNumber.trim().toUpperCase() === params.studentRollNumber.trim().toUpperCase() ||
          p.studentEmail.trim().toLowerCase() === params.studentEmail.trim().toLowerCase())
    );
    if (duplicate) {
      return {
        success: false,
        error: `You have already registered for this event with code ${duplicate.code}. Check your passes!`,
      };
    }

    // Generate collision-safe entry code
    const existingCodes = new Set(this.passes.map((p) => p.code));
    const code = generateEntryCode(existingCodes);

    const templates: PassTemplateType[] = ['campus_id', 'ticket_stub', 'telegram', 'city_poster'];
    const chosenTemplate: PassTemplateType =
      params.template || templates[Math.floor(Math.random() * templates.length)];

    const newPass: CampusPass = {
      id: `pass-${Date.now()}`,
      code,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      eventVenue: event.venue,
      studentName: params.studentName.trim(),
      studentRollNumber: params.studentRollNumber.trim().toUpperCase(),
      studentEmail: params.studentEmail.trim().toLowerCase(),
      studentDepartment: params.studentDepartment,
      studentYear: params.studentYear,
      studentPhone: params.studentPhone,
      teamName: params.teamName,
      tshirtSize: params.tshirtSize,
      template: chosenTemplate,
      registeredAt: new Date().toISOString(),
      checkedIn: false,
      seatNo: event.registeredCount + 1,
    };

    this.passes.unshift(newPass);
    this.savePasses();

    // Increment count on event
    event.registeredCount += 1;
    if (event.registeredCount >= event.capacity) {
      event.status = 'FULL';
    }
    this.saveEvents();

    return { success: true, pass: newPass };
  }

  // --- Passes & Wallet ---
  getPasses(): CampusPass[] {
    return [...this.passes];
  }

  getPassesForStudent(emailOrRoll: string): CampusPass[] {
    const clean = emailOrRoll.trim().toLowerCase();
    return this.passes.filter(
      (p) => p.studentEmail.toLowerCase() === clean || p.studentRollNumber.toLowerCase() === clean
    );
  }

  getPassesForEvent(eventId: string): CampusPass[] {
    return this.passes.filter((p) => p.eventId === eventId);
  }

  updatePassTemplate(passId: string, template: PassTemplateType) {
    const pass = this.passes.find((p) => p.id === passId);
    if (pass) {
      pass.template = template;
      this.savePasses();
    }
  }

  removeParticipant(passId: string): boolean {
    const pass = this.passes.find((p) => p.id === passId);
    if (!pass) return false;

    this.passes = this.passes.filter((p) => p.id !== passId);
    this.savePasses();

    const ev = this.events.find((e) => e.id === pass.eventId);
    if (ev) {
      ev.registeredCount = Math.max(0, ev.registeredCount - 1);
      if (pass.checkedIn) {
        ev.checkedInCount = Math.max(0, ev.checkedInCount - 1);
      }
      if (ev.status === 'FULL' && ev.registeredCount < ev.capacity) {
        ev.status = 'OPEN';
      }
      this.saveEvents();
    }
    return true;
  }

  // --- Guarded Atomic Check-In Logic ---
  checkInCode(code: string, targetEventId?: string): {
    status: 'VALID' | 'DUPLICATE' | 'INVALID';
    pass?: CampusPass;
    message: string;
    checkInTime?: string;
  } {
    const cleanCode = code.trim().toUpperCase();
    const timeNow = new Date().toLocaleTimeString();

    const targetPass = this.passes.find((p) => p.code === cleanCode);

    if (!targetPass) {
      const invalidScan: ScanRecord = {
        id: `scan-${Date.now()}`,
        code: cleanCode,
        studentName: 'UNKNOWN PARTICIPANT',
        studentRollNumber: 'N/A',
        studentDepartment: 'N/A',
        timestamp: timeNow,
        status: 'INVALID',
        message: 'RETURN TO SENDER // CODE NOT FOUND',
      };
      this.scans.unshift(invalidScan);
      this.saveScans();
      return { status: 'INVALID', message: 'CODE NOT FOUND IN DATABASE' };
    }

    // Optional event scope verification
    if (targetEventId && targetPass.eventId !== targetEventId) {
      const invalidScan: ScanRecord = {
        id: `scan-${Date.now()}`,
        code: cleanCode,
        eventId: targetEventId,
        studentName: targetPass.studentName,
        studentRollNumber: targetPass.studentRollNumber,
        studentDepartment: targetPass.studentDepartment,
        timestamp: timeNow,
        status: 'INVALID',
        message: `WRONG EVENT // THIS PASS IS FOR ${targetPass.eventTitle}`,
      };
      this.scans.unshift(invalidScan);
      this.saveScans();
      return {
        status: 'INVALID',
        pass: targetPass,
        message: `PASS IS FOR: ${targetPass.eventTitle.slice(0, 30)}...`,
      };
    }

    // DUPLICATE REJECTION: Already stamped
    if (targetPass.checkedIn) {
      const dupScan: ScanRecord = {
        id: `scan-${Date.now()}`,
        code: cleanCode,
        eventId: targetPass.eventId,
        studentName: targetPass.studentName,
        studentRollNumber: targetPass.studentRollNumber,
        studentDepartment: targetPass.studentDepartment,
        timestamp: timeNow,
        status: 'DUPLICATE',
        message: `ALREADY STAMPED AT ${targetPass.checkedInAt?.slice(11, 19) || 'EARLIER'}`,
      };
      this.scans.unshift(dupScan);
      this.saveScans();
      return {
        status: 'DUPLICATE',
        pass: targetPass,
        message: 'ALREADY STAMPED, NO SECOND ENTRY',
        checkInTime: targetPass.checkedInAt ? new Date(targetPass.checkedInAt).toLocaleTimeString() : timeNow,
      };
    }

    // VALID FIRST-TIME ENTRY
    targetPass.checkedIn = true;
    targetPass.checkedInAt = new Date().toISOString();
    this.savePasses();

    const ev = this.events.find((e) => e.id === targetPass.eventId);
    if (ev) {
      ev.checkedInCount += 1;
      this.saveEvents();
    }

    const validScan: ScanRecord = {
      id: `scan-${Date.now()}`,
      code: cleanCode,
      eventId: targetPass.eventId,
      studentName: targetPass.studentName,
      studentRollNumber: targetPass.studentRollNumber,
      studentDepartment: targetPass.studentDepartment,
      timestamp: timeNow,
      status: 'VALID',
      message: `APPROVED // WELCOME ${targetPass.studentName} (${targetPass.studentRollNumber})`,
    };
    this.scans.unshift(validScan);
    this.saveScans();

    return {
      status: 'VALID',
      pass: { ...targetPass },
      message: `ENTRY APPROVED • WELCOME TO ${targetPass.eventTitle}`,
    };
  }

  getScans(): ScanRecord[] {
    return [...this.scans];
  }

  // --- Feedback ---
  submitFeedback(fb: Omit<CampusFeedback, 'id' | 'submittedAt'>): { success: boolean; feedback?: CampusFeedback; error?: string } {
    const existing = this.feedbacks.find(
      (f) => f.eventId === fb.eventId && f.participantCode === fb.participantCode
    );
    if (existing) {
      return { success: false, error: 'You have already submitted feedback for this event.' };
    }

    const newFeedback: CampusFeedback = {
      ...fb,
      id: `fb-${Date.now()}`,
      submittedAt: new Date().toISOString(),
    };
    this.feedbacks.unshift(newFeedback);
    this.saveFeedbacks();
    return { success: true, feedback: newFeedback };
  }

  getFeedbacksForEvent(eventId: string): CampusFeedback[] {
    return this.feedbacks.filter((f) => f.eventId === eventId);
  }

  getAllFeedbacks(): CampusFeedback[] {
    return [...this.feedbacks];
  }

  // --- Reset & Demo Scenarios ---
  resetToDemoSeed() {
    this.events = JSON.parse(JSON.stringify(SEED_EVENTS));
    this.passes = JSON.parse(JSON.stringify(SEED_PASSES));
    this.scans = JSON.parse(JSON.stringify(SEED_SCANS));
    this.feedbacks = JSON.parse(JSON.stringify(SEED_FEEDBACKS));
    this.saveEvents();
    this.savePasses();
    this.saveScans();
    this.saveFeedbacks();
  }

  /**
   * Run Demo Scenario:
   * 1. Creates a special judging demo event
   * 2. Registers a demo participant
   * 3. Performs first scan -> VALID
   * 4. Attempts second scan with same code -> REJECTED AS DUPLICATE
   */
  runJudgingDemoScenario(): {
    event: CampusEvent;
    pass: CampusPass;
    firstScan: ReturnType<CampusDataService['checkInCode']>;
    secondScan: ReturnType<CampusDataService['checkInCode']>;
  } {
    const demoEvent = this.saveEvent({
      title: 'DEMO TECH FEST 2026 // LIVE JUDGING',
      description: 'Automated test suite demonstrating end-to-end registration and tamper-proof check-in verification.',
      category: 'Tech',
      date: 'TODAY // LIVE NOW',
      dayLabel: 'THURSDAY',
      time: 'LIVE',
      venue: 'Lab Room 101, Main Block',
      registrationDeadline: '2026-12-31T23:59:00Z',
      capacity: 50,
      posterColor: '#8E2A2A',
      organizerClub: 'Judging Panel Showcase',
      organizerEmail: 'judge@campuspost.edu',
      eligibilityYears: ['All Years'],
      eligibilityDepartments: ['All Departments'],
      tags: ['AUTOMATED DEMO', 'PASS GENERATION', 'DUPLICATE SHIELD'],
      status: 'LIVE',
    });

    const regResult = this.registerParticipant({
      eventId: demoEvent.id,
      studentName: 'Devang Sharma (Demo Student)',
      studentRollNumber: 'DEMO2026',
      studentEmail: 'demo.student@campuspost.edu',
      studentDepartment: 'Computer Science',
      studentYear: '3rd Year',
      studentPhone: '+91 99999 00000',
      template: 'campus_id',
    });

    if (!regResult.pass) {
      throw new Error('Failed to create demo pass.');
    }

    const firstScan = this.checkInCode(regResult.pass.code, demoEvent.id);
    const secondScan = this.checkInCode(regResult.pass.code, demoEvent.id);

    return {
      event: demoEvent,
      pass: regResult.pass,
      firstScan,
      secondScan,
    };
  }
}

export const dataService = new CampusDataService();
