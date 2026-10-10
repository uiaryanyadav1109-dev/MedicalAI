import React, { useState } from 'react';
import { SectionHeader } from '../ui/SectionHeader';
import { CORE_FEATURES, ProductFeature } from '../../data/features';
import {
  MessageSquareText,
  Activity,
  FileText,
  Clock,
  HeartPulse,
  Pill,
  Stethoscope,
  ShieldCheck,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { RoutePath } from '../../types';

interface CoreCapabilitiesSectionProps {
  onNavigate: (route: RoutePath) => void;
  onOpenAssessment: () => void;
}

export const CoreCapabilitiesSection: React.FC<CoreCapabilitiesSectionProps> = ({
  onNavigate,
  onOpenAssessment
}) => {
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>(CORE_FEATURES[0].id);

  const getFeatureIcon = (name: string) => {
    switch (name) {
      case 'MessageSquareText':
        return <MessageSquareText className="w-5 h-5" />;
      case 'Activity':
        return <Activity className="w-5 h-5" />;
      case 'FileText':
        return <FileText className="w-5 h-5" />;
      case 'Clock':
        return <Clock className="w-5 h-5" />;
      case 'HeartPulse':
        return <HeartPulse className="w-5 h-5" />;
      case 'Pill':
        return <Pill className="w-5 h-5" />;
      case 'Stethoscope':
        return <Stethoscope className="w-5 h-5" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const activeFeature = CORE_FEATURES.find((f) => f.id === selectedFeatureId) || CORE_FEATURES[0];

  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors" id="capabilities">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          kicker="Platform Architecture"
          title="One intelligent layer for your health information."
          description="Designed to organize symptom context, diagnostic documents, and historical trends into clinical clarity without diagnostic pretense."
        />

        {/* 8-Grid Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {CORE_FEATURES.map((feature) => {
            const isSelected = selectedFeatureId === feature.id;
            return (
              <button
                key={feature.id}
                onClick={() => setSelectedFeatureId(feature.id)}
                className={`text-left p-5 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50/40 dark:bg-blue-950/40 shadow-xs ring-1 ring-blue-600 dark:ring-blue-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div>
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {getFeatureIcon(feature.iconName)}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">{feature.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-medium">
                  <span className={isSelected ? 'text-blue-700 dark:text-blue-400 font-semibold' : 'text-slate-400 dark:text-slate-500'}>
                    {isSelected ? 'Viewing capability' : 'Explore detail'}
                  </span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600'}`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Feature Deep-Dive Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-xs font-mono uppercase text-blue-300 tracking-wider">
                Active Highlight · {activeFeature.title}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {activeFeature.tagline}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {activeFeature.description}
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              {activeFeature.previewHighlights.map((hl, i) => (
                <span
                  key={i}
                  className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-md border border-slate-700 font-medium"
                >
                  ✓ {hl}
                </span>
              ))}
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={onOpenAssessment}
              className="px-5 py-3 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-xs transition-colors text-center whitespace-nowrap"
            >
              Try in Assessment Sandbox
            </button>
            <button
              onClick={() => {
                onNavigate('/features');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-3 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors text-center whitespace-nowrap"
            >
              View Full Features Directory
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
