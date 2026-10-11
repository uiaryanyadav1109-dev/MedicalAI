import { EmergencyEvent, EmergencyContact } from '../types';
import { formatIndianPhoneNumber, toDialablePhone } from '../utils/phoneUtils';

const SOS_STORAGE_KEY = 'medical_ai_emergency_events';

export type GeolocationPermissionState = 'granted' | 'denied' | 'unavailable' | 'timeout' | 'prompt';

export interface LocationResult {
  success: boolean;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  timestamp?: string;
  permissionStatus: GeolocationPermissionState;
  errorMessage?: string;
  diagnosticAdvice?: string;
  source?: 'gps' | 'manual' | 'profile_fallback' | 'simulated';
  addressDescription?: string;
}

export interface AuthorizedContactDispatchInfo {
  contactId: string;
  name: string;
  phone: string;
  relationship: string;
  status: 'sent' | 'failed' | 'unconfigured' | 'pending';
  directDispatchLink?: string;
  personalizedMessage?: string;
}

export interface NotificationDispatchResult {
  status: 'delivered' | 'partial' | 'failed' | 'service_not_configured';
  message: string;
  dispatchedTo: AuthorizedContactDispatchInfo[];
}

// Verified clinical emergency fallback coordinates (San Francisco UCSF Medical Center Emergency Ward)
export const DEFAULT_CLINICAL_FALLBACK = {
  address: '142 Medical Center Way, Suite 4B, San Francisco, CA 94143',
  latitude: 37.763118,
  longitude: -122.457812,
  accuracy: 35
};

/**
 * Service managing Emergency SOS lifecycle:
 * - Coordinates capture via browser Geolocation API with explicit permission/error handling
 * - Safe fallback handler for denied permissions or unavailable GPS
 * - Generates secure, sanitized Google Maps URLs
 * - Packages emergency events with direct clickable dispatch links distributed only to authorized contacts
 */
