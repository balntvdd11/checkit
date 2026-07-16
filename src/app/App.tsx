import { useState, useEffect } from "react";
import { useClerk } from "@clerk/clerk-react";
import LandingPage from "./pages/Landing/Landing";
import StudentAuthGate from "./pages/StudentAuth/StudentAuth";
import StudentRegistration from "./pages/StudentRegistration/StudentRegistration";
import BrowserActivation from "./pages/BrowserActivation/BrowserActivation";
import DeviceConflict from "./pages/DeviceConflict/DeviceConflict";
import EVENTSCodeEntry from "./pages/EVENTSCode/EVENTSCode";
import QRPassGenerator from "./pages/QRPass/QRPass";
import StudentDashboard from "./pages/StudentDashboard/StudentDashboard";
import AdminLogin from "./pages/AdminLogin/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import InAppBrowserWarning from "./pages/InAppBrowserWarning/InAppBrowserWarning";
import { StoreProvider, useStore } from "./state/store";
import { fetchEvents } from "./services/events";
import { fetchStudents } from "./services/students";
import { fetchAttendance } from "./services/attendance";
import { fetchStudentByEmail } from "./services/studentCheck";
import { hasStoredPrivateKey } from "./services/browserActivation";
import { generateDeviceFingerprint } from "./services/fingerprint";

import type { View, Student } from "./types";

export const isInAppBrowser = () => {
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
  return (
    ua.indexOf("FBAN") > -1 || 
    ua.indexOf("FBAV") > -1 || 
    ua.indexOf("Instagram") > -1 || 
    ua.indexOf("Messenger") > -1 ||
    ua.indexOf("Line") > -1 ||
    ua.indexOf("Viber") > -1
  );
};

