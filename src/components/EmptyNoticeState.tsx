import React from 'react';
import { MascotPip } from './MascotPip';
import { OrnateButton } from './ui/OrnateButton';
import { PlusCircle } from 'lucide-react';

interface EmptyNoticeStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyNoticeState: React.FC<EmptyNoticeStateProps> = ({
  title = 'No events yet — pin your first notice',
  description = 'The university courier board is clear for this selection. Create a new notice or switch your filters.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`w-full py-10 px-6 rounded-2xl bg-[#060A1C]/80 border border-[#E8D9B0]/20 flex flex-col items-center text-center shadow-xl backdrop-blur-sm ${className}`}
    >
      <MascotPip size="sm" bubbleText="Waiting for new notices!" interactive={true} />

      <h3 className="font-display font-bold text-lg text-[#FFF6E5] uppercase mt-3 tracking-wide">
        {title}
      </h3>
      <p className="font-sans text-xs sm:text-sm text-[#E8D9B0]/75 max-w-md mt-1 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <div className="mt-5">
          <OrnateButton variant="primary" size="sm" icon={PlusCircle} onClick={onAction}>
            {actionLabel}
          </OrnateButton>
        </div>
      )}
    </div>
  );
};
