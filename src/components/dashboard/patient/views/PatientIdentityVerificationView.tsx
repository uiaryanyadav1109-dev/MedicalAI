import React, { useState, useEffect } from 'react';
import { RoutePath, IdentityDocumentType, IdentityVerificationStatus } from '../../../../types';
import { useAuth } from '../../../../context/AuthContext';
import {
  identityVerificationService,
  maskDocumentNumber,
  VerificationSubmissionPayload,
  IdentityAuditLogEntry
} from '../../../../services/identityVerificationService';
import {
  runIdentityVerificationTests,
  IdentityVerificationTestReport
} from '../../../../services/__tests__/identityVerification.test';
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  FileCheck2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Upload,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  FileText,
  UserCheck,
  ExternalLink,
  ChevronRight,
  Info,
  Calendar,
  Globe,
  CreditCard,
  Building,
  Check,
  X,
  Play,
  RotateCcw
} from 'lucide-react';

interface PatientIdentityVerificationViewProps {
  onNavigate: (route: RoutePath) => void;
}

export const PatientIdentityVerificationView: React.FC<PatientIdentityVerificationViewProps> = ({
  onNavigate
}) => {
  const { user } = useAuth();
  const userId = user?.id || 'pat-1';

  // Live verification record
  const [record, setRecord] = useState(identityVerificationService.getVerificationRecord(userId));
  const providerStatus = identityVerificationService.getProviderStatus();

  // Multi-step form state
  const [step, setStep] = useState<'status' | 'consent' | 'document_details' | 'upload_ephemeral'>('status');
  const [documentType, setDocumentType] = useState<IdentityDocumentType>('drivers_license');
  const [issuingCountry, setIssuingCountry] = useState(user?.country || 'India');
  const [legalFullName, setLegalFullName] = useState(user?.name || 'Aryan Yadav');
  const [documentNumberRaw, setDocumentNumberRaw] = useState('');
  const [expirationDate, setExpirationDate] = useState('2032-12-31');
  const [consentGiven, setConsentGiven] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Audit logs and Test Suite
  const [auditLogs, setAuditLogs] = useState<IdentityAuditLogEntry[]>([]);
  const [testReport, setTestReport] = useState<IdentityVerificationTestReport | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  useEffect(() => {
    refreshRecord();
  }, [userId]);

  const refreshRecord = () => {
    const rec = identityVerificationService.getVerificationRecord(userId);
    setRecord(rec);
    setAuditLogs(identityVerificationService.getAuditLogs(userId));
  };

  const showNotificationToast = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handleStartVerification = () => {
    setStep('consent');
    setFormError(null);
  };

  const handleCancelProcess = () => {
    setStep('status');
    setFormError(null);
    setConsentGiven(false);
    setDocumentNumberRaw('');
    setSelectedFileName(null);
  };

  const handleWithdrawSubmission = () => {
    if (window.confirm('Are you sure you want to cancel your verification request? Your account will remain active as Not Verified.')) {
      const res = identityVerificationService.cancelVerification(userId);
      setRecord(res.record);
      setStep('status');
      refreshRecord();
      showNotificationToast('Verification request cancelled. Portal access remains uninterrupted.');
    }
  };

  const handleResetRecord = () => {
    const res = identityVerificationService.resetVerification(userId);
    setRecord(res);
    setStep('status');
    refreshRecord();
    showNotificationToast('Verification record reset to Not Started.');
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const payload: VerificationSubmissionPayload = {
      documentType,
      issuingCountry,
      legalFullName,
      documentNumberRaw,
      expirationDate,
      consentGiven,
      documentImageName: selectedFileName || undefined
    };

    const res = await identityVerificationService.submitVerification(userId, payload);
    setIsSubmitting(false);

    if (!res.success) {
      setFormError(res.error || 'Submission failed. Please check inputs.');
      return;
    }

    setRecord(res.record);
    setStep('status');
    refreshRecord();
    showNotificationToast('Verification document submitted successfully. Under review.');
  };

  const handleSimulateStatus = (status: IdentityVerificationStatus, reason?: string) => {
    const updated = identityVerificationService.updateStatus(userId, status, {
      rejectionReason: reason,
      reviewNotes: status === 'needs_review' ? 'Document image contains minor reflection. Verification officer requested confirmation.' : undefined
    });
    setRecord(updated);
    refreshRecord();
    showNotificationToast(`Status updated to: ${status.toUpperCase().replace('_', ' ')}`);
  };

  const handleRunTests = async () => {
    setIsRunningTests(true);
    try {
      const report = await runIdentityVerificationTests();
      setTestReport(report);
      refreshRecord();
    } catch (e: any) {
      console.error('Test execution error:', e);
    } finally {
      setIsRunningTests(false);
    }
  };

  const getStatusBadge = (status: IdentityVerificationStatus) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            Under Review (Pending)
          </span>
        );
      case 'needs_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300 dark:border-sky-700">
            <AlertTriangle className="w-3.5 h-3.5" />
            Needs Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      case 'not_started':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <HelpCircle className="w-3.5 h-3.5" />
            Not Started (Optional)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-xl shadow-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-100 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-sky-600 dark:text-sky-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Identity Assurance & Document Governance</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
            Optional Identity Verification
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Official government-issued identity credential verification. Required only for regulated
            e-prescribing and federated cross-hospital medical record requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {getStatusBadge(record.status)}
          <button
            onClick={() => onNavigate('/dashboard/patient-card')}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            View Patient Card
          </button>
        </div>
      </div>

      {/* 1. CRITICAL DISTINCTION CALLOUT: Patient ID vs Government ID */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Crucial Distinction: Application Patient ID vs. Government Identity Credential
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-blue-100 dark:border-blue-900/40">
                <div className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5 mb-1">
                  <CreditCard className="w-4 h-4" />
                  Application Patient ID / MRN ({user?.patientId || user?.mrn || 'MAI-80429'})
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Your internal clinic identifier generated by this portal. Used for appointments, doctor handoffs,
                  vitals tracking, and digital patient cards. <strong>Always available without government ID verification.</strong>
                </p>
              </div>

              <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                <div className="font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  Government Identity Document (Optional)
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Official state-issued credential (Passport, Driver’s License). Needed <strong>strictly</strong> when
                  authorizing controlled medication e-prescriptions or statutory insurance health record federation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TRANSPARENT PROVIDER ARCHITECTURE & RETENTION STATEMENT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Provider Integration Boundary */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Identity Verification Provider
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
              {providerStatus.environment === 'production' ? 'Production Live' : 'Sandbox Simulated'}
            </span>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-sky-500" />
            {providerStatus.providerName}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {providerStatus.disclaimer}
          </p>
          <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <strong>Architecture Notice:</strong> We do not connect directly to government databases or verify accounts merely on image upload. In production, verified vendors (e.g. Stripe Identity, Persona) validate biometric authenticity.
          </div>
        </div>

        {/* Data Retention & Privacy Guarantees */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Data Retention & Minimization
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
              Ephemeral Processing
            </span>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-500" />
            Zero Long-Term Image Storage
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Document images are evaluated in-memory and discarded immediately after optical authenticity
            and cryptographic hash validation. No raw images or full document numbers are stored in browser storage.
          </p>
          <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <strong>QR Code & Patient Card Isolation:</strong> Government ID numbers are strictly excluded from patient cards and QR code tokens.
          </div>
        </div>
      </div>

      {/* 3. CURRENT STATUS CARD & INTERACTIVE WIZARD */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        {step === 'status' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Verification Status Details
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Current credential authorization state for account: {user?.email}
                </p>
              </div>
              <div>{getStatusBadge(record.status)}</div>
            </div>

            {/* Status Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block font-semibold mb-0.5">Document Type</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {record.documentType ? record.documentType.toUpperCase().replace('_', ' ') : 'None Submitted'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block font-semibold mb-0.5">Masked Number</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {record.maskedDocumentNumber || 'Not recorded'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block font-semibold mb-0.5">Issuing Jurisdiction</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {record.issuingCountry || 'Unspecified'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block font-semibold mb-0.5">Verification Date</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {record.verifiedAt
                    ? new Date(record.verifiedAt).toLocaleDateString()
                    : record.submittedAt
                    ? `Submitted ${new Date(record.submittedAt).toLocaleDateString()}`
                    : 'Not submitted'}
                </span>
              </div>
            </div>

            {/* Contextual Guidance per status */}
            {record.status === 'not_started' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-sky-500" />
                    Identity verification is completely optional
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    You can continue utilizing medical AI symptom checks, vitals logging, emergency SOS, and appointments without verifying a government ID.
                  </p>
                </div>
                <button
                  onClick={handleStartVerification}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer transition-colors shadow-xs"
                >
                  Start Optional Verification
                </button>
              </div>
            )}

            {record.status === 'pending' && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Verification Request Pending
                  </div>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                    Your credential was submitted and is undergoing optical authenticity and anti-spoofing checks.
                    You may withdraw this request at any time.
                  </p>
                </div>
                <button
                  onClick={handleWithdrawSubmission}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer transition-colors shadow-xs"
                >
                  Cancel / Withdraw Request
                </button>
              </div>
            )}

            {record.status === 'needs_review' && (
              <div className="p-4 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-200 dark:border-sky-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-sky-900 dark:text-sky-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-sky-600" />
                    Needs Manual Review
                  </div>
                  <p className="text-xs text-sky-800/80 dark:text-sky-300/80">
                    {record.reviewNotes || 'Verification provider flagged document clarity. A compliance officer has been notified.'}
                  </p>
                </div>
                <button
                  onClick={handleStartVerification}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer transition-colors shadow-xs"
                >
                  Submit Updated Document
                </button>
              </div>
            )}

            {record.status === 'rejected' && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Verification Declined
                  </div>
                  <p className="text-xs text-rose-800/80 dark:text-rose-300/80">
                    Reason: {record.rejectionReason || 'Document could not be authenticated or validity date expired.'}
                  </p>
                </div>
                <button
                  onClick={handleStartVerification}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer transition-colors shadow-xs"
                >
                  Try Again with Valid Document
                </button>
              </div>
            )}

            {record.status === 'verified' && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Credential Successfully Verified
                  </div>
                  <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
                    Full clinical authorization granted. Controlled medication e-prescribing and inter-hospital EHR federation unlocked.
                  </p>
                </div>
                <button
                  onClick={handleResetRecord}
                  className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl shrink-0 cursor-pointer transition-colors"
                >
                  Reset / Re-verify
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 1: INFORMED CONSENT & CANCEL CONTROLS */}
        {step === 'consent' && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Step 1: Informed Consent & Verification Purpose
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Please review what data is collected and how it will be processed before proceeding.
                </p>
              </div>
              <button
                onClick={handleCancelProcess}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                Cancel & Exit
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p>
                <strong>1. Why verification is requested:</strong> To authenticate your identity when ordering regulated pharmaceuticals, verifying healthcare insurance policies, or transferring official medical records across clinical organizations.
              </p>
              <p>
                <strong>2. What information is collected:</strong> Issuing country, document type, document expiration date, and a masked identifier (last 4 characters only).
              </p>
              <p>
                <strong>3. Image handling:</strong> Uploaded identity images are analyzed ephemerally in-memory for optical fraud detection and then immediately purged. No raw document images are persisted in long-term databases or browser storage.
              </p>
              <p>
                <strong>4. Optionality:</strong> You may cancel at any time. Everyday portal features (vitals, chat, timeline, SOS) do NOT require government identity verification.
              </p>
            </div>

            <label className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                I give explicit consent for the ephemeral processing of my official government identity document for clinical identity matching. I confirm the document is authentic and lawfully issued.
              </span>
            </label>

            {formError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-900 dark:text-rose-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancelProcess}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!consentGiven}
                onClick={() => {
                  if (consentGiven) {
                    setStep('document_details');
                    setFormError(null);
                  }
                }}
                className={`px-5 py-2 text-xs font-bold rounded-xl text-white transition-colors cursor-pointer ${
                  consentGiven ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-400 cursor-not-allowed'
                }`}
              >
                Continue to Document Details
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DOCUMENT DETAILS & MASKING PREVIEW */}
        {step === 'document_details' && (
          <form onSubmit={(e) => { e.preventDefault(); setStep('upload_ephemeral'); }} className="space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Step 2: Credential Details
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select your government document type and enter expiration details.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancelProcess}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Document Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as IdentityDocumentType)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  <option value="drivers_license">Driver's License</option>
                  <option value="passport">Passport</option>
                  <option value="national_id">National ID Card</option>
                  <option value="residence_permit">Permanent Residence Permit</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Issuing Country</label>
                <input
                  type="text"
                  value={issuingCountry}
                  onChange={(e) => setIssuingCountry(e.target.value)}
                  placeholder="e.g. India, United States"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Full Legal Name on Document</label>
                <input
                  type="text"
                  value={legalFullName}
                  onChange={(e) => setLegalFullName(e.target.value)}
                  placeholder="Must match name printed on document"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Document Expiration Date</label>
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>
            </div>

            {/* Document Number with Masking Preview */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Government Document ID Number
                </label>
                <input
                  type="text"
                  value={documentNumberRaw}
                  onChange={(e) => setDocumentNumberRaw(e.target.value)}
                  placeholder="Enter full number for verification"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400">
                  Storage & Log Masking Preview:
                </span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {documentNumberRaw ? maskDocumentNumber(documentNumberRaw) : '•••• •••• ••••'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Only the masked format above will be stored in verification references. Your full document number is never saved or logged.
              </p>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep('consent')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!documentNumberRaw || !legalFullName}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Proceed to Document Upload
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: EPHEMERAL UPLOAD & SUBMISSION */}
        {step === 'upload_ephemeral' && (
          <form onSubmit={handleSubmitVerification} className="space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Step 3: Document Image Upload (Ephemeral Processing)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload an image of your {documentType.replace('_', ' ')}.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancelProcess}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {/* Ephemeral upload drop area */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-2xl p-6 text-center space-y-3 transition-colors bg-slate-50/50 dark:bg-slate-800/30">
              <Upload className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-xs text-slate-700 dark:text-slate-300">
                <span className="font-bold">Click to select file</span> or drag & drop image (JPEG, PNG, PDF up to 5MB)
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFileName(file.name);
                  }
                }}
                className="block mx-auto text-xs text-slate-500 cursor-pointer"
              />

              {selectedFileName && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-medium text-emerald-800 dark:text-emerald-300">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  <span>Selected: {selectedFileName}</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Zero-Retention Policy:</strong> This document image will be parsed in volatile memory for anti-spoofing and discarded immediately. It is <strong>NEVER</strong> written to browser disk or persistent databases.
              </span>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-900 dark:text-rose-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep('document_details')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
              >
                {isSubmitting ? 'Submitting for Optical Analysis...' : 'Submit Verification Request'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 4. SANDBOX SIMULATION & REVIEWER CONTROLS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            <RotateCcw className="w-4 h-4 text-purple-500" />
            <span>Sandbox Simulation & Lifecycle Evaluator</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Provider: {providerStatus.providerType}
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Simulate upstream verification provider callbacks to test application behavior across all lifecycle states:
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => handleSimulateStatus('verified')}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-xl border border-emerald-300 dark:border-emerald-700 transition-colors cursor-pointer"
          >
            Simulate Provider: Approved (Verified)
          </button>
          <button
            onClick={() => handleSimulateStatus('needs_review')}
            className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-300 text-xs font-bold rounded-xl border border-sky-300 dark:border-sky-700 transition-colors cursor-pointer"
          >
            Simulate Provider: Needs Review (Glare / Rescan)
          </button>
          <button
            onClick={() => handleSimulateStatus('rejected', 'Name on document does not match patient legal profile')}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-300 text-xs font-bold rounded-xl border border-rose-300 dark:border-rose-700 transition-colors cursor-pointer"
          >
            Simulate Provider: Rejected (Name Mismatch)
          </button>
          <button
            onClick={() => handleSimulateStatus('pending')}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-xl border border-amber-300 dark:border-amber-700 transition-colors cursor-pointer"
          >
            Simulate Provider: Pending
          </button>
          <button
            onClick={handleResetRecord}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Reset to Not Started
          </button>
        </div>
      </div>

      {/* 5. PRIVACY-PRESERVING AUDIT LOG TRAIL */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            <Lock className="w-4 h-4 text-emerald-500" />
            <span>Identity Audit Log (Zero PII Retention)</span>
          </div>
          <span className="text-[10px] text-slate-400">
            {auditLogs.length} events recorded
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Immutable event log tracking identity verification lifecycle milestones. Document numbers are masked and full PII is redacted.
        </p>

        {auditLogs.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            No identity verification events recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="p-3 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 font-mono font-bold text-slate-800 dark:text-slate-200">
                    <span>{log.action}</span>
                    <span className="text-slate-400 font-normal">·</span>
                    <span className="text-sky-600 dark:text-sky-400">{log.status}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {log.details || 'Identity assertion update'}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-[10px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                  {log.maskedDocumentNumber && (
                    <div className="font-mono text-[10px] text-blue-500">
                      {log.maskedDocumentNumber}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. AUTOMATED TEST SUITE RUNNER */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              <Play className="w-4 h-4 text-blue-500" />
              <span>Automated Verification Test Suite</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Executes tests for optionality, cancellation, invalid documents, provider boundaries, data retention, and isolation.
            </p>
          </div>
          <button
            onClick={handleRunTests}
            disabled={isRunningTests}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isRunningTests ? 'Running Automated Tests...' : 'Run Identity Verification Tests'}
          </button>
        </div>

        {testReport && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Test Execution Summary
              </span>
              <div className="flex items-center gap-3 font-mono">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  Passed: {testReport.passed}
                </span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">
                  Failed: {testReport.failed}
                </span>
                <span className="text-slate-500 font-bold">
                  Total: {testReport.total}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 max-h-64 overflow-y-auto">
              {testReport.results.map((r, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg text-xs flex items-center justify-between ${
                    r.passed
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {r.passed ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-rose-600" />
                    )}
                    <span>{r.testName}</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold">
                    {r.passed ? 'PASS' : `FAIL: ${r.error}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
