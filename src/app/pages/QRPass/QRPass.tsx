import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { GraduationCap, Hash, RefreshCw, ChevronRight, AlertTriangle, Download } from "lucide-react";
import CheckITLogo from "../../components/shared/CheckITLogo";
import QRCodeDisplay from "../../components/shared/QRCodeDisplay";
import ProgressRing from "../../components/shared/ProgressRing";
import AnimatedBackground from "../../components/common/AnimatedBackground";
import { cn } from "../../lib/utils";
import type { Student } from "../../types";
import { fetchStudentByEmail } from "../../services/studentCheck";
import { generateDeviceFingerprint } from "../../services/fingerprint";
import { hasStoredPrivateKey } from "../../services/browserActivation";

// ─── QR Pass Generator ────────────────────────────────────────────────────────

const REFRESH_INTERVAL = 15;

export default function QRPassGenerator({ student, EVENTSCode, onBack, onLogout }: {
  student: Student; EVENTSCode: string; onBack: () => void; onLogout: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(REFRESH_INTERVAL);
  const [qrSeed, setQrSeed] = useState(Date.now().toString());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const ringSize = 264;

  useEffect(() => {
    let mounted = true;
    const checkActiveStatus = async () => {
      try {
        const currentFingerprint = await generateDeviceFingerprint();
        const record = await fetchStudentByEmail(student.email);
        if (mounted) {
          if (!record || !hasStoredPrivateKey(student.email) || record.deviceFingerprint !== currentFingerprint) {
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
      <div className="min-h-screen landing-page-black flex items-center justify-center">
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
    <div className="min-h-screen landing-page-black relative overflow-hidden">
      <AnimatedBackground />
      <header className="bg-[var(--secondary)] px-5 py-3.5 flex items-center justify-between shrink-0 relative z-20 shadow-md">
        <div className="flex items-center gap-4">
          <CheckITLogo inverted size="sm" />
          <div className="w-px h-5 bg-white/20" />
          <span className="text-white/50 text-sm">Student Portal</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-sm text-white/55 hover:text-white transition-colors flex items-center gap-1.5">
            <ChevronRight size={14} className="rotate-180" /> Change EVENTS
          </button>
          <button onClick={onLogout} className="flex items-center gap-1.5 text-white/55 hover:text-white text-sm transition-colors">
          </button>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-57px)] p-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">

          {/* Live indicator */}
          <div className="flex items-center justify-center gap-2 mb-5">
            {isActive ? (
              <>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-emerald-400">Live — Ready to scan</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-sm font-semibold text-red-400">Security Check Failed</span>
              </>
            )}
          </div>

          <div className="!bg-black border border-white/10 rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.35)] relative overflow-hidden group premium-border-card">
            <span className="border-tracer absolute inset-0 pointer-events-none">
              <svg viewBox="0 0 384 500" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <defs>
                  <linearGradient id="tracerGrad-qr" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0" stopColor="#F5F7FA" stopOpacity="0.75" />
                    <stop offset="0.5" stopColor="#D7DEE8" stopOpacity="0.3" />
                    <stop offset="1" stopColor="#D7DEE8" stopOpacity="0" />
                  </linearGradient>
                  <filter id="glow-qr"><feGaussianBlur stdDeviation="3.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                </defs>
                <rect x="1" y="1" width="382" height="498" rx="16" ry="16" fill="none" stroke="url(#tracerGrad-qr)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="110 900" pathLength="1000" filter="url(#glow-qr)">
                  <animate attributeName="stroke-dashoffset" from="0" to="1000" dur="5.2s" repeatCount="indefinite" />
                </rect>
              </svg>
            </span>

            {/* Student header */}
            <div className="bg-[var(--secondary)] px-6 py-5 relative z-10">
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
                <span className="text-xs font-mono text-white/60 tracking-widest">{EVENTSCode}</span>
              </div>
            </div>

            {isActive ? (
              <div className="flex flex-col items-center pt-6 pb-7 px-6 relative z-10">
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

                <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-300">
                  <RefreshCw size={13} className={cn(isRefreshing && "animate-spin")} />
                  <span>{isRefreshing ? "Refreshing…" : `Refreshes in ${timeLeft}s`}</span>
                </div>

                <button 
                  onClick={handleDownloadQR}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm font-semibold"
                >
                  <Download size={16} /> Download QR
                </button>

                <p className="mt-4 text-xs text-center text-slate-400 leading-relaxed max-w-[200px]">
                  Show this QR to your instructor's scanner. Keep this screen active.
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
    </div>
  );
}
