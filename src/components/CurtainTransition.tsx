import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Flourish } from './Flourish';

interface Props {
  isActive: boolean;
  targetPageTitle: string;
}

export const CurtainTransition: React.FC<Props> = ({
  isActive,
  targetPageTitle,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="cinematic-curtain"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          className="fixed inset-0 z-[100] bg-[#060A1C]/96 backdrop-blur-2xl flex flex-col items-center justify-center p-6 pointer-events-none select-none overflow-hidden"
        >
          {/* Subtle ambient violet & crimson background glows */}
          <div className="absolute w-[500px] h-[500px] rounded-full bg-[#5B2A86]/25 blur-[120px] pointer-events-none" />
          <div className="absolute w-[360px] h-[360px] rounded-full bg-[#B3345C]/20 blur-[100px] pointer-events-none translate-y-12" />

          {/* Spires silhouette in background */}
          <div className="absolute inset-x-0 bottom-0 h-40 spires-silhouette opacity-40 pointer-events-none" />

          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto"
          >
            {/* Eyebrow */}
            <span className="font-eyebrow text-sm sm:text-base tracking-[0.25em] text-[#E8D9B0]/80 uppercase">
              Now Entering
            </span>

            {/* Page Title in Cinzel Gold */}
            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-widest uppercase text-gold-gradient mt-2 leading-tight">
              {targetPageTitle}
            </h2>

            {/* Flourish Divider */}
            <Flourish className="w-56 h-6 my-4" color="#E8D9B0" delay={0.05} />

            {/* Crimson Light-Sweep Line */}
            <motion.div
              initial={shouldReduceMotion ? { width: '100%' } : { width: '0%', opacity: 0 }}
              animate={{ width: '100%', opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeInOut' }}
              className="h-[2px] w-64 max-w-full bg-gradient-to-r from-transparent via-[#E04A7B] to-transparent shadow-[0_0_16px_#E04A7B]"
            />

            <span className="font-sans text-[11px] tracking-[0.3em] text-[#FFF6E5]/60 uppercase mt-4">
              Festora Portal
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
