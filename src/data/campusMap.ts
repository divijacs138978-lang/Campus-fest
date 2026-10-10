// Replace with the real campus layout
/**
 * Campus Trail Map Configuration
 * Defines stops, graph edges (distances in meters), stall plots, stall details,
 * and navigation algorithms for the interactive vertical road-map trail.
 */

export type StopKind = 'gate' | 'event-venue' | 'stall-zone' | 'facility' | 'finale';
export type StopSide = 'left' | 'right';

export interface CampusStop {
  id: string;
  name: string;
  subtitle: string;
  kind: StopKind;
  x: number; // SVG coordinates in 390 x 1400 viewBox
  y: number; // Ordered from bottom (high y, ~1280) to top (low y, ~120)
  roadX: number; // Waypoint on the central road
  side: StopSide;
  icon: string;
  aliases: string[];
  description: string;
}

export interface MapEdge {
  from: string;
  to: string;
  distanceMetres: number;
}

export interface StallPlot {
  plotId: string;
  zoneId: string;
  label: string;
}

export interface CampusStall {
  id: string;
  name: string;
  plotId: string;
  zoneId: string;
  category: 'Food' | 'Merch' | 'Games' | 'Art' | 'Club';
  typeLabel: string;
  hygieneRating: 'A+' | 'A' | 'B+';
  isVeg?: boolean;
  isNonVeg?: boolean;
  specialty: string;
  pricing: string;
  openingHours: string;
  leadStudent: string;
}

