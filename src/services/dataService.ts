/**
 * Single Unified Data Layer for FESTORA
 * Supports automatic localStorage fallback with migrations and undo/redo support.
 */

import {
  CampusEvent,
  CampusPass,
  ScanRecord,
  CampusFeedback,
  StudentProfile,
  OrganizerProfile,
  PassTemplateType,
  VolunteerApplication,
  StallRequest,
  SponsorPledge,
} from '../types';
import { generateProceduralCharacter, computeSeatLabel } from '../utils/proceduralCharacter';

const STORAGE_KEYS = {
  EVENTS: 'festora_events_v2',
  PASSES: 'festora_passes_v2',
  SCANS: 'festora_scans_v2',
  FEEDBACKS: 'festora_feedbacks_v2',
  VOLUNTEERS: 'festora_volunteers_v2',
  STALLS: 'festora_stalls_v2',
  SPONSORS: 'festora_sponsors_v2',
  STUDENT_SESSION: 'festora_student_session_v1',
  ORGANIZER_SESSION: 'festora_organizer_session_v1',
  FIREBASE_CONFIG: 'festora_firebase_config_v1',
};

// Legacy keys for seamless backwards-compatible migration
const LEGACY_STORAGE_KEYS = {
  EVENTS_V2: 'campus_post_events_v2',
  PASSES_V2: 'campus_post_passes_v2',
  SCANS_V2: 'campus_post_scans_v2',
  FEEDBACKS_V2: 'campus_post_feedbacks_v2',
  VOLUNTEERS_V2: 'campus_post_volunteers_v2',
  STALLS_V2: 'campus_post_stalls_v2',
  SPONSORS_V2: 'campus_post_sponsors_v2',
  STUDENT_SESSION: 'campus_post_student_session_v1',
  ORGANIZER_SESSION: 'campus_post_organizer_session_v1',
  EVENTS_V1: 'campus_post_events_v1',
  PASSES_V1: 'campus_post_passes_v1',
  SCANS_V1: 'campus_post_scans_v1',
  FEEDBACKS_V1: 'campus_post_feedbacks_v1',
};

// Character pool excluding confusing characters: O, 0, I, 1
const SAFE_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function generateEntryCode(existingCodes: Set<string>): string {
  let code = '';
  let attempts = 0;
  do {
    const p1 = Array.from({ length: 5 }, () => SAFE_CHARS[Math.floor(Math.random() * SAFE_CHARS.length)]).join('');
    code = `CF-2026-${p1}`;
    attempts++;
  } while (existingCodes.has(code) && attempts < 100);
  return code;
}

