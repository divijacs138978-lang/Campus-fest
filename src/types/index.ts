export type EventCategory =
  | 'Tech'
  | 'Cultural'
  | 'Sports'
  | 'Workshop'
  | 'Seminar'
  | 'Club Drive';

export type EventStatus = 'OPEN' | 'FULL' | 'LIVE' | 'ENDED' | 'CLOSED';

export type PassTemplateType = 'campus_id' | 'ticket_stub' | 'telegram' | 'city_poster';

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
  code: string; // CP-XXXX-XXXX
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

export type ActiveRole = 'landing' | 'student' | 'organizer';
