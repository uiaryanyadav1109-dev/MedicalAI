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

/**
 * Resolves a scannable origin that external smartphones and tablets can reach.
 * When the app is accessed on localhost/127.0.0.1, replaces the hostname with the LAN IP (10.149.6.231)
 * so that camera scans and copied links work on devices across the local network.
 */
export function getScannableOrigin(): string {
  if (typeof window === 'undefined') return 'http://10.149.6.231:3000';
  const { protocol, hostname, port } = window.location;
  const configuredHost = (import.meta as any).env?.VITE_PUBLIC_HOST || '10.149.6.231';
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
    const portSuffix = port ? `:${port}` : '';
    return `${protocol}//${configuredHost}${portSuffix}`;
  }
  return window.location.origin;
}
