import React, { useState, useEffect } from 'react';
import { RoutePath, QrAccessRequest, QrAccessScope } from '../../../../types';
import { useAuth } from '../../../../context/AuthContext';
import { qrShareService } from '../../../../services/qrShareService';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Eye,
  Lock,
  User,
  Stethoscope,
  Activity,
  Calendar,
  Flame,
  FileCheck2,
  Trash2,
  ArrowRight,
  Sliders,
  Check,
  Ban
} from 'lucide-react';

interface PatientDataAccessRequestsViewProps {
  onNavigate: (route: RoutePath) => void;
}

export const PatientDataAccessRequestsView: React.FC<PatientDataAccessRequestsViewProps> = ({
  onNavigate
}) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<QrAccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'history'>('pending');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Approval Modal / Scope Customization state
  const [selectedRequest, setSelectedRequest] = useState<QrAccessRequest | null>(null);
  const [customScopes, setCustomScopes] = useState<QrAccessScope | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(60); // 60 mins default
  const [isProcessingDecision, setIsProcessingDecision] = useState(false);

  const patientId = user?.id || 'pat-1';

  const loadRequests = async (silent = false) => {
    if (!silent) setIsLoading(true);
    const data = await qrShareService.getAccessRequestsForPatientAsync(patientId);
    setRequests((prev) => {
      if (prev.length === data.length && JSON.stringify(prev) === JSON.stringify(data)) {
        return prev;
      }
      return data;
    });
    if (!silent) setIsLoading(false);
  };

  useEffect(() => {
    loadRequests();
    // Live polling every 3 seconds for new access requests
    const interval = setInterval(() => {
      loadRequests(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [patientId]);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const activeGrants = requests.filter(
    (r) => r.status === 'approved' && (!r.expiresAt || new Date(r.expiresAt).getTime() > Date.now())
  );
  const historicalRequests = requests.filter(
    (r) => r.status === 'denied' || r.status === 'revoked' || r.status === 'expired' || (r.status === 'approved' && r.expiresAt && new Date(r.expiresAt).getTime() <= Date.now())
  );

  const openApprovalModal = (req: QrAccessRequest) => {
    setSelectedRequest(req);
    setCustomScopes({ ...req.requestedScopes });
    setSelectedDuration(60);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setIsProcessingDecision(true);

    const res = await qrShareService.decideAccessRequestAsync(
      selectedRequest.id,
      'approved',
      patientId,
      customScopes || selectedRequest.requestedScopes,
      selectedDuration
    );

    setIsProcessingDecision(false);
    setSelectedRequest(null);

    if (res.success) {
      showNotification(`Access granted for ${selectedRequest.requesterName} (${selectedDuration} minutes).`);
      loadRequests(true);
    } else {
      showNotification(res.error || 'Failed to approve request.', 'error');
    }
  };

  const handleDeny = async (req: QrAccessRequest) => {
    const res = await qrShareService.decideAccessRequestAsync(
      req.id,
      'denied',
      patientId
    );

    if (res.success) {
      showNotification(`Access request from ${req.requesterName} has been denied.`);
      loadRequests(true);
    } else {
      showNotification(res.error || 'Failed to deny request.', 'error');
    }
  };

  const handleRevoke = async (req: QrAccessRequest) => {
    const res = await qrShareService.revokeAccessGrantAsync(
      req.id,
      patientId,
      'Revoked by patient via Data Access Requests dashboard'
    );

    if (res.success) {
      showNotification(`Ongoing access for ${req.requesterName} was revoked immediately.`);
      loadRequests(true);
    } else {
      showNotification(res.error || 'Failed to revoke grant.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-emerald-700 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Zero-Trust Patient Consent Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Data Access Requests & QR Permissions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Authorize or deny requests from healthcare providers scanning your institutional card. Revoke ongoing access anytime.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('/dashboard/qr-sharing')}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            My QR Settings
          </button>
          <button
            onClick={() => loadRequests()}
            className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
            title="Refresh requests"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 border ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Pending Requests</span>
          {pendingRequests.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-mono">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'active'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Active Grants</span>
          {activeGrants.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px] font-mono">
              {activeGrants.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Audit History</span>
          <span className="text-[11px] font-mono text-slate-400">({historicalRequests.length})</span>
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
          <p className="text-xs">Loading secure access records...</p>
        </div>
      ) : activeTab === 'pending' ? (
        /* PENDING REQUESTS TAB */
        pendingRequests.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Pending Access Requests</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Whenever a doctor, nurse, or caregiver scans your ID card QR code, their authorization request will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-blue-500/30 p-6 shadow-sm space-y-4 transition-all hover:border-blue-500/60"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      {req.requesterRole === 'doctor' ? <Stethoscope className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{req.requesterName}</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {req.requesterRole}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {req.requesterOrganization || 'Healthcare Provider'} · {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-mono font-bold rounded-lg border border-amber-200 dark:border-amber-800 w-fit">
                    Awaiting Consent
                  </span>
                </div>

                {/* Stated Reason & Explanation */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                    Stated Purpose for Access
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {req.reasonLabel}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                    "{req.explanation}"
                  </p>
                </div>

                {/* Requested Information Categories */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                    Requested Categories of Information
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(req.requestedScopes)
                      .filter(([_, v]) => Boolean(v))
                      .map(([k]) => (
                        <span
                          key={k}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
                        >
                          {k === 'bloodGroup' ? 'Blood Group' : k === 'emergencyContacts' ? 'Emergency Contacts' : k === 'emergencyNotes' ? 'Emergency Directives' : k === 'clinicalNotes' ? 'Consultations' : k === 'labReports' ? 'Diagnostic Reports' : k}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => openApprovalModal(req)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Access</span>
                  </button>

                  <button
                    onClick={() => handleDeny(req)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Deny Request</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'active' ? (
        /* ACTIVE GRANTS TAB */
        activeGrants.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Active Data Grants</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Your medical records are currently fully locked and private. When you approve an access request, its active time window will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {activeGrants.map((grant) => (
              <div
                key={grant.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl border p-6 shadow-xs space-y-4 ${
                  grant.isEmergencyBreakGlass
                    ? 'border-amber-400 dark:border-amber-800/80'
                    : 'border-emerald-300 dark:border-emerald-800/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                        grant.isEmergencyBreakGlass
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                      }`}
                    >
                      {grant.isEmergencyBreakGlass ? <Flame className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{grant.requesterName}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {grant.requesterRole} · Reason: {grant.reasonLabel}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                        grant.isEmergencyBreakGlass
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                      }`}
                    >
                      {grant.isEmergencyBreakGlass ? 'Break-Glass Emergency' : 'Active Authorization'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Grant Expires:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {grant.expiresAt ? new Date(grant.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Indefinite'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Times Accessed:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {grant.accessCount || 0} times
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Last Accessed:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {grant.lastAccessedAt ? new Date(grant.lastAccessedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Not yet retrieved'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleRevoke(grant)}
                    className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Revoke Access Immediately</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* AUDIT HISTORY TAB */
        historicalRequests.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            No historical access logs recorded yet.
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {historicalRequests.map((req) => (
                <div key={req.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{req.requesterName}</span>
                      <span className="text-slate-400 font-mono">({req.requesterRole})</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          req.status === 'revoked'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : req.status === 'denied'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Reason: <strong>{req.reasonLabel}</strong> · "{req.explanation}"
                    </div>
                  </div>

                  <div className="text-left sm:text-right font-mono text-[11px] text-slate-400">
                    <div>{new Date(req.createdAt).toLocaleDateString()}</div>
                    <div>{new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* APPROVAL & SCOPE CUSTOMIZATION MODAL */}
      {selectedRequest && customScopes && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Authorize Medical Information Access
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select which categories of your health pass to release to {selectedRequest.requesterName}.
                </p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Scope Customization */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Authorized Information Categories:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(
                  [
                    ['bloodGroup', 'Blood Group'],
                    ['allergies', 'Allergies'],
                    ['emergencyContacts', 'Emergency Contacts'],
                    ['emergencyNotes', 'Emergency Directives'],
                    ['vitals', 'Ambulatory Vitals'],
                    ['medications', 'Active Regimens'],
                    ['clinicalNotes', 'Consultation Summaries'],
                    ['labReports', 'Diagnostic Reports']
                  ] as [keyof QrAccessScope, string][]
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(customScopes[key])}
                      onChange={() =>
                        setCustomScopes((prev) => (prev ? { ...prev, [key]: !prev[key] } : null))
                      }
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Duration Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Grant Duration (Time-Limited Access):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  [15, '15 Minutes (Brief)'],
                  [60, '1 Hour (Standard)'],
                  [1440, '24 Hours (Full Day)']
                ].map(([minutes, label]) => (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() => setSelectedDuration(Number(minutes))}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      selectedDuration === minutes
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSelectedRequest(null)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={isProcessingDecision}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isProcessingDecision ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Confirm & Grant Access</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