export const CAMPUS_STOPS: CampusStop[] = [
  {
    id: 'stop-main-gate',
    name: 'Main Gate & Welcome Desk',
    subtitle: 'Campus Entrance & Registration Helpdesk',
    kind: 'gate',
    x: 95,
    y: 1300,
    roadX: 195,
    side: 'left',
    icon: 'gate',
    aliases: ['main gate', 'entrance', 'gate 1', 'reception', 'welcome desk'],
    description: 'The ceremonial main archway, ticket verification desk, info marquee, and shuttle drop-off point.',
  },
  {
    id: 'stop-parking',
    name: 'North Parking & Transit Hub',
    subtitle: 'Visitor Bays, Cycle Stands & EV Charging',
    kind: 'facility',
    x: 295,
    y: 1180,
    roadX: 195,
    side: 'right',
    icon: 'parking',
    aliases: ['parking', 'north parking', 'transit', 'cycle stand', 'cab drop'],
    description: 'Designated parking for 400 two-wheelers, 120 cars, and the electric campus tram terminal.',
  },
  {
    id: 'stop-admin-block',
    name: 'Administration Quad & Helpdesk',
    subtitle: 'Central Office & Lost & Found',
    kind: 'facility',
    x: 90,
    y: 1040,
    roadX: 200,
    side: 'left',
    icon: 'building',
    aliases: ['admin', 'admin block', 'administration', 'principal office', 'lost and found'],
    description: 'Historic colonial red-brick quad. Emergency faculty desk, lost & found post, and festival passes backup desk.',
  },
  {
    id: 'stop-turing-hub',
    name: 'Turing Innovation Hub (Block C)',
    subtitle: 'Hackathon Arena & Code Den',
    kind: 'event-venue',
    x: 300,
    y: 910,
    roadX: 190,
    side: 'right',
    icon: 'code',
    aliases: ['turing innovation hub, block c', 'turing hub', 'block c', 'hackathon arena', 'cs department'],
    description: 'Home of HACKCAMPUS 2026! High-speed gigabit Wi-Fi, hardware tinker stations, 24-hour power backup, and nap beanbags.',
  },
  {
    id: 'stop-food-court',
    name: 'Grand Courtyard Food Court',
    subtitle: '12 Curated Artisan Food Stalls',
    kind: 'stall-zone',
    x: 88,
    y: 770,
    roadX: 200,
    side: 'left',
    icon: 'utensils',
    aliases: ['food court', 'canteen', 'food stalls', 'cafeteria', 'courtyard food', 'biryani'],
    description: 'Vibrant street-food bazaar with seating for 350. Authentic biryani, woodfire pizzas, bubble tea, and ice rolls.',
  },
  {
    id: 'stop-merch-lane',
    name: 'Merch Lane & Art Alley',
    subtitle: 'Student Prints, T-Shirts & Zines',
    kind: 'stall-zone',
    x: 302,
    y: 630,
    roadX: 192,
    side: 'right',
    icon: 'shopping-bag',
    aliases: ['merch lane', 'art alley', 'craft stalls', 'stickers', 'souvenirs', 'merchandise'],
    description: 'Custom screen-printed festival hoodies, anime badges, student hand-crafted zines, vintage vinyl, and poster art.',
  },
  {
    id: 'stop-tech-tower',
    name: 'Tech Tower & Computing Lab 4',
    subtitle: 'AI, LLM & Robotics Laboratories',
    kind: 'event-venue',
    x: 92,
    y: 500,
    roadX: 198,
    side: 'left',
    icon: 'cpu',
    aliases: ['computing lab 4, tech tower', 'tech tower', 'computing lab 4', 'lab 4', 'acm lab'],
    description: 'Air-conditioned workstation lab with dual-monitor rigs, RTX 4090 servers, and ACM workshop lecture theater.',
  },
  {
    id: 'stop-games-arena',
    name: 'Sports Arena & Games Turf',
    subtitle: 'Futsal Turf, Table Tennis & VR Box',
    kind: 'event-venue',
    x: 300,
    y: 370,
    roadX: 195,
    side: 'right',
    icon: 'trophy',
    aliases: ['campus sports arena & turf', 'sports arena', 'futsal turf', 'games arena', 'sports complex'],
    description: 'Floodlit artificial turf court, spectators bleachers, commentator booth, and energy hydration station.',
  },
  {
    id: 'stop-workshop-arena',
    name: 'Mechatronics Workshop & Arena',
    subtitle: 'RoboWars Pit & Maker Garage',
    kind: 'event-venue',
    x: 95,
    y: 240,
    roadX: 198,
    side: 'left',
    icon: 'wrench',
    aliases: ['mechatronics workshop & arena', 'mechatronics', 'robotics arena', 'workshop labs', 'maker space'],
    description: 'Heavy machinery safety zone, drone flight enclosure, combat robot plexiglass arena, and 3D printing farm.',
  },
  {
    id: 'stop-grand-amphitheatre',
    name: 'Grand Open Air Amphitheatre',
    subtitle: 'Main Stage & Star Night Finale',
    kind: 'finale',
    x: 195,
    y: 110,
    roadX: 195,
    side: 'left',
    icon: 'star',
    aliases: ['grand open air amphitheatre', 'amphitheatre', 'main stage', 'open air theatre', 'oat', 'grand finale'],
    description: 'Colossal open-air stone arena seating 3,000 students. 60ft concert trussing, pyrotechnics, laser array, and acoustic sound system.',
  },
];

// Edges forming a connected graph along the campus road network
export const CAMPUS_EDGES: MapEdge[] = [
  { from: 'stop-main-gate', to: 'stop-parking', distanceMetres: 110 },
  { from: 'stop-parking', to: 'stop-admin-block', distanceMetres: 130 },
  { from: 'stop-main-gate', to: 'stop-admin-block', distanceMetres: 190 },
  { from: 'stop-admin-block', to: 'stop-turing-hub', distanceMetres: 120 },
  { from: 'stop-turing-hub', to: 'stop-food-court', distanceMetres: 140 },
  { from: 'stop-food-court', to: 'stop-merch-lane', distanceMetres: 130 },
  { from: 'stop-merch-lane', to: 'stop-tech-tower', distanceMetres: 125 },
  { from: 'stop-tech-tower', to: 'stop-games-arena', distanceMetres: 135 },
  { from: 'stop-games-arena', to: 'stop-workshop-arena', distanceMetres: 125 },
  { from: 'stop-workshop-arena', to: 'stop-grand-amphitheatre', distanceMetres: 140 },
  { from: 'stop-games-arena', to: 'stop-grand-amphitheatre', distanceMetres: 180 },
];

