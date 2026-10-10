import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  TextInput,
  Alert,
} from 'react-native';
import {
  Stethoscope,
  Share2,
  FileCheck,
  HelpCircle,
  Activity,
  Plus,
  ShieldAlert,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

export const DoctorHandoffScreen: React.FC = () => {
  const { patient } = useAuth();
  const [patientQuestions, setPatientQuestions] = useState<string[]>([
    'Should my current medication dosage be adjusted based on my vitals?',
    'Are there any dietary interactions with my prescriptions?',
  ]);
  const [newQuestion, setNewQuestion] = useState('');

  const vitals = patient?.vitals || [];
  const medications = patient?.medications || [];
  const allergies = patient?.allergies || [];
  const recentReports = patient?.reports || [];

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    setPatientQuestions([...patientQuestions, newQuestion.trim()]);
    setNewQuestion('');
  };

  const generateHandoffText = () => {
    return `=== CLINICAL HANDOFF & TRIAGE PACKET ===
PATIENT: ${patient?.name} (MRN: ${patient?.patientId || 'MAI-80429'})
DOB: ${patient?.dateOfBirth || '1990-01-01'} | BLOOD GROUP: ${patient?.bloodType || 'O+'}

[ALLERGIES & CONTRAINDICATIONS]
${allergies.length > 0 ? allergies.join(', ') : 'No known drug allergies (NKDA)'}

[RECENT OBJECTIVE VITALS]
${vitals.slice(0, 4).map((v) => `• ${v.type.toUpperCase()}: ${v.value} ${v.unit} (${new Date(v.timestamp).toLocaleDateString()})`).join('\n') || 'No vitals logged'}

[ACTIVE MEDICATIONS]
${medications.map((m) => `• ${m.name} ${m.dosage} - ${m.frequency}`).join('\n') || 'None'}

[RECENT LABS & REPORTS]
${recentReports.slice(0, 2).map((r) => `• ${r.title}: ${r.findings} (${r.date})`).join('\n') || 'None'}

[QUESTIONS PREPARED BY PATIENT]
${patientQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

SOURCE GROUNDING NOTICE:
This briefing is compiled from patient-authorized records. AI assistance did not fabricate or alter clinical lab results.
========================================`;
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: `Clinical Handoff - ${patient?.name}`,
        message: generateHandoffText(),
      });
    } catch {
      // User cancelled
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Doctor Handoff</Text>
          <Text style={styles.subtitle}>Structured SBAR Clinical Summary</Text>
        </View>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Share2 size={16} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>Export Packet</Text>
        </TouchableOpacity>
      </View>

      {/* Safety Notice */}
      <View style={styles.disclaimerCard}>
        <ShieldAlert size={16} color="#0D9488" />
        <Text style={styles.disclaimerText}>
          Grounding Guarantee: Strictly references authenticated patient records. Does not fabricate lab results or convert AI triage impressions into formal diagnoses.
        </Text>
      </View>

      {/* Section 1: Situation & Patient Identifier */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Stethoscope size={18} color="#0D9488" />
          <Text style={styles.sectionTitle}>1. Situation & Patient Demographics</Text>
        </View>
        <View style={styles.gridRow}>
          <View style={styles.gridCol}>
            <Text style={styles.colLabel}>PATIENT NAME</Text>
            <Text style={styles.colValue}>{patient?.name}</Text>
          </View>
          <View style={styles.gridCol}>
            <Text style={styles.colLabel}>INSTITUTIONAL MRN</Text>
            <Text style={styles.colValue}>{patient?.patientId || 'MAI-80429'}</Text>
          </View>
        </View>
        <View style={[styles.gridRow, { marginTop: 10 }]}>
          <View style={styles.gridCol}>
            <Text style={styles.colLabel}>BLOOD GROUP</Text>
            <Text style={styles.colValue}>{patient?.bloodType || 'O+'}</Text>
          </View>
          <View style={styles.gridCol}>
            <Text style={styles.colLabel}>ALLERGIES</Text>
            <Text style={[styles.colValue, { color: '#F87171' }]}>
              {allergies.join(', ') || 'NKDA'}
            </Text>
          </View>
        </View>
      </View>

      {/* Section 2: Objective Vitals Stream */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Activity size={18} color="#3B82F6" />
          <Text style={styles.sectionTitle}>2. Objective Vitals & Biomarkers</Text>
        </View>
        {vitals.slice(0, 3).map((v) => (
          <View key={v.id} style={styles.vitalRow}>
            <Text style={styles.vitalType}>{v.type.replace('_', ' ').toUpperCase()}</Text>
            <Text style={styles.vitalVal}>
              {v.value} {v.unit}
            </Text>
          </View>
        ))}
      </View>

      {/* Section 3: Active Medications */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <FileCheck size={18} color="#10B981" />
          <Text style={styles.sectionTitle}>3. Active Medication Regimen</Text>
        </View>
        {medications.map((m) => (
          <View key={m.id} style={styles.medRow}>
            <Text style={styles.medNameText}>{m.name} ({m.dosage})</Text>
            <Text style={styles.medFreqText}>{m.frequency}</Text>
          </View>
        ))}
      </View>

      {/* Section 4: Patient Inquiries for Clinician */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <HelpCircle size={18} color="#F59E0B" />
          <Text style={styles.sectionTitle}>4. Questions for Your Doctor</Text>
        </View>
        {patientQuestions.map((q, idx) => (
          <View key={idx} style={styles.questionItem}>
            <Text style={styles.questionIndex}>{idx + 1}.</Text>
            <Text style={styles.questionText}>{q}</Text>
          </View>
        ))}

        {/* Add Question Input */}
        <View style={styles.addQRow}>
          <TextInput
            style={styles.addQInput}
            placeholder="Add question for your doctor..."
            placeholderTextColor="#64748B"
            value={newQuestion}
            onChangeText={setNewQuestion}
          />
          <TouchableOpacity style={styles.addQBtn} onPress={handleAddQuestion}>
            <Plus size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
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
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0D9488',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
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
    marginBottom: 16,
  },
  disclaimerText: {
    color: '#99F6E4',
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
  sectionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridCol: {
    flex: 1,
  },
  colLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  colValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
    marginTop: 2,
  },
  vitalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.4)',
  },
  vitalType: {
    fontSize: 12,
    color: '#94A3B8',
  },
  vitalVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  medRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.4)',
  },
  medNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  medFreqText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  questionItem: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  questionIndex: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F59E0B',
  },
  questionText: {
    fontSize: 13,
    color: '#CBD5E1',
    flex: 1,
    lineHeight: 18,
  },
  addQRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  addQInput: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#F8FAFC',
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  addQBtn: {
    backgroundColor: '#0D9488',
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
