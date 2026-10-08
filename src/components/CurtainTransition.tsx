import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WaxSeal, ImportantStamp } from './PostalDecorations';

interface Props {
  isActive: boolean;
  targetPageTitle: string;
}

export const CurtainTransition: React.FC<Props> = ({
  isActive,
  targetPageTitle,
}) => {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="envelope-curtain"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-[#38072B]/95 backdrop-blur-md flex items-center justify-center p-4 pointer-events-none select-none"
        >
          {/* Centered Kraft Envelope */}
          <motion.div
            initial={{ scale: 0.8, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -120, opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
            className="relative w-84 sm:w-96 bg-[#A98258] border-4 border-[#2A1A14] rounded-3xl p-6 shadow-[10px_10px_0px_#2A1A14] text-center"
          >
            {/* Wax Seal on Flap */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2">
              <WaxSeal letter="R" className="w-12 h-12" />
            </div>

            {/* Letter Sliding Out of Envelope */}
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: -50 }}
              transition={{ delay: 0.2, duration: 0.45 }}
              className="bg-[#F3E6CE] border-2 border-[#2A1A14] rounded-2xl p-4 shadow-[4px_4px_0px_#2A1A14] text-[#2A1A14] space-y-1"
            >
              <span className="font-typewriter text-[10px] text-[#8E2A2A] font-black uppercase tracking-widest block">
                ★ DISPATCHING TO ★
              </span>
              <h2 className="font-display font-black text-2xl uppercase tracking-tight text-[#2A1A14]">
                {targetPageTitle}
              </h2>
            </motion.div>

            <div className="mt-4 font-typewriter text-[11px] text-[#FFF6E5]/80 uppercase tracking-widest">
              UNSEALING DISPATCH...
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
