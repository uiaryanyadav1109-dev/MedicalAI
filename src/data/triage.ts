import { TriageLevelInfo } from '../types';

export const TRIAGE_LEVELS: TriageLevelInfo[] = [
  {
    id: 'emergency',
    name: 'Emergency Response',
    timeframe: 'Immediate (< 15 mins)',
    badgeColor: 'border-rose-200 bg-rose-50 text-rose-800',
    description: 'Life-threatening or rapidly deteriorating conditions with systemic compromise.',
    actionGuidance: 'Call local emergency services immediately or proceed to the nearest emergency department. Do not drive yourself.',
    exampleScenarios: [
      'Sudden severe chest pressure radiating to arm or jaw',
      'Sudden unilateral facial droop, slurred speech, or weakness',
      'Acute severe respiratory distress or cyanosis'
    ]
  },
  {
    id: 'urgent',
    name: 'Urgent Care',
    timeframe: 'Within 2–4 hours',
    badgeColor: 'border-amber-200 bg-amber-50 text-amber-800',
    description: 'Acute symptoms requiring clinical intervention today to prevent escalation.',
    actionGuidance: 'Visit an urgent care center or same-day clinical facility. Contact your primary clinic on-call line.',
    exampleScenarios: [
      'High fever refractory to medication with severe rigors',
      'Suspected acute deep laceration or closed fracture',
      'Acute intractable vomiting with signs of early dehydration'
    ]
  },
  {
    id: 'prompt_evaluation',
    name: 'Prompt Evaluation',
    timeframe: 'Within 24–48 hours',
    badgeColor: 'border-blue-200 bg-blue-50 text-blue-800',
    description: 'Persistent, noticeable symptoms that warrant timely professional diagnosis and physical exam.',
    actionGuidance: 'Schedule an expedited consultation with your primary physician or community care practitioner.',
    exampleScenarios: [
      'Productive cough lingering past 7 days with localized pleuritic discomfort',
      'Persistent moderate dysuria with low-grade pyrexia',
      'New, persistent skin rash accompanied by localized pruritus'
    ]
  },
  {
    id: 'routine',
    name: 'Routine Consultation',
    timeframe: 'Within 1–2 weeks',
    badgeColor: 'border-slate-200 bg-slate-50 text-slate-800',
    description: 'Stable chronic symptom check-ins, routine medication reviews, or scheduled screening follow-ups.',
    actionGuidance: 'Book standard clinic appointment during routine office hours. Prepare a structured Medical AI handoff note.',
    exampleScenarios: [
      'Quarterly review of established, controlled hypertension',
      'Annual preventive health check-up preparation',
      'Non-urgent lab follow-up for stable routine lipid panels'
    ]
  },
  {
    id: 'monitor_self_care',
    name: 'Monitor & Supportive Care',
    timeframe: 'Ongoing observation',
    badgeColor: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    description: 'Mild, self-limiting symptoms with zero red flag indicators, appropriate for active symptom tracking.',
    actionGuidance: 'Hydration, supportive rest, symptom tracking in your Health Timeline. Re-evaluate if symptoms persist or escalate.',
    exampleScenarios: [
      'Mild tension headache after screen fatigue responding to hydration',
      'Transient muscle soreness after known physical exertion',
      'Mild seasonal rhinorrhea without fever or sinus pain'
    ]
  }
];
