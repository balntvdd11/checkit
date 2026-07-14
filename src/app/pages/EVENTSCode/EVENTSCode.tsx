import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LogOut, ChevronRight, Hash, RefreshCw, QrCode } from "lucide-react";
import COAccessLogo from "../../components/shared/COAccessLogo";
import Card from "../../components/shared/Card";
import { cn } from "../../lib/utils";
import type { Student, EventConfig } from "../../types";
import AnimatedBackground from "../../components/common/AnimatedBackground";
import checkITLogoImg from "../../../asset/checkITlogo.png";
import DeveloperFooter from "../../components/shared/DeveloperFooter";

// ─── EVENTS Code Entry (renamed) ─────────────────────────────────────────────────────

export default function EVENTSCodeEntry({ student, events, onSubmit, onViewHistory, onLogout }: {
  student: Student; events: EventConfig[]; onSubmit: (code: string) => void; onViewHistory: () => void; onLogout: () => void;
}) {
  const [selectedEventId, setSelectedEventId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const activeEvents = events.filter(e => e.status === "active");
  const selectedEvent = activeEvents.find(e => e.id === selectedEventId);

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!selectedEventId) { setError("Please select a COAccess code"); return; }
    setLoading(true); setError(null);
    setTimeout(() => {
      setLoading(false);
      onSubmit(selectedEvent?.checkItCode || "");
    }, 1200);
  };

  return (
    <div className="min-h-screen pb-[180px] sm:pb-[220px] landing-page-black relative overflow-hidden">
      <AnimatedBackground />
      <div className="absolute inset-0 opacity-0 pointer-events-none" />
      <header className="relative z-10 bg-[var(--secondary)] px-5 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <COAccessLogo inverted size="sm" />
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

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-57px)] p-4">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
          <button onClick={onViewHistory} className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white mb-6 transition-colors">
            <ChevronRight size={15} className="rotate-180" /> Back to dashboard
          </button>
          <div className="mb-6 text-center">
            <p className="text-sm text-white/70">Welcome back,</p>
            <h1 className="text-2xl font-bold text-white mt-0.5">{student.name}</h1>
            <p className="text-xs text-white/70 mt-1 font-mono">{student.studentId} · {student.section}</p>
          </div>

          <Card className="p-8 relative !bg-black premium-border-card border-[1.5px] border-[#7EEAF8]/24 overflow-hidden">

            <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-4">
              <div className="flex flex-col items-center text-center mb-7">
                <img src={checkITLogoImg} alt="COAccess logo" className="w-28 h-28 object-contain drop-shadow-xl mb-4" />
                <h2 className="text-lg font-bold text-white">Select COAccess Event</h2>
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
                    <option value="" className="text-black">Select an event...</option>
                    {activeEvents.map(event => (
                      <option key={event.id} value={event.id} className="text-black">
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
      <DeveloperFooter />
      </div>
  );
}
