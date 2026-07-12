const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

export interface StudentData {
  id?: number;
  name: string;
  studentId: string;
  section: string;
  email: string;
  registered: boolean;
  registeredAt: string;
  deviceFingerprint?: string;
}

/**
 * Checks whether a student with the given email exists in the database.
 * Public endpoint — no admin token required.
 */
export async function checkStudentExists(email: string): Promise<boolean> {
  const url = `${API_BASE}/api/students/check/?email=${encodeURIComponent(email)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Backend check failed: ${response.statusText}`);
  const data: { exists: boolean } = await response.json();
  return data.exists;
}

/**
 * Fetches the full student record by email.
 * Public endpoint — no admin token required.
 * Returns null if not found.
 */
export async function fetchStudentByEmail(email: string): Promise<StudentData | null> {
  const url = `${API_BASE}/api/students/by-email/?email=${encodeURIComponent(email)}`;
  const response = await fetch(url);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Failed to fetch student: ${response.statusText}`);
  return response.json() as Promise<StudentData>;
}

/**
 * Registers a new student in the backend.
 * Public endpoint — no admin token required.
 */
export async function registerStudent(data: Omit<StudentData, "id">): Promise<StudentData> {
  const url = `${API_BASE}/api/students/register/`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.studentId?.[0] || body?.email?.[0] || body?.detail || "Registration failed.";
    throw new Error(message);
  }
  return response.json() as Promise<StudentData>;
}
