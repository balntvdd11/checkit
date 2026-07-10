import { useState } from "react";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import CheckITLogo from "../../components/shared/CheckITLogo";
import Card from "../../components/shared/Card";
import { cn } from "../../lib/utils";
import type { Student } from "../../types";

// ─── Student Registration ─────────────────────────────────────────────────────

export default function StudentRegistration({ email, onSubmit, onBack }: { email: string; onSubmit: (s: Student) => void; onBack: () => void }) {
  const [form, setForm] = useState({ name: "", section: "", studentId: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const sections = ["BSIT 1A", "BSIT 1B", "BSIT 2A", "BSIT 2B", "BSIT 3A", "BSIT 3B", "BSIT 4A", "BSIT 4B"];

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.section) e.section = "Please select a section";
    if (!form.studentId.trim()) e.studentId = "Student ID is required";
    else if (!/^\d{10}$/.test(form.studentId)) e.studentId = "Student ID must be 10 digits (e.g., 2023001321)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (validate()) onSubmit({ ...form, email });
  };

  const inputCls = (err?: string) => cn(
    "w-full px-4 py-3 rounded-xl border text-sm bg-white/5 placeholder:text-slate-400 text-white",
    "focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-colors",
    err ? "border-white/20" : "border-white/10"
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }} className="w-full max-w-md">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#7A6268] hover:text-[#0B2A4D] mb-8 transition-colors">
          <ChevronRight size={15} className="rotate-180" /> Back
        </button>

        <Card className="p-8 bg-[#020A17] border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.35)]">
          <div className="mb-6">
            <CheckITLogo size="sm" />
            <h1 className="mt-5 text-xl font-bold text-white">Complete Registration</h1>
            <p className="mt-1 text-sm text-slate-300">
              Signed in as <span className="font-semibold text-white">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Full Name</label>
              <input type="text" placeholder="e.g., Maria Clara Santos"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className={inputCls(errors.name)} />
              {errors.name && <p className="mt-1.5 text-xs text-sky-300">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Section</label>
              <select value={form.section} onChange={e => setForm({ ...form, section: e.target.value })}
                className={cn(inputCls(errors.section), !form.section && "text-[#C0B4B8]")}>
                <option value="">Select your section</option>
                {sections.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.section && <p className="mt-1.5 text-xs text-[#0B2A4D]">{errors.section}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Student ID</label>
              <input type="text" placeholder="e.g., 2023001321"
                value={form.studentId}
                onChange={e => setForm({ ...form, studentId: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                className={cn(inputCls(errors.studentId), "font-mono tracking-widest")} />
              {errors.studentId && <p className="mt-1.5 text-xs text-sky-300">{errors.studentId}</p>}
            </div>

              <button type="submit"
              className="mt-2 w-full py-3.5 bg-[#0B3B66] hover:bg-[#0E4B86] text-white font-bold rounded-xl transition-colors">
              Complete Registration
            </button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