// Stall plots configured for stall zones
export const STALL_PLOTS: StallPlot[] = [
  { plotId: 'FC-01', zoneId: 'stop-food-court', label: 'Plot FC-01 (Kathi & Rolls)' },
  { plotId: 'FC-02', zoneId: 'stop-food-court', label: 'Plot FC-02 (Dum Pukht Biryani)' },
  { plotId: 'FC-03', zoneId: 'stop-food-court', label: 'Plot FC-03 (Artisan Woodfire Pizza)' },
  { plotId: 'FC-04', zoneId: 'stop-food-court', label: 'Plot FC-04 (Chai Tapri & Bun Maska)' },
  { plotId: 'FC-05', zoneId: 'stop-food-court', label: 'Plot FC-05 (Boba Drops & Mocktails)' },
  { plotId: 'FC-06', zoneId: 'stop-food-court', label: 'Plot FC-06 (South Tiffin Express)' },
  { plotId: 'FC-07', zoneId: 'stop-food-court', label: 'Plot FC-07 (Waffle Wonder Lab)' },
  { plotId: 'FC-08', zoneId: 'stop-food-court', label: 'Plot FC-08 (Momos & Bao Station)' },
  { plotId: 'ML-01', zoneId: 'stop-merch-lane', label: 'Plot ML-01 (Official Fest Merch)' },
  { plotId: 'ML-02', zoneId: 'stop-merch-lane', label: 'Plot ML-02 (IEEE Geek Stickers)' },
  { plotId: 'ML-03', zoneId: 'stop-merch-lane', label: 'Plot ML-03 (Fine Arts Handmade Zines)' },
  { plotId: 'ML-04', zoneId: 'stop-merch-lane', label: 'Plot ML-04 (Custom Tote Bags & Badges)' },
  { plotId: 'ML-05', zoneId: 'stop-merch-lane', label: 'Plot ML-05 (Retro Vinyls & Comics)' },
  { plotId: 'GA-01', zoneId: 'stop-games-arena', label: 'Plot GA-01 (Retro Arcade Cabinets)' },
  { plotId: 'GA-02', zoneId: 'stop-games-arena', label: 'Plot GA-02 (VR Beat Saber Cage)' },
];

