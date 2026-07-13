import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Smartphone, CheckCircle2, XCircle, RefreshCw, Fingerprint } from "lucide-react";
import Card from "../../components/shared/Card";
import CheckITLogo from "../../components/shared/CheckITLogo";
import AnimatedBackground from "../../components/common/AnimatedBackground";
import type { Student } from "../../types";
import { activateBrowser } from "../../services/browserActivation";
import { generateDeviceFingerprint, sendFingerprintToBackend } from "../../services/fingerprint";

// ─── Browser Activation ───────────────────────────────────────────────────────
// Runs automatically on mount:
//   1. Generate P-256 ECDSA key pair via Web Crypto API.
//   2. Store the private key (JWK) in localStorage, scoped to the student email.
//   3. Send the public key (PEM/SPKI) to the Django backend.
//   4. Generate device fingerprint.
//   5. Send device fingerprint to Django backend.
//   6. Wait for user to click "Activate Browser" to proceed to the dashboard.

type Phase = "activating" | "done" | "error";

export default function BrowserActivation({
  student,
  onActivate,
  onCancel,
  hasConflict,
}: {
  student: Student;
  onActivate: () => void;
  onCancel: () => void;
  hasConflict?: boolean;
}) {
  const [phase, setPhase] = useState<Phase>("activating");
  const [error, setError] = useState<string | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const runActivation = async () => {
      try {
        // Step 1: ECC Browser Activation
        await activateBrowser(student.email);

        // Step 2: Device Fingerprinting
        const fingerprint = await generateDeviceFingerprint();
        await sendFingerprintToBackend(student.email, fingerprint);

        if (mounted) {
          setPhase("done");
        }
      } catch (err) {
        if (mounted) {
          setPhase("error");
          setError(err instanceof Error ? err.message : "Browser activation failed. Please try again.");
        }
      }
    };

    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      runActivation();
    }

    return () => {
      mounted = false;
    };
  }, [student.email]);

  const handleRetry = () => {
    setPhase("activating");
    setError(null);
    hasStartedRef.current = false;
  };

  return (
    <div className="min-h-screen landing-page-black flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="p-8 !bg-black border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.35)] relative overflow-hidden group premium-border-card">
          {/* Border tracer */}


          {/* Header */}
          <div className="relative z-10 flex flex-col items-center text-center mb-8">
            <CheckITLogo size="md" />
            <div className="mt-7 relative">
              <div className="w-20 h-20 rounded-2xl bg-[#0B2A4D] flex items-center justify-center shadow-[0_0_15px_rgba(10,42,77,0.35)]">
                <AnimatePresence mode="wait">
                  {phase === "activating" && (
                    <motion.div key="activating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <RefreshCw size={36} className="text-white animate-spin" />
                    </motion.div>
                  )}
                  {phase === "done" && (
                    <motion.div key="done" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
                      <CheckCircle2 size={36} className="text-emerald-400" />
                    </motion.div>
                  )}
                  {phase === "error" && (
                    <motion.div key="error" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                      <XCircle size={36} className="text-red-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-[#0B2A4D] flex items-center justify-center shadow-lg">
                <Fingerprint size={17} className="text-white" />
              </div>
            </div>

            <h1 className="mt-6 text-xl font-bold text-white">
              {phase === "activating" && "Registering Browser…"}
              {phase === "done" && "Browser Ready!"}
              {phase === "error" && "Activation Failed"}
            </h1>
            <p className="mt-1.5 text-sm text-slate-300 leading-relaxed max-w-[280px]">
              {phase === "activating" && "Generating your secure key pair and registering this browser. This only takes a moment."}
              {phase === "done" && "Your keys and fingerprint have been registered. Click the button below to complete activation."}
              {phase === "error" && (error ?? "Something went wrong. Please try again.")}
            </p>
          </div>

          {/* Progress steps */}
          <div className="relative z-10 mb-6 flex flex-col gap-3">
            {[
              { label: "Generate ECC key pair", desc: "P-256 via Web Crypto API" },
              { label: "Store private key", desc: "Secured in this browser only" },
              { label: "Register public key", desc: "Sent to CheckIT backend" },
              { label: "Bind device fingerprint", desc: "Hardware + Browser tied to account" },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all duration-500 ${
                  phase === "activating"
                    ? "bg-white/10 text-white/40"
                    : phase === "done"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-red-500/20 text-red-400"
                }`}>
                  {phase === "activating" ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                  ) : phase === "done" ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <XCircle size={14} />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{step.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Security note */}
          <div className="relative z-10 mb-6 p-3.5 bg-white/5 rounded-xl border border-white/10 flex items-start gap-2.5">
            <Lock size={13} className="text-white/75 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-300 leading-relaxed">
              Your private key <span className="font-semibold text-white">never leaves this browser</span>.
              Only the public key is sent to the server — ensuring only you can generate your QR code.
            </p>
          </div>

          {/* Error actions */}
          <AnimatePresence>
            {phase === "error" && (
              <motion.div
                key="error-actions"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="relative z-10 flex flex-col gap-2 overflow-hidden"
              >
                <button
                  onClick={handleRetry}
                  className="w-full py-3.5 bg-[#0B2A4D] hover:bg-[#0E3A65] text-white font-bold rounded-xl transition-colors border border-white/10 flex items-center justify-center gap-2"
                >
                  <RefreshCw size={15} /> Try Again
                </button>
                <button
                  onClick={onCancel}
                  className="w-full py-3 border border-white/10 text-white/70 font-semibold rounded-xl hover:bg-white/5 transition-colors text-sm"
                >
                  Cancel
                </button>
              </motion.div>
            )}
            
            {phase === "done" && (
              <motion.div
                key="done-actions"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="relative z-10 flex flex-col gap-2 overflow-hidden"
              >
                <button
                  onClick={onActivate}
                  className="w-full py-3.5 bg-[#0B2A4D] hover:bg-[#0E3A65] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  Activate Browser
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="relative z-10 mt-4 text-center text-xs text-slate-500">
            Activating for: <span className="font-semibold text-white/70">{student.studentId}</span>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}