export const SEED_EVENTS: CampusEvent[] = [
  {
    id: 'ev-hackcampus-2026',
    title: 'HACKCAMPUS 2026: 24-HR HACKATHON',
    description:
      'The flagship inter-college 24-hr hackathon by IEEE Student Branch. Build high-impact solutions in AI, Climate Tech, and Campus Life. Midnight pizza, sponsor bounties, hardware kits, and $5,000 cash pool.',
    category: 'Tech',
    date: 'OCTOBER 17 — 18, 2026',
    dayLabel: 'SATURDAY',
    time: '09:00 AM',
    venue: 'Turing Innovation Hub, Block C',
    registrationDeadline: '2026-10-16T23:59:00Z',
    capacity: 200,
    registeredCount: 168,
    checkedInCount: 114,
    status: 'OPEN',
    posterColor: '#8E2A2A',
    organizerClub: 'IEEE Student Branch',
    organizerEmail: 'ieee@festora.edu',
    eligibilityYears: ['All Years'],
    eligibilityDepartments: ['All Departments'],
    tags: ['HACKATHON', 'PRIZES', '24-HOURS', 'TEAMS OF 2-4'],
    createdAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'ev-tarang-2026',
    title: 'TARANG 2026: ANNUAL CULTURAL NIGHT',
    description:
      'The premier annual cultural festival under the plum campus sky. 10 battle-of-the-bands finalists, classical & fusion dance troupes, celebrity guest performance, street food courtyard, and light showcase.',
    category: 'Cultural',
    date: 'OCTOBER 23, 2026',
    dayLabel: 'FRIDAY',
    time: '06:00 PM',
    venue: 'Grand Open Air Amphitheatre',
    registrationDeadline: '2026-10-23T16:00:00Z',
    capacity: 800,
    registeredCount: 0,
    checkedInCount: 0,
    status: 'OPEN',
    posterColor: '#5E1250',
    organizerClub: 'Cultural Committee',
    organizerEmail: 'culture@festora.edu',
    eligibilityYears: ['All Years'],
    eligibilityDepartments: ['All Departments'],
    tags: ['MUSIC', 'BANDS', 'DANCE', 'FOOD STALLS', 'NIGHT FEST'],
    createdAt: '2026-10-02T12:00:00Z',
  },
  {
    id: 'ev-llm-bootcamp',
    title: 'AI & LLM BOOTCAMP: HANDS-ON WORKSHOP',
    description:
      'Intensive laboratory session constructed by ACM Chapter. Build production AI agents, retrieval augmented pipelines, and streaming interactive apps. Bring laptops with Python 3.11+. Cloud GPU credits and certificates provided.',
    category: 'Workshop',
    date: 'OCTOBER 28, 2026',
    dayLabel: 'WEDNESDAY',
    time: '02:00 PM',
    venue: 'Computing Lab 4, Tech Tower',
    registrationDeadline: '2026-10-27T18:00:00Z',
    capacity: 80,
    registeredCount: 0,
    checkedInCount: 0,
    status: 'OPEN',
    posterColor: '#5B7A3A',
    organizerClub: 'ACM Chapter',
    organizerEmail: 'acm@festora.edu',
    eligibilityYears: ['2nd Year', '3rd Year', '4th Year'],
    eligibilityDepartments: ['CSE', 'IT', 'ECE', 'Data Science'],
    tags: ['CERTIFIED', 'HANDS-ON', 'GPU LAB', 'BEGINNER FRIENDLY'],
    createdAt: '2026-10-03T15:00:00Z',
  },
  {
    id: 'ev-futsal-cup',
    title: 'INTER-DEPT FUTSAL CUP 2026',
    description:
      'High-octane 5v5 department championship tournament organized by Sports Council. Knockout bracket format, golden goal extra time, live commentary, sports refreshments, and official university rolling trophy.',
    category: 'Sports',
    date: 'NOVEMBER 04, 2026',
    dayLabel: 'WEDNESDAY',
    time: '04:30 PM',
    venue: 'Campus Sports Arena & Turf',
    registrationDeadline: '2026-11-03T20:00:00Z',
    capacity: 128,
    registeredCount: 0,
    checkedInCount: 0,
    status: 'OPEN',
    posterColor: '#A98258',
    organizerClub: 'Sports Council',
    organizerEmail: 'sports@festora.edu',
    eligibilityYears: ['All Years'],
    eligibilityDepartments: ['All Departments'],
    tags: ['5V5', 'TOURNAMENT', 'TROPHY', 'INTER-DEPT'],
    createdAt: '2026-10-04T09:00:00Z',
  },
  {
    id: 'ev-quantum-seminar',
    title: 'FUTURE HORIZONS: QUANTUM & GENERATIVE TECH',
    description:
      'Distinguished university colloquium exploring topological quantum circuits and synthetic intelligence architectures. Fireside address with keynote scholars, research paper giveaways, and open Q&A.',
    category: 'Seminar',
    date: 'NOVEMBER 14, 2026',
    dayLabel: 'SATURDAY',
    time: '11:00 AM',
    venue: 'University Central Auditorium',
    registrationDeadline: '2026-11-13T18:00:00Z',
    capacity: 250,
    registeredCount: 0,
    checkedInCount: 0,
    status: 'OPEN',
    posterColor: '#4A154B',
    organizerClub: 'Academic Colloquia Forum',
    organizerEmail: 'colloquia@festora.edu',
    eligibilityYears: ['All Years'],
    eligibilityDepartments: ['All Departments'],
    tags: ['QUANTUM', 'KEYNOTE', 'RESEARCH', 'CERTIFICATE'],
    createdAt: '2026-10-06T09:00:00Z',
  },
  {
    id: 'ev-robotics-drive',
    title: 'ROBOTICS CLUB ANNUAL RECRUITMENT',
    description:
      'Join the university robotics team building autonomous rovers, combat bots, and IoT aerial drones. Live hardware demonstrations, track walk, aptitude challenge, and direct interview recruitment drive.',
    category: 'Club Drive',
    date: 'NOVEMBER 10, 2026',
    dayLabel: 'TUESDAY',
    time: '03:00 PM',
    venue: 'Mechatronics Workshop & Arena',
    registrationDeadline: '2026-11-09T22:00:00Z',
    capacity: 150,
    registeredCount: 0,
    checkedInCount: 0,
    status: 'OPEN',
    posterColor: '#2A1A14',
    organizerClub: 'Robotics Club',
    organizerEmail: 'robotics@festora.edu',
    eligibilityYears: ['1st Year', '2nd Year', '3rd Year'],
    eligibilityDepartments: ['Mechanical', 'CSE', 'ECE', 'Electrical'],
    tags: ['ROVERS', 'COMBAT BOTS', 'DRONES', 'CORE TEAM'],
    createdAt: '2026-10-05T11:00:00Z',
  },
];

