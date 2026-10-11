import React, { useState, useEffect } from 'react';
import { qrShareService } from '../../services/qrShareService';
import {
  QrTokenResolution,
  QrAccessRequest,
  QrAccessReasonKey,
  QrAccessScope
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ProfileAvatar } from '../common/ProfileAvatar';
import { formatIndianPhoneNumber, toDialablePhone } from '../../utils/phoneUtils';
import {
  ShieldCheck,
  AlertTriangle,
  Phone,
  Heart,
  Clock,
  Lock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Activity,
  ArrowLeft,
  UserCheck,
  Stethoscope,
  Send,
  Eye,
  RefreshCw,
  XCircle,
  ExternalLink,
  Flame,
  Pill,
  Radio,
  FileCheck2
} from 'lucide-react';

interface QrScanSharePageProps {
  token: string;
  onNavigateHome?: () => void;
}

export const QrScanSharePage: React.FC<QrScanSharePageProps> = ({
  token,
  onNavigateHome
}) => {
  const { user, role, isAuthenticated, loginAsDemo } = useAuth();

  // Resolution state
  const [resolution, setResolution] = useState<QrTokenResolution | null>(null);
  const [patientId, setPatientId] = useState<string>('pat-1');
  const [resolveError, setResolveError] = useState<'expired' | 'revoked' | 'not_found' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Workflow Form State
  const [reason, setReason] = useState<QrAccessReasonKey>('consultation_treatment');
  const [explanation, setExplanation] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Scope Selection
  const [scopes, setScopes] = useState<QrAccessScope>({
    bloodGroup: true,
    allergies: true,
    vitals: true,
    medications: true,
    emergencyContacts: true,
    emergencyNotes: true,
    clinicalNotes: false,
    labReports: false
  });

  // Emergency Break-Glass toggle
  const [isEmergencyBreakGlass, setIsEmergencyBreakGlass] = useState(false);
  const [breakGlassConfirmed, setBreakGlassConfirmed] = useState(false);

  // Active Access Request State
  const [activeRequest, setActiveRequest] = useState<QrAccessRequest | null>(null);
  const [scopedData, setScopedData] = useState<any>(null);
  const [isPolling, setIsPolling] = useState(false);

  // 1. Initial QR Token Resolution (Zero-Trust Minimal Preview)
  useEffect(() => {
    let isMounted = true;

    qrShareService.resolveQrTokenAsync(token).then((res) => {
      if (!isMounted) return;
      setIsLoading(false);
      if (res.success && res.resolution) {
        setResolution(res.resolution);
        if (res.patientId) setPatientId(res.patientId);
        setResolveError(null);
      } else {
        setResolution(null);
        setResolveError(res.reason || 'not_found');
      }
    });

    return () => {
      isMounted = false;
    };
  }, [token]);

  // 2. Poll Active Request Status while pending or approved
  useEffect(() => {
    if (!activeRequest) return;

    let isMounted = true;
    const pollStatus = async () => {
      const updated = await qrShareService.getAccessRequestByIdAsync(activeRequest.id);
      if (!isMounted || !updated) return;

      setActiveRequest(updated);

      if (updated.status === 'approved' && !scopedData) {
        // Fetch approved scoped data
        const dataRes = await qrShareService.fetchScopedProtectedDataAsync(
          updated.id,
          user?.id || 'doc-1'
        );
        if (dataRes.success && isMounted) {
          setScopedData(dataRes.data);
        }
      }
    };

    // Immediate check
    pollStatus();

    // Poll every 2.5 seconds
    const interval = setInterval(pollStatus, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeRequest?.id, activeRequest?.status, user?.id, scopedData]);

  // Handle Form Submission
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isAuthenticated || !user) {
      setFormError('Please sign in or select your authenticated healthcare credentials before submitting.');
      return;
    }

    if (!reason) {
      setFormError('Please select a valid reason for accessing this patient\'s records.');
      return;
    }

    const trimmedExplanation = explanation.trim();
    if (reason === 'other' && trimmedExplanation.length < 5) {
      setFormError('When selecting "Other", a detailed clinical explanation (at least 5 characters) is mandatory.');
      return;
    }

    if (isEmergencyBreakGlass) {
      if (role !== 'doctor') {
        setFormError('Emergency break-glass access is strictly limited to licensed clinicians and certified emergency responders.');
        return;
      }
      if (!breakGlassConfirmed) {
        setFormError('You must explicitly affirm clinical emergency necessity before invoking break-glass access.');
        return;
      }
      if (trimmedExplanation.length < 8) {
        setFormError('A clinical justification (at least 8 characters) is required for emergency break-glass override.');
        return;
      }
    }

    setIsSubmitting(true);

    const reasonLabels: Record<QrAccessReasonKey, string> = {
      consultation_treatment: 'Patient consultation or clinical treatment',
      emergency_assistance: 'Emergency medical assistance',
      admission_assessment: 'Hospital admission or clinical assessment',
      followup_care: 'Authorized clinical follow-up care',
      caregiver_assistance: 'Patient-authorized caregiver assistance',
      insurance_admin: 'Administrative or billing verification',
      other: 'Other legitimate medical purpose'
    };

    const res = await qrShareService.submitAccessRequestAsync({
      qrToken: token,
      patientId,
      requesterId: user.id || (role === 'doctor' ? 'doc-1' : 'pat-1'),
      requesterName: user.name || (role === 'doctor' ? 'Dr. Sarah Chen, MD' : 'Care Provider'),
      requesterRole: role || 'clinician',
      requesterEmail: user.email,
      requesterOrganization: role === 'doctor' ? 'Memorial General Hospital' : 'Personal Care Network',
      reason,
      reasonLabel: reasonLabels[reason],
      explanation: trimmedExplanation || (reasonLabels[reason] || 'Pre-encounter clinical assessment'),
      requestedScopes: scopes,
      isEmergencyBreakGlass,
      breakGlassConfirmed
    });

    setIsSubmitting(false);

    if (res.success && res.request) {
      setActiveRequest(res.request);

      if (res.request.status === 'approved') {
        // Emergency access was instantly approved
        const dataRes = await qrShareService.fetchScopedProtectedDataAsync(
          res.request.id,
          user.id || 'doc-1'
        );
        if (dataRes.success) {
          setScopedData(dataRes.data);
        }
      }
    } else {
      setFormError(res.error || 'Failed to submit access request. Please retry.');
    }
  };

  const handleScopeToggle = (key: keyof QrAccessScope) => {
    setScopes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // -------------------------------------------------------------
  // Render Loading State
  // -------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center animate-pulse">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-white">Resolving Security Token...</h2>
          <p className="text-xs text-slate-400">
            Enforcing zero-trust healthcare token validation. Sensitive patient details remain protected until authorization.
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Render Invalid / Expired / Revoked Token
  // -------------------------------------------------------------
  if (resolveError || !resolution) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-950/60 text-rose-500 border border-rose-800 flex items-center justify-center">
            <XCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Access Token Unavailable
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              This patient QR token cannot be resolved. The token has{' '}
              {resolveError === 'revoked'
                ? 'been revoked by the patient'
                : resolveError === 'expired'
                ? 'expired past its authorized window'
                : 'either expired or does not exist in the health registry'}
              .
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-left text-[11px] font-mono text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Security Gate:</span>
              <span className="text-rose-400 font-bold uppercase">{resolveError || 'INVALID_TOKEN'}</span>
            </div>
            <div className="truncate text-slate-500">Token: {token}</div>
            <div className="text-slate-500">Protection: Zero-Trust Strict Rejection</div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => (onNavigateHome ? onNavigateHome() : (window.location.href = '/'))}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Medical AI Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Render Approved / Scoped Medical Records View
  // -------------------------------------------------------------
  if (activeRequest && activeRequest.status === 'approved' && scopedData) {
    const isEmergency = activeRequest.isEmergencyBreakGlass;

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
        <div className="w-full max-w-2xl bg-slate-900 rounded-3xl border-2 border-emerald-500/50 shadow-2xl overflow-hidden">
          {/* Header Banner */}
          <div className={`px-6 py-4 flex items-center justify-between border-b ${isEmergency ? 'bg-amber-950/70 border-amber-800 text-amber-200' : 'bg-emerald-950/60 border-emerald-800 text-emerald-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isEmergency ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'}`}>
                {isEmergency ? <Flame className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold">
                  {isEmergency ? 'EMERGENCY BREAK-GLASS ACTIVE' : 'PATIENT CONSENT AUTHORIZED'}
                </span>
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Scoped Medical Information Released
                </h2>
              </div>
            </div>

            <div className="text-right text-[11px] font-mono">
              <span className="text-slate-400 block">Grant Expires:</span>
              <span className="text-emerald-400 font-bold">
                {activeRequest.expiresAt ? new Date(activeRequest.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '30 mins'}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Identity Strip */}
            <div className="flex items-center justify-between p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
              <div>
                <div className="text-xs text-slate-400">Patient Identifier</div>
                <div className="text-lg font-bold text-white">{activeRequest.patientName}</div>
                <div className="text-xs font-mono text-emerald-400 mt-0.5">{activeRequest.patientIdCode}</div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-400">Authorized Requester</div>
                <div className="text-xs font-semibold text-slate-200">{activeRequest.requesterName}</div>
                <div className="text-[11px] font-mono text-blue-400 capitalize">{activeRequest.requesterRole}</div>
              </div>
            </div>

            {/* Scoped Data Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Blood Group */}
              {scopedData.bloodGroup && (
                <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>Blood Group</span>
                  </div>
                  <div className="text-2xl font-black text-rose-400 font-mono">
                    {scopedData.bloodGroup}
                  </div>
                  <div className="text-[10px] text-slate-400">Validated Institutional Registry</div>
                </div>
              )}

              {/* Emergency Notes */}
              {scopedData.emergencyNotes && (
                <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1 sm:col-span-1">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Emergency Directives</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {scopedData.emergencyNotes}
                  </p>
                </div>
              )}

              {/* Allergies */}
              {scopedData.allergies && (
                <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2 sm:col-span-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Documented Allergies & Contraindications</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {scopedData.allergies.map((allergy: string, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold rounded-lg"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Emergency Contacts */}
              {scopedData.emergencyContacts && scopedData.emergencyContacts.length > 0 && (
                <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2 sm:col-span-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>Emergency Contacts</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {scopedData.emergencyContacts.map((contact: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">{contact.name}</div>
                          <div className="text-[11px] text-slate-400">{contact.relationship}</div>
                        </div>
                        <a
                          href={`tel:${toDialablePhone(contact.phone)}`}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vitals */}
              {scopedData.vitals && scopedData.vitals.length > 0 && (
                <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2 sm:col-span-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span>Recent Ambulatory Vitals</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {scopedData.vitals.slice(0, 4).map((v: any, i: number) => (
                      <div key={i} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-center">
                        <div className="text-[10px] text-slate-400 uppercase font-mono">{v.type || 'Telemetry'}</div>
                        <div className="text-sm font-bold text-white mt-0.5">{v.value} {v.unit}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medications */}
              {scopedData.medications && scopedData.medications.length > 0 && (
                <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2 sm:col-span-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <Pill className="w-4 h-4 text-purple-400" />
                    <span>Prescribed Regimens</span>
                  </div>
                  <div className="space-y-1.5">
                    {scopedData.medications.slice(0, 3).map((m: any, i: number) => (
                      <div key={i} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between text-xs">
                        <span className="font-bold text-white">{m.name}</span>
                        <span className="text-slate-400">{m.dosage} · {m.frequency}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Compliance Footer */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Audited HIPAA-Compliant Scoped Access Gate</span>
              </div>
              <button
                onClick={() => (onNavigateHome ? onNavigateHome() : (window.location.href = '/'))}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors cursor-pointer"
              >
                Close Encounter
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Render Pending / Denied / Revoked State
  // -------------------------------------------------------------
  if (activeRequest && activeRequest.status === 'pending') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
        <div className="w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-8 text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
              <Clock className="w-8 h-8 animate-spin" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-blue-950/80 border border-blue-800 text-blue-400 text-xs font-mono font-bold uppercase rounded-full">
              Status: Awaiting Patient Consent
            </span>
            <h2 className="text-xl font-black text-white tracking-tight mt-2">
              Access Request Registered
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              Your request has been dispatched to <strong>{resolution.maskedPatientName}</strong>. The patient has been notified in their dashboard and mobile app to review and approve access.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs font-mono space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Request ID:</span>
              <span className="text-slate-300 font-bold">{activeRequest.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Reason:</span>
              <span className="text-slate-300">{activeRequest.reasonLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Requester:</span>
              <span className="text-blue-400">{activeRequest.requesterName} ({activeRequest.requesterRole})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Live Sync:</span>
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Listening for Approval
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => {
                setActiveRequest(null);
                setScopedData(null);
              }}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Modify or Re-submit Request
            </button>
            <button
              onClick={() => (onNavigateHome ? onNavigateHome() : (window.location.href = '/'))}
              className="text-slate-500 hover:text-slate-300 text-xs transition-colors py-1 cursor-pointer"
            >
              Cancel and Return to Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeRequest && (activeRequest.status === 'denied' || activeRequest.status === 'revoked')) {
    const isRevoked = activeRequest.status === 'revoked';
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
        <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-8 text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-500 flex items-center justify-center">
            <XCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              {isRevoked ? 'Access Revoked by Patient' : 'Access Request Denied'}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isRevoked
                ? 'The patient has revoked authorization for this encounter. Protected health records are no longer accessible.'
                : 'The patient declined authorization for this request. No protected clinical records were released.'}
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-left text-xs font-mono text-slate-400">
            <div>Request ID: {activeRequest.id}</div>
            <div>Recorded Status: {activeRequest.status.toUpperCase()}</div>
          </div>

          <button
            onClick={() => {
              setActiveRequest(null);
              setScopedData(null);
            }}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Submit New Access Request
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Primary Workflow: Patient Information Access Request Form
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-xl bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        {/* Step 0: Minimal Verification Strip (No Protected Data Revealed) */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block leading-none">
                VERIFIED PASS ID · ENCRYPTED GATE
              </span>
              <h1 className="text-xs sm:text-sm font-bold text-white mt-0.5">
                Patient Information Access Request
              </h1>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-500 block">Patient Code</span>
            <span className="text-xs font-mono font-bold text-slate-200">{resolution.patientIdCode}</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitRequest} className="p-6 space-y-6">
          {/* Minimum Information Header Notice */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                Target Record
              </span>
              <div className="text-base font-extrabold text-white tracking-tight">
                {resolution.maskedPatientName}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {resolution.institutionName}
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-center">
              <span className="text-[9px] font-mono uppercase block font-semibold">TOKEN STATUS</span>
              <span className="text-xs font-bold">Active & Valid</span>
            </div>
          </div>

          {/* STEP 1: Requester Identity Verification */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 text-[11px] font-mono flex items-center justify-center">1</span>
                <span>Requester Authenticated Identity</span>
              </label>

              {isAuthenticated && (
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified Session
                </span>
              )}
            </div>

            {isAuthenticated && user ? (
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    {role === 'doctor' ? '🩺' : '👤'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{user.name || (role === 'doctor' ? 'Dr. Sarah Chen, MD' : 'Care Provider')}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold bg-blue-900/60 text-blue-300 border border-blue-700">
                        {role || 'clinician'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">{user.email || 'verified.clinician@medicalai.org'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => loginAsDemo(role === 'doctor' ? 'patient' : 'doctor')}
                    className="text-[11px] text-blue-400 hover:text-blue-300 underline font-mono cursor-pointer"
                  >
                    Switch Demo
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-950/40 border border-amber-900/60 rounded-2xl space-y-3">
                <div className="flex items-start gap-2.5 text-xs text-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Sign-In Required:</strong> Protected patient records cannot be requested without an authenticated session.
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => loginAsDemo('doctor')}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Enter as Doctor (Dr. Sarah Chen)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => loginAsDemo('patient')}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Enter as Caregiver
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: Select Reason for Access */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 text-[11px] font-mono flex items-center justify-center">2</span>
              <span>Mandatory Purpose & Reason for Access</span>
            </label>

            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as QrAccessReasonKey)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="consultation_treatment">Patient consultation or clinical treatment</option>
              <option value="emergency_assistance">Emergency medical assistance</option>
              <option value="admission_assessment">Hospital admission or clinical assessment</option>
              <option value="followup_care">Authorized clinical follow-up care</option>
              <option value="caregiver_assistance">Patient-authorized caregiver assistance</option>
              <option value="insurance_admin">Insurance or administrative processing</option>
              <option value="other">Other legitimate purpose (Requires detailed explanation)</option>
            </select>

            {/* Additional Explanation */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px]">
                <label className="text-slate-400 font-medium">
                  Additional Clinical Explanation {reason === 'other' || isEmergencyBreakGlass ? '(Required)' : '(Recommended)'}:
                </label>
                <span className="text-slate-500 font-mono">{explanation.length} chars</span>
              </div>
              <textarea
                rows={2}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder={
                  reason === 'other'
                    ? 'State the specific legitimate purpose and clinical basis for accessing this record...'
                    : 'e.g., Pre-encounter clinical review prior to scheduled outpatient triage.'
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* STEP 3: Categories of Information Requested */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 text-[11px] font-mono flex items-center justify-center">3</span>
              <span>Requested Information Scope</span>
            </label>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800/80 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={scopes.bloodGroup}
                  onChange={() => handleScopeToggle('bloodGroup')}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span className="text-slate-300">Blood Type</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800/80 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={scopes.allergies}
                  onChange={() => handleScopeToggle('allergies')}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span className="text-slate-300">Allergies & Contraindications</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800/80 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={scopes.emergencyContacts}
                  onChange={() => handleScopeToggle('emergencyContacts')}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span className="text-slate-300">Emergency Contacts</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800/80 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={scopes.emergencyNotes}
                  onChange={() => handleScopeToggle('emergencyNotes')}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span className="text-slate-300">Emergency Directives</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800/80 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={scopes.vitals}
                  onChange={() => handleScopeToggle('vitals')}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span className="text-slate-300">Ambulatory Vitals</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800/80 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={scopes.medications}
                  onChange={() => handleScopeToggle('medications')}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span className="text-slate-300">Active Medications</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800/80 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={scopes.clinicalNotes}
                  onChange={() => handleScopeToggle('clinicalNotes')}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span className="text-slate-300">Clinical Consultation Notes</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800/80 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={scopes.labReports}
                  onChange={() => handleScopeToggle('labReports')}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span className="text-slate-300">Diagnostic Reports</span>
              </label>
            </div>
          </div>

          {/* STEP 4: Emergency Break-Glass Pathway (Optional Clinician Bypass) */}
          {role === 'doctor' && (
            <div className={`p-4 rounded-2xl border transition-colors ${isEmergencyBreakGlass ? 'bg-amber-950/40 border-amber-700/80' : 'bg-slate-950 border-slate-800'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className={`w-4 h-4 ${isEmergencyBreakGlass ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-bold text-white">Emergency Break-Glass Protocol</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEmergencyBreakGlass}
                    onChange={(e) => setIsEmergencyBreakGlass(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600" />
                </label>
              </div>

              {isEmergencyBreakGlass && (
                <div className="mt-3 space-y-3 text-xs text-amber-200/90 leading-relaxed border-t border-amber-900/60 pt-3">
                  <p>
                    ⚠️ <strong>Clinical Liability Notice:</strong> Break-glass grants immediate, time-limited emergency access (30 minutes) to life-safety data without waiting for patient approval. An immediate alert will be dispatched to the patient and an immutable audit log entry will be logged under your physician credentials.
                  </p>
                  <label className="flex items-start gap-2 cursor-pointer font-medium text-amber-100">
                    <input
                      type="checkbox"
                      checked={breakGlassConfirmed}
                      onChange={(e) => setBreakGlassConfirmed(e.target.checked)}
                      className="mt-0.5 rounded text-amber-600 focus:ring-0"
                    />
                    <span>I attest under medical licensing rules that an immediate clinical emergency exists.</span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Form Error Banner */}
          {formError && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{formError}</span>
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting || !isAuthenticated}
              className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                isEmergencyBreakGlass
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Validating Security Policy...</span>
                </>
              ) : isEmergencyBreakGlass ? (
                <>
                  <Flame className="w-4 h-4" />
                  <span>Authorize Emergency Break-Glass Access</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Request Patient Authorization</span>
                </>
              )}
            </button>

            <div className="text-center text-[10px] text-slate-500">
              Zero-Trust Verification · Governed by HIPAA & Clinical Data Governance Policies
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
