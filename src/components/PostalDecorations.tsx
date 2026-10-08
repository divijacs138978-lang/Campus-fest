import React from 'react';

/**
 * Vintage Cutout Pointing Hand (pointing right or left)
 * Black & white vintage lithograph style
 */
export const PointingHand: React.FC<{
  direction?: 'left' | 'right' | 'down' | 'up';
  className?: string;
}> = ({ direction = 'right', className = 'w-12 h-6' }) => {
  const rotation =
    direction === 'left'
      ? 'scale-x-[-1]'
      : direction === 'down'
      ? 'rotate-90'
      : direction === 'up'
      ? '-rotate-90'
      : '';

  return (
    <svg
      viewBox="0 0 100 48"
      fill="currentColor"
      className={`inline-block select-none filter drop-shadow-[2px_2px_0px_#2A1A14] ${rotation} ${className}`}
      aria-hidden="true"
    >
      {/* Hand pointing silhouette */}
      <path
        d="M2 20 C2 12, 10 10, 20 10 L45 10 C48 10, 52 8, 55 6 C58 4, 62 4, 65 6 L78 6 L98 22 L75 26 L75 32 C75 36, 70 38, 64 38 L25 38 C12 38, 2 32, 2 20 Z"
        fill="#F3E6CE"
        stroke="#2A1A14"
        strokeWidth="3.5"
      />
      {/* Sleeve cuff details */}
      <rect x="2" y="10" width="12" height="28" fill="#2A1A14" />
      <line x1="14" y1="10" x2="14" y2="38" stroke="#F3E6CE" strokeWidth="2" />
      {/* Extended pointing index finger */}
      <path
        d="M50 16 L94 22 L50 26"
        stroke="#2A1A14"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Folded fingers knuckles */}
      <path d="M48 26 C54 26, 56 30, 50 32" stroke="#2A1A14" strokeWidth="2.5" fill="none" />
      <path d="M42 30 C48 30, 50 34, 44 36" stroke="#2A1A14" strokeWidth="2.5" fill="none" />
    </svg>
  );
};

/**
 * Circular Rubber Stamp (like "ADMIT ONE" or "CHAT FOR INFO!")
 */
export const RoundRubberStamp: React.FC<{
  text?: string;
  subtext?: string;
  color?: 'red' | 'olive' | 'ink';
  className?: string;
}> = ({
  text = 'POST OFFICE • VERIFIED',
  subtext = 'ADMIT ONE',
  color = 'red',
  className = '',
}) => {
  const strokeColor =
    color === 'red' ? '#8E2A2A' : color === 'olive' ? '#5B7A3A' : '#2A1A14';

  return (
    <div
      style={{ color: strokeColor, borderColor: strokeColor }}
      className={`inline-flex flex-col items-center justify-center rounded-full border-2 border-dashed p-2 text-center select-none font-typewriter transform -rotate-6 ${className}`}
    >
      <div
        style={{ borderColor: strokeColor }}
        className="w-full h-full rounded-full border border-solid p-2 flex flex-col items-center justify-center"
      >
        <span className="text-[9px] tracking-widest font-black uppercase block leading-none">
          {text}
        </span>
        <span className="text-xs font-black tracking-wider uppercase block my-0.5">
          {subtext}
        </span>
        <span className="text-[8px] tracking-tighter opacity-70 block font-mono">
          ★ RSVP.POST ★
        </span>
      </div>
    </div>
  );
};

/**
 * Rectangular "IMPORTANT" Rubber Stamp
 */
export const ImportantStamp: React.FC<{
  text?: string;
  className?: string;
}> = ({ text = 'IMPORTANT', className = '' }) => {
  return (
    <div
      className={`rubber-stamp select-none text-xs font-black tracking-[0.2em] transform -rotate-3 ${className}`}
    >
      [ {text} ]
    </div>
  );
};

/**
 * Vintage Postage Stamp with Perforated Teeth
 */
