import React from 'react';
import { LucideIcon } from 'lucide-react';
import { soundFx } from '../../utils/audio';

export type OrnateButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';
export type OrnateButtonSize = 'sm' | 'md' | 'lg';

interface OrnateButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: OrnateButtonVariant;
  size?: OrnateButtonSize;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  gem?: boolean;
  children?: React.ReactNode;
}

export const OrnateButton: React.FC<OrnateButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  gem = false,
  children,
  className = '',
  onClick,
  onMouseEnter,
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    soundFx.playClick();
    if (onClick) onClick(e);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      soundFx.playHover();
    }
    if (onMouseEnter) onMouseEnter(e);
  };

  // Sizing
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs tracking-wider gap-1.5 min-h-[32px]',
    md: 'px-5 py-2.5 text-sm tracking-wider gap-2 min-h-[42px]',
    lg: 'px-7 py-3.5 text-base tracking-widest gap-2.5 min-h-[50px]',
  }[size];

  // Variant themes
  const variantClasses = {
    primary:
      'bg-gradient-to-r from-[#801838] via-[#B3345C] to-[#801838] text-[#FFF6E5] border border-[#E8D9B0] shadow-[0_0_15px_rgba(224,74,123,0.35)] hover:shadow-[0_0_25px_rgba(224,74,123,0.65)] hover:border-[#FFF6E5] hover:brightness-110 active:scale-[0.98]',
    secondary:
      'bg-gradient-to-r from-[#161B42] via-[#241B4E] to-[#161B42] text-[#FFF6E5] border border-[#E8D9B0]/50 shadow-[0_0_12px_rgba(30,27,75,0.4)] hover:shadow-[0_0_20px_rgba(91,42,134,0.5)] hover:border-[#E8D9B0] hover:brightness-110 active:scale-[0.98]',
    ghost:
      'bg-[#060A1C]/60 text-[#E8D9B0] border border-[#E8D9B0]/30 hover:border-[#E8D9B0] hover:bg-[#1B2257]/40 hover:text-[#FFF6E5] shadow-[0_0_10px_rgba(232,217,176,0.1)] active:scale-[0.98]',
    danger:
      'bg-gradient-to-r from-[#591010] via-[#851E1E] to-[#591010] text-[#FFF6E5] border border-[#F87171]/60 shadow-[0_0_12px_rgba(220,38,38,0.3)] hover:shadow-[0_0_22px_rgba(220,38,38,0.5)] hover:border-[#FCA5A5] active:scale-[0.98]',
    icon:
      'p-2.5 text-[#E8D9B0] bg-[#10142E]/80 border border-[#E8D9B0]/40 rounded-lg hover:border-[#E8D9B0] hover:text-[#FFF6E5] hover:shadow-[0_0_15px_rgba(232,217,176,0.3)] active:scale-[0.96]',
  }[variant];

  const disabledClasses = disabled
    ? 'opacity-40 cursor-not-allowed saturate-50 hover:brightness-100 hover:shadow-none hover:border-[#E8D9B0]/30'
    : 'cursor-pointer transition-all duration-200';

  if (variant === 'icon') {
    return (
      <button
        disabled={disabled}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        className={`relative inline-flex items-center justify-center font-heading select-none focus:outline-none focus:ring-2 focus:ring-[#E8D9B0] focus:ring-offset-2 focus:ring-offset-[#0B1030] ${variantClasses} ${disabledClasses} ${className}`}
        {...props}
      >
        {Icon && <Icon className="w-5 h-5 text-current" />}
        {children}
      </button>
    );
  }

  return (
    <button
      disabled={disabled}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={`relative inline-flex items-center justify-center font-heading font-semibold uppercase rounded-sm select-none focus:outline-none focus:ring-2 focus:ring-[#E8D9B0] focus:ring-offset-2 focus:ring-offset-[#0B1030] ${variantClasses} ${sizeClasses} ${disabledClasses} ${className}`}
      {...props}
    >
      {/* Ornate Corner Filigree (SVG) */}
      <span className="pointer-events-none absolute -top-[3px] -left-[3px] w-2 h-2 border-t-2 border-l-2 border-[#E8D9B0]" />
      <span className="pointer-events-none absolute -top-[3px] -right-[3px] w-2 h-2 border-t-2 border-r-2 border-[#E8D9B0]" />
      <span className="pointer-events-none absolute -bottom-[3px] -left-[3px] w-2 h-2 border-b-2 border-l-2 border-[#E8D9B0]" />
      <span className="pointer-events-none absolute -bottom-[3px] -right-[3px] w-2 h-2 border-b-2 border-r-2 border-[#E8D9B0]" />

      {/* Optional Top Gem Indicator */}
      {gem && (
        <span className="pointer-events-none absolute -top-[5px] left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#E8D9B0] shadow-[0_0_6px_#FFF6E5]" />
      )}

      {/* Button Content */}
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0 text-current" />}
      <span className="relative z-10 leading-none">{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0 text-current" />}
    </button>
  );
};
