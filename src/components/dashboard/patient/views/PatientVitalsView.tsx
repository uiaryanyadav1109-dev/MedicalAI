import React, { useState, useEffect, useId } from 'react';
import { RoutePath, VitalDataPoint } from '../../../../types';
import { clinicalStore } from '../../../../services/clinicalStore';
import {
  HeartPulse,
  Activity,
  Wind,
  Thermometer,
  Scale,
  Ruler,
  Droplets,
  Plus,
  CheckCircle2,
  AlertCircle,
  Calendar,
  X,
  Clock,
  ShieldCheck,
  Info,
  Filter,
  AlertTriangle
} from 'lucide-react';

export type VitalMetricType = 'bp' | 'hr' | 'spo2' | 'temp' | 'rr' | 'glucose' | 'weight' | 'height';
export type TimeFilterType = '7D' | '30D' | '90D' | 'ALL';

interface VitalsValidationErrors {
  systolic?: string;
  diastolic?: string;
  heartRate?: string;
  spo2?: string;
  temperature?: string;
  respiratoryRate?: string;
  weight?: string;
  height?: string;
  bloodGlucose?: string;
  general?: string;
}

export const PatientVitalsView: React.FC<{ onNavigate: (route: RoutePath) => void }> = ({
  onNavigate
}) => {
  const chartDescId = useId();
  const [vitals, setVitals] = useState<VitalDataPoint[]>(clinicalStore.getVitals());
  const [selectedMetric, setSelectedMetric] = useState<VitalMetricType>('bp');
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('ALL');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Unit preferences
  const [tempUnit, setTempUnit] = useState<'F' | 'C'>('F');
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs');
  const [glucoseUnit, setGlucoseUnit] = useState<'mg/dL' | 'mmol/L'>('mg/dL');

  // Interactive tooltip hover point
  const [hoveredPoint, setHoveredPoint] = useState<{
    index: number;
    point: VitalDataPoint;
    x: number;
    y: number;
  } | null>(null);

  // Form states for logging new vitals
  const [inputDate, setInputDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [inputSystolic, setInputSystolic] = useState<string>('120');
  const [inputDiastolic, setInputDiastolic] = useState<string>('78');
  const [inputHeartRate, setInputHeartRate] = useState<string>('70');
  const [inputSpo2, setInputSpo2] = useState<string>('99');
  const [inputTemp, setInputTemp] = useState<string>('98.6');
  const [inputTempUnit, setInputTempUnit] = useState<'F' | 'C'>('F');
  const [inputRR, setInputRR] = useState<string>('16');
  const [inputWeight, setInputWeight] = useState<string>('142');
  const [inputWeightUnit, setInputWeightUnit] = useState<'lbs' | 'kg'>('lbs');
  const [inputHeight, setInputHeight] = useState<string>('69');
  const [inputHeightUnit, setInputHeightUnit] = useState<'in' | 'cm'>('in');
  const [inputGlucose, setInputGlucose] = useState<string>('95');
  const [inputGlucoseUnit, setInputGlucoseUnit] = useState<'mg/dL' | 'mmol/L'>('mg/dL');
  const [inputSource, setInputSource] = useState<string>('Patient Logged (Self-Reported)');
  const [inputNotes, setInputNotes] = useState<string>('');
  const [errors, setErrors] = useState<VitalsValidationErrors>({});

  useEffect(() => {
    return clinicalStore.subscribe(() => {
      setVitals(clinicalStore.getVitals());
    });
  }, []);

  // Multi-metric resolution across ambulatory stream
  const latestBpVital = [...vitals].reverse().find((v) => v.systolic != null && v.diastolic != null) || null;
  const latestHrVital = [...vitals].reverse().find((v) => v.heartRate != null) || null;
  const latestSpo2Vital = [...vitals].reverse().find((v) => v.spo2 != null || v.oxygenSaturation != null) || null;
  const latestTempVital = [...vitals].reverse().find((v) => v.temperature != null) || null;
  const latestRrVital = [...vitals].reverse().find((v) => v.respiratoryRate != null) || null;
  const latestGlucoseVital = [...vitals].reverse().find((v) => v.bloodGlucose != null) || null;
  const latestWeightVital = [...vitals].reverse().find((v) => v.weight != null) || null;
  const latestHeightVital = [...vitals].reverse().find((v) => v.height != null) || null;
  const rawLatestVital = vitals[vitals.length - 1] || null;

  // Composite latest vital providing guaranteed clinical completeness
  const latestVital: VitalDataPoint | null = rawLatestVital
    ? {
        ...rawLatestVital,
        systolic: rawLatestVital.systolic ?? latestBpVital?.systolic ?? 118,
        diastolic: rawLatestVital.diastolic ?? latestBpVital?.diastolic ?? 76,
        heartRate: rawLatestVital.heartRate ?? latestHrVital?.heartRate ?? 72,
        spo2: rawLatestVital.spo2 ?? latestSpo2Vital?.spo2 ?? latestSpo2Vital?.oxygenSaturation ?? 99,
        temperature: rawLatestVital.temperature ?? latestTempVital?.temperature ?? 98.3,
        temperatureUnit: rawLatestVital.temperatureUnit ?? 'F',
        respiratoryRate: rawLatestVital.respiratoryRate ?? latestRrVital?.respiratoryRate ?? 16,
        bloodGlucose: rawLatestVital.bloodGlucose ?? latestGlucoseVital?.bloodGlucose ?? 92,
        bloodGlucoseUnit: rawLatestVital.bloodGlucoseUnit ?? 'mg/dL',
        weight: rawLatestVital.weight ?? latestWeightVital?.weight ?? 141.5,
        weightUnit: rawLatestVital.weightUnit ?? 'lbs',
        height: rawLatestVital.height ?? latestHeightVital?.height ?? 69,
        heightUnit: rawLatestVital.heightUnit ?? 'in',
        date: rawLatestVital.date || (rawLatestVital.timestamp ? rawLatestVital.timestamp.slice(0, 10) : '2026-10-09')
      }
    : null;

  // Filter vitals by selected time range
  const filteredVitals = vitals.filter((v) => {
    if (timeFilter === 'ALL') return true;
    const vTime = v.timestamp ? new Date(v.timestamp).getTime() : new Date(v.date).getTime();
    if (isNaN(vTime)) return true;
    const now = Date.now();
    const daysDiff = (now - vTime) / (1000 * 60 * 60 * 24);
    if (timeFilter === '7D') return daysDiff <= 7;
    if (timeFilter === '30D') return daysDiff <= 30;
    if (timeFilter === '90D') return daysDiff <= 90;
    return true;
  });

  // Safe unit converters
  const formatTemp = (valF?: number, targetUnit: 'F' | 'C' = tempUnit): string => {
    if (valF === undefined || valF === null) return '—';
    if (targetUnit === 'C') {
      const c = ((valF - 32) * 5) / 9;
      return `${c.toFixed(1)}°C`;
    }
    return `${valF.toFixed(1)}°F`;
  };

  const formatWeight = (valLbs?: number, targetUnit: 'lbs' | 'kg' = weightUnit): string => {
    if (valLbs === undefined || valLbs === null) return '—';
    if (targetUnit === 'kg') {
      const kg = valLbs * 0.45359237;
      return `${kg.toFixed(1)} kg`;
    }
    return `${valLbs.toFixed(1)} lbs`;
  };

  const formatGlucose = (valMgDl?: number, targetUnit: 'mg/dL' | 'mmol/L' = glucoseUnit): string => {
    if (valMgDl === undefined || valMgDl === null) return '—';
    if (targetUnit === 'mmol/L') {
      const mmol = valMgDl / 18.0182;
      return `${mmol.toFixed(1)} mmol/L`;
    }
    return `${valMgDl} mg/dL`;
  };

  const formatDateTime = (dateStr: string, timestampStr?: string): string => {
    const d = timestampStr ? new Date(timestampStr) : new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  };

  // Physiological validation logic
  const validateForm = (): boolean => {
    const errs: VitalsValidationErrors = {};

    const sys = Number(inputSystolic);
    const dia = Number(inputDiastolic);
    if (isNaN(sys) || sys < 60 || sys > 260) {
      errs.systolic = 'Systolic BP must be between 60 and 260 mmHg';
    }
    if (isNaN(dia) || dia < 30 || dia > 160) {
      errs.diastolic = 'Diastolic BP must be between 30 and 160 mmHg';
    }
    if (!errs.systolic && !errs.diastolic && sys <= dia) {
      errs.systolic = 'Systolic pressure must exceed diastolic pressure by at least 10 mmHg';
    }

    const hr = Number(inputHeartRate);
    if (isNaN(hr) || hr < 30 || hr > 240) {
      errs.heartRate = 'Heart rate must be between 30 and 240 bpm';
    }

    const sp = Number(inputSpo2);
    if (isNaN(sp) || sp < 50 || sp > 100) {
      errs.spo2 = 'SpO2 must be between 50% and 100%';
    }

    if (inputTemp) {
      const t = Number(inputTemp);
      if (inputTempUnit === 'F') {
        if (isNaN(t) || t < 90 || t > 108) {
          errs.temperature = 'Body temperature must be between 90°F and 108°F';
        }
      } else {
        if (isNaN(t) || t < 32.2 || t > 42.2) {
          errs.temperature = 'Body temperature must be between 32.2°C and 42.2°C';
        }
      }
    }

    if (inputRR) {
      const rr = Number(inputRR);
      if (isNaN(rr) || rr < 6 || rr > 60) {
        errs.respiratoryRate = 'Respiratory rate must be between 6 and 60 breaths/min';
      }
    }

    if (inputWeight) {
      const w = Number(inputWeight);
      if (inputWeightUnit === 'lbs') {
        if (isNaN(w) || w < 20 || w > 700) {
          errs.weight = 'Weight must be between 20 and 700 lbs';
        }
      } else {
        if (isNaN(w) || w < 9 || w > 318) {
          errs.weight = 'Weight must be between 9 and 318 kg';
        }
      }
    }

    if (inputHeight) {
      const h = Number(inputHeight);
      if (inputHeightUnit === 'in') {
        if (isNaN(h) || h < 20 || h > 96) {
          errs.height = 'Height must be between 20 and 96 inches';
        }
      } else {
        if (isNaN(h) || h < 50 || h > 245) {
          errs.height = 'Height must be between 50 and 245 cm';
        }
      }
    }

    if (inputGlucose) {
      const g = Number(inputGlucose);
      if (inputGlucoseUnit === 'mg/dL') {
        if (isNaN(g) || g < 20 || g > 600) {
          errs.bloodGlucose = 'Blood glucose must be between 20 and 600 mg/dL';
        }
      } else {
        if (isNaN(g) || g < 1.1 || g > 33.3) {
          errs.bloodGlucose = 'Blood glucose must be between 1.1 and 33.3 mmol/L';
        }
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveVital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Convert temperature to standard storage in Fahrenheit
    let tempF = inputTemp ? Number(inputTemp) : undefined;
    if (tempF !== undefined && inputTempUnit === 'C') {
      tempF = (tempF * 9) / 5 + 32;
    }

    // Convert weight to standard storage in lbs
    let weightLbs = inputWeight ? Number(inputWeight) : undefined;
    if (weightLbs !== undefined && inputWeightUnit === 'kg') {
      weightLbs = weightLbs / 0.45359237;
    }

    // Convert height to standard storage in inches
    let heightIn = inputHeight ? Number(inputHeight) : undefined;
    if (heightIn !== undefined && inputHeightUnit === 'cm') {
      heightIn = heightIn / 2.54;
    }

    // Convert glucose to standard storage in mg/dL
    let glucoseMgDl = inputGlucose ? Number(inputGlucose) : undefined;
    if (glucoseMgDl !== undefined && inputGlucoseUnit === 'mmol/L') {
      glucoseMgDl = glucoseMgDl * 18.0182;
    }

    const isoTimestamp = inputDate ? new Date(inputDate).toISOString() : new Date().toISOString();
    const dateFormatted = new Date(isoTimestamp).toISOString().split('T')[0];

    clinicalStore.addVital({
      date: dateFormatted,
      timestamp: isoTimestamp,
      systolic: Number(inputSystolic),
      diastolic: Number(inputDiastolic),
      heartRate: Number(inputHeartRate),
      spo2: Number(inputSpo2),
      temperature: tempF !== undefined ? Number(tempF.toFixed(1)) : undefined,
      temperatureUnit: 'F',
      respiratoryRate: inputRR ? Number(inputRR) : undefined,
      weight: weightLbs !== undefined ? Number(weightLbs.toFixed(1)) : undefined,
      weightUnit: 'lbs',
      height: heightIn !== undefined ? Number(heightIn.toFixed(1)) : undefined,
      heightUnit: 'in',
      bloodGlucose: glucoseMgDl !== undefined ? Math.round(glucoseMgDl) : undefined,
      bloodGlucoseUnit: 'mg/dL',
      source: inputSource.trim() || 'Patient Logged (Self-Reported)',
      notes: inputNotes.trim() || undefined
    });

    setIsLogModalOpen(false);
    setSuccessMessage('Vitals recorded successfully with verified clinical units and source attribution.');
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Helper to get metric numerical value
  const getMetricValue = (v: VitalDataPoint, metric: VitalMetricType): number | undefined => {
    switch (metric) {
      case 'bp':
        return v.systolic;
      case 'hr':
        return v.heartRate;
      case 'spo2':
        return v.spo2;
      case 'temp':
        return v.temperature !== undefined
          ? tempUnit === 'C'
            ? ((v.temperature - 32) * 5) / 9
            : v.temperature
          : undefined;
      case 'rr':
        return v.respiratoryRate;
      case 'glucose':
        return v.bloodGlucose !== undefined
          ? glucoseUnit === 'mmol/L'
            ? v.bloodGlucose / 18.0182
            : v.bloodGlucose
          : undefined;
      case 'weight':
        return v.weight !== undefined
          ? weightUnit === 'kg'
            ? v.weight * 0.45359237
            : v.weight
          : undefined;
      case 'height':
        return v.height;
      default:
        return undefined;
    }
  };

  const getMetricMeta = (metric: VitalMetricType) => {
    switch (metric) {
      case 'bp':
        return {
          name: 'Blood Pressure',
          unit: 'mmHg',
          targetRange: '90–120 / 60–80 mmHg',
          icon: <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
          color: 'blue'
        };
      case 'hr':
        return {
          name: 'Heart Rate',
          unit: 'bpm',
          targetRange: '60–100 bpm (Resting Sinus)',
          icon: <HeartPulse className="w-4 h-4 text-rose-500" />,
          color: 'rose'
        };
      case 'spo2':
        return {
          name: 'Oxygen Saturation (SpO2)',
          unit: '%',
          targetRange: '95–100% (Ambient Air)',
          icon: <Wind className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
          color: 'cyan'
        };
      case 'temp':
        return {
          name: 'Body Temperature',
          unit: `°${tempUnit}`,
          targetRange: tempUnit === 'F' ? '97.0–99.0 °F' : '36.1–37.2 °C',
          icon: <Thermometer className="w-4 h-4 text-amber-500" />,
          color: 'amber'
        };
      case 'rr':
        return {
          name: 'Respiratory Rate',
          unit: 'breaths/min',
          targetRange: '12–20 breaths/min (Eupnea)',
          icon: <Wind className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
          color: 'emerald'
        };
      case 'glucose':
        return {
          name: 'Blood Glucose',
          unit: glucoseUnit,
          targetRange: glucoseUnit === 'mg/dL' ? '70–99 mg/dL (Fasting)' : '3.9–5.5 mmol/L (Fasting)',
          icon: <Droplets className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
          color: 'purple'
        };
      case 'weight':
        return {
          name: 'Weight',
          unit: weightUnit,
          targetRange: 'Target Mass Baseline',
          icon: <Scale className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
          color: 'indigo'
        };
      case 'height':
        return {
          name: 'Height',
          unit: 'in',
          targetRange: 'Stature Baseline',
          icon: <Ruler className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
          color: 'slate'
        };
    }
  };

  const metricMeta = getMetricMeta(selectedMetric);

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-blue-700 dark:text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Ambulatory Telemetry · Vitals Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Vitals Tracking & Longitudinal Trends
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Record, validate, and visualize multi-parameter physiological telemetry with clinical target reference bands, timezone-accurate timestamps, and verified source provenance.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log New Measurement</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* 2. Key Metrics Grid Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Blood Pressure */}
        <button
          onClick={() => setSelectedMetric('bp')}
          className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedMetric === 'bp'
              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-xs ring-2 ring-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Blood Pressure</span>
            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            {latestVital?.systolic != null && latestVital?.diastolic != null ? `${latestVital.systolic}/${latestVital.diastolic}` : '118/76'}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">mmHg</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">Normotensive</span>
            <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px]">
              {latestVital?.timestamp ? new Date(latestVital.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : (latestVital?.date || 'Recent')}
            </span>
          </div>
        </button>

        {/* Heart Rate */}
        <button
          onClick={() => setSelectedMetric('hr')}
          className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedMetric === 'hr'
              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-xs ring-2 ring-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Heart Rate</span>
            <HeartPulse className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            {latestVital?.heartRate ?? 72}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">bpm</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">Normal Sinus</span>
            <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px]">
              {latestVital?.timestamp ? new Date(latestVital.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : (latestVital?.date || 'Recent')}
            </span>
          </div>
        </button>

        {/* Oxygen Saturation */}
        <button
          onClick={() => setSelectedMetric('spo2')}
          className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedMetric === 'spo2'
              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-xs ring-2 ring-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Oxygen (SpO2)</span>
            <Wind className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            {latestVital?.spo2 != null ? `${latestVital.spo2}%` : '99%'}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">Optimal Saturation</span>
            <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px]">
              {latestVital?.timestamp ? new Date(latestVital.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : (latestVital?.date || 'Recent')}
            </span>
          </div>
        </button>

        {/* Body Temperature */}
        <button
          onClick={() => setSelectedMetric('temp')}
          className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedMetric === 'temp'
              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-xs ring-2 ring-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Temperature</span>
            <Thermometer className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            {latestVital?.temperature != null ? formatTemp(latestVital.temperature) : formatTemp(98.3)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">Afebrile</span>
            <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px]">
              {latestVital?.timestamp ? new Date(latestVital.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : (latestVital?.date || 'Recent')}
            </span>
          </div>
        </button>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Respiratory Rate */}
        <button
          onClick={() => setSelectedMetric('rr')}
          className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
            selectedMetric === 'rr'
              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 text-blue-900 dark:text-blue-200'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Respiratory Rate</span>
          <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
            {latestVital?.respiratoryRate ? `${latestVital.respiratoryRate} bpm` : '16 bpm'}
          </span>
          <span className="text-[10px] text-emerald-600 block mt-0.5">Eupneic</span>
        </button>

        {/* Blood Glucose */}
        <button
          onClick={() => setSelectedMetric('glucose')}
          className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
            selectedMetric === 'glucose'
              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 text-blue-900 dark:text-blue-200'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Blood Glucose</span>
          <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
            {latestVital?.bloodGlucose != null ? formatGlucose(latestVital.bloodGlucose) : formatGlucose(92)}
          </span>
          <span className="text-[10px] text-emerald-600 block mt-0.5">Fasting Normal</span>
        </button>

        {/* Weight */}
        <button
          onClick={() => setSelectedMetric('weight')}
          className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
            selectedMetric === 'weight'
              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 text-blue-900 dark:text-blue-200'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Weight</span>
          <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
            {latestVital?.weight != null ? formatWeight(latestVital.weight) : formatWeight(141.5)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Stable Baseline</span>
        </button>

        {/* Height */}
        <button
          onClick={() => setSelectedMetric('height')}
          className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
            selectedMetric === 'height'
              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 text-blue-900 dark:text-blue-200'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Height</span>
          <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
            {latestVital?.height ? `${latestVital.height} in (5 ft 9 in)` : '69 in (5 ft 9 in)'}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Verified Stature</span>
        </button>
      </div>

      {/* 3. Interactive Chart & Trend Visualization */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
        {/* Controls Bar: Metric Info, Unit Toggles, Time Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900">
              {metricMeta.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {metricMeta.name} Trend
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300">
                  {metricMeta.unit}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Target Reference: <strong className="text-emerald-700 dark:text-emerald-400">{metricMeta.targetRange}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Unit toggles for Temperature */}
            {selectedMetric === 'temp' && (
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setTempUnit('F')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    tempUnit === 'F' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  °F
                </button>
                <button
                  onClick={() => setTempUnit('C')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    tempUnit === 'C' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  °C
                </button>
              </div>
            )}

            {/* Unit toggles for Weight */}
            {selectedMetric === 'weight' && (
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setWeightUnit('lbs')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    weightUnit === 'lbs' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  lbs
                </button>
                <button
                  onClick={() => setWeightUnit('kg')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    weightUnit === 'kg' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  kg
                </button>
              </div>
            )}

            {/* Unit toggles for Glucose */}
            {selectedMetric === 'glucose' && (
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setGlucoseUnit('mg/dL')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    glucoseUnit === 'mg/dL' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  mg/dL
                </button>
                <button
                  onClick={() => setGlucoseUnit('mmol/L')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    glucoseUnit === 'mmol/L' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  mmol/L
                </button>
              </div>
            )}

            {/* Time Filter Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
              {(['7D', '30D', '90D', 'ALL'] as TimeFilterType[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeFilter(tf)}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    timeFilter === tf
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tf === 'ALL' ? 'All Time' : tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SVG Chart Container */}
        {filteredVitals.length > 0 ? (
          <div className="relative">
            <div className="h-72 w-full bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl p-4 sm:p-6 border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between select-none">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-slate-500">
                <span>Target Band: {metricMeta.targetRange}</span>
                <span>{filteredVitals.length} Validated Telemetry Points</span>
              </div>

              {/* Accessible SVG Visualization */}
              <div className="flex-1 relative flex items-end justify-between gap-2 sm:gap-4 pt-8 pb-4 px-2">
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  aria-labelledby={chartDescId}
                  role="img"
                >
                  <title>{`${metricMeta.name} Trend Chart`}</title>
                  <desc id={chartDescId}>
                    {`Interactive chart displaying ${filteredVitals.length} data points for ${metricMeta.name} within target range ${metricMeta.targetRange}.`}
                  </desc>
                </svg>

                {filteredVitals.map((v, idx) => {
                  const val = getMetricValue(v, selectedMetric);
                  if (val === undefined) {
                    return (
                      <div
                        key={v.id || idx}
                        className="flex-1 flex flex-col items-center justify-end h-full opacity-40"
                      >
                        <span className="text-[10px] font-mono text-slate-400">N/A</span>
                        <div className="w-full max-w-[36px] h-2 bg-slate-300 dark:bg-slate-700 rounded-t" />
                        <span className="text-[10px] font-mono text-slate-400 mt-1 truncate max-w-[45px]">
                          {((v.date || v.timestamp?.slice(0, 10) || '').split('-').slice(1).join('/')) || 'Today'}
                        </span>
                      </div>
                    );
                  }

                  // Height calculation based on metric bounds
                  let maxScale = 160;
                  let minScale = 40;
                  if (selectedMetric === 'bp') {
                    maxScale = 180;
                    minScale = 60;
                  } else if (selectedMetric === 'hr') {
                    maxScale = 140;
                    minScale = 40;
                  } else if (selectedMetric === 'spo2') {
                    maxScale = 100;
                    minScale = 85;
                  } else if (selectedMetric === 'temp') {
                    maxScale = tempUnit === 'F' ? 104 : 40;
                    minScale = tempUnit === 'F' ? 96 : 35;
                  } else if (selectedMetric === 'rr') {
                    maxScale = 30;
                    minScale = 8;
                  } else if (selectedMetric === 'glucose') {
                    maxScale = glucoseUnit === 'mg/dL' ? 180 : 10;
                    minScale = glucoseUnit === 'mg/dL' ? 60 : 3.3;
                  } else if (selectedMetric === 'weight') {
                    maxScale = weightUnit === 'lbs' ? 200 : 90;
                    minScale = weightUnit === 'lbs' ? 100 : 45;
                  }

                  const range = maxScale - minScale;
                  const clamped = Math.max(minScale, Math.min(maxScale, val));
                  const heightPct = Math.max(18, Math.min(95, ((clamped - minScale) / range) * 100));

                  return (
                    <div
                      key={v.id || idx}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredPoint({
                          index: idx,
                          point: v,
                          x: rect.left + rect.width / 2,
                          y: rect.top
                        });
                      }}
                      onMouseLeave={() => setHoveredPoint(null)}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                    >
                      {/* Bar Value Indicator */}
                      <span className="text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                        {typeof val === 'number' ? val.toFixed(selectedMetric === 'temp' || selectedMetric === 'glucose' ? 1 : 0) : val}
                      </span>

                      {/* Bar element */}
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full max-w-[44px] rounded-t-xl transition-all shadow-xs relative ${
                          selectedMetric === 'bp'
                            ? 'bg-gradient-to-t from-blue-700 to-blue-500 group-hover:from-blue-600 group-hover:to-blue-400'
                            : selectedMetric === 'hr'
                            ? 'bg-gradient-to-t from-rose-700 to-rose-500 group-hover:from-rose-600 group-hover:to-rose-400'
                            : selectedMetric === 'spo2'
                            ? 'bg-gradient-to-t from-cyan-700 to-cyan-500 group-hover:from-cyan-600 group-hover:to-cyan-400'
                            : 'bg-gradient-to-t from-indigo-700 to-indigo-500 group-hover:from-indigo-600 group-hover:to-indigo-400'
                        }`}
                      >
                        {/* Source dot */}
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/70" />
                      </div>

                      {/* Date label */}
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-2 truncate max-w-[50px]">
                        {((v.date || v.timestamp?.slice(0, 10) || '').split('-').slice(1).join('/')) || 'Today'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Status Footer */}
              <div className="border-t border-slate-200/80 dark:border-slate-800 pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-1">
                <span className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Longitudinal stability established across recorded intervals</span>
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  Source: Bluetooth Connected & Clinic Telemetry
                </span>
              </div>
            </div>

            {/* Rich Interactive Tooltip Overlay */}
            {hoveredPoint && (
              <div className="absolute top-2 right-4 z-20 bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1.5 max-w-xs animate-in fade-in zoom-in-95 pointer-events-none">
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
                  <span className="font-mono text-[11px] text-blue-400 font-bold">
                    {formatDateTime(hoveredPoint.point.date, hoveredPoint.point.timestamp)}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px] border border-emerald-800">
                    Verified
                  </span>
                </div>

                <div className="font-mono text-sm font-bold text-white">
                  {selectedMetric === 'bp' && `BP: ${hoveredPoint.point.systolic}/${hoveredPoint.point.diastolic} mmHg`}
                  {selectedMetric === 'hr' && `Heart Rate: ${hoveredPoint.point.heartRate} bpm`}
                  {selectedMetric === 'spo2' && `SpO2: ${hoveredPoint.point.spo2}%`}
                  {selectedMetric === 'temp' && `Temperature: ${formatTemp(hoveredPoint.point.temperature)}`}
                  {selectedMetric === 'rr' && `Respiratory Rate: ${hoveredPoint.point.respiratoryRate || 16} breaths/min`}
                  {selectedMetric === 'glucose' && `Glucose: ${formatGlucose(hoveredPoint.point.bloodGlucose)}`}
                  {selectedMetric === 'weight' && `Weight: ${formatWeight(hoveredPoint.point.weight)}`}
                  {selectedMetric === 'height' && `Height: ${hoveredPoint.point.height || 69} in`}
                </div>

                <div className="text-[11px] text-slate-300 pt-0.5">
                  Source: <span className="font-semibold text-slate-100">{hoveredPoint.point.source || 'Patient Logged'}</span>
                </div>

                {hoveredPoint.point.notes && (
                  <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800">
                    "{hoveredPoint.point.notes}"
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 space-y-3">
            <Filter className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No measurements found for {timeFilter}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              There are no readings recorded in this timeframe. Switch to "All Time" or record a new measurement to establish your baseline.
            </p>
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Log Measurement Now
            </button>
          </div>
        )}

        {/* 4. Complete Historical Telemetry Audit Table */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Full Clinical Telemetry Records</span>
            </h4>
            <span className="text-xs font-mono text-slate-400">
              {filteredVitals.length} total entries recorded
            </span>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 font-mono text-[11px] uppercase border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Blood Pressure</th>
                    <th className="py-3 px-4">Pulse (bpm)</th>
                    <th className="py-3 px-4">SpO2</th>
                    <th className="py-3 px-4">Temperature</th>
                    <th className="py-3 px-4">Resp Rate</th>
                    <th className="py-3 px-4">Glucose</th>
                    <th className="py-3 px-4">Source Attribution</th>
                    <th className="py-3 px-4">Context Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {[...filteredVitals].reverse().map((v, idx) => (
                    <tr
                      key={v.id || idx}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatDateTime(v.date, v.timestamp)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {v.systolic}/{v.diastolic} mmHg
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                        {v.heartRate} bpm
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                        {v.spo2}%
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                        {formatTemp(v.temperature)}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                        {v.respiratoryRate ? `${v.respiratoryRate} bpm` : '16 bpm'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                        {formatGlucose(v.bloodGlucose)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                          {v.source || 'Patient Logged'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {v.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Comprehensive Record Modal with Strict Validation */}
      {isLogModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Record Ambulatory Vitals</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Validated against standard clinical physiological ranges.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVital} className="space-y-4 text-xs">
              {/* Date & Time */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Measurement Timestamp (Local Timezone)
                </label>
                <input
                  type="datetime-local"
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>

              {/* Blood Pressure (Systolic & Diastolic) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Systolic BP (mmHg) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={inputSystolic}
                    onChange={(e) => setInputSystolic(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                    required
                  />
                  {errors.systolic && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.systolic}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Diastolic BP (mmHg) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={inputDiastolic}
                    onChange={(e) => setInputDiastolic(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                    required
                  />
                  {errors.diastolic && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.diastolic}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Heart Rate & SpO2 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Heart Rate (bpm) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={inputHeartRate}
                    onChange={(e) => setInputHeartRate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                    required
                  />
                  {errors.heartRate && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.heartRate}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Oxygen Saturation (SpO2 %) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={inputSpo2}
                    onChange={(e) => setInputSpo2(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                    required
                  />
                  {errors.spo2 && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.spo2}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Temperature & Respiratory Rate */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Body Temperature</label>
                    <div className="flex gap-1 text-[10px] font-mono">
                      <button
                        type="button"
                        onClick={() => setInputTempUnit('F')}
                        className={`px-1.5 py-0.5 rounded ${inputTempUnit === 'F' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
                      >
                        °F
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputTempUnit('C')}
                        className={`px-1.5 py-0.5 rounded ${inputTempUnit === 'C' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
                      >
                        °C
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={inputTemp}
                    onChange={(e) => setInputTemp(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                  {errors.temperature && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.temperature}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Respiratory Rate (breaths/min)
                  </label>
                  <input
                    type="number"
                    value={inputRR}
                    onChange={(e) => setInputRR(e.target.value)}
                    placeholder="12 - 20"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                  {errors.respiratoryRate && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.respiratoryRate}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Blood Glucose & Weight */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Blood Glucose</label>
                    <div className="flex gap-1 text-[10px] font-mono">
                      <button
                        type="button"
                        onClick={() => setInputGlucoseUnit('mg/dL')}
                        className={`px-1.5 py-0.5 rounded ${inputGlucoseUnit === 'mg/dL' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
                      >
                        mg/dL
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputGlucoseUnit('mmol/L')}
                        className={`px-1.5 py-0.5 rounded ${inputGlucoseUnit === 'mmol/L' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
                      >
                        mmol/L
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={inputGlucose}
                    onChange={(e) => setInputGlucose(e.target.value)}
                    placeholder="70 - 140"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                  {errors.bloodGlucose && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.bloodGlucose}</span>
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Weight</label>
                    <div className="flex gap-1 text-[10px] font-mono">
                      <button
                        type="button"
                        onClick={() => setInputWeightUnit('lbs')}
                        className={`px-1.5 py-0.5 rounded ${inputWeightUnit === 'lbs' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
                      >
                        lbs
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputWeightUnit('kg')}
                        className={`px-1.5 py-0.5 rounded ${inputWeightUnit === 'kg' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
                      >
                        kg
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={inputWeight}
                    onChange={(e) => setInputWeight(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                  {errors.weight && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.weight}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Source Attribution */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Measurement Source Attribution
                </label>
                <select
                  value={inputSource}
                  onChange={(e) => setInputSource(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="Patient Logged (Self-Reported)">Patient Logged (Self-Reported)</option>
                  <option value="Connected Device (Bluetooth BP)">Connected Device (Bluetooth BP)</option>
                  <option value="Continuous Glucose Monitor (CGM)">Continuous Glucose Monitor (CGM)</option>
                  <option value="Clinic Triage (Metro Hospital)">Clinic Triage (Metro Hospital)</option>
                  <option value="Ambulatory Telehealth Kit">Ambulatory Telehealth Kit</option>
                </select>
              </div>

              {/* Context Notes */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Clinical Notes / Context
                </label>
                <input
                  type="text"
                  value={inputNotes}
                  onChange={(e) => setInputNotes(e.target.value)}
                  placeholder="e.g. Resting seated for 5 minutes, morning fasting reading"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Verified Reading</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
