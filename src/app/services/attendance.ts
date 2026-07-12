import type { AttendanceRecord } from "../types";
import { MOCK_ATTENDANCE } from "../constants/mockData";
import { apiFetch } from "./api";

function hasAuthToken() {
  return typeof window !== 'undefined' && Boolean(localStorage.getItem('checkit_admin_token'));
}

export const fetchAttendance = async (): Promise<AttendanceRecord[]> => {
  if (!hasAuthToken()) return Promise.resolve(MOCK_ATTENDANCE);
  return apiFetch('/api/attendance/');
};

export const fetchAttendanceFromApi = fetchAttendance;

export const createAttendance = async (record: AttendanceRecord): Promise<AttendanceRecord> => {
  const payload = {
    name: record.name,
    studentId: record.studentId,
    section: record.section,
    date: record.date,
    subject: record.subject,
    status: record.status,
    timeIn: record.timeIn,
    EVENTSCode: record.EVENTSCode,
  };
  return apiFetch('/api/attendance/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const createAttendanceRecord = createAttendance;
