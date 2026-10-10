import React, { useState } from 'react';
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
} from 'react-native';
import {
  Heart,
  Activity,
  Droplets,
  Thermometer,
  Wind,
  Plus,
  Calendar,
  AlertCircle,
  X,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { api, VitalRecord } from '../api/apiClient';

export const VitalsScreen: React.FC = () => {
  const { patient, refreshPatient } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states for new vital log
  const [selectedType, setSelectedType] = useState<
    'heart_rate' | 'blood_pressure' | 'oxygen_saturation' | 'temperature' | 'respiratory_rate' | 'blood_glucose'
  >('heart_rate');
  const [value, setValue] = useState('');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [notes, setNotes] = useState('');

  const vitals = patient?.vitals || [];

  const handleSaveVital = async () => {
    if (!patient?.id) return;

    let finalValue: number | string = 0;
    let finalUnit = '';

    if (selectedType === 'blood_pressure') {
      const sys = parseInt(systolic, 10);
      const dia = parseInt(diastolic, 10);
      if (isNaN(sys) || isNaN(dia) || sys < 50 || sys > 250 || dia < 30 || dia > 150) {
        Alert.alert('Invalid Range', 'Please enter clinically plausible systolic (50-250) and diastolic (30-150) values.');
        return;
      }
      finalValue = `${sys}/${dia}`;
      finalUnit = 'mmHg';
    } else {
      const numVal = parseFloat(value);
      if (isNaN(numVal) || numVal <= 0) {
        Alert.alert('Invalid Value', 'Please enter a valid positive number.');
        return;
      }
      finalValue = numVal;

      switch (selectedType) {
        case 'heart_rate':
          if (numVal < 30 || numVal > 220) {
            Alert.alert('Clinical Validation', 'Heart rate is typically between 30 and 220 bpm.');
            return;
          }
          finalUnit = 'bpm';
          break;
        case 'oxygen_saturation':
          if (numVal < 50 || numVal > 100) {
            Alert.alert('Clinical Validation', 'SpO2 must be between 50% and 100%.');
            return;
          }
          finalUnit = '%';
          break;
        case 'temperature':
          if (numVal < 85 || numVal > 110) {
            Alert.alert('Clinical Validation', 'Body temperature is typically between 85°F and 110°F.');
            return;
          }
          finalUnit = '°F';
          break;
        case 'respiratory_rate':
          finalUnit = 'breaths/min';
          break;
        case 'blood_glucose':
          finalUnit = 'mg/dL';
          break;
      }
    }

    setSaving(true);
    try {
      const newRecord: VitalRecord = {
        id: `vit-${Date.now()}`,
        type: selectedType,
        value: finalValue,
        unit: finalUnit,
        timestamp: new Date().toISOString(),
        source: 'Patient App',
        status: 'normal',
        notes: notes.trim() || undefined,
      };

      await api.logVital(patient.id, newRecord);
      await refreshPatient();
      setModalVisible(false);
      setValue('');
      setSystolic('');
      setDiastolic('');
      setNotes('');
      Alert.alert('Success', 'Vital measurement logged and synced with your medical chart.');
    } catch {
      Alert.alert('Sync Error', 'Failed to save vital to the server. Please check connection.');
    } finally {
      setSaving(false);
    }
  };

  const getVitalIcon = (type: string) => {
    switch (type) {
      case 'heart_rate':
        return <Heart size={20} color="#EF4444" />;
      case 'blood_pressure':
        return <Activity size={20} color="#3B82F6" />;
      case 'oxygen_saturation':
        return <Droplets size={20} color="#06B6D4" />;
      case 'temperature':
        return <Thermometer size={20} color="#F59E0B" />;
      case 'respiratory_rate':
        return <Wind size={20} color="#10B981" />;
      default:
        return <Activity size={20} color="#8B5CF6" />;
    }
  };

  const formatTitle = (type: string) => {
    return type
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Summary */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.pageTitle}>Vitals Monitoring</Text>
            <Text style={styles.pageSubtitle}>Continuous Bio-metric Synchronization</Text>
          </View>
          <TouchableOpacity
            style={styles.logButton}
            onPress={() => setModalVisible(true)}
            accessibilityLabel="Log Vital"
          >
            <Plus size={18} color="#FFFFFF" />
            <Text style={styles.logButtonText}>Log Vital</Text>
          </TouchableOpacity>
        </View>

        {/* Latest Readings Cards */}
        <Text style={styles.sectionTitle}>Current Health Metrics</Text>
        <View style={styles.grid}>
          {['heart_rate', 'blood_pressure', 'oxygen_saturation', 'temperature'].map((type) => {
            const latest = vitals.find((v) => v.type === type);
            return (
              <View key={type} style={styles.metricCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconCircle}>{getVitalIcon(type)}</View>
                  <Text style={styles.statusBadge}>{latest?.status || 'Active'}</Text>
                </View>
                <Text style={styles.metricValue}>
                  {latest ? latest.value : '--'}
                  <Text style={styles.metricUnit}> {latest ? latest.unit : ''}</Text>
                </Text>
                <Text style={styles.metricLabel}>{formatTitle(type)}</Text>
              </View>
            );
          })}
        </View>

        {/* Historical Stream */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent Measurement Logs</Text>
        {vitals.length === 0 ? (
          <View style={styles.emptyCard}>
            <AlertCircle size={28} color="#64748B" />
            <Text style={styles.emptyText}>No vitals recorded yet. Tap "Log Vital" to record your first metric.</Text>
          </View>
        ) : (
          vitals.map((v) => (
            <View key={v.id} style={styles.historyCard}>
              <View style={styles.historyLeft}>
                <View style={styles.historyIcon}>{getVitalIcon(v.type)}</View>
                <View>
                  <Text style={styles.historyTitle}>{formatTitle(v.type)}</Text>
                  <View style={styles.timestampRow}>
                    <Calendar size={12} color="#64748B" />
                    <Text style={styles.historyTime}>
                      {new Date(v.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  {v.notes && <Text style={styles.historyNotes}>{v.notes}</Text>}
                </View>
              </View>
              <View style={styles.historyRight}>
                <Text style={styles.historyValue}>
                  {v.value} <Text style={styles.historyUnit}>{v.unit}</Text>
                </Text>
                <Text style={styles.sourceText}>{v.source}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Log Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Vital Measurement</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Measurement Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
              {[
                { id: 'heart_rate', label: 'Heart Rate' },
                { id: 'blood_pressure', label: 'Blood Pressure' },
                { id: 'oxygen_saturation', label: 'SpO2' },
                { id: 'temperature', label: 'Temperature' },
                { id: 'blood_glucose', label: 'Glucose' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.typeChip,
                    selectedType === item.id && styles.typeChipSelected,
                  ]}
                  onPress={() => setSelectedType(item.id as any)}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      selectedType === item.id && styles.typeChipTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selectedType === 'blood_pressure' ? (
              <View style={styles.bpRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Systolic (mmHg)</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="numeric"
                    placeholder="e.g. 120"
                    placeholderTextColor="#64748B"
                    value={systolic}
                    onChangeText={setSystolic}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Diastolic (mmHg)</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="numeric"
                    placeholder="e.g. 80"
                    placeholderTextColor="#64748B"
                    value={diastolic}
                    onChangeText={setDiastolic}
                  />
                </View>
              </View>
            ) : (
              <View>
                <Text style={styles.inputLabel}>
                  Value ({selectedType === 'heart_rate' ? 'bpm' : selectedType === 'oxygen_saturation' ? '%' : selectedType === 'temperature' ? '°F' : 'mg/dL'})
                </Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  placeholder="Enter value"
                  placeholderTextColor="#64748B"
                  value={value}
                  onChangeText={setValue}
                />
              </View>
            )}

            <Text style={styles.inputLabel}>Clinical Notes (Optional)</Text>
            <TextInput
              style={[styles.modalInput, { height: 60 }]}
              placeholder="e.g. Measured at rest after morning walk"
              placeholderTextColor="#64748B"
              value={notes}
              onChangeText={setNotes}
              multiline
            />

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSaveVital}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Measurement</Text>
              )}
            </TouchableOpacity>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D9488',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  logButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: '#1E293B',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  historyIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  historyTime: {
    fontSize: 11,
    color: '#64748B',
  },
  historyNotes: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  historyUnit: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  sourceText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 4,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  typeChipSelected: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  typeChipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  typeChipTextSelected: {
    color: '#FFFFFF',
  },
  bpRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalInput: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#0D9488',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
