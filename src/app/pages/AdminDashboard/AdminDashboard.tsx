import { useEffect, useState } from "react";
import { LogOut, LayoutDashboard, Users, ScanLine, FileText, CalendarCheck2 } from "lucide-react";
import CheckITLogo from "../../components/shared/CheckITLogo";
import DashboardTab from "./tabs/DashboardTab";
import StudentsTab from "./tabs/StudentsTab";
import CreateEventTab from "./tabs/CreateEventTab";
import ScannerTab from "./tabs/ScannerTab";
import ReportsTab from "./tabs/ReportsTab";
import { cn } from "../../lib/utils";
import type { AdminTab, EventConfig } from "../../types";
import { useStore, useSelectors } from "../../state/store";
import { fetchEvents } from "../../services/events";
import { fetchStudents } from "../../services/students";
import { fetchAttendance } from "../../services/attendance";
import AnimatedBackground from "../../components/common/AnimatedBackground";

export default function AdminDashboard({ onLogout }: {
  onLogout: () => void;
}) {
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const { state, dispatch } = useStore();
  const selectors = useSelectors();
  const events = state.events;

  useEffect(() => {
    const token = localStorage.getItem('checkit_admin_token');
    if (!token) return;

    let mounted = true;
    (async () => {
      try {
        const [eventsData, studentsData, attendanceData] = await Promise.all([
          fetchEvents(),
          fetchStudents(),
          fetchAttendance(),
        ]);
        if (!mounted) return;
        dispatch({ type: 'INIT_LOAD', payload: { students: studentsData, events: eventsData, attendance: attendanceData } });
      } catch (error) {
        console.error('Failed to load admin backend data', error);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen landing-page-black relative overflow-hidden">
      <AnimatedBackground />
      <div className="absolute inset-0 opacity-0 pointer-events-none" />
      <header className="bg-[var(--secondary)] px-5 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-4">
          <CheckITLogo inverted size="sm" />
          <div className="w-px h-5 bg-white/20 hidden sm:block" />
          <span className="text-white/50 font-semibold text-sm hidden sm:block">Admin Portal</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1.5 mr-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-white/55">System Online</span>
          </div>
          <button onClick={onLogout} className="flex items-center gap-1.5 text-white/55 hover:text-white text-sm transition-colors">
            <LogOut size={14} /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <div className="relative z-20 border-b border-slate-200 bg-slate-200 px-2 sm:px-5 overflow-x-auto hide-scrollbar sticky top-[61px]">
        <div className="flex items-center min-w-max">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "students", label: "Students", icon: Users },
            { id: "create-event", label: "Events", icon: CalendarCheck2 },
            { id: "scanner", label: "Scanner", icon: ScanLine },
            { id: "reports", label: "Reports", icon: FileText }
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as AdminTab)}
              className={cn(
                "flex items-center gap-2 px-4 py-4 text-sm font-semibold border-b-2 transition-colors",
                tab === t.id ? "border-[var(--primary)] text-[var(--primary)]" : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              )}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pt-6 sm:pt-10">
        <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {tab === "dashboard" && <DashboardTab />}
            {tab === "students" && <StudentsTab />}
            {tab === "create-event" && <CreateEventTab />}
            {tab === "scanner" && <ScannerTab events={events} />}
            {tab === "reports" && <ReportsTab events={events} />}
          </div>
        </div>
      </div>
    </div>
  );
}
