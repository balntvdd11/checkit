/**
 * browserActivation.ts
 *
 * ECC key pair generation and browser activation utilities.
 *
 * - Generates a P-256 ECDSA key pair using the Web Crypto API.
 * - Stores the PRIVATE KEY (JWK-encoded) and PUBLIC KEY (PEM-encoded SPKI) in localStorage,
 *   scoped to the student's email so multiple accounts on the same browser are isolated.
 * - Sends the PUBLIC KEY (PEM-encoded SPKI) to the Django backend.
 *
 * The private key is marked non-extractable for export but is stored as JWK
 * so it can be re-imported on subsequent visits without re-generating.
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

// ── Key storage helpers ────────────────────────────────────────────────────────

/** localStorage key for a given student email's private key. */
function privateKeyStorageKey(email: string): string {
  return `checkit:privateKey:${email.trim().toLowerCase()}`;
}

/** localStorage key for a given student email's public key. */
function publicKeyStorageKey(email: string): string {
  return `checkit:publicKey:${email.trim().toLowerCase()}`;
}

/** Returns true if this browser already has a stored private key for the email. */
export function hasStoredPrivateKey(email: string): boolean {
  return localStorage.getItem(privateKeyStorageKey(email)) !== null;
}

export function getStoredPublicKey(email: string): string | null {
  return localStorage.getItem(publicKeyStorageKey(email));
}

// ── PEM encoding helper ────────────────────────────────────────────────────────

/** Converts a raw ArrayBuffer to a Base64 string. */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/** Wraps a Base64 DER string in PEM headers. */
function toPEM(base64: string, type: string): string {
  const lines = base64.match(/.{1,64}/g) ?? [];
  return `-----BEGIN ${type}-----\n${lines.join('\n')}\n-----END ${type}-----`;
}

// ── Core ECC operations ────────────────────────────────────────────────────────

export interface GeneratedKeyPair {
  /** PEM-encoded SPKI public key — sent to the backend. */
  publicKeyPem: string;
  /** JWK-encoded private key — stored in localStorage. */
  privateKeyJwk: JsonWebKey;
}

/**
 * Generates a new P-256 ECDSA key pair.
 * The private key is marked extractable=true only so we can serialize it to
 * JWK for localStorage; it is never sent over the network.
 */
export async function generateECCKeyPair(): Promise<GeneratedKeyPair> {
  if (!window.crypto || !window.crypto.subtle) {
    console.warn("Web Crypto API is not available (insecure context). Using fallback keys for development.");
    const dummyKey = "mock-key-" + Date.now();
    return {
      publicKeyPem: `-----BEGIN PUBLIC KEY-----\n${dummyKey}\n-----END PUBLIC KEY-----`,
      privateKeyJwk: { kty: "mock", k: dummyKey } as unknown as JsonWebKey
    };
  }

  const keyPair = await window.crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true, // extractable — needed to export to JWK for local storage
    ['sign', 'verify'],
  );

  // Export public key as SPKI → PEM
  const spkiBuffer = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
  const publicKeyPem = toPEM(arrayBufferToBase64(spkiBuffer), 'PUBLIC KEY');

  // Export private key as JWK for local storage
  const privateKeyJwk = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);

  return { publicKeyPem, privateKeyJwk };
}

/**
 * Persists the private key (JWK) in localStorage, scoped to the student email.
 * Overwrites any previously stored key for this email.
 */
export function storePrivateKey(email: string, privateKeyJwk: JsonWebKey): void {
  localStorage.setItem(privateKeyStorageKey(email), JSON.stringify(privateKeyJwk));
}

/**
 * Persists the public key (PEM) in localStorage, scoped to the student email.
 */
export function storePublicKey(email: string, publicKeyPem: string): void {
  localStorage.setItem(publicKeyStorageKey(email), publicKeyPem);
}

/**
 * Sends the student's ECC public key to the Django backend.
 * POST /api/students/save-public-key/  { email, publicKey }
 */
export async function sendPublicKeyToBackend(
  email: string,
  publicKeyPem: string,
): Promise<void> {
  const url = `${API_BASE}/api/students/save-public-key/`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, publicKey: publicKeyPem, platform: 'web' }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.detail ?? `Failed to save public key (${response.status})`;
    throw new Error(message);
  }
}

import { fetchStudentByEmail } from './studentCheck';
import { generateDeviceFingerprint, sendFingerprintToBackend } from './fingerprint';

/**
 * Full browser-activation sequence:
 *   1. Check if keys already exist for this browser (switching logic).
 *   2. Generate ECC key pair if they don't exist.
 *   3. Store the keys in localStorage.
 *   4. Send the public key to the Django backend, making this browser the active one.
 *
 * Throws if any step fails.
 */
export async function activateBrowser(email: string): Promise<void> {
  let publicKeyPem = getStoredPublicKey(email);
  const hasPrivateKey = hasStoredPrivateKey(email);

  if (!publicKeyPem || !hasPrivateKey) {
    const keys = await generateECCKeyPair();
    publicKeyPem = keys.publicKeyPem;
    storePrivateKey(email, keys.privateKeyJwk);
    storePublicKey(email, keys.publicKeyPem);
  }

  const fingerprint = await generateDeviceFingerprint();
  const record = await fetchStudentByEmail(email);

  let finalPublicKey = publicKeyPem;
  let finalFingerprint = fingerprint;

  await sendPublicKeyToBackend(email, finalPublicKey);
  await sendFingerprintToBackend(email, finalFingerprint);
}

