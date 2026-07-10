import type { AttendanceRecord, Session, EventConfig, StudentRecord } from "../types";

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { date: "Jul 3, 2025", subject: "Software Engineering", section: "BSIT 3A", status: "present", timeIn: "07:58 AM", sessionCode: "CIT-2025-041" },
  { date: "Jul 2, 2025", subject: "Web Development",      section: "BSIT 3A", status: "late",    timeIn: "09:22 AM", sessionCode: "CIT-2025-040" },
  { date: "Jul 1, 2025", subject: "Database Management",  section: "BSIT 3A", status: "present", timeIn: "08:02 AM", sessionCode: "CIT-2025-039" },
  { date: "Jun 30, 2025", subject: "Software Engineering",section: "BSIT 3A", status: "absent",  timeIn: "—",        sessionCode: "CIT-2025-038" },
  { date: "Jun 28, 2025", subject: "Web Development",     section: "BSIT 3A", status: "present", timeIn: "08:00 AM", sessionCode: "CIT-2025-037" },
  { date: "Jun 27, 2025", subject: "Database Management", section: "BSIT 3A", status: "present", timeIn: "07:55 AM", sessionCode: "CIT-2025-036" },
  { date: "Jun 26, 2025", subject: "Software Engineering",section: "BSIT 3A", status: "late",    timeIn: "08:19 AM", sessionCode: "CIT-2025-035" },
];

export const MOCK_SESSIONS: Session[] = [
  { id: "s1", code: "CIT-2025-042", section: "BSIT 3A", subject: "Software Engineering", date: "Jul 4, 2025", timeStart: "08:00 AM", lateThreshold: "08:15 AM", timeEnd: "09:30 AM", status: "active" },
  { id: "s2", code: "CIT-2025-041", section: "BSIT 3B", subject: "Web Development",      date: "Jul 3, 2025", timeStart: "10:00 AM", lateThreshold: "10:15 AM", timeEnd: "11:30 AM", status: "completed" },
  { id: "s3", code: "CIT-2025-040", section: "BSIT 2A", subject: "Database Management",  date: "Jul 3, 2025", timeStart: "01:00 PM", lateThreshold: "01:15 PM", timeEnd: "02:30 PM", status: "completed" },
  { id: "s4", code: "CIT-2025-039", section: "BSIT 3A", subject: "Software Engineering", date: "Jul 2, 2025", timeStart: "08:00 AM", lateThreshold: "08:15 AM", timeEnd: "09:30 AM", status: "completed" },
];

export const MOCK_EVENTS: EventConfig[] = [
  { id: "e1", name: "Orientation Session",      checkItCode: "ORIENT", timeIn: "08:00", lateThreshold: "08:15", timeOut: "09:30", status: "active" },
  { id: "e2", name: "Campus Tour",              checkItCode: "CAMPUS", timeIn: "10:00", lateThreshold: "10:15", timeOut: "11:30", status: "inactive" },
  { id: "e3", name: "Workshop: QR Attendance",  checkItCode: "WRKQR",  timeIn: "13:00", lateThreshold: "13:15", timeOut: "14:30", status: "inactive" },
];

export const MOCK_STUDENTS: StudentRecord[] = [
  { name: "Maria Clara Santos",   studentId: "2023001321", section: "BSIT 3A", email: "maria.santos@student.ua.edu.ph",   registered: true,  registeredAt: "Jan 15, 2025" },
  { name: "Juan Paolo Reyes",     studentId: "2023001342", section: "BSIT 3A", email: "juan.reyes@student.ua.edu.ph",     registered: true,  registeredAt: "Jan 15, 2025" },
  { name: "Ana Gabrielle Cruz",   studentId: "2023001356", section: "BSIT 3B", email: "ana.cruz@student.ua.edu.ph",       registered: true,  registeredAt: "Jan 16, 2025" },
  { name: "Miguel Andrei Bautista",studentId: "2022001198",section: "BSIT 2A", email: "miguel.bautista@student.ua.edu.ph",registered: true,  registeredAt: "Jan 14, 2025" },
  { name: "Sofia Isabelle Ramos", studentId: "2023001388", section: "BSIT 3A", email: "sofia.ramos@student.ua.edu.ph",    registered: false, registeredAt: "—" },
  { name: "Carlos David Mendoza", studentId: "2023001401", section: "BSIT 3B", email: "carlos.mendoza@student.ua.edu.ph", registered: true,  registeredAt: "Jan 17, 2025" },
  { name: "Bianca Rose Torres",   studentId: "2022001212", section: "BSIT 2A", email: "bianca.torres@student.ua.edu.ph",  registered: true,  registeredAt: "Jan 15, 2025" },
];

export const MOCK_REPORT_RECORDS = [
  { ...MOCK_STUDENTS[0], status: "present" as const, timeIn: "08:02 AM", date: "2025-07-04" },
  { ...MOCK_STUDENTS[1], status: "late"    as const, timeIn: "08:17 AM", date: "2025-07-04" },
  { ...MOCK_STUDENTS[2], status: "present" as const, timeIn: "08:00 AM", date: "2025-07-03" },
  { ...MOCK_STUDENTS[3], status: "absent"  as const, timeIn: "—",        date: "2025-07-04" },
  { ...MOCK_STUDENTS[4], status: "present" as const, timeIn: "07:59 AM", date: "2025-07-04" },
  { ...MOCK_STUDENTS[5], status: "present" as const, timeIn: "08:05 AM", date: "2025-07-03" },
  { ...MOCK_STUDENTS[6], status: "late"    as const, timeIn: "08:22 AM", date: "2025-07-04" },
];
