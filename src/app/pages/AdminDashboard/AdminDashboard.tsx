import { useEffect, useState } from "react";
import { LogOut, LayoutDashboard, Users, ScanLine, FileText, CalendarCheck2, RefreshCw } from "lucide-react";
import COAccessLogo from "../../components/shared/COAccessLogo";
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
import DeveloperFooter from "../../components/shared/DeveloperFooter";

export default function AdminDashboard({ onLogout }: {
  onLogout: () => void;
}) {
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const { state, dispatch } = useStore();
  const selectors = useSelectors();
  const events = state.events;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [eventsData, studentsData, attendanceData] = await Promise.all([
        fetchEvents(),
        fetchStudents(),
        fetchAttendance(),
      ]);
      dispatch({ type: 'INIT_LOAD', payload: { students: studentsData, events: eventsData, attendance: attendanceData } });
    } catch (error) {
      console.error('Failed to refresh admin backend data', error);
    } finally {
      setIsRefreshing(false);
    }
  };

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
    <div className="min-h-[100dvh] pb-[180px] sm:pb-[220px] landing-page-black relative overflow-hidden">
      <AnimatedBackground />
      <div className="absolute inset-0 opacity-0 pointer-events-none" />
      <header className="bg-[var(--secondary)] px-5 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-4">
          <COAccessLogo inverted size="sm" />
          <div className="w-px h-5 bg-white/20" />
          <span className="text-white/50 font-semibold text-sm">Admin Portal</span>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={handleRefresh} disabled={isRefreshing} className="flex items-center gap-1.5 text-white/55 hover:text-white text-sm transition-colors mr-2">
            <RefreshCw size={14} className={cn(isRefreshing && "animate-spin")} /> <span className="hidden sm:inline">{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
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

      <div className="relative z-10 max-w-7xl mx-auto p-2 sm:p-4 md:p-6 lg:p-8 pt-4 sm:pt-10">
        <div className="bg-blue/30 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-[2.5rem] p-3 sm:p-6 md:p-10 shadow-2xl">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {tab === "dashboard" && <DashboardTab />}
            {tab === "students" && <StudentsTab />}
            {tab === "create-event" && <CreateEventTab />}
            {tab === "scanner" && <ScannerTab events={events.filter(e => e.status !== "archived")} />}
            {tab === "reports" && <ReportsTab events={events.filter(e => e.status !== "archived")} />}
          </div>
        </div>
      </div>
      <DeveloperFooter />
    </div>
  );
}
