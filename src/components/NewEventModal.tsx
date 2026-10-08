import React, { useState } from 'react';
import { CampusEvent, EventCategory } from '../types';
import { postalSoundFx } from '../utils/audio';
import {
  PostageStamp,
  ImportantStamp,
  PaperClip,
} from './PostalDecorations';
import { X, Plus, Calendar, MapPin, Users, Palette, Check } from 'lucide-react';

interface Props {
  initialEvent?: CampusEvent | null;
  onClose: () => void;
  onSaveEvent: (eventData: any) => void;
}

const CATEGORIES: EventCategory[] = [
  'Tech',
  'Cultural',
  'Sports',
  'Workshop',
  'Seminar',
  'Club Drive',
];

const COLOR_OPTIONS = [
  { label: 'Crimson Post', hex: '#8E2A2A' },
  { label: 'Deep Plum', hex: '#5E1250' },
  { label: 'Muted Olive', hex: '#5B7A3A' },
  { label: 'Kraft Brown', hex: '#A98258' },
  { label: 'Ink Charcoal', hex: '#2A1A14' },
];

const YEAR_OPTIONS = ['All Years', '1st Year', '2nd Year', '3rd Year', '4th Year'];
const DEPT_OPTIONS = [
  'All Departments',
  'Computer Science',
  'Information Technology',
  'Electronics & Comm.',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Data Science',
];

