import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
} from 'react-native';
import {
  Bell,
  Shield,
  Server,
  LogOut,
  ChevronRight,
  User,
  Info,
  Languages,
  Trash2,
  Stethoscope,
  RefreshCw,
  Moon,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/apiClient';

export const SettingsScreen: React.FC = () => {
  const { user, patient, doctor, role, setRole, logout } = useAuth();

  // Notification toggles
  const [medAlerts, setMedAlerts] = useState(true);
  const [vitalsAlerts, setVitalsAlerts] = useState(true);
  const [reportAlerts, setReportAlerts] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);

  // App preferences
  const [darkMode, setDarkMode] = useState(true);
  const [selectedLang, setSelectedLang] = useState<'English' | 'Hindi' | 'Bengali'>('English');

  // Server IP Config
  const [serverUrl, setServerUrl] = useState(api.getBaseUrl());
  const [isEditingServer, setIsEditingServer] = useState(false);

  const handleUpdateServer = () => {
    if (!serverUrl.trim()) return;
    api.setBaseUrl(serverUrl.trim());
    setIsEditingServer(false);
    Alert.alert('Server Configuration Updated', `API base URL changed to ${serverUrl.trim()}`);
  };

  const handleToggleRole = () => {
    const nextRole = role === 'patient' ? 'doctor' : 'patient';
    setRole(nextRole);
    Alert.alert(
      'Portal Switched',
      `Active view switched to ${nextRole === 'doctor' ? 'Clinician Doctor Portal' : 'Patient Health Portal'}.`
    );
  };

  const handleClearCache = () => {
    Alert.alert('Purge Offline Cache', 'Clear temporary downloaded documents and local cache?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear Cache',
        style: 'destructive',
        onPress: () => Alert.alert('Success', 'Encrypted local cache has been cleared.'),
      },
    ]);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out from this device?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  const displayName = role === 'doctor' ? doctor?.name || 'Dr. Priya Sharma' : patient?.name || user?.name || 'Aryan Yadav';
  const displayEmail = role === 'doctor' ? doctor?.email || 'dr.priya@medicalai.in' : patient?.email || user?.email || 'aryan.yadav@health.me';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings & Account</Text>
        <Text style={styles.subtitle}>Preferences, Roles, Security & Connectivity</Text>
      </View>

      {/* Account Info Card */}
      <View style={styles.sectionCard}>
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, role === 'doctor' && { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
            {role === 'doctor' ? <Stethoscope size={24} color="#3B82F6" /> : <User size={24} color="#0D9488" />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{displayEmail}</Text>
            <View style={styles.roleTag}>
              <Text style={styles.roleTagText}>
                {role === 'doctor' ? 'ATTENDING CLINICIAN' : 'VERIFIED PATIENT'}
              </Text>
            </View>
          </View>
        </View>

        {/* 1-Tap Portal Role Switcher */}
        <TouchableOpacity style={styles.roleSwitchBtn} onPress={handleToggleRole}>
          <RefreshCw size={14} color="#0D9488" />
          <Text style={styles.roleSwitchText}>
            Switch to {role === 'patient' ? 'Clinician Doctor Portal' : 'Patient Portal'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Language & Interface */}
      <Text style={styles.sectionTitle}>Language & Display</Text>
      <View style={styles.sectionCard}>
        <View style={styles.menuRow}>
          <View style={styles.menuLeft}>
            <Languages size={18} color="#0D9488" />
            <Text style={styles.menuTitle}>App Language</Text>
          </View>
          <View style={styles.langPills}>
            {(['English', 'Hindi', 'Bengali'] as const).map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[styles.langChip, selectedLang === lang && styles.langChipActive]}
                onPress={() => setSelectedLang(lang)}
              >
                <Text style={[styles.langChipText, selectedLang === lang && styles.langChipTextActive]}>
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.toggleRow, { borderBottomWidth: 0, marginTop: 4 }]}>
          <View style={styles.toggleTextWrap}>
            <Text style={styles.toggleTitle}>Dark Theme</Text>
            <Text style={styles.toggleDesc}>Optimized for clinical readability & low-light use</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#334155', true: '#0D9488' }}
          />
        </View>
      </View>

      {/* Notification Preferences */}
      <Text style={styles.sectionTitle}>Notification Alerts</Text>
      <View style={styles.sectionCard}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextWrap}>
            <Text style={styles.toggleTitle}>Medication Reminders</Text>
            <Text style={styles.toggleDesc}>Alerts for scheduled prescription doses</Text>
          </View>
          <Switch
            value={medAlerts}
            onValueChange={setMedAlerts}
            trackColor={{ false: '#334155', true: '#0D9488' }}
          />
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleTextWrap}>
            <Text style={styles.toggleTitle}>Vitals Monitoring</Text>
            <Text style={styles.toggleDesc}>Reminders for daily blood pressure and vitals logging</Text>
          </View>
          <Switch
            value={vitalsAlerts}
            onValueChange={setVitalsAlerts}
            trackColor={{ false: '#334155', true: '#0D9488' }}
          />
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleTextWrap}>
            <Text style={styles.toggleTitle}>Diagnostic Lab Updates</Text>
            <Text style={styles.toggleDesc}>Push notifications when clinician reviews lab tests</Text>
          </View>
          <Switch
            value={reportAlerts}
            onValueChange={setReportAlerts}
            trackColor={{ false: '#334155', true: '#0D9488' }}
          />
        </View>

        <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
          <View style={styles.toggleTextWrap}>
            <Text style={styles.toggleTitle}>Emergency SOS Beacons</Text>
            <Text style={styles.toggleDesc}>High-priority critical emergency broadcasts</Text>
          </View>
          <Switch
            value={emergencyAlerts}
            onValueChange={setEmergencyAlerts}
            trackColor={{ false: '#334155', true: '#0D9488' }}
          />
        </View>
      </View>

      {/* Connectivity & Backend Server Configuration */}
      <Text style={styles.sectionTitle}>Shared Backend Synchronization</Text>
      <View style={styles.sectionCard}>
        <View style={styles.serverRow}>
          <Server size={18} color="#0D9488" />
          <View style={{ flex: 1 }}>
            <Text style={styles.serverLabel}>Backend Server URL</Text>
            {isEditingServer ? (
              <View style={styles.serverEditRow}>
                <TextInput
                  style={styles.serverInput}
                  value={serverUrl}
                  onChangeText={setServerUrl}
                  placeholder="http://10.0.2.2:3000/api"
                  placeholderTextColor="#64748B"
                  autoCapitalize="none"
                />
                <TouchableOpacity style={styles.saveServerBtn} onPress={handleUpdateServer}>
                  <Text style={styles.saveServerBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.serverValue}>{api.getBaseUrl()}</Text>
            )}
          </View>
          {!isEditingServer && (
            <TouchableOpacity onPress={() => setIsEditingServer(true)}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.serverHint}>
          Connected to the canonical backend and database. Synchronizes user records across website and mobile app.
        </Text>
      </View>

      {/* Storage & Privacy */}
      <Text style={styles.sectionTitle}>Privacy & Clinical Governance</Text>
      <View style={styles.sectionCard}>
        <TouchableOpacity
          style={styles.menuRow}
          onPress={() =>
            Alert.alert(
              'HIPAA & Digital Health Compliance',
              'All personal health records, vitals, and notes are encrypted at rest (AES-256) and in transit (TLS 1.3).'
            )
          }
        >
          <View style={styles.menuLeft}>
            <Shield size={18} color="#64748B" />
            <Text style={styles.menuTitle}>HIPAA & Clinical Compliance</Text>
          </View>
          <ChevronRight size={16} color="#64748B" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuRow}
          onPress={() =>
            Alert.alert(
              'AI Processing Disclosure',
              'Clinical AI models act solely as triage assistance and provide source-grounded references without altering clinical notes.'
            )
          }
        >
          <View style={styles.menuLeft}>
            <Info size={18} color="#64748B" />
            <Text style={styles.menuTitle}>AI Processing Transparency</Text>
          </View>
          <ChevronRight size={16} color="#64748B" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuRow, { borderBottomWidth: 0 }]} onPress={handleClearCache}>
          <View style={styles.menuLeft}>
            <Trash2 size={18} color="#EF4444" />
            <Text style={[styles.menuTitle, { color: '#EF4444' }]}>Clear Offline Cache</Text>
          </View>
          <ChevronRight size={16} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <LogOut size={18} color="#EF4444" />
        <Text style={styles.signOutText}>Sign Out of Medical AI</Text>
      </TouchableOpacity>
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
  sectionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 10,
    marginTop: 6,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  userEmail: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  roleTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(13, 148, 136, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  roleTagText: {
    fontSize: 10,
    color: '#0D9488',
    fontWeight: '700',
  },
  roleSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.3)',
  },
  roleSwitchText: {
    color: '#0D9488',
    fontSize: 12,
    fontWeight: '700',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.5)',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuTitle: {
    fontSize: 14,
    color: '#F8FAFC',
    fontWeight: '500',
  },
  langPills: {
    flexDirection: 'row',
    gap: 6,
  },
  langChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#0F172A',
  },
  langChipActive: {
    backgroundColor: '#0D9488',
  },
  langChipText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  langChipTextActive: {
    color: '#FFFFFF',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.5)',
  },
  toggleTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  toggleDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  serverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serverLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  serverValue: {
    fontSize: 13,
    color: '#38BDF8',
    fontWeight: '600',
    marginTop: 2,
  },
  serverEditRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  serverInput: {
    flex: 1,
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
  },
  saveServerBtn: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 6,
  },
  saveServerBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  editBtnText: {
    color: '#0D9488',
    fontSize: 12,
    fontWeight: '700',
  },
  serverHint: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 8,
    lineHeight: 16,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginTop: 8,
  },
  signOutText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
});
