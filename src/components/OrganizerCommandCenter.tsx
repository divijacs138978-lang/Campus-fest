import React, { useState, useEffect } from 'react';
import {
  CampusEvent,
  CampusPass,
  ScanRecord,
  CampusFeedback,
  OrganizerProfile,
  VolunteerApplication,
  StallRequest,
  SponsorPledge,
} from '../types';
import { dataService } from '../services/dataService';
import { historyService } from '../services/historyService';
import { useHistory } from '../hooks/useHistory';
import { exportToCSV } from '../utils/exportCsv';
import { QRCodeDisplay } from './QRCodeDisplay';
import { CinemaSeatMap } from './CinemaSeatMap';
import { EmptyNoticeState } from './EmptyNoticeState';
import { ParticipantPortrait } from './ParticipantPortrait';
import { OrnateButton } from './ui/OrnateButton';
import { ThornDivider } from './ui/ThornDivider';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
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
  Edit,
  Check,
  AlertCircle,
  FileSpreadsheet,
  Undo2,
  Redo2,
  Armchair,
  Users,
  Store,
  Gem,
  HeartHandshake,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

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
  onShowToast?: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
  onSignOut?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Tech: '#38BDF8',
  Cultural: '#E04A7B',
  Sports: '#F59E0B',
  Workshop: '#10B981',
  Seminar: '#A855F7',
  'Club Drive': '#E8D9B0',
};

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
  onShowToast,
  onSignOut,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [eventTab, setEventTab] = useState<'overview' | 'seatMap' | 'participants' | 'requests' | 'feedback' | 'posterQr'>('overview');
  const [requestsSubTab, setRequestsSubTab] = useState<'volunteers' | 'stalls' | 'sponsors'>('volunteers');

  // Participants tab filters
  const [participantSearch, setParticipantSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checkedIn' | 'notYet'>('all');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Live timer indicator
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  // Undo/Redo integration
  const { canUndo, canRedo, undoDesc, redoDesc, undo, redo } = useHistory(onRefreshData);

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
  }, [events, passes, recentScans]);

  const currentEvent = events.find((e) => e.id === selectedEventId) || events[0];
  const eventPasses = passes.filter((p) => p.eventId === currentEvent?.id);
  const eventFeedbacks = feedbacks.filter((f) => f.eventId === currentEvent?.id);

  // Requests data
  const volunteers = dataService.getVolunteerApplications();
  const stalls = dataService.getStallRequests();
  const sponsors = dataService.getSponsorPledges();

  const pendingVolunteers = volunteers.filter((v) => v.status === 'Pending').length;
  const pendingStalls = stalls.filter((s) => s.status === 'Pending').length;
  const pendingSponsors = sponsors.filter((sp) => sp.status === 'Pending').length;
  const totalPendingRequests = pendingVolunteers + pendingStalls + pendingSponsors;

  // Global counts for big number tiles
  const totalRegisteredAll = passes.length;
  const totalCheckedInAll = passes.filter((p) => p.checkedIn).length;
  const totalCapacityAll = events.reduce((sum, e) => sum + e.capacity, 0);
  const seatsLeftAll = Math.max(0, totalCapacityAll - totalRegisteredAll);
  const overallCheckinRate = totalRegisteredAll > 0 ? Math.round((totalCheckedInAll / totalRegisteredAll) * 100) : 0;
  const liveEventsCount = events.filter((e) => e.status === 'LIVE' || e.status === 'OPEN').length;

  // Event specific stats
  const totalRegistered = currentEvent?.registeredCount || 0;
  const totalCheckedIn = currentEvent?.checkedInCount || 0;
  const attendanceRate = totalRegistered > 0 ? Math.round((totalCheckedIn / totalRegistered) * 100) : 0;

  // --- CHART 1: Registrations Over Time (Cumulative Area Chart) ---
  const timelineData = [
    { time: '09:00', registrations: Math.round(totalRegistered * 0.15) },
    { time: '11:00', registrations: Math.round(totalRegistered * 0.35) },
    { time: '13:00', registrations: Math.round(totalRegistered * 0.58) },
    { time: '15:00', registrations: Math.round(totalRegistered * 0.78) },
    { time: '17:00', registrations: Math.round(totalRegistered * 0.92) },
    { time: 'Now', registrations: totalRegistered },
  ];

  // --- CHART 2: Registrations by Category (Donut Chart) ---
  const categoryCounts: Record<string, number> = {};
  events.forEach((ev) => {
    categoryCounts[ev.category] = (categoryCounts[ev.category] || 0) + ev.registeredCount;
  });
  const categoryDonutData = Object.entries(categoryCounts).map(([cat, count]) => ({
    name: cat,
    value: count,
    color: CATEGORY_COLORS[cat] || '#E8D9B0',
  }));

  // --- CHART 3: Seats Filled per Event (Stacked Horizontal Bars) ---
  const seatsStackedData = events.slice(0, 5).map((ev) => {
    const checked = ev.checkedInCount;
    const registeredOnly = Math.max(0, ev.registeredCount - checked);
    const free = Math.max(0, ev.capacity - ev.registeredCount);
    return {
      name: ev.title.length > 18 ? ev.title.slice(0, 16) + '...' : ev.title,
      checkedIn: checked,
      registered: registeredOnly,
      free: free,
    };
  });

  // --- CHART 4: Check-in Rate Radial Gauge ---
  const radialGaugeData = [
    {
      name: 'Admitted',
      value: attendanceRate,
      fill: '#10B981',
    },
  ];

  // Filtered participants list
  const filteredPasses = eventPasses.filter((p) => {
    if (statusFilter === 'checkedIn' && !p.checkedIn) return false;
    if (statusFilter === 'notYet' && p.checkedIn) return false;
    if (deptFilter !== 'ALL' && p.studentDepartment !== deptFilter) return false;
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

  // Unique departments for filter
  const departments = Array.from(new Set(eventPasses.map((p) => p.studentDepartment))).filter(Boolean);

  // Command-Pattern Wrapped Action: Manual Check-In with Undo/Redo
  const handleCheckInWithHistory = (code: string) => {
    const pass = passes.find((p) => p.code.toUpperCase() === code.trim().toUpperCase());
    const studentDesc = pass ? `${pass.studentName} (${pass.seatLabel || pass.code})` : code;

    historyService.execute({
      description: `Check-in of ${studentDesc}`,
      execute: () => {
        dataService.checkInCode(code, currentEvent?.id);
        soundFx.playCheckin();
        onRefreshData();
      },
      undo: () => {
        dataService.undoCheckIn(code);
        onRefreshData();
      },
    });

    if (onShowToast) {
      onShowToast('Participant Admitted', `Checked in: ${studentDesc}`, 'success');
    }
  };

  const handleUndoCheckInWithHistory = (code: string) => {
    const pass = passes.find((p) => p.code.toUpperCase() === code.trim().toUpperCase());
    const studentDesc = pass ? `${pass.studentName} (${pass.seatLabel || pass.code})` : code;

    historyService.execute({
      description: `Undo check-in of ${studentDesc}`,
      execute: () => {
        dataService.undoCheckIn(code);
        soundFx.playUndo();
        onRefreshData();
      },
      undo: () => {
        dataService.checkInCode(code, currentEvent?.id);
        onRefreshData();
      },
    });

    if (onShowToast) {
      onShowToast('Check-in Reverted', `Undid entry for: ${studentDesc}`, 'info');
    }
  };

  const handleApproveVolunteer = (volId: string) => {
    const vol = volunteers.find((v) => v.id === volId);
    if (!vol) return;
    const oldStatus = vol.status;

    historyService.execute({
      description: `Approve Volunteer ${vol.name}`,
      execute: () => {
        dataService.updateVolunteerStatus(volId, 'Approved', [
          'Main Gate Pass Validation (09:00 — 14:00)',
          'Auditorium Escort Lead (15:00 — 19:00)',
        ]);
        soundFx.playConfirm();
        onRefreshData();
      },
      undo: () => {
        dataService.updateVolunteerStatus(volId, oldStatus);
        onRefreshData();
      },
    });

    if (onShowToast) onShowToast('Volunteer Approved', `${vol.name} assigned shifts.`, 'success');
  };

  const handleRejectVolunteer = (volId: string) => {
    const vol = volunteers.find((v) => v.id === volId);
    if (!vol) return;
    const oldStatus = vol.status;

    historyService.execute({
      description: `Reject Volunteer ${vol.name}`,
      execute: () => {
        dataService.updateVolunteerStatus(volId, 'Rejected');
        soundFx.playError();
        onRefreshData();
      },
      undo: () => {
        dataService.updateVolunteerStatus(volId, oldStatus);
        onRefreshData();
      },
    });
  };

  const handleApproveStall = (stallId: string) => {
    const s = stalls.find((x) => x.id === stallId);
    if (!s) return;
    const oldStatus = s.status;

    historyService.execute({
      description: `Approve Stall ${s.businessName}`,
      execute: () => {
        dataService.updateStallStatus(stallId, 'Approved', 'FC-04 (Food Court Quad)');
        soundFx.playConfirm();
        onRefreshData();
      },
      undo: () => {
        dataService.updateStallStatus(stallId, oldStatus, undefined);
        onRefreshData();
      },
    });

    if (onShowToast) onShowToast('Stall Approved', `${s.businessName} allotted plot FC-04.`, 'success');
  };

  const handleRejectStall = (stallId: string) => {
    const s = stalls.find((x) => x.id === stallId);
    if (!s) return;
    const oldStatus = s.status;

    historyService.execute({
      description: `Reject Stall ${s.businessName}`,
      execute: () => {
        dataService.updateStallStatus(stallId, 'Rejected');
        soundFx.playError();
        onRefreshData();
      },
      undo: () => {
        dataService.updateStallStatus(stallId, oldStatus);
        onRefreshData();
      },
    });
  };

  const handleApproveSponsor = (spId: string) => {
    const sp = sponsors.find((x) => x.id === spId);
    if (!sp) return;
    const oldStatus = sp.status;

    historyService.execute({
      description: `Approve Sponsor ${sp.companyName}`,
      execute: () => {
        dataService.updateSponsorStatus(spId, 'Approved');
        soundFx.playConfirm();
        onRefreshData();
      },
      undo: () => {
        dataService.updateSponsorStatus(spId, oldStatus);
        onRefreshData();
      },
    });

    if (onShowToast) onShowToast('Sponsor Confirmed', `${sp.companyName} added to Wall.`, 'success');
  };

  const handleRejectSponsor = (spId: string) => {
    const sp = sponsors.find((x) => x.id === spId);
    if (!sp) return;
    const oldStatus = sp.status;

    historyService.execute({
      description: `Reject Sponsor ${sp.companyName}`,
      execute: () => {
        dataService.updateSponsorStatus(spId, 'Rejected');
        soundFx.playError();
        onRefreshData();
      },
      undo: () => {
        dataService.updateSponsorStatus(spId, oldStatus);
        onRefreshData();
      },
    });
  };

  const handleUndo = () => {
    const desc = undo();
    if (desc && onShowToast) {
      onShowToast('Action Undone', `Undid: ${desc}`, 'info');
    }
  };

  const handleRedo = () => {
    const desc = redo();
    if (desc && onShowToast) {
      onShowToast('Action Redone', `Redid: ${desc}`, 'info');
    }
  };

  // CSV Exports
  const handleExportParticipantsCSV = () => {
    const rows = eventPasses.map((p) => ({
      'Student Name': p.studentName,
      'Roll Number': p.studentRollNumber,
      'College Email': p.studentEmail,
      Department: p.studentDepartment,
      Year: p.studentYear,
      'Entry Code': p.code,
      'Seat Label': p.seatLabel || 'N/A',
      Status: p.checkedIn ? 'Checked-In' : 'Registered',
      'Check-in Time': p.checkedInAt || 'N/A',
      'Seat No': p.seatNo,
    }));
    exportToCSV(`${currentEvent?.title.replace(/\s+/g, '_')}_Roster.csv`, rows);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Top Bar: Title, Live Pulse, Undo/Redo & Fast Scanner Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8D9B0]/20">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display font-black text-2xl sm:text-3xl text-gold-gradient uppercase tracking-wider">
              Organizer Command Center
            </h1>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[11px] text-emerald-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span>LIVE</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <p className="font-sans text-xs text-[#E8D9B0]/70">
              {organizerProfile ? (
                <>
                  <strong className="text-[#FFF6E5]">{organizerProfile.name}</strong> ({organizerProfile.clubName}) ·
                </>
              ) : null}{' '}
              Council Desk · Last telemetry updated at <strong className="text-[#FFF6E5]">{lastUpdated}</strong>
            </p>
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="text-[11px] font-sans px-2.5 py-0.5 rounded-full bg-red-950/70 border border-red-500/40 text-red-200 hover:bg-red-900/80 transition-colors"
                title="Sign out of organizer account"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>

        {/* Toolbar: Undo / Redo & Scanner Button */}
        <div className="flex items-center gap-2">
          {/* Undo Button */}
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            title={canUndo ? `Undo: ${undoDesc} (Ctrl+Z)` : 'Nothing to undo'}
            className={`p-2.5 rounded-lg border flex items-center gap-1.5 text-xs font-heading font-semibold transition-all ${
              canUndo
                ? 'bg-[#10142E] border-[#E8D9B0]/50 text-[#E8D9B0] hover:text-[#FFF6E5] hover:border-[#E8D9B0] shadow-sm'
                : 'bg-[#060A1C] border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Undo2 className="w-4 h-4" />
            <span className="hidden sm:inline">Undo ↶</span>
          </button>

          {/* Redo Button */}
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            title={canRedo ? `Redo: ${redoDesc} (Ctrl+Shift+Z)` : 'Nothing to redo'}
            className={`p-2.5 rounded-lg border flex items-center gap-1.5 text-xs font-heading font-semibold transition-all ${
              canRedo
                ? 'bg-[#10142E] border-[#E8D9B0]/50 text-[#E8D9B0] hover:text-[#FFF6E5] hover:border-[#E8D9B0] shadow-sm'
                : 'bg-[#060A1C] border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Redo2 className="w-4 h-4" />
            <span className="hidden sm:inline">Redo ↷</span>
          </button>

          <OrnateButton
            size="sm"
            variant="primary"
            icon={QrCode}
            onClick={() => onOpenScanner(currentEvent?.id)}
          >
            Camera Scanner
          </OrnateButton>

          <OrnateButton
            size="sm"
            variant="ghost"
            icon={Plus}
            onClick={onOpenNewEvent}
          >
            Pin Notice
          </OrnateButton>
        </div>
      </div>

      {/* PART 3.1: Big Number Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Tile 1: Total Registered */}
        <div className="p-4 rounded-xl bg-[#060A1C]/90 border border-[#E8D9B0]/25 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#E8D9B0]/80">
            <span className="font-heading uppercase tracking-wider">Registered</span>
            <Users className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <div className="mt-3">
            <span className="font-display font-black text-2xl sm:text-3xl text-[#FFF6E5]">
              {totalRegisteredAll}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-1 font-mono">
              <TrendingUp className="w-3 h-3" />
              <span>▲ +12 today</span>
            </div>
          </div>
        </div>

        {/* Tile 2: Checked In */}
        <div className="p-4 rounded-xl bg-[#060A1C]/90 border border-[#E8D9B0]/25 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#E8D9B0]/80">
            <span className="font-heading uppercase tracking-wider">Checked In</span>
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="mt-3">
            <span className="font-display font-black text-2xl sm:text-3xl text-[#10B981]">
              {totalCheckedInAll}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-1 font-mono">
              <TrendingUp className="w-3 h-3" />
              <span>▲ +5 this hr</span>
            </div>
          </div>
        </div>

        {/* Tile 3: Check-in % */}
        <div className="p-4 rounded-xl bg-[#060A1C]/90 border border-[#E8D9B0]/25 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#E8D9B0]/80">
            <span className="font-heading uppercase tracking-wider">Check-in %</span>
            <Activity className="w-4 h-4 text-[#E04A7B]" />
          </div>
          <div className="mt-3">
            <span className="font-display font-black text-2xl sm:text-3xl text-gold-gradient">
              {overallCheckinRate}%
            </span>
            <div className="flex items-center gap-1 text-[11px] text-[#E8D9B0]/70 mt-1 font-mono">
              <span>Target: 80%</span>
            </div>
          </div>
        </div>

        {/* Tile 4: Seats Left */}
        <div className="p-4 rounded-xl bg-[#060A1C]/90 border border-[#E8D9B0]/25 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#E8D9B0]/80">
            <span className="font-heading uppercase tracking-wider">Seats Left</span>
            <Armchair className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="mt-3">
            <span className="font-display font-black text-2xl sm:text-3xl text-[#FFF6E5]">
              {seatsLeftAll}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1 font-mono">
              <span>of {totalCapacityAll} total</span>
            </div>
          </div>
        </div>

        {/* Tile 5: Active Events */}
        <div className="p-4 rounded-xl bg-[#060A1C]/90 border border-[#E8D9B0]/25 shadow-lg flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-[#E8D9B0]/80">
            <span className="font-heading uppercase tracking-wider">Active Events</span>
            <Layers className="w-4 h-4 text-[#A855F7]" />
          </div>
          <div className="mt-3">
            <span className="font-display font-black text-2xl sm:text-3xl text-[#FFF6E5]">
              {liveEventsCount}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-1 font-mono">
              <span>● 1 Live Now</span>
            </div>
          </div>
        </div>
      </div>

      {/* Event Selector & Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-[#060A1C]/80 border border-[#E8D9B0]/20">
        {/* Event Dropdown Picker */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-heading uppercase text-[#E8D9B0] shrink-0 font-bold">
            Focus Event:
          </span>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="p-2.5 rounded-lg bg-[#10142E] border border-[#E8D9B0]/40 text-xs sm:text-sm font-display text-[#FFF6E5] focus:outline-none focus:border-[#E8D9B0]"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} ({ev.registeredCount}/{ev.capacity}) — {ev.status}
              </option>
            ))}
          </select>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setEventTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-heading uppercase transition-all ${
              eventTab === 'overview'
                ? 'bg-[#B3345C] text-[#FFF6E5] font-bold shadow-md'
                : 'text-[#E8D9B0]/70 hover:text-[#FFF6E5] hover:bg-[#10142E]'
            }`}
          >
            Live Graphs
          </button>
          <button
            onClick={() => setEventTab('seatMap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-heading uppercase transition-all flex items-center gap-1 ${
              eventTab === 'seatMap'
                ? 'bg-[#B3345C] text-[#FFF6E5] font-bold shadow-md'
                : 'text-[#E8D9B0]/70 hover:text-[#FFF6E5] hover:bg-[#10142E]'
            }`}
          >
            <Armchair className="w-3.5 h-3.5" />
            <span>Seat Matrix</span>
          </button>
          <button
            onClick={() => setEventTab('participants')}
            className={`px-3 py-1.5 rounded-lg text-xs font-heading uppercase transition-all ${
              eventTab === 'participants'
                ? 'bg-[#B3345C] text-[#FFF6E5] font-bold shadow-md'
                : 'text-[#E8D9B0]/70 hover:text-[#FFF6E5] hover:bg-[#10142E]'
            }`}
          >
            Roster ({eventPasses.length})
          </button>
          <button
            onClick={() => setEventTab('requests')}
            className={`px-3 py-1.5 rounded-lg text-xs font-heading uppercase transition-all flex items-center gap-1.5 ${
              eventTab === 'requests'
                ? 'bg-[#B3345C] text-[#FFF6E5] font-bold shadow-md'
                : 'text-[#E8D9B0]/70 hover:text-[#FFF6E5] hover:bg-[#10142E]'
            }`}
          >
            <span>Requests</span>
            {totalPendingRequests > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#E04A7B] text-[10px] flex items-center justify-center font-bold text-white">
                {totalPendingRequests}
              </span>
            )}
          </button>
          <button
            onClick={() => setEventTab('feedback')}
            className={`px-3 py-1.5 rounded-lg text-xs font-heading uppercase transition-all ${
              eventTab === 'feedback'
                ? 'bg-[#B3345C] text-[#FFF6E5] font-bold shadow-md'
                : 'text-[#E8D9B0]/70 hover:text-[#FFF6E5] hover:bg-[#10142E]'
            }`}
          >
            Feedback ({eventFeedbacks.length})
          </button>
          <button
            onClick={() => setEventTab('posterQr')}
            className={`px-3 py-1.5 rounded-lg text-xs font-heading uppercase transition-all ${
              eventTab === 'posterQr'
                ? 'bg-[#B3345C] text-[#FFF6E5] font-bold shadow-md'
                : 'text-[#E8D9B0]/70 hover:text-[#FFF6E5] hover:bg-[#10142E]'
            }`}
          >
            Flyer QR
          </button>
        </div>
      </div>

      {/* ========================================================
          TAB 1: LIVE GRAPHS (PART 3)
          ======================================================== */}
      {eventTab === 'overview' && (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Registrations Over Time */}
            <div className="p-6 rounded-2xl bg-[#060A1C]/90 border border-[#E8D9B0]/25 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#E8D9B0]/15">
                  <h3 className="font-display font-bold text-base text-[#FFF6E5] uppercase">
                    Registration Curve Over Time
                  </h3>
                  <span className="text-xs text-emerald-400 font-mono">Live Feed</span>
                </div>
                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineData}>
                      <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#E04A7B" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#E04A7B" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="#E8D9B0" opacity={0.6} tick={{ fontSize: 11 }} />
                      <YAxis stroke="#E8D9B0" opacity={0.6} tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#060A1C',
                          borderColor: '#E8D9B0',
                          borderRadius: '8px',
                          color: '#FFF6E5',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="registrations"
                        stroke="#E04A7B"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#areaGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <p className="font-sans text-xs text-[#E8D9B0]/80 mt-3 pt-3 border-t border-[#E8D9B0]/10">
                Peak registrations surged during the afternoon break (+42 submissions between 13:00 and 15:00).
              </p>
            </div>

            {/* Chart 2: Registrations by Category */}
            <div className="p-6 rounded-2xl bg-[#060A1C]/90 border border-[#E8D9B0]/25 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#E8D9B0]/15">
                  <h3 className="font-display font-bold text-base text-[#FFF6E5] uppercase">
                    Registrations by Category
                  </h3>
                  <span className="text-xs text-[#E8D9B0]/70 font-mono">Total: {totalRegisteredAll}</span>
                </div>
                <div className="h-64 mt-4 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryDonutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {categoryDonutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#060A1C',
                          borderColor: '#E8D9B0',
                          borderRadius: '8px',
                          color: '#FFF6E5',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <p className="font-sans text-xs text-[#E8D9B0]/80 mt-3 pt-3 border-t border-[#E8D9B0]/10">
                Cultural nights & Hackathons are filling fastest — commanding 74% of all ticket allocations.
              </p>
            </div>

            {/* Chart 3: Seats Filled per Event (Stacked Horizontal Bars) */}
            <div className="p-6 rounded-2xl bg-[#060A1C]/90 border border-[#E8D9B0]/25 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#E8D9B0]/15">
                  <h3 className="font-display font-bold text-base text-[#FFF6E5] uppercase">
                    Seats Filled per Event (Auditorium Matrix)
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] text-[#FFF6E5]/80">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Checked In
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Registered
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-600" /> Free
                    </span>
                  </div>
                </div>
                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={seatsStackedData}>
                      <XAxis type="number" stroke="#E8D9B0" opacity={0.6} tick={{ fontSize: 11 }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#E8D9B0"
                        opacity={0.8}
                        tick={{ fontSize: 11 }}
                        width={90}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#060A1C',
                          borderColor: '#E8D9B0',
                          borderRadius: '8px',
                          color: '#FFF6E5',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="checkedIn" stackId="a" fill="#10B981" />
                      <Bar dataKey="registered" stackId="a" fill="#F59E0B" />
                      <Bar dataKey="free" stackId="a" fill="#334155" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <p className="font-sans text-xs text-[#E8D9B0]/80 mt-3 pt-3 border-t border-[#E8D9B0]/10">
                HackCampus is currently at 84% venue capacity with 114 attendees verified on site.
              </p>
            </div>

            {/* Chart 4: Check-in Rate Radial Gauge */}
            <div className="p-6 rounded-2xl bg-[#060A1C]/90 border border-[#E8D9B0]/25 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#E8D9B0]/15">
                  <h3 className="font-display font-bold text-base text-[#FFF6E5] uppercase">
                    Admitted Attendance Rate
                  </h3>
                  <span className="text-xs text-emerald-400 font-mono">Turnout Meter</span>
                </div>
                <div className="h-64 mt-4 flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="65%"
                      outerRadius="95%"
                      barSize={18}
                      data={radialGaugeData}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar background={{ fill: '#10142E' }} dataKey="value" cornerRadius={10} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#060A1C',
                          borderColor: '#E8D9B0',
                          borderRadius: '8px',
                          color: '#FFF6E5',
                          fontSize: '12px',
                        }}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center">
                    <span className="font-display font-black text-4xl text-[#10B981]">
                      {attendanceRate}%
                    </span>
                    <span className="text-[11px] font-heading uppercase text-[#E8D9B0]/70 mt-1">
                      Admitted Gate Flow
                    </span>
                  </div>
                </div>
              </div>
              <p className="font-sans text-xs text-[#E8D9B0]/80 mt-3 pt-3 border-t border-[#E8D9B0]/10">
                {attendanceRate >= 60
                  ? 'Attendance is healthy — quorum reached for judging and award ceremonies.'
                  : 'Doors are actively admitting registered participants at the main vestibule.'}
              </p>
            </div>
          </div>

          {/* Quick Seat Map Preview directly under charts */}
          {currentEvent && (
            <CinemaSeatMap
              event={currentEvent}
              passes={passes}
              isOrganizer={true}
              onCheckInPass={handleCheckInWithHistory}
              onUndoCheckInPass={handleUndoCheckInWithHistory}
            />
          )}
        </div>
      )}

      {/* ========================================================
          TAB 2: FULL SEAT MATRIX (PART 4.1)
          ======================================================== */}
      {eventTab === 'seatMap' && currentEvent && (
        <CinemaSeatMap
          event={currentEvent}
          passes={passes}
          isOrganizer={true}
          onCheckInPass={handleCheckInWithHistory}
          onUndoCheckInPass={handleUndoCheckInWithHistory}
        />
      )}

      {/* ========================================================
          TAB 3: PARTICIPANTS ROSTER
          ======================================================== */}
      {eventTab === 'participants' && (
        <div className="rounded-2xl bg-[#060A1C]/90 border border-[#E8D9B0]/25 p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8D9B0]/20">
            <div>
              <h3 className="font-display font-bold text-lg text-[#FFF6E5] uppercase">
                Attendee Ledger & Seat Allocations
              </h3>
              <p className="text-xs text-[#E8D9B0]/75">
                {eventPasses.length} registered · {eventPasses.filter((p) => p.checkedIn).length} checked in
              </p>
            </div>
            <OrnateButton
              size="sm"
              variant="ghost"
              icon={FileSpreadsheet}
              onClick={handleExportParticipantsCSV}
            >
              Export CSV
            </OrnateButton>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
            <div className="relative">
              <Search className="w-4 h-4 text-[#E8D9B0]/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, roll, or pass code..."
                value={participantSearch}
                onChange={(e) => setParticipantSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#10142E] border border-[#E8D9B0]/30 text-xs text-[#FFF6E5] focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="py-2 px-3 rounded-lg bg-[#10142E] border border-[#E8D9B0]/30 text-xs text-[#FFF6E5] focus:outline-none"
            >
              <option value="all">All Check-In Statuses</option>
              <option value="checkedIn">Admitted (Checked-In)</option>
              <option value="notYet">Pending (Not Yet Admitted)</option>
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="py-2 px-3 rounded-lg bg-[#10142E] border border-[#E8D9B0]/30 text-xs text-[#FFF6E5] focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Roster Table */}
          {filteredPasses.length > 0 ? (
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs text-[#FFF6E5]">
                <thead className="bg-[#10142E] text-[#E8D9B0] uppercase font-heading text-[11px] border-b border-[#E8D9B0]/20">
                  <tr>
                    <th className="py-3 px-3">Avatar</th>
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Roll & Dept</th>
                    <th className="py-3 px-3">Pass Code</th>
                    <th className="py-3 px-3">Seat</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8D9B0]/10 font-sans">
                  {filteredPasses.map((p) => (
                    <tr key={p.id} className="hover:bg-[#10142E]/50 transition-colors">
                      <td className="py-2.5 px-3">
                        <ParticipantPortrait
                          size="sm"
                          traits={p.characterTraits}
                          seedCode={p.code}
                          celebrate={p.checkedIn}
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <strong className="text-[#FFF6E5]">{p.studentName}</strong>
                        <span className="block text-[11px] text-[#E8D9B0]/60">{p.studentEmail}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-xs">{p.studentRollNumber}</span>
                        <span className="block text-[11px] text-[#E8D9B0]/70">
                          {p.studentDepartment} ({p.studentYear})
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-xs text-[#E8D9B0]">
                        {p.code}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-[#10142E] border border-[#E8D9B0]/40 font-mono text-xs font-bold text-[#FFF6E5]">
                          {p.seatLabel || `Seat ${p.seatNo}`}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-heading uppercase font-bold ${
                            p.checkedIn
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                              : 'bg-amber-950 text-amber-300 border border-amber-500'
                          }`}
                        >
                          {p.checkedIn ? 'Admitted' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!p.checkedIn ? (
                            <OrnateButton
                              size="sm"
                              variant="primary"
                              onClick={() => handleCheckInWithHistory(p.code)}
                            >
                              Check In
                            </OrnateButton>
                          ) : (
                            <OrnateButton
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUndoCheckInWithHistory(p.code)}
                            >
                              Revert
                            </OrnateButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyNoticeState
              title="No participants found"
              description="Adjust your search criteria or invite students to register for this event."
            />
          )}
        </div>
      )}

      {/* ========================================================
          TAB 4: REQUESTS (PART 1.6)
          ======================================================== */}
      {eventTab === 'requests' && (
        <div className="rounded-2xl bg-[#060A1C]/90 border border-[#E8D9B0]/25 p-6 shadow-xl flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8D9B0]/20">
            <div>
              <h3 className="font-display font-bold text-lg text-[#FFF6E5] uppercase">
                Fest Operations Request Queue
              </h3>
              <p className="text-xs text-[#E8D9B0]/75">
                Review and approve volunteer crew applications, bazaar stall permits, and sponsor pledges.
              </p>
            </div>

            {/* Sub-Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRequestsSubTab('volunteers')}
                className={`px-3 py-1.5 rounded-lg text-xs font-heading uppercase transition-all flex items-center gap-1.5 ${
                  requestsSubTab === 'volunteers'
                    ? 'bg-[#38BDF8] text-[#060A1C] font-bold'
                    : 'bg-[#10142E] text-[#38BDF8] border border-[#38BDF8]/40'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Volunteers ({volunteers.length})</span>
              </button>
              <button
                onClick={() => setRequestsSubTab('stalls')}
                className={`px-3 py-1.5 rounded-lg text-xs font-heading uppercase transition-all flex items-center gap-1.5 ${
                  requestsSubTab === 'stalls'
                    ? 'bg-[#F59E0B] text-[#060A1C] font-bold'
                    : 'bg-[#10142E] text-[#F59E0B] border border-[#F59E0B]/40'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Stalls ({stalls.length})</span>
              </button>
              <button
                onClick={() => setRequestsSubTab('sponsors')}
                className={`px-3 py-1.5 rounded-lg text-xs font-heading uppercase transition-all flex items-center gap-1.5 ${
                  requestsSubTab === 'sponsors'
                    ? 'bg-[#E04A7B] text-[#060A1C] font-bold'
                    : 'bg-[#10142E] text-[#E04A7B] border border-[#E04A7B]/40'
                }`}
              >
                <Gem className="w-3.5 h-3.5" />
                <span>Sponsors ({sponsors.length})</span>
              </button>
            </div>
          </div>

          {/* Volunteers Request List */}
          {requestsSubTab === 'volunteers' && (
            <div className="flex flex-col gap-4">
              {volunteers.map((vol) => (
                <div
                  key={vol.id}
                  className="p-5 rounded-xl bg-[#10142E] border border-[#E8D9B0]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-base text-[#FFF6E5]">
                        {vol.name}
                      </span>
                      <span className="font-mono text-xs text-[#38BDF8] bg-[#060A1C] px-2 py-0.5 rounded border border-[#38BDF8]/30">
                        {vol.badgeCode}
                      </span>
                      <span
                        className={`text-[10px] font-heading uppercase px-2 py-0.5 rounded-full font-bold ${
                          vol.status === 'Approved'
                            ? 'bg-emerald-950 text-emerald-300'
                            : vol.status === 'Rejected'
                            ? 'bg-rose-950 text-rose-300'
                            : 'bg-amber-950 text-amber-300'
                        }`}
                      >
                        {vol.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#E8D9B0]/75 mt-1 font-sans">
                      {vol.department} · {vol.year} · {vol.collegeEmail} · {vol.phone}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {vol.roles.map((r) => (
                        <span
                          key={r}
                          className="px-2 py-0.5 rounded text-[10px] bg-[#1B2257] text-[#38BDF8]"
                        >
                          {r}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-slate-400 mt-2 italic font-sans">
                      Experience: "{vol.pastExperience}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {vol.status !== 'Approved' && (
                      <OrnateButton
                        size="sm"
                        variant="primary"
                        onClick={() => handleApproveVolunteer(vol.id)}
                      >
                        Approve & Assign
                      </OrnateButton>
                    )}
                    {vol.status !== 'Rejected' && (
                      <OrnateButton
                        size="sm"
                        variant="danger"
                        onClick={() => handleRejectVolunteer(vol.id)}
                      >
                        Reject
                      </OrnateButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stalls Request List */}
          {requestsSubTab === 'stalls' && (
            <div className="flex flex-col gap-4">
              {stalls.map((st) => (
                <div
                  key={st.id}
                  className="p-5 rounded-xl bg-[#10142E] border border-[#E8D9B0]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-base text-[#FFF6E5]">
                        {st.businessName}
                      </span>
                      <span className="text-xs text-[#F59E0B] font-mono font-bold">
                        ({st.stallType} · {st.spaceNeeded})
                      </span>
                      <span
                        className={`text-[10px] font-heading uppercase px-2 py-0.5 rounded-full font-bold ${
                          st.status === 'Approved'
                            ? 'bg-emerald-950 text-emerald-300'
                            : st.status === 'Rejected'
                            ? 'bg-rose-950 text-rose-300'
                            : 'bg-amber-950 text-amber-300'
                        }`}
                      >
                        {st.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#E8D9B0]/75 mt-1 font-sans">
                      Owner: {st.ownerName} · {st.contactEmail} · {st.contactPhone}
                    </p>

                    <p className="text-xs text-[#FFF6E5]/80 mt-2 font-mono">
                      Items: {st.itemsSold} ({st.priceRange})
                    </p>
                    <p className="text-xs text-[#E8D9B0]/60 font-mono">
                      Needs: {st.powerWaterNeeds} · Plot: {st.allottedPlot || 'Unassigned'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {st.status !== 'Approved' && (
                      <OrnateButton
                        size="sm"
                        variant="primary"
                        onClick={() => handleApproveStall(st.id)}
                      >
                        Allot & Approve
                      </OrnateButton>
                    )}
                    {st.status !== 'Rejected' && (
                      <OrnateButton
                        size="sm"
                        variant="danger"
                        onClick={() => handleRejectStall(st.id)}
                      >
                        Reject
                      </OrnateButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sponsors Request List */}
          {requestsSubTab === 'sponsors' && (
            <div className="flex flex-col gap-4">
              {sponsors.map((sp) => (
                <div
                  key={sp.id}
                  className="p-5 rounded-xl bg-[#10142E] border border-[#E8D9B0]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-base text-[#FFF6E5]">
                        {sp.companyName}
                      </span>
                      <span className="text-xs text-[#E04A7B] font-mono font-bold">
                        [{sp.kind} Sponsorship]
                      </span>
                      <span
                        className={`text-[10px] font-heading uppercase px-2 py-0.5 rounded-full font-bold ${
                          sp.status === 'Approved'
                            ? 'bg-emerald-950 text-emerald-300'
                            : sp.status === 'Rejected'
                            ? 'bg-rose-950 text-rose-300'
                            : 'bg-amber-950 text-amber-300'
                        }`}
                      >
                        {sp.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#E8D9B0]/75 mt-1 font-sans">
                      Contact: {sp.contactPerson} · {sp.email} · {sp.phone}
                    </p>

                    <p className="text-xs text-[#FFF6E5] mt-2 font-mono font-bold">
                      Pledge: {sp.amountOrItem}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-2">
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

                  <div className="flex items-center gap-2 shrink-0">
                    {sp.status !== 'Approved' && (
                      <OrnateButton
                        size="sm"
                        variant="primary"
                        onClick={() => handleApproveSponsor(sp.id)}
                      >
                        Confirm & Feature
                      </OrnateButton>
                    )}
                    {sp.status !== 'Rejected' && (
                      <OrnateButton
                        size="sm"
                        variant="danger"
                        onClick={() => handleRejectSponsor(sp.id)}
                      >
                        Reject
                      </OrnateButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 5: FEEDBACK
          ======================================================== */}
      {eventTab === 'feedback' && (
        <div className="rounded-2xl bg-[#060A1C]/90 border border-[#E8D9B0]/25 p-6 shadow-xl flex flex-col gap-4">
          <h3 className="font-display font-bold text-lg text-[#FFF6E5] uppercase">
            Participant Feedback & Ratings
          </h3>
          {eventFeedbacks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {eventFeedbacks.map((fb) => (
                <div key={fb.id} className="p-4 rounded-xl bg-[#10142E] border border-[#E8D9B0]/20">
                  <div className="flex items-center justify-between">
                    <strong className="text-[#FFF6E5]">{fb.isAnonymous ? 'Anonymous' : fb.studentName}</strong>
                    <span className="font-mono text-xs text-[#F59E0B]">★ {fb.overallRating} / 5</span>
                  </div>
                  <p className="text-xs text-[#FFF6E5]/80 mt-2 font-sans italic">
                    "{fb.enjoyedText}"
                  </p>
                  {fb.improveText && (
                    <p className="text-xs text-[#E8D9B0]/60 mt-1 font-sans">
                      Suggestion: "{fb.improveText}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyNoticeState
              title="No feedback submitted yet"
              description="Feedback will appear here once attendees complete their check-in ratings."
            />
          )}
        </div>
      )}

      {/* ========================================================
          TAB 6: FLYER QR CODE
          ======================================================== */}
      {eventTab === 'posterQr' && currentEvent && (
        <div className="max-w-md mx-auto p-8 rounded-2xl bg-[#060A1C] border-2 border-[#E8D9B0] shadow-2xl flex flex-col items-center text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-[#E8D9B0]">
            REGISTRATION GATEWAY POSTER
          </span>
          <h3 className="font-display font-black text-2xl text-[#FFF6E5] uppercase mt-2">
            {currentEvent.title}
          </h3>
          <p className="text-xs text-[#E8D9B0]/80 mt-1">
            {currentEvent.date} · {currentEvent.venue}
          </p>

          <div className="my-6 p-4 rounded-2xl bg-white shadow-2xl flex items-center justify-center">
            <QRCodeDisplay text={`https://festora.edu/events#${currentEvent.id}`} size={200} />
          </div>

          <p className="font-sans text-xs text-[#FFF6E5]/75">
            Scan to register instantly, secure seat allocations, and receive your digital QR pass.
          </p>
        </div>
      )}
    </div>
  );
};
