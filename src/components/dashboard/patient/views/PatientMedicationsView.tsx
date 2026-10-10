import React, { useState, useEffect } from 'react';
import {
  RoutePath,
  MedicationItem,
  MedicationRoute,
  MedicationStatus,
  DoseLogStatus,
  DrugInteractionCheckResult
} from '../../../../types';
import { useAuth } from '../../../../context/AuthContext';
import { clinicalStore } from '../../../../services/clinicalStore';
import { validateDosageInput, addReminderTime } from '../../../../services/__tests__/medicationManagement.test';
import {
  Pill,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Check,
  X,
  AlertTriangle,
  Info,
  Calendar,
  Bell,
  BellOff,
  History,
  Lock,
  Globe,
  HelpCircle,
  FileText,
  User,
  ShieldAlert,
  Edit2,
  Trash2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Pause,
  Play,
  Sparkles
} from 'lucide-react';

interface PatientMedicationsViewProps {
  onNavigate: (route: RoutePath) => void;
}

type MedicationTab = 'active' | 'reminders' | 'unconfirmed' | 'history' | 'interactions';

export const PatientMedicationsView: React.FC<PatientMedicationsViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const userId = user?.id || 'pat-1';

  const [activeTab, setActiveTab] = useState<MedicationTab>('active');
  const [medications, setMedications] = useState<MedicationItem[]>(clinicalStore.getMedications(userId));
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMedForDetail, setSelectedMedForDetail] = useState<MedicationItem | null>(null);

  // Alerts
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Notification API Permission State
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  // Subscribe to clinical store changes
  useEffect(() => {
    const unsubscribe = clinicalStore.subscribe(() => {
      setMedications(clinicalStore.getMedications(userId));
    });
    return unsubscribe;
  }, [userId]);

  // Request browser notification permission
  const handleRequestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        if (perm === 'granted') {
          setSuccessMessage('Browser notification permissions granted. Reminders will display on schedule.');
        } else if (perm === 'denied') {
          setErrorMessage('Browser notification permissions were denied. Reminders will fallback to in-app banners.');
        }
      } catch {
        // Fallback
      }
    }
  };

  // Form State for Adding / Editing
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [strength, setStrength] = useState('');
  const [dosage, setDosage] = useState('');
  const [route, setRoute] = useState<MedicationRoute>('Oral');
  const [frequency, setFrequency] = useState('Once daily');
  const [timing, setTiming] = useState('Morning (08:00 AM)');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [prescribingClinician, setPrescribingClinician] = useState('Dr. Sarah Chen, MD');
  const [prescriptionInstructions, setPrescriptionInstructions] = useState('');
  const [indication, setIndication] = useState('');
  const [foodNotes, setFoodNotes] = useState('Take with a full glass of water.');
  const [notes, setNotes] = useState('');
  const [sourceType, setSourceType] = useState<MedicationItem['sourceType']>('patient_entered');
  const [sourceDocumentRef, setSourceDocumentRef] = useState('Patient Intake Portal');
  const [reminderTimes, setReminderTimes] = useState<string[]>(['08:00']);
  const [newTimeInput, setNewTimeInput] = useState('08:00');
  const [reminderTimezone, setReminderTimezone] = useState(
    Intl?.DateTimeFormat?.().resolvedOptions?.().timeZone || 'Asia/Kolkata'
  );
  const [maskNotificationPreview, setMaskNotificationPreview] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Dose Action Handlers
  const handleLogDose = (medId: string, status: DoseLogStatus, snoozedMinutes?: number) => {
    const med = clinicalStore.getMedicationById(medId);
    if (!med) return;

    clinicalStore.logDose(medId, status, med.reminders.times[0] || '08:00', undefined, snoozedMinutes);
    if (status === 'taken') {
      setSuccessMessage(`Dose marked as taken for ${med.name}. Logged in adherence history.`);
    } else if (status === 'snoozed') {
      setSuccessMessage(`Reminder snoozed for ${snoozedMinutes || 15} minutes.`);
    } else if (status === 'missed') {
      setSuccessMessage(`Dose logged as missed for ${med.name}. Note: Treatment remains active.`);
    }
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Reminder Toggle Handler
  const handleToggleReminderPause = (medId: string) => {
    const med = clinicalStore.getMedicationById(medId);
    if (!med) return;

    if (med.reminders.paused) {
      clinicalStore.resumeReminders(medId);
      setSuccessMessage(`Reminders resumed for ${med.name}.`);
    } else {
      clinicalStore.pauseReminders(medId);
      setSuccessMessage(`Reminders paused for ${med.name}. Active therapy status remains unchanged.`);
    }
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Confirm Ambiguous Prescription
  const handleConfirmMedication = (medId: string) => {
    const med = clinicalStore.getMedicationById(medId);
    if (!med) return;

    clinicalStore.confirmMedication(medId, `Verified with ${user?.name || 'Patient'} & Clinician`);
    setSuccessMessage(`Medication ${med.name} confirmed. Schedule activated.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Discontinue Medication
  const handleDiscontinue = (medId: string) => {
    const reason = window.prompt(
      'Please enter the clinical reason for discontinuing this medication (e.g. Course completed, switched therapy by Dr. Chen):'
    );
    if (!reason || !reason.trim()) return;

    clinicalStore.discontinueMedication(medId, reason.trim(), user?.name || 'Patient');
    setSuccessMessage('Medication marked as discontinued with recorded clinical rationale.');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Add Reminder Time Slot
  const handleAddReminderTime = () => {
    const result = addReminderTime(reminderTimes, newTimeInput);
    if (result.error) {
      setFormError(result.error);
    } else {
      setReminderTimes(result.times);
      setFormError(null);
    }
  };

  const handleRemoveReminderTime = (timeToRemove: string) => {
    setReminderTimes(reminderTimes.filter((t) => t !== timeToRemove));
  };

  // Save Modal Form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Strict Dosage Validation
    const dosageValidation = validateDosageInput(dosage);
    if (!dosageValidation.isValid) {
      setFormError(dosageValidation.error || 'Invalid dosage representation.');
      return;
    }

    if (!name.trim()) {
      setFormError('Medication name is required.');
      return;
    }

    if (editingMedId) {
      // Update existing
      clinicalStore.updateMedication(editingMedId, {
        name: name.trim(),
        strength: strength.trim() || dosage.trim(),
        dosage: dosage.trim(),
        route,
        frequency,
        timing,
        startDate,
        endDate: endDate.trim() ? endDate.trim() : undefined,
        prescribingClinician: prescribingClinician.trim(),
        prescriptionInstructions: prescriptionInstructions.trim(),
        indication: indication.trim(),
        foodNotes: foodNotes.trim(),
        notes: notes.trim(),
        sourceType,
        sourceDocumentRef: sourceDocumentRef.trim(),
        reminders: {
          enabled: reminderTimes.length > 0,
          paused: false,
          times: reminderTimes,
          timezone: reminderTimezone,
          repeatSchedule: 'daily',
          maskNotificationPreview
        }
      });
      setSuccessMessage(`Updated regimen parameters for ${name}.`);
    } else {
      // Create new
      clinicalStore.addMedication({
        patientId: userId,
        name: name.trim(),
        strength: strength.trim() || dosage.trim(),
        dosage: dosage.trim(),
        route,
        frequency,
        timing,
        startDate,
        endDate: endDate.trim() ? endDate.trim() : undefined,
        prescribingClinician: prescribingClinician.trim() || 'Patient Self-Managed',
        prescriptionInstructions: prescriptionInstructions.trim() || 'Take as directed.',
        indication: indication.trim() || 'Maintenance Regimen',
        prescribingContext: 'Patient-Entered Regimen',
        foodNotes: foodNotes.trim() || 'Take with water.',
        notes: notes.trim(),
        sourceType,
        sourceDocumentRef: sourceDocumentRef.trim() || 'Patient Intake Portal',
        requiresConfirmation: false,
        status: 'active',
        reminders: {
          enabled: reminderTimes.length > 0,
          paused: false,
          times: reminderTimes,
          timezone: reminderTimezone,
          repeatSchedule: 'daily',
          maskNotificationPreview
        }
      });
      setSuccessMessage(`Added ${name} to your verified medication schedule.`);
    }

    setIsAddModalOpen(false);
    resetForm();
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const resetForm = () => {
    setEditingMedId(null);
    setName('');
    setStrength('');
    setDosage('');
    setRoute('Oral');
    setFrequency('Once daily');
    setTiming('Morning (08:00 AM)');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setPrescribingClinician('Dr. Sarah Chen, MD');
    setPrescriptionInstructions('');
    setIndication('');
    setFoodNotes('Take with a full glass of water.');
    setNotes('');
    setSourceType('patient_entered');
    setSourceDocumentRef('Patient Intake Portal');
    setReminderTimes(['08:00']);
    setMaskNotificationPreview(false);
    setFormError(null);
  };

  const openEditModal = (med: MedicationItem) => {
    setEditingMedId(med.id);
    setName(med.name);
    setStrength(med.strength || '');
    setDosage(med.dosage);
    setRoute(med.route || 'Oral');
    setFrequency(med.frequency);
    setTiming(med.timing);
    setStartDate(med.startDate);
    setEndDate(med.endDate || '');
    setPrescribingClinician(med.prescribingClinician || '');
    setPrescriptionInstructions(med.prescriptionInstructions || '');
    setIndication(med.indication);
    setFoodNotes(med.foodNotes);
    setNotes(med.notes || '');
    setSourceType(med.sourceType);
    setSourceDocumentRef(med.sourceDocumentRef || '');
    setReminderTimes(med.reminders.times || ['08:00']);
    setReminderTimezone(med.reminders.timezone || 'Asia/Kolkata');
    setMaskNotificationPreview(med.reminders.maskNotificationPreview || false);
    setIsAddModalOpen(true);
  };

  // Filtered views
  const activeMedications = medications.filter((m) => m.status === 'active' || m.status === 'paused');
  const pastMedications = medications.filter((m) => m.status === 'discontinued' || m.status === 'completed');
  const unconfirmedMedications = medications.filter((m) => m.requiresConfirmation);
  const interactionReport: DrugInteractionCheckResult = clinicalStore.checkDrugInteractions(medications);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-purple-700 dark:text-purple-400">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
            <span>Pharmacotherapy Intelligence · Patient Portal</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
            Prescription & Medication Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Track active regimens, configure multi-timezone reminders, review verbatim prescription instructions, inspect change histories, and screen for known drug-drug interactions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medication</span>
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs text-rose-900 dark:text-rose-200 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-700 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'active'
              ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Pill className="w-3.5 h-3.5" />
          <span>Active Regimens ({activeMedications.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reminders')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'reminders'
              ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Reminders & Timezones</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('unconfirmed')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'unconfirmed'
              ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>Unconfirmed Prescriptions ({unconfirmedMedications.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Past Medications & Changes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('interactions')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'interactions'
              ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          <span>Interaction Screen ({interactionReport.interactions.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ACTIVE REGIMENS & ADHERENCE */}
      {/* ========================================================================= */}
      {activeTab === 'active' && (
        <div className="space-y-6">
          {/* Clinical Non-Prescribing Notice */}
          <div className="p-4 bg-purple-50/70 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 flex items-start gap-3">
            <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Patient Medication Tracking Safeguard:</span>
              <p className="leading-relaxed">
                This portal is a patient tracking and reminder assistant, <strong>not an autonomous prescribing system</strong>. Never alter, pause, or stop prescribed treatments without consulting your prescribing doctor.
              </p>
            </div>
          </div>

          {activeMedications.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs space-y-2">
              <Pill className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-bold text-slate-700 dark:text-slate-300">No Active Medications Documented</p>
              <p>Click "Add Medication" above to record a prescribed therapy or self-managed supplement.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeMedications.map((med) => {
                const latestLog = med.doseLogs[0];
                const isTakenRecently = latestLog && latestLog.status === 'taken';

                return (
                  <div
                    key={med.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between gap-5 transition-colors"
                  >
                    <div className="space-y-3.5">
                      {/* Header with Badges */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-black text-slate-900 dark:text-white text-base">
                              {med.name}
                            </h3>
                            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              {med.dosage}
                            </span>
                            {med.route && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {med.route}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Indication: {med.indication}
                          </p>
                        </div>

                        {/* Provenance Tag */}
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full ${
                              med.sourceType === 'clinician_verified'
                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                : med.sourceType === 'extracted_from_prescription'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            }`}
                          >
                            {med.sourceType === 'clinician_verified'
                              ? '[Clinician Verified]'
                              : med.sourceType === 'extracted_from_prescription'
                              ? '[Rx Extracted]'
                              : '[Patient-Entered]'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Status: {med.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Verbatim SIG & Direction */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                          <span>PRESCRIPTION INSTRUCTIONS (SIG)</span>
                          <span>Ref: {med.sourceDocumentRef || 'Rx'}</span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                          "{med.prescriptionInstructions || 'Take as directed by doctor.'}"
                        </p>
                        {med.foodNotes && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                            Dietary Note: {med.foodNotes}
                          </p>
                        )}
                      </div>

                      {/* Clinician-Approved Patient-Friendly Instructions */}
                      {med.patientFriendlyInstructions && (
                        <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/40 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-mono font-semibold">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                            <span>CLINICIAN-APPROVED INSTRUCTIONS FOR YOU</span>
                          </div>
                          <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                            {med.patientFriendlyInstructions}
                          </p>
                        </div>
                      )}

                      {/* Metadata Grid */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-400 pt-1">
                        <div>
                          <span className="text-slate-400 block text-[10px]">PRESCRIBED BY</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                            {med.prescribingClinician}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">START DATE</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">
                            {med.startDate} {med.endDate ? `to ${med.endDate}` : '(Ongoing)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Adherence Checkpoints & Action Buttons */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {latestLog
                              ? `Last logged: ${latestLog.status.toUpperCase()} (${new Date(latestLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
                              : 'No dose logged today'}
                          </span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          {/* Mark Taken Button */}
                          <button
                            type="button"
                            onClick={() => handleLogDose(med.id, 'taken')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              isTakenRecently
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isTakenRecently ? 'Taken ✓' : 'Mark Taken'}</span>
                          </button>

                          {/* Snooze Button */}
                          <button
                            type="button"
                            onClick={() => handleLogDose(med.id, 'snoozed', 30)}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
                            title="Snooze reminder by 30 minutes"
                          >
                            Snooze 30m
                          </button>

                          {/* Mark Missed Button */}
                          <button
                            type="button"
                            onClick={() => handleLogDose(med.id, 'missed')}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors cursor-pointer border border-rose-200 dark:border-rose-900"
                            title="Log as missed without stopping treatment"
                          >
                            Missed
                          </button>
                        </div>
                      </div>

                      {/* Bottom utility controls */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <button
                          type="button"
                          onClick={() => handleToggleReminderPause(med.id)}
                          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          {med.reminders.paused ? (
                            <>
                              <Play className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-bold">Resume Reminders</span>
                            </>
                          ) : (
                            <>
                              <Pause className="w-3 h-3" />
                              <span>Pause Reminders</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(med)}
                            className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDiscontinue(med.id)}
                            className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                            <span>Discontinue</span>
                          </button>
                        </div>
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
      {/* TAB 2: REMINDERS & TIMEZONE CONFIGURATION */}
      {/* ========================================================================= */}
      {activeTab === 'reminders' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Reminder Schedules & Notification Privacy</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure patient timezones, scheduled dose times, lock-screen notification privacy masking, and browser notification permissions.
              </p>
            </div>

            {/* Notification Permission Indicator */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 ${
                notificationPermission === 'granted'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  : notificationPermission === 'denied'
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
              }`}>
                {notificationPermission === 'granted' ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                <span>Browser Notifications: {notificationPermission.toUpperCase()}</span>
              </span>

              {notificationPermission !== 'granted' && (
                <button
                  type="button"
                  onClick={handleRequestNotificationPermission}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Enable
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {activeMedications.map((med) => (
              <div
                key={med.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{med.name}</span>
                    <span className="text-xs font-mono text-purple-700 dark:text-purple-300 font-bold">
                      {med.dosage}
                    </span>
                    {med.reminders.paused && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        REMINDERS PAUSED
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 flex-wrap">
                    <span><strong>Times:</strong> {med.reminders.times.join(', ') || 'No scheduled times'}</span>
                    <span>•</span>
                    <span><strong>Timezone:</strong> {med.reminders.timezone}</span>
                    <span>•</span>
                    <span><strong>Schedule:</strong> {med.reminders.repeatSchedule}</span>
                    <span>•</span>
                    <span>
                      <strong>Lock-screen Masking:</strong>{' '}
                      {med.reminders.maskNotificationPreview ? 'Enabled (Drug Name Hidden)' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      clinicalStore.updateReminderConfig(med.id, {
                        maskNotificationPreview: !med.reminders.maskNotificationPreview
                      });
                      setSuccessMessage(
                        `Privacy masking ${!med.reminders.maskNotificationPreview ? 'enabled' : 'disabled'} for ${med.name}.`
                      );
                      setTimeout(() => setSuccessMessage(null), 3000);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 transition-colors cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 inline mr-1" />
                    <span>{med.reminders.maskNotificationPreview ? 'Unmask Preview' : 'Mask Preview'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(med)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                  >
                    Adjust Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: UNCONFIRMED & AMBIGUOUS PRESCRIPTIONS */}
      {/* ========================================================================= */}
      {activeTab === 'unconfirmed' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Prescriptions Requiring Clinician Confirmation</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                When prescription records contain ambiguous handwriting, unclear SIG directions, or missing units, Medical AI avoids guessing and flags them for physician verification.
              </p>
            </div>
          </div>

          {unconfirmedMedications.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-200 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="font-bold text-sm">All Prescriptions Verified</p>
              <p>No ambiguous or unconfirmed medication records detected in your portal.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {unconfirmedMedications.map((med) => (
                <div
                  key={med.id}
                  className="p-5 rounded-2xl border-2 border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-black text-slate-900 dark:text-white text-base block">
                        {med.name}
                      </span>
                      <span className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                        Source: {med.sourceDocumentRef || 'Prescription Ingestion'}
                      </span>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 self-start sm:self-auto">
                      CONFIRMATION REQUIRED
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900/60 text-xs space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white block">Ambiguity Notice:</span>
                    <p className="text-amber-900 dark:text-amber-200 leading-relaxed">
                      {med.confirmationNotes || 'Prescription directions are uncertain. Please verify exact dosage and frequency with your doctor.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(med)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    >
                      Inspect / Edit Details
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfirmMedication(med.id)}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                    >
                      Confirm Verified with Doctor
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PAST MEDICATIONS & CHANGE AUDIT TRAIL */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600" />
                <span>Past Medications & Discontinued Therapies</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Completed antimicrobial courses and discontinued regimens with recorded rationale.
              </p>
            </div>

            {pastMedications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No past or discontinued medications recorded.</div>
            ) : (
              <div className="space-y-3">
                {pastMedications.map((med) => (
                  <div
                    key={med.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{med.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {med.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                      Duration: {med.startDate} {med.endDate ? `to ${med.endDate}` : ''} · Prescribed by: {med.prescribingClinician}
                    </div>
                    {med.discontinuationReason && (
                      <p className="text-slate-500 dark:text-slate-400 italic">
                        Discontinuation Rationale: {med.discontinuationReason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit Change Logs across all medications */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4 transition-colors">
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-700 dark:text-slate-300">
              Medication Change Audit Trail (Chronological):
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden font-mono text-[11px]">
              {medications
                .flatMap((m) => (m.changeLog || []).map((c) => ({ ...c, medName: m.name })))
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white mr-2">[{log.medName}]</span>
                      <span className="text-purple-700 dark:text-purple-300 font-bold mr-2">{log.action}:</span>
                      <span className="text-slate-700 dark:text-slate-300">{log.rationale || 'Updated'}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 shrink-0">
                      {new Date(log.timestamp).toLocaleDateString()} by {log.changedBy}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: DRUG INTERACTION SCREEN */}
      {/* ========================================================================= */}
      {activeTab === 'interactions' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-rose-700 dark:text-rose-400">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Drug-Drug Interaction Analysis</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
              Active Regimen Interaction Screening
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Source: {interactionReport.dataSource}
            </p>
          </div>

          {/* Mandatory Non-Prescribing Safety Disclaimer */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <span className="font-bold block uppercase font-mono tracking-wider">
              Safety Scope & Clinical Limitations Notice:
            </span>
            <p className="leading-relaxed">
              {interactionReport.disclaimer}
            </p>
          </div>

          {interactionReport.interactions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-200 space-y-1.5">
              <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="font-bold text-sm">No Hazardous Drug-Drug Interactions Detected</p>
              <p>Your current active regimen has been screened against reference monograph databases.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {interactionReport.interactions.map((inter) => (
                <div
                  key={inter.id}
                  className="p-5 rounded-2xl border border-rose-300 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-900 dark:text-rose-200 text-sm">
                      {inter.drugA} ⟷ {inter.drugB}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 uppercase">
                      {inter.severity} Risk
                    </span>
                  </div>
                  <p className="text-rose-950 dark:text-rose-200 leading-relaxed font-medium">
                    {inter.description}
                  </p>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/60 text-slate-800 dark:text-slate-200">
                    <strong>Suggested Clinical Management:</strong> {inter.clinicalManagement}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT MEDICATION MODAL */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingMedId ? 'Edit Medication Regimen' : 'Record New Medication'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-900 dark:text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              {/* Row 1: Name & Route */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Medication Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Lisinopril"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Administration Route</label>
                  <select
                    value={route}
                    onChange={(e) => setRoute(e.target.value as MedicationRoute)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="Oral">Oral</option>
                    <option value="Sublingual">Sublingual</option>
                    <option value="Inhalation">Inhalation</option>
                    <option value="Topical">Topical</option>
                    <option value="Subcutaneous">Subcutaneous</option>
                    <option value="Intravenous">Intravenous</option>
                    <option value="Ophthalmic">Ophthalmic</option>
                    <option value="Otic">Otic</option>
                    <option value="Transdermal">Transdermal</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Dosage & Strength */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Dosage & Unit * (e.g. 10 mg, 500 mg, 2000 IU)
                  </label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. 10 mg"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily (BID)">Twice daily (BID)</option>
                    <option value="Three times daily (TID)">Three times daily (TID)</option>
                    <option value="Four times daily (QID)">Four times daily (QID)</option>
                    <option value="Every 8 hours">Every 8 hours</option>
                    <option value="As needed (PRN)">As needed (PRN)</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Prescribing Clinician & Verbatim SIG */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Exact Prescription Instructions (SIG)
                </label>
                <textarea
                  rows={2}
                  value={prescriptionInstructions}
                  onChange={(e) => setPrescriptionInstructions(e.target.value)}
                  placeholder="e.g. Take 1 tablet by mouth daily in morning with water."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              {/* Row 4: Dates & Prescriber */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">End Date (Optional)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Prescribing Clinician</label>
                  <input
                    type="text"
                    value={prescribingClinician}
                    onChange={(e) => setPrescribingClinician(e.target.value)}
                    placeholder="e.g. Dr. Sarah Chen, MD"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 5: Provenance Classification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Source Provenance</label>
                  <select
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value as MedicationItem['sourceType'])}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="patient_entered">Patient-Entered (Self-Report)</option>
                    <option value="extracted_from_prescription">Extracted from Prescription</option>
                    <option value="clinician_verified">Clinician Verified</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Source Document / Rx Ref</label>
                  <input
                    type="text"
                    value={sourceDocumentRef}
                    onChange={(e) => setSourceDocumentRef(e.target.value)}
                    placeholder="e.g. Prescription Rx-80429-01"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Reminder Times & Timezone Section */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Reminder Times ({reminderTimes.length})</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Timezone: {reminderTimezone}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {reminderTimes.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 font-mono text-xs flex items-center gap-1.5 text-slate-800 dark:text-slate-200"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveReminderTime(t)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="time"
                    value={newTimeInput}
                    onChange={(e) => setNewTimeInput(e.target.value)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 font-mono text-xs text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddReminderTime}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Add Dose Time
                  </button>
                </div>

                <label className="pt-2 flex items-center gap-2 cursor-pointer select-none text-[11px] text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={maskNotificationPreview}
                    onChange={(e) => setMaskNotificationPreview(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Mask medication name in lock-screen preview (Privacy Protection)</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors cursor-pointer shadow-xs"
                >
                  {editingMedId ? 'Save Changes' : 'Save Regimen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
