import React, { useState } from 'react';
import { motion } from 'motion/react';
import { StudentProfile } from '../types';
import { soundFx } from '../utils/audio';
import { X, GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react';

interface StudentAuthModalProps {
  initialProfile?: StudentProfile | null;
  onClose: () => void;
  onSuccess: (profile: StudentProfile) => void;
}

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  initialProfile,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState(initialProfile?.name || '');
  const [email, setEmail] = useState(initialProfile?.collegeEmail || '');
  const [rollNumber, setRollNumber] = useState(initialProfile?.rollNumber || '');
  const [department, setDepartment] = useState(initialProfile?.department || 'Computer Science');
  const [year, setYear] = useState(initialProfile?.year || '1st Year');
  const [phone, setPhone] = useState(initialProfile?.phone || '');
  const [errorMsg, setErrorMsg] = useState('');

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const cleanPhoneDigits = phone.replace(/\D/g, '');
  const isPhoneValid = cleanPhoneDigits.length >= 10;
  const isNameValid = name.trim().length >= 2;
  const isRollValid = rollNumber.trim().length >= 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isNameValid) {
      setErrorMsg('Full name is required (minimum 2 characters).');
      soundFx.playError();
      return;
    }
    if (!isEmailValid) {
      setErrorMsg('Please enter a valid college email address.');
      soundFx.playError();
      return;
    }
    if (!isRollValid) {
      setErrorMsg('Roll Number / Student ID is required.');
      soundFx.playError();
      return;
    }
    if (!isPhoneValid) {
      setErrorMsg('Please enter a valid phone number (at least 10 digits).');
      soundFx.playError();
      return;
    }

    const profile: StudentProfile = {
      id: initialProfile?.id || `stu-${Date.now()}`,
      name: name.trim(),
      collegeEmail: email.trim(),
      rollNumber: rollNumber.trim().toUpperCase(),
      department,
      year,
      phone: phone.trim(),
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
          aria-label="Close sign in"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#1B2257] border border-[#E8D9B0]/40 flex items-center justify-center mx-auto mb-3 text-[#E8D9B0] shadow-[0_0_20px_rgba(232,217,176,0.2)]">
            <GraduationCap className="w-6 h-6 text-[#E8D9B0]" />
          </div>
          <span className="font-eyebrow text-xs uppercase tracking-[0.25em] text-[#E8D9B0]/80 block">
            Festival Student Sanctuary
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-gold-gradient uppercase tracking-wide mt-1">
            Sign In to the Campus
          </h2>
          <p className="font-sans text-xs text-[#FFF6E5]/75 mt-1 max-w-sm mx-auto">
            Provide your student credentials to claim QR passes, save notices, and attend festival events.
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
              Full Name *
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#E8D9B0] font-semibold mb-1 uppercase tracking-wider text-[11px]">
                College Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#10142E] border border-[#E8D9B0]/30 text-[#FFF6E5] placeholder-[#FFF6E5]/40 focus:outline-none focus:border-[#E8D9B0]"
              />
            </div>

            <div>
              <label className="block text-[#E8D9B0] font-semibold mb-1 uppercase tracking-wider text-[11px]">
                Roll Number / ID *
              </label>
              <input
                type="text"
                required
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. 24CS101"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#10142E] border border-[#E8D9B0]/30 text-[#FFF6E5] placeholder-[#FFF6E5]/40 focus:outline-none focus:border-[#E8D9B0]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#E8D9B0] font-semibold mb-1 uppercase tracking-wider text-[11px]">
                Department *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#10142E] border border-[#E8D9B0]/30 text-[#FFF6E5] focus:outline-none focus:border-[#E8D9B0]"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Comm">Electronics & Comm</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Design & Media">Design & Media</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Biotechnology">Biotechnology</option>
              </select>
            </div>

            <div>
              <label className="block text-[#E8D9B0] font-semibold mb-1 uppercase tracking-wider text-[11px]">
                Academic Year *
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#10142E] border border-[#E8D9B0]/30 text-[#FFF6E5] focus:outline-none focus:border-[#E8D9B0]"
              >
                <option value="1st Year">1st Year (Freshman)</option>
                <option value="2nd Year">2nd Year (Sophomore)</option>
                <option value="3rd Year">3rd Year (Junior)</option>
                <option value="4th Year">4th Year (Senior)</option>
                <option value="Postgraduate">Postgraduate / Masters</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#E8D9B0] font-semibold mb-1 uppercase tracking-wider text-[11px]">
              Phone Number (10 digits) *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#10142E] border border-[#E8D9B0]/30 text-[#FFF6E5] placeholder-[#FFF6E5]/40 focus:outline-none focus:border-[#E8D9B0]"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full btn-crimson-pill py-3 text-xs uppercase tracking-wider font-bold shadow-[0_0_20px_rgba(224,74,123,0.4)]"
            >
              Sign In & Enter Campus →
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