export const SEED_PASSES: CampusPass[] = [];

export const SEED_SCANS: ScanRecord[] = [];

export const SEED_FEEDBACKS: CampusFeedback[] = [];

export const SEED_VOLUNTEERS: VolunteerApplication[] = [
  {
    id: 'vol-1',
    name: 'Ishaan Deshpande',
    collegeEmail: 'ishaan.d@festora.edu',
    phone: '+91 98234 11223',
    department: 'Computer Science',
    year: '3rd Year',
    eventIds: ['ev-hackcampus-2026'],
    roles: ['QR scanning', 'tech support'],
    availability: ['Oct 17 Morning', 'Oct 17 Night Shift', 'Oct 18 Closing'],
    tshirtSize: 'L',
    pastExperience: 'Core volunteer at HackCampus; handled badge scanners for participants.',
    emergencyContact: '+91 98220 99881 (Parent)',
    status: 'Approved',
    assignedShifts: ['Gate Scanner Shift A (08:30 — 12:30)', 'Server Room Liaison (20:00 — 02:00)'],
    badgeCode: 'CF-VOL-0182',
    submittedAt: '2026-10-06T10:00:00Z',
  },
  {
    id: 'vol-2',
    name: 'Mira Rajput',
    collegeEmail: 'mira.r@festora.edu',
    phone: '+91 98111 22334',
    department: 'Information Technology',
    year: '2nd Year',
    eventIds: ['ev-tarang-2026', 'ev-quantum-seminar'],
    roles: ['hospitality', 'stage management'],
    availability: ['Oct 23 Evening', 'Nov 14 Morning'],
    tshirtSize: 'M',
    pastExperience: 'Stage coordinator for campus cultural events.',
    emergencyContact: '+91 98110 55667 (Family)',
    status: 'Pending',
    badgeCode: 'CF-VOL-0294',
    submittedAt: '2026-10-07T14:30:00Z',
  },
];

