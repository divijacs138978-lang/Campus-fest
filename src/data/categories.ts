import { EventCategory } from '../types';
import {
  Code2,
  Music2,
  Trophy,
  Wrench,
  Mic,
  Users2,
  LucideIcon,
} from 'lucide-react';
import {
  charTechImg,
  charCulturalImg,
  charSportsImg,
  charWorkshopImg,
  charSeminarImg,
  charClubDriveImg,
} from '../assets/characters';

export interface CategoryInfo {
  id: EventCategory;
  displayName: string;
  tagline: string;
  description: string;
  whatToExpect: string[];
  typicalDuration: string;
  teamSize: string;
  accentColor: string;
  accentGlow: string;
  badgeBg: string;
  icon: LucideIcon;
  characterImg: string;
  characterTitle: string;
}

export const CAMPUS_CATEGORIES: CategoryInfo[] = [
  {
    id: 'Tech',
    displayName: 'Tech & Hackathons',
    tagline: 'Code the dawn, break systems, build the future',
    description:
      'Immersive coding marathons, algorithmic showdowns, and bleeding-edge prototype showcases. Gather your syndicate to build robust systems under pressure with mentorship from industry engineers.',
    whatToExpect: [
      '24-hour sprint environment with overnight fuel & caffeine',
      'Live code reviews & architectural mentorship',
      'Direct internship interviews with tech partners',
    ],
    typicalDuration: '24 — 36 Hours',
    teamSize: '2 — 4 Members',
    accentColor: '#38BDF8', // Cyan
    accentGlow: 'rgba(56, 189, 248, 0.3)',
    badgeBg: 'rgba(56, 189, 248, 0.12)',
    icon: Code2,
    characterImg: charTechImg,
    characterTitle: 'Cyber Architect',
  },
  {
    id: 'Cultural',
    displayName: 'Cultural & Performing Arts',
    tagline: 'Spotlights, thunderous chords, and pure expression',
    description:
      'Electrifying musical battle of the bands, classical & contemporary dance battles, dramatic theatre, and fine art showcases. Transform the amphitheatre stage into pure sensory spectacles.',
    whatToExpect: [
      'State-of-the-art concert acoustics and stage pyrotechnics',
      'Celebrity judges & talent scout invitations',
      'High-energy crowd of thousands cheering in the quad',
    ],
    typicalDuration: '3 — 6 Hours',
    teamSize: 'Solo or 5 — 12 Troupe',
    accentColor: '#E04A7B', // Crimson pink
    accentGlow: 'rgba(224, 74, 123, 0.35)',
    badgeBg: 'rgba(224, 74, 123, 0.12)',
    icon: Music2,
    characterImg: charCulturalImg,
    characterTitle: 'Maestro & Bard',
  },
  {
    id: 'Sports',
    displayName: 'Sports & Esports Arenas',
    tagline: 'Adrenaline on the turf, lightning in the arena',
    description:
      'High-stakes collegiate tournaments ranging from floodlit futsal and basketball to stadium gaming on 240Hz rigs. Test endurance, coordination, and clutch play against rival campuses.',
    whatToExpect: [
      'Professional referees and live sports telemetry',
      'Big-screen live spectator commentary and replay cameras',
      'Championship trophies, medals, and gear pool prizes',
    ],
    typicalDuration: '4 — 8 Hours',
    teamSize: '5 — 11 Athletes',
    accentColor: '#F59E0B', // Amber gold
    accentGlow: 'rgba(245, 158, 11, 0.3)',
    badgeBg: 'rgba(245, 158, 11, 0.12)',
    icon: Trophy,
    characterImg: charSportsImg,
    characterTitle: 'Field Champion',
  },
  {
    id: 'Workshop',
    displayName: 'Hands-on Workshops',
    tagline: 'Craft real artifacts with tools, solder, and circuits',
    description:
      'Masterclass maker labs where theoretical concepts turn into tactile hardware, robotics, design systems, and rapid prototyping. Leave with working devices and verified lab certifications.',
    whatToExpect: [
      'Individual maker kits and component kits provided',
      'Step-by-step guidance from master craftspeople',
      'Verified physical certificate of technical competence',
    ],
    typicalDuration: '3 — 5 Hours',
    teamSize: 'Individual / Pairs',
    accentColor: '#10B981', // Emerald
    accentGlow: 'rgba(16, 185, 129, 0.3)',
    badgeBg: 'rgba(16, 185, 129, 0.12)',
    icon: Wrench,
    characterImg: charWorkshopImg,
    characterTitle: 'Master Artisan',
  },
  {
    id: 'Seminar',
    displayName: 'Keynotes & Colloquia',
    tagline: 'Thought leadership, research debates, and career visions',
    description:
      'Distinguished guest lectures, fireside chats, and academic colloquia featuring leading researchers, founders, and policy makers exploring societal questions and future horizons.',
    whatToExpect: [
      'Open Q&A floor and interactive audience polling',
      'Executive networking mixer following the address',
      'Signed book distributions and research whitepapers',
    ],
    typicalDuration: '2 — 3 Hours',
    teamSize: 'Individual Attendee',
    accentColor: '#A855F7', // Purple
    accentGlow: 'rgba(168, 85, 247, 0.3)',
    badgeBg: 'rgba(168, 85, 247, 0.12)',
    icon: Mic,
    characterImg: charSeminarImg,
    characterTitle: 'Keynote Scholar',
  },
  {
    id: 'Club Drive',
    displayName: 'Club Recruitment Drives',
    tagline: 'Find your clan, ignite your passions, lead communities',
    description:
      'The university annual fraternity of student societies, technical chapters, literary circles, and social initiatives. Discover upcoming projects, audition, and register for active committee spots.',
    whatToExpect: [
      'Direct chats with current club presidents and leads',
      'Interactive booth games and welcome merchandise',
      'On-the-spot interviews and membership confirmations',
    ],
    typicalDuration: 'Full Day Festival',
    teamSize: 'Open to All Students',
    accentColor: '#E8D9B0', // Cream gold
    accentGlow: 'rgba(232, 217, 176, 0.35)',
    badgeBg: 'rgba(232, 217, 176, 0.12)',
    icon: Users2,
    characterImg: charClubDriveImg,
    characterTitle: 'Guild Herald',
  },
];
