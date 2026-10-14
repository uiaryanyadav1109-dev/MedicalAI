import React, { useState, useEffect } from 'react';
import { RoutePath, TriageEscalationRecord, EscalationPolicy, MaskedClinicalNotification } from '../../../../types';
import { clinicalStore } from '../../../../services/clinicalStore';
import {
  Compass,
  AlertTriangle,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Users,
  Activity,
  ArrowRight,
  Flame,
  FileCheck,
  Stethoscope,
  ChevronRight,
  XCircle,
  RefreshCw,
  UserCheck,
  ShieldCheck,
  Bell,
  Eye,
  EyeOff,
  Settings,
  Lock,
  Check,
  X
} from 'lucide-react';

interface DoctorTriageEscalationsViewProps {
  onNavigate: (route: RoutePath) => void;
  onSelectPatient?: (patientId: string) => void;
}

export const DoctorTriageEscalationsView: React.FC<DoctorTriageEscalationsViewProps> = ({
  onNavigate,
  onSelectPatient
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'policies' | 'notifications'>('queue');
  const [escalations, setEscalations] = useState<TriageEscalationRecord[]>([]);
  const [policies, setPolicies] = useState<EscalationPolicy[]>([]);
  const [notifications, setNotifications] = useState<MaskedClinicalNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());

  // Selected Escalation for Detail Panel
  const [selectedEscalation, setSelectedEscalation] = useState<TriageEscalationRecord | null>(null);

  // Modals & Action States
  const [resolutionModalOpen, setResolutionModalOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [assigneeClinician, setAssigneeClinician] = useState('Dr. Sarah Chen, MD');
  const [assigneeTeam, setAssigneeTeam] = useState('Rapid Response Cardiology');
  const [editingPolicy, setEditingPolicy] = useState<EscalationPolicy | null>(null);

  // Masked Notifications Reveal Set (store IDs where doctor explicitly clicked reveal)
  const [revealedNotificationIds, setRevealedNotificationIds] = useState<Set<string>>(new Set());

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const safeLoadData = async (isBackground = false) => {
      if (!isBackground && isMounted) setLoading(true);
      try {
        const [escs, pols, notifs] = await Promise.all([
          clinicalStore.fetchTriageEscalations(),
          clinicalStore.fetchEscalationPolicies(),
          clinicalStore.fetchMaskedNotifications()
        ]);

        if (!isMounted) return;

        if (escs) {
          setEscalations(escs);
          if (!selectedEscalation && escs.length > 0) {
            setSelectedEscalation(escs[0]);
          } else if (selectedEscalation) {
            const updatedSelected = escs.find((e: TriageEscalationRecord) => e.id === selectedEscalation.id);
            if (updatedSelected) setSelectedEscalation(updatedSelected);
          }
        }

        if (pols) setPolicies(pols);
        if (notifs) setNotifications(notifs);
        setLastSynced(new Date());
      } catch (e) {
        console.warn('Failed to load triage escalations data', e);
      } finally {
        if (!isBackground && isMounted) setLoading(false);
      }
    };

    safeLoadData();

    // Live background polling every 15 seconds for urgent emergency updates
    const interval = setInterval(() => {
      safeLoadData(true);
    }, 15000);

    const unsub = clinicalStore.subscribe(() => {
      if (isMounted) {
        const current = clinicalStore.getTriageEscalations();
        if (current.length > 0) setEscalations(current);
      }
    });

    return () => {
      isMounted = false;
      clearInterval(interval);
      unsub();
    };
  }, []);

  // Action: Acknowledge Escalation
  const handleAcknowledge = async (escalationId: string) => {
    await clinicalStore.acknowledgeTriageEscalation(escalationId);
    setSuccessMessage('Emergency escalation acknowledged by attending clinician.');
    setTimeout(() => setSuccessMessage(null), 3500);
    await loadData(true);
  };

  // Action: Assign Clinician & Team
  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEscalation) return;

    await clinicalStore.assignTriageEscalation(
      selectedEscalation.id,
      assigneeClinician,
      assigneeTeam
    );

    setAssignmentModalOpen(false);
    setSuccessMessage(`Escalation assigned to ${assigneeClinician} (${assigneeTeam}).`);
    setTimeout(() => setSuccessMessage(null), 3500);
    await loadData(true);
  };

  // Action: Resolve Escalation
  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEscalation) return;

    await clinicalStore.respondToTriageEscalation(
      selectedEscalation.id,
      resolutionNotes || 'Rapid response team deployed. Patient verified stable by attending physician.',
      'Dr. Sarah Chen, MD'
    );

    setResolutionModalOpen(false);
    setResolutionNotes('');
    setSuccessMessage(`Escalation ${selectedEscalation.id} resolved and recorded to immutable audit log.`);
    setTimeout(() => setSuccessMessage(null), 4000);
    await loadData(false);
  };

  // Action: Save Policy
  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPolicy) return;

    await clinicalStore.saveEscalationPolicy(editingPolicy);
    setEditingPolicy(null);
    setSuccessMessage(`Clinical policy ${editingPolicy.name} updated with physician endorsement.`);
    setTimeout(() => setSuccessMessage(null), 3500);
    await loadData(false);
  };

  const toggleRevealNotification = (id: string) => {
    setRevealedNotificationIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const activeEscalations = escalations.filter((e) => e.status !== 'resolved');
  const resolvedEscalations = escalations.filter((e) => e.status === 'resolved');
  const overdueCount = escalations.filter((e) => e.isOverdue).length;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Live Sync Status */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-rose-700 dark:text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Acute Clinical Safety · Rapid Response Workspace</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            Triage Escalations &amp; Red-Flag Command
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Active cardiovascular, neurological, and respiratory emergency triggers routed for immediate clinician review.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Live Sync Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Sync Active</span>
            <span className="text-slate-500">·</span>
            <span>{lastSynced.toLocaleTimeString()}</span>
          </div>

          <button
            onClick={() => loadData(false)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh Escalations"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)}>
            <X className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      )}

      {/* 2. Top Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'queue'
                ? 'border-rose-600 text-rose-700 dark:text-rose-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Active Escalation Queue</span>
            {activeEscalations.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-mono font-bold animate-pulse">
                {activeEscalations.length}
              </span>
            )}
            {overdueCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-black font-mono font-bold">
                {overdueCount} OVERDUE
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('policies')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'policies'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Clinician-Reviewed Policies</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
              {policies.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'notifications'
                ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Masked Staff Alerts</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 font-mono">
              Zero PHI Preview
            </span>
          </button>
        </div>

        {/* Safe Fallback Disclaimer Pill */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-slate-400 pb-2">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Safety Rule: AI Predictions Never Rule Out Emergencies</span>
        </div>
      </div>

      {/* 3. TAB CONTENT */}
      {activeTab === 'queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Escalations List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Overdue Warning Callout */}
            {overdueCount > 0 && (
              <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold">
                    CRITICAL ALERT: {overdueCount} escalation(s) currently exceed institutional response time threshold!
                  </span>
                </div>
                <span className="font-mono text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded font-bold">
                  EXPEDITE
                </span>
              </div>
            )}

            {escalations.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  No Active Emergency Escalations
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  All incoming clinical presentations are currently within stable biological thresholds.
                </p>
              </div>
            ) : (
              escalations.map((esc) => {
                const isSelected = selectedEscalation?.id === esc.id;
                const isResolved = esc.status === 'resolved';

                return (
                  <div
                    key={esc.id}
                    onClick={() => setSelectedEscalation(esc)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-rose-500 bg-white dark:bg-slate-900 ring-2 ring-rose-500/20 shadow-md'
                        : isResolved
                        ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 opacity-75'
                        : esc.isOverdue
                        ? 'border-amber-500 bg-amber-950/20 ring-1 ring-amber-500/40'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-base">
                            {esc.patientName}
                          </span>
                          <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            MRN: {esc.mrn}
                          </span>
                          <span
                            className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                              isResolved
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : esc.isOverdue
                                ? 'bg-amber-500 text-black font-bold animate-pulse'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                            }`}
                          >
                            {isResolved ? 'Resolved' : esc.isOverdue ? 'Overdue SLA' : 'STAT Active'}
                          </span>
                        </div>

                        <div className="text-xs text-rose-700 dark:text-rose-300 font-semibold mt-1">
                          {esc.reason}
                        </div>
                      </div>

                      {/* Response Time SLA Counter */}
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono text-slate-400 block">ELAPSED TIME</span>
                        <span
                          className={`font-mono text-xs font-bold flex items-center justify-end gap-1 ${
                            esc.isOverdue ? 'text-amber-400 animate-pulse' : 'text-slate-300'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{esc.responseTimeMinutes ?? 2}m elapsed</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 block">
                          Policy SLA: &lt; {esc.overdueMinutesThreshold || 5}m
                        </span>
                      </div>
                    </div>

                    {/* Triggered Red Flags */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-[11px] font-mono text-slate-400 mr-1">Red Flags:</span>
                      {esc.triggeredFlags?.map((flag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1"
                        >
                          <Flame className="w-3 h-3 text-rose-400" />
                          <span>{flag}</span>
                        </span>
                      ))}
                    </div>

                    {/* Vitals Telemetry */}
                    {esc.vitalAlert && (
                      <div className="mt-2 text-xs font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-slate-300">
                        <span className="text-slate-500 mr-2">ACUTE TELEMETRY:</span>
                        <span className="text-amber-300 font-bold">{esc.vitalAlert}</span>
                      </div>
                    )}

                    {/* Status & Team Routing Footer */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-3">
                        <span>
                          Team: <strong className="text-slate-200">{esc.assignedTeam}</strong>
                        </span>
                        {esc.assignedClinician && (
                          <span>
                            Physician: <strong className="text-emerald-400">{esc.assignedClinician}</strong>
                          </span>
                        )}
                      </div>

                      {esc.acknowledgedAt && !isResolved && (
                        <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Acknowledged</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Col: Active Escalation Action Dossier */}
          <div className="space-y-4">
            {selectedEscalation ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5 sticky top-24">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-rose-600 dark:text-rose-400 animate-pulse" />
                    <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      Rapid Response Command
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                    LEVEL 1 CODE
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Patient:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {selectedEscalation.patientName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">MRN:</span>
                    <span className="font-mono text-slate-900 dark:text-slate-100">
                      {selectedEscalation.mrn}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Escalated:</span>
                    <span className="font-mono text-slate-900 dark:text-slate-100">
                      {new Date(selectedEscalation.escalatedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Team:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {selectedEscalation.assignedTeam}
                    </span>
                  </div>
                </div>

                {/* Response Actions */}
                <div className="space-y-2 pt-2">
                  {/* Action 1: Acknowledge */}
                  {!selectedEscalation.acknowledgedAt && selectedEscalation.status !== 'resolved' && (
                    <button
                      onClick={() => handleAcknowledge(selectedEscalation.id)}
                      className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Acknowledge Escalation (MD)</span>
                    </button>
                  )}

                  {/* Action 2: Assign Clinician & Team */}
                  <button
                    onClick={() => {
                      setAssigneeClinician(selectedEscalation.assignedClinician || 'Dr. Sarah Chen, MD');
                      setAssigneeTeam(selectedEscalation.assignedTeam || 'Rapid Response Cardiology');
                      setAssignmentModalOpen(true);
                    }}
                    className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>Reassign Clinician / Response Team</span>
                  </button>

                  {/* Action 3: Open Full Patient Chart */}
                  <button
                    onClick={() => {
                      if (onSelectPatient) onSelectPatient(selectedEscalation.patientId);
                      onNavigate('/doctor/patients');
                    }}
                    className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Stethoscope className="w-4 h-4 text-cyan-400" />
                    <span>Open Patient Clinical Dossier</span>
                  </button>

                  {/* Action 4: Resolve with Documentation */}
                  {selectedEscalation.status !== 'resolved' ? (
                    <button
                      onClick={() => {
                        setResolutionNotes('');
                        setResolutionModalOpen(true);
                      }}
                      className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Resolve &amp; Log Clinical Outcome</span>
                    </button>
                  ) : (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-xl text-xs text-emerald-300">
                      <div className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Escalation Resolved</span>
                      </div>
                      <p className="text-[11px] mt-1 text-emerald-200/90">
                        {selectedEscalation.resolutionNotes || 'Verified resolved by clinician.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Audit History Log */}
                {selectedEscalation.auditLog && selectedEscalation.auditLog.length > 0 && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-[11px] font-mono text-slate-400 font-bold block">
                      IMMUTABLE AUDIT TRAIL:
                    </span>
                    <div className="space-y-1.5 text-[10px] font-mono">
                      {selectedEscalation.auditLog.map((log, idx) => (
                        <div key={idx} className="bg-slate-950 p-2 rounded border border-slate-800 text-slate-300">
                          <div className="flex justify-between text-slate-500">
                            <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                            <span className="text-emerald-400">{log.action}</span>
                          </div>
                          <div className="mt-0.5 text-slate-400">{log.details}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                Select an escalation to inspect rapid response protocols.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Configurable Escalation Policies */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Institutional Triage Escalation Policies
              </h2>
              <p className="text-xs text-slate-500">
                Deterministic rules reviewed by qualified healthcare personnel. AI is not permitted to override these thresholds.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {policies.map((pol) => (
              <div
                key={pol.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-emerald-400">
                    {pol.tier}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    v{pol.version}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{pol.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{pol.description}</p>
                </div>

                <div className="space-y-1.5 text-xs font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Max SLA:</span>
                    <span className="font-bold text-amber-400">{pol.maxResponseMinutes} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Stale Threshold:</span>
                    <span className="text-slate-300">{pol.staleDataThresholdHours} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Team:</span>
                    <span className="text-slate-300 truncate max-w-[140px]">{pol.routingTarget}</span>
                  </div>
                </div>

                {/* Red Flags List */}
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">DETERMINISTIC RED FLAGS:</span>
                  <div className="flex flex-wrap gap-1">
                    {pol.redFlags.map((f, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/15 text-rose-300 border border-rose-500/30"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500">
                  Reviewed by: <strong className="text-slate-400">{pol.reviewedByClinician}</strong>
                  <br />
                  Endorsed: {new Date(pol.reviewedAt).toLocaleDateString()}
                </div>

                <button
                  onClick={() => setEditingPolicy(pol)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                >
                  Edit Policy Parameters (MD)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Masked Staff Notifications (Privacy-Preserving) */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white">PHI Minimization Active:</span>
              <span className="text-slate-400">
                Staff notification previews are stripped of patient names, MRNs, and sensitive conditions until authenticated clinician expansion.
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {notifications.map((notif) => {
              const isRevealed = revealedNotificationIds.has(notif.id);

              return (
                <div
                  key={notif.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-2.5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                          notif.urgency === 'critical'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        }`}
                      >
                        {notif.urgency}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(notif.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleRevealNotification(notif.id)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors"
                    >
                      {isRevealed ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                          <span>Mask PHI Preview</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Decrypt &amp; View Details</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Sanitized Preview */}
                  <div className="text-xs font-medium text-slate-800 dark:text-slate-200 font-mono">
                    {notif.previewText}
                  </div>

                  {/* Decrypted Full Details Panel */}
                  {isRevealed && (
                    <div className="mt-2 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs animate-fadeIn">
                      <div className="font-bold text-emerald-400 flex items-center gap-1.5 text-[11px] font-mono">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>SECURE CLINICAL ACCESS GRANTED:</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-slate-300">
                        <div>
                          Patient: <strong className="text-white">{notif.fullDetails.patientName}</strong>
                        </div>
                        <div>
                          MRN: <span className="font-mono text-white">{notif.fullDetails.mrn}</span>
                        </div>
                      </div>
                      <div className="text-slate-300">
                        Clinical Trigger: <span className="text-rose-300">{notif.fullDetails.reason}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. MODALS */}
      {/* A. Resolution Modal */}
      {resolutionModalOpen && selectedEscalation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <form
            onSubmit={handleResolve}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Resolve Triage Escalation</h3>
              </div>
              <button
                type="button"
                onClick={() => setResolutionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-2">
              <p>
                Resolving emergency escalation for <strong>{selectedEscalation.patientName}</strong> (MRN:{' '}
                {selectedEscalation.mrn}).
              </p>
              <label className="font-semibold text-slate-200 block pt-1">
                Document Intervention &amp; Outcome Notes <span className="text-rose-400">*</span>:
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Attending physician evaluated patient at ED Bed 4. EKG completed, troponin stat negative. Patient transferred to CCU under observation."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setResolutionModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs"
              >
                Sign &amp; Resolve Escalation
              </button>
            </div>
          </form>
        </div>
      )}

      {/* B. Assignment Modal */}
      {assignmentModalOpen && selectedEscalation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <form
            onSubmit={handleAssign}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Assign Emergency Response</h3>
              </div>
              <button
                type="button"
                onClick={() => setAssignmentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Attending Clinician:</label>
                <input
                  type="text"
                  value={assigneeClinician}
                  onChange={(e) => setAssigneeClinician(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Rapid Response Unit:</label>
                <select
                  value={assigneeTeam}
                  onChange={(e) => setAssigneeTeam(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                >
                  <option value="Rapid Response Cardiology">Rapid Response Cardiology</option>
                  <option value="Stroke Emergency Response Team">Stroke Emergency Response Team</option>
                  <option value="Respiratory Therapy STAT">Respiratory Therapy STAT</option>
                  <option value="ICU Attending Triage">ICU Attending Triage</option>
                  <option value="Acute ED Medical Service">Acute ED Medical Service</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setAssignmentModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
              >
                Confirm Assignment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* C. Policy Edit Modal */}
      {editingPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <form
            onSubmit={handleSavePolicy}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Edit Escalation Policy</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPolicy(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Policy Title:</label>
                <input
                  type="text"
                  value={editingPolicy.name}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Max Response Minutes (SLA):</label>
                  <input
                    type="number"
                    value={editingPolicy.maxResponseMinutes}
                    onChange={(e) =>
                      setEditingPolicy({ ...editingPolicy, maxResponseMinutes: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Stale Threshold (Hours):</label>
                  <input
                    type="number"
                    value={editingPolicy.staleDataThresholdHours}
                    onChange={(e) =>
                      setEditingPolicy({ ...editingPolicy, staleDataThresholdHours: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Routing Target:</label>
                <input
                  type="text"
                  value={editingPolicy.routingTarget}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, routingTarget: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingPolicy(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
              >
                Endorse &amp; Save Policy
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
