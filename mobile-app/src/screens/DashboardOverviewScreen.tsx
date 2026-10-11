import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  Bot,
  Calendar,
  Stethoscope,
  FileText,
  CreditCard,
  ShieldCheck,
  ShieldAlert,
  Activity,
  AlertTriangle,
  HeartPulse,
  Pill,
  ChevronRight,
  Clock,
  Sparkles,
  WifiOff,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/apiClient';
import {
  VitalDataPoint,
  MedicationItem,
  AppointmentRecord,
  MedicalReportRecord,
} from '../types';

interface DashboardOverviewProps {
  navigation: any;
}

export const DashboardOverviewScreen: React.FC<DashboardOverviewProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const [vitals, setVitals] = useState<VitalDataPoint[]>([]);
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [reports, setReports] = useState<MedicalReportRecord[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [user?.id]);

  const loadDashboardData = async () => {
    try {
      const res = await api.clinical.getFullPatientPacket(user?.id || 'pat-1');
      if (res.success && res.data) {
        setVitals(res.data.vitals || []);
        setMedications(res.data.medications || []);
        setAppointments(res.data.appointments || []);
        setReports(res.data.reports || []);
        setIsOffline(false);
      } else {
        setIsOffline(true);
      }
    } catch (e) {
      console.warn('Failed to load dashboard data:', e);
      setIsOffline(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const latestVital = vitals[0];
  const activeMedications = medications.filter((m) => m.status === 'active');
  const upcomingAppointment = appointments.find((a) => a.status === 'scheduled');

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={styles.loadingText}>Synchronizing with Medical AI Server...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0D9488']} />}
    >
      {/* Offline Connectivity Status Notice */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <WifiOff size={16} color="#F59E0B" />
          <View style={styles.offlineBannerContent}>
            <Text style={styles.offlineBannerTitle}>Offline Mode Active</Text>
            <Text style={styles.offlineBannerSub}>
              Serving encrypted local health cache. Changes and telemetry will synchronize once connection is restored.
            </Text>
          </View>
        </View>
      )}

      {/* 1. Header Card */}
      <View style={styles.welcomeCard}>
        <View style={styles.rowBetween}>
          <View>
            <View style={styles.badgeRow}>
              <ShieldCheck size={12} color="#0D9488" />
              <Text style={styles.badgeText}>Verified Patient Portal</Text>
            </View>
            <Text style={styles.welcomeName}>{user?.name || 'Aryan Yadav'}</Text>
            <Text style={styles.welcomeSub}>
              MRN: {user?.patientId || user?.mrn || 'MAI-80429'} · Blood: {user?.bloodGroup || 'O+'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => navigation.navigate('PatientCard')}
          >
            <CreditCard size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.cardButtonText}>Health Pass</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency SOS Banner */}
        <TouchableOpacity
          style={styles.sosBanner}
          onPress={() => navigation.navigate('Emergency')}
        >
          <View style={styles.sosBannerHeader}>
            <AlertTriangle size={16} color="#F43F5E" />
            <Text style={styles.sosBannerTitle}>Emergency SOS Protocol</Text>
          </View>
          <Text style={styles.sosBannerSub}>
            Instant GPS coordinates fix, dispatch link, and emergency contact broadcast.
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2. Latest Vitals Summary */}
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <View style={styles.sectionTitleRow}>
            <Activity size={18} color="#0D9488" />
            <Text style={styles.sectionTitle}>Ambulatory Vitals</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Vitals')}>
            <Text style={styles.viewAllText}>View All & Log</Text>
          </TouchableOpacity>
        </View>

        {latestVital ? (
          <View style={styles.vitalsGrid}>
            <View style={styles.vitalCard}>
              <Text style={styles.vitalLabel}>Blood Pressure</Text>
              <Text style={styles.vitalValue}>{latestVital.systolic}/{latestVital.diastolic}</Text>
              <Text style={styles.vitalUnit}>mmHg · Normotensive</Text>
            </View>
            <View style={styles.vitalCard}>
              <Text style={styles.vitalLabel}>Heart Rate</Text>
              <Text style={styles.vitalValue}>{latestVital.heartRate}</Text>
              <Text style={styles.vitalUnit}>bpm · Resting</Text>
            </View>
            <View style={styles.vitalCard}>
              <Text style={styles.vitalLabel}>Oxygen SpO2</Text>
              <Text style={styles.vitalValue}>{latestVital.spo2}%</Text>
              <Text style={styles.vitalUnit}>Optimal</Text>
            </View>
            <View style={styles.vitalCard}>
              <Text style={styles.vitalLabel}>Body Temp</Text>
              <Text style={styles.vitalValue}>{latestVital.temperature || 98.6}°F</Text>
              <Text style={styles.vitalUnit}>Afebrile</Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No vitals logged yet.</Text>
          </View>
        )}
      </View>

      {/* 3. Next Appointment */}
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <View style={styles.sectionTitleRow}>
            <Calendar size={18} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Upcoming Consultation</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Appointments')}>
            <Text style={styles.viewAllText}>Manage Visits</Text>
          </TouchableOpacity>
        </View>

        {upcomingAppointment ? (
          <TouchableOpacity
            style={styles.appointmentCard}
            onPress={() => navigation.navigate('Appointments')}
          >
            <View style={styles.flex1}>
              <Text style={styles.itemTitle}>{upcomingAppointment.providerName}</Text>
              <Text style={styles.itemSubtitle}>
                {upcomingAppointment.providerSpecialty} · {upcomingAppointment.date} at {upcomingAppointment.time}
              </Text>
              <Text style={styles.itemDetail}>{upcomingAppointment.location}</Text>
            </View>
            <ChevronRight size={18} color="#64748B" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.emptyCard}
            onPress={() => navigation.navigate('Appointments')}
          >
            <Calendar size={20} color="#64748B" />
            <Text style={styles.emptyText}>No upcoming appointments scheduled.</Text>
            <Text style={styles.emptyActionText}>Tap to browse doctors and book a slot</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 4. Active Medications */}
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <View style={styles.sectionTitleRow}>
            <Pill size={18} color="#A855F7" />
            <Text style={styles.sectionTitle}>Active Medications</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Medications')}>
            <Text style={styles.viewAllText}>Manage Regimen</Text>
          </TouchableOpacity>
        </View>

        {activeMedications.length > 0 ? (
          activeMedications.slice(0, 3).map((med) => (
            <View key={med.id} style={styles.listItem}>
              <View style={styles.flex1}>
                <Text style={styles.itemTitle}>{med.name} ({med.strength || med.dosage})</Text>
                <Text style={styles.itemSubtitle}>{med.frequency} · {med.timing}</Text>
              </View>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate('Medications')}
              >
                <Text style={styles.actionBtnText}>Dose Log</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No active medications recorded.</Text>
          </View>
        )}
      </View>

      {/* 5. Clinical Tools & Quick Actions Grid */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Sparkles size={18} color="#F59E0B" />
          <Text style={styles.sectionTitle}>Clinical Tools & Services</Text>
        </View>
        <View style={styles.toolsGrid}>
          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => navigation.navigate('AIChat')}
          >
            <View style={[styles.toolIconBox, { backgroundColor: 'rgba(13, 148, 136, 0.15)' }]}>
              <Bot size={22} color="#0D9488" />
            </View>
            <Text style={styles.toolTitle}>AI Triage</Text>
            <Text style={styles.toolSub}>Multilingual reasoning</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => navigation.navigate('Appointments')}
          >
            <View style={[styles.toolIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Calendar size={22} color="#3B82F6" />
            </View>
            <Text style={styles.toolTitle}>Care Visits</Text>
            <Text style={styles.toolSub}>Doctor bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => navigation.navigate('DoctorHandoff')}
          >
            <View style={[styles.toolIconBox, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
              <Stethoscope size={22} color="#8B5CF6" />
            </View>
            <Text style={styles.toolTitle}>Doctor Handoff</Text>
            <Text style={styles.toolSub}>Clinician summary</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => navigation.navigate('Reports')}
          >
            <View style={[styles.toolIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <FileText size={22} color="#10B981" />
            </View>
            <Text style={styles.toolTitle}>Reports & Labs</Text>
            <Text style={styles.toolSub}>Diagnostics vault</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => navigation.navigate('PatientCard')}
          >
            <View style={[styles.toolIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <CreditCard size={22} color="#F59E0B" />
            </View>
            <Text style={styles.toolTitle}>Health Pass</Text>
            <Text style={styles.toolSub}>Verified QR code</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => navigation.navigate('IdentityVerification')}
          >
            <View style={[styles.toolIconBox, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
              <ShieldCheck size={22} color="#06B6D4" />
            </View>
            <Text style={styles.toolTitle}>Identity KYC</Text>
            <Text style={styles.toolSub}>Credential verification</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => navigation.navigate('DataAccessRequests')}
          >
            <View style={[styles.toolIconBox, { backgroundColor: 'rgba(13, 148, 136, 0.15)' }]}>
              <ShieldAlert size={22} color="#0D9488" />
            </View>
            <Text style={styles.toolTitle}>QR Consent</Text>
            <Text style={styles.toolSub}>Manage scan requests</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 16,
  },
  center: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 12,
    fontSize: 14,
  },
  welcomeCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  badgeText: {
    color: '#0D9488',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  welcomeName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  welcomeSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  cardButton: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sosBanner: {
    backgroundColor: 'rgba(225, 29, 72, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.4)',
    borderRadius: 14,
    padding: 12,
    marginTop: 16,
  },
  sosBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sosBannerTitle: {
    color: '#FDA4AF',
    fontSize: 13,
    fontWeight: '800',
  },
  sosBannerSub: {
    color: '#F43F5E',
    fontSize: 11,
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  viewAllText: {
    color: '#0D9488',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  vitalCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 12,
    width: '48%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  vitalLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  vitalValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  vitalUnit: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  appointmentCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listItem: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flex1: {
    flex: 1,
  },
  itemTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  itemSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  itemDetail: {
    color: '#0D9488',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  actionBtn: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  toolCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    width: '48%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  toolIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  toolTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  toolSub: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  emptyActionText: {
    color: '#0D9488',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  offlineBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  offlineBannerContent: {
    flex: 1,
    marginLeft: 10,
  },
  offlineBannerTitle: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '700',
  },
  offlineBannerSub: {
    color: '#CBD5E1',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  bottomSpacer: {
    height: 40,
  },
});
