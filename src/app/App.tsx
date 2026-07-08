import { useState, useEffect, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import AnimatedBackground from "./AnimatedBackground";
import checkITLogo from "../asset/checkITlogo.png";
import dragonIllustration from "../asset/dragon.png";
import studentPortalIcon from "../asset/studentportalICON.png";
import adminPortalIcon from "../asset/adminportalICON.png";
import {
  QrCode, LogOut, ChevronRight, Search, Download,
  CheckCircle, XCircle, Clock, Users, Calendar, Copy,
  RefreshCw, AlertTriangle, BarChart3, FileText, X, Check,
  Info, GraduationCap, Eye, EyeOff, Lock, Smartphone, Scan,
  Camera, Plus, Hash, Building2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type View =
  | "landing"
  | "student-auth"
  | "student-register"
  | "student-activation"
  | "student-device-conflict"
  | "student-session-code"
  | "student-qr-pass"
  | "student-dashboard"
  | "admin-login"
  | "admin-dashboard";

type AdminTab = "dashboard" | "students" | "create-event" | "scanner" | "reports";
type AttendanceStatus = "present" | "late" | "absent";
type SessionStatus = "active" | "completed" | "inactive";

type EventStatus = "active" | "inactive";

interface Student {
  name: string;
  section: string;
  studentId: string;
  email: string;
}

interface AttendanceRecord {
  date: string;
  subject: string;
  section: string;
  status: AttendanceStatus;
  timeIn: string;
  sessionCode: string;
}

interface Session {
  id: string;
  code: string;
  section: string;
  subject: string;
  date: string;
  timeStart: string;
  lateThreshold: string;
  timeEnd: string;
  status: SessionStatus;
}

interface EventConfig {
  id: string;
  name: string;
  checkItCode: string;
  timeIn: string;
  lateThreshold: string;
  timeOut: string;
  status: EventStatus;
}

interface StudentRecord {
  name: string;
  studentId: string;
  section: string;
  email: string;
  registered: boolean;
  registeredAt: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { date: "Jul 3, 2025", subject: "Software Engineering", section: "BSIT 3A", status: "present", timeIn: "07:58 AM", sessionCode: "CIT-2025-041" },
  { date: "Jul 2, 2025", subject: "Web Development", section: "BSIT 3A", status: "late", timeIn: "09:22 AM", sessionCode: "CIT-2025-040" },
  { date: "Jul 1, 2025", subject: "Database Management", section: "BSIT 3A", status: "present", timeIn: "08:02 AM", sessionCode: "CIT-2025-039" },
  { date: "Jun 30, 2025", subject: "Software Engineering", section: "BSIT 3A", status: "absent", timeIn: "—", sessionCode: "CIT-2025-038" },
  { date: "Jun 28, 2025", subject: "Web Development", section: "BSIT 3A", status: "present", timeIn: "08:00 AM", sessionCode: "CIT-2025-037" },
  { date: "Jun 27, 2025", subject: "Database Management", section: "BSIT 3A", status: "present", timeIn: "07:55 AM", sessionCode: "CIT-2025-036" },
  { date: "Jun 26, 2025", subject: "Software Engineering", section: "BSIT 3A", status: "late", timeIn: "08:19 AM", sessionCode: "CIT-2025-035" },
];

const MOCK_SESSIONS: Session[] = [
  { id: "s1", code: "CIT-2025-042", section: "BSIT 3A", subject: "Software Engineering", date: "Jul 4, 2025", timeStart: "08:00 AM", lateThreshold: "08:15 AM", timeEnd: "09:30 AM", status: "active" },
  { id: "s2", code: "CIT-2025-041", section: "BSIT 3B", subject: "Web Development", date: "Jul 3, 2025", timeStart: "10:00 AM", lateThreshold: "10:15 AM", timeEnd: "11:30 AM", status: "completed" },
  { id: "s3", code: "CIT-2025-040", section: "BSIT 2A", subject: "Database Management", date: "Jul 3, 2025", timeStart: "01:00 PM", lateThreshold: "01:15 PM", timeEnd: "02:30 PM", status: "completed" },
  { id: "s4", code: "CIT-2025-039", section: "BSIT 3A", subject: "Software Engineering", date: "Jul 2, 2025", timeStart: "08:00 AM", lateThreshold: "08:15 AM", timeEnd: "09:30 AM", status: "completed" },
];

const MOCK_EVENTS: EventConfig[] = [
  { id: "e1", name: "Orientation Session", checkItCode: "ORIENT", timeIn: "08:00", lateThreshold: "08:15", timeOut: "09:30", status: "active" },
  { id: "e2", name: "Campus Tour", checkItCode: "CAMPUS", timeIn: "10:00", lateThreshold: "10:15", timeOut: "11:30", status: "inactive" },
  { id: "e3", name: "Workshop: QR Attendance", checkItCode: "WRKQR", timeIn: "13:00", lateThreshold: "13:15", timeOut: "14:30", status: "inactive" },
];

const MOCK_STUDENTS: StudentRecord[] = [
  { name: "Maria Clara Santos", studentId: "2023001321", section: "BSIT 3A", email: "maria.santos@student.ua.edu.ph", registered: true, registeredAt: "Jan 15, 2025" },
  { name: "Juan Paolo Reyes", studentId: "2023001342", section: "BSIT 3A", email: "juan.reyes@student.ua.edu.ph", registered: true, registeredAt: "Jan 15, 2025" },
  { name: "Ana Gabrielle Cruz", studentId: "2023001356", section: "BSIT 3B", email: "ana.cruz@student.ua.edu.ph", registered: true, registeredAt: "Jan 16, 2025" },
  { name: "Miguel Andrei Bautista", studentId: "2022001198", section: "BSIT 2A", email: "miguel.bautista@student.ua.edu.ph", registered: true, registeredAt: "Jan 14, 2025" },
  { name: "Sofia Isabelle Ramos", studentId: "2023001388", section: "BSIT 3A", email: "sofia.ramos@student.ua.edu.ph", registered: false, registeredAt: "—" },
  { name: "Carlos David Mendoza", studentId: "2023001401", section: "BSIT 3B", email: "carlos.mendoza@student.ua.edu.ph", registered: true, registeredAt: "Jan 17, 2025" },
  { name: "Bianca Rose Torres", studentId: "2022001212", section: "BSIT 2A", email: "bianca.torres@student.ua.edu.ph", registered: true, registeredAt: "Jan 15, 2025" },
];

const MOCK_REPORT_RECORDS = [
  { ...MOCK_STUDENTS[0], status: "present" as const, timeIn: "08:02 AM", date: "2025-07-04" },
  { ...MOCK_STUDENTS[1], status: "late" as const, timeIn: "08:17 AM", date: "2025-07-04" },
  { ...MOCK_STUDENTS[2], status: "present" as const, timeIn: "08:00 AM", date: "2025-07-03" },
  { ...MOCK_STUDENTS[3], status: "absent" as const, timeIn: "—", date: "2025-07-04" },
  { ...MOCK_STUDENTS[4], status: "present" as const, timeIn: "07:59 AM", date: "2025-07-04" },
  { ...MOCK_STUDENTS[5], status: "present" as const, timeIn: "08:05 AM", date: "2025-07-03" },
  { ...MOCK_STUDENTS[6], status: "late" as const, timeIn: "08:22 AM", date: "2025-07-04" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

function generateCheckItCode(eventName: string): string {
  const normalized = eventName.trim().toUpperCase();
  if (!normalized) return "EVT";
  if (normalized.includes("ORIENTATION")) return "ORIENT";
  if (normalized.includes("TECHKADA")) return "TchKD";

  const words = normalized.split(/[^A-Z0-9]+/).filter(Boolean);
  if (words.length === 0) return "EVT";

  const compact = words
    .map(word => {
      if (word.length <= 3) return word;
      return `${word.slice(0, 2)}${word.slice(-1)}`;
    })
    .join("");

  return compact.length > 8 ? compact.slice(0, 8) : compact || "EVT";
}

// ─── QR Code Display ──────────────────────────────────────────────────────────

function QRCodeDisplay({ value, size = 180 }: { value: string; size?: number }) {
  const cells = 25;
  const cs = size / cells;
  const grid: boolean[][] = Array(cells).fill(null).map(() => Array(cells).fill(false));

  const drawFinder = (sr: number, sc: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        grid[sr + r][sc + c] = r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, cells - 7);
  drawFinder(cells - 7, 0);

  for (let i = 8; i < cells - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  let seed = value.split("").reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) | 0, 1234567);
  const rand = () => {
    seed ^= seed << 13;
    seed ^= seed >> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 0xffffffff;
  };

  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      if (!(r < 9 && c < 9) && !(r < 9 && c >= cells - 8) && !(r >= cells - 8 && c < 9) && r !== 6 && c !== 6) {
        grid[r][c] = rand() > 0.42;
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <rect width={size} height={size} fill="white" />
      {grid.flatMap((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect key={`${r}-${c}`} x={c * cs + 0.5} y={r * cs + 0.5} width={cs - 1} height={cs - 1} fill="#1A080E" rx={1} />
          ) : null
        )
      )}
    </svg>
  );
}

// ─── Progress Ring ────────────────────────────────────────────────────────────

function ProgressRing({ progress, size = 256 }: { progress: number; size?: number }) {
  const r = (size - 20) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(11,42,77,0.08)" strokeWidth={8} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="#2A84D2" strokeWidth={8}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.8s linear" }}
      />
    </svg>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AttendanceStatus | SessionStatus }) {
  const cfg: Record<string, { label: string; cls: string; dot: string }> = {
    present:   { label: "Present",   cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
    late:      { label: "Late",      cls: "bg-[#E6F4FF] text-[#0B2A4D] border border-[#A8D6FF]",       dot: "bg-[#2A84D2]" },
    absent:    { label: "Absent",    cls: "bg-[#F8F4EF] text-[#7A6268] border border-[#D7D5D0]",             dot: "bg-[#0B2A4D]" },
    active:    { label: "Active",    cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
    completed: { label: "Completed", cls: "bg-gray-50 text-gray-500 border border-gray-200",          dot: "bg-gray-400" },
    inactive:  { label: "Inactive",  cls: "bg-gray-50 text-gray-400 border border-gray-200",          dot: "bg-gray-300" },
  };
  const c = cfg[status] ?? cfg.inactive;
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5", c.cls)}>
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", c.dot)} />
      {c.label}
    </span>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

function CheckITLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const iconBox = { sm: "w-24 h-24", md: "w-36 h-36", lg: "w-48 h-48" };
  const text = { sm: "text-xl", md: "text-5xl", lg: "text-6xl" };
  return (
    <div className={cn("flex items-center", text[size])}>
      <img src={checkITLogo} alt="CheckIT logo" className={cn("object-contain block self-center", iconBox[size])} />
      <div className={cn(
        "flex items-baseline leading-none checkit-wordmark",
        size === "sm" ? "-ml-6 -translate-y-0.5" : size === "md" ? "-ml-10 -translate-y-1" : "-ml-14 -translate-y-1"
      )}>
        <span className="checkit-wordmark__check">Check</span>
        <span className="checkit-wordmark__it">IT</span>
      </div>
    </div>
  );
}

// ─── Card Shell ───────────────────────────────────────────────────────────────

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("bg-white rounded-2xl shadow-[0_4px_32px_rgba(11,42,77,0.08)]", className)}>
      {children}
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

function LandingPage({ onStudent, onAdmin }: { onStudent: () => void; onAdmin: () => void }) {

  return (
    <div className="min-h-screen landing-page-black flex flex-col items-center justify-center relative overflow-hidden">
      <AnimatedBackground />
      <div className="absolute inset-0 opacity-0 pointer-events-none" />

      {/* static background illustration removed per request */}

      <motion.div initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 flex flex-col items-center px-4 w-full max-w-4xl mx-auto py-2">

        {/* Wordmark */}
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
          className="flex flex-col items-center mb-1 -translate-y-16">
          <div className="mb-0.5 flex items-center justify-center gap-0">
            <div className="relative w-72 h-72 shrink-0">
              <img src={checkITLogo} alt="CheckIT logo" className="relative z-10 w-72 h-72 object-contain" />
            </div>
            <div className="flex items-center gap-0 -translate-x-20 checkit-wordmark text-6xl sm:text-7xl">
              <span className="checkit-wordmark__check">Check</span>
              <span className="checkit-wordmark__it">IT</span>
            </div>
          </div>
          <div className="relative -translate-y-15 flex flex-col items-center justify-center">
            <p className="text-white text-lg font-medium text-center truncate my-0 max-w-2xl">
              Fast and Secure Event Attendance for CIT Students
            </p>
            <div className="mt-0 flex items-center justify-center gap-2 text-white/35 text-xs">
            </div>
          </div>
        </motion.div>

        {/* Portal cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-4xl mt-1">
          <motion.button
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            onClick={onStudent}
            className="group relative premium-border-card border-[1.5px] text-left rounded-2xl border border-[#7EEAF8]/24 bg-black hover:bg-[rgba(14,32,68,0.18)] hover:border-[#7EEAF8]/40 transition-all duration-200 p-9 flex flex-col gap-6 cursor-pointer h-[265px] overflow-hidden"
          >
            <span className="border-tracer absolute inset-0 pointer-events-none">
              <svg viewBox="0 0 360 220" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <defs>
                  <linearGradient id="tracerGrad-student" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0" stopColor="#F5F7FA" stopOpacity="0.75" />
                    <stop offset="0.5" stopColor="#D7DEE8" stopOpacity="0.3" />
                    <stop offset="1" stopColor="#D7DEE8" stopOpacity="0" />
                  </linearGradient>
                  <filter id="glow-student"><feGaussianBlur stdDeviation="3.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                </defs>
                <rect x="1" y="1" width="358" height="218" rx="16" ry="16" fill="none" stroke="url(#tracerGrad-student)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="110 900" pathLength="1000" filter="url(#glow-student)">
                  <animate attributeName="stroke-dashoffset" from="0" to="1000" dur="5.2s" repeatCount="indefinite" />
                </rect>
              </svg>
            </span>
            <img src={studentPortalIcon} alt="Student portal" className="w-24 h-24 object-contain" />
            <div>
              <h2 className="text-xl font-semibold text-white mb-1.5">Student Portal</h2>
              <p className="text-[#d7f8ff]/50 text-sm leading-relaxed">Generate Event Passes</p>
            </div>
            <div className="mt-auto" />
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            onClick={onAdmin}
            className="group relative premium-border-card border-[1.5px] text-left rounded-2xl border border-[#7EEAF8]/24 bg-black hover:bg-[rgba(14,32,68,0.18)] hover:border-[#7EEAF8]/40 transition-all duration-200 p-9 flex flex-col gap-6 cursor-pointer h-[265px] overflow-hidden"
          >
            <span className="border-tracer absolute inset-0 pointer-events-none">
              <svg viewBox="0 0 360 220" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <defs>
                  <linearGradient id="tracerGrad-admin" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0" stopColor="#F5F7FA" stopOpacity="0.75" />
                    <stop offset="0.5" stopColor="#D7DEE8" stopOpacity="0.3" />
                    <stop offset="1" stopColor="#D7DEE8" stopOpacity="0" />
                  </linearGradient>
                  <filter id="glow-admin"><feGaussianBlur stdDeviation="3.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                </defs>
                <rect x="1" y="1" width="358" height="218" rx="16" ry="16" fill="none" stroke="url(#tracerGrad-admin)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="110 900" pathLength="1000" filter="url(#glow-admin)">
                  <animate attributeName="stroke-dashoffset" from="0" to="1000" dur="5.2s" repeatCount="indefinite" />
                </rect>
              </svg>
            </span>
            <img src={adminPortalIcon} alt="Admin portal" className="w-24 h-24 object-contain" />
            <div>
              <h2 className="text-xl font-semibold text-white mb-1.5">Admin Portal</h2>
              <p className="text-[#d7f8ff]/50 text-sm leading-relaxed">Manage Events and Reports</p>
            </div>
            <div className="mt-auto" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Student Auth Gate ────────────────────────────────────────────────────────

function StudentAuthGate({ onSuccess, onBack }: { onSuccess: (email: string) => void; onBack: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setLoading(false);
      onSuccess("maria.santos@student.ua.edu.ph");
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }} className="w-full max-w-md">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#7A6268] hover:text-[#0B2A4D] mb-8 transition-colors">
          <ChevronRight size={15} className="rotate-180" /> Back to home
        </button>

        <Card className="p-8 bg-[#020A17] border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col items-center text-center mb-8">
            <CheckITLogo size="md" />
            <div className="mt-7 w-16 h-16 rounded-2xl bg-[#0B2A4D] flex items-center justify-center shadow-[0_0_15px_rgba(10,42,77,0.35)]">
              <GraduationCap size={28} className="text-white" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-white">Student Sign In</h1>
              <p className="mt-1.5 text-sm text-slate-300 leading-relaxed max-w-[260px]">
              Sign in with your University of the Assumption student account
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-white/10 border border-white/10 rounded-xl flex items-start gap-2.5 overflow-hidden">
                <XCircle size={15} className="text-white mt-0.5 shrink-0" />
                <p className="text-sm text-white">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button onClick={handleGoogleAuth} disabled={loading}
            className="w-full flex items-center gap-3 px-4 py-3.5 border border-white/10 rounded-xl bg-[#0B2A4D] text-white hover:bg-[#0E3A65] transition-all disabled:opacity-60 disabled:cursor-wait">
            {loading
              ? <RefreshCw size={20} className="text-white animate-spin" />
              : <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66 2.84-.62-.68z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
            }
            <span className="flex-1 text-center text-sm font-semibold text-white">
              {loading ? "Signing in…" : "Sign in with Google"}
            </span>
          </button>

          <div className="mt-4 p-3.5 bg-white/5 rounded-xl border border-white/10 flex items-start gap-2.5">
              <Info size={13} className="text-white/75 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-300 leading-relaxed">
              Only official University of the Assumption student emails are allowed.
              Use your <span className="font-semibold text-white">@ua.edu.ph</span> account.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

// ─── Student Registration ─────────────────────────────────────────────────────

function StudentRegistration({ email, onSubmit, onBack }: { email: string; onSubmit: (s: Student) => void; onBack: () => void }) {
  const [form, setForm] = useState({ name: "", section: "", studentId: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const sections = ["BSIT 1A", "BSIT 1B", "BSIT 2A", "BSIT 2B", "BSIT 3A", "BSIT 3B", "BSIT 4A", "BSIT 4B"];

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.section) e.section = "Please select a section";
    if (!form.studentId.trim()) e.studentId = "Student ID is required";
    else if (!/^\d{10}$/.test(form.studentId)) e.studentId = "Student ID must be 10 digits (e.g., 2023001321)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (validate()) onSubmit({ ...form, email });
  };

  const inputCls = (err?: string) => cn(
    "w-full px-4 py-3 rounded-xl border text-sm bg-white/5 placeholder:text-slate-400 text-white",
    "focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-colors",
    err ? "border-white/20" : "border-white/10"
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }} className="w-full max-w-md">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#7A6268] hover:text-[#0B2A4D] mb-8 transition-colors">
          <ChevronRight size={15} className="rotate-180" /> Back
        </button>

        <Card className="p-8 bg-[#020A17] border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.35)]">
          <div className="mb-6">
            <CheckITLogo size="sm" />
            <h1 className="mt-5 text-xl font-bold text-white">Complete Registration</h1>
            <p className="mt-1 text-sm text-slate-300">
              Signed in as <span className="font-semibold text-white">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Full Name</label>
              <input type="text" placeholder="e.g., Maria Clara Santos"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className={inputCls(errors.name)} />
              {errors.name && <p className="mt-1.5 text-xs text-sky-300">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Section</label>
              <select value={form.section} onChange={e => setForm({ ...form, section: e.target.value })}
                className={cn(inputCls(errors.section), !form.section && "text-[#C0B4B8]")}>
                <option value="">Select your section</option>
                {sections.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.section && <p className="mt-1.5 text-xs text-[#0B2A4D]">{errors.section}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Student ID</label>
              <input type="text" placeholder="e.g., 2023001321"
                value={form.studentId}
                onChange={e => setForm({ ...form, studentId: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                className={cn(inputCls(errors.studentId), "font-mono tracking-widest")} />
              {errors.studentId && <p className="mt-1.5 text-xs text-sky-300">{errors.studentId}</p>}
            </div>

              <button type="submit"
              className="mt-2 w-full py-3.5 bg-[#0B3B66] hover:bg-[#0E4B86] text-white font-bold rounded-xl transition-colors">
              Complete Registration
            </button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

// ─── Browser Activation ───────────────────────────────────────────────────────

function BrowserActivation({ student, hasConflict = false, onActivate, onCancel }: {
  student: Student; hasConflict?: boolean; onActivate: () => void; onCancel: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }} className="w-full max-w-md">
        <Card className="p-8 bg-[#020A17] border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.35)]">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center", "bg-white/10")}> 
                {hasConflict
                  ? <AlertTriangle size={40} className="text-white" />
                  : <Lock size={40} className="text-white" />
                }
              </div>
              <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shadow-lg">
                <Smartphone size={17} className="text-white" />
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-white mb-2">
              {hasConflict ? "Browser Already Activated" : "Activate This Browser"}
            </h1>
            {hasConflict ? (
              <p className="text-sm text-slate-300 leading-relaxed">
                Your account is already active on another device. Activating here will{" "}
                <span className="font-semibold text-white">deactivate your previous browser</span>.
                Only one browser can generate your attendance QR at a time.
              </p>
            ) : (
              <p className="text-sm text-slate-300 leading-relaxed">
                This browser will be remembered as your secure device. Your private key is stored here —{" "}
                <span className="font-semibold text-white">only this activated browser</span> can generate your attendance QR code.
              </p>
            )}
          </div>

          {!hasConflict && (
            <div className="mb-6 p-4 bg-white/5 rounded-3xl border border-white/10 flex items-start gap-3">
              <Lock size={15} className="text-white mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white mb-0.5">Why browser activation?</p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your QR code is cryptographically tied to this device, preventing sharing or spoofing — ensuring only you can mark your attendance.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button onClick={onActivate}
              className={cn("w-full py-3.5 font-bold rounded-xl transition-colors",
                hasConflict ? "bg-[var(--secondary)] hover:bg-[#174E7A] text-white" : "bg-white/10 hover:bg-white/20 text-white")}>
              {hasConflict ? "Confirm & Activate This Browser" : "Activate Browser"}
            </button>
            {hasConflict && (
              <button onClick={onCancel}
                className="w-full py-3 border border-white/10 text-white/80 font-semibold rounded-xl hover:bg-white/5 transition-colors text-sm">
                Cancel
              </button>
            )}
          </div>

          <p className="mt-4 text-center text-xs text-slate-400">
            Activating for: <span className="font-semibold text-white">{student.studentId}</span>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}

// ─── Session Code Entry ───────────────────────────────────────────────────────

function SessionCodeEntry({ student, events, onSubmit, onViewHistory, onLogout }: {
  student: Student; events: EventConfig[]; onSubmit: (code: string) => void; onViewHistory: () => void; onLogout: () => void;
}) {
  const [selectedEventId, setSelectedEventId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const activeEvents = events.filter(e => e.status === "active");
  const selectedEvent = activeEvents.find(e => e.id === selectedEventId);

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!selectedEventId) { setError("Please select a CheckIT code"); return; }
    setLoading(true); setError(null);
    setTimeout(() => {
      setLoading(false);
      onSubmit(selectedEvent?.checkItCode || "");
    }, 1200);
  };

  return (
    <div className="min-h-screen page-diamond-bg">
      <header className="bg-[var(--secondary)] px-5 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <CheckITLogo inverted size="sm" />
          <div className="w-px h-5 bg-white/20" />
          <span className="text-white/50 text-sm">Student Portal</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-white text-xs font-semibold">{student.name}</p>
            <p className="text-white/45 text-xs">{student.section}</p>
          </div>
          <button onClick={onLogout} className="flex items-center gap-1.5 text-white/55 hover:text-white text-sm transition-colors">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-57px)] p-4">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
          <div className="mb-6 text-center">
            <p className="text-sm text-[var(--muted-foreground)]">Welcome back,</p>
            <h1 className="text-2xl font-bold text-[var(--card-foreground)] mt-0.5">{student.name}</h1>
            <p className="text-xs text-[var(--muted-foreground)] mt-1 font-mono">{student.studentId} · {student.section}</p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col items-center text-center mb-7">
                <div className="w-14 h-14 rounded-2xl bg-[#0B2A4D] flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(10,42,77,0.35)]">
                  <Hash size={28} className="text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">Select CheckIT Event</h2>
                <p className="text-sm text-slate-300 mt-1">Choose today's event from the list</p>
              </div>

              {activeEvents.length === 0 ? (
                <div className="p-4 text-center text-[#7A6268] text-sm">
                  <p>No active events available at this time.</p>
                  <p className="text-xs mt-1">Please check with your instructor.</p>
                </div>
              ) : (
                <>
                  <select value={selectedEventId} onChange={e => { setSelectedEventId(e.target.value); setError(null); }}
                    className={cn(
                      "w-full px-4 py-4 rounded-xl border text-center font-semibold bg-white/5 text-white",
                      "focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-colors appearance-none",
                      error ? "border-white/20" : "border-white/10"
                    )}>
                    <option value="">Select an event...</option>
                    {activeEvents.map(event => (
                      <option key={event.id} value={event.id}>
                        {event.name} · {event.checkItCode}
                      </option>
                    ))}
                  </select>

                  {selectedEvent && (
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                          <p className="text-xs uppercase tracking-wide text-white/70 font-semibold">Event</p>
                      <p className="text-sm font-semibold text-white mt-1">{selectedEvent.name}</p>
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10">
                        <Hash size={13} className="text-white/70" />
                        <span className="text-xs font-mono font-bold text-white">{selectedEvent.checkItCode}</span>
                        <span className="text-xs text-slate-300">·</span>
                        <span className="text-xs text-slate-300">{selectedEvent.timeIn} – {selectedEvent.timeOut}</span>
                      </div>
                    </div>
                  )}
                </>
              )}

              <AnimatePresence>
                {error && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="mt-2 text-xs text-white text-center overflow-hidden">{error}</motion.p>
                )}
              </AnimatePresence>

              <button type="submit" disabled={loading || activeEvents.length === 0}
                className="w-full py-3.5 bg-[var(--secondary)] hover:bg-[rgba(11,42,77,0.85)] text-white font-bold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><RefreshCw size={16} className="animate-spin" /> Validating…</> : <><QrCode size={16} /> Generate QR Pass</>}
              </button>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

// ─── QR Pass Generator ────────────────────────────────────────────────────────

const REFRESH_INTERVAL = 15;

function QRPassGenerator({ student, sessionCode, onBack, onLogout }: {
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

// ─── Student Dashboard ────────────────────────────────────────────────────────

function StudentDashboard({ student, onBack, onLogout }: {
  student: Student; onBack: () => void; onLogout: () => void;
}) {
  const counts = {
    present: MOCK_ATTENDANCE.filter(r => r.status === "present").length,
    late: MOCK_ATTENDANCE.filter(r => r.status === "late").length,
    absent: MOCK_ATTENDANCE.filter(r => r.status === "absent").length,
  };

  return (
    <div className="min-h-screen page-diamond-bg">
      <header className="bg-white border-b border-[rgba(11,42,77,0.08)] px-5 py-3.5 flex items-center justify-between">
        <CheckITLogo size="sm" />
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-sm text-[var(--secondary)] font-semibold hover:underline flex items-center gap-1.5">
            <QrCode size={14} /> Get QR Pass
          </button>
          <button onClick={onLogout} className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--secondary)] transition-colors">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1A080E]">My Attendance</h1>
          <p className="text-sm text-[#7A6268] mt-1">{student.name} · {student.section}</p>
        </div>

        {/* Stat pills */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Present", val: counts.present, bg: "bg-emerald-50 border-emerald-100", num: "text-emerald-700" },
            { label: "Late",    val: counts.late,    bg: "bg-[#E6F4FF] border-[#A8D6FF]",     num: "text-[#0B2A4D]" },
            { label: "Absent",  val: counts.absent,  bg: "bg-[#F8F4EF] border-[#D7D5D0]",         num: "text-[#7A6268]" },
          ].map(s => (
            <div key={s.label} className={cn("rounded-2xl p-4 border", s.bg)}>
              <p className={cn("text-3xl font-bold", s.num)}>{s.val}</p>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Records */}
        <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(11,42,77,0.06)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[rgba(11,42,77,0.06)]">
            <h2 className="text-sm font-bold text-[#1A080E]">Attendance History</h2>
          </div>
          <div className="divide-y divide-[rgba(11,42,77,0.05)]">
            {MOCK_ATTENDANCE.map((r, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4 hover:bg-[var(--background)] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[var(--background)] flex items-center justify-center shrink-0">
                  <Calendar size={16} className="text-[var(--secondary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A080E] truncate">{r.subject}</p>
                  <p className="text-xs text-[#7A6268] mt-0.5">{r.date} · {r.section}</p>
                </div>
                <div className="text-right shrink-0">
                  <StatusBadge status={r.status} />
                  {r.timeIn !== "—" && <p className="text-xs text-[#B8ADB2] mt-1 font-mono">{r.timeIn}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Login ──────────────────────────────────────────────────────────────

function AdminLogin({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.email || !form.password) { setError("Please fill in all fields"); return; }
    setLoading(true); setError(null);
    setTimeout(() => { setLoading(false); onSuccess(); }, 1200);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }} className="w-full max-w-md">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#7A6268] hover:text-[#0B2A4D] mb-8 transition-colors">
          <ChevronRight size={15} className="rotate-180" /> Back to home
        </button>

        <Card className="p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <CheckITLogo size="md" />
            <div className="mt-7 w-16 h-16 rounded-2xl bg-[#0B2A4D] flex items-center justify-center shadow-[0_0_15px_rgba(10,42,77,0.35)]">
              <Building2 size={28} className="text-white" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-white">Admin Sign In</h1>
            <p className="mt-1.5 text-sm text-slate-300">Staff & Faculty Portal · University of the Assumption</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-white/10 border border-white/10 rounded-xl flex items-start gap-2.5">
              <XCircle size={15} className="text-white mt-0.5 shrink-0" />
              <p className="text-sm text-white">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-1.5">Email</label>
              <input type="email" placeholder="instructor@ua.edu.ph"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-white/10 text-sm bg-white/5 placeholder:text-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-white/10 text-sm bg-white/5 placeholder:text-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-colors" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="mt-1 w-full py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <RefreshCw size={16} className="animate-spin" />}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

function AdminDashboard({ events, setEvents, onLogout }: { events: EventConfig[]; setEvents: (e: EventConfig[]) => void; onLogout: () => void }) {
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [searchStudents, setSearchStudents] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");

  const [eventForm, setEventForm] = useState({ name: "", timeIn: "", lateThreshold: "", timeOut: "" });
  const [createdEvent, setCreatedEvent] = useState<EventConfig | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [selectedScanSession, setSelectedScanSession] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<{ name: string; id: string; time: string; status: "success" | "duplicate" | "invalid" }[]>([]);

  const [reportSession, setReportSession] = useState(events[0]?.id ?? "");
  const [reportSectionFilter, setReportSectionFilter] = useState("");
  const [reportDateFilter, setReportDateFilter] = useState("");

  const activeSession = MOCK_SESSIONS.find(s => s.status === "active");

  const tabs: { id: AdminTab; label: string; icon: ReactNode }[] = [
    { id: "dashboard",      label: "Dashboard",      icon: <BarChart3 size={15} /> },
    { id: "students",       label: "Students",       icon: <Users size={15} /> },
    { id: "create-event",   label: "Create Event",   icon: <Plus size={15} /> },
    { id: "scanner",        label: "Scanner",        icon: <Scan size={15} /> },
    { id: "reports",        label: "Reports",        icon: <FileText size={15} /> },
  ];

  const filteredStudents = MOCK_STUDENTS.filter(s =>
    (!searchStudents || s.name.toLowerCase().includes(searchStudents.toLowerCase()) || s.studentId.includes(searchStudents)) &&
    (!sectionFilter || s.section === sectionFilter)
  );

  const handleCreateEvent = (ev: React.FormEvent) => {
    ev.preventDefault();
    const newEvent: EventConfig = {
      id: `e-${Date.now()}`,
      name: eventForm.name,
      checkItCode: generateCheckItCode(eventForm.name),
      timeIn: eventForm.timeIn,
      lateThreshold: eventForm.lateThreshold,
      timeOut: eventForm.timeOut,
      status: "inactive",
    };
    setEvents(prev => [newEvent, ...prev]);
    setCreatedEvent(newEvent);
    setEventForm({ name: "", timeIn: "", lateThreshold: "", timeOut: "" });
    setShowEventForm(false);
  };

  const updateEventField = (id: string, field: keyof Omit<EventConfig, "id">, value: string) => {
    setEvents(prev => prev.map(event => event.id === id ? { ...event, [field]: value } : event));
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  const simulateScan = useCallback(() => {
    if (!scanning) return;
    const names = ["Maria Santos", "Juan Reyes", "Ana Cruz", "Miguel Bautista", "Sofia Ramos", "Carlos Mendoza"];
    const ids =   ["2023001321",  "2023001342", "2023001356", "2022001198",    "2023001388",  "2023001401"];
    const i = Math.floor(Math.random() * names.length);
    const statuses = ["success", "success", "success", "duplicate", "invalid"] as const;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const now = new Date();
    const t = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;
    setScanResults(prev => [{ name: names[i], id: ids[i], time: t, status }, ...prev.slice(0, 9)]);
  }, [scanning]);

  useEffect(() => {
    if (!scanning) return;
    const interval = setInterval(simulateScan, 3200);
    return () => clearInterval(interval);
  }, [scanning, simulateScan]);

  const inputCls = "w-full px-4 py-3 rounded-xl border border-[rgba(11,42,77,0.18)] text-sm bg-[var(--background)] placeholder:text-[#C0B4B8] text-[var(--card-foreground)] focus:outline-none focus:ring-2 focus:ring-[rgba(11,42,77,0.2)] focus:border-[var(--secondary)] transition-colors";
  const previewCheckItCode = generateCheckItCode(eventForm.name);

  const reportPresent = MOCK_REPORT_RECORDS.filter(r => r.status === "present").length;
  const reportLate    = MOCK_REPORT_RECORDS.filter(r => r.status === "late").length;
  const reportAbsent  = MOCK_REPORT_RECORDS.filter(r => r.status === "absent").length;
  const reportTotal   = MOCK_REPORT_RECORDS.length;

  return (
    <div className="min-h-screen page-diamond-bg flex flex-col">
      {/* Top nav */}
      <header className="bg-[var(--secondary)] px-6 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <CheckITLogo inverted size="sm" />
          <div className="w-px h-5 bg-white/20" />
          <span className="text-white/50 text-sm">Admin Portal</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-white text-xs font-semibold">Prof. Ricardo Dela Cruz</p>
            <p className="text-white/45 text-xs">CIT Department</p>
          </div>
          <button onClick={onLogout} className="flex items-center gap-1.5 text-white/55 hover:text-white text-sm transition-colors ml-2">
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-[rgba(11,42,77,0.08)] px-4 shrink-0">
        <nav className="flex overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("flex items-center gap-2 px-4 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors",
                tab === t.id ? "border-[var(--secondary)] text-[var(--secondary)]" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--card-foreground)]")}> 
              {t.icon} {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">

          {/* ── Dashboard ─────────────────────────────────────────────────── */}
          {tab === "dashboard" && (
            <motion.div key="tab-dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="max-w-6xl mx-auto px-5 py-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Present",        val: 18, icon: <CheckCircle size={18} className="text-emerald-500" />, bg: "bg-emerald-50 border-emerald-100", num: "text-emerald-700" },
                  { label: "Late",           val: 4,  icon: <Clock size={18} className="text-[#0B2A4D]" />,        bg: "bg-[#E6F4FF] border-[#A8D6FF]",     num: "text-[#0B2A4D]" },
                  { label: "Absent",         val: 8,  icon: <XCircle size={18} className="text-[#7A6268]" />,        bg: "bg-[#F8F4EF] border-[#D7D5D0]",         num: "text-[#7A6268]" },
                  { label: "Total Enrolled", val: 30, icon: <Users size={18} className="text-[var(--secondary)]" />,        bg: "bg-[var(--muted)] border-[rgba(42,132,210,0.25)]", num: "text-[var(--secondary)]" },
                ].map(s => (
                  <div key={s.label} className={cn("rounded-2xl p-4 border", s.bg)}>
                    <div className="flex items-center justify-between mb-3">{s.icon}</div>
                    <p className={cn("text-3xl font-bold", s.num)}>{s.val}</p>
                    <p className="text-xs text-gray-500 mt-0.5 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>

              {activeSession && (
                <div className="mb-6 bg-[var(--secondary)] rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-emerald-300 text-xs font-semibold uppercase tracking-wide">Active Session</span>
                      </div>
                      <h3 className="text-lg font-bold text-white">{activeSession.subject}</h3>
                      <p className="text-white/55 text-sm mt-0.5">{activeSession.section} · {activeSession.date} · {activeSession.timeStart} – {activeSession.timeEnd}</p>
                    </div>
                    <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 font-mono text-[var(--primary)] font-bold tracking-widest text-sm shrink-0">
                      {activeSession.code}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(11,42,77,0.06)] overflow-hidden">
                <div className="px-5 py-4 border-b border-[rgba(11,42,77,0.06)]">
                  <h2 className="text-sm font-bold text-[var(--card-foreground)]">Recent Sessions</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[rgba(11,42,77,0.06)]">
                        {["Code", "Section", "Event", "Date", "Time", "Status"].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(11,42,77,0.04)]">
                      {MOCK_SESSIONS.map(s => (
                        <tr key={s.id} className="hover:bg-[var(--background)] transition-colors">
                          <td className="px-5 py-3.5 font-mono text-xs text-[var(--secondary)] font-semibold">{s.code}</td>
                          <td className="px-5 py-3.5 text-[#1A080E] font-medium">{s.section}</td>
                          <td className="px-5 py-3.5 text-[#1A080E]">{s.subject}</td>
                          <td className="px-5 py-3.5 text-[#7A6268]">{s.date}</td>
                          <td className="px-5 py-3.5 text-[#7A6268] font-mono text-xs">{s.timeStart}</td>
                          <td className="px-5 py-3.5"><StatusBadge status={s.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Students ──────────────────────────────────────────────────── */}
          {tab === "students" && (
            <motion.div key="tab-students" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="max-w-6xl mx-auto px-5 py-6">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <h2 className="text-lg font-bold text-[#1A080E]">Registered Students</h2>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6268]" />
                    <input type="text" placeholder="Search by name or ID…"
                      value={searchStudents} onChange={e => setSearchStudents(e.target.value)}
                      className="pl-8 pr-4 py-2 text-sm border border-[rgba(11,42,77,0.18)] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[rgba(11,42,77,0.2)] focus:border-[var(--secondary)] w-52 text-[var(--card-foreground)]" />
                  </div>
                  <select value={sectionFilter} onChange={e => setSectionFilter(e.target.value)}
                    className="px-3 py-2 text-sm border border-[rgba(11,42,77,0.18)] rounded-xl bg-white focus:outline-none text-[var(--card-foreground)]">
                    <option value="">All Sections</option>
                    {["BSIT 3A", "BSIT 3B", "BSIT 2A"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(11,42,77,0.06)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[rgba(11,42,77,0.06)]">
                        {["Name", "Student ID", "Section", "Email", "Status", "Registered"].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(11,42,77,0.04)]">
                      {filteredStudents.map(s => (
                        <tr key={s.studentId} className="hover:bg-[var(--background)] transition-colors">
                          <td className="px-5 py-3.5 font-semibold text-[#1A080E]">{s.name}</td>
                          <td className="px-5 py-3.5 font-mono text-xs text-[var(--secondary)] font-semibold">{s.studentId}</td>
                          <td className="px-5 py-3.5 text-[#7A6268]">{s.section}</td>
                          <td className="px-5 py-3.5 text-[#7A6268] text-xs">{s.email}</td>
                          <td className="px-5 py-3.5">
                            <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold",
                              s.registered ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-50 text-gray-400 border border-gray-200")}>
                              {s.registered ? "Registered" : "Pending"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-[#7A6268] text-xs">{s.registeredAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredStudents.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-14 text-[#7A6268]">
                      <Users size={32} className="mb-2 opacity-25" />
                      <p className="text-sm">No students match your search</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Create Event ────────────────────────────────────────────── */}
          {tab === "create-event" && (
            <motion.div key="tab-create-event" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="max-w-6xl mx-auto px-5 py-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--secondary)] mb-3">
                    Events · {events.length} scheduled
                  </div>
                  <h2 className="text-lg font-bold text-[#1A080E]">Create Event</h2>
                  <p className="text-sm text-[#7A6268] mt-1">Manage existing events and add new ones from here.</p>
                </div>
                <button type="button" onClick={() => { setShowEventForm(true); setCreatedEvent(null); }}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--secondary)] px-4 py-3 text-sm font-semibold text-white hover:bg-[rgba(11,42,77,0.85)] transition-colors">
                  <Plus size={16} /> Add Event
                </button>
              </div>

              <div className="grid gap-6">
                <div className="bg-[var(--background)] rounded-2xl border border-[rgba(11,42,77,0.12)] shadow-[0_2px_18px_rgba(11,42,77,0.06)] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[rgba(11,42,77,0.08)] bg-[var(--background)]">
                    <h3 className="text-sm font-bold text-[#1A080E]">Events</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[rgba(11,42,77,0.06)]">
                          {[
                            "Event Name",
                            "Time In",
                            "Late Threshold",
                            "Time Out",
                            "Status",
                          ].map(h => (
                            <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#7A6268] uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgba(11,42,77,0.04)]">
                        {events.map(event => (
                          <tr key={event.id} className="hover:bg-[var(--background)] transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="space-y-2">
                                <input type="text" value={event.name}
                                  onChange={e => updateEventField(event.id, "name", e.target.value)}
                                  className="w-full px-3 py-2 rounded-xl border border-[rgba(11,42,77,0.18)] text-sm bg-[var(--background)] text-[var(--card-foreground)] focus:outline-none focus:ring-2 focus:ring-[rgba(11,42,77,0.2)] focus:border-[var(--secondary)] transition-colors" />
                                <div className="flex flex-wrap items-center gap-2">
                                  <div className="rounded-full bg-[var(--muted)] px-3 py-2 text-xs font-mono font-semibold text-[var(--secondary)] inline-flex items-center gap-2">
                                    <Hash size={14} /> {event.checkItCode}
                                  </div>
                                  <button type="button" onClick={() => handleCopyCode(event.checkItCode)}
                                    className="inline-flex items-center gap-1 rounded-full border border-[rgba(11,42,77,0.2)] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[var(--secondary)] hover:bg-[var(--background)] transition-colors">
                                    {copiedCode === event.checkItCode ? <Check size={12} /> : <Copy size={12} />}
                                    {copiedCode === event.checkItCode ? "Copied" : "Copy"}
                                  </button>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <input type="time" value={event.timeIn}
                                onChange={e => updateEventField(event.id, "timeIn", e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-[rgba(11,42,77,0.18)] text-sm bg-[var(--background)] text-[var(--card-foreground)] focus:outline-none focus:ring-2 focus:ring-[rgba(11,42,77,0.2)] focus:border-[var(--secondary)] transition-colors" />
                            </td>
                            <td className="px-5 py-3.5">
                              <input type="time" value={event.lateThreshold}
                                onChange={e => updateEventField(event.id, "lateThreshold", e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-[rgba(11,42,77,0.18)] text-sm bg-[var(--background)] text-[var(--card-foreground)] focus:outline-none focus:ring-2 focus:ring-[rgba(11,42,77,0.2)] focus:border-[var(--secondary)] transition-colors" />
                            </td>
                            <td className="px-5 py-3.5">
                              <input type="time" value={event.timeOut}
                                onChange={e => updateEventField(event.id, "timeOut", e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-[rgba(11,42,77,0.18)] text-sm bg-[var(--background)] text-[var(--card-foreground)] focus:outline-none focus:ring-2 focus:ring-[rgba(11,42,77,0.2)] focus:border-[var(--secondary)] transition-colors" />
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex flex-col items-start gap-2">
                                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${event.status === "active"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-[rgba(11,42,77,0.12)] bg-[var(--background)] text-[var(--muted-foreground)]"}`}>
                                  <span className={`h-2 w-2 rounded-full ${event.status === "active" ? "bg-emerald-500" : "bg-[#C8B6B9]"}`} />
                                  {event.status === "active" ? "Active" : "Inactive"}
                                </span>
                                <button type="button"
                                  onClick={() => updateEventField(event.id, "status", event.status === "active" ? "inactive" : "active")}
                                  className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${event.status === "active"
                                    ? "bg-[#E6F4FF] text-[#0B2A4D] hover:bg-[#D1E8FF]"
                                    : "bg-[#0B2A4D] text-white hover:bg-[#174E7A]"}`}>
                                  {event.status === "active" ? "Deactivate" : "Activate"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {createdEvent && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-[var(--background)] rounded-2xl border border-[rgba(11,42,77,0.12)] shadow-[0_2px_18px_rgba(11,42,77,0.06)] p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                        <CheckCircle size={22} className="text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[var(--card-foreground)]">Event Added</h3>
                          <p className="text-sm text-[var(--muted-foreground)]">{createdEvent.name}</p>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-[var(--background)] p-4">
                        <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] mb-1">Time In</p>
                        <p className="text-sm font-semibold text-[var(--card-foreground)]">{createdEvent.timeIn}</p>
                      </div>
                      <div className="rounded-xl bg-[var(--background)] p-4">
                        <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] mb-1">Late Threshold</p>
                        <p className="text-sm font-semibold text-[var(--card-foreground)]">{createdEvent.lateThreshold}</p>
                      </div>
                      <div className="rounded-xl bg-[var(--background)] p-4">
                        <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] mb-1">Time Out</p>
                        <p className="text-sm font-semibold text-[var(--card-foreground)]">{createdEvent.timeOut}</p>
                      </div>
                      <div className="rounded-xl bg-[#F8F4EF] p-4">
                        <p className="text-xs uppercase tracking-wide text-[#7A6268] mb-1">Status</p>
                        <p className="text-sm font-semibold text-[#1A080E]">{createdEvent.status === "active" ? "Active" : "Inactive"}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {showEventForm && (
                  <div className="bg-[var(--background)] rounded-2xl border border-[rgba(11,42,77,0.12)] shadow-[0_2px_18px_rgba(11,42,77,0.06)] p-6">
                    <form onSubmit={handleCreateEvent} className="flex flex-col gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[var(--card-foreground)] mb-1.5">Event Name / Theme</label>
                        <input type="text" placeholder="e.g., Software Engineering Orientation"
                          value={eventForm.name} onChange={e => setEventForm({ ...eventForm, name: e.target.value })}
                          required className={inputCls} />
                        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-2 text-xs font-semibold text-[var(--secondary)]">
                          <Hash size={13} /> Preview CheckIT Code: {previewCheckItCode}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-[#1A080E] mb-1.5">Time In</label>
                          <input type="time" value={eventForm.timeIn}
                            onChange={e => setEventForm({ ...eventForm, timeIn: e.target.value })}
                            required className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#1A080E] mb-1.5">Late Threshold</label>
                          <input type="time" value={eventForm.lateThreshold}
                            onChange={e => setEventForm({ ...eventForm, lateThreshold: e.target.value })}
                            required className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#1A080E] mb-1.5">Time Out</label>
                          <input type="time" value={eventForm.timeOut}
                            onChange={e => setEventForm({ ...eventForm, timeOut: e.target.value })}
                            required className={inputCls} />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button type="submit"
                          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[var(--secondary)] px-4 py-3 text-sm font-semibold text-white hover:bg-[rgba(11,42,77,0.85)] transition-colors">
                          <Plus size={16} /> Create Event
                        </button>
                        <button type="button" onClick={() => { setShowEventForm(false); setEventForm({ name: "", timeIn: "", lateThreshold: "", timeOut: "" }); }}
                          className="mt-2 inline-flex items-center justify-center rounded-xl border border-[rgba(11,42,77,0.2)] bg-white px-4 py-3 text-sm font-semibold text-[var(--card-foreground)] hover:bg-[var(--background)] transition-colors">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Scanner ───────────────────────────────────────────────────── */}
          {tab === "scanner" && (
            <motion.div key="tab-scanner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="max-w-5xl mx-auto px-5 py-6">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <h2 className="text-lg font-bold text-[#1A080E]">QR Scanner</h2>
                <div className="flex items-center gap-3 flex-wrap">
                  <select value={selectedScanSession}
                    onChange={e => { setSelectedScanSession(e.target.value); setScanning(false); setScanResults([]); }}
                    className="px-3 py-2 text-sm border border-[rgba(11,42,77,0.18)] rounded-xl bg-white focus:outline-none text-[var(--card-foreground)] max-w-xs">
                    <option value="">Select a session…</option>
                    {MOCK_SESSIONS.map(s => (
                      <option key={s.id} value={s.id}>{s.code} — {s.subject} ({s.section})</option>
                    ))}
                  </select>
                  <button
                    onClick={() => { if (!selectedScanSession) return; setScanning(!scanning); if (scanning) setScanResults([]); }}
                    disabled={!selectedScanSession}
                    className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-40",
                      scanning ? "bg-[#E6F4FF] border border-[#A8D6FF] text-[#0B2A4D] hover:bg-[#D1E8FF]" : "bg-[var(--secondary)] text-white hover:bg-[rgba(11,42,77,0.85)]")}>
                    {scanning ? <><X size={14} /> Stop Scanning</> : <><Scan size={14} /> Start Scanning</>}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Camera view */}
                <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(11,42,77,0.06)] overflow-hidden">
                  <div className="aspect-square relative bg-gray-900 flex items-center justify-center">
                    {scanning ? (
                      <>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative w-52 h-52">
                            {[["top-0 left-0 border-t-[3px] border-l-[3px]", "rounded-tl-lg"],
                              ["top-0 right-0 border-t-[3px] border-r-[3px]", "rounded-tr-lg"],
                              ["bottom-0 left-0 border-b-[3px] border-l-[3px]", "rounded-bl-lg"],
                              ["bottom-0 right-0 border-b-[3px] border-r-[3px]", "rounded-br-lg"]].map(([pos, rnd], i) => (
                              <div key={i} className={cn("absolute w-9 h-9 border-[#2A84D2]", pos, rnd)} />
                            ))}
                            <motion.div
                              className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-[#2A84D2] to-transparent opacity-80"
                              animate={{ top: ["8%", "92%", "8%"] }}
                              transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                            />
                          </div>
                        </div>
                        <div className="absolute bottom-4 left-0 right-0 text-center">
                          <span className="text-white/60 text-xs bg-black/50 px-3 py-1 rounded-full">Scanning active</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-white/25">
                        <Camera size={44} />
                        <p className="text-sm">{selectedScanSession ? "Press Start Scanning" : "Select a session first"}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scan feed */}
                <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(11,42,77,0.06)] flex flex-col overflow-hidden">
                  <div className="px-5 py-4 border-b border-[rgba(42,132,210,0.08)] flex items-center justify-between shrink-0">
                    <h3 className="text-sm font-bold text-[#1A080E]">Scan Feed</h3>
                    {scanning && <span className="text-xs text-[#7A6268] font-mono">{scanResults.length} scanned</span>}
                  </div>
                  <div className="flex-1 overflow-y-auto" style={{ maxHeight: "360px" }}>
                    {scanResults.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-40 text-[#7A6268]">
                        <Scan size={28} className="mb-2 opacity-20" />
                        <p className="text-xs">No scans yet</p>
                      </div>
                    ) : (
                      <AnimatePresence>
                        {scanResults.map((r, i) => (
                          <motion.div key={`${r.id}-${r.time}-${i}`}
                            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 px-5 py-3.5 border-b border-[rgba(42,132,210,0.08)] last:border-0 hover:bg-[#EAF4FF]">
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                              r.status === "success" ? "bg-emerald-100" : r.status === "duplicate" ? "bg-[#E6F4FF]" : "bg-[#F8F4EF]")}>
                              {r.status === "success"
                                ? <Check size={14} className="text-emerald-600" />
                                : r.status === "duplicate"
                                  ? <Clock size={14} className="text-[#0B2A4D]" />
                                  : <X size={14} className="text-[#7A6268]" />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#1A080E] truncate">{r.name}</p>
                              <p className="text-xs text-[#7A6268] font-mono">{r.id}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className={cn("text-xs font-semibold",
                                r.status === "success" ? "text-emerald-600" : r.status === "duplicate" ? "text-[#0B2A4D]" : "text-[#7A6268]")}>
                                {r.status === "success" ? "Present" : r.status === "duplicate" ? "Duplicate" : "Invalid"}
                              </span>
                              <p className="text-xs text-[#B8ADB2] font-mono mt-0.5">{r.time}</p>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Reports ───────────────────────────────────────────────────── */}
          {tab === "reports" && (() => {
            // All unique sections for the filter dropdown
            const allSections = Array.from(new Set(MOCK_REPORT_RECORDS.map(r => r.section))).sort();

            // Apply section and date filters
            const filteredRecords = MOCK_REPORT_RECORDS.filter(r =>
              (!reportSectionFilter || r.section === reportSectionFilter) &&
              (!reportDateFilter || r.date === reportDateFilter)
            );

            // Group filtered records by section
            const grouped = filteredRecords.reduce<Record<string, typeof MOCK_REPORT_RECORDS>>((acc, r) => {
              (acc[r.section] = acc[r.section] ?? []).push(r);
              return acc;
            }, {});
            const sortedSections = Object.keys(grouped).sort();

            const fTotal   = filteredRecords.length;
            const fPresent = filteredRecords.filter(r => r.status === "present").length;
            const fLate    = filteredRecords.filter(r => r.status === "late").length;
            const fAbsent  = filteredRecords.filter(r => r.status === "absent").length;
            const selectedEvent = events.find(event => event.id === reportSession) ?? events[0] ?? null;

            return (
              <motion.div key="tab-reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="max-w-6xl mx-auto px-5 py-6">

                {/* Header */}
                <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-[#1A080E]">Attendance Reports</h2>
                    <p className="text-xs text-[#7A6268] mt-0.5">
                      {reportSectionFilter
                        ? <>Filtered: <span className="font-semibold text-[#0B2A4D]">{reportSectionFilter}</span> · {fTotal} student{fTotal !== 1 ? "s" : ""}</>
                        : <>All sections · {sortedSections.length} group{sortedSections.length !== 1 ? "s" : ""}</>
                      }
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Event picker */}
                    <select value={reportSession} onChange={e => setReportSession(e.target.value)}
                      className="px-3 py-2 text-sm border border-[rgba(42,132,210,0.18)] rounded-xl bg-white focus:outline-none text-[#1A080E]">
                      {events.map(event => (
                        <option key={event.id} value={event.id}>{event.checkItCode} · {event.name}</option>
                      ))}
                    </select>

                    {/* Section filter */}
                    <div className="relative">
                      <select value={reportSectionFilter} onChange={e => setReportSectionFilter(e.target.value)}
                        className={cn(
                          "pl-3 pr-8 py-2 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2A84D2]/20 focus:border-[#2A84D2] transition-colors appearance-none",
                          reportSectionFilter
                            ? "border-[#2A84D2] text-[#0B2A4D] font-semibold bg-[#E6F4FF]"
                            : "border-[rgba(42,132,210,0.18)] text-[#1A080E]"
                        )}>
                        <option value="">All Sections</option>
                        {allSections.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {/* chevron icon */}
                      <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 4l4 4 4-4" stroke={reportSectionFilter ? "#2A84D2" : "#7A6268"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>

                    {/* Date filter */}
                    <input type="date" value={reportDateFilter} onChange={e => setReportDateFilter(e.target.value)}
                      className="px-3 py-2 text-sm border border-[rgba(42,132,210,0.18)] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2A84D2]/20 focus:border-[#2A84D2] transition-colors text-[#1A080E]" />

                    {/* Clear filter */}
                    <AnimatePresence>
                      {reportSectionFilter && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
                          onClick={() => setReportSectionFilter("")}
                          className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-[#0B2A4D] border border-[rgba(42,132,210,0.25)] rounded-xl hover:bg-[#E6F4FF] transition-colors">
                          <X size={11} /> Clear filter
                        </motion.button>
                      )}
                    </AnimatePresence>

                    {/* Export */}
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#0B2A4D] text-white text-sm font-semibold rounded-xl hover:bg-[#174E7A] transition-colors">
                      <Download size={14} />
                      {reportSectionFilter ? `Export ${reportSectionFilter}` : "Export All"}
                    </button>
                  </div>
                </div>

                {/* Active filter pill */}
                <AnimatePresence>
                  {reportSectionFilter && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="mb-5 overflow-hidden">
                      <div className="flex items-center gap-2 p-3 bg-[#E6F4FF] border border-[rgba(42,132,210,0.24)] rounded-xl">
                        <Info size={13} className="text-[#2A84D2] shrink-0" />
                        <p className="text-xs text-[#0B2A4D]">
                          Showing <span className="font-bold">{reportSectionFilter}</span> only.
                          Export will include only these {fTotal} students.
                        </p>
                        <button onClick={() => setReportSectionFilter("")}
                          className="ml-auto text-xs text-[#0B2A4D] font-semibold hover:underline">
                          Show all
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Summary cards — reflect filtered data */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "Present", val: fPresent, pct: fTotal ? Math.round(fPresent / fTotal * 100) : 0, color: "#10b981" },
                    { label: "Late",    val: fLate,    pct: fTotal ? Math.round(fLate / fTotal * 100)    : 0, color: "#2A84D2" },
                    { label: "Absent",  val: fAbsent,  pct: fTotal ? Math.round(fAbsent / fTotal * 100)  : 0, color: "#7A6268" },
                  ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(42,132,210,0.08)] p-5">
                      <div className="flex items-end justify-between mb-2">
                        <span className="text-3xl font-bold text-[#1A080E]">{s.val}</span>
                        <span className="text-sm font-semibold" style={{ color: s.color }}>{s.pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                        <div className="h-full rounded-full transition-all" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                      </div>
                      <p className="text-xs text-[#7A6268] font-medium">
                        {s.label} · {reportSectionFilter || "All sections"}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Per-section grouped tables */}
                {sortedSections.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(11,42,77,0.06)] flex flex-col items-center justify-center py-16 text-[var(--muted-foreground)]">
                    <Users size={32} className="mb-2 opacity-20" />
                    <p className="text-sm">No records for this section</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5">
                    {sortedSections.map(section => {
                      const rows = grouped[section];
                      const p = rows.filter(r => r.status === "present").length;
                      const l = rows.filter(r => r.status === "late").length;
                      const a = rows.filter(r => r.status === "absent").length;
                      return (
                        <div key={section} className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(107,26,42,0.06)] overflow-hidden">
                          {/* Section header */}
                          <div className="px-5 py-3.5 bg-[var(--secondary)] flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                                <Users size={13} className="text-[var(--primary)]" />
                              </div>
                              <span className="font-bold text-white text-sm">{section}</span>
                              <span className="text-white/45 text-xs font-mono">— {rows.length} student{rows.length !== 1 ? "s" : ""}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-semibold">
                              <span className="text-emerald-300">{p} Present</span>
                              <span className="text-white/30">·</span>
                              <span className="text-[#A8D6FF]">{l} Late</span>
                              <span className="text-white/30">·</span>
                              <span className="text-[#7A6268]">{a} Absent</span>
                            </div>
                          </div>

                          {/* Rows */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-[rgba(42,132,210,0.08)] bg-[#EAF4FF]">
                                  {["#", "Student Name", "Student ID", "Time In", "Time Out", "Status"].map(h => (
                                    <th key={h} className="px-5 py-2.5 text-left text-xs font-semibold text-[#7A6268] uppercase tracking-wide">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[rgba(42,132,210,0.08)]">
                                {rows.map((r, idx) => (
                                  <tr key={r.studentId} className="hover:bg-[#EAF4FF] transition-colors">
                                    <td className="px-5 py-3.5 text-xs text-[#B8ADB2] font-mono w-10">{idx + 1}</td>
                                    <td className="px-5 py-3.5 font-semibold text-[#1A080E]">{r.name}</td>
                                    <td className="px-5 py-3.5 font-mono text-xs text-[#0B2A4D] font-semibold">{r.studentId}</td>
                                    <td className="px-5 py-3.5 text-[#7A6268] font-mono text-xs">{r.timeIn}</td>
                                    <td className="px-5 py-3.5 text-[#7A6268] font-mono text-xs">{selectedEvent?.timeOut || "—"}</td>
                                    <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })()}

        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<View>("landing");
  const [student, setStudent] = useState<Student | null>(null);
  const [studentEmail, setStudentEmail] = useState("");
  const [sessionCode, setSessionCode] = useState("");
  const [events, setEvents] = useState<EventConfig[]>(MOCK_EVENTS);

  const goto = (v: View) => setView(v);

  return (
    <div className="w-full min-h-screen bg-black" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {view === "landing" && (
        <LandingPage onStudent={() => goto("student-auth")} onAdmin={() => goto("admin-login")} />
      )}

      {view === "student-auth" && (
        <StudentAuthGate
          onSuccess={email => {
            setStudentEmail(email);
            if (!student) goto("student-register");
            else goto("student-activation");
          }}
          onBack={() => goto("landing")}
        />
      )}

      {view === "student-register" && (
        <StudentRegistration
          email={studentEmail}
          onSubmit={s => { setStudent(s); goto("student-activation"); }}
          onBack={() => goto("student-auth")}
        />
      )}

      {view === "student-activation" && student && (
        <BrowserActivation student={student} hasConflict={false} onActivate={() => goto("student-session-code")} onCancel={() => goto("student-auth")} />
      )}

      {view === "student-device-conflict" && student && (
        <BrowserActivation student={student} hasConflict={true} onActivate={() => goto("student-session-code")} onCancel={() => goto("student-auth")} />
      )}

      {view === "student-session-code" && student && (
        <SessionCodeEntry
          student={student}
          events={events}
          onSubmit={code => { setSessionCode(code); goto("student-qr-pass"); }}
          onViewHistory={() => goto("student-dashboard")}
          onLogout={() => { setStudent(null); goto("landing"); }}
        />
      )}

      {view === "student-qr-pass" && student && (
        <QRPassGenerator student={student} sessionCode={sessionCode} onBack={() => goto("student-session-code")} onLogout={() => { setStudent(null); goto("landing"); }} />
      )}

      {view === "student-dashboard" && student && (
        <StudentDashboard student={student} onBack={() => goto("student-session-code")} onLogout={() => { setStudent(null); goto("landing"); }} />
      )}

      {view === "admin-login" && (
        <AdminLogin onSuccess={() => goto("admin-dashboard")} onBack={() => goto("landing")} />
      )}

      {view === "admin-dashboard" && (
        <AdminDashboard events={events} setEvents={setEvents} onLogout={() => goto("landing")} />
      )}
    </div>
  );
}
