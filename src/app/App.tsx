import { useState } from "react";
import LandingPage from "./pages/Landing/Landing";
import StudentAuthGate from "./pages/StudentAuth/StudentAuth";
import StudentRegistration from "./pages/StudentRegistration/StudentRegistration";
import BrowserActivation from "./pages/BrowserActivation/BrowserActivation";
import SessionCodeEntry from "./pages/SessionCode/SessionCode";
import QRPassGenerator from "./pages/QRPass/QRPass";
import StudentDashboard from "./pages/StudentDashboard/StudentDashboard";
import AdminLogin from "./pages/AdminLogin/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";

import type { View, Student, EventConfig } from "./types";
import { MOCK_EVENTS, MOCK_STUDENTS } from "./constants/mockData";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("landing");
  const [events, setEvents] = useState<EventConfig[]>(MOCK_EVENTS);

  // Student Flow State
  const [currentStudentEmail, setCurrentStudentEmail] = useState<string>("");
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [currentSessionCode, setCurrentSessionCode] = useState<string>("");

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
            setCurrentStudentEmail(email);
            const found = MOCK_STUDENTS.find(s => s.email === email && s.registered);
            if (found) {
              setCurrentStudent({ name: found.name, section: found.section, studentId: found.studentId, email });
              setCurrentView("student-activation");
            } else {
              setCurrentView("student-register");
            }
          }}
        />
      )}

      {currentView === "student-register" && (
        <StudentRegistration
          email={currentStudentEmail}
          onBack={() => setCurrentView("student-auth")}
          onSubmit={(studentData) => {
            setCurrentStudent(studentData);
            setCurrentView("student-activation");
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
          onLogout={() => setCurrentView("landing")}
          onGeneratePass={() => setCurrentView("student-session-code")}
        />
      )}

      {currentView === "student-session-code" && currentStudent && (
        <SessionCodeEntry
          student={currentStudent}
          events={events}
          onLogout={() => setCurrentView("landing")}
          onViewHistory={() => setCurrentView("student-dashboard")}
          onSubmit={(code) => {
            setCurrentSessionCode(code);
            setCurrentView("student-qr-pass");
          }}
        />
      )}

      {currentView === "student-qr-pass" && currentStudent && (
        <QRPassGenerator
          student={currentStudent}
          sessionCode={currentSessionCode}
          onLogout={() => setCurrentView("landing")}
          onBack={() => setCurrentView("student-session-code")}
        />
      )}

      {currentView === "admin-login" && (
        <AdminLogin
          onBack={() => setCurrentView("landing")}
          onSuccess={() => setCurrentView("admin-dashboard")}
        />
      )}

      {currentView === "admin-dashboard" && (
        <AdminDashboard
          events={events}
          setEvents={setEvents}
          onLogout={() => setCurrentView("landing")}
        />
      )}
    </>
  );
}
