import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RefreshCw, XCircle, ChevronRight, Info, GraduationCap } from "lucide-react";
import { useClerk, useSignIn, useUser, SignIn } from "@clerk/clerk-react";
import CheckITLogo from "../../components/shared/CheckITLogo";
import Card from "../../components/shared/Card";
import AnimatedBackground from "../../components/common/AnimatedBackground";
import { checkStudentExists } from "../../services/studentCheck";
import DeveloperFooter from "../../components/shared/DeveloperFooter";

// ─── Student Auth Gate ────────────────────────────────────────────────────────

export default function StudentAuthGate({
  onSuccess,
  onBack,
  onStudentExists,
}: {
  onSuccess: (email: string) => void;
  onBack: () => void;
  onStudentExists: (email: string) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [checkingBackend, setCheckingBackend] = useState(false);
  const { isLoaded, signIn } = useSignIn();
  const clerk = useClerk();
  const { user, isSignedIn, isLoaded: userLoaded } = useUser();

  // Once Clerk resolves after the OAuth redirect, enforce the UA-email rule.
  useEffect(() => {
    if (!userLoaded) return;

    // Manual OAuth callback handling removed as it's now handled by <SignIn /> natively

    if (!isSignedIn || !user) return;

    const email = user.primaryEmailAddress?.emailAddress ?? "";
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail.endsWith("@ua.edu.ph")) {
      // Reject non-UA emails
      setError("Please use your UA email.");
      clerk.signOut();
      return;
    }

    // UA account is valid — now check if the student exists in the backend.
    setError(null);
    setCheckingBackend(true);
    checkStudentExists(normalizedEmail)
      .then((exists) => {
        if (exists) {
          // Student is already registered — route to browser verification (future step).
          onStudentExists(normalizedEmail);
        } else {
          // New student — route to registration page.
          onSuccess(normalizedEmail);
        }
      })
      .catch(() => {
        setError("Could not reach the server. Please try again.");
      })
      .finally(() => {
        setCheckingBackend(false);
      });
  }, [userLoaded, isSignedIn, user, clerk, onSuccess, onStudentExists]);

  const handleBack = () => {
    // Clear the intent key when explicitly returning to the landing page
    sessionStorage.removeItem("clerk-oauth-intent");
    onBack();
  };

  // handleGoogleAuth removed as it is now handled natively by <SignIn />

  // Don't render anything until Clerk finishes initializing its auth state.
  // Also, if the user is already signed in, we shouldn't show the sign-in UI
  // because we are just verifying their backend registration in the background.
  // However, if there is an error (e.g., backend unreachable or invalid email),
  // we must render the UI so the user can see the error message.
  if (!userLoaded || (isSignedIn && checkingBackend) || (isSignedIn && user && !error)) {
    return (
      <div className="min-h-screen pb-[180px] sm:pb-[220px] landing-page-black flex items-center justify-center" aria-label="Loading…">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animation: "spin 0.9s linear infinite" }}>
            <circle cx="18" cy="18" r="15" stroke="rgba(255,255,255,0.12)" strokeWidth="3" />
            <path d="M18 3 A15 15 0 0 1 33 18" stroke="rgba(255,255,255,0.75)" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-[180px] sm:pb-[220px] landing-page-black flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }} className="w-full relative z-10 flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-full max-w-[400px] mb-6">
          <button onClick={handleBack} className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors">
            <ChevronRight size={15} className="rotate-180" /> Back to home
          </button>
        </div>

        <SignIn 
          routing="virtual"
          forceRedirectUrl={window.location.origin + "?login=success"}
          appearance={{
            elements: {
              rootBox: "mx-auto",
              cardBox: "shadow-[0_32px_80px_rgba(0,0,0,0.35)] rounded-2xl border border-white/10",
              card: "bg-black",
              headerTitle: "text-white",
              headerSubtitle: "text-slate-300",
              socialButtonsBlockButton: "border border-white/10 text-white hover:bg-white/5",
              socialButtonsBlockButtonText: "text-white font-semibold",
              dividerLine: "bg-white/10",
              dividerText: "text-slate-400",
              formFieldLabel: "text-slate-300",
              formFieldInput: "bg-white/5 border border-white/10 text-white",
              footerActionText: "text-slate-400",
              footerActionLink: "text-blue-400 hover:text-blue-300",
              identityPreviewText: "text-white",
              identityPreviewEditButtonIcon: "text-slate-400 hover:text-white",
              formButtonPrimary: "bg-[#0B2A4D] hover:bg-[#0E3A65] text-white border border-white/10",
            }
          }}
        />

        <AnimatePresence>
          {error && (
            <motion.div
              key="error-banner"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5 overflow-hidden w-full max-w-[400px]"
            >
              <XCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-200">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <DeveloperFooter />
      </div>
  );
}
