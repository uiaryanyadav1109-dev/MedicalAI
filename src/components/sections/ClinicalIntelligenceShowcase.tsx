import React, { useState } from 'react';
import { RoutePath } from '../../types';
import { SectionHeader } from '../ui/SectionHeader';
import { ConsultationPreview } from '../interactive/ConsultationPreview';
import { TriageScalePreview } from '../interactive/TriageScalePreview';
import { ReportAnalyzerPreview } from '../interactive/ReportAnalyzerPreview';
import { DoctorHandoffPreview } from '../interactive/DoctorHandoffPreview';
import { TimelinePreview } from '../interactive/TimelinePreview';
import { VitalsChartPreview } from '../interactive/VitalsChartPreview';
import {
  MessageSquareText,
  Compass,
  FileText,
  Stethoscope,
  Activity,
  ArrowRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface ClinicalIntelligenceShowcaseProps {
  onNavigate: (route: RoutePath) => void;
  onOpenAssessment: () => void;
}

type ShowcaseTab = 'intake' | 'triage' | 'reports' | 'handoff' | 'vitals';

export const ClinicalIntelligenceShowcase: React.FC<ClinicalIntelligenceShowcaseProps> = ({
  onNavigate,
  onOpenAssessment
}) => {
  const [activeTab, setActiveTab] = useState<ShowcaseTab>('intake');

  const tabs: {
    id: ShowcaseTab;
    label: string;
    kicker: string;
    icon: React.ReactNode;
    description: string;
  }[] = [
    {
      id: 'intake',
      label: 'Clinical Intake',
      kicker: 'Conversational Triage',
      icon: <MessageSquareText className="w-4 h-4" />,
      description: 'Conversational intake captures symptom history, duration, and aggravating factors naturally.'
    },
    {
      id: 'triage',
      label: '5-Tier Triage',
      kicker: 'Urgency Classification',
      icon: <Compass className="w-4 h-4" />,
      description: 'Calibrated operational urgency levels guide appropriate timing and site of clinical care.'
    },
    {
      id: 'reports',
      label: 'Report Analyzer',
      kicker: 'Diagnostic Document OCR',
      icon: <FileText className="w-4 h-4" />,
      description: 'Decodes blood panels and radiology summaries into clear reference-backed findings.'
    },
    {
      id: 'handoff',
      label: 'Doctor Handoff',
      kicker: 'Standardized HPI Brief',
      icon: <Stethoscope className="w-4 h-4" />,
      description: 'Generates a 1-page clinical briefing document formatted for direct physician review.'
    },
    {
      id: 'vitals',
      label: 'Health Telemetry',
      kicker: 'Longitudinal Continuity',
      icon: <Activity className="w-4 h-4" />,
      description: 'Ambulatory blood pressure and vitals trends paired with a unified medical timeline.'
    }
  ];

  const currentTabInfo = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 transition-colors" id="showcase">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          kicker="Interactive Clinical Intelligence"
          title="See how medical intelligence connects every step."
          description="Explore our interactive workflows: conversational intake, 5-tier triage classification, document analysis, and physician handoff briefs."
        />

        {/* Tab Selection Bar */}
        <div className="flex justify-center mb-8 overflow-x-auto pb-2 scrollbar-none">
          <div className="inline-flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs gap-1.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  aria-selected={isActive}
                  role="tab"
                >
                  <span className={isActive ? 'text-white' : 'text-blue-600 dark:text-blue-400'}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Tab Editorial Context */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
          <div className="space-y-1">
            <div className="text-xs font-mono font-semibold uppercase text-blue-700 dark:text-blue-400">
              {currentTabInfo.kicker}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {currentTabInfo.label} Experience
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              {currentTabInfo.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeTab === 'intake' && (
              <button
                onClick={onOpenAssessment}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Launch Interactive Intake</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {activeTab === 'reports' && (
              <button
                onClick={() => onNavigate('/features')}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Learn Report Capabilities</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
            {activeTab === 'handoff' && (
              <button
                onClick={() => onNavigate('/for-doctors')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Doctor EMR Portal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
            {activeTab === 'vitals' && (
              <button
                onClick={() => onNavigate('/features')}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Full Telemetry Guide</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
            {activeTab === 'triage' && (
              <button
                onClick={() => onNavigate('/safety')}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Clinical Safety Policies</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Content Display Area */}
        <div className="transition-all duration-200">
          {activeTab === 'intake' && (
            <div className="space-y-4">
              <ConsultationPreview onNavigate={onNavigate} />
            </div>
          )}

          {activeTab === 'triage' && (
            <div className="space-y-4">
              <TriageScalePreview />
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-4">
              <ReportAnalyzerPreview />
            </div>
          )}

          {activeTab === 'handoff' && (
            <div className="space-y-4">
              <DoctorHandoffPreview />
            </div>
          )}

          {activeTab === 'vitals' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div>
                <div className="text-xs font-mono font-semibold uppercase text-slate-400 dark:text-slate-500 mb-2">
                  Longitudinal Vitals Trends
                </div>
                <VitalsChartPreview />
              </div>
              <div>
                <div className="text-xs font-mono font-semibold uppercase text-slate-400 dark:text-slate-500 mb-2">
                  Chronological Medical Timeline
                </div>
                <TimelinePreview />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
