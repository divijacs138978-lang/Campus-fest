import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface FlourishProps {
  className?: string;
  color?: string;
  delay?: number;
}

export const Flourish: React.FC<FlourishProps> = ({
  className = 'w-48 h-6 my-2',
  color = '#E8D9B0',
  delay = 0.1,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={`flex items-center justify-center overflow-visible select-none ${className}`}>
      <svg
        viewBox="0 0 240 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
        aria-hidden="true"
      >
        {/* Left flourish wing */}
        <motion.path
          d="M100 12 C85 12 75 6 60 6 C42 6 32 18 16 18 C8 18 4 14 0 12"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={shouldReduceMotion ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.9 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
        />
        {/* Left inner decorative spiral */}
        <motion.path
          d="M60 6 C68 6 72 10 70 14 C68 17 62 16 62 12"
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
          initial={shouldReduceMotion ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.7 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: delay + 0.2, ease: 'easeOut' }}
        />

        {/* Center Ornate Diamond */}
        <motion.polygon
          points="120,4 128,12 120,20 112,12"
          fill={color}
          stroke={color}
          strokeWidth="1"
          initial={shouldReduceMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: delay + 0.3, type: 'spring', stiffness: 260 }}
          className="origin-center"
        />

        {/* Center tiny inner dot */}
        <motion.circle
          cx="120"
          cy="12"
          r="1.8"
          fill="#0B1030"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: delay + 0.45 }}
        />

        {/* Small flanking dots */}
        <motion.circle
          cx="106"
          cy="12"
          r="1.5"
          fill={color}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: delay + 0.35 }}
        />
        <motion.circle
          cx="134"
          cy="12"
          r="1.5"
          fill={color}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: delay + 0.35 }}
        />

        {/* Right flourish wing (mirrored) */}
        <motion.path
          d="M140 12 C155 12 165 6 180 6 C198 6 208 18 224 18 C232 18 236 14 240 12"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={shouldReduceMotion ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.9 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
        />
        {/* Right inner decorative spiral */}
        <motion.path
          d="M180 6 C172 6 168 10 170 14 C172 17 178 16 178 12"
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
          initial={shouldReduceMotion ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.7 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: delay + 0.2, ease: 'easeOut' }}
        />
      </svg>
    </div>
  );
};
