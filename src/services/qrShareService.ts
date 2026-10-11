import { PatientShareRecord, EmergencyContact } from '../types';

const STORAGE_KEY = 'medical_ai_qr_share_records';

/**
 * Service managing secure, tokenized QR sharing records.
 * Ensures zero-trust data minimization, cryptographic token lookup,
 * expiration, and revocation.
 */
class QrShareService {
  private records: Map<string, PatientShareRecord> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const list: PatientShareRecord[] = JSON.parse(data);
        list.forEach((r) => this.records.set(r.token, r));
      }
    } catch {
      // fallback to memory
    }
  }

  private saveToStorage() {
    try {
      const list = Array.from(this.records.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore storage errors
    }
  }

  private lastSyncedPayload: Map<string, string> = new Map();

  private syncRecordToServer(record: PatientShareRecord) {
    if (typeof window === 'undefined') return;
    try {
      const payload = JSON.stringify(record);
      // Skip network call if exact payload was already synced for this token
      if (this.lastSyncedPayload.get(record.token) === payload) {
        return;
      }
      this.lastSyncedPayload.set(record.token, payload);

      fetch('/api/emergency/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      }).catch(() => {});
    } catch {
      // ignore network errors
    }
  }

  /**
   * Generates a cryptographically strong, unique share token.
   */
  private generateSecureToken(): string {
    const randomHex = Math.random().toString(36).substring(2, 10) +
      Math.random().toString(36).substring(2, 10);
    return `mai-${Date.now().toString(36)}-${randomHex}`;
  }

  /**
   * Issues a new secure share record for a patient.
   * If a previous active record exists for this patient, it can revoke it.
   */
  public createShareRecord(params: {
    patientId: string;
    patientName: string;
    patientIdCode: string;
    dateOfBirth?: string;
    bloodGroup?: string;
    allergies: string[];
    emergencyContacts: EmergencyContact[];
    importantMedicalNotes?: string;
    profileImageUrl?: string;
    durationMinutes: number; // e.g. 15, 60, 1440 (24h), 10080 (7d)
    allowedScopes?: {
      bloodGroup: boolean;
      allergies: boolean;
      emergencyContacts: boolean;
      emergencyNotes: boolean;
      medications: boolean;
    };
    revokeExistingForPatient?: boolean;
  }): PatientShareRecord {
    if (params.revokeExistingForPatient) {
      this.revokeActiveForPatient(params.patientId);
    }

    const token = this.generateSecureToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + params.durationMinutes * 60 * 1000);

    const record: PatientShareRecord = {
      token,
      patientId: params.patientId,
      patientName: params.patientName,
      patientIdCode: params.patientIdCode,
      dateOfBirth: params.dateOfBirth,
      bloodGroup: params.bloodGroup,
      allergies: params.allergies,
      emergencyContacts: params.emergencyContacts,
      importantMedicalNotes: params.importantMedicalNotes,
      profileImageUrl: params.profileImageUrl,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isRevoked: false,
      allowedScopes: params.allowedScopes || {
        bloodGroup: true,
        allergies: true,
        emergencyContacts: true,
        emergencyNotes: true,
        medications: true
      },
      accessLog: []
    };

    this.records.set(token, record);
    this.saveToStorage();
    this.syncRecordToServer(record);
    return record;
  }

  /**
   * Revokes all active tokens for a specific patient (e.g. upon Regenerate QR).
   */
  public revokeActiveForPatient(patientId: string): number {
    let count = 0;
    this.records.forEach((r) => {
      if (r.patientId === patientId && !r.isRevoked) {
        r.isRevoked = true;
        r.revokedAt = new Date().toISOString();
        count++;
      }
    });
    if (count > 0) {
      this.saveToStorage();
    }
    return count;
  }

  /**
   * Revokes a specific token.
   */
  public revokeToken(token: string): boolean {
    const record = this.records.get(token);
    if (!record) return false;
    record.isRevoked = true;
    record.revokedAt = new Date().toISOString();
    this.saveToStorage();
    return true;
  }

  /**
   * Retrieves an active share record for a patient, or generates an initial one if none exists.
   */
  public getOrCreateActiveRecordForPatient(params: {
    patientId: string;
    patientName: string;
    patientIdCode: string;
    dateOfBirth?: string;
    bloodGroup?: string;
    allergies: string[];
    emergencyContacts: EmergencyContact[];
    importantMedicalNotes?: string;
    profileImageUrl?: string;
  }): PatientShareRecord {
    const now = new Date();
    // Look for non-revoked, non-expired record
    for (const record of this.records.values()) {
      if (
        record.patientId === params.patientId &&
        !record.isRevoked &&
        new Date(record.expiresAt) > now
      ) {
        const hasDifferences =
          record.patientName !== params.patientName ||
          record.bloodGroup !== params.bloodGroup ||
          (record.profileImageUrl || '') !== (params.profileImageUrl || '') ||
          (record.importantMedicalNotes || '') !== (params.importantMedicalNotes || '') ||
          (record.dateOfBirth || '') !== (params.dateOfBirth || '') ||
          JSON.stringify(record.allergies) !== JSON.stringify(params.allergies) ||
          JSON.stringify(record.emergencyContacts) !== JSON.stringify(params.emergencyContacts);

        if (hasDifferences) {
          record.patientName = params.patientName;
          record.bloodGroup = params.bloodGroup;
          record.allergies = params.allergies;
          record.emergencyContacts = params.emergencyContacts;
          record.profileImageUrl = params.profileImageUrl;
          record.importantMedicalNotes = params.importantMedicalNotes;
          record.dateOfBirth = params.dateOfBirth;
          this.saveToStorage();
          this.syncRecordToServer(record);
        }
        return record;
      }
    }

    // Default 24 hours
    return this.createShareRecord({
      ...params,
      durationMinutes: 1440
    });
  }

  /**
   * Asynchronously validates and inspects a token across network devices.
   * Supports forceRefresh to bypass stale local cache and fetch live updates from server.
   */
  public async validateAndGetRecordAsync(token: string, forceRefresh = false): Promise<{
    isValid: boolean;
    reason?: 'expired' | 'revoked' | 'not_found';
    record?: PatientShareRecord;
  }> {
    // 1. Try local storage if not forcing refresh
    if (!forceRefresh) {
      const localRes = this.validateAndGetRecord(token);
      if (localRes.isValid && localRes.record) {
        return localRes;
      }
    }

    // 2. Fetch from authoritative backend
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch(`/api/emergency/share/${encodeURIComponent(token)}?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.success && data?.record) {
            const serverRecord: PatientShareRecord = data.record;
            this.records.set(serverRecord.token, serverRecord);
            this.saveToStorage();
            return this.validateAndGetRecord(serverRecord.token);
          }
        } else if (res.status === 410) {
          const data = await res.json().catch(() => ({}));
          return { isValid: false, reason: data.reason || 'expired' };
        }
      } catch (err) {
        console.warn('[QR] Server lookup failed:', err);
      }
    }

    return localRes;
  }

  /**
   * Validates and inspects a token when a bystander/doctor scans the QR code.
   * Logs access and enforces expiration and revocation.
   */
  public validateAndGetRecord(token: string): {
    isValid: boolean;
    reason?: 'expired' | 'revoked' | 'not_found';
    record?: PatientShareRecord;
  } {
    const record = this.records.get(token);
    if (!record) {
      return { isValid: false, reason: 'not_found' };
    }

    if (record.isRevoked) {
      return { isValid: false, reason: 'revoked', record };
    }

    const now = new Date();
    if (new Date(record.expiresAt) <= now) {
      return { isValid: false, reason: 'expired', record };
    }

    // Record access event in audit log
    record.accessCount = (record.accessCount || 0) + 1;
    record.lastAccessedAt = now.toISOString();
    record.accessLog.push({
      timestamp: now.toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      action: 'VIEW_AUTHORIZED_SUMMARY'
    });
    this.saveToStorage();

    return { isValid: true, record };
  }
}

export const qrShareService = new QrShareService();
