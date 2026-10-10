import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, EmergencyContact, PatientOnboardingData } from '../types';
import { firebaseAuthService } from '../services/firebase/firebaseAuthService';
import { isFirebaseConfigured } from '../services/firebase/firebaseConfig';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (role: UserRole) => void;
  loginWithGoogle: (role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogleAccount: (account: { email: string; name: string; photoUrl?: string; uid: string }, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { fullName: string; email: string; password: string; phone?: string; role?: UserRole }) => Promise<{ success: boolean; error?: string }>;
  registerPatient: (data: PatientOnboardingData) => Promise<{ success: boolean; error?: string; patientId?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  uploadProfilePhoto: (dataUrl: string) => void;
  removeProfilePhoto: () => void;
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  updateEmergencyContact: (id: string, contact: Partial<EmergencyContact>) => void;
  deleteEmergencyContact: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'ec-1',
    name: 'Sunita Yadav',
    relationship: 'Mother',
    phone: '+1 (555) 492-8103',
    email: 'sunita.yadav@family.net',
    preferredMethod: 'sms',
    priority: 1,
    isPrimary: true,
    isActive: true
  },
  {
    id: 'ec-2',
    name: 'Rajesh Yadav',
    relationship: 'Father',
    phone: '+1 (555) 492-8104',
    email: 'rajesh.yadav@family.net',
    preferredMethod: 'phone',
    priority: 2,
    isPrimary: false,
    isActive: true
  }
];

const DEMO_PATIENT: User = {
  id: 'pat-1',
  name: 'Aryan Yadav',
  firstName: 'Aryan',
  lastName: 'Yadav',
  preferredName: 'Aryan',
  email: 'aryan.yadav@health.me',
  role: 'patient',
  mrn: 'MAI-80429',
  patientId: 'MAI-80429',
  gender: 'Male',
  preferredLanguage: 'English',
  dateOfBirth: '1998-09-14',
  phone: '+1 (555) 382-9104',
  alternatePhone: '+1 (555) 492-8103',
  preferredContactMethod: 'Email',
  bloodGroup: 'O+',
  bloodType: 'O+',
  address: {
    addressLine1: '402 Sunrise Heights, Linking Road',
    addressLine2: 'Bandra West',
    city: 'Mumbai Suburban',
    state: 'Maharashtra',
    postalCode: '400050',
    country: 'India'
  },
  allergies: ['Penicillin (Moderate)', 'Sulfa Drugs (Moderate)'],
  allergyDetails: [
    {
      id: 'alg-1',
      allergen: 'Penicillin',
      category: 'Medication',
      reaction: 'Hives, facial erythema, acute pruritus',
      severity: 'Moderate',
      notes: 'Diagnosed during childhood tonsillitis treatment. Avoid beta-lactam antibiotics.'
    },
    {
      id: 'alg-2',
      allergen: 'Sulfa Drugs',
      category: 'Medication',
      reaction: 'Maculopapular rash, mild dyspnea',
      severity: 'Moderate',
      notes: 'Documented reaction following Bactrim administration in 2021.'
    }
  ],
  medicationDetails: [
    {
      id: 'med-1',
      name: 'Lisinopril',
      dosage: '10 mg',
      frequency: 'Once daily',
      route: 'Oral',
      reason: 'Essential hypertension management',
      startDate: '2025-04-10',
      prescribedBy: 'Dr. Sarah Chen, MD',
      notes: 'Take in the morning with water. Monitor blood pressure weekly.'
    },
    {
      id: 'med-2',
      name: 'Vitamin D3 (Cholecalciferol)',
      dosage: '2000 IU',
      frequency: 'Once daily',
      route: 'Oral',
      reason: 'Preventive bone & immune support',
      startDate: '2026-01-15',
      prescribedBy: 'Dr. Sarah Chen, MD',
      notes: 'Take with a meal containing dietary fats.'
    },
    {
      id: 'med-3',
      name: 'Acetaminophen (Paracetamol)',
      dosage: '500 mg',
      frequency: 'As needed (PRN)',
      route: 'Oral',
      reason: 'Tension headaches & cervical strain',
      startDate: '2026-03-01',
      prescribedBy: 'Dr. Sarah Chen, MD',
      notes: 'Maximum 3000 mg per 24 hours. Avoid combining with alcohol.'
    }
  ],
  medicalConditions: ['Essential Hypertension (Stage 1, Controlled)', 'Mild Tension Headaches'],
  pastConditions: ['Iron Deficiency Anemia (Resolved 2024)', 'Childhood Allergic Rhinitis'],
  surgicalHistory: [
    {
      id: 'surg-1',
      procedure: 'Arthroscopic Right Knee Meniscectomy',
      approximateDate: '2022-08-14',
      hospitalOrDoctor: 'Apollo Specialty Orthopedics',
      notes: 'Uncomplicated recovery. Full weight-bearing restored without instability.'
    }
  ],
  familyMedicalHistory: [
    'Type 2 Diabetes Mellitus (Paternal Grandfather)',
    'Essential Hypertension (Mother)'
  ],
  primaryProvider: {
    providerName: 'Dr. Sarah Chen, MD',
    clinicHospital: 'Metro Clinical Reference Hospital',
    phone: '+1 (555) 720-4491',
    email: 's.chen@metrohealth.org'
  },
  preferredPharmacy: {
    pharmacyName: 'Apollo 24/7 Pharmacy - Bandra West',
    location: 'Hill Road, Bandra West, Mumbai',
    phone: '+91 22 2640 1192'
  },
  insurance: {
    hasInsurance: true,
    provider: 'Star Health & Allied Clinical Insurance',
    policyNumber: 'SH-98421094',
    groupNumber: 'CORP-8842',
    policyHolderName: 'Aryan Yadav',
    relationshipToHolder: 'Self'
  },
  emergencyContacts: DEFAULT_EMERGENCY_CONTACTS,
  emergencyNotes: 'No critical acute contraindications. Verified vaccination registry. Penicillin allergy confirmed.',
  cardStatus: 'active',
  lastUpdated: '08 Oct 2026, 10:30 AM'
};

