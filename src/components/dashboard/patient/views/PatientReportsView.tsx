import React, { useState, useEffect, useRef } from 'react';
import { RoutePath, MedicalReportRecord, LabResultItem } from '../../../../types';
import { clinicalStore } from '../../../../services/clinicalStore';
import {
  processMedicalFile,
  DocumentProcessor
} from '../../../../services/documentProcessor';
import {
  saveDocument,
  saveChunks,
  deleteDocument as deleteChatDoc,
  updateDocument as updateChatDoc,
  getDocuments,
  createConversation,
  updateConversation
} from '../../../../services/chatStore';
import { ChatDocument } from '../../../../types/chat';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Download,
  X,
  FileCheck,
  Sparkles,
  Trash2,
  Edit3,
  Search,
  Bot,
  Eye,
  Layers,
  Table,
  LayoutGrid,
  FileWarning,
  Clock,
  ExternalLink
} from 'lucide-react';

interface PatientReportsViewProps {
  onNavigate: (route: RoutePath) => void;
}

type ViewMode = 'master-detail' | 'table';
type CategoryFilter = 'all' | 'blood_report' | 'imaging' | 'prescription' | 'discharge' | 'general';
type StatusFilter = 'all' | 'normal' | 'review_recommended';

export const PatientReportsView: React.FC<PatientReportsViewProps> = ({ onNavigate }) => {
  const [reports, setReports] = useState<MedicalReportRecord[]>(clinicalStore.getReports());
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || 'rep-1');
  const [selectedAnalyte, setSelectedAnalyte] = useState<LabResultItem | null>(null);

  // UI States
  const [viewMode, setViewMode] = useState<ViewMode>('master-detail');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [reportToRename, setReportToRename] = useState<MedicalReportRecord | null>(null);
  const [newReportTitle, setNewReportTitle] = useState('');
  const [newReportCategory, setNewReportCategory] = useState<string>('blood_report');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Subscribe to clinicalStore updates
  useEffect(() => {
    return clinicalStore.subscribe(() => {
      const updated = clinicalStore.getReports();
      setReports(updated);
      if (!updated.some((r) => r.id === selectedReportId) && updated.length > 0) {
        setSelectedReportId(updated[0].id);
      }
    });
  }, [selectedReportId]);

  const activeReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  // Find linked ChatDocument for full text preview
  const chatDocuments = getDocuments();
  const linkedChatDoc = chatDocuments.find(
    (d) =>
      d.id === activeReport?.id ||
      d.filename.toLowerCase().includes(activeReport?.title.toLowerCase().substring(0, 10))
  );

  // File Upload Handler
  const handleFileUpload = async (file: File) => {
    setUploadError(null);

    // 1. Validation
    const validation = DocumentProcessor.validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file.');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(15);
    setProcessingStep('Validating file integrity & clinical schema...');

    try {
      await new Promise((r) => setTimeout(r, 400));
      setProcessingProgress(35);
      setProcessingStep('Extracting medical text, lab streams & running OCR...');

      // 2. Real text extraction & OCR
      const processed = await processMedicalFile(file, 'conv-reports', 'pat-1');

      setProcessingProgress(65);
      setProcessingStep('Parsing biomarkers, analyte intervals & clinical entities...');
      await new Promise((r) => setTimeout(r, 350));

      setProcessingProgress(85);
      setProcessingStep('Generating semantic chunks & vector indices for RAG...');

      // 3. Save to Chat Store (RAG)
      saveDocument(processed.document);
      saveChunks(processed.chunks);

      // 4. Save to Clinical Store (Reports Record)
      const newRecord: MedicalReportRecord = {
        id: processed.document.id,
        patientId: 'pat-1',
        patientName: 'Aryan Yadav',
        title: processed.reportRecord?.title || file.name.replace(/\.[^/.]+$/, ''),
        date: processed.reportRecord?.date || new Date().toISOString().split('T')[0],
        uploadDate: new Date().toISOString(),
        laboratory: processed.reportRecord?.laboratory || 'Clinical Reference Diagnostics',
        specimenType: processed.reportRecord?.specimenType || 'Serum / Venous Blood',
        status: processed.reportRecord?.status || 'normal',
        fileSize: processed.reportRecord?.fileSize || `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        fileType: processed.reportRecord?.fileType || file.name.split('.').pop()?.toUpperCase() || 'PDF',
        documentType: (newReportCategory as any) || 'blood_report',
        source: 'patient_portal',
        processingStatus: 'processed',
        reviewStatus: 'unreviewed',
        results: processed.reportRecord?.results || [],
        clinicalImpression:
          processed.reportRecord?.clinicalImpression ||
          'Diagnostic report successfully processed and indexed into your medical record.',
        questionsForDoctor: processed.reportRecord?.questionsForDoctor || []
      };

      clinicalStore.addReport(newRecord);
      setSelectedReportId(newRecord.id);

      setProcessingProgress(100);
      setProcessingStep('Complete!');
      await new Promise((r) => setTimeout(r, 300));

      setIsUploadModalOpen(false);
      setSuccessToast(`"${file.name}" successfully analyzed: ${(newRecord.results || []).length} analytes indexed.`);
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err: any) {
      console.error('File processing failed:', err);
      setUploadError(err?.message || 'Failed to process document.');
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
      setProcessingStep('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Delete Report
  const handleDeleteReport = (report: MedicalReportRecord) => {
    if (confirm(`Are you sure you want to delete "${report.title}"? This will remove it from your records and AI chat context.`)) {
      clinicalStore.deleteReport(report.id);
      deleteChatDoc(report.id);
      setSuccessToast(`Report "${report.title}" removed.`);
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  // Open Rename Modal
  const handleOpenRename = (report: MedicalReportRecord) => {
    setReportToRename(report);
    setNewReportTitle(report.title);
    const spec = (report.specimenType || '').toLowerCase();
    setNewReportCategory(
      spec.includes('imaging')
        ? 'imaging'
        : spec.includes('presc')
        ? 'prescription'
        : 'blood_report'
    );
    setIsRenameModalOpen(true);
  };

  // Submit Rename
  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportToRename || !newReportTitle.trim()) return;

    clinicalStore.updateReport(reportToRename.id, {
      title: newReportTitle.trim(),
      specimenType:
        newReportCategory === 'imaging'
          ? 'Diagnostic Imaging Study'
          : newReportCategory === 'prescription'
          ? 'Clinical Prescription'
          : reportToRename.specimenType
    });

    updateChatDoc(reportToRename.id, {
      filename: newReportTitle.trim()
    });

    setIsRenameModalOpen(false);
    setSuccessToast(`Report updated to "${newReportTitle.trim()}".`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Download Extracted Clinical Summary
  const handleDownloadReport = (report: MedicalReportRecord) => {
    const lines = [
      `=============================================================`,
      `MEDICAL AI CLINICAL REPORT SUMMARY`,
      `=============================================================`,
      `Title:        ${report.title}`,
      `Date:         ${report.date}`,
      `Laboratory:   ${report.laboratory}`,
      `Specimen:     ${report.specimenType}`,
      `Clinical Status: ${report.status.toUpperCase()}`,
      `File Format:  ${report.fileType} (${report.fileSize})`,
      `-------------------------------------------------------------`,
      `AI CLINICAL IMPRESSION:`,
      report.clinicalImpression,
      `-------------------------------------------------------------`,
      `EXTRACTED BIOMARKERS & ANALYTES (${(report.results || []).length}):`,
      ...(report.results || []).map(
        (r) =>
          `- ${r.testName}: ${r.value} ${r.unit} (Ref: ${r.referenceRange} ${r.unit}) [${r.status.toUpperCase()}]`
      ),
      `-------------------------------------------------------------`,
      `SUGGESTED QUESTIONS FOR YOUR DOCTOR:`,
      ...(report.questionsForDoctor || []).map((q, idx) => `${idx + 1}. ${q}`),
      `=============================================================`,
      `Verified Diagnostic Repository | Medical AI Clinical Platform`
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, '_')}_Clinical_Summary.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Direct AI Chat Deep Link
  const handleChatAboutReport = (report: MedicalReportRecord) => {
    // Ensure document is linked in a conversation
    const doc = chatDocuments.find((d) => d.id === report.id || d.filename.includes(report.title));
    if (doc) {
      const conv = createConversation('demo-user-default', `Analysis: ${report.title}`, 'en', 'document');
      updateConversation(conv.id, { documentIds: [doc.id] });
    }
    onNavigate('/dashboard/chat');
  };

  // Filtered reports calculation
  const filteredReports = reports.filter((rep) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = rep.title.toLowerCase().includes(q);
      const matchesLab = (rep.laboratory || '').toLowerCase().includes(q);
      const matchesResults = (rep.results || []).some((r) => r.testName.toLowerCase().includes(q));
      const matchesImpression = (rep.clinicalImpression || '').toLowerCase().includes(q);
      if (!matchesTitle && !matchesLab && !matchesResults && !matchesImpression) {
        return false;
      }
    }

    // Category filter
    if (categoryFilter !== 'all') {
      const spec = (rep.specimenType || '').toLowerCase();
      if (categoryFilter === 'blood_report' && !spec.includes('blood') && !spec.includes('serum')) return false;
      if (categoryFilter === 'imaging' && !spec.includes('imaging') && !spec.includes('mri') && !spec.includes('x-ray')) return false;
      if (categoryFilter === 'prescription' && !spec.includes('prescription')) return false;
      if (categoryFilter === 'discharge' && !spec.includes('inpatient') && !spec.includes('discharge')) return false;
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (rep.status !== statusFilter) return false;
    }

    return true;
  });

  // Count stats
  const totalReportsCount = reports.length;
  const reviewCount = reports.filter((r) => r.status === 'review_recommended' || r.status === 'critical').length;
  const normalCount = reports.filter((r) => r.status === 'normal').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Quick Metrics */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-emerald-700 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Diagnostic Intelligence · Medical Records</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
            Medical Records & Document Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Encrypted laboratory diagnostic extraction, OCR processing, clinical biomarker tracking, and RAG-powered Q&A.
          </p>
        </div>

        {/* Action Button & Metric Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">Total:</span>
            <strong className="text-slate-900 dark:text-white">{totalReportsCount}</strong>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-amber-600 dark:text-amber-400">Flagged:</span>
            <strong className="text-amber-600 dark:text-amber-400">{reviewCount}</strong>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-emerald-600 dark:text-emerald-400">Normal:</span>
            <strong className="text-emerald-600 dark:text-emerald-400">{normalCount}</strong>
          </div>

          <button
            onClick={() => {
              setUploadError(null);
              setIsUploadModalOpen(true);
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Medical File</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {successToast && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium">{successToast}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by analyte, report, or lab..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Controls: Status & View Toggle */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              aria-label="Filter records by clinical status"
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Clinical Statuses</option>
              <option value="normal">In-Range / Normal Only</option>
              <option value="review_recommended">Review Recommended Only</option>
            </select>

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('master-detail')}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'master-detail'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Master-Detail View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Split View</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="All Records Table"
              >
                <Table className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table View</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Documents', count: reports.length },
            {
              id: 'blood_report',
              label: 'Blood & Metabolic Panels',
              count: reports.filter((r) => (r.specimenType || '').toLowerCase().includes('blood') || (r.specimenType || '').toLowerCase().includes('serum')).length
            },
            {
              id: 'imaging',
              label: 'Imaging & Radiology',
              count: reports.filter((r) => (r.specimenType || '').toLowerCase().includes('imaging')).length
            },
            {
              id: 'prescription',
              label: 'Prescriptions',
              count: reports.filter((r) => (r.specimenType || '').toLowerCase().includes('prescription')).length
            },
            {
              id: 'discharge',
              label: 'Discharge Summaries',
              count: reports.filter((r) => (r.specimenType || '').toLowerCase().includes('inpatient')).length
            }
          ].map((tab) => {
            const isActive = categoryFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id as CategoryFilter)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {filteredReports.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center space-y-3">
          <FileWarning className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">No medical records match your filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or upload a new medical PDF, prescription image, or laboratory scan.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('all');
              setStatusFilter('all');
            }}
            className="px-3.5 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            Clear all filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Full Table View */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-mono text-[11px] uppercase border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Report Title</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Laboratory</th>
                  <th className="py-3 px-4">Analytes</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredReports.map((rep) => {
                  const isNormal = rep.status === 'normal';
                  return (
                    <tr key={rep.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{rep.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {rep.fileType} · {rep.fileSize}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">{rep.date}</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{rep.laboratory}</td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {(rep.results || []).length} biomarkers
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase font-mono ${
                            isNormal
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                          }`}
                        >
                          {isNormal ? 'Normal' : 'Flagged'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedReportId(rep.id);
                              setViewMode('master-detail');
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Inspect Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleChatAboutReport(rep)}
                            className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                            title="Ask AI in Chat"
                          >
                            <Bot className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownloadReport(rep)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Download Clinical Summary"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteReport(rep)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Delete Report"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Split Master-Detail Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: List of Report Cards */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider px-1 flex items-center justify-between">
              <span>Available Documents ({filteredReports.length})</span>
              <span className="text-[11px] font-normal text-slate-400">Click to inspect</span>
            </div>

            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
              {filteredReports.map((rep) => {
                const isSelected = rep.id === selectedReportId;
                const isNormal = rep.status === 'normal';
                return (
                  <button
                    key={rep.id}
                    onClick={() => {
                      setSelectedReportId(rep.id);
                      setSelectedAnalyte(null);
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {rep.title}
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase font-mono shrink-0 ${
                          isNormal
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                        }`}
                      >
                        {isNormal ? 'Normal' : 'Flagged'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 font-mono">
                      <span>{rep.date}</span>
                      <span>·</span>
                      <span className="truncate">{rep.laboratory}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-mono">
                      <span>{rep.fileType} · {rep.fileSize}</span>
                      <span className="text-blue-600 dark:text-blue-400 font-sans font-medium">
                        {(rep.results || []).length} analytes
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Privacy Sandboxing Box */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Encrypted Patient Isolation</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Medical reports are sandboxed to your patient ID. Extracted biomarkers feed your personal AI clinical profile without exposing raw file URLs.
              </p>
            </div>
          </div>

          {/* Right Column: Active Record Detail Panel */}
          <div className="lg:col-span-8 space-y-6">
            {activeReport && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6 transition-colors">
                {/* Header Info & Action Toolbar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">{activeReport.title}</h2>
                      <button
                        onClick={() => handleOpenRename(activeReport)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="Rename or re-categorize"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-3 mt-1 font-mono">
                      <span>Specimen: {activeReport.specimenType}</span>
                      <span>·</span>
                      <span>Collected: {activeReport.date}</span>
                      <span>·</span>
                      <span>Lab: {activeReport.laboratory}</span>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <button
                      onClick={() => handleChatAboutReport(activeReport)}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Open in Medical AI Chatbot with document RAG context"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Ask AI in Chat</span>
                    </button>

                    <button
                      onClick={() => setIsPreviewModalOpen(true)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="View Extracted Text Preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Full Preview</span>
                    </button>

                    <button
                      onClick={() => handleDownloadReport(activeReport)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                      title="Download Clinical Summary"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteReport(activeReport)}
                      className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                      title="Delete this record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* AI Clinical Context & Impression Box */}
                <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-300">
                      <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>AI Clinical Synthesis & Key Findings</span>
                    </div>
                    <span className="text-[10px] font-mono font-medium text-blue-700 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-900/50 px-2 py-0.5 rounded">
                      Grounded in Document
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {activeReport.clinicalImpression}
                  </p>
                </div>

                {/* Analyte Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span>Processed Biomarkers & Analytes ({(activeReport.results || []).length})</span>
                    <span className="text-[11px] font-normal text-slate-500">
                      Click any row for patient explanation
                    </span>
                  </div>

                  {(activeReport.results || []).length === 0 ? (
                    <div className="p-6 text-center border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500">
                      No tabular laboratory metrics detected. Click <strong>Full Preview</strong> to read extracted narrative findings.
                    </div>
                  ) : (
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[11px] uppercase border-b border-slate-200 dark:border-slate-700">
                            <tr>
                              <th className="py-2.5 px-3.5">Test Name</th>
                              <th className="py-2.5 px-3.5">Observed Result</th>
                              <th className="py-2.5 px-3.5">Reference Range</th>
                              <th className="py-2.5 px-3.5 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {(activeReport.results || []).map((item, idx) => {
                              const isNormal = item.status === 'normal';
                              const isSelected = selectedAnalyte?.testName === item.testName;
                              return (
                                <tr
                                  key={idx}
                                  onClick={() => setSelectedAnalyte(item)}
                                  className={`cursor-pointer transition-colors ${
                                    isSelected
                                      ? 'bg-blue-50/70 dark:bg-blue-950/40 font-semibold'
                                      : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                                  }`}
                                >
                                  <td className="py-3 px-3.5 font-medium text-slate-900 dark:text-white">
                                    <div>{item.testName}</div>
                                    <span className="text-[10px] text-slate-400 font-mono">{item.code}</span>
                                  </td>
                                  <td className="py-3 px-3.5 font-mono font-bold text-slate-900 dark:text-white">
                                    {item.value}{' '}
                                    <span className="text-[10px] text-slate-500 font-normal">{item.unit}</span>
                                  </td>
                                  <td className="py-3 px-3.5 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                                    {item.referenceRange} {item.unit}
                                  </td>
                                  <td className="py-3 px-3.5 text-right">
                                    <span
                                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                                        isNormal
                                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                      }`}
                                    >
                                      {item.status}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected Analyte Detail Card */}
                {selectedAnalyte && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-blue-200 dark:border-blue-900 space-y-2 text-xs animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {selectedAnalyte.testName} Clinical Explanation
                      </span>
                      <button
                        onClick={() => setSelectedAnalyte(null)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedAnalyte.explanation}</p>
                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1">
                      Observed: <strong className="text-slate-900 dark:text-white">{selectedAnalyte.value} {selectedAnalyte.unit}</strong> · Standard Target Range: {selectedAnalyte.referenceRange} {selectedAnalyte.unit}
                    </div>
                  </div>
                )}

                {/* Suggested Questions for Doctor */}
                {activeReport.questionsForDoctor && activeReport.questionsForDoctor.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>Suggested Questions for Your Attending Physician</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {activeReport.questionsForDoctor.map((q, qIdx) => (
                        <li
                          key={qIdx}
                          className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                        >
                          <ChevronRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Document Metadata Footer */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono gap-2">
                  <div className="flex items-center gap-3">
                    <span>ID: {activeReport.id}</span>
                    <span>·</span>
                    <span>Format: {activeReport.fileType}</span>
                    <span>·</span>
                    <span>Size: {activeReport.fileSize}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>RAG Knowledge Index Active</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Modal with Multi-Stage Progress */}
      {isUploadModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Upload & Analyze Medical Record
                </h3>
              </div>
              {!isProcessing && (
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {uploadError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {isProcessing ? (
              <div className="py-8 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Processing Medical Record
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{processingStep}</p>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden max-w-xs mx-auto">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Drag & Drop Area */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-8 border-2 border-dashed rounded-2xl text-center space-y-2 cursor-pointer transition-all ${
                    isDragOver
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.doc,.txt,.csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                      Choose file or drag & drop here
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      PDF, JPG, PNG, WEBP, Word (DOCX), CSV, or TXT
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[10px] font-mono text-slate-500">
                    <span>Max Size: 20 MB</span>
                    <span>·</span>
                    <span>Automatic OCR & Biomarker Extraction</span>
                  </div>
                </div>

                {/* Pipeline Capabilities Information */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Real-time Clinical Pipeline Features:</span>
                  </div>
                  <ul className="text-[11px] space-y-1 list-disc list-inside">
                    <li>Extracts blood test metrics, normal bounds & out-of-range flags</li>
                    <li>OCR engine parses scanned lab receipts & prescriptions</li>
                    <li>Automatic vector chunking connects file directly to AI Chatbot RAG</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Document Preview Modal */}
      {isPreviewModalOpen && activeReport && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {activeReport.title} · Document Preview
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {activeReport.laboratory} · {activeReport.date}
                </span>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Extracted Text Viewer */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                  Extracted Raw & OCR Text:
                </span>
                <pre className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-800 dark:text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                  {linkedChatDoc?.extractedText ||
                    `METRO CLINICAL REFERENCE LABORATORY\nTitle: ${activeReport.title}\nLaboratory: ${activeReport.laboratory}\nDate: ${activeReport.date}\nClinical Findings:\n${activeReport.clinicalImpression}`}
                </pre>
              </div>

              {/* Analyte Recap */}
              {(activeReport.results || []).length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                    Structured Biomarkers Extracted ({(activeReport.results || []).length}):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(activeReport.results || []).map((r, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs"
                      >
                        <div className="font-semibold text-slate-900 dark:text-white truncate">{r.testName}</div>
                        <div className="text-[11px] font-mono text-slate-600 dark:text-slate-300">
                          {r.value} {r.unit}
                        </div>
                        <span
                          className={`text-[9px] font-bold uppercase font-mono px-1.5 py-0.2 rounded ${
                            r.status === 'normal'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <button
                onClick={() => handleDownloadReport(activeReport)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Text</span>
              </button>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename & Re-categorize Modal */}
      {isRenameModalOpen && reportToRename && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Edit Document Details</h3>
              <button
                onClick={() => setIsRenameModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRename} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  value={newReportTitle}
                  onChange={(e) => setNewReportTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={newReportCategory}
                  onChange={(e) => setNewReportCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="blood_report">Blood & Metabolic Report</option>
                  <option value="imaging">Radiology & Imaging</option>
                  <option value="prescription">Prescription / Medication</option>
                  <option value="discharge">Discharge Summary</option>
                  <option value="general">General Medical Consultation</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRenameModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
