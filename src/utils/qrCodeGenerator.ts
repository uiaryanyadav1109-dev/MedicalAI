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

// Default fallback if running strictly locally
let memoryOrigin: string | null = null;

function isLocalhostHost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '::1' ||
    hostname === '[::1]' ||
    hostname.toLowerCase().includes('localhost')
  );
}

/**
 * Probes the backend server to auto-discover the host machine's actual LAN IP address.
 * On deployed domains (Render, custom domain, etc.), always retains the public origin.
 */
export async function initScannableOrigin(): Promise<string> {
  if (typeof window === 'undefined') return 'http://localhost:3000';

  const { hostname, origin } = window.location;

  // If on a public/deployed domain (Render, custom domain, Vercel, etc.), always use current origin!
  if (!isLocalhostHost(hostname)) {
    memoryOrigin = origin;
    try {
      localStorage.removeItem('medical_ai_scannable_origin');
    } catch {}
    return origin;
  }

  try {
    const res = await fetch('/api/network/host');
    if (res.ok) {
      const data = await res.json();
      if (data?.origin && typeof data.origin === 'string') {
        // Only accept if not hardcoded fake IP
        if (!data.origin.includes('10.149.6.231')) {
          memoryOrigin = data.origin;
          localStorage.setItem('medical_ai_scannable_origin', data.origin);
          return data.origin;
        }
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
 * Clears custom override and restores auto-detected origin.
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
 * Automatically uses current origin on deployed sites, and actual LAN IP on localhost.
 */
export function getScannableOrigin(): string {
  if (typeof window === 'undefined') return 'http://localhost:3000';

  const { protocol, hostname, port, origin } = window.location;

  // 1. In production or on any remote/cloud host (e.g., on Render), always use current origin
  if (!isLocalhostHost(hostname)) {
    return origin;
  }

  // 2. User manual override
  const custom = localStorage.getItem('medical_ai_custom_origin');
  if (custom && custom.trim().length > 0) {
    return custom.trim().replace(/\/$/, '');
  }

  // 3. Memory cache (excluding stale internal IPs)
  if (memoryOrigin && !memoryOrigin.includes('localhost') && !memoryOrigin.includes('127.0.0.1') && !memoryOrigin.includes('10.149.6.231')) {
    return memoryOrigin;
  }

  // 4. Stored server-discovered origin (excluding stale internal IPs)
  const discovered = localStorage.getItem('medical_ai_scannable_origin');
  if (discovered && !discovered.includes('localhost') && !discovered.includes('127.0.0.1') && !discovered.includes('10.149.6.231')) {
    memoryOrigin = discovered;
    return discovered;
  }

  const configuredHost = (import.meta as any).env?.VITE_PUBLIC_HOST;
  if (configuredHost) {
    const portSuffix = port ? `:${port}` : ':3000';
    return `${protocol}//${configuredHost}${portSuffix}`;
  }

  return origin;
}
