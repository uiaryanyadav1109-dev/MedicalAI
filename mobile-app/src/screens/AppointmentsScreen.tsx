import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Video,
  MapPin,
  CheckCircle2,
  X,
  Plus,
  ChevronRight,
  ShieldCheck,
  Star,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/apiClient';
import { AppointmentRecord } from '../types';

interface DoctorItem {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  rating: number;
  experienceYears: number;
  consultationFee: string;
  availableSlots: string[];
}

const DOCTORS_DIRECTORY: DoctorItem[] = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Chen, MD',
    specialty: 'Internal Medicine & Cardiopulmonary Triage',
    hospital: 'Metro Clinical Reference Center',
    rating: 4.9,
    experienceYears: 15,
    consultationFee: '₹800',
    availableSlots: ['09:30 AM', '10:30 AM', '02:00 PM', '04:15 PM'],
  },
  {
    id: 'doc-2',
    name: 'Dr. Rajesh Mukherjee, MBBS, MD',
    specialty: 'Chief of Pulmonary & Critical Care',
    hospital: 'Kolkata Medical College & Hospital',
    rating: 4.8,
    experienceYears: 18,
    consultationFee: '₹600',
    availableSlots: ['09:30 AM', '12:00 PM', '03:15 PM'],
  },
  {
    id: 'doc-3',
    name: 'Dr. Ananya Roy, DNB (Peds)',
    specialty: 'Consultant Pediatrician',
    hospital: 'Fortis Healthcare & Child Wellness',
    rating: 4.9,
    experienceYears: 11,
    consultationFee: '₹700',
    availableSlots: ['11:00 AM', '01:30 PM', '05:00 PM'],
  },
  {
    id: 'doc-4',
    name: 'Dr. Vikram Sengupta, MS',
    specialty: 'Orthopedics & Joint Reconstruction',
    hospital: 'AMRI Hospitals Dhakuria',
    rating: 4.7,
    experienceYears: 16,
    consultationFee: '₹750',
    availableSlots: ['10:30 AM', '02:30 PM', '04:00 PM'],
  },
];

