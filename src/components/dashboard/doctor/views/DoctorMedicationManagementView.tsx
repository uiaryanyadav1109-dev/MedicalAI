import React, { useState, useEffect } from 'react';
import {
  RoutePath,
  MedicationItem,
  MedicationOrder,
  MedicationRoute,
  MedicationAllergyWarning,
  MedicationDrugInteractionWarning,
  PatientRecord
} from '../../../../types';
import { clinicalStore } from '../../../../services/clinicalStore';
import { useAuth } from '../../../../context/AuthContext';
import {
  Pill,
  Plus,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Search,
  Clock,
  Calendar,
  FileText,
  FileCheck,
  User,
  ExternalLink,
  ChevronRight,
  Edit2,
  Trash2,
  X,
  History,
  RotateCw,
  Info,
  Check,
  Send,
  Sparkles,
  Lock,
  Layers,
  ArrowUpRight,
  Flame,
  Activity,
  HeartHandshake
} from 'lucide-react';

interface DoctorMedicationManagementViewProps {
  onNavigate: (route: RoutePath) => void;
  selectedPatientId?: string;
}

type ActiveTab = 'regimens' | 'orders' | 'interactions';

export const DoctorMedicationManagementView: React.FC<DoctorMedicationManagementViewProps> = ({
  onNavigate,
  selectedPatientId: initialPatientId = 'pat-1'
}) => {
  const { user } = useAuth();
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId);
  const [activeTab, setActiveTab] = useState<ActiveTab>('regimens');

  // Local state subscribed to clinicalStore
  const [patients, setPatients] = useState<PatientRecord[]>(clinicalStore.getPatients());
  const [medications, setMedications] = useState<MedicationItem[]>(clinicalStore.getMedications(selectedPatientId));
  const [orders, setOrders] = useState<MedicationOrder[]>(clinicalStore.getMedicationOrders(selectedPatientId));

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [isAuthorizeModalOpen, setIsAuthorizeModalOpen] = useState(false);
  const [isAmendModalOpen, setIsAmendModalOpen] = useState(false);
  const [isDiscontinueModalOpen, setIsDiscontinueModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Selected Order / Medication for action
  const [selectedOrder, setSelectedOrder] = useState<MedicationOrder | null>(null);
  const [selectedMedication, setSelectedMedication] = useState<MedicationItem | null>(null);

  // Form state for drafting order
  const [draftOrderType, setDraftOrderType] = useState<'new' | 'change' | 'discontinue'>('new');
  const [draftMedName, setDraftMedName] = useState('');
  const [draftStrength, setDraftStrength] = useState('');
  const [draftDosage, setDraftDosage] = useState('');
  const [draftRoute, setDraftRoute] = useState<MedicationRoute>('Oral');
  const [draftFrequency, setDraftFrequency] = useState('Once daily');
  const [draftDuration, setDraftDuration] = useState('30 days');
  const [draftInstructions, setDraftInstructions] = useState('');
  const [draftIndication, setDraftIndication] = useState('');
  const [draftFoodNotes, setDraftFoodNotes] = useState('');
  const [formValidationErrors, setFormValidationErrors] = useState<string[]>([]);

  // Live Safety check state
  const [liveSafetyCheck, setLiveSafetyCheck] = useState<{
    allergyWarnings: MedicationAllergyWarning[];
    interactionWarnings: MedicationDrugInteractionWarning[];
    knownAllergies: string[];
    dataSource: string;
    safetyDisclaimer: string;
  } | null>(null);
  const [isScreeningSafety, setIsScreeningSafety] = useState(false);

  // Form state for authorizing order
  const [authorizingNpi, setAuthorizingNpi] = useState('1942850192');
  const [authorizingClinician, setAuthorizingClinician] = useState('Dr. Sarah Chen, MD');
  const [authorizeNotes, setAuthorizeNotes] = useState('');
  const [attestationChecked, setAttestationChecked] = useState(false);

  // Form state for amending order
  const [amendReason, setAmendReason] = useState('');

  // Form state for discontinuing medication
  const [discontinueReason, setDiscontinueReason] = useState('');

  // Notification banners
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Subscribe to clinicalStore updates
  useEffect(() => {
    const unsub = clinicalStore.subscribe(() => {
      setPatients(clinicalStore.getPatients());
      setMedications(clinicalStore.getMedications(selectedPatientId));
      setOrders(clinicalStore.getMedicationOrders(selectedPatientId));
    });
    return unsub;
  }, [selectedPatientId]);

  // Load from server on mount / patient change
  useEffect(() => {
    clinicalStore.fetchMedications(selectedPatientId);
    clinicalStore.fetchMedicationOrders(selectedPatientId);
  }, [selectedPatientId]);

  // Active Patient Record & Allergies
  const currentPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const patientAllergies = currentPatient?.allergies || ['Penicillin (Moderate)', 'Sulfa Drugs (Moderate)'];

  // Trigger safety check whenever draft medication name changes
  useEffect(() => {
    if (!draftMedName || draftMedName.trim().length < 3) {
      setLiveSafetyCheck(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsScreeningSafety(true);
      try {
        const res = await clinicalStore.screenMedicationSafety(selectedPatientId, draftMedName, draftRoute);
        if (res.success && res.safety) {
          setLiveSafetyCheck(res.safety);
        }
      } catch (err) {
        console.warn('Safety check error:', err);
      } finally {
        setIsScreeningSafety(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [draftMedName, draftRoute, selectedPatientId]);

  // Filtered Medications
  const filteredMedications = medications.filter((m) => {
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.indication.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.prescribingClinician?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    const matchesSearch =
      searchQuery === '' ||
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.instructions.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Comprehensive safety check for all current active medications
  const globalSafetyCheck = clinicalStore.checkDrugInteractions(medications);

  // Submit Draft Order
  const handleCreateDraftOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormValidationErrors([]);
    setActionError(null);

    const errors: string[] = [];
    if (!draftMedName.trim()) errors.push('Medication name is required.');
    if (!draftDosage.trim()) errors.push('Dosage (e.g. 1 tablet, 500 mg) is required.');
    if (!draftFrequency.trim()) errors.push('Frequency (e.g. Once daily) is required.');
    if (!draftInstructions.trim()) errors.push('Prescription instructions (SIG) are required.');

    if (errors.length > 0) {
      setFormValidationErrors(errors);
      return;
    }

    const payload = {
      patientId: selectedPatientId,
      patientName: currentPatient?.name,
      mrn: currentPatient?.mrn,
      orderType: draftOrderType,
      medicationId: selectedMedication?.id,
      name: draftMedName.trim(),
      strength: draftStrength.trim() || draftDosage.trim(),
      dosage: draftDosage.trim(),
      route: draftRoute,
      frequency: draftFrequency.trim(),
      duration: draftDuration.trim() || 'Ongoing / Chronic',
      instructions: draftInstructions.trim(),
      indication: draftIndication.trim() || 'Clinical Therapy',
      foodNotes: draftFoodNotes.trim(),
      prescriberName: user?.name || 'Dr. Sarah Chen, MD',
      prescriberNpi: '1942850192',
      prescriberRole: 'Attending Physician'
    };

    const res = await clinicalStore.createMedicationOrder(payload);
    if (res.success && res.order) {
      setActionSuccess(`Medication order draft #${res.order.id} initiated for ${res.order.name}. Awaiting clinician sign-off.`);
      setIsDraftModalOpen(false);
      resetDraftForm();
      setTimeout(() => setActionSuccess(null), 6000);
    } else {
      setActionError(res.error || 'Failed to create medication order draft.');
    }
  };

  // Authorize Order
  const handleAuthorizeOrder = async () => {
    if (!selectedOrder) return;
    if (!attestationChecked) {
      setActionError('Attending physician certification acknowledgement is required.');
      return;
    }

    const res = await clinicalStore.authorizeMedicationOrder(selectedOrder.id, authorizeNotes);
    if (res.success && res.order) {
      setActionSuccess(
        `Medication order #${selectedOrder.id} authorized by ${authorizingClinician} (NPI: ${authorizingNpi}). Regimen synchronized with Patient Portal & Android app.`
      );
      setIsAuthorizeModalOpen(false);
      setSelectedOrder(null);
      setAttestationChecked(false);
      setAuthorizeNotes('');
      setTimeout(() => setActionSuccess(null), 6000);
    } else {
      setActionError(res.error || 'Failed to authorize medication order.');
    }
  };

  // Amend Order
  const handleAmendOrder = async () => {
    if (!selectedOrder) return;
    if (!amendReason.trim()) {
      setActionError('Documentation of clinical rationale for amendment is required.');
      return;
    }

    const res = await clinicalStore.amendMedicationOrder(
      selectedOrder.id,
      {
        dosage: draftDosage || selectedOrder.dosage,
        frequency: draftFrequency || selectedOrder.frequency,
        instructions: draftInstructions || selectedOrder.instructions,
        duration: draftDuration || selectedOrder.duration
      },
      amendReason
    );

    if (res.success && res.order) {
      setActionSuccess(`Medication order #${selectedOrder.id} amended successfully.`);
      setIsAmendModalOpen(false);
      setSelectedOrder(null);
      setAmendReason('');
      setTimeout(() => setActionSuccess(null), 5000);
    } else {
      setActionError(res.error || 'Failed to amend medication order.');
    }
  };

  // Cancel Order
  const handleCancelOrder = async (orderId: string, reason: string) => {
    const res = await clinicalStore.cancelMedicationOrder(orderId, reason);
    if (res.success) {
      setActionSuccess(`Medication order #${orderId} draft cancelled.`);
      setTimeout(() => setActionSuccess(null), 5000);
    } else {
      setActionError(res.error || 'Failed to cancel order.');
    }
  };

  // Discontinue Medication
  const handleDiscontinueMedication = async () => {
    if (!selectedMedication) return;
    if (!discontinueReason.trim()) {
      setActionError('Documentation of clinical rationale for discontinuation is required.');
      return;
    }

    const success = clinicalStore.discontinueMedication(
      selectedMedication.id,
      discontinueReason,
      `${user?.name || 'Dr. Sarah Chen, MD'} (NPI: 1942850192)`
    );

    if (success) {
      setActionSuccess(`Regimen '${selectedMedication.name}' marked discontinued.`);
      setIsDiscontinueModalOpen(false);
      setSelectedMedication(null);
      setDiscontinueReason('');
      setTimeout(() => setActionSuccess(null), 5000);
    } else {
      setActionError('Failed to discontinue medication.');
    }
  };

  const resetDraftForm = () => {
    setDraftMedName('');
    setDraftStrength('');
    setDraftDosage('');
    setDraftRoute('Oral');
    setDraftFrequency('Once daily');
    setDraftDuration('30 days');
    setDraftInstructions('');
    setDraftIndication('');
    setDraftFoodNotes('');
    setFormValidationErrors([]);
    setLiveSafetyCheck(null);
    setSelectedMedication(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Module Header & Patient Context Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono tracking-tight">
                  MEDICATION MANAGEMENT & CLINICAL ORDERS
                </h1>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                  AUDITED EHR
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Regimen reconciliation, allergy contraindication screening, verified drug interaction monographs, and certified attending physician order workflows.
              </p>
            </div>
          </div>

          {/* Patient Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-mono text-slate-400">PATIENT:</span>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id} className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {p.name} ({p.mrn})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                resetDraftForm();
                setDraftOrderType('new');
                setIsDraftModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium font-mono shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>DRAFT NEW ORDER</span>
            </button>
          </div>
        </div>

        {/* 2. Prominent Patient Allergy & Warning Banner */}
        <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200 font-mono">
                  DOCUMENTED PATIENT ALLERGIES & ADVERSE SENSITIVITIES:
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                  {patientAllergies.length} RECORDED
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                {patientAllergies.map((allergy, i) => (
                  <span
                    key={i}
                    className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 font-semibold"
                  >
                    ⚠️ {allergy}
                  </span>
                ))}
                <span className="text-[11px] text-slate-500 italic ml-1">
                  (Beta-lactam and sulfonamide antimicrobial cross-reactivities automatically monitored)
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono text-right shrink-0">
            <span>MRN: <strong className="text-slate-200">{currentPatient?.mrn}</strong></span>
            <span className="mx-2">·</span>
            <span>Blood: <strong className="text-slate-200">{currentPatient?.bloodType || 'O+'}</strong></span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Top Telemetry Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => setActiveTab('regimens')}
          className={`bg-white dark:bg-slate-900 rounded-2xl border p-4 shadow-xs cursor-pointer transition-colors ${
            activeTab === 'regimens' ? 'border-cyan-500 dark:border-cyan-500' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium">ACTIVE REGIMENS</span>
            <Activity className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
            {medications.filter((m) => m.status === 'active').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{medications.length} total on file</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('orders')}
          className={`bg-white dark:bg-slate-900 rounded-2xl border p-4 shadow-xs cursor-pointer transition-colors ${
            activeTab === 'orders' ? 'border-purple-500 dark:border-purple-500' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 mb-2">
            <span className="text-xs font-mono font-medium">PENDING DRAFT ORDERS</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
            {orders.filter((o) => o.status === 'draft').length}
          </div>
          <div className="text-[11px] text-purple-400 mt-1 font-mono">
            Requires attending sign-off
          </div>
        </div>

        <div
          onClick={() => setActiveTab('interactions')}
          className={`bg-white dark:bg-slate-900 rounded-2xl border p-4 shadow-xs cursor-pointer transition-colors ${
            activeTab === 'interactions' ? 'border-amber-500 dark:border-amber-500' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
            <span className="text-xs font-mono font-medium">DRUG INTERACTIONS</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
            {globalSafetyCheck.interactions.length}
          </div>
          <div className="text-[11px] text-amber-400 mt-1 font-mono">
            {globalSafetyCheck.interactions.filter((i) => i.severity === 'critical').length} critical alerts
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium">MONOGRAPH SOURCE</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
            NIH NLM & FDA
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Curated Reference 2026
          </div>
        </div>
      </div>

      {/* 4. Tab Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('regimens')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'regimens'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>PATIENT REGIMENS ({medications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>MEDICATION ORDERS & DRAFTS ({orders.length})</span>
            {orders.filter((o) => o.status === 'draft').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('interactions')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'interactions'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>PHARMACOLOGICAL SCREENING ({globalSafetyCheck.interactions.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-64 hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medications or SIG..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: PATIENT REGIMENS (ACTIVE, PAUSED, DISCONTINUED)        */}
      {/* ============================================================ */}
      {activeTab === 'regimens' && (
        <div className="space-y-4">
          {/* Status Sub-filter Strip */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {['all', 'active', 'paused', 'discontinued'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`text-xs font-mono px-3 py-1.5 rounded-lg border uppercase transition-colors ${
                    statusFilter === st
                      ? 'bg-slate-800 text-slate-100 border-slate-600 font-bold'
                      : 'text-slate-400 border-transparent hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <span className="text-xs font-mono text-slate-500">
              Showing {filteredMedications.length} records
            </span>
          </div>

          {filteredMedications.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
              <Pill className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-300 font-mono">No medications found matching filter.</p>
              <p className="text-xs text-slate-500 mt-1">Initiate a medication order draft or clear filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredMedications.map((med) => {
                const isDiscontinued = med.status === 'discontinued';
                const isPaused = med.status === 'paused';

                return (
                  <div
                    key={med.id}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 transition-all shadow-xs ${
                      isDiscontinued
                        ? 'border-slate-200 dark:border-slate-800 opacity-75'
                        : isPaused
                        ? 'border-amber-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Med Info */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
                            {med.name}
                          </h3>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-semibold">
                            {med.strength || med.dosage}
                          </span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {med.route || 'Oral'}
                          </span>

                          {/* Status Badge */}
                          {med.status === 'active' && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              ACTIVE REGIMEN
                            </span>
                          )}
                          {med.status === 'paused' && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              PAUSED / UNCONFIRMED
                            </span>
                          )}
                          {med.status === 'discontinued' && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                              DISCONTINUED
                            </span>
                          )}
                        </div>

                        {/* Instructions (SIG) */}
                        <div className="text-xs text-slate-300 flex items-start gap-1.5 mt-1 font-mono">
                          <strong className="text-slate-400 font-semibold shrink-0">SIG:</strong>
                          <span>{med.prescriptionInstructions || 'Take as directed'}</span>
                        </div>

                        {/* Metadata row */}
                        <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono flex-wrap pt-1">
                          <span>Frequency: <strong className="text-slate-300">{med.frequency}</strong></span>
                          <span>Indication: <strong className="text-slate-300">{med.indication}</strong></span>
                          <span>Prescriber: <strong className="text-slate-300">{med.prescribingClinician || 'Attending Physician'}</strong></span>
                          <span>Started: <strong className="text-slate-300">{med.startDate}</strong></span>
                          {med.duration && (
                            <span>Duration: <strong className="text-slate-300">{med.duration}</strong></span>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {!isDiscontinued && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedMedication(med);
                                setDraftOrderType('change');
                                setDraftMedName(med.name);
                                setDraftStrength(med.strength || '');
                                setDraftDosage(med.dosage);
                                setDraftRoute(med.route || 'Oral');
                                setDraftFrequency(med.frequency);
                                setDraftInstructions(med.prescriptionInstructions || '');
                                setDraftIndication(med.indication);
                                setDraftFoodNotes(med.foodNotes || '');
                                setIsDraftModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 flex items-center gap-1.5 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>MODIFY</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedMedication(med);
                                setIsDiscontinueModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-mono border border-rose-500/30 flex items-center gap-1.5 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>DISCONTINUE</span>
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => {
                            setSelectedMedication(med);
                            setIsAuditModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-mono border border-slate-700 flex items-center gap-1.5 transition-colors"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>AUDIT</span>
                        </button>
                      </div>
                    </div>

                    {/* Patient-Friendly Instructions Preview Banner */}
                    <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-start gap-2 text-xs">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-mono text-emerald-400 font-semibold">PATIENT-FRIENDLY INSTRUCTIONS: </span>
                        <span className="text-slate-300 font-sans">
                          {med.patientFriendlyInstructions ||
                            `Take ${med.dosage} by ${med.route || 'oral'} route ${med.frequency.toLowerCase()} with water as prescribed. Follow all dietary recommendations.`}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 ml-2">
                          (Clinician Certified · Synced with Patient App)
                        </span>
                      </div>
                    </div>

                    {/* Discontinuation Notice if applicable */}
                    {isDiscontinued && med.discontinuationReason && (
                      <div className="mt-3 p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40 text-xs font-mono text-rose-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>Discontinued on {med.discontinuedDate}: {med.discontinuationReason}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: MEDICATION ORDERS & DRAFTS (CLINICIAN CERTIFICATION)  */}
      {/* ============================================================ */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {['all', 'draft', 'authorized', 'cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`text-xs font-mono px-3 py-1.5 rounded-lg border uppercase transition-colors ${
                    orderStatusFilter === st
                      ? 'bg-slate-800 text-slate-100 border-slate-600 font-bold'
                      : 'text-slate-400 border-transparent hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="text-xs font-mono text-slate-500 flex items-center gap-2">
              <span className="text-amber-400">⚠️ Draft Orders Require Attending Sign-Off</span>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
              <FileCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-300 font-mono">No medication orders found.</p>
              <button
                onClick={() => {
                  resetDraftForm();
                  setIsDraftModalOpen(true);
                }}
                className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Order Draft</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((ord) => {
                const isDraft = ord.status === 'draft';
                const isAuthorized = ord.status === 'authorized';
                const isCancelled = ord.status === 'cancelled';

                return (
                  <div
                    key={ord.id}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-xs transition-all ${
                      isDraft
                        ? 'border-purple-500/40 bg-purple-950/5'
                        : isAuthorized
                        ? 'border-emerald-500/30'
                        : 'border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Order Details */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-slate-400">#{ord.id}</span>
                          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
                            {ord.name}
                          </h3>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                            {ord.strength || ord.dosage}
                          </span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {ord.route}
                          </span>

                          {/* Order Status Badge */}
                          {isDraft && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold flex items-center gap-1 animate-pulse">
                              <Clock className="w-3 h-3 text-purple-400" />
                              DRAFT · PENDING SIGN-OFF
                            </span>
                          )}
                          {isAuthorized && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              AUTHORIZED & COMMITTED
                            </span>
                          )}
                          {isCancelled && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                              CANCELLED
                            </span>
                          )}

                          {/* Transmission Badge */}
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {ord.transmissionStatus === 'draft_only'
                              ? 'DRAFT (NOT TRANSMITTED)'
                              : 'LOCAL EHR UPDATED'}
                          </span>
                        </div>

                        {/* Prescriber Instructions (SIG) */}
                        <div className="text-xs text-slate-200 font-mono flex items-start gap-1.5">
                          <strong className="text-slate-400">PRESCRIBER SIG:</strong>
                          <span>{ord.instructions}</span>
                        </div>

                        {/* Patient-Friendly Instructions (Gate check) */}
                        <div className="text-xs font-mono flex items-start gap-1.5 pt-1">
                          <strong className="text-slate-400">PATIENT INSTRUCTIONS:</strong>
                          {isAuthorized ? (
                            <span className="text-emerald-300 font-sans">
                              {ord.patientFriendlyInstructions}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">
                              🔒 Locked: Patient-friendly instructions unlock and publish to mobile app only after clinician authorization.
                            </span>
                          )}
                        </div>

                        {/* Order Metadata */}
                        <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono flex-wrap pt-1">
                          <span>Prescriber: <strong className="text-slate-300">{ord.prescriberName}</strong></span>
                          <span>Duration: <strong className="text-slate-300">{ord.duration}</strong></span>
                          <span>Created: <strong className="text-slate-300">{ord.createdAt}</strong></span>
                          {ord.authorizedBy && (
                            <span>Authorized By: <strong className="text-emerald-400">{ord.authorizedBy} (NPI: {ord.authorizedNpi})</strong></span>
                          )}
                        </div>

                        {/* Allergy Warnings on Order */}
                        {ord.allergyWarnings && ord.allergyWarnings.length > 0 && (
                          <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-800/40 space-y-1">
                            {ord.allergyWarnings.map((w, wi) => (
                              <div key={wi} className="text-xs font-mono text-rose-300 flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                <span>{w.message}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Cancellation Reason */}
                        {isCancelled && ord.statusReason && (
                          <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-800/40 text-xs font-mono text-rose-300">
                            Cancellation Rationale: {ord.statusReason}
                          </div>
                        )}
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isDraft && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedOrder(ord);
                                setIsAuthorizeModalOpen(true);
                              }}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                            >
                              <ShieldCheck className="w-4 h-4" />
                              <span>AUTHORIZE ORDER</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedOrder(ord);
                                setDraftDosage(ord.dosage);
                                setDraftFrequency(ord.frequency);
                                setDraftInstructions(ord.instructions);
                                setDraftDuration(ord.duration);
                                setIsAmendModalOpen(true);
                              }}
                              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 flex items-center gap-1.5 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>AMEND</span>
                            </button>

                            <button
                              onClick={() => {
                                const reason = prompt('Please document reason for order draft cancellation:');
                                if (reason) handleCancelOrder(ord.id, reason);
                              }}
                              className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-mono border border-rose-500/30 flex items-center gap-1.5 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>CANCEL</span>
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => {
                            setSelectedOrder(ord);
                            setIsAuditModalOpen(true);
                          }}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-mono border border-slate-700 flex items-center gap-1.5 transition-colors"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>AUDIT TRAIL</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: VERIFIED DRUG-DRUG INTERACTION SCREENING MATRIX       */}
      {/* ============================================================ */}
      {activeTab === 'interactions' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100 font-mono">
                  CURATED DRUG-DRUG & CONTRAINDICATION SCREENING MATRIX
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Data Source: <strong className="text-slate-200">{globalSafetyCheck.dataSource}</strong>
              </span>
            </div>

            {/* Mandatory Regulatory Safety Notice */}
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300 leading-relaxed">
              <strong className="text-amber-400">CLINICAL SAFETY DISCLAIMER: </strong>
              {globalSafetyCheck.disclaimer}
            </div>

            {/* Interactions List */}
            {globalSafetyCheck.interactions.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-700 rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-200 font-mono">
                  No major drug-drug interactions detected among current active regimens.
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Absence of a documented alert does not prove medication safety. Always exercise physician judgment.
                </p>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {globalSafetyCheck.interactions.map((int) => (
                  <div
                    key={int.id}
                    className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-amber-300">
                          INTERACTION ALERT: {int.drugA} ⚡ {int.drugB}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          int.severity === 'critical'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {int.severity}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      {int.description}
                    </p>

                    <div className="text-xs font-mono text-amber-200/90 pt-1 border-t border-amber-500/20 flex items-start gap-1.5">
                      <strong className="text-amber-400 shrink-0">CLINICAL MANAGEMENT:</strong>
                      <span>{int.clinicalManagement}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: DRAFT NEW MEDICATION ORDER MODAL                    */}
      {/* ============================================================ */}
      {isDraftModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 font-mono">
                    {draftOrderType === 'change' ? 'MODIFY / CHANGE REGIMEN' : 'DRAFT NEW MEDICATION ORDER'}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Patient: {currentPatient?.name} ({currentPatient?.mrn})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDraftModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Validation errors */}
            {formValidationErrors.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-mono space-y-1">
                <strong className="font-bold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  Please resolve the following required fields:
                </strong>
                <ul className="list-disc list-inside space-y-0.5 pl-2">
                  {formValidationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Live Safety Screening Banner */}
            {liveSafetyCheck && (
              <div className="space-y-2">
                {liveSafetyCheck.allergyWarnings.map((al, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold uppercase tracking-wide">ALLERGY WARNING: </strong>
                      <span>{al.message}</span>
                    </div>
                  </div>
                ))}

                {liveSafetyCheck.interactionWarnings.map((iw, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/50 text-amber-300 text-xs font-mono flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold uppercase">DRUG INTERACTION ({iw.interactingDrug}): </strong>
                      <span>{iw.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleCreateDraftOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Medication Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                    MEDICATION NAME *
                  </label>
                  <input
                    type="text"
                    value={draftMedName}
                    onChange={(e) => setDraftMedName(e.target.value)}
                    placeholder="e.g. Amlodipine Besylate, Lisinopril, Metformin"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                    Real-time allergy and cross-reactivity screening active as you type.
                  </span>
                </div>

                {/* Dosage */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                    DOSAGE & FORM *
                  </label>
                  <input
                    type="text"
                    value={draftDosage}
                    onChange={(e) => setDraftDosage(e.target.value)}
                    placeholder="e.g. 1 tablet (5 mg), 250 mg capsule"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                {/* Route */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                    ADMINISTRATION ROUTE *
                  </label>
                  <select
                    value={draftRoute}
                    onChange={(e) => setDraftRoute(e.target.value as MedicationRoute)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
                  >
                    {['Oral', 'Sublingual', 'Inhalation', 'Topical', 'Subcutaneous', 'Intravenous', 'Ophthalmic', 'Otic', 'Transdermal'].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                    FREQUENCY *
                  </label>
                  <select
                    value={draftFrequency}
                    onChange={(e) => setDraftFrequency(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
                  >
                    {['Once daily', 'Twice daily', 'Three times daily', 'Every 8 hours', 'Every 12 hours', 'At bedtime', 'PRN (As needed)'].map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                    DURATION
                  </label>
                  <input
                    type="text"
                    value={draftDuration}
                    onChange={(e) => setDraftDuration(e.target.value)}
                    placeholder="e.g. 14 days, 30 days, Ongoing / Chronic"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                {/* Indication */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                    CLINICAL INDICATION
                  </label>
                  <input
                    type="text"
                    value={draftIndication}
                    onChange={(e) => setDraftIndication(e.target.value)}
                    placeholder="e.g. Essential Hypertension, Secondary Stroke Prophylaxis"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                {/* Exact SIG Instructions */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                    PRESCRIBER INSTRUCTIONS (VERBATIM SIG) *
                  </label>
                  <textarea
                    rows={2}
                    value={draftInstructions}
                    onChange={(e) => setDraftInstructions(e.target.value)}
                    placeholder="e.g. Take 1 tablet by mouth daily in the morning with a full glass of water. Do not chew or crush."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                {/* Food & Administration Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                    DIETARY / FOOD NOTES
                  </label>
                  <input
                    type="text"
                    value={draftFoodNotes}
                    onChange={(e) => setDraftFoodNotes(e.target.value)}
                    placeholder="e.g. Take with morning meal. Avoid grapefruit juice or potassium salt substitutes."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* Draft Label Notice */}
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] font-mono text-slate-400">
                <strong className="text-purple-300">INSTITUTIONAL DRAFT WORKFLOW: </strong>
                External e-prescribing gateway not connected. This order will be recorded as a draft in the electronic medical record and requires explicit attending physician sign-off before committing to the patient portal or mobile device.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDraftModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-semibold shadow-xs"
                >
                  SAVE DRAFT ORDER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: ATTENDING PHYSICIAN AUTHORIZATION MODAL            */}
      {/* ============================================================ */}
      {isAuthorizeModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 font-mono">
                    ATTENDING PHYSICIAN AUTHORIZATION
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Order #{selectedOrder.id} · {selectedOrder.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAuthorizeModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Summary */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Medication:</span>
                <span className="font-bold text-slate-100">{selectedOrder.name} {selectedOrder.dosage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Route & Frequency:</span>
                <span className="text-slate-200">{selectedOrder.route} · {selectedOrder.frequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duration:</span>
                <span className="text-slate-200">{selectedOrder.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Prescriber SIG:</span>
                <span className="text-slate-200 text-right max-w-xs">{selectedOrder.instructions}</span>
              </div>
            </div>

            {/* Unlocked Patient-Friendly Instructions Preview */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-mono font-bold">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>PATIENT-FRIENDLY INSTRUCTIONS (PUBLISH PREVIEW):</span>
              </div>
              <p className="text-xs text-slate-200 font-sans leading-relaxed">
                Take {selectedOrder.dosage} by {selectedOrder.route.toLowerCase()} route {selectedOrder.frequency.toLowerCase()} for {selectedOrder.duration || 'prescribed duration'}. {selectedOrder.foodNotes ? selectedOrder.foodNotes + ' ' : ''}Always drink plenty of water. If you experience severe adverse reactions, contact Dr. {authorizingClinician} or seek emergency care.
              </p>
            </div>

            {/* Attending Credentials */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                  ATTENDING PHYSICIAN NAME
                </label>
                <input
                  type="text"
                  value={authorizingClinician}
                  onChange={(e) => setAuthorizingClinician(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                  NATIONAL PROVIDER IDENTIFIER (NPI) *
                </label>
                <input
                  type="text"
                  value={authorizingNpi}
                  onChange={(e) => setAuthorizingNpi(e.target.value)}
                  placeholder="10-digit NPI"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                  AUTHORIZATION CLINICAL NOTES (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={authorizeNotes}
                  onChange={(e) => setAuthorizeNotes(e.target.value)}
                  placeholder="e.g. Verified renal panel; instructed on hydration"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono"
                />
              </div>

              {/* Legal / Ethical Attestation */}
              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={attestationChecked}
                  onChange={(e) => setAttestationChecked(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-emerald-600 focus:ring-0"
                />
                <span className="text-xs text-slate-300 font-mono leading-tight">
                  I hereby certify that I have reviewed the patient's allergy profile, active medications, and contraindications. I authorize this medication order for inclusion in the patient's active chart.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAuthorizeModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={!attestationChecked || !authorizingNpi}
                onClick={handleAuthorizeOrder}
                className={`px-5 py-2 rounded-xl text-xs font-mono font-semibold shadow-xs flex items-center gap-1.5 transition-colors ${
                  attestationChecked && authorizingNpi
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>CERTIFY & AUTHORIZE ORDER</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: AMEND ORDER DRAFT MODAL                             */}
      {/* ============================================================ */}
      {isAmendModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 font-mono">
                AMEND ORDER DRAFT #{selectedOrder.id}
              </h3>
              <button onClick={() => setIsAmendModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">DOSAGE</label>
                <input
                  type="text"
                  value={draftDosage}
                  onChange={(e) => setDraftDosage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">FREQUENCY</label>
                <input
                  type="text"
                  value={draftFrequency}
                  onChange={(e) => setDraftFrequency(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">PRESCRIBER INSTRUCTIONS (SIG)</label>
                <textarea
                  rows={2}
                  value={draftInstructions}
                  onChange={(e) => setDraftInstructions(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">CLINICAL RATIONALE FOR AMENDMENT *</label>
                <input
                  type="text"
                  value={amendReason}
                  onChange={(e) => setAmendReason(e.target.value)}
                  placeholder="e.g. Adjusted frequency based on renal clearance"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsAmendModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
              >
                CANCEL
              </button>
              <button
                onClick={handleAmendOrder}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-semibold"
              >
                SAVE AMENDMENT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: DISCONTINUE MEDICATION MODAL                        */}
      {/* ============================================================ */}
      {isDiscontinueModalOpen && selectedMedication && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-rose-300 font-mono flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-400" />
                DISCONTINUE THERAPY
              </h3>
              <button onClick={() => setIsDiscontinueModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 font-mono">
              Are you sure you want to discontinue <strong className="text-white">{selectedMedication.name}</strong> ({selectedMedication.dosage}) for patient {currentPatient?.name}?
            </p>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                DOCUMENTATION OF CLINICAL RATIONALE *
              </label>
              <textarea
                rows={3}
                value={discontinueReason}
                onChange={(e) => setDiscontinueReason(e.target.value)}
                placeholder="e.g. Antimicrobial therapy completed / Adverse intolerance / Transitioned to alternative agent"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsDiscontinueModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
              >
                CANCEL
              </button>
              <button
                onClick={handleDiscontinueMedication}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-semibold"
              >
                CONFIRM DISCONTINUATION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 5: AUDIT LOG & AMENDMENT HISTORY MODAL                 */}
      {/* ============================================================ */}
      {isAuditModalOpen && (selectedOrder || selectedMedication) && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-slate-100 font-mono">
                  LONGITUDINAL AUDIT TRAIL
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAuditModalOpen(false);
                  setSelectedOrder(null);
                  setSelectedMedication(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {selectedOrder?.auditHistory && selectedOrder.auditHistory.length > 0 ? (
                selectedOrder.auditHistory.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300 uppercase">{item.action}</span>
                      <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                    </div>
                    <p className="text-slate-300">{item.details}</p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-0.5">
                      <span>Actor: <strong className="text-slate-200">{item.actorName}</strong></span>
                      {item.actorNpi && <span>(NPI: {item.actorNpi})</span>}
                    </div>
                  </div>
                ))
              ) : selectedMedication?.changeLog && selectedMedication.changeLog.length > 0 ? (
                selectedMedication.changeLog.map((log, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300 uppercase">{log.action}</span>
                      <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                    </div>
                    <p className="text-slate-300">{log.rationale}</p>
                    <div className="text-[11px] text-slate-400">
                      Changed By: <strong className="text-slate-200">{log.changedBy}</strong>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 font-mono text-center py-4">
                  Initial electronic record created. No subsequent amendments recorded.
                </p>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  setIsAuditModalOpen(false);
                  setSelectedOrder(null);
                  setSelectedMedication(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
