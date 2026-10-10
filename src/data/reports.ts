import { LabResultItem } from '../types';

export const DEMO_CBC_REPORT: {
  reportTitle: string;
  patientDemoId: string;
  collectionDate: string;
  laboratory: string;
  specimenType: string;
  summaryObservation: string;
  results: LabResultItem[];
} = {
  reportTitle: 'Complete Blood Count (CBC) with Differential',
  patientDemoId: 'MED-DEMO-8042',
  collectionDate: 'October 04, 2026',
  laboratory: 'Metro Clinical Reference Diagnostics [Demonstration Record]',
  specimenType: 'Whole Blood (EDTA)',
  summaryObservation:
    'RBC count and hemoglobin values fall comfortably within typical biological reference intervals. Mild relative lymphocytosis observed; platelet count is well-preserved without microcytic indicators.',
  results: [
    {
      testName: 'Hemoglobin (Hgb)',
      code: '718-7',
      value: '13.8',
      unit: 'g/dL',
      referenceRange: '12.0 – 16.0',
      status: 'normal',
      explanation: 'Oxygen-carrying protein in red blood cells. Normal level indicates adequate oxygen delivery capacity throughout biological tissues.'
    },
    {
      testName: 'White Blood Cell Count (WBC)',
      code: '6690-2',
      value: '7.4',
      unit: '×10⁹/L',
      referenceRange: '4.5 – 11.0',
      status: 'normal',
      explanation: 'Primary immune cellular response count. Value is balanced, with no elevated leukocytosis suggesting an active acute bacterial infection.'
    },
    {
      testName: 'Platelets (PLT)',
      code: '777-3',
      value: '245',
      unit: '×10⁹/L',
      referenceRange: '150 – 450',
      status: 'normal',
      explanation: 'Cell fragments responsible for blood clotting. Optimal range indicates stable hemostatic ability without thrombocytopenia.'
    },
    {
      testName: 'Mean Corpuscular Volume (MCV)',
      code: '787-2',
      value: '89.2',
      unit: 'fL',
      referenceRange: '80.0 – 100.0',
      status: 'normal',
      explanation: 'Average physical volume of red blood cells. Normal volume indicates normocytic red blood cell morphology.'
    },
    {
      testName: 'Fasting Serum Glucose',
      code: '2345-7',
      value: '104',
      unit: 'mg/dL',
      referenceRange: '70 – 99',
      status: 'attention',
      explanation: 'Mild elevation above normal fasting threshold (99 mg/dL). Clinician may suggest a confirmatory HbA1c screening or dietary review.'
    },
    {
      testName: 'Serum Ferritin',
      code: '2276-4',
      value: '48',
      unit: 'ng/mL',
      referenceRange: '20 – 250',
      status: 'normal',
      explanation: 'Stored iron reserves in tissue. Value demonstrates sufficient internal iron reserves with no depletion.'
    }
  ]
};
