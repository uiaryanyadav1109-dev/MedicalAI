import React, { useState } from 'react';
import { RoutePath } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  isValidEmail,
  evaluatePasswordCriteria,
  calculatePasswordStrength
} from '../../services/authService';
import { GoogleLoginButton } from './GoogleLoginButton';
import { GoogleAccountChooserModal, GoogleAccountOption } from './GoogleAccountChooserModal';
import {
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building,
  FileText,
  CheckSquare,
  Award,
  Phone,
  MapPin,
  Globe2,
  Sparkles,
  Loader2,
  Briefcase
} from 'lucide-react';

interface DoctorSignupWizardProps {
  onNavigate: (route: RoutePath) => void;
  onOpenAssessment: () => void;
  onRegisteredEmailChange?: (email: string) => void;
}

const DOCTOR_STEPS = [
  { id: 1, title: 'Account', label: 'Clinician Account', icon: User, phase: 'Phase 1 of 3: Identity & Account' },
  { id: 2, title: 'Credentials', label: 'Medical Licensing', icon: Award, phase: 'Phase 1 of 3: Identity & Account' },
  { id: 3, title: 'Practice', label: 'Hospital & Practice', icon: Building, phase: 'Phase 2 of 3: Clinical Affiliation' },
  { id: 4, title: 'Workflow', label: 'Clinical Workflow', icon: Briefcase, phase: 'Phase 2 of 3: Clinical Affiliation' },
  { id: 5, title: 'Compliance', label: 'Ethics & Compliance', icon: CheckSquare, phase: 'Phase 3 of 3: Governance & Review' },
  { id: 6, title: 'Review', label: 'Review & Activate', icon: CheckCircle2, phase: 'Phase 3 of 3: Governance & Review' }
];

const MEDICAL_SPECIALTIES = [
  'General Medicine / Internal Medicine',
  'Cardiology & Cardiovascular Diseases',
  'Emergency & Critical Care Medicine',
  'Family Medicine & Primary Care',
  'Pediatrics & Adolescent Medicine',
  'Pulmonology & Respiratory Medicine',
  'Neurology & Neurosciences',
  'Endocrinology & Diabetology',
  'Gastroenterology & Hepatology',
  'Nephrology & Renal Medicine',
  'Orthopedics & Sports Medicine',
  'Dermatology & Venereology',
  'Psychiatry & Behavioral Health',
  'Obstetrics & Gynecology',
  'General Surgery & Surgical Specialties',
  'Other Clinical Specialty'
];

const MEDICAL_DEGREES = [
  'MBBS (Bachelor of Medicine & Bachelor of Surgery)',
  'MD (Doctor of Medicine)',
  'MS (Master of Surgery)',
  'DO (Doctor of Osteopathic Medicine)',
  'DM (Doctorate of Medicine - Super Specialty)',
  'MCh (Master of Chirurgical - Super Specialty)',
  'DNB (Diplomate of National Board)',
  'MRCP / FRCP (Royal College of Physicians)',
  'MRCS / FRCS (Royal College of Surgeons)',
  'Other Recognized Medical Qualification'
];

const PRACTICE_TYPES = [
  'Tertiary Care Hospital / Multi-Specialty Health System',
  'Government / District Medical Center',
  'Private Practice / Outpatient Clinical Center',
  'Academic Medical Institute / Medical College Hospital',
  'Regional Clinic / Ambulatory Care Center',
  'Digital Telemedicine Practice Group'
];

