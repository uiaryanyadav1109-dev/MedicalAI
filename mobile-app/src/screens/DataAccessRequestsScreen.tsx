import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  User,
  AlertTriangle,
  RotateCw,
  FileText,
  Calendar,
  Lock,
  ChevronRight,
  Shield,
  History,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/apiClient';
import { QrAccessRequest, QrAccessScope } from '../types';

export const DataAccessRequestsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, patient } = useAuth();
  const patientId = patient?.id || user?.id || 'pat-1';

  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'history'>('pending');
  const [requests, setRequests] = useState<QrAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Approval Modal State
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<QrAccessRequest | null>(null);
  const [approvalDuration, setApprovalDuration] = useState<number>(60); // minutes
  const [scopesToGrant, setScopesToGrant] = useState<QrAccessScope>({
    bloodGroup: true,
    allergies: true,
    vitals: true,
    medications: true,
    emergencyContacts: true,
    emergencyNotes: false,
    clinicalNotes: false,
    labReports: false,
  });
  const [submittingDecision, setSubmittingDecision] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.qrAccess.getRequestsForPatient(patientId);
      if (res && res.success && Array.isArray(res.requests)) {
        setRequests(res.requests);
      }
    } catch {
      // In offline / simulator mode, fall back gracefully
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const pendingRequests = requests.filter(
    (r) => r.status === 'pending' && (!r.expiresAt || new Date(r.expiresAt) > new Date())
  );

  const activeGrants = requests.filter(
    (r) => r.status === 'approved' && (!r.expiresAt || new Date(r.expiresAt) > new Date())
  );

  const historyRequests = requests.filter(
    (r) =>
      r.status === 'denied' ||
      r.status === 'revoked' ||
      r.status === 'completed' ||
      (r.expiresAt && new Date(r.expiresAt) <= new Date())
  );

  const handleOpenApprove = (req: QrAccessRequest) => {
    setSelectedRequest(req);
    setScopesToGrant({
      ...req.requestedScopes,
    });
    setApprovalDuration(60);
    setApprovalModalVisible(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedRequest) return;
    try {
      setSubmittingDecision(true);
      const res = await api.qrAccess.decideRequest(selectedRequest.id, {
        decision: 'approved',
        patientId,
        approvedScopes: scopesToGrant,
        grantDurationMinutes: approvalDuration,
      });

      if (res && res.success) {
        Alert.alert('Access Granted', 'The requester has been granted time-limited access to the approved scopes.');
        setApprovalModalVisible(false);
        fetchRequests();
      } else {
        Alert.alert('Decision Failed', res?.error || 'Could not process consent approval.');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to communicate with server.');
    } finally {
      setSubmittingDecision(false);
    }
  };

  const handleDeny = async (req: QrAccessRequest) => {
    Alert.alert(
      'Deny Access Request',
      `Are you sure you want to deny access to ${req.requesterName}? No protected medical data will be revealed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deny Access',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await api.qrAccess.decideRequest(req.id, {
                decision: 'denied',
                patientId,
              });
              if (res && res.success) {
                Alert.alert('Request Denied', 'Access has been successfully rejected.');
                fetchRequests();
              }
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Could not deny request.');
            }
          },
        },
      ]
    );
  };

  const handleRevoke = async (req: QrAccessRequest) => {
    Alert.alert(
      'Revoke Active Access Grant',
      `Immediately revoke ${req.requesterName}'s access to your medical records?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke Immediately',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await api.qrAccess.revokeGrant(req.id, {
                patientId,
                reason: 'Patient manually revoked active grant from mobile app.',
              });
              if (res && res.success) {
                Alert.alert('Grant Revoked', 'Requester access was revoked and locked immediately.');
                fetchRequests();
              }
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Could not revoke grant.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Tab Selector */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'pending' && styles.tabItemActive]}
          onPress={() => setActiveTab('pending')}
        >
          <Clock size={16} color={activeTab === 'pending' ? '#0D9488' : '#94A3B8'} />
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            Pending ({pendingRequests.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'active' && styles.tabItemActive]}
          onPress={() => setActiveTab('active')}
        >
          <ShieldCheck size={16} color={activeTab === 'active' ? '#10B981' : '#94A3B8'} />
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Active Grants ({activeGrants.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'history' && styles.tabItemActive]}
          onPress={() => setActiveTab('history')}
        >
          <History size={16} color={activeTab === 'history' ? '#0D9488' : '#94A3B8'} />
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            History ({historyRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D9488" />}
      >
        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#0D9488" />
            <Text style={styles.loadingText}>Loading data access requests...</Text>
          </View>
        ) : null}

        {/* ========================================================================= */}
        {/* TAB 1: PENDING REQUESTS */}
        {/* ========================================================================= */}
        {!loading && activeTab === 'pending' && (
          <View>
            {pendingRequests.length === 0 ? (
              <View style={styles.emptyCard}>
                <CheckCircle size={40} color="#10B981" />
                <Text style={styles.emptyTitle}>No Pending Requests</Text>
                <Text style={styles.emptySub}>
                  Whenever a clinician or caregiver scans your ID card QR code and requests access, it will appear here for your authenticated approval.
                </Text>
              </View>
            ) : (
              pendingRequests.map((req) => (
                <View key={req.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.avatarWrap}>
                      <User size={20} color="#0D9488" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.requesterName}>{req.requesterName}</Text>
                      <Text style={styles.requesterMeta}>
                        Role: {req.requesterRole.toUpperCase()} • {req.requesterOrganization || 'Institutional Clinic'}
                      </Text>
                    </View>
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingBadgeText}>PENDING</Text>
                    </View>
                  </View>

                  <View style={styles.reasonBox}>
                    <Text style={styles.reasonLabel}>Reason for Access:</Text>
                    <Text style={styles.reasonVal}>{req.reasonLabel || req.reason}</Text>
                    {req.explanation ? (
                      <Text style={styles.explanationText}>"{req.explanation}"</Text>
                    ) : null}
                  </View>

                  <View style={styles.scopePreview}>
                    <Text style={styles.scopePreviewLabel}>Requested Information:</Text>
                    <View style={styles.scopeChipsRow}>
                      {Object.entries(req.requestedScopes)
                        .filter(([_, allowed]) => allowed)
                        .map(([scope]) => (
                          <View key={scope} style={styles.scopeChip}>
                            <Text style={styles.scopeChipText}>{scope}</Text>
                          </View>
                        ))}
                    </View>
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.denyBtn}
                      onPress={() => handleDeny(req)}
                    >
                      <XCircle size={16} color="#EF4444" />
                      <Text style={styles.denyBtnText}>Deny</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={() => handleOpenApprove(req)}
                    >
                      <CheckCircle size={16} color="#FFFFFF" />
                      <Text style={styles.approveBtnText}>Review & Approve</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ACTIVE GRANTS */}
        {/* ========================================================================= */}
        {!loading && activeTab === 'active' && (
          <View>
            {activeGrants.length === 0 ? (
              <View style={styles.emptyCard}>
                <Shield size={40} color="#64748B" />
                <Text style={styles.emptyTitle}>No Active Grants</Text>
                <Text style={styles.emptySub}>
                  No external clinician currently holds active authorized access to your records.
                </Text>
              </View>
            ) : (
              activeGrants.map((grant) => (
                <View key={grant.id} style={[styles.card, styles.cardApproved]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.avatarWrap}>
                      <ShieldCheck size={20} color="#10B981" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.requesterName}>{grant.requesterName}</Text>
                      <Text style={styles.requesterMeta}>
                        Role: {grant.requesterRole.toUpperCase()} • Granted by: You
                      </Text>
                    </View>
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>ACTIVE</Text>
                    </View>
                  </View>

                  {grant.isEmergencyBreakGlass && (
                    <View style={styles.breakGlassNotice}>
                      <AlertTriangle size={14} color="#EF4444" />
                      <Text style={styles.breakGlassNoticeText}>
                        Emergency Break-Glass Access: Invoked by licensed clinician under urgent clinical distress.
                      </Text>
                    </View>
                  )}

                  <View style={styles.metaInfoRow}>
                    <Clock size={14} color="#94A3B8" />
                    <Text style={styles.metaInfoText}>
                      Expires:{' '}
                      {grant.expiresAt
                        ? new Date(grant.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Session Duration'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.revokeBtn}
                    onPress={() => handleRevoke(grant)}
                  >
                    <Lock size={14} color="#EF4444" />
                    <Text style={styles.revokeBtnText}>Revoke Access Immediately</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: AUDIT & ACCESS HISTORY */}
        {/* ========================================================================= */}
        {!loading && activeTab === 'history' && (
          <View>
            {historyRequests.length === 0 ? (
              <View style={styles.emptyCard}>
                <History size={40} color="#64748B" />
                <Text style={styles.emptyTitle}>No Past Requests</Text>
                <Text style={styles.emptySub}>
                  Your complete history of granted, denied, and expired access requests will be retained here in an immutable audit trail.
                </Text>
              </View>
            ) : (
              historyRequests.map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.requesterName}>{item.requesterName}</Text>
                      <Text style={styles.requesterMeta}>
                        {new Date(item.createdAt).toLocaleDateString()} at{' '}
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        item.status === 'denied'
                          ? styles.statusDenied
                          : item.status === 'revoked'
                          ? styles.statusRevoked
                          : styles.statusExpired,
                      ]}
                    >
                      <Text style={styles.statusBadgeText}>{item.status.toUpperCase()}</Text>
                    </View>
                  </View>

                  <Text style={styles.historyReason}>Reason: {item.reasonLabel || item.reason}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* ========================================================================= */}
      {/* APPROVAL MODAL */}
      {/* ========================================================================= */}
      <Modal visible={approvalModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Authorize Clinical Access</Text>
              <Text style={styles.modalSubtitle}>
                Granting access to {selectedRequest?.requesterName} ({selectedRequest?.requesterRole})
              </Text>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              <Text style={styles.sectionHeader}>Access Duration</Text>
              <View style={styles.durationSelector}>
                {[15, 60, 240, 1440].map((mins) => (
                  <TouchableOpacity
                    key={mins}
                    style={[
                      styles.durationChip,
                      approvalDuration === mins && styles.durationChipActive,
                    ]}
                    onPress={() => setApprovalDuration(mins)}
                  >
                    <Text
                      style={[
                        styles.durationChipText,
                        approvalDuration === mins && styles.durationChipTextActive,
                      ]}
                    >
                      {mins < 60 ? `${mins}m` : mins === 60 ? '1h' : mins === 240 ? '4h' : '24h'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionHeader}>Permitted Data Categories</Text>
              {Object.keys(scopesToGrant).map((key) => {
                const isChecked = (scopesToGrant as any)[key];
                return (
                  <View key={key} style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</Text>
                    <Switch
                      value={isChecked}
                      onValueChange={(val) =>
                        setScopesToGrant((prev) => ({ ...prev, [key]: val }))
                      }
                      trackColor={{ false: '#334155', true: '#0D9488' }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setApprovalModalVisible(false)}
                disabled={submittingDecision}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleConfirmApprove}
                disabled={submittingDecision}
              >
                {submittingDecision ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalConfirmText}>Grant Access</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabItemActive: {
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
  },
  tabText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#0D9488',
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centerLoading: {
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 8,
  },
  emptyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySub: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },
  cardApproved: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requesterName: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  requesterMeta: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  pendingBadge: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pendingBadgeText: {
    color: '#EAB308',
    fontSize: 10,
    fontWeight: '800',
  },
  activeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },
  reasonBox: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  reasonLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  reasonVal: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  explanationText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  scopePreview: {
    marginTop: 10,
  },
  scopePreviewLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6,
  },
  scopeChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  scopeChip: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  scopeChipText: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  denyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingVertical: 10,
    borderRadius: 10,
  },
  denyBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  approveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0D9488',
    paddingVertical: 10,
    borderRadius: 10,
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  breakGlassNotice: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  breakGlassNoticeText: {
    color: '#EF4444',
    fontSize: 11,
    flex: 1,
    fontWeight: '600',
  },
  metaInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  metaInfoText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  revokeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  revokeBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusDenied: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  statusRevoked: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
  },
  statusExpired: {
    backgroundColor: '#334155',
  },
  statusBadgeText: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '800',
  },
  historyReason: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  sectionHeader: {
    color: '#0D9488',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  durationSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  durationChip: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  durationChipActive: {
    borderColor: '#0D9488',
    backgroundColor: 'rgba(13, 148, 136, 0.2)',
  },
  durationChipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  durationChipTextActive: {
    color: '#0D9488',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  toggleLabel: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalConfirmBtn: {
    flex: 2,
    backgroundColor: '#0D9488',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