export const PostageStamp: React.FC<{
  price?: string;
  title?: string;
  color?: string;
  className?: string;
}> = ({
  price = '25¢',
  title = 'MAIL',
  color = '#8E2A2A',
  className = 'w-14 h-18',
}) => {
  return (
    <div
      style={{
        boxShadow: '3px 3px 0px #2A1A14',
      }}
      className={`relative p-1 bg-[#F3E6CE] border-2 border-dashed border-[#2A1A14] select-none flex flex-col justify-between items-center text-center ${className}`}
    >
      <div
        style={{ backgroundColor: color }}
        className="w-full h-full p-1 text-[#FFF6E5] flex flex-col justify-between items-center border border-[#2A1A14]/30"
      >
        <div className="font-typewriter text-[9px] tracking-widest uppercase font-bold">
          {title}
        </div>
        {/* Silhouette of dove / pigeon */}
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6 my-auto opacity-90"
        >
          <path d="M21 3C19 4 16 6 15 8C14 7 12 7 10 8L7 6L5 8L8 10C6 11 4 13 3 16C5 16 8 15 10 13L10 15L12 17L14 15C16 16 19 15 21 13C21 9 22 5 21 3Z" />
        </svg>
        <div className="font-typewriter text-xs font-black tracking-wider">
          {price}
        </div>
      </div>
    </div>
  );
};

/**
 * Vintage Brass Paper Clip (CSS/SVG)
 */
export const PaperClip: React.FC<{ className?: string }> = ({
  className = 'w-6 h-12',
}) => {
  return (
    <svg
      viewBox="0 0 24 48"
      fill="none"
      stroke="#D4AF37"
      strokeWidth="2.5"
      strokeLinecap="round"
      className={`filter drop-shadow-[2px_2px_0px_rgba(42,26,20,0.6)] ${className}`}
    >
      <path d="M8 14 L8 36 C8 42, 16 42, 16 36 L16 8 C16 2, 4 2, 4 8 L4 38 C4 46, 20 46, 20 38 L20 18" />
    </svg>
  );
};

/**
 * Embossed Wax Seal
 */
export const WaxSeal: React.FC<{
  letter?: string;
  className?: string;
  onClick?: () => void;
}> = ({ letter = 'R', className = 'w-14 h-14', onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        boxShadow:
          '3px 3px 0px #2A1A14, inset 2px 2px 4px rgba(255,255,255,0.25), inset -2px -2px 5px rgba(0,0,0,0.5)',
      }}
      className={`relative rounded-full bg-[#8E2A2A] text-[#FFF6E5] border-2 border-[#541212] flex items-center justify-center cursor-pointer select-none transition-transform hover:scale-105 active:scale-95 ${className}`}
    >
      {/* Irregular wax edge blob effect */}
      <div className="w-10 h-10 rounded-full border border-dashed border-[#FFF6E5]/40 flex items-center justify-center">
        <span className="font-serif-flourish text-xl font-black italic">
          {letter}
        </span>
      </div>
    </div>
  );
};

/**
 * Post Office Mail-Route Barcode & Routing Track
 */
export const MailRoutingBarcode: React.FC<{
  code: string;
  className?: string;
}> = ({ code, className = '' }) => {
  return (
    <div className={`font-typewriter text-[#2A1A14] select-none ${className}`}>
      {/* Synthetic Mail Barcode */}
      <div className="h-7 flex items-end gap-[3px] py-1 border-b border-[#2A1A14]">
        {[3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 4, 3, 1, 2, 3, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 1, 4].map(
          (w, i) => (
            <div
              key={i}
              style={{ width: `${w * 1.5}px` }}
              className={`h-full ${i % 2 === 0 ? 'bg-[#2A1A14]' : 'bg-transparent'}`}
            />
          )
        )}
      </div>
      <div className="text-[9px] tracking-[0.25em] font-bold text-center mt-0.5">
        *{code}*
      </div>
    </div>
  );
};
