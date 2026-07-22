// ─── Types ────────────────────────────────────────────────────────────────────

export type View =
  | "landing"
  | "student-resolving"
  | "student-auth"
  | "student-register"
  | "student-activation"
  | "student-device-conflict"
  | "student-EVENTS-code"
  | "student-qr-pass"
  | "student-dashboard"
  | "admin-login"
  | "admin-dashboard"
  | "in-app-browser-warning";

export type AdminTab = "dashboard" | "students" | "create-event" | "scanner" | "reports";
export type AttendanceStatus = "present" | "late" | "absent";
export type EVENTSStatus = "active" | "completed" | "inactive";
export type EventStatus = "active" | "inactive" | "archived";

export interface Student {
  name: string;
  section: string;
  studentId: string;
  email: string;
}

export interface AttendanceRecord {
  name: string;
  studentId: string;
  email?: string;
  date: string;
  subject: string;
  section: string;
  status: AttendanceStatus;
  timeIn: string;
  timeOut?: string;
  EVENTSCode: string;
}
export interface EVENTS {
  id: string;
  code: string;
  section: string;
  subject: string;
  date: string;
  timeStart: string;
  lateThreshold: string;
  timeEnd: string;
  status: EVENTSStatus;
}

export interface EventConfig {
  id: string;
  name: string;
  checkItCode: string;
  date?: string;
  timeIn: string;
  lateThreshold: string;
  timeOut: string;
  status: EventStatus;
}

export interface StudentRecord {
  id?: string;
  name: string;
  studentId: string;
  section: string;
  email: string;
  registered: boolean;
  registeredAt: string;
}
