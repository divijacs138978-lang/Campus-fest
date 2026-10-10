import React, { useState } from 'react';
import { motion } from 'motion/react';
import { OrganizerProfile } from '../types';
import { soundFx } from '../utils/audio';
import { X, ShieldCheck, Lock, AlertCircle } from 'lucide-react';

interface OrganizerAuthModalProps {
  initialProfile?: OrganizerProfile | null;
  onClose: () => void;
  onSuccess: (profile: OrganizerProfile) => void;
}

export const OrganizerAuthModal: React.FC<OrganizerAuthModalProps> = ({
  initialProfile,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState(initialProfile?.name || '');
  const [clubName, setClubName] = useState(initialProfile?.clubName || '');
  const [email, setEmail] = useState(initialProfile?.collegeEmail || '');
  const [pin, setPin] = useState(initialProfile?.pin || '');
  const [confirmPin, setConfirmPin] = useState(initialProfile?.pin || '');
  const [errorMsg, setErrorMsg] = useState('');

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isNameValid = name.trim().length >= 2;
  const isClubValid = clubName.trim().length >= 2;
  const isPinValid = /^\d{4}$/.test(pin.trim());
  const doPinsMatch = pin.trim() === confirmPin.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isNameValid) {
      setErrorMsg('Full coordinator name is required (minimum 2 characters).');
      soundFx.playError();
      return;
    }
    if (!isClubValid) {
      setErrorMsg('Club or Committee Name is required.');
      soundFx.playError();
      return;
    }
    if (!isEmailValid) {
      setErrorMsg('Please enter a valid institutional email address.');
      soundFx.playError();
      return;
    }
    if (!isPinValid) {
      setErrorMsg('Please set a 4-digit numeric PIN for council security.');
      soundFx.playError();
      return;
    }
    if (!doPinsMatch) {
      setErrorMsg('The confirmation PIN does not match. Please re-enter.');
      soundFx.playError();
      return;
    }

    const profile: OrganizerProfile = {
      id: initialProfile?.id || `org-${Date.now()}`,
      name: name.trim(),
      clubName: clubName.trim(),
      collegeEmail: email.trim(),
      pin: pin.trim(),
    };

    soundFx.playConfirm();
    onSuccess(profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg rounded-3xl bg-[#060A1C] border-2 border-[#E8D9B0]/40 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.85)] text-[#FFF6E5]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#1B2257] text-[#E8D9B0] transition-colors"
          aria-label="Close organizer authentication"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#1B2257] border border-[#E8D9B0]/40 flex items-center justify-center mx-auto mb-3 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="font-eyebrow text-xs uppercase tracking-[0.25em] text-[#E8D9B0]/80 block">
            Festival Council Guild
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-gold-gradient uppercase tracking-wide mt-1">
            Organizer Sign In
          </h2>
          <p className="font-sans text-xs text-[#FFF6E5]/75 mt-1 max-w-sm mx-auto">
            Provide your club credentials and set your private 4-digit security PIN to access the command desk.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 flex items-center gap-2 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block text-[#E8D9B0] font-semibold mb-1 uppercase tracking-wider text-[11px]">
              Coordinator Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#10142E] border border-[#E8D9B0]/30 text-[#FFF6E5] placeholder-[#FFF6E5]/40 focus:outline-none focus:border-[#E8D9B0]"
            />
          </div>

          <div>
            <label className="block text-[#E8D9B0] font-semibold mb-1 uppercase tracking-wider text-[11px]">
              Club / Committee Name *
            </label>
            <input
              type="text"
              required
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              placeholder="e.g. Robotics Club, Cultural Society"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#10142E] border border-[#E8D9B0]/30 text-[#FFF6E5] placeholder-[#FFF6E5]/40 focus:outline-none focus:border-[#E8D9B0]"
            />
          </div>

          <div>
            <label className="block text-[#E8D9B0] font-semibold mb-1 uppercase tracking-wider text-[11px]">
              Institutional Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="club@festora.edu"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#10142E] border border-[#E8D9B0]/30 text-[#FFF6E5] placeholder-[#FFF6E5]/40 focus:outline-none focus:border-[#E8D9B0]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[#E8D9B0] font-semibold mb-1 uppercase tracking-wider text-[11px] flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#E8D9B0]" />
                <span>Set 4-Digit PIN *</span>
              </label>
              <input
                type="password"
                required
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#10142E] border border-[#E8D9B0]/30 text-[#FFF6E5] placeholder-[#FFF6E5]/40 font-mono text-center tracking-[0.5em] text-base focus:outline-none focus:border-[#E8D9B0]"
              />
            </div>

            <div>
              <label className="block text-[#E8D9B0] font-semibold mb-1 uppercase tracking-wider text-[11px] flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#E8D9B0]" />
                <span>Confirm PIN *</span>
              </label>
              <input
                type="password"
                required
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#10142E] border border-[#E8D9B0]/30 text-[#FFF6E5] placeholder-[#FFF6E5]/40 font-mono text-center tracking-[0.5em] text-base focus:outline-none focus:border-[#E8D9B0]"
              />
            </div>
          </div>

          <p className="text-[10px] text-[#E8D9B0]/60 italic text-center">
            You will use this custom 4-digit PIN whenever entering the Organizer Command Desk.
          </p>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full btn-crimson-pill py-3 text-xs uppercase tracking-wider font-bold shadow-[0_0_20px_rgba(224,74,123,0.4)]"
            >
              Authenticate & Open Command Desk →
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
