import React from 'react';

interface OrnateFrameProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const OrnateFrame: React.FC<OrnateFrameProps> = ({
  children,
  className = '',
  glow = false,
}) => {
  return (
    <div
      className={`relative bg-[#060A1C]/85 backdrop-blur-md border border-[#E8D9B0]/25 rounded-sm p-6 shadow-2xl ${
        glow ? 'shadow-[0_0_30px_rgba(179,52,92,0.15)]' : ''
      } ${className}`}
    >
      {/* Corner Filigree Brackets */}
      <span className="pointer-events-none absolute -top-[2px] -left-[2px] w-3 h-3 border-t-2 border-l-2 border-[#E8D9B0]" />
      <span className="pointer-events-none absolute -top-[2px] -right-[2px] w-3 h-3 border-t-2 border-r-2 border-[#E8D9B0]" />
      <span className="pointer-events-none absolute -bottom-[2px] -left-[2px] w-3 h-3 border-b-2 border-l-2 border-[#E8D9B0]" />
      <span className="pointer-events-none absolute -bottom-[2px] -right-[2px] w-3 h-3 border-b-2 border-r-2 border-[#E8D9B0]" />

      {/* Tiny corner dots */}
      <span className="pointer-events-none absolute top-1.5 left-1.5 w-1 h-1 rounded-full bg-[#E8D9B0]/40" />
      <span className="pointer-events-none absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-[#E8D9B0]/40" />
      <span className="pointer-events-none absolute bottom-1.5 left-1.5 w-1 h-1 rounded-full bg-[#E8D9B0]/40" />
      <span className="pointer-events-none absolute bottom-1.5 right-1.5 w-1 h-1 rounded-full bg-[#E8D9B0]/40" />

      {children}
    </div>
  );
};