function AppInner() {
  const [currentView, setCurrentView] = useState<View>(() => {
    // When the user successfully signs in with Clerk, they are redirected back to the
    // origin with ?login=success in the URL. We catch this here so they instantly
    // resolve their session and proceed to registration or dashboard, rather than
    // being stuck on the landing page.
    if (isInAppBrowser()) {
      return "in-app-browser-warning";
    }
    if (window.location.search.includes("login=success")) {
      return "student-resolving";
    }
    return "landing";
  });
  const { state, dispatch } = useStore();

  // Student Flow State
  const [currentStudentEmail, setCurrentStudentEmail] = useState<string>("");
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [currentEVENTSCode, setCurrentEVENTSCode] = useState<string>("");
  const [lockedOS, setLockedOS] = useState<string | undefined>(undefined);
  const clerk = useClerk();

  const handleStudentLogout = () => {
    // "Sign Out" in COAccess only clears application state and returns to the
    // landing page.  It does NOT terminate the Clerk session so the student
    // can re-enter the portal instantly without re-authenticating via Google.
    setCurrentStudent(null);
    setCurrentStudentEmail("");
    setCurrentView("landing");
  };

  useEffect(() => {
    (async () => {
      try {
        const [events, students, attendance] = await Promise.all([fetchEvents(), fetchStudents(), fetchAttendance()]);
        dispatch({ type: "INIT_LOAD", payload: { students, events, attendance } });
      } catch (error) {
        console.error("Failed to initialize app data", error);
      }
    })();
  }, [dispatch]);

  // Clean up the URL if we just returned from a Clerk sign-in redirect
  useEffect(() => {
    if (window.location.search.includes("login=success")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("login");
      window.history.replaceState({}, document.title, url.pathname + url.search);
    }
  }, []);

  // ── Seamless re-entry: resolve auth state before showing any auth UI ──────
  // When the user clicks "Student Portal" we land on "student-resolving".
  // We wait here (showing a plain loading screen) until Clerk has fully
  // initialised.  Once ready, three outcomes are possible:
  //   1. Already signed-in + already registered → jump straight to dashboard.
  //   2. Already signed-in + NOT registered     → jump to registration.
  //   3. Not signed-in                          → proceed to student-auth page.
  useEffect(() => {
    if (currentView !== "student-resolving") return;

    const resolve = async () => {
      // Wait until Clerk has finished initialising its auth state
      if (!clerk.loaded) return;

      const user = clerk.user;

      if (!user) {
        // Not signed in — show the normal sign-in gate
        setCurrentView("student-auth");
        return;
      }

      // Already signed in — check whether this student is registered
      const email = user.primaryEmailAddress?.emailAddress ?? "";
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail.endsWith("@ua.edu.ph")) {
        // Signed in with a non-UA account — send to auth gate so it can reject
        setCurrentView("student-auth");
        return;
      }

      try {
        const record = await fetchStudentByEmail(normalizedEmail);
        if (record) {
          // Already registered — check if this browser is activated
          setCurrentStudentEmail(normalizedEmail);
          setCurrentStudent({
            name: record.name,
            studentId: record.studentId,
            section: record.section,
            email: record.email,
          });
          
          const currentFingerprint = await generateDeviceFingerprint();
          if (record.deviceFingerprint) {
            const savedFingerprints = record.deviceFingerprint.split(',');
            const isMatch = savedFingerprints.includes(currentFingerprint);

            if (!isMatch) {
              setCurrentView("student-activation");
            } else if (!hasStoredPrivateKey(normalizedEmail)) {
              setCurrentView("student-activation");
            } else {
              setCurrentView("student-dashboard");
            }
          } else {
            setCurrentView("student-activation");
          }
        } else {
          // Signed in but not yet registered — go to the auth gate which will
          // detect the active session and route to registration
          setCurrentStudentEmail(normalizedEmail);
          setCurrentView("student-auth");
        }
      } catch {
        // Backend unreachable — fall back to the auth gate
        setCurrentView("student-auth");
      }
    };

    resolve();

    // If Clerk isn't loaded yet, poll until it is (it loads within ~200 ms)
    if (!clerk.loaded) {
      const interval = setInterval(() => {
        if (clerk.loaded) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [currentView, clerk]);

  return (
    <>
      {currentView === "landing" && (
        <LandingPage
          onStudent={() => setCurrentView(isInAppBrowser() ? "in-app-browser-warning" : "student-resolving")}
          onAdmin={() => setCurrentView("admin-login")}
        />
      )}
      
      {currentView === "in-app-browser-warning" && <InAppBrowserWarning />}

      {/* Silent loading screen — shown while we wait for Clerk to initialise.
          Matches the app's dark theme so there is no visible flash. */}
      {currentView === "student-resolving" && (
        <div className="min-h-screen landing-page-black flex items-center justify-center" aria-label="Loading…">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ animation: "spin 0.9s linear infinite" }}
            >
              <circle cx="18" cy="18" r="15" stroke="rgba(255,255,255,0.12)" strokeWidth="3" />
              <path
                d="M18 3 A15 15 0 0 1 33 18"
                stroke="rgba(255,255,255,0.75)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {currentView === "student-auth" && (
        <StudentAuthGate
          onBack={() => setCurrentView("landing")}
          onSuccess={(email) => {
            // New student — go to registration page
            setCurrentStudentEmail(email);
            setCurrentView("student-register");
          }}
          onStudentExists={async (email) => {
            // Existing student — fetch their record and verify browser activation
            setCurrentStudentEmail(email);
            try {
              const record = await fetchStudentByEmail(email);
              if (record) {
                setCurrentStudent({
                  name: record.name,
                  studentId: record.studentId,
                  section: record.section,
                  email: record.email,
                });
                
                const currentFingerprint = await generateDeviceFingerprint();
                if (record.deviceFingerprint) {
                  const savedFingerprints = record.deviceFingerprint.split(',');
                  const isMatch = savedFingerprints.includes(currentFingerprint);

                  if (!isMatch) {
                    setCurrentView("student-activation");
                  } else if (!hasStoredPrivateKey(email)) {
                    setCurrentView("student-activation");
                  } else {
                    setCurrentView("student-dashboard");
                  }
                } else {
                  setCurrentView("student-activation");
                }
              } else {
                setCurrentView("student-auth");
              }
            } catch {
              // If fetch fails, route back to auth so they don't get a blank screen
              setCurrentView("student-auth");
            }
          }}
        />
      )}

      {currentView === "student-register" && (
        <StudentRegistration
          email={currentStudentEmail}
          onBack={() => setCurrentView("student-auth")}
          onSubmit={(studentData) => {
            // Registration saved — now activate this browser with ECC keys
            setCurrentStudent(studentData);
            setCurrentView("student-activation");
          }}
        />
      )}

      {currentView === "student-activation" && currentStudent && (
        <BrowserActivation
          student={currentStudent!}
          onActivate={() => setCurrentView("student-dashboard")}
          onCancel={handleStudentLogout}
          onConflict={() => setCurrentView("student-device-conflict")}
        />
      )}

      {currentView === "student-device-conflict" && currentStudentEmail && (
        <DeviceConflict
          email={currentStudentEmail}
          savedOS={lockedOS}
          onCancel={handleStudentLogout}
        />
      )}

      {currentView === "student-dashboard" && currentStudent && (
        <StudentDashboard
          student={currentStudent}
          onLogout={handleStudentLogout}
          onGeneratePass={() => setCurrentView("student-EVENTS-code")}
        />
      )}

      {currentView === "student-EVENTS-code" && currentStudent && (
        <EVENTSCodeEntry
          student={currentStudent}
          events={state.events}
          onLogout={handleStudentLogout}
          onViewHistory={() => setCurrentView("student-dashboard")}
          onSubmit={(code) => {
            setCurrentEVENTSCode(code);
            setCurrentView("student-qr-pass");
          }}
        />
      )}

      {currentView === "student-qr-pass" && currentStudent && (
        <QRPassGenerator
          student={currentStudent}
          EVENTSCode={currentEVENTSCode}
          onLogout={handleStudentLogout}
          onBack={() => setCurrentView("student-EVENTS-code")}
        />
      )}

      {currentView === "admin-login" && (
        <AdminLogin
          onBack={() => setCurrentView("landing")}
          onSuccess={() => setCurrentView("admin-dashboard")}
        />
      )}

      {currentView === "admin-dashboard" && (
        <AdminDashboard onLogout={() => setCurrentView("landing")} />
      )}
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  );
}
