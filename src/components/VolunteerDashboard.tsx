import React, { useState } from 'react';
import {
  CampusEvent,
  VolunteerApplication,
  VolunteerRoleType,
} from '../types';
import { dataService } from '../services/dataService';
import { OrnateButton } from './ui/OrnateButton';
import { OrnateFrame } from './ui/OrnateFrame';
import { ThornDivider } from './ui/ThornDivider';
import { QRCodeDisplay } from './QRCodeDisplay';
import { EventQuestCard } from './EventQuestCard';
import {
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  QrCode,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface VolunteerDashboardProps {
  events: CampusEvent[];
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
  onSwitchRole: (role: any) => void;
  onSelectEvent?: (event: CampusEvent) => void;
  onRegisterEvent?: (event: CampusEvent) => void;
}

const AVAILABLE_ROLES: { id: VolunteerRoleType; label: string; desc: string }[] = [
  { id: 'QR scanning', label: 'QR Scanning Gatekeeper', desc: 'Scan admission passes & verify digital badges' },
  { id: 'registration desk', label: 'Registration Desk Concierge', desc: 'Assist walk-ins and verify student IDs' },
  { id: 'stage management', label: 'Stage & Artist Liaison', desc: 'Manage acoustics, backstage order & speakers' },
  { id: 'hospitality', label: 'Guest & VIP Hospitality', desc: 'Welcome jury panels, scholars & dignitaries' },
  { id: 'photography', label: 'Media & Photography Crew', desc: 'Capture high-speed stills and festival reels' },
  { id: 'tech support', label: 'Lab & Network Tech Support', desc: 'Assist hackathon rigs, Wi-Fi & AV power cables' },
  { id: 'crowd control', label: 'Crowd & Amphitheatre Usher', desc: 'Maintain stadium flow & seating guide' },
];

const SHIFT_OPTIONS = [
  'Day 1 Morning (08:30 — 13:00)',
  'Day 1 Afternoon (13:00 — 17:30)',
  'Day 1 Night Marathon (17:30 — 23:00)',
  'Day 2 Morning (09:00 — 13:30)',
  'Day 2 Grand Finale (14:00 — 20:00)',
];

export const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({
  events,
  onShowToast,
  onSwitchRole,
  onSelectEvent,
  onRegisterEvent,
}) => {
  const [applications, setApplications] = useState<VolunteerApplication[]>(
    dataService.getVolunteerApplications()
  );
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    name: '',
    collegeEmail: '',
    phone: '',
    department: 'Computer Science',
    year: '2nd Year',
    emergencyContact: '',
    eventIds: [] as string[],
    roles: [] as string[],
    availability: [] as string[],
    tshirtSize: 'M',
    pastExperience: '',
  });

  const latestApp = applications[0] || null;

  const handleToggleEvent = (eventId: string) => {
    setFormData((prev) => ({
      ...prev,
      eventIds: prev.eventIds.includes(eventId)
        ? prev.eventIds.filter((id) => id !== eventId)
        : [...prev.eventIds, eventId],
    }));
  };

  const handleToggleRole = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const handleToggleShift = (shift: string) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.includes(shift)
        ? prev.availability.filter((s) => s !== shift)
        : [...prev.availability, shift],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.collegeEmail || !formData.phone) {
      onShowToast('Missing Fields', 'Please complete all required fields.', 'error');
      return;
    }
    if (formData.roles.length === 0) {
      onShowToast('Select a Role', 'Please choose at least one volunteer duty.', 'error');
      return;
    }

    const created = dataService.submitVolunteerApplication({
      name: formData.name,
      collegeEmail: formData.collegeEmail,
      phone: formData.phone,
      department: formData.department,
      year: formData.year,
      emergencyContact: formData.emergencyContact,
      eventIds: formData.eventIds.length > 0 ? formData.eventIds : [events[0]?.id || 'ev-hackcampus-2026'],
      roles: formData.roles,
      availability: formData.availability.length > 0 ? formData.availability : [SHIFT_OPTIONS[0]],
      tshirtSize: formData.tshirtSize,
      pastExperience: formData.pastExperience || 'Passionate student team player',
    });

    setApplications(dataService.getVolunteerApplications());
    soundFx.playConfirm();
    onShowToast('Application Submitted!', `Badge Code: ${created.badgeCode}`, 'success');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="font-eyebrow text-xs uppercase tracking-[0.25em] text-[#38BDF8]">
          Festival Operations Corps
        </span>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-gold-gradient uppercase tracking-wider mt-1">
          Volunteer Command & Badges
        </h1>
        <p className="font-sans text-xs sm:text-sm text-[#FFF6E5]/75 mt-2">
          Step behind the velvet curtain. Coordinate stages, verify passes, and earn official university commendations.
        </p>
      </div>

      {/* If applicant exists, display their badge and shift status */}
      {latestApp && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Volunteer Digital Badge Card */}
          <div className="md:col-span-1 rounded-2xl bg-gradient-to-b from-[#10142E] via-[#060A1C] to-[#10142E] border-2 border-[#E8D9B0] p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
            <span className="pointer-events-none absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#E8D9B0]" />
            <span className="pointer-events-none absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#E8D9B0]" />
            <span className="pointer-events-none absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#E8D9B0]" />
            <span className="pointer-events-none absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#E8D9B0]" />

            <div className="w-12 h-12 rounded-full bg-[#1B2257] border border-[#38BDF8] flex items-center justify-center text-[#38BDF8] mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <span className="font-mono text-[11px] uppercase tracking-widest text-[#38BDF8] font-bold">
              OFFICIAL VOLUNTEER BADGE
            </span>
            <h3 className="font-display font-bold text-xl text-[#FFF6E5] uppercase mt-1">
              {latestApp.name}
            </h3>
            <p className="font-sans text-xs text-[#E8D9B0]/70">
              {latestApp.department} · {latestApp.year}
            </p>

            {/* QR Code */}
            <div className="my-5 p-3 rounded-xl bg-white shadow-inner flex items-center justify-center">
              <QRCodeDisplay
                text={JSON.stringify({
                  badge: latestApp.badgeCode,
                  name: latestApp.name,
                  role: 'volunteer',
                })}
                size={130}
              />
            </div>

            <div className="font-mono font-bold text-sm tracking-widest text-[#E8D9B0] bg-[#060A1C] px-3 py-1 rounded border border-[#E8D9B0]/30">
              {latestApp.badgeCode}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-heading font-bold uppercase tracking-wider ${
                  latestApp.status === 'Approved'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                    : 'bg-amber-950 text-amber-300 border border-amber-500'
                }`}
              >
                Status: {latestApp.status}
              </span>
            </div>
          </div>

          {/* Assigned Shifts and Details */}
          <div className="md:col-span-2 rounded-2xl bg-[#060A1C]/90 border border-[#E8D9B0]/25 p-6 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E8D9B0]/20">
                <h3 className="font-display font-bold text-lg text-[#FFF6E5] uppercase">
                  Shift Schedule & Assigned Duties
                </h3>
                <span className="text-xs text-[#E8D9B0]/80 font-mono">
                  Submitted: {new Date(latestApp.submittedAt).toLocaleDateString()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="p-3.5 rounded-xl bg-[#10142E] border border-[#E8D9B0]/15">
                  <span className="text-[11px] font-heading text-[#E8D9B0]/60 uppercase">
                    Requested Roles
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {latestApp.roles.map((r) => (
                      <span
                        key={r}
                        className="px-2 py-0.5 rounded text-xs bg-[#1B2257] text-[#38BDF8] border border-[#38BDF8]/30 font-sans"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#10142E] border border-[#E8D9B0]/15">
                  <span className="text-[11px] font-heading text-[#E8D9B0]/60 uppercase">
                    Apparel & Contact
                  </span>
                  <p className="text-xs text-[#FFF6E5] mt-2 font-mono">
                    T-Shirt Size: <strong>{latestApp.tshirtSize}</strong>
                  </p>
                  <p className="text-xs text-[#E8D9B0]/80 mt-1 font-mono">
                    Emergency: {latestApp.emergencyContact || 'Provided on record'}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <span className="text-xs font-heading text-[#E8D9B0] uppercase font-bold tracking-wider">
                  Assigned Shifts:
                </span>
                <div className="mt-2 flex flex-col gap-2">
                  {latestApp.assignedShifts && latestApp.assignedShifts.length > 0 ? (
                    latestApp.assignedShifts.map((shift, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-[#064E3B]/40 border border-[#10B981]/50 text-xs text-[#FFF6E5] flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                        <span>{shift}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-lg bg-[#10142E] border border-[#E8D9B0]/20 text-xs text-[#E8D9B0]/75 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#F59E0B] shrink-0" />
                      <span>
                        Under Council Review — shift assignments will be updated here prior to fest day.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E8D9B0]/15 flex items-center justify-between">
              <span className="text-xs text-[#FFF6E5]/70">
                Need to amend your availability? Reach out to the Organizer Desk.
              </span>
              <OrnateButton
                size="sm"
                variant="ghost"
                onClick={() => setApplications([])}
              >
                New Application
              </OrnateButton>
            </div>
          </div>
        </div>
      )}

      {/* Stepper Form (if not submitted or creating fresh) */}
      {!latestApp && (
        <OrnateFrame glow={true} className="max-w-3xl mx-auto w-full">
          {/* Stepper indicator */}
          <div className="flex items-center justify-between pb-5 border-b border-[#E8D9B0]/20">
            <div className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= 1 ? 'bg-[#B3345C] text-white' : 'bg-[#10142E] text-slate-400'
                }`}
              >
                1
              </span>
              <span className="text-xs font-heading uppercase text-[#FFF6E5]">Credentials</span>
            </div>
            <div className="h-[1px] w-12 bg-[#E8D9B0]/30" />
            <div className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= 2 ? 'bg-[#B3345C] text-white' : 'bg-[#10142E] text-slate-400'
                }`}
              >
                2
              </span>
              <span className="text-xs font-heading uppercase text-[#FFF6E5]">Roles & Events</span>
            </div>
            <div className="h-[1px] w-12 bg-[#E8D9B0]/30" />
            <div className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 3 ? 'bg-[#B3345C] text-white' : 'bg-[#10142E] text-slate-400'
                }`}
              >
                3
              </span>
              <span className="text-xs font-heading uppercase text-[#FFF6E5]">Shifts & Submit</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
            {/* Step 1: Personal Credentials */}
            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-heading uppercase text-[#E8D9B0]">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ishaan Deshpande"
                    className="p-3 rounded-lg bg-[#10142E] border border-[#E8D9B0]/30 text-sm text-[#FFF6E5] focus:outline-none focus:border-[#E8D9B0]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-heading uppercase text-[#E8D9B0]">College Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.collegeEmail}
                    onChange={(e) => setFormData({ ...formData, collegeEmail: e.target.value })}
                    placeholder="you@festora.edu"
                    className="p-3 rounded-lg bg-[#10142E] border border-[#E8D9B0]/30 text-sm text-[#FFF6E5] focus:outline-none focus:border-[#E8D9B0]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-heading uppercase text-[#E8D9B0]">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="p-3 rounded-lg bg-[#10142E] border border-[#E8D9B0]/30 text-sm text-[#FFF6E5] focus:outline-none focus:border-[#E8D9B0]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-heading uppercase text-[#E8D9B0]">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="p-3 rounded-lg bg-[#10142E] border border-[#E8D9B0]/30 text-sm text-[#FFF6E5] focus:outline-none focus:border-[#E8D9B0]"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Comm">Electronics & Comm</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Management Studies">Management Studies</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-heading uppercase text-[#E8D9B0]">College Year *</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="p-3 rounded-lg bg-[#10142E] border border-[#E8D9B0]/30 text-sm text-[#FFF6E5] focus:outline-none focus:border-[#E8D9B0]"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-heading uppercase text-[#E8D9B0]">Emergency Contact</label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    placeholder="+91 98000 00000 (Parent / Guardian)"
                    className="p-3 rounded-lg bg-[#10142E] border border-[#E8D9B0]/30 text-sm text-[#FFF6E5] focus:outline-none focus:border-[#E8D9B0]"
                  />
                </div>

                <div className="sm:col-span-2 flex justify-end mt-4">
                  <OrnateButton
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => {
                      if (!formData.name || !formData.collegeEmail || !formData.phone) {
                        onShowToast('Required Fields', 'Please complete your name, email, and phone.', 'error');
                        return;
                      }
                      setStep(2);
                    }}
                  >
                    Next: Select Roles →
                  </OrnateButton>
                </div>
              </div>
            )}

            {/* Step 2: Roles & Events Selection */}
            {step === 2 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h4 className="font-heading text-xs uppercase tracking-wider text-[#E8D9B0] font-semibold">
                    Select Your Preferred Volunteer Roles *
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {AVAILABLE_ROLES.map((role) => {
                      const isSelected = formData.roles.includes(role.id);
                      return (
                        <div
                          key={role.id}
                          onClick={() => handleToggleRole(role.id)}
                          className={`cursor-pointer p-3 rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-[#1B2257] border-[#38BDF8] shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                              : 'bg-[#10142E] border-[#E8D9B0]/20 hover:border-[#E8D9B0]/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-display text-xs font-bold text-[#FFF6E5]">
                              {role.label}
                            </span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-[#38BDF8]" />}
                          </div>
                          <p className="text-[11px] text-[#E8D9B0]/75 mt-1 font-sans">
                            {role.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-2">
                  <h4 className="font-heading text-xs uppercase tracking-wider text-[#E8D9B0] font-semibold">
                    Attach to Live Fest Events (Optional)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-2.5">
                    {events.map((ev) => {
                      const isSelected = formData.eventIds.includes(ev.id);
                      return (
                        <div
                          key={ev.id}
                          onClick={() => handleToggleEvent(ev.id)}
                          className={`cursor-pointer p-2.5 rounded-lg border text-xs transition-all ${
                            isSelected
                              ? 'bg-[#801838]/60 border-[#E04A7B]'
                              : 'bg-[#10142E] border-[#E8D9B0]/15'
                          }`}
                        >
                          <span className="font-bold text-[#FFF6E5] block truncate">
                            {ev.title}
                          </span>
                          <span className="text-[10px] text-[#E8D9B0]/60 block mt-0.5">
                            {ev.category} · {ev.venue}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#E8D9B0]/20">
                  <OrnateButton type="button" variant="ghost" size="sm" onClick={() => setStep(1)}>
                    ← Back
                  </OrnateButton>
                  <OrnateButton
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => {
                      if (formData.roles.length === 0) {
                        onShowToast('Role Required', 'Select at least one volunteer duty.', 'error');
                        return;
                      }
                      setStep(3);
                    }}
                  >
                    Next: Availability →
                  </OrnateButton>
                </div>
              </div>
            )}

            {/* Step 3: Shifts, T-Shirt Size & Submit */}
            {step === 3 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="font-heading text-xs uppercase tracking-wider text-[#E8D9B0] font-semibold">
                    Select Your Available Time Slots *
                  </h4>
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    {SHIFT_OPTIONS.map((shift) => {
                      const isSelected = formData.availability.includes(shift);
                      return (
                        <button
                          type="button"
                          key={shift}
                          onClick={() => handleToggleShift(shift)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-sans border transition-all ${
                            isSelected
                              ? 'bg-[#064E3B] border-[#10B981] text-white shadow-md'
                              : 'bg-[#10142E] border-[#E8D9B0]/20 text-[#FFF6E5]/80 hover:border-[#E8D9B0]'
                          }`}
                        >
                          {shift}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-heading uppercase text-[#E8D9B0]">
                      Crew T-Shirt Size *
                    </label>
                    <select
                      value={formData.tshirtSize}
                      onChange={(e) => setFormData({ ...formData, tshirtSize: e.target.value })}
                      className="p-3 rounded-lg bg-[#10142E] border border-[#E8D9B0]/30 text-sm text-[#FFF6E5] focus:outline-none"
                    >
                      <option value="S">S (Chest 36")</option>
                      <option value="M">M (Chest 38")</option>
                      <option value="L">L (Chest 40")</option>
                      <option value="XL">XL (Chest 42")</option>
                      <option value="XXL">XXL (Chest 44")</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-heading uppercase text-[#E8D9B0]">
                      Prior Event Experience
                    </label>
                    <input
                      type="text"
                      value={formData.pastExperience}
                      onChange={(e) => setFormData({ ...formData, pastExperience: e.target.value })}
                      placeholder="e.g. College sports meet usher, Hackathon mentor..."
                      className="p-3 rounded-lg bg-[#10142E] border border-[#E8D9B0]/30 text-sm text-[#FFF6E5] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center mt-5 pt-3 border-t border-[#E8D9B0]/20">
                  <OrnateButton type="button" variant="ghost" size="sm" onClick={() => setStep(2)}>
                    ← Back
                  </OrnateButton>
                  <OrnateButton type="submit" variant="primary" size="lg" gem={true}>
                    ✦ Submit Application & Generate Badge ✦
                  </OrnateButton>
                </div>
              </div>
            )}
          </form>
        </OrnateFrame>
      )}

      {/* Festival Events & Notices Showcase */}
      <section className="mt-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E8D9B0]/20 pb-3">
          <div>
            <span className="font-eyebrow text-xs uppercase tracking-widest text-[#E8D9B0]">
              Official Festival Notice Board
            </span>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-gold-gradient uppercase">
              Festival Events & Schedules
            </h3>
          </div>
          <button
            onClick={() => onSwitchRole('student')}
            className="text-xs font-sans text-[#E8D9B0] hover:text-[#FFF6E5] underline flex items-center gap-1"
          >
            <span>Open Notice Sanctuary →</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <EventQuestCard
              key={ev.id}
              event={ev}
              onOpenDetails={() => {
                if (onSelectEvent) onSelectEvent(ev);
                else onSwitchRole('student');
              }}
              onQuickRegister={() => {
                if (onRegisterEvent) onRegisterEvent(ev);
                else onSwitchRole('student');
              }}
              onShowToast={(title, desc) => onShowToast(title, desc || '', 'success')}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
