import { useState } from "react";
import { LogOut, LayoutDashboard, Users, ScanLine, FileText, CalendarCheck2 } from "lucide-react";
import CheckITLogo from "../../components/shared/CheckITLogo";
import DashboardTab from "./tabs/DashboardTab";
import StudentsTab from "./tabs/StudentsTab";
import CreateEventTab from "./tabs/CreateEventTab";
import ScannerTab from "./tabs/ScannerTab";
import ReportsTab from "./tabs/ReportsTab";
import { cn } from "../../lib/utils";
import type { AdminTab, EventConfig } from "../../types";

export default function AdminDashboard({ onLogout, events, setEvents }: {
  onLogout: () => void;
  events: EventConfig[];
  setEvents: (events: EventConfig[]) => void;
}) {
  const [tab, setTab] = useState<AdminTab>("dashboard");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <CheckITLogo size="sm" />
          <div className="w-px h-6 bg-slate-200 hidden sm:block" />
          <span className="text-slate-500 font-semibold text-sm hidden sm:block">Admin Portal</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1.5 mr-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-slate-600">System Online</span>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
            <LogOut size={16} /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white px-2 sm:px-5 overflow-x-auto hide-scrollbar sticky top-[61px] z-20">
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

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {tab === "dashboard" && <DashboardTab />}
          {tab === "students" && <StudentsTab />}
          {tab === "create-event" && <CreateEventTab events={events} setEvents={setEvents} />}
          {tab === "scanner" && <ScannerTab />}
          {tab === "reports" && <ReportsTab events={events} />}
        </div>
      </div>
    </div>
  );
}
