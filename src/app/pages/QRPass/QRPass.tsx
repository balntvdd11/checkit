import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GraduationCap, Hash, RefreshCw, ChevronRight, AlertTriangle, Download, CheckCircle2 } from "lucide-react";
import COAccessLogo from "../../components/shared/COAccessLogo";
import QRCodeDisplay from "../../components/shared/QRCodeDisplay";
import AnimatedBackground from "../../components/common/AnimatedBackground";
import { cn, getLocalDateStr } from "../../lib/utils";
import type { Student, EventConfig } from "../../types";
import { fetchStudentByEmail } from "../../services/studentCheck";
import { fetchAttendance } from "../../services/attendance";
import { generateDeviceFingerprint } from "../../services/fingerprint";
import { hasStoredPrivateKey } from "../../services/browserActivation";
import DeveloperFooter from "../../components/shared/DeveloperFooter";
import { useStore } from "../../state/store";

// ─── QR Pass Generator ────────────────────────────────────────────────────────

const REFRESH_INTERVAL = 15;

export default function QRPassGenerator({ student, EVENTSCode, events, onBack, onGoToDashboard, onLogout }: {
  student: Student; EVENTSCode: string; events: EventConfig[]; onBack: () => void; onGoToDashboard?: () => void; onLogout?: () => void;
}) {
  const getInitials = (name: string) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  const initials = getInitials(student.name);
  const activeEvent = events?.find((e) => e.checkItCode === EVENTSCode);
  const eventName = activeEvent?.name || "Event";
  const [timeLeft, setTimeLeft] = useState(REFRESH_INTERVAL);
  const [qrSeed, setQrSeed] = useState(Date.now().toString());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isActive, setIsActive] = useState<boolean | null>(null);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setQrSeed(Date.now().toString());
      setTimeLeft(REFRESH_INTERVAL);
      setIsRefreshing(false);
    }, 450);
  };

  // ── Scan success modal (read-only: never touches QR/timer/nav) ────────────
  type ScanModalType = "time-in" | "time-out" | null;
  const [scanModal, setScanModal] = useState<ScanModalType>(null);
  const scanModalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track what we've already seen so we only fire once per transition
  const prevTimeInRef = useRef<string | null | undefined>(undefined);
  const prevTimeOutRef = useRef<string | null | undefined>(undefined);
  const ringSize = 264;

  useEffect(() => {
    let mounted = true;
    const checkActiveStatus = async () => {
      try {
        const currentFingerprint = await generateDeviceFingerprint();
        const record = await fetchStudentByEmail(student.email);
        if (mounted) {
          if (!record || !hasStoredPrivateKey(student.email) || record.browserFingerprint !== currentFingerprint) {
            setIsActive(false);
          } else {
            setIsActive(true);
          }
        }
      } catch (err) {
        if (mounted) setIsActive(false);
      }
    };
    checkActiveStatus();
    return () => { mounted = false; };
  }, [student.email]);

  useEffect(() => {
    if (isActive !== true) return;
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
  }, [isActive]);

  // ── React instantly to WebSocket updates from the global store ──────────
  // (Plus a fallback HTTP poll just in case the carrier/network blocks WebSockets)
  const { state } = useStore();
  const { attendance } = state;
  const [readyToListen, setReadyToListen] = useState(false);

  // 1. Initial lock-in: Fetch the exact current state before we start listening for changes.
  // This prevents the animation from firing just because the global state finished loading.
  useEffect(() => {
    if (isActive !== true) return;
    const today = getLocalDateStr();

    const init = async () => {
      try {
        const records = await fetchAttendance();
        const currentRecord = records.find(
          (r: any) => r.studentId === student.studentId && r.EVENTSCode === EVENTSCode && r.date === today
        );
        prevTimeInRef.current = currentRecord?.timeIn ?? null;
        prevTimeOutRef.current = currentRecord?.timeOut ?? null;
      } catch {
        // Fallback to store if fetch fails
        const wsRecord = attendance.find(
          (r: any) => r.studentId === student.studentId && r.EVENTSCode === EVENTSCode && r.date === today
        );
        prevTimeInRef.current = wsRecord?.timeIn ?? null;
        prevTimeOutRef.current = wsRecord?.timeOut ?? null;
      } finally {
        setReadyToListen(true);
      }
    };
    init();
  }, [isActive, student.studentId, EVENTSCode]); // Only run once on mount per event

  // 2. Listen for changes and trigger animation ONLY on real diffs
  useEffect(() => {
    if (isActive !== true || !readyToListen) return;
    const today = getLocalDateStr();

    const evaluateRecord = (myRecord: any) => {
      const currentTimeIn = myRecord?.timeIn ?? null;
      const currentTimeOut = (myRecord as any)?.timeOut ?? null;

      if (prevTimeInRef.current === undefined) {
        prevTimeInRef.current = currentTimeIn;
        prevTimeOutRef.current = currentTimeOut;
        return;
      }

      if (currentTimeOut && currentTimeOut.trim() !== "" && currentTimeOut !== prevTimeOutRef.current) {
        prevTimeOutRef.current = currentTimeOut;
        if (scanModalTimerRef.current) clearTimeout(scanModalTimerRef.current);
        setScanModal("time-out");
        scanModalTimerRef.current = setTimeout(() => setScanModal(null), 4500);
        return;
      }

      if (currentTimeIn && currentTimeIn !== prevTimeInRef.current) {
        prevTimeInRef.current = currentTimeIn;
        if (scanModalTimerRef.current) clearTimeout(scanModalTimerRef.current);
        setScanModal("time-in");
        scanModalTimerRef.current = setTimeout(() => setScanModal(null), 4500);
      }
    };

    // Evaluate based on WebSocket state
    const wsRecord = attendance.find(
      (r: any) => r.studentId === student.studentId && r.EVENTSCode === EVENTSCode && r.date === today
    );
    evaluateRecord(wsRecord);

    // Fallback polling (HTTP)
    const poll = async () => {
      try {
        const records = await fetchAttendance();
        const httpRecord = records.find(
          (r: any) => r.studentId === student.studentId && r.EVENTSCode === EVENTSCode && r.date === today
        );
        evaluateRecord(httpRecord);
      } catch {
        // silent fail
      }
    };

    const pollInterval = setInterval(poll, 3000);

    return () => {
      clearInterval(pollInterval);
      if (scanModalTimerRef.current) clearTimeout(scanModalTimerRef.current);
    };
  }, [isActive, attendance, student.studentId, EVENTSCode]);

  const qrValue = `${student.studentId}:${EVENTSCode}:${qrSeed}`;

  const handleDownloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR_Pass_${student.studentId}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  if (isActive === null) {
    return (
      <div className="min-h-[100dvh] pb-[180px] sm:pb-[220px] landing-page-black flex items-center justify-center">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animation: "spin 0.9s linear infinite" }}>
            <circle cx="18" cy="18" r="15" stroke="rgba(255,255,255,0.12)" strokeWidth="3" />
            <path d="M18 3 A15 15 0 0 1 33 18" stroke="rgba(255,255,255,0.75)" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] pb-[180px] sm:pb-[220px] landing-page-black relative overflow-hidden">
      <AnimatedBackground />
      <header className="bg-[var(--secondary)] px-5 py-3.5 flex items-center justify-between shrink-0 relative z-20 shadow-md">
        <div className="flex items-center gap-4">
          <COAccessLogo inverted size="sm" />
          <div className="w-px h-5 bg-white/20" />
          <span className="text-white/50 text-sm">Student Portal</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleManualRefresh} disabled={isRefreshing} className="flex items-center gap-1.5 text-white/55 hover:text-white text-sm transition-colors">
            <RefreshCw size={14} className={cn(isRefreshing && "animate-spin")} /> {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100dvh-57px)] p-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">

          {onGoToDashboard && (
            <button onClick={onGoToDashboard} className="flex items-center gap-1.5 text-sm text-[#0a2472]/70 hover:text-[#0a2472] mb-4 transition-colors font-medium">
              <ChevronRight size={15} className="rotate-180" /> Back to Dashboard
            </button>
          )}

          {/* Live indicator */}
          <div className="flex items-center justify-center gap-2 mb-5">
            {isActive ? (
              <>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-emerald-600">Live — Ready to scan</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-sm font-semibold text-red-600">Security Check Failed</span>
              </>
            )}
          </div>

          <div className="bg-gradient-to-br from-[#0a2472]/85 via-[#123499]/90 to-[#72caec] border border-white/10 rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.35)] relative overflow-hidden group premium-border-card">


            {/* Student header */}
            <div className="bg-black/20 px-6 py-5 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-[var(--primary)] font-bold text-lg">{initials}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white text-sm leading-tight truncate">{student.name}</p>
                  <p className="text-white/55 text-xs mt-0.5 font-mono">{student.studentId} · {student.section}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
                <span className="text-xs font-semibold text-white/80">{eventName}</span>
              </div>
            </div>

            {isActive ? (
              <div className="flex flex-col items-center pt-6 pb-7 px-6 relative z-10">
                <div className="flex justify-center items-center py-4 w-full">
                  <motion.div
                    animate={{ opacity: isRefreshing ? 0.15 : 1, scale: isRefreshing ? 0.92 : 1 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div className="p-6 bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
                      <QRCodeDisplay value={qrValue} size={220} />
                    </div>
                  </motion.div>
                </div>

                <div className="mt-3 flex flex-col items-center gap-2 w-full max-w-[200px]">
                  <div className="flex items-center gap-1.5 text-sm text-slate-300">
                    <RefreshCw size={13} className={cn(isRefreshing && "animate-spin")} />
                    <span>{isRefreshing ? "Refreshing…" : `Refreshes in ${timeLeft}s`}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--primary)] transition-all duration-1000 ease-linear"
                      style={{ width: `${(timeLeft / REFRESH_INTERVAL) * 100}%` }}
                    />
                  </div>
                </div>

                <p className="mt-4 text-xs text-center text-white leading-relaxed max-w-[200px]">
                  Show this QR to your admin's scanner. Keep this screen active.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center pt-10 pb-12 px-6 relative z-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center shadow-sm border border-red-500/20 mb-5">
                  <AlertTriangle size={30} className="text-red-400" />
                </div>
                <h2 className="text-lg font-bold text-white mb-2">Browser Not Active</h2>
                <p className="text-sm text-slate-300 leading-relaxed max-w-[250px]">
                  This browser is not active. To protect your attendance, you cannot generate QR codes here.
                </p>
                <p className="text-xs text-slate-400 mt-4 max-w-[220px]">
                  Please reload the page or go back to activate this browser first.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      <DeveloperFooter />

      {/* ── Scan Success Modal (Fullscreen & Instant) ── */}
      <AnimatePresence>
        {scanModal && (
          <motion.div
            key="scan-modal-fullscreen"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 px-6"
          >
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 24, delay: 0.1 }}
              className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center mb-8 backdrop-blur-sm border border-white/30"
            >
              <CheckCircle2 size={72} className="text-white" strokeWidth={2.5} />
            </motion.div>

            {scanModal === "time-in" ? (
              <>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-white/80 font-semibold uppercase tracking-[0.2em] mb-3 text-sm"
                >
                  Welcome to
                </motion.p>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl sm:text-4xl font-black text-white text-center leading-tight mb-4"
                >
                  {eventName}
                </motion.h2>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="px-6 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30"
                >
                  <p className="text-lg font-bold text-white">Time In Recorded ✓</p>
                </motion.div>
              </>
            ) : (
              <>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl sm:text-4xl font-black text-white text-center leading-tight mb-4"
                >
                  Time Out Recorded ✓
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl text-white/90 font-medium"
                >
                  Thank you for attending!
                </motion.p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      </div>
  );
}
