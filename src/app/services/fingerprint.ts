/**
 * fingerprint.ts
 *
 * Generates a stable device fingerprint based on browser characteristics.
 * This is used to cryptographically bind the ECC public key to a specific
 * physical device/browser.
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

function getOSFamily(): string {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('iphone')) return 'iPhone';
  if (ua.includes('ipad')) return 'iPad';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('macintosh') || ua.includes('mac os x')) {
    // iPad on newer iOS versions requests Desktop site and identifies as Macintosh
    return navigator.maxTouchPoints > 1 ? 'iPad' : 'Mac';
  }
  if (ua.includes('linux')) return 'Linux';
  return 'Unknown';
}

/**
 * Generates a stable DEVICE-level fingerprint.
 * Uses ONLY signals that are identical across ALL browsers on the same
 * physical device — so Chrome, Firefox, Edge, Safari on the same phone/PC
 * all produce the exact same fingerprint.
 *
 * Excluded intentionally (browser-specific, would differ per browser):
 *   - navigator.userAgent / OS string  (Chrome UA ≠ Firefox UA)
 *   - screen.colorDepth                (may differ between browsers)
 *   - navigator.hardwareConcurrency    (some browsers report different values)
 */
export async function generateDeviceFingerprint(): Promise<string> {
  const osFamily = getOSFamily();

  // Only use signals that are 100% device-level, not browser-level:
  const components = [
    // Screen resolution — same for all browsers on the device
    `${Math.max(screen.width, screen.height)}x${Math.min(screen.width, screen.height)}`,
    // Timezone offset — same for all browsers
    new Date().getTimezoneOffset(),
    // Named timezone — same for all browsers
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    // OS family derived from UA — Chrome/Firefox/Edge all report same OS
    osFamily,
  ];

  const rawString = components.join('||');
  
  if (!window.crypto || !window.crypto.subtle) {
    console.warn("Web Crypto API is not available (insecure context). Using fallback fingerprint.");
    let hash = 0;
    for (let i = 0; i < rawString.length; i++) {
      const char = rawString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const fallbackHash = Math.abs(hash).toString(16).padStart(8, '0');
    return `${osFamily}::${fallbackHash}`;
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(rawString);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `${osFamily}::${hashHex}`;
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
    body: JSON.stringify({ email, deviceFingerprint: fingerprint, platform: 'web' }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.detail ?? `Failed to save fingerprint (${response.status})`;
    throw new Error(message);
  }
}