export const AppointmentsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { patient, user } = useAuth();
  const [tab, setTab] = useState<'upcoming' | 'book' | 'past'>('upcoming');
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Booking modal state
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorItem | null>(null);
  const [bookingSlot, setBookingSlot] = useState('');
  const [bookingMode, setBookingMode] = useState<'Video' | 'In-Clinic'>('Video');
  const [bookingReason, setBookingReason] = useState('');
  const [bookingDate, setBookingDate] = useState('2026-10-15');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAppointments = useCallback(async () => {
    try {
      const patientId = patient?.id || user?.id || 'pat-1';
      const res = await api.clinical.getAppointments(patientId);
      if (res.success && Array.isArray(res.appointments)) {
        setAppointments(res.appointments);
      }
    } catch (err) {
      console.warn('[Appointments] Failed to fetch server appointments:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [patient?.id, user?.id]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const openBookingModal = (doc: DoctorItem) => {
    setSelectedDoctor(doc);
    setBookingSlot(doc.availableSlots[0] || '10:00 AM');
    setBookingReason('');
  };

  const handleConfirmBooking = async () => {
    if (!selectedDoctor) return;
    setIsSubmitting(true);

    try {
      // 1. Verify Slot Collision Protection with the server
      const slotCheck = await api.clinical.checkSlot(
        bookingDate,
        bookingSlot,
        selectedDoctor.name
      );

      if (slotCheck.success && !slotCheck.available) {
        Alert.alert(
          'Slot Conflict',
          `${selectedDoctor.name} already has a confirmed clinical appointment on ${bookingDate} at ${bookingSlot}. Please select a different time slot.`
        );
        setIsSubmitting(false);
        return;
      }

      // 2. Persist appointment to the authoritative backend database
      const payload: Omit<AppointmentRecord, 'id'> = {
        patientId: patient?.id || user?.id || 'pat-1',
        patientName: patient?.name || user?.name || 'Aryan Yadav',
        providerName: selectedDoctor.name,
        providerSpecialty: selectedDoctor.specialty,
        date: bookingDate,
        time: bookingSlot,
        type: bookingMode === 'Video' ? 'telehealth' : 'in_person',
        location: selectedDoctor.hospital,
        status: 'scheduled',
        reason: bookingReason.trim() || 'General health consultation',
        source: 'Mobile App Scheduled',
      };

      const res = await api.clinical.createAppointment(payload);
      if (res.success && res.appointment) {
        setAppointments((prev) => [res.appointment, ...prev]);
        setSelectedDoctor(null);
        setTab('upcoming');

        Alert.alert(
          'Appointment Confirmed',
          `Your ${bookingMode.toLowerCase()} consultation with ${selectedDoctor.name} has been booked for ${bookingSlot} on ${bookingDate}. It is synced with your hospital chart.`
        );
      } else {
        Alert.alert('Booking Notice', res.error || 'Failed to persist appointment to server.');
      }
    } catch {
      Alert.alert('Network Error', 'Unable to reach the clinical appointments server. Please check your network.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAppointment = (id: string) => {
    Alert.alert('Cancel Appointment', 'Are you sure you want to cancel this scheduled consultation?', [
      { text: 'Keep Appointment', style: 'cancel' },
      {
        text: 'Cancel Appointment',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await api.clinical.cancelAppointment(id, 'Patient cancelled via mobile app');
            if (res.success) {
              setAppointments((prev) =>
                prev.map((a) =>
                  a.id === id
                    ? { ...a, status: 'cancelled', cancelReason: 'Patient cancelled via mobile app' }
                    : a
                )
              );
              Alert.alert('Appointment Cancelled', 'The consultation has been cancelled in the system.');
            } else {
              Alert.alert('Cancellation Failed', res.error || 'Could not cancel appointment.');
            }
          } catch {
            Alert.alert('Network Notice', 'Network issue while cancelling appointment.');
          }
        },
      },
    ]);
  };

  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'scheduled' || a.status === 'confirmed' || a.status === 'pending'
  );
  const pastAppointments = appointments.filter(
    (a) => a.status === 'completed' || a.status === 'cancelled' || a.status === 'rescheduled'
  );

  return (
    <View style={styles.container}>
      {/* Top Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'upcoming' && styles.tabBtnActive]}
          onPress={() => setTab('upcoming')}
        >
          <Text style={[styles.tabText, tab === 'upcoming' && styles.tabTextActive]}>
            Upcoming ({upcomingAppointments.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, tab === 'book' && styles.tabBtnActive]}
          onPress={() => setTab('book')}
        >
          <Text style={[styles.tabText, tab === 'book' && styles.tabTextActive]}>
            Book Doctor
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, tab === 'past' && styles.tabBtnActive]}
          onPress={() => setTab('past')}
        >
          <Text style={[styles.tabText, tab === 'past' && styles.tabTextActive]}>
            Past ({pastAppointments.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D9488" />}
      >
        {/* TAB 1: UPCOMING */}
        {tab === 'upcoming' && (
          <View style={styles.section}>
            {loading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0D9488" />
                <Text style={{ color: '#94A3B8', marginTop: 12, fontSize: 13 }}>Syncing appointments from clinical server...</Text>
              </View>
            ) : upcomingAppointments.length === 0 ? (
              <View style={styles.emptyCard}>
                <Calendar size={40} color="#64748B" />
                <Text style={styles.emptyTitle}>No Upcoming Appointments</Text>
                <Text style={styles.emptySubtitle}>
                  You don't have any scheduled appointments. Browse verified doctors to book a consultation.
                </Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={() => setTab('book')}>
                  <Text style={styles.emptyBtnText}>Browse Available Doctors</Text>
                </TouchableOpacity>
              </View>
            ) : (
              upcomingAppointments.map((item) => (
                <View key={item.id} style={styles.appCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.docAvatar}>
                      <Stethoscope size={20} color="#0D9488" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.docName}>{item.providerName || (item as any).doctorName}</Text>
                      <Text style={styles.docSpec}>{item.providerSpecialty || (item as any).specialty}</Text>
                      <Text style={styles.docHosp}>{item.location || (item as any).hospital}</Text>
                    </View>
                    <View style={[
                      styles.statusPill,
                      item.status === 'confirmed' ? styles.statusConfirmed :
                      item.status === 'completed' ? styles.statusCompleted :
                      item.status === 'cancelled' ? styles.statusCancelled : styles.statusScheduled
                    ]}>
                      <Text style={[
                        styles.statusPillText,
                        {
                          color: item.status === 'confirmed' || item.status === 'completed' ? '#10B981' :
                                 item.status === 'cancelled' ? '#EF4444' : '#38BDF8'
                        }
                      ]}>
                        {(item.status || 'scheduled').toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                      <Clock size={14} color="#0D9488" />
                      <Text style={styles.detailText}>{item.date} • {item.time}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Video size={14} color="#38BDF8" />
                      <Text style={styles.detailText}>{item.type === 'telehealth' ? 'Video Consultation' : 'In-Clinic Consultation'}</Text>
                    </View>
                  </View>

                  {item.reason && (
                    <Text style={styles.reasonText}>Reason: {item.reason}</Text>
                  )}

                  <View style={styles.btnRow}>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => handleCancelAppointment(item.id)}
                    >
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.joinBtn}
                      onPress={() => Alert.alert('Consultation Desk', 'Secure telemedicine room opens 5 minutes before scheduled slot.')}
                    >
                      <Text style={styles.joinBtnText}>Join Consultation</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 2: BOOK DOCTOR */}
        {tab === 'book' && (
          <View style={styles.section}>
            <Text style={styles.subhead}>Verified Medical AI Faculty & Specialists</Text>
            {DOCTORS_DIRECTORY.map((doc) => (
              <View key={doc.id} style={styles.docCard}>
                <View style={styles.docHeader}>
                  <View style={styles.docAvatar}>
                    <Stethoscope size={22} color="#0D9488" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.ratingRow}>
                      <Text style={styles.docName}>{doc.name}</Text>
                      <View style={styles.starBadge}>
                        <Star size={12} color="#F59E0B" fill="#F59E0B" />
                        <Text style={styles.starText}>{doc.rating}</Text>
                      </View>
                    </View>
                    <Text style={styles.docSpec}>{doc.specialty}</Text>
                    <Text style={styles.docHosp}>{doc.hospital}</Text>
                  </View>
                </View>

                <View style={styles.docMetaRow}>
                  <Text style={styles.metaBadge}>{doc.experienceYears}+ Yrs Experience</Text>
                  <Text style={styles.metaBadge}>Fee: {doc.consultationFee}</Text>
                  <Text style={[styles.metaBadge, { color: '#10B981', borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
                    Today Available
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.bookCtaBtn}
                  onPress={() => openBookingModal(doc)}
                >
                  <Calendar size={14} color="#FFFFFF" />
                  <Text style={styles.bookCtaText}>Book Consultation Slot</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* TAB 3: PAST */}
        {tab === 'past' && (
          <View style={styles.section}>
            {pastAppointments.length === 0 ? (
              <View style={styles.emptyCard}>
                <Calendar size={40} color="#64748B" />
                <Text style={styles.emptyTitle}>No Past Appointments</Text>
                <Text style={styles.emptySubtitle}>Completed and cancelled consultations will appear in this history.</Text>
              </View>
            ) : (
              pastAppointments.map((item) => (
                <View key={item.id} style={styles.appCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.docAvatar}>
                      <Stethoscope size={20} color="#0D9488" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.docName}>{item.providerName || (item as any).doctorName}</Text>
                      <Text style={styles.docSpec}>{item.providerSpecialty || (item as any).specialty}</Text>
                    </View>
                    <View style={[
                      styles.statusPill,
                      item.status === 'completed' ? styles.statusCompleted :
                      item.status === 'cancelled' ? styles.statusCancelled : styles.statusRescheduled
                    ]}>
                      <Text style={[
                        styles.statusPillText,
                        { color: item.status === 'completed' ? '#10B981' : item.status === 'cancelled' ? '#EF4444' : '#F59E0B' }
                      ]}>
                        {(item.status || 'completed').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.detailText, { marginTop: 8 }]}>Date: {item.date} • {item.time}</Text>
                  {item.reason && <Text style={styles.reasonText}>Reason: {item.reason}</Text>}
                  {item.cancelReason && (
                    <Text style={[styles.reasonText, { color: '#EF4444' }]}>Cancellation Note: {item.cancelReason}</Text>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Booking Modal */}
      {selectedDoctor && (
        <Modal visible={true} transparent={true} animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Book Consultation</Text>
                  <Text style={styles.modalSub}>{selectedDoctor.name}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedDoctor(null)}>
                  <X size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Consultation Mode</Text>
              <View style={styles.modeRow}>
                {(['Video', 'In-Clinic'] as const).map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.modePill, bookingMode === m && styles.modePillActive]}
                    onPress={() => setBookingMode(m)}
                  >
                    <Text style={[styles.modeText, bookingMode === m && styles.modeTextActive]}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Available Time Slots</Text>
              <View style={styles.slotsRow}>
                {selectedDoctor.availableSlots.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.slotPill, bookingSlot === s && styles.slotPillActive]}
                    onPress={() => setBookingSlot(s)}
                  >
                    <Text style={[styles.slotText, bookingSlot === s && styles.slotTextActive]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Reason for Consultation (Optional)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Describe your current symptoms or reason..."
                placeholderTextColor="#64748B"
                value={bookingReason}
                onChangeText={setBookingReason}
                multiline
              />

              <TouchableOpacity
                style={[styles.confirmBtn, isSubmitting && styles.btnDisabled]}
                onPress={handleConfirmBooking}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.confirmBtnText}>
                    Confirm Booking ({selectedDoctor.consultationFee})
                  </Text>
                )}
              </TouchableOpacity>
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
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    borderWidth: 1,
    borderColor: '#0D9488',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabTextActive: {
    color: '#0D9488',
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
    color: '#94A3B8',
    marginBottom: 4,
    fontWeight: '600',
  },
  appCard: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  docAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  docSpec: {
    fontSize: 12,
    color: '#0D9488',
    fontWeight: '600',
    marginTop: 2,
  },
  docHosp: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#1E293B',
    marginVertical: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  reasonText: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 14,
    lineHeight: 18,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  joinBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtnText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  docCard: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  docHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  starText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '700',
  },
  docMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  metaBadge: {
    fontSize: 11,
    color: '#94A3B8',
    backgroundColor: '#0A0F1D',
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bookCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D9488',
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  bookCtaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyBtn: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  completedText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '600',
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
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  modalSub: {
    fontSize: 12,
    color: '#0D9488',
    fontWeight: '600',
  },
  modalLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 10,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#0A0F1D',
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
  },
  modePillActive: {
    backgroundColor: 'rgba(13, 148, 136, 0.2)',
    borderColor: '#0D9488',
  },
  modeText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  modeTextActive: {
    color: '#0D9488',
  },
  slotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0A0F1D',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  slotPillActive: {
    backgroundColor: 'rgba(13, 148, 136, 0.2)',
    borderColor: '#0D9488',
  },
  slotText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  slotTextActive: {
    color: '#0D9488',
    fontWeight: '700',
  },
  modalInput: {
    backgroundColor: '#0A0F1D',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    color: '#F8FAFC',
    fontSize: 13,
    minHeight: 60,
  },
  confirmBtn: {
    backgroundColor: '#0D9488',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusConfirmed: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  statusScheduled: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  statusCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  statusCancelled: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  statusRescheduled: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
});
