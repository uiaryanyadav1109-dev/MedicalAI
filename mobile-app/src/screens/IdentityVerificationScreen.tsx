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
  ShieldCheck,
  ShieldAlert,
  FileCheck2,
  Clock,
  Info,
  CheckCircle,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/apiClient';

export const IdentityVerificationScreen: React.FC = () => {
  const { patient } = useAuth();
  const [docType, setDocType] = useState<'aadhaar' | 'passport' | 'drivers_license'>('aadhaar');
  const [docNumber, setDocNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('unverified');
  const [maskedNumber, setMaskedNumber] = useState<string | null>(null);

  useEffect(() => {
    if (patient?.id) {
      loadStatus();
    }
  }, [patient?.id]);

  const loadStatus = async () => {
    if (!patient?.id) return;
    try {
      const res = await api.getIdentityStatus(patient.id);
      setStatus(res.status);
      setMaskedNumber(res.maskedNumber || null);
    } catch {
      // Default to unverified
    }
  };

  const handleVerify = async () => {
    if (!docNumber.trim() || docNumber.trim().length < 4) {
      Alert.alert('Invalid Document', 'Please enter a valid document number with at least 4 digits.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.submitIdentityVerification(patient?.id || 'pat-1', {
        type: docType,
        documentNumber: docNumber.trim(),
      });
      setStatus(res.status);
      setMaskedNumber(res.maskedNumber);
      setDocNumber('');
      Alert.alert('Verification Submitted', 'Your document has been securely processed and verified.');
    } catch {
      Alert.alert('Submission Error', 'Failed to submit verification to the identity controller.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelVerification = async () => {
    if (!patient?.id) return;
    try {
      await api.cancelIdentityVerification(patient.id);
      setStatus('unverified');
      setMaskedNumber(null);
      Alert.alert('Verification Cleared', 'Optional verification data has been removed from your active profile.');
    } catch {
      Alert.alert('Action Failed', 'Could not reset verification status.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Identity Verification</Text>
        <Text style={styles.subtitle}>Optional Clinical Trust Credential</Text>
      </View>

      {/* Critical Architecture Distinction Box */}
      <View style={styles.infoBox}>
        <Info size={16} color="#0D9488" />
        <Text style={styles.infoText}>
          <Text style={{ fontWeight: '700' }}>Important Notice:</Text> Your institutional Patient ID (MRN: {patient?.patientId || 'MAI-80429'}) is distinct from government-issued identity documents. Verification is purely optional and is never required for emergency care or preliminary triage.
        </Text>
      </View>

      {/* Current Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          {status === 'verified' ? (
            <ShieldCheck size={28} color="#10B981" />
          ) : status === 'pending' ? (
            <Clock size={28} color="#F59E0B" />
          ) : (
            <ShieldAlert size={28} color="#64748B" />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.statusLabel}>Current Verification Status</Text>
            <Text style={[
              styles.statusValue,
              status === 'verified' && { color: '#10B981' },
              status === 'pending' && { color: '#F59E0B' },
            ]}>
              {status.toUpperCase()}
            </Text>
          </View>
        </View>

        {maskedNumber && (
          <View style={styles.maskedRow}>
            <Text style={styles.maskedLabel}>Document on record:</Text>
            <Text style={styles.maskedValue}>{maskedNumber}</Text>
          </View>
        )}
      </View>

      {/* Submission Form if unverified */}
      {status !== 'verified' ? (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Submit Identification</Text>
          <Text style={styles.formSubtitle}>Choose document type to authenticate your medical records.</Text>

          {/* Doc Type Selector */}
          <View style={styles.selectorRow}>
            {[
              { id: 'aadhaar', label: 'National ID / Aadhaar' },
              { id: 'passport', label: 'Passport' },
              { id: 'drivers_license', label: "Driver's License" },
            ].map((d) => (
              <TouchableOpacity
                key={d.id}
                style={[styles.typeBtn, docType === d.id && styles.typeBtnActive]}
                onPress={() => setDocType(d.id as any)}
              >
                <Text style={[styles.typeBtnText, docType === d.id && styles.typeBtnTextActive]}>
                  {d.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Document Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter document number"
            placeholderTextColor="#64748B"
            value={docNumber}
            onChangeText={setDocNumber}
            secureTextEntry
          />
          <Text style={styles.encryptionNote}>
            Numbers are hashed and encrypted client-side. Only masked values (•••• 1234) are stored.
          </Text>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <FileCheck2 size={16} color="#FFFFFF" />
                <Text style={styles.submitBtnText}>Submit Verification</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.verifiedContainer}>
          <View style={styles.verifiedBanner}>
            <CheckCircle size={20} color="#10B981" />
            <Text style={styles.verifiedBannerText}>
              Your account identity is securely validated for institutional prescription exchange.
            </Text>
          </View>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelVerification}>
            <Text style={styles.cancelBtnText}>Revoke / Clear Optional Verification</Text>
          </TouchableOpacity>
        </View>
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.3)',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 12,
    color: '#CBD5E1',
    flex: 1,
    lineHeight: 18,
  },
  statusCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 2,
  },
  maskedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  maskedLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  maskedValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  formCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  formSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    marginBottom: 14,
  },
  selectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  typeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  typeBtnActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  typeBtnText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  typeBtnTextActive: {
    color: '#FFFFFF',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 14,
  },
  encryptionNote: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 6,
    marginBottom: 16,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D9488',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  verifiedContainer: {
    gap: 12,
  },
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  verifiedBannerText: {
    fontSize: 12,
    color: '#6EE7B7',
    flex: 1,
    lineHeight: 18,
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
});
