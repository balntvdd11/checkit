/**
 * fingerprint.ts
 *
 * Generates a stable device fingerprint based on browser characteristics.
 * This is used to cryptographically bind the ECC public key to a specific
 * physical device/browser.
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

/**
 * Generates a SHA-256 hash based on several browser environment variables.
 */
export async function generateDeviceFingerprint(): Promise<string> {
  const osString = navigator.userAgent.match(/\([^)]+\)/)?.[0] || 'unknown_os';

  const components = [
    navigator.language?.split('-')[0] || 'unknown',
    screen.colorDepth,
    `${Math.max(screen.width, screen.height)}x${Math.min(screen.width, screen.height)}`,
    new Date().getTimezoneOffset(),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency || 'unknown',
    osString
  ];

  const rawString = components.join('||');
  
  if (!window.crypto || !window.crypto.subtle) {
    console.warn("Web Crypto API is not available (insecure context). Using fallback fingerprint.");
    // Simple fast fallback hash if crypto is not available
    let hash = 0;
    for (let i = 0; i < rawString.length; i++) {
      const char = rawString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(rawString);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Sends the student's device fingerprint to the Django backend.
 * POST /api/students/save-fingerprint/  { email, deviceFingerprint }
 */
export async function sendFingerprintToBackend(
  email: string,
  fingerprint: string,
): Promise<void> {
  const url = `${API_BASE}/api/students/save-fingerprint/`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, deviceFingerprint: fingerprint }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.detail ?? `Failed to save fingerprint (${response.status})`;
    throw new Error(message);
  }
}
