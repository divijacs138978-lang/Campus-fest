export type EventCategory =
  | 'Tech'
  | 'Cultural'
  | 'Sports'
  | 'Workshop'
  | 'Seminar'
  | 'Club Drive';

export type EventStatus = 'OPEN' | 'FULL' | 'LIVE' | 'ENDED' | 'CLOSED';

export type PassTemplateType = 'campus_id' | 'ticket_stub' | 'telegram' | 'city_poster';

export interface ParticipantCharacterTraits {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  outfitColor: string;
  accessory: string;
  expression: string;
  glowColor: string;
  traitSignature: string;
  avatarUrl?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  collegeEmail: string;
  rollNumber: string;
  department: string;
  year: string;
  phone: string;
}

export interface OrganizerProfile {
  id: string;
  name: string;
  clubName: string;
  collegeEmail: string;
  pin: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  dayLabel: string;
  time: string;
  venue: string;
  registrationDeadline: string;
  capacity: number;
  registeredCount: number;
  checkedInCount: number;
  status: EventStatus;
  posterColor: string;
  organizerClub: string;
  organizerEmail: string;
  eligibilityYears: string[];
  eligibilityDepartments: string[];
  tags: string[];
  createdAt: string;
}

export interface CampusPass {
  id: string;
  code: string; // CF-2026-X7K9P
  regId?: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  studentName: string;
  studentRollNumber: string;
  studentEmail: string;
  studentDepartment: string;
  studentYear: string;
  studentPhone: string;
  teamName?: string;
  tshirtSize?: string;
  template: PassTemplateType;
  registeredAt: string;
  checkedIn: boolean;
  checkedInAt?: string;
  seatNo: number;
  seatLabel?: string; // e.g. "C7"
  characterTraits?: ParticipantCharacterTraits;
}

export interface ScanRecord {
  id: string;
  code: string;
  eventId?: string;
  studentName: string;
  studentRollNumber: string;
  studentDepartment: string;
  timestamp: string;
  status: 'VALID' | 'DUPLICATE' | 'INVALID';
  message: string;
}

export interface CampusFeedback {
  id: string;
  eventId: string;
  eventTitle: string;
  participantCode: string;
  studentName: string;
  isAnonymous: boolean;
  overallRating: number;
  organizationRating: number;
  contentRating: number;
  venueRating: number;
  luggageTags: string[];
  enjoyedText: string;
  improveText: string;
  recommend: 'Yes' | 'Maybe' | 'No';
  submittedAt: string;
}

// --- Volunteer Application ---
export type VolunteerRoleType =
  | 'registration desk'
  | 'QR scanning'
  | 'stage management'
  | 'hospitality'
  | 'photography'
  | 'crowd control'
  | 'tech support';

export interface VolunteerApplication {
  id: string;
  name: string;
  collegeEmail: string;
  phone: string;
  department: string;
  year: string;
  eventIds: string[];
  roles: string[];
  availability: string[];
  tshirtSize: string;
  pastExperience: string;
  emergencyContact: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  assignedShifts?: string[];
  badgeCode: string; // CF-VOL-XXXX
  submittedAt: string;
}

// --- Stall Owner Request ---
export type StallType =
  | 'food'
  | 'merchandise'
  | 'games'
  | 'art/craft'
  | 'tech demo'
  | 'NGO'
  | 'other';

export type StallSpace = 'small' | 'medium' | 'large';

export interface StallRequest {
  id: string;
  businessName: string;
  ownerName: string;
  contactEmail: string;
  contactPhone: string;
  stallType: StallType;
  eventId: string;
  spaceNeeded: StallSpace;
  powerWaterNeeds: string;
  itemsSold: string;
  priceRange: string;
  licenseId: string;
  setupTime: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  allottedPlot?: string;
  submittedAt: string;
}

// --- Sponsor Pledge ---
export type SponsorshipKind =
  | 'Title'
  | 'Gold'
  | 'Silver'
  | 'Bronze'
  | 'Food & Beverage'
  | 'Prize/Gifts'
  | 'Venue/Equipment'
  | 'Media/Marketing'
  | 'Scholarship/CSR'
  | 'In-kind';

export interface SponsorPledge {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  eventIds: string[];
  kind: SponsorshipKind;
  amountOrItem: string;
  logoDataUrl?: string;
  returnsWanted: string[]; // 'logo on pass', 'banner', 'stage mention', 'stall'
  status: 'Pending' | 'Approved' | 'Rejected';
  pledgedAt: string;
}

export type ActiveRole =
  | 'gate'
  | 'landing'
  | 'student'
  | 'organizer'
  | 'trail'
  | 'other'
  | 'volunteer'
  | 'stall'
  | 'sponsor';
