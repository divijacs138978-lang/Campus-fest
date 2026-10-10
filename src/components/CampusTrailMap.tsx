import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  CampusStop,
  CampusStall,
  CAMPUS_STOPS,
  CAMPUS_STALLS,
  computeShortestRoute,
  RouteResult,
} from '../data/campusMap';
import { CampusEvent } from '../types';
import { postalSoundFx } from '../utils/audio';
import {
  Search,
  Navigation,
  MapPin,
  Clock,
  Compass,
  Footprints,
  ChevronRight,
  Share2,
  ZoomIn,
  ZoomOut,
  ArrowUp,
  ArrowDown,
  X,
  ExternalLink,
  Sparkles,
  Utensils,
  ShoppingBag,
  Award,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { PostageStamp, WaxSeal } from './PostalDecorations';

interface Props {
  events: CampusEvent[];
  onSelectEvent?: (event: CampusEvent) => void;
  onClose?: () => void;
}

type FilterCategory = 'ALL' | 'EVENTS' | 'FOOD' | 'MERCH' | 'GAMES' | 'FACILITIES' | 'LIVE';

const ROAD_PATH_D = `M 195 1370 C 195 1330, 190 1310, 195 1300 C 205 1250, 230 1220, 215 1180 C 190 1120, 160 1080, 180 1040 C 210 990, 235 950, 210 910 C 175 860, 160 810, 180 770 C 215 720, 230 670, 205 630 C 170 580, 165 540, 185 500 C 215 450, 230 410, 205 370 C 170 320, 165 280, 185 240 C 205 190, 200 150, 195 110 L 195 60`;

export const CampusTrailMap: React.FC<Props> = ({ events, onSelectEvent, onClose }) => {
  // Navigation state
  const [startStopId, setStartStopId] = useState<string>(() => {
    return localStorage.getItem('campus_post_trail_start') || 'stop-main-gate';
  });
  const [destStopId, setDestStopId] = useState<string | null>(null);
  const [selectedStop, setSelectedStop] = useState<CampusStop | null>(null);
  const [expandedZoneStalls, setExpandedZoneStalls] = useState<string | null>(null);
  const [selectedStall, setSelectedStall] = useState<CampusStall | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('ALL');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [highlightedStopId, setHighlightedStopId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const roadPathRef = useRef<SVGPathElement>(null);
  const [carrierPos, setCarrierPos] = useState<{ x: number; y: number }>({ x: 195, y: 1300 });

  // Save start stop in localStorage
  useEffect(() => {
    localStorage.setItem('campus_post_trail_start', startStopId);
  }, [startStopId]);

  // Compute Dijkstra route when destination is selected
  const activeRoute: RouteResult | null = useMemo(() => {
    if (!destStopId) return null;
    return computeShortestRoute(startStopId, destStopId);
  }, [startStopId, destStopId]);

  // Map events to stops
  const eventsByStopId = useMemo(() => {
    const map = new Map<string, CampusEvent[]>();
    CAMPUS_STOPS.forEach((s) => map.set(s.id, []));

    events.forEach((ev) => {
      const lowerVenue = ev.venue.toLowerCase();
      const matched = CAMPUS_STOPS.find(
        (s) =>
          s.name.toLowerCase().includes(lowerVenue) ||
          lowerVenue.includes(s.name.toLowerCase()) ||
          s.aliases.some((a) => lowerVenue.includes(a))
      );
      if (matched) {
        map.get(matched.id)?.push(ev);
      }
    });
    return map;
  }, [events]);

  // Events happening now or soon (LIVE or next 60m)
  const happeningNowEvents = useMemo(() => {
    return events.filter((ev) => ev.status === 'LIVE' || ev.status === 'OPEN').slice(0, 4);
  }, [events]);

  // Update mail-carrier marker position
  useEffect(() => {
    const startStop = CAMPUS_STOPS.find((s) => s.id === startStopId);
    if (startStop) {
      setCarrierPos({ x: startStop.roadX, y: startStop.y });
    }
  }, [startStopId]);

  // Handle stop search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setHighlightedStopId(null);
      return;
    }

    const q = query.toLowerCase().trim();
    // Check stalls first (e.g., biryani, boba)
    const matchedStall = CAMPUS_STALLS.find(
      (st) =>
        st.name.toLowerCase().includes(q) ||
        st.specialty.toLowerCase().includes(q) ||
        st.category.toLowerCase().includes(q)
    );
    if (matchedStall) {
      setHighlightedStopId(matchedStall.zoneId);
      scrollToStop(matchedStall.zoneId);
      return;
    }

    // Check events
    const matchedEvent = events.find(
      (ev) =>
        ev.title.toLowerCase().includes(q) ||
        ev.category.toLowerCase().includes(q) ||
        ev.tags.some((t) => t.toLowerCase().includes(q))
    );
    if (matchedEvent) {
      for (const [stopId, evList] of eventsByStopId.entries()) {
        if (evList.some((e) => e.id === matchedEvent.id)) {
          setHighlightedStopId(stopId);
          scrollToStop(stopId);
          return;
        }
      }
    }

    // Check stops
    const matchedStop = CAMPUS_STOPS.find(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.aliases.some((a) => a.includes(q))
    );
    if (matchedStop) {
      setHighlightedStopId(matchedStop.id);
      scrollToStop(matchedStop.id);
    }
  };

  const scrollToStop = (stopId: string) => {
    const el = document.getElementById(`stop-element-${stopId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const jumpToStart = () => {
    postalSoundFx.playTypewriterTick();
    const el = document.getElementById(`stop-element-${startStopId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  const jumpToFinale = () => {
    postalSoundFx.playTypewriterTick();
    const el = document.getElementById('stop-element-stop-grand-amphitheatre');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStopClick = (stop: CampusStop) => {
    postalSoundFx.playStampThump();
    setSelectedStop(stop);
    setHighlightedStopId(stop.id);
  };

  const handleSetStart = (stopId: string) => {
    postalSoundFx.playTypewriterTick();
    setStartStopId(stopId);
    if (destStopId === stopId) {
      setDestStopId(null);
    }
  };

  const handleNavigateHere = (stopId: string) => {
    postalSoundFx.playLetterArrived();
    setDestStopId(stopId);
    setSelectedStop(null);
    scrollToStop(stopId);
  };

  const handleShareRoute = async () => {
    postalSoundFx.playTypewriterTick();
    const url = `${window.location.origin}#trail?from=${startStopId}&to=${destStopId || ''}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Campus Fest Trail Map',
          text: `Follow the campus trail from ${startStopId} to ${destStopId}!`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch {
      // ignore cancelled share
    }
  };

  // Render SVG Stop Illustration based on kind and stop id
  const renderStopIllustration = (stop: CampusStop) => {
    switch (stop.id) {
      case 'stop-main-gate':
        return (
          <svg viewBox="0 0 48 36" className="w-10 h-7 mx-auto stroke-[#2A1A14] fill-[#8E2A2A]">
            <rect x="4" y="10" width="8" height="24" rx="2" fill="#8E2A2A" strokeWidth="2" />
            <rect x="36" y="10" width="8" height="24" rx="2" fill="#8E2A2A" strokeWidth="2" />
            <path d="M 4 12 Q 24 2 44 12" fill="none" strokeWidth="3" />
            <path d="M 12 16 L 36 16" stroke="#FFF6E5" strokeWidth="2" strokeDasharray="2 2" />
            <circle cx="24" cy="9" r="3" fill="#FFF6E5" strokeWidth="1.5" />
          </svg>
        );
      case 'stop-parking':
        return (
          <svg viewBox="0 0 48 36" className="w-10 h-7 mx-auto stroke-[#2A1A14]">
            <rect x="6" y="8" width="36" height="22" rx="4" fill="#A98258" strokeWidth="2" />
            <circle cx="16" cy="30" r="3.5" fill="#2A1A14" />
            <circle cx="32" cy="30" r="3.5" fill="#2A1A14" />
            <text x="24" y="22" textAnchor="middle" fill="#FFF6E5" fontSize="12" fontWeight="bold">P</text>
          </svg>
        );
      case 'stop-admin-block':
        return (
          <svg viewBox="0 0 48 36" className="w-10 h-7 mx-auto stroke-[#2A1A14] fill-[#8E2A2A]">
            <polygon points="24,4 6,14 42,14" fill="#8E2A2A" strokeWidth="2" />
            <rect x="10" y="14" width="4" height="18" fill="#FFF6E5" strokeWidth="1.5" />
            <rect x="22" y="14" width="4" height="18" fill="#FFF6E5" strokeWidth="1.5" />
            <rect x="34" y="14" width="4" height="18" fill="#FFF6E5" strokeWidth="1.5" />
            <rect x="6" y="30" width="36" height="4" fill="#5E1250" strokeWidth="1.5" />
          </svg>
        );
      case 'stop-turing-hub':
        return (
          <svg viewBox="0 0 48 36" className="w-10 h-7 mx-auto stroke-[#2A1A14]">
            <rect x="8" y="8" width="32" height="20" rx="2" fill="#5E1250" strokeWidth="2" />
            <polygon points="4,28 44,28 40,32 8,32" fill="#A98258" strokeWidth="1.5" />
            <path d="M 16 18 L 20 15 L 16 12 M 32 18 L 28 15 L 32 12" fill="none" stroke="#FFF6E5" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'stop-food-court':
        return (
          <svg viewBox="0 0 48 36" className="w-10 h-7 mx-auto stroke-[#2A1A14]">
            <path d="M 12 18 C 12 28, 36 28, 36 18 Z" fill="#8E2A2A" strokeWidth="2" />
            <rect x="16" y="28" width="16" height="3" fill="#A98258" strokeWidth="1.5" />
            <path d="M 18 12 Q 20 8 18 4 M 24 12 Q 26 8 24 4 M 30 12 Q 32 8 30 4" fill="none" stroke="#FFF6E5" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'stop-merch-lane':
        return (
          <svg viewBox="0 0 48 36" className="w-10 h-7 mx-auto stroke-[#2A1A14]">
            <path d="M 14 12 L 20 8 L 24 10 L 28 8 L 34 12 L 31 16 L 28 15 L 28 30 L 20 30 L 20 15 L 17 16 Z" fill="#5B7A3A" strokeWidth="2" />
            <polygon points="24,16 25,19 28,19 26,21 27,24 24,22 21,24 22,21 20,19 23,19" fill="#FFF6E5" />
          </svg>
        );
      case 'stop-tech-tower':
        return (
          <svg viewBox="0 0 48 36" className="w-10 h-7 mx-auto stroke-[#2A1A14]">
            <rect x="14" y="8" width="20" height="20" rx="3" fill="#5E1250" strokeWidth="2" />
            <circle cx="24" cy="18" r="4" fill="#A98258" strokeWidth="1.5" />
            <path d="M 8 14 L 14 14 M 8 22 L 14 22 M 34 14 L 40 14 M 34 22 L 40 22 M 18 4 L 18 8 M 26 4 L 26 8 M 18 28 L 18 32 M 26 28 L 26 32" stroke="#FFF6E5" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );
      case 'stop-games-arena':
        return (
          <svg viewBox="0 0 48 36" className="w-10 h-7 mx-auto stroke-[#2A1A14]">
            <path d="M 12 10 L 36 10 L 32 24 C 32 28, 16 28, 16 24 Z" fill="#A98258" strokeWidth="2" />
            <path d="M 12 12 Q 6 16 12 20 M 36 12 Q 42 16 36 20" fill="none" strokeWidth="2" />
            <rect x="20" y="27" width="8" height="4" fill="#8E2A2A" strokeWidth="1.5" />
            <rect x="16" y="31" width="16" height="3" fill="#2A1A14" />
          </svg>
        );
      case 'stop-workshop-arena':
        return (
          <svg viewBox="0 0 48 36" className="w-10 h-7 mx-auto stroke-[#2A1A14]">
            <circle cx="24" cy="18" r="9" fill="#5B7A3A" strokeWidth="2" />
            <circle cx="24" cy="18" r="4" fill="#FFF6E5" strokeWidth="1.5" />
            <path d="M 24 5 L 24 9 M 24 27 L 24 31 M 11 18 L 15 18 M 33 18 L 37 18 M 15 9 L 18 12 M 30 24 L 33 27 M 15 27 L 18 24 M 30 12 L 33 9" stroke="#2A1A14" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'stop-grand-amphitheatre':
        return (
          <svg viewBox="0 0 48 36" className="w-10 h-7 mx-auto stroke-[#2A1A14]">
            <path d="M 6 28 A 20 14 0 0 1 42 28" fill="none" stroke="#A98258" strokeWidth="4" />
            <path d="M 10 24 A 16 11 0 0 1 38 24" fill="none" stroke="#FFF6E5" strokeWidth="3" />
            <path d="M 14 20 A 12 8 0 0 1 34 20" fill="none" stroke="#8E2A2A" strokeWidth="3" />
            <polygon points="24,6 26,11 31,11 27,14 29,19 24,16 19,19 21,14 17,11 22,11" fill="#FFF6E5" stroke="#2A1A14" strokeWidth="1.5" />
          </svg>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-[#8E2A2A] text-[#FFF6E5] flex items-center justify-center font-bold text-xs mx-auto">
            ★
          </div>
        );
    }
  };

  // Filter logic
  const isStopVisible = (stop: CampusStop): boolean => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'EVENTS') return stop.kind === 'event-venue' || stop.kind === 'finale';
    if (activeFilter === 'FOOD') return stop.id === 'stop-food-court';
    if (activeFilter === 'MERCH') return stop.id === 'stop-merch-lane';
    if (activeFilter === 'GAMES') return stop.id === 'stop-games-arena';
    if (activeFilter === 'FACILITIES') return stop.kind === 'facility' || stop.kind === 'gate';
    if (activeFilter === 'LIVE') {
      const evs = eventsByStopId.get(stop.id) || [];
      return evs.some((e) => e.status === 'LIVE');
    }
    return true;
  };

  // Quick chips for starting point
  const QUICK_START_OPTIONS = [
    { id: 'stop-main-gate', label: 'Main Gate' },
    { id: 'stop-parking', label: 'North Parking' },
    { id: 'stop-admin-block', label: 'Admin Quad' },
    { id: 'stop-food-court', label: 'Food Court' },
  ];

  return (
    <div className="relative w-full min-h-screen dark-fantasy-bg text-[#FFF6E5] flex flex-col font-sans select-none pb-20 overflow-x-hidden">
      {/* Background Film Grain and Ruined Spires */}
      <div className="fixed inset-0 pointer-events-none film-grain z-0 opacity-40" />
      <div className="fixed inset-0 pointer-events-none dark-vignette z-0" />
      <div className="fixed inset-x-0 bottom-0 h-44 spires-silhouette pointer-events-none z-0 opacity-40" />

      {/* TOP BAR / HEADER */}
      <header className="sticky top-0 z-40 bg-[#0B1030]/90 backdrop-blur-xl border-b border-[#E8D9B0]/20 px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Title Area */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-full bg-[#1B2257] border border-[#E8D9B0]/30 flex items-center justify-center text-[#E8D9B0]">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-2xl text-gold-gradient tracking-wide uppercase">
                  CAMPUS TRAIL
                </h1>
                <span className="bg-[#B3345C] text-[#FFF6E5] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  ROAD MAP
                </span>
              </div>
              <span className="font-eyebrow text-xs text-[#E8D9B0]/80 block -mt-0.5">
                find your way to events, food arenas & stages
              </span>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="ml-auto sm:hidden p-2 rounded-full glass-pill text-[#FFF6E5]"
                title="Close Trail Map"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick From Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="font-sans text-[11px] font-semibold text-[#E8D9B0] uppercase shrink-0">
              FROM:
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {QUICK_START_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSetStart(opt.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-sans font-medium uppercase transition-all ${
                    startStopId === opt.id
                      ? 'btn-crimson-pill text-[#FFF6E5] shadow-[0_0_12px_rgba(224,74,123,0.4)]'
                      : 'glass-pill text-[#FFF6E5]/80 hover:text-[#FFF6E5]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full btn-ghost-pill text-xs font-semibold uppercase hover:bg-white/10 ml-2"
              >
                <X className="w-3.5 h-3.5" />
                <span>Exit Map</span>
              </button>
            )}
          </div>
        </div>

        {/* SEARCH AND FILTER BAR */}
        <div className="max-w-4xl mx-auto mt-3 flex flex-col sm:flex-row items-center gap-2">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E8D9B0]/60" />
            <input
              type="text"
              placeholder="Find stall, event or arena (e.g. biryani)..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#10142E]/80 border border-[#E8D9B0]/25 rounded-full text-xs text-[#FFF6E5] placeholder-[#FFF6E5]/50 font-sans shadow-[0_4px_16px_rgba(0,0,0,0.3)] focus:outline-none focus:border-[#E8D9B0]/60"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#FFF6E5]/70"
              >
                ×
              </button>
            )}
          </div>

          {/* Filter Chips as Glass Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0 font-sans text-[10px]">
            {(['ALL', 'EVENTS', 'FOOD', 'MERCH', 'GAMES', 'FACILITIES', 'LIVE'] as FilterCategory[]).map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    postalSoundFx.playTypewriterTick();
                    setActiveFilter(cat);
                  }}
                  className={`px-3 py-1 rounded-full uppercase font-semibold tracking-wider whitespace-nowrap transition-all ${
                    activeFilter === cat
                      ? 'btn-crimson-pill text-[#FFF6E5] shadow-[0_0_12px_rgba(224,74,123,0.5)] scale-105'
                      : 'glass-pill text-[#FFF6E5]/75 hover:text-[#FFF6E5]'
                  }`}
                >
                  {cat === 'LIVE' ? '🔴 Live Now' : cat}
                </button>
              )
            )}
          </div>
        </div>
      </header>

      {/* HAPPENING NOW / NEXT UP STRIP */}
      {happeningNowEvents.length > 0 && (
        <div className="bg-[#8E2A2A] border-b-2 border-[#2A1A14] px-4 py-2 relative z-20">
          <div className="max-w-4xl mx-auto flex items-center gap-3 overflow-x-auto text-xs font-typewriter">
            <span className="font-black text-[#FFF6E5] uppercase tracking-wider shrink-0 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              ON THE TRAIL NOW:
            </span>
            <div className="flex items-center gap-2">
              {happeningNowEvents.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => {
                    const matched = CAMPUS_STOPS.find(
                      (s) =>
                        s.name.toLowerCase().includes(ev.venue.toLowerCase()) ||
                        ev.venue.toLowerCase().includes(s.name.toLowerCase()) ||
                        s.aliases.some((a) => ev.venue.toLowerCase().includes(a))
                    );
                    if (matched) {
                      scrollToStop(matched.id);
                      setSelectedStop(matched);
                    }
                  }}
                  className="px-2.5 py-0.5 rounded-lg bg-[#F3E6CE] text-[#2A1A14] border border-[#2A1A14] font-bold text-[11px] whitespace-nowrap hover:bg-[#FFF6E5] flex items-center gap-1.5"
                >
                  <span>{ev.title.substring(0, 22)}...</span>
                  <span className="text-[10px] text-[#8E2A2A]">[{ev.time}]</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE NAVIGATION BANNER (if route selected) */}
      {activeRoute && (
        <div className="bg-[#F3E6CE] border-b-3 border-[#2A1A14] text-[#2A1A14] px-4 py-3 shadow-[0_4px_8px_rgba(0,0,0,0.25)] relative z-30">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-typewriter">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#8E2A2A] text-[#FFF6E5] border border-[#2A1A14]">
                <Footprints className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#8E2A2A]">
                  ACTIVE ROUTE GUIDANCE
                </div>
                <div className="font-display font-black text-base text-[#2A1A14]">
                  {activeRoute.fromStop.name.split('&')[0]} → {activeRoute.toStop.name.split('&')[0]}
                </div>
                <div className="text-xs text-[#2A1A14]/80 flex items-center gap-3 mt-0.5">
                  <span>👣 {activeRoute.totalDistanceMetres} METRES</span>
                  <span>⏱ ~{activeRoute.walkingTimeMinutes} MIN WALK</span>
                  <span>📍 {activeRoute.pathStops.length} WAYPOINTS</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShareRoute}
                className="px-3 py-1.5 rounded-xl bg-[#FFF6E5] text-[#2A1A14] border-2 border-[#2A1A14] shadow-[2px_2px_0px_#2A1A14] text-xs font-bold uppercase flex items-center gap-1.5"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Share'}</span>
              </button>
              <button
                onClick={() => setDestStopId(null)}
                className="px-3 py-1.5 rounded-xl bg-[#8E2A2A] text-[#FFF6E5] border-2 border-[#2A1A14] shadow-[2px_2px_0px_#2A1A14] text-xs font-bold uppercase flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Route</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN VERTICAL ROAD SCENE CONTAINER */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full max-w-xl mx-auto flex justify-center py-6 px-2 overflow-y-visible"
      >
        {/* Progress rail on right edge */}
        <div className="fixed right-2 sm:right-6 top-36 z-30 flex flex-col items-center gap-1.5 bg-[#5E1250]/90 p-1.5 rounded-full border-2 border-[#2A1A14] shadow-[2px_2px_0px_#2A1A14]">
          <button
            onClick={jumpToFinale}
            className="w-7 h-7 rounded-full bg-[#8E2A2A] text-[#FFF6E5] flex items-center justify-center hover:scale-110 transition-transform"
            title="Jump to Grand Finale (Top)"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <div className="w-1.5 h-24 bg-[#2A1A14] rounded-full relative my-1">
            <div className="w-3 h-3 rounded-full bg-[#FFF6E5] border border-[#2A1A14] absolute -left-0.75 top-2" />
          </div>
          <button
            onClick={jumpToStart}
            className="w-7 h-7 rounded-full bg-[#A98258] text-[#FFF6E5] flex items-center justify-center hover:scale-110 transition-transform"
            title="Jump to Start (Bottom)"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Floating Zoom Controls */}
        <div className="fixed left-2 sm:left-6 bottom-8 z-30 flex flex-col gap-2">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
            className="p-2.5 rounded-xl bg-[#F3E6CE] text-[#2A1A14] border-2 border-[#2A1A14] shadow-[3px_3px_0px_#2A1A14] font-bold hover:bg-[#FFF6E5] transition-transform active:translate-y-0.5"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
            className="p-2.5 rounded-xl bg-[#F3E6CE] text-[#2A1A14] border-2 border-[#2A1A14] shadow-[3px_3px_0px_#2A1A14] font-bold hover:bg-[#FFF6E5] transition-transform active:translate-y-0.5"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* THE TALL ROAD MAP SVG SCENE */}
        <div
          className="relative transition-transform duration-200 origin-top"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg
            viewBox="0 0 390 1440"
            className="w-[370px] sm:w-[420px] h-auto overflow-visible select-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
          >
            <defs>
              {/* Paper strip road filter & shadow */}
              <filter id="road-shadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="4" dy="6" stdDeviation="0" floodColor="#1A0516" floodOpacity="0.8" />
              </filter>

              {/* Postal perforation pattern */}
              <pattern id="perforations" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="8" cy="8" r="2.5" fill="#380B30" />
              </pattern>
            </defs>

            {/* SCATTERED POSTAL & NATURE DECORATIONS (Duotone plum theme) */}
            {/* Stamp-olive trees and papercut greenery */}
            <g className="decorations pointer-events-none opacity-80">
              {/* Paper-cut trees */}
              <g transform="translate(45, 1220)">
                <circle cx="0" cy="0" r="14" fill="#5B7A3A" stroke="#2A1A14" strokeWidth="2" />
                <circle cx="8" cy="-5" r="10" fill="#47602C" />
                <rect x="-2" y="10" width="4" height="12" fill="#A98258" stroke="#2A1A14" strokeWidth="1.5" />
              </g>
              <g transform="translate(340, 1080)">
                <circle cx="0" cy="0" r="16" fill="#5B7A3A" stroke="#2A1A14" strokeWidth="2" />
                <circle cx="-6" cy="-4" r="11" fill="#47602C" />
                <rect x="-2" y="12" width="4" height="14" fill="#A98258" stroke="#2A1A14" strokeWidth="1.5" />
              </g>
              <g transform="translate(50, 940)">
                <circle cx="0" cy="0" r="15" fill="#5B7A3A" stroke="#2A1A14" strokeWidth="2" />
                <rect x="-2" y="10" width="4" height="12" fill="#A98258" stroke="#2A1A14" strokeWidth="1.5" />
              </g>
              <g transform="translate(345, 800)">
                <circle cx="0" cy="0" r="16" fill="#5B7A3A" stroke="#2A1A14" strokeWidth="2" />
                <rect x="-2" y="11" width="4" height="14" fill="#A98258" stroke="#2A1A14" strokeWidth="1.5" />
              </g>
              <g transform="translate(55, 650)">
                <circle cx="0" cy="0" r="14" fill="#5B7A3A" stroke="#2A1A14" strokeWidth="2" />
                <rect x="-2" y="10" width="4" height="12" fill="#A98258" stroke="#2A1A14" strokeWidth="1.5" />
              </g>
              <g transform="translate(335, 520)">
                <circle cx="0" cy="0" r="15" fill="#5B7A3A" stroke="#2A1A14" strokeWidth="2" />
                <rect x="-2" y="10" width="4" height="12" fill="#A98258" stroke="#2A1A14" strokeWidth="1.5" />
              </g>
              <g transform="translate(48, 380)">
                <circle cx="0" cy="0" r="16" fill="#5B7A3A" stroke="#2A1A14" strokeWidth="2" />
                <rect x="-2" y="12" width="4" height="14" fill="#A98258" stroke="#2A1A14" strokeWidth="1.5" />
              </g>
              <g transform="translate(340, 250)">
                <circle cx="0" cy="0" r="15" fill="#5B7A3A" stroke="#2A1A14" strokeWidth="2" />
                <rect x="-2" y="10" width="4" height="12" fill="#A98258" stroke="#2A1A14" strokeWidth="1.5" />
              </g>

              {/* Floating postal dove & paper plane */}
              <g transform="translate(60, 1150) rotate(15)">
                <path d="M 0 0 L 16 6 L 10 9 L 8 16 L 5 10 Z" fill="#FFF6E5" stroke="#2A1A14" strokeWidth="1.5" />
              </g>
              <g transform="translate(310, 430) rotate(-20)">
                <path d="M 0 0 L 18 7 L 11 10 L 9 18 L 6 11 Z" fill="#FFF6E5" stroke="#2A1A14" strokeWidth="1.5" />
              </g>
            </g>

            {/* THE PAPER-STRIP ROAD */}
            {/* 1. Road Base Kraft Ribbon with Ink Border & Hard Shadow */}
            <path
              d={ROAD_PATH_D}
              fill="none"
              stroke="#A98258"
              strokeWidth="32"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#road-shadow)"
            />
            {/* 2. Outer Ink Border */}
            <path
              d={ROAD_PATH_D}
              fill="none"
              stroke="#2A1A14"
              strokeWidth="34"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ strokeDasharray: 'none', strokeOpacity: 0.2 }}
            />
            {/* 3. Cream Dashed Centre Line */}
            <path
              ref={roadPathRef}
              d={ROAD_PATH_D}
              fill="none"
              stroke="#FFF6E5"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="8 8"
            />

            {/* 4. ACTIVE NAVIGATION OVERLAY: Animated walking trail */}
            {activeRoute && (
              <path
                d={ROAD_PATH_D}
                fill="none"
                stroke="#8E2A2A"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="10 10"
                className="animate-[dashwalk_2s_linear_infinite]"
                style={{ strokeOpacity: 0.9 }}
              />
            )}

            {/* MAIL-CARRIER MARKER ("You Are Here") */}
            <g
              transform={`translate(${carrierPos.x}, ${carrierPos.y})`}
              className="transition-all duration-700 ease-out z-30"
            >
              {/* Pulsing beacon circle */}
              <circle cx="0" cy="0" r="14" fill="#8E2A2A" fillOpacity="0.4" className="animate-ping" />
              {/* Carrier Badge */}
              <circle cx="0" cy="0" r="10" fill="#FFF6E5" stroke="#2A1A14" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="6" fill="#8E2A2A" />
              {/* You are here callout label */}
              <g transform="translate(14, -8)">
                <rect x="0" y="0" width="76" height="18" rx="4" fill="#2A1A14" />
                <text x="38" y="12" fill="#FFF6E5" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  YOU ARE HERE
                </text>
              </g>
            </g>

            {/* TOP FINALE BANNER (GRAND FINALE WAX SEAL & TROPHY) */}
            <g transform="translate(195, 75)" className="cursor-pointer" onClick={() => handleStopClick(CAMPUS_STOPS[9])}>
              <circle cx="0" cy="0" r="30" fill="#8E2A2A" stroke="#2A1A14" strokeWidth="3" />
              <circle cx="0" cy="0" r="24" fill="#721F1F" />
              <text x="0" y="6" textAnchor="middle" fill="#FFF6E5" fontSize="20">🏆</text>
              <g transform="translate(-56, 36)">
                <rect x="0" y="0" width="112" height="20" rx="4" fill="#F3E6CE" stroke="#2A1A14" strokeWidth="2" />
                <text x="56" y="14" textAnchor="middle" fill="#2A1A14" fontSize="10" fontWeight="900" fontFamily="sans-serif">
                  GRAND FINALE
                </text>
              </g>
            </g>

            {/* BOTTOM START SIGN (RUBBER STAMP STYLE) */}
            <g transform="translate(195, 1375)" className="cursor-pointer" onClick={() => handleStopClick(CAMPUS_STOPS[0])}>
              <rect x="-60" y="-14" width="120" height="28" rx="6" fill="#F3E6CE" stroke="#2A1A14" strokeWidth="2.5" />
              <text x="0" y="4" textAnchor="middle" fill="#2A1A14" fontSize="12" fontWeight="900" fontFamily="monospace">
                ★ START: {CAMPUS_STOPS.find((s) => s.id === startStopId)?.name.split(' ')[0] || 'GATE'} ★
              </text>
            </g>

            {/* BOTTOM POSTAGE-STAMP PERFORATION STRIP */}
            <g transform="translate(0, 1420)">
              <rect x="0" y="0" width="390" height="16" fill="#8E2A2A" stroke="#2A1A14" strokeWidth="2" />
              <rect x="0" y="0" width="390" height="16" fill="url(#perforations)" />
            </g>
          </svg>

          {/* HTML POSTCARD STOPS POSITIONED OVER THE SVG */}
          {CAMPUS_STOPS.map((stop, index) => {
            const isVisible = isStopVisible(stop);
            const isSelected = selectedStop?.id === stop.id;
            const isStart = startStopId === stop.id;
            const isDestination = destStopId === stop.id;
            const isHighlighted = highlightedStopId === stop.id;
            const isPathStop = activeRoute?.pathStops.some((s) => s.id === stop.id);
            const stopEvents = eventsByStopId.get(stop.id) || [];
            const hasLiveEvent = stopEvents.some((e) => e.status === 'LIVE');
            const zoneStalls = CAMPUS_STALLS.filter((st) => st.zoneId === stop.id);

            // Positioning: y scales with viewBox y (viewBox height is 1440)
            const topPercent = (stop.y / 1440) * 100;
            const leftPercent = (stop.x / 390) * 100;

            // Rotation offset between -2 and 2 deg
            const rotation = (index % 3 - 1) * 2;

            return (
              <div
                key={stop.id}
                id={`stop-element-${stop.id}`}
                style={{
                  top: `${topPercent}%`,
                  left: `${leftPercent}%`,
                  transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                }}
                className={`absolute z-20 transition-all duration-300 ${
                  isVisible ? 'opacity-100 scale-100' : 'opacity-30 scale-95 pointer-events-none'
                } ${activeRoute && !isPathStop ? 'opacity-40' : ''}`}
              >
                {/* POSTCARD FRAME */}
                <button
                  type="button"
                  aria-label={`Campus stop: ${stop.name}`}
                  onClick={() => handleStopClick(stop)}
                  className={`group relative w-36 sm:w-40 p-2 rounded-lg bg-[#F3E6CE] border-2 border-[#2A1A14] text-left transition-all duration-200 cursor-pointer ${
                    isHighlighted || isSelected
                      ? 'ring-4 ring-[#FFF6E5] shadow-[6px_6px_0px_#2A1A14] scale-105'
                      : 'shadow-[3px_3px_0px_#2A1A14] hover:shadow-[5px_5px_0px_#2A1A14] hover:-translate-y-1'
                  } ${isStart ? 'border-amber-400 border-3' : ''} ${
                    isDestination ? 'border-emerald-500 border-3' : ''
                  }`}
                >
                  {/* Trompe l'oeil Paper Clip on corner */}
                  <div className="absolute -top-2 -right-1 w-3.5 h-6 rounded-full border-2 border-stone-400 bg-transparent pointer-events-none z-10" />

                  {/* Top Pin with Stamped Number */}
                  <div className="absolute -top-3 left-2 flex items-center gap-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-typewriter font-black text-xs border border-[#2A1A14] shadow-[1px_1px_0px_#2A1A14] ${
                        hasLiveEvent
                          ? 'bg-rose-600 text-[#FFF6E5] ring-2 ring-rose-400 animate-pulse'
                          : isStart
                          ? 'bg-amber-400 text-[#2A1A14]'
                          : 'bg-[#8E2A2A] text-[#FFF6E5]'
                      }`}
                    >
                      {index + 1}
                    </div>

                    {/* LIVE BADGE */}
                    {hasLiveEvent && (
                      <span className="bg-rose-600 text-[#FFF6E5] text-[9px] font-black px-1.5 py-0.2 rounded border border-[#2A1A14] animate-pulse">
                        LIVE
                      </span>
                    )}
                  </div>

                  {/* Postal Illustration Window */}
                  <div className="w-full bg-[#E8D4B4] rounded border border-[#2A1A14]/40 py-1.5 px-1 mt-1 mb-1.5 flex items-center justify-center">
                    {renderStopIllustration(stop)}
                  </div>

                  {/* Stop Name & Subtitle */}
                  <div className="font-typewriter font-bold text-[11px] text-[#2A1A14] leading-tight line-clamp-1">
                    {stop.name}
                  </div>
                  <div className="font-typewriter text-[9px] text-[#2A1A14]/70 leading-tight line-clamp-1 mt-0.5">
                    {stop.subtitle}
                  </div>

                  {/* Badges strip (Event count or Stall count) */}
                  <div className="mt-1.5 flex items-center justify-between text-[9px] font-typewriter">
                    {stopEvents.length > 0 && (
                      <span className="bg-[#8E2A2A] text-[#FFF6E5] font-bold px-1.5 py-0.2 rounded border border-[#2A1A14]">
                        {stopEvents.length} event{stopEvents.length > 1 ? 's' : ''}
                      </span>
                    )}

                    {stop.kind === 'stall-zone' && (
                      <span className="bg-[#5B7A3A] text-[#FFF6E5] font-bold px-1.5 py-0.2 rounded border border-[#2A1A14]">
                        {zoneStalls.length > 0 ? `${zoneStalls.length} Stalls` : 'Stall Zone'}
                      </span>
                    )}

                    {isStart && (
                      <span className="bg-amber-400 text-[#2A1A14] font-black px-1 py-0.2 rounded text-[8px]">
                        START
                      </span>
                    )}

                    {isDestination && (
                      <span className="bg-emerald-500 text-[#FFF6E5] font-black px-1 py-0.2 rounded text-[8px]">
                        DEST
                      </span>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM-SHEET STAMP CARD (Opened when a stop is tapped) */}
      {selectedStop && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#F3E6CE] border-t-4 sm:border-4 border-[#2A1A14] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-[8px_8px_0px_#2A1A14] text-[#2A1A14] max-h-[85vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedStop(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#2A1A14] text-[#FFF6E5] hover:bg-[#8E2A2A] transition-colors"
              title="Close details"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Stamp Header */}
            <div className="flex items-start gap-3.5 pr-8">
              <div className="w-12 h-12 rounded-2xl bg-[#8E2A2A] text-[#FFF6E5] border-2 border-[#2A1A14] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#2A1A14]">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <span className="bg-[#8E2A2A] text-[#FFF6E5] text-[10px] font-black px-2 py-0.5 rounded border border-[#2A1A14] font-typewriter uppercase">
                  WAYPOINT #{CAMPUS_STOPS.findIndex((s) => s.id === selectedStop.id) + 1} · {selectedStop.kind.toUpperCase()}
                </span>
                <h3 className="font-display font-black text-xl text-[#2A1A14] uppercase mt-1 leading-snug">
                  {selectedStop.name}
                </h3>
                <p className="font-serif-flourish italic text-xs text-[#2A1A14]/80 mt-0.5">
                  {selectedStop.subtitle}
                </p>
              </div>
            </div>

            <p className="font-typewriter text-xs text-[#2A1A14]/90 mt-3 p-2.5 bg-[#FFF6E5] rounded-xl border border-[#2A1A14]/30 leading-relaxed">
              {selectedStop.description}
            </p>

            {/* EVENTS AT THIS STOP */}
            {eventsByStopId.get(selectedStop.id)?.length ? (
              <div className="mt-4">
                <div className="font-typewriter text-xs font-bold uppercase text-[#8E2A2A] flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Events Hosted Here ({eventsByStopId.get(selectedStop.id)?.length}):</span>
                </div>
                <div className="flex flex-col gap-2">
                  {eventsByStopId.get(selectedStop.id)!.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-2.5 bg-[#FFF6E5] rounded-xl border-2 border-[#2A1A14] shadow-[2px_2px_0px_#2A1A14] flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-bold text-xs text-[#2A1A14]">{ev.title}</div>
                        <div className="font-typewriter text-[10px] text-[#2A1A14]/70 mt-0.5">
                          {ev.date} · {ev.time}
                        </div>
                      </div>
                      {onSelectEvent && (
                        <button
                          onClick={() => {
                            setSelectedStop(null);
                            onSelectEvent(ev);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#8E2A2A] text-[#FFF6E5] text-[10px] font-typewriter font-bold uppercase hover:bg-[#5E1250] transition-colors shrink-0"
                        >
                          View / Register
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* STALLS AT THIS ZONE */}
            {CAMPUS_STALLS.filter((st) => st.zoneId === selectedStop.id).length > 0 && (
              <div className="mt-4">
                <div className="font-typewriter text-xs font-bold uppercase text-[#5B7A3A] flex items-center gap-1.5 mb-2">
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Approved Stalls in this Zone:</span>
                </div>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                  {CAMPUS_STALLS.filter((st) => st.zoneId === selectedStop.id).map((st) => (
                    <div
                      key={st.id}
                      onClick={() => setSelectedStall(st)}
                      className="p-2.5 bg-[#FFF6E5] rounded-xl border-2 border-[#2A1A14] shadow-[2px_2px_0px_#2A1A14] flex items-center justify-between gap-2 cursor-pointer hover:bg-white transition-colors"
                    >
                      <div>
                        <div className="font-bold text-xs text-[#2A1A14] flex items-center gap-1.5">
                          <span>{st.name}</span>
                          <span className="text-[9px] bg-[#A98258] text-[#FFF6E5] px-1 py-0.2 rounded font-typewriter">
                            {st.plotId}
                          </span>
                        </div>
                        <div className="font-typewriter text-[10px] text-[#2A1A14]/75 mt-0.5">
                          {st.specialty}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-typewriter font-bold text-[10px] text-[#8E2A2A] block">
                          {st.pricing}
                        </span>
                        <span className="text-[9px] text-[#5B7A3A] font-bold">
                          ★ {st.hygieneRating}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="mt-5 pt-3 border-t-2 border-[#2A1A14]/30 flex flex-wrap items-center justify-end gap-2 font-typewriter">
              <button
                onClick={() => {
                  handleSetStart(selectedStop.id);
                  setSelectedStop(null);
                }}
                className="px-3 py-2 rounded-xl bg-[#FFF6E5] border-2 border-[#2A1A14] shadow-[2px_2px_0px_#2A1A14] text-xs font-bold uppercase text-[#2A1A14] hover:bg-white"
              >
                Set as Start
              </button>

              <button
                onClick={() => handleNavigateHere(selectedStop.id)}
                className="px-4 py-2 rounded-xl bg-[#8E2A2A] border-2 border-[#2A1A14] shadow-[2px_2px_0px_#2A1A14] text-xs font-black uppercase text-[#FFF6E5] hover:bg-[#5E1250] flex items-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Navigate Here</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STALL DETAIL POPUP */}
      {selectedStall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-[#FFF6E5] border-4 border-[#2A1A14] rounded-3xl p-5 shadow-[8px_8px_0px_#2A1A14] text-[#2A1A14]">
            <button
              onClick={() => setSelectedStall(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-[#2A1A14] text-[#FFF6E5]"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-2 font-typewriter text-xs">
              <span className="bg-[#8E2A2A] text-[#FFF6E5] px-2 py-0.5 rounded font-black">
                {selectedStall.plotId}
              </span>
              <span className="bg-[#5B7A3A] text-[#FFF6E5] px-2 py-0.5 rounded font-bold">
                Hygiene: {selectedStall.hygieneRating}
              </span>
            </div>
            <h4 className="font-display font-black text-lg text-[#2A1A14] uppercase">
              {selectedStall.name}
            </h4>
            <p className="font-typewriter text-xs text-[#2A1A14]/80 mt-1">
              {selectedStall.specialty}
            </p>
            <div className="mt-3 p-2 bg-[#F3E6CE] rounded-xl border border-[#2A1A14]/30 font-typewriter text-xs flex flex-col gap-1">
              <div>💰 Pricing: <strong>{selectedStall.pricing}</strong></div>
              <div>🕒 Hours: <strong>{selectedStall.openingHours}</strong></div>
              <div>🧑‍🍳 Lead: <strong>{selectedStall.leadStudent}</strong></div>
            </div>
            <button
              onClick={() => setSelectedStall(null)}
              className="w-full mt-4 py-2 bg-[#8E2A2A] text-[#FFF6E5] font-typewriter font-black text-xs uppercase rounded-xl border-2 border-[#2A1A14] shadow-[2px_2px_0px_#2A1A14]"
            >
              Back to Map
            </button>
          </div>
        </div>
      )}

      {/* TURN-BY-TURN ROUTE DRAWER (If Route Active) */}
      {activeRoute && activeRoute.steps.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-[#FFF6E5] border-t-4 border-[#2A1A14] shadow-[0_-8px_16px_rgba(0,0,0,0.3)] p-4 max-h-56 overflow-y-auto text-[#2A1A14] font-typewriter">
          <div className="max-w-xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-black text-xs uppercase text-[#8E2A2A]">
                  TURN-BY-TURN POSTAL DIRECTIONS ({activeRoute.walkingTimeMinutes} MIN)
                </span>
              </div>
              <button
                onClick={() => setDestStopId(null)}
                className="text-xs font-bold text-[#8E2A2A] hover:underline"
              >
                Close Directions
              </button>
            </div>
            <ol className="list-decimal list-inside flex flex-col gap-1.5 text-xs">
              {activeRoute.steps.map((st, idx) => (
                <li key={idx} className="leading-snug">
                  <span className="font-medium">{st}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};
