import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Flourish } from './Flourish';

interface PageTransitionProps {
  isActive: boolean;
  pageTitle: string;
  eyebrow?: string;
  backgroundImage?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  isActive,
  pageTitle,
  eyebrow = 'ENTERING THE REALM OF',
  backgroundImage,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="sync">
      {isActive && (
        <motion.div
          key={`page-trans-${pageTitle}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0.2 : 0.45 }}
          className="fixed inset-0 z-[150] pointer-events-none select-none overflow-hidden flex items-center justify-center bg-[#060A1C]"
        >
          {/* Full-bleed background with blur cross-fade and subtle zoom */}
          {backgroundImage && (
            <motion.div
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 1.15, filter: 'blur(20px)' }
              }
              animate={{ opacity: 0.35, scale: 1.05, filter: 'blur(6px)' }}
              exit={{ opacity: 0, scale: 1.25, filter: 'blur(24px)' }}
              transition={{
                duration: shouldReduceMotion ? 0.2 : 1.1,
                ease: [0.76, 0, 0.24, 1],
              }}
              className="absolute inset-0 bg-cover bg-center pointer-events-none"
              style={{ backgroundImage: `url(${backgroundImage})` }}
            />
          )}

          {/* Atmospheric gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1030]/80 via-[#060A1C]/90 to-[#060A1C] pointer-events-none" />

          {/* Colored radial energy auras */}
          <div className="absolute w-[600px] h-[600px] rounded-full bg-[#5B2A86]/30 blur-[140px] pointer-events-none -translate-y-12" />
          <div className="absolute w-[450px] h-[450px] rounded-full bg-[#B3345C]/25 blur-[120px] pointer-events-none translate-y-24" />

          {/* Title sequence: scales down from 2.5x with blur -> sharp */}
          <motion.div
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 2.4, filter: 'blur(20px)' }
            }
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 2.6, filter: 'blur(22px)' }
            }
            transition={{
              duration: shouldReduceMotion ? 0.2 : 1.15,
              ease: [0.76, 0, 0.24, 1],
            }}
            className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl"
          >
            <span className="font-eyebrow text-xs sm:text-sm tracking-[0.3em] text-[#E8D9B0]/80 uppercase mb-2">
              {eyebrow}
            </span>

            <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-[0.18em] text-[#FFF6E5] text-gold-gradient drop-shadow-[0_0_35px_rgba(232,217,176,0.4)] leading-tight">
              {pageTitle}
            </h1>

            <Flourish className="w-64 h-6 my-4" color="#E8D9B0" delay={0.15} />

            <div className="h-[2px] w-48 bg-gradient-to-r from-transparent via-[#E04A7B] to-transparent shadow-[0_0_16px_#E04A7B]" />

            <span className="font-sans text-[11px] tracking-[0.35em] text-[#E8D9B0]/60 uppercase mt-4">
              FESTORA PORTAL • OFFICIAL NOTICE SYSTEM
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
