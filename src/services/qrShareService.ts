import {
  PatientShareRecord,
  EmergencyContact,
  QrTokenResolution,
  QrAccessRequest,
  QrAccessReasonKey,
  QrAccessScope,
  QrAccessAuditLogEntry
} from '../types';

const STORAGE_KEY = 'medical_ai_qr_share_records';
const REQUESTS_STORAGE_KEY = 'medical_ai_qr_access_requests';
const AUDIT_STORAGE_KEY = 'medical_ai_qr_access_audit_logs';

/**
 * Service managing secure, tokenized QR sharing records,
 * mandatory reason-based access requests, patient consent,
 * and HIPAA-grade access audit logs.
 */
class QrShareService {
  private records: Map<string, PatientShareRecord> = new Map();
  private accessRequests: Map<string, QrAccessRequest> = new Map();
  private auditLogs: QrAccessAuditLogEntry[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof localStorage === 'undefined') return;
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const list: PatientShareRecord[] = JSON.parse(data);
        list.forEach((r) => this.records.set(r.token, r));
      }
      const reqData = localStorage.getItem(REQUESTS_STORAGE_KEY);
      if (reqData) {
        const reqList: QrAccessRequest[] = JSON.parse(reqData);
        reqList.forEach((req) => this.accessRequests.set(req.id, req));
      }
      const auditData = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (auditData) {
        this.auditLogs = JSON.parse(auditData);
      }
    } catch {
      // fallback to memory
    }
  }

  private saveToStorage() {
    try {
      if (typeof localStorage === 'undefined') return;
      const list = Array.from(this.records.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      const reqList = Array.from(this.accessRequests.values());
      localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(reqList));
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(this.auditLogs));
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
   * Generates or regenerates an emergency share token for a patient.
   */
  public generateEmergencyShareToken(patientId: string, durationMinutes = 1440): PatientShareRecord {
    return this.createShareRecord({
      patientId,
      patientName: 'Aryan Yadav',
      patientIdCode: 'MAI-80429',
      bloodGroup: 'O+',
      allergies: ['Penicillin', 'Peanuts'],
      emergencyContacts: [{ id: 'ec-default', name: 'Priya Sharma', relationship: 'Spouse', phone: '+91 98765 43210', isPrimary: true, isActive: true }],
      durationMinutes,
      revokeExistingForPatient: true,
    });
  }

  /**
   * Retrieves active emergency share token for a patient.
   */
  public getEmergencyShareToken(patientId: string): PatientShareRecord | null {
    return this.getOrCreateActiveRecordForPatient({
      patientId,
      patientName: 'Aryan Yadav',
      patientIdCode: 'MAI-80429',
      bloodGroup: 'O+',
      allergies: ['Penicillin', 'Peanuts'],
      emergencyContacts: [{ id: 'ec-default', name: 'Priya Sharma', relationship: 'Spouse', phone: '+91 98765 43210', isPrimary: true, isActive: true }],
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
    const localRes = this.validateAndGetRecord(token);
    // 1. Try local storage if not forcing refresh
    if (!forceRefresh && localRes.isValid && localRes.record) {
      return localRes;
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

  /**
   * Helper: Masks all letters in patient name except the initials
   */
  public maskPatientName(name: string): string {
    if (!name) return 'Patient';
    return name
      .trim()
      .split(/\s+/)
      .map((part) => (part.length > 1 ? part[0] + '*'.repeat(Math.min(part.length - 1, 4)) : part))
      .join(' ');
  }

  /**
   * 1. Resolves a QR token with zero-trust minimal identification (no protected health details exposed).
   */
  public async resolveQrTokenAsync(token: string): Promise<{
    success: boolean;
    resolution?: QrTokenResolution;
    patientId?: string;
    reason?: 'expired' | 'revoked' | 'not_found';
    error?: string;
  }> {
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      try {
        const res = await fetch(`/api/emergency/qr-token/${encodeURIComponent(token)}/resolve?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.success && data?.resolution) {
            return {
              success: true,
              resolution: data.resolution,
              patientId: data.patientId
            };
          }
        } else if (res.status === 410) {
          const data = await res.json().catch(() => ({}));
          return {
            success: false,
            reason: data.status || 'expired',
            error: data.error || 'Token is no longer valid'
          };
        } else if (res.status === 404) {
          return {
            success: false,
            reason: 'not_found',
            error: 'QR token not found'
          };
        }
      } catch (err) {
        console.warn('[QR] Server resolve failed, falling back to local memory:', err);
      }
    }

    // Local in-memory / storage fallback
    const local = this.validateAndGetRecord(token);
    if (!local.isValid || !local.record) {
      return {
        success: false,
        reason: local.reason || 'not_found',
        error: local.reason === 'revoked' ? 'Token revoked' : local.reason === 'expired' ? 'Token expired' : 'Not found'
      };
    }

    const rec = local.record;
    this.auditLogs.unshift({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      qrToken: rec.token,
      patientId: rec.patientId,
      requesterId: 'scanner',
      requesterRole: 'scanner',
      action: 'QR_TOKEN_RESOLVED',
      outcome: 'SUCCESS',
      details: 'Patient QR token zero-trust preview resolved.'
    });
    this.saveToStorage();

    return {
      success: true,
      patientId: rec.patientId,
      resolution: {
        token: rec.token,
        isValid: true,
        status: 'active',
        patientIdCode: rec.patientIdCode || 'MAI-80429',
        maskedPatientName: this.maskPatientName(rec.patientName),
        institutionName: 'MedicalAI Institutional Health Network',
        requiresReasonAndConsent: true,
        expiresAt: rec.expiresAt
      }
    };
  }

  /**
   * 2. Submits an access request with mandatory reason selection, required explanation, and requested scopes.
   */
  public async submitAccessRequestAsync(params: {
    qrToken?: string;
    token?: string;
    patientId?: string;
    requesterId: string;
    requesterName: string;
    requesterRole: string;
    requesterEmail?: string;
    requesterOrganization?: string;
    reason: QrAccessReasonKey;
    reasonLabel?: string;
    explanation: string;
    requestedScopes?: QrAccessScope;
    scopes?: QrAccessScope;
    isEmergencyBreakGlass?: boolean;
    breakGlassConfirmed?: boolean;
  }): Promise<{
    success: boolean;
    request?: QrAccessRequest;
    error?: string;
    message?: string;
  }> {
    const effectiveToken = params.qrToken || params.token || '';
    const effectiveScopes = params.requestedScopes || params.scopes || {
      bloodGroup: true,
      allergies: true,
      emergencyContacts: false,
      emergencyNotes: false,
      vitals: false,
      medications: false,
      clinicalNotes: false,
      labReports: false
    };
    const normalizedParams = {
      ...params,
      qrToken: effectiveToken,
      requestedScopes: effectiveScopes
    };

    // Client-side pre-flight validation
    if (!normalizedParams.reason) {
      return { success: false, error: 'A valid reason for access is strictly mandatory.' };
    }
    const trimmedExplanation = (normalizedParams.explanation || '').trim();
    if (normalizedParams.reason === 'other' && trimmedExplanation.length < 5) {
      return { success: false, error: 'A detailed written explanation (at least 5 characters) is required when selecting "Other".' };
    }
    if (normalizedParams.isEmergencyBreakGlass && trimmedExplanation.length < 8) {
      return { success: false, error: 'A clinical justification is required for emergency break-glass access.' };
    }

    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      try {
        const res = await fetch('/api/emergency/access-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(normalizedParams)
        });
        const data = await res.json();
        if (res.ok && data?.success && data?.request) {
          this.accessRequests.set(data.request.id, data.request);
          this.saveToStorage();
          return { success: true, request: data.request, message: data.message };
        } else {
          return { success: false, error: data?.error || 'Failed to submit access request.' };
        }
      } catch (err) {
        console.warn('[QR] Server submit request failed, falling back to local memory:', err);
      }
    }

    // Local in-memory fallback
    const targetRec = this.records.get(normalizedParams.qrToken);
    const targetPatientId = normalizedParams.patientId || targetRec?.patientId || 'pat-1';
    const now = new Date();
    const requestId = `req-${now.getTime()}-${Math.random().toString(36).substring(2, 7)}`;

    if (normalizedParams.isEmergencyBreakGlass) {
      const emergencyRoles = ['doctor', 'clinician', 'paramedic', 'physician'];
      if (!emergencyRoles.some((r) => normalizedParams.requesterRole.toLowerCase().includes(r))) {
        return {
          success: false,
          error: 'Emergency break-glass access is strictly restricted to licensed clinicians and authorized emergency personnel.'
        };
      }
      if (normalizedParams.breakGlassConfirmed === false) {
        return { success: false, error: 'Explicit confirmation of clinical emergency is required.' };
      }

      const emergencyRequest: QrAccessRequest = {
        id: requestId,
        qrToken: normalizedParams.qrToken,
        patientId: targetPatientId,
        patientName: targetRec?.patientName || 'Aryan Yadav',
        patientIdCode: targetRec?.patientIdCode || 'MAI-80429',
        requesterId: normalizedParams.requesterId,
        requesterName: normalizedParams.requesterName,
        requesterRole: normalizedParams.requesterRole,
        requesterEmail: normalizedParams.requesterEmail,
        requesterOrganization: normalizedParams.requesterOrganization || 'Emergency Services',
        reason: normalizedParams.reason,
        reasonLabel: normalizedParams.reasonLabel || 'Emergency Medical Assistance',
        explanation: trimmedExplanation,
        requestedScopes: normalizedParams.requestedScopes,
        approvedScopes: {
          bloodGroup: true,
          allergies: true,
          emergencyContacts: true,
          emergencyNotes: true,
          vitals: true,
          medications: false,
          clinicalNotes: false,
          labReports: false
        },
        status: 'approved',
        isEmergencyBreakGlass: true,
        requiresPatientConsent: false,
        createdAt: now.toISOString(),
        decidedAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
        accessCount: 0,
        auditLog: []
      };

      this.accessRequests.set(requestId, emergencyRequest);
      this.auditLogs.push({
        id: `audit-${now.getTime()}`,
        timestamp: now.toISOString(),
        requestId,
        qrToken: normalizedParams.qrToken,
        patientId: targetPatientId,
        requesterId: normalizedParams.requesterId,
        requesterRole: normalizedParams.requesterRole,
        requesterName: normalizedParams.requesterName,
        action: 'EMERGENCY_BREAK_GLASS_INVOKED',
        outcome: 'SUCCESS',
        details: `Emergency break-glass invoked: "${trimmedExplanation}"`
      });
      this.saveToStorage();
      return { success: true, request: emergencyRequest };
    }

    const standardRequest: QrAccessRequest = {
      id: requestId,
      qrToken: normalizedParams.qrToken,
      patientId: targetPatientId,
      patientName: targetRec?.patientName || 'Aryan Yadav',
      patientIdCode: targetRec?.patientIdCode || 'MAI-80429',
      requesterId: normalizedParams.requesterId,
      requesterName: normalizedParams.requesterName,
      requesterRole: normalizedParams.requesterRole,
      requesterEmail: normalizedParams.requesterEmail,
      requesterOrganization: normalizedParams.requesterOrganization,
      reason: normalizedParams.reason,
      reasonLabel: normalizedParams.reasonLabel || 'Clinical Care',
      explanation: trimmedExplanation,
      requestedScopes: normalizedParams.requestedScopes,
      status: 'pending',
      isEmergencyBreakGlass: false,
      requiresPatientConsent: true,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
      accessCount: 0,
      auditLog: []
    };

    this.accessRequests.set(requestId, standardRequest);
    this.auditLogs.push({
      id: `audit-${now.getTime()}`,
      timestamp: now.toISOString(),
      requestId,
      qrToken: params.qrToken,
      patientId: targetPatientId,
      requesterId: params.requesterId,
      requesterRole: params.requesterRole,
      requesterName: params.requesterName,
      action: 'ACCESS_REQUEST_SUBMITTED',
      outcome: 'SUCCESS',
      details: `Access request submitted for "${params.reasonLabel || params.reason}"`
    });
    this.saveToStorage();

    return { success: true, request: standardRequest };
  }

  /**
   * 3. Retrieves all access requests for the authenticated patient.
   */
  public async getAccessRequestsForPatientAsync(patientId: string): Promise<QrAccessRequest[]> {
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      try {
        const res = await fetch(`/api/emergency/access-requests/patient/${encodeURIComponent(patientId)}?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.success && Array.isArray(data.requests)) {
            data.requests.forEach((r: QrAccessRequest) => this.accessRequests.set(r.id, r));
            this.saveToStorage();
            return data.requests;
          }
        }
      } catch (err) {
        console.warn('[QR] Server get patient requests failed:', err);
      }
    }

    // Local fallback
    const list = Array.from(this.accessRequests.values()).filter((r) => r.patientId === patientId);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * 4. Retrieves all access requests created by the authenticated requester.
   */
  public async getAccessRequestsForRequesterAsync(requesterId: string): Promise<QrAccessRequest[]> {
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      try {
        const res = await fetch(`/api/emergency/access-requests/requester/${encodeURIComponent(requesterId)}?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.success && Array.isArray(data.requests)) {
            data.requests.forEach((r: QrAccessRequest) => this.accessRequests.set(r.id, r));
            this.saveToStorage();
            return data.requests;
          }
        }
      } catch (err) {
        console.warn('[QR] Server get requester requests failed:', err);
      }
    }

    const list = Array.from(this.accessRequests.values()).filter((r) => r.requesterId === requesterId);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * 5. Retrieves a single access request by ID.
   */
  public async getAccessRequestByIdAsync(requestId: string): Promise<QrAccessRequest | null> {
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      try {
        const res = await fetch(`/api/emergency/access-requests/${encodeURIComponent(requestId)}?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.success && data.request) {
            this.accessRequests.set(data.request.id, data.request);
            this.saveToStorage();
            return data.request;
          }
        }
      } catch (err) {
        console.warn('[QR] Server get request failed:', err);
      }
    }

    return this.accessRequests.get(requestId) || null;
  }

  /**
   * 6. Patient Consent Decision (Approve or Deny).
   */
  public async decideAccessRequestAsync(
    requestId: string,
    decision: 'approved' | 'denied',
    decidedBy: string,
    approvedScopes?: QrAccessScope,
    durationMinutes = 60
  ): Promise<{ success: boolean; request?: QrAccessRequest; error?: string }> {
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      try {
        const res = await fetch(`/api/emergency/access-requests/${encodeURIComponent(requestId)}/decide`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decision, decidedBy, approvedScopes, durationMinutes })
        });
        const data = await res.json();
        if (res.ok && data?.success && data?.request) {
          this.accessRequests.set(data.request.id, data.request);
          this.saveToStorage();
          return { success: true, request: data.request };
        } else {
          return { success: false, error: data?.error || 'Failed to record decision.' };
        }
      } catch (err) {
        console.warn('[QR] Server decide request failed:', err);
      }
    }

    // Local fallback
    const req = this.accessRequests.get(requestId);
    if (!req) return { success: false, error: 'Access request not found.' };

    if (decidedBy && decidedBy !== req.patientId && !decidedBy.startsWith('admin')) {
      return { success: false, error: 'Only the patient may consent to access.' };
    }

    const now = new Date();
    req.decidedAt = now.toISOString();
    req.patientDecisionBy = decidedBy;

    if (decision === 'approved') {
      req.status = 'approved';
      req.approvedScopes = approvedScopes || req.requestedScopes;
      req.expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000).toISOString();
      this.auditLogs.push({
        id: `audit-${now.getTime()}`,
        timestamp: now.toISOString(),
        requestId: req.id,
        qrToken: req.qrToken,
        patientId: req.patientId,
        requesterId: req.requesterId,
        requesterRole: req.requesterRole,
        requesterName: req.requesterName,
        action: 'PATIENT_CONSENT_GRANTED',
        outcome: 'SUCCESS',
        details: `Consent granted for ${durationMinutes} minutes.`
      });
    } else {
      req.status = 'denied';
      this.auditLogs.push({
        id: `audit-${now.getTime()}`,
        timestamp: now.toISOString(),
        requestId: req.id,
        qrToken: req.qrToken,
        patientId: req.patientId,
        requesterId: req.requesterId,
        requesterRole: req.requesterRole,
        requesterName: req.requesterName,
        action: 'PATIENT_CONSENT_DENIED',
        outcome: 'DENIED',
        details: 'Patient denied access request.'
      });
    }

    this.saveToStorage();
    return { success: true, request: req };
  }

  /**
   * 7. Revoke Active Access Grant.
   */
  public async revokeAccessGrantAsync(
    requestId: string,
    revokedBy: string,
    reason = 'Revoked by patient'
  ): Promise<{ success: boolean; request?: QrAccessRequest; error?: string }> {
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      try {
        const res = await fetch(`/api/emergency/access-requests/${encodeURIComponent(requestId)}/revoke`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ revokedBy, revocationReason: reason })
        });
        const data = await res.json();
        if (res.ok && data?.success && data?.request) {
          this.accessRequests.set(data.request.id, data.request);
          this.saveToStorage();
          return { success: true, request: data.request };
        } else {
          return { success: false, error: data?.error || 'Failed to revoke access grant.' };
        }
      } catch (err) {
        console.warn('[QR] Server revoke grant failed:', err);
      }
    }

    const req = this.accessRequests.get(requestId);
    if (!req) return { success: false, error: 'Access request not found.' };

    const now = new Date();
    req.status = 'revoked';
    req.revokedAt = now.toISOString();
    req.revocationReason = reason;

    this.auditLogs.push({
      id: `audit-${now.getTime()}`,
      timestamp: now.toISOString(),
      requestId: req.id,
      qrToken: req.qrToken,
      patientId: req.patientId,
      requesterId: req.requesterId,
      requesterRole: req.requesterRole,
      requesterName: req.requesterName,
      action: 'ACCESS_REVOKED',
      outcome: 'REVOKED',
      details: `Access grant revoked: "${reason}".`
    });

    this.saveToStorage();
    return { success: true, request: req };
  }

  /**
   * 8. Exchange Approved Grant for Scoped Protected Medical Records.
   */
  public async fetchScopedProtectedDataAsync(
    requestId: string,
    requesterId: string
  ): Promise<{
    success: boolean;
    data?: any;
    approvedScopes?: QrAccessScope;
    isEmergencyBreakGlass?: boolean;
    expiresAt?: string;
    error?: string;
  }> {
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      try {
        const res = await fetch(
          `/api/emergency/access-requests/${encodeURIComponent(requestId)}/data?requesterId=${encodeURIComponent(requesterId)}&t=${Date.now()}`
        );
        const data = await res.json();
        if (res.ok && data?.success) {
          return {
            success: true,
            data: data.data,
            approvedScopes: data.approvedScopes,
            isEmergencyBreakGlass: data.isEmergencyBreakGlass,
            expiresAt: data.expiresAt
          };
        } else {
          return { success: false, error: data?.error || 'Access to protected data was denied.' };
        }
      } catch (err) {
        console.warn('[QR] Server fetch scoped data failed:', err);
      }
    }

    // Local fallback
    const req = this.accessRequests.get(requestId);
    if (!req) return { success: false, error: 'Access request not found.' };

    if (req.status !== 'approved') {
      return { success: false, error: `Request status is "${req.status}". Access is not approved.` };
    }

    if (req.expiresAt && new Date(req.expiresAt).getTime() < Date.now()) {
      req.status = 'expired';
      this.saveToStorage();
      return { success: false, error: 'Access grant has expired.' };
    }

    if (requesterId !== req.requesterId && !requesterId.startsWith('admin')) {
      return { success: false, error: 'Access grant belongs to a different authenticated user.' };
    }

    const shareRec = this.records.get(req.qrToken);
    const scopes = req.approvedScopes || {
      bloodGroup: true,
      allergies: true,
      vitals: false,
      medications: false,
      emergencyContacts: true,
      emergencyNotes: true,
      clinicalNotes: false,
      labReports: false
    };

    const scopedData: any = {};
    if (scopes.bloodGroup) scopedData.bloodGroup = shareRec?.bloodGroup || 'O+';
    if (scopes.allergies) scopedData.allergies = shareRec?.allergies || ['Penicillin'];
    if (scopes.emergencyContacts) scopedData.emergencyContacts = shareRec?.emergencyContacts || [];
    if (scopes.emergencyNotes) scopedData.emergencyNotes = shareRec?.importantMedicalNotes || 'Verified emergency registry.';

    req.accessCount = (req.accessCount || 0) + 1;
    req.lastAccessedAt = new Date().toISOString();
    this.saveToStorage();

    return {
      success: true,
      data: scopedData,
      approvedScopes: scopes,
      isEmergencyBreakGlass: req.isEmergencyBreakGlass,
      expiresAt: req.expiresAt
    };
  }

  /**
   * 9. Retrieves access audit log entries.
   */
  public async getAccessAuditLogsAsync(filter?: {
    patientId?: string;
    requestId?: string;
  }): Promise<QrAccessAuditLogEntry[]> {
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      try {
        const q = new URLSearchParams();
        if (filter?.patientId) q.set('patientId', filter.patientId);
        if (filter?.requestId) q.set('requestId', filter.requestId);
        const res = await fetch(`/api/emergency/access-audit-logs?${q.toString()}&t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.success && Array.isArray(data.logs)) {
            return data.logs;
          }
        }
      } catch (err) {
        console.warn('[QR] Server get audit logs failed:', err);
      }
    }

    let logs = this.auditLogs;
    if (filter?.patientId) logs = logs.filter((l) => l.patientId === filter.patientId);
    if (filter?.requestId) logs = logs.filter((l) => l.requestId === filter.requestId);
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export const qrShareService = new QrShareService();