export const NewEventModal: React.FC<Props> = ({ initialEvent, onClose, onSaveEvent }) => {
  const isEditing = !!initialEvent;

  const [title, setTitle] = useState(initialEvent?.title || '');
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [category, setCategory] = useState<EventCategory>(initialEvent?.category || 'Tech');
  const [date, setDate] = useState(initialEvent?.date || 'NOVEMBER 14, 2026');
  const [dayLabel, setDayLabel] = useState(initialEvent?.dayLabel || 'SATURDAY');
  const [time, setTime] = useState(initialEvent?.time || '10:00 AM');
  const [venue, setVenue] = useState(initialEvent?.venue || '');
  const [capacity, setCapacity] = useState(initialEvent?.capacity || 100);
  const [registrationDeadline, setRegistrationDeadline] = useState(
    initialEvent?.registrationDeadline || '2026-11-13T23:59:00Z'
  );
  const [posterColor, setPosterColor] = useState(initialEvent?.posterColor || '#8E2A2A');
  const [organizerClub, setOrganizerClub] = useState(initialEvent?.organizerClub || 'Student Activity Council');
  const [organizerEmail, setOrganizerEmail] = useState(initialEvent?.organizerEmail || 'council@campuspost.edu');
  const [selectedYears, setSelectedYears] = useState<string[]>(
    initialEvent?.eligibilityYears || ['All Years']
  );
  const [selectedDepts, setSelectedDepts] = useState<string[]>(
    initialEvent?.eligibilityDepartments || ['All Departments']
  );

  const toggleYear = (yr: string) => {
    if (yr === 'All Years') {
      setSelectedYears(['All Years']);
      return;
    }
    const filtered = selectedYears.filter((y) => y !== 'All Years');
    if (filtered.includes(yr)) {
      const next = filtered.filter((y) => y !== yr);
      setSelectedYears(next.length === 0 ? ['All Years'] : next);
    } else {
      setSelectedYears([...filtered, yr]);
    }
  };

  const toggleDept = (dept: string) => {
    if (dept === 'All Departments') {
      setSelectedDepts(['All Departments']);
      return;
    }
    const filtered = selectedDepts.filter((d) => d !== 'All Departments');
    if (filtered.includes(dept)) {
      const next = filtered.filter((d) => d !== dept);
      setSelectedDepts(next.length === 0 ? ['All Departments'] : next);
    } else {
      setSelectedDepts([...filtered, dept]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !venue.trim()) return;

    postalSoundFx.playStampThump();

    const payload = {
      ...(initialEvent ? { id: initialEvent.id } : {}),
      title: title.trim().toUpperCase(),
      description: description.trim() || 'Official college event on the Campus Post bulletin board.',
      category,
      date: date.trim() || 'NOVEMBER 2026',
      dayLabel: dayLabel.trim().toUpperCase() || 'SATURDAY',
      time: time.trim() || '10:00 AM',
      venue: venue.trim(),
      registrationDeadline,
      capacity: Number(capacity) || 100,
      posterColor,
      organizerClub: organizerClub.trim() || 'Campus Committee',
      organizerEmail: organizerEmail.trim() || 'organizer@campuspost.edu',
      eligibilityYears: selectedYears,
      eligibilityDepartments: selectedDepts,
      tags: [category.toUpperCase(), `${capacity} SPOTS`, 'CAMPUS POST'],
      status: initialEvent?.status || 'OPEN',
    };

    onSaveEvent(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-[#A98258] border-[3px] border-[#2A1A14] rounded-[36px] p-2 shadow-[8px_8px_0px_#2A1A14] overflow-hidden max-h-[92vh] flex flex-col justify-between">
        <div className="bg-[#F3E6CE] border-2 border-[#2A1A14] rounded-[30px] p-6 sm:p-7 overflow-y-auto space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-dashed border-[#2A1A14]/30 pb-3">
            <div className="flex items-center gap-2">
              <PostageStamp price={category.toUpperCase()} title="CAMPUS" color={posterColor} className="w-9 h-11" />
              <div>
                <span className="font-display font-black text-xl text-[#2A1A14] uppercase block leading-none">
                  {isEditing ? 'EDIT NOTICE POSTING' : 'PIN NEW EVENT POSTING'}
                </span>
                <span className="font-typewriter text-[10px] text-[#8E2A2A] font-bold uppercase tracking-widest">
                  CAMPUS POST BULLETIN BOARD
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#2A1A14]/10 text-[#2A1A14] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-typewriter text-xs text-[#2A1A14]">
            {/* Title */}
            <div className="space-y-1">
              <label className="font-bold text-[11px] uppercase text-[#8E2A2A] block">
                EVENT TITLE *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. HACKCAMPUS 2026: 24-HR HACKATHON"
                className="w-full bg-[#FFF6E5] border-2 border-[#2A1A14] rounded-xl px-3.5 py-2.5 font-bold uppercase focus:outline-none focus:ring-2 focus:ring-[#8E2A2A]"
              />
            </div>

            {/* Category and Banner Color */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-[11px] uppercase text-[#8E2A2A] block">
                  CATEGORY
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EventCategory)}
                  className="w-full bg-[#FFF6E5] border-2 border-[#2A1A14] rounded-xl px-3 py-2 font-bold focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[11px] uppercase text-[#8E2A2A] block">
                  POSTER BANNER COLOR
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      type="button"
                      key={c.hex}
                      onClick={() => setPosterColor(c.hex)}
                      style={{ backgroundColor: c.hex }}
                      className={`w-7 h-7 rounded-lg border-2 border-[#2A1A14] transition-transform ${
                        posterColor === c.hex ? 'scale-115 ring-2 ring-[#2A1A14]' : 'opacity-80'
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="font-bold text-[11px] uppercase text-[#8E2A2A] block">
                EVENT BRIEF & DESCRIPTION *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe rules, highlights, schedule, cash prizes, refreshment details..."
                className="w-full bg-[#FFF6E5] border-2 border-[#2A1A14] rounded-xl px-3.5 py-2 font-serif-flourish text-xs focus:outline-none focus:ring-2 focus:ring-[#8E2A2A]"
              />
            </div>

            {/* Date, Day, Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="font-bold text-[10px] uppercase text-[#8E2A2A] block">
                  DATE
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="OCTOBER 17, 2026"
                  className="w-full bg-[#FFF6E5] border-2 border-[#2A1A14] rounded-xl px-3 py-2 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[10px] uppercase text-[#8E2A2A] block">
                  DAY LABEL
                </label>
                <input
                  type="text"
                  value={dayLabel}
                  onChange={(e) => setDayLabel(e.target.value)}
                  placeholder="SATURDAY"
                  className="w-full bg-[#FFF6E5] border-2 border-[#2A1A14] rounded-xl px-3 py-2 font-bold uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[10px] uppercase text-[#8E2A2A] block">
                  TIME
                </label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="09:00 AM"
                  className="w-full bg-[#FFF6E5] border-2 border-[#2A1A14] rounded-xl px-3 py-2 font-bold"
                />
              </div>
            </div>

            {/* Venue & Capacity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-[11px] uppercase text-[#8E2A2A] block">
                  CAMPUS VENUE *
                </label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Turing Innovation Hub, Block C"
                  className="w-full bg-[#FFF6E5] border-2 border-[#2A1A14] rounded-xl px-3 py-2 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[11px] uppercase text-[#8E2A2A] block">
                  PARTICIPANT CAPACITY *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full bg-[#FFF6E5] border-2 border-[#2A1A14] rounded-xl px-3 py-2 font-bold"
                />
              </div>
            </div>

            {/* Organizer Club & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-[11px] uppercase text-[#8E2A2A] block">
                  ORGANIZING CLUB / COMMITTEE
                </label>
                <input
                  type="text"
                  value={organizerClub}
                  onChange={(e) => setOrganizerClub(e.target.value)}
                  placeholder="IEEE Student Branch"
                  className="w-full bg-[#FFF6E5] border-2 border-[#2A1A14] rounded-xl px-3 py-2 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[11px] uppercase text-[#8E2A2A] block">
                  CONTACT EMAIL
                </label>
                <input
                  type="email"
                  value={organizerEmail}
                  onChange={(e) => setOrganizerEmail(e.target.value)}
                  placeholder="ieee@campuspost.edu"
                  className="w-full bg-[#FFF6E5] border-2 border-[#2A1A14] rounded-xl px-3 py-2 font-bold"
                />
              </div>
            </div>

            {/* Eligibility Years */}
            <div className="space-y-1.5">
              <label className="font-bold text-[11px] uppercase text-[#8E2A2A] block">
                ELIGIBILITY: STUDENT YEARS
              </label>
              <div className="flex flex-wrap gap-1.5">
                {YEAR_OPTIONS.map((yr) => (
                  <button
                    type="button"
                    key={yr}
                    onClick={() => toggleYear(yr)}
                    className={`px-2.5 py-1 rounded-lg border border-[#2A1A14] text-[10px] font-bold transition-all ${
                      selectedYears.includes(yr)
                        ? 'bg-[#8E2A2A] text-[#FFF6E5]'
                        : 'bg-[#FFF6E5] text-[#2A1A14]'
                    }`}
                  >
                    {selectedYears.includes(yr) && '✓ '}
                    {yr}
                  </button>
                ))}
              </div>
            </div>

            {/* Eligibility Departments */}
            <div className="space-y-1.5">
              <label className="font-bold text-[11px] uppercase text-[#8E2A2A] block">
                ELIGIBILITY: DEPARTMENTS
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DEPT_OPTIONS.map((dept) => (
                  <button
                    type="button"
                    key={dept}
                    onClick={() => toggleDept(dept)}
                    className={`px-2.5 py-1 rounded-lg border border-[#2A1A14] text-[10px] font-bold transition-all ${
                      selectedDepts.includes(dept)
                        ? 'bg-[#5B7A3A] text-[#FFF6E5]'
                        : 'bg-[#FFF6E5] text-[#2A1A14]'
                    }`}
                  >
                    {selectedDepts.includes(dept) && '✓ '}
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t-2 border-dashed border-[#2A1A14]/30 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold uppercase hover:underline"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-postal-red flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs uppercase font-bold"
              >
                <Plus className="w-4 h-4" />
                <span>{isEditing ? 'Save Notice Changes' : 'Pin to Notice Board'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
