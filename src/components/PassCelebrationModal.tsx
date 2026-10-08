import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CampusPass } from '../types';
import { PassContainer } from './passes/PassContainer';
import { postalSoundFx } from '../utils/audio';
import { triggerPaperBitsConfetti } from '../utils/confetti';
import { WaxSeal, ImportantStamp, PostageStamp } from './PostalDecorations';
import { X, MailCheck } from 'lucide-react';

interface Props {
  pass: CampusPass;
  onClose: () => void;
  onGoToMailbox: () => void;
}

export const PassCelebrationModal: React.FC<Props> = ({
  pass,
  onClose,
  onGoToMailbox,
}) => {
  const [phase, setPhase] = useState<'envelope' | 'stamped' | 'opened'>('envelope');

  useEffect(() => {
    // Arrival sequence
    postalSoundFx.playTypewriterTick();

    const t1 = setTimeout(() => {
      // Stamp thump
      setPhase('stamped');
      postalSoundFx.playStampThump();
      triggerPaperBitsConfetti();
    }, 900);

    const t2 = setTimeout(() => {
      // Pass slides out
      setPhase('opened');
      postalSoundFx.playLetterArrived();
    }, 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/85 backdrop-blur-md">
      {/* Sequence 1: Envelope Arriving with CAMPUS DISPATCH Ribbon */}
      {phase !== 'opened' && (
        <div className="flex flex-col items-center justify-center text-center select-none py-12">
          <motion.div
            initial={{ scale: 0.6, y: 80, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 16, stiffness: 120 }}
            className="relative w-80 sm:w-96 bg-[#A98258] border-4 border-[#2A1A14] rounded-3xl p-6 shadow-[8px_8px_0px_#2A1A14] text-center"
          >
            {/* Top Envelope Flap */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-48 h-10 bg-[#8B6A47] border-t-2 border-x-2 border-[#2A1A14] rounded-t-2xl flex items-center justify-center">
              <WaxSeal letter="C" className="w-10 h-10 -mt-2" />
            </div>

            {/* CAMPUS DISPATCH Ribbon */}
            <div className="my-6 py-2 bg-[#8E2A2A] text-[#FFF6E5] border-y-2 border-[#2A1A14] font-typewriter font-black text-sm tracking-[0.2em] uppercase shadow-[2px_2px_0px_#2A1A14]">
              ★ CAMPUS DISPATCH ISSUED ★
            </div>

            <div className="font-display font-black text-2xl text-[#FFF6E5] uppercase">
              {pass.studentName}
            </div>
            <div className="font-typewriter text-[11px] text-[#FFF6E5]/90 mt-1">
              ROLL NO: {pass.studentRollNumber} · {pass.studentDepartment}
            </div>
            <div className="font-typewriter text-[10px] text-[#FFF6E5]/75 mt-0.5">
              CODE: {pass.code}
            </div>

            {/* Stamp Slam Animation */}
            {phase === 'stamped' && (
              <motion.div
                initial={{ scale: 2.8, rotate: -25, opacity: 0 }}
                animate={{ scale: 1, rotate: -6, opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="rubber-stamp-green text-lg bg-[#F3E6CE] shadow-[4px_4px_0px_#2A1A14] px-4 py-2 border-4">
                  APPROVED & STAMPED
                </div>
              </motion.div>
            )}
          </motion.div>

          <p className="font-typewriter text-xs tracking-widest text-[#FFF6E5]/75 mt-6 uppercase">
            STAMPING YOUR CAMPUS PASS...
          </p>
        </div>
      )}

      {/* Sequence 2: Revealed Pass sliding out */}
      {phase === 'opened' && (
        <AnimatePresence>
          <motion.div
            initial={{ y: 60, scale: 0.9, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 18, stiffness: 140 }}
            className="relative w-full max-w-2xl bg-[#5E1250] border-[3px] border-[#2A1A14] rounded-[36px] p-5 sm:p-7 shadow-[10px_10px_0px_#2A1A14]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-[#2A1A14] hover:bg-[#3E251D] text-[#FFF6E5] border border-[#FFF6E5]/30 transition-colors z-20"
              title="Close pass modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header banner */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#8E2A2A] text-[#FFF6E5] border-2 border-[#2A1A14] text-xs font-typewriter font-bold uppercase tracking-widest shadow-[2px_2px_0px_#2A1A14] mb-2">
                <MailCheck className="w-3.5 h-3.5" />
                <span>OFFICIAL ENTRY PASS GENERATED</span>
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-[#FFF6E5] tracking-tight uppercase text-retro-outline-plum">
                REGISTRATION CONFIRMED
              </h2>
              <p className="font-serif-flourish italic text-xs text-[#FFF6E5]/80 mt-1">
                {pass.studentName} ({pass.studentRollNumber}) — your pass is saved and ready for entrance scan.
              </p>
            </div>

            {/* Pass Container with all controls */}
            <PassContainer
              pass={pass}
              onGoToMailbox={() => {
                onClose();
                onGoToMailbox();
              }}
            />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
