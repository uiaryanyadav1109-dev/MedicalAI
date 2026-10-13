import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  RoutePath,
  EmergencyContact,
  DetailedAllergy,
  DetailedMedication,
  SurgeryRecord,
  PatientOnboardingData
} from '../../types';
import { AuthHeader } from '../auth/AuthHeader';
import { AuthFooter } from '../auth/AuthFooter';
import { DoctorSignupWizard } from '../auth/DoctorSignupWizard';
import { GoogleLoginButton } from '../auth/GoogleLoginButton';
import { GoogleAccountChooserModal, GoogleAccountOption } from '../auth/GoogleAccountChooserModal';
import { useAuth } from '../../context/AuthContext';
import {
  isValidEmail,
  evaluatePasswordCriteria,
  calculatePasswordStrength
} from '../../services/authService';
import { formatIndianPhoneNumber } from '../../utils/phoneUtils';
import { ALL_COUNTRIES, COMMON_NATIONALITIES, POPULAR_COUNTRIES } from '../../data/countries';
import {
  getCountryFieldConfig,
  getStatesForCountry,
  getDistrictsForState
} from '../../data/geographicData';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  MapPin,
  Heart,
  AlertTriangle,
  Pill,
  FileText,
  Building,
  Sliders,
  CheckSquare,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Edit2,
  Camera,
  ShieldCheck,
  Radio,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Stethoscope,
  Info
} from 'lucide-react';

interface SignupPageProps {
  onNavigate: (route: RoutePath) => void;
  onOpenAssessment: () => void;
  onRegisteredEmailChange?: (email: string) => void;
}

const STEPS = [
  { id: 1, title: 'Account', label: 'Create Account', icon: User },
  { id: 2, title: 'Personal', label: 'Personal Info', icon: Calendar },
  { id: 3, title: 'Contact', label: 'Contact & Address', icon: MapPin },
  { id: 4, title: 'Emergency', label: 'Emergency Contacts', icon: Phone },
  { id: 5, title: 'Medical', label: 'Medical Info', icon: Heart },
  { id: 6, title: 'Allergies', label: 'Allergies & Meds', icon: Pill },
  { id: 7, title: 'History', label: 'Medical History', icon: FileText },
  { id: 8, title: 'Insurance', label: 'Healthcare & Insurance', icon: Building },
  { id: 9, title: 'Preferences', label: 'Preferences', icon: Sliders },
  { id: 10, title: 'Consent', label: 'Privacy & Consent', icon: CheckSquare },
  { id: 11, title: 'Review', label: 'Review & Submit', icon: CheckCircle2 }
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];
const GENDER_OPTIONS = [
  'Male',
  'Female',
  'Non-Binary',
  'Prefer not to say',
  'Other'
];
const CONTACT_METHODS = ['Email', 'Phone Call', 'SMS', 'WhatsApp'] as const;

const POPULAR_COUNTRIES_LIST = ALL_COUNTRIES;

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'mr', name: 'Marathi (मराठी)' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ml', name: 'Malayalam (മലയാളം)' },
  { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'ur', name: 'Urdu (اردو)' },
  { code: 'es', name: 'Spanish (Español)' }
];

const PRESET_CONDITIONS = [
  'Diabetes (Type 2)',
  'Hypertension',
  'Asthma',
  'Heart Disease',
  'Epilepsy',
  'Thyroid Disorder',
  'Chronic Kidney Disease',
  'Arthritis',
  'Migraine',
  'High Cholesterol'
];

const FAMILY_HISTORY_OPTIONS = [
  'Diabetes',
  'Heart Disease',
  'Hypertension',
  'Cancer',
  'Stroke',
  'Asthma / Allergies',
  'Alzheimer’s / Dementia',
  'None Known'
];

const STORAGE_KEY = 'medical_ai_onboarding_draft';