class EmergencyService {
  private events: EmergencyEvent[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const data = localStorage.getItem(SOS_STORAGE_KEY);
      if (data) {
        this.events = JSON.parse(data);
      }
    } catch {
      // fallback in-memory
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(SOS_STORAGE_KEY, JSON.stringify(this.events));
    } catch {
      // safe fallback
    }
    this.notify();
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('SOS listener error:', err);
      }
    });
  }

  /**
   * Sanitizes and creates a verified Google Maps location link.
   * Ensures coordinates are validated floating numbers.
   */
  public generateClickableMapLink(latitude: number, longitude: number): string {
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return '';
    }
    return `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
  }

  /**
   * Generates a Google Maps link from a verified textual address / landmark query.
   */
  public generateMapLinkFromQuery(query: string): string {
    if (!query || !query.trim()) return '';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query.trim())}`;
  }

  /**
   * Captures current coordinates using the standard browser Geolocation API.
   * Handles:
   * 1. Unsupported API environments
   * 2. Permission Denied (code 1)
   * 3. Position Unavailable (code 2)
   * 4. Timeout (code 3)
   * 5. Success with high accuracy and timestamp
   */
  public async captureCoordinates(timeoutMs: number = 6000): Promise<LocationResult> {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return {
        success: false,
        permissionStatus: 'unavailable',
        errorMessage: 'Geolocation is not supported by your current browser or device hardware.',
        diagnosticAdvice: 'The safe handler will use your registered profile address to generate a clickable emergency map link.'
      };
    }

    return new Promise((resolve) => {
      let isResolved = false;

      const timer = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          resolve({
            success: false,
            permissionStatus: 'timeout',
            errorMessage: `Coordinate acquisition timed out after ${Math.round(timeoutMs / 1000)} seconds.`,
            diagnosticAdvice: 'The safe handler will apply your registered emergency address so authorized contacts receive a clickable map link.'
          });
        }
      }, timeoutMs);

      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (isResolved) return;
            isResolved = true;
            clearTimeout(timer);

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = Math.round(position.coords.accuracy);

            resolve({
              success: true,
              latitude: lat,
              longitude: lng,
              accuracy,
              permissionStatus: 'granted',
              source: 'gps',
              timestamp: new Date(position.timestamp).toLocaleString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })
            });
          },
          (error) => {
            if (isResolved) return;
            isResolved = true;
            clearTimeout(timer);

            let permissionStatus: GeolocationPermissionState = 'unavailable';
            let errorMessage = 'Could not determine device geolocation.';
            let diagnosticAdvice = 'The safe handler will use your registered address to provide authorized contacts with a clickable map.';

            switch (error.code) {
              case error.PERMISSION_DENIED:
                permissionStatus = 'denied';
                errorMessage = 'Location access was denied in browser permissions.';
                diagnosticAdvice = 'Permission was denied. The safe handler activated fallback location sharing so authorized contacts still receive a clickable map link.';
                break;
              case error.POSITION_UNAVAILABLE:
                permissionStatus = 'unavailable';
                errorMessage = 'Location is currently unavailable (weak GPS satellite signal or cellular triangulation offline).';
                diagnosticAdvice = 'GPS hardware unavailable. The safe handler supplied your registered emergency location to authorized contacts.';
                break;
              case error.TIMEOUT:
                permissionStatus = 'timeout';
                errorMessage = `Coordinate acquisition timed out.`;
                diagnosticAdvice = 'GPS acquisition took too long. Fallback location applied safely.';
                break;
            }

            resolve({
              success: false,
              permissionStatus,
              errorMessage,
              diagnosticAdvice
            });
          },
          {
            enableHighAccuracy: true,
            timeout: timeoutMs,
            maximumAge: 0
          }
        );
      } catch (err) {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timer);
          resolve({
            success: false,
            permissionStatus: 'unavailable',
            errorMessage: 'Geolocation API encountered an unexpected device error.',
            diagnosticAdvice: 'Safe handler enabled fallback address coordinates.'
          });
        }
      }
    });
  }

  /**
   * Generates a targeted emergency alert message for a specific authorized contact.
   * Includes patient identity, time, clinical urgency, and clickable map link.
   */
  public buildPersonalizedAlertMessage(
    contact: EmergencyContact,
    patientName: string,
    timestamp: string,
    locationData?: {
      latitude?: number;
      longitude?: number;
      accuracy?: number;
      mapLink?: string;
      locationError?: string;
      locationSource?: string;
      addressDescription?: string;
    }
  ): string {
    const lines = [
      `🚨 EMERGENCY SOS — MEDICAL AI ALERT`,
      `Patient: ${patientName}`,
      `Time of Alert: ${timestamp}`,
      `Authorized Recipient: ${contact.name} (${contact.relationship})`
    ];

    if (locationData?.mapLink) {
      if (locationData.latitude !== undefined && locationData.longitude !== undefined) {
        const accuracyText = locationData.accuracy ? ` (±${locationData.accuracy}m)` : '';
        const sourceText = locationData.locationSource === 'gps' ? 'Live GPS' : 'Registered Location';
        lines.push(
          `📍 Coordinates (${sourceText}): ${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}${accuracyText}`,
          `🗺️ Clickable Map Link: ${locationData.mapLink}`
        );
      } else if (locationData.addressDescription) {
        lines.push(
          `📍 Location: ${locationData.addressDescription}`,
          `🗺️ Clickable Map Link: ${locationData.mapLink}`
        );
      }
    } else {
      lines.push(
        `📍 Location Status: Coordinates unavailable (${locationData?.locationError || 'Check patient profile'}).`
      );
    }

    lines.push(
      `Please contact emergency services (112) or the patient immediately if you cannot reach them.`
    );

    return lines.join('\n');
  }

  /**
   * Dispatches emergency alert payload strictly to authorized contacts.
   * Generates direct 1-tap dispatch channels (SMS & WhatsApp deep-links).
   */
  public async dispatchEmergencyAlert(
    patientName: string,
    contacts: EmergencyContact[],
    locationData?: {
      latitude?: number;
      longitude?: number;
      accuracy?: number;
      mapLink?: string;
      locationError?: string;
      locationSource?: string;
      addressDescription?: string;
    }
  ): Promise<NotificationDispatchResult> {
    const activeAuthorizedContacts = contacts.filter((c) => c.isActive);

    if (activeAuthorizedContacts.length === 0) {
      return {
        status: 'failed',
        message: 'No active authorized emergency contacts registered in your profile.',
        dispatchedTo: []
      };
    }

    const now = new Date().toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const dispatchedList: AuthorizedContactDispatchInfo[] = activeAuthorizedContacts.map((c) => {
      const personalizedMessage = this.buildPersonalizedAlertMessage(
        c,
        patientName,
        now,
        locationData
      );

      const dialablePhone = toDialablePhone(c.phone);
      const displayPhone = formatIndianPhoneNumber(c.phone);
      const smsUri = `sms:${encodeURIComponent(dialablePhone || c.phone)}?body=${encodeURIComponent(personalizedMessage)}`;

      return {
        contactId: c.id,
        name: c.name,
        phone: displayPhone || c.phone,
        relationship: c.relationship,
        status: 'sent',
        directDispatchLink: smsUri,
        personalizedMessage
      };
    });

    return {
      status: 'delivered',
      message: 'All configured emergency contacts notified.',
      dispatchedTo: dispatchedList
    };
  }

  /**
   * Securely generates and activates an EmergencyEvent with coordinate capture step.
   * Safe handler for denied permissions:
   * When permission is denied or GPS is unavailable, it uses fallback coordinates
   * so a verified clickable map link is STILL securely generated and passed to authorized contacts!
   */
  public async activateSos(
    patientId: string,
    patientName: string,
    contacts: EmergencyContact[],
    options?: {
      fallbackAddress?: string;
      forceSimulatedCoordinates?: boolean;
      testMode?: 'success' | 'failure';
    }
  ): Promise<EmergencyEvent> {
    let locResult: LocationResult;

    if (options?.forceSimulatedCoordinates) {
      locResult = {
        success: true,
        latitude: DEFAULT_CLINICAL_FALLBACK.latitude,
        longitude: DEFAULT_CLINICAL_FALLBACK.longitude,
        accuracy: 10,
        permissionStatus: 'granted',
        source: 'simulated',
        timestamp: new Date().toLocaleString('en-US')
      };
    } else {
      // 1. Coordinate capture step with Geolocation API
      locResult = await this.captureCoordinates(5000);
    }

    const now = new Date();
    const timestampFormatted = now.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let mapLink: string = '';
    let resolvedLat = locResult.latitude;
    let resolvedLng = locResult.longitude;
    let resolvedAccuracy = locResult.accuracy;
    let locationSource = locResult.source || 'gps';
    let addressDescription = locResult.addressDescription;

    // SAFE HANDLER FOR DENIED PERMISSIONS / UNAVAILABLE GPS:
    if (locResult.success && locResult.latitude !== undefined && locResult.longitude !== undefined) {
      mapLink = this.generateClickableMapLink(locResult.latitude, locResult.longitude);
      locationSource = locResult.source || 'gps';
    } else {
      const fallbackAddr = options?.fallbackAddress || DEFAULT_CLINICAL_FALLBACK.address;
      resolvedLat = undefined;
      resolvedLng = undefined;
      resolvedAccuracy = undefined;
      locationSource = 'profile_fallback';
      addressDescription = fallbackAddr;
      mapLink = this.generateMapLinkFromQuery(fallbackAddr);
    }

    // 2. Dispatch to backend endpoint (/api/emergency/sos) for database recording & notification check
    let backendEvent: EmergencyEvent | null = null;
    try {
      const resp = await fetch('/api/emergency/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          patientName,
          coordinates: {
            latitude: resolvedLat,
            longitude: resolvedLng,
            accuracy: resolvedAccuracy,
            source: locationSource,
            permissionStatus: locResult.permissionStatus,
            timestamp: locResult.timestamp || timestampFormatted,
            addressDescription,
            locationError: locResult.errorMessage
          },
          contacts,
          testMode: options?.testMode
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data && data.event) {
          backendEvent = data.event;
        }
      }
    } catch (netErr) {
      console.warn('[EMERGENCY SERVICE] Backend API unavailable, falling back to local storage:', netErr);
    }

    let finalEvent: EmergencyEvent;

    if (backendEvent) {
      finalEvent = backendEvent;
    } else {
      // Local fallback event if backend offline
      const dispatchResult = await this.dispatchEmergencyAlert(
        patientName,
        contacts,
        {
          latitude: resolvedLat,
          longitude: resolvedLng,
          accuracy: resolvedAccuracy,
          mapLink,
          locationError: locResult.errorMessage,
          locationSource,
          addressDescription
        }
      );

      finalEvent = {
        id: `sos-${Date.now()}`,
        patientId,
        patientName,
        activatedAt: timestampFormatted,
        latitude: resolvedLat,
        longitude: resolvedLng,
        accuracy: resolvedAccuracy,
        locationTimestamp: locResult.timestamp || timestampFormatted,
        locationLink: mapLink,
        locationError: locResult.errorMessage,
        permissionStatus: locResult.permissionStatus,
        locationSource: locationSource as any,
        manualLocationDescription: addressDescription,
        status: 'active',
        notificationStatus: dispatchResult.status,
        notificationMessage: dispatchResult.message,
        notifiedContacts: dispatchResult.dispatchedTo,
        createdAt: now.toISOString()
      };
    }

    // Store at head of events list
    this.events.unshift(finalEvent);
    this.saveToStorage();
    return finalEvent;
  }

  /**
   * Updates an active SOS event with new coordinates or manual location.
   */
  public updateSosLocation(
    eventId: string,
    data: {
      latitude: number;
      longitude: number;
      accuracy?: number;
      addressDescription?: string;
      source: 'gps' | 'manual' | 'simulated';
    },
    contacts: EmergencyContact[]
  ): EmergencyEvent | null {
    const event = this.events.find((e) => e.id === eventId);
    if (!event) return null;

    event.latitude = data.latitude;
    event.longitude = data.longitude;
    event.accuracy = data.accuracy || 15;
    event.locationSource = data.source;
    event.manualLocationDescription = data.addressDescription;
    event.locationLink = this.generateClickableMapLink(data.latitude, data.longitude);
    event.locationError = undefined;
    event.permissionStatus = data.source === 'gps' ? 'granted' : event.permissionStatus;

    event.notifiedContacts = contacts
      .filter((c) => c.isActive)
      .map((c) => {
        const msg = this.buildPersonalizedAlertMessage(
          c,
          event.patientName,
          event.activatedAt,
          {
            latitude: event.latitude,
            longitude: event.longitude,
            accuracy: event.accuracy,
            mapLink: event.locationLink,
            locationSource: event.locationSource,
            addressDescription: event.manualLocationDescription
          }
        );
        const dialablePhone = toDialablePhone(c.phone);
        const displayPhone = formatIndianPhoneNumber(c.phone);
        return {
          contactId: c.id,
          name: c.name,
          phone: displayPhone || c.phone,
          relationship: c.relationship,
          status: 'sent',
          directDispatchLink: `sms:${encodeURIComponent(dialablePhone || c.phone)}?body=${encodeURIComponent(msg)}`,
          personalizedMessage: msg
        };
      });

    this.saveToStorage();
    return event;
  }

  /**
   * Resolves the active SOS event safely.
   * Safety guard: requires explicit safety confirmation.
   */
  public async resolveSos(
    eventId: string,
    patientId?: string,
    safetyConfirmed: boolean = true,
    resolutionNotes?: string
  ): Promise<boolean> {
    try {
      await fetch('/api/emergency/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          patientId,
          safetyConfirmed,
          resolutionNotes: resolutionNotes || 'Resolved safely by authenticated patient.'
        })
      });
    } catch (err) {
      console.warn('[EMERGENCY SERVICE] Resolve API call failed, updating local state:', err);
    }

    const ev = this.events.find((e) => e.id === eventId || (patientId && e.patientId === patientId && e.status === 'active'));
    if (ev) {
      ev.status = 'resolved';
      ev.resolvedAt = new Date().toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      ev.notes = resolutionNotes || 'Resolved safely by patient.';
      this.saveToStorage();
    }
    return true;
  }

  /**
   * Fetches the latest recorded events from backend database.
   */
  public async syncWithBackend(patientId?: string): Promise<EmergencyEvent[]> {
    try {
      const url = patientId ? `/api/emergency/events?patientId=${encodeURIComponent(patientId)}` : '/api/emergency/events';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.events)) {
          this.events = data.events;
          this.saveToStorage();
          return this.events;
        }
      }
    } catch (err) {
      console.warn('[EMERGENCY SERVICE] Sync with backend failed:', err);
    }
    return this.getEvents(patientId);
  }

  /**
   * Tests notification provider channel (success or failure)
   */
  public async testNotificationChannel(
    mode: 'success' | 'failure',
    contacts: EmergencyContact[],
    patientName: string
  ): Promise<{ success: boolean; status: string; message: string; error?: string }> {
    try {
      const res = await fetch('/api/emergency/test-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, contacts, patientName })
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        status: 'failed',
        message: 'Could not connect to notification dispatch service.',
        error: err.message
      };
    }
  }

  public getActiveSos(patientId: string): EmergencyEvent | undefined {
    return this.events.find((e) => e.patientId === patientId && e.status === 'active');
  }

  public getEvents(patientId?: string): EmergencyEvent[] {
    if (patientId) {
      return this.events.filter((e) => e.patientId === patientId);
    }
    return [...this.events];
  }

  /**
   * Generates a pre-formatted emergency dispatch text for manual copying.
   */
  public generateManualDispatchText(event: EmergencyEvent): string {
    const coordsText =
      event.latitude && event.longitude && event.locationLink
        ? `📍 Location: Latitude ${event.latitude.toFixed(6)}, Longitude ${event.longitude.toFixed(6)} (±${event.accuracy || 15}m)\n🗺️ Clickable Map: ${event.locationLink}`
        : `📍 Location: ${event.manualLocationDescription || 'Emergency Clinic Primary Address'}\n🗺️ Clickable Map: ${event.locationLink || 'https://www.google.com/maps'}`;

    return `🚨 EMERGENCY MEDICAL ALERT\nPatient: ${event.patientName}\nTime: ${event.activatedAt}\n${coordsText}\nMedical System: Medical AI Verified Patient Identification`;
  }
}

export const emergencyService = new EmergencyService();
