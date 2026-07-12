export interface LoginResponse {
  token: string;
  username: string;
  is_staff: boolean;
}

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = body?.detail || "Login failed";
    throw new Error(message);
  }

  return res.json();
}
