import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CampusEvent, CampusPass, CampusFeedback } from '../types';
import { dataService } from '../services/dataService';
import { postalSoundFx } from '../utils/audio';
import { triggerPaperBitsConfetti } from '../utils/confetti';
import {
  PostageStamp,
  ImportantStamp,
  PointingHand,
} from './PostalDecorations';
import { X, ArrowRight, ArrowLeft, Check, Copy } from 'lucide-react';

interface Props {
  event: CampusEvent;
  pass: CampusPass;
  onClose: () => void;
  onSubmitFeedback: (feedback: CampusFeedback) => void;
}

const LUGGAGE_TAGS = [
  'Speakers',
  'Activities',
  'Food',
  'Networking',
  'Venue',
  'Prizes',
];

export const StoryFeedbackModal: React.FC<Props> = ({
  event,
  pass,
  onClose,
  onSubmitFeedback,
}) => {
  const [step, setStep] = useState<number>(0);
  const totalSteps = 4;

  const [overallRating, setOverallRating] = useState<number>(5);
  const [orgRating, setOrgRating] = useState<number>(5);
  const [contentRating, setContentRating] = useState<number>(5);
  const [venueRating, setVenueRating] = useState<number>(4);

  const [selectedTags, setSelectedTags] = useState<string[]>(['Speakers', 'Activities']);
  const [enjoyedText, setEnjoyedText] = useState<string>('');
  const [improveText, setImproveText] = useState<string>('');
  const [recommend, setRecommend] = useState<'Yes' | 'Maybe' | 'No'>('Yes');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [copiedPostcard, setCopiedPostcard] = useState(false);

  const toggleTag = (tag: string) => {
    postalSoundFx.playTypewriterTick();
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const nextStep = () => {
    postalSoundFx.playTypewriterTick();
    if (step === 2) {
      // Post the feedback
      postalSoundFx.playStampThump();
      triggerPaperBitsConfetti();

      const res = dataService.submitFeedback({
        eventId: event.id,
        eventTitle: event.title,
        participantCode: pass.code,
        studentName: isAnonymous ? 'Anonymous Student' : pass.studentName,
        isAnonymous,
        overallRating,
        organizationRating: orgRating,
        contentRating,
        venueRating,
        luggageTags: selectedTags,
        enjoyedText: enjoyedText.trim() || 'Great initiative and coordination!',
        improveText: improveText.trim() || 'Keep it going!',
        recommend,
      });

      if (res.feedback) {
        onSubmitFeedback(res.feedback);
      }
      setStep(3);
    } else if (step < totalSteps - 1) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    postalSoundFx.playTypewriterTick();
    if (step > 0 && step < 3) setStep((prev) => prev - 1);
  };

  const handleCopyPostcard = () => {
    postalSoundFx.playTypewriterTick();
    navigator.clipboard.writeText(
      `I ATTENDED ${event.title} (${event.date}) // VERIFIED ON CAMPUS POST (Pass: ${pass.code})`
    );
    setCopiedPostcard(true);
    setTimeout(() => setCopiedPostcard(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#A98258] border-[3.5px] border-[#2A1A14] rounded-[36px] p-2 shadow-[8px_8px_0px_#2A1A14] overflow-hidden">
        {/* Reply Card Surface */}
        <div className="bg-[#F3E6CE] border-2 border-[#2A1A14] rounded-[30px] p-6 sm:p-7 flex flex-col justify-between min-h-[560px] font-typewriter">
          {/* Header */}
          <div className="border-b-2 border-dashed border-[#2A1A14]/30 pb-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#8E2A2A] font-black tracking-widest uppercase block">
                CAMPUS POST // ATTENDEE REPLY CARD
              </span>
              <span className="font-display font-black text-sm text-[#2A1A14] uppercase truncate block max-w-[280px]">
                {event.title}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#2A1A14]/10 text-[#2A1A14] transition-colors"
              title="Close feedback"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Body */}
          <div className="py-4 my-auto">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="fb-0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4 text-center"
                >
                  <ImportantStamp text="STEP 1: PRESS STAMP RATINGS" className="mx-auto" />

                  <h3 className="font-display font-black text-2xl uppercase leading-tight mt-1 text-[#2A1A14]">
                    Rate your experience
                  </h3>

                  {/* Overall Stamps */}
                  <div className="space-y-3 pt-1 text-left">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>OVERALL EXPERIENCE:</span>
                        <span className="text-[#8E2A2A]">{overallRating} / 5 STAMPS</span>
                      </div>
                      <div className="flex justify-between gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              postalSoundFx.playStampThump();
                              setOverallRating(s);
                            }}
                            className={`flex-1 py-1.5 rounded border-2 border-[#2A1A14] font-bold text-xs ${
                              s <= overallRating
                                ? 'bg-[#8E2A2A] text-[#FFF6E5] shadow-[2px_2px_0px_#2A1A14]'
                                : 'bg-[#FFF6E5] text-[#2A1A14]'
                            }`}
                          >
                            ★ {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                      <div>
                        <span className="block opacity-75 font-bold">ORGANIZATION:</span>
                        <select
                          value={orgRating}
                          onChange={(e) => setOrgRating(Number(e.target.value))}
                          className="w-full mt-0.5 p-1 rounded bg-[#FFF6E5] border border-[#2A1A14] font-bold"
                        >
                          {[5, 4, 3, 2, 1].map((r) => (
                            <option key={r} value={r}>{r} Stars</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <span className="block opacity-75 font-bold">CONTENT:</span>
                        <select
                          value={contentRating}
                          onChange={(e) => setContentRating(Number(e.target.value))}
                          className="w-full mt-0.5 p-1 rounded bg-[#FFF6E5] border border-[#2A1A14] font-bold"
                        >
                          {[5, 4, 3, 2, 1].map((r) => (
                            <option key={r} value={r}>{r} Stars</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <span className="block opacity-75 font-bold">VENUE:</span>
                        <select
                          value={venueRating}
                          onChange={(e) => setVenueRating(Number(e.target.value))}
                          className="w-full mt-0.5 p-1 rounded bg-[#FFF6E5] border border-[#2A1A14] font-bold"
                        >
                          {[5, 4, 3, 2, 1].map((r) => (
                            <option key={r} value={r}>{r} Stars</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-[#2A1A14]/20">
                      <span className="text-xs font-bold">SUBMIT ANONYMOUSLY?</span>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="accent-[#8E2A2A]"
                        />
                        <span className="text-xs">{isAnonymous ? 'Yes (Anonymous)' : 'No (Name attached)'}</span>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="fb-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <PointingHand direction="right" className="w-8 h-4" />
                    <span className="text-xs text-[#8E2A2A] font-bold uppercase tracking-widest">
                      STEP 2: LUGGAGE TAGS & RECOMMENDATION
                    </span>
                  </div>

                  <h3 className="font-display font-black text-2xl uppercase leading-tight text-[#2A1A14]">
                    What stood out most?
                  </h3>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {LUGGAGE_TAGS.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`p-2.5 rounded-xl border-2 border-[#2A1A14] text-xs font-bold text-left transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#A98258] text-[#FFF6E5] shadow-[2px_2px_0px_#2A1A14]'
                              : 'bg-[#FFF6E5] text-[#2A1A14]'
                          }`}
                        >
                          <span>{tag}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 ml-1" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2">
                    <label className="text-xs font-bold uppercase block mb-1">
                      WOULD YOU RECOMMEND THIS EVENT TO PEERS?
                    </label>
                    <div className="flex gap-2">
                      {(['Yes', 'Maybe', 'No'] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setRecommend(opt)}
                          className={`flex-1 py-1.5 rounded-lg border-2 border-[#2A1A14] font-bold text-xs ${
                            recommend === opt
                              ? 'bg-[#8E2A2A] text-[#FFF6E5]'
                              : 'bg-[#FFF6E5] text-[#2A1A14]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="fb-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <PointingHand direction="right" className="w-8 h-4" />
                    <span className="text-xs text-[#8E2A2A] font-bold uppercase tracking-widest">
                      STEP 3: LINED PAPER NOTE
                    </span>
                  </div>

                  <h3 className="font-display font-black text-2xl uppercase leading-tight text-[#2A1A14]">
                    Your thoughts for the club
                  </h3>

                  <div className="space-y-2 pt-1">
                    <div>
                      <label className="text-[11px] font-bold uppercase block mb-0.5">
                        WHAT DID YOU ENJOY?
                      </label>
                      <textarea
                        rows={2}
                        value={enjoyedText}
                        onChange={(e) => setEnjoyedText(e.target.value)}
                        placeholder="The hands-on problem sets and mentor feedback were amazing..."
                        className="w-full p-2.5 rounded-xl lined-paper border-2 border-[#2A1A14] text-xs font-sans text-[#2A1A14] focus:outline-none shadow-[2px_2px_0px_#2A1A14]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase block mb-0.5">
                        WHAT CAN WE IMPROVE?
                      </label>
                      <textarea
                        rows={2}
                        value={improveText}
                        onChange={(e) => setImproveText(e.target.value)}
                        placeholder="Start punctually at 9 AM and provide water dispensers near Block C..."
                        className="w-full p-2.5 rounded-xl lined-paper border-2 border-[#2A1A14] text-xs font-sans text-[#2A1A14] focus:outline-none shadow-[2px_2px_0px_#2A1A14]"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="fb-3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4 text-center"
                >
                  <div className="rubber-stamp-green text-sm px-3 py-1 mx-auto font-black">
                    POSTED TO ORGANIZER MAILBOX
                  </div>

                  <h3 className="font-display font-black text-2xl uppercase leading-tight mt-1 text-[#2A1A14]">
                    THANK YOU FOR ATTENDING!
                  </h3>

                  {/* Shareable "I Attended" Card */}
                  <div className="relative mx-auto w-full max-w-sm rounded-2xl p-4 bg-[#FFF6E5] border-2 border-[#2A1A14] shadow-[4px_4px_0px_#2A1A14] text-left select-none space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-[#2A1A14]/20">
                      <span className="text-[9px] text-[#8E2A2A] font-bold tracking-widest uppercase">
                        CAMPUS POST // ATTENDANCE SOUVENIR
                      </span>
                      <span className="text-xs font-black text-[#5B7A3A]">
                        ★ {overallRating}/5 STAMPS
                      </span>
                    </div>

                    <h4 className="font-display font-black text-lg text-[#2A1A14] leading-tight uppercase">
                      {event.title}
                    </h4>

                    <p className="font-serif-flourish italic text-xs text-[#2A1A14]/80">
                      "I attended and stamped this campus event." — {isAnonymous ? 'Verified Student' : pass.studentName}
                    </p>

                    <div className="pt-2 border-t border-[#2A1A14]/20 flex items-center justify-between text-[10px] text-[#2A1A14]/70">
                      <span>{event.date}</span>
                      <span className="font-bold text-[#8E2A2A]">CODE: {pass.code}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleCopyPostcard}
                      className="btn-postal-kraft flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs uppercase"
                    >
                      {copiedPostcard ? <Check className="w-3.5 h-3.5 text-[#FFF6E5]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPostcard ? 'Copied to Clipboard' : 'Copy Souvenir'}</span>
                    </button>
                    <button
                      onClick={onClose}
                      className="btn-postal-cream px-4 py-2 rounded-xl text-xs uppercase"
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stepper Footer */}
          {step < 3 && (
            <div className="pt-3 border-t-2 border-dashed border-[#2A1A14]/30 flex items-center justify-between gap-3">
              {step > 0 ? (
                <button
                  onClick={prevStep}
                  className="btn-postal-cream px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={nextStep}
                className="btn-postal-red px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 font-bold"
              >
                <span>{step === 2 ? 'POST REPLY LETTER 📮' : 'Continue'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
