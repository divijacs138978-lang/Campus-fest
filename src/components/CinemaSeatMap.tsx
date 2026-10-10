import React, { useState } from 'react';
import { CampusEvent, CampusPass } from '../types';
import { computeSeatLabel } from '../utils/proceduralCharacter';
import { ParticipantPortrait } from './ParticipantPortrait';
import { Check, User, Armchair, Sparkles } from 'lucide-react';
import { OrnateButton } from './ui/OrnateButton';

interface CinemaSeatMapProps {
  event: CampusEvent;
  passes: CampusPass[];
  isOrganizer?: boolean;
  onCheckInPass?: (passCode: string) => void;
  onUndoCheckInPass?: (passCode: string) => void;
}

export const CinemaSeatMap: React.FC<CinemaSeatMapProps> = ({
  event,
  passes,
  isOrganizer = false,
  onCheckInPass,
  onUndoCheckInPass,
}) => {
  const [selectedSeat, setSelectedSeat] = useState<{
    label: string;
    seatNo: number;
    pass?: CampusPass;
  } | null>(null);

  const capacity = event.capacity || 100;
  const SEATS_PER_ROW = 12;
  const totalRows = Math.ceil(capacity / SEATS_PER_ROW);

  // Map pass by seatLabel or seatNo
  const passBySeatLabel = new Map<string, CampusPass>();
  const eventPasses = passes.filter((p) => p.eventId === event.id);

  eventPasses.forEach((pass, idx) => {
    const label = pass.seatLabel || computeSeatLabel(pass.seatNo || idx + 1);
    passBySeatLabel.set(label, pass);
  });

  const registeredCount = eventPasses.length;
  const checkedInCount = eventPasses.filter((p) => p.checkedIn).length;
  const freeCount = Math.max(0, capacity - registeredCount);
  const fillPercent = Math.min(100, Math.round((registeredCount / capacity) * 100));

  return (
    <div className="w-full bg-[#060A1C]/90 border border-[#E8D9B0]/25 rounded-xl p-5 md:p-7 shadow-2xl backdrop-blur-md">
      {/* Header telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E8D9B0]/15">
        <div>
          <div className="flex items-center gap-2">
            <Armchair className="w-5 h-5 text-[#E8D9B0]" />
            <h3 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wider text-[#FFF6E5]">
              Auditorium Seating Matrix
            </h3>
          </div>
          <p className="text-xs font-sans text-[#E8D9B0]/70 mt-1">
            Registered: <strong className="text-[#F59E0B]">{registeredCount}</strong> · Checked-in:{' '}
            <strong className="text-[#10B981]">{checkedInCount}</strong> · Free:{' '}
            <strong className="text-slate-400">{freeCount}</strong> · Capacity:{' '}
            <strong>{capacity}</strong>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full sm:w-48 flex flex-col gap-1.5">
          <div className="flex justify-between text-[11px] text-[#E8D9B0]/80 font-heading">
            <span>Occupancy</span>
            <span>{fillPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#10142E] overflow-hidden border border-[#E8D9B0]/20">
            <div
              className="h-full bg-gradient-to-r from-[#B3345C] to-[#E04A7B] transition-all duration-500"
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 py-4 text-xs font-sans text-[#FFF6E5]/80">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#10142E] border border-slate-600/70 flex items-center justify-center text-[10px] text-slate-400">
            —
          </div>
          <span>Free Seat</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#3B194F] border border-[#F59E0B] flex items-center justify-center text-[10px] text-[#F59E0B]">
            <User className="w-3 h-3 text-[#F59E0B]" />
          </div>
          <span>Registered (Pending Entry)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#064E3B] border border-[#10B981] flex items-center justify-center text-[10px] text-white shadow-[0_0_8px_rgba(16,185,129,0.5)]">
            <Check className="w-3.5 h-3.5 text-[#10B981]" />
          </div>
          <span>Checked-in (Admitted)</span>
        </div>
      </div>

      {/* Curved STAGE Screen Bar */}
      <div className="relative my-6 max-w-xl mx-auto text-center">
        <div className="w-full h-3 rounded-[50%/100%] bg-gradient-to-r from-transparent via-[#E8D9B0] to-transparent shadow-[0_0_20px_#E8D9B0]" />
        <span className="font-heading text-[11px] uppercase tracking-[0.35em] text-[#E8D9B0] mt-2 inline-block">
          ✦ STAGE & PODIUM ✦
        </span>
      </div>

      {/* Cinema Grid */}
      <div className="overflow-x-auto py-2">
        <div className="min-w-[540px] max-w-2xl mx-auto flex flex-col gap-2.5 items-center">
          {Array.from({ length: totalRows }).map((_, rIdx) => {
            const rowLetter = String.fromCharCode(65 + (rIdx % 26));

            return (
              <div key={rowLetter} className="flex items-center gap-2">
                {/* Left Row Indicator */}
                <span className="w-5 text-right font-display text-xs font-bold text-[#E8D9B0]/60 select-none">
                  {rowLetter}
                </span>

                {/* Seat Columns */}
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: SEATS_PER_ROW }).map((__, cIdx) => {
                    const seatNumber = cIdx + 1;
                    const seatIndex = rIdx * SEATS_PER_ROW + seatNumber;
                    if (seatIndex > capacity) return null;

                    const label = `${rowLetter}${seatNumber}`;
                    const pass = passBySeatLabel.get(label);

                    const isCheckedIn = pass?.checkedIn;
                    const isRegistered = !!pass;

                    // Aisle gap after column 6
                    const isAisle = cIdx === 5;

                    return (
                      <React.Fragment key={label}>
                        <button
                          onClick={() => setSelectedSeat({ label, seatNo: seatIndex, pass })}
                          title={`Seat ${label}: ${
                            isCheckedIn
                              ? `Checked-in (${pass?.studentName})`
                              : isRegistered
                              ? `Registered (${pass?.studentName})`
                              : 'Free'
                          }`}
                          className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-t-md rounded-b-sm flex items-center justify-center transition-all duration-200 select-none ${
                            isCheckedIn
                              ? 'bg-[#064E3B] text-[#34D399] border border-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.45)] hover:scale-110 animate-pulse-short'
                              : isRegistered
                              ? 'bg-[#2A153A] text-[#F59E0B] border border-[#F59E0B]/80 shadow-[0_0_8px_rgba(245,158,11,0.2)] hover:scale-110'
                              : 'bg-[#10142E]/70 text-slate-400 border border-slate-700/60 hover:border-[#E8D9B0] hover:text-[#FFF6E5] hover:scale-105'
                          }`}
                        >
                          {isCheckedIn ? (
                            <Check className="w-4 h-4 stroke-[2.5]" />
                          ) : isRegistered ? (
                            <User className="w-3.5 h-3.5" />
                          ) : (
                            <span className="text-[10px] font-mono">{seatNumber}</span>
                          )}
                        </button>

                        {/* Aisle Spacer */}
                        {isAisle && <div className="w-5 sm:w-7" />}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Right Row Indicator */}
                <span className="w-5 text-left font-display text-xs font-bold text-[#E8D9B0]/60 select-none">
                  {rowLetter}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Seat Inspector Modal / Drawer */}
      {selectedSeat && (
        <div className="mt-6 p-4 rounded-xl bg-[#10142E] border border-[#E8D9B0]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {selectedSeat.pass ? (
              <ParticipantPortrait
                size="sm"
                traits={selectedSeat.pass.characterTraits}
                seedCode={selectedSeat.pass.code}
                celebrate={selectedSeat.pass.checkedIn}
              />
            ) : (
              <div className="w-14 h-16 rounded-lg bg-[#060A1C] border border-slate-700 flex items-center justify-center text-slate-400">
                <Armchair className="w-6 h-6" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#B3345C] text-[#FFF6E5] font-display text-xs font-bold">
                  SEAT {selectedSeat.label}
                </span>
                <span
                  className={`text-xs font-semibold uppercase ${
                    selectedSeat.pass?.checkedIn
                      ? 'text-[#10B981]'
                      : selectedSeat.pass
                      ? 'text-[#F59E0B]'
                      : 'text-slate-400'
                  }`}
                >
                  {selectedSeat.pass?.checkedIn
                    ? '✓ Admitted & Checked-in'
                    : selectedSeat.pass
                    ? 'Registered (Pass Issued)'
                    : 'Unassigned / Free'}
                </span>
              </div>

              {selectedSeat.pass ? (
                <div className="mt-1 text-xs text-[#FFF6E5]">
                  <p className="font-bold text-sm text-[#FFF6E5]">
                    {selectedSeat.pass.studentName}{' '}
                    <span className="text-[#E8D9B0]/70 font-mono text-xs">
                      ({selectedSeat.pass.studentRollNumber})
                    </span>
                  </p>
                  <p className="text-[#E8D9B0]/60 font-mono">
                    Pass: {selectedSeat.pass.code} · Dept: {selectedSeat.pass.studentDepartment}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-1">
                  This seat will be allocated automatically to the next registered attendee.
                </p>
              )}
            </div>
          </div>

          {/* Organizer actions */}
          <div className="flex items-center gap-2">
            {isOrganizer && selectedSeat.pass && !selectedSeat.pass.checkedIn && onCheckInPass && (
              <OrnateButton
                size="sm"
                variant="primary"
                onClick={() => {
                  onCheckInPass(selectedSeat.pass!.code);
                  setSelectedSeat((prev) =>
                    prev && prev.pass
                      ? { ...prev, pass: { ...prev.pass, checkedIn: true } }
                      : null
                  );
                }}
              >
                Admit & Check In
              </OrnateButton>
            )}

            {isOrganizer && selectedSeat.pass && selectedSeat.pass.checkedIn && onUndoCheckInPass && (
              <OrnateButton
                size="sm"
                variant="ghost"
                onClick={() => {
                  onUndoCheckInPass(selectedSeat.pass!.code);
                  setSelectedSeat((prev) =>
                    prev && prev.pass
                      ? { ...prev, pass: { ...prev.pass, checkedIn: false } }
                      : null
                  );
                }}
              >
                Undo Check In
              </OrnateButton>
            )}

            <button
              onClick={() => setSelectedSeat(null)}
              className="text-xs text-[#E8D9B0]/60 hover:text-[#FFF6E5] px-2 py-1"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
