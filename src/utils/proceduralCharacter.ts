import { ParticipantCharacterTraits } from '../types';

const SKIN_TONES = ['#FFDBB4', '#F1C27D', '#E0AC69', '#C68642', '#8D5524'];
const HAIR_STYLES = ['curly-fade', 'anime-spikes', 'wavy-shoulder', 'side-part', 'high-ponytail', 'sleek-bob'];
const HAIR_COLORS = ['#18181B', '#3F2213', '#713F12', '#991B1B', '#1E3A8A', '#701A75'];
const OUTFIT_COLORS = ['#B3345C', '#1B2257', '#0F766E', '#D97706', '#6D28D9', '#047857'];
const ACCESSORIES = [
  'Round Gold Glasses',
  'Cyber Headset',
  'Campus Scarf',
  'Star Earring',
  'Audio Monitors',
  'Golden Crest Pin',
];
const EXPRESSIONS = ['Warm Smile', 'Confident Grin', 'Bright Eyes', 'Playful Smirk', 'Focused'];
const GLOW_COLORS = [
  'rgba(224, 74, 123, 0.45)', // Crimson glow
  'rgba(56, 189, 248, 0.45)',  // Cyan glow
  'rgba(245, 158, 11, 0.45)',  // Amber glow
  'rgba(168, 85, 247, 0.45)',  // Violet glow
  'rgba(16, 185, 129, 0.45)',  // Emerald glow
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateProceduralCharacter(seedStr: string): ParticipantCharacterTraits {
  const hash = hashString(seedStr || 'CAMPUS-HERO');

  const skinTone = SKIN_TONES[hash % SKIN_TONES.length];
  const hairStyle = HAIR_STYLES[(hash >> 2) % HAIR_STYLES.length];
  const hairColor = HAIR_COLORS[(hash >> 4) % HAIR_COLORS.length];
  const outfitColor = OUTFIT_COLORS[(hash >> 6) % OUTFIT_COLORS.length];
  const accessory = ACCESSORIES[(hash >> 8) % ACCESSORIES.length];
  const expression = EXPRESSIONS[(hash >> 10) % EXPRESSIONS.length];
  const glowColor = GLOW_COLORS[(hash >> 12) % GLOW_COLORS.length];

  const traitSignature = `${hairStyle}-${skinTone.slice(1)}-${hairColor.slice(1)}-${accessory.replace(/\s+/g, '')}`;

  return {
    skinTone,
    hairStyle,
    hairColor,
    outfitColor,
    accessory,
    expression,
    glowColor,
    traitSignature,
  };
}

export function computeSeatLabel(seatIndex: number): string {
  if (!seatIndex || seatIndex < 1) seatIndex = 1;
  const SEATS_PER_ROW = 12;
  const rowIndex = Math.floor((seatIndex - 1) / SEATS_PER_ROW);
  const seatNum = ((seatIndex - 1) % SEATS_PER_ROW) + 1;
  const rowLetter = String.fromCharCode(65 + (rowIndex % 26)); // A, B, C...
  return `${rowLetter}${seatNum}`;
}
