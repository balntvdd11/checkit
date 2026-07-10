import { motion } from "motion/react";
import { AlertTriangle, Lock, Smartphone } from "lucide-react";
import Card from "../../components/shared/Card";
import { cn } from "../../lib/utils";
import type { Student } from "../../types";

// ─── Browser Activation ───────────────────────────────────────────────────────

export default function BrowserActivation({ student, hasConflict = false, onActivate, onCancel }: {
  student: Student; hasConflict?: boolean; onActivate: () => void; onCancel: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }} className="w-full max-w-md">
        <Card className="p-8 bg-[#020A17] border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.35)]">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center", "bg-white/10")}> 
                {hasConflict
                  ? <AlertTriangle size={40} className="text-white" />
                  : <Lock size={40} className="text-white" />
                }
              </div>
              <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shadow-lg">
                <Smartphone size={17} className="text-white" />
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-white mb-2">
              {hasConflict ? "Browser Already Activated" : "Activate This Browser"}
            </h1>
            {hasConflict ? (
              <p className="text-sm text-slate-300 leading-relaxed">
                Your account is already active on another device. Activating here will{" "}
                <span className="font-semibold text-white">deactivate your previous browser</span>.
                Only one browser can generate your attendance QR at a time.
              </p>
            ) : (
              <p className="text-sm text-slate-300 leading-relaxed">
                This browser will be remembered as your secure device. Your private key is stored here —{" "}
                <span className="font-semibold text-white">only this activated browser</span> can generate your attendance QR code.
              </p>
            )}
          </div>

          {!hasConflict && (
            <div className="mb-6 p-4 bg-white/5 rounded-3xl border border-white/10 flex items-start gap-3">
              <Lock size={15} className="text-white mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white mb-0.5">Why browser activation?</p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your QR code is cryptographically tied to this device, preventing sharing or spoofing — ensuring only you can mark your attendance.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button onClick={onActivate}
              className={cn("w-full py-3.5 font-bold rounded-xl transition-colors",
                hasConflict ? "bg-[var(--secondary)] hover:bg-[#174E7A] text-white" : "bg-white/10 hover:bg-white/20 text-white")}>
              {hasConflict ? "Confirm & Activate This Browser" : "Activate Browser"}
            </button>
            {hasConflict && (
              <button onClick={onCancel}
                className="w-full py-3 border border-white/10 text-white/80 font-semibold rounded-xl hover:bg-white/5 transition-colors text-sm">
                Cancel
              </button>
            )}
          </div>

          <p className="mt-4 text-center text-xs text-slate-400">
            Activating for: <span className="font-semibold text-white">{student.studentId}</span>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