export const SEED_STALLS: StallRequest[] = [
  {
    id: 'stall-1',
    businessName: 'The Alchemist Artisan Cafe',
    ownerName: 'Kabir & Sanya Mehta',
    contactEmail: 'kabir@alchemistcafe.in',
    contactPhone: '+91 99887 66554',
    stallType: 'food',
    eventId: 'ev-tarang-2026',
    spaceNeeded: 'medium',
    powerWaterNeeds: '2x 15A Power Outlets for Espresso Machine & Filtered Water Access',
    itemsSold: 'Cold brew, hazelnut latte, gourmet sourdough toasties, cinnamon cruffins',
    priceRange: '₹80 — ₹220',
    licenseId: 'FSSAI-2289410098',
    setupTime: '2 hours prior to gate opening (04:00 PM)',
    status: 'Approved',
    allottedPlot: 'FC-03 (Food Court Quad)',
    submittedAt: '2026-10-06T11:00:00Z',
  },
  {
    id: 'stall-2',
    businessName: 'CyberCrafters 3D & Anime Merch',
    ownerName: 'Tarun Joshi',
    contactEmail: 'tarun@cybercrafters.store',
    contactPhone: '+91 98711 00998',
    stallType: 'merchandise',
    eventId: 'ev-hackcampus-2026',
    spaceNeeded: 'small',
    powerWaterNeeds: '1x 5A Socket for LED display stand and card terminal',
    itemsSold: 'Custom resin keycaps, cyber pins, hacker stickers, mini 3D printed mascots',
    priceRange: '₹50 — ₹350',
    licenseId: 'MSME-UDYAM-98442',
    setupTime: '1 hour prior (08:00 AM)',
    status: 'Pending',
    submittedAt: '2026-10-07T09:15:00Z',
  },
];

export const SEED_SPONSORS: SponsorPledge[] = [
  {
    id: 'sp-1',
    companyName: 'Hyperion Cloud Technologies',
    contactPerson: 'Vikramaditya Nair',
    email: 'vikram@hyperioncloud.io',
    phone: '+91 99000 88776',
    eventIds: ['ev-hackcampus-2026'],
    kind: 'Title',
    amountOrItem: '$3,500 Cloud Credits + ₹1,00,000 Cash Prize Pool for AI Category',
    returnsWanted: ['logo on pass', 'banner', 'stage mention'],
    status: 'Approved',
    pledgedAt: '2026-10-05T12:00:00Z',
  },
  {
    id: 'sp-2',
    companyName: 'Red Bull Energy Ventures',
    contactPerson: 'Zoya Khan',
    email: 'zoya.khan@redbull.com',
    phone: '+91 98999 12345',
    eventIds: ['ev-hackcampus-2026', 'ev-futsal-cup'],
    kind: 'Food & Beverage',
    amountOrItem: '800 Cans of Energy Drink + Chillers & DJ Deck Support',
    returnsWanted: ['banner', 'stall'],
    status: 'Pending',
    pledgedAt: '2026-10-07T16:45:00Z',
  },
];

class CampusDataService {
  private events: CampusEvent[] = [];
  private passes: CampusPass[] = [];
  private scans: ScanRecord[] = [];
  private feedbacks: CampusFeedback[] = [];
  private volunteers: VolunteerApplication[] = [];
  private stalls: StallRequest[] = [];
  private sponsors: SponsorPledge[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      // 1. Load Events (with migration from legacy keys)
      let rawEvents =
        localStorage.getItem(STORAGE_KEYS.EVENTS) ||
        localStorage.getItem(LEGACY_STORAGE_KEYS.EVENTS_V2) ||
        localStorage.getItem(LEGACY_STORAGE_KEYS.EVENTS_V1);
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
      }
      this.saveEvents();

      // 2. Load Passes (with seatLabel and characterTraits migration)
      let rawPasses =
        localStorage.getItem(STORAGE_KEYS.PASSES) ||
        localStorage.getItem(LEGACY_STORAGE_KEYS.PASSES_V2) ||
        localStorage.getItem(LEGACY_STORAGE_KEYS.PASSES_V1);
      if (rawPasses) {
        const parsed: CampusPass[] = JSON.parse(rawPasses);
        for (const sp of SEED_PASSES) {
          if (!parsed.some((p: CampusPass) => p.id === sp.id)) {
            parsed.push(sp);
          }
        }
        // Migration: ensure every pass has seatLabel and characterTraits
        this.passes = parsed.map((p, idx) => ({
          ...p,
          seatLabel: p.seatLabel || computeSeatLabel(p.seatNo || idx + 1),
          characterTraits: p.characterTraits || generateProceduralCharacter(p.code),
        }));
      } else {
        this.passes = JSON.parse(JSON.stringify(SEED_PASSES));
      }
      this.savePasses();

