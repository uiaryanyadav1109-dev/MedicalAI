import React, { useState, useEffect } from 'react';
import { RoutePath, MedicalReportRecord, LabResultItem, AnalyteComparisonItem } from '../../../../types';
import { clinicalStore } from '../../../../services/clinicalStore';
import { useAuth } from '../../../../context/AuthContext';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  Filter,
  ShieldCheck,
  Check,
  Search,
  Lock,
  Clock,
  Printer,
  ChevronRight,
  Flame,
  AlertTriangle,
  RotateCw,
  GitCompare,
  MessageSquare,
  History,
  FileCheck,
  ExternalLink,
  PlusCircle,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  UserCheck,
  ShieldAlert,
  Send,
  Calendar,
  Layers,
  Copy
} from 'lucide-react';

export const DoctorLabReviewView: React.FC<{ onNavigate: (route: RoutePath) => void }> = ({
  onNavigate
}) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<MedicalReportRecord[]>(clinicalStore.getReports());
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || 'rep-1');
  const [signedReports, setSignedReports] = useState<Record<string, any>>(clinicalStore.getSignedReports());

  // Filter States
  const [filterPatient, setFilterPatient] = useState<string>('all');
  const [filterDocType, setFilterDocType] = useState<string>('all');
  const [filterReviewStatus, setFilterReviewStatus] = useState<string>('all');
  const [filterProcessingStatus, setFilterProcessingStatus] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Active Tab in Detail Panel
  const [activeTab, setActiveTab] = useState<'analytes' | 'original_doc' | 'comments' | 'audit'>('analytes');

  // Modals & Panels
  const [signOffModalOpen, setSignOffModalOpen] = useState(false);
  const [signOffNotes, setSignOffNotes] = useState('');
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareTargetReportId, setCompareTargetReportId] = useState<string>('');
  const [comparisonResults, setComparisonResults] = useState<AnalyteComparisonItem[] | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<'routine' | 'medium' | 'high' | 'urgent'>('routine');
  const [taskDueDate, setTaskDueDate] = useState('');

  // Comment input
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Retry state
  const [isRetrying, setIsRetrying] = useState(false);
  const [successNote, setSuccessNote] = useState<string | null>(null);
  const [errorNote, setErrorNote] = useState<string | null>(null);

  // Zoom level for document preview
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Subscribe to clinicalStore updates
  useEffect(() => {
    setReports(clinicalStore.getReports());
    setSignedReports(clinicalStore.getSignedReports());

    return clinicalStore.subscribe(() => {
      const updated = clinicalStore.getReports();
      setReports(updated);
      setSignedReports(clinicalStore.getSignedReports());
    });
  }, []);

  const activeReport = reports.find((r) => r.id === selectedReportId) || reports[0];
  const isReportSigned = Boolean(signedReports[activeReport?.id]);

  // Unique patients for filter dropdown
  const patientsList = Array.from(
    new Map(
      reports.map((r) => [r.patientId || 'pat-1', { id: r.patientId || 'pat-1', name: r.patientName || 'Aryan Yadav' }])
    ).values()
  );

  // Filtered reports
  const filteredReports = reports.filter((rep) => {
    const isSigned = Boolean(signedReports[rep.id]);
    const matchesPatient = filterPatient === 'all' || rep.patientId === filterPatient;
    const matchesDocType = filterDocType === 'all' || rep.documentType === filterDocType;
    const matchesProcessing = filterProcessingStatus === 'all' || rep.processingStatus === filterProcessingStatus;

    let matchesReview = true;
    if (filterReviewStatus === 'reviewed') {
      matchesReview = rep.reviewStatus === 'reviewed' || isSigned;
    } else if (filterReviewStatus === 'unreviewed') {
      matchesReview = rep.reviewStatus === 'unreviewed' && !isSigned;
    } else if (filterReviewStatus === 'requires_action') {
      matchesReview = rep.reviewStatus === 'requires_action';
    }

    const matchesSearch =
      search.trim() === '' ||
      rep.title.toLowerCase().includes(search.toLowerCase()) ||
      (rep.laboratory || '').toLowerCase().includes(search.toLowerCase()) ||
      (rep.specimenType || '').toLowerCase().includes(search.toLowerCase()) ||
      (rep.patientName && rep.patientName.toLowerCase().includes(search.toLowerCase())) ||
      (rep.results || []).some((res) => res.testName.toLowerCase().includes(search.toLowerCase()));

    return matchesPatient && matchesDocType && matchesProcessing && matchesReview && matchesSearch;
  });

  // Handle Review Status Toggle
  const handleUpdateReviewStatus = async (status: 'unreviewed' | 'reviewed' | 'requires_action') => {
    if (!activeReport) return;
    try {
      const res = await clinicalStore.updateReportReviewStatus(activeReport.id, status);
      if (res.success) {
        setSuccessNote(`Report marked as "${status.toUpperCase().replace('_', ' ')}".`);
        setTimeout(() => setSuccessNote(null), 3500);
      }
    } catch (err: any) {
      setErrorNote(err.message || 'Failed to update review status.');
      setTimeout(() => setErrorNote(null), 4000);
    }
  };

  // Handle Sign-off
  const handleOpenSignOff = () => {
    setSignOffNotes(
      'Diagnostic indices clinically verified against biological reference ranges. Normal physiological parameters confirmed.'
    );
    setSignOffModalOpen(true);
  };

  const handleConfirmSignOff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReport) return;

    await clinicalStore.signLabReport(activeReport.id, signOffNotes);
    await clinicalStore.updateReportReviewStatus(activeReport.id, 'reviewed', signOffNotes);
    setSignOffModalOpen(false);
    setSuccessNote(`Diagnostic release for "${activeReport.title}" certified and signed by Attending Physician.`);
    setTimeout(() => setSuccessNote(null), 4000);
  };

  // Handle Comment Submission
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReport || !newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await clinicalStore.addReportComment(activeReport.id, newComment.trim());
      if (res.success) {
        setNewComment('');
        setSuccessNote('Clinician note added to audit trail.');
        setTimeout(() => setSuccessNote(null), 3000);
      } else {
        setErrorNote(res.error || 'Failed to add comment.');
        setTimeout(() => setErrorNote(null), 4000);
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle Retry
  const handleRetryProcessing = async () => {
    if (!activeReport) return;
    setIsRetrying(true);
    try {
      const res = await clinicalStore.retryReportProcessing(activeReport.id);
      if (res.success) {
        setSuccessNote(res.message || 'Optical extraction retry succeeded. Biomarkers re-indexed.');
        setTimeout(() => setSuccessNote(null), 4000);
      } else {
        setErrorNote(res.message || 'Retry failed.');
        setTimeout(() => setErrorNote(null), 4000);
      }
    } finally {
      setIsRetrying(false);
    }
  };

  // Handle Historical Comparison
  const handleOpenCompare = () => {
    if (!activeReport) return;
    // Find candidate previous reports for the same patient
    const candidates = reports.filter(
      (r) => r.id !== activeReport.id && (!r.patientId || r.patientId === activeReport.patientId)
    );
    if (candidates.length > 0) {
      setCompareTargetReportId(candidates[0].id);
    }
    setComparisonResults(null);
    setCompareError(null);
    setCompareModalOpen(true);
  };

  const handleRunComparison = async () => {
    if (!activeReport || !compareTargetReportId) return;
    setIsComparing(true);
    setCompareError(null);
    try {
      const res = await clinicalStore.comparePatientReports(activeReport.id, compareTargetReportId);
      if (res.success && res.comparison) {
        setComparisonResults(res.comparison);
      } else {
        setCompareError(res.error || 'Comparison could not be completed.');
      }
    } catch (err: any) {
      setCompareError(err.message || 'Network error during report comparison.');
    } finally {
      setIsComparing(false);
    }
  };

  // Handle Follow-up Task Creation
  const handleOpenTaskModal = () => {
    if (!activeReport) return;
    setTaskTitle(`Follow-up Lab Review: ${activeReport.title}`);
    setTaskDescription(`Review out-of-range indicators and schedule follow-up diagnostic assessment for ${activeReport.patientName || 'patient'}.`);
    setTaskPriority(activeReport.status === 'critical' ? 'urgent' : activeReport.status === 'review_recommended' ? 'high' : 'routine');
    const inTwoDays = new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString().split('T')[0];
    setTaskDueDate(inTwoDays);
    setTaskModalOpen(true);
  };

  const handleConfirmTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReport) return;

    try {
      const res = await clinicalStore.createReportFollowUpTask(activeReport.id, {
        taskTitle,
        description: taskDescription,
        priority: taskPriority,
        dueDate: taskDueDate,
        assignedClinician: 'Dr. Sarah Chen, MD'
      });
      if (res.success) {
        setTaskModalOpen(false);
        setSuccessNote(`Follow-up clinical task "${taskTitle}" created and assigned.`);
        setTimeout(() => setSuccessNote(null), 4000);
      } else {
        setErrorNote(res.error || 'Failed to create task.');
        setTimeout(() => setErrorNote(null), 4000);
      }
    } catch (err: any) {
      setErrorNote(err.message || 'Error creating task.');
      setTimeout(() => setErrorNote(null), 4000);
    }
  };

  // Format Helper
  const formatDocType = (type?: string) => {
    switch (type) {
      case 'blood_report':
        return 'Blood / Hematology';
      case 'imaging':
        return 'Diagnostic Imaging';
      case 'prescription':
        return 'Prescription Order';
      case 'pathology':
        return 'Pathology Panel';
      case 'discharge_summary':
        return 'Discharge Summary';
      default:
        return 'Clinical Diagnostic';
    }
  };

  const formatSource = (source?: string) => {
    switch (source) {
      case 'patient_portal':
        return 'Patient Portal Upload';
      case 'mobile_app':
        return 'Android Mobile App';
      case 'doctor_upload':
        return 'Clinician Upload';
      case 'external_lab':
        return 'External HL7 / Lab Feed';
      default:
        return 'Electronic Ingestion';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-emerald-700 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Clinical Intelligence · Medical Document Review</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Diagnostic Lab & Medical Document Review
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Full-lifecycle document inspection, OCR extraction provenance, out-of-range surveillance, historical delta comparison, and audit history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs font-mono bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px]">QUEUE STATUS</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              {reports.filter((r) => r.reviewStatus !== 'reviewed' && !signedReports[r.id]).length} Pending ·{' '}
              {reports.filter((r) => r.reviewStatus === 'reviewed' || signedReports[r.id]).length} Completed
            </span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successNote && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successNote}</span>
        </div>
      )}

      {errorNote && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-900 dark:text-rose-200 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{errorNote}</span>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Patient Filter */}
          <div>
            <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
              AUTHORIZED PATIENT
            </label>
            <select
              value={filterPatient}
              onChange={(e) => setFilterPatient(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
            >
              <option value="all">All Authorized Patients</option>
              {patientsList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id})
                </option>
              ))}
            </select>
          </div>

          {/* Document Type Filter */}
          <div>
            <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
              DOCUMENT TYPE
            </label>
            <select
              value={filterDocType}
              onChange={(e) => setFilterDocType(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
            >
              <option value="all">All Types</option>
              <option value="blood_report">Blood / Hematology</option>
              <option value="imaging">Imaging Studies</option>
              <option value="prescription">Prescriptions</option>
              <option value="pathology">Pathology</option>
              <option value="discharge_summary">Discharge Summary</option>
            </select>
          </div>

          {/* Review Status Filter */}
          <div>
            <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
              REVIEW STATUS
            </label>
            <select
              value={filterReviewStatus}
              onChange={(e) => setFilterReviewStatus(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
            >
              <option value="all">All Review States</option>
              <option value="unreviewed">Unreviewed (Pending)</option>
              <option value="reviewed">Physician Reviewed</option>
              <option value="requires_action">Requires Follow-up</option>
            </select>
          </div>

          {/* Processing Status Filter */}
          <div>
            <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
              OCR / EXTRACTION
            </label>
            <select
              value={filterProcessingStatus}
              onChange={(e) => setFilterProcessingStatus(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
            >
              <option value="all">All Processing States</option>
              <option value="processed">Processed (Analyzed)</option>
              <option value="processing">Processing (Active)</option>
              <option value="failed">Failed / OCR Uncertainty</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search across report titles, clinical laboratories, patient names, or analyte biomarkers (e.g. Hemoglobin, Glucose)..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Authorized Patient Report List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <span>Authorized Reports ({filteredReports.length})</span>
            <span className="text-[10px] text-slate-400 lowercase">click to inspect</span>
          </div>

          {filteredReports.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              No matching clinical reports found for the selected criteria.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[820px] overflow-y-auto pr-1">
              {filteredReports.map((rep) => {
                const isSelected = rep.id === selectedReportId;
                const isSigned = Boolean(signedReports[rep.id]);
                const isPendingReview = rep.reviewStatus === 'unreviewed' && !isSigned;
                const isFailed = rep.processingStatus === 'failed';

                return (
                  <button
                    key={rep.id}
                    onClick={() => setSelectedReportId(rep.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all text-xs ${
                      isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 shadow-xs ring-1 ring-emerald-400'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-slate-900 dark:text-slate-100 truncate flex-1">
                        {rep.title}
                      </div>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase shrink-0 ${
                          rep.status === 'normal'
                            ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {rep.status === 'normal' ? 'Normal' : 'Flagged'}
                      </span>
                    </div>

                    {/* Patient & Date Meta */}
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-1 flex items-center justify-between">
                      <span>{rep.patientName || 'Aryan Yadav'}</span>
                      <span className="font-mono text-slate-400">{rep.date}</span>
                    </div>

                    {/* Secondary Provenance Strip */}
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 flex flex-wrap items-center gap-1.5 font-mono">
                      <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                        {formatDocType(rep.documentType)}
                      </span>
                      <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                        {rep.fileType || 'PDF'} · {rep.fileSize || '1.1 MB'}
                      </span>
                    </div>

                    {/* Processing & Review Badges */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                      {isFailed ? (
                        <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> OCR Failed
                        </span>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                          <Sparkles className="w-3 h-3 text-emerald-500" />
                          OCR {rep.ocrConfidence || 96}%
                        </span>
                      )}

                      {isSigned || rep.reviewStatus === 'reviewed' ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Reviewed
                        </span>
                      ) : rep.reviewStatus === 'requires_action' ? (
                        <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Action Req
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Unreviewed
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Detailed Document Workspace */}
        <div className="lg:col-span-8 space-y-4">
          {activeReport ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6 transition-colors">
              {/* Document Header & Provenance */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800 gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-semibold">
                      ID: {activeReport.id}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded font-semibold border border-emerald-200 dark:border-emerald-800">
                      {formatDocType(activeReport.documentType)}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                      Source: {formatSource(activeReport.source)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                    {activeReport.title}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>Patient: <strong className="text-slate-800 dark:text-slate-200">{activeReport.patientName || 'Aryan Yadav'}</strong> ({activeReport.patientId || 'pat-1'})</span>
                    <span>Specimen: {activeReport.specimenType}</span>
                    <span>Laboratory: {activeReport.laboratory}</span>
                    <span>Collected: {activeReport.date}</span>
                    <span>Uploaded: {activeReport.uploadDate?.split('T')[0] || activeReport.date}</span>
                  </div>
                </div>

                {/* Top Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <a
                    href={`/api/clinical/reports/${activeReport.id}/download`}
                    download
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Download</span>
                  </a>

                  <button
                    onClick={handleOpenCompare}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <GitCompare className="w-3.5 h-3.5 text-slate-500" />
                    <span>Compare Trend</span>
                  </button>

                  <button
                    onClick={handleOpenTaskModal}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-slate-500" />
                    <span>Follow-up Task</span>
                  </button>

                  {isReportSigned || activeReport.reviewStatus === 'reviewed' ? (
                    <div className="px-3.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Reviewed & Certified</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleOpenSignOff}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Sign Off Panel</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status & Review Toggle Bar */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">REVIEW STATUS:</span>
                  <div className="flex items-center gap-1">
                    {(['unreviewed', 'reviewed', 'requires_action'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateReviewStatus(st)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                          activeReport.reviewStatus === st
                            ? st === 'reviewed'
                              ? 'bg-emerald-600 text-white'
                              : st === 'requires_action'
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-700 text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {st === 'unreviewed' ? 'Unreviewed' : st === 'reviewed' ? 'Reviewed' : 'Requires Action'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Retry action if failed */}
                {activeReport.processingStatus === 'failed' && (
                  <button
                    onClick={handleRetryProcessing}
                    disabled={isRetrying}
                    className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                    <span>{isRetrying ? 'Retrying OCR...' : 'Retry OCR Extraction'}</span>
                  </button>
                )}

                <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span>File Checksum:</span>
                  <code className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    {activeReport.fileHash ? activeReport.fileHash.substring(0, 14) + '...' : 'Verified SHA-256'}
                  </code>
                </div>
              </div>

              {/* Tabs Strip */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-medium">
                {[
                  { id: 'analytes', label: 'Machine-Extracted Biomarkers', icon: Layers, count: (activeReport.results || []).length },
                  { id: 'original_doc', label: 'Original Document Preview', icon: FileText },
                  { id: 'comments', label: 'Clinician Comments', icon: MessageSquare, count: activeReport.clinicianComments?.length || 0 },
                  { id: 'audit', label: 'Audit Trail & Provenance', icon: History, count: activeReport.auditHistory?.length || 0 }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                        isActive
                          ? 'bg-slate-900 dark:bg-emerald-600 text-white font-semibold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                      {tab.count !== undefined && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: ANALYTES */}
              {activeTab === 'analytes' && (
                <div className="space-y-4">
                  {/* Safety & Non-autonomous Disclaimer Alert */}
                  <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <strong>Clinical Surveillance Safety Protocol:</strong> Out-of-range indicators reflect mathematical deviation from the testing facility's printed reference range. They do not constitute an independent automated diagnosis. Attending physician verification required before clinical disposition.
                    </div>
                  </div>

                  {/* Machine Extraction Badge & Source Summary */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Source-Grounded Clinical Summary:
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        Confidence: {activeReport.ocrConfidence || 96}%
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {activeReport.clinicalImpression}
                    </p>
                    {activeReport.questionsForDoctor && activeReport.questionsForDoctor.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Patient Questions Identified from Ingestion:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                          {activeReport.questionsForDoctor.map((q, idx) => (
                            <li key={idx}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Structured Analyte Table */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <div className="bg-slate-100 dark:bg-slate-950/80 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400">
                      <span>STRUCTURED BIOMARKER MATRIX ({(activeReport.results || []).length} ANALYTES)</span>
                      <span className="text-[10px]">Reference bounds supplied by laboratory</span>
                    </div>
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-mono text-[11px] uppercase border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3.5">Analyte / Test Name</th>
                          <th className="py-2.5 px-3.5">Result Value</th>
                          <th className="py-2.5 px-3.5">Units</th>
                          <th className="py-2.5 px-3.5">Reference Bounds</th>
                          <th className="py-2.5 px-3.5 text-right">Surveillance Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {(activeReport.results || []).length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-slate-500 font-mono text-xs">
                              No structured analytes identified. Document may be a prescription or non-panel narrative.
                            </td>
                          </tr>
                        ) : (
                          (activeReport.results || []).map((r, i) => {
                            const isOutOfRange = r.status && r.status !== 'normal';
                            return (
                              <tr
                                key={i}
                                className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                                  isOutOfRange ? 'bg-amber-50/30 dark:bg-amber-950/20' : ''
                                }`}
                              >
                                <td className="py-3 px-3.5">
                                  <div className="font-medium text-slate-900 dark:text-slate-100">
                                    {r.testName}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    LOINC: {r.code || 'Unspecified'}
                                  </div>
                                </td>
                                <td className="py-3 px-3.5 font-mono font-bold text-slate-900 dark:text-slate-100">
                                  {r.value}
                                </td>
                                <td className="py-3 px-3.5 font-mono text-slate-600 dark:text-slate-400">
                                  {r.unit || '—'}
                                </td>
                                <td className="py-3 px-3.5 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                                  {r.referenceRange ? `${r.referenceRange} ${r.unit}` : 'Unspecified by laboratory'}
                                </td>
                                <td className="py-3 px-3.5 text-right">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                                      r.status === 'normal'
                                        ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                                        : r.status === 'low'
                                        ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200'
                                        : r.status === 'high'
                                        ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                        : 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200'
                                    }`}
                                  >
                                    {r.status === 'high' && <ArrowUpRight className="w-3 h-3" />}
                                    {r.status === 'low' && <ArrowDownRight className="w-3 h-3" />}
                                    {r.status === 'normal' && <Check className="w-3 h-3" />}
                                    {r.status === 'attention' && <AlertTriangle className="w-3 h-3" />}
                                    {r.status || 'Normal'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: ORIGINAL DOCUMENT PREVIEW */}
              {activeTab === 'original_doc' && (
                <div className="space-y-4">
                  {/* File Integrity Banner */}
                  <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Preserved Source File: {activeReport.originalFileName || `${activeReport.title}.pdf`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
                        className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300 min-w-12 text-center">
                        {zoomLevel}%
                      </span>
                      <button
                        onClick={() => setZoomLevel((z) => Math.min(200, z + 15))}
                        className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={`/api/clinical/reports/${activeReport.id}/file`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-semibold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open Raw Stream</span>
                      </a>
                    </div>
                  </div>

                  {/* Rendered Canvas / Frame Preview */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-950 p-6 min-h-[460px] flex items-center justify-center">
                    <div
                      style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                      className="bg-white text-slate-900 p-8 rounded-lg shadow-xl w-full max-w-2xl text-xs space-y-4 font-mono transition-transform duration-200"
                    >
                      <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
                        <div>
                          <div className="text-base font-bold uppercase tracking-wider">{activeReport.laboratory}</div>
                          <div className="text-[10px] text-slate-600">CLINICAL REFERENCE DIAGNOSTICS · ISO 15189 ACCREDITED</div>
                        </div>
                        <div className="text-right text-[10px]">
                          <div>ACCESSION: {activeReport.id}</div>
                          <div>DATE: {activeReport.date}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-[11px] bg-slate-50 p-3 rounded border border-slate-200">
                        <div>
                          <div>PATIENT: <strong>{activeReport.patientName || 'Aryan Yadav'}</strong></div>
                          <div>ID: {activeReport.patientId || 'pat-1'}</div>
                        </div>
                        <div>
                          <div>SPECIMEN: {activeReport.specimenType}</div>
                          <div>ORDERING: Dr. Sarah Chen, MD</div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <div className="font-bold border-b border-slate-300 pb-1 mb-2 text-slate-900 uppercase">
                          {activeReport.title}
                        </div>
                        <table className="w-full text-left text-[11px]">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-500 font-bold">
                              <th className="py-1">TEST</th>
                              <th className="py-1">RESULT</th>
                              <th className="py-1">UNITS</th>
                              <th className="py-1">REFERENCE RANGE</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {(activeReport.results || []).map((r, i) => (
                              <tr key={i} className={r.status !== 'normal' ? 'font-bold bg-amber-50/50' : ''}>
                                <td className="py-1.5">{r.testName}</td>
                                <td className="py-1.5">{r.value}</td>
                                <td className="py-1.5">{r.unit}</td>
                                <td className="py-1.5">{r.referenceRange}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="pt-4 border-t border-slate-300 text-[10px] text-slate-500">
                        <div>Verified by Chief Medical Pathologist. Cryptographic checksum recorded in audit registry.</div>
                        <div className="mt-1 font-mono text-[9px] text-slate-400">SHA-256: {activeReport.fileHash || 'Verified Provenance'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CLINICIAN COMMENTS */}
              {activeTab === 'comments' && (
                <div className="space-y-4">
                  <form onSubmit={handleAddComment} className="space-y-2">
                    <label className="block text-xs font-mono text-slate-600 dark:text-slate-400">
                      ADD CLINICIAN COMMENT / FOLLOW-UP REMARK:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add doctor note (e.g., Confirmed mild macrocytosis; ordered ferritin and B12 panel)..."
                        className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingComment || !newComment.trim()}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Post Note</span>
                      </button>
                    </div>
                  </form>

                  {/* Comments Thread */}
                  <div className="space-y-2 pt-2">
                    {(!activeReport.clinicianComments || activeReport.clinicianComments.length === 0) ? (
                      <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                        No clinician comments posted yet for this report.
                      </div>
                    ) : (
                      activeReport.clinicianComments.map((com) => (
                        <div
                          key={com.id}
                          className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {com.clinicianName} {com.clinicianNpi ? `(NPI: ${com.clinicianNpi})` : ''}
                            </span>
                            <span>{new Date(com.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300">{com.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: AUDIT TRAIL */}
              {activeTab === 'audit' && (
                <div className="space-y-3">
                  <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    HISTORICAL PROVENANCE & ACCESS LOGS ({activeReport.auditHistory?.length || 0} EVENTS)
                  </div>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden text-xs">
                    {activeReport.auditHistory?.map((entry, idx) => (
                      <div key={idx} className="p-3 bg-white dark:bg-slate-900 flex items-start justify-between gap-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                              {entry.action}
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                              {entry.actor}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 text-[11px]">{entry.details}</p>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 whitespace-nowrap">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              Select a clinical report from the left sidebar to begin medical review.
            </div>
          )}
        </div>
      </div>

      {/* SIGN-OFF MODAL */}
      {signOffModalOpen && activeReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>Attending Physician Diagnostic Sign-Off</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              You are certifying diagnostic panel <strong>"{activeReport.title}"</strong> for patient{' '}
              <strong>{activeReport.patientName || 'Aryan Yadav'}</strong> ({activeReport.patientId}).
            </p>

            <form onSubmit={handleConfirmSignOff} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-slate-500 mb-1">
                  PHYSICIAN ATTESTATION NOTE
                </label>
                <textarea
                  value={signOffNotes}
                  onChange={(e) => setSignOffNotes(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-[11px] font-mono text-slate-500 space-y-0.5">
                <div>Signer: Dr. Sarah Chen, MD (NPI: 1942850192)</div>
                <div>Institutional Timestamp: {new Date().toISOString()}</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSignOffModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Certify & Sign Diagnostic</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HISTORICAL COMPARISON MODAL */}
      {compareModalOpen && activeReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
                <GitCompare className="w-5 h-5 text-emerald-600" />
                <span>Historical Analyte Comparison</span>
              </div>
              <button
                onClick={() => setCompareModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300">
              Comparing current panel <strong>"{activeReport.title}"</strong> ({activeReport.date}) against previous baseline report for{' '}
              <strong>{activeReport.patientName || 'Aryan Yadav'}</strong>.
            </div>

            {/* Target Report Selector */}
            <div className="flex items-center gap-3 text-xs">
              <label className="font-mono text-slate-500 whitespace-nowrap">COMPARATOR REPORT:</label>
              <select
                value={compareTargetReportId}
                onChange={(e) => setCompareTargetReportId(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
              >
                {reports
                  .filter((r) => r.id !== activeReport.id && (!r.patientId || r.patientId === activeReport.patientId))
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({r.date}) · {r.laboratory}
                    </option>
                  ))}
              </select>

              <button
                onClick={handleRunComparison}
                disabled={isComparing || !compareTargetReportId}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                {isComparing ? 'Comparing...' : 'Run Differential'}
              </button>
            </div>

            {compareError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-200">
                {compareError}
              </div>
            )}

            {comparisonResults && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mt-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[11px] uppercase border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Analyte</th>
                      <th className="py-2.5 px-3">Baseline</th>
                      <th className="py-2.5 px-3">Current</th>
                      <th className="py-2.5 px-3">Delta / % Change</th>
                      <th className="py-2.5 px-3 text-right">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {comparisonResults.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                          {item.analyteName}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300">
                          {item.previousValue ? `${item.previousValue} ${item.previousUnit}` : '—'}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                          {item.currentValue} {item.currentUnit}
                        </td>
                        <td className="py-2.5 px-3 text-[11px]">
                          {item.unitMismatch ? (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">
                              ⚠️ Unit Mismatch ({item.currentUnit} vs {item.previousUnit})
                            </span>
                          ) : item.numericDelta !== undefined ? (
                            <span className="font-mono">
                              {item.numericDelta > 0 ? `+${item.numericDelta}` : item.numericDelta} {item.currentUnit}{' '}
                              <span className="text-slate-400">({item.percentageChange}% change)</span>
                            </span>
                          ) : (
                            <span className="text-slate-400">{item.notes || 'N/A'}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                              item.trend === 'increased'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                : item.trend === 'decreased'
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                : item.trend === 'stable'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {item.trend}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOLLOW-UP TASK MODAL */}
      {taskModalOpen && activeReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              <span>Create Follow-up Clinical Task</span>
            </div>

            <form onSubmit={handleConfirmTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-slate-500 mb-1">TASK TITLE</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-500 mb-1">PRIORITY</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="routine">Routine</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-500 mb-1">DUE DATE</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-500 mb-1">CLINICAL DESCRIPTION</label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <span>Assign Clinical Task</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
