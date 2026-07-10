// ─── Types ────────────────────────────────────────────────────────────────────

export type View =
  | "landing"
  | "student-auth"
  | "student-register"
  | "student-activation"
  | "student-device-conflict"
  | "student-session-code"
  | "student-qr-pass"
  | "student-dashboard"
  | "admin-login"
  | "admin-dashboard";

export type AdminTab = "dashboard" | "students" | "create-event" | "scanner" | "reports";
export type AttendanceStatus = "present" | "late" | "absent";
export type SessionStatus = "active" | "completed" | "inactive";
export type EventStatus = "active" | "inactive";

export interface Student {
  name: string;
  section: string;
  studentId: string;
  email: string;
}

export interface AttendanceRecord {
  date: string;
  subject: string;
  section: string;
  status: AttendanceStatus;
  timeIn: string;
  sessionCode: string;
}

export interface Session {
  id: string;
  code: string;
  section: string;
  subject: string;
  date: string;
  timeStart: string;
  lateThreshold: string;
  timeEnd: string;
  status: SessionStatus;
}

export interface EventConfig {
  id: string;
  name: string;
  checkItCode: string;
  timeIn: string;
  lateThreshold: string;
  timeOut: string;
  status: EventStatus;
}

export interface StudentRecord {
  name: string;
  studentId: string;
  section: string;
  email: string;
  registered: boolean;
  registeredAt: string;
}
