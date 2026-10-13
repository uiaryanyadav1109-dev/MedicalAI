import { FaqItem } from '../types';

export const FAQ_DATA: FaqItem[] = [
  {
    category: 'general',
    question: 'What is Medical AI?',
    answer:
      'Medical AI is a digital health assistant that helps you understand symptoms, organize lab reports, and prepare structured summaries for consultations.'
  },
  {
    category: 'safety',
    question: 'Is Medical AI a doctor?',
    answer:
      'No. Medical AI is an educational and organizational tool, not a licensed healthcare provider.'
  },
  {
    category: 'safety',
    question: 'Can Medical AI diagnose me?',
    answer:
      'No. The platform offers preliminary educational guidance only. Definitive diagnosis requires evaluation by a licensed physician.'
  },
  {
    category: 'safety',
    question: 'How does emergency detection work?',
    answer:
      'The system continuously checks for acute red flags, instantly halting triage to direct you to local emergency medical services.'
  },
  {
    category: 'features',
    question: 'Can I upload medical reports?',
    answer:
      'Yes. You can upload lab panels and diagnostic summaries for plain-language explanations, normal reference ranges, and suggested doctor questions.'
  },
  {
    category: 'features',
    question: 'Can I use voice interaction?',
    answer:
      'Yes. Medical AI supports optional voice interaction in English, Hindi, and Bengali with clear microphone privacy controls.'
  },
  {
    category: 'features',
    question: 'What languages are supported?',
    answer:
      'Conversational intake and guidance are available in English, Hindi (हिंदी), and Bengali (বাংলা).'
  },
  {
    category: 'clinical',
    question: 'Can I share my records with a doctor?',
    answer:
      'Yes. You can generate a 1-page SBAR clinical summary or time-limited QR code for quick check-in with your provider.'
  },
  {
    category: 'privacy',
    question: 'How does QR sharing work?',
    answer:
      'QR codes use temporary, encrypted tokens granting access only to records you select. You can revoke access at any time with one tap.'
  },
  {
    category: 'privacy',
    question: 'How is my data protected?',
    answer:
      'All data is encrypted in transit and at rest with strict role-based access controls and audit logging. We never sell or broker your personal health information.'
  },
  {
    category: 'safety',
    question: 'Does Medical AI prescribe medication?',
    answer:
      'No. Medical AI does not prescribe pharmaceuticals. It provides tracking and reminder schedules for medications prescribed by your physician.'
  },
  {
    category: 'safety',
    question: 'What should I do in an emergency?',
    answer:
      'Call your local emergency services (112 / 911) or proceed immediately to the nearest emergency department. Do not rely on software during acute medical emergencies.'
  }
];
