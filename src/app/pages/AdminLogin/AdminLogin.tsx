import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, KeyRound, RefreshCw, XCircle } from "lucide-react";
import CheckITLogo from "../../components/shared/CheckITLogo";
import Card from "../../components/shared/Card";

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }} className="w-full max-w-md">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#7A6268] hover:text-[#0B2A4D] mb-8 transition-colors">
          <ChevronRight size={15} className="rotate-180" /> Back to home
        </button>

        <Card className="p-8 bg-[#F8F4EF] border border-[#D7D5D0]">
          <div className="flex flex-col items-center text-center mb-8">
            <CheckITLogo size="sm" />
            <div className="mt-6 w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-[#D7D5D0]/50">
              <KeyRound size={24} className="text-[#0B2A4D]" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-[#1A080E]">Admin Access</h1>
            <p className="mt-1 text-sm text-[#7A6268]">Enter master password to manage events</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <input type="password" placeholder="Admin password" value={password} onChange={e => { setPassword(e.target.value); setError(null); }}
                className="w-full px-4 py-3.5 rounded-xl border border-[#D7D5D0] text-center font-mono tracking-widest bg-white shadow-sm placeholder:text-[#C0B4B8] placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-[#7EEAF8]/50 focus:border-[#7EEAF8] transition-all" autoFocus />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
                  <div className="p-3 bg-[#E73950]/10 border border-[#E73950]/20 rounded-xl flex items-start gap-2.5">
                    <XCircle size={15} className="text-[#E73950] mt-0.5 shrink-0" />
                    <p className="text-sm text-[#E73950]">{error}</p>
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
