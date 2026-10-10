import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  ShieldCheck,
  User,
  Heart,
  Phone,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMMON_ALLERGIES = ['Penicillin', 'Sulfa drugs', 'Aspirin', 'Ibuprofen', 'Latex', 'Peanuts', 'None'];
const COMMON_CONDITIONS = ['Hypertension', 'Type 2 Diabetes', 'Asthma', 'Thyroid Disorder', 'CAD / Heart Disease', 'None'];

export const OnboardingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, updateProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [dob, setDob] = useState(user?.dateOfBirth || '1998-09-14');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || 'O+');
  const [allergies, setAllergies] = useState<string[]>(['Penicillin']);
  const [conditions, setConditions] = useState<string[]>(['None']);
  const [contactName, setContactName] = useState('Sunita Yadav');
  const [contactRel, setContactRel] = useState('Mother');
  const [contactPhone, setContactPhone] = useState('+91 98765 43210');
  const [consentGiven, setConsentGiven] = useState(true);

  const toggleAllergy = (item: string) => {
    if (item === 'None') {
      setAllergies(['None']);
      return;
    }
    const filtered = allergies.filter((a) => a !== 'None');
    if (filtered.includes(item)) {
      setAllergies(filtered.filter((a) => a !== item));
    } else {
      setAllergies([...filtered, item]);
    }
  };

  const toggleCondition = (item: string) => {
    if (item === 'None') {
      setConditions(['None']);
      return;
    }
    const filtered = conditions.filter((c) => c !== 'None');
    if (filtered.includes(item)) {
      setConditions(filtered.filter((c) => c !== item));
    } else {
      setConditions([...filtered, item]);
    }
  };

  const handleComplete = async () => {
    if (!consentGiven) {
      Alert.alert('Consent Required', 'Please acknowledge the medical data privacy notice to proceed.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: name.trim() || user?.name,
        dateOfBirth: dob,
        bloodGroup,
        hasCompletedOnboarding: true,
        emergencyContacts: [
          {
            id: `ec-${Date.now()}`,
            name: contactName.trim(),
            relationship: contactRel,
            phone: contactPhone.trim(),
            isPrimary: true,
            isActive: true,
          },
        ],
      } as any);

      Alert.alert('Onboarding Complete', 'Your clinical profile has been established securely.', [
        { text: 'Enter Dashboard', onPress: () => navigation.replace('MainTabs') },
      ]);
    } catch {
      navigation.replace('MainTabs');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Stepper Header */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <ShieldCheck size={14} color="#0D9488" />
          <Text style={styles.badgeText}>Clinical Profile Onboarding</Text>
        </View>
        <Text style={styles.title}>Step {step} of 3</Text>
        <Text style={styles.subtitle}>
          {step === 1 && 'Personal & Emergency Contact Details'}
          {step === 2 && 'Critical Medical & Allergy Context'}
          {step === 3 && 'Privacy Consent & Institutional Agreement'}
        </Text>

        <View style={styles.stepperBar}>
          <View style={[styles.stepIndicator, step >= 1 && styles.stepActive]} />
          <View style={[styles.stepIndicator, step >= 2 && styles.stepActive]} />
          <View style={[styles.stepIndicator, step >= 3 && styles.stepActive]} />
        </View>
      </View>

      {/* STEP 1 */}
      {step === 1 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Demographics & Contacts</Text>

          <Text style={styles.label}>Full Legal Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Aryan Yadav"
            placeholderTextColor="#64748B"
          />

          <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={dob}
            onChangeText={setDob}
            placeholder="1998-09-14"
            placeholderTextColor="#64748B"
          />

          <Text style={styles.label}>Biological Sex / Gender</Text>
          <View style={styles.row}>
            {['Male', 'Female', 'Other'].map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.pill, gender === g && styles.pillActive]}
                onPress={() => setGender(g)}
              >
                <Text style={[styles.pillText, gender === g && styles.pillTextActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Primary Emergency Contact</Text>

          <Text style={styles.label}>Contact Name</Text>
          <TextInput
            style={styles.input}
            value={contactName}
            onChangeText={setContactName}
            placeholder="e.g. Sunita Yadav"
            placeholderTextColor="#64748B"
          />

          <Text style={styles.label}>Relationship</Text>
          <TextInput
            style={styles.input}
            value={contactRel}
            onChangeText={setContactRel}
            placeholder="e.g. Mother, Spouse, Sibling"
            placeholderTextColor="#64748B"
          />

          <Text style={styles.label}>Phone Number (+91)</Text>
          <TextInput
            style={styles.input}
            value={contactPhone}
            onChangeText={setContactPhone}
            placeholder="+91 98765 43210"
            placeholderTextColor="#64748B"
            keyboardType="phone-pad"
          />

          <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(2)}>
            <Text style={styles.nextBtnText}>Continue to Medical Context</Text>
            <ArrowRight size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Blood Group</Text>
          <View style={styles.wrapRow}>
            {BLOOD_GROUPS.map((bg) => (
              <TouchableOpacity
                key={bg}
                style={[styles.pillSquare, bloodGroup === bg && styles.pillSquareActive]}
                onPress={() => setBloodGroup(bg)}
              >
                <Text style={[styles.pillText, bloodGroup === bg && styles.pillTextActive]}>{bg}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Known Drug & Food Allergies</Text>
          <View style={styles.wrapRow}>
            {COMMON_ALLERGIES.map((al) => {
              const active = allergies.includes(al);
              return (
                <TouchableOpacity
                  key={al}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => toggleAllergy(al)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{al}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Existing Chronic Conditions</Text>
          <View style={styles.wrapRow}>
            {COMMON_CONDITIONS.map((cond) => {
              const active = conditions.includes(cond);
              return (
                <TouchableOpacity
                  key={cond}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => toggleCondition(cond)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{cond}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.nextBtnFlex} onPress={() => setStep(3)}>
              <Text style={styles.nextBtnText}>Review & Consent</Text>
              <ArrowRight size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Data Privacy & Consent Notice</Text>

          <View style={styles.consentBox}>
            <CheckCircle2 size={20} color="#0D9488" style={{ marginTop: 2 }} />
            <Text style={styles.consentBody}>
              Medical AI encrypts all electronic health data under AES-256 and follows HIPAA architectural guidelines. Your records are only accessible to you and licensed physicians participating in your care.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setConsentGiven(!consentGiven)}
          >
            <View style={[styles.checkbox, consentGiven && styles.checkboxActive]}>
              {consentGiven && <Check size={14} color="#FFFFFF" />}
            </View>
            <Text style={styles.checkboxLabel}>
              I confirm the provided medical history is accurate and authorize emergency contact notification during SOS triggers.
            </Text>
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}>
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.nextBtnFlex, saving && styles.btnDisabled]}
              onPress={handleComplete}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.nextBtnText}>Finalize & Save</Text>
                  <CheckCircle2 size={16} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1D',
  },
  content: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.3)',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  badgeText: {
    color: '#0D9488',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  stepperBar: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  stepIndicator: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1E293B',
  },
  stepActive: {
    backgroundColor: '#0D9488',
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#0A0F1D',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#F8FAFC',
    fontSize: 14,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  pill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#0A0F1D',
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: 'rgba(13, 148, 136, 0.2)',
    borderColor: '#0D9488',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  pillTextActive: {
    color: '#0D9488',
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  pillSquare: {
    width: 60,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#0A0F1D',
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillSquareActive: {
    backgroundColor: 'rgba(13, 148, 136, 0.2)',
    borderColor: '#0D9488',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#0A0F1D',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  chipActive: {
    backgroundColor: 'rgba(13, 148, 136, 0.2)',
    borderColor: '#0D9488',
  },
  chipText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#0D9488',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#1E293B',
    marginVertical: 14,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D9488',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: '#CBD5E1',
    fontWeight: '600',
    fontSize: 14,
  },
  nextBtnFlex: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D9488',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  consentBox: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.25)',
    marginBottom: 16,
  },
  consentBody: {
    flex: 1,
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
  },
});