export const CAMPUS_STALLS: CampusStall[] = [
  {
    id: 'stall-1',
    name: 'Nawabi Dum Biryani House',
    plotId: 'FC-02',
    zoneId: 'stop-food-court',
    category: 'Food',
    typeLabel: 'Hyderabadi Special',
    hygieneRating: 'A+',
    isVeg: true,
    isNonVeg: true,
    specialty: 'Clay-pot sealed biryani with mirchi ka salan and burani raita.',
    pricing: '₹140 - ₹220',
    openingHours: '11:00 AM – 11:30 PM',
    leadStudent: 'Zayd Hashmi (Civil 4th Year)',
  },
  {
    id: 'stall-2',
    name: 'Crust & Timber Neapolitan Pizza',
    plotId: 'FC-03',
    zoneId: 'stop-food-court',
    category: 'Food',
    typeLabel: 'Woodfired Slice',
    hygieneRating: 'A+',
    isVeg: true,
    isNonVeg: true,
    specialty: '72-hr fermented sourdough margherita and peri-peri paneer pizza.',
    pricing: '₹180 - ₹260',
    openingHours: '12:00 PM – 10:00 PM',
    leadStudent: 'Simran Walia (Arch 3rd Year)',
  },
  {
    id: 'stall-3',
    name: 'Tapri Chai & Bun Maska Station',
    plotId: 'FC-04',
    zoneId: 'stop-food-court',
    category: 'Food',
    typeLabel: 'Beverages & Snacks',
    hygieneRating: 'A',
    isVeg: true,
    specialty: 'Kulhad ginger cardamom tea, bun maska, and hot samosas.',
    pricing: '₹25 - ₹70',
    openingHours: '08:00 AM – 12:00 AM (Midnight)',
    leadStudent: 'Devansh K. (ECE 2nd Year)',
  },
  {
    id: 'stall-4',
    name: 'Tokyo Boba & Fresh Fizzy Coolers',
    plotId: 'FC-05',
    zoneId: 'stop-food-court',
    category: 'Food',
    typeLabel: 'Artisan Drinks',
    hygieneRating: 'A+',
    isVeg: true,
    specialty: 'Brown sugar milk tea with chewy tapioca, matcha latte, blue lagoon soda.',
    pricing: '₹110 - ₹160',
    openingHours: '11:00 AM – 10:30 PM',
    leadStudent: 'Meera Iyer (Biotech 3rd Year)',
  },
  {
    id: 'stall-5',
    name: 'Festora Official Merch Drop',
    plotId: 'ML-01',
    zoneId: 'stop-merch-lane',
    category: 'Merch',
    typeLabel: 'Official Apparel',
    hygieneRating: 'A+',
    specialty: 'Heavyweight oversized hoodies, retro stamp pins, festival lanyards.',
    pricing: '₹80 - ₹799',
    openingHours: '09:00 AM – 09:00 PM',
    leadStudent: 'Student Council Merchandise Cell',
  },
  {
    id: 'stall-6',
    name: 'Pixel & Glitch: Tech Sticker Bar',
    plotId: 'ML-02',
    zoneId: 'stop-merch-lane',
    category: 'Merch',
    typeLabel: 'Stickers & Accessories',
    hygieneRating: 'A+',
    specialty: 'Die-cut waterproof laptop stickers, keyboard keycaps, artisan cables.',
    pricing: '₹30 - ₹350',
    openingHours: '10:00 AM – 08:00 PM',
    leadStudent: 'Rohan Sen (CSE 3rd Year)',
  },
  {
    id: 'stall-7',
    name: 'Fine Arts Hand-Pressed Zines & Prints',
    plotId: 'ML-03',
    zoneId: 'stop-merch-lane',
    category: 'Art',
    typeLabel: 'Student Printmakers',
    hygieneRating: 'A+',
    specialty: 'Risograph posters, botanical bookmarks, and custom mini-caricatures in 3 mins.',
    pricing: '₹50 - ₹200',
    openingHours: '10:00 AM – 07:00 PM',
    leadStudent: 'Ananya Roy (Design 4th Year)',
  },
  {
    id: 'stall-8',
    name: 'Retro Arcade & VR Beat Saber',
    plotId: 'GA-02',
    zoneId: 'stop-games-arena',
    category: 'Games',
    typeLabel: 'Gaming Arcade',
    hygieneRating: 'A+',
    specialty: 'Oculus Quest 3 headset battles, Street Fighter II arcade cabinet, rhythm games.',
    pricing: '₹50 / 10-min run',
    openingHours: '12:00 PM – 10:00 PM',
    leadStudent: 'Esports Society Coordinators',
  },
];

/**
 * Helper to match an event venue string to a stop ID
 */
export function venueToStop(venueText: string): CampusStop | undefined {
  if (!venueText) return undefined;
  const lower = venueText.toLowerCase().trim();

  // 1. Direct match with stop name
  const exact = CAMPUS_STOPS.find(
    (s) => s.name.toLowerCase() === lower || lower.includes(s.name.toLowerCase())
  );
  if (exact) return exact;

  // 2. Alias match
  return CAMPUS_STOPS.find((s) =>
    s.aliases.some((alias) => lower.includes(alias) || alias.includes(lower))
  );
}

/**
 * Dijkstra's Shortest Path Algorithm
 * Implemented natively with no external library.
 */
export interface RouteResult {
  fromStop: CampusStop;
  toStop: CampusStop;
  pathStops: CampusStop[];
  totalDistanceMetres: number;
  walkingTimeMinutes: number;
  steps: string[];
}

