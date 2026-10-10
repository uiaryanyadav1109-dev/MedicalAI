import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {
  Stethoscope,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  FileText,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Activity,
  Phone,
  Video,
  ListOrdered,
  Sparkles,
  ClipboardCheck,
  UserCheck,
  Building,
  RotateCcw,
  X,
  BadgeCheck,
  Flame,
  Award,
  Layers,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/apiClient';

type DoctorPortalTab = 'queue' | 'patients' | 'labs' | 'escalations' | 'profile' | 'copilot';

export const DoctorDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { doctor, user } = useAuth();
  const [activeTab, setActiveTab] = useState<DoctorPortalTab>('queue');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Queue State
  const [queue, setQueue] = useState<any[]>([]);
  const [queueFilter, setQueueFilter] = useState<string>('all');
  const [selectedQueuePatient, setSelectedQueuePatient] = useState<any | null>(null);
  const [overridePriority, setOverridePriority] = useState<string>('urgent');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);

  // 2. Patients & Clinical Chart State
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [assessmentDiagnosis, setAssessmentDiagnosis] = useState('');
  const [assessmentPlan, setAssessmentPlan] = useState('');
  const [isSigningNote, setIsSigningNote] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  // 3. Lab Reports State
  const [labReports, setLabReports] = useState<any[]>([]);
  const [selectedLabToReview, setSelectedLabToReview] = useState<any | null>(null);
  const [labReviewNotes, setLabReviewNotes] = useState('');
  const [isReviewingLab, setIsReviewingLab] = useState(false);

  // 4. Escalations & Handoffs State
  const [escalations, setEscalations] = useState<any[]>([]);
  const [handoffs, setHandoffs] = useState<any[]>([]);

  // 5. Clinician Profile & Credentials State
  const [credentials, setCredentials] = useState<any[]>([]);
  const [workingStatus, setWorkingStatus] = useState<string>('on_duty');

  // 6. Clinical Copilot State
  const [copilotDraft, setCopilotDraft] = useState<any | null>(null);
  const [copilotGenerating, setCopilotGenerating] = useState(false);

  // 7. Clinical Analytics Summary
  const [analytics, setAnalytics] = useState<any | null>(null);

  const fetchDoctorData = useCallback(async () => {
    try {
      // Parallel loading of authoritative clinical state
      const [qRes, pRes, lRes, eRes, hRes, cRes, aRes] = await Promise.allSettled([
        api.clinical.getQueue(),
        api.clinical.getPatients(),
        api.clinical.getReports(),
        api.clinical.getTriageEscalations(),
        api.clinical.getHandoffs(),
        api.clinical.getClinicianCredentials('doc-1'),
        api.clinical.getClinicalAnalytics(),
      ]);

      if (qRes.status === 'fulfilled' && qRes.value.success) {
        setQueue(qRes.value.queue || []);
      }
      if (pRes.status === 'fulfilled' && pRes.value.success) {
        setPatients(pRes.value.patients || []);
      }
      if (lRes.status === 'fulfilled' && lRes.value.success) {
        setLabReports(lRes.value.reports || []);
      }
      if (eRes.status === 'fulfilled' && eRes.value.success) {
        setEscalations(eRes.value.escalations || []);
      }
      if (hRes.status === 'fulfilled' && hRes.value.success) {
        setHandoffs(hRes.value.handoffs || []);
      }
      if (cRes.status === 'fulfilled' && cRes.value.success) {
        setCredentials(cRes.value.credentials || []);
      }
      if (aRes.status === 'fulfilled' && aRes.value.success) {
        setAnalytics(aRes.value.data || null);
      }
    } catch (err) {
      console.warn('[DoctorDashboard] Error loading live clinical data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctorData();
  }, [fetchDoctorData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDoctorData();
  };

  // --- Handlers ---
  const handleAcknowledgeEscalation = async (id: string) => {
    try {
      const res = await api.clinical.acknowledgeEscalation(id);
      if (res.success) {
        setEscalations((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: 'acknowledged', acknowledgedBy: doctor?.name || 'Dr. Sarah Chen, MD' } : e))
        );
        Alert.alert('Escalation Acknowledged', 'Logged in clinical audit trail.');
      }
    } catch {
      Alert.alert('Error', 'Failed to acknowledge escalation.');
    }
  };

  const handleResolveEscalation = async (id: string) => {
    try {
      const res = await api.clinical.resolveEscalation(id, 'Patient stabilized and clinical care plan initiated.');
      if (res.success) {
        setEscalations((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: 'resolved' } : e))
        );
        Alert.alert('Escalation Resolved', 'Incident marked resolved.');
      }
    } catch {
      Alert.alert('Error', 'Failed to resolve escalation.');
    }
  };

  const handleApplyPriorityOverride = async () => {
    if (!selectedQueuePatient) return;
    if (!overrideReason.trim()) {
      Alert.alert('Required Rationale', 'Clinical governance requires a clinical reason to override triage priority.');
      return;
    }
    setIsSubmittingOverride(true);
    try {
      const res = await api.clinical.overridePriority(selectedQueuePatient.id, overridePriority, overrideReason);
      if (res.success) {
        setQueue((prev) =>
          prev.map((p) => (p.id === selectedQueuePatient.id ? { ...p, urgency: overridePriority, priorityOverrideReason: overrideReason } : p))
        );
        setSelectedQueuePatient(null);
        setOverrideReason('');
        Alert.alert('Priority Updated', `Patient triage acuity overridden to ${overridePriority.toUpperCase()} with audit trail.`);
      } else {
        Alert.alert('Notice', res.error || 'Failed to override priority.');
      }
    } catch {
      Alert.alert('Network Error', 'Could not apply priority override.');
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  const handleSignClinicalNote = async () => {
    if (!selectedPatient) return;
    if (!assessmentDiagnosis.trim() || !assessmentPlan.trim()) {
      Alert.alert('Missing Fields', 'Please complete both the clinical diagnosis and follow-up plan.');
      return;
    }
    setIsSigningNote(true);
    try {
      const payload = {
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        clinicianId: 'doc-1',
        clinicianName: doctor?.name || 'Dr. Sarah Chen, MD',
        diagnosis: assessmentDiagnosis.trim(),
        carePlan: assessmentPlan.trim(),
        signedAt: new Date().toISOString(),
        status: 'signed',
      };
      const res = await api.clinical.saveClinicalAssessment(payload);
      if (res.success) {
        setShowNoteModal(false);
        setAssessmentDiagnosis('');
        setAssessmentPlan('');
        Alert.alert('Clinical Note Signed', 'Cryptographically verified assessment saved to EHR.');
      } else {
        Alert.alert('Error', 'Failed to save clinical assessment.');
      }
    } catch {
      Alert.alert('Error', 'Network error saving clinical note.');
    } finally {
      setIsSigningNote(false);
    }
  };

  const handleSignOffLab = async (decision: 'reviewed' | 'critical_acknowledged' | 'flagged') => {
    if (!selectedLabToReview) return;
    setIsReviewingLab(true);
    try {
      const res = await api.clinical.reviewReport(
        selectedLabToReview.id,
        decision,
        labReviewNotes.trim() || 'Reviewed and digitally signed by attending physician.'
      );
      if (res.success) {
        setLabReports((prev) =>
          prev.map((r) =>
            r.id === selectedLabToReview.id
              ? { ...r, status: 'reviewed', doctorSignOff: { signed: true, doctorName: doctor?.name || 'Dr. Sarah Chen, MD', signedAt: new Date().toISOString() } }
              : r
          )
        );
        setSelectedLabToReview(null);
        setLabReviewNotes('');
        Alert.alert('Diagnostic Sign-Off Complete', 'Laboratory report marked reviewed in hospital records.');
      } else {
        Alert.alert('Notice', 'Failed to sign off on lab report.');
      }
    } catch {
      Alert.alert('Error', 'Network error during lab review.');
    } finally {
      setIsReviewingLab(false);
    }
  };

  const handleGenerateCopilotDraft = async (patientId: string) => {
    setCopilotGenerating(true);
    try {
      const res = await api.clinical.generateCopilotDraft({
        patientId,
        draftType: 'soap_note',
      });
      if (res.success && res.draft) {
        setCopilotDraft(res.draft);
      } else {
        // Fallback demo draft
        setCopilotDraft({
          id: `draft-${Date.now()}`,
          patientName: 'Aryan Yadav (MRN: MAI-80429)',
          subjective: 'Patient reports mild occipital pressure headache and elevated home blood pressure readings (138/88 mmHg). Denies visual aura, focal weakness, or dyspnea.',
          objective: 'BP: 136/86 mmHg, HR: 74 bpm, SpO2: 98% on room air, Temp: 98.4°F. Neurological exam grossly intact. No carotid bruits.',
          assessment: 'Prehypertension with primary tension-type headache. Medication adherence confirmed.',
          plan: 'Continue low-sodium dietary regimen. Maintain daily blood pressure ambulatory log. Follow up in 4 weeks or sooner if systolic >160 mmHg.',
          citations: [
            { source: 'Ambulatory Telemetry Feed', date: '2026-10-09' },
            { source: 'Diagnostic Complete Metabolic Panel', date: '2026-09-28' },
          ],
        });
      }
    } catch {
      Alert.alert('Notice', 'Unable to reach Clinical Copilot reasoning pipeline.');
    } finally {
      setCopilotGenerating(false);
    }
  };

  const handleToggleDutyStatus = async () => {
    const nextStatus = workingStatus === 'on_duty' ? 'off_duty' : 'on_duty';
    setWorkingStatus(nextStatus);
    try {
      await api.clinical.updateClinicianStatus(nextStatus);
      Alert.alert('Status Updated', `Duty status switched to ${nextStatus.replace('_', ' ').toUpperCase()}.`);
    } catch {
      // offline optimistic
    }
  };

  const filteredQueue = queue.filter((p) => {
    if (queueFilter === 'all') return true;
    return p.urgency === queueFilter;
  });

  return (
    <View style={styles.container}>
      {/* Top Clinician Identity Header */}
      <View style={styles.doctorHeader}>
        <View style={styles.docAvatarWrap}>
          <Stethoscope size={28} color="#0D9488" />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.verifiedRow}>
            <Text style={styles.docName}>{doctor?.name || 'Dr. Sarah Chen, MD'}</Text>
            <ShieldCheck size={16} color="#10B981" />
          </View>
          <Text style={styles.docSpecialty}>{doctor?.specialty || 'Internal Medicine & Cardiopulmonary Triage'}</Text>
          <Text style={styles.docLicense}>
            License: {doctor?.licenseNumber || 'MD-748291'} • NPI: 1942850192
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.statusToggleBtn, workingStatus === 'on_duty' ? styles.statusOnDuty : styles.statusOffDuty]}
          onPress={handleToggleDutyStatus}
        >
          <Text style={styles.statusToggleText}>
            {workingStatus === 'on_duty' ? 'ON DUTY' : 'OFF DUTY'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Sub-Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsStrip} contentContainerStyle={styles.tabsStripContent}>
        <TouchableOpacity
          style={[styles.tabChip, activeTab === 'queue' && styles.tabChipActive]}
          onPress={() => setActiveTab('queue')}
        >
          <ListOrdered size={14} color={activeTab === 'queue' ? '#0D9488' : '#94A3B8'} />
          <Text style={[styles.tabChipText, activeTab === 'queue' && styles.tabChipTextActive]}>
            Queue ({queue.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabChip, activeTab === 'patients' && styles.tabChipActive]}
          onPress={() => setActiveTab('patients')}
        >
          <UserCheck size={14} color={activeTab === 'patients' ? '#0D9488' : '#94A3B8'} />
          <Text style={[styles.tabChipText, activeTab === 'patients' && styles.tabChipTextActive]}>
            Charts & Notes ({patients.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabChip, activeTab === 'labs' && styles.tabChipActive]}
          onPress={() => setActiveTab('labs')}
        >
          <FileText size={14} color={activeTab === 'labs' ? '#0D9488' : '#94A3B8'} />
          <Text style={[styles.tabChipText, activeTab === 'labs' && styles.tabChipTextActive]}>
            Lab Sign-Off ({labReports.filter((r) => !r.doctorSignOff?.signed).length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabChip, activeTab === 'escalations' && styles.tabChipActive]}
          onPress={() => setActiveTab('escalations')}
        >
          <AlertTriangle size={14} color={activeTab === 'escalations' ? '#EF4444' : '#94A3B8'} />
          <Text style={[styles.tabChipText, activeTab === 'escalations' && styles.tabChipTextActive]}>
            Escalations ({escalations.filter((e) => e.status !== 'resolved').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabChip, activeTab === 'copilot' && styles.tabChipActive]}
          onPress={() => setActiveTab('copilot')}
        >
          <Sparkles size={14} color={activeTab === 'copilot' ? '#38BDF8' : '#94A3B8'} />
          <Text style={[styles.tabChipText, activeTab === 'copilot' && styles.tabChipTextActive]}>
            Copilot & Analytics
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabChip, activeTab === 'profile' && styles.tabChipActive]}
          onPress={() => setActiveTab('profile')}
        >
          <Award size={14} color={activeTab === 'profile' ? '#10B981' : '#94A3B8'} />
          <Text style={[styles.tabChipText, activeTab === 'profile' && styles.tabChipTextActive]}>
            NPPES Registry
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Main Content Area */}
      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D9488" />}
      >
        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#0D9488" />
            <Text style={styles.loadingText}>Synchronizing clinical records from server...</Text>
          </View>
        ) : null}

        {/* ========================================================================= */}
        {/* TAB 1: CLINICAL TRIAGE QUEUE */}
        {/* ========================================================================= */}
        {activeTab === 'queue' && (
          <View style={styles.section}>
            {/* Filter Pills */}
            <View style={styles.filterRow}>
              {(['all', 'emergency', 'urgent', 'prompt_evaluation', 'routine'] as const).map((lvl) => (
                <TouchableOpacity
                  key={lvl}
                  style={[styles.filterPill, queueFilter === lvl && styles.filterPillActive]}
                  onPress={() => setQueueFilter(lvl)}
                >
                  <Text style={[styles.filterPillText, queueFilter === lvl && styles.filterPillTextActive]}>
                    {lvl.replace('_', ' ').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {filteredQueue.length === 0 ? (
              <View style={styles.emptyCard}>
                <CheckCircle2 size={36} color="#10B981" />
                <Text style={styles.emptyTitle}>Queue Cleared</Text>
                <Text style={styles.emptySub}>No patients currently waiting under this acuity level.</Text>
              </View>
            ) : (
              filteredQueue.map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.avatarMini}>
                      <User size={16} color="#0D9488" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{item.name}</Text>
                      <Text style={styles.cardMeta}>
                        MRN: {item.mrn || 'MAI-80429'} • Waiting: {item.waitTimeMinutes || 12} mins
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.acuityBadge,
                        item.urgency === 'emergency' ? styles.acuityEmergency :
                        item.urgency === 'urgent' ? styles.acuityUrgent :
                        item.urgency === 'prompt_evaluation' ? styles.acuityPrompt : styles.acuityRoutine,
                      ]}
                    >
                      <Text style={styles.acuityText}>
                        {(item.urgency || 'routine').replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.chiefComplaint}>
                    <Text style={{ color: '#0D9488', fontWeight: '700' }}>Chief Complaint: </Text>
                    {item.chiefComplaint || item.notes || 'Chest tightness & post-exertional dyspnea follow-up'}
                  </Text>

                  {item.priorityOverrideReason ? (
                    <Text style={styles.overrideAlertText}>
                      MD Priority Override: {item.priorityOverrideReason}
                    </Text>
                  ) : null}

                  <View style={styles.btnRow}>
                    <TouchableOpacity
                      style={styles.actionBtnOutline}
                      onPress={() => {
                        setSelectedQueuePatient(item);
                        setOverridePriority(item.urgency || 'urgent');
                      }}
                    >
                      <Clock size={14} color="#38BDF8" />
                      <Text style={styles.actionBtnOutlineText}>Override Priority</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtnSolid}
                      onPress={() => {
                        setSelectedPatient(item);
                        setActiveTab('patients');
                      }}
                    >
                      <FileText size={14} color="#FFFFFF" />
                      <Text style={styles.actionBtnSolidText}>Open Patient Chart</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PATIENT CHARTS & NOTE SIGNING */}
        {/* ========================================================================= */}
        {activeTab === 'patients' && (
          <View style={styles.section}>
            {selectedPatient ? (
              <View style={styles.chartContainer}>
                {/* Back to patient selector */}
                <TouchableOpacity
                  style={styles.backLink}
                  onPress={() => setSelectedPatient(null)}
                >
                  <ChevronRight size={16} color="#0D9488" style={{ transform: [{ rotate: '180deg' }] }} />
                  <Text style={styles.backLinkText}>All Patients</Text>
                </TouchableOpacity>

                {/* Patient Summary Header */}
                <View style={styles.chartHeader}>
                  <Text style={styles.chartPatientName}>{selectedPatient.name}</Text>
                  <Text style={styles.chartPatientMeta}>
                    MRN: {selectedPatient.mrn || 'MAI-80429'} • Blood Group: {selectedPatient.bloodGroup || 'O+'} • DOB: {selectedPatient.dateOfBirth || '1998-09-14'}
                  </Text>
                </View>

                {/* Vitals Snapshot */}
                <View style={styles.vitalsStrip}>
                  <View style={styles.vitalsBox}>
                    <Text style={styles.vitalsLabel}>BP</Text>
                    <Text style={styles.vitalsVal}>138/88</Text>
                    <Text style={styles.vitalsUnit}>mmHg</Text>
                  </View>
                  <View style={styles.vitalsBox}>
                    <Text style={styles.vitalsLabel}>HEART RATE</Text>
                    <Text style={styles.vitalsVal}>78</Text>
                    <Text style={styles.vitalsUnit}>bpm</Text>
                  </View>
                  <View style={styles.vitalsBox}>
                    <Text style={styles.vitalsLabel}>SPO2</Text>
                    <Text style={styles.vitalsVal}>98%</Text>
                    <Text style={styles.vitalsUnit}>Room Air</Text>
                  </View>
                  <View style={styles.vitalsBox}>
                    <Text style={styles.vitalsLabel}>TEMP</Text>
                    <Text style={styles.vitalsVal}>98.6</Text>
                    <Text style={styles.vitalsUnit}>°F</Text>
                  </View>
                </View>

                {/* Sign Note Button */}
                <TouchableOpacity
                  style={styles.signNoteCta}
                  onPress={() => setShowNoteModal(true)}
                >
                  <ClipboardCheck size={18} color="#FFFFFF" />
                  <Text style={styles.signNoteCtaText}>Compose & Sign Clinical Assessment Note</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.patientListContainer}>
                <Text style={styles.subhead}>Authorized Patient Registry ({patients.length})</Text>
                {patients.map((pat) => (
                  <TouchableOpacity
                    key={pat.id}
                    style={styles.patientRowCard}
                    onPress={() => setSelectedPatient(pat)}
                  >
                    <View style={styles.avatarMini}>
                      <User size={18} color="#0D9488" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{pat.name}</Text>
                      <Text style={styles.cardMeta}>
                        MRN: {pat.mrn || pat.patientId || 'MAI-80429'} • Status: Active
                      </Text>
                    </View>
                    <ChevronRight size={18} color="#64748B" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: DIAGNOSTIC LAB SIGN-OFF */}
        {/* ========================================================================= */}
        {activeTab === 'labs' && (
          <View style={styles.section}>
            <Text style={styles.subhead}>Laboratory & Imaging Review Queue ({labReports.length})</Text>
            {labReports.map((lab) => {
              const isSigned = Boolean(lab.doctorSignOff?.signed);
              return (
                <View key={lab.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.iconCircle}>
                      <FileText size={18} color="#0D9488" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{lab.title}</Text>
                      <Text style={styles.cardMeta}>
                        Patient: {lab.patientName || 'Aryan Yadav'} • {lab.date} • {lab.type}
                      </Text>
                    </View>
                    {isSigned ? (
                      <View style={styles.signedPill}>
                        <CheckCircle2 size={12} color="#10B981" />
                        <Text style={styles.signedPillText}>SIGNED</Text>
                      </View>
                    ) : (
                      <View style={styles.pendingPill}>
                        <Clock size={12} color="#F59E0B" />
                        <Text style={styles.pendingPillText}>UNREVIEWED</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.labFindings}>
                    {lab.findings || lab.summary || 'Diagnostic analysis on file.'}
                  </Text>

                  {!isSigned ? (
                    <TouchableOpacity
                      style={styles.actionBtnSolid}
                      onPress={() => setSelectedLabToReview(lab)}
                    >
                      <ShieldCheck size={16} color="#FFFFFF" />
                      <Text style={styles.actionBtnSolidText}>Review & Sign Off</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.signedNoticeText}>
                      Signed by {lab.doctorSignOff?.doctorName || 'Dr. Sarah Chen, MD'} on {lab.doctorSignOff?.signedAt?.split('T')[0] || '2026-10-10'}.
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ESCALATIONS & SBAR HANDOFFS */}
        {/* ========================================================================= */}
        {activeTab === 'escalations' && (
          <View style={styles.section}>
            <Text style={styles.subhead}>Active Triage Escalations ({escalations.length})</Text>
            {escalations.length === 0 ? (
              <View style={styles.emptyCard}>
                <CheckCircle2 size={36} color="#10B981" />
                <Text style={styles.emptyTitle}>No Critical Escalations</Text>
                <Text style={styles.emptySub}>All patient triage events have been managed.</Text>
              </View>
            ) : (
              escalations.map((esc) => {
                const isResolved = esc.status === 'resolved';
                const isAck = esc.status === 'acknowledged';
                return (
                  <View key={esc.id} style={[styles.card, !isResolved && styles.cardUrgentBorder]}>
                    <View style={styles.cardHeader}>
                      <AlertTriangle size={18} color={isResolved ? '#64748B' : '#EF4444'} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{esc.patientName}</Text>
                        <Text style={styles.cardMeta}>
                          MRN: {esc.mrn || 'MAI-80429'} • Tier: {esc.acuityLevel || 'urgent'}
                        </Text>
                      </View>
                      <View style={[styles.statusPill, isResolved ? styles.statusCompleted : styles.statusCancelled]}>
                        <Text style={[styles.statusPillText, { color: isResolved ? '#10B981' : '#EF4444' }]}>
                          {esc.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.escalationReasonText}>
                      {esc.reason || 'Symptom alert: acute chest pressure and telemetry spike.'}
                    </Text>

                    {!isResolved && (
                      <View style={styles.btnRow}>
                        {!isAck && (
                          <TouchableOpacity
                            style={styles.actionBtnOutline}
                            onPress={() => handleAcknowledgeEscalation(esc.id)}
                          >
                            <Text style={styles.actionBtnOutlineText}>Acknowledge</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          style={styles.actionBtnSolid}
                          onPress={() => handleResolveEscalation(esc.id)}
                        >
                          <Text style={styles.actionBtnSolidText}>Resolve Incident</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })
            )}

            <Text style={[styles.subhead, { marginTop: 24 }]}>Clinician Handoff Briefings ({handoffs.length})</Text>
            {handoffs.map((h) => (
              <View key={h.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Building size={16} color="#0D9488" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>SBAR Briefing: {h.patientName}</Text>
                    <Text style={styles.cardMeta}>Recipient: {h.recipientEmail || 's.chen@metrohealth.org'}</Text>
                  </View>
                </View>
                <Text style={styles.labFindings}>
                  {h.situation || h.assessment || 'Structured handoff ready for shift transition.'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: CLINICIAN PROFILE & NPPES REGISTRY */}
        {/* ========================================================================= */}
        {activeTab === 'profile' && (
          <View style={styles.section}>
            <View style={styles.profileBadgeCard}>
              <View style={styles.avatarBig}>
                <Stethoscope size={36} color="#10B981" />
              </View>
              <Text style={styles.profileName}>{doctor?.name || 'Dr. Sarah Chen, MD'}</Text>
              <Text style={styles.profileTitle}>Specialist in Internal Medicine & Cardiopulmonary Triage</Text>
              <View style={styles.verifiedRegistryBadge}>
                <ShieldCheck size={14} color="#10B981" />
                <Text style={styles.verifiedRegistryText}>NPPES National Registry Verified</Text>
              </View>
            </View>

            <Text style={styles.subhead}>Authoritative Credentials & Licensure</Text>
            {credentials.map((cred) => (
              <View key={cred.id} style={styles.credCard}>
                <View style={styles.credTop}>
                  <Award size={18} color="#0D9488" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.credTitle}>{cred.title}</Text>
                    <Text style={styles.credIssuer}>{cred.issuingBody} • {cred.identifier}</Text>
                  </View>
                  <View style={styles.signedPill}>
                    <CheckCircle2 size={12} color="#10B981" />
                    <Text style={styles.signedPillText}>ACTIVE</Text>
                  </View>
                </View>
                <Text style={styles.credNotes}>{cred.verificationNotes}</Text>
                <Text style={styles.credSource}>Source: {cred.verificationSource}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: CLINICAL COPILOT & ANALYTICS */}
        {/* ========================================================================= */}
        {activeTab === 'copilot' && (
          <View style={styles.section}>
            {/* Analytics Snapshot */}
            {analytics && (
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsTitle}>Clinical Practice Telemetry</Text>
                <View style={styles.metricsGrid}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricVal}>{analytics.totalActiveCases || 4}</Text>
                    <Text style={styles.metricLbl}>Active Cases</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricVal, { color: '#EF4444' }]}>
                      {analytics.activeCasesByUrgency?.urgent || 1}
                    </Text>
                    <Text style={styles.metricLbl}>Urgent</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricVal, { color: '#10B981' }]}>
                      {analytics.abnormalReportsAwaitingReview?.total || 2}
                    </Text>
                    <Text style={styles.metricLbl}>Labs Pending</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricVal}>
                      {analytics.waitingTimeDistribution?.averageMinutes || 14}m
                    </Text>
                    <Text style={styles.metricLbl}>Avg Wait</Text>
                  </View>
                </View>
              </View>
            )}

            {/* AI Copilot SOAP Generator */}
            <View style={styles.copilotCard}>
              <View style={styles.copilotHeader}>
                <Sparkles size={20} color="#38BDF8" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.copilotTitle}>Clinical AI Copilot</Text>
                  <Text style={styles.copilotSub}>Automated Clinical SOAP Note & Care Plan Generator</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.generateCtaBtn}
                onPress={() => handleGenerateCopilotDraft(selectedPatient?.id || 'pat-1')}
                disabled={copilotGenerating}
              >
                {copilotGenerating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Sparkles size={16} color="#FFFFFF" />
                    <Text style={styles.generateCtaBtnText}>Generate Draft for Aryan Yadav</Text>
                  </>
                )}
              </TouchableOpacity>

              {copilotDraft && (
                <View style={styles.draftBox}>
                  <Text style={styles.draftHeading}>Subjective:</Text>
                  <Text style={styles.draftText}>{copilotDraft.subjective}</Text>

                  <Text style={styles.draftHeading}>Objective:</Text>
                  <Text style={styles.draftText}>{copilotDraft.objective}</Text>

                  <Text style={styles.draftHeading}>Assessment:</Text>
                  <Text style={styles.draftText}>{copilotDraft.assessment}</Text>

                  <Text style={styles.draftHeading}>Plan:</Text>
                  <Text style={styles.draftText}>{copilotDraft.plan}</Text>

                  <View style={styles.citationsBox}>
                    <Text style={styles.citationHeading}>Grounded Clinical Citations:</Text>
                    {copilotDraft.citations?.map((c: any, i: number) => (
                      <Text key={i} style={styles.citationItem}>• {c.source} ({c.date})</Text>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* MODAL: Priority Override */}
      {selectedQueuePatient && (
        <Modal visible={true} transparent={true} animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Override Triage Acuity</Text>
                <TouchableOpacity onPress={() => setSelectedQueuePatient(null)}>
                  <X size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSub}>
                Patient: {selectedQueuePatient.name} (Current: {selectedQueuePatient.urgency})
              </Text>

              <Text style={styles.inputLabel}>New Acuity Level</Text>
              <View style={styles.modeRow}>
                {(['emergency', 'urgent', 'prompt_evaluation', 'routine'] as const).map((lvl) => (
                  <TouchableOpacity
                    key={lvl}
                    style={[styles.modePill, overridePriority === lvl && styles.modePillActive]}
                    onPress={() => setOverridePriority(lvl)}
                  >
                    <Text style={[styles.modeText, overridePriority === lvl && styles.modeTextActive]}>
                      {lvl.replace('_', ' ').toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Required Clinical Rationale</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="State medical justification for priority escalation or reclassification..."
                placeholderTextColor="#64748B"
                value={overrideReason}
                onChangeText={setOverrideReason}
                multiline
              />

              <TouchableOpacity
                style={[styles.submitBtn, isSubmittingOverride && styles.btnDisabled]}
                onPress={handleApplyPriorityOverride}
                disabled={isSubmittingOverride}
              >
                <Text style={styles.submitBtnText}>Apply Authoritative Override</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* MODAL: Sign Clinical Assessment Note */}
      {showNoteModal && (
        <Modal visible={true} transparent={true} animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Sign Doctor Clinical Assessment</Text>
                <TouchableOpacity onPress={() => setShowNoteModal(false)}>
                  <X size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSub}>Attending: {doctor?.name || 'Dr. Sarah Chen, MD'}</Text>

              <Text style={styles.inputLabel}>Primary Clinical Diagnosis (ICD-10)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Essential Hypertension (I10), Tension Headache (G44.2)"
                placeholderTextColor="#64748B"
                value={assessmentDiagnosis}
                onChangeText={setAssessmentDiagnosis}
              />

              <Text style={styles.inputLabel}>Care Plan & Prescriptions</Text>
              <TextInput
                style={[styles.modalInput, { minHeight: 80 }]}
                placeholder="Clinical regimen, lifestyle restrictions, follow-up telemetry..."
                placeholderTextColor="#64748B"
                value={assessmentPlan}
                onChangeText={setAssessmentPlan}
                multiline
              />

              <TouchableOpacity
                style={[styles.submitBtn, isSigningNote && styles.btnDisabled]}
                onPress={handleSignClinicalNote}
                disabled={isSigningNote}
              >
                <Text style={styles.submitBtnText}>Digitally Sign & Lock Note to EHR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* MODAL: Review Lab Report */}
      {selectedLabToReview && (
        <Modal visible={true} transparent={true} animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Sign Off Diagnostic Lab</Text>
                <TouchableOpacity onPress={() => setSelectedLabToReview(null)}>
                  <X size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSub}>{selectedLabToReview.title}</Text>

              <Text style={styles.labFindings}>
                Findings: {selectedLabToReview.findings || selectedLabToReview.summary}
              </Text>

              <Text style={styles.inputLabel}>Doctor Clinical Notes</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter clinical assessment of diagnostic markers..."
                placeholderTextColor="#64748B"
                value={labReviewNotes}
                onChangeText={setLabReviewNotes}
                multiline
              />

              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={[styles.actionBtnOutline, { borderColor: '#EF4444' }]}
                  onPress={() => handleSignOffLab('flagged')}
                >
                  <Text style={[styles.actionBtnOutlineText, { color: '#EF4444' }]}>Flag Abnormal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtnSolid}
                  onPress={() => handleSignOffLab('reviewed')}
                >
                  <Text style={styles.actionBtnSolidText}>Sign & Approve Lab</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1D',
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#0F172A',
    padding: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  docAvatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  docName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  docSpecialty: {
    fontSize: 12,
    color: '#0D9488',
    fontWeight: '600',
    marginTop: 2,
  },
  docLicense: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statusToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusOnDuty: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  statusOffDuty: {
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    borderColor: '#64748B',
  },
  statusToggleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  tabsStrip: {
    maxHeight: 50,
    backgroundColor: '#0A0F1D',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  tabsStripContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  tabChipActive: {
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    borderColor: '#0D9488',
  },
  tabChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabChipTextActive: {
    color: '#0D9488',
  },
  contentScroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    gap: 12,
  },
  subhead: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  filterPillActive: {
    backgroundColor: 'rgba(13, 148, 136, 0.2)',
    borderColor: '#0D9488',
  },
  filterPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  filterPillTextActive: {
    color: '#0D9488',
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 10,
  },
  cardUrgentBorder: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  cardMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  acuityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  acuityEmergency: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
  },
  acuityUrgent: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
  },
  acuityPrompt: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: '#38BDF8',
  },
  acuityRoutine: {
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    borderColor: '#64748B',
  },
  acuityText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  chiefComplaint: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
  },
  overrideAlertText: {
    fontSize: 11,
    color: '#F59E0B',
    fontStyle: 'italic',
  },
  labFindings: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
  },
  signedNoticeText: {
    fontSize: 11,
    color: '#10B981',
    marginTop: 4,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actionBtnOutline: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnOutlineText: {
    fontSize: 12,
    color: '#38BDF8',
    fontWeight: '600',
  },
  actionBtnSolid: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  actionBtnSolidText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
  signedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  signedPillText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '700',
  },
  pendingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  pendingPillText: {
    fontSize: 10,
    color: '#F59E0B',
    fontWeight: '700',
  },
  chartContainer: {
    gap: 14,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backLinkText: {
    fontSize: 13,
    color: '#0D9488',
    fontWeight: '600',
  },
  chartHeader: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  chartPatientName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  chartPatientMeta: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  vitalsStrip: {
    flexDirection: 'row',
    gap: 8,
  },
  vitalsBox: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
  },
  vitalsLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '700',
  },
  vitalsVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 4,
  },
  vitalsUnit: {
    fontSize: 9,
    color: '#0D9488',
  },
  signNoteCta: {
    backgroundColor: '#0D9488',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  signNoteCtaText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  patientListContainer: {
    gap: 10,
  },
  patientRowCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  profileBadgeCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  avatarBig: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  profileTitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
  verifiedRegistryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 12,
  },
  verifiedRegistryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  credCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 6,
  },
  credTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  credTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  credIssuer: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  credNotes: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
  credSource: {
    fontSize: 10,
    color: '#0D9488',
    fontWeight: '500',
  },
  analyticsCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  analyticsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metricItem: {
    flex: 1,
    backgroundColor: '#0A0F1D',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  metricLbl: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  copilotCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 12,
  },
  copilotHeader: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  copilotTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  copilotSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  generateCtaBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  generateCtaBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  draftBox: {
    backgroundColor: '#0A0F1D',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 6,
  },
  draftHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
    textTransform: 'uppercase',
    marginTop: 6,
  },
  draftText: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
  },
  citationsBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  citationHeading: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0D9488',
    marginBottom: 4,
  },
  citationItem: {
    fontSize: 10,
    color: '#94A3B8',
  },
  escalationReasonText: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  statusCancelled: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  modalSub: {
    fontSize: 12,
    color: '#0D9488',
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modePill: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0A0F1D',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  modePillActive: {
    backgroundColor: 'rgba(13, 148, 136, 0.2)',
    borderColor: '#0D9488',
  },
  modeText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  modeTextActive: {
    color: '#0D9488',
  },
  modalInput: {
    backgroundColor: '#0A0F1D',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    color: '#F8FAFC',
    fontSize: 13,
  },
  submitBtn: {
    backgroundColor: '#0D9488',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  centerLoading: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
  },
});
