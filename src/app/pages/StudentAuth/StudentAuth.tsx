import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RefreshCw, XCircle, ChevronRight, Info, GraduationCap } from "lucide-react";
import CheckITLogo from "../../components/shared/CheckITLogo";
import Card from "../../components/shared/Card";
import AnimatedBackground from "../../components/common/AnimatedBackground";

// ─── Student Auth Gate ────────────────────────────────────────────────────────

export default function StudentAuthGate({ onSuccess, onBack }: { onSuccess: (email: string) => void; onBack: () => void }) {
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
    <div className="min-h-screen landing-page-black flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }} className="w-full max-w-md relative z-10">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white mb-8 transition-colors">
          <ChevronRight size={15} className="rotate-180" /> Back to home
        </button>

        <Card className="p-8 !bg-black border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.35)] relative overflow-hidden group premium-border-card">
          <span className="border-tracer absolute inset-0 pointer-events-none">
            <svg viewBox="0 0 448 500" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <defs>
                <linearGradient id="tracerGrad-auth" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0" stopColor="#F5F7FA" stopOpacity="0.75" />
                  <stop offset="0.5" stopColor="#D7DEE8" stopOpacity="0.3" />
                  <stop offset="1" stopColor="#D7DEE8" stopOpacity="0" />
                </linearGradient>
                <filter id="glow-auth"><feGaussianBlur stdDeviation="3.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>
              <rect x="1" y="1" width="446" height="498" rx="16" ry="16" fill="none" stroke="url(#tracerGrad-auth)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="110 900" pathLength="1000" filter="url(#glow-auth)">
                <animate attributeName="stroke-dashoffset" from="0" to="1000" dur="5.2s" repeatCount="indefinite" />
              </rect>
            </svg>
          </span>
          <div className="relative z-10 flex flex-col items-center text-center mb-8">
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
