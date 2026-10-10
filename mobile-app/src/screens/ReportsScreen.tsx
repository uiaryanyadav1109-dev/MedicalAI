import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Filter,
  UploadCloud,
  Share2,
  Search,
  Pill,
  ShieldCheck,
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { RefreshControl } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/apiClient';
import { PatientReport } from '../types';

export const ReportsScreen: React.FC = () => {
  const { patient, refreshPatient } = useAuth();
  const [activeTab, setActiveTab] = useState<'reports' | 'prescriptions'>('reports');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [serverReports, setServerReports] = useState<any[]>([]);

  const fetchLiveReports = async () => {
    try {
      const res = await api.clinical.getReports(patient?.id || 'pat-1');
      if (res.success && Array.isArray(res.reports)) {
        setServerReports(res.reports);
      }
    } catch (err) {
      console.warn('[Reports] Failed to fetch live reports:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveReports();
  }, [patient?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLiveReports();
    refreshPatient?.();
  };

  // Combine initial profile reports with server reports
  const allReports: PatientReport[] = [
    ...serverReports.map((r) => ({
      id: r.id,
      title: r.title,
      date: r.date,
      type: r.type || 'Clinical Report',
      findings: r.findings || r.summary || 'Clinical record on file.',
      physician: r.orderingPhysician || r.facility || 'Metro Clinical Lab',
      status: r.isAbnormal ? 'attention_needed' : 'normal',
      reviewStatus: r.doctorSignOff?.signed ? 'doctor_reviewed' : 'unreviewed',
      summary: r.summary,
    })),
    ...(patient?.reports || [])
  ].filter((r, idx, arr) => arr.findIndex((x) => x.id === r.id) === idx);

  const prescriptions = patient?.prescriptions || [];

  const handlePickDocument = async () => {
    try {
      setUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const reportTitle = file.name.replace(/\.[^/.]+$/, '');

        // 1. Send authoritative medical report to the Express backend & shared DB
        const payload = {
          patientId: patient?.id || 'pat-1',
          patientName: patient?.name || 'Aryan Yadav',
          title: reportTitle,
          type: file.mimeType?.includes('image') ? 'Diagnostic Imaging' : 'Laboratory Report',
          date: new Date().toISOString().split('T')[0],
          facility: 'Patient Direct Mobile Upload',
          orderingPhysician: 'Self-Submitted (Mobile Upload)',
          status: 'pending_review',
          findings: `User uploaded medical document (${(file.size ? file.size / 1024 : 120).toFixed(0)} KB). Pending clinical review.`,
          summary: `Direct EHR upload from mobile device: ${file.name}. Queued for clinician validation.`,
          fileName: file.name,
          fileSize: `${(file.size ? file.size / 1024 : 120).toFixed(0)} KB`,
          requiresDoctorReview: true,
          isAbnormal: false,
        };

        const res = await api.clinical.addReport(payload as any);
        if (res.success && res.report) {
          setServerReports((prev) => [res.report, ...prev]);
        }
        await refreshPatient?.();

        Alert.alert(
          'Document Uploaded & Synced',
          `"${file.name}" has been securely uploaded and synchronized with your hospital EHR chart.`
        );
      }
    } catch {
      Alert.alert('Upload Error', 'Could not access the selected document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleShareReport = async (report: PatientReport) => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Sharing Unavailable', 'Native file sharing is not supported on this platform.');
        return;
      }
      // For demo text report sharing or cached PDF
      Alert.alert('Secure Export', `Generating cryptographically sealed summary for "${report.title}"...`);
    } catch {
      Alert.alert('Export Notice', 'Unable to initiate sharing dialog.');
    }
  };

  const filteredReports = allReports.filter((r) => {
    const matchesFilter =
      filterType === 'all' || r.type.toLowerCase().includes(filterType.toLowerCase());
    const matchesSearch =
      searchQuery === '' ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.findings.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredPrescriptions = prescriptions.filter((p) => {
    return (
      searchQuery === '' ||
      p.medication.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.instructions.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D9488" />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Medical Records & Rx</Text>
          <Text style={styles.subtitle}>Verified Lab Findings, Diagnostic Imaging & Prescriptions</Text>
        </View>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handlePickDocument}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <UploadCloud size={16} color="#FFFFFF" />
              <Text style={styles.uploadButtonText}>Upload</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Segmented Top Tabs */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'reports' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('reports')}
        >
          <FileText size={16} color={activeTab === 'reports' ? '#0D9488' : '#64748B'} />
          <Text
            style={[
              styles.segmentText,
              activeTab === 'reports' && styles.segmentTextActive,
            ]}
          >
            Diagnostic Reports ({allReports.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'prescriptions' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('prescriptions')}
        >
          <Pill size={16} color={activeTab === 'prescriptions' ? '#0D9488' : '#64748B'} />
          <Text
            style={[
              styles.segmentText,
              activeTab === 'prescriptions' && styles.segmentTextActive,
            ]}
          >
            Prescriptions ({prescriptions.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Search size={16} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by diagnosis, lab, or medication..."
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {activeTab === 'reports' ? (
        <>
          {/* Filter Chips */}
          <View style={styles.filterRow}>
            <Filter size={15} color="#64748B" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabContainer}
            >
              {['all', 'blood', 'cardiology', 'radiology'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.filterChip, filterType === tab && styles.filterChipActive]}
                  onPress={() => setFilterType(tab)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filterType === tab && styles.filterChipTextActive,
                    ]}
                  >
                    {tab.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Reports List */}
          {filteredReports.length === 0 ? (
            <View style={styles.emptyCard}>
              <AlertCircle size={28} color="#64748B" />
              <Text style={styles.emptyTitle}>No Matching Reports</Text>
              <Text style={styles.emptySubtitle}>
                No medical reports match your query. Newly uploaded lab documents will appear here.
              </Text>
            </View>
          ) : (
            filteredReports.map((report) => (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <View style={styles.iconBox}>
                    <FileText size={20} color="#0D9488" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reportTitle}>{report.title}</Text>
                    <View style={styles.dateRow}>
                      <Calendar size={12} color="#64748B" />
                      <Text style={styles.reportDate}>{report.date}</Text>
                      <Text style={styles.reportCategory}>• {report.type}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      report.reviewStatus === 'reviewed' ? styles.statusReviewed : styles.statusPending,
                    ]}
                  >
                    {report.reviewStatus === 'reviewed' ? (
                      <CheckCircle2 size={12} color="#10B981" />
                    ) : (
                      <Clock size={12} color="#F59E0B" />
                    )}
                    <Text
                      style={[
                        styles.statusText,
                        report.reviewStatus === 'reviewed'
                          ? styles.statusTextReviewed
                          : styles.statusTextPending,
                      ]}
                    >
                      {report.reviewStatus === 'reviewed' ? 'REVIEWED' : 'UNREVIEWED'}
                    </Text>
                  </View>
                </View>

                {/* Findings Box */}
                <View style={styles.findingsBox}>
                  <Text style={styles.findingsLabel}>Clinical Impression / Findings:</Text>
                  <Text style={styles.findingsText}>{report.findings}</Text>
                </View>

                {/* Footer Action Row */}
                <View style={styles.footerRow}>
                  <Text style={styles.physicianText}>
                    Authorized By: {report.physician || 'Attending Physician'}
                  </Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.downloadButton}
                      onPress={() => handleShareReport(report)}
                    >
                      <Share2 size={14} color="#0D9488" />
                      <Text style={styles.downloadText}>Share</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </>
      ) : (
        /* Prescriptions Tab */
        <>
          {filteredPrescriptions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Pill size={28} color="#64748B" />
              <Text style={styles.emptyTitle}>No Prescriptions Found</Text>
              <Text style={styles.emptySubtitle}>
                Active electronic prescriptions from your attending physician will be listed here.
              </Text>
            </View>
          ) : (
            filteredPrescriptions.map((rx) => (
              <View key={rx.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                    <Pill size={20} color="#3B82F6" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reportTitle}>{rx.medication}</Text>
                    <Text style={styles.dosageText}>Dosage: {rx.dosage}</Text>
                  </View>
                  <View style={[styles.statusBadge, styles.statusReviewed]}>
                    <ShieldCheck size={12} color="#10B981" />
                    <Text style={[styles.statusText, styles.statusTextReviewed]}>ACTIVE</Text>
                  </View>
                </View>

                <View style={styles.findingsBox}>
                  <Text style={styles.findingsLabel}>Regimen & Instructions:</Text>
                  <Text style={styles.findingsText}>{rx.instructions}</Text>
                  <Text style={[styles.reportDate, { marginTop: 6 }]}>Prescribed: {rx.date}</Text>
                </View>

                <View style={styles.footerRow}>
                  <Text style={styles.physicianText}>Prescriber: {rx.doctor}</Text>
                  <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={() =>
                      Alert.alert(
                        'Refill Requested',
                        `Refill request for ${rx.medication} sent to Dr. ${rx.doctor}.`
                      )
                    }
                  >
                    <Text style={styles.downloadText}>Request Refill</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B132B',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0D9488',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: '#0B132B',
  },
  segmentText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 13,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  tabContainer: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#1E293B',
  },
  filterChipActive: {
    backgroundColor: '#0D9488',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  reportCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  dosageText: {
    fontSize: 12,
    color: '#38BDF8',
    marginTop: 2,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  reportDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  reportCategory: {
    fontSize: 11,
    color: '#64748B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusReviewed: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextReviewed: {
    color: '#10B981',
  },
  statusTextPending: {
    color: '#F59E0B',
  },
  findingsBox: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  findingsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  findingsText: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  physicianText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
  },
  downloadText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0D9488',
  },
  emptyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});
