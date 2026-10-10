import React, { useState, useEffect } from 'react';
import {
  RoutePath,
  User,
  ClinicianRole,
  ClinicianWorkingStatus,
  CredentialDocumentType,
  CredentialVerificationStatus,
  ClinicianCredentialDocument,
  ClinicianPermission,
  ClinicianSession,
  ClinicianTeamMember,
  ClinicianCaseAssignment,
  ClinicianAccountAuditLog
} from '../../../../types';
import { useAuth } from '../../../../context/AuthContext';
import { clinicalStore } from '../../../../services/clinicalStore';
import {
  UserCheck,
  ShieldCheck,
  Award,
  Building,
  Key,
  CheckCircle2,
  Lock,
  Edit3,
  Save,
  RefreshCw,
  FileBadge,
  Sparkles,
  ExternalLink,
  Radio,
  FileText,
  Users,
  LogOut,
  Smartphone,
  Laptop,
  AlertTriangle,
  XCircle,
  Clock,
  Phone,
  BellRing,
  Check,
  X,
  ChevronRight,
  Info,
  ShieldAlert,
  Upload,
  UserPlus,
  ArrowRightLeft,
  Eye,
  EyeOff
} from 'lucide-react';

type TabKey = 'profile' | 'credentials' | 'team' | 'roles' | 'sessions' | 'audit';

