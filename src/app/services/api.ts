const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

function getToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem('checkit_admin_token') : null;
}

function getHeaders(additionalHeaders: Record<string, string> = {}) {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Token ${token}` } : {}),
    ...additionalHeaders,
  };
}

async function handleResponse(response: Response) {
  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.detail || response.statusText || 'API request failed';
    throw new Error(message);
  }
  return data;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: getHeaders(options.headers as Record<string, string>),
  });
  return handleResponse(response);
}
