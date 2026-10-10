import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ParticipantCharacterTraits } from '../types';
import { generateProceduralCharacter } from '../utils/proceduralCharacter';

interface ParticipantPortraitProps {
  traits?: ParticipantCharacterTraits;
  seedCode?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  celebrate?: boolean;
}

export const ParticipantPortrait: React.FC<ParticipantPortraitProps> = ({
  traits,
  seedCode,
  size = 'md',
  className = '',
  celebrate = false,
}) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const shouldReduceMotion = useReducedMotion();

  const activeTraits = traits || generateProceduralCharacter(seedCode || 'CAMPUS-USER');

  const sizeClasses = {
    sm: 'w-16 h-20',
    md: 'w-24 h-32',
    lg: 'w-36 h-48',
    xl: 'w-48 h-64',
  }[size];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 16;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-block select-none ${sizeClasses} ${className}`}
      style={{ perspective: 600 }}
    >
      {/* Outer Ornate Oval Gold Frame (Image 4 Inspiration) */}
      <motion.div
        animate={
          celebrate
            ? { y: [-6, 0, -4, 0], scale: [1, 1.06, 1] }
            : {
                rotateY: tilt.x,
                rotateX: -tilt.y,
              }
        }
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="w-full h-full relative rounded-[50%/40%] p-1.5 bg-gradient-to-b from-[#E8D9B0] via-[#C5A059] to-[#805820] shadow-[0_8px_20px_rgba(0,0,0,0.6),0_0_15px_rgba(232,217,176,0.3)] flex items-center justify-center overflow-hidden"
      >
        {/* Inner filigree gold rim */}
        <div className="w-full h-full rounded-[50%/40%] p-1 bg-[#060A1C] border border-[#E8D9B0]/60 relative overflow-hidden flex items-center justify-center">
          {/* Ambient Glow */}
          <div
            className="absolute inset-0 blur-md pointer-events-none opacity-60"
            style={{ backgroundColor: activeTraits.glowColor }}
          />

          {/* If Custom Avatar URL exists */}
          {activeTraits.avatarUrl ? (
            <img
              src={activeTraits.avatarUrl}
              alt="Participant Portrait"
              className="w-full h-full object-cover rounded-[50%/40%]"
            />
          ) : (
            /* Layered Procedural SVG Avatar Rig */
            <svg
              viewBox="0 0 100 120"
              className="w-full h-full relative z-10"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Back Hair (for long / wavy hairstyles) */}
              {(activeTraits.hairStyle === 'wavy-shoulder' ||
                activeTraits.hairStyle === 'high-ponytail') && (
                <path
                  d="M25,50 Q18,85 24,105 Q50,110 76,105 Q82,85 75,50 Z"
                  fill={activeTraits.hairColor}
                />
              )}

              {/* Torso & Collegiate Jacket */}
              <path
                d="M18,120 L28,88 Q50,92 72,88 L82,120 Z"
                fill={activeTraits.outfitColor}
              />
              {/* Collar & Tie / Crest */}
              <path d="M40,88 L50,102 L60,88 Z" fill="#FFF6E5" />
              <path d="M48,94 L52,94 L50,112 Z" fill="#B3345C" />

              {/* Neck */}
              <rect
                x="44"
                y="74"
                width="12"
                height="16"
                rx="3"
                fill={activeTraits.skinTone}
              />

              {/* Head Base */}
              <ellipse
                cx="50"
                cy="52"
                rx="24"
                ry="27"
                fill={activeTraits.skinTone}
              />

              {/* Ears */}
              <ellipse
                cx="26"
                cy="54"
                rx="4"
                ry="6"
                fill={activeTraits.skinTone}
              />
              <ellipse
                cx="74"
                cy="54"
                rx="4"
                ry="6"
                fill={activeTraits.skinTone}
              />
              {activeTraits.accessory === 'Star Earring' && (
                <polygon
                  points="26,59 27,61 30,61 27,63 28,66 26,64 24,66 25,63 22,61 25,61"
                  fill="#E8D9B0"
                />
              )}

              {/* Cheeks blush */}
              <ellipse
                cx="37"
                cy="60"
                rx="4"
                ry="2"
                fill="#F43F5E"
                opacity="0.3"
              />
              <ellipse
                cx="63"
                cy="60"
                rx="4"
                ry="2"
                fill="#F43F5E"
                opacity="0.3"
              />

              {/* Eyes */}
              <ellipse cx="38" cy="52" rx="4" ry="4.5" fill="#18181B" />
              <circle cx="39.5" cy="50.5" r="1.5" fill="#FFFFFF" />
              <ellipse cx="62" cy="52" rx="4" ry="4.5" fill="#18181B" />
              <circle cx="63.5" cy="50.5" r="1.5" fill="#FFFFFF" />

              {/* Eyebrows */}
              <path
                d="M34,44 Q38,42 43,44"
                stroke={activeTraits.hairColor}
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M57,44 Q62,42 66,44"
                stroke={activeTraits.hairColor}
                strokeWidth="2"
                fill="none"
              />

              {/* Nose */}
              <path
                d="M49,54 Q50,58 52,58"
                stroke="#6B4627"
                strokeWidth="1.2"
                fill="none"
              />

              {/* Mouth based on expression */}
              {activeTraits.expression.includes('Smile') ||
              activeTraits.expression.includes('Grin') ? (
                <path
                  d="M44,65 Q50,72 56,65"
                  stroke="#881337"
                  strokeWidth="2"
                  fill="#FFFFFF"
                />
              ) : (
                <path
                  d="M44,66 Q50,68 56,66"
                  stroke="#881337"
                  strokeWidth="2"
                  fill="none"
                />
              )}

              {/* Hairstyle Rig */}
              {activeTraits.hairStyle === 'curly-fade' && (
                <g fill={activeTraits.hairColor}>
                  <path d="M26,45 Q24,20 50,18 Q76,20 74,45 Q70,28 50,26 Q30,28 26,45 Z" />
                  <circle cx="34" cy="24" r="6" />
                  <circle cx="44" cy="20" r="7" />
                  <circle cx="56" cy="20" r="7" />
                  <circle cx="66" cy="24" r="6" />
                </g>
              )}
              {activeTraits.hairStyle === 'anime-spikes' && (
                <path
                  d="M24,48 L22,28 L34,32 L40,16 L50,28 L60,14 L68,30 L78,24 L76,48 Q50,30 24,48 Z"
                  fill={activeTraits.hairColor}
                />
              )}
              {activeTraits.hairStyle === 'side-part' && (
                <path
                  d="M24,48 Q26,22 50,20 Q76,22 76,46 Q64,30 45,30 Q28,34 24,48 Z"
                  fill={activeTraits.hairColor}
                />
              )}
              {activeTraits.hairStyle === 'high-ponytail' && (
                <g fill={activeTraits.hairColor}>
                  <path d="M26,45 Q26,22 50,20 Q74,22 74,45 Q60,30 50,30 Q40,30 26,45 Z" />
                  <circle cx="68" cy="18" r="9" />
                </g>
              )}
              {activeTraits.hairStyle === 'sleek-bob' && (
                <path
                  d="M23,62 L22,35 Q26,18 50,18 Q74,18 78,35 L77,62 Q70,40 50,40 Q30,40 23,62 Z"
                  fill={activeTraits.hairColor}
                />
              )}
              {activeTraits.hairStyle === 'wavy-shoulder' && (
                <path
                  d="M24,65 Q22,30 50,22 Q78,30 76,65 Q70,36 50,34 Q30,36 24,65 Z"
                  fill={activeTraits.hairColor}
                />
              )}

              {/* Accessory Layer */}
              {activeTraits.accessory === 'Round Gold Glasses' && (
                <g stroke="#E8D9B0" strokeWidth="1.8" fill="rgba(255,255,255,0.15)">
                  <circle cx="38" cy="52" r="7" />
                  <circle cx="62" cy="52" r="7" />
                  <line x1="45" y1="52" x2="55" y2="52" />
                  <line x1="31" y1="52" x2="26" y2="50" />
                  <line x1="69" y1="52" x2="74" y2="50" />
                </g>
              )}
              {activeTraits.accessory === 'Cyber Headset' && (
                <g>
                  <path
                    d="M25,52 Q24,18 50,18 Q76,18 75,52"
                    stroke="#38BDF8"
                    strokeWidth="3"
                    fill="none"
                  />
                  <rect
                    x="21"
                    y="46"
                    width="6"
                    height="14"
                    rx="2"
                    fill="#38BDF8"
                  />
                  <rect
                    x="73"
                    y="46"
                    width="6"
                    height="14"
                    rx="2"
                    fill="#38BDF8"
                  />
                  <path
                    d="M25,56 Q28,68 40,68"
                    stroke="#38BDF8"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <circle cx="41" cy="68" r="2.5" fill="#E04A7B" />
                </g>
              )}
              {activeTraits.accessory === 'Campus Scarf' && (
                <path
                  d="M32,76 Q50,86 68,76 Q72,88 50,88 Q28,88 32,76 Z"
                  fill="#B3345C"
                  stroke="#E8D9B0"
                  strokeWidth="1"
                />
              )}
              {activeTraits.accessory === 'Campus Beanie' && (
                <path
                  d="M24,38 Q25,12 50,12 Q75,12 76,38 Z"
                  fill="#B3345C"
                  stroke="#E8D9B0"
                  strokeWidth="1.5"
                />
              )}
            </svg>
          )}

          {/* Oval Glass Sheen */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
        </div>

        {/* Top/Bottom Mini Gold Crests */}
        <div className="absolute -top-1 w-3 h-3 rotate-45 bg-[#E8D9B0] border border-[#805820] shadow-sm" />
        <div className="absolute -bottom-1 w-3 h-3 rotate-45 bg-[#E8D9B0] border border-[#805820] shadow-sm" />
      </motion.div>
    </div>
  );
};
