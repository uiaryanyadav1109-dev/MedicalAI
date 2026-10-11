/**
 * Centralized Typed Mobile API Client
 * Connects the Android Application to the Shared Medical AI Backend API.
 *
 * Guarantees cross-platform data synchronization with the Website.
 */

import Constants from 'expo-constants';
import {
  User,
  VitalDataPoint,
  MedicationItem,
  ConsultationRecord,
  MedicalReportRecord,
  DoctorHandoffRecord,
  AppointmentRecord,
  EmergencyEvent,
  IdentityVerificationRecord
} from '../types';

// Resolves server URL:
// In Android Emulator, localhost is reached via 10.0.2.2:3000
// In physical Android devices on local Wi-Fi, uses local network IP or production domain.
const DEFAULT_DEV_URL = 'http://10.0.2.2:3000/api';
const PRODUCTION_URL = 'https://medicalai.internal/api';

export const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl ||
  (process.env.NODE_ENV === 'production' ? PRODUCTION_URL : DEFAULT_DEV_URL);

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
}

export interface VitalRecord {
  id: string;
  type: string;
  value: number | string;
  unit: string;
  timestamp: string;
  source: string;
  status?: string;
  notes?: string;
}

class MobileApiClient {
  private baseUrl: string = API_BASE_URL;
  private token: string | null = null;
  private currentPatientId: string = 'pat-1';

  public setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setAuthToken(token: string | null, patientId: string = 'pat-1') {
    this.token = token;
    this.currentPatientId = patientId;
  }

  public getPatientId(): string {
    return this.currentPatientId;
  }

  // Top level convenience methods
  public async sendChatMessage(
    text: string,
    options?: { language?: string; history?: any[]; patientId?: string } | string
  ) {
    const opts = typeof options === 'string' ? { patientId: options } : options || {};
    const res = await this.chat.sendMessage({
      message: text,
      language: opts.language || 'en',
      history: opts.history || []
    });
    const replyText = res.text || res.response || 'No response from triage model.';
    const lower = text.toLowerCase();
    const isUrgent =
      lower.includes('emergency') ||
      lower.includes('chest pain') ||
      lower.includes('breathing') ||
      lower.includes('stroke') ||
      lower.includes('severe');
    return {
      reply: replyText,
      urgency: isUrgent ? 'high' : 'normal',
      modelUsed: res.modelUsed,
      citations: res.citations
    };
  }

  public async logVital(patientId: string, vital: VitalRecord) {
    return this.clinical.addVital({
      type: vital.type as any,
      value: typeof vital.value === 'string' ? parseFloat(vital.value) || 0 : vital.value,
      systolic: typeof vital.value === 'string' && vital.value.includes('/') ? parseInt(vital.value.split('/')[0], 10) : undefined,
      diastolic: typeof vital.value === 'string' && vital.value.includes('/') ? parseInt(vital.value.split('/')[1], 10) : undefined,
      heartRate: vital.type === 'heart_rate' ? (typeof vital.value === 'number' ? vital.value : parseInt(vital.value, 10)) : undefined,
      spo2: vital.type === 'oxygen_saturation' ? (typeof vital.value === 'number' ? vital.value : parseInt(vital.value, 10)) : undefined,
      temperature: vital.type === 'temperature' ? (typeof vital.value === 'number' ? vital.value : parseFloat(vital.value)) : undefined,
      unit: vital.unit,
      source: 'patient_entered',
      timestamp: vital.timestamp,
      notes: vital.notes
    } as any);
  }

  public async logMedicationDose(patientId: string, medicationId: string, dose: { timestamp: string; status: 'taken'; notes?: string }) {
    return this.clinical.logDose(medicationId, 'taken', dose.timestamp, dose.notes);
  }

  public async triggerEmergency(patientId: string, coords: { lat: number; lng: number }) {
    const res = await this.emergency.triggerSos({
      patientId,
      patientName: 'Aryan Yadav',
      coordinates: { latitude: coords.lat, longitude: coords.lng, source: 'mobile_device' },
      contacts: []
    });
    return {
      timestamp: new Date().toLocaleTimeString(),
      location: { latitude: coords.lat, longitude: coords.lng },
      event: res.event
    };
  }

  public async getIdentityStatus(patientId: string) {
    const res = await this.identity.getStatus(patientId);
    return {
      status: res.record?.status || 'unverified',
      maskedNumber: (res.record as any)?.maskedDocumentNumber || (res.record as any)?.documentNumberMasked || null
    };
  }