const DEMO_DOCTOR: User = {
  id: 'doc-1',
  name: 'Dr. Sarah Chen, MD',
  email: 's.chen@metrohealth.org',
  role: 'doctor',
  specialty: 'Internal Medicine & Clinical Triage',
  hospitalAffiliation: 'Metro Clinical Reference Center',
  npi: '1942850192',
  licenseNumber: 'MD-748291',
  phone: '+1 (555) 720-4491'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('medical_ai_user') || sessionStorage.getItem('medical_ai_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.role === 'patient' && (!parsed.emergencyContacts || parsed.emergencyContacts.length === 0)) {
          parsed.emergencyContacts = DEFAULT_EMERGENCY_CONTACTS;
        }
        if (parsed.role === 'patient' && !parsed.patientId) {
          parsed.patientId = parsed.mrn || 'MAI-80429';
        }
        if (parsed.role === 'patient' && !parsed.bloodGroup) {
          parsed.bloodGroup = parsed.bloodType || 'O+';
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('medical_ai_user', JSON.stringify(user));
        sessionStorage.setItem('medical_ai_user', JSON.stringify(user));
      } catch {
        // quota safety
      }
    } else {
      localStorage.removeItem('medical_ai_user');
      sessionStorage.removeItem('medical_ai_user');
    }
  }, [user]);

  // Handle Firebase redirect results and auth state synchronization
  useEffect(() => {
    let isMounted = true;

    // Check for redirect result on return from mobile / redirect Google OAuth
    if (isFirebaseConfigured()) {
      firebaseAuthService
        .checkRedirectResult()
        .then((result) => {
          if (isMounted && result?.success && result.user) {
            setUser(result.user);
          }
        })
        .catch((err) => {
          console.warn('[Firebase] Redirect check error:', err);
        });

      // Synchronize Firebase auth state
      const unsubscribe = firebaseAuthService.subscribeToAuthState((firebaseUser) => {
        if (!isMounted) return;
        if (!firebaseUser && user?.authProvider === 'google') {
          // Firebase session ended
          setUser(null);
        }
      });

      return () => {
        isMounted = false;
        unsubscribe();
      };
    }
  }, []);

  const login = async (
    email: string,
    password: string,
    role: UserRole = 'patient'
  ): Promise<{ success: boolean; error?: string }> => {
    // Basic client validation
    if (!email.trim() || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    if (email.toLowerCase().includes('error')) {
      return { success: false, error: 'Email or password is incorrect. Please try again.' };
    }

    // Role inference if not explicitly specified
    const inferredRole: UserRole =
      role === 'doctor' || email.toLowerCase().includes('doctor') || email.toLowerCase().includes('dr.')
        ? 'doctor'
        : 'patient';

    const newUser: User =
      inferredRole === 'doctor'
        ? {
            ...DEMO_DOCTOR,
            email: email.trim(),
            name: email.startsWith('dr.') ? 'Dr. ' + email.split('@')[0].slice(3) : DEMO_DOCTOR.name
          }
        : {
            ...DEMO_PATIENT,
            email: email.trim()
          };

    setUser(newUser);
    return { success: true };
  };

  const loginAsDemo = (demoRole: UserRole) => {
    if (demoRole === 'doctor') {
      setUser(DEMO_DOCTOR);
    } else {
      setUser(DEMO_PATIENT);
    }
  };

  const loginWithGoogle = async (
    role: UserRole = 'patient'
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isFirebaseConfigured()) {
      return {
        success: false,
        error: 'NEEDS_CHOOSER'
      };
    }

    try {
      const result = await firebaseAuthService.signInWithGoogle(role);

      if (result.success) {
        if (result.user) {
          setUser(result.user);
        }
        return { success: true };
      }

      if (result.needsChooser) {
        return { success: false, error: 'NEEDS_CHOOSER' };
      }

      return {
        success: false,
        error: result.error || 'Google sign-in could not be completed.'
      };
    } catch (err: any) {
      console.error('[AuthContext] Google sign-in failed:', err);
      return {
        success: false,
        error: err?.message || 'Google sign-in could not be completed.'
      };
    }
  };

  const loginWithGoogleAccount = async (
    account: { email: string; name: string; photoUrl?: string; uid: string },
    role: UserRole = 'patient'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await firebaseAuthService.signInWithGoogleAccount(account, role);
      if (result.success && result.user) {
        setUser(result.user);
        return { success: true };
      }
      return {
        success: false,
        error: result.error || 'Google account sign-in failed.'
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Google account sign-in failed.'
      };
    }
  };

  const signup = async (data: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    role?: UserRole;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!data.fullName.trim() || !data.email.trim() || !data.password) {
      return { success: false, error: 'Please fill in all required fields.' };
    }

    const assignedRole = data.role || 'patient';
    const newUser: User =
      assignedRole === 'doctor'
        ? {
            ...DEMO_DOCTOR,
            name: data.fullName.startsWith('Dr.') ? data.fullName : 'Dr. ' + data.fullName,
            email: data.email.trim(),
            phone: data.phone
          }
        : {
            ...DEMO_PATIENT,
            name: data.fullName.trim(),
            email: data.email.trim(),
            phone: data.phone
          };

    setUser(newUser);
    return { success: true };
  };

  const registerPatient = async (
    data: PatientOnboardingData
  ): Promise<{ success: boolean; error?: string; patientId?: string }> => {
    try {
      if (!data.email.trim() || !data.firstName.trim() || !data.lastName.trim()) {
        return { success: false, error: 'First name, last name, and email are mandatory.' };
      }

      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      const generatedId = `MAI-${randomSuffix}`;
      const fullName = `${data.firstName.trim()} ${data.middleName ? data.middleName.trim() + ' ' : ''}${data.lastName.trim()}`;

      // Extract allergy strings for compact patient card/preview
      const allergiesList =
        data.hasAllergies === 'Yes' && data.allergies.length > 0
          ? data.allergies.map((a) => `${a.allergen}${a.reaction ? ` (${a.reaction})` : ''}`)
          : ['None reported'];

      // Ensure emergency contacts have valid attributes and unique IDs
      const preparedContacts: EmergencyContact[] =
        data.emergencyContacts && data.emergencyContacts.length > 0
          ? data.emergencyContacts.map((c, idx) => ({
              ...c,
              id: c.id || `ec-${Date.now()}-${idx}`,
              isPrimary: idx === 0 || c.isPrimary,
              isActive: true
            }))
          : DEFAULT_EMERGENCY_CONTACTS;

      const newUser: User = {
        id: `pat-${Date.now()}`,
        name: fullName,
        firstName: data.firstName.trim(),
        middleName: data.middleName?.trim(),
        lastName: data.lastName.trim(),
        preferredName: data.preferredName?.trim() || data.firstName.trim(),
        email: data.email.trim(),
        role: 'patient',
        phone: data.primaryPhone || data.phone,
        alternatePhone: data.alternatePhone,
        preferredContactMethod: data.preferredContactMethod,
        patientId: generatedId,
        mrn: generatedId,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        preferredLanguage: data.preferredLanguage,
        country: data.country,
        nationality: data.nationality,
        address: data.address,
        bloodGroup: data.bloodGroup || 'O+',
        bloodType: data.bloodGroup || 'O+',
        allergies: allergiesList,
        allergyDetails: data.allergies,
        medicationDetails: data.medications,
        medicalConditions: data.medicalConditions,
        pastConditions: data.pastConditions,
        surgicalHistory: data.surgeries,
        familyMedicalHistory: data.familyHistory,
        additionalNotes: data.additionalMedicalNotes,
        primaryProvider: data.primaryProvider,
        preferredPharmacy: data.preferredPharmacy,
        insurance: data.insurance,
        preferences: data.preferences,
        consents: data.consents,
        hasCompletedOnboarding: true,
        emergencyContacts: preparedContacts,
        emergencyNotes:
          data.medicalConditions.length > 0
            ? `Reported: ${data.medicalConditions.join(', ')}. ${data.additionalMedicalNotes || ''}`.trim()
            : data.additionalMedicalNotes || 'Verified patient portal initialization.',
        cardStatus: 'active',
        profileImageUrl: data.profileImageUrl,
        avatarUrl: data.profileImageUrl,
        lastUpdated: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      setUser(newUser);
      try {
        localStorage.setItem('medical_ai_user', JSON.stringify(newUser));
        sessionStorage.setItem('medical_ai_user', JSON.stringify(newUser));
      } catch {
        // storage fallback
      }

      return { success: true, patientId: generatedId };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Registration failed.' };
    }
  };

  const logout = () => {
    // Sign out from Firebase if authenticated via Google
    if (isFirebaseConfigured()) {
      firebaseAuthService.signOutUser().catch(() => {});
    }

    setUser(null);
    localStorage.removeItem('medical_ai_user');
    sessionStorage.removeItem('medical_ai_user');
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    setUser({ ...user, ...data, lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) });
  };

  const uploadProfilePhoto = (dataUrl: string) => {
    if (!user) return;
    setUser({
      ...user,
      profileImageUrl: dataUrl,
      avatarUrl: dataUrl,
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    });
  };

  const removeProfilePhoto = () => {
    if (!user) return;
    setUser({
      ...user,
      profileImageUrl: undefined,
      avatarUrl: undefined,
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    });
  };

  const addEmergencyContact = (contact: Omit<EmergencyContact, 'id'>) => {
    if (!user) return;
    const newContact: EmergencyContact = {
      ...contact,
      id: `ec-${Date.now()}`
    };
    const currentList = user.emergencyContacts || [];
    // If set as primary, un-primary others
    const updatedList = newContact.isPrimary
      ? currentList.map((c) => ({ ...c, isPrimary: false })).concat(newContact)
      : [...currentList, newContact];

    setUser({
      ...user,
      emergencyContacts: updatedList,
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });
  };

  const updateEmergencyContact = (id: string, updated: Partial<EmergencyContact>) => {
    if (!user) return;
    let list = user.emergencyContacts || [];
    if (updated.isPrimary) {
      list = list.map((c) => ({ ...c, isPrimary: false }));
    }
    const final = list.map((c) => (c.id === id ? { ...c, ...updated } : c));
    setUser({
      ...user,
      emergencyContacts: final,
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });
  };

  const deleteEmergencyContact = (id: string) => {
    if (!user) return;
    const final = (user.emergencyContacts || []).filter((c) => c.id !== id);
    setUser({
      ...user,
      emergencyContacts: final,
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        login,
        loginAsDemo,
        loginWithGoogle,
        loginWithGoogleAccount,
        signup,
        registerPatient,
        logout,
        updateProfile,
        uploadProfilePhoto,
        removeProfilePhoto,
        addEmergencyContact,
        updateEmergencyContact,
        deleteEmergencyContact
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
