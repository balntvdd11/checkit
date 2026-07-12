import type { StudentRecord } from "../types";
import { MOCK_STUDENTS } from "../constants/mockData";
import { apiFetch } from "./api";

function hasAuthToken() {
  return typeof window !== 'undefined' && Boolean(localStorage.getItem('checkit_admin_token'));
}

export const fetchStudents = async (): Promise<StudentRecord[]> => {
  if (!hasAuthToken()) return Promise.resolve(MOCK_STUDENTS);
  return apiFetch('/api/students/');
};

export const fetchStudentsFromApi = fetchStudents;

export const createStudent = async (student: StudentRecord): Promise<StudentRecord> => {
  const payload = {
    name: student.name,
    studentId: student.studentId,
    section: student.section,
    email: student.email,
    registered: student.registered,
    registeredAt: student.registeredAt,
  };
  return apiFetch('/api/students/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateStudent = async (student: StudentRecord): Promise<StudentRecord> => {
  const payload = {
    name: student.name,
    studentId: student.studentId,
    section: student.section,
    email: student.email,
    registered: student.registered,
    registeredAt: student.registeredAt,
  };
  return apiFetch(`/api/students/${student.id}/`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};
