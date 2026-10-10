import React, { useState } from 'react';
import {
  CampusEvent,
  SponsorPledge,
  SponsorshipKind,
} from '../types';
import { dataService } from '../services/dataService';
import { OrnateButton } from './ui/OrnateButton';
import { OrnateFrame } from './ui/OrnateFrame';
import { ThornDivider } from './ui/ThornDivider';
import { EventQuestCard } from './EventQuestCard';
import {
  Gem,
  Award,
  Upload,
  CheckCircle2,
  Sparkles,
  Building,
  Image as ImageIcon,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface SponsorDashboardProps {
  events: CampusEvent[];
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
  onSwitchRole: (role: any) => void;
  onSelectEvent?: (event: CampusEvent) => void;
  onRegisterEvent?: (event: CampusEvent) => void;
}

const SPONSORSHIP_KINDS: SponsorshipKind[] = [
  'Title',
  'Gold',
  'Silver',
  'Bronze',
  'Food & Beverage',
  'Prize/Gifts',
  'Venue/Equipment',
  'Media/Marketing',
  'Scholarship/CSR',
  'In-kind',
];

const RETURN_DELIVERABLES = [
  { id: 'logo on pass', label: 'Company Logo printed on Digital & Physical Passes' },
  { id: 'banner', label: 'Main Stage and Quad Arena Banners' },
  { id: 'stage mention', label: 'Opening Keynote & Award Ceremony Stage Mention' },
  { id: 'stall', label: 'Complimentary Prime Commercial Booth in Central Quad' },
];

export const SponsorDashboard: React.FC<SponsorDashboardProps> = ({
  events,
  onShowToast,
  onSwitchRole,
  onSelectEvent,
  onRegisterEvent,
}) => {
  const [pledges, setPledges] = useState<SponsorPledge[]>(dataService.getSponsorPledges());
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    eventIds: [events[0]?.id || 'ev-hackcampus-2026'],
    kind: 'Gold' as SponsorshipKind,
    amountOrItem: '',
    logoDataUrl: '',
    returnsWanted: ['logo on pass', 'banner', 'stage mention'],
  });

  const latestPledge = pledges[0] || null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({ ...prev, logoDataUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleReturn = (deliverable: string) => {
    setFormData((prev) => ({
      ...prev,
      returnsWanted: prev.returnsWanted.includes(deliverable)
        ? prev.returnsWanted.filter((d) => d !== deliverable)
        : [...prev.returnsWanted, deliverable],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.contactPerson || !formData.amountOrItem) {
      onShowToast('Missing Information', 'Please complete company details and pledge value.', 'error');
      return;
    }

    dataService.submitSponsorPledge(formData);
    setPledges(dataService.getSponsorPledges());
    setShowForm(false);
    soundFx.playConfirm();
    onShowToast('Pledge Submitted!', 'Thank you for supporting collegiate excellence.', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="font-eyebrow text-xs uppercase tracking-[0.25em] text-[#E04A7B]">
          University Benefactors & Corporate Guild
        </span>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-gold-gradient uppercase tracking-wider mt-1">
          Festival Sponsorship Command
        </h1>
        <p className="font-sans text-xs sm:text-sm text-[#FFF6E5]/75 mt-2">
          Empower collegiate talent, elevate brand presence across 5,000+ students, and partner on hackathons, concerts, and arenas.
        </p>
      </div>

      {/* Sponsor Wall Preview */}
      <div className="rounded-2xl bg-[#060A1C]/90 border border-[#E8D9B0]/25 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8D9B0]/15">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#E8D9B0]" />
              <h2 className="font-display font-bold text-lg sm:text-xl text-[#FFF6E5] uppercase">
                Official Festival Sponsor Wall
              </h2>
            </div>
            <p className="font-sans text-xs text-[#E8D9B0]/70 mt-0.5">
              Distinguished benefactors featured across all festival collateral and passes
            </p>
          </div>

          <OrnateButton size="sm" variant="primary" gem={true} onClick={() => setShowForm(true)}>
            ✦ Submit Corporate Pledge ✦
          </OrnateButton>
        </div>

        {/* Sponsor Grid Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {pledges.map((sp) => (
            <div
              key={sp.id}
              className="p-5 rounded-xl bg-[#10142E] border border-[#E8D9B0]/25 flex flex-col justify-between shadow-md hover:border-[#E8D9B0] transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {sp.logoDataUrl ? (
                      <img
                        src={sp.logoDataUrl}
                        alt={sp.companyName}
                        className="w-12 h-12 object-contain rounded-lg bg-white p-1"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-[#060A1C] border border-[#E8D9B0]/40 flex items-center justify-center text-[#E8D9B0]">
                        <Building className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-display font-bold text-base text-[#FFF6E5]">
                        {sp.companyName}
                      </h4>
                      <span className="text-[11px] font-sans text-[#E8D9B0]/70">
                        Lead: {sp.contactPerson}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-heading uppercase font-bold tracking-wider ${
                      sp.kind === 'Title'
                        ? 'bg-[#B3345C] text-[#FFF6E5] border border-[#E8D9B0]'
                        : sp.kind === 'Gold'
                        ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]'
                        : 'bg-[#1B2257] text-[#38BDF8] border border-[#38BDF8]/40'
                    }`}
                  >
                    {sp.kind} Partner
                  </span>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-[#060A1C]/80 border border-[#E8D9B0]/15">
                  <span className="text-[10px] font-heading uppercase tracking-wider text-[#E8D9B0]/60">
                    Pledge Commitment:
                  </span>
                  <p className="font-mono text-xs font-semibold text-[#FFF6E5] mt-1">
                    {sp.amountOrItem}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {sp.returnsWanted.map((r, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] bg-[#10142E] border border-[#E8D9B0]/20 text-[#E8D9B0]/80"
                    >
                      ✓ {r}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E8D9B0]/15 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">
                  {new Date(sp.pledgedAt).toLocaleDateString()}
                </span>
                <span
                  className={`font-heading font-bold uppercase text-[11px] ${
                    sp.status === 'Approved' ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {sp.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pledge Form Modal / Card */}
      {showForm && (
        <OrnateFrame glow={true} className="max-w-3xl mx-auto w-full">
          <div className="flex items-center justify-between pb-4 border-b border-[#E8D9B0]/20">
            <h3 className="font-display font-bold text-lg text-[#FFF6E5] uppercase">
              Submit Corporate Sponsorship Pledge
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-xs text-[#E8D9B0] hover:text-[#FFF6E5]"
            >
              Close
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-heading uppercase text-[#E8D9B0]">Company / Brand Name *</label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g. Hyperion Cloud Technologies"
                className="p-3 rounded-lg bg-[#10142E] border border-[#E8D9B0]/30 text-sm text-[#FFF6E5] focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-heading uppercase text-[#E8D9B0]">Contact Person *</label>
              <input
                type="text"
                required
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="e.g. Vikramaditya Nair"
                className="p-3 rounded-lg bg-[#10142E] border border-[#E8D9B0]/30 text-sm text-[#FFF6E5] focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-heading uppercase text-[#E8D9B0]">Official Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="partnerships@company.com"
                className="p-3 rounded-lg bg-[#10142E] border border-[#E8D9B0]/30 text-sm text-[#FFF6E5] focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-heading uppercase text-[#E8D9B0]">Phone *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 99000 88776"
                className="p-3 rounded-lg bg-[#10142E] border border-[#E8D9B0]/30 text-sm text-[#FFF6E5] focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-heading uppercase text-[#E8D9B0]">Sponsorship Tier / Kind *</label>
              <select
                value={formData.kind}
                onChange={(e) => setFormData({ ...formData, kind: e.target.value as SponsorshipKind })}
                className="p-3 rounded-lg bg-[#10142E] border border-[#E8D9B0]/30 text-sm text-[#FFF6E5] focus:outline-none"
              >
                {SPONSORSHIP_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k} Sponsorship
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-heading uppercase text-[#E8D9B0]">Logo Upload</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="sponsor-logo-file"
                />
                <label
                  htmlFor="sponsor-logo-file"
                  className="cursor-pointer flex-1 p-2.5 rounded-lg bg-[#10142E] border border-[#E8D9B0]/30 text-xs text-[#E8D9B0] hover:text-[#FFF6E5] flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{formData.logoDataUrl ? 'Logo Selected ✓' : 'Upload PNG / SVG Logo'}</span>
                </label>
              </div>
            </div>

            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-heading uppercase text-[#E8D9B0]">Pledge Amount or Item Description *</label>
              <input
                type="text"
                required
                value={formData.amountOrItem}
                onChange={(e) => setFormData({ ...formData, amountOrItem: e.target.value })}
                placeholder="e.g. ₹2,00,000 Cash Pool + 500x Cloud AI credits for Hackathon"
                className="p-3 rounded-lg bg-[#10142E] border border-[#E8D9B0]/30 text-sm text-[#FFF6E5] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 flex flex-col gap-2 mt-2">
              <label className="text-xs font-heading uppercase text-[#E8D9B0]">Expected Deliverables in Return *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {RETURN_DELIVERABLES.map((deliv) => {
                  const isChecked = formData.returnsWanted.includes(deliv.id);
                  return (
                    <div
                      key={deliv.id}
                      onClick={() => handleToggleReturn(deliv.id)}
                      className={`cursor-pointer p-2.5 rounded-lg border text-xs flex items-center gap-2 transition-all ${
                        isChecked
                          ? 'bg-[#1B2257] border-[#38BDF8] text-[#FFF6E5]'
                          : 'bg-[#10142E] border-[#E8D9B0]/15 text-[#FFF6E5]/70'
                      }`}
                    >
                      <input type="checkbox" checked={isChecked} readOnly className="pointer-events-none" />
                      <span>{deliv.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="sm:col-span-2 flex justify-end mt-4 pt-3 border-t border-[#E8D9B0]/20">
              <OrnateButton type="submit" variant="primary" size="lg" gem={true}>
                ✦ Confirm & Pledge Sponsorship ✦
              </OrnateButton>
            </div>
          </form>
        </OrnateFrame>
      )}

      {/* Festival Events & Schedules Arena */}
      <section className="mt-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E8D9B0]/20 pb-3">
          <div>
            <span className="font-eyebrow text-xs uppercase tracking-widest text-[#E8D9B0]">
              Official Festival Notice Board
            </span>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-gold-gradient uppercase">
              Festival Events & Partnership Arenas
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
