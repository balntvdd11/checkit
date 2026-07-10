import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { GraduationCap, Hash, RefreshCw, ChevronRight } from "lucide-react";
import CheckITLogo from "../../components/shared/CheckITLogo";
import QRCodeDisplay from "../../components/shared/QRCodeDisplay";
import ProgressRing from "../../components/shared/ProgressRing";
import { cn } from "../../lib/utils";
import type { Student } from "../../types";

// ─── QR Pass Generator ────────────────────────────────────────────────────────

const REFRESH_INTERVAL = 15;

export default function QRPassGenerator({ student, sessionCode, onBack, onLogout }: {
  student: Student; sessionCode: string; onBack: () => void; onLogout: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(REFRESH_INTERVAL);
  const [qrSeed, setQrSeed] = useState(Date.now().toString());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const ringSize = 264;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRefreshing(true);
          setTimeout(() => { setQrSeed(Date.now().toString()); setIsRefreshing(false); }, 450);
          return REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const qrValue = `${student.studentId}:${sessionCode}:${qrSeed}`;

  return (
    <div className="min-h-screen page-diamond-bg">
      <header className="bg-[var(--secondary)] px-5 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <CheckITLogo inverted size="sm" />
          <div className="w-px h-5 bg-white/20" />
          <span className="text-white/50 text-sm">Student Portal</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-sm text-white/55 hover:text-white transition-colors flex items-center gap-1.5">
            <ChevronRight size={14} className="rotate-180" /> Change session
          </button>
          <button onClick={onLogout} className="flex items-center gap-1.5 text-white/55 hover:text-white text-sm transition-colors">
          </button>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-57px)] p-4">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">

          {/* Live indicator */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-emerald-700">Live — Ready to scan</span>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_8px_48px_rgba(11,42,77,0.14)] overflow-hidden">
            {/* Student header */}
            <div className="bg-[var(--secondary)] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <GraduationCap size={22} className="text-[var(--primary)]" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white text-sm leading-tight truncate">{student.name}</p>
                  <p className="text-white/55 text-xs mt-0.5 font-mono">{student.studentId} · {student.section}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
                <Hash size={11} className="text-[var(--primary)]" />
                <span className="text-xs font-mono text-white/60 tracking-widest">{sessionCode}</span>
              </div>
            </div>

            {/* QR code + ring */}
            <div className="flex flex-col items-center pt-6 pb-7 px-6">
              <div className="relative" style={{ width: ringSize, height: ringSize }}>
                <ProgressRing progress={timeLeft / REFRESH_INTERVAL} size={ringSize} />
                <motion.div
                  animate={{ opacity: isRefreshing ? 0.15 : 1, scale: isRefreshing ? 0.92 : 1 }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ padding: 30 }}>
                  <div className="p-4 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                    <QRCodeDisplay value={qrValue} size={170} />
                  </div>
                </motion.div>
              </div>

              <div className="mt-1 flex items-center gap-1.5 text-sm text-[#7A6268]">
                <RefreshCw size={13} className={cn(isRefreshing && "animate-spin")} />
                <span>{isRefreshing ? "Refreshing…" : `Refreshes in ${timeLeft}s`}</span>
              </div>

              <p className="mt-4 text-xs text-center text-[#B8ADB2] leading-relaxed max-w-[200px]">
                Show this QR to your instructor's scanner. Keep this screen active.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
