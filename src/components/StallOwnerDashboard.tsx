import React, { useState } from 'react';
import {
  CampusEvent,
  StallRequest,
  StallType,
  StallSpace,
} from '../types';
import { dataService } from '../services/dataService';
import { OrnateButton } from './ui/OrnateButton';
import { OrnateFrame } from './ui/OrnateFrame';
import { ThornDivider } from './ui/ThornDivider';
import { EventQuestCard } from './EventQuestCard';
import {
  Store,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Tag,
  Grid,
  PlusCircle,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface StallOwnerDashboardProps {
  events: CampusEvent[];
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
  onSwitchRole: (role: any) => void;
  onSelectEvent?: (event: CampusEvent) => void;
  onRegisterEvent?: (event: CampusEvent) => void;
}

const STALL_TYPES: { id: StallType; label: string }[] = [
  { id: 'food', label: 'Artisan Food & Beverage' },
  { id: 'merchandise', label: 'Apparel & Fest Merch' },
  { id: 'games', label: 'Carnival & Gaming Arcade' },
  { id: 'art/craft', label: 'Handmade Art & Crafts' },
  { id: 'tech demo', label: 'Startup & Tech Prototype Demo' },
  { id: 'NGO', label: 'Social Impact & NGO Drive' },
  { id: 'other', label: 'Other Commercial Venture' },
];

const MINI_STALL_GRID = [
  { id: 'FC-01', zone: 'Food Court Quad', status: 'Reserved' },
  { id: 'FC-02', zone: 'Food Court Quad', status: 'Available' },
  { id: 'FC-03', zone: 'Food Court Quad', status: 'Allotted (The Alchemist Cafe)' },
  { id: 'FC-04', zone: 'Food Court Quad', status: 'Available' },
  { id: 'ML-01', zone: 'Merchandise Lane', status: 'Available' },
  { id: 'ML-02', zone: 'Merchandise Lane', status: 'Reserved' },
  { id: 'GA-01', zone: 'Games Arena', status: 'Available' },
  { id: 'AA-01', zone: 'Artisan Alley', status: 'Available' },
];

export const StallOwnerDashboard: React.FC<StallOwnerDashboardProps> = ({
  events,
  onShowToast,
  onSwitchRole,
  onSelectEvent,
  onRegisterEvent,
}) => {
  const [stalls, setStalls] = useState<StallRequest[]>(dataService.getStallRequests());
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    contactEmail: '',
    contactPhone: '',
    stallType: 'food' as StallType,
    eventId: events[0]?.id || 'ev-tarang-2026',
    spaceNeeded: 'medium' as StallSpace,
    powerWaterNeeds: '2x 15A Power Sockets + Drinking Water Connection',
    itemsSold: '',
    priceRange: '₹50 — ₹250',
    licenseId: '',
    setupTime: '2 hours prior to festival opening',
  });

  const latestStall = stalls[0] || null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.ownerName || !formData.contactEmail) {
      onShowToast('Missing Information', 'Please complete the business and contact details.', 'error');
      return;
    }

    dataService.submitStallRequest(formData);
    setStalls(dataService.getStallRequests());
    setShowForm(false);
    soundFx.playConfirm();
    onShowToast('Request Submitted!', 'Your stall application is under council review.', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="font-eyebrow text-xs uppercase tracking-[0.25em] text-[#F59E0B]">
          Merchant Guild & Bazaar
        </span>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-gold-gradient uppercase tracking-wider mt-1">
          Campus Stall Operations
        </h1>
        <p className="font-sans text-xs sm:text-sm text-[#FFF6E5]/75 mt-2">
          Host food pop-ups, artisanal merchandise, game booths, and interactive exhibits during the fest.
        </p>
      </div>

      {/* Top Banner: Status & Mini Layout Grid */}
      {latestStall && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Stall Status Card */}
          <div className="lg:col-span-1 rounded-2xl bg-gradient-to-b from-[#10142E] via-[#060A1C] to-[#10142E] border-2 border-[#E8D9B0] p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E8D9B0]/20">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-[#F59E0B]" />
                  <span className="font-mono text-xs uppercase tracking-wider text-[#F59E0B] font-bold">
                    STALL PERMIT
                  </span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-heading font-bold uppercase ${
                    latestStall.status === 'Approved'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                      : 'bg-amber-950 text-amber-300 border border-amber-500'
                  }`}
                >
                  {latestStall.status}
                </span>
              </div>

              <h3 className="font-display font-bold text-xl text-[#FFF6E5] uppercase mt-3">
                {latestStall.businessName}
              </h3>
              <p className="font-sans text-xs text-[#E8D9B0]/80 mt-0.5">
                Owner: <strong>{latestStall.ownerName}</strong>
              </p>

              <div className="mt-4 p-3 rounded-xl bg-[#060A1C] border border-[#E8D9B0]/25">
                <div className="flex items-center gap-1.5 text-xs text-[#E8D9B0]">
                  <MapPin className="w-4 h-4 text-[#E04A7B]" />
                  <span className="font-heading uppercase font-bold">Allotted Plot:</span>
                </div>
                <p className="font-mono text-sm font-bold text-[#FFF6E5] mt-1">
                  {latestStall.allottedPlot || 'Assignment in Progress (Council Allocating)'}
                </p>
              </div>

              <div className="mt-3 text-xs text-[#FFF6E5]/75 flex flex-col gap-1.5 font-sans">
                <p>
                  <strong className="text-[#E8D9B0]">Items:</strong> {latestStall.itemsSold || 'Artisan Goods'}
                </p>
                <p>
                  <strong className="text-[#E8D9B0]">Price Range:</strong> {latestStall.priceRange}
                </p>
                <p>
                  <strong className="text-[#E8D9B0]">Power/Water:</strong> {latestStall.powerWaterNeeds}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#E8D9B0]/20 flex justify-end">
              <OrnateButton size="sm" variant="ghost" onClick={() => setShowForm(true)}>
                Submit Another Request
              </OrnateButton>
            </div>
          </div>

          {/* Mini Stall Layout Grid */}
          <div className="lg:col-span-2 rounded-2xl bg-[#060A1C]/90 border border-[#E8D9B0]/25 p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E8D9B0]/20">
                <div className="flex items-center gap-2">
                  <Grid className="w-5 h-5 text-[#E8D9B0]" />
                  <h3 className="font-display font-bold text-base sm:text-lg text-[#FFF6E5] uppercase">
                    Campus Fest Stall Matrix & Plot Availability
                  </h3>
                </div>
                <span className="text-xs text-[#E8D9B0]/75 font-mono">Quad B Map</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {MINI_STALL_GRID.map((plot) => {
                  const isUserPlot =
                    latestStall.allottedPlot && latestStall.allottedPlot.includes(plot.id);

                  return (
                    <div
                      key={plot.id}
                      className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                        isUserPlot
                          ? 'bg-[#801838]/80 border-[#E04A7B] shadow-[0_0_15px_rgba(224,74,123,0.35)]'
                          : plot.status.includes('Allotted')
                          ? 'bg-[#1B2257]/60 border-[#38BDF8]/40'
                          : plot.status === 'Reserved'
                          ? 'bg-[#2A153A] border-[#A855F7]/30'
                          : 'bg-[#10142E] border-[#E8D9B0]/20 hover:border-[#E8D9B0]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#E8D9B0]">
                          {plot.id}
                        </span>
                        {isUserPlot && (
                          <span className="w-2 h-2 rounded-full bg-[#E04A7B] animate-ping" />
                        )}
                      </div>
                      <span className="text-[10px] text-[#FFF6E5]/70 font-sans mt-1">
                        {plot.zone}
                      </span>
                      <span
                        className={`text-[10px] font-heading font-bold uppercase mt-2 ${
                          isUserPlot
                            ? 'text-white'
                            : plot.status === 'Available'
                            ? 'text-emerald-400'
                            : 'text-amber-300'
                        }`}
                      >
                        {isUserPlot ? 'YOUR PLOT' : plot.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-[#E8D9B0]/70 font-sans mt-4">
              Plots are assigned based on electrical requirements and food safety certifications.
            </p>
          </div>
        </div>
      )}

      {/* If no stall or user wants to submit new request */}
      {(!latestStall || showForm) && (
        <OrnateFrame glow={true} className="max-w-3xl mx-auto w-full">
          <div className="flex items-center justify-between pb-4 border-b border-[#E8D9B0]/20">
            <h3 className="font-display font-bold text-lg text-[#FFF6E5] uppercase">
              Apply for a Campus Stall Plot
            </h3>
            {showForm && (
              <button
                onClick={() => setShowForm(false)}
                className="text-xs text-[#E8D9B0] hover:text-[#FFF6E5]"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-heading uppercase text-[#E8D9B0]">Business / Club Name *</label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="e.g. Saffron Bistro & Coffee"
                className="p-3 rounded-lg bg-[#10142E] border border-[#E8D9B0]/30 text-sm text-[#FFF6E5] focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-heading uppercase text-[#E8D9B0]">Owner / Lead Name *</label>
              <input
                type="text"
                required
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                placeholder="e.g. Kabir Mehta"
                className="p-3 rounded-lg bg-[#10142E] border border-[#E8D9B0]/30 text-sm text-[#FFF6E5] focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-heading uppercase text-[#E8D9B0]">Contact Email *</label>
              <input
                type="email"
                required
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="kabir@bistro.in"
                className="p-3 rounded-lg bg-[#10142E] border border-[#E8D9B0]/30 text-sm text-[#FFF6E5] focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-heading uppercase text-[#E8D9B0]">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="+91 99887 76655"
                className="p-3 rounded-lg bg-[#10142E] border border-[#E8D9B0]/30 text-sm text-[#FFF6E5] focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-heading uppercase text-[#E8D9B0]">Stall Category *</label>
              <select
                value={formData.stallType}
                onChange={(e) => setFormData({ ...formData, stallType: e.target.value as StallType })}
                className="p-3 rounded-lg bg-[#10142E] border border-[#E8D9B0]/30 text-sm text-[#FFF6E5] focus:outline-none"
              >
                {STALL_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-heading uppercase text-[#E8D9B0]">Space Required *</label>
              <select
                value={formData.spaceNeeded}
                onChange={(e) => setFormData({ ...formData, spaceNeeded: e.target.value as StallSpace })}
                className="p-3 rounded-lg bg-[#10142E] border border-[#E8D9B0]/30 text-sm text-[#FFF6E5] focus:outline-none"
              >
                <option value="small">Small Booth (6ft × 6ft)</option>
                <option value="medium">Medium Canopy (10ft × 10ft)</option>
                <option value="large">Large Pavillion (15ft × 15ft)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-heading uppercase text-[#E8D9B0]">Attach to Fest Event</label>
              <select
                value={formData.eventId}
                onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                className="p-3 rounded-lg bg-[#10142E] border border-[#E8D9B0]/30 text-sm text-[#FFF6E5] focus:outline-none"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.venue})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-heading uppercase text-[#E8D9B0]">Food Safety / License ID</label>
              <input
                type="text"
                value={formData.licenseId}
                onChange={(e) => setFormData({ ...formData, licenseId: e.target.value })}
                placeholder="FSSAI / Student Club ID"
                className="p-3 rounded-lg bg-[#10142E] border border-[#E8D9B0]/30 text-sm text-[#FFF6E5] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-heading uppercase text-[#E8D9B0]">Items Sold & Price Range *</label>
              <input
                type="text"
                required
                value={formData.itemsSold}
                onChange={(e) => setFormData({ ...formData, itemsSold: e.target.value })}
                placeholder="e.g. Specialty tacos, matcha coolers, churros (₹90 — ₹180)"
                className="p-3 rounded-lg bg-[#10142E] border border-[#E8D9B0]/30 text-sm text-[#FFF6E5] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-heading uppercase text-[#E8D9B0]">Power / Water Utilities Needed</label>
              <input
                type="text"
                value={formData.powerWaterNeeds}
                onChange={(e) => setFormData({ ...formData, powerWaterNeeds: e.target.value })}
                placeholder="e.g. 2x 15A socket for warmers, water tap access"
                className="p-3 rounded-lg bg-[#10142E] border border-[#E8D9B0]/30 text-sm text-[#FFF6E5] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end mt-4 pt-3 border-t border-[#E8D9B0]/20">
              <OrnateButton type="submit" variant="primary" size="lg" gem={true}>
                ✦ Submit Stall Application ✦
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
              Festival Events & Footfall Venues
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
