import React, { useRef, useState, useEffect } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useReducedMotion,
} from 'motion/react';
import { ASSET_3D } from '../assets/images';
import { CampusEvent, ActiveRole } from '../types';
import { Flourish } from './Flourish';
import {
  Sparkles,
  ChevronDown,
  ArrowRight,
  Compass,
  User,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { postalSoundFx } from '../utils/audio';

interface ScrollStoryProps {
  events: CampusEvent[];
  onSelectRole: (role: ActiveRole) => void;
  onSelectCategory: (category: string) => void;
}

interface ChapterData {
  id: string;
  chapterNumber: string;
  category: string;
  title: string;
  copy: string;
  asset: string;
  glowColor: string;
  accentColor: string;
}

const CHAPTERS: ChapterData[] = [
  {
    id: 'tech',
    chapterNumber: 'Chapter I',
    category: 'Tech',
    title: 'TURING CITADEL',
    copy: 'High-octane hackathons, AI architectures, and neural agent laboratories where code shapes reality.',
    asset: ASSET_3D.tech,
    glowColor: '#38BDF8',
    accentColor: '#0284C7',
  },
  {
    id: 'cultural',
    chapterNumber: 'Chapter II',
    category: 'Cultural',
    title: 'CELESTIAL REVELRY',
    copy: 'Battle of the bands, classical fusion choreography, star nights, and street food corridors.',
    asset: ASSET_3D.cultural,
    glowColor: '#E04A7B',
    accentColor: '#B3345C',
  },
  {
    id: 'sports',
    chapterNumber: 'Chapter III',
    category: 'Sports',
    title: 'ARENA OF VALOR',
    copy: 'Floodlit futsal cups, esports showdowns, virtual combat rigs, and department championships.',
    asset: ASSET_3D.gaming,
    glowColor: '#A855F7',
    accentColor: '#6366F1',
  },
  {
    id: 'workshop',
    chapterNumber: 'Chapter IV',
    category: 'Workshop',
    title: 'FORGE OF CREATION',
    copy: 'Combat robotics arenas, 3D printing farms, hardware tinker labs, and expert masterclasses.',
    asset: ASSET_3D.workshop,
    glowColor: '#F59E0B',
    accentColor: '#D97706',
  },
];

export const ScrollStory: React.FC<ScrollStoryProps> = ({
  events,
  onSelectRole,
  onSelectCategory,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll tracking across the ~600vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 24,
    mass: 0.5,
  });

  // Mouse parallax on Scene 0 (Hero QR Badge)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateXSpring = useSpring(useTransform(mouseY, [-0.5, 0.5], [16, -16]), {
    stiffness: 160,
    damping: 18,
  });
  const rotateYSpring = useSpring(useTransform(mouseX, [-0.5, 0.5], [-16, 16]), {
    stiffness: 160,
    damping: 18,
  });

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleHeroMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Scene 0 (Hero) Transformations [0.00 -> 0.18]
  const heroOpacity = useTransform(smoothProgress, [0.0, 0.14, 0.20], [1, 1, 0]);
  const heroScale = useTransform(smoothProgress, [0.0, 0.18], [1, 1.15]);
  const heroBlur = useTransform(smoothProgress, [0.0, 0.18], ['blur(0px)', 'blur(10px)']);
  const heroPointerEvents = useTransform(smoothProgress, (v) => (v < 0.18 ? 'auto' : 'none'));

  // Scene 1: Tech [0.18 -> 0.38]
  const c1Opacity = useTransform(smoothProgress, [0.16, 0.22, 0.34, 0.40], [0, 1, 1, 0]);
  const c1ImageX = useTransform(smoothProgress, [0.16, 0.24, 0.34, 0.40], [-60, 0, 0, 60]);
  const c1ImageRotate = useTransform(smoothProgress, [0.16, 0.24, 0.34, 0.40], [-10, 0, 0, 8]);
  const c1TextY = useTransform(smoothProgress, [0.16, 0.24, 0.34, 0.40], [40, 0, 0, -30]);
  const c1Blur = useTransform(smoothProgress, [0.16, 0.22, 0.34, 0.40], ['blur(8px)', 'blur(0px)', 'blur(0px)', 'blur(8px)']);
  const c1Pointer = useTransform(smoothProgress, (v) => (v >= 0.18 && v < 0.38 ? 'auto' : 'none'));

  // Scene 2: Cultural [0.38 -> 0.58]
  const c2Opacity = useTransform(smoothProgress, [0.36, 0.42, 0.54, 0.60], [0, 1, 1, 0]);
  const c2ImageX = useTransform(smoothProgress, [0.36, 0.44, 0.54, 0.60], [60, 0, 0, -60]);
  const c2ImageRotate = useTransform(smoothProgress, [0.36, 0.44, 0.54, 0.60], [10, 0, 0, -8]);
  const c2TextY = useTransform(smoothProgress, [0.36, 0.44, 0.54, 0.60], [40, 0, 0, -30]);
  const c2Blur = useTransform(smoothProgress, [0.36, 0.42, 0.54, 0.60], ['blur(8px)', 'blur(0px)', 'blur(0px)', 'blur(8px)']);
  const c2Pointer = useTransform(smoothProgress, (v) => (v >= 0.38 && v < 0.58 ? 'auto' : 'none'));

  // Scene 3: Sports [0.58 -> 0.78]
  const c3Opacity = useTransform(smoothProgress, [0.56, 0.62, 0.74, 0.80], [0, 1, 1, 0]);
  const c3ImageX = useTransform(smoothProgress, [0.56, 0.64, 0.74, 0.80], [-60, 0, 0, 60]);
  const c3ImageRotate = useTransform(smoothProgress, [0.56, 0.64, 0.74, 0.80], [-10, 0, 0, 8]);
  const c3TextY = useTransform(smoothProgress, [0.56, 0.64, 0.74, 0.80], [40, 0, 0, -30]);
  const c3Blur = useTransform(smoothProgress, [0.56, 0.62, 0.74, 0.80], ['blur(8px)', 'blur(0px)', 'blur(0px)', 'blur(8px)']);
  const c3Pointer = useTransform(smoothProgress, (v) => (v >= 0.58 && v < 0.78 ? 'auto' : 'none'));

  // Scene 4: Workshop [0.78 -> 1.00]
  const c4Opacity = useTransform(smoothProgress, [0.76, 0.82, 0.94, 1.0], [0, 1, 1, 0.2]);
  const c4ImageX = useTransform(smoothProgress, [0.76, 0.84, 0.94, 1.0], [60, 0, 0, -40]);
  const c4ImageRotate = useTransform(smoothProgress, [0.76, 0.84, 0.94, 1.0], [10, 0, 0, -6]);
  const c4TextY = useTransform(smoothProgress, [0.76, 0.84, 0.94, 1.0], [40, 0, 0, -20]);
  const c4Blur = useTransform(smoothProgress, [0.76, 0.82, 0.96, 1.0], ['blur(8px)', 'blur(0px)', 'blur(0px)', 'blur(4px)']);
  const c4Pointer = useTransform(smoothProgress, (v) => (v >= 0.78 ? 'auto' : 'none'));

  // "Scroll to explore" hint fades after scroll
  const scrollHintOpacity = useTransform(smoothProgress, [0, 0.06], [1, 0]);

  // Progress rail fill height
  const railFillHeight = useTransform(smoothProgress, [0, 1], ['0%', '100%']);

  // Handle smooth scroll to notice board section
  const handleBrowseCategory = (category: string) => {
    postalSoundFx.playTypewriterTick();
    onSelectCategory(category);
    const target = document.getElementById('notice-board-preview');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-[580vh] select-none">
      {/* 100svh STICKY CINEMATIC STAGE */}
      <div
        ref={stageRef}
        className="sticky top-0 h-[100svh] w-full overflow-hidden flex flex-col justify-between dark-fantasy-bg"
      >
        {/* Subtle Ambient Film Grain & Ruined Spires along bottom */}
        <div className="absolute inset-0 film-grain z-0" />
        <div className="absolute inset-0 dark-vignette z-0" />
        <div className="absolute inset-x-0 bottom-0 h-44 spires-silhouette opacity-65 z-0 pointer-events-none" />

        {/* FLOATING EMBER PARTICLES (Background) */}
        {!shouldReduceMotion && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {Array.from({ length: 18 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  left: `${(i * 5.8 + 8) % 94}%`,
                  bottom: `-10px`,
                  backgroundColor: i % 2 === 0 ? '#E04A7B' : '#E8D9B0',
                  boxShadow: i % 2 === 0 ? '0 0 10px #E04A7B' : '0 0 10px #E8D9B0',
                }}
                animate={{
                  y: [0, -900],
                  x: [0, (i % 2 === 0 ? 30 : -30)],
                  opacity: [0, 0.75, 0],
                  scale: [0.6, 1.2, 0.4],
                }}
                transition={{
                  duration: 9 + (i % 5) * 2,
                  repeat: Infinity,
                  delay: (i * 0.7) % 7,
                  ease: 'linear',
                }}
              />
            ))}
          </div>
        )}

        {/* ================================================================
            SCENE 0: HERO (ENTER THE WORLD OF FESTORA)
            ================================================================ */}
        <motion.div
          style={{
            opacity: heroOpacity,
            scale: shouldReduceMotion ? 1 : heroScale,
            filter: shouldReduceMotion ? 'none' : heroBlur,
            pointerEvents: heroPointerEvents,
          }}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 sm:px-6 pt-16 pb-12"
        >
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
            {/* Cormorant Garamond italic eyebrow */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-eyebrow text-base sm:text-lg lg:text-xl text-[#E8D9B0] tracking-[0.2em] uppercase"
            >
              Enter the Realm of Student Dispatches
            </motion.div>

            {/* Engraved Serif Headline in Ivory & Gold */}
            <motion.h1
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-black text-4xl sm:text-6xl lg:text-7xl uppercase tracking-wider text-gold-gradient mt-2 leading-[1.08] max-w-3xl"
            >
              ENTER THE WORLD OF <br className="hidden sm:inline" />
              <span className="text-[#FFF6E5] drop-shadow-[0_0_35px_rgba(232,217,176,0.35)]">
                FESTORA
              </span>
            </motion.h1>

            {/* Ornate Flourish Divider */}
            <Flourish className="w-56 sm:w-72 h-6 my-3" color="#E8D9B0" delay={0.4} />

            <motion.p
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="font-sans text-xs sm:text-sm text-[#FFF6E5]/80 max-w-xl leading-relaxed"
            >
              The central festival nexus and ceremonial notice board. Register for hackathons,
              cultural galas, sports tournaments, and claim your cryptographic entry pass.
            </motion.p>

            {/* 3D QR ACCESS BADGE WITH MOUSE-PARALLAX TILT */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6, type: 'spring', damping: 20 }}
              className="relative my-4 sm:my-6 cursor-pointer group"
              onMouseMove={handleHeroMouseMove}
              onMouseLeave={handleHeroMouseLeave}
              style={{
                perspective: 1000,
              }}
            >
              {/* Soft coloured glow circle behind 3D badge */}
              <div className="absolute inset-0 -m-8 rounded-full bg-gradient-to-tr from-[#5B2A86]/60 via-[#B3345C]/40 to-[#0284C7]/30 blur-[60px] pointer-events-none group-hover:scale-110 transition-transform duration-500" />

              <motion.div
                style={{
                  rotateX: shouldReduceMotion ? 0 : rotateXSpring,
                  rotateY: shouldReduceMotion ? 0 : rotateYSpring,
                  transformStyle: 'preserve-3d',
                }}
                className="relative z-10 w-44 h-44 sm:w-56 sm:h-56 rounded-3xl p-2 flex items-center justify-center border border-[#E8D9B0]/25 glass-panel-subtle shadow-[0_12px_40px_rgba(0,0,0,0.6)] group-hover:border-[#E8D9B0]/60 transition-colors"
              >
                <img
                  src={ASSET_3D.qrPass}
                  alt="Cryptographic Campus Access Badge"
                  className="w-full h-full object-contain rounded-2xl"
                  style={{
                    mixBlendMode: 'screen',
                    maskImage: 'radial-gradient(circle at center, black 65%, transparent 100%)',
                    WebkitMaskImage: 'radial-gradient(circle at center, black 65%, transparent 100%)',
                  }}
                />
              </motion.div>
            </motion.div>

            {/* CALL TO ACTION BUTTONS: Crimson pill, Glass pill, Ghost pill */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.75 }}
              className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-1"
            >
              {/* Crimson Glow Pill */}
              <button
                onClick={() => {
                  postalSoundFx.playTypewriterTick();
                  onSelectRole('student');
                }}
                className="btn-crimson-pill px-7 py-3 text-xs sm:text-sm uppercase tracking-wider gap-2 min-h-[44px]"
              >
                <User className="w-4 h-4 text-[#FFF6E5]" />
                <span>I'm a Student</span>
              </button>

              {/* Glass Indigo Pill */}
              <button
                onClick={() => {
                  postalSoundFx.playTypewriterTick();
                  onSelectRole('organizer');
                }}
                className="btn-glass-pill px-7 py-3 text-xs sm:text-sm uppercase tracking-wider gap-2 min-h-[44px]"
              >
                <ShieldCheck className="w-4 h-4 text-[#E8D9B0]" />
                <span>I'm an Organizer</span>
              </button>

              {/* Ghost Ivory Pill */}
              <button
                onClick={() => {
                  postalSoundFx.playTypewriterTick();
                  onSelectRole('trail');
                }}
                className="btn-ghost-pill px-6 py-3 text-xs sm:text-sm uppercase tracking-wider gap-2 min-h-[44px]"
              >
                <Compass className="w-4 h-4 text-[#E8D9B0]" />
                <span>Trail Map</span>
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* ================================================================
            SCENES 1–4: CHAPTER STAGES (TECH, CULTURAL, SPORTS, WORKSHOP)
            ================================================================ */}
        {CHAPTERS.map((ch, idx) => {
          // Select motion transform maps for chapter
          const opacity = idx === 0 ? c1Opacity : idx === 1 ? c2Opacity : idx === 2 ? c3Opacity : c4Opacity;
          const imageX = idx === 0 ? c1ImageX : idx === 1 ? c2ImageX : idx === 2 ? c3ImageX : c4ImageX;
          const imageRotate = idx === 0 ? c1ImageRotate : idx === 1 ? c2ImageRotate : idx === 2 ? c3ImageRotate : c4ImageRotate;
          const textY = idx === 0 ? c1TextY : idx === 1 ? c2TextY : idx === 2 ? c3TextY : c4TextY;
          const blur = idx === 0 ? c1Blur : idx === 1 ? c2Blur : idx === 2 ? c3Blur : c4Blur;
          const pointer = idx === 0 ? c1Pointer : idx === 1 ? c2Pointer : idx === 2 ? c3Pointer : c4Pointer;

          // Event count for this category
          const categoryEvents = events.filter((e) => e.category === ch.category);
          const liveCount = categoryEvents.filter((e) => e.status === 'LIVE').length;

          // Alternate layout side: even left-image, odd right-image
          const isImageLeft = idx % 2 === 0;

          return (
            <motion.div
              key={ch.id}
              style={{
                opacity,
                filter: shouldReduceMotion ? 'none' : blur,
                pointerEvents: pointer,
              }}
              className="absolute inset-0 z-20 flex items-center justify-center px-4 sm:px-8 py-16"
            >
              <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
                {/* 3D ASSET COLUMN */}
                <motion.div
                  style={{
                    x: shouldReduceMotion ? 0 : imageX,
                    rotate: shouldReduceMotion ? 0 : imageRotate,
                  }}
                  className={`w-full md:w-1/2 flex items-center justify-center relative ${
                    isImageLeft ? 'md:order-1' : 'md:order-2'
                  }`}
                >
                  {/* Blurred colored glow circle behind 3D render */}
                  <div
                    className="absolute w-64 h-64 sm:w-84 sm:h-84 rounded-full blur-[80px] opacity-70 pointer-events-none"
                    style={{ backgroundColor: ch.glowColor }}
                  />

                  {/* 3D Model Render blended into dark background with screen & radial mask */}
                  <div className="relative z-10 w-60 h-60 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-3xl p-3 border border-[#E8D9B0]/20 glass-panel-subtle shadow-[0_16px_48px_rgba(0,0,0,0.6)] flex items-center justify-center">
                    <img
                      src={ch.asset}
                      alt={`${ch.category} 3D Asset`}
                      className="w-full h-full object-contain"
                      style={{
                        mixBlendMode: 'screen',
                        maskImage: 'radial-gradient(circle at center, black 65%, transparent 100%)',
                        WebkitMaskImage: 'radial-gradient(circle at center, black 65%, transparent 100%)',
                      }}
                    />
                  </div>
                </motion.div>

                {/* TEXT & CHAPTER DETAILS COLUMN */}
                <motion.div
                  style={{
                    y: shouldReduceMotion ? 0 : textY,
                  }}
                  className={`w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left ${
                    isImageLeft ? 'md:order-2' : 'md:order-1'
                  }`}
                >
                  {/* Chapter Eyebrow */}
                  <div className="font-eyebrow text-sm sm:text-base text-[#E8D9B0] tracking-[0.25em] uppercase flex items-center gap-2">
                    <span>{ch.chapterNumber}</span>
                    <span className="text-[#E8D9B0]/40">·</span>
                    <span>{ch.category} Domain</span>
                  </div>

                  {/* Gold-gradient Title in Cinzel */}
                  <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-wider text-gold-gradient mt-2 leading-tight">
                    {ch.title}
                  </h2>

                  {/* Flourish Divider */}
                  <div className="w-full flex justify-center md:justify-start">
                    <Flourish className="w-48 sm:w-60 h-6 my-3" color="#E8D9B0" delay={0.1} />
                  </div>

                  {/* One-line copy */}
                  <p className="font-sans text-xs sm:text-sm text-[#FFF6E5]/80 max-w-md leading-relaxed">
                    {ch.copy}
                  </p>

                  {/* Live Count & Event Count Chips */}
                  <div className="flex items-center gap-3 mt-4 text-xs font-sans">
                    <span className="px-3 py-1 rounded-full bg-[#1B2257]/70 border border-[#E8D9B0]/25 text-[#FFF6E5]">
                      {categoryEvents.length} Active Notice{categoryEvents.length !== 1 ? 's' : ''}
                    </span>
                    {liveCount > 0 && (
                      <span className="px-3 py-1 rounded-full bg-[#B3345C]/80 text-[#FFF6E5] font-semibold flex items-center gap-1.5 shadow-[0_0_12px_#E04A7B]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>{liveCount} Live Arena</span>
                      </span>
                    )}
                  </div>

                  {/* Browse Category Button */}
                  <div className="mt-6">
                    <button
                      onClick={() => handleBrowseCategory(ch.category)}
                      className="btn-crimson-pill px-7 py-3 text-xs sm:text-sm uppercase tracking-wider gap-2 min-h-[44px]"
                    >
                      <span>Explore {ch.category} Notices</span>
                      <ArrowRight className="w-4 h-4 text-[#FFF6E5]" />
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          );
        })}

        {/* ================================================================
            RIGHT-EDGE VERTICAL SCROLL PROGRESS RAIL (Gold -> Crimson)
            ================================================================ */}
        <div className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col items-center gap-3">
          <div className="text-[9px] font-display text-[#E8D9B0]/60 uppercase tracking-widest -rotate-90 origin-center whitespace-nowrap mb-6">
            Scroll Journey
          </div>

          <div className="w-1 h-36 bg-[#1B2257]/80 rounded-full border border-[#E8D9B0]/15 relative overflow-hidden">
            <motion.div
              style={{ height: railFillHeight }}
              className="w-full bg-gradient-to-b from-[#E8D9B0] via-[#E04A7B] to-[#B3345C] shadow-[0_0_8px_#E04A7B]"
            />
          </div>

          <div className="flex flex-col items-center gap-1.5 mt-2">
            {[0, 1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className="w-1.5 h-1.5 rounded-full bg-[#E8D9B0]/30 transition-colors"
              />
            ))}
          </div>
        </div>

        {/* ================================================================
            SCROLL TO EXPLORE HINT (Bottom Center, Fades on Scroll)
            ================================================================ */}
        <motion.div
          style={{ opacity: scrollHintOpacity }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 text-center pointer-events-none"
        >
          <span className="font-eyebrow text-xs tracking-widest text-[#E8D9B0]/75 uppercase">
            Scroll to explore chapters
          </span>
          <ChevronDown className="w-4 h-4 text-[#E8D9B0] animate-bounce" />
        </motion.div>
      </div>
    </div>
  );
};
