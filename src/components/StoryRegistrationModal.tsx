import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CampusEvent, CampusPass, StudentProfile, PassTemplateType } from '../types';
import { dataService } from '../services/dataService';
import { postalSoundFx } from '../utils/audio';
import {
  WaxSeal,
  ImportantStamp,
  PointingHand,
  PostageStamp,
} from './PostalDecorations';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

interface Props {
  event: CampusEvent;
  studentProfile: StudentProfile | null;
  onClose: () => void;
  onRegistered: (pass: CampusPass) => void;
}

export const StoryRegistrationModal: React.FC<Props> = ({
  event,
  studentProfile,
  onClose,
  onRegistered,
}) => {
  const [step, setStep] = useState<number>(0);
  const totalSteps = 3;

  // Form Fields autofilled from student profile if available
  const [name, setName] = useState(studentProfile?.name || '');
  const [email, setEmail] = useState(studentProfile?.collegeEmail || '');
  const [rollNumber, setRollNumber] = useState(studentProfile?.rollNumber || '');
  const [department, setDepartment] = useState(studentProfile?.department || 'Computer Science');
  const [year, setYear] = useState(studentProfile?.year || '1st Year');
  const [phone, setPhone] = useState(studentProfile?.phone || '');
  const [teamName, setTeamName] = useState('');
  const [tshirtSize, setTshirtSize] = useState('M');
  const [isSealing, setIsSealing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Real-time field validators
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const cleanPhoneDigits = phone.replace(/\D/g, '');
  const isPhoneValid = cleanPhoneDigits.length === 10;
  const isNameValid = name.trim().length >= 2;
  const isRollValid = rollNumber.trim().length >= 2;

  const nextStep = () => {
    setErrorMsg('');
    postalSoundFx.playTypewriterTick();

    if (step === 0) {
      setTouched({ name: true, email: true, rollNumber: true, phone: true });
      if (!isNameValid) {
        setErrorMsg('Full Name is required (minimum 2 characters).');
        return;
      }
      if (!isEmailValid) {
        setErrorMsg('Please enter a valid college email address.');
        return;
      }
      if (!isPhoneValid) {
        setErrorMsg('Phone Number is required and must be exactly 10 digits.');
        return;
      }
      if (!isRollValid) {
        setErrorMsg('Roll Number / Enrollment ID is required.');
        return;
      }
    }
    if (step < totalSteps - 1) {
      setStep((prev) => prev + 1);
    } else {
      handleFinalStamp();
    }
  };

  const prevStep = () => {
    setErrorMsg('');
    postalSoundFx.playTypewriterTick();
    if (step > 0) setStep((prev) => prev - 1);
  };

  const handleFinalStamp = () => {
    setIsSealing(true);
    postalSoundFx.playStampThump();

    setTimeout(() => {
      const res = dataService.registerParticipant({
        eventId: event.id,
        studentName: name.trim(),
        studentRollNumber: rollNumber.trim(),
        studentEmail: email.trim(),
        studentDepartment: department,
        studentYear: year,
        studentPhone: phone.trim() || 'N/A',
        teamName: teamName.trim() || undefined,
        tshirtSize: tshirtSize || undefined,
      });

      if (!res.success || !res.pass) {
        setIsSealing(false);
        setErrorMsg(res.error || 'Registration failed.');
        return;
      }

      onRegistered(res.pass);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#A98258] border-[3.5px] border-[#2A1A14] rounded-[36px] p-2 shadow-[8px_8px_0px_#2A1A14] overflow-hidden">
        {/* Reply Card Surface */}
        <div className="bg-[#F3E6CE] border-2 border-[#2A1A14] rounded-[30px] p-6 sm:p-7 flex flex-col justify-between min-h-[530px]">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[#2A1A14]/30">
              <div className="flex items-center gap-1.5 font-typewriter text-xs text-[#2A1A14]">
                <span className="font-black text-[#8E2A2A] uppercase">
                  REPLY CARD // STEP {step + 1} OF {totalSteps}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-7 border border-[#2A1A14] flex items-center justify-center font-typewriter text-[10px] font-bold ${
                      i <= step
                        ? 'bg-[#8E2A2A] text-[#FFF6E5]'
                        : 'bg-[#F3E6CE] text-[#2A1A14]/40'
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-[#2A1A14]/10 text-[#2A1A14] transition-colors"
                title="Cancel registration"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="pt-2 font-typewriter text-[10px] text-[#2A1A14]/75 uppercase truncate">
              EVENT: <span className="font-bold text-[#8E2A2A]">{event.title}</span>
            </div>
          </div>

          {/* Stepper Body */}
          <div className="py-4 my-auto">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step-0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3 font-typewriter text-xs text-[#2A1A14]"
                >
                  <div className="flex items-center gap-2">
                    <PointingHand direction="right" className="w-8 h-4" />
                    <span className="text-xs text-[#8E2A2A] font-bold uppercase tracking-widest">
                      1. CONFIRM STUDENT CREDENTIALS
                    </span>
                  </div>

                  <h3 className="font-display font-black text-2xl uppercase leading-tight">
                    Who is claiming this spot?
                  </h3>

                  <div className="space-y-2.5 pt-1">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold uppercase text-[11px]">FULL NAME *</label>
                        {touched.name && !isNameValid && (
                          <span className="text-[10px] text-[#8E2A2A] font-bold">Min 2 letters required</span>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setTouched((prev) => ({ ...prev, name: true }));
                        }}
                        placeholder="e.g. Aarav Sharma"
                        className={`w-full px-3 py-2 rounded-xl bg-[#FFF6E5] border-2 font-bold shadow-[2px_2px_0px_#2A1A14] focus:outline-none ${
                          touched.name && !isNameValid ? 'border-[#8E2A2A] bg-[#FFF0F0]' : 'border-[#2A1A14]'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-bold uppercase text-[11px]">COLLEGE EMAIL *</label>
                          {touched.email && !isEmailValid && (
                            <span className="text-[10px] text-[#8E2A2A] font-bold">Invalid email</span>
                          )}
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setTouched((prev) => ({ ...prev, email: true }));
                          }}
                          placeholder="aarav@campuspost.edu"
                          className={`w-full px-3 py-2 rounded-xl bg-[#FFF6E5] border-2 font-bold shadow-[2px_2px_0px_#2A1A14] focus:outline-none ${
                            touched.email && !isEmailValid ? 'border-[#8E2A2A] bg-[#FFF0F0]' : 'border-[#2A1A14]'
                          }`}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-bold uppercase text-[11px]">PHONE (10 DIGITS) *</label>
                          {touched.phone && !isPhoneValid && (
                            <span className="text-[10px] text-[#8E2A2A] font-bold">10 digits required</span>
                          )}
                        </div>
                        <input
                          type="tel"
                          required
                          maxLength={15}
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            setTouched((prev) => ({ ...prev, phone: true }));
                          }}
                          placeholder="9876543210"
                          className={`w-full px-3 py-2 rounded-xl bg-[#FFF6E5] border-2 font-bold shadow-[2px_2px_0px_#2A1A14] focus:outline-none ${
                            touched.phone && !isPhoneValid ? 'border-[#8E2A2A] bg-[#FFF0F0]' : 'border-[#2A1A14]'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block mb-1 font-bold uppercase text-[11px]">COLLEGE YEAR *</label>
                        <select
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          className="w-full px-2 py-2 rounded-xl bg-[#FFF6E5] border-2 border-[#2A1A14] font-bold shadow-[2px_2px_0px_#2A1A14]"
                        >
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                          <option value="Post Grad">Post Grad</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-bold uppercase text-[11px]">ROLL / ENROLLMENT ID *</label>
                          {touched.rollNumber && !isRollValid && (
                            <span className="text-[10px] text-[#8E2A2A] font-bold">Required</span>
                          )}
                        </div>
                        <input
                          type="text"
                          required
                          value={rollNumber}
                          onChange={(e) => {
                            setRollNumber(e.target.value.toUpperCase());
                            setTouched((prev) => ({ ...prev, rollNumber: true }));
                          }}
                          placeholder="22CS084"
                          className={`w-full px-3 py-2 rounded-xl bg-[#FFF6E5] border-2 font-black text-[#8E2A2A] shadow-[2px_2px_0px_#2A1A14] focus:outline-none ${
                            touched.rollNumber && !isRollValid ? 'border-[#8E2A2A] bg-[#FFF0F0]' : 'border-[#2A1A14]'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1 font-bold uppercase text-[11px]">DEPARTMENT</label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-2 py-2 rounded-xl bg-[#FFF6E5] border-2 border-[#2A1A14] font-bold shadow-[2px_2px_0px_#2A1A14]"
                      >
                        <option value="Computer Science">Computer Science & Eng</option>
                        <option value="Information Technology">Information Tech</option>
                        <option value="Electronics & Comm.">Electronics (ECE)</option>
                        <option value="Mechanical Eng.">Mechanical Eng.</option>
                        <option value="Civil Engineering">Civil Engineering</option>
                        <option value="Biotechnology">Biotechnology</option>
                        <option value="Management Studies">Management Studies</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3 font-typewriter text-xs text-[#2A1A14]"
                >
                  <div className="flex items-center gap-2">
                    <PointingHand direction="right" className="w-8 h-4" />
                    <span className="text-xs text-[#8E2A2A] font-bold uppercase tracking-widest">
                      2. PARTICIPANT SPECIFICATIONS
                    </span>
                  </div>

                  <h3 className="font-display font-black text-2xl uppercase leading-tight">
                    Squad & Swag (Optional)
                  </h3>

                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block mb-1 font-bold uppercase">
                        TEAM / SQUAD NAME (FOR GROUP ENTRY)
                      </label>
                      <input
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="e.g. Binary Bandits / Team Alpha"
                        className="w-full px-3 py-2 rounded-xl bg-[#FFF6E5] border-2 border-[#2A1A14] font-bold shadow-[2px_2px_0px_#2A1A14]"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-bold uppercase">
                        COLLEGE FEST T-SHIRT / MERCHANDISE SIZE
                      </label>
                      <div className="flex gap-2">
                        {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setTshirtSize(sz)}
                            className={`flex-1 py-2 rounded-xl border-2 border-[#2A1A14] font-bold shadow-[2px_2px_0px_#2A1A14] transition-all ${
                              tshirtSize === sz
                                ? 'bg-[#8E2A2A] text-[#FFF6E5]'
                                : 'bg-[#FFF6E5] text-[#2A1A14] hover:bg-[#F3E6CE]'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 text-center font-typewriter"
                >
                  <ImportantStamp text="FINAL STEP: STAMP IT" className="mx-auto" />

                  <h3 className="font-display font-black text-2xl uppercase leading-tight mt-1 text-[#2A1A14]">
                    Confirm your registration
                  </h3>

                  <p className="font-serif-flourish italic text-sm text-[#2A1A14]/80 max-w-sm mx-auto">
                    Press the stamp below to lock in your spot. A unique entry QR code will be generated on your stamped pass.
                  </p>

                  {/* Summary ticket */}
                  <div className="bg-[#FFF6E5] border-2 border-[#2A1A14] p-3 rounded-xl text-xs text-left shadow-[2px_2px_0px_#2A1A14] space-y-1 my-2">
                    <div className="flex justify-between border-b border-[#2A1A14]/20 pb-1">
                      <span className="opacity-70">STUDENT:</span>
                      <span className="font-bold">{name} ({rollNumber})</span>
                    </div>
                    <div className="flex justify-between border-b border-[#2A1A14]/20 pb-1">
                      <span className="opacity-70">EVENT:</span>
                      <span className="font-bold truncate max-w-[200px]">{event.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-70">VENUE:</span>
                      <span className="font-bold text-[#8E2A2A]">{event.venue}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-center">
                    <WaxSeal letter="CP" className="w-16 h-16" onClick={handleFinalStamp} />
                  </div>
                  <span className="text-[10px] opacity-70 uppercase tracking-widest block">
                    (PRESS SEAL OR CLICK STAMP IT BELOW)
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {errorMsg && (
              <div className="mt-3 p-2 rounded-lg bg-[#8E2A2A] text-[#FFF6E5] font-typewriter text-xs font-bold text-center">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Stepper Footer */}
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
              disabled={isSealing}
              className="btn-postal-red px-6 py-2.5 rounded-xl text-xs flex items-center gap-2"
            >
              <span>{step === totalSteps - 1 ? (isSealing ? 'STAMPING...' : 'STAMP IT ★') : 'Continue'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
