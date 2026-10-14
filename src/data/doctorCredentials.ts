/**
 * Medical AI — Clinician & Doctor Login Credentials
 * Authoritative demo and test accounts for clinical triage, EMR handoffs, and physician workflows.
 */

import { User } from '../types';

export interface DoctorCredentialItem {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'doctor';
  specialty: string;
  department: string;
  hospitalAffiliation: string;
  npi: string;
  licenseNumber: string;
  phone: string;
  avatarUrl?: string;
  badge: string;
  description: string;
}

export const DOCTOR_CREDENTIALS: DoctorCredentialItem[] = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Chen, MD',
    email: 's.chen@metrohealth.org',
    password: 'Password@123',
    role: 'doctor',
    specialty: 'Internal Medicine & Cardiopulmonary Triage',
    department: 'Cardiopulmonary & Internal Medicine',
    hospitalAffiliation: 'Metro Clinical Reference Center',
    npi: '1942850192',
    licenseNumber: 'MD-748291',
    phone: '+1 (555) 720-4491',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256',
    badge: 'Chief of Triage',
    description: 'Internal Medicine attending specializing in rapid acuity classification and acute cardiopulmonary telemetry.'
  },
  {
    id: 'doc-2',
    name: 'Dr. Marcus Vance, MD, FACC',
    email: 'm.vance@cardiohealth.org',
    password: 'CardioPass#2026',
    role: 'doctor',
    specialty: 'Interventional Cardiology & Resuscitation',
    department: 'Cardiovascular Institute & Cath Lab',
    hospitalAffiliation: 'St. Jude Heart & Vascular Center',
    npi: '1048295173',
    licenseNumber: 'MD-892144',
    phone: '+1 (555) 720-4492',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=256',
    badge: 'Cardiology Lead',
    description: 'Fellow of American College of Cardiology. Directs STEMI alerts and catheterization laboratory triage.'
  },
  {
    id: 'doc-3',
    name: 'Dr. Ananya Roy, MD, FAAP',
    email: 'a.roy@childrensmed.org',
    password: 'Pediatrics#2026',
    role: 'doctor',
    specialty: 'Pediatric Emergency Medicine & Neonatology',
    department: 'Pediatric Emergency & NICU',
    hospitalAffiliation: 'National Children\'s Medical Center',
    npi: '1837492015',
    licenseNumber: 'MD-631092',
    phone: '+1 (555) 720-4493',
    avatarUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=600',
    badge: 'Pediatrics Attending',
    description: 'Board certified in Pediatric Emergency Medicine with emphasis on neonatology and pediatric vitals tracking.'
  },
  {
    id: 'doc-4',
    name: 'Dr. Vikram Patel, MS, FRCS',
    email: 'v.patel@traumaortho.org',
    password: 'Surgical#2026',
    role: 'doctor',
    specialty: 'Orthopedic Trauma & Spine Surgery',
    department: 'Orthopedic Surgery & Trauma Center',
    hospitalAffiliation: 'Apollo Level-1 Regional Trauma Hospital',
    npi: '1729384756',
    licenseNumber: 'MS-482019',
    phone: '+1 (555) 720-4494',
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=256',
    badge: 'Trauma Surgeon',
    description: 'Consultant Orthopedic Surgeon managing poly-trauma stabilization, arthroplasty, and fracture reductions.'
  },
  {
    id: 'doc-5',
    name: 'Dr. Elena Rostova, MD, PhD',
    email: 'e.rostova@neuroscience.org',
    password: 'Neuro#2026!',
    role: 'doctor',
    specialty: 'Neurology & Neurocritical Care',
    department: 'Comprehensive Stroke & Neuro ICU',
    hospitalAffiliation: 'Global Neurological Institute',
    npi: '1658492031',
    licenseNumber: 'MD-918234',
    phone: '+1 (555) 720-4495',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256',
    badge: 'Stroke Neurologist',
    description: 'Neurocritical care physician leading rapid Code Stroke interventions, neuroimaging analysis, and EEG triage.'
  },
  {
    id: 'doc-6',
    name: 'Dr. Emily Adams, DO, FACEP',
    email: 'e.adams@bayfronthealth.org',
    password: 'Emergency#2026',
    role: 'doctor',
    specialty: 'Emergency Medicine & Disaster Preparedness',
    department: 'Acute Care & Emergency Department',
    hospitalAffiliation: 'Bayfront Emergency Pavilion',
    npi: '1429853018',
    licenseNumber: 'DO-582914',
    phone: '+1 (555) 720-4496',
    avatarUrl: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=256',
    badge: 'ED Attending',
    description: 'Fellow of American College of Emergency Physicians managing mass-casualty triage and rapid clinical stabilization.'
  }
];

/**
 * Finds a doctor by email (case-insensitive) or by ID.
 */
export function findDoctorCredential(identifier: string): DoctorCredentialItem | undefined {
  if (!identifier) return undefined;
  const lower = identifier.trim().toLowerCase();
  return DOCTOR_CREDENTIALS.find(
    (doc) => doc.email.toLowerCase() === lower || doc.id.toLowerCase() === lower
  );
}

/**
 * Converts a DoctorCredentialItem into a full User model.
 */
export function doctorCredentialToUser(cred: DoctorCredentialItem): User {
  return {
    id: cred.id,
    name: cred.name,
    email: cred.email,
    role: 'doctor',
    clinicianRole: 'doctor',
    specialty: cred.specialty,
    department: cred.department,
    hospitalAffiliation: cred.hospitalAffiliation,
    npi: cred.npi,
    licenseNumber: cred.licenseNumber,
    phone: cred.phone,
    profileImageUrl: cred.avatarUrl,
    avatarUrl: cred.avatarUrl,
    workingStatus: 'on_duty'
  };
}
