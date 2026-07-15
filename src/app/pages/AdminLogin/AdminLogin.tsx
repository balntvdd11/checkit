import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, KeyRound, RefreshCw, XCircle, Eye, EyeOff } from "lucide-react";
import COAccessLogo from "../../components/shared/COAccessLogo";
import Card from "../../components/shared/Card";
import AnimatedBackground from "../../components/common/AnimatedBackground";
import { login } from "../../services/auth";
import DeveloperFooter from "../../components/shared/DeveloperFooter";

// ─── Admin Login ──────────────────────────────────────────────────────────────

export default function AdminLogin({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await login(username.trim(), password);
      localStorage.setItem("checkit_admin_token", result.token);
      localStorage.setItem("checkit_admin_username", result.username);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-[180px] sm:pb-[220px] landing-page-black flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }} className="w-full max-w-md relative z-10">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-bold text-[#0a2472] hover:text-[#123499] mb-8 transition-colors drop-shadow-sm">
          <ChevronRight size={15} className="rotate-180" /> Back to home
        </button>

        <Card className="p-8 bg-gradient-to-br from-[#0a2472]/85 via-[#123499]/90 to-[#72caec] hover:opacity-90 border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.35)] relative overflow-hidden group premium-border-card">
          <div className="relative z-10 flex flex-col items-center text-center mb-8">
            <COAccessLogo size="lg" inverted />
            <div className="mt-6 w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shadow-sm border border-white/10">
              <KeyRound size={24} className="text-white" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-white">Admin Access</h1>
          </div>

          <form onSubmit={handleSubmit} className="relative z-10">
            <div className="mb-4">
              <input type="text" placeholder="Username" value={username} onChange={e => { setUsername(e.target.value); setError(null); }}
                className="w-full px-4 py-3.5 rounded-xl border border-white/10 text-center font-mono tracking-widest bg-white/5 text-white shadow-sm placeholder:text-slate-400 placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-[#7EEAF8]/50 focus:border-[#7EEAF8] transition-all" autoFocus />
            </div>
            <div className="mb-5 relative">
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => { setPassword(e.target.value); setError(null); }}
                className="w-full px-10 py-3.5 rounded-xl border border-white/10 text-center font-mono tracking-widest bg-white/5 text-white shadow-sm placeholder:text-slate-400 placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-[#7EEAF8]/50 focus:border-[#7EEAF8] transition-all" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors p-1">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
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
      <DeveloperFooter />
      </div>
  );
}
