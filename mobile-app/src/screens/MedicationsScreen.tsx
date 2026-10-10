import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Pill,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  ShieldAlert,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/apiClient';

export const MedicationsScreen: React.FC = () => {
  const { patient, refreshPatient } = useAuth();
  const [loggingId, setLoggingId] = useState<string | null>(null);

  const medications = patient?.medications || [];

  const handleMarkTaken = async (medId: string, medName: string) => {
    if (!patient?.id) return;
    setLoggingId(medId);

    try {
      await api.logMedicationDose(patient.id, medId, {
        timestamp: new Date().toISOString(),
        status: 'taken',
        notes: 'Logged via Android Mobile App',
      });
      await refreshPatient();
      Alert.alert('Dose Recorded', `Successfully marked dose of ${medName} as taken.`);
    } catch {
      Alert.alert('Sync Failure', 'Could not record dose to the clinical server. Check network connection.');
    } finally {
      setLoggingId(null);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Medication Tracker</Text>
        <Text style={styles.subtitle}>Prescription Schedules & Dose Adherence</Text>
      </View>

      {/* Safety Notice */}
      <View style={styles.disclaimerCard}>
        <ShieldAlert size={16} color="#0D9488" />
        <Text style={styles.disclaimerText}>
          Tracking and reminder tool only. Not an autonomous prescribing system. Always verify dosages with your physician.
        </Text>
      </View>

      {/* Active Medications List */}
      <Text style={styles.sectionTitle}>Active Prescriptions ({medications.length})</Text>

      {medications.length === 0 ? (
        <View style={styles.emptyCard}>
          <AlertCircle size={28} color="#64748B" />
          <Text style={styles.emptyTitle}>No Recorded Medications</Text>
          <Text style={styles.emptySubtitle}>You currently have no active prescriptions in your medical record.</Text>
        </View>
      ) : (
        medications.map((med) => {
          const isLogging = loggingId === med.id;
          return (
            <View key={med.id} style={styles.medCard}>
              <View style={styles.medCardTop}>
                <View style={styles.pillIconWrap}>
                  <Pill size={22} color="#0D9488" />
                </View>
                <View style={styles.medDetails}>
                  <Text style={styles.medName}>{med.name}</Text>
                  <Text style={styles.medDosage}>{med.dosage} • {med.frequency}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{med.status.toUpperCase()}</Text>
                </View>
              </View>

              {med.instructions ? (
                <View style={styles.instructionsBox}>
                  <Text style={styles.instructionsLabel}>Directions:</Text>
                  <Text style={styles.instructionsValue}>{med.instructions}</Text>
                </View>
              ) : null}

              <View style={styles.metaRow}>
                {med.prescribedBy ? (
                  <View style={styles.metaItem}>
                    <User size={12} color="#64748B" />
                    <Text style={styles.metaText}>{med.prescribedBy}</Text>
                  </View>
                ) : null}
                <View style={styles.metaItem}>
                  <Calendar size={12} color="#64748B" />
                  <Text style={styles.metaText}>Started: {med.startDate}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <View style={styles.nextDoseInfo}>
                  <Clock size={14} color="#3B82F6" />
                  <Text style={styles.nextDoseText}>Scheduled: Today, Ongoing</Text>
                </View>
                <TouchableOpacity
                  style={[styles.takenButton, isLogging && styles.takenButtonDisabled]}
                  onPress={() => handleMarkTaken(med.id, med.name)}
                  disabled={isLogging}
                >
                  {isLogging ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <CheckCircle size={14} color="#FFFFFF" />
                      <Text style={styles.takenButtonText}>Log Taken</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
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
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.3)',
    marginBottom: 20,
  },
  disclaimerText: {
    color: '#99F6E4',
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  medCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  medCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pillIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  medDetails: {
    flex: 1,
  },
  medName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  medDosage: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  instructionsBox: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  instructionsLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  instructionsValue: {
    fontSize: 13,
    color: '#E2E8F0',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    color: '#64748B',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  nextDoseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nextDoseText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  takenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D9488',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  takenButtonDisabled: {
    opacity: 0.6,
  },
  takenButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
