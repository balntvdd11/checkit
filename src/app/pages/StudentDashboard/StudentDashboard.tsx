import { motion } from "motion/react";
import { LogOut, RefreshCw, Smartphone, GraduationCap, CheckCircle2, History, AlertCircle } from "lucide-react";
import COAccessLogo from "../../components/shared/COAccessLogo";
import StatusBadge from "../../components/shared/StatusBadge";
import Card from "../../components/shared/Card";
import type { Student, AttendanceRecord } from "../../types";
import { useSelectors } from "../../state/store";
import { formatTime12Hour } from "../../lib/utils";
import AnimatedBackground from "../../components/common/AnimatedBackground";
import DeveloperFooter from "../../components/shared/DeveloperFooter";

// ─── Student Dashboard (History / Devices) ────────────────────────────────────

export default function StudentDashboard({ student, onLogout, onGeneratePass }: {
  student: Student; onLogout: () => void; onGeneratePass: () => void;
}) {
  const getInitials = (name: string) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  const initials = getInitials(student.name);
  const { attendance } = useSelectors();
  const studentAttendance = attendance.filter(a => a.studentId === student.studentId || a.email === student.email);

  const presentCount = studentAttendance.filter(r => r.status === "present").length;
  const lateCount = studentAttendance.filter(r => r.status === "late").length;
  const absentCount = studentAttendance.filter(r => r.status === "absent").length;

  return (
    <div className="min-h-screen pb-[180px] sm:pb-[220px] landing-page-black relative overflow-hidden">
      <AnimatedBackground />
      <div className="absolute inset-0 opacity-0 pointer-events-none" />
      <header className="bg-[var(--secondary)] px-5 py-3.5 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-4">
          <COAccessLogo inverted size="sm" />
          <div className="w-px h-5 bg-white/20" />
          <span className="text-white/50 text-sm">Student Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onLogout} className="flex items-center gap-1.5 text-white/55 hover:text-white text-sm transition-colors">
            <LogOut size={14} /> Sign out
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-5 border border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
              <CheckCircle2 size={20} className="text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-[var(--card-foreground)]">{presentCount}</p>
            <p className="text-xs text-slate-500 font-medium">Present</p>
          </Card>
          <Card className="p-5 border border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mb-2">
              <AlertCircle size={20} className="text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-[var(--card-foreground)]">{lateCount}</p>
            <p className="text-xs text-slate-500 font-medium">Late</p>
          </Card>
          <Card className="p-5 border border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center mb-2">
              <AlertCircle size={20} className="text-rose-600" />
            </div>
            <p className="text-2xl font-bold text-[var(--card-foreground)]">{absentCount}</p>
            <p className="text-xs text-slate-500 font-medium">Absent</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <History size={18} className="text-[var(--primary)]" /> Recent Attendance
            </h2>
            <Card className="border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/50 text-[var(--muted-foreground)] font-semibold border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-4 whitespace-nowrap">Date</th>
                      <th className="px-5 py-4">Event</th>
                      <th className="px-5 py-4">Time In</th>
                      <th className="px-5 py-4">Time Out</th>
                      <th className="px-5 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {studentAttendance.map((record, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap text-slate-600">{record.date}</td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-700">{record.subject}</p>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">{record.EVENTSCode}</p>
                        </td>
                        <td className="px-5 py-4 font-mono text-slate-600">{formatTime12Hour(record.timeIn)}</td>
                        <td className="px-5 py-4 font-mono text-slate-600">{record.timeOut ? formatTime12Hour(record.timeOut) : "—"}</td>
                        <td className="px-5 py-4"><StatusBadge status={record.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Smartphone size={18} className="text-[var(--primary)]" /> Authorized Device
            </h2>
            <Card className="p-6 border border-slate-100">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Smartphone size={22} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--card-foreground)] text-sm">Current Device</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">This device is authorized to generate QR passes.</p>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 mb-5">
                <p className="text-xs text-slate-500 flex justify-between mb-1.5">
                  <span>Activated on:</span><span className="font-medium text-slate-700">Jul 1, 2025</span>
                </p>
                <p className="text-xs text-slate-500 flex justify-between">
                  <span>Browser:</span><span className="font-medium text-slate-700">Chrome (Windows)</span>
                </p>
              </div>

            </Card>
          </div>
        </div>
        </div>
      </div>
      <DeveloperFooter />
      </div>
  );
}
