import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  CampusStop,
  CAMPUS_STOPS,
  computeShortestRoute,
  RouteResult,
} from '../data/campusMap';
import { CampusEvent } from '../types';
import { soundFx } from '../utils/audio';
import { mascotPostieImg } from '../assets/characters';
import { useReducedMotion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Navigation,
  MapPin,
  Clock,
  Compass,
  Footprints,
  RotateCcw,
  Sparkles,
  X,
  Flag,
  CheckCircle,
  HelpCircle,
  Eye,
} from 'lucide-react';

interface Props {
  events: CampusEvent[];
  onSelectEvent?: (event: CampusEvent) => void;
  onClose?: () => void;
}

// Fixed canvas dimension for vertical campus road map
const MAP_VIEWBOX_WIDTH = 390;
const MAP_VIEWBOX_HEIGHT = 1440;

// Main winding backbone road from bottom (Main Gate) to top (Amphitheatre)
const MAIN_ROAD_PATH_D = `M 195 1330 C 195 1270, 180 1230, 195 1180 C 210 1130, 180 1090, 195 1040 C 210 990, 185 950, 195 910 C 205 870, 180 820, 195 770 C 210 720, 180 680, 195 630 C 210 580, 185 540, 195 500 C 205 450, 180 410, 195 370 C 210 320, 185 280, 195 240 C 205 190, 195 150, 195 100`;