  public async submitIdentityVerification(patientId: string, payload: { type: string; documentNumber: string }) {
    const res = await this.identity.verify({
      documentType: payload.type,
      documentNumberRaw: payload.documentNumber,
      issuingCountry: 'IND',
      expirationDate: '2030-12-31',
      consentGiven: true
    });
    return {
      status: res.record?.status || 'verified',
      maskedNumber: (res.record as any)?.maskedDocumentNumber || (res.record as any)?.documentNumberMasked || `•••• ${payload.documentNumber.slice(-4)}`
    };
  }

  public async cancelIdentityVerification(patientId: string) {
    const res = await this.identity.cancel(patientId);
    return {
      status: res.record?.status || 'unverified'
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>)
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const json = await response.json();
      if (!response.ok || json.success === false) {
        throw new Error(json.error || `Request failed with status ${response.status}`);
      }
      return json as T;
    } catch (err: any) {
      console.warn(`[API Client Error] ${endpoint}:`, err.message);
      throw err;
    }
  }

  // ==========================================
  // AUTHENTICATION & USER PROFILE
  // ==========================================
  public auth = {
    login: async (email: string, password: string) => {
      return this.request<{ success: boolean; token: string; user: User }>('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
    },

    signup: async (fullName: string, email: string, password: string, phone?: string) => {
      return this.request<{ success: boolean; token: string; user: User }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password, phone })
      });
    },

    getProfile: async (patientId: string = this.currentPatientId) => {
      return this.request<{ success: boolean; user: User }>(`/auth/me?patientId=${patientId}`);
    },

    updateProfile: async (updates: Partial<User>, patientId: string = this.currentPatientId) => {
      return this.request<{ success: boolean; user: User }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ id: patientId, ...updates })
      });
    }
  };

  // ==========================================
  // CLINICAL RECORDS & SYNCHRONIZATION
  // ==========================================
  public clinical = {
    getFullPatientPacket: async (patientId: string = this.currentPatientId) => {
      return this.request<{
        success: boolean;
        data: {
          patient: User;
          vitals: VitalDataPoint[];
          medications: MedicationItem[];
          consultations: ConsultationRecord[];
          reports: MedicalReportRecord[];
          handoffs: DoctorHandoffRecord[];
          appointments: AppointmentRecord[];
          identityVerification: IdentityVerificationRecord;
        };
      }>(`/clinical/patient/${patientId}`);
    },

    getVitals: async (patientId: string = this.currentPatientId) => {
      return this.request<{ success: boolean; vitals: VitalDataPoint[] }>(`/clinical/vitals?patientId=${patientId}`);
    },

    addVital: async (vital: Omit<VitalDataPoint, 'id'>) => {
      return this.request<{ success: boolean; vital: VitalDataPoint }>('/clinical/vitals', {
        method: 'POST',
        body: JSON.stringify({ ...vital, patientId: this.currentPatientId })
      });
    },

    getMedications: async (patientId: string = this.currentPatientId) => {
      return this.request<{ success: boolean; medications: MedicationItem[] }>(`/clinical/medications?patientId=${patientId}`);
    },

    addMedication: async (medication: Omit<MedicationItem, 'id'>) => {
      return this.request<{ success: boolean; medication: MedicationItem }>('/clinical/medications', {
        method: 'POST',
        body: JSON.stringify({ ...medication, patientId: this.currentPatientId })
      });
    },

    logDose: async (medicationId: string, status: 'taken' | 'skipped' | 'snoozed', scheduledTime?: string, notes?: string) => {
      return this.request<{ success: boolean; medication: MedicationItem; doseLog: any }>(`/clinical/medications/${medicationId}/dose`, {
        method: 'POST',
        body: JSON.stringify({ status, scheduledTime, notes })
      });
    },

    getConsultations: async (patientId: string = this.currentPatientId) => {
      return this.request<{ success: boolean; consultations: ConsultationRecord[] }>(`/clinical/consultations?patientId=${patientId}`);
    },

    addConsultation: async (consultation: Omit<ConsultationRecord, 'id'>) => {
      return this.request<{ success: boolean; consultation: ConsultationRecord }>('/clinical/consultations', {
        method: 'POST',
        body: JSON.stringify({ ...consultation, patientId: this.currentPatientId })
      });
    },

    getReports: async (patientId: string = this.currentPatientId) => {
      return this.request<{ success: boolean; reports: MedicalReportRecord[] }>(`/clinical/reports?patientId=${patientId}`);
    },

    addReport: async (report: Omit<MedicalReportRecord, 'id'>) => {
      return this.request<{ success: boolean; report: MedicalReportRecord }>('/clinical/reports', {
        method: 'POST',
        body: JSON.stringify({ ...report, patientId: this.currentPatientId })
      });
    },

    getHandoffs: async (patientId: string = this.currentPatientId) => {
      return this.request<{ success: boolean; handoffs: DoctorHandoffRecord[] }>(`/clinical/handoffs?patientId=${patientId}`);
    },

    addHandoff: async (handoff: Omit<DoctorHandoffRecord, 'id'>) => {
      return this.request<{ success: boolean; handoff: DoctorHandoffRecord }>('/clinical/handoffs', {
        method: 'POST',
        body: JSON.stringify({ ...handoff, patientId: this.currentPatientId })
      });
    },

    getAppointments: async (params?: { patientId?: string; status?: string; date?: string; provider?: string } | string) => {
      const q = typeof params === 'string'
        ? `patientId=${params}`
        : params
          ? new URLSearchParams(Object.entries(params).filter(([_, v]) => Boolean(v)) as any).toString()
          : `patientId=${this.currentPatientId}`;
      return this.request<{ success: boolean; appointments: AppointmentRecord[] }>(`/clinical/appointments?${q}`);
    },

    createAppointment: async (appointment: Omit<AppointmentRecord, 'id'>) => {
      return this.request<{ success: boolean; appointment: AppointmentRecord; error?: string }>('/clinical/appointments', {
        method: 'POST',
        body: JSON.stringify(appointment)
      });
    },

    checkSlot: async (date: string, time: string, provider: string, excludeId?: string) => {
      const q = new URLSearchParams({ date, time, provider, ...(excludeId ? { excludeId } : {}) }).toString();
      return this.request<{ success: boolean; available: boolean; conflictingAppointment?: AppointmentRecord }>(`/clinical/appointments/check-slot?${q}`);
    },

    updateAppointment: async (id: string, updates: Partial<AppointmentRecord>) => {
      return this.request<{ success: boolean; appointment?: AppointmentRecord; error?: string }>(`/clinical/appointments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
    },

    cancelAppointment: async (id: string, cancelReason?: string) => {
      return this.request<{ success: boolean; appointment?: AppointmentRecord; error?: string }>(`/clinical/appointments/${id}`, {
        method: 'DELETE',
        body: JSON.stringify({ cancelReason })
      });
    },

    // Doctor & Clinical Practice Operations
    getPatients: async () => {
      return this.request<{ success: boolean; patients: any[] }>('/clinical/patients');
    },

    getQueue: async (department?: string) => {
      const q = department ? `?department=${encodeURIComponent(department)}` : '';
      return this.request<{ success: boolean; queue: any[] }>(`/clinical/queue${q}`);
    },

    overridePriority: async (patientId: string, priority: string, reason: string) => {
      return this.request<{ success: boolean; error?: string }>(`/clinical/queue/${patientId}/priority`, {
        method: 'POST',
        body: JSON.stringify({ priority, reason })
      });
    },

    saveClinicalAssessment: async (assessment: any) => {
      return this.request<{ success: boolean; assessment: any }>('/clinical/assessments', {
        method: 'POST',
        body: JSON.stringify(assessment)
      });
    },

    reviewReport: async (id: string, decision: 'reviewed' | 'critical_acknowledged' | 'flagged', notes: string) => {
      return this.request<{ success: boolean; report?: any }>(`/clinical/reports/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ decision, notes })
      });
    },

    getTriageEscalations: async () => {
      return this.request<{ success: boolean; escalations: any[] }>('/clinical/triage-escalations');
    },

    acknowledgeEscalation: async (id: string) => {
      return this.request<{ success: boolean; escalation: any }>(`/clinical/triage-escalations/${id}/acknowledge`, {
        method: 'POST'
      });
    },

    assignEscalation: async (id: string, assignedTeam: string, notes?: string) => {
      return this.request<{ success: boolean; escalation: any }>(`/clinical/triage-escalations/${id}/assign`, {
        method: 'POST',
        body: JSON.stringify({ assignedTeam, notes })
      });
    },

    resolveEscalation: async (id: string, resolutionNotes: string) => {
      return this.request<{ success: boolean; escalation: any }>(`/clinical/triage-escalations/${id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ resolutionNotes })
      });
    },

    getClinicianProfile: async (id: string = 'doc-1') => {
      return this.request<{ success: boolean; profile: any }>(`/clinical/clinicians/profile?id=${id}`);
    },

    getClinicianCredentials: async (id: string = 'doc-1') => {
      return this.request<{ success: boolean; credentials: any[] }>(`/clinical/clinicians/credentials?id=${id}`);
    },

    updateClinicianStatus: async (status: string) => {
      return this.request<{ success: boolean }>('/clinical/clinicians/status', {
        method: 'POST',
        body: JSON.stringify({ status })
      });
    },

    generateCopilotDraft: async (payload: { patientId: string; draftType: string; context?: any }) => {
      return this.request<{ success: boolean; draft: any }>('/clinical/copilot/draft', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },

    saveCopilotApproval: async (payload: { draftId: string; action: 'approved' | 'rejected'; editedContent?: string }) => {
      return this.request<{ success: boolean; record: any }>('/clinical/copilot/approvals', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },

    getClinicalAnalytics: async () => {
      return this.request<{ success: boolean; data: any }>('/clinical/analytics');
    }
  };

  // ==========================================
  // EMERGENCY SOS & GPS TELEMETRY
  // ==========================================
  public emergency = {
    getActive: async (patientId: string = this.currentPatientId) => {
      return this.request<{ success: boolean; event: EmergencyEvent | null }>(`/emergency/active?patientId=${patientId}`);
    },

    triggerSos: async (payload: {
      patientId?: string;
      patientName: string;
      coordinates: {
        latitude?: number;
        longitude?: number;
        accuracy?: number;
        source?: string;
        permissionStatus?: string;
        addressDescription?: string;
      };
      contacts: any[];
    }) => {
      return this.request<{ success: boolean; event: EmergencyEvent }>('/emergency/sos', {
        method: 'POST',
        body: JSON.stringify({
          patientId: payload.patientId || this.currentPatientId,
          patientName: payload.patientName,
          coordinates: payload.coordinates,
          contacts: payload.contacts
        })
      });
    },

    cancelSos: async (eventId: string, safetyConfirmation: boolean, notes?: string) => {
      return this.request<{ success: boolean; event: EmergencyEvent }>('/emergency/cancel', {
        method: 'POST',
        body: JSON.stringify({ eventId, safetyConfirmation, notes })
      });
    },

    getEvents: async (patientId: string = this.currentPatientId) => {
      return this.request<{ success: boolean; events: EmergencyEvent[] }>(`/emergency/events?patientId=${patientId}`);
    }
  };

  // ==========================================
  // AI MEDICAL CHATBOT & GEMINI REASONING
  // ==========================================
  public chat = {
    sendMessage: async (payload: {
      message: string;
      conversation_id?: string;
      language?: string;
      history?: any[];
      document_ids?: string[];
      search_mode?: string;
      stream?: boolean;
    }) => {
      return this.request<{
        success: boolean;
        response: string;
        text?: string;
        modelUsed: string;
        citations?: any[];
      }>('/chat', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: JSON.stringify({ ...payload, stream: false })
      });
    }
  };

  // ==========================================
  // IDENTITY VERIFICATION
  // ==========================================
  public identity = {
    getStatus: async (patientId: string = this.currentPatientId) => {
      return this.request<{ success: boolean; record: IdentityVerificationRecord }>(`/identity/status/${patientId}`);
    },

    verify: async (payload: {
      documentType: string;
      documentNumberRaw: string;
      issuingCountry: string;
      expirationDate: string;
      consentGiven: boolean;
    }) => {
      return this.request<{ success: boolean; record: IdentityVerificationRecord }>('/identity/verify', {
        method: 'POST',
        body: JSON.stringify({ patientId: this.currentPatientId, ...payload })
      });
    },

    cancel: async (patientId: string = this.currentPatientId) => {
      return this.request<{ success: boolean; record: IdentityVerificationRecord }>('/identity/cancel', {
        method: 'POST',
        body: JSON.stringify({ patientId })
      });
    }
  };
}

export const api = new MobileApiClient();
