import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  Activity,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  Stethoscope,
  ShieldCheck,
  Sparkles,
  Phone,
  User,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

export const AuthScreen: React.FC = () => {
  const { login, signup, loginWithGoogle, demoPatientLogin, demoDoctorLogin } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');

  // Form inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('aryan.yadav@health.me');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleRoleSwitch = (selectedRole: 'patient' | 'doctor') => {
    setRole(selectedRole);
    if (selectedRole === 'doctor') {
      setEmail('dr.priya@medicalai.in');
    } else {
      setEmail('aryan.yadav@health.me');
    }
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Required Fields', 'Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        const res = await login(email.trim(), password.trim(), role);
        if (!res.success) {
          Alert.alert('Authentication Failed', res.error || 'Invalid email or password.');
        }
      } else {
        if (!fullName.trim()) {
          Alert.alert('Name Required', 'Please enter your full legal name.');
          setLoading(false);
          return;
        }
        const res = await signup(fullName.trim(), email.trim(), password.trim(), phone.trim(), role);
        if (!res.success) {
          Alert.alert('Registration Notice', res.error || 'Failed to complete registration.');
        }
      }
    } catch (err: any) {
      Alert.alert('Connection Error', err?.message || 'Unable to connect to healthcare authentication server.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const res = await loginWithGoogle(role);
      if (!res.success) {
        Alert.alert('Google Sign-In', res.error || 'Google authorization was cancelled or failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoWrap}>
            <Activity size={32} color="#0D9488" />
          </View>
          <Text style={styles.brandTitle}>MEDICAL AI</Text>
          <Text style={styles.brandSubtitle}>
            Clinical Intelligence & Ambulatory Triage Infrastructure
          </Text>
        </View>

        {/* Portal Role Switcher */}
        <View style={styles.roleTabs}>
          <TouchableOpacity
            style={[styles.roleTab, role === 'patient' && styles.roleTabActive]}
            onPress={() => handleRoleSwitch('patient')}
          >
            <User size={16} color={role === 'patient' ? '#0D9488' : '#94A3B8'} />
            <Text style={[styles.roleTabText, role === 'patient' && styles.roleTabTextActive]}>
              Patient Portal
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleTab, role === 'doctor' && styles.roleTabActiveDoctor]}
            onPress={() => handleRoleSwitch('doctor')}
          >
            <Stethoscope size={16} color={role === 'doctor' ? '#10B981' : '#94A3B8'} />
            <Text style={[styles.roleTabText, role === 'doctor' && styles.roleTabTextActiveDoctor]}>
              Doctor Portal
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card Box */}
        <View style={styles.card}>
          {/* Mode Switcher */}
          <View style={styles.modeRow}>
            <TouchableOpacity onPress={() => setMode('signin')}>
              <Text style={[styles.modeTitle, mode === 'signin' && styles.modeTitleActive]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <Text style={styles.modeDivider}>•</Text>
            <TouchableOpacity onPress={() => setMode('signup')}>
              <Text style={[styles.modeTitle, mode === 'signup' && styles.modeTitleActive]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.formSubtitle}>
            {role === 'doctor'
              ? 'Authorized physician credentialing & consultation queue'
              : 'Secure institutional medical records & preliminary triage'}
          </Text>

          {/* Full Name (Sign Up only) */}
          {mode === 'signup' && (
            <>
              <Text style={styles.label}>Full Legal Name</Text>
              <View style={styles.inputWrap}>
                <User size={18} color="#64748B" />
                <TextInput
                  style={styles.input}
                  placeholder={role === 'doctor' ? 'e.g. Dr. Priya Sharma, MD' : 'e.g. Aryan Yadav'}
                  placeholderTextColor="#64748B"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              <Text style={styles.label}>Contact Phone (+91)</Text>
              <View style={styles.inputWrap}>
                <Phone size={18} color="#64748B" />
                <TextInput
                  style={styles.input}
                  placeholder="+91 98765 43210"
                  placeholderTextColor="#64748B"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </>
          )}

          {/* Email */}
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrap}>
            <Mail size={18} color="#64748B" />
            <TextInput
              style={styles.input}
              placeholder={role === 'doctor' ? 'dr.priya@medicalai.in' : 'aryan.yadav@health.me'}
              placeholderTextColor="#64748B"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrap}>
            <Lock size={18} color="#64748B" />
            <TextInput
              style={styles.input}
              placeholder="Enter secure password"
              placeholderTextColor="#64748B"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Submit CTA */}
          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.primaryBtnText}>
                  {mode === 'signin'
                    ? role === 'doctor'
                      ? 'Access Doctor Portal'
                      : 'Sign In to Patient Portal'
                    : 'Create Account & Continue'}
                </Text>
                <ArrowRight size={18} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>

          {/* Google Sign In Button */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogleAuth}
            disabled={loading}
          >
            <Sparkles size={18} color="#38BDF8" />
            <Text style={styles.googleBtnText}>
              Continue with Google Account
            </Text>
          </TouchableOpacity>

          {/* Quick Demo Access Bar */}
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>Institutional One-Tap Demo Access</Text>
            <View style={styles.demoRow}>
              <TouchableOpacity
                style={styles.demoBtn}
                onPress={() => {
                  setRole('patient');
                  demoPatientLogin();
                }}
                disabled={loading}
              >
                <UserCheck size={14} color="#0D9488" />
                <Text style={styles.demoBtnText}>Patient Demo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.demoBtnDoctor}
                onPress={() => {
                  setRole('doctor');
                  demoDoctorLogin();
                }}
                disabled={loading}
              >
                <Stethoscope size={14} color="#10B981" />
                <Text style={styles.demoBtnDoctorText}>Doctor Demo</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Compliance Footer Note */}
          <View style={styles.complianceNote}>
            <ShieldCheck size={14} color="#10B981" />
            <Text style={styles.complianceText}>
              HIPAA & GDPR Architectural Standards · AES-256 Storage
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1D',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoWrap: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
    lineHeight: 18,
  },
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  roleTabActive: {
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    borderWidth: 1,
    borderColor: '#0D9488',
  },
  roleTabActiveDoctor: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  roleTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  roleTabTextActive: {
    color: '#0D9488',
  },
  roleTabTextActiveDoctor: {
    color: '#10B981',
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#64748B',
  },
  modeTitleActive: {
    color: '#F8FAFC',
  },
  modeDivider: {
    color: '#475569',
    fontSize: 16,
  },
  formSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 20,
    marginTop: 2,
    lineHeight: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0F1D',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 16,
    gap: 10,
  },
  input: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D9488',
    borderRadius: 14,
    height: 50,
    marginTop: 6,
    gap: 8,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 14,
    height: 48,
    marginTop: 10,
    gap: 8,
  },
  googleBtnText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  demoSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 10,
  },
  demoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  demoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.3)',
    borderRadius: 12,
    paddingVertical: 10,
    gap: 6,
  },
  demoBtnText: {
    color: '#0D9488',
    fontSize: 12,
    fontWeight: '600',
  },
  demoBtnDoctor: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 12,
    paddingVertical: 10,
    gap: 6,
  },
  demoBtnDoctorText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  complianceNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
  },
  complianceText: {
    color: '#64748B',
    fontSize: 11,
  },
});
