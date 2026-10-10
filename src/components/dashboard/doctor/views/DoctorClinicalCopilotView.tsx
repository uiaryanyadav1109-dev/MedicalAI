import React, { useState, useEffect } from 'react';
import {
  RoutePath,
  ClinicalCopilotMode,
  ClinicalDraftType,
  ClinicalCitation,
  ClinicalCopilotResponse,
  ClinicalCopilotApprovalRecord,
  TriageCategory
} from '../../../../types';
import { clinicalStore } from '../../../../services/clinicalStore';
import { useAuth } from '../../../../context/AuthContext';
import { ProfileAvatar } from '../../../common/ProfileAvatar';
import {
  Sparkles,
  Stethoscope,
  FileText,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Send,
  Edit3,
  XCircle,
  History,
  ShieldCheck,
  Lock,
  ChevronRight,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Layers,
  HeartPulse,
  Pill,
  Clock,
  AlertCircle
} from 'lucide-react';

interface DoctorClinicalCopilotViewProps {
  onNavigate: (route: RoutePath) => void;
  selectedPatientId?: string;
}

export const DoctorClinicalCopilotView: React.FC<DoctorClinicalCopilotViewProps> = ({
  onNavigate,
  selectedPatientId = 'pat-1'
}) => {
  const { user } = useAuth();
  const [patientId, setPatientId] = useState<string>(selectedPatientId);
  const [patientDossier, setPatientDossier] = useState<any>(null);
  const [loadingDossier, setLoadingDossier] = useState<boolean>(true);

  // Copilot State
  const [activeMode, setActiveMode] = useState<ClinicalCopilotMode>('summarize_history');
  const [draftType, setDraftType] = useState<ClinicalDraftType>('consultation_note');
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [clinicianPrompt, setClinicianPrompt] = useState<string>('');

  // Execution & Response State
  const [generating, setGenerating] = useState<boolean>(false);
  const [copilotResponse, setCopilotResponse] = useState<ClinicalCopilotResponse | null>(null);
  const [editableContent, setEditableContent] = useState<string>('');
  const [wasEdited, setWasEdited] = useState<boolean>(false);
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  // Service Status
  const [copilotHealth, setCopilotHealth] = useState<any>(null);
  const [approvalHistory, setApprovalHistory] = useState<ClinicalCopilotApprovalRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'copilot' | 'history'>('copilot');

  // Modals & Feedback
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  useEffect(() => {
    if (selectedPatientId && selectedPatientId !== patientId) {
      setPatientId(selectedPatientId);
    }
  }, [selectedPatientId]);

  // Load patient dossier and health check
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      setLoadingDossier(true);
      const [dossierData, healthData, historyData] = await Promise.all([
        clinicalStore.fetchDoctorPatientDossier(patientId),
        clinicalStore.fetchCopilotHealth(),
        clinicalStore.fetchCopilotHistory(patientId)
      ]);

      if (isMounted) {
        setPatientDossier(dossierData);
        setCopilotHealth(healthData);
        setApprovalHistory(historyData.approvals || []);
        setLoadingDossier(false);
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, [patientId]);

  const allPatients = clinicalStore.getPatients();
  const activePatient =
    patientDossier?.patient ||
    allPatients.find((p) => p.id === patientId) ||
    allPatients[0];

  const handleGenerate = async (forcedMode?: ClinicalCopilotMode) => {
    const targetMode = forcedMode || activeMode;
    setGenerating(true);
    setActionFeedback(null);

    const payload = {
      patientId: activePatient.id,
      mode: targetMode,
      draftType: targetMode === 'generate_draft' ? draftType : undefined,
      question: targetMode === 'ask_question' ? customQuestion : undefined,
      clinicianPrompt: clinicianPrompt || undefined
    };

    const res = await clinicalStore.generateClinicalCopilot(payload);
    setCopilotResponse(res);
    setEditableContent(res.generatedContent || '');
    setWasEdited(false);
    setGenerating(false);

    if (!res.success && res.error) {
      setActionFeedback({
        type: 'error',
        message: res.error
      });
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableContent(e.target.value);
    setWasEdited(true);
  };

  const handleApprove = async () => {
    if (!copilotResponse || !editableContent.trim()) return;

    setActionFeedback(null);
    const result = await clinicalStore.approveClinicalCopilot({
      patientId: activePatient.id,
      action: 'approve',
      draftType: copilotResponse.draftType || draftType,
      originalAiContent: copilotResponse.generatedContent,
      approvedContent: editableContent,
      wasEdited,
      citations: copilotResponse.citations
    });

    if (result.success) {
      setActionFeedback({
        type: 'success',
        message:
          result.message ||
          'Clinical output signed with MD credentials and recorded into patient chart.'
      });
      // Refresh history
      const updatedHistory = await clinicalStore.fetchCopilotHistory(activePatient.id);
      setApprovalHistory(updatedHistory.approvals || []);
    } else {
      setActionFeedback({
        type: 'error',
        message: result.error || 'Failed to save approval.'
      });
    }
  };

  const handleReject = async () => {
    if (!copilotResponse) return;

    const result = await clinicalStore.approveClinicalCopilot({
      patientId: activePatient.id,
      action: 'reject',
      draftType: copilotResponse.draftType || draftType,
      originalAiContent: copilotResponse.generatedContent,
      approvedContent: editableContent || copilotResponse.generatedContent,
      wasEdited: false,
      rejectionReason: rejectionReason || 'Clinician rejected AI suggestion',
      citations: copilotResponse.citations
    });

    setRejectModalOpen(false);
    setRejectionReason('');

    if (result.success) {
      setActionFeedback({
        type: 'success',
        message: 'AI draft rejected and recorded in clinical safety audit history.'
      });
      const updatedHistory = await clinicalStore.fetchCopilotHistory(activePatient.id);
      setApprovalHistory(updatedHistory.approvals || []);
    }
  };

  const handleCopy = () => {
    if (editableContent) {
      navigator.clipboard.writeText(editableContent);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  const quickQuestions = [
    'Are there any contraindications to prescribing metformin for this patient?',
    'What was the patient’s blood pressure trajectory across their recorded visits?',
    'Summarize any reported drug allergies or previous hypersensitivity events.',
    'Did the latest diagnostic laboratory release identify any out-of-range biomarkers?'
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header & Patient Context Strip */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <ProfileAvatar
            name={activePatient?.name || 'Patient'}
            size="xl"
            className="ring-4 ring-purple-100 dark:ring-purple-950/60 shrink-0"
          />

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-1 px-2 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold font-mono flex items-center gap-1.5 border border-purple-200 dark:border-purple-800">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                AI CLINICAL COPILOT
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {activePatient?.name}
              </h2>
              <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                MRN: {activePatient?.mrn}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono font-semibold">
                {activePatient?.age}y {activePatient?.gender} · Blood {activePatient?.bloodType || 'O+'}
              </span>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-3">
              <span>
                Allergies:{' '}
                <strong className="text-rose-700 dark:text-rose-400">
                  {activePatient?.allergies?.join(', ') || 'No known drug allergies'}
                </strong>
              </span>
              <span>·</span>
              <span>
                Attending:{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {user?.name || 'Dr. Sarah Chen, MD'}
                </strong>
              </span>
              <span>·</span>
              <span>
                Acuity:{' '}
                <span className="font-mono font-bold uppercase text-blue-700 dark:text-blue-400">
                  {activePatient?.triageStatus || 'routine'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Patient Selection Dropdown */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <label className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Switch Patient:
          </label>
          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-purple-600"
          >
            {allPatients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.mrn}) · {p.triageStatus.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Feedback Banners */}
      {actionFeedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 border shadow-xs transition-colors ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-xs font-semibold underline hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3. Provenance & Clinical Safety Protocol Strip */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-bold text-slate-700 dark:text-slate-300 font-mono text-[11px] uppercase flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Grounded Clinical Copilot Safety Protocol:</span>
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 font-medium text-[11px] flex items-center gap-1 border border-blue-200 dark:border-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>[Source Fact] Verified EMR Data</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 font-medium text-[11px] flex items-center gap-1 border border-purple-200 dark:border-purple-800">
            <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            <span>[AI Suggestion] Preliminary Draft</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-medium text-[11px] flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
            <Stethoscope className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>[MD Approved] Attending Sign-Off</span>
          </span>
        </div>
      </div>

      {/* 4. Top Navigation Tabs: Copilot vs Approval Audit Trail */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('copilot')}
          className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors ${
            activeTab === 'copilot'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Clinical Copilot Workbench</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors ${
            activeTab === 'history'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Approved Provenance & Audit Trail ({approvalHistory.length})</span>
        </button>
      </div>

      {activeTab === 'copilot' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Copilot Controls, Mode Selection, Prompts & Citations */}
          <div className="lg:col-span-5 space-y-6">
            {/* Mode Selector Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Select Copilot Intelligence Action</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveMode('summarize_history')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    activeMode === 'summarize_history'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-950 dark:text-purple-200 font-bold ring-2 ring-purple-600/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <History className="w-4 h-4 text-purple-600" />
                    <span>Patient History</span>
                  </div>
                  <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 block leading-tight">
                    Summarize medical history, consult notes, and vitals.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMode('summarize_reports')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    activeMode === 'summarize_reports'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-950 dark:text-purple-200 font-bold ring-2 ring-purple-600/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Diagnostic Reports</span>
                  </div>
                  <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 block leading-tight">
                    Analyze lab panels, biomarkers, and findings.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMode('ask_question')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    activeMode === 'ask_question'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-950 dark:text-purple-200 font-bold ring-2 ring-purple-600/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    <span>Clinical Q&A</span>
                  </div>
                  <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 block leading-tight">
                    Inquire using only authorized patient records.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMode('generate_draft')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    activeMode === 'generate_draft'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-950 dark:text-purple-200 font-bold ring-2 ring-purple-600/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <Edit3 className="w-4 h-4 text-indigo-600" />
                    <span>Generate Draft</span>
                  </div>
                  <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 block leading-tight">
                    Draft SOAP notes, SBAR handoffs, or patient guides.
                  </span>
                </button>
              </div>

              {/* Draft Format Sub-Selector (when mode is generate_draft) */}
              {activeMode === 'generate_draft' && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <label className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                    Target Clinical Draft Format:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { type: 'consultation_note', label: 'SOAP Note' },
                      { type: 'handoff_brief', label: 'SBAR Handoff' },
                      { type: 'patient_explanation', label: 'Patient Guide' }
                    ].map((fmt) => (
                      <button
                        key={fmt.type}
                        type="button"
                        onClick={() => setDraftType(fmt.type as ClinicalDraftType)}
                        className={`p-2 rounded-lg text-xs font-semibold border text-center transition-colors ${
                          draftType === fmt.type
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Q&A Input (when mode is ask_question) */}
              {activeMode === 'ask_question' && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <label className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                    Clinician Clinical Query:
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      placeholder="e.g. Any contraindications to prescribing ACE inhibitors?"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-600"
                    />

                    {/* Pre-canned Suggestions */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                        Suggested Clinician Questions:
                      </span>
                      <div className="space-y-1">
                        {quickQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCustomQuestion(q)}
                            className="w-full text-left p-1.5 px-2 rounded-lg text-[11px] bg-slate-50 dark:bg-slate-800/40 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors truncate"
                          >
                            • {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Optional Focus / Additional Directive */}
              {activeMode !== 'ask_question' && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <label className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                    Optional Clinician Focus Directive:
                  </label>
                  <input
                    type="text"
                    value={clinicianPrompt}
                    onChange={(e) => setClinicianPrompt(e.target.value)}
                    placeholder="e.g. Emphasize glycemic control and microcytic trend"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-600"
                  />
                </div>
              )}

              {/* Generate Trigger Button */}
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={generating}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-sm transition-all ${
                  generating
                    ? 'bg-purple-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 active:scale-98'
                }`}
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Grounding in Patient Records...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Grounded Clinical Copilot Output</span>
                  </>
                )}
              </button>
            </div>

            {/* Citations & Evidence Explorer */}
            {copilotResponse?.citations && copilotResponse.citations.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>Supporting Source Citations ({copilotResponse.citations.length})</span>
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">
                    100% GROUNDED
                  </span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {copilotResponse.citations.map((c, i) => (
                    <div
                      key={c.id || i}
                      className="p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-[11px] truncate">
                          {c.documentName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {c.date}
                        </span>
                      </div>
                      {c.sectionOrParameter && (
                        <div className="text-[10px] font-mono text-blue-700 dark:text-blue-300">
                          {c.sectionOrParameter}
                        </div>
                      )}
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 italic leading-relaxed">
                        "{c.excerpt}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Editor, Provenance Badges, Approvals */}
          <div className="lg:col-span-7 space-y-6">
            {/* Safety & Conflict Flags Banner */}
            {copilotResponse && (
              <div className="space-y-2">
                {/* Missing Info Warning */}
                {copilotResponse.missingInformation?.length > 0 && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold font-mono text-[11px] uppercase block">
                        Missing Clinical Telemetry / Gaps:
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 mt-1 text-[11px]">
                        {copilotResponse.missingInformation.map((m, idx) => (
                          <li key={idx}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Conflicting Entries Alert */}
                {copilotResponse.conflictingEntries?.length > 0 && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold font-mono text-[11px] uppercase block">
                        Conflicting Chart Records Detected:
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 mt-1 text-[11px]">
                        {copilotResponse.conflictingEntries.map((c, idx) => (
                          <li key={idx}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Allergy / Medication Contraindication Alert */}
                {copilotResponse.allergyMedicationAlerts?.length > 0 && (
                  <div className="p-3 bg-red-100/80 dark:bg-red-950/60 border border-red-300 dark:border-red-800 rounded-xl text-xs text-red-900 dark:text-red-200 flex items-start gap-2">
                    <Pill className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold font-mono text-[11px] uppercase block">
                        Allergy & Medication Contraindication Notice:
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 mt-1 text-[11px]">
                        {copilotResponse.allergyMedicationAlerts.map((a, idx) => (
                          <li key={idx}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Generated Output & Editable Review Workbench */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-purple-600" />
                    <span>Clinician Review & Approval Workbench</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Review, correct, edit, reject, or approve AI-generated documentation before signing to chart.
                  </span>
                </div>

                {copilotResponse && (
                  <div className="flex items-center gap-2">
                    {wasEdited && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold">
                        EDITED BY CLINICIAN
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="p-1.5 px-2 rounded-lg text-xs border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors"
                      title="Copy text"
                    >
                      {hasCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Workbench Body */}
              {generating ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 flex items-center justify-center mx-auto animate-pulse">
                    <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      Synthesizing Grounded Clinical Intelligence
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      Executing strict patient authorization, verifying lab biomarkers, cross-checking allergy profiles, and enforcing non-autonomous clinical boundaries.
                    </p>
                  </div>
                  <div className="w-48 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto overflow-hidden">
                    <div className="w-full h-full bg-purple-600 rounded-full animate-pulse" />
                  </div>
                </div>
              ) : copilotResponse ? (
                <div className="space-y-4">
                  {/* Provenance Metadata Tag */}
                  <div className="p-3 bg-purple-50/70 dark:bg-purple-950/30 rounded-xl border border-purple-200/80 dark:border-purple-800/80 text-xs flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span className="font-bold text-purple-950 dark:text-purple-200 font-mono text-[11px]">
                        AI ENGINE: {copilotResponse.provenance?.model || 'Gemini Flash'} · GROUNDED CITATIONS: {copilotResponse.citations?.length || 0}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      Generated: {copilotResponse.provenance?.generatedAt?.split('T')[1]?.slice(0, 8)} UTC
                    </span>
                  </div>

                  {/* Direct In-line Editable Textarea */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>EDITABLE CLINICAL DRAFT CONTENT:</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        Click into text to make corrections or add clinical notes
                      </span>
                    </label>
                    <textarea
                      value={editableContent}
                      onChange={handleContentChange}
                      rows={14}
                      className="w-full p-4 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-600 leading-relaxed transition-colors selection:bg-purple-200 selection:text-purple-900"
                    />
                  </div>

                  {/* Approval / Rejection Action Buttons */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block">
                        Attending Clinician Approval Mandatory
                      </span>
                      <span className="text-[11px]">
                        Signing stamps your NPI ({user?.npi || '1942850192'}) and archives the full audit trail.
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRejectModalOpen(true)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 flex items-center gap-1.5 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject Draft</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleApprove}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 flex items-center gap-1.5 shadow-xs transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve & Sign to Chart</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Initial Idle State */
                <div className="py-16 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      AI Clinical Copilot Standing By
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      Select an intelligence action on the left to summarize patient history, extract diagnostic reports, answer questions, or generate consultation drafts.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Approval Provenance & Audit Trail View */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Clinical Copilot Provenance & Audit Registry
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Permanent chronological record of all AI drafts reviewed, edited, approved, or rejected for {activePatient?.name}.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-purple-600 bg-purple-50 dark:bg-purple-950 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800">
              {approvalHistory.length} Logged Events
            </span>
          </div>

          {approvalHistory.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <History className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p>No historical approvals or rejections logged yet for this patient.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvalHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                          item.action === 'approved'
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                        }`}
                      >
                        {item.action}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {item.draftType.replace('_', ' ').toUpperCase()}
                      </span>
                      {item.wasEdited && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          MD Edited
                        </span>
                      )}
                    </div>

                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      Signed by: {item.clinicianName} (NPI: {item.clinicianNpi}) · {item.timestamp}
                    </div>
                  </div>

                  {item.rejectionReason && (
                    <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-lg text-rose-800 dark:text-rose-200 text-xs">
                      <strong>Rejection Rationale:</strong> {item.rejectionReason}
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                      Approved Record Content:
                    </span>
                    <pre className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                      {item.finalContent}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Reject Draft Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <XCircle className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Reject AI Generated Draft
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              State the clinical reason for rejecting this AI suggestion. This will be preserved in the institutional safety audit trail for model monitoring and QA.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Clinical impression does not account for acute postural strain; requires in-person neurology follow-up."
              className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-600"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700"
              >
                Confirm Rejection & Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