export function computeShortestRoute(
  startStopId: string,
  destStopId: string
): RouteResult | null {
  const startStop = CAMPUS_STOPS.find((s) => s.id === startStopId);
  const destStop = CAMPUS_STOPS.find((s) => s.id === destStopId);

  if (!startStop || !destStop) return null;

  if (startStopId === destStopId) {
    return {
      fromStop: startStop,
      toStop: destStop,
      pathStops: [startStop],
      totalDistanceMetres: 0,
      walkingTimeMinutes: 0,
      steps: [`You are already at ${startStop.name}! Enjoy the festivities.`],
    };
  }

  // Build adjacency list
  const adj: Map<string, { to: string; dist: number }[]> = new Map();
  CAMPUS_STOPS.forEach((s) => adj.set(s.id, []));

  CAMPUS_EDGES.forEach((edge) => {
    adj.get(edge.from)?.push({ to: edge.to, dist: edge.distanceMetres });
    adj.get(edge.to)?.push({ to: edge.from, dist: edge.distanceMetres });
  });

  const distances: Map<string, number> = new Map();
  const previous: Map<string, string | null> = new Map();
  const unvisited: Set<string> = new Set();

  CAMPUS_STOPS.forEach((s) => {
    distances.set(s.id, Infinity);
    previous.set(s.id, null);
    unvisited.add(s.id);
  });

  distances.set(startStopId, 0);

  while (unvisited.size > 0) {
    let current: string | null = null;
    let minDistance = Infinity;

    unvisited.forEach((nodeId) => {
      const d = distances.get(nodeId) ?? Infinity;
      if (d < minDistance) {
        minDistance = d;
        current = nodeId;
      }
    });

    if (current === null || minDistance === Infinity) break;
    if (current === destStopId) break;

    unvisited.delete(current);

    const neighbors = adj.get(current) || [];
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor.to)) continue;
      const tentative = (distances.get(current) ?? 0) + neighbor.dist;
      if (tentative < (distances.get(neighbor.to) ?? Infinity)) {
        distances.set(neighbor.to, tentative);
        previous.set(neighbor.to, current);
      }
    }
  }

  // Reconstruct path
  const pathIds: string[] = [];
  let curr: string | null = destStopId;
  while (curr !== null) {
    pathIds.unshift(curr);
    curr = previous.get(curr) || null;
    if (curr === startStopId) {
      pathIds.unshift(startStopId);
      break;
    }
  }

  if (pathIds[0] !== startStopId) {
    return null; // No route found
  }

  // Deduplicate consecutive nodes if any
  const cleanPathIds = pathIds.filter((id, idx) => idx === 0 || id !== pathIds[idx - 1]);
  const pathStops = cleanPathIds
    .map((id) => CAMPUS_STOPS.find((s) => s.id === id))
    .filter((s): s is CampusStop => !!s);

  const totalDist = distances.get(destStopId) || 0;
  // Assume walking speed = 1.2 m/s -> meters / (1.2 * 60) minutes ~ meters / 72
  const walkingTimeMinutes = Math.max(1, Math.round(totalDist / 72));

  // Generate numbered turn-by-turn postal steps
  const steps: string[] = [];
  steps.push(`Start out at ${startStop.name} (${startStop.subtitle}).`);

  for (let i = 1; i < pathStops.length; i++) {
    const prev = pathStops[i - 1];
    const stop = pathStops[i];
    const isFinal = i === pathStops.length - 1;
    const direction = stop.side === 'left' ? 'left' : 'right';

    if (isFinal) {
      steps.push(
        `Arrive at your destination: ${stop.name} (${stop.side === 'left' ? 'on the left' : 'on the right'}).`
      );
    } else {
      steps.push(
        `Walk along the kraft avenue past ${prev.name}, veer slightly ${direction} toward ${stop.name}.`
      );
    }
  }

  return {
    fromStop: startStop,
    toStop: destStop,
    pathStops,
    totalDistanceMetres: totalDist,
    walkingTimeMinutes,
    steps,
  };
}
