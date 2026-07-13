import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ClipboardList, XCircle, RefreshCw } from "lucide-react";
import CheckITLogo from "../../components/shared/CheckITLogo";
import Card from "../../components/shared/Card";
import AnimatedBackground from "../../components/common/AnimatedBackground";
import { cn } from "../../lib/utils";
import type { Student } from "../../types";
import { registerStudent } from "../../services/studentCheck";

// ─── Student Registration ─────────────────────────────────────────────────────

export default function StudentRegistration({ email, onSubmit, onBack }: { email: string; onSubmit: (s: Student) => void; onBack: () => void }) {
  const [form, setForm] = useState({ name: "", section: "", studentId: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const sections = [
    "BSIT 1A", "BSIT 1B", "BSIT 1C", "BSIT 1D", "BSIT 1E",
    "BSIT 2A", "BSIT 2B", "BSIT 2C", "BSIT 2D", "BSIT 2E",
    "BSIT 3A", "BSIT 3B", "BSIT 3C", "BSIT 3D", "BSIT 3E",
    "BSIT 4A", "BSIT 4B", "BSIT 4C", "BSIT 4D", "BSIT 4E"
  ];

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.section) e.section = "Please select a section";
    if (!form.studentId.trim()) e.studentId = "Student ID is required";
    else if (!/^\d{10}$/.test(form.studentId)) e.studentId = "Student ID must be 10 digits (e.g., 2023001321)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await registerStudent({
        name: form.name,
        studentId: form.studentId,
        section: form.section,
        email,
        registered: true,
        registeredAt: new Date().toISOString(),
      });
      // Pass the student data up to App.tsx to navigate to the dashboard
      onSubmit({ name: form.name, studentId: form.studentId, section: form.section, email });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = (err?: string) => cn(
    "w-full px-4 py-3 rounded-xl border text-sm bg-white/5 placeholder:text-slate-500 text-white",
    "focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-colors",
    err ? "border-red-500/50" : "border-white/10"
  );

  return (
    <div className="min-h-screen landing-page-black flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md relative z-10"
      >
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white mb-8 transition-colors">
          <ChevronRight size={15} className="rotate-180" /> Back
        </button>

        <Card className="p-8 !bg-black border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.35)] relative overflow-hidden group premium-border-card">

          {/* Header */}
          <div className="relative z-10 flex flex-col items-center text-center mb-8">
            <CheckITLogo size="md" />
            <div className="mt-7 w-16 h-16 rounded-2xl bg-[#0B2A4D] flex items-center justify-center shadow-[0_0_15px_rgba(10,42,77,0.35)]">
              <ClipboardList size={28} className="text-white" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-white">Complete Registration</h1>
            <p className="mt-1.5 text-sm text-slate-300 leading-relaxed max-w-[280px]">
              Signed in as <span className="font-semibold text-white">{email}</span>
            </p>
          </div>

          {/* Global submit error */}
          <AnimatePresence>
            {submitError && (
              <motion.div
                key="submit-error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-white/10 border border-white/10 rounded-xl flex items-start gap-2.5 overflow-hidden"
              >
                <XCircle size={15} className="text-white mt-0.5 shrink-0" />
                <p className="text-sm text-white">{submitError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                placeholder="e.g., Maria Clara Santos"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className={inputCls(errors.name)}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Section */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Section</label>
              <select
                value={form.section}
                onChange={e => setForm({ ...form, section: e.target.value })}
                className={cn(inputCls(errors.section), !form.section && "text-slate-500")}
              >
                <option value="" className="bg-[#0B0F1A] text-slate-400">Select your section</option>
                {sections.map(s => <option key={s} value={s} className="bg-[#0B0F1A] text-white">{s}</option>)}
              </select>
              {errors.section && (
                <p className="mt-1.5 text-xs text-red-400">{errors.section}</p>
              )}
            </div>

            {/* Student ID */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Student ID</label>
              <input
                type="text"
                placeholder="e.g., 2023001321"
                value={form.studentId}
                onChange={e => setForm({ ...form, studentId: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                className={cn(inputCls(errors.studentId), "font-mono tracking-widest")}
              />
              {errors.studentId && (
                <p className="mt-1.5 text-xs text-red-400">{errors.studentId}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full flex items-center justify-center gap-2 py-3.5 bg-[#0B2A4D] hover:bg-[#0E3A65] text-white font-bold rounded-xl transition-all border border-white/10 disabled:opacity-60 disabled:cursor-wait"
            >
              {submitting ? (
                <><RefreshCw size={16} className="animate-spin" /> Saving…</>
              ) : (
                "Complete Registration"
              )}
            </button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