export const SignupPage: React.FC<SignupPageProps> = ({
  onNavigate,
  onOpenAssessment,
  onRegisteredEmailChange
}) => {
  const { registerPatient, loginWithGoogle, loginWithGoogleAccount, isAuthenticated } = useAuth();

  // If already authenticated and visits signup, allow navigating to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      // Don't auto-redirect if reviewing success
    }
  }, [isAuthenticated]);

  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor'>('patient');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [createdPatientId, setCreatedPatientId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isChooserOpen, setIsChooserOpen] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    setGeneralError(null);
    try {
      const response = await loginWithGoogle('patient');
      if (response.success) {
        onNavigate('/dashboard');
      } else if (response.error === 'NEEDS_CHOOSER') {
        setIsChooserOpen(true);
      } else {
        setGeneralError(response.error || 'Google registration could not be completed.');
      }
    } catch {
      setGeneralError('Could not complete Google authentication. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSelectGoogleAccount = async (account: GoogleAccountOption) => {
    const response = await loginWithGoogleAccount(account, 'patient');
    if (response.success) {
      onNavigate('/dashboard');
    } else {
      setGeneralError(response.error || 'Google registration failed.');
    }
  };

  const stepRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Smoothly center the active step within the stepper rail
  useEffect(() => {
    stepRefs.current[currentStep - 1]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });
  }, [currentStep]);

  // STEP 1: Account
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // STEP 2: Personal Information
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Male');
  const [preferredName, setPreferredName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [country, setCountry] = useState('India');
  const [nationality, setNationality] = useState('Indian');

  // STEP 3: Contact & Address
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState<'Email' | 'Phone Call' | 'SMS' | 'WhatsApp'>('Email');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [addressCountry, setAddressCountry] = useState('India');
  const [isCustomState, setIsCustomState] = useState(false);
  const [isCustomCity, setIsCustomCity] = useState(false);

  // Dynamic country field configuration (labels, placeholders, formatting)
  const countryFieldConfig = useMemo(() => getCountryFieldConfig(addressCountry), [addressCountry]);

  // States / Provinces for the selected country
  const availableStates = useMemo(() => getStatesForCountry(addressCountry), [addressCountry]);

  // Districts / Cities for the selected country and state
  const availableDistrictOptions = useMemo(
    () => getDistrictsForState(addressCountry, stateName),
    [addressCountry, stateName]
  );

  const availableCityOptions = availableDistrictOptions;

  const handleCountryChange = (newCountry: string) => {
    setAddressCountry(newCountry);
    setStateName('');
    setCity('');
    setIsCustomState(false);
    setIsCustomCity(false);
  };

  const handleStateChange = (val: string) => {
    if (val === '__custom__') {
      setIsCustomState(true);
      setStateName('');
      setCity('');
      setIsCustomCity(false);
    } else {
      setIsCustomState(false);
      setStateName(val);
      setCity('');
      setIsCustomCity(false);
    }
  };

  const handleCityChange = (val: string) => {
    if (val === '__custom__') {
      setIsCustomCity(true);
      setCity('');
    } else {
      setIsCustomCity(false);
      setCity(val);
    }
  };

  // STEP 4: Emergency Contacts
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    {
      id: 'ec-init-1',
      name: '',
      relationship: 'Parent',
      phone: '',
      email: '',
      isPrimary: true,
      isActive: true,
      notifyOnTriage: true
    }
  ]);

  // STEP 5: Medical Information
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [customConditionInput, setCustomConditionInput] = useState('');

  // STEP 6: Allergies & Medications
  const [hasAllergies, setHasAllergies] = useState<'Yes' | 'No' | 'Not Sure'>('No');
  const [allergiesList, setAllergiesList] = useState<DetailedAllergy[]>([]);
  const [takingMedications, setTakingMedications] = useState<'Yes' | 'No'>('No');
  const [medicationsList, setMedicationsList] = useState<DetailedMedication[]>([]);

  // STEP 7: Medical History
  const [pastConditions, setPastConditions] = useState<string[]>([]);
  const [customPastCondition, setCustomPastCondition] = useState('');
  const [surgeriesList, setSurgeriesList] = useState<SurgeryRecord[]>([]);
  const [familyHistory, setFamilyHistory] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');

  // STEP 8: Healthcare & Insurance
  const [providerName, setProviderName] = useState('');
  const [clinicHospital, setClinicHospital] = useState('');
  const [providerPhone, setProviderPhone] = useState('');
  const [providerEmail, setProviderEmail] = useState('');
  const [pharmacyName, setPharmacyName] = useState('');
  const [pharmacyLocation, setPharmacyLocation] = useState('');
  const [pharmacyPhone, setPharmacyPhone] = useState('');
  const [noInsurance, setNoInsurance] = useState(false);
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [groupNumber, setGroupNumber] = useState('');
  const [policyHolderName, setPolicyHolderName] = useState('');
  const [relationshipToHolder, setRelationshipToHolder] = useState('Self');

  // STEP 9: Preferences & Accessibility
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(true);
  const [emergencyNotifs, setEmergencyNotifs] = useState(true);
  const [reminderNotifs, setReminderNotifs] = useState(true);
  const [largerText, setLargerText] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [screenReaderOptimized, setScreenReaderOptimized] = useState(false);

  // STEP 10: Privacy & Consent (strictly unchecked by default)
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeAiDisclaimer, setAgreeAiDisclaimer] = useState(false);
  const [agreeDataProcessing, setAgreeDataProcessing] = useState(false);
  const [agreeEmergencySos, setAgreeEmergencySos] = useState(false);

  // Validation errors
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Restore non-sensitive draft on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.firstName) setFirstName(parsed.firstName);
        if (parsed.middleName) setMiddleName(parsed.middleName);
        if (parsed.lastName) setLastName(parsed.lastName);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.phone) {
          setPhone(parsed.phone);
          setPrimaryPhone(parsed.phone);
        }
        if (parsed.dateOfBirth) setDateOfBirth(parsed.dateOfBirth);
        if (parsed.gender) setGender(parsed.gender);
        if (parsed.preferredName) setPreferredName(parsed.preferredName);
        if (parsed.preferredLanguage) setPreferredLanguage(parsed.preferredLanguage);
        if (parsed.country) setCountry(parsed.country);
        if (parsed.addressLine1) setAddressLine1(parsed.addressLine1);
        if (parsed.city) setCity(parsed.city);
        if (parsed.stateName) setStateName(parsed.stateName);
        if (parsed.postalCode) setPostalCode(parsed.postalCode);
        if (parsed.bloodGroup) setBloodGroup(parsed.bloodGroup);
        if (parsed.selectedConditions) setSelectedConditions(parsed.selectedConditions);
        if (parsed.emergencyContacts && parsed.emergencyContacts.length > 0) {
          setEmergencyContacts(parsed.emergencyContacts);
        }
      }
    } catch {
      // safe fallback
    }
  }, []);

  // Save non-sensitive draft on change
  useEffect(() => {
    try {
      const draft = {
        firstName,
        middleName,
        lastName,
        email,
        phone,
        dateOfBirth,
        gender,
        preferredName,
        preferredLanguage,
        country,
        addressLine1,
        city,
        stateName,
        postalCode,
        bloodGroup,
        selectedConditions,
        emergencyContacts
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // safe fallback
    }
  }, [
    firstName,
    middleName,
    lastName,
    email,
    phone,
    dateOfBirth,
    gender,
    preferredName,
    preferredLanguage,
    country,
    addressLine1,
    city,
    stateName,
    postalCode,
    bloodGroup,
    selectedConditions,
    emergencyContacts
  ]);

  // Sync phone to primary contact phone if empty
  useEffect(() => {
    if (phone && !primaryPhone) {
      setPrimaryPhone(phone);
    }
  }, [phone, primaryPhone]);

  // Password criteria & strength
  const criteria = useMemo(() => evaluatePasswordCriteria(password), [password]);
  const strength = useMemo(() => calculatePasswordStrength(password), [password]);

  // Age calculation helper
  const calculatedAge = useMemo(() => {
    if (!dateOfBirth) return null;
    const bDate = new Date(dateOfBirth);
    if (isNaN(bDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - bDate.getFullYear();
    const m = today.getMonth() - bDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bDate.getDate())) {
      age--;
    }
    return age >= 0 && age <= 130 ? age : null;
  }, [dateOfBirth]);

  // Step Validation logic
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!firstName.trim()) errors.firstName = 'First name is required.';
      if (!lastName.trim()) errors.lastName = 'Last name is required.';
      if (!email.trim()) {
        errors.email = 'Email address is required.';
      } else if (!isValidEmail(email)) {
        errors.email = 'Please enter a valid email address.';
      }
      if (!phone.trim()) {
        errors.phone = 'Phone number is required.';
      } else if (phone.trim().length < 8) {
        errors.phone = 'Please enter a valid phone number.';
      }
      if (!password) {
        errors.password = 'Password is required.';
      } else if (password.length < 8) {
        errors.password = 'Password must be at least 8 characters long.';
      } else if (!criteria.hasUppercase || !criteria.hasNumber || !criteria.hasSpecial) {
        errors.password = 'Password does not meet clinical complexity criteria.';
      }
      if (!confirmPassword) {
        errors.confirmPassword = 'Please confirm your password.';
      } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
      }
    } else if (step === 2) {
      if (!dateOfBirth) {
        errors.dateOfBirth = 'Date of birth is required.';
      } else {
        const bDate = new Date(dateOfBirth);
        const today = new Date();
        if (bDate > today) {
          errors.dateOfBirth = 'Date of birth cannot be in the future.';
        } else if (calculatedAge === null || calculatedAge < 0 || calculatedAge > 125) {
          errors.dateOfBirth = 'Please provide a valid birth date.';
        }
      }
      if (!gender) errors.gender = 'Please select your gender.';
    } else if (step === 3) {
      if (!primaryPhone.trim()) {
        errors.primaryPhone = 'Primary phone number is required.';
      }
    } else if (step === 4) {
      if (emergencyContacts.length === 0) {
        errors.contacts = 'At least one emergency contact is required for your SOS emergency safety network.';
      } else {
        emergencyContacts.forEach((c, idx) => {
          if (!c.name.trim()) errors[`c_name_${idx}`] = 'Contact name is required.';
          if (!c.phone.trim()) errors[`c_phone_${idx}`] = 'Contact phone number is required.';
          if (!c.relationship) errors[`c_rel_${idx}`] = 'Relationship is required.';
        });
      }
    } else if (step === 6) {
      if (hasAllergies === 'Yes' && allergiesList.length === 0) {
        errors.allergies = 'Please add at least one allergy entry or select "No".';
      }
      if (takingMedications === 'Yes' && medicationsList.length === 0) {
        errors.medications = 'Please add at least one medication entry or select "No".';
      }
    } else if (step === 10) {
      if (!agreeTerms) errors.agreeTerms = 'You must accept the Terms of Service to continue.';
      if (!agreePrivacy) errors.agreePrivacy = 'You must acknowledge the Privacy Policy.';
      if (!agreeAiDisclaimer) errors.agreeAiDisclaimer = 'You must acknowledge the Medical AI clinical disclaimer.';
      if (!agreeDataProcessing) errors.agreeDataProcessing = 'You must acknowledge medical data processing consent.';
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    setGeneralError(null);
    if (!validateStep(currentStep)) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }
    if (currentStep < 11) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setGeneralError(null);
    setStepErrors({});
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const jumpToStep = (stepNumber: number) => {
    setGeneralError(null);
    setStepErrors({});
    setCurrentStep(stepNumber);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Profile image upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfileImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Emergency contact modifiers
  const addEmergencyContact = () => {
    setEmergencyContacts((prev) => [
      ...prev,
      {
        id: `ec-${Date.now()}-${prev.length + 1}`,
        name: '',
        relationship: 'Spouse',
        phone: '',
        email: '',
        isPrimary: false,
        isActive: true,
        notifyOnTriage: true
      }
    ]);
  };

  const updateEmergencyContactField = (
    index: number,
    field: keyof EmergencyContact,
    value: any
  ) => {
    setEmergencyContacts((prev) => {
      const next = [...prev];
      if (field === 'isPrimary' && value === true) {
        next.forEach((item, i) => {
          item.isPrimary = i === index;
        });
      } else {
        next[index] = { ...next[index], [field]: value };
      }
      return next;
    });
  };

  const removeEmergencyContact = (index: number) => {
    if (emergencyContacts.length <= 1) return;
    setEmergencyContacts((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (!next.some((c) => c.isPrimary) && next.length > 0) {
        next[0].isPrimary = true;
      }
      return next;
    });
  };

  // Conditions tag toggling
  const toggleCondition = (condition: string) => {
    setSelectedConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    );
  };

  const handleAddCustomCondition = () => {
    const val = customConditionInput.trim();
    if (val && !selectedConditions.includes(val)) {
      setSelectedConditions((prev) => [...prev, val]);
      setCustomConditionInput('');
    }
  };

  // Allergies handlers
  const addAllergyItem = () => {
    setAllergiesList((prev) => [
      ...prev,
      {
        id: `alg-${Date.now()}-${prev.length}`,
        allergen: '',
        category: 'Medication',
        reaction: '',
        severity: 'Moderate',
        notes: ''
      }
    ]);
  };

  const updateAllergyItem = (index: number, field: keyof DetailedAllergy, value: any) => {
    setAllergiesList((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeAllergyItem = (index: number) => {
    setAllergiesList((prev) => prev.filter((_, i) => i !== index));
  };

  // Medications handlers
  const addMedicationItem = () => {
    setMedicationsList((prev) => [
      ...prev,
      {
        id: `med-${Date.now()}-${prev.length}`,
        name: '',
        dosage: '',
        frequency: 'Once daily',
        route: 'Oral',
        reason: '',
        prescribedBy: '',
        notes: ''
      }
    ]);
  };

  const updateMedicationItem = (index: number, field: keyof DetailedMedication, value: any) => {
    setMedicationsList((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeMedicationItem = (index: number) => {
    setMedicationsList((prev) => prev.filter((_, i) => i !== index));
  };

  // Surgery handlers
  const addSurgeryItem = () => {
    setSurgeriesList((prev) => [
      ...prev,
      {
        id: `surg-${Date.now()}-${prev.length}`,
        procedure: '',
        approximateDate: '',
        hospitalOrDoctor: '',
        notes: ''
      }
    ]);
  };

  const updateSurgeryItem = (index: number, field: keyof SurgeryRecord, value: any) => {
    setSurgeriesList((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeSurgeryItem = (index: number) => {
    setSurgeriesList((prev) => prev.filter((_, i) => i !== index));
  };

  // Final Registration Submission
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setGeneralError(null);

    // Validate consents and essentials
    if (!validateStep(1) || !validateStep(2) || !validateStep(4) || !validateStep(10)) {
      setGeneralError('Please review required fields before submitting.');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload: PatientOnboardingData = {
        firstName,
        middleName: middleName.trim() || undefined,
        lastName,
        email,
        phone: formatIndianPhoneNumber(phone),
        password,
        dateOfBirth,
        gender,
        preferredName: preferredName.trim() || firstName.trim(),
        profileImageUrl: profileImage || undefined,
        preferredLanguage,
        country,
        nationality,
        primaryPhone: formatIndianPhoneNumber(primaryPhone || phone),
        alternatePhone: formatIndianPhoneNumber(alternatePhone) || undefined,
        contactEmail: email,
        preferredContactMethod,
        address: {
          addressLine1,
          addressLine2: addressLine2.trim() || undefined,
          city,
          state: stateName,
          postalCode,
          country: addressCountry
        },
        emergencyContacts: emergencyContacts.map((c, i) => ({
          ...c,
          phone: formatIndianPhoneNumber(c.phone),
          id: c.id || `ec-${Date.now()}-${i}`,
          isPrimary: i === 0 || c.isPrimary,
          isActive: true
        })),
        bloodGroup,
        rhFactor: bloodGroup.includes('+') ? '+' : bloodGroup.includes('-') ? '-' : 'Unknown',
        medicalConditions: selectedConditions,
        hasAllergies,
        allergies: hasAllergies === 'Yes' ? allergiesList : [],
        takingMedications,
        medications: takingMedications === 'Yes' ? medicationsList : [],
        pastConditions,
        surgeries: surgeriesList,
        familyHistory,
        additionalMedicalNotes: additionalNotes.trim() || undefined,
        primaryProvider: {
          providerName: providerName.trim() || undefined,
          clinicHospital: clinicHospital.trim() || undefined,
          phone: providerPhone.trim() || undefined,
          email: providerEmail.trim() || undefined
        },
        preferredPharmacy: {
          pharmacyName: pharmacyName.trim() || undefined,
          location: pharmacyLocation.trim() || undefined,
          phone: pharmacyPhone.trim() || undefined
        },
        insurance: {
          hasInsurance: !noInsurance,
          provider: !noInsurance ? insuranceProvider.trim() || undefined : undefined,
          policyNumber: !noInsurance ? policyNumber.trim() || undefined : undefined,
          groupNumber: !noInsurance ? groupNumber.trim() || undefined : undefined,
          policyHolderName: !noInsurance ? policyHolderName.trim() || undefined : undefined,
          relationshipToHolder: !noInsurance ? relationshipToHolder : undefined
        },
        preferences: {
          preferredLanguage,
          communication: {
            emailNotifications: emailNotifs,
            smsNotifications: smsNotifs,
            emergencyNotifications: emergencyNotifs,
            healthReminders: reminderNotifs
          },
          accessibility: {
            largerText,
            reducedMotion,
            highContrast,
            screenReaderOptimized
          }
        },
        consents: {
          termsOfService: agreeTerms,
          privacyPolicy: agreePrivacy,
          aiAssistanceDisclaimer: agreeAiDisclaimer,
          medicalDataProcessing: agreeDataProcessing,
          emergencySosConsent: agreeEmergencySos,
          timestamp: new Date().toISOString()
        }
      };

      const result = await registerPatient(payload);

      if (result.success && result.patientId) {
        setCreatedPatientId(result.patientId);
        if (onRegisteredEmailChange) {
          onRegisteredEmailChange(email);
        }
        // Clean draft storage
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        setGeneralError(result.error || 'Failed to complete registration. Please check your data.');
      }
    } catch (err: unknown) {
      setGeneralError(err instanceof Error ? err.message : 'A server error occurred during patient profile initialization.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS SCREEN MODAL / VIEW
  if (createdPatientId) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
        <AuthHeader currentMode="signup" onNavigate={onNavigate} />

        <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-12 flex flex-col justify-center items-center">
          <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-8 sm:p-10 shadow-sm text-center relative overflow-hidden">
            {/* Soft decorative background pulse */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

            {/* Success icon badge */}
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-xs mb-6">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Patient Profile Activated
            </span>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
              Account Created Successfully
            </h1>

            <p className="text-slate-600 dark:text-slate-400 text-base max-w-md mx-auto leading-relaxed mb-6">
              Welcome to Medical AI, <span className="font-semibold text-slate-900 dark:text-slate-200">{preferredName || firstName}</span>. Your clinical profile and patient portal are ready.
            </p>

            {/* Patient ID Code Display Card */}
            <div className="bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800 p-5 mb-8 max-w-sm mx-auto">
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Assigned Medical Identifier
              </div>
              <div className="text-2xl font-mono font-extrabold text-blue-600 dark:text-blue-400 tracking-wider">
                {createdPatientId}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                Encrypted & accessible on your digital patient card
              </div>
            </div>

            {/* Clinical highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left">
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <Radio className="w-4 h-4 text-rose-500 mb-1.5" />
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">SOS Safety Network</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Emergency contacts configured</div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <Heart className="w-4 h-4 text-blue-500 mb-1.5" />
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Medical Passport</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Blood group {bloodGroup} recorded</div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <Sparkles className="w-4 h-4 text-amber-500 mb-1.5" />
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">AI Triage Assistant</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Clinical context initialized</div>
              </div>
            </div>

            {/* Dashboard Redirect CTA */}
            <button
              onClick={() => onNavigate('/dashboard')}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>

        <AuthFooter onNavigate={onNavigate} />
      </div>
    );
  }

  // WIZARD VIEW (STEPS 1 to 11)
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors overflow-x-hidden">
      <AuthHeader currentMode="signup" onNavigate={onNavigate} />

      {/* Main Form Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Role Selector: Patient vs Doctor */}
        <div className="mb-8 p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex max-w-md mx-auto sm:mx-0 shadow-2xs">
          <button
            type="button"
            onClick={() => setSelectedRole('patient')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selectedRole === 'patient'
                ? 'bg-white dark:bg-[#1769AA] text-[#102A43] dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4 text-blue-600 dark:text-white" />
            <span>Patient Onboarding</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('doctor')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selectedRole === 'doctor'
                ? 'bg-white dark:bg-[#16865C] text-[#102A43] dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
            <span>Doctor &amp; Clinician</span>
          </button>
        </div>

        {selectedRole === 'doctor' ? (
          <DoctorSignupWizard
            onNavigate={onNavigate}
            onOpenAssessment={onOpenAssessment}
            onRegisteredEmailChange={onRegisteredEmailChange}
          />
        ) : (
          <>
            {/* Onboarding Header Banner */}
        <div className="mb-6 sm:mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                Patient Account Onboarding
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                · Step-by-Step Clinical Registration
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              {STEPS[currentStep - 1].label}
            </h1>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 self-center sm:self-auto text-right">
            <span>Step <strong className="text-slate-900 dark:text-slate-200">{currentStep}</strong> of 11</span>
            <div className="w-32 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-blue-600 h-full transition-all duration-300 ease-out"
                style={{ width: `${(currentStep / 11) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stepper Navigation Bar - strictly contained inside card */}
        <div className="mb-8 bg-white dark:bg-[#0E1A2D] rounded-2xl p-4 border border-slate-200 dark:border-[#1E2E47] shadow-xs">
          {/* Phase Badge & Summary matching Doctor Stepper */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md font-semibold text-[11px] bg-blue-50 dark:bg-blue-950/60 text-[#1769AA] dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40">
                Phase {currentStep <= 4 ? '1 of 4' : currentStep <= 7 ? '2 of 4' : currentStep <= 9 ? '3 of 4' : '4 of 4'}
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {currentStep <= 4
                  ? 'Identity & Contact Setup'
                  : currentStep <= 7
                  ? 'Clinical Background'
                  : currentStep <= 9
                  ? 'Healthcare & Insurance'
                  : 'Consent & Verification'}
              </span>
            </div>
            <span className="text-slate-400 dark:text-slate-500 font-medium text-[11px]">
              {Math.round((currentStep / 11) * 100)}% Complete
            </span>
          </div>

          {/* Step Cards - matching Doctor Onboarding Stepper with Icon on Top and Label Below */}
          <nav
            aria-label="Registration Progress"
            className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar sm:grid sm:grid-cols-11"
          >
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isPassed = step.id < currentStep;
              const isCurrent = step.id === currentStep;

              return (
                <button
                  key={step.id}
                  type="button"
                  ref={(el) => {
                    stepRefs.current[idx] = el;
                  }}
                  onClick={() => {
                    if (step.id < currentStep) jumpToStep(step.id);
                  }}
                  disabled={step.id > currentStep}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl text-center transition-all shrink-0 min-w-[70px] sm:min-w-0 sm:w-full cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-50/80 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-700 text-[#1769AA] dark:text-[#38BDF8] font-bold shadow-2xs'
                      : isPassed
                      ? 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 text-blue-600 dark:text-blue-400 cursor-pointer'
                      : 'bg-transparent text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50'
                  }`}
                  title={step.label}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-1 text-xs">
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Icon className={`w-4 h-4 ${isCurrent ? 'text-[#1769AA] dark:text-[#38BDF8]' : isPassed ? 'text-blue-600 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600'}`} />
                    )}
                  </div>
                  <span className={`text-[11px] truncate w-full ${isCurrent ? 'font-bold text-[#1769AA] dark:text-[#38BDF8]' : isPassed ? 'font-medium text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>
                    {step.title}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Global Error Banner */}
        {generalError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-red-700 dark:text-red-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold">Action Required</p>
              <p>{generalError}</p>
            </div>
          </div>
        )}

        {/* Active Step Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
          {/* ============================================================== */}
          {/* STEP 1: CREATE ACCOUNT */}
          {/* ============================================================== */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Create Your Account
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Let's start by creating your secure Medical AI Patient Portal account.
                </p>
              </div>

              {/* One-Click Google Registration */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                <GoogleLoginButton
                  onClick={handleGoogleSignup}
                  isLoading={isGoogleLoading}
                  disabled={isSubmitting}
                  text="Continue with Google"
                  roleContext="patient"
                />
                <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-mono">
                  <span className="bg-slate-50 dark:bg-slate-800/60 px-3 text-slate-400">
                    or register manually below
                  </span>
                </div>
              </div>

              {/* Name Fields */}
              <div>
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                  Legal Patient Name
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Aryan"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    {stepErrors.firstName && (
                      <p className="text-xs text-red-500 mt-1">{stepErrors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Middle Name <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      placeholder="e.g. Kumar"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Yadav"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    {stepErrors.lastName && (
                      <p className="text-xs text-red-500 mt-1">{stepErrors.lastName}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Credentials */}
              <div className="pt-2">
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                  Account Credentials
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    {stepErrors.email && (
                      <p className="text-xs text-red-500 mt-1">{stepErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (!primaryPhone) setPrimaryPhone(e.target.value);
                        }}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    {stepErrors.phone && (
                      <p className="text-xs text-red-500 mt-1">{stepErrors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create strong password"
                        className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {stepErrors.password && (
                      <p className="text-xs text-red-500 mt-1">{stepErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {stepErrors.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">{stepErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Password strength & requirements checklist */}
                {password && (
                  <div className="mt-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Password Strength:
                      </span>
                      <span
                        className={`font-bold capitalize ${
                          strength === 'strong'
                            ? 'text-emerald-600'
                            : strength === 'fair'
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {strength}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${criteria.minLength ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`}
                        />
                        <span>8+ characters</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${criteria.hasUppercase ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`}
                        />
                        <span>Uppercase letter</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${criteria.hasNumber ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`}
                        />
                        <span>One number</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${criteria.hasSpecial ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`}
                        />
                        <span>Special character</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 2: PERSONAL INFORMATION */}
          {/* ============================================================== */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Personal Information
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Demographic data to verify patient identity and tailor clinical baseline vitals.
                </p>
              </div>

              {/* Profile Photo Upload */}
              <div className="flex items-center gap-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <div className="relative w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-600 shadow-xs shrink-0">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-slate-400" />
                  )}
                </div>

                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Patient Profile Photo
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    Used on your digital medical card and emergency hospital verification. Max 5MB.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{profileImage ? 'Change Photo' : 'Upload Photo'}</span>
                    </button>
                    {profileImage && (
                      <button
                        type="button"
                        onClick={() => setProfileImage(null)}
                        className="px-3 py-1.5 text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              {/* DOB & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    {calculatedAge !== null && (
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                        Age: {calculatedAge} years
                      </span>
                    )}
                  </div>
                  <input
                    type="date"
                    value={dateOfBirth}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {stepErrors.dateOfBirth && (
                    <p className="text-xs text-red-500 mt-1">{stepErrors.dateOfBirth}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Gender / Sex <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {GENDER_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  {stepErrors.gender && (
                    <p className="text-xs text-red-500 mt-1">{stepErrors.gender}</p>
                  )}
                </div>
              </div>

              {/* Preferred Name & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Name <span className="text-slate-400 font-normal">(What should we call you?)</span>
                  </label>
                  <input
                    type="text"
                    value={preferredName}
                    onChange={(e) => setPreferredName(e.target.value)}
                    placeholder={firstName || 'e.g. Aryan'}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Clinical Language
                  </label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.name}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Country & Nationality */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Country of Residence
                    </label>
                    <select
                      value={country}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCountry(val);
                        if (addressCountry === 'India' || !addressCountry) {
                          handleCountryChange(val);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <optgroup label="Popular Countries">
                        {POPULAR_COUNTRIES.map((cntry) => (
                          <option key={`pop2-${cntry}`} value={cntry}>
                            {cntry}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="All Countries">
                        {ALL_COUNTRIES.map((cntry) => (
                          <option key={`all2-${cntry}`} value={cntry}>
                            {cntry}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nationality
                    </label>
                    <input
                      type="text"
                      list="nationality-options"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="e.g. Indian"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <datalist id="nationality-options">
                      {COMMON_NATIONALITIES.map((nat) => (
                        <option key={nat} value={nat} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Quick Country / Nationality chips */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs pt-0.5">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">
                    Quick Choose:
                  </span>
                  {[
                    { c: 'India', n: 'Indian' },
                    { c: 'United States', n: 'American' },
                    { c: 'United Kingdom', n: 'British' },
                    { c: 'United Arab Emirates', n: 'Emirati' },
                    { c: 'Canada', n: 'Canadian' }
                  ].map((pair) => (
                    <button
                      key={pair.c}
                      type="button"
                      onClick={() => {
                        setCountry(pair.c);
                        setNationality(pair.n);
                        setAddressCountry(pair.c);
                      }}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                        country === pair.c
                          ? 'bg-blue-600 text-white font-semibold shadow-xs ring-2 ring-blue-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {pair.c === 'United Arab Emirates' ? 'UAE' : pair.c === 'United States' ? 'USA' : pair.c === 'United Kingdom' ? 'UK' : pair.c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 3: CONTACT & ADDRESS */}
          {/* ============================================================== */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Contact & Address
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Official contact details for appointment updates, laboratory releases, and physical residency.
                </p>
              </div>

              {/* Phone & Contact Method */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={primaryPhone}
                    onChange={(e) => setPrimaryPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {stepErrors.primaryPhone && (
                    <p className="text-xs text-red-500 mt-1">{stepErrors.primaryPhone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Alternate Phone Number
                  </label>
                  <input
                    type="tel"
                    value={alternatePhone}
                    onChange={(e) => setAlternatePhone(e.target.value)}
                    placeholder="Optional alternate"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Contact Method
                  </label>
                  <select
                    value={preferredContactMethod}
                    onChange={(e) => setPreferredContactMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {CONTACT_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Residential Address */}
              <div className="pt-2">
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                  Residential Address
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="Apartment, Street address"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Address Line 2 <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="Suite, Landmark, Building name"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* 1. Country Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Country
                        </label>
                      </div>
                      <select
                        value={addressCountry}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <optgroup label="Popular Countries">
                          {POPULAR_COUNTRIES.map((cntry) => (
                            <option key={`pop-${cntry}`} value={cntry}>
                              {cntry}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="All Countries">
                          {ALL_COUNTRIES.map((cntry) => (
                            <option key={`all-${cntry}`} value={cntry}>
                              {cntry}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    {/* 2. State / Province Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {countryFieldConfig.stateLabel}
                        </label>
                        {stateName && (
                          <button
                            type="button"
                            onClick={() => {
                              setStateName('');
                              setCity('');
                            }}
                            className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer shrink-0"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        {availableStates.length > 0 && !isCustomState ? (
                          <select
                            value={stateName}
                            onChange={(e) => handleStateChange(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                          >
                            <option value="">Select {countryFieldConfig.stateLabel}</option>
                            {availableStates.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                            <option value="__custom__">✍️ Other / Not Listed...</option>
                          </select>
                        ) : (
                          <div className="relative">
                            <input
                              type="text"
                              value={stateName}
                              onChange={(e) => setStateName(e.target.value)}
                              placeholder={`Enter ${countryFieldConfig.stateLabel}`}
                              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                            {availableStates.length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsCustomState(false);
                                  setStateName('');
                                }}
                                className="absolute right-2 top-2.5 text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                              >
                                List
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 3. District / City Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {countryFieldConfig.districtLabel}
                        </label>
                        {city && (
                          <button
                            type="button"
                            onClick={() => setCity('')}
                            className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer shrink-0"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        {availableDistrictOptions.length > 0 && !isCustomCity ? (
                          <select
                            value={city}
                            onChange={(e) => handleCityChange(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                          >
                            <option value="">
                              {stateName
                                ? `Select ${countryFieldConfig.districtLabel}`
                                : `Select ${countryFieldConfig.districtLabel} (or pick state)`}
                            </option>
                            {availableDistrictOptions.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                            <option value="__custom__">✍️ Other / Type Custom...</option>
                          </select>
                        ) : (
                          <div className="relative">
                            <input
                              type="text"
                              list="district-options"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder={countryFieldConfig.districtPlaceholder}
                              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                            {availableDistrictOptions.length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsCustomCity(false);
                                  setCity('');
                                }}
                                className="absolute right-2 top-2.5 text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                              >
                                List
                              </button>
                            )}
                            <datalist id="district-options">
                              {availableDistrictOptions.map((d) => (
                                <option key={d} value={d} />
                              ))}
                            </datalist>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 4. Postal / PIN Code */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {countryFieldConfig.postalCodeLabel}
                        </label>
                      </div>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder={countryFieldConfig.postalCodePlaceholder}
                        maxLength={12}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 4: EMERGENCY & SOS CONTACTS */}
          {/* ============================================================== */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Emergency & SOS Contacts
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300">
                    Required for SOS
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  These contacts may be notified during an emergency if you activate the SOS feature.
                </p>
              </div>

              {stepErrors.contacts && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 text-xs rounded-lg">
                  {stepErrors.contacts}
                </div>
              )}

              {/* Dynamic Emergency Contacts List */}
              <div className="space-y-4">
                {emergencyContacts.map((contact, idx) => (
                  <div
                    key={contact.id || idx}
                    className="p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 space-y-4 relative"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {contact.name ? contact.name : `Emergency Contact ${idx + 1}`}
                        </h4>
                        {contact.isPrimary && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                            Primary Contact
                          </span>
                        )}
                      </div>

                      {emergencyContacts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEmergencyContact(idx)}
                          className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={contact.name}
                          onChange={(e) => updateEmergencyContactField(idx, 'name', e.target.value)}
                          placeholder="e.g. Sunita Yadav"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        {stepErrors[`c_name_${idx}`] && (
                          <p className="text-[11px] text-red-500 mt-1">{stepErrors[`c_name_${idx}`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Relationship <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={contact.relationship}
                          onChange={(e) => updateEmergencyContactField(idx, 'relationship', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="Parent">Parent</option>
                          <option value="Mother">Mother</option>
                          <option value="Father">Father</option>
                          <option value="Spouse">Spouse / Partner</option>
                          <option value="Child">Child</option>
                          <option value="Brother">Brother</option>
                          <option value="Sister">Sister</option>
                          <option value="Guardian">Guardian</option>
                          <option value="Friend">Friend</option>
                          <option value="Physician">Personal Physician</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={contact.phone}
                          onChange={(e) => updateEmergencyContactField(idx, 'phone', e.target.value)}
                          placeholder="+91 98765 00000"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        {stepErrors[`c_phone_${idx}`] && (
                          <p className="text-[11px] text-red-500 mt-1">{stepErrors[`c_phone_${idx}`]}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="email"
                          value={contact.email || ''}
                          onChange={(e) => updateEmergencyContactField(idx, 'email', e.target.value)}
                          placeholder="contact@family.net"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div className="flex flex-col justify-end space-y-2 pb-1">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={contact.isPrimary}
                            onChange={(e) => updateEmergencyContactField(idx, 'isPrimary', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                          />
                          <span>Primary Emergency Contact</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={contact.notifyOnTriage ?? true}
                            onChange={(e) => updateEmergencyContactField(idx, 'notifyOnTriage', e.target.checked)}
                            className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                          />
                          <span>Authorize for Instant SOS Dispatch</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add contact button */}
              <button
                type="button"
                onClick={addEmergencyContact}
                className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Another Emergency Contact</span>
              </button>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 5: MEDICAL INFORMATION */}
          {/* ============================================================== */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Your Medical Information
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  This information helps your healthcare team and Medical AI understand your health context.
                </p>
              </div>

              {/* Blood group & Rh */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full sm:max-w-xs px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono font-bold"
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              {/* Existing Conditions */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Existing Medical Conditions <span className="text-slate-400 font-normal">(Select all that apply)</span>
                </label>

                <div className="flex flex-wrap gap-2 mb-3">
                  {PRESET_CONDITIONS.map((cond) => {
                    const isSelected = selectedConditions.includes(cond);
                    return (
                      <button
                        type="button"
                        key={cond}
                        onClick={() => toggleCondition(cond)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>{cond}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom condition input */}
                <div className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    value={customConditionInput}
                    onChange={(e) => setCustomConditionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomCondition();
                      }
                    }}
                    placeholder="Enter other chronic condition..."
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomCondition}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    + Add
                  </button>
                </div>

                {selectedConditions.length > 0 && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Selected Conditions ({selectedConditions.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedConditions.map((c) => (
                        <span
                          key={c}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                        >
                          <span>{c}</span>
                          <button
                            type="button"
                            onClick={() => toggleCondition(c)}
                            className="text-slate-400 hover:text-red-500 ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 6: ALLERGIES & MEDICATIONS */}
          {/* ============================================================== */}
          {currentStep === 6 && (
            <div className="space-y-8">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Allergies & Current Medications
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Clinically vital details to intercept drug contraindications and anaphylaxis risks.
                </p>
              </div>

              {/* ALLERGIES SECTION */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Do you have any known allergies? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {(['Yes', 'No', 'Not Sure'] as const).map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => {
                          setHasAllergies(opt);
                          if (opt === 'Yes' && allergiesList.length === 0) {
                            addAllergyItem();
                          }
                        }}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                          hasAllergies === opt
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {hasAllergies === 'Yes' && (
                  <div className="space-y-3 pt-2">
                    {allergiesList.map((alg, idx) => (
                      <div
                        key={alg.id || idx}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Allergy #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAllergyItem(idx)}
                            className="text-xs text-rose-600 hover:text-rose-700 cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              Allergen <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={alg.allergen}
                              onChange={(e) => updateAllergyItem(idx, 'allergen', e.target.value)}
                              placeholder="e.g. Penicillin, Peanuts"
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              Category
                            </label>
                            <select
                              value={alg.category}
                              onChange={(e) => updateAllergyItem(idx, 'category', e.target.value as any)}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                            >
                              <option value="Medication">Medication</option>
                              <option value="Food">Food</option>
                              <option value="Environmental">Environmental</option>
                              <option value="Insect">Insect Stings</option>
                              <option value="Latex">Latex</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              Reaction
                            </label>
                            <input
                              type="text"
                              value={alg.reaction}
                              onChange={(e) => updateAllergyItem(idx, 'reaction', e.target.value)}
                              placeholder="e.g. Hives, Swelling"
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              Severity
                            </label>
                            <select
                              value={alg.severity}
                              onChange={(e) => updateAllergyItem(idx, 'severity', e.target.value as any)}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                            >
                              <option value="Mild">Mild</option>
                              <option value="Moderate">Moderate</option>
                              <option value="Severe / Life-Threatening">Severe / Anaphylaxis</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addAllergyItem}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer pt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Another Allergy</span>
                    </button>
                  </div>
                )}
              </div>

              {/* MEDICATIONS SECTION */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Are you currently taking any prescription medications?
                  </label>
                  <div className="flex items-center gap-2">
                    {(['Yes', 'No'] as const).map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => {
                          setTakingMedications(opt);
                          if (opt === 'Yes' && medicationsList.length === 0) {
                            addMedicationItem();
                          }
                        }}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                          takingMedications === opt
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {takingMedications === 'Yes' && (
                  <div className="space-y-3 pt-2">
                    {medicationsList.map((med, idx) => (
                      <div
                        key={med.id || idx}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Medication #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeMedicationItem(idx)}
                            className="text-xs text-rose-600 hover:text-rose-700 cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              Medication Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={med.name}
                              onChange={(e) => updateMedicationItem(idx, 'name', e.target.value)}
                              placeholder="e.g. Metformin, Lisinopril"
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              Dosage
                            </label>
                            <input
                              type="text"
                              value={med.dosage}
                              onChange={(e) => updateMedicationItem(idx, 'dosage', e.target.value)}
                              placeholder="e.g. 500 mg"
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              Frequency
                            </label>
                            <input
                              type="text"
                              value={med.frequency}
                              onChange={(e) => updateMedicationItem(idx, 'frequency', e.target.value)}
                              placeholder="e.g. Once daily after dinner"
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              Reason / Purpose
                            </label>
                            <input
                              type="text"
                              value={med.reason || ''}
                              onChange={(e) => updateMedicationItem(idx, 'reason', e.target.value)}
                              placeholder="e.g. Blood sugar control"
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addMedicationItem}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer pt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Another Medication</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 7: MEDICAL HISTORY */}
          {/* ============================================================== */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Medical & Surgical History
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Previous hospitalizations, major operations, and genetic family history.
                </p>
              </div>

              {/* Surgical History */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Surgical History & Major Procedures
                  </label>
                  <button
                    type="button"
                    onClick={addSurgeryItem}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Surgery</span>
                  </button>
                </div>

                {surgeriesList.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic py-2">
                    No surgeries recorded. Click "+ Add Surgery" if you have undergone any procedures.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {surgeriesList.map((surg, idx) => (
                      <div
                        key={surg.id || idx}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Procedure #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSurgeryItem(idx)}
                            className="text-xs text-rose-600 hover:text-rose-700 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <input
                              type="text"
                              value={surg.procedure}
                              onChange={(e) => updateSurgeryItem(idx, 'procedure', e.target.value)}
                              placeholder="Procedure (e.g. Appendectomy)"
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={surg.approximateDate}
                              onChange={(e) => updateSurgeryItem(idx, 'approximateDate', e.target.value)}
                              placeholder="Year / Date (e.g. 2021)"
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={surg.hospitalOrDoctor || ''}
                              onChange={(e) => updateSurgeryItem(idx, 'hospitalOrDoctor', e.target.value)}
                              placeholder="Hospital / Surgeon"
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Family Medical History */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Family Medical History <span className="text-slate-400 font-normal">(Select conditions present in immediate family)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {FAMILY_HISTORY_OPTIONS.map((item) => {
                    const isSelected = familyHistory.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => {
                          setFamilyHistory((prev) =>
                            prev.includes(item)
                              ? prev.filter((i) => i !== item)
                              : [...prev, item]
                          );
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Additional Free-Text Notes */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Additional Health Information <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Is there anything else about your health that you would like your healthcare team to know?
                </p>
                <textarea
                  rows={3}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="e.g. Family history of glaucoma, previous adverse reaction to anesthesia, pacemaker implants..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 8: HEALTHCARE / INSURANCE INFORMATION */}
          {/* ============================================================== */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Healthcare & Insurance Information
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Provide your primary physician and pharmacy preferences. Health insurance is completely optional.
                </p>
              </div>

              {/* Primary Physician */}
              <div>
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                  Primary Healthcare Provider <span className="font-normal lowercase">(Optional)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Doctor / Provider Name
                    </label>
                    <input
                      type="text"
                      value={providerName}
                      onChange={(e) => setProviderName(e.target.value)}
                      placeholder="e.g. Dr. Rajesh Sharma, MD"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Clinic or Hospital Affiliation
                    </label>
                    <input
                      type="text"
                      value={clinicHospital}
                      onChange={(e) => setClinicHospital(e.target.value)}
                      placeholder="e.g. Metro Specialty Hospital"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Preferred Pharmacy */}
              <div className="pt-2">
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                  Preferred Pharmacy <span className="font-normal lowercase">(Optional)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Pharmacy Name
                    </label>
                    <input
                      type="text"
                      value={pharmacyName}
                      onChange={(e) => setPharmacyName(e.target.value)}
                      placeholder="e.g. Apollo Pharmacy"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Location / Branch
                    </label>
                    <input
                      type="text"
                      value={pharmacyLocation}
                      onChange={(e) => setPharmacyLocation(e.target.value)}
                      placeholder="e.g. Main Street, Sector 4"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={pharmacyPhone}
                      onChange={(e) => setPharmacyPhone(e.target.value)}
                      placeholder="+91 22 2849 0000"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Health Insurance */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                    Health Insurance Information
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={noInsurance}
                      onChange={(e) => setNoInsurance(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span>I don't have health insurance</span>
                  </label>
                </div>

                {!noInsurance ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Insurance Provider
                      </label>
                      <input
                        type="text"
                        value={insuranceProvider}
                        onChange={(e) => setInsuranceProvider(e.target.value)}
                        placeholder="e.g. Star Health / Blue Cross"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Policy / Member ID
                      </label>
                      <input
                        type="text"
                        value={policyNumber}
                        onChange={(e) => setPolicyNumber(e.target.value)}
                        placeholder="e.g. SH-8492019"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Policy Holder Name
                      </label>
                      <input
                        type="text"
                        value={policyHolderName}
                        onChange={(e) => setPolicyHolderName(e.target.value)}
                        placeholder={firstName ? `${firstName} ${lastName}` : 'Self'}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Relationship to Policy Holder
                      </label>
                      <select
                        value={relationshipToHolder}
                        onChange={(e) => setRelationshipToHolder(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="Self">Self</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Parent">Parent</option>
                        <option value="Child">Child</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                    Insurance omitted. You can always configure insurance coverage later from your settings.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 9: PREFERENCES & ACCESSIBILITY */}
          {/* ============================================================== */}
          {currentStep === 9 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Preferences & Accessibility
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Configure alert channels and personalize your interaction experience.
                </p>
              </div>

              {/* Communication Preferences */}
              <div>
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                  Clinical Notifications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emergencyNotifs}
                      onChange={(e) => setEmergencyNotifs(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Emergency & SOS Alerts
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Immediate notifications upon emergency SOS countdown or critical triage triggers.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reminderNotifs}
                      onChange={(e) => setReminderNotifs(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Health Reminders
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Medication timing reminders and follow-up consultation advisories.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailNotifs}
                      onChange={(e) => setEmailNotifs(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Email Digests
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Diagnostic report summaries and official consultation handoff notes.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={smsNotifs}
                      onChange={(e) => setSmsNotifs(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        SMS Notifications
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Direct text dispatch messages for urgent triage classifications.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Accessibility */}
              <div className="pt-2">
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                  Accessibility Accommodations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={largerText}
                      onChange={(e) => setLargerText(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Enhanced Text Size (High Legibility)
                    </span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reducedMotion}
                      onChange={(e) => setReducedMotion(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Reduced Motion (Disable dynamic transitions)
                    </span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={highContrast}
                      onChange={(e) => setHighContrast(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      High Contrast Visual Rendering
                    </span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={screenReaderOptimized}
                      onChange={(e) => setScreenReaderOptimized(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Screen Reader Accessible Mode
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 10: PRIVACY & CONSENT */}
          {/* ============================================================== */}
          {currentStep === 10 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Privacy, Terms & Clinical Consent
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Please review each acknowledgement carefully before activating your medical portal account.
                </p>
              </div>

              {/* Legal Consents - strictly unchecked by default */}
              <div className="space-y-4">
                {/* 1. Terms of Service */}
                <div className={`p-4 rounded-xl border transition-all ${stepErrors.agreeTerms ? 'border-red-400 bg-red-50/50 dark:bg-red-950/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'}`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mt-0.5 shrink-0"
                    />
                    <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                      <span>I agree to the </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('/terms');
                        }}
                        className="font-bold text-blue-600 hover:underline"
                      >
                        Terms of Service
                      </button>
                      <span> and Patient Portal Operating Agreement. <span className="text-red-500 font-bold">* Required</span></span>
                    </div>
                  </label>
                  {stepErrors.agreeTerms && (
                    <p className="text-xs text-red-500 mt-1 pl-7">{stepErrors.agreeTerms}</p>
                  )}
                </div>

                {/* 2. Privacy Policy */}
                <div className={`p-4 rounded-xl border transition-all ${stepErrors.agreePrivacy ? 'border-red-400 bg-red-50/50 dark:bg-red-950/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'}`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreePrivacy}
                      onChange={(e) => setAgreePrivacy(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mt-0.5 shrink-0"
                    />
                    <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                      <span>I acknowledge the </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('/privacy');
                        }}
                        className="font-bold text-blue-600 hover:underline"
                      >
                        Privacy Policy
                      </button>
                      <span> and agree to the encrypted processing of my personal health records in compliance with medical data privacy guidelines. <span className="text-red-500 font-bold">* Required</span></span>
                    </div>
                  </label>
                  {stepErrors.agreePrivacy && (
                    <p className="text-xs text-red-500 mt-1 pl-7">{stepErrors.agreePrivacy}</p>
                  )}
                </div>

                {/* 3. AI Disclaimer */}
                <div className={`p-4 rounded-xl border transition-all ${stepErrors.agreeAiDisclaimer ? 'border-red-400 bg-red-50/50 dark:bg-red-950/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'}`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeAiDisclaimer}
                      onChange={(e) => setAgreeAiDisclaimer(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mt-0.5 shrink-0"
                    />
                    <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                      <span>I understand that Medical AI provides <strong>informational assistance and preliminary triage guidance</strong>, and does not replace professional medical diagnosis, emergency clinical judgment, or physician treatment. <span className="text-red-500 font-bold">* Required</span></span>
                    </div>
                  </label>
                  {stepErrors.agreeAiDisclaimer && (
                    <p className="text-xs text-red-500 mt-1 pl-7">{stepErrors.agreeAiDisclaimer}</p>
                  )}
                </div>

                {/* 4. Data Processing */}
                <div className={`p-4 rounded-xl border transition-all ${stepErrors.agreeDataProcessing ? 'border-red-400 bg-red-50/50 dark:bg-red-950/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'}`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeDataProcessing}
                      onChange={(e) => setAgreeDataProcessing(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mt-0.5 shrink-0"
                    />
                    <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                      <span>I understand how my symptom descriptions, diagnostic reports, and digital card credentials are processed securely within this healthcare portal. <span className="text-red-500 font-bold">* Required</span></span>
                    </div>
                  </label>
                  {stepErrors.agreeDataProcessing && (
                    <p className="text-xs text-red-500 mt-1 pl-7">{stepErrors.agreeDataProcessing}</p>
                  )}
                </div>

                {/* 5. Emergency SOS Communication Consent */}
                <div className="p-4 rounded-xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeEmergencySos}
                      onChange={(e) => setAgreeEmergencySos(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 mt-0.5 shrink-0"
                    />
                    <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                      <span>I explicitly consent to automated emergency SMS alerts and GPS dispatch coordinates being communicated to my designated emergency contacts whenever the SOS button is triggered.</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 11: REVIEW YOUR INFORMATION */}
          {/* ============================================================== */}
          {currentStep === 11 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Review Your Information
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Please review your submitted profile details before creating your patient account. You can click Edit on any section to jump directly to it.
                </p>
              </div>

              {/* Review Cards Grid */}
              <div className="space-y-4">
                {/* 1. Account & Personal Info */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>Account & Personal Information</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => jumpToStep(1)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Name:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{firstName} {middleName} {lastName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Email:</span>
                      <strong className="text-slate-800 dark:text-slate-200 truncate block">{email}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">DOB / Age:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{dateOfBirth} ({calculatedAge} yrs)</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Gender:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{gender}</strong>
                    </div>
                  </div>
                </div>

                {/* 2. Contact & Address */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>Contact & Address</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => jumpToStep(3)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Primary Phone:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{primaryPhone || phone}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Preferred Method:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{preferredContactMethod}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">District / State:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{city || '—'}, {stateName || '—'} ({addressCountry})</strong>
                    </div>
                  </div>
                </div>

                {/* 3. Emergency Contacts */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-rose-600" />
                      <span>Emergency SOS Contacts ({emergencyContacts.length})</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => jumpToStep(4)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {emergencyContacts.map((c, idx) => (
                      <div key={idx} className="text-xs flex items-center justify-between text-slate-700 dark:text-slate-300">
                        <span>
                          <strong>{c.name}</strong> ({c.relationship}) — {c.phone}
                        </span>
                        {c.isPrimary && (
                          <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-bold">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Medical Information */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      <span>Medical Information</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => jumpToStep(5)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs mb-2">
                    <div>
                      <span className="text-slate-400 block">Blood Group:</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono">{bloodGroup}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Reported Conditions:</span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {selectedConditions.length > 0 ? selectedConditions.join(', ') : 'None reported'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 5. Allergies & Medications */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-amber-500" />
                      <span>Allergies & Current Medications</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => jumpToStep(6)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Allergies:</span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {hasAllergies === 'Yes' && allergiesList.length > 0
                          ? allergiesList.map((a) => a.allergen).join(', ')
                          : hasAllergies}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Active Medications:</span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {takingMedications === 'Yes' && medicationsList.length > 0
                          ? medicationsList.map((m) => m.name).join(', ')
                          : 'None'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 6. Healthcare & Insurance */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-blue-500" />
                      <span>Healthcare & Insurance</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => jumpToStep(8)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Doctor:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{providerName || 'Not specified'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Pharmacy:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{pharmacyName || 'Not specified'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Insurance:</span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {noInsurance ? 'No Insurance' : insuranceProvider || 'Not specified'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 7. Preferences */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-slate-600" />
                      <span>Preferences & Language</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => jumpToStep(9)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-400">Language:</span>{' '}
                    <strong className="text-slate-800 dark:text-slate-200">{preferredLanguage}</strong>
                    <span className="text-slate-300 dark:text-slate-600 mx-2">·</span>
                    <span className="text-slate-400">Alerts:</span>{' '}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {[emergencyNotifs && 'SOS', reminderNotifs && 'Reminders', emailNotifs && 'Email']
                        .filter(Boolean)
                        .join(', ')}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* NAVIGATION FOOTER (Back / Save & Continue / Create Account) */}
          {/* ============================================================== */}
          <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate('/signin')}
                className="text-xs text-slate-500 hover:text-blue-600 transition-colors"
              >
                Already have an account? Sign in
              </button>
            )}

            {currentStep < 11 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer ml-auto"
              >
                <span>Save & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer ml-auto disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Creating Patient Account...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Create My Account</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
          </>
        )}
      </main>

      <AuthFooter onNavigate={onNavigate} />

      <GoogleAccountChooserModal
        isOpen={isChooserOpen}
        onClose={() => setIsChooserOpen(false)}
        onSelectAccount={handleSelectGoogleAccount}
        requestedRole="patient"
      />
    </div>
  );
};
