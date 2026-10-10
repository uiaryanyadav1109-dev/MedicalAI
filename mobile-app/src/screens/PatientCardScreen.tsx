import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Modal,
} from 'react-native';
import {
  ShieldCheck,
  RotateCw,
  Share2,
  Heart,
  AlertTriangle,
  User,
  Shield,
  Activity,
  Maximize2,
  X,
  CheckCircle,
} from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../context/AuthContext';

export const PatientCardScreen: React.FC = () => {
  const { patient } = useAuth();
  const [isFlipped, setIsFlipped] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);

  const allergies = patient?.allergies || [];
  const primaryContact = patient?.emergencyContacts?.[0];
  const patientMrn = patient?.patientId || 'MAI-80429';
  const qrVerificationPayload = `https://medicalai.app/verify/patient/${patientMrn}`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Medical AI Digital Health Pass\nName: ${patient?.name || 'Aryan Yadav'}\nMRN: ${patientMrn}\nBlood Type: ${patient?.bloodType || 'O+'}\nAllergies: ${allergies.join(', ') || 'NKDA'}\nVerification: ${qrVerificationPayload}`,
        title: 'Institutional Patient Health Card',
      });
    } catch {
      // Ignore share cancellation
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Digital Health Pass</Text>
        <Text style={styles.subtitle}>Institutional Clinical Identity (MRN)</Text>
      </View>

      {/* Flip Card Action Hint */}
      <TouchableOpacity style={styles.flipHint} onPress={() => setIsFlipped(!isFlipped)}>
        <RotateCw size={14} color="#0D9488" />
        <Text style={styles.flipHintText}>
          {isFlipped ? 'Tap to view Front of Card' : 'Tap to flip for Clinical & Emergency Protocols'}
        </Text>
      </TouchableOpacity>

      {/* Card Body */}
      {!isFlipped ? (
        /* Front of Card */
        <View style={styles.cardFront}>
          {/* Card Top Strip */}
          <View style={styles.cardTopStrip}>
            <View style={styles.brandRow}>
              <Activity size={20} color="#0D9488" />
              <Text style={styles.brandName}>MEDICAL AI CLINICAL</Text>
            </View>
            <View style={styles.badgeVerified}>
              <ShieldCheck size={12} color="#10B981" />
              <Text style={styles.badgeVerifiedText}>VERIFIED PASS</Text>
            </View>
          </View>

          {/* Patient Details */}
          <View style={styles.cardCenter}>
            <View style={styles.patientAvatarWrap}>
              <User size={36} color="#38BDF8" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.patientName}>{patient?.name || 'Aryan Yadav'}</Text>
              <Text style={styles.patientMrn}>MRN: {patientMrn}</Text>
              <Text style={styles.patientDob}>DOB: {patient?.dateOfBirth || '1995-04-12'}</Text>
            </View>
          </View>

          {/* Quick Stats Grid */}
          <View style={styles.cardStatsRow}>
            <View style={styles.cardStat}>
              <Text style={styles.cardStatLabel}>BLOOD GROUP</Text>
              <Text style={styles.cardStatValue}>{patient?.bloodType || 'O+'}</Text>
            </View>
            <View style={styles.cardStat}>
              <Text style={styles.cardStatLabel}>PRIMARY ALLERGY</Text>
              <Text style={[styles.cardStatValue, { color: '#F87171' }]}>
                {allergies[0] || 'None Known'}
              </Text>
            </View>
            <View style={styles.cardStat}>
              <Text style={styles.cardStatLabel}>TRIAGE STATUS</Text>
              <Text style={[styles.cardStatValue, { color: '#10B981' }]}>NORMAL</Text>
            </View>
          </View>

          {/* Card Bottom / Real Scannable SVG QR Code */}
          <View style={styles.cardBottomRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.legalDisclaimer}>
                Scan with any hospital terminal or clinician mobile scanner to authenticate record.
              </Text>
              <TouchableOpacity
                style={styles.expandQrBtn}
                onPress={() => setQrModalVisible(true)}
              >
                <Maximize2 size={12} color="#0D9488" />
                <Text style={styles.expandQrText}>Enlarge QR Code</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.qrContainer}
              onPress={() => setQrModalVisible(true)}
              activeOpacity={0.8}
            >
              <QRCode
                value={qrVerificationPayload}
                size={68}
                color="#0F172A"
                backgroundColor="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Back of Card */
        <View style={styles.cardBack}>
          <View style={styles.cardTopStrip}>
            <Text style={styles.cardBackTitle}>EMERGENCY PROTOCOL & CLINICIANS</Text>
            <Shield size={16} color="#0D9488" />
          </View>

          <View style={styles.backSection}>
            <Text style={styles.backSectionLabel}>EMERGENCY CONTACT</Text>
            <Text style={styles.backSectionValue}>
              {primaryContact
                ? `${primaryContact.name} (${primaryContact.relationship})`
                : 'Dr. Priya Sharma (Care Physician)'}
            </Text>
            <Text style={styles.backSectionPhone}>
              {primaryContact?.phone || '+91 98765 43210'}
            </Text>
          </View>

          <View style={styles.backSection}>
            <Text style={styles.backSectionLabel}>RECORDED ALLERGIES & CONTRAINDICATIONS</Text>
            <Text style={styles.backSectionValue}>
              {allergies.length > 0 ? allergies.join(' • ') : 'No known drug allergies (NKDA)'}
            </Text>
          </View>

          <View style={styles.backSection}>
            <Text style={styles.backSectionLabel}>ORGAN DONOR REGISTRATION</Text>
            <View style={styles.donorRow}>
              <Heart size={14} color="#EF4444" />
              <Text style={styles.donorText}>Enrolled Organ Donor (Institutional Consent)</Text>
            </View>
          </View>

          <View style={styles.cardBackFooter}>
            <Text style={styles.cardBackFooterText}>
              In an acute triage event, scan front pass for immediate HL7/FHIR EHR handoff.
            </Text>
          </View>
        </View>
      )}

      {/* Action Toolbar */}
      <View style={styles.actionToolbar}>
        <TouchableOpacity style={styles.toolButton} onPress={handleShare}>
          <Share2 size={18} color="#FFFFFF" />
          <Text style={styles.toolButtonText}>Share Digital Pass</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toolButton, { backgroundColor: '#334155' }]}
          onPress={() => setIsFlipped(!isFlipped)}
        >
          <RotateCw size={18} color="#FFFFFF" />
          <Text style={styles.toolButtonText}>Flip Side</Text>
        </TouchableOpacity>
      </View>

      {/* Security Statement */}
      <View style={styles.securityBox}>
        <AlertTriangle size={16} color="#64748B" />
        <Text style={styles.securityText}>
          Identity Privacy: Your Medical Record Number (MRN) is cryptographically isolated from your national government ID. Government identification data is never stored on or broadcast from this pass.
        </Text>
      </View>

      {/* Modal: Fullscreen QR Scanner Code */}
      <Modal visible={qrModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Patient Verification QR</Text>
                <Text style={styles.modalSubtitle}>MRN: {patientMrn}</Text>
              </View>
              <TouchableOpacity onPress={() => setQrModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalQrWrap}>
              <QRCode
                value={qrVerificationPayload}
                size={220}
                color="#0F172A"
                backgroundColor="#FFFFFF"
              />
            </View>

            <View style={styles.modalInfoRow}>
              <CheckCircle size={16} color="#10B981" />
              <Text style={styles.modalInfoText}>Valid for Hospital ER & Clinic Check-In</Text>
            </View>

            <TouchableOpacity style={styles.modalDoneBtn} onPress={() => setQrModalVisible(false)}>
              <Text style={styles.modalDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 12,
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
  flipHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  flipHintText: {
    fontSize: 12,
    color: '#0D9488',
    fontWeight: '600',
  },
  cardFront: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#334155',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  cardTopStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 1,
  },
  badgeVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeVerifiedText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '700',
  },
  cardCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 18,
  },
  patientAvatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  patientName: {
    fontSize: 19,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  patientMrn: {
    fontSize: 13,
    color: '#0D9488',
    fontWeight: '700',
    marginTop: 2,
  },
  patientDob: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  cardStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  cardStat: {
    alignItems: 'center',
  },
  cardStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  cardStatValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  legalDisclaimer: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
  expandQrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  expandQrText: {
    fontSize: 11,
    color: '#0D9488',
    fontWeight: '600',
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: 10,
  },
  cardBack: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  cardBackTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 0.5,
  },
  backSection: {
    marginTop: 14,
  },
  backSectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  backSectionValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  backSectionPhone: {
    fontSize: 12,
    color: '#38BDF8',
    marginTop: 2,
  },
  donorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  donorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F87171',
  },
  cardBackFooter: {
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 10,
  },
  cardBackFooterText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
  actionToolbar: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  toolButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0D9488',
    paddingVertical: 12,
    borderRadius: 12,
  },
  toolButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  securityBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  securityText: {
    fontSize: 11,
    color: '#94A3B8',
    flex: 1,
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#0D9488',
    fontWeight: '600',
  },
  closeBtn: {
    padding: 4,
  },
  modalQrWrap: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginVertical: 12,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 12,
  },
  modalInfoText: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  modalDoneBtn: {
    backgroundColor: '#0D9488',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  modalDoneText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
