import React, { useState } from 'react';
import {
  CampusEvent,
  CampusPass,
  ScanRecord,
  CampusFeedback,
  OrganizerProfile,
} from '../types';
import { dataService } from '../services/dataService';
import { exportToCSV } from '../utils/exportCsv';
import { QRCodeDisplay } from './QRCodeDisplay';
import {
  PostageStamp,
  PointingHand,
  ImportantStamp,
  PaperClip,
  RoundRubberStamp,
} from './PostalDecorations';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Plus,
  QrCode,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Download,
  Share2,
  Sparkles,
  RefreshCw,
  Play,
  Edit,
  Eye,
  Check,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface Props {
  events: CampusEvent[];
  passes: CampusPass[];
  recentScans: ScanRecord[];
  feedbacks: CampusFeedback[];
  organizerProfile: OrganizerProfile | null;
  onRefreshData: () => void;
  onOpenScanner: (eventId?: string) => void;
  onOpenNewEvent: () => void;
  onSelectPassToView: (pass: CampusPass) => void;
  onSelectEventToEdit: (event: CampusEvent) => void;
}

const PIE_COLORS = ['#5B7A3A', '#8E2A2A', '#A98258', '#2A1A14'];

export const OrganizerCommandCenter: React.FC<Props> = ({
  events,
  passes,
  recentScans,
  feedbacks,
  organizerProfile,
  onRefreshData,
  onOpenScanner,
  onOpenNewEvent,
  onSelectPassToView,
  onSelectEventToEdit,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [eventTab, setEventTab] = useState<'overview' | 'participants' | 'feedback' | 'posterQr'>('overview');

  // Participants tab filters
  const [participantSearch, setParticipantSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checkedIn' | 'notYet'>('all');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');

  // Demo runner toast state
  const [demoLog, setDemoLog] = useState<{
    show: boolean;
    title: string;
    details: string;
    firstScanStatus: string;
    secondScanStatus: string;
  } | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);

  const currentEvent = events.find((e) => e.id === selectedEventId) || events[0];
  const eventPasses = passes.filter((p) => p.eventId === currentEvent?.id);
  const eventFeedbacks = feedbacks.filter((f) => f.eventId === currentEvent?.id);

  // Stats calculation
  const totalRegistered = currentEvent?.registeredCount || 0;
  const totalCheckedIn = currentEvent?.checkedInCount || 0;
  const spotsLeft = Math.max(0, (currentEvent?.capacity || 0) - totalRegistered);
  const attendanceRate = totalRegistered > 0 ? Math.round((totalCheckedIn / totalRegistered) * 100) : 0;
  const noShows = Math.max(0, totalRegistered - totalCheckedIn);

  // Chart 1: Check-in Donut Data
  const donutData = [
    { name: 'Checked-in', value: totalCheckedIn },
    { name: 'Pending', value: noShows },
  ];

  // Chart 2: Department breakdown
  const deptCountMap: Record<string, number> = {};
  eventPasses.forEach((p) => {
    deptCountMap[p.studentDepartment] = (deptCountMap[p.studentDepartment] || 0) + 1;
  });
  const deptChartData = Object.entries(deptCountMap).map(([name, count]) => ({
    name: name.slice(0, 14),
    count,
  }));

  // Filtered participants
  const filteredParticipants = eventPasses.filter((p) => {
    if (statusFilter === 'checkedIn' && !p.checkedIn) return false;
    if (statusFilter === 'notYet' && p.checkedIn) return false;
    if (deptFilter !== 'ALL' && p.studentDepartment !== deptFilter) return false;
    if (yearFilter !== 'ALL' && p.studentYear !== yearFilter) return false;

    if (participantSearch.trim()) {
      const q = participantSearch.toLowerCase();
      return (
        p.studentName.toLowerCase().includes(q) ||
        p.studentRollNumber.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Action: Manual check-in
  const handleManualCheckIn = (code: string) => {
    dataService.checkInCode(code, currentEvent?.id);
    onRefreshData();
  };

  // Action: Remove participant
  const handleRemoveParticipant = (passId: string) => {
    if (window.confirm('Are you sure you want to remove this participant and cancel their pass?')) {
      dataService.removeParticipant(passId);
      onRefreshData();
    }
  };

  // Action: Export Participants CSV
  const handleExportParticipantsCSV = () => {
    const rows = eventPasses.map((p) => ({
      'Student Name': p.studentName,
      'Roll Number': p.studentRollNumber,
      'College Email': p.studentEmail,
      Department: p.studentDepartment,
      Year: p.studentYear,
      'Entry Code': p.code,
      Status: p.checkedIn ? 'Checked-In' : 'Registered',
      'Check-in Time': p.checkedInAt || 'N/A',
      'Seat No': p.seatNo,
    }));
    exportToCSV(`${currentEvent.title.replace(/\s+/g, '_')}_Participants.csv`, rows);
  };

  // Action: Export Feedback CSV
  const handleExportFeedbackCSV = () => {
    const rows = eventFeedbacks.map((f) => ({
      'Student Name': f.isAnonymous ? 'Anonymous' : f.studentName,
      'Overall Rating': f.overallRating,
      'Organization Rating': f.organizationRating,
      'Content Rating': f.contentRating,
      'Venue Rating': f.venueRating,
      'Luggage Tags': f.luggageTags.join('; '),
      'What Enjoyed': f.enjoyedText,
      'What Improve': f.improveText,
      Recommend: f.recommend,
      SubmittedAt: f.submittedAt,
    }));
    exportToCSV(`${currentEvent.title.replace(/\s+/g, '_')}_Feedback.csv`, rows);
  };

  // Action: Run Judging Demo Scenario
  const handleRunDemoScenario = () => {
    try {
      const result = dataService.runJudgingDemoScenario();
      onRefreshData();
      setSelectedEventId(result.event.id);
      setEventTab('overview');

      setDemoLog({
        show: true,
        title: 'JUDGING DEMO SCENARIO EXECUTED',
        details: `Event "${result.event.title}" created. Participant ${result.pass.studentName} (${result.pass.code}) registered.`,
        firstScanStatus: result.firstScan.status === 'VALID' ? 'FIRST SCAN: ACCEPTED (VALID) ✅' : 'FAILED',
        secondScanStatus: result.secondScan.status === 'DUPLICATE' ? 'SECOND SCAN: REJECTED (DUPLICATE SHIELD) 🛡️' : 'FAILED',
      });
    } catch (err) {
      alert('Demo execution failed: ' + String(err));
    }
  };

  // Action: Reset to Demo Seed Data
  const handleResetDemoSeed = () => {
    if (window.confirm('Reset all events, passes, and scans back to the initial 3 campus events?')) {
      dataService.resetToDemoSeed();
      onRefreshData();
    }
  };

  // Action: Copy Registration Link
  const handleCopyRegLink = () => {
    const link = `${window.location.origin}#event=${currentEvent.id}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8 select-none">
      {/* Top Header & Shortcuts Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-[#2A1A14]/40 pb-6">
        <div>
          <div className="flex items-center gap-2 font-typewriter text-xs text-[#FFF6E5]/80 uppercase tracking-widest">
            <ImportantStamp text="ORGANIZER" className="text-[10px]" />
            <span>CAMPUS POST // SORTING OFFICE & COMMAND PORTAL</span>
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-[#FFF6E5] uppercase tracking-tight mt-1 text-retro-outline-plum">
            {organizerProfile?.clubName || 'CAMPUS DISPATCH'} HUD
          </h1>
          <p className="font-serif-flourish italic text-sm text-[#FFF6E5]/80 mt-1">
            Managing {events.length} campus event registrations and door attendance scanners.
          </p>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Judging Demo Runner Button */}
          <button
            onClick={handleRunDemoScenario}
            className="btn-postal-kraft flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs uppercase"
            title="Run end-to-end demo test with duplicate rejection"
          >
            <Play className="w-3.5 h-3.5 text-[#FFF6E5]" />
            <span>Run Demo Scenario ★</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={handleResetDemoSeed}
            className="btn-postal-cream flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs uppercase"
            title="Reset to 3 initial events"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#8E2A2A]" />
            <span>Reset Demo Data</span>
          </button>

          {/* New Event Button (Shortcut N) */}
          <button
            onClick={onOpenNewEvent}
            className="btn-postal-cream flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs uppercase"
          >
            <Plus className="w-3.5 h-3.5 text-[#8E2A2A]" />
            <span>New Event</span>
            <kbd className="bg-[#2A1A14] text-[#FFF6E5] px-1 py-0.2 rounded text-[9px]">N</kbd>
          </button>

          {/* Scanner Button (Shortcut S) */}
          <button
            onClick={() => onOpenScanner(currentEvent?.id)}
            className="btn-postal-red flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs uppercase font-bold"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Check-in Desk</span>
            <kbd className="bg-[#FFF6E5] text-[#2A1A14] px-1 py-0.2 rounded text-[9px] font-black">S</kbd>
          </button>
        </div>
      </div>

      {/* Demo Runner Result Banner (if triggered) */}
      {demoLog && (
        <div className="p-4 rounded-2xl bg-[#F3E6CE] border-2 border-[#2A1A14] shadow-[4px_4px_0px_#2A1A14] text-[#2A1A14] font-typewriter space-y-2">
          <div className="flex items-center justify-between border-b border-[#2A1A14]/20 pb-1">
            <span className="font-black text-[#8E2A2A] text-xs">★ {demoLog.title}</span>
            <button
              onClick={() => setDemoLog(null)}
              className="text-xs hover:font-bold"
            >
              Dismiss
            </button>
          </div>
          <p className="text-xs">{demoLog.details}</p>
          <div className="flex flex-wrap gap-4 pt-1 text-xs font-black">
            <span className="text-[#5B7A3A] bg-[#FFF6E5] px-2 py-0.5 rounded border border-[#5B7A3A]">
              {demoLog.firstScanStatus}
            </span>
            <span className="text-[#8E2A2A] bg-[#FFF6E5] px-2 py-0.5 rounded border border-[#8E2A2A]">
              {demoLog.secondScanStatus}
            </span>
          </div>
        </div>
      )}

      {/* Select Active Event Carousel / Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between font-typewriter text-xs text-[#FFF6E5]">
          <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
            <PointingHand direction="right" className="w-6 h-3" />
            <span>SELECT EVENT TO MANAGE:</span>
          </span>
          <span className="opacity-75">CLICK AN ENVELOPE TO SWITCH FOCUS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {events.map((ev) => {
            const isSelected = ev.id === currentEvent?.id;
            return (
              <div
                key={ev.id}
                onClick={() => setSelectedEventId(ev.id)}
                className={`cursor-pointer p-3.5 rounded-2xl border-[3px] border-[#2A1A14] font-typewriter transition-all ${
                  isSelected
                    ? 'bg-[#F3E6CE] text-[#2A1A14] shadow-[5px_5px_0px_#2A1A14] ring-2 ring-[#FFF6E5]'
                    : 'bg-[#A98258] text-[#FFF6E5] shadow-[2px_2px_0px_#2A1A14] hover:bg-[#B58E62]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] pb-1 border-b border-[#2A1A14]/20">
                  <span className="font-black uppercase">{ev.category}</span>
                  <span className="font-bold text-[#8E2A2A] bg-[#FFF6E5] px-1.5 rounded">
                    {ev.status}
                  </span>
                </div>
                <h4 className="font-display font-black text-sm uppercase truncate mt-1">
                  {ev.title}
                </h4>
                <div className="flex items-center justify-between text-[11px] pt-2 mt-1">
                  <span>{ev.date.slice(0, 15)}</span>
                  <span className="font-bold text-[#8E2A2A]">
                    {ev.registeredCount}/{ev.capacity} Stamped
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Event Command Module */}
      {currentEvent && (
        <div className="bg-[#F3E6CE] border-[3.5px] border-[#2A1A14] rounded-[36px] p-6 sm:p-8 shadow-[8px_8px_0px_#2A1A14] text-[#2A1A14] space-y-6">
          {/* Header of Active Event */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-dashed border-[#2A1A14]/30 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-typewriter text-[10px] text-[#8E2A2A] font-black uppercase tracking-widest">
                  EVENT COMMAND DECK
                </span>
                <ImportantStamp text={currentEvent.status} className="text-[9px]" />
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl uppercase leading-tight mt-0.5">
                {currentEvent.title}
              </h2>
              <p className="font-typewriter text-xs text-[#2A1A14]/80">
                {currentEvent.date} at {currentEvent.time} • {currentEvent.venue}
              </p>
            </div>

            {/* Quick Event Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onSelectEventToEdit(currentEvent)}
                className="btn-postal-cream flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs uppercase"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => onOpenScanner(currentEvent.id)}
                className="btn-postal-red flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs uppercase font-bold"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Scan for this Event</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm(`Delete "${currentEvent.title}" and cancel all its passes?`)) {
                    dataService.deleteEvent(currentEvent.id);
                    onRefreshData();
                  }
                }}
                className="p-2 rounded-xl bg-[#8E2A2A] text-[#FFF6E5] border-2 border-[#2A1A14] hover:bg-[#A03030]"
                title="Delete event"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Module Sub-tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b-2 border-[#2A1A14]/20 pb-3 font-typewriter text-xs">
            <button
              onClick={() => setEventTab('overview')}
              className={`px-3 py-1.5 rounded-lg border-2 border-[#2A1A14] font-bold ${
                eventTab === 'overview'
                  ? 'bg-[#8E2A2A] text-[#FFF6E5] shadow-[2px_2px_0px_#2A1A14]'
                  : 'bg-[#FFF6E5] text-[#2A1A14]'
              }`}
            >
              1. Overview & Analytics
            </button>

            <button
              onClick={() => setEventTab('participants')}
              className={`px-3 py-1.5 rounded-lg border-2 border-[#2A1A14] font-bold ${
                eventTab === 'participants'
                  ? 'bg-[#8E2A2A] text-[#FFF6E5] shadow-[2px_2px_0px_#2A1A14]'
                  : 'bg-[#FFF6E5] text-[#2A1A14]'
              }`}
            >
              2. Participants Ledger ({eventPasses.length})
            </button>

            <button
              onClick={() => setEventTab('feedback')}
              className={`px-3 py-1.5 rounded-lg border-2 border-[#2A1A14] font-bold ${
                eventTab === 'feedback'
                  ? 'bg-[#8E2A2A] text-[#FFF6E5] shadow-[2px_2px_0px_#2A1A14]'
                  : 'bg-[#FFF6E5] text-[#2A1A14]'
              }`}
            >
              3. Attendee Feedback ({eventFeedbacks.length})
            </button>

            <button
              onClick={() => setEventTab('posterQr')}
              className={`px-3 py-1.5 rounded-lg border-2 border-[#2A1A14] font-bold ${
                eventTab === 'posterQr'
                  ? 'bg-[#8E2A2A] text-[#FFF6E5] shadow-[2px_2px_0px_#2A1A14]'
                  : 'bg-[#FFF6E5] text-[#2A1A14]'
              }`}
            >
              4. Registration QR & Link
            </button>
          </div>

          {/* SUB-TAB 1: OVERVIEW & ANALYTICS */}
          {eventTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-typewriter">
                <div className="p-3.5 bg-[#FFF6E5] border-2 border-[#2A1A14] rounded-xl shadow-[2px_2px_0px_#2A1A14]">
                  <span className="text-[10px] opacity-75 font-bold uppercase block">REGISTERED:</span>
                  <span className="font-display font-black text-2xl text-[#2A1A14]">{totalRegistered}</span>
                  <span className="text-[9px] opacity-60 block">of {currentEvent.capacity} seats</span>
                </div>

                <div className="p-3.5 bg-[#FFF6E5] border-2 border-[#2A1A14] rounded-xl shadow-[2px_2px_0px_#2A1A14]">
                  <span className="text-[10px] opacity-75 font-bold uppercase block">CHECKED IN:</span>
                  <span className="font-display font-black text-2xl text-[#5B7A3A]">{totalCheckedIn}</span>
                  <span className="text-[9px] opacity-60 block">at threshold</span>
                </div>

                <div className="p-3.5 bg-[#FFF6E5] border-2 border-[#2A1A14] rounded-xl shadow-[2px_2px_0px_#2A1A14]">
                  <span className="text-[10px] opacity-75 font-bold uppercase block">SPOTS LEFT:</span>
                  <span className="font-display font-black text-2xl text-[#8E2A2A]">{spotsLeft}</span>
                  <span className="text-[9px] opacity-60 block">open capacity</span>
                </div>

                <div className="p-3.5 bg-[#FFF6E5] border-2 border-[#2A1A14] rounded-xl shadow-[2px_2px_0px_#2A1A14]">
                  <span className="text-[10px] opacity-75 font-bold uppercase block">PENDING / NO-SHOWS:</span>
                  <span className="font-display font-black text-2xl text-[#A98258]">{noShows}</span>
                  <span className="text-[9px] opacity-60 block">unverified</span>
                </div>

                <div className="p-3.5 bg-[#FFF6E5] border-2 border-[#2A1A14] rounded-xl shadow-[2px_2px_0px_#2A1A14] col-span-2 sm:col-span-1">
                  <span className="text-[10px] opacity-75 font-bold uppercase block">ATTENDANCE %:</span>
                  <span className="font-display font-black text-2xl text-[#5E1250]">{attendanceRate}%</span>
                  <span className="text-[9px] opacity-60 block">turnout rate</span>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Donut Chart: Check-in turnout */}
                <div className="bg-[#FFF6E5] p-5 rounded-2xl border-2 border-[#2A1A14] shadow-[3px_3px_0px_#2A1A14] font-typewriter space-y-2">
                  <span className="font-black text-xs uppercase block text-[#8E2A2A]">
                    ★ CHECK-IN TURN-OUT RATIO
                  </span>
                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={4}
                        >
                          {donutData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 text-[11px] font-bold">
                    <span className="flex items-center gap-1.5 text-[#5B7A3A]">
                      <span className="w-3 h-3 bg-[#5B7A3A] rounded-full inline-block" />
                      Checked-In ({totalCheckedIn})
                    </span>
                    <span className="flex items-center gap-1.5 text-[#8E2A2A]">
                      <span className="w-3 h-3 bg-[#8E2A2A] rounded-full inline-block" />
                      Pending ({noShows})
                    </span>
                  </div>
                </div>

                {/* Bar Chart: Department Breakdown */}
                <div className="bg-[#FFF6E5] p-5 rounded-2xl border-2 border-[#2A1A14] shadow-[3px_3px_0px_#2A1A14] font-typewriter space-y-2">
                  <span className="font-black text-xs uppercase block text-[#8E2A2A]">
                    ★ DEPARTMENT-WISE REGISTRATIONS
                  </span>
                  <div className="h-52 w-full">
                    {deptChartData.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-xs opacity-60">
                        No registrations recorded yet.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={deptChartData}>
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#8E2A2A" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  <div className="text-center text-[10px] opacity-70">
                    Distribution across enrolled colleges & academic departments
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 2: PARTICIPANTS TABLE */}
          {eventTab === 'participants' && (
            <div className="space-y-4 font-typewriter text-xs">
              {/* Table Controls Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#FFF6E5] p-3 rounded-2xl border-2 border-[#2A1A14]">
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  {/* Search */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#2A1A14]/50 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={participantSearch}
                      onChange={(e) => setParticipantSearch(e.target.value)}
                      placeholder="Search name, roll no, code..."
                      className="pl-8 pr-3 py-1.5 rounded-lg bg-[#F3E6CE] border border-[#2A1A14] text-xs w-48 focus:outline-none"
                    />
                  </div>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="p-1.5 rounded-lg bg-[#F3E6CE] border border-[#2A1A14] font-bold text-xs"
                  >
                    <option value="all">Status: All</option>
                    <option value="checkedIn">Status: Checked-In</option>
                    <option value="notYet">Status: Not Yet</option>
                  </select>

                  {/* Dept Filter */}
                  <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="p-1.5 rounded-lg bg-[#F3E6CE] border border-[#2A1A14] font-bold text-xs"
                  >
                    <option value="ALL">Dept: All</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Tech</option>
                    <option value="Electronics & Comm.">Electronics (ECE)</option>
                    <option value="Mechanical Eng.">Mechanical</option>
                    <option value="Biotechnology">Biotechnology</option>
                  </select>

                  {/* Year Filter */}
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="p-1.5 rounded-lg bg-[#F3E6CE] border border-[#2A1A14] font-bold text-xs"
                  >
                    <option value="ALL">Year: All</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                {/* CSV Export Button */}
                <button
                  onClick={handleExportParticipantsCSV}
                  className="btn-postal-kraft flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase shrink-0"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto bg-[#FFF6E5] rounded-2xl border-2 border-[#2A1A14] shadow-[3px_3px_0px_#2A1A14]">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b-2 border-[#2A1A14] bg-[#F3E6CE] text-[10px] font-black uppercase text-[#2A1A14]/75">
                      <th className="p-3">STUDENT NAME</th>
                      <th className="p-3">ROLL NO</th>
                      <th className="p-3">DEPT & YEAR</th>
                      <th className="p-3">CODE</th>
                      <th className="p-3">STATUS</th>
                      <th className="p-3">TIME</th>
                      <th className="p-3 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A1A14]/15">
                    {filteredParticipants.map((p) => (
                      <tr key={p.id} className="hover:bg-[#F3E6CE]/70 transition-colors">
                        <td className="p-3">
                          <span className="font-display font-black text-sm block">{p.studentName}</span>
                          <span className="text-[10px] opacity-70 block">{p.studentEmail}</span>
                        </td>
                        <td className="p-3 font-black text-[#8E2A2A]">{p.studentRollNumber}</td>
                        <td className="p-3">
                          <span className="font-bold block">{p.studentDepartment}</span>
                          <span className="text-[10px] opacity-70 block">{p.studentYear}</span>
                        </td>
                        <td className="p-3 font-black">{p.code}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border border-[#2A1A14] ${
                              p.checkedIn
                                ? 'bg-[#5B7A3A] text-[#FFF6E5]'
                                : 'bg-[#8E2A2A] text-[#FFF6E5]'
                            }`}
                          >
                            {p.checkedIn ? 'CHECKED IN' : 'REGISTERED'}
                          </span>
                        </td>
                        <td className="p-3 text-[10px] opacity-70">
                          {p.checkedInAt ? new Date(p.checkedInAt).toLocaleTimeString() : '—'}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!p.checkedIn ? (
                              <button
                                onClick={() => handleManualCheckIn(p.code)}
                                className="px-2.5 py-1 rounded bg-[#5B7A3A] text-[#FFF6E5] font-bold text-[10px] uppercase border border-[#2A1A14]"
                                title="Manually stamp in"
                              >
                                Stamp In
                              </button>
                            ) : (
                              <span className="text-[10px] text-[#5B7A3A] font-bold">Verified</span>
                            )}

                            <button
                              onClick={() => onSelectPassToView(p)}
                              className="p-1 rounded bg-[#F3E6CE] border border-[#2A1A14] hover:bg-[#FFF6E5]"
                              title="View Pass"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleRemoveParticipant(p.id)}
                              className="p-1 rounded bg-[#8E2A2A] text-[#FFF6E5] border border-[#2A1A14] hover:bg-[#A03030]"
                              title="Remove participant"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredParticipants.length === 0 && (
                  <div className="py-8 text-center opacity-60">
                    No participants matched the filters.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB 3: FEEDBACK */}
          {eventTab === 'feedback' && (
            <div className="space-y-4 font-typewriter text-xs">
              <div className="flex items-center justify-between bg-[#FFF6E5] p-3 rounded-2xl border-2 border-[#2A1A14]">
                <div>
                  <span className="font-black text-xs uppercase block text-[#8E2A2A]">
                    ATTENDEE REVIEWS ({eventFeedbacks.length} LETTERS)
                  </span>
                  <span className="text-[11px] opacity-75">
                    Average Score: {eventFeedbacks.length > 0 ? (eventFeedbacks.reduce((a, b) => a + b.overallRating, 0) / eventFeedbacks.length).toFixed(1) : 'N/A'} / 5.0 Stars
                  </span>
                </div>

                <button
                  onClick={handleExportFeedbackCSV}
                  disabled={eventFeedbacks.length === 0}
                  className="btn-postal-kraft flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              {eventFeedbacks.length === 0 ? (
                <div className="py-12 text-center bg-[#FFF6E5] rounded-2xl border-2 border-[#2A1A14] p-6 opacity-75">
                  No feedback letters received yet. Only students who have been checked in can submit reviews.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eventFeedbacks.map((fb) => (
                    <div
                      key={fb.id}
                      className="bg-[#FFF6E5] p-4 rounded-2xl border-2 border-[#2A1A14] shadow-[2px_2px_0px_#2A1A14] space-y-2"
                    >
                      <div className="flex items-center justify-between border-b border-[#2A1A14]/20 pb-1.5">
                        <span className="font-bold text-sm">
                          {fb.isAnonymous ? 'Anonymous Attendee' : fb.studentName}
                        </span>
                        <span className="text-[#8E2A2A] font-black">
                          ★ {fb.overallRating}/5 STAMPS
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1 text-[10px] opacity-80">
                        <span>Org: {fb.organizationRating}★</span>
                        <span>Content: {fb.contentRating}★</span>
                        <span>Venue: {fb.venueRating}★</span>
                      </div>

                      <div className="bg-[#F3E6CE] p-2.5 rounded-lg border border-[#2A1A14]/20 space-y-1">
                        <p className="text-xs">
                          <strong className="text-[#8E2A2A]">Enjoyed:</strong> {fb.enjoyedText}
                        </p>
                        {fb.improveText && (
                          <p className="text-xs">
                            <strong className="text-[#A98258]">Improve:</strong> {fb.improveText}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {fb.luggageTags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-[#A98258] text-[#FFF6E5] px-1.5 py-0.5 rounded text-[9px] font-bold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="text-[10px] opacity-60 text-right">
                        Would recommend: {fb.recommend}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SUB-TAB 4: POSTER REGISTRATION QR & SHAREABLE LINK */}
          {eventTab === 'posterQr' && (
            <div className="max-w-md mx-auto p-6 bg-[#FFF6E5] rounded-3xl border-2 border-[#2A1A14] shadow-[4px_4px_0px_#2A1A14] font-typewriter text-center space-y-4">
              <span className="text-xs font-black uppercase text-[#8E2A2A] block">
                ★ PRINTABLE NOTICE BOARD POSTER QR ★
              </span>

              <h3 className="font-display font-black text-xl uppercase">
                {currentEvent.title}
              </h3>

              <div className="bg-white p-4 rounded-2xl border-2 border-[#2A1A14] shadow-[3px_3px_0px_#2A1A14] inline-block">
                <QRCodeDisplay
                  text={`${window.location.origin}#event=${currentEvent.id}`}
                  size={160}
                  fgColor="#2A1A14"
                  bgColor="#FFFFFF"
                />
              </div>

              <p className="text-xs opacity-75">
                Students can scan this code from physical campus posters or flyers to open the reply card directly.
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}#event=${currentEvent.id}`}
                  className="flex-1 p-2 rounded-lg bg-[#F3E6CE] border border-[#2A1A14] text-[11px] font-bold"
                />
                <button
                  onClick={handleCopyRegLink}
                  className="btn-postal-red px-3 py-2 rounded-lg text-xs font-bold uppercase"
                >
                  {copiedLink ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