export const DoctorSignupWizard: React.FC<DoctorSignupWizardProps> = ({
  onNavigate,
  onOpenAssessment,
  onRegisteredEmailChange
}) => {
  const { signup, loginWithGoogle, loginWithGoogleAccount } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isChooserOpen, setIsChooserOpen] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [createdDoctorId, setCreatedDoctorId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Account
    title: 'Dr.',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',

    // Step 2: Credentials
    licenseNumber: '',
    licensingBoard: 'National Medical Commission (NMC) / State Council',
    primaryDegree: 'MBBS (Bachelor of Medicine & Bachelor of Surgery)',
    primarySpecialty: 'General Medicine / Internal Medicine',
    subSpecialty: '',
    yearsExperience: '5-10',
    medicalSchool: '',
    gradYear: '2016',

    // Step 3: Practice & Hospital Affiliation
    hospitalName: '',
    department: 'Department of Internal Medicine',
    practiceType: 'Tertiary Care Hospital / Multi-Specialty Health System',
    practiceAddress: '',
    practiceCity: '',
    practiceState: '',
    practicePincode: '',
    practicePhone: '',

    // Step 4: Workflow
    modalities: ['in_person', 'video_emr', 'sbar_review', 'ai_triage'] as string[],
    languages: ['English', 'Hindi'] as string[],
    emrSystem: 'MedicalAI Native & FHIR Standard',
    patientVolumeDaily: '15-25 Patients',

    // Step 5: Compliance
    agreedTelemedicineGuidelines: false,
    agreedHipaaNdhmPrivacy: false,
    agreedAiCopilotOversight: false,
    agreedTermsAndDisclaimer: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordStrength = calculatePasswordStrength(formData.password);
  const passwordCriteria = evaluatePasswordCriteria(formData.password);

  // Google OAuth for Doctors
  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    setGeneralError(null);
    try {
      const response = await loginWithGoogle('doctor');
      if (response.success) {
        onNavigate('/doctor');
      } else if (response.error === 'NEEDS_CHOOSER') {
        setIsChooserOpen(true);
      } else {
        setGeneralError(response.error || 'Google doctor onboarding could not be completed.');
      }
    } catch {
      setGeneralError('Could not complete Google authentication.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSelectGoogleAccount = async (account: GoogleAccountOption) => {
    const response = await loginWithGoogleAccount(account, 'doctor');
    if (response.success) {
      onNavigate('/doctor');
    } else {
      setGeneralError(response.error || 'Account selection failed.');
    }
  };

  // Step Validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required.';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required.';
      if (!formData.email.trim()) {
        newErrors.email = 'Practice email is required.';
      } else if (!isValidEmail(formData.email)) {
        newErrors.email = 'Enter a valid institutional email address.';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required.';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must have at least 8 characters.';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
      }
    }

    if (step === 2) {
      if (!formData.licenseNumber.trim()) {
        newErrors.licenseNumber = 'Medical registration / license number is required for verification.';
      }
      if (!formData.primarySpecialty) {
        newErrors.primarySpecialty = 'Please select your clinical specialty.';
      }
    }

    if (step === 3) {
      if (!formData.hospitalName.trim()) {
        newErrors.hospitalName = 'Hospital, clinic, or practice name is required.';
      }
      if (!formData.practiceCity.trim()) {
        newErrors.practiceCity = 'City is required.';
      }
    }

    if (step === 4) {
      if (formData.modalities.length === 0) {
        newErrors.modalities = 'Select at least one clinical consultation modality.';
      }
    }

    if (step === 5) {
      if (!formData.agreedTelemedicineGuidelines) {
        newErrors.agreedTelemedicineGuidelines = 'You must agree to official telemedicine practice guidelines.';
      }
      if (!formData.agreedHipaaNdhmPrivacy) {
        newErrors.agreedHipaaNdhmPrivacy = 'You must agree to healthcare data privacy & confidentiality.';
      }
      if (!formData.agreedAiCopilotOversight) {
        newErrors.agreedAiCopilotOversight = 'You must attest clinical oversight responsibility for AI outputs.';
      }
      if (!formData.agreedTermsAndDisclaimer) {
        newErrors.agreedTermsAndDisclaimer = 'You must accept the terms of service.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setGeneralError(null);
      setCurrentStep((prev) => Math.min(prev + 1, DOCTOR_STEPS.length));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setGeneralError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setIsSubmitting(true);
    setGeneralError(null);

    try {
      const fullName = `${formData.title} ${formData.firstName.trim()} ${formData.lastName.trim()}`;
      const response = await signup({
        fullName,
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone,
        role: 'doctor'
      });

      if (response.success) {
        if (onRegisteredEmailChange) {
          onRegisteredEmailChange(formData.email);
        }
        const docId = `DOC-${formData.primarySpecialty.substring(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
        setCreatedDoctorId(docId);
      } else {
        setGeneralError(response.error || 'Failed to complete doctor registration.');
      }
    } catch {
      setGeneralError('A server error occurred while activating doctor credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS SCREEN
  if (createdDoctorId) {
    return (
      <div className="max-w-2xl mx-auto w-full py-12 px-4 text-center">
        <div className="bg-white dark:bg-[#0E1A2D] rounded-3xl border border-slate-200 dark:border-[#1E2E47] p-8 sm:p-12 shadow-sm relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-xs mb-6">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Physician Account Activated
          </span>

          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-white mb-2">
            Welcome to the Clinician Network
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-sm max-w-md mx-auto leading-relaxed mb-6">
            Congratulations, <span className="font-semibold text-slate-900 dark:text-white">{formData.title} {formData.firstName} {formData.lastName}</span>. Your clinical credentials and AI Copilot workspace are now fully unlocked.
          </p>

          {/* Clinician ID Card */}
          <div className="bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 mb-8 max-w-sm mx-auto text-center">
            <div className="text-[11px] uppercase tracking-wider font-mono text-slate-500 dark:text-slate-400 mb-1">
              Physician Provider License Identifier
            </div>
            <div className="text-2xl font-mono font-extrabold text-medical-blue dark:text-teal-400">
              {createdDoctorId}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {formData.primarySpecialty} · {formData.hospitalName}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => onNavigate('/doctor')}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#1769AA] hover:bg-[#102A43] active:bg-[#0B1320] text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Launch Doctor Clinical Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // WIZARD VIEW
  const stepMeta = DOCTOR_STEPS[currentStep - 1];

  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* Header Banner */}
      <div className="mb-6 sm:mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Doctor &amp; Clinician Onboarding
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              · Verified Clinical Credentialing Registration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-white">
            {stepMeta.label}
          </h1>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 self-center sm:self-auto text-right">
          <span>
            Step <strong className="text-slate-900 dark:text-slate-200">{currentStep}</strong> of {DOCTOR_STEPS.length}
          </span>
          <div className="w-32 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className="bg-emerald-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / DOCTOR_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stepper Navigation */}
      <div className="mb-8 bg-white dark:bg-[#0E1A2D] rounded-2xl p-4 border border-slate-200 dark:border-[#1E2E47] shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md font-semibold text-[11px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40">
              {stepMeta.phase}
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {stepMeta.label}
            </span>
          </div>
          <span className="text-slate-400 dark:text-slate-500 font-medium text-[11px]">
            {Math.round((currentStep / DOCTOR_STEPS.length) * 100)}% Complete
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {DOCTOR_STEPS.map((st) => {
            const Icon = st.icon;
            const isCompleted = currentStep > st.id;
            const isCurrent = currentStep === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  if (st.id < currentStep) setCurrentStep(st.id);
                }}
                disabled={st.id > currentStep}
                className={`flex flex-col items-center p-2 rounded-xl text-center transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold'
                    : isCompleted
                    ? 'bg-slate-50 dark:bg-slate-800/40 text-emerald-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    : 'opacity-40 cursor-not-allowed text-slate-400'
                }`}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-1 text-xs">
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="text-[11px] truncate w-full">{st.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* General Error Banner */}
      {generalError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{generalError}</span>
        </div>
      )}

      {/* FORM BODY */}
      <div className="bg-white dark:bg-[#0E1A2D] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#1E2E47] shadow-xs">
        {/* STEP 1: Clinical Account & Identity */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
                Create Your Clinician Portal Account
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Access structured intake briefs, preliminary triage queues, and the AI Clinical Copilot.
              </p>
            </div>

            {/* Quick Google Sign In */}
            <div>
              <GoogleLoginButton
                onClick={handleGoogleSignup}
                isLoading={isGoogleLoading}
                text="Continue with Google Workspace for Healthcare"
              />
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <span className="relative px-3 bg-white dark:bg-[#0E1A2D] text-[11px] font-mono text-slate-400 uppercase">
                  Or register with clinical credentials below
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Prefix
                </label>
                <select
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-[#15233C] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="Dr.">Dr.</option>
                  <option value="Prof. Dr.">Prof. Dr.</option>
                  <option value="Assoc. Prof.">Assoc. Prof.</option>
                  <option value="Resident Physician">Resident</option>
                  <option value="Fellow">Fellow</option>
                </select>
              </div>

              <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full text-xs p-3 bg-slate-50 dark:bg-[#15233C] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                  {errors.firstName && <span className="text-rose-500 text-[11px] mt-1">{errors.firstName}</span>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chen"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full text-xs p-3 bg-slate-50 dark:bg-[#15233C] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                  {errors.lastName && <span className="text-rose-500 text-[11px] mt-1">{errors.lastName}</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Institutional / Practice Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. dr.chen@hospital.org"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-[#15233C] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
                {errors.email && <span className="text-rose-500 text-[11px] mt-1">{errors.email}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Clinical Practice Phone
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 234-5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-[#15233C] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Password Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Secure Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full text-xs p-3 pr-10 bg-slate-50 dark:bg-[#15233C] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <span className="text-rose-500 text-[11px] mt-1">{errors.password}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full text-xs p-3 pr-10 bg-slate-50 dark:bg-[#15233C] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                {errors.confirmPassword && (
                  <span className="text-rose-500 text-[11px] mt-1">{errors.confirmPassword}</span>
                )}
              </div>
            </div>

            {/* Password strength & requirements checklist - Full Size */}
            {formData.password && (
              <div className="w-full p-4 bg-slate-50 dark:bg-[#15233C] rounded-2xl border border-slate-200 dark:border-slate-700 text-xs shadow-2xs">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                    Password Strength:
                  </span>
                  <span
                    className={`font-bold capitalize text-xs ${
                      passwordStrength === 'strong'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : passwordStrength === 'fair'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {passwordStrength}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${passwordCriteria.minLength ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'}`}
                    />
                    <span>8+ characters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${passwordCriteria.hasUppercase ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'}`}
                    />
                    <span>Uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${passwordCriteria.hasNumber ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'}`}
                    />
                    <span>One number</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${passwordCriteria.hasSpecial ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'}`}
                    />
                    <span>Special character</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Medical Licensing & Qualifications */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
                Medical Licensing &amp; Credentials
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your medical council registration details for preliminary clinician credentialing verification.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Medical Registration / License Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. MCI-2018-84291 or State Council Reg."
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-[#15233C] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                />
                {errors.licenseNumber && (
                  <span className="text-rose-500 text-[11px] mt-1">{errors.licenseNumber}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Licensing Medical Board / Council
                </label>
                <input
                  type="text"
                  value={formData.licensingBoard}
                  onChange={(e) => setFormData({ ...formData, licensingBoard: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-[#15233C] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Medical Specialty <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.primarySpecialty}
                  onChange={(e) => setFormData({ ...formData, primarySpecialty: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-[#15233C] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  {MEDICAL_SPECIALTIES.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sub-Specialty / Clinical Interest
                </label>
                <input
                  type="text"
                  placeholder="e.g. Preventive Cardiology, Heart Failure"
                  value={formData.subSpecialty}
                  onChange={(e) => setFormData({ ...formData, subSpecialty: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-[#15233C] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Qualification Degree
                </label>
                <select
                  value={formData.primaryDegree}
                  onChange={(e) => setFormData({ ...formData, primaryDegree: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-[#15233C] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  {MEDICAL_DEGREES.map((deg) => (
                    <option key={deg} value={deg}>
                      {deg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Medical College / Institution
                </label>
                <input
                  type="text"
                  placeholder="e.g. All India Institute of Medical Sciences"
                  value={formData.medicalSchool}
                  onChange={(e) => setFormData({ ...formData, medicalSchool: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-[#15233C] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Clinical Experience
                </label>
                <select
                  value={formData.yearsExperience}
                  onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-[#15233C] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="1-3">1 - 3 years</option>
                  <option value="3-5">3 - 5 years</option>
                  <option value="5-10">5 - 10 years</option>
                  <option value="10-15">10 - 15 years</option>
                  <option value="15+">15+ years</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Hospital & Practice Affiliation */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
                Clinical Practice &amp; Hospital Affiliation
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Tell us where you actively examine and triage patients.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Hospital / Health System / Clinic <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. City Care Memorial Hospital"
                  value={formData.hospitalName}
                  onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-[#15233C] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
                {errors.hospitalName && (
                  <span className="text-rose-500 text-[11px] mt-1">{errors.hospitalName}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department / Ward / Clinical Unit
                </label>
                <input
                  type="text"
                  placeholder="e.g. Department of Cardiology / OPD"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-[#15233C] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Clinical Setting Type
              </label>
              <select
                value={formData.practiceType}
                onChange={(e) => setFormData({ ...formData, practiceType: e.target.value })}
                className="w-full text-xs p-3 bg-slate-50 dark:bg-[#15233C] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                {PRACTICE_TYPES.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Practice City <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. New Delhi / New York"
                  value={formData.practiceCity}
                  onChange={(e) => setFormData({ ...formData, practiceCity: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-[#15233C] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
                {errors.practiceCity && (
                  <span className="text-rose-500 text-[11px] mt-1">{errors.practiceCity}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  State / Region
                </label>
                <input
                  type="text"
                  placeholder="State / Province"
                  value={formData.practiceState}
                  onChange={(e) => setFormData({ ...formData, practiceState: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-[#15233C] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Postal / ZIP Code
                </label>
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={formData.practicePincode}
                  onChange={(e) => setFormData({ ...formData, practicePincode: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-[#15233C] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Clinical Workflow & Telehealth */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
                Clinical Workflow &amp; Consultation Preferences
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Configure how patient briefs, triage scores, and AI Copilot summaries appear in your queue.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Supported Clinical Modalities <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'in_person', title: 'In-Person Examination', desc: 'Pre-encounter 1-page SBAR handoff briefs for outpatient rooms' },
                  { id: 'video_emr', title: 'Video Teleconsultation', desc: 'Live video with instant symptom breakdown and telemetry feed' },
                  { id: 'sbar_review', title: 'Asynchronous Chart Review', desc: 'Preliminary triage queue review before appointments' },
                  { id: 'ai_triage', title: 'Urgent Triage Escalations', desc: 'Direct red-flag alert notifications for acute complaints' }
                ].map((mod) => {
                  const isChecked = formData.modalities.includes(mod.id);
                  return (
                    <div
                      key={mod.id}
                      onClick={() => {
                        const updated = isChecked
                          ? formData.modalities.filter((m) => m !== mod.id)
                          : [...formData.modalities, mod.id];
                        setFormData({ ...formData, modalities: updated });
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="text-xs font-bold">{mod.title}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{mod.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {errors.modalities && <span className="text-rose-500 text-[11px] mt-1">{errors.modalities}</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  EHR / EMR Interoperability Standard
                </label>
                <select
                  value={formData.emrSystem}
                  onChange={(e) => setFormData({ ...formData, emrSystem: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-[#15233C] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="MedicalAI Native & FHIR Standard">MedicalAI Native (FHIR JSON R4)</option>
                  <option value="Epic Systems Interconnect">Epic Systems Interconnect</option>
                  <option value="Cerner / Oracle Health Millennium">Cerner / Oracle Health</option>
                  <option value="AthenaHealth Open API">AthenaHealth Platform</option>
                  <option value="Direct PDF / SBAR Export Only">Direct PDF / SBAR Export Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Typical Daily Patient Encounters
                </label>
                <select
                  value={formData.patientVolumeDaily}
                  onChange={(e) => setFormData({ ...formData, patientVolumeDaily: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-[#15233C] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="1-10 Patients">1 - 10 Patients / day</option>
                  <option value="10-25 Patients">10 - 25 Patients / day</option>
                  <option value="25-50 Patients">25 - 50 Patients / day</option>
                  <option value="50+ Patients">50+ Patients / day (High Volume Clinic)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Ethics & Governance Compliance */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
                Clinical Governance &amp; Regulatory Consent
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Please review and attest to our physician conduct, patient privacy, and responsible AI protocols.
              </p>
            </div>

            <div className="space-y-3.5">
              {[
                {
                  key: 'agreedTelemedicineGuidelines',
                  title: 'Telemedicine Practice Guidelines Compliance',
                  desc: 'I certify that I am legally licensed to practice medicine in my jurisdiction and adhere to formal Telemedicine Practice Guidelines and medical board standards.'
                },
                {
                  key: 'agreedHipaaNdhmPrivacy',
                  title: 'Health Data Sovereignty & Confidentiality Pledge',
                  desc: 'I agree to uphold strict patient confidentiality under applicable privacy standards (HIPAA / NDHM / GDPR). Patient data received via QR or referral will remain confidential.'
                },
                {
                  key: 'agreedAiCopilotOversight',
                  title: 'Clinical Autonomy & AI Copilot Responsibility Attestation',
                  desc: 'I acknowledge that MedicalAI provides supportive clinical intelligence and preliminary triage assessments. As the licensed clinician, I retain ultimate diagnostic and therapeutic judgment for all patient decisions.'
                },
                {
                  key: 'agreedTermsAndDisclaimer',
                  title: 'MedicalAI Institutional Terms of Service Acceptance',
                  desc: 'I have read and accepted the MedicalAI Professional Platform Terms of Service and Medical Disclaimer.'
                }
              ].map((item) => {
                const checked = formData[item.key as keyof typeof formData] as boolean;
                return (
                  <label
                    key={item.key}
                    className={`p-4 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                      checked
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-slate-100'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [item.key]: e.target.checked
                        })
                      }
                      className="mt-1 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {item.desc}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            {Object.keys(errors).length > 0 && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Please complete all regulatory consent attestations before submitting.</span>
              </div>
            )}
          </div>
        )}

        {/* STEP 6: Review Credentials & Activate */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
                Review &amp; Submit Clinician Application
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Please verify your clinician credentials before final activation.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-lg">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {formData.title} {formData.firstName} {formData.lastName}
                  </h3>
                  <div className="text-xs text-slate-500 font-mono">
                    {formData.primarySpecialty} · {formData.primaryDegree}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">License / Registration ID:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{formData.licenseNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Licensing Council:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formData.licensingBoard}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Hospital Affiliation:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formData.hospitalName} ({formData.department})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Practice City:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formData.practiceCity}, {formData.practiceState}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Institutional Email:</span>
                  <span className="font-mono text-slate-900 dark:text-white">{formData.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">EMR Standard:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formData.emrSystem}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Instant Clinician Activation:</strong> Submitting will create your verified doctor profile, attach your specialty, and immediately redirect you to the Doctor Clinical Dashboard with full copilot access.
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM NAVIGATION CONTROLS */}
        <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < DOCTOR_STEPS.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-[#1769AA] hover:bg-[#102A43] active:bg-[#0B1320] text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/15 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Continue to {DOCTOR_STEPS[currentStep].title}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Activating Clinician Credentials...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit &amp; Activate Clinician Account</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <GoogleAccountChooserModal
        isOpen={isChooserOpen}
        onClose={() => setIsChooserOpen(false)}
        onSelectAccount={handleSelectGoogleAccount}
      />
    </div>
  );
};
