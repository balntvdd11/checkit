import { useState } from "react";
import { motion } from "motion/react";
import { RefreshCw, Smartphone, GraduationCap, CheckCircle2, History, AlertCircle } from "lucide-react";
import COAccessLogo from "../../components/shared/COAccessLogo";
import StatusBadge from "../../components/shared/StatusBadge";
import Card from "../../components/shared/Card";
import type { Student, AttendanceRecord } from "../../types";
import { useStore, useSelectors } from "../../state/store";
import { fetchAttendance } from "../../services/attendance";
import { cn, formatTime12Hour } from "../../lib/utils";
import AnimatedBackground from "../../components/common/AnimatedBackground";
import DeveloperFooter from "../../components/shared/DeveloperFooter";

// ─── Student Dashboard (History / Devices) ────────────────────────────────────

export default function StudentDashboard({ student, onLogout, onGeneratePass }: {
  student: Student; onLogout?: () => void; onGeneratePass: () => void;
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { dispatch } = useStore();
  const { attendance } = useSelectors();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const attendanceData = await fetchAttendance();
      dispatch({ type: 'SET_ATTENDANCE', payload: attendanceData });
    } catch (error) {
      console.error('Failed to refresh attendance data', error);
      window.location.reload();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  const initials = getInitials(student.name);
  const studentAttendance = attendance.filter(a => a.studentId === student.studentId || a.email === student.email);

  const presentCount = studentAttendance.filter(r => r.status === "present").length;
  const lateCount = studentAttendance.filter(r => r.status === "late").length;
  const absentCount = studentAttendance.filter(r => r.status === "absent").length;

  return (
    <div className="min-h-[100dvh] pb-[180px] sm:pb-[220px] landing-page-black relative overflow-hidden">
      <AnimatedBackground />
      <div className="absolute inset-0 opacity-0 pointer-events-none" />
      <header className="bg-[var(--secondary)] px-5 py-3.5 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-4">
          <COAccessLogo inverted size="sm" />
          <div className="w-px h-5 bg-white/20" />
          <span className="text-white/50 text-sm">Student Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleRefresh} disabled={isRefreshing} className="flex items-center gap-1.5 text-white/55 hover:text-white text-sm transition-colors">
            <RefreshCw size={14} className={cn(isRefreshing && "animate-spin")} /> {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto p-2 sm:p-4 md:p-6 lg:p-8 pt-4 sm:pt-10">
        <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 md:p-10 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-[var(--primary)] font-bold text-2xl">{initials}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{student.name}</h1>
              <p className="text-sm text-white/70 mt-0.5">{student.studentId} · {student.section}</p>
            </div>
          </div>
          <button onClick={onGeneratePass}
            className="w-full sm:w-auto px-5 py-2.5 bg-[var(--secondary)] hover:bg-[rgba(11,42,77,0.85)] text-white font-semibold rounded-xl transition-colors shadow-sm whitespace-nowrap">
            Generate QR Pass
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl sm:rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{presentCount}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Present</p>
          </div>
          <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl sm:rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-amber-700">{lateCount}</p>
            <p className="text-xs text-amber-600 font-medium mt-0.5">Late</p>
          </div>
          <div className="bg-rose-50/70 border border-rose-200/60 rounded-xl sm:rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-rose-700">{absentCount}</p>
            <p className="text-xs text-rose-600 font-medium mt-0.5">Absent</p>
          </div>
        </div>

        {/* Device Info */}
        <div className="bg-[#0b2a4d] border border-blue-900/40 rounded-2xl p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/60 flex items-center justify-center text-blue-200">
              <Smartphone size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Registered Device</p>
              <p className="text-xs text-blue-200/70">{student.deviceOS || "Primary Device"}</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
            Locked
          </span>
        </div>

        {/* Attendance History */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <History size={18} className="text-white" /> Attendance History
          </h2>

          {studentAttendance.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl">
              <AlertCircle size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-500 font-medium">No attendance records yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {studentAttendance.map((rec) => (
                <div key={rec.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/70 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{rec.eventName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{rec.date} · {formatTime12Hour(rec.timestamp)}</p>
                  </div>
                  <StatusBadge status={rec.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
      <DeveloperFooter />
    </div>
  );
}
