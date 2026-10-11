import QRCode from 'qrcode';

export interface QrCodeOptions {
  width?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Generates a real, scannable machine-readable PNG Data URL for any arbitrary text/URL.
 * Compatible with smartphone cameras, Google Lens, and iOS Camera.
 */
export async function generateQrDataUrl(
  text: string,
  options: QrCodeOptions = {}
): Promise<string> {
  const {
    width = 280,
    margin = 2,
    darkColor = '#0f172a',
    lightColor = '#ffffff',
    errorCorrectionLevel = 'M'
  } = options;

  try {
    return await QRCode.toDataURL(text, {
      width,
      margin,
      color: {
        dark: darkColor,
        light: lightColor
      },
      errorCorrectionLevel
    });
  } catch (err) {
    console.error('Failed to generate real QR code:', err);
    throw err;
  }
}

// Default fallback IP if network probing is offline
const DEFAULT_FALLBACK_LAN_IP = '10.149.6.231';
let memoryOrigin: string | null = null;

/**
 * Probes the backend server to auto-discover the host machine's actual LAN IP address.
 */
export async function initScannableOrigin(): Promise<string> {
  if (typeof window === 'undefined') return `http://${DEFAULT_FALLBACK_LAN_IP}:3000`;

  try {
    const res = await fetch('/api/network/host');
    if (res.ok) {
      const data = await res.json();
      if (data?.origin && typeof data.origin === 'string') {
        memoryOrigin = data.origin;
        localStorage.setItem('medical_ai_scannable_origin', data.origin);
        return data.origin;
      }
    }
  } catch {
    // Keep cached or fallback origin
  }

  return getScannableOrigin();
}

// Auto-trigger probing on browser load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    initScannableOrigin().catch(() => {});
  }, 100);
}

/**
 * Explicitly sets a custom reachable host/origin (e.g., from QR modal settings).
 */
export function setCustomScannableOrigin(customOrigin: string): void {
  if (typeof window !== 'undefined') {
    const clean = customOrigin.trim().replace(/\/$/, '');
    if (clean) {
      localStorage.setItem('medical_ai_custom_origin', clean);
      memoryOrigin = clean;
    } else {
      localStorage.removeItem('medical_ai_custom_origin');
    }
  }
}

/**
 * Clears custom override and restores auto-detected LAN IP.
 */
export function resetScannableOrigin(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('medical_ai_custom_origin');
    memoryOrigin = null;
    initScannableOrigin().catch(() => {});
  }
}

/**
 * Resolves a scannable origin that external smartphones and tablets can reach.
 * Automatically strips localhost/127.0.0.1/::1 and substitutes the machine's real LAN IP.
 */
export function getScannableOrigin(): string {
  if (typeof window === 'undefined') return `http://${DEFAULT_FALLBACK_LAN_IP}:3000`;

  // 1. User manual override
  const custom = localStorage.getItem('medical_ai_custom_origin');
  if (custom && custom.trim().length > 0) {
    return custom.trim().replace(/\/$/, '');
  }

  // 2. Memory cache
  if (memoryOrigin && !memoryOrigin.includes('localhost') && !memoryOrigin.includes('127.0.0.1')) {
    return memoryOrigin;
  }

  // 3. Stored server-discovered origin
  const discovered = localStorage.getItem('medical_ai_scannable_origin');
  if (discovered && !discovered.includes('localhost') && !discovered.includes('127.0.0.1')) {
    memoryOrigin = discovered;
    return discovered;
  }

  const { protocol, hostname, port } = window.location;
  const isLocalhost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '::1' ||
    hostname === '[::1]' ||
    hostname.toLowerCase().includes('localhost');

  if (isLocalhost) {
    const configuredHost =
      (import.meta as any).env?.VITE_PUBLIC_HOST ||
      DEFAULT_FALLBACK_LAN_IP;
    const portSuffix = port ? `:${port}` : ':3000';
    return `${protocol}//${configuredHost}${portSuffix}`;
  }

  return window.location.origin;
}