export const DoctorProfileView: React.FC<{ onNavigate: (route: RoutePath) => void }> = ({
  onNavigate
}) => {
  const { user, logout } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabKey>('profile');

  // Active Clinician Context (Doctor Sarah Chen by default; allows switching to Admin/Nurse to test RBAC & security boundaries)
  const [activeClinicianId, setActiveClinicianId] = useState<string>('doc-1');
  const [activeRole, setActiveRole] = useState<ClinicianRole>('doctor');
  const [activeName, setActiveName] = useState<string>('Dr. Sarah Chen, MD');

  // Clinician Profile Data
  const [profile, setProfile] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<ClinicianPermission[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: 'Dr. Sarah Chen, MD',
    specialty: 'Internal Medicine & Clinical Triage',
    department: 'Acute Care & Internal Medicine',
    hospitalAffiliation: 'Metro Clinical Reference Center',
    officePhone: '+1 (555) 432-8901',
    pagerNumber: 'PAGER-8821',
    npi: '1942850192',
    licenseNumber: 'MD-748291'
  });

  // Working Status
  const [workingStatus, setWorkingStatus] = useState<ClinicianWorkingStatus>('on_duty');

  // Credentials
  const [credentials, setCredentials] = useState<ClinicianCredentialDocument[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    documentType: 'medical_license' as CredentialDocumentType,
    title: '',
    documentNumber: '',
    issuingAuthority: '',
    stateOrJurisdiction: 'California Medical Board',
    issueDate: '2023-01-15',
    expirationDate: '2027-01-15'
  });

  // Admin Review Modal
  const [reviewingDoc, setReviewingDoc] = useState<ClinicianCredentialDocument | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  // Team & Case Collaboration
  const [team, setTeam] = useState<ClinicianTeamMember[]>([]);
  const [cases, setCases] = useState<ClinicianCaseAssignment[]>([]);
  const [reassigningCase, setReassigningCase] = useState<ClinicianCaseAssignment | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState<string>('nurse-1');
  const [reassignRationale, setReassignRationale] = useState<string>('');

  // Sessions
  const [sessions, setSessions] = useState<ClinicianSession[]>([]);

  // Audit Trail
  const [auditLogs, setAuditLogs] = useState<ClinicianAccountAuditLog[]>([]);

  // UI State
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showSensitiveNumbers, setShowSensitiveNumbers] = useState(false);

  // Sync state helper
  const notifySuccess = (msg: string) => {
    setActionSuccess(msg);
    setActionError(null);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const notifyError = (msg: string) => {
    setActionError(msg);
    setActionSuccess(null);
    setTimeout(() => setActionError(null), 5000);
  };

  // Load all clinician data
  const loadAllClinicianData = async () => {
    setLoading(true);
    try {
      const actorOverride = { role: activeRole, id: activeClinicianId, name: activeName };

      const [profRes, credRes, teamRes, caseRes, sessRes, logRes] = await Promise.all([
        clinicalStore.getClinicianProfile(activeClinicianId, actorOverride),
        clinicalStore.getClinicianCredentials(activeClinicianId, actorOverride),
        clinicalStore.getClinicianTeam(activeClinicianId, actorOverride),
        clinicalStore.getClinicianCaseAssignments(activeClinicianId, actorOverride),
        clinicalStore.getClinicianSessions(activeClinicianId, actorOverride),
        clinicalStore.getClinicianAuditLogs(activeClinicianId, 50, actorOverride)
      ]);

      if (profRes.success && profRes.profile) {
        setProfile(profRes.profile);
        setPermissions(profRes.permissions || []);
        setWorkingStatus(profRes.profile.workingStatus || 'on_duty');
        setProfileForm({
          name: profRes.profile.name || '',
          specialty: profRes.profile.specialty || '',
          department: profRes.profile.department || 'Acute Care & Internal Medicine',
          hospitalAffiliation: profRes.profile.hospitalAffiliation || '',
          officePhone: profRes.profile.officePhone || '+1 (555) 432-8901',
          pagerNumber: profRes.profile.pagerNumber || 'PAGER-8821',
          npi: profRes.profile.npi || '',
          licenseNumber: profRes.profile.licenseNumber || ''
        });
      }

      if (credRes.success && credRes.credentials) {
        setCredentials(credRes.credentials);
      }

      if (teamRes.success && teamRes.team) {
        setTeam(teamRes.team);
      }

      if (caseRes.success && caseRes.assignments) {
        setCases(caseRes.assignments);
      }

      if (sessRes.success && sessRes.sessions) {
        setSessions(sessRes.sessions);
      }

      if (logRes.success && logRes.logs) {
        setAuditLogs(logRes.logs);
      }
    } catch (err: any) {
      console.warn('Failed to load clinician portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllClinicianData();
  }, [activeClinicianId, activeRole]);

  // Working Status Change
  const handleStatusChange = async (newStatus: ClinicianWorkingStatus) => {
    try {
      const res = await clinicalStore.updateClinicianWorkingStatus(
        newStatus,
        activeClinicianId,
        { role: activeRole, id: activeClinicianId }
      );
      if (res.success) {
        setWorkingStatus(newStatus);
        notifySuccess(`Working status updated to ${newStatus.replace('_', ' ').toUpperCase()}. Clinical dispatch synced.`);
        loadAllClinicianData();
      } else {
        notifyError(res.error || 'Failed to update working status.');
      }
    } catch (err: any) {
      notifyError(err.message || 'Error updating status');
    }
  };

  // Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await clinicalStore.updateClinicianProfile(
        profileForm,
        activeClinicianId,
        { role: activeRole, id: activeClinicianId }
      );
      if (res.success) {
        setIsEditingProfile(false);
        notifySuccess('Clinician profile & professional contact details successfully updated.');
        loadAllClinicianData();
      } else {
        notifyError(res.error || 'Failed to update profile.');
      }
    } catch (err: any) {
      notifyError(err.message || 'Error updating profile');
    }
  };

  // Upload Credential Document (Strictly marked 'pending')
  const handleUploadCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.title || !uploadForm.documentNumber) {
      notifyError('Please specify document title and license/registration number.');
      return;
    }

    try {
      const res = await clinicalStore.uploadClinicianCredential(
        {
          ...uploadForm,
          documentUrl: `/vault/clinicians/${activeClinicianId}/${Date.now()}_credential.pdf`
        },
        activeClinicianId,
        { role: activeRole, id: activeClinicianId }
      );

      if (res.success) {
        setShowUploadModal(false);
        setUploadForm({
          documentType: 'medical_license',
          title: '',
          documentNumber: '',
          issuingAuthority: '',
          stateOrJurisdiction: 'California Medical Board',
          issueDate: '2023-01-15',
          expirationDate: '2027-01-15'
        });
        notifySuccess(res.message || 'Credential document securely uploaded and submitted for independent verification.');
        loadAllClinicianData();
      } else {
        notifyError(res.error || 'Failed to upload credential.');
      }
    } catch (err: any) {
      notifyError(err.message || 'Upload failed');
    }
  };

  // Authoritative Verification Handshake
  const handleVerifyAuthoritative = async (credentialId: string) => {
    try {
      const res = await clinicalStore.verifyCredentialAuthoritative(credentialId, {
        role: activeRole,
        id: activeClinicianId
      });
      if (res.success) {
        notifySuccess(`Authoritative Registry Check Verified! Registry Record: ${res.registryRecord?.registrySource || 'NPPES/Medical Board'} · Match Confirmed.`);
        loadAllClinicianData();
      } else {
        notifyError(res.error || 'Authoritative verification failed or registry mismatch.');
      }
    } catch (err: any) {
      notifyError(err.message || 'Verification connection failed');
    }
  };

  // Admin Review (Approves or rejects credential; tests anti-self-approval rule)
  const handleAdminReview = async (credentialId: string, status: CredentialVerificationStatus) => {
    try {
      const res = await clinicalStore.adminReviewCredential(
        credentialId,
        { status, note: reviewNote || `Administrative action by ${activeName}` },
        { role: activeRole, id: activeClinicianId }
      );
      if (res.success) {
        setReviewingDoc(null);
        setReviewNote('');
        notifySuccess(`Credential document ${status.toUpperCase()} by Administrator.`);
        loadAllClinicianData();
      } else {
        notifyError(res.error || 'Administrative review failed.');
      }
    } catch (err: any) {
      notifyError(err.message || 'Admin review failed');
    }
  };

  // Reassign Case
  const handleReassignCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassigningCase) return;
    if (!reassignRationale.trim()) {
      notifyError('A clinical handover rationale is required to safely reassign active patient care.');
      return;
    }

    const targetMember = team.find((t) => t.id === reassignTargetId);

    try {
      const res = await clinicalStore.assignClinicianCase(
        {
          ...reassigningCase,
          assignedToClinicianId: reassignTargetId,
          assignedToName: targetMember?.name || 'Assigned Clinician',
          assignedToRole: targetMember?.role || 'doctor',
          reassignmentRationale: reassignRationale
        },
        { role: activeRole, id: activeClinicianId }
      );

      if (res.success) {
        setReassigningCase(null);
        setReassignRationale('');
        notifySuccess(`Case for ${reassigningCase.patientName} reassigned to ${targetMember?.name}. Audit event logged.`);
        loadAllClinicianData();
      } else {
        notifyError(res.error || 'Failed to reassign case.');
      }
    } catch (err: any) {
      notifyError(err.message || 'Reassignment error');
    }
  };

  // Revoke Session
  const handleRevokeSession = async (sessionId: string) => {
    try {
      const res = await clinicalStore.revokeClinicianSession(sessionId, activeClinicianId, {
        role: activeRole,
        id: activeClinicianId
      });
      if (res.success) {
        notifySuccess('Remote session terminated immediately. Token invalidated.');
        loadAllClinicianData();
      } else {
        notifyError(res.error || 'Failed to revoke session.');
      }
    } catch (err: any) {
      notifyError(err.message || 'Revocation error');
    }
  };

  // Revoke Other Sessions
  const handleRevokeAllOtherSessions = async () => {
    try {
      const res = await clinicalStore.revokeAllOtherClinicianSessions('sess-1', activeClinicianId, {
        role: activeRole,
        id: activeClinicianId
      });
      if (res.success) {
        notifySuccess(`Remote sign-out complete. Terminated ${res.revokedCount ?? 0} active remote sessions.`);
        loadAllClinicianData();
      } else {
        notifyError(res.error || 'Failed to terminate other sessions.');
      }
    } catch (err: any) {
      notifyError(err.message || 'Error revoking sessions');
    }
  };

  // Role Elevation Security Test
  const handleAttemptRoleChange = async (targetId: string, newRole: ClinicianRole) => {
    try {
      const res = await clinicalStore.updateClinicianRole(targetId, newRole, {
        role: activeRole,
        id: activeClinicianId
      });
      if (res.success) {
        notifySuccess(`Clinician role successfully updated to ${newRole.toUpperCase()}. Least-privilege applied.`);
        loadAllClinicianData();
      } else {
        notifyError(`Security Boundary Enforced: ${res.error}`);
        loadAllClinicianData();
      }
    } catch (err: any) {
      notifyError(`Security Boundary Enforced: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header & Context Switcher Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-emerald-700 dark:text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Clinical Identity & Practice Credentialing · Zero-Trust RBAC</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Physician Credentials & Clinician Account Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Authoritative licensure verification, multi-disciplinary team collaboration, remote session control, and immutable audit logs.
          </p>
        </div>

        {/* Security Simulation Actor Bar */}
        <div className="bg-slate-50 dark:bg-slate-950/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="text-xs">
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Current Security Context</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{activeName}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                {activeRole}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={`${activeClinicianId}:${activeRole}:${activeName}`}
              onChange={(e) => {
                const [id, role, name] = e.target.value.split(':');
                setActiveClinicianId(id);
                setActiveRole(role as ClinicianRole);
                setActiveName(name);
              }}
              className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 font-medium"
              aria-label="Switch Clinician Security Context"
            >
              <option value="doc-1:doctor:Dr. Sarah Chen, MD">Test as Dr. Sarah Chen (Doctor)</option>
              <option value="nurse-1:nurse:Emily Patel, RN">Test as Emily Patel (Nurse)</option>
              <option value="lab-1:lab_reviewer:David Kim, MLS">Test as David Kim (Lab Reviewer)</option>
              <option value="admin-1:admin:Marcus Vance, MHA">Test as Marcus Vance (Administrator)</option>
            </select>

            <button
              onClick={loadAllClinicianData}
              disabled={loading}
              title="Refresh Portal State"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 dark:text-emerald-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-900 dark:text-rose-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="font-medium">{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-rose-700 dark:text-rose-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors shrink-0 ${
            activeTab === 'profile'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Profile & Practice</span>
        </button>

        <button
          onClick={() => setActiveTab('credentials')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors shrink-0 ${
            activeTab === 'credentials'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Credentials & Licensure</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-800 dark:text-emerald-200">
            {credentials.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors shrink-0 ${
            activeTab === 'team'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Care Team & Cases</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300">
            {cases.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors shrink-0 ${
            activeTab === 'roles'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Roles & RBAC Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors shrink-0 ${
            activeTab === 'sessions'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>Sessions & Access Control</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300">
            {sessions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors shrink-0 ${
            activeTab === 'audit'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Security Audit Trail</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PROFILE & WORKING STATUS */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Shift & Working Status Switcher */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Clinical Shift & Triage Dispatch Status
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Controls whether automated triage escalations and high-acuity consult requests are routed to you.
                </p>
              </div>

              {/* Working Status Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    { key: 'on_duty', label: 'On-Duty', color: 'bg-emerald-600 text-white' },
                    { key: 'on_call', label: 'On-Call', color: 'bg-amber-600 text-white' },
                    { key: 'in_surgery', label: 'In-Surgery', color: 'bg-purple-600 text-white' },
                    { key: 'off_duty', label: 'Off-Duty', color: 'bg-slate-600 text-white' }
                  ] as const
                ).map((st) => (
                  <button
                    key={st.key}
                    onClick={() => handleStatusChange(st.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      workingStatus === st.key
                        ? `${st.color} shadow-xs ring-2 ring-offset-2 ring-emerald-500/40 dark:ring-offset-slate-900`
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">
                Current dispatch queue state:
              </span>
              <span className="font-mono font-semibold uppercase text-emerald-700 dark:text-emerald-400">
                ● Active ({workingStatus.replace('_', ' ')})
              </span>
            </div>
          </div>

          {/* Profile Card / Form */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold text-base flex items-center justify-center shrink-0">
                  {profileForm.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {profileForm.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {profileForm.specialty} · {profileForm.department}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingProfile ? 'Cancel' : 'Edit Details'}</span>
              </button>
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Clinician Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Specialty</label>
                    <input
                      type="text"
                      value={profileForm.specialty}
                      onChange={(e) => setProfileForm({ ...profileForm, specialty: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Clinical Department</label>
                    <input
                      type="text"
                      value={profileForm.department}
                      onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Hospital / Facility Affiliation</label>
                    <input
                      type="text"
                      value={profileForm.hospitalAffiliation}
                      onChange={(e) => setProfileForm({ ...profileForm, hospitalAffiliation: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Office Phone</label>
                    <input
                      type="text"
                      value={profileForm.officePhone}
                      onChange={(e) => setProfileForm({ ...profileForm, officePhone: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Hospital Pager / Direct Ext</label>
                    <input
                      type="text"
                      value={profileForm.pagerNumber}
                      onChange={(e) => setProfileForm({ ...profileForm, pagerNumber: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">DEPARTMENT</span>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{profileForm.department}</div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">HOSPITAL AFFILIATION</span>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{profileForm.hospitalAffiliation}</div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">OFFICE PHONE</span>
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{profileForm.officePhone}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">HOSPITAL PAGER</span>
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <BellRing className="w-3.5 h-3.5 text-slate-500" />
                    <span>{profileForm.pagerNumber}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">NPI (NATIONAL PROVIDER ID)</span>
                  <div className="font-mono font-bold text-slate-900 dark:text-slate-100">{profileForm.npi}</div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">PRIMARY MEDICAL LICENSE</span>
                  <div className="font-mono font-bold text-slate-900 dark:text-slate-100">{profileForm.licenseNumber}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CREDENTIALS & LICENSURE DOCUMENTS */}
      {/* ========================================================================= */}
      {activeTab === 'credentials' && (
        <div className="space-y-6">
          {/* Top Bar with Upload Button & Info */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Authoritative Credentials & Licensure Repository
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Multi-factor verified medical licensure, DEA registrations, and board certifications with state registry cross-checks.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSensitiveNumbers(!showSensitiveNumbers)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300"
              >
                {showSensitiveNumbers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showSensitiveNumbers ? 'Mask Numbers' : 'Reveal Numbers'}</span>
              </button>

              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Credential Document</span>
              </button>
            </div>
          </div>

          {/* Security Notice: Never auto-verify */}
          <div className="p-4 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Security Invariant & Clinical Trust Policy:</span>
              <p className="text-[11px] leading-relaxed">
                Uploading a credential document does <strong>not</strong> grant verified status. All documents start in <span className="font-mono font-semibold">pending</span> status until validated through an authoritative state medical board registry handshake or reviewed by an authorized hospital credentialing administrator. Clinicians cannot approve their own credentials.
              </p>
            </div>
          </div>

          {/* Credential Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {credentials.map((doc) => {
              const isVerified = doc.verificationStatus === 'verified';
              const isPending = doc.verificationStatus === 'pending';
              const isRejected = doc.verificationStatus === 'rejected';
              const isDemo = doc.verificationStatus === 'unverified_demo';

              return (
                <div
                  key={doc.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                          {doc.documentType.replace('_', ' ')}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {doc.title}
                        </h3>
                      </div>

                      {/* Verification Status Badge */}
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold uppercase flex items-center gap-1 ${
                          isVerified
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : isPending
                            ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            : isRejected
                            ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {isVerified && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {isPending && <Clock className="w-3 h-3 text-amber-600" />}
                        {isRejected && <XCircle className="w-3 h-3 text-rose-600" />}
                        {isDemo && <AlertTriangle className="w-3 h-3 text-slate-500" />}
                        <span>
                          {isDemo ? '[DEMO / UNVERIFIED]' : doc.verificationStatus}
                        </span>
                      </span>
                    </div>

                    {/* Document Details Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-2 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block uppercase">Document / License ID</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {showSensitiveNumbers ? doc.documentNumber : doc.documentNumberMasked || '••••••••'}
                        </span>
                      </div>

                      <div className="p-2 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block uppercase">Issuing Authority</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                          {doc.issuingAuthority}
                        </span>
                      </div>

                      <div className="p-2 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block uppercase">State / Jurisdiction</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {doc.stateOrJurisdiction || 'National'}
                        </span>
                      </div>

                      <div className="p-2 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block uppercase">Expiration Date</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">
                          {doc.expirationDate || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Authoritative Registry Handshake Meta */}
                    {doc.verificationSource && (
                      <div className="p-2.5 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-lg border border-emerald-100 dark:border-emerald-900/60 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>
                            Source: <strong>{doc.verificationSource}</strong> ({doc.verificationDate})
                          </span>
                        </div>
                        {doc.isAuthoritativeVerification && (
                          <span className="font-mono text-[10px] uppercase text-emerald-700 dark:text-emerald-400 font-bold">
                            API Verified
                          </span>
                        )}
                      </div>
                    )}

                    {doc.reviewNote && (
                      <p className="text-[11px] text-slate-500 italic">
                        Review Note: "{doc.reviewNote}"
                      </p>
                    )}
                  </div>

                  {/* Actions for this document */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    {/* Authoritative Verification Button */}
                    {!isVerified && (
                      <button
                        onClick={() => handleVerifyAuthoritative(doc.id)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Query State Registry</span>
                      </button>
                    )}

                    {/* Admin Review Action (Tests Least-Privilege & Anti-Self-Approval) */}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        onClick={() => setReviewingDoc(doc)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                      >
                        Admin Review
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CARE TEAM & CASE COLLABORATION */}
      {/* ========================================================================= */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          {/* Active Care Team Roster */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Multi-Disciplinary Clinical Care Team
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Authorized practitioners collaborating on the Acute Triage & Internal Medicine service.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {team.map((member) => (
                <div
                  key={member.id}
                  className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center">
                      {member.role.slice(0, 2).toUpperCase()}
                    </div>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        (member.status || member.workingStatus) === 'on_duty'
                          ? 'bg-emerald-500'
                          : (member.status || member.workingStatus) === 'on_call'
                          ? 'bg-amber-500'
                          : (member.status || member.workingStatus) === 'in_surgery'
                          ? 'bg-purple-500'
                          : 'bg-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {member.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{member.specialty}</p>
                    <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase font-semibold">
                      {member.role} · {String(member.status || member.workingStatus || 'off_duty').replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Case Assignments */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Active Clinical Case Assignments
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track assigned cases, handover status, and reassign with documented clinical rationale.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 font-mono text-[10px] uppercase text-slate-500">
                  <tr>
                    <th className="p-3">Patient MRN</th>
                    <th className="p-3">Chief Concern</th>
                    <th className="p-3">Triage Acuity</th>
                    <th className="p-3">Assigned Clinician</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {cases.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{c.patientName}</span>
                        <span className="block font-mono text-[10px] text-slate-400">{c.mrn}</span>
                      </td>
                      <td className="p-3">{c.chiefConcern}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            c.triageTier === 'emergency'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : c.triageTier === 'urgent'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {c.triageTier}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{c.assignedToName}</span>
                        <span className="block text-[10px] text-slate-400 uppercase font-mono">{c.assignedToRole}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setReassigningCase(c)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold text-xs inline-flex items-center gap-1"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>Reassign</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ROLES & RBAC MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          {/* RBAC Header & Least-Privilege Principles */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Role-Based Access Control (RBAC) & Least-Privilege Matrix
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Every sensitive clinical operation is strictly authorized at the server API layer. Elevated privileges require Administrator authority.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              {(
                [
                  {
                    role: 'doctor',
                    title: 'Attending Physician',
                    desc: 'Primary clinical responsibility. Authorized to evaluate vitals, sign orders, approve AI drafts, and manage case handoffs.',
                    perms: ['clinical:assess', 'prescribe:order', 'copilot:approve', 'case:assign']
                  },
                  {
                    role: 'nurse',
                    title: 'Authorized Triage Nurse',
                    desc: 'Frontline patient intake. Authorized to record vitals, execute standing triage orders, and escalate emergency red flags.',
                    perms: ['vitals:record', 'triage:escalate', 'handoff:create', 'patient:message']
                  },
                  {
                    role: 'lab_reviewer',
                    title: 'Diagnostic Lab Reviewer',
                    desc: 'Laboratory diagnostics specialist. Authorized to ingest analyte reports, review pan-assay deltas, and flag critical values.',
                    perms: ['reports:ingest', 'reports:review', 'analyte:interpret']
                  },
                  {
                    role: 'admin',
                    title: 'Clinical Administrator',
                    desc: 'Hospital credentialing authority. Authorized to approve clinician licenses, grant permissions, and inspect security audit logs.',
                    perms: ['credentials:approve', 'roles:modify', 'sessions:terminate', 'audit:inspect']
                  }
                ] as const
              ).map((card) => (
                <div
                  key={card.role}
                  className={`p-4 rounded-xl border space-y-3 ${
                    activeRole === card.role
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{card.title}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {card.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {card.desc}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {card.perms.map((p) => (
                      <span
                        key={p}
                        className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Role Security Test */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Administrative Role Granting & Privilege Elevation Test
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Attempting to grant roles without an active Administrator session is strictly denied by the server and logged as a security event.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Target Clinician: Emily Patel (nurse-1)
                </span>
                <span className="block text-[11px] text-slate-500">
                  Current Role: nurse · Attempt elevation to 'admin' using active security context ({activeRole})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAttemptRoleChange('nurse-1', 'admin')}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-semibold flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>Test Elevate to Admin</span>
                </button>

                <button
                  onClick={() => handleAttemptRoleChange('nurse-1', 'doctor')}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Assign Doctor Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SESSIONS & ACCESS CONTROL */}
      {/* ========================================================================= */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Active Clinician Account Sessions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                View connected workstations, clinical mobile tablets, and remotely revoke unauthorized device access.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRevokeAllOtherSessions}
                className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Revoke All Other Devices</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  onNavigate('/login');
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Terminate Shift & Sign Out</span>
              </button>
            </div>
          </div>

          {/* Session Cards */}
          <div className="space-y-3">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300">
                    {sess.deviceType === 'Mobile Device' || (sess.deviceType as string) === 'mobile' ? (
                      <Smartphone className="w-5 h-5" />
                    ) : (
                      <Laptop className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {sess.deviceName || `${sess.deviceType} (${sess.browser})`}
                      </h4>
                      {sess.isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                          Current Device
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {sess.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span>IP: <span className="font-mono">{sess.ipAddress}</span></span>
                      <span>Location: {sess.location}</span>
                      <span>Last Active: {new Date(sess.lastActiveAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                {!sess.isCurrent && (
                  <button
                    onClick={() => handleRevokeSession(sess.id)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 hover:text-rose-600 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    Revoke Access
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: SECURITY AUDIT TRAIL */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Immutable Account & Credential Security Audit Trail
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete chronological ledger of permissions, credential reviews, role alterations, and access revocations.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 font-mono text-[10px] uppercase text-slate-500">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Actor</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Details</th>
                  <th className="p-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                {auditLogs.map((log) => {
                  const isDenied = log.action.includes('DENIED');
                  const isVerified = log.action.includes('VERIFIED');
                  const isRevoked = log.action.includes('REVOKED');

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3 text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="p-3 font-semibold">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                            isDenied
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : isVerified
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : isRevoked
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 font-sans font-medium text-slate-900 dark:text-slate-100">
                        {log.actorName}
                      </td>
                      <td className="p-3 text-slate-400 uppercase">{log.actorRole}</td>
                      <td className="p-3 font-sans text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {log.details}
                      </td>
                      <td className="p-3 text-slate-400">{log.ipAddress || '10.240.12.8'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: UPLOAD CREDENTIAL DOCUMENT */}
      {/* ========================================================================= */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileBadge className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Upload Clinician Credential Document
                </h3>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadCredential} className="space-y-3.5">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Document Type</label>
                <select
                  value={uploadForm.documentType}
                  onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value as CredentialDocumentType })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                >
                  <option value="medical_license">Medical License (State Board)</option>
                  <option value="dea_registration">DEA Registration (Schedule II-V)</option>
                  <option value="board_certification">Board Specialty Certification</option>
                  <option value="hospital_privileges">Hospital Clinical Privileges</option>
                  <option value="malpractice_insurance">Medical Professional Liability</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Credential Title / Description</label>
                <input
                  type="text"
                  placeholder="e.g. State Medical Board License Certificate"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">License / Reg Number</label>
                  <input
                    type="text"
                    placeholder="e.g. C-194028"
                    value={uploadForm.documentNumber}
                    onChange={(e) => setUploadForm({ ...uploadForm, documentNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Issuing Authority</label>
                  <input
                    type="text"
                    placeholder="e.g. Medical Board of California"
                    value={uploadForm.issuingAuthority}
                    onChange={(e) => setUploadForm({ ...uploadForm, issuingAuthority: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Issue Date</label>
                  <input
                    type="date"
                    value={uploadForm.issueDate}
                    onChange={(e) => setUploadForm({ ...uploadForm, issueDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Expiration Date</label>
                  <input
                    type="date"
                    value={uploadForm.expirationDate}
                    onChange={(e) => setUploadForm({ ...uploadForm, expirationDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                <span className="text-[11px] text-slate-500">PDF / Secure Document Vault File Attached (Simulated)</span>
              </div>

              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200">
                Uploaded document will strictly receive status <strong>PENDING</strong> until authoritative verification is completed.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Submit Credential</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADMIN CREDENTIAL REVIEW */}
      {/* ========================================================================= */}
      {reviewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Hospital Admin Credential Review
                </h3>
              </div>
              <button onClick={() => setReviewingDoc(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">DOCUMENT UNDER REVIEW</span>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{reviewingDoc.title}</div>
              <div className="text-[11px] text-slate-500">
                Clinician ID: {reviewingDoc.clinicianId} · Authority: {reviewingDoc.issuingAuthority}
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                License/Doc: {reviewingDoc.documentNumberMasked}
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Administrative Note</label>
              <textarea
                rows={3}
                placeholder="Enter verification notes or rationale..."
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>

            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg border border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-900 dark:text-indigo-200">
              Note: Active Role is <strong>{activeRole}</strong>. If reviewing your own credential or if non-admin, the action will be blocked by the server anti-conflict security guard.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleAdminReview(reviewingDoc.id, 'rejected')}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 rounded-lg font-semibold"
              >
                Reject Credential
              </button>
              <button
                type="button"
                onClick={() => handleAdminReview(reviewingDoc.id, 'verified')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve & Verify</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: REASSIGN CLINICAL CASE */}
      {/* ========================================================================= */}
      {reassigningCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Reassign Patient Care Handover
                </h3>
              </div>
              <button onClick={() => setReassigningCase(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">PATIENT DOSSIER</span>
              <div className="font-bold text-slate-900 dark:text-slate-100">
                {reassigningCase.patientName} ({reassigningCase.mrn})
              </div>
              <div className="text-[11px] text-slate-500">Concern: {reassigningCase.chiefConcern}</div>
            </div>

            <form onSubmit={handleReassignCase} className="space-y-3.5">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Assign To Care Team Member</label>
                <select
                  value={reassignTargetId}
                  onChange={(e) => setReassignTargetId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                >
                  {team.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.role} · {t.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Clinical Handover Rationale (Required)
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail clinical rationale, pending lab status, or shift handover reason..."
                  value={reassignRationale}
                  onChange={(e) => setReassignRationale(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setReassigningCase(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Execute Handover</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
