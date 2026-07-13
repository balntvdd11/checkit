import type { AttendanceRecord } from "../types";
import { MOCK_ATTENDANCE } from "../constants/mockData";
import { apiFetch } from "./api";



export const fetchAttendance = async (): Promise<AttendanceRecord[]> => {
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

export const updateAttendance = async (id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord> => {
  return apiFetch(`/api/attendance/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
};

export const updateAttendanceRecord = updateAttendance;