      // 3. Load Scans
      let rawScans =
        localStorage.getItem(STORAGE_KEYS.SCANS) ||
        localStorage.getItem(LEGACY_STORAGE_KEYS.SCANS_V2) ||
        localStorage.getItem(LEGACY_STORAGE_KEYS.SCANS_V1);
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
      }
      this.saveScans();

      // 4. Load Feedbacks
      let rawFeedbacks =
        localStorage.getItem(STORAGE_KEYS.FEEDBACKS) ||
        localStorage.getItem(LEGACY_STORAGE_KEYS.FEEDBACKS_V2) ||
        localStorage.getItem(LEGACY_STORAGE_KEYS.FEEDBACKS_V1);
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
      }
      this.saveFeedbacks();

      // 5. Load Volunteers
      const rawVols =
        localStorage.getItem(STORAGE_KEYS.VOLUNTEERS) ||
        localStorage.getItem(LEGACY_STORAGE_KEYS.VOLUNTEERS_V2);
      if (rawVols) {
        const parsed = JSON.parse(rawVols);
        for (const sv of SEED_VOLUNTEERS) {
          if (!parsed.some((v: VolunteerApplication) => v.id === sv.id)) {
            parsed.push(sv);
          }
        }
        this.volunteers = parsed;
      } else {
        this.volunteers = JSON.parse(JSON.stringify(SEED_VOLUNTEERS));
      }
      this.saveVolunteers();

      // 6. Load Stalls
      const rawStalls =
        localStorage.getItem(STORAGE_KEYS.STALLS) ||
        localStorage.getItem(LEGACY_STORAGE_KEYS.STALLS_V2);
      if (rawStalls) {
        const parsed = JSON.parse(rawStalls);
        for (const ss of SEED_STALLS) {
          if (!parsed.some((s: StallRequest) => s.id === ss.id)) {
            parsed.push(ss);
          }
        }
        this.stalls = parsed;
      } else {
        this.stalls = JSON.parse(JSON.stringify(SEED_STALLS));
      }
      this.saveStalls();

      // 7. Load Sponsors
      const rawSponsors =
        localStorage.getItem(STORAGE_KEYS.SPONSORS) ||
        localStorage.getItem(LEGACY_STORAGE_KEYS.SPONSORS_V2);
      if (rawSponsors) {
        const parsed = JSON.parse(rawSponsors);
        for (const sp of SEED_SPONSORS) {
          if (!parsed.some((s: SponsorPledge) => s.id === sp.id)) {
            parsed.push(sp);
          }
        }
        this.sponsors = parsed;
      } else {
        this.sponsors = JSON.parse(JSON.stringify(SEED_SPONSORS));
      }
      this.saveSponsors();
    } catch {
      this.events = JSON.parse(JSON.stringify(SEED_EVENTS));
      this.passes = JSON.parse(JSON.stringify(SEED_PASSES));
      this.scans = JSON.parse(JSON.stringify(SEED_SCANS));
      this.feedbacks = JSON.parse(JSON.stringify(SEED_FEEDBACKS));
      this.volunteers = JSON.parse(JSON.stringify(SEED_VOLUNTEERS));
      this.stalls = JSON.parse(JSON.stringify(SEED_STALLS));
      this.sponsors = JSON.parse(JSON.stringify(SEED_SPONSORS));
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

  private saveVolunteers() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(this.volunteers));
    }
  }

  private saveStalls() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.STALLS, JSON.stringify(this.stalls));
    }
  }

  private saveSponsors() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SPONSORS, JSON.stringify(this.sponsors));
    }
  }

  // --- Session & Profiles ---
  getStudentSession(): StudentProfile | null {
    if (typeof window === 'undefined') return null;
    const raw =
      localStorage.getItem(STORAGE_KEYS.STUDENT_SESSION) ||
      localStorage.getItem(LEGACY_STORAGE_KEYS.STUDENT_SESSION);
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
    const raw =
      localStorage.getItem(STORAGE_KEYS.ORGANIZER_SESSION) ||
      localStorage.getItem(LEGACY_STORAGE_KEYS.ORGANIZER_SESSION);
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

  saveEvent(
    eventData: Omit<CampusEvent, 'id' | 'registeredCount' | 'checkedInCount' | 'createdAt'> & { id?: string }
  ): CampusEvent {
    if (eventData.id) {
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

  setEvents(events: CampusEvent[]) {
    this.events = [...events];
    this.saveEvents();
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

    if (event.registeredCount >= event.capacity) {
      return { success: false, error: 'Sorry, this event is already House Full.' };
    }

    const deadline = new Date(event.registrationDeadline).getTime();
    if (!isNaN(deadline) && Date.now() > deadline) {
      return { success: false, error: 'Registrations closed. The deadline has passed.' };
    }

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

    const existingCodes = new Set(this.passes.map((p) => p.code));
    const code = generateEntryCode(existingCodes);

    const templates: PassTemplateType[] = ['campus_id', 'ticket_stub', 'telegram', 'city_poster'];
    const chosenTemplate: PassTemplateType =
      params.template || templates[Math.floor(Math.random() * templates.length)];

    const seatNo = event.registeredCount + 1;
    const seatLabel = computeSeatLabel(seatNo);
    const characterTraits = generateProceduralCharacter(code);

    const newPass: CampusPass = {
      id: `pass-${Date.now()}`,
      code,
      regId: code,
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
      seatNo,
      seatLabel,
      characterTraits,
    };

    this.passes.unshift(newPass);
    this.savePasses();

    event.registeredCount += 1;
    if (event.registeredCount >= event.capacity) {
      event.status = 'FULL';
    }
    this.saveEvents();

    return { success: true, pass: newPass };
  }

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

  assignSeat(passId: string, seatLabel: string): boolean {
    const pass = this.passes.find((p) => p.id === passId);
    if (!pass) return false;
    pass.seatLabel = seatLabel;
    this.savePasses();
    return true;
  }

  updatePassAvatar(passId: string, avatarUrl: string): boolean {
    const pass = this.passes.find((p) => p.id === passId);
    if (!pass || !pass.characterTraits) return false;
    pass.characterTraits.avatarUrl = avatarUrl;
    this.savePasses();
    return true;
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

  setPasses(passes: CampusPass[]) {
    this.passes = [...passes];
    this.savePasses();
  }

  // --- Guarded Atomic Check-In Logic ---
  checkInCode(
    code: string,
    targetEventId?: string
  ): {
    status: 'VALID' | 'DUPLICATE' | 'INVALID';
    pass?: CampusPass;
    message: string;
    checkInTime?: string;
  } {
    const cleanCode = code.trim().toUpperCase();
    const timeNow = new Date().toLocaleTimeString();

    const targetPass = this.passes.find(
      (p) =>
        p.code.toUpperCase() === cleanCode ||
        (p.regId && p.regId.toUpperCase() === cleanCode) ||
        p.id.toUpperCase() === cleanCode ||
        p.code.replace(/-/g, '').toUpperCase() === cleanCode.replace(/-/g, '')
    );

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

  undoCheckIn(codeOrPassId: string): boolean {
    const clean = codeOrPassId.trim().toUpperCase();
    const pass = this.passes.find(
      (p) => p.id === codeOrPassId || p.code.toUpperCase() === clean
    );
    if (!pass || !pass.checkedIn) return false;

    pass.checkedIn = false;
    pass.checkedInAt = undefined;
    this.savePasses();

    const ev = this.events.find((e) => e.id === pass.eventId);
    if (ev) {
      ev.checkedInCount = Math.max(0, ev.checkedInCount - 1);
      this.saveEvents();
    }
    return true;
  }

  getScans(): ScanRecord[] {
    return [...this.scans];
  }

  // --- Feedback ---
  submitFeedback(fb: Omit<CampusFeedback, 'id' | 'submittedAt'>): {
    success: boolean;
    feedback?: CampusFeedback;
    error?: string;
  } {
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

  // --- Volunteers CRUD ---
  getVolunteerApplications(): VolunteerApplication[] {
    return [...this.volunteers];
  }

  submitVolunteerApplication(
    app: Omit<VolunteerApplication, 'id' | 'status' | 'badgeCode' | 'submittedAt'>
  ): VolunteerApplication {
    const badgeNumber = Math.floor(1000 + Math.random() * 9000);
    const newApp: VolunteerApplication = {
      ...app,
      id: `vol-${Date.now()}`,
      status: 'Pending',
      badgeCode: `CF-VOL-${badgeNumber}`,
      submittedAt: new Date().toISOString(),
    };
    this.volunteers.unshift(newApp);
    this.saveVolunteers();
    return newApp;
  }

  updateVolunteerStatus(
    id: string,
    status: 'Pending' | 'Approved' | 'Rejected',
    assignedShifts?: string[]
  ): boolean {
    const app = this.volunteers.find((v) => v.id === id);
    if (!app) return false;
    app.status = status;
    if (assignedShifts) app.assignedShifts = assignedShifts;
    this.saveVolunteers();
    return true;
  }

  setVolunteerApplications(apps: VolunteerApplication[]) {
    this.volunteers = [...apps];
    this.saveVolunteers();
  }

  // --- Stalls CRUD ---
  getStallRequests(): StallRequest[] {
    return [...this.stalls];
  }

  submitStallRequest(
    req: Omit<StallRequest, 'id' | 'status' | 'submittedAt'>
  ): StallRequest {
    const newReq: StallRequest = {
      ...req,
      id: `stall-${Date.now()}`,
      status: 'Pending',
      submittedAt: new Date().toISOString(),
    };
    this.stalls.unshift(newReq);
    this.saveStalls();
    return newReq;
  }

  updateStallStatus(
    id: string,
    status: 'Pending' | 'Approved' | 'Rejected',
    allottedPlot?: string
  ): boolean {
    const s = this.stalls.find((x) => x.id === id);
    if (!s) return false;
    s.status = status;
    if (allottedPlot !== undefined) s.allottedPlot = allottedPlot;
    this.saveStalls();
    return true;
  }

  setStallRequests(reqs: StallRequest[]) {
    this.stalls = [...reqs];
    this.saveStalls();
  }

  // --- Sponsors CRUD ---
  getSponsorPledges(): SponsorPledge[] {
    return [...this.sponsors];
  }

  submitSponsorPledge(
    pledge: Omit<SponsorPledge, 'id' | 'status' | 'pledgedAt'>
  ): SponsorPledge {
    const newPledge: SponsorPledge = {
      ...pledge,
      id: `sp-${Date.now()}`,
      status: 'Pending',
      pledgedAt: new Date().toISOString(),
    };
    this.sponsors.unshift(newPledge);
    this.saveSponsors();
    return newPledge;
  }

  updateSponsorStatus(
    id: string,
    status: 'Pending' | 'Approved' | 'Rejected'
  ): boolean {
    const sp = this.sponsors.find((x) => x.id === id);
    if (!sp) return false;
    sp.status = status;
    this.saveSponsors();
    return true;
  }

  setSponsorPledges(pledges: SponsorPledge[]) {
    this.sponsors = [...pledges];
    this.saveSponsors();
  }

  // --- Reset & Demo Scenarios ---
  resetToDemoSeed() {
    this.events = JSON.parse(JSON.stringify(SEED_EVENTS));
    this.passes = JSON.parse(JSON.stringify(SEED_PASSES));
    this.scans = JSON.parse(JSON.stringify(SEED_SCANS));
    this.feedbacks = JSON.parse(JSON.stringify(SEED_FEEDBACKS));
    this.volunteers = JSON.parse(JSON.stringify(SEED_VOLUNTEERS));
    this.stalls = JSON.parse(JSON.stringify(SEED_STALLS));
    this.sponsors = JSON.parse(JSON.stringify(SEED_SPONSORS));
    this.saveEvents();
    this.savePasses();
    this.saveScans();
    this.saveFeedbacks();
    this.saveVolunteers();
    this.saveStalls();
    this.saveSponsors();
  }
}

export const dataService = new CampusDataService();
