import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CampusPass, ScanRecord } from '../types';
import { dataService } from '../services/dataService';
import { postalSoundFx } from '../utils/audio';
import { triggerPaperBitsConfetti } from '../utils/confetti';
import { PostageStamp, PointingHand, ImportantStamp } from './PostalDecorations';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  eventId?: string;
  passes: CampusPass[];
  recentScans: ScanRecord[];
  onCheckInResult: () => void;
  onClose: () => void;
}

export const ScannerModal: React.FC<Props> = ({
  eventId,
  passes,
  recentScans,
  onCheckInResult,
  onClose,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [stampState, setStampState] = useState<'IDLE' | 'VALID' | 'DUPLICATE' | 'INVALID'>('IDLE');
  const [scanResult, setScanResult] = useState<{
    name?: string;
    roll?: string;
    dept?: string;
    event?: string;
    message: string;
    time?: string;
  } | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);

  // Initialize html5-qrcode camera
  useEffect(() => {
    let isMounted = true;

    if (cameraActive) {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      scanner
        .start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
          },
          (decodedText) => {
            if (isProcessingRef.current) return;
            isProcessingRef.current = true;

            // Try parsing JSON or raw code
            let code = decodedText;
            try {
              const parsed = JSON.parse(decodedText);
              if (parsed.code) code = parsed.code;
            } catch {
              // raw code string
            }

            handleProcessCode(code);

            setTimeout(() => {
              isProcessingRef.current = false;
            }, 3000);
          },
          () => {
            // scan failure per frame, ignore
          }
        )
        .catch((err) => {
          if (isMounted) {
            setCameraError('Camera access not granted or unavailable on this device.');
            setCameraActive(false);
          }
        });
    }

    return () => {
      isMounted = false;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [cameraActive]);

  const handleProcessCode = (code: string) => {
    if (!code.trim()) return;
    const cleanCode = code.trim().toUpperCase();

    const outcome = dataService.checkInCode(cleanCode, eventId);
    onCheckInResult();

    if (outcome.status === 'VALID') {
      postalSoundFx.playStampThump();
      triggerPaperBitsConfetti();
      setStampState('VALID');
      setScanResult({
        name: outcome.pass?.studentName,
        roll: outcome.pass?.studentRollNumber,
        dept: outcome.pass?.studentDepartment,
        event: outcome.pass?.eventTitle,
        message: outcome.message,
      });
    } else if (outcome.status === 'DUPLICATE') {
      postalSoundFx.playDuplicateBuzz();
      setStampState('DUPLICATE');
      setScanResult({
        name: outcome.pass?.studentName,
        roll: outcome.pass?.studentRollNumber,
        dept: outcome.pass?.studentDepartment,
        event: outcome.pass?.eventTitle,
        message: outcome.message,
        time: outcome.checkInTime || 'EARLIER',
      });
    } else {
      postalSoundFx.playInvalidSound();
      setStampState('INVALID');
      setScanResult({
        message: outcome.message || 'CODE NOT FOUND',
      });
    }

    setInputCode('');

    // Auto-reset after 3 seconds for fast queue flow
    setTimeout(() => {
      setStampState('IDLE');
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#38072B] text-[#FFF6E5] overflow-hidden select-none">
      {/* City facade texture */}
      <div className="absolute inset-0 city-facade opacity-20 pointer-events-none" />

      {/* Top Counter Bar */}
      <div className="relative z-30 px-6 py-4 flex items-center justify-between border-b-2 border-[#2A1A14] bg-[#5E1250] shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3">
          <PostageStamp price="CHECK" title="DESK" color="#8E2A2A" className="w-10 h-12" />
          <div>
            <span className="font-display font-black text-xl text-[#FFF6E5] tracking-tight uppercase block leading-none text-retro-outline-plum">
              CAMPUS POST // CHECK-IN DESK
            </span>
            <span className="font-typewriter text-[11px] text-[#F3E6CE]/80 tracking-widest uppercase">
              ENTRANCE VERIFICATION SCANNER
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="btn-postal-cream p-2 rounded-xl text-[#2A1A14]"
          title="Exit desk scanner"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Center Counter Area */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto">
        {/* Rubber Stamp Slam Overlays */}
        <AnimatePresence>
          {stampState === 'VALID' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-[#5E1250]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
            >
              <motion.div
                initial={{ scale: 2.5, rotate: -20, opacity: 0 }}
                animate={{ scale: 1, rotate: -3, opacity: 1 }}
                transition={{ type: 'spring', damping: 14, stiffness: 180 }}
                className="relative bg-[#A98258] border-4 border-[#2A1A14] rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#2A1A14] max-w-md w-full"
              >
                <div className="bg-[#F3E6CE] border-2 border-[#2A1A14] rounded-2xl p-5 text-[#2A1A14] space-y-3 font-typewriter">
                  <div className="rubber-stamp-green text-xl py-1 px-4 font-black">
                    ★ APPROVED // ENTRY CONFIRMED ★
                  </div>

                  <h2 className="font-display font-black text-3xl sm:text-4xl uppercase leading-tight mt-1 text-[#2A1A14]">
                    WELCOME, {scanResult?.name}
                  </h2>

                  <div className="bg-[#FFF6E5] border-2 border-[#2A1A14] p-3 rounded-xl text-left space-y-1">
                    <div className="flex justify-between">
                      <span className="opacity-70 font-bold">ROLL NUMBER:</span>
                      <span className="font-black text-[#8E2A2A]">{scanResult?.roll}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-70 font-bold">DEPARTMENT:</span>
                      <span className="font-bold">{scanResult?.dept}</span>
                    </div>
                  </div>

                  <p className="text-[11px] opacity-75 font-bold pt-1">
                    Auto-clearing in 3 seconds for next queue...
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}

          {stampState === 'DUPLICATE' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-[#8E2A2A]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
            >
              <motion.div
                initial={{ scale: 2.5, rotate: 20 }}
                animate={{
                  scale: 1,
                  rotate: [0, -12, 12, -8, 8, 0],
                }}
                transition={{ duration: 0.4 }}
                className="bg-[#F3E6CE] border-4 border-[#2A1A14] rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#2A1A14] max-w-md w-full text-[#2A1A14] space-y-3 font-typewriter"
              >
                <div className="rubber-stamp text-2xl py-2 px-4 font-black text-[#8E2A2A] border-4 border-[#8E2A2A]">
                  ALREADY STAMPED
                </div>

                <h2 className="font-display font-black text-2xl sm:text-3xl uppercase leading-tight mt-1">
                  NO SECOND ENTRY
                </h2>

                <div className="bg-[#A98258]/30 border-2 border-[#2A1A14] p-3 rounded-xl text-xs space-y-1 text-left">
                  <div className="flex justify-between">
                    <span className="opacity-70">STUDENT:</span>
                    <span className="font-bold">{scanResult?.name} ({scanResult?.roll})</span>
                  </div>
                  <div className="flex justify-between text-[#8E2A2A] font-black">
                    <span>FIRST CHECKED IN:</span>
                    <span>{scanResult?.time}</span>
                  </div>
                </div>

                <p className="text-xs font-bold text-[#8E2A2A]">
                  Already stamped, no second entry permitted.
                </p>
              </motion.div>
            </motion.div>
          )}

          {stampState === 'INVALID' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-[#3F0A35]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
            >
              <motion.div
                initial={{ scale: 2 }}
                animate={{ scale: 1, rotate: -4 }}
                className="bg-[#F3E6CE] border-4 border-[#2A1A14] rounded-3xl p-6 max-w-md w-full text-[#2A1A14] space-y-3 shadow-[8px_8px_0px_#2A1A14] font-typewriter"
              >
                <div className="rubber-stamp text-xl py-2 px-4 font-black text-[#8E2A2A]">
                  RETURN TO SENDER
                </div>
                <h3 className="font-display font-black text-2xl uppercase">
                  INVALID CODE
                </h3>
                <p className="text-xs opacity-80">
                  {scanResult?.message || 'Code not found in campus database.'}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vintage Stamp Border Scanning Frame */}
        <div className="relative w-72 h-72 sm:w-84 sm:h-84 rounded-3xl border-4 border-dashed border-[#F3E6CE] p-3 bg-[#2A1A14]/75 shadow-[6px_6px_0px_#2A1A14] flex flex-col items-center justify-center overflow-hidden">
          {/* Animated Slow Scan Beam */}
          <div className="absolute left-0 right-0 h-1.5 bg-[#F3E6CE] shadow-[0_0_14px_#FFF6E5] animate-scan-beam pointer-events-none z-20" />

          {/* html5-qrcode video element */}
          <div
            id="qr-reader"
            className={`w-full h-full rounded-2xl overflow-hidden ${
              cameraActive ? 'block' : 'hidden'
            }`}
          />

          {!cameraActive && (
            <div className="flex flex-col items-center justify-center text-center p-4 space-y-2 z-10">
              <Camera className="w-12 h-12 text-[#F3E6CE] opacity-80" />
              <span className="font-typewriter text-xs text-[#FFF6E5] font-black uppercase">
                ALIGN QR PASS IN STAMP FRAME
              </span>
              <button
                onClick={() => setCameraActive(true)}
                className="btn-postal-cream px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase mt-1"
              >
                Turn On Camera
              </button>
            </div>
          )}
        </div>

        {cameraError && (
          <div className="mt-2 text-xs font-typewriter text-[#FFF6E5] bg-[#8E2A2A] px-3 py-1 rounded border border-[#2A1A14]">
            {cameraError}
          </div>
        )}

        {/* Manual Code Input & Quick Testing */}
        <div className="w-full max-w-md mt-5 space-y-3 z-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleProcessCode(inputCode);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="e.g. CP-7K2X-9M4Q"
              className="flex-1 px-4 py-3 rounded-xl bg-[#F3E6CE] border-2 border-[#2A1A14] font-typewriter text-sm text-[#2A1A14] font-black placeholder-[#2A1A14]/50 focus:outline-none shadow-[3px_3px_0px_#2A1A14]"
            />
            <button
              type="submit"
              className="btn-postal-red px-6 py-3 rounded-xl text-xs font-black uppercase"
            >
              STAMP
            </button>
          </form>

          {/* Quick Simulation Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-typewriter">
            <span className="text-[#FFF6E5]/60">SAMPLE PASSES:</span>
            {passes.slice(0, 2).map((p, idx) => (
              <button
                key={p.id}
                onClick={() => handleProcessCode(p.code)}
                className="px-2.5 py-1 rounded bg-[#F3E6CE] text-[#2A1A14] font-bold border border-[#2A1A14] hover:bg-[#FFF6E5] shadow-[1px_1px_0px_#2A1A14]"
              >
                Pass #{idx + 1} ({p.checkedIn ? 'Already Stamped' : 'Valid'})
              </button>
            ))}
            <button
              onClick={() => handleProcessCode('CP-FAKE-9999')}
              className="px-2.5 py-1 rounded bg-[#A98258] text-[#FFF6E5] font-bold border border-[#2A1A14] hover:bg-[#B58E62] shadow-[1px_1px_0px_#2A1A14]"
            >
              Invalid Code
            </button>
          </div>
        </div>
      </div>

      {/* Stack of Stamped Slips: Last 5 Scans */}
      <div className="relative z-30 bg-[#2A1A14] border-t-2 border-[#F3E6CE]/20 p-4 max-h-48 overflow-y-auto font-typewriter text-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F3E6CE]/20 text-[#FFF6E5]/70">
          <div className="flex items-center gap-2">
            <PointingHand direction="right" className="w-6 h-3" />
            <span className="font-bold tracking-widest uppercase">
              CHECK-IN DESK STREAM // LAST 5 STAMPED SLIPS
            </span>
          </div>
          <span className="text-[10px] text-[#F3E6CE]">DESK ACTIVE</span>
        </div>

        <div className="space-y-1.5">
          {recentScans.slice(0, 5).map((scan) => {
            const isVal = scan.status === 'VALID';
            const isDup = scan.status === 'DUPLICATE';
            return (
              <div
                key={scan.id}
                className="flex items-center justify-between gap-2 py-1.5 px-3 rounded bg-[#F3E6CE] text-[#2A1A14] border border-[#2A1A14] shadow-[1px_1px_0px_#2A1A14]"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-[10px] opacity-60">{scan.timestamp}</span>
                  <span
                    className={`font-black text-[9px] px-1.5 py-0.5 rounded border border-[#2A1A14] ${
                      isVal
                        ? 'bg-[#5B7A3A] text-[#FFF6E5]'
                        : isDup
                        ? 'bg-[#8E2A2A] text-[#FFF6E5]'
                        : 'bg-[#2A1A14] text-[#FFF6E5]'
                    }`}
                  >
                    {scan.status}
                  </span>
                  <span className="font-bold truncate">{scan.studentName} ({scan.studentRollNumber})</span>
                </div>
                <div className="text-right shrink-0 text-[11px] font-black text-[#8E2A2A]">
                  {scan.code}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
