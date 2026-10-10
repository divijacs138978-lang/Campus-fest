import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { mascotPostieImg } from '../assets/characters';
import { soundFx } from '../utils/audio';
import confetti from 'canvas-confetti';

interface MascotPipProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'gate';
  bubbleText?: string;
  className?: string;
  celebrateOnMount?: boolean;
  interactive?: boolean;
}

export const MascotPip: React.FC<MascotPipProps> = ({
  size = 'md',
  bubbleText,
  className = '',
  celebrateOnMount = false,
  interactive = true,
}) => {
  const [isWaving, setIsWaving] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const sizeStyles = {
    sm: 'w-24 h-24',
    md: 'w-36 h-36',
    lg: 'w-52 h-52',
    xl: 'w-72 h-72',
    gate: 'w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60',
  }[size];

  const handlePointerEnter = () => {
    if (!interactive) return;
    setIsWaving(true);
    soundFx.playHover();
  };

  const handlePointerLeave = () => {
    setIsWaving(false);
  };

  const handleClick = () => {
    if (!interactive) return;
    soundFx.playConfirm();
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#E8D9B0', '#B3345C', '#5B2A86', '#FFF6E5'],
      });
    } catch {}
  };

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Speech / Status Bubble */}
      {bubbleText && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="mb-3 relative z-20 px-4 py-2 rounded-2xl bg-[#10142E]/95 border border-[#E8D9B0]/60 shadow-[0_0_20px_rgba(232,217,176,0.3)] text-center max-w-xs sm:max-w-sm"
        >
          <span className="font-heading text-xs sm:text-sm font-semibold text-[#FFF6E5] tracking-wide block leading-snug">
            {bubbleText}
          </span>
          {/* Bubble tail pointing downwards to the character */}
          <div className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 rotate-45 bg-[#10142E] border-r border-b border-[#E8D9B0]/60" />
        </motion.div>
      )}

      {/* Mascot Card / Stage */}
      <motion.div
        onMouseEnter={handlePointerEnter}
        onMouseLeave={handlePointerLeave}
        onClick={handleClick}
        animate={
          shouldReduceMotion
            ? {}
            : isWaving
            ? { y: [-2, -8, -2], rotate: [-1, 2, -1] }
            : { y: [0, -4, 0] }
        }
        transition={{
          duration: isWaving ? 0.6 : 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`relative ${sizeStyles} ${
          interactive ? 'cursor-pointer' : ''
        } group flex items-center justify-center`}
      >
        {/* Soft magical colored aura behind mascot */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#5B2A86]/40 via-[#B3345C]/35 to-[#E8D9B0]/25 blur-2xl group-hover:scale-110 transition-transform duration-500" />

        {/* Ornate Circular Portrait Portal */}
        <div className="relative w-full h-full rounded-3xl p-1.5 bg-gradient-to-b from-[#E8D9B0] via-[#B3345C]/60 to-[#1B2257] shadow-2xl overflow-hidden">
          <div className="w-full h-full rounded-2xl overflow-hidden bg-[#060A1C] relative">
            <img
              src={mascotPostieImg}
              alt="Festora Festival Mascot"
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {/* Subtle gloss highlight */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
