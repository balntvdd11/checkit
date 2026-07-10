import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, KeyRound, RefreshCw, XCircle } from "lucide-react";
import CheckITLogo from "../../components/shared/CheckITLogo";
import Card from "../../components/shared/Card";
import AnimatedBackground from "../../components/common/AnimatedBackground";

// ─── Admin Login ──────────────────────────────────────────────────────────────

export default function AdminLogin({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (password !== "admin123") {
      setError("Invalid admin password. Try 'admin123'");
      return;
    }
    setLoading(true); setError(null);
    setTimeout(() => { setLoading(false); onSuccess(); }, 800);
  };

  return (
    <div className="min-h-screen landing-page-black flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }} className="w-full max-w-md relative z-10">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#7A6268] hover:text-[#0B2A4D] mb-8 transition-colors">
          <ChevronRight size={15} className="rotate-180" /> Back to home
        </button>

        <Card className="p-8 !bg-black border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.35)] relative overflow-hidden group premium-border-card">
          <span className="border-tracer absolute inset-0 pointer-events-none">
            <svg viewBox="0 0 448 500" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <defs>
                <linearGradient id="tracerGrad-admin" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0" stopColor="#F5F7FA" stopOpacity="0.75" />
                  <stop offset="0.5" stopColor="#D7DEE8" stopOpacity="0.3" />
                  <stop offset="1" stopColor="#D7DEE8" stopOpacity="0" />
                </linearGradient>
                <filter id="glow-admin"><feGaussianBlur stdDeviation="3.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>
              <rect x="1" y="1" width="446" height="498" rx="16" ry="16" fill="none" stroke="url(#tracerGrad-admin)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="110 900" pathLength="1000" filter="url(#glow-admin)">
                <animate attributeName="stroke-dashoffset" from="0" to="1000" dur="5.2s" repeatCount="indefinite" />
              </rect>
            </svg>
          </span>
          <div className="relative z-10 flex flex-col items-center text-center mb-8">
            <CheckITLogo size="sm" />
            <div className="mt-6 w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shadow-sm border border-white/10">
              <KeyRound size={24} className="text-white" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-white">Admin Access</h1>
            <p className="mt-1 text-sm text-slate-300">Enter master password to manage events</p>
          </div>

          <form onSubmit={handleSubmit} className="relative z-10">
            <div className="mb-5">
              <input type="password" placeholder="Admin password" value={password} onChange={e => { setPassword(e.target.value); setError(null); }}
                className="w-full px-4 py-3.5 rounded-xl border border-white/10 text-center font-mono tracking-widest bg-white/5 text-white shadow-sm placeholder:text-slate-400 placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-[#7EEAF8]/50 focus:border-[#7EEAF8] transition-all" autoFocus />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5">
                    <XCircle size={15} className="text-rose-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-rose-400">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" disabled={loading || !password}
              className="w-full py-3.5 bg-[#0B2A4D] hover:bg-[#0E3A65] text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><RefreshCw size={18} className="animate-spin" /> Authenticating…</> : "Access Portal"}
            </button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
