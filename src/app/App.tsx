import { useState, useEffect } from "react";
import { useClerk } from "@clerk/clerk-react";
import LandingPage from "./pages/Landing/Landing";
import StudentAuthGate from "./pages/StudentAuth/StudentAuth";
import StudentRegistration from "./pages/StudentRegistration/StudentRegistration";
import BrowserActivation from "./pages/BrowserActivation/BrowserActivation";
import EVENTSCodeEntry from "./pages/EVENTSCode/EVENTSCode";
import QRPassGenerator from "./pages/QRPass/QRPass";
import StudentDashboard from "./pages/StudentDashboard/StudentDashboard";
import AdminLogin from "./pages/AdminLogin/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import { StoreProvider, useStore } from "./state/store";
import { fetchEvents } from "./services/events";
import { fetchStudents } from "./services/students";
import { fetchAttendance } from "./services/attendance";
import { fetchStudentByEmail } from "./services/studentCheck";

import type { View, Student } from "./types";

function AppInner() {
  const [currentView, setCurrentView] = useState<View>(() => {
    // After Google OAuth, the browser reloads the entire SPA and currentView
    // would reset to "landing", making StudentAuthGate unmount before the email
    // check can run.  We write "student-auth" to sessionStorage just before the
    // redirect (in StudentAuth.tsx) so we can restore the correct view here.
    if (sessionStorage.getItem("clerk-oauth-intent") === "student-auth") {
      return "student-auth";
    }
    return "landing";
  });
  const { state, dispatch } = useStore();

  // Student Flow State
  const [currentStudentEmail, setCurrentStudentEmail] = useState<string>("");
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [currentEVENTSCode, setCurrentEVENTSCode] = useState<string>("");
  const clerk = useClerk();

  const handleStudentLogout = async () => {
    await clerk.signOut();
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

  return (
    <>
      {currentView === "landing" && (
        <LandingPage
          onStudent={() => setCurrentView("student-auth")}
          onAdmin={() => setCurrentView("admin-login")}
        />
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
            // Existing student — fetch their record and go directly to dashboard
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
              }
            } catch {
              // If fetch fails we still navigate; dashboard will show what it can
            }
            setCurrentView("student-dashboard");
          }}
        />
      )}

      {currentView === "student-register" && (
        <StudentRegistration
          email={currentStudentEmail}
          onBack={() => setCurrentView("student-auth")}
          onSubmit={(studentData) => {
            // Registration saved to backend — go straight to dashboard
            setCurrentStudent(studentData);
            setCurrentView("student-dashboard");
          }}
        />
      )}

      {currentView === "student-activation" && currentStudent && (
        <BrowserActivation
          student={currentStudent}
          hasConflict={currentStudentEmail === "maria.santos@student.ua.edu.ph"} // mock conflict for UI demo
          onCancel={() => setCurrentView("student-auth")}
          onActivate={() => setCurrentView("student-dashboard")}
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
