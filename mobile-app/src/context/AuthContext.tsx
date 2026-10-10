import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User, EmergencyContact } from '../types';
import { api } from '../api/apiClient';

export interface MobilePatient extends Partial<User> {
  id: string;
  name: string;
  email: string;
  patientId?: string;
  mrn?: string;
  bloodType?: string;
  bloodGroup?: string;
  dateOfBirth?: string;
  allergies?: string[];
  vitals?: any[];
  medications?: any[];
  prescriptions?: any[];
  reports?: any[];
  appointments?: any[];
  emergencyContacts?: EmergencyContact[];
}

export interface DoctorProfile {
  id: string;
  name: string;
  email: string;
  specialty: string;
  licenseNumber: string;
  hospitalAffiliation: string;
  rating: number;
  totalConsultations: number;
  verificationStatus: 'verified' | 'pending' | 'in_review';
  workingHours: string;
}

interface AuthContextType {
  user: User | null;
  patient: MobilePatient | null;
  doctor: DoctorProfile | null;
  role: 'patient' | 'doctor';
  isDoctor: boolean;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  login: (email: string, password: string, role?: 'patient' | 'doctor') => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (roleContext?: 'patient' | 'doctor') => Promise<{ success: boolean; error?: string }>;
  demoPatientLogin: () => Promise<void>;
  demoDoctorLogin: () => Promise<void>;
  switchRole: (newRole: 'patient' | 'doctor') => Promise<void>;
  setRole: (newRole: 'patient' | 'doctor') => Promise<void>;
  signup: (fullName: string, email: string, password: string, phone?: string, role?: 'patient' | 'doctor') => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUserData: () => Promise<void>;
  refreshPatient: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'medical_ai_mobile_auth_token';
const USER_KEY = 'medical_ai_mobile_auth_user';
const ROLE_KEY = 'medical_ai_mobile_auth_role';

const DEFAULT_DOCTOR: DoctorProfile = {
  id: 'doc-1',
  name: 'Dr. Sarah Chen, MD',
  email: 's.chen@metrohealth.org',
  specialty: 'Internal Medicine & Cardiopulmonary Triage',
  licenseNumber: 'MD-748291',
  hospitalAffiliation: 'Metro Clinical Reference Center',
  rating: 4.9,
  totalConsultations: 1842,
  verificationStatus: 'verified',
  workingHours: '08:00 AM – 06:00 PM (Daily On-Duty)',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [patient, setPatient] = useState<MobilePatient | null>(null);
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from SecureStore on launch
  useEffect(() => {
    restoreSession();
  }, []);

  const syncFullPatientState = async (baseUser: User) => {
    try {
      const packet = await api.clinical.getFullPatientPacket(baseUser.id);
      if (packet.success && packet.data) {
        const fullPatient: MobilePatient = {
          ...baseUser,
          patientId: baseUser.patientId || 'MAI-80429',
          bloodType: baseUser.bloodGroup || 'O+',
          allergies: (baseUser as any).allergies || ['Penicillin', 'Sulfa drugs'],
          vitals: packet.data.vitals || [],
          medications: packet.data.medications || [],
          reports: packet.data.reports || [],
          appointments: packet.data.appointments || [],
          emergencyContacts: (baseUser as any).emergencyContacts || [
            { id: 'c-1', name: 'Sunita Yadav', relationship: 'Mother', phone: '+91 98765 43210', isPrimary: true, isActive: true },
          ],
        };
        setPatient(fullPatient);
        return fullPatient;
      }
    } catch {
      // offline fallback
    }

    const fallback: MobilePatient = {
      ...baseUser,
      patientId: baseUser.patientId || 'MAI-80429',
      bloodType: baseUser.bloodGroup || 'O+',
      allergies: ['Penicillin'],
      vitals: [],
      medications: [],
      reports: [],
      appointments: [],
      emergencyContacts: [
        { id: 'c-1', name: 'Sunita Yadav', relationship: 'Mother', phone: '+91 98765 43210', isPrimary: true, isActive: true },
      ],
    };
    setPatient(fallback);
    return fallback;
  };

  const restoreSession = async () => {
    try {
      let savedToken: string | null = null;
      let savedUserRaw: string | null = null;
      let savedRole: string | null = null;

      try {
        savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        savedUserRaw = await SecureStore.getItemAsync(USER_KEY);
        savedRole = await SecureStore.getItemAsync(ROLE_KEY);
      } catch {
        // SecureStore fallback
      }

      if (savedToken && savedUserRaw) {
        const parsedUser = JSON.parse(savedUserRaw) as User;
        const currentRole = (savedRole as 'patient' | 'doctor') || (parsedUser.role as 'patient' | 'doctor') || 'patient';
        setToken(savedToken);
        setUser(parsedUser);
        setRole(currentRole);
        api.setAuthToken(savedToken, parsedUser.id);

        if (currentRole === 'doctor') {
          setDoctor({
            ...DEFAULT_DOCTOR,
            name: parsedUser.name || DEFAULT_DOCTOR.name,
            email: parsedUser.email || DEFAULT_DOCTOR.email,
          });
        } else {
          await syncFullPatientState(parsedUser);
        }
      } else {
        // Default initial session: connect to the shared Aryan Yadav patient account
        const defaultUser: User = {
          id: 'pat-1',
          name: 'Aryan Yadav',
          email: 'aryan.yadav@health.me',
          role: 'patient',
          mrn: 'MAI-80429',
          patientId: 'MAI-80429',
          bloodGroup: 'O+',
          dateOfBirth: '1998-09-14',
        };
        setUser(defaultUser);
        setRole('patient');
        setToken('token-pat-1-default');
        api.setAuthToken('token-pat-1-default', defaultUser.id);
        await syncFullPatientState(defaultUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, requestedRole: 'patient' | 'doctor' = 'patient') => {
    try {
      const res = await api.auth.login(email, password);
      if (res.success && res.user) {
        const activeRole = requestedRole || (res.user.role as 'patient' | 'doctor') || 'patient';
        const updatedUser = { ...res.user, role: activeRole };
        setUser(updatedUser);
        setRole(activeRole);
        setToken(res.token);
        api.setAuthToken(res.token, res.user.id);

        await SecureStore.setItemAsync(TOKEN_KEY, res.token).catch(() => {});
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedUser)).catch(() => {});
        await SecureStore.setItemAsync(ROLE_KEY, activeRole).catch(() => {});

        if (activeRole === 'doctor') {
          setDoctor({
            ...DEFAULT_DOCTOR,
            name: updatedUser.name,
            email: updatedUser.email,
          });
        } else {
          await syncFullPatientState(updatedUser);
        }

        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const loginWithGoogle = async (roleContext: 'patient' | 'doctor' = 'patient') => {
    try {
      const demoAccount = roleContext === 'doctor' ? {
        id: 'doc-google-1',
        name: 'Dr. Priya Sharma',
        email: 'dr.priya@medicalai.in',
        role: 'doctor' as const,
        token: 'google-token-doc-1'
      } : {
        id: 'pat-google-1',
        name: 'Aryan Yadav',
        email: 'aryan.yadav@health.me',
        role: 'patient' as const,
        token: 'google-token-pat-1'
      };

      const googleUser: User = {
        id: demoAccount.id,
        name: demoAccount.name,
        email: demoAccount.email,
        role: demoAccount.role,
        patientId: 'MAI-80429',
        mrn: 'MAI-80429',
        bloodGroup: 'O+',
        dateOfBirth: '1998-09-14'
      };

      setUser(googleUser);
      setRole(roleContext);
      setToken(demoAccount.token);
      api.setAuthToken(demoAccount.token, googleUser.id);

      await SecureStore.setItemAsync(TOKEN_KEY, demoAccount.token).catch(() => {});
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(googleUser)).catch(() => {});
      await SecureStore.setItemAsync(ROLE_KEY, roleContext).catch(() => {});

      if (roleContext === 'doctor') {
        setDoctor(DEFAULT_DOCTOR);
      } else {
        await syncFullPatientState(googleUser);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Google Sign In failed' };
    }
  };

  const demoPatientLogin = async () => {
    await login('aryan.yadav@health.me', 'password123', 'patient');
  };

  const demoDoctorLogin = async () => {
    const doctorUser: User = {
      id: 'doc-1',
      name: 'Dr. Sarah Chen, MD',
      email: 's.chen@metrohealth.org',
      role: 'doctor',
    };
    setUser(doctorUser);
    setRole('doctor');
    setDoctor(DEFAULT_DOCTOR);
    setToken('token-doc-1');
    api.setAuthToken('token-doc-1', doctorUser.id);

    // Try fetching live authoritative profile from clinicalApi
    api.clinical.getClinicianProfile('doc-1').then((res) => {
      if (res.success && res.profile?.clinician) {
        const c = res.profile.clinician;
        setDoctor((prev) => ({
          ...prev!,
          name: c.name || prev!.name,
          email: c.email || prev!.email,
          specialty: c.specialty || prev!.specialty,
          licenseNumber: c.licenseNumber || prev!.licenseNumber,
          hospitalAffiliation: c.hospitalAffiliation || prev!.hospitalAffiliation,
        }));
      }
    }).catch(() => {});

    await SecureStore.setItemAsync(TOKEN_KEY, 'token-doc-1').catch(() => {});
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(doctorUser)).catch(() => {});
    await SecureStore.setItemAsync(ROLE_KEY, 'doctor').catch(() => {});
  };

  const switchRole = async (newRole: 'patient' | 'doctor') => {
    setRole(newRole);
    await SecureStore.setItemAsync(ROLE_KEY, newRole).catch(() => {});
    if (newRole === 'doctor') {
      setDoctor(DEFAULT_DOCTOR);
    } else if (user) {
      await syncFullPatientState(user);
    }
  };

  const signup = async (
    fullName: string,
    email: string,
    password: string,
    phone?: string,
    userRole: 'patient' | 'doctor' = 'patient'
  ) => {
    try {
      const res = await api.auth.signup(fullName, email, password, phone);
      if (res.success && res.user) {
        const newUser: User = { ...res.user, role: userRole };
        setUser(newUser);
        setRole(userRole);
        setToken(res.token);
        api.setAuthToken(res.token, res.user.id);

        await SecureStore.setItemAsync(TOKEN_KEY, res.token).catch(() => {});
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(newUser)).catch(() => {});
        await SecureStore.setItemAsync(ROLE_KEY, userRole).catch(() => {});

        if (userRole === 'doctor') {
          setDoctor({
            ...DEFAULT_DOCTOR,
            name: fullName,
            email,
          });
        } else {
          await syncFullPatientState(newUser);
        }

        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    setUser(null);
    setPatient(null);
    setDoctor(null);
    setToken(null);
    setRole('patient');
    api.setAuthToken(null, '');
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    await SecureStore.deleteItemAsync(USER_KEY).catch(() => {});
    await SecureStore.deleteItemAsync(ROLE_KEY).catch(() => {});
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    try {
      const res = await api.auth.updateProfile(data, user.id);
      if (res.success && res.user) {
        setUser(res.user);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(res.user)).catch(() => {});
        if (role === 'patient') {
          await syncFullPatientState(res.user);
        }
      }
    } catch {
      const updated = { ...user, ...data };
      setUser(updated);
      if (patient) setPatient({ ...patient, ...data });
    }
  };

  const refreshUserData = async () => {
    if (!user) return;
    try {
      const res = await api.auth.getProfile(user.id);
      if (res.success && res.user) {
        setUser(res.user);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(res.user)).catch(() => {});
        if (role === 'patient') {
          await syncFullPatientState(res.user);
        }
      }
    } catch (e) {
      console.warn('Failed to refresh user data:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        patient,
        doctor,
        role,
        isDoctor: role === 'doctor',
        token,
        isAuthenticated: !!user,
        isLoading,
        loading: isLoading,
        login,
        loginWithGoogle,
        demoPatientLogin,
        demoDoctorLogin,
        switchRole,
        setRole: switchRole,
        signup,
        logout,
        updateProfile,
        refreshUserData,
        refreshPatient: refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
