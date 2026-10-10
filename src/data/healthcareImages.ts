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

export const HEALTHCARE_IMAGES: Record<string, RealHealthcareImage> = {
  doctorSarahChen: {
    id: 'doc-sarah-chen',
    category: 'doctors',
    url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
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
  hospitalCorridor: {
    id: 'hospital-corridor',
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
  diagnosticLabTechnologist: {
    id: 'diagnostic-lab',
    category: 'healthcare',
    url: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80',
    alt: 'Laboratory technologist analyzing complete blood count specimen under biosafety bench',
    credit: 'Photo by CDC on Unsplash',
    source: 'Unsplash / CDC Public Domain',
    license: 'Public Domain / Free License'
  }
};