export const CampusTrailMap: React.FC<Props> = ({ events, onSelectEvent, onClose }) => {
  const shouldReduceMotion = useReducedMotion();

  // User selectable or auto-detected start point
  const [startStopId, setStartStopId] = useState<string>(() => {
    return (
      (typeof window !== 'undefined' &&
        (localStorage.getItem('festora_trail_start') ||
          localStorage.getItem('campus_post_trail_start'))) ||
      'stop-main-gate'
    );
  });

  // User selectable destination point
  const [destStopId, setDestStopId] = useState<string>('stop-grand-amphitheatre');
  const [selectedStop, setSelectedStop] = useState<CampusStop | null>(() => {
    return CAMPUS_STOPS.find((s) => s.id === 'stop-grand-amphitheatre') || CAMPUS_STOPS[0];
  });

  // Route animation states
  const [walkProgress, setWalkProgress] = useState<number>(1);
  const [isWalking, setIsWalking] = useState<boolean>(false);
  const [hasArrived, setHasArrived] = useState<boolean>(true);
  const [walkerCoords, setWalkerCoords] = useState<{ x: number; y: number; facingLeft: boolean }>({
    x: 195,
    y: 110,
    facingLeft: false,
  });

  const animRef = useRef<number | null>(null);
  const routePathRef = useRef<SVGPathElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Compute active shortest route
  const activeRoute: RouteResult | null = useMemo(() => {
    if (!startStopId || !destStopId) return null;
    return computeShortestRoute(startStopId, destStopId);
  }, [startStopId, destStopId]);

  // Current active stops
  const startStop = useMemo(
    () => CAMPUS_STOPS.find((s) => s.id === startStopId) || CAMPUS_STOPS[0],
    [startStopId]
  );
  const destStop = useMemo(
    () => CAMPUS_STOPS.find((s) => s.id === destStopId) || CAMPUS_STOPS[CAMPUS_STOPS.length - 1],
    [destStopId]
  );

  // Map events to stop landmarks
  const eventsByStopId = useMemo(() => {
    const map = new Map<string, CampusEvent[]>();
    events.forEach((ev) => {
      const lower = (ev.venue || '').toLowerCase();
      let matchedStopId = 'stop-grand-amphitheatre';
      if (lower.includes('turing') || lower.includes('block c') || lower.includes('hackcampus')) {
        matchedStopId = 'stop-turing-hub';
      } else if (lower.includes('amphitheatre') || lower.includes('stage') || lower.includes('tarang')) {
        matchedStopId = 'stop-grand-amphitheatre';
      } else if (lower.includes('sports') || lower.includes('futsal') || lower.includes('turf')) {
        matchedStopId = 'stop-games-arena';
      } else if (lower.includes('mechatronics') || lower.includes('workshop') || lower.includes('robowars')) {
        matchedStopId = 'stop-workshop-arena';
      } else if (lower.includes('tech tower') || lower.includes('computing lab')) {
        matchedStopId = 'stop-tech-tower';
      } else if (lower.includes('food') || lower.includes('canteen')) {
        matchedStopId = 'stop-food-court';
      } else if (lower.includes('merch') || lower.includes('art alley')) {
        matchedStopId = 'stop-merch-lane';
      }
      const list = map.get(matchedStopId) || [];
      list.push(ev);
      map.set(matchedStopId, list);
    });
    return map;
  }, [events]);

  // Construct SVG path following campus roads (courtyard -> road junction -> road spine -> dest junction -> dest courtyard)
  const routePathD = useMemo(() => {
    if (!activeRoute || activeRoute.pathStops.length === 0) return '';
    const stops = activeRoute.pathStops;
    if (stops.length === 1) {
      return `M ${stops[0].x} ${stops[0].y} L ${stops[0].x} ${stops[0].y}`;
    }

    const segments: string[] = [];
    const first = stops[0];
    const last = stops[stops.length - 1];

    // Start at initial stop's location
    segments.push(`M ${first.x} ${first.y}`);
    // Branch road to central road junction
    segments.push(`L ${first.roadX} ${first.y}`);

    // Intermediate road waypoints along the main road
    for (let i = 1; i < stops.length; i++) {
      const curr = stops[i];
      const prev = stops[i - 1];
      const midY = (prev.y + curr.y) / 2;
      // Smooth curve along road spine
      segments.push(`C ${prev.roadX} ${midY}, ${curr.roadX} ${midY}, ${curr.roadX} ${curr.y}`);
    }

    // Branch from road into final stop's courtyard
    segments.push(`L ${last.x} ${last.y}`);

    return segments.join(' ');
  }, [activeRoute]);

  // Animation controller
  const startWalkAnimation = useCallback(() => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }

    if (shouldReduceMotion || startStopId === destStopId) {
      setWalkProgress(1);
      setIsWalking(false);
      setHasArrived(true);
      if (destStop) {
        setWalkerCoords({ x: destStop.x, y: destStop.y, facingLeft: false });
      }
      return;
    }

    setWalkProgress(0);
    setIsWalking(true);
    setHasArrived(false);

    const durationMs = 3400; // 3.4 seconds smooth walk
    const startTime = performance.now();

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      // Smooth ease-in-out cubic
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setWalkProgress(eased);

      if (routePathRef.current) {
        try {
          const totalLength = routePathRef.current.getTotalLength();
          if (totalLength > 0) {
            const currentDist = eased * totalLength;
            const pt = routePathRef.current.getPointAtLength(currentDist);
            const aheadDist = Math.min(totalLength, currentDist + 4);
            const aheadPt = routePathRef.current.getPointAtLength(aheadDist);
            const dx = aheadPt.x - pt.x;

            setWalkerCoords({
              x: pt.x,
              y: pt.y,
              facingLeft: dx < -0.1,
            });
          }
        } catch {}
      }

      if (t < 1) {
        animRef.current = requestAnimationFrame(frame);
      } else {
        setIsWalking(false);
        setHasArrived(true);
        soundFx.playConfirm();
        try {
          confetti({
            particleCount: 35,
            spread: 60,
            origin: { y: 0.65 },
            colors: ['#E8D9B0', '#B3345C', '#10B981', '#FFF6E5'],
          });
        } catch {}
      }
    };

    animRef.current = requestAnimationFrame(frame);
  }, [shouldReduceMotion, startStopId, destStopId, destStop]);

  // Restart animation whenever route changes
  useEffect(() => {
    const timer = setTimeout(() => {
      startWalkAnimation();
    }, 150);
    return () => {
      clearTimeout(timer);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [startStopId, destStopId, startWalkAnimation]);

  const handleSelectLandmark = (landmarkId: string) => {
    soundFx.playClick();
    const found = CAMPUS_STOPS.find((s) => s.id === landmarkId) || null;
    setSelectedStop(found);
    if (landmarkId !== startStopId) {
      setDestStopId(landmarkId);
    }
  };

  const handleSwapPoints = () => {
    soundFx.playClick();
    const oldStart = startStopId;
    setStartStopId(destStopId);
    setDestStopId(oldStart);
    if (typeof window !== 'undefined') {
      localStorage.setItem('festora_trail_start', destStopId);
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col gap-6 py-4 px-3 sm:px-6 select-none">
      {/* Top Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#060A1C]/95 border-2 border-[#E8D9B0]/30 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-[#E8D9B0]" />
            <h1 className="font-display font-black text-2xl sm:text-3xl text-gold-gradient uppercase tracking-widest">
              CAMPUS TRAIL MAP
            </h1>
          </div>
          <p className="font-eyebrow text-xs sm:text-sm text-[#E8D9B0]/80 mt-1">
            Pick your destination. The Festora character navigates campus roads and covered pathways directly to your venue.
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="self-end md:self-center p-2 rounded-xl bg-[#10142E] border border-[#E8D9B0]/40 text-[#E8D9B0] hover:text-[#FFF6E5] transition-all"
            title="Return to Gate"
            aria-label="Close Trail Map"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Prominent Journey Summary & Navigation Controls Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#10142E]/95 border border-[#E8D9B0]/40 shadow-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Journey Summary: From -> To with Estimated Time & Distance */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#38BDF8]">
            <Navigation className="w-3.5 h-3.5" />
            <span>Active Campus Route</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base font-display font-bold text-[#FFF6E5]">
            <span className="text-emerald-400 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {startStop.name}
            </span>
            <span className="text-[#E8D9B0]">→</span>
            <span className="text-[#E04A7B] flex items-center gap-1">
              <Flag className="w-4 h-4" />
              {destStop.name}
            </span>
          </div>

          {activeRoute && (
            <div className="flex flex-wrap items-center gap-4 text-xs font-sans text-[#E8D9B0]/90">
              <span className="flex items-center gap-1.5 font-bold">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                ~{activeRoute.walkingTimeMinutes} min walk
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-bold">
                <Footprints className="w-3.5 h-3.5 text-[#38BDF8]" />
                {activeRoute.totalDistanceMetres} meters
              </span>
              <span>•</span>
              <span className="text-xs text-[#FFF6E5]/70">
                {isWalking ? 'Walking along road...' : 'Destination reached'}
              </span>
            </div>
          )}
        </div>

        {/* Quick Selectors: Pick Start, Pick Destination, Replay */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Start Location Selector */}
          <div className="flex flex-col text-left">
            <label className="text-[10px] font-mono text-[#E8D9B0]/80 uppercase">You are at:</label>
            <select
              value={startStopId}
              onChange={(e) => {
                setStartStopId(e.target.value);
                soundFx.playClick();
                if (typeof window !== 'undefined') {
                  localStorage.setItem('festora_trail_start', e.target.value);
                }
              }}
              className="py-1.5 px-3 rounded-xl bg-[#060A1C] border border-emerald-500/50 text-xs text-[#FFF6E5] focus:outline-none focus:border-emerald-400"
            >
              {CAMPUS_STOPS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Selector */}
          <div className="flex flex-col text-left">
            <label className="text-[10px] font-mono text-[#E8D9B0]/80 uppercase">Destination:</label>
            <select
              value={destStopId}
              onChange={(e) => {
                setDestStopId(e.target.value);
                setSelectedStop(CAMPUS_STOPS.find((s) => s.id === e.target.value) || null);
                soundFx.playClick();
              }}
              className="py-1.5 px-3 rounded-xl bg-[#060A1C] border border-[#E04A7B]/60 text-xs text-[#FFF6E5] focus:outline-none focus:border-[#E04A7B]"
            >
              {CAMPUS_STOPS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Replay Walk Button */}
          <div className="flex items-end self-end mt-2 sm:mt-0">
            <button
              onClick={() => {
                soundFx.playClick();
                startWalkAnimation();
              }}
              className="btn-crimson-pill px-3.5 py-2 text-xs uppercase font-semibold gap-1.5 shadow-[0_0_15px_rgba(224,74,123,0.4)]"
              title="Replay character walking animation along the road"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay Walk</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Map View: Interactive Road Stage + Landmark Details Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Canvas SVG with Walking Mascot */}
        <div
          ref={containerRef}
          className="lg:col-span-7 rounded-3xl border-4 border-[#2A1A14] bg-[#F7F0DD] shadow-[0_12px_36px_rgba(0,0,0,0.6)] p-3 sm:p-5 relative overflow-hidden"
          style={{
            backgroundImage: `radial-gradient(#DECBB2 1.5px, transparent 1.5px), radial-gradient(#DECBB2 1.5px, #F7F0DD 1.5px)`,
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px',
          }}
        >
          {/* Legend Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-2 border-b-2 border-dashed border-[#8C6D4F]/40 text-[11px] font-sans text-[#2A1A14]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-bold">
                <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block border border-[#2A1A14]" />
                Start (You Are Here)
              </span>
              <span className="flex items-center gap-1 font-bold">
                <span className="w-3 h-3 rounded-full bg-[#B3345C] inline-block border border-[#2A1A14]" />
                Destination
              </span>
              <span className="flex items-center gap-1 font-bold">
                <span className="w-4 h-1 bg-emerald-500 inline-block border-t border-b border-[#2A1A14]" />
                Road Path
              </span>
            </div>
            <span className="text-[10px] text-[#6B4E31] italic">
              Tap any postcard on the road to navigate
            </span>
          </div>

          {/* SVG Map Scene */}
          <div className="relative flex justify-center py-2">
            <svg
              viewBox={`0 0 ${MAP_VIEWBOX_WIDTH} ${MAP_VIEWBOX_HEIGHT}`}
              className="w-full max-w-[390px] h-auto overflow-visible select-none"
            >
              {/* Compass Rose at Top-Right */}
              <g transform="translate(325, 80)">
                <circle cx="0" cy="0" r="24" fill="#EDE1C7" stroke="#6B4E31" strokeWidth="1.8" />
                <polygon
                  points="0,-20 4,-4 20,0 4,4 0,20 -4,4 -20,0 -4,-4"
                  fill="#8E2A2A"
                  stroke="#2A1A14"
                  strokeWidth="1"
                />
                <text x="0" y="-10" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#FFF6E5">
                  N
                </text>
                <text x="0" y="17" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#2A1A14">
                  S
                </text>
              </g>

              {/* Decorative Stars */}
              <text x="35" y="80" fontSize="16" fill="#8C6D4F" opacity="0.6">✦</text>
              <text x="45" y="470" fontSize="14" fill="#8C6D4F" opacity="0.5">✧</text>
              <text x="330" y="850" fontSize="16" fill="#8C6D4F" opacity="0.5">✦</text>
              <text x="45" y="1120" fontSize="14" fill="#8C6D4F" opacity="0.6">✧</text>

              {/* ========================================================
                  1. CAMPUS MAIN ROAD NETWORK
              ======================================================== */}
              {/* Main Road Shadow */}
              <path
                d={MAIN_ROAD_PATH_D}
                fill="none"
                stroke="#D6C4A6"
                strokeWidth="28"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Main Road Paper-Strip Kraft Fill */}
              <path
                d={MAIN_ROAD_PATH_D}
                fill="none"
                stroke="#E8D9B0"
                strokeWidth="22"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Ink Edges */}
              <path
                d={MAIN_ROAD_PATH_D}
                fill="none"
                stroke="#6B4E31"
                strokeWidth="22"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="1 1"
                opacity="0.35"
              />

              {/* Cream Dashed Centerline */}
              <path
                d={MAIN_ROAD_PATH_D}
                fill="none"
                stroke="#8E2A2A"
                strokeWidth="3"
                strokeDasharray="6 6"
                strokeLinecap="round"
              />

              {/* Branch Roads connecting each stop to the central avenue */}
              {CAMPUS_STOPS.map((s) => (
                <g key={`branch-${s.id}`}>
                  <line
                    x1={s.x}
                    y1={s.y}
                    x2={s.roadX}
                    y2={s.y}
                    stroke="#E8D9B0"
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  <line
                    x1={s.x}
                    y1={s.y}
                    x2={s.roadX}
                    y2={s.y}
                    stroke="#8E2A2A"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                    opacity="0.6"
                  />
                </g>
              ))}

              {/* ========================================================
                  2. ACTIVE HIGHLIGHTED ROUTE (GLOWING DOTTED PATH)
              ======================================================== */}
              {routePathD && (
                <>
                  {/* Invisible reference path for measurement */}
                  <path
                    ref={routePathRef}
                    d={routePathD}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="1"
                  />

                  {/* Emerald Glowing Trail Base */}
                  <path
                    d={routePathD}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.5"
                  />

                  {/* Animated Walking Dotted Route */}
                  <path
                    d={routePathD}
                    fill="none"
                    stroke="#FFF6E5"
                    strokeWidth="4"
                    strokeDasharray="7 5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={shouldReduceMotion ? '' : 'animate-dashwalk'}
                  />
                </>
              )}

              {/* ========================================================
                  3. LANDMARK POSTCARDS (TAP TARGETS)
              ======================================================== */}
              {CAMPUS_STOPS.map((s) => {
                const isStart = startStopId === s.id;
                const isDest = destStopId === s.id;
                const isSelected = selectedStop?.id === s.id;
                const stopEvents = eventsByStopId.get(s.id) || [];
                const hasLive = stopEvents.some((e) => e.status === 'LIVE');

                return (
                  <g
                    key={s.id}
                    transform={`translate(${s.x}, ${s.y})`}
                    className="cursor-pointer group"
                    onClick={() => handleSelectLandmark(s.id)}
                  >
                    {/* Pulsing ring if Live event */}
                    {hasLive && (
                      <circle
                        cx="0"
                        cy="0"
                        r="34"
                        fill="none"
                        stroke="#E04A7B"
                        strokeWidth="2.5"
                        className="animate-ping opacity-60"
                      />
                    )}

                    {/* Postcard Frame */}
                    <rect
                      x="-55"
                      y="-42"
                      width="110"
                      height="84"
                      rx="8"
                      fill={isDest ? '#FFF5F8' : isStart ? '#F0FDF4' : '#FFFBF2'}
                      stroke={isDest ? '#E04A7B' : isStart ? '#10B981' : isSelected ? '#B3345C' : '#2A1A14'}
                      strokeWidth={isDest || isStart || isSelected ? '3' : '2'}
                      className="filter drop-shadow-[3px_3px_0px_rgba(42,26,20,0.85)] group-hover:scale-105 transition-transform"
                    />

                    {/* Paper clip decoration */}
                    <rect
                      x="-48"
                      y="-46"
                      width="6"
                      height="13"
                      rx="3"
                      fill="#A98258"
                      stroke="#2A1A14"
                      strokeWidth="1"
                    />

                    {/* Landmark Name & Subtitle */}
                    <text
                      x="0"
                      y="16"
                      textAnchor="middle"
                      fontFamily="Cinzel, serif"
                      fontSize="9"
                      fontWeight="bold"
                      fill="#2A1A14"
                    >
                      {s.name.slice(0, 16)}
                    </text>
                    <text
                      x="0"
                      y="28"
                      textAnchor="middle"
                      fontFamily="Poppins, sans-serif"
                      fontSize="7"
                      fill="#6B4E31"
                    >
                      {s.subtitle.slice(0, 22)}
                    </text>

                    {/* Center Landmark Mini Icon */}
                    <g transform="translate(0, -14)">
                      {s.kind === 'gate' && (
                        <path
                          d="M-14,8 L-14,-10 Q0,-18 14,-10 L14,8 M-14,0 L14,0"
                          fill="none"
                          stroke="#8E2A2A"
                          strokeWidth="2"
                        />
                      )}
                      {s.kind === 'facility' && (
                        <rect x="-12" y="-10" width="24" height="18" rx="2" fill="#DECBB2" stroke="#2A1A14" strokeWidth="1.5" />
                      )}
                      {s.kind === 'stall-zone' && (
                        <path d="M-14,6 Q-16,-6 0,-6 Q16,-6 14,6 Z" fill="#A98258" stroke="#2A1A14" strokeWidth="1.5" />
                      )}
                      {s.kind === 'event-venue' && (
                        <circle cx="0" cy="-2" r="8" fill="#1B2257" stroke="#2A1A14" strokeWidth="1.5" />
                      )}
                      {s.kind === 'finale' && (
                        <polygon points="0,-12 3,-3 12,-3 5,3 8,12 0,6 -8,12 -5,3 -12,-3 -3,-3" fill="#E8D9B0" stroke="#8E2A2A" strokeWidth="1" />
                      )}
                    </g>

                    {/* Stamped Badge on Top of Stop */}
                    <g transform="translate(0, -42)">
                      <circle
                        cx="0"
                        cy="0"
                        r="11"
                        fill={isStart ? '#10B981' : isDest ? '#E04A7B' : '#8E2A2A'}
                        stroke="#FFF6E5"
                        strokeWidth="1.5"
                      />
                      <text x="0" y="3.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#FFF6E5">
                        {isStart ? 'START' : isDest ? 'END' : stopEvents.length > 0 ? stopEvents.length : '•'}
                      </text>
                    </g>

                    {/* Events count badge */}
                    {stopEvents.length > 0 && (
                      <g transform="translate(36, -34)">
                        <rect x="-10" y="-8" width="20" height="13" rx="4" fill="#801838" stroke="#2A1A14" strokeWidth="1" />
                        <text x="0" y="1" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#FFF6E5">
                          {stopEvents.length} ev
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* ========================================================
                  4. "YOU ARE HERE" START MARKER
              ======================================================== */}
              <g transform={`translate(${startStop.x}, ${startStop.y})`} className="pointer-events-none">
                <circle cx="0" cy="0" r="28" fill="#10B981" opacity="0.2" className="animate-ping" />
                <g transform="translate(0, -60)">
                  <rect
                    x="-42"
                    y="-13"
                    width="84"
                    height="22"
                    rx="11"
                    fill="#10B981"
                    stroke="#FFF6E5"
                    strokeWidth="1.5"
                    filter="drop-shadow(0 3px 6px rgba(0,0,0,0.4))"
                  />
                  <text
                    x="0"
                    y="2"
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="bold"
                    fill="#FFF6E5"
                    fontFamily="Poppins, sans-serif"
                  >
                    YOU ARE HERE
                  </text>
                </g>
              </g>

              {/* ========================================================
                  5. DESTINATION MARKER PIN
              ======================================================== */}
              <g transform={`translate(${destStop.x}, ${destStop.y})`} className="pointer-events-none">
                <g transform="translate(0, -60)">
                  <rect
                    x="-42"
                    y="-13"
                    width="84"
                    height="22"
                    rx="11"
                    fill="#E04A7B"
                    stroke="#FFF6E5"
                    strokeWidth="1.5"
                    filter="drop-shadow(0 3px 6px rgba(0,0,0,0.4))"
                  />
                  <text
                    x="0"
                    y="2"
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="bold"
                    fill="#FFF6E5"
                    fontFamily="Poppins, sans-serif"
                  >
                    DESTINATION ⚑
                  </text>
                </g>
              </g>

              {/* ========================================================
                  6. ANIMATED MASCOT WALKER SPRITE ALONG THE PATH
              ======================================================== */}
              <g
                transform={`translate(${walkerCoords.x}, ${walkerCoords.y})`}
                className="pointer-events-none transition-transform duration-75"
              >
                {/* Ground shadow beneath character */}
                <ellipse cx="0" cy="14" rx="14" ry="5" fill="rgba(0,0,0,0.35)" />

                {/* Walker Avatar Container with walking bob */}
                <g
                  transform={`scale(${walkerCoords.facingLeft ? -1 : 1}, 1) translate(0, ${
                    isWalking ? Math.sin(walkProgress * 40) * 3 - 2 : 0
                  })`}
                >
                  <g transform="translate(-18, -36)">
                    {/* Circular gold border & portrait portal */}
                    <circle cx="18" cy="18" r="19" fill="#E8D9B0" />
                    <circle cx="18" cy="18" r="17" fill="#060A1C" />
                    <clipPath id="mascot-walker-clip">
                      <circle cx="18" cy="18" r="16" />
                    </clipPath>
                    <image
                      href={mascotPostieImg}
                      x="2"
                      y="2"
                      width="32"
                      height="32"
                      clipPath="url(#mascot-walker-clip)"
                      preserveAspectRatio="xMidYMid slice"
                    />
                    {/* Little satchel accent badge */}
                    <circle cx="30" cy="28" r="5" fill="#B3345C" stroke="#FFF6E5" strokeWidth="1" />
                  </g>
                </g>

                {/* Destination arrival celebration banner */}
                {hasArrived && (
                  <g transform="translate(0, -45)">
                    <rect
                      x="-44"
                      y="-12"
                      width="88"
                      height="20"
                      rx="10"
                      fill="#10B981"
                      stroke="#FFF6E5"
                      strokeWidth="1.5"
                      filter="drop-shadow(0 2px 5px rgba(0,0,0,0.4))"
                    />
                    <text x="0" y="2" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#FFF6E5">
                      ★ Arrived!
                    </text>
                  </g>
                )}
              </g>
            </svg>
          </div>
        </div>

        {/* Right: Selected Landmark Inspector & Live Events Drawer */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Active Landmark Card */}
          <div className="rounded-2xl bg-[#060A1C]/95 border-2 border-[#E8D9B0]/30 p-6 shadow-xl backdrop-blur-md">
            {selectedStop ? (
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-[#E8D9B0]/20">
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wider text-[#38BDF8]">
                      CAMPUS VENUE // {selectedStop.kind.toUpperCase()}
                    </span>
                    <h3 className="font-display font-black text-xl text-[#FFF6E5] uppercase mt-1">
                      {selectedStop.name}
                    </h3>
                    <p className="font-eyebrow text-xs text-[#E8D9B0]/80 mt-0.5">
                      {selectedStop.subtitle}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#1B2257] border border-[#E8D9B0]/40 flex items-center justify-center text-[#E8D9B0]">
                    <MapPin className="w-5 h-5 text-[#E04A7B]" />
                  </div>
                </div>

                <p className="font-sans text-xs text-[#FFF6E5]/80 leading-relaxed mt-3">
                  {selectedStop.description}
                </p>

                {/* Quick actions for selected stop */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setDestStopId(selectedStop.id);
                      soundFx.playClick();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase transition-all ${
                      destStopId === selectedStop.id
                        ? 'bg-[#E04A7B] text-[#FFF6E5]'
                        : 'bg-[#1B2257] text-[#E8D9B0] hover:text-[#FFF6E5]'
                    }`}
                  >
                    Set as Destination
                  </button>

                  <button
                    onClick={() => {
                      setStartStopId(selectedStop.id);
                      soundFx.playClick();
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('festora_trail_start', selectedStop.id);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase transition-all ${
                      startStopId === selectedStop.id
                        ? 'bg-emerald-600 text-[#FFF6E5]'
                        : 'bg-[#10142E] text-[#E8D9B0] hover:text-[#FFF6E5]'
                    }`}
                  >
                    I am Here
                  </button>
                </div>

                {/* Turn-by-Turn Route Details */}
                {activeRoute && (
                  <div className="mt-5 p-4 rounded-xl bg-[#10142E] border border-[#E8D9B0]/25 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-mono text-[#E8D9B0]">
                      <span className="flex items-center gap-1.5">
                        <Footprints className="w-4 h-4 text-[#38BDF8]" />
                        <strong>{activeRoute.totalDistanceMetres}m</strong> walk distance
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-emerald-400" />
                        <strong>~{activeRoute.walkingTimeMinutes} min</strong> walk time
                      </span>
                    </div>

                    <div className="text-[11px] text-[#FFF6E5]/75 font-sans mt-2 space-y-1">
                      <span className="text-[#E8D9B0] font-bold block">Turn-by-turn guidance:</span>
                      {activeRoute.steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <span className="text-[#E04A7B] font-bold">{idx + 1}.</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Events Happening at this Stop */}
                {eventsByStopId.get(selectedStop.id) &&
                  (eventsByStopId.get(selectedStop.id)?.length || 0) > 0 && (
                    <div className="mt-5 space-y-2.5">
                      <span className="text-xs font-mono text-[#E8D9B0] uppercase block tracking-wider">
                        Events at this location ({eventsByStopId.get(selectedStop.id)?.length})
                      </span>
                      <div className="space-y-2">
                        {eventsByStopId.get(selectedStop.id)?.map((ev) => (
                          <div
                            key={ev.id}
                            onClick={() => onSelectEvent?.(ev)}
                            className="p-3 rounded-xl bg-[#10142E] border border-[#E8D9B0]/20 hover:border-[#E8D9B0]/50 transition-all cursor-pointer flex items-center justify-between group"
                          >
                            <div>
                              <h4 className="font-display font-bold text-xs text-[#FFF6E5] uppercase group-hover:text-gold-gradient">
                                {ev.title}
                              </h4>
                              <p className="text-[10px] text-[#E8D9B0]/70 mt-0.5">
                                {ev.time} • {ev.category}
                              </p>
                            </div>
                            <span className="text-xs text-[#E8D9B0] font-bold">Details →</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-[#E8D9B0]/60">
                Tap any landmark on the campus road map to inspect.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
