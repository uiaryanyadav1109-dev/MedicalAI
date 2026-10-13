import React, { useState, useEffect } from 'react';
import { qrShareService } from '../../../services/qrShareService';
import {
  QrTokenResolution,
  QrAccessRequest,
  QrAccessReasonKey,
  QrAccessScope
} from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import {
  ShieldCheck,
  AlertTriangle,
  QrCode,
  X,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Activity,
  Heart,
  Pill,
  Phone,
  Flame,
  Send,
  ArrowRight,
  Lock,
  Stethoscope,
  ExternalLink
} from 'lucide-react';

interface DoctorQrAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient?: (patientId: string) => void;
}

export const DoctorQrAccessModal: React.FC<DoctorQrAccessModalProps> = ({
  isOpen,
  onClose,
  onSelectPatient
}) => {
  const { user } = useAuth();
  const [tokenInput, setTokenInput] = useState(() => {
    return qrShareService.getEmergencyShareToken('pat-1')?.token || '';
  });
  const [isResolving, setIsResolving] = useState(false);
  const [resolution, setResolution] = useState<QrTokenResolution | null>(null);
  const [resolvedPatientId, setResolvedPatientId] = useState<string>('pat-1');
  const [resolveError, setResolveError] = useState<string | null>(null);

  // Request form state
  const [reason, setReason] = useState<QrAccessReasonKey>('consultation_treatment');
  const [explanation, setExplanation] = useState('Clinical evaluation & pre-encounter medical history review.');
  const [scopes, setScopes] = useState<QrAccessScope>({
    bloodGroup: true,
    allergies: true,
    vitals: true,
    medications: true,
    emergencyContacts: true,
    emergencyNotes: true,
    clinicalNotes: true,
    labReports: true
  });
  const [isEmergencyBreakGlass, setIsEmergencyBreakGlass] = useState(false);
  const [breakGlassConfirmed, setBreakGlassConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Active request state
  const [activeRequest, setActiveRequest] = useState<QrAccessRequest | null>(null);
  const [scopedData, setScopedData] = useState<any>(null);

  // Auto-resolve active token when modal opens
  useEffect(() => {
    if (isOpen) {
      const activeShare = qrShareService.getEmergencyShareToken('pat-1');
      const tokenToUse = activeShare?.token || tokenInput;
      if (tokenToUse) {
        setTokenInput(tokenToUse);
        handleResolveToken(tokenToUse);
      }
    }
  }, [isOpen]);

  // Poll request status while pending or approved
  useEffect(() => {
    if (!activeRequest) return;

    let isMounted = true;
    const pollStatus = async () => {
      const updated = await qrShareService.getAccessRequestByIdAsync(activeRequest.id);
      if (!isMounted || !updated) return;

      setActiveRequest(updated);

      if (updated.status === 'approved' && !scopedData) {
        const dataRes = await qrShareService.fetchScopedProtectedDataAsync(
          updated.id,
          user?.id || 'doc-1'
        );
        if (dataRes.success && isMounted) {
          setScopedData(dataRes.data);
        }
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeRequest?.id, activeRequest?.status, user?.id, scopedData]);

  if (!isOpen) return null;

  const handleResolveToken = async (rawInput: string) => {
    const cleanToken = rawInput.trim().replace(/^https?:\/\/[^\/]+\/share\//, '');
    if (!cleanToken) {
      setResolveError('Please enter a valid QR token or link.');
      return;
    }

    setIsResolving(true);
    setResolveError(null);
    setResolution(null);
    setActiveRequest(null);
    setScopedData(null);

    const res = await qrShareService.resolveQrTokenAsync(cleanToken);
    setIsResolving(false);

    if (res.success && res.resolution) {
      setResolution(res.resolution);
      if (res.patientId) setResolvedPatientId(res.patientId);
    } else {
      setResolveError(res.error || 'Token cannot be resolved. It may be expired or invalid.');
    }
  };

  const handleScopeToggle = (key: keyof QrAccessScope) => {
    setScopes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!resolution) {
      setSubmitError('Please resolve a valid patient QR token first.');
      return;
    }

    const trimmedExp = explanation.trim();
    if (reason === 'other' && trimmedExp.length < 5) {
      setSubmitError('A detailed written explanation (at least 5 characters) is required when selecting "Other".');
      return;
    }

    if (isEmergencyBreakGlass) {
      if (!breakGlassConfirmed) {
        setSubmitError('You must explicitly affirm clinical emergency necessity before invoking break-glass access.');
        return;
      }
      if (trimmedExp.length < 8) {
        setSubmitError('A clinical justification (at least 8 characters) is required for emergency break-glass.');
        return;
      }
    }

    setIsSubmitting(true);

    const res = await qrShareService.submitAccessRequestAsync({
      qrToken: resolution.token,
      patientId: resolvedPatientId,
      requesterId: user?.id || 'doc-1',
      requesterName: user?.name || 'Dr. Sarah Chen, MD',
      requesterRole: 'doctor',
      requesterEmail: user?.email || 'sarah.chen@medicalai.org',
      requesterOrganization: 'Metro Clinical Reference Center',
      reason,
      explanation: trimmedExp,
      requestedScopes: scopes,
      isEmergencyBreakGlass,
      breakGlassConfirmed
    });

    setIsSubmitting(false);

    if (res.success && res.request) {
      setActiveRequest(res.request);

      if (res.request.status === 'approved') {
        const dataRes = await qrShareService.fetchScopedProtectedDataAsync(
          res.request.id,
          user?.id || 'doc-1'
        );
        if (dataRes.success) {
          setScopedData(dataRes.data);
        }
      }
    } else {
      setSubmitError(res.error || 'Failed to submit access request.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                CLINICIAN QR GATE · MANDATORY REASON
              </span>
              <h2 className="text-sm font-bold text-white">
                Scan Patient QR & Request Data Access
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Active Request: Approved State with Scoped Medical Records */}
          {activeRequest && activeRequest.status === 'approved' && scopedData ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border ${activeRequest.isEmergencyBreakGlass ? 'bg-amber-950/40 border-amber-700/80' : 'bg-emerald-950/50 border-emerald-700/80'}`}>
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  {activeRequest.isEmergencyBreakGlass ? <Flame className="w-4 h-4 text-amber-400" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                  <span>{activeRequest.isEmergencyBreakGlass ? 'Emergency Break-Glass Active' : 'Patient Consent Approved'}</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1">
                  Patient <strong>{activeRequest.patientName}</strong> ({activeRequest.patientIdCode}) released scoped records. Expires at {activeRequest.expiresAt ? new Date(activeRequest.expiresAt).toLocaleTimeString() : '30 mins'}.
                </div>
              </div>

              {/* Scoped Data Cards */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {scopedData.bloodGroup && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Blood Type</span>
                    <span className="text-lg font-bold text-rose-400 font-mono">{scopedData.bloodGroup}</span>
                  </div>
                )}
                {scopedData.emergencyNotes && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Directives</span>
                    <span className="text-slate-200 line-clamp-2">{scopedData.emergencyNotes}</span>
                  </div>
                )}
                {scopedData.allergies && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 col-span-2">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Allergies</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {scopedData.allergies.map((a: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-[10px]">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {scopedData.emergencyContacts && scopedData.emergencyContacts.length > 0 && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 col-span-2">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Emergency Contacts</span>
                    <div className="space-y-1 mt-1">
                      {scopedData.emergencyContacts.map((c: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-[11px]">
                          <span>{c.name} ({c.relationship})</span>
                          <span className="font-mono text-emerald-400">{c.phone}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                {onSelectPatient && (
                  <button
                    onClick={() => {
                      onSelectPatient(resolvedPatientId);
                      onClose();
                    }}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Open Patient Chart in Hub</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : activeRequest && activeRequest.status === 'pending' ? (
            /* Pending Approval Polling View */
            <div className="p-6 text-center space-y-4 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/40 flex items-center justify-center mx-auto animate-pulse">
                <Clock className="w-6 h-6 animate-spin" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Access Request Registered</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Awaiting patient approval from <strong>{resolution?.maskedPatientName}</strong>. This modal will automatically display their records once authorized in their portal.
                </p>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 text-left space-y-1">
                <div>Request ID: {activeRequest.id}</div>
                <div>Status: PENDING_PATIENT_CONSENT</div>
                <div className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Sync Active
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveRequest(null)}
                className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
              >
                Modify or Cancel Request
              </button>
            </div>
          ) : (
            /* Request Form */
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              {/* Token Input Strip */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Patient QR Token or Scanned Pass URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="Enter token e.g. mai-mv2p5tyz..."
                    className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleResolveToken(tokenInput)}
                    disabled={isResolving}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isResolving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    <span>Resolve</span>
                  </button>
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      const activeShare = qrShareService.getEmergencyShareToken('pat-1');
                      if (activeShare?.token) {
                        setTokenInput(activeShare.token);
                        handleResolveToken(activeShare.token);
                      }
                    }}
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Auto-Fill Active Patient Pass (Aryan Yadav · MAI-80429)</span>
                  </button>
                  <span className="text-[10px] text-slate-500 font-mono">Zero-Trust Protected</span>
                </div>
              </div>

              {/* Resolution Status Box */}
              {resolution && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Resolved Pass</span>
                    <span className="font-bold text-white">{resolution.maskedPatientName}</span>
                    <span className="text-[11px] text-slate-400 font-mono ml-2">({resolution.patientIdCode})</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-[10px] font-mono font-bold">
                    ACTIVE PASS
                  </span>
                </div>
              )}

              {resolveError && (
                <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{resolveError}</span>
                </div>
              )}

              {/* Mandatory Reason */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Mandatory Clinical Reason:
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as QrAccessReasonKey)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="consultation_treatment">Patient consultation or clinical treatment</option>
                  <option value="admission_assessment">Hospital admission or clinical assessment</option>
                  <option value="emergency_assistance">Emergency medical assistance</option>
                  <option value="followup_care">Authorized clinical follow-up care</option>
                  <option value="caregiver_assistance">Caregiver assistance</option>
                  <option value="other">Other legitimate purpose</option>
                </select>
              </div>

              {/* Additional Explanation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Clinical Explanation:
                </label>
                <textarea
                  rows={2}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Provide clinical rationale for accessing patient record..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Requested Scope Checkboxes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Requested Clinical Scopes:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scopes.bloodGroup}
                      onChange={() => handleScopeToggle('bloodGroup')}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span className="text-slate-300">Blood Type</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scopes.allergies}
                      onChange={() => handleScopeToggle('allergies')}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span className="text-slate-300">Allergies</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scopes.vitals}
                      onChange={() => handleScopeToggle('vitals')}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span className="text-slate-300">Vitals</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scopes.medications}
                      onChange={() => handleScopeToggle('medications')}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span className="text-slate-300">Medications</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scopes.clinicalNotes}
                      onChange={() => handleScopeToggle('clinicalNotes')}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span className="text-slate-300">Consultation Notes</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
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

              {/* Emergency Break-Glass Pathway */}
              <div className={`p-3.5 rounded-2xl border transition-colors ${isEmergencyBreakGlass ? 'bg-amber-950/40 border-amber-700/80' : 'bg-slate-950 border-slate-800'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className={`w-4 h-4 ${isEmergencyBreakGlass ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-bold text-white">Emergency Break-Glass Override</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEmergencyBreakGlass}
                      onChange={(e) => setIsEmergencyBreakGlass(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-amber-600" />
                  </label>
                </div>

                {isEmergencyBreakGlass && (
                  <div className="mt-2.5 pt-2 border-t border-amber-900/60 text-xs text-amber-200/90 space-y-2">
                    <p className="text-[11px] leading-relaxed">
                      Bypasses patient consent for immediate life-safety emergencies. An immutable audit record will be logged with your physician credentials.
                    </p>
                    <label className="flex items-start gap-2 cursor-pointer font-medium text-amber-100">
                      <input
                        type="checkbox"
                        checked={breakGlassConfirmed}
                        onChange={(e) => setBreakGlassConfirmed(e.target.checked)}
                        className="mt-0.5 rounded text-amber-600 focus:ring-0"
                      />
                      <span className="text-[11px]">I affirm this is an acute clinical emergency requiring immediate records access.</span>
                    </label>
                  </div>
                )}
              </div>

              {submitError && (
                <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !resolution}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    isEmergencyBreakGlass
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Validating Access Policy...</span>
                    </>
                  ) : isEmergencyBreakGlass ? (
                    <>
                      <Flame className="w-4 h-4" />
                      <span>Authorize Emergency Break-Glass</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Request Patient Authorization</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
