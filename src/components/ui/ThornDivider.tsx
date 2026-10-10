import React from 'react';

interface ThornDividerProps {
  label?: string;
  className?: string;
  glow?: boolean;
}

export const ThornDivider: React.FC<ThornDividerProps> = ({
  label,
  className = '',
  glow = true,
}) => {
  return (
    <div className={`relative flex items-center justify-center my-6 ${className}`}>
      {/* Left Thorn Line */}
      <div className="flex-1 flex items-center">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#E8D9B0]/40 to-[#E8D9B0]" />
        <svg
          viewBox="0 0 40 12"
          className="w-10 h-3 text-[#E8D9B0] fill-current shrink-0 -mr-1"
          preserveAspectRatio="none"
        >
          <path d="M0,6 L15,3 L25,6 L35,1 L40,6 L35,11 L25,6 L15,9 Z" />
        </svg>
      </div>

      {/* Center Crest / Label / Gem */}
      <div className="mx-3 flex items-center gap-2.5">
        <span
          className={`w-2.5 h-2.5 rotate-45 bg-[#B3345C] border border-[#E8D9B0] ${
            glow ? 'shadow-[0_0_8px_#E04A7B]' : ''
          }`}
        />
        {label && (
          <span className="font-heading text-xs uppercase tracking-widest text-[#E8D9B0] font-semibold select-none">
            {label}
          </span>
        )}
        <span
          className={`w-2.5 h-2.5 rotate-45 bg-[#B3345C] border border-[#E8D9B0] ${
            glow ? 'shadow-[0_0_8px_#E04A7B]' : ''
          }`}
        />
      </div>

      {/* Right Thorn Line */}
      <div className="flex-1 flex items-center">
        <svg
          viewBox="0 0 40 12"
          className="w-10 h-3 text-[#E8D9B0] fill-current shrink-0 -ml-1 rotate-180"
          preserveAspectRatio="none"
        >
          <path d="M0,6 L15,3 L25,6 L35,1 L40,6 L35,11 L25,6 L15,9 Z" />
        </svg>
        <div className="h-[1px] w-full bg-gradient-to-l from-transparent via-[#E8D9B0]/40 to-[#E8D9B0]" />
      </div>
    </div>
  );
};
