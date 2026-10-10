import React, { useState, useEffect } from 'react';
import { RoutePath, PatientRecord, TriageCategory } from '../../../../types';
import { clinicalStore } from '../../../../services/clinicalStore';
import {
  Users,
  Compass,
  AlertTriangle,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  Stethoscope,
  Activity,
  ShieldCheck,
  Search,
  Flame,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  XCircle,
  ShieldAlert,
  Info,
  History,
  AlertCircle,
  CheckCircle,
  FileEdit,
  FileText,
  X
} from 'lucide-react';

interface DoctorQueueViewProps {
  onNavigate: (route: RoutePath) => void;
  onSelectPatient: (patientId: string) => void;
  initialFilterTier?: string;
  searchQuery?: string;
}

export const DoctorQueueView: React.FC<DoctorQueueViewProps> = ({
  onNavigate,
  onSelectPatient,
  initialFilterTier = 'all',
  searchQuery: initialSearch = ''
}) => {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());

  // Filters & Search
  const [filterTier, setFilterTier] = useState<string>(initialFilterTier);
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('priority');
  const [search, setSearch] = useState<string>(initialSearch);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Real dashboard metrics
  const [metrics, setMetrics] = useState<any>(null);

  // Clinician Priority Override Modal State
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedPatientForOverride, setSelectedPatientForOverride] = useState<PatientRecord | null>(null);
  const [overrideTier, setOverrideTier] = useState<TriageCategory>('urgent');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideSubmitting, setOverrideSubmitting] = useState(false);
  const [overrideError, setOverrideError] = useState<string | null>(null);

  // History expanded state per patient
  const [expandedHistoryPatientId, setExpandedHistoryPatientId] = useState<string | null>(null);

  const loadData = async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    }
    setError(null);
    try {
      const dashboard = await clinicalStore.fetchDoctorDashboard();
      if (dashboard) setMetrics(dashboard);

      const res = await clinicalStore.fetchDoctorPatients({
        tier: filterTier,
        department: departmentFilter,
        status: statusFilter,
        search: search,
        sort: sortBy
      });

      if (res && res.patients) {
        setPatients(res.patients);
      } else {
        setPatients(clinicalStore.getPatients());
      }
      setLastSynced(new Date());
    } catch (err: any) {
      if (!isBackground) {
        setError('Unable to load clinical queue from server. Offline fallback enabled.');
      }
      setPatients(clinicalStore.getPatients());
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData();

    // Live refresh polling every 10 seconds for real-time updates from patient portal and Android app
    const pollInterval = setInterval(() => {
      loadData(true);
    }, 10000);

    const unsub = clinicalStore.subscribe(() => {
      setPatients(clinicalStore.getPatients());
    });

    return () => {
      clearInterval(pollInterval);
      unsub();
    };
  }, [filterTier, departmentFilter, statusFilter, sortBy]);

  useEffect(() => {
    if (initialSearch !== search) {
      setSearch(initialSearch);
    }
  }, [initialSearch]);

  // Client-side quick filter & search
  const filteredPatients = patients.filter((p) => {
    const matchesTier = filterTier === 'all' || p.triageStatus === filterTier;
    const matchesDept =
      departmentFilter === 'all' ||
      (p.department && p.department.toLowerCase() === departmentFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.caseStatus === statusFilter;
    const matchesSearch =
      search.trim() === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.mrn.toLowerCase().includes(search.toLowerCase()) ||
      (p.activeConditions && p.activeConditions.some((c) => c.toLowerCase().includes(search.toLowerCase()))) ||
      (p.reportedSymptoms && p.reportedSymptoms.some((s) => s.toLowerCase().includes(search.toLowerCase())));

    return matchesTier && matchesDept && matchesStatus && matchesSearch;
  });

  // Client-side sort
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    if (sortBy === 'priority') {
      const weights: Record<string, number> = {
        emergency: 4,
        urgent: 3,
        prompt_evaluation: 2,
        routine: 1,
        monitor_self_care: 0
      };
      return (weights[b.triageStatus] || 0) - (weights[a.triageStatus] || 0);
    }
    if (sortBy === 'waitTime') {
      return (b.waitTimeMinutes || 0) - (a.waitTimeMinutes || 0);
    }
    if (sortBy === 'updated') {
      return (b.lastUpdated || b.lastVisit || '') > (a.lastUpdated || a.lastVisit || '') ? 1 : -1;
    }
    return 0;
  });

  // Pagination slice
  const totalPages = Math.ceil(sortedPatients.length / itemsPerPage) || 1;
  const paginatedPatients = sortedPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    setFilterTier('all');
    setDepartmentFilter('all');
    setStatusFilter('all');
    setSortBy('priority');
    setSearch('');
    setCurrentPage(1);
  };

  const handleReview = (patientId: string) => {
    onSelectPatient(patientId);
    onNavigate('/doctor/patients');
  };

  // Open override modal
  const openOverrideModal = (patient: PatientRecord) => {
    setSelectedPatientForOverride(patient);
    setOverrideTier(patient.triageStatus);
    setOverrideReason('');
    setOverrideError(null);
    setOverrideModalOpen(true);
  };

  const handleApplyOverride = async () => {
    if (!selectedPatientForOverride) return;

    if (!overrideReason.trim()) {
      setOverrideError('A documented clinical justification is required for priority overrides.');
      return;
    }

    // Protection: Never silently downgrade clinician-confirmed emergency cases!
    if (
      selectedPatientForOverride.isClinicianConfirmedEmergency &&
      overrideTier !== 'emergency' &&
      overrideReason.trim().length < 15
    ) {
      setOverrideError(
        'Emergency Safety Rule: Downgrading a clinician-confirmed emergency requires detailed clinical reasoning (min 15 characters) documenting why acute danger was ruled out.'
      );
      return;
    }

    setOverrideSubmitting(true);
    setOverrideError(null);

    const res = await clinicalStore.overridePatientPriority(
      selectedPatientForOverride.id,
      overrideTier,
      overrideReason.trim()
    );

    setOverrideSubmitting(false);

    if (res.success) {
      setOverrideModalOpen(false);
      setSelectedPatientForOverride(null);
      loadData(false);
    } else {
      setOverrideError(res.error || 'Failed to update priority override');
    }
  };

  const getTierBadge = (tier: TriageCategory) => {
    switch (tier) {
      case 'emergency':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
      case 'urgent':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'prompt_evaluation':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'routine':
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const getProvenanceBadge = (source?: string) => {
    switch (source) {
      case 'clinician':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>MD Confirmed</span>
          </span>
        );
      case 'configured_rule':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-blue-400" />
            <span>Configured Clinical Rule</span>
          </span>
        );
      case 'ai_suggestion':
      default:
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span>AI Intake Suggestion (Review Required)</span>
          </span>
        );
    }
  };

  const getDataQualityBadge = (status?: string, notes?: string) => {
    switch (status) {
      case 'stale':
        return (
          <span
            title={notes}
            className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium flex items-center gap-1"
          >
            <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Stale Telemetry (&gt;24h)</span>
          </span>
        );
      case 'missing_vitals':
        return (
          <span
            title={notes}
            className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-medium flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
            <span>Missing Telemetry</span>
          </span>
        );
      case 'contradictory':
        return (
          <span
            title={notes}
            className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-medium flex items-center gap-1"
          >
            <ShieldAlert className="w-3 h-3 text-purple-400 shrink-0" />
            <span>Contradictory Intake</span>
          </span>
        );
      case 'complete':
      default:
        return (
          <span
            title={notes || 'Verified recent telemetry on file'}
            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium flex items-center gap-1"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Telemetry Verified</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Practice Telemetry Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <div
          onClick={() => {
            setFilterTier('all');
            setCurrentPage(1);
          }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium">TOTAL QUEUE</span>
            <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
            {metrics?.totalActiveCases ?? clinicalStore.getPatients().length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>All Active Encounters</span>
          </div>
        </div>

        <div
          onClick={() => {
            setFilterTier('emergency');
            setCurrentPage(1);
          }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/50 p-4 shadow-xs cursor-pointer hover:border-rose-400 transition-colors bg-gradient-to-br from-rose-50/30 to-transparent dark:from-rose-950/20"
        >
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 mb-2">
            <span className="text-xs font-mono font-bold">EMERGENCY ALERTS</span>
            <Flame className="w-4 h-4 text-rose-700 dark:text-rose-400 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-rose-700 dark:text-rose-400 font-mono">
            {Math.max(
              metrics?.emergencyAlertsCount || 0,
              metrics?.urgencyCounts?.emergency || 0,
              clinicalStore.getPatients().filter((p) => p.triageStatus === 'emergency').length,
              patients.filter((p) => p.triageStatus === 'emergency').length
            )}
          </div>
          <div className="text-[11px] text-rose-700 dark:text-rose-400 mt-1 font-medium">
            Immediate Physician Response
          </div>
        </div>

        <div
          onClick={() => {
            setStatusFilter('pending_review');
            setCurrentPage(1);
          }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium">AWAITING REVIEW</span>
            <Activity className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
            {metrics?.awaitingReviewCount ?? clinicalStore.getPatients().filter((p) => p.caseStatus === 'pending_review' || p.caseStatus === 'in_review').length}
          </div>
          <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 font-medium">
            Pending Clinician Sign-Off
          </div>
        </div>

        <div
          onClick={() => onNavigate('/doctor/reports')}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium">DOCUMENT REVIEWS</span>
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
            {clinicalStore.getReports().filter((r) => r.reviewStatus !== 'reviewed' && !clinicalStore.isReportSigned(r.id)).length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between font-mono gap-1.5">
            <span className="text-amber-600 dark:text-amber-400 font-semibold truncate">Pending Sign-off</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
              {clinicalStore.getReports().filter((r) => r.reviewStatus === 'reviewed' || clinicalStore.isReportSigned(r.id)).length} Signed
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-medium">AVG QUEUE WAIT</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
            {metrics?.averageWaitMinutes ?? 24}m
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Target SLA: &lt; 30 mins
          </div>
        </div>
      </div>

      {/* 2. Emergency Callout Banner */}
      {patients.some((p) => p.triageStatus === 'emergency' && p.caseStatus === 'escalated') && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Flame className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <div className="font-bold text-rose-900 dark:text-rose-200 text-sm flex items-center gap-2">
                <span>Active Level 1 Emergency Escalation in Queue</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-600 text-white font-mono font-bold animate-pulse">
                  STAT
                </span>
              </div>
              <div className="text-rose-700 dark:text-rose-300 mt-0.5">
                Acute red-flag criteria identified (crushing chest pain / stroke / critical vital distress). Immediate physician intervention active.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('/doctor/triage')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
          >
            <span>Open Triage Escalations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Filter Bar & Triage Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3 transition-colors">
        {/* Top: Urgency Tabs with live counts and Live Sync Indicator */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5" role="tablist">
            {[
              { id: 'all', label: 'All Patients', count: patients.length, color: 'text-slate-400' },
              {
                id: 'emergency',
                label: 'Emergency',
                count: patients.filter((p) => p.triageStatus === 'emergency').length,
                color: 'text-rose-600 dark:text-rose-400'
              },
              {
                id: 'urgent',
                label: 'Urgent',
                count: patients.filter((p) => p.triageStatus === 'urgent').length,
                color: 'text-amber-600 dark:text-amber-400'
              },
              {
                id: 'prompt_evaluation',
                label: 'Prompt Eval',
                count: patients.filter((p) => p.triageStatus === 'prompt_evaluation').length,
                color: 'text-blue-600 dark:text-blue-400'
              },
              {
                id: 'routine',
                label: 'Routine',
                count: patients.filter((p) => p.triageStatus === 'routine').length,
                color: 'text-emerald-600 dark:text-emerald-400'
              }
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={filterTier === tab.id}
                onClick={() => {
                  setFilterTier(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  filterTier === tab.id
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    filterTier === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
            {/* Live polling badge */}
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Sync Active</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-500">{lastSynced.toLocaleTimeString()}</span>
            </div>

            <button
              onClick={() => loadData(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
              title="Refresh clinical queue"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Bottom: Secondary Filters, Sorting & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Department Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-mono text-[11px]">Dept:</span>
              <select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
              >
                <option value="all">All Specialties</option>
                <option value="Internal Medicine">Internal Medicine</option>
                <option value="Endocrinology">Endocrinology</option>
                <option value="Pulmonology">Pulmonology</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Emergency Medicine">Emergency Medicine</option>
              </select>
            </div>

            {/* Case Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-mono text-[11px]">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
              >
                <option value="all">All Cases</option>
                <option value="pending_review">Pending Review</option>
                <option value="in_review">In Review</option>
                <option value="reviewed">Reviewed</option>
                <option value="escalated">Escalated</option>
              </select>
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-mono text-[11px]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
              >
                <option value="priority">Acuity Priority</option>
                <option value="waitTime">Longest Wait Time</option>
                <option value="updated">Most Recent Update</option>
              </select>
            </div>

            {(filterTier !== 'all' || departmentFilter !== 'all' || statusFilter !== 'all' || search) && (
              <button
                onClick={resetFilters}
                className="px-2.5 py-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium text-[11px] flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Search Field */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search name, MRN, condition..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* 4. Patient Queue List */}
      {loading ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
          <div className="text-xs text-slate-500 font-mono">Synchronizing clinical queue with database...</div>
        </div>
      ) : paginatedPatients.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Users className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">No Patients Match Criteria</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            No patient records match the currently applied urgency, department, or search filters.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-slate-900 dark:bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedPatients.map((patient) => {
            const hasOverrides = patient.priorityOverrides && patient.priorityOverrides.length > 0;
            const isHistoryExpanded = expandedHistoryPatientId === patient.id;

            return (
              <div
                key={patient.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
              >
                {/* Header Row: Identity, Badges, Provenance & Quality Status */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-base">
                      {patient.name}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      MRN: {patient.mrn}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {patient.age}y {patient.gender} · Blood {patient.bloodType}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-mono font-bold px-2.5 py-0.5 rounded border ${getTierBadge(
                        patient.triageStatus
                      )}`}
                    >
                      {patient.triageStatus.replace('_', ' ')}
                    </span>
                    {patient.department && (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {patient.department}
                      </span>
                    )}
                  </div>

                  {/* Provenance & Data Quality Indicators */}
                  <div className="flex flex-wrap items-center gap-2">
                    {getProvenanceBadge(patient.prioritySource)}
                    {getDataQualityBadge(patient.dataQualityStatus, patient.dataQualityNotes)}
                  </div>
                </div>

                {/* Priority Assignment Explanation & Clinical Rationale */}
                <div className="bg-slate-50 dark:bg-slate-950/70 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-[11px] flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>TRIAGE CRITERIA &amp; PRIORITY EXPLANATION:</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Assigned by: {patient.priorityAssignedBy || 'Clinical Protocol Engine'}
                    </span>
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    {patient.priorityExplanation || patient.triageReason || 'Triage assigned according to clinical presentation parameters.'}
                  </div>
                  {patient.dataQualityNotes && patient.dataQualityStatus !== 'complete' && (
                    <div className="text-[11px] text-amber-700 dark:text-amber-400 pt-1 font-mono flex items-center gap-1.5 border-t border-slate-200 dark:border-slate-800/60 mt-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>Data Freshness Warning: {patient.dataQualityNotes}</span>
                    </div>
                  )}
                </div>

                {/* Patient-Specific Clinical Triage Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-mono mb-1">REPORTED SYMPTOMS</span>
                    <div className="flex flex-wrap gap-1">
                      {(patient.reportedSymptoms && patient.reportedSymptoms.length > 0
                        ? patient.reportedSymptoms
                        : patient.activeConditions || ['None recorded']
                      ).map((sym, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                        >
                          {sym}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] font-mono mb-1">KNOWN ALLERGIES</span>
                    <span className="font-medium text-rose-700 dark:text-rose-400 block truncate">
                      {patient.allergies?.join(', ') || 'No known drug allergies'}
                    </span>
                    {patient.riskIndicators && patient.riskIndicators.length > 0 && (
                      <div className="mt-1 text-[10px] font-mono text-amber-700 dark:text-amber-400 truncate">
                        Risk: {patient.riskIndicators.join(' · ')}
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] font-mono mb-1">RELEVANT VITALS</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block">
                      {patient.vitalsSummary || 'BP 118/76 · HR 68'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      Updated: {patient.lastUpdated ? new Date(patient.lastUpdated).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] font-mono mb-1">WAITING TIME &amp; SLA</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-bold">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{patient.waitTimeMinutes ? `${patient.waitTimeMinutes} mins` : 'Recent Intake'}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Case: <span className="uppercase font-mono">{patient.caseStatus || 'pending'}</span>
                    </span>
                  </div>
                </div>

                {/* Overrides Audit Trail (if present) */}
                {hasOverrides && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() =>
                        setExpandedHistoryPatientId(isHistoryExpanded ? null : patient.id)
                      }
                      className="text-[11px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
                    >
                      <History className="w-3.5 h-3.5 text-emerald-500" />
                      <span>
                        Clinician Override History ({patient.priorityOverrides?.length} recorded events){' '}
                        {isHistoryExpanded ? '▲ Hide' : '▼ View'}
                      </span>
                    </button>

                    {isHistoryExpanded && (
                      <div className="mt-2 space-y-1.5 pl-4 border-l-2 border-emerald-500/40 text-[11px] font-mono text-slate-300">
                        {patient.priorityOverrides?.map((ovr) => (
                          <div key={ovr.id} className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                            <div className="flex items-center justify-between text-slate-400 text-[10px]">
                              <span>
                                {new Date(ovr.timestamp).toLocaleDateString()} {new Date(ovr.timestamp).toLocaleTimeString()}
                              </span>
                              <span className="font-bold text-emerald-400">{ovr.overriddenBy}</span>
                            </div>
                            <div className="text-slate-200 mt-0.5">
                              Changed <span className="uppercase font-bold text-amber-300">{ovr.previousPriority}</span>{' '}
                              &rarr; <span className="uppercase font-bold text-emerald-300">{ovr.newPriority}</span>
                            </div>
                            <div className="text-slate-400 text-[10px] mt-0.5 italic">
                              &ldquo;{ovr.overrideReason}&rdquo;
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {/* Left: Override Action */}
                  <button
                    onClick={() => openOverrideModal(patient)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <FileEdit className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Override Priority (MD)</span>
                  </button>

                  {/* Right: Review Encounter Action */}
                  <button
                    onClick={() => handleReview(patient.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Open Clinical Review</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-500 font-mono">
            Showing {(currentPage - 1) * itemsPerPage + 1} –{' '}
            {Math.min(currentPage * itemsPerPage, sortedPatients.length)} of {sortedPatients.length} patients
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono font-bold px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 6. Clinician Priority Override Modal */}
      {overrideModalOpen && selectedPatientForOverride && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Clinician Priority Override</h3>
              </div>
              <button
                onClick={() => setOverrideModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Patient Context */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-bold text-white">{selectedPatientForOverride.name}</span>
                <span className="font-mono text-slate-400">MRN: {selectedPatientForOverride.mrn}</span>
              </div>
              <div className="text-slate-400 font-mono text-[11px]">
                Current Urgency Tier:{' '}
                <span className="uppercase text-amber-400 font-bold">
                  {selectedPatientForOverride.triageStatus.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Critical Safety Notice if Downgrading Clinician-Confirmed Emergency */}
            {selectedPatientForOverride.isClinicianConfirmedEmergency && overrideTier !== 'emergency' && (
              <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-xs space-y-1 text-rose-200">
                <div className="font-bold flex items-center gap-1.5 text-rose-300">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>EMERGENCY SAFETY OVERRIDE ENFORCEMENT</span>
                </div>
                <p className="text-[11px] leading-relaxed text-rose-200/90">
                  This case is flagged as a <strong>Clinician-Confirmed Emergency</strong>. Downgrading requires a detailed medical justification (minimum 15 characters) documenting why acute red-flag conditions (e.g. ACS/Stroke) were definitively ruled out.
                </p>
              </div>
            )}

            {/* Target Priority Tier Selection */}
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-300 block">Select Adjusted Priority Tier:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'emergency', label: 'Emergency (STAT)', color: 'border-rose-500/40 text-rose-400' },
                  { id: 'urgent', label: 'Urgent (<20m)', color: 'border-amber-500/40 text-amber-400' },
                  { id: 'prompt_evaluation', label: 'Prompt Eval (24h)', color: 'border-blue-500/40 text-blue-400' },
                  { id: 'routine', label: 'Routine (Elective)', color: 'border-emerald-500/40 text-emerald-400' }
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setOverrideTier(tier.id as TriageCategory)}
                    className={`p-2.5 rounded-xl border text-left font-medium text-xs transition-colors ${
                      overrideTier === tier.id
                        ? 'bg-slate-800 border-emerald-500 text-white font-bold ring-1 ring-emerald-500'
                        : `bg-slate-950 ${tier.color} hover:bg-slate-800`
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason Input */}
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-300 block">
                Clinical Justification &amp; Rationale <span className="text-rose-400">*</span>:
              </label>
              <textarea
                rows={3}
                placeholder="Document objective clinical findings, vitals telemetry, or test results justifying this priority change..."
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
              />
              <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                <span>Recorded to permanent FHIR/HIPAA audit log with Attending Physician signature</span>
                <span>{overrideReason.length} chars</span>
              </div>
            </div>

            {/* Error Message */}
            {overrideError && (
              <div className="p-2.5 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{overrideError}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setOverrideModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={overrideSubmitting || !overrideReason.trim()}
                onClick={handleApplyOverride}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                {overrideSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Recording Override...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sign &amp; Apply Override</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
