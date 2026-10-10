import React, { useState, useRef, useEffect } from 'react';
import {
  RoutePath,
  DetailedAllergy,
  DetailedMedication,
  SurgeryRecord,
  PatientAddress,
  HealthcareProviderInfo,
  PreferredPharmacyInfo,
  InsuranceInfo
} from '../../../../types';
import { useAuth } from '../../../../context/AuthContext';
import { clinicalStore } from '../../../../services/clinicalStore';
import { ProfileAvatar } from '../../../common/ProfileAvatar';
import { formatIndianPhoneNumber } from '../../../../utils/phoneUtils';
import {
  User,
  Shield,
  ShieldCheck,
  Activity,
  Phone,
  QrCode,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Save,
  X,
  Camera,
  Trash2,
  Users,
  CreditCard,
  Plus,
  Pill,
  Heart,
  Stethoscope,
  Building,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';

interface PatientProfileViewProps {
  onNavigate: (route: RoutePath) => void;
}

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({ onNavigate }) => {
  const {
    user,
    updateProfile,
    uploadProfilePhoto,
    removeProfilePhoto
  } = useAuth();

  // Active section tab
  type SectionKey = 'personal' | 'medical' | 'allergies' | 'medications' | 'surgeries' | 'healthcare';
  const [activeTab, setActiveTab] = useState<SectionKey>('personal');

  // Edit states for each section
  const [editingSection, setEditingSection] = useState<SectionKey | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Personal & Contact State
  const [personalForm, setPersonalForm] = useState({
    name: user?.name || 'Aryan Yadav',
    firstName: user?.firstName || 'Aryan',
    middleName: user?.middleName || '',
    lastName: user?.lastName || 'Yadav',
    preferredName: user?.preferredName || 'Aryan',
    gender: user?.gender || 'Male',
    preferredLanguage: user?.preferredLanguage || 'English',
    dateOfBirth: user?.dateOfBirth || '1998-09-14',
    email: user?.email || 'aryan.yadav@health.me',
    phone: formatIndianPhoneNumber(user?.phone) || '+91 81002 78890',
    alternatePhone: formatIndianPhoneNumber(user?.alternatePhone) || '+91 81002 78891',
    preferredContactMethod: user?.preferredContactMethod || 'Email',
    address: {
      addressLine1: user?.address?.addressLine1 || '402 Sunrise Heights, Linking Road',
      addressLine2: user?.address?.addressLine2 || 'Bandra West',
      city: user?.address?.city || 'Mumbai Suburban',
      state: user?.address?.state || 'Maharashtra',
      postalCode: user?.address?.postalCode || '400050',
      country: user?.address?.country || 'India'
    }
  });

  // 2. Core Medical Baseline State
  const [medicalForm, setMedicalForm] = useState({
    bloodGroup: user?.bloodGroup || user?.bloodType || 'O+',
    medicalConditions: user?.medicalConditions || ['Essential Hypertension (Stage 1, Controlled)', 'Mild Tension Headaches'],
    pastConditions: user?.pastConditions || ['Iron Deficiency Anemia (Resolved 2024)', 'Childhood Allergic Rhinitis'],
    familyMedicalHistory: user?.familyMedicalHistory || [
      'Type 2 Diabetes Mellitus (Paternal Grandfather)',
      'Essential Hypertension (Mother)'
    ],
    additionalNotes: user?.additionalNotes || 'Annual health checkup pending in November 2026.'
  });

  // 3. Allergies State
  const [allergiesList, setAllergiesList] = useState<DetailedAllergy[]>(
    user?.allergyDetails && user.allergyDetails.length > 0
      ? user.allergyDetails
      : [
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
        ]
  );
  const [newAllergyModalOpen, setNewAllergyModalOpen] = useState(false);
  const [editingAllergy, setEditingAllergy] = useState<DetailedAllergy | null>(null);

  // 4. Medications State
  const [medicationsList, setMedicationsList] = useState<DetailedMedication[]>(
    user?.medicationDetails && user.medicationDetails.length > 0
      ? user.medicationDetails
      : [
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
        ]
  );
  const [newMedModalOpen, setNewMedModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<DetailedMedication | null>(null);

  // 5. Surgical History State
  const [surgeriesList, setSurgeriesList] = useState<SurgeryRecord[]>(
    user?.surgicalHistory && user.surgicalHistory.length > 0
      ? user.surgicalHistory
      : [
          {
            id: 'surg-1',
            procedure: 'Arthroscopic Right Knee Meniscectomy',
            approximateDate: '2022-08-14',
            hospitalOrDoctor: 'Apollo Specialty Orthopedics',
            notes: 'Uncomplicated recovery. Full weight-bearing restored without instability.'
          }
        ]
  );
  const [newSurgModalOpen, setNewSurgModalOpen] = useState(false);

  // 6. Healthcare Providers & Coverage State
  const [healthcareForm, setHealthcareForm] = useState({
    primaryProvider: user?.primaryProvider || {
      providerName: 'Dr. Sarah Chen, MD',
      clinicHospital: 'Metro Clinical Reference Hospital',
      phone: '+1 (555) 720-4491',
      email: 's.chen@metrohealth.org'
    },
    preferredPharmacy: user?.preferredPharmacy || {
      pharmacyName: 'Apollo 24/7 Pharmacy - Bandra West',
      location: 'Hill Road, Bandra West, Mumbai',
      phone: '+91 22 2640 1192'
    },
    insurance: user?.insurance || {
      hasInsurance: true,
      provider: 'Star Health & Allied Clinical Insurance',
      policyNumber: 'SH-98421094',
      groupNumber: 'CORP-8842',
      policyHolderName: 'Aryan Yadav',
      relationshipToHolder: 'Self'
    }
  });

  // Sync state when user context changes
  useEffect(() => {
    if (user) {
      setPersonalForm({
        name: user.name || 'Aryan Yadav',
        firstName: user.firstName || 'Aryan',
        middleName: user.middleName || '',
        lastName: user.lastName || 'Yadav',
        preferredName: user.preferredName || 'Aryan',
        gender: user.gender || 'Male',
        preferredLanguage: user.preferredLanguage || 'English',
        dateOfBirth: user.dateOfBirth || '1998-09-14',
        email: user.email || 'aryan.yadav@health.me',
        phone: formatIndianPhoneNumber(user.phone) || '+91 81002 78890',
        alternatePhone: formatIndianPhoneNumber(user.alternatePhone) || '+91 81002 78891',
        preferredContactMethod: user.preferredContactMethod || 'Email',
        address: {
          addressLine1: user.address?.addressLine1 || '402 Sunrise Heights, Linking Road',
          addressLine2: user.address?.addressLine2 || 'Bandra West',
          city: user.address?.city || 'Mumbai Suburban',
          state: user.address?.state || 'Maharashtra',
          postalCode: user.address?.postalCode || '400050',
          country: user.address?.country || 'India'
        }
      });
      if (user.allergyDetails && user.allergyDetails.length > 0) {
        setAllergiesList(user.allergyDetails);
      }
      if (user.medicationDetails && user.medicationDetails.length > 0) {
        setMedicationsList(user.medicationDetails);
      }
      if (user.surgicalHistory && user.surgicalHistory.length > 0) {
        setSurgeriesList(user.surgicalHistory);
      }
    }
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Section 1 Save
  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${personalForm.firstName.trim()} ${personalForm.middleName ? personalForm.middleName.trim() + ' ' : ''}${personalForm.lastName.trim()}`;
    updateProfile({
      name: fullName,
      firstName: personalForm.firstName.trim(),
      middleName: personalForm.middleName.trim(),
      lastName: personalForm.lastName.trim(),
      preferredName: personalForm.preferredName.trim(),
      gender: personalForm.gender,
      preferredLanguage: personalForm.preferredLanguage,
      dateOfBirth: personalForm.dateOfBirth,
      email: personalForm.email.trim(),
      phone: formatIndianPhoneNumber(personalForm.phone.trim()),
      alternatePhone: formatIndianPhoneNumber(personalForm.alternatePhone?.trim()) || undefined,
      preferredContactMethod: personalForm.preferredContactMethod as any,
      address: personalForm.address
    });
    setEditingSection(null);
    showToast('Personal demographics and contact address saved successfully.');
  };

  // Section 2 Save
  const handleSaveMedical = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      bloodGroup: medicalForm.bloodGroup,
      bloodType: medicalForm.bloodGroup,
      medicalConditions: medicalForm.medicalConditions,
      pastConditions: medicalForm.pastConditions,
      familyMedicalHistory: medicalForm.familyMedicalHistory,
      additionalNotes: medicalForm.additionalNotes
    });
    setEditingSection(null);
    showToast('Core medical baseline records updated.');
  };

  // Section 3 Save (Allergies)
  const handleSaveAllergies = (updated: DetailedAllergy[]) => {
    setAllergiesList(updated);
    updateProfile({
      allergyDetails: updated,
      allergies: updated.map((a) => `${a.allergen}${a.reaction ? ` (${a.reaction})` : ''}`)
    });
    showToast('Allergies profile updated.');
  };

  // Section 4 Save (Medications)
  const handleSaveMedications = (updated: DetailedMedication[]) => {
    setMedicationsList(updated);
    updateProfile({
      medicationDetails: updated
    });
    // Synchronize with clinical store
    updated.forEach((m) => {
      clinicalStore.addMedication({
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        timing: m.frequency,
        indication: m.reason || 'General Health',
        prescribingContext: m.prescribedBy || 'Attending Physician',
        foodNotes: m.notes || '',
        status: 'active'
      });
    });
    showToast('Active medications synchronized.');
  };

  // Section 5 Save (Surgeries)
  const handleSaveSurgeries = (updated: SurgeryRecord[]) => {
    setSurgeriesList(updated);
    updateProfile({
      surgicalHistory: updated
    });
    showToast('Surgical history records updated.');
  };

  // Section 6 Save (Healthcare Team & Insurance)
  const handleSaveHealthcare = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      primaryProvider: healthcareForm.primaryProvider,
      preferredPharmacy: healthcareForm.preferredPharmacy,
      insurance: healthcareForm.insurance
    });
    setEditingSection(null);
    showToast('Healthcare team and insurance policy saved.');
  };

  // Photo Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setPhotoError('Invalid image format. Supported formats: JPG, JPEG, PNG, WEBP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image file exceeds 5MB size limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        uploadProfilePhoto(reader.result);
        showToast('Profile photograph updated.');
      }
    };
    reader.onerror = () => {
      setPhotoError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <ProfileAvatar
              name={personalForm.name}
              imageUrl={user?.profileImageUrl || user?.avatarUrl}
              size="lg"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md transition-transform hover:scale-110 cursor-pointer"
              title="Upload new photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-blue-700 dark:text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>MRN: {user?.mrn || user?.patientId || 'MAI-80429'} · Verified Profile</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
              {personalForm.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              {personalForm.gender} · Born {personalForm.dateOfBirth} · Blood Group: {medicalForm.bloodGroup}
            </p>
          </div>
        </div>

        {/* Quick Nav Links */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/dashboard/emergency-contacts')}
            className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-xl border border-rose-200 dark:border-rose-900/60 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Emergency Contacts</span>
          </button>
          <button
            onClick={() => onNavigate('/dashboard/qr-sharing')}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Sharing</span>
          </button>
          <button
            onClick={() => onNavigate('/dashboard/identity-verification')}
            className="px-3.5 py-2 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 text-xs font-semibold rounded-xl border border-sky-200 dark:border-sky-900/60 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Identity Status</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {photoError && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{photoError}</span>
        </div>
      )}

      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Section Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 text-xs font-medium">
        {[
          { key: 'personal', label: 'Personal & Address', icon: User },
          { key: 'medical', label: 'Medical Baseline', icon: Heart },
          { key: 'allergies', label: `Allergies (${allergiesList.length})`, icon: AlertTriangle },
          { key: 'medications', label: `Medications (${medicationsList.length})`, icon: Pill },
          { key: 'surgeries', label: `Surgical History (${surgeriesList.length})`, icon: Stethoscope },
          { key: 'healthcare', label: 'Providers & Insurance', icon: Building }
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key as SectionKey);
                setEditingSection(null);
              }}
              className={`px-3.5 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: Personal & Demographics */}
      {activeTab === 'personal' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Personal Demographics & Address
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official clinical identification, contact details, and residential district.
              </p>
            </div>
            {editingSection !== 'personal' ? (
              <button
                onClick={() => setEditingSection('personal')}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Section</span>
              </button>
            ) : null}
          </div>

          {editingSection === 'personal' ? (
            <form onSubmit={handleSavePersonal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={personalForm.firstName}
                    onChange={(e) => setPersonalForm({ ...personalForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={personalForm.middleName}
                    onChange={(e) => setPersonalForm({ ...personalForm, middleName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={personalForm.lastName}
                    onChange={(e) => setPersonalForm({ ...personalForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={personalForm.dateOfBirth}
                    onChange={(e) => setPersonalForm({ ...personalForm, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Gender *
                  </label>
                  <select
                    value={personalForm.gender}
                    onChange={(e) => setPersonalForm({ ...personalForm, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Language
                  </label>
                  <select
                    value={personalForm.preferredLanguage}
                    onChange={(e) => setPersonalForm({ ...personalForm, preferredLanguage: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">हिन्दी (Hindi)</option>
                    <option value="Bengali">বাংলা (Bengali)</option>
                    <option value="Marathi">मराठी (Marathi)</option>
                    <option value="Tamil">தமிழ் (Tamil)</option>
                    <option value="Telugu">తెలుగు (Telugu)</option>
                    <option value="Gujarati">ગુજરાતી (Gujarati)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Email *
                  </label>
                  <input
                    type="email"
                    value={personalForm.email}
                    onChange={(e) => setPersonalForm({ ...personalForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Phone *
                  </label>
                  <input
                    type="tel"
                    value={personalForm.phone}
                    onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Address Fields */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono block">
                  Residential Address
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Address Line 1</label>
                    <input
                      type="text"
                      value={personalForm.address.addressLine1}
                      onChange={(e) =>
                        setPersonalForm({
                          ...personalForm,
                          address: { ...personalForm.address, addressLine1: e.target.value }
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Address Line 2</label>
                    <input
                      type="text"
                      value={personalForm.address.addressLine2 || ''}
                      onChange={(e) =>
                        setPersonalForm({
                          ...personalForm,
                          address: { ...personalForm.address, addressLine2: e.target.value }
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">District / City</label>
                    <input
                      type="text"
                      value={personalForm.address.city}
                      onChange={(e) =>
                        setPersonalForm({
                          ...personalForm,
                          address: { ...personalForm.address, city: e.target.value }
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">State</label>
                    <input
                      type="text"
                      value={personalForm.address.state}
                      onChange={(e) =>
                        setPersonalForm({
                          ...personalForm,
                          address: { ...personalForm.address, state: e.target.value }
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={personalForm.address.postalCode}
                      onChange={(e) =>
                        setPersonalForm({
                          ...personalForm,
                          address: { ...personalForm.address, postalCode: e.target.value }
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Country</label>
                    <input
                      type="text"
                      value={personalForm.address.country}
                      onChange={(e) =>
                        setPersonalForm({
                          ...personalForm,
                          address: { ...personalForm.address, country: e.target.value }
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Form Action Controls */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                <span className="text-[11px] text-slate-400 font-mono">Full Legal Name</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{personalForm.name}</p>
                <span className="text-[11px] text-slate-500 font-mono">Preferred: {personalForm.preferredName}</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                <span className="text-[11px] text-slate-400 font-mono">Date of Birth & Gender</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{personalForm.dateOfBirth}</p>
                <span className="text-[11px] text-slate-500 font-mono">{personalForm.gender}</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                <span className="text-[11px] text-slate-400 font-mono">Language Preference</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{personalForm.preferredLanguage}</p>
                <span className="text-[11px] text-slate-500 font-mono">Multilingual AI enabled</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                <span className="text-[11px] text-slate-400 font-mono">Primary Email</span>
                <p className="font-semibold text-slate-900 dark:text-white">{personalForm.email}</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                <span className="text-[11px] text-slate-400 font-mono">Phone Numbers</span>
                <p className="font-semibold text-slate-900 dark:text-white">{personalForm.phone}</p>
                <span className="text-[11px] text-slate-500 font-mono">Alt: {personalForm.alternatePhone}</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                <span className="text-[11px] text-slate-400 font-mono">Residential Address</span>
                <p className="font-medium text-slate-900 dark:text-white leading-relaxed">
                  {personalForm.address.addressLine1}, {personalForm.address.addressLine2 ? `${personalForm.address.addressLine2}, ` : ''}
                  {personalForm.address.city}, {personalForm.address.state} - {personalForm.address.postalCode}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: Core Medical Baseline */}
      {activeTab === 'medical' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Core Medical Baseline & History
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Blood group, active chronic diagnoses, medical background, and hereditary factors.
              </p>
            </div>
            {editingSection !== 'medical' ? (
              <button
                onClick={() => setEditingSection('medical')}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Section</span>
              </button>
            ) : null}
          </div>

          {editingSection === 'medical' ? (
            <form onSubmit={handleSaveMedical} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Blood Group *
                </label>
                <select
                  value={medicalForm.bloodGroup}
                  onChange={(e) => setMedicalForm({ ...medicalForm, bloodGroup: e.target.value })}
                  className="w-full sm:w-64 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Active Medical Conditions (comma-separated)
                </label>
                <input
                  type="text"
                  value={medicalForm.medicalConditions.join(', ')}
                  onChange={(e) =>
                    setMedicalForm({
                      ...medicalForm,
                      medicalConditions: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Past Medical Conditions (comma-separated)
                </label>
                <input
                  type="text"
                  value={medicalForm.pastConditions.join(', ')}
                  onChange={(e) =>
                    setMedicalForm({
                      ...medicalForm,
                      pastConditions: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Family Medical History (comma-separated)
                </label>
                <input
                  type="text"
                  value={medicalForm.familyMedicalHistory.join(', ')}
                  onChange={(e) =>
                    setMedicalForm({
                      ...medicalForm,
                      familyMedicalHistory: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Additional Clinical Notes
                </label>
                <textarea
                  rows={3}
                  value={medicalForm.additionalNotes}
                  onChange={(e) => setMedicalForm({ ...medicalForm, additionalNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400 font-bold uppercase">
                    Blood Group & ABO / Rh Registry
                  </span>
                  <div className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-0.5">
                    {medicalForm.bloodGroup}
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500 font-mono">
                  Compatible with O+, O- Packed RBCs
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono uppercase text-[11px]">
                    Active Diagnoses ({medicalForm.medicalConditions.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {medicalForm.medicalConditions.map((cond, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-xs font-medium">
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono uppercase text-[11px]">
                    Past Medical Background ({medicalForm.pastConditions.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {medicalForm.pastConditions.map((cond, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs">
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono uppercase text-[11px]">
                  Family Medical History
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                  {medicalForm.familyMedicalHistory.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: Allergies (Multi-Entry) */}
      {activeTab === 'allergies' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Documented Allergies ({allergiesList.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Allergen names, specific physiological reactions, clinical severity levels, and precautions.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingAllergy(null);
                setNewAllergyModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Allergy</span>
            </button>
          </div>

          <div className="space-y-3">
            {allergiesList.map((alg) => (
              <div
                key={alg.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{alg.allergen}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {alg.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        alg.severity.includes('Severe')
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {alg.severity}
                    </span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">
                    <strong>Reaction:</strong> {alg.reaction}
                  </div>
                  {alg.notes && (
                    <div className="text-slate-400 text-[11px] font-mono italic">
                      Note: {alg.notes}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    onClick={() => {
                      setEditingAllergy(alg);
                      setNewAllergyModalOpen(true);
                    }}
                    className="p-1.5 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                    title="Edit allergy"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remove allergy record for "${alg.allergen}"?`)) {
                        handleSaveAllergies(allergiesList.filter((a) => a.id !== alg.id));
                      }
                    }}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                    title="Delete allergy"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: Medications (Multi-Entry) */}
      {activeTab === 'medications' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Active Medications & Prescriptions ({medicationsList.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Exact prescribed doses, frequencies, routes of administration, purpose, and prescriber records.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingMed(null);
                setNewMedModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Medication</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medicationsList.map((med) => (
              <div
                key={med.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2.5 text-xs"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white block">{med.name}</span>
                      <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400">
                        {med.dosage} · {med.frequency} · {med.route || 'Oral'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingMed(med);
                        setNewMedModalOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title="Edit medication"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove medication "${med.name}"?`)) {
                          handleSaveMedications(medicationsList.filter((m) => m.id !== med.id));
                        }
                      }}
                      className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                      title="Delete medication"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-slate-600 dark:text-slate-300 pt-1">
                  <strong>Indication:</strong> {med.reason || 'General Health'}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>Prescribed by: {med.prescribedBy || 'Physician'}</span>
                  <span>Started: {med.startDate || 'Recent'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: Surgical History */}
      {activeTab === 'surgeries' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Surgical & Interventional History ({surgeriesList.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Past surgical procedures, approximate dates, operating hospital, and recovery notes.
              </p>
            </div>
            <button
              onClick={() => setNewSurgModalOpen(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Surgery</span>
            </button>
          </div>

          <div className="space-y-3">
            {surgeriesList.map((surg) => (
              <div
                key={surg.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start justify-between text-xs gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{surg.procedure}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                      {surg.approximateDate}
                    </span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">
                    <strong>Facility / Surgeon:</strong> {surg.hospitalOrDoctor || 'Specialty Surgical Center'}
                  </div>
                  {surg.notes && (
                    <div className="text-slate-500 text-[11px] leading-relaxed">
                      {surg.notes}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Remove surgical record for "${surg.procedure}"?`)) {
                      handleSaveSurgeries(surgeriesList.filter((s) => s.id !== surg.id));
                    }
                  }}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                  title="Delete surgery record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 6: Healthcare Team & Insurance */}
      {activeTab === 'healthcare' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Healthcare Providers, Pharmacy & Insurance
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Primary physician coordinates, local dispensing pharmacy, and policy details.
              </p>
            </div>
            {editingSection !== 'healthcare' ? (
              <button
                onClick={() => setEditingSection('healthcare')}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Section</span>
              </button>
            ) : null}
          </div>

          {editingSection === 'healthcare' ? (
            <form onSubmit={handleSaveHealthcare} className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200 block">
                  Primary Healthcare Physician
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Doctor Name</label>
                    <input
                      type="text"
                      value={healthcareForm.primaryProvider?.providerName || ''}
                      onChange={(e) =>
                        setHealthcareForm({
                          ...healthcareForm,
                          primaryProvider: { ...healthcareForm.primaryProvider, providerName: e.target.value }
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Clinic / Hospital</label>
                    <input
                      type="text"
                      value={healthcareForm.primaryProvider?.clinicHospital || ''}
                      onChange={(e) =>
                        setHealthcareForm({
                          ...healthcareForm,
                          primaryProvider: { ...healthcareForm.primaryProvider, clinicHospital: e.target.value }
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Phone</label>
                    <input
                      type="text"
                      value={healthcareForm.primaryProvider?.phone || ''}
                      onChange={(e) =>
                        setHealthcareForm({
                          ...healthcareForm,
                          primaryProvider: { ...healthcareForm.primaryProvider, phone: e.target.value }
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Email</label>
                    <input
                      type="email"
                      value={healthcareForm.primaryProvider?.email || ''}
                      onChange={(e) =>
                        setHealthcareForm({
                          ...healthcareForm,
                          primaryProvider: { ...healthcareForm.primaryProvider, email: e.target.value }
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Insurance */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200 block">
                  Health Insurance Policy
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Insurance Company</label>
                    <input
                      type="text"
                      value={healthcareForm.insurance?.provider || ''}
                      onChange={(e) =>
                        setHealthcareForm({
                          ...healthcareForm,
                          insurance: { ...healthcareForm.insurance, provider: e.target.value, hasInsurance: true }
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Policy / Member ID</label>
                    <input
                      type="text"
                      value={healthcareForm.insurance?.policyNumber || ''}
                      onChange={(e) =>
                        setHealthcareForm({
                          ...healthcareForm,
                          insurance: { ...healthcareForm.insurance, policyNumber: e.target.value, hasInsurance: true }
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Group Number</label>
                    <input
                      type="text"
                      value={healthcareForm.insurance?.groupNumber || ''}
                      onChange={(e) =>
                        setHealthcareForm({
                          ...healthcareForm,
                          insurance: { ...healthcareForm.insurance, groupNumber: e.target.value, hasInsurance: true }
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono uppercase text-[11px]">
                  Attending Physician
                </span>
                <p className="font-bold text-sm text-slate-900 dark:text-white">
                  {healthcareForm.primaryProvider?.providerName}
                </p>
                <p className="text-slate-600 dark:text-slate-300">{healthcareForm.primaryProvider?.clinicHospital}</p>
                <div className="text-[11px] font-mono text-slate-500 pt-1">
                  Phone: {healthcareForm.primaryProvider?.phone} · Email: {healthcareForm.primaryProvider?.email}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono uppercase text-[11px]">
                  Preferred Pharmacy
                </span>
                <p className="font-bold text-sm text-slate-900 dark:text-white">
                  {healthcareForm.preferredPharmacy?.pharmacyName}
                </p>
                <p className="text-slate-600 dark:text-slate-300">{healthcareForm.preferredPharmacy?.location}</p>
                <div className="text-[11px] font-mono text-slate-500 pt-1">
                  Phone: {healthcareForm.preferredPharmacy?.phone}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1.5 md:col-span-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono uppercase text-[11px]">
                  Health Insurance Policy
                </span>
                <p className="font-bold text-sm text-slate-900 dark:text-white">
                  {healthcareForm.insurance?.provider}
                </p>
                <div className="flex flex-wrap gap-4 font-mono text-[11px] text-slate-600 dark:text-slate-300 pt-1">
                  <span>Policy ID: <strong>{healthcareForm.insurance?.policyNumber}</strong></span>
                  <span>Group: <strong>{healthcareForm.insurance?.groupNumber}</strong></span>
                  <span>Holder: <strong>{healthcareForm.insurance?.policyHolderName}</strong> ({healthcareForm.insurance?.relationshipToHolder})</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: Add / Edit Allergy */}
      {newAllergyModalOpen && (
        <AllergyModal
          allergy={editingAllergy}
          onClose={() => setNewAllergyModalOpen(false)}
          onSave={(allergy) => {
            if (editingAllergy) {
              handleSaveAllergies(allergiesList.map((a) => (a.id === allergy.id ? allergy : a)));
            } else {
              handleSaveAllergies([...allergiesList, allergy]);
            }
            setNewAllergyModalOpen(false);
          }}
        />
      )}

      {/* MODAL: Add / Edit Medication */}
      {newMedModalOpen && (
        <MedicationModal
          medication={editingMed}
          onClose={() => setNewMedModalOpen(false)}
          onSave={(med) => {
            if (editingMed) {
              handleSaveMedications(medicationsList.map((m) => (m.id === med.id ? med : m)));
            } else {
              handleSaveMedications([...medicationsList, med]);
            }
            setNewMedModalOpen(false);
          }}
        />
      )}

      {/* MODAL: Add Surgery */}
      {newSurgModalOpen && (
        <SurgeryModal
          onClose={() => setNewSurgModalOpen(false)}
          onSave={(surg) => {
            handleSaveSurgeries([...surgeriesList, surg]);
            setNewSurgModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

// Sub-Modal: Allergy
const AllergyModal: React.FC<{
  allergy: DetailedAllergy | null;
  onClose: () => void;
  onSave: (a: DetailedAllergy) => void;
}> = ({ allergy, onClose, onSave }) => {
  const [form, setForm] = useState<DetailedAllergy>(
    allergy || {
      id: `alg-${Date.now()}`,
      allergen: '',
      category: 'Medication',
      reaction: '',
      severity: 'Moderate',
      notes: ''
    }
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            {allergy ? 'Edit Allergy' : 'Add Documented Allergy'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.allergen.trim()) return;
            onSave(form);
          }}
          className="space-y-3.5 text-xs"
        >
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Allergen *</label>
            <input
              type="text"
              value={form.allergen}
              onChange={(e) => setForm({ ...form, allergen: e.target.value })}
              placeholder="e.g. Penicillin, Peanuts, Latex"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              >
                <option value="Medication">Medication</option>
                <option value="Food">Food</option>
                <option value="Environmental">Environmental</option>
                <option value="Insect">Insect</option>
                <option value="Latex">Latex</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Severity</label>
              <select
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              >
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe / Life-Threatening">Severe / Life-Threatening</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Observed Reaction *</label>
            <input
              type="text"
              value={form.reaction}
              onChange={(e) => setForm({ ...form, reaction: e.target.value })}
              placeholder="e.g. Hives, facial swelling, shortness of breath"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Clinical Notes</label>
            <input
              type="text"
              value={form.notes || ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. Discovered in 2021 during antibiotic course"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3.5 py-2 bg-slate-100 rounded-xl font-medium">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold">
              Save Allergy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Sub-Modal: Medication
const MedicationModal: React.FC<{
  medication: DetailedMedication | null;
  onClose: () => void;
  onSave: (m: DetailedMedication) => void;
}> = ({ medication, onClose, onSave }) => {
  const [form, setForm] = useState<DetailedMedication>(
    medication || {
      id: `med-${Date.now()}`,
      name: '',
      dosage: '',
      frequency: 'Once daily',
      route: 'Oral',
      reason: '',
      startDate: new Date().toISOString().split('T')[0],
      prescribedBy: '',
      notes: ''
    }
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            {medication ? 'Edit Medication' : 'Add Active Medication'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name.trim()) return;
            onSave(form);
          }}
          className="space-y-3.5 text-xs"
        >
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Medication Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Lisinopril, Metformin, Atorvastatin"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Dosage *</label>
              <input
                type="text"
                value={form.dosage}
                onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                placeholder="e.g. 10 mg, 500 mg"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Frequency *</label>
              <input
                type="text"
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                placeholder="e.g. Once daily, Twice daily"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Route</label>
              <select
                value={form.route || 'Oral'}
                onChange={(e) => setForm({ ...form, route: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              >
                <option value="Oral">Oral</option>
                <option value="Sublingual">Sublingual</option>
                <option value="Inhalation">Inhalation</option>
                <option value="Topical">Topical</option>
                <option value="Subcutaneous">Subcutaneous</option>
                <option value="Intramuscular">Intramuscular</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Purpose / Indication</label>
            <input
              type="text"
              value={form.reason || ''}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="e.g. Blood pressure control"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Prescribing Doctor</label>
            <input
              type="text"
              value={form.prescribedBy || ''}
              onChange={(e) => setForm({ ...form, prescribedBy: e.target.value })}
              placeholder="e.g. Dr. Sarah Chen, MD"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3.5 py-2 bg-slate-100 rounded-xl font-medium">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold">
              Save Medication
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Sub-Modal: Surgery
const SurgeryModal: React.FC<{
  onClose: () => void;
  onSave: (s: SurgeryRecord) => void;
}> = ({ onClose, onSave }) => {
  const [procedure, setProcedure] = useState('');
  const [date, setDate] = useState('');
  const [hospital, setHospital] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Add Surgical Procedure</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!procedure.trim()) return;
            onSave({
              id: `surg-${Date.now()}`,
              procedure: procedure.trim(),
              approximateDate: date || 'Past',
              hospitalOrDoctor: hospital.trim(),
              notes: notes.trim()
            });
          }}
          className="space-y-3.5 text-xs"
        >
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Procedure Name *</label>
            <input
              type="text"
              value={procedure}
              onChange={(e) => setProcedure(e.target.value)}
              placeholder="e.g. Appendectomy, Meniscectomy"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Date / Year</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. 2022 or Aug 2022"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Hospital / Surgeon</label>
              <input
                type="text"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                placeholder="e.g. Apollo Hospital"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Outcome & Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Routine recovery, no complications"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3.5 py-2 bg-slate-100 rounded-xl font-medium">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold">
              Save Surgery
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
