import React, { useState, useEffect } from 'react';
import {
  RoutePath,
  DoctorHandoffRecord,
  ClinicalTask,
  ClinicalReferralRecord,
  ClinicalNotificationRecord,
  AppointmentRecord,
  MedicalReportRecord,
  HandoffState,
  PatientRecord
} from '../../../../types';
import { clinicalStore } from '../../../../services/clinicalStore';
import { useAuth } from '../../../../context/AuthContext';
import {
  FileText,
  CheckCircle2,
  Clock,
  User,
  HeartPulse,
  Pill,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  Send,
  ListTodo,
  AlertTriangle,
  ArrowRight,
  Flame,
  Check,
  RefreshCw,
  Search,
  UserCheck,
  XCircle,
  Plus,
  Calendar,
  ArrowUpRight,
  Share2,
  AlertCircle,
  FileCheck,
  ExternalLink,
  Edit3,
  Trash2,
  Eye,
  ShieldAlert,
  Sparkles,
  Building,
  Activity,
  History,
  X
} from 'lucide-react';

export const DoctorHandoffsView: React.FC<{ onNavigate: (route: RoutePath) => void }> = ({
  onNavigate
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'handoffs' | 'tasks' | 'appointments' | 'referrals' | 'notifications'>('handoffs');

  // Core Data
  const [handoffs, setHandoffs] = useState<DoctorHandoffRecord[]>(clinicalStore.getHandoffs());
  const [tasks, setTasks] = useState<ClinicalTask[]>(clinicalStore.getClinicalTasks());
  const [reports, setReports] = useState<MedicalReportRecord[]>(clinicalStore.getReports());
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(clinicalStore.getAppointments());
  const [referrals, setReferrals] = useState<ClinicalReferralRecord[]>(clinicalStore.getReferrals());
  const [notifications, setNotifications] = useState<ClinicalNotificationRecord[]>(clinicalStore.getClinicalNotifications());
  const [patients, setPatients] = useState<PatientRecord[]>(clinicalStore.getPatients());

  // Filter States
  const [selectedPatientId, setSelectedPatientId] = useState<string>('all');
  const [handoffStateFilter, setHandoffStateFilter] = useState<string>('all');
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Loading & Feedback
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [successNote, setSuccessNote] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isAiDraftModalOpen, setIsAiDraftModalOpen] = useState(false);
  const [aiDraftPatientId, setAiDraftPatientId] = useState<string>('pat-1');
  const [generatedDraft, setGeneratedDraft] = useState<DoctorHandoffRecord | null>(null);
  const [isGeneratingAiDraft, setIsGeneratingAiDraft] = useState(false);

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [targetHandoffToApprove, setTargetHandoffToApprove] = useState<DoctorHandoffRecord | null>(null);
  const [approverNpi, setApproverNpi] = useState('1942850192');
  const [approverNotes, setApproverNotes] = useState('');

  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [targetHandoffToReassign, setTargetHandoffToReassign] = useState<DoctorHandoffRecord | null>(null);
  const [newClinicianAssignee, setNewClinicianAssignee] = useState('Dr. Sarah Chen, MD');
  const [reassignReason, setReassignReason] = useState('');

  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [targetHandoffToEscalate, setTargetHandoffToEscalate] = useState<DoctorHandoffRecord | null>(null);
  const [escalateReason, setEscalateReason] = useState('');

  const [isNewReferralModalOpen, setIsNewReferralModalOpen] = useState(false);
  const [newReferralPatientId, setNewReferralPatientId] = useState('pat-1');
  const [newReferralDestination, setNewReferralDestination] = useState('Metro Heart & Vascular Institute');
  const [newReferralSpecialty, setNewReferralSpecialty] = useState('Cardiology');
  const [newReferralUrgency, setNewReferralUrgency] = useState<'routine' | 'urgent' | 'emergency'>('routine');
  const [newReferralReason, setNewReferralReason] = useState('');
  const [newReferralNotes, setNewReferralNotes] = useState('');

  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
  const [newAptPatientId, setNewAptPatientId] = useState('pat-1');
  const [newAptProviderName, setNewAptProviderName] = useState('Dr. Sarah Chen, MD');
  const [newAptDate, setNewAptDate] = useState('2026-04-20');
  const [newAptTime, setNewAptTime] = useState('10:00 AM');
  const [newAptType, setNewAptType] = useState<'in_person' | 'telehealth'>('in_person');
  const [newAptReason, setNewAptReason] = useState('Follow-up care transition evaluation');

  // Appointment Lifecycle Action States
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState<string>('all');
  const [appointmentDateFilter, setAppointmentDateFilter] = useState<string>('');
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [targetAptToReschedule, setTargetAptToReschedule] = useState<AppointmentRecord | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('2026-04-25');
  const [rescheduleTime, setRescheduleTime] = useState('11:00 AM');
  const [rescheduleReason, setRescheduleReason] = useState('Clinician clinical schedule adjustment');
  const [rescheduleSlotConflict, setRescheduleSlotConflict] = useState<string | null>(null);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [targetAptToCancel, setTargetAptToCancel] = useState<AppointmentRecord | null>(null);
  const [cancelReasonText, setCancelReasonText] = useState('Patient request / clinical emergency');

  const [viewAuditHandoff, setViewAuditHandoff] = useState<DoctorHandoffRecord | null>(null);

  // Load and subscribe
  const refreshAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        clinicalStore.fetchHandoffs(),
        clinicalStore.fetchClinicalTasks(),
        clinicalStore.fetchReports(),
        clinicalStore.fetchAppointments(),
        clinicalStore.fetchReferrals(),
        clinicalStore.fetchClinicalNotifications()
      ]);
    } catch (e) {
      console.warn('Refresh error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
    const unsub = clinicalStore.subscribe(() => {
      setHandoffs(clinicalStore.getHandoffs());
      setTasks(clinicalStore.getClinicalTasks());
      setReports(clinicalStore.getReports());
      setAppointments(clinicalStore.getAppointments());
      setReferrals(clinicalStore.getReferrals());
      setNotifications(clinicalStore.getClinicalNotifications());
      setPatients(clinicalStore.getPatients());
    });
    return () => unsub();
  }, []);

  const triggerFeedback = (msg: string, isErr = false) => {
    if (isErr) {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 4500);
    } else {
      setSuccessNote(msg);
      setTimeout(() => setSuccessNote(null), 3500);
    }
  };

  // AI-Assisted Draft Generation Handler
  const handleGenerateAiDraft = async () => {
    setIsGeneratingAiDraft(true);
    setErrorMessage(null);
    try {
      const result = await clinicalStore.generateAiHandoffDraft(
        aiDraftPatientId,
        'Dr. Sarah Chen, MD',
        '1942850192'
      );
      if (result.success && result.draft) {
        setGeneratedDraft(result.draft);
      } else {
        triggerFeedback(result.error || 'Failed to synthesize AI draft', true);
      }
    } catch (err: any) {
      triggerFeedback(err.message || 'Error communicating with AI drafting service', true);
    } finally {
      setIsGeneratingAiDraft(false);
    }
  };

  const handleSaveAiDraft = async () => {
    if (!generatedDraft) return;
    try {
      const res = await clinicalStore.createStructuredHandoff(generatedDraft);
      if (res.success) {
        triggerFeedback('AI-assisted handoff draft saved. Requires attending review and certification before sharing.');
        setIsAiDraftModalOpen(false);
        setGeneratedDraft(null);
      } else {
        triggerFeedback(res.error || 'Failed to save draft', true);
      }
    } catch (e: any) {
      triggerFeedback(e.message || 'Failed to save draft', true);
    }
  };

  // Clinician Approval of AI Draft
  const handleApproveDraft = async () => {
    if (!targetHandoffToApprove) return;
    if (!approverNpi.trim()) {
      triggerFeedback('Attending Physician NPI is required for formal certification', true);
      return;
    }

    try {
      const res = await clinicalStore.approveAiHandoffDraft(
        targetHandoffToApprove.id,
        'Dr. Sarah Chen, MD',
        approverNpi.trim(),
        approverNotes.trim() || 'Attending physician verified patient record integrity and certified care transition brief.'
      );

      if (res.success) {
        triggerFeedback('Handoff draft formally certified and approved. Now shared with receiving clinician and patient.');
        setIsApproveModalOpen(false);
        setTargetHandoffToApprove(null);
        setApproverNotes('');
      } else {
        triggerFeedback(res.error || 'Approval failed', true);
      }
    } catch (e: any) {
      triggerFeedback(e.message || 'Approval error', true);
    }
  };

  // State Transition Handlers
  const handleTransitionState = async (
    handoffId: string,
    newState: HandoffState,
    note?: string
  ) => {
    setActionLoading((prev) => ({ ...prev, [handoffId]: true }));
    try {
      const res = await clinicalStore.transitionHandoffState(handoffId, newState, note);
      if (res.success) {
        triggerFeedback(`Handoff state updated to: ${newState.toUpperCase()}`);
      } else {
        triggerFeedback(res.error || 'Failed to update state', true);
      }
    } finally {
      setActionLoading((prev) => ({ ...prev, [handoffId]: false }));
    }
  };

  // Case Reassignment Handler
  const handleReassignHandoff = async () => {
    if (!targetHandoffToReassign) return;
    try {
      const res = await clinicalStore.assignHandoff(
        targetHandoffToReassign.id,
        newClinicianAssignee,
        reassignReason.trim()
      );
      if (res.success) {
        triggerFeedback(`Case successfully reassigned to ${newClinicianAssignee}. Notification sent.`);
        setIsReassignModalOpen(false);
        setTargetHandoffToReassign(null);
        setReassignReason('');
      } else {
        triggerFeedback(res.error || 'Reassignment failed', true);
      }
    } catch (e: any) {
      triggerFeedback(e.message || 'Reassignment error', true);
    }
  };

  // Case Escalation Handler
  const handleEscalateHandoff = async () => {
    if (!targetHandoffToEscalate) return;
    try {
      const res = await clinicalStore.transitionHandoffState(
        targetHandoffToEscalate.id,
        'escalated',
        escalateReason.trim() || 'Immediate attending evaluation required due to clinical deterioration'
      );
      if (res.success) {
        triggerFeedback('Case flagged as ESCALATED. Urgent priority notification dispatched to senior clinical team.');
        setIsEscalateModalOpen(false);
        setTargetHandoffToEscalate(null);
        setEscalateReason('');
      } else {
        triggerFeedback(res.error || 'Escalation failed', true);
      }
    } catch (e: any) {
      triggerFeedback(e.message || 'Escalation error', true);
    }
  };

  // Create Specialist Referral Handler
  const handleCreateReferral = async () => {
    if (!newReferralReason.trim()) {
      triggerFeedback('Referral clinical justification is required', true);
      return;
    }

    const patient = patients.find((p) => p.id === newReferralPatientId);
    try {
      await clinicalStore.createReferral({
        patientId: newReferralPatientId,
        patientName: patient?.name || 'Aryan Yadav',
        mrn: patient?.mrn || 'MAI-80429',
        referringClinician: 'Dr. Sarah Chen, MD',
        referringClinicianNpi: '1942850192',
        destination: newReferralDestination,
        specialty: newReferralSpecialty,
        urgency: newReferralUrgency,
        reason: newReferralReason.trim(),
        clinicalNotes: newReferralNotes.trim()
      });

      triggerFeedback('Specialist referral registered and sent to patient portal.');
      setIsNewReferralModalOpen(false);
      setNewReferralReason('');
      setNewReferralNotes('');
    } catch (e: any) {
      triggerFeedback(e.message || 'Failed to create referral', true);
    }
  };

  // Schedule Appointment Handler
  const handleScheduleAppointment = async () => {
    const patient = patients.find((p) => p.id === newAptPatientId);
    try {
      const slotCheck = await clinicalStore.checkAppointmentSlot(newAptDate, newAptTime, newAptProviderName);
      if (!slotCheck.available) {
        triggerFeedback(`Slot conflict: ${newAptProviderName} already has an active appointment at ${newAptTime} on ${newAptDate}. Please select another slot.`, true);
        return;
      }

      await clinicalStore.scheduleFollowupAppointment({
        patientId: newAptPatientId,
        patientName: patient?.name || 'Aryan Yadav',
        providerName: newAptProviderName,
        providerSpecialty: 'Internal Medicine',
        date: newAptDate,
        time: newAptTime,
        type: newAptType,
        location: newAptType === 'telehealth' ? 'Virtual Video Consult (Encrypted WebRTC)' : 'Metro Clinical Hospital, Suite 402',
        status: 'scheduled',
        reason: newAptReason
      });

      triggerFeedback('Follow-up appointment scheduled and dispatched to patient.');
      setIsNewAppointmentModalOpen(false);
      setAppointments(clinicalStore.getAppointments());
    } catch (e: any) {
      triggerFeedback(e.message || 'Failed to schedule appointment', true);
    }
  };

  // Accept / Confirm Appointment
  const handleAcceptAppointment = async (aptId: string) => {
    setActionLoading((prev) => ({ ...prev, [aptId]: true }));
    try {
      const res = await clinicalStore.updateAppointmentOnServer(aptId, { status: 'confirmed' });
      if (res.success) {
        triggerFeedback('Appointment confirmed and patient calendar notification dispatched.');
        setAppointments(clinicalStore.getAppointments());
      } else {
        triggerFeedback(res.error || 'Failed to confirm appointment', true);
      }
    } finally {
      setActionLoading((prev) => ({ ...prev, [aptId]: false }));
    }
  };

  // Mark Completed
  const handleCompleteAppointment = async (aptId: string) => {
    setActionLoading((prev) => ({ ...prev, [aptId]: true }));
    try {
      const res = await clinicalStore.updateAppointmentOnServer(aptId, { status: 'completed' });
      if (res.success) {
        triggerFeedback('Consultation marked completed. Record archived to patient history.');
        setAppointments(clinicalStore.getAppointments());
      } else {
        triggerFeedback(res.error || 'Failed to complete appointment', true);
      }
    } finally {
      setActionLoading((prev) => ({ ...prev, [aptId]: false }));
    }
  };

  // Open Reschedule Modal
  const handleOpenRescheduleModal = (apt: AppointmentRecord) => {
    setTargetAptToReschedule(apt);
    setRescheduleDate(apt.date);
    setRescheduleTime(apt.time);
    setRescheduleReason(apt.rescheduleReason || 'Clinician clinical schedule adjustment');
    setRescheduleSlotConflict(null);
    setIsRescheduleModalOpen(true);
  };

  // Confirm Reschedule
  const handleConfirmReschedule = async () => {
    if (!targetAptToReschedule) return;
    setRescheduleSlotConflict(null);
    try {
      const slotCheck = await clinicalStore.checkAppointmentSlot(
        rescheduleDate,
        rescheduleTime,
        targetAptToReschedule.providerName,
        targetAptToReschedule.id
      );
      if (!slotCheck.available) {
        setRescheduleSlotConflict(`Slot unavailable: ${targetAptToReschedule.providerName} already has an active appointment at ${rescheduleTime} on ${rescheduleDate}.`);
        return;
      }

      const res = await clinicalStore.updateAppointmentOnServer(targetAptToReschedule.id, {
        date: rescheduleDate,
        time: rescheduleTime,
        status: 'rescheduled',
        previousDate: targetAptToReschedule.date,
        previousTime: targetAptToReschedule.time,
        rescheduleReason: rescheduleReason
      });

      if (res.success) {
        triggerFeedback(`Appointment rescheduled to ${rescheduleDate} at ${rescheduleTime}.`);
        setIsRescheduleModalOpen(false);
        setAppointments(clinicalStore.getAppointments());
      } else {
        setRescheduleSlotConflict(res.error || 'Failed to reschedule appointment');
      }
    } catch (e: any) {
      setRescheduleSlotConflict(e.message || 'Error rescheduling appointment');
    }
  };

  // Open Cancel Modal
  const handleOpenCancelModal = (apt: AppointmentRecord) => {
    setTargetAptToCancel(apt);
    setCancelReasonText('Patient request / clinical emergency');
    setIsCancelModalOpen(true);
  };

  // Confirm Cancel
  const handleConfirmCancel = async () => {
    if (!targetAptToCancel) return;
    try {
      const res = await clinicalStore.cancelAppointmentOnServer(targetAptToCancel.id, cancelReasonText);
      if (res.success) {
        triggerFeedback('Appointment cancelled and patient notification dispatched.');
        setIsCancelModalOpen(false);
        setAppointments(clinicalStore.getAppointments());
      } else {
        triggerFeedback(res.error || 'Failed to cancel appointment', true);
      }
    } catch (e: any) {
      triggerFeedback(e.message || 'Error cancelling appointment', true);
    }
  };

  // Task Action Handler
  const handleTaskAction = async (
    taskId: string,
    action: 'acknowledge' | 'complete' | 'escalate' | 'reassign',
    reassignTarget?: string
  ) => {
    setActionLoading((prev) => ({ ...prev, [taskId]: true }));
    try {
      await clinicalStore.actOnClinicalTask(taskId, action, reassignTarget);
      triggerFeedback(`Task successfully ${action}d.`);
      await clinicalStore.fetchClinicalTasks();
    } finally {
      setActionLoading((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  // Filtered lists
  const filteredHandoffs = handoffs.filter((h) => {
    const matchesPatient = selectedPatientId === 'all' || h.patientId === selectedPatientId;
    const matchesState =
      handoffStateFilter === 'all' ||
      (h.handoffState || 'pending') === handoffStateFilter ||
      (handoffStateFilter === 'unreviewed' && h.status !== 'reviewed');
    const matchesSearch =
      searchQuery.trim() === '' ||
      h.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.chiefConcern.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.mrn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPatient && matchesState && matchesSearch;
  });

  const unresolvedTasks = tasks.filter((t) => t.status !== 'completed');
  const unreviewedReports = reports.filter((r) => r.reviewStatus === 'unreviewed' || (r as any).status === 'unreviewed');
  const totalUnresolvedCount = unresolvedTasks.length + unreviewedReports.length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-emerald-700 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Clinical Continuity · Structured Handoffs & Follow-Up</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-1 flex items-center gap-2">
            <span>Patient Handoff Briefs & Care Coordination</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Structured care transitions, verified AI drafting with clinician approval, case reassignments, and connected follow-ups.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAiDraftModalOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate AI Handoff Draft</span>
          </button>

          <button
            onClick={() => setIsNewReferralModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Building className="w-4 h-4 text-blue-600" />
            <span>Specialist Referral</span>
          </button>

          <button
            onClick={() => setIsNewAppointmentModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Schedule Follow-up</span>
          </button>
        </div>
      </div>

      {/* Notifications / Feedback Bar */}
      {successNote && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successNote}</span>
          </div>
          <button onClick={() => setSuccessNote(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-900 dark:text-rose-200 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-700 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Primary Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('handoffs')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'handoffs'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Handoff Briefs ({handoffs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'tasks'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5 text-amber-600" />
            <span>Unresolved Worklist ({totalUnresolvedCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'appointments'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Follow-up Appointments ({appointments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('referrals')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'referrals'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-purple-600" />
            <span>Specialist Referrals ({referrals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'notifications'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span>Audit & Alerts ({notifications.length})</span>
          </button>
        </div>

        {/* Global Patient Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">Filter Patient:</label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="p-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Patients (Institutional View)</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.mrn})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STRUCTURED HANDOFF BRIEFS                                         */}
      {/* ========================================================================= */}
      {activeTab === 'handoffs' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All Handoffs', count: handoffs.length },
                { id: 'draft', label: 'AI Drafts (Pending Signoff)', count: handoffs.filter((h) => h.handoffState === 'draft').length },
                { id: 'pending', label: 'Pending Review', count: handoffs.filter((h) => (h.handoffState || 'pending') === 'pending').length },
                { id: 'accepted', label: 'Accepted / Acknowledged', count: handoffs.filter((h) => h.handoffState === 'accepted').length },
                { id: 'completed', label: 'Completed', count: handoffs.filter((h) => h.handoffState === 'completed').length },
                { id: 'escalated', label: 'Escalated', count: handoffs.filter((h) => h.handoffState === 'escalated').length }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setHandoffStateFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                    handoffStateFilter === pill.id
                      ? 'bg-slate-900 dark:bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{pill.label}</span>
                  <span className="text-[10px] opacity-75 font-mono">({pill.count})</span>
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search brief, concern, MRN..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Handoff List */}
          {filteredHandoffs.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">No Handoff Briefs in this View</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate an AI handoff draft or adjust filter settings above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHandoffs.map((brief) => {
                const state = brief.handoffState || (brief.status === 'reviewed' ? 'accepted' : 'pending');
                const isDraft = state === 'draft' || (brief.isAiDrafted && !brief.isClinicianApproved);
                const isEscalated = state === 'escalated';
                const isAccepted = state === 'accepted';
                const isCompleted = state === 'completed';
                const isLoading = Boolean(actionLoading[brief.id]);

                return (
                  <div
                    key={brief.id}
                    className={`p-6 rounded-2xl border transition-all space-y-4 ${
                      isEscalated
                        ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900 shadow-md'
                        : isDraft
                        ? 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/60'
                        : isCompleted
                        ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-85'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-base">
                          {brief.patientName}
                        </span>
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          MRN: {brief.mrn}
                        </span>
                        <span className="text-xs font-mono text-slate-400">·</span>
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          {brief.date} (v{brief.version || 1})
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* State Badge */}
                        <span
                          className={`text-[10px] font-mono uppercase font-bold px-2.5 py-1 rounded-md border flex items-center gap-1 ${
                            isEscalated
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-300 animate-pulse'
                              : isDraft
                              ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 border-purple-300 border-dashed'
                              : isAccepted
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border-blue-300'
                              : isCompleted
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-300'
                          }`}
                        >
                          {isEscalated && <Flame className="w-3 h-3 text-rose-500" />}
                          {isDraft && <Sparkles className="w-3 h-3 text-purple-500" />}
                          <span>{state.toUpperCase()}</span>
                        </span>

                        {/* Approval Status */}
                        {brief.isAiDrafted && (
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                              brief.isClinicianApproved
                                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200'
                                : 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200'
                            }`}
                          >
                            {brief.isClinicianApproved ? '✓ Attending Certified' : '⚠ AI Draft (Unapproved)'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Unapproved AI Draft Warning Banner */}
                    {isDraft && !brief.isClinicianApproved && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>UNVERIFIED AI DRAFT GATED:</strong> This care transition summary was synthesized from verified medical records. In compliance with clinical protocol, it <em>cannot be shared with the receiving physician or published to the patient portal</em> until an authorized attending physician signs off with certification credentials.
                        </div>
                      </div>
                    )}

                    {/* 1. Presenting Concern & Duration */}
                    <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                      <div className="text-[10px] uppercase font-mono font-bold text-slate-400">
                        1. PRESENTING CLINICAL CONCERN & DURATION
                      </div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {brief.chiefConcern}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        Duration / Clinical Status: {brief.duration || 'Shift admission'}
                      </div>
                    </div>

                    {/* 2. Relevant History (HPI) */}
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-mono font-bold text-slate-400">
                        2. RELEVANT CLINICAL HISTORY & SYNOPSIS
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        {brief.hpiSynopsis}
                      </p>
                    </div>

                    {/* 3. Documented Allergies & Current Regimens */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Allergies */}
                      <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-rose-800 dark:text-rose-300">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                          <span>3. DOCUMENTED ALLERGIES & SENSITIVITIES</span>
                        </div>
                        <div className="text-xs font-semibold text-rose-900 dark:text-rose-200">
                          {brief.allergies && brief.allergies.length > 0 ? (
                            brief.allergies.join(', ')
                          ) : (
                            <span className="text-slate-500 font-normal">No known drug allergies (NKDA)</span>
                          )}
                        </div>
                      </div>

                      {/* Current Regimens */}
                      <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-blue-800 dark:text-blue-300">
                          <Pill className="w-3.5 h-3.5 text-blue-600" />
                          <span>4. CONCURRENT ACTIVE MEDICATIONS</span>
                        </div>
                        <div className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                          {brief.currentMedications && brief.currentMedications.length > 0 ? (
                            brief.currentMedications.join(', ')
                          ) : (
                            <span className="text-slate-500 font-normal">None recorded</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 4. Telemetry Vitals & Available Lab Highlights */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-1 font-mono text-[11px]">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">5. RECENT TELEMETRY VITALS</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{brief.recentVitalsSummary}</span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-1 font-mono text-[11px]">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">6. AVAILABLE RESULTS & LAB HIGHLIGHTS</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {brief.labHighlights && brief.labHighlights.length > 0
                            ? brief.labHighlights.join(' | ')
                            : 'Diagnostic lab tests pending'}
                        </span>
                      </div>
                    </div>

                    {/* 5. Actions Completed & Outstanding Tasks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Actions Completed */}
                      <div className="p-3.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 space-y-1.5">
                        <div className="text-[10px] uppercase font-mono font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>7. ACTIONS COMPLETED THIS SHIFT</span>
                        </div>
                        <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                          {(brief.actionsCompleted || ['Shift intake triage completed']).map((act, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-emerald-600 font-bold">✓</span>
                              <span>{act}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Outstanding Tasks */}
                      <div className="p-3.5 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 space-y-1.5">
                        <div className="text-[10px] uppercase font-mono font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>8. OUTSTANDING TASKS & ACTION ITEMS</span>
                        </div>
                        <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                          {(brief.outstandingTasks || ['Awaiting receiving clinician acknowledgment']).map((task, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-amber-600 font-bold">●</span>
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* 6. Follow-up Needs & Assigned Clinician */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <div className="text-[10px] uppercase font-mono font-bold text-slate-400">
                          9. FOLLOW-UP NEEDS & TIMEFRAME
                        </div>
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {brief.followUpNeeds || 'Routine attending evaluation during shift'}
                        </div>
                      </div>

                      <div className="text-right font-mono text-[11px] text-slate-500">
                        <div>Responsible Clinician: <strong className="text-slate-800 dark:text-slate-200">{brief.assignedClinician || 'Dr. Sarah Chen, MD'}</strong></div>
                        <div>Dept: {brief.assignedDepartment || 'Internal Medicine'}</div>
                      </div>
                    </div>

                    {/* Bottom Action Controls */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          onClick={() => setViewAuditHandoff(brief)}
                          className="px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1 text-[11px] font-mono"
                        >
                          <History className="w-3 h-3" />
                          <span>Audit Trail ({brief.auditLog?.length || 1})</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* If unapproved AI draft: Show Approve Button */}
                        {brief.isAiDrafted && !brief.isClinicianApproved && (
                          <button
                            disabled={isLoading}
                            onClick={() => {
                              setTargetHandoffToApprove(brief);
                              setIsApproveModalOpen(true);
                            }}
                            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Certify & Approve AI Draft</span>
                          </button>
                        )}

                        {/* Accept / Acknowledge */}
                        {!isAccepted && !isCompleted && !isDraft && (
                          <button
                            disabled={isLoading}
                            onClick={() => handleTransitionState(brief.id, 'accepted', 'Handoff acknowledged by receiving clinician')}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Acknowledge Handoff</span>
                          </button>
                        )}

                        {/* Mark Completed */}
                        {!isCompleted && !isDraft && (
                          <button
                            disabled={isLoading}
                            onClick={() => handleTransitionState(brief.id, 'completed', 'Care transition completed and recorded')}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark Completed</span>
                          </button>
                        )}

                        {/* Reassign */}
                        <button
                          disabled={isLoading}
                          onClick={() => {
                            setTargetHandoffToReassign(brief);
                            setIsReassignModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Reassign</span>
                        </button>

                        {/* Escalate */}
                        {!isEscalated && (
                          <button
                            disabled={isLoading}
                            onClick={() => {
                              setTargetHandoffToEscalate(brief);
                              setIsEscalateModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-900 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Flame className="w-3.5 h-3.5 text-rose-500" />
                            <span>Escalate</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: UNRESOLVED WORKLIST & AWAITING REPORTS                             */}
      {/* ========================================================================= */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {/* Summary Metric Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs font-medium text-slate-500">Total Unresolved Items</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{totalUnresolvedCount}</div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">Outstanding shift responsibilities</div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs font-medium text-amber-600 dark:text-amber-400">Clinical Tasks Pending</div>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">{unresolvedTasks.length}</div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">Care coordination & triage tasks</div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs font-medium text-blue-600 dark:text-blue-400">Reports Awaiting Review</div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">{unreviewedReports.length}</div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">Diagnostic lab panels requiring signoff</div>
            </div>
          </div>

          {/* Section A: Outstanding Clinical Tasks */}
          <div className="space-y-3">
            <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-emerald-600" />
              <span>Outstanding Clinical Tasks ({unresolvedTasks.length})</span>
            </div>

            {unresolvedTasks.length === 0 ? (
              <div className="p-6 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                All clinical tasks are resolved and completed.
              </div>
            ) : (
              <div className="space-y-3">
                {unresolvedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{task.title}</span>
                        <span
                          className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                            task.priority === 'critical'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : task.priority === 'high'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-slate-400">Due: {task.dueDate} · Assignee: {task.assignedClinician}</div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">{task.description}</p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="text-[11px] font-mono text-slate-500">Patient: {task.patientName} ({task.mrn})</div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTaskAction(task.id, 'complete')}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-xs"
                        >
                          Mark Task Completed
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section B: Reports Awaiting Review */}
          <div className="space-y-3 pt-4">
            <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <span>Diagnostic Reports Awaiting Clinician Review ({unreviewedReports.length})</span>
            </div>

            {unreviewedReports.length === 0 ? (
              <div className="p-6 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                All uploaded lab reports have been reviewed and signed off.
              </div>
            ) : (
              <div className="space-y-3">
                {unreviewedReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {rep.documentName || rep.testName || rep.title}
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        Uploaded: {rep.uploadDate || rep.date} · Source: {rep.source || 'Lab Service'} · Patient: {rep.patientName || 'Aryan Yadav'}
                      </div>
                      {(rep.summary || rep.clinicalImpression) && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-1">
                          {rep.summary || rep.clinicalImpression}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => onNavigate('/doctor/lab-review')}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review in Lab Portal</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: FOLLOW-UP APPOINTMENTS                                            */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* TAB 3: FOLLOW-UP APPOINTMENTS (FULL LIFECYCLE & COLLISION CONTROL)       */}
      {/* ========================================================================= */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          {/* Header & New Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Clinical Consultations & Follow-Up Scheduling</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Authoritative appointments synced in real-time across Doctor EMR, Patient Portal, and Android Mobile App.
              </p>
            </div>
            <button
              onClick={() => setIsNewAppointmentModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule New Appointment</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All Appointments', count: appointments.length },
                {
                  id: 'scheduled',
                  label: 'Scheduled',
                  count: appointments.filter((a) => a.status === 'scheduled' || a.status === 'confirmed').length
                },
                {
                  id: 'pending',
                  label: 'Pending Confirmation',
                  count: appointments.filter((a) => a.status === 'pending').length
                },
                {
                  id: 'completed',
                  label: 'Completed',
                  count: appointments.filter((a) => a.status === 'completed').length
                },
                {
                  id: 'cancelled',
                  label: 'Cancelled',
                  count: appointments.filter((a) => a.status === 'cancelled').length
                }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setAppointmentStatusFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                    appointmentStatusFilter === pill.id
                      ? 'bg-slate-900 dark:bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{pill.label}</span>
                  <span className="text-[10px] opacity-75 font-mono">({pill.count})</span>
                </button>
              ))}
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-2">
              <label className="text-slate-500 font-medium">Filter Date:</label>
              <input
                type="date"
                value={appointmentDateFilter}
                onChange={(e) => setAppointmentDateFilter(e.target.value)}
                className="p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
              {appointmentDateFilter && (
                <button
                  onClick={() => setAppointmentDateFilter('')}
                  className="text-slate-400 hover:text-slate-600 text-[11px]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Appointments List */}
          {(() => {
            const filteredApts = appointments.filter((apt) => {
              const matchesStatus =
                appointmentStatusFilter === 'all'
                  ? true
                  : appointmentStatusFilter === 'scheduled'
                  ? apt.status === 'scheduled' || apt.status === 'confirmed' || apt.status === 'rescheduled'
                  : apt.status === appointmentStatusFilter;

              const matchesPatient = selectedPatientId === 'all' || apt.patientId === selectedPatientId;
              const matchesDate = !appointmentDateFilter || apt.date === appointmentDateFilter;
              return matchesStatus && matchesPatient && matchesDate;
            });

            if (filteredApts.length === 0) {
              return (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">No Appointments Found</div>
                  <p className="text-xs text-slate-500">
                    No records match the current filter selection. Adjust filters above or schedule a new consultation.
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {filteredApts.map((apt) => {
                  const isActionBusy = Boolean(actionLoading[apt.id]);
                  return (
                    <div
                      key={apt.id}
                      className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                            {apt.reason}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                              apt.status === 'confirmed'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                : apt.status === 'scheduled'
                                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                                : apt.status === 'pending'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse'
                                : apt.status === 'completed'
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                : apt.status === 'rescheduled'
                                ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                            }`}
                          >
                            {apt.status}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                            {apt.type === 'telehealth' ? 'Virtual Video Consult' : 'In-Person Hospital'}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-2 font-mono">
                          <span>
                            Date: <strong className="text-slate-900 dark:text-slate-100">{apt.date} at {apt.time}</strong>
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>Provider: {apt.providerName} ({apt.providerSpecialty})</span>
                        </div>

                        <div className="text-xs text-slate-500">
                          Patient: <strong className="text-slate-700 dark:text-slate-300">{apt.patientName}</strong> · Location: {apt.location}
                        </div>

                        {/* Audit Details if Rescheduled or Cancelled */}
                        {apt.status === 'rescheduled' && apt.previousDate && (
                          <div className="text-[11px] text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 p-2 rounded-lg border border-purple-200 dark:border-purple-800">
                            <strong>Rescheduled From:</strong> {apt.previousDate} at {apt.previousTime} · Reason: {apt.rescheduleReason || 'Clinician adjustment'}
                          </div>
                        )}

                        {apt.status === 'cancelled' && apt.cancelReason && (
                          <div className="text-[11px] text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-800">
                            <strong>Cancellation Reason:</strong> {apt.cancelReason}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {/* Confirm / Accept Button */}
                        {(apt.status === 'pending' || apt.status === 'scheduled') && (
                          <button
                            disabled={isActionBusy}
                            onClick={() => handleAcceptAppointment(apt.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirm / Accept</span>
                          </button>
                        )}

                        {/* Mark Completed Button */}
                        {(apt.status === 'confirmed' || apt.status === 'rescheduled') && (
                          <button
                            disabled={isActionBusy}
                            onClick={() => handleCompleteAppointment(apt.id)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark Completed</span>
                          </button>
                        )}

                        {/* Reschedule Button */}
                        {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                          <button
                            disabled={isActionBusy}
                            onClick={() => handleOpenRescheduleModal(apt)}
                            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                          >
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>Reschedule</span>
                          </button>
                        )}

                        {/* Cancel Button */}
                        {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                          <button
                            disabled={isActionBusy}
                            onClick={() => handleOpenCancelModal(apt)}
                            className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Cancel</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SPECIALIST REFERRALS                                              */}
      {/* ========================================================================= */}
      {activeTab === 'referrals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-slate-500">
              Cross-institutional specialist referrals with documented clinical justifications.
            </div>
            <button
              onClick={() => setIsNewReferralModalOpen(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Specialist Referral</span>
            </button>
          </div>

          <div className="space-y-3">
            {referrals.map((ref) => (
              <div
                key={ref.id}
                className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{ref.destination}</span>
                    <span className="text-xs font-mono text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded font-semibold">
                      {ref.specialty}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                        ref.urgency === 'emergency'
                          ? 'bg-rose-100 text-rose-800'
                          : ref.urgency === 'urgent'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {ref.urgency}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Status: {ref.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div><strong>Clinical Justification:</strong> {ref.reason}</div>
                  {ref.clinicalNotes && (
                    <div className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      <strong>Notes:</strong> {ref.clinicalNotes}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Patient: {ref.patientName} ({ref.mrn})</span>
                  <span>Referring: {ref.referringClinician} (NPI: {ref.referringClinicianNpi})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: AUDIT & CLINICAL NOTIFICATIONS                                    */}
      {/* ========================================================================= */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="text-xs font-medium text-slate-500">
            Real-time auditable notification stream for cross-provider care transfers, approvals, and patient updates.
          </div>

          <div className="space-y-2.5">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-xl border flex items-start justify-between gap-3 transition-colors ${
                  n.isRead
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80'
                    : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{n.title}</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600">
                      To: {n.recipientRole} ({n.recipientId})
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{n.message}</p>
                  <div className="text-[10px] font-mono text-slate-400">
                    {n.createdAt?.split('T')[0]} at {n.createdAt?.split('T')[1]?.slice(0, 5)} · Patient: {n.patientName}
                  </div>
                </div>

                {!n.isRead && (
                  <button
                    onClick={() => clinicalStore.markClinicalNotificationRead(n.id)}
                    className="px-2.5 py-1 text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded text-slate-700 dark:text-slate-300 shrink-0 font-mono"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AI-ASSISTED DRAFTING                                              */}
      {/* ========================================================================= */}
      {isAiDraftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 shadow-2xl space-y-4 text-xs my-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>AI-Assisted Handoff Brief Synthesis</span>
              </div>
              <button onClick={() => setIsAiDraftModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Synthesizes a grounded, source-referenced care transition brief using <strong>only authorized patient records</strong> (telemetry vitals, active medications, verified allergies, and consultation notes).
            </p>

            {/* Patient Selector */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Select Patient Record:</label>
              <select
                value={aiDraftPatientId}
                onChange={(e) => setAiDraftPatientId(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.mrn}) · {p.triageStatus.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Generate Action Button */}
            <div className="pt-2">
              <button
                disabled={isGeneratingAiDraft}
                onClick={handleGenerateAiDraft}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                {isGeneratingAiDraft ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing from Verified Chart...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Synthesize Structured Handoff Draft</span>
                  </>
                )}
              </button>
            </div>

            {/* Generated Draft Preview */}
            {generatedDraft && (
              <div className="mt-4 p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 space-y-3">
                <div className="flex items-center justify-between text-purple-900 dark:text-purple-200 font-bold">
                  <span>DRAFT PREVIEW (Requires Attending Signoff)</span>
                  <span className="text-[10px] font-mono uppercase bg-purple-200 dark:bg-purple-900 px-2 py-0.5 rounded">
                    Status: Gated Draft
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Chief Concern: {generatedDraft.chiefConcern}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    {generatedDraft.hpiSynopsis}
                  </p>
                </div>

                <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                  <div><strong>Allergies:</strong> {generatedDraft.allergies?.join(', ')}</div>
                  <div><strong>Regimens:</strong> {generatedDraft.currentMedications.join(', ')}</div>
                  <div><strong>Vitals:</strong> {generatedDraft.recentVitalsSummary}</div>
                </div>

                {/* Source Provenance */}
                <div className="pt-2 border-t border-purple-200 dark:border-purple-900/50 text-[10px] font-mono text-purple-800 dark:text-purple-300">
                  <div className="font-bold mb-1">PROVENANCE ATTRIBUTIONS:</div>
                  <ul className="space-y-0.5">
                    {generatedDraft.sourceAttributions?.map((sa) => (
                      <li key={sa.id}>
                        • {sa.item} [{sa.sourceType}] ({sa.originalRecordRef})
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setGeneratedDraft(null)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSaveAiDraft}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
                  >
                    Save Draft to EHR
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CLINICIAN CERTIFICATION & APPROVAL                                */}
      {/* ========================================================================= */}
      {isApproveModalOpen && targetHandoffToApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Attending Physician Certification</span>
            </div>

            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Certifying this brief unlocks it from the drafting state, dispatches case notifications to receiving providers, and registers the care transition in the patient record.
            </p>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300">
              <div>Patient: <strong>{targetHandoffToApprove.patientName}</strong> ({targetHandoffToApprove.mrn})</div>
              <div>Concern: {targetHandoffToApprove.chiefConcern}</div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                Attending NPI Certification Number *
              </label>
              <input
                type="text"
                value={approverNpi}
                onChange={(e) => setApproverNpi(e.target.value)}
                placeholder="10-digit NPI"
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                Clinical Encounter Signoff Notes (Optional)
              </label>
              <textarea
                value={approverNotes}
                onChange={(e) => setApproverNotes(e.target.value)}
                placeholder="e.g. Reviewed objective telemetry and verified safe transition..."
                rows={3}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsApproveModalOpen(false)}
                className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveDraft}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm & Authorize Handoff</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CASE REASSIGNMENT                                                 */}
      {/* ========================================================================= */}
      {isReassignModalOpen && targetHandoffToReassign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Reassign Patient Handoff</span>
            </div>

            <p className="text-slate-600 dark:text-slate-400">
              Reassign <strong>{targetHandoffToReassign.patientName}</strong> to another attending clinician or department.
            </p>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Select Target Clinician:</label>
              <select
                value={newClinicianAssignee}
                onChange={(e) => setNewClinicianAssignee(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              >
                <option value="Dr. Sarah Chen, MD">Dr. Sarah Chen, MD (Internal Medicine)</option>
                <option value="Dr. Michael Scott, MD">Dr. Michael Scott, MD (Cardiology)</option>
                <option value="Dr. Robert Thorne, MD">Dr. Robert Thorne, MD (Endocrinology)</option>
                <option value="Dr. Lisa Vance, MD">Dr. Lisa Vance, MD (Pulmonology)</option>
                <option value="ED Rapid Response Team">ED Rapid Response Team (Emergency)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Reassignment Justification:</label>
              <input
                type="text"
                value={reassignReason}
                onChange={(e) => setReassignReason(e.target.value)}
                placeholder="e.g. Specialty consultation needed / shift change"
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsReassignModalOpen(false)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReassignHandoff}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
              >
                Confirm Reassignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ESCALATION                                                        */}
      {/* ========================================================================= */}
      {isEscalateModalOpen && targetHandoffToEscalate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-300 dark:border-rose-900 max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="font-bold text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-600" />
              <span>Escalate Patient Handoff</span>
            </div>

            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Escalating flags this case for urgent intervention, sets state to <strong>ESCALATED</strong>, and broadcasts urgent alerts across senior attending channels.
            </p>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Clinical Reason for Escalation *</label>
              <textarea
                value={escalateReason}
                onChange={(e) => setEscalateReason(e.target.value)}
                placeholder="e.g. Worsening acute chest tightness, refractory systolic BP > 180 mmHg..."
                rows={3}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-rose-200 dark:border-rose-900 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsEscalateModalOpen(false)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleEscalateHandoff}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold"
              >
                Confirm Escalation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SPECIALIST REFERRAL CREATION                                      */}
      {/* ========================================================================= */}
      {isNewReferralModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              <span>Create Specialist Referral</span>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Patient</label>
              <select
                value={newReferralPatientId}
                onChange={(e) => setNewReferralPatientId(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.mrn})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">Destination Facility</label>
                <input
                  type="text"
                  value={newReferralDestination}
                  onChange={(e) => setNewReferralDestination(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">Specialty</label>
                <input
                  type="text"
                  value={newReferralSpecialty}
                  onChange={(e) => setNewReferralSpecialty(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Urgency</label>
              <select
                value={newReferralUrgency}
                onChange={(e: any) => setNewReferralUrgency(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              >
                <option value="routine">Routine (Within 14–30 days)</option>
                <option value="urgent">Urgent (Within 48–72 hours)</option>
                <option value="emergency">Emergency (Immediate transfer)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Clinical Reason *</label>
              <input
                type="text"
                value={newReferralReason}
                onChange={(e) => setNewReferralReason(e.target.value)}
                placeholder="e.g. 24hr Holter monitoring & secondary hypertension screen"
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Clinical Notes for Specialist</label>
              <textarea
                value={newReferralNotes}
                onChange={(e) => setNewReferralNotes(e.target.value)}
                placeholder="Detailed findings, prior medications tried, lab trends..."
                rows={2}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsNewReferralModalOpen(false)}
                className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateReferral}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
              >
                Submit Referral
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FOLLOW-UP APPOINTMENT SCHEDULING                                  */}
      {/* ========================================================================= */}
      {isNewAppointmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Schedule Follow-up Appointment</span>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Patient</label>
              <select
                value={newAptPatientId}
                onChange={(e) => setNewAptPatientId(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.mrn})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">Date</label>
                <input
                  type="date"
                  value={newAptDate}
                  onChange={(e) => setNewAptDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">Time</label>
                <input
                  type="text"
                  value={newAptTime}
                  onChange={(e) => setNewAptTime(e.target.value)}
                  placeholder="10:00 AM"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">Consultation Type</label>
                <select
                  value={newAptType}
                  onChange={(e: any) => setNewAptType(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                >
                  <option value="in_person">In-Person Clinic Visit</option>
                  <option value="telehealth">Telehealth (Encrypted Video)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">Provider</label>
                <input
                  type="text"
                  value={newAptProviderName}
                  onChange={(e) => setNewAptProviderName(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">Reason for Encounter</label>
              <input
                type="text"
                value={newAptReason}
                onChange={(e) => setNewAptReason(e.target.value)}
                placeholder="Follow-up review..."
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsNewAppointmentModalOpen(false)}
                className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleAppointment}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
              >
                Schedule & Notify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AUDIT TRAIL VIEWER                                                */}
      {/* ========================================================================= */}
      {viewAuditHandoff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600" />
                <span>Longitudinal Audit Trail: {viewAuditHandoff.patientName}</span>
              </div>
              <button onClick={() => setViewAuditHandoff(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {(viewAuditHandoff.auditLog || []).map((entry, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl space-y-1">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase">{entry.action}</span>
                    <span className="text-slate-400">{entry.timestamp}</span>
                  </div>
                  <div className="text-slate-700 dark:text-slate-200 font-semibold">{entry.actor}</div>
                  {entry.details && <p className="text-slate-500 text-[11px]">{entry.details}</p>}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewAuditHandoff(null)}
                className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-semibold"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RESCHEDULE APPOINTMENT                                            */}
      {/* ========================================================================= */}
      {isRescheduleModalOpen && targetAptToReschedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>Reschedule Clinical Consultation</span>
              </div>
              <button
                onClick={() => setIsRescheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 space-y-1">
              <div className="font-semibold">{targetAptToReschedule.reason}</div>
              <div className="text-[11px] font-mono">
                Current Slot: {targetAptToReschedule.date} at {targetAptToReschedule.time}
              </div>
              <div className="text-[11px]">Patient: {targetAptToReschedule.patientName}</div>
            </div>

            {rescheduleSlotConflict && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{rescheduleSlotConflict}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">New Date *</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => {
                    setRescheduleDate(e.target.value);
                    setRescheduleSlotConflict(null);
                  }}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">New Time *</label>
                <input
                  type="text"
                  value={rescheduleTime}
                  onChange={(e) => {
                    setRescheduleTime(e.target.value);
                    setRescheduleSlotConflict(null);
                  }}
                  placeholder="11:00 AM"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                Clinical Reason for Rescheduling *
              </label>
              <textarea
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="Document rationale for longitudinal audit trail..."
                rows={2}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsRescheduleModalOpen(false)}
                className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReschedule}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Reschedule</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CANCEL APPOINTMENT                                                 */}
      {/* ========================================================================= */}
      {isCancelModalOpen && targetAptToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <div className="font-bold text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Cancel Clinical Appointment</span>
              </div>
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600 dark:text-slate-400">
              Are you sure you want to cancel the appointment for <strong>{targetAptToCancel.patientName}</strong> on{' '}
              <strong>{targetAptToCancel.date} at {targetAptToCancel.time}</strong>?
            </p>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                Required Cancellation Reason *
              </label>
              <textarea
                value={cancelReasonText}
                onChange={(e) => setCancelReasonText(e.target.value)}
                placeholder="Enter clinical rationale or patient request..."
                rows={2}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
              >
                Nevermind
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>Confirm Cancellation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
