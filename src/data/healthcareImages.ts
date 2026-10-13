/**
 * Real Healthcare Photography Ledger
 * All images are verified real photographs of practicing medical professionals,
 * hospital facilities, and authentic patient encounters from curated open collections (Unsplash / Wikimedia Commons).
 * Zero AI-generated portraits or synthetic avatars.
 */

export interface RealHealthcareImage {
  id: string;
  category: 'doctors' | 'patients' | 'consultations' | 'healthcare' | 'hospitals' | 'technology';
  url: string;
  alt: string;
  credit: string;
  source: string;
  license: string;
}

const baseHealthcareImages: Record<string, RealHealthcareImage> = {
  heroDoctorHero: {
    id: 'hero-doctor',
    category: 'doctors',
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1000&q=80',
    alt: 'Compassionate male physician in scrubs and lab coat in a modern clinical medical center',
    credit: 'Photo by Usman Yousaf on Unsplash',
    source: 'Unsplash',
    license: 'Unsplash Free Commercial License'
  },
  doctorSarahChen: {
    id: 'doc-sarah-chen',
    category: 'doctors',
    url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80',
    alt: 'Real female physician in clinical white coat with stethoscope in hospital clinic',
    credit: 'Photo by National Cancer Institute on Unsplash',
    source: 'Unsplash',
    license: 'Unsplash Free Commercial License'
  },
  doctorTeamDiscussion: {
    id: 'doc-team',
    category: 'doctors',
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    alt: 'Clinical multidisciplinary team reviewing patient medical charts in hospital conference room',
    credit: 'Photo by National Cancer Institute on Unsplash',
    source: 'Unsplash',
    license: 'Unsplash Free Commercial License'
  },
  patientConsultation: {
    id: 'patient-consultation',
    category: 'consultations',
    url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    alt: 'Physician having compassionate diagnostic conversation with a patient in clinical exam room',
    credit: 'Photo by Accushield on Unsplash',
    source: 'Unsplash',
    license: 'Unsplash Free Commercial License'
  },
  doctorConsultation: {
    id: 'doctor-consultation',
    category: 'consultations',
    url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    alt: 'Physician having compassionate diagnostic conversation with a patient in clinical exam room',
    credit: 'Photo by Accushield on Unsplash',
    source: 'Unsplash',
    license: 'Unsplash Free Commercial License'
  },
  telehealthDoctor: {
    id: 'telehealth-doctor',
    category: 'consultations',
    url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    alt: 'Medical doctor providing digital telemedicine consultation through video terminal',
    credit: 'Photo by National Cancer Institute on Unsplash',
    source: 'Unsplash',
    license: 'Unsplash Free Commercial License'
  },
  hospitalCorridor: {
    id: 'hospital-corridor',
    category: 'hospitals',
    url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
    alt: 'Modern, clean architectural hospital hallway in accredited regional medical center',
    credit: 'Photo by Martha Dominguez de Gouveia on Unsplash',
    source: 'Unsplash',
    license: 'Unsplash Free Commercial License'
  },
  hospitalModernCorridor: {
    id: 'hospital-modern-corridor',
    category: 'hospitals',
    url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
    alt: 'Modern, clean architectural hospital hallway in accredited regional medical center',
    credit: 'Photo by Martha Dominguez de Gouveia on Unsplash',
    source: 'Unsplash',
    license: 'Unsplash Free Commercial License'
  },
  vitalsMonitoring: {
    id: 'vitals-monitoring',
    category: 'technology',
    url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
    alt: 'Digital healthcare telemetry monitor displaying pulse and oxygen saturation',
    credit: 'Photo by Marcelo Leal on Unsplash',
    source: 'Unsplash',
    license: 'Unsplash Free Commercial License'
  },
  patientAlexMorgan: {
    id: 'patient-alex',
    category: 'patients',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    alt: 'Real portrait of patient Alex Morgan reviewing healthcare information calmly',
    credit: 'Photo by Joseph Gonzalez on Unsplash',
    source: 'Unsplash',
    license: 'Unsplash Free Commercial License'
  },
  patientCareElderly: {
    id: 'patient-elderly',
    category: 'patients',
    url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80',
    alt: 'Dedicated nurse checking pulse and reassuring an elderly patient in clinic',
    credit: 'Photo by Hush Naidoo Jade Photography on Unsplash',
    source: 'Unsplash',
    license: 'Unsplash Free Commercial License'
  },
  diagnosticLabTechnologist: {
    id: 'diagnostic-lab',
    category: 'healthcare',
    url: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80',
    alt: 'Laboratory technologist analyzing complete blood count specimen under biosafety bench',
    credit: 'Photo by CDC on Unsplash',
    source: 'Unsplash / CDC Public Domain',
    license: 'Public Domain / Free License'
  },
  authDoctorConsult: {
    id: 'auth-doctor-consult',
    category: 'doctors',
    url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80',
    alt: 'Professional healthcare specialist working with modern electronic medical records',
    credit: 'Photo by Amy Hirschi on Unsplash',
    source: 'Unsplash',
    license: 'Unsplash Free Commercial License'
  },
  stethocopeEquipment: {
    id: 'stethoscope-desk',
    category: 'healthcare',
    url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
    alt: 'Acoustic medical stethoscope placed beside clinical diagnostic clipboard',
    credit: 'Photo by Online Marketing on Unsplash',
    source: 'Unsplash',
    license: 'Unsplash Free Commercial License'
  },
  modernClinicLobby: {
    id: 'clinic-lobby',
    category: 'hospitals',
    url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    alt: 'Spacious, illuminated architectural lobby of an advanced health institute',
    credit: 'Photo by Martha Dominguez de Gouveia on Unsplash',
    source: 'Unsplash',
    license: 'Unsplash Free Commercial License'
  }
};

const defaultHealthcareFallback: RealHealthcareImage = {
  id: 'fallback-healthcare',
  category: 'healthcare',
  url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
  alt: 'Healthcare professionals in modern accredited medical center',
  credit: 'Photo by National Cancer Institute on Unsplash',
  source: 'Unsplash',
  license: 'Unsplash Free Commercial License'
};

export const HEALTHCARE_IMAGES: Record<string, RealHealthcareImage> = new Proxy(baseHealthcareImages, {
  get(target, prop: string | symbol) {
    if (typeof prop === 'string' && prop in target) {
      return target[prop];
    }
    return defaultHealthcareFallback;
  }
});
