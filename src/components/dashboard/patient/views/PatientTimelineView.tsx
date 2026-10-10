import React, { useState, useEffect } from 'react';
import { RoutePath, TimelineEntry } from '../../../../types';
import { clinicalStore } from '../../../../services/clinicalStore';
import {
  Clock,
  Calendar,
  FileText,
  Activity,
  HeartPulse,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  Filter,
  Download,
  ShieldCheck,
  Pill,
  UserCheck,
  CalendarCheck,
  AlertTriangle,
  Lock,
  Eye,
  CheckCircle2
} from 'lucide-react';

export const PatientTimelineView: React.FC<{ onNavigate: (route: RoutePath) => void }> = ({
  onNavigate
}) => {
  const [timeline, setTimeline] = useState<TimelineEntry[]>(clinicalStore.getTimeline());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  useEffect(() => {
    return clinicalStore.subscribe(() => {
      setTimeline(clinicalStore.getTimeline());
    });
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredTimeline = timeline.filter((entry) => {
    if (selectedCategory === 'all') return true;
    return entry.category === selectedCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'consultation':
        return <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'vitals':
        return <HeartPulse className="w-4 h-4 text-rose-500" />;
      case 'lab':
        return <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'medication':
        return <Pill className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'appointment':
        return <CalendarCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'handoff':
        return <Stethoscope className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'profile':
        return <UserCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'consultation':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900';
      case 'vitals':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900';
      case 'lab':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';
      case 'medication':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900';
      case 'appointment':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900';
      case 'handoff':
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900';
      case 'profile':
        return 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-900';
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const handleExport = () => {
    setExportNotice('Exporting longitudinal care timeline with source provenance and digital certificate...');
    setTimeout(() => {
      setExportNotice(null);
      window.print();
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-blue-700 dark:text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Longitudinal Record · Health Journey</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Longitudinal Health Timeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            A chronological, verified audit trail combining lab releases, telemetry vitals, symptom assessments, medication reconciliations, scheduled appointments, care updates, and clinician handoffs.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Export Audit Trail</span>
        </button>
      </div>

      {exportNotice && (
        <div className="p-3.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 rounded-2xl text-xs text-blue-900 dark:text-blue-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* 2. Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: 'All Events', count: timeline.length },
          { id: 'consultation', label: 'Assessments', count: timeline.filter((t) => t.category === 'consultation').length },
          { id: 'vitals', label: 'Vitals Telemetry', count: timeline.filter((t) => t.category === 'vitals').length },
          { id: 'lab', label: 'Lab Reports', count: timeline.filter((t) => t.category === 'lab').length },
          { id: 'medication', label: 'Medications', count: timeline.filter((t) => t.category === 'medication').length },
          { id: 'appointment', label: 'Appointments', count: timeline.filter((t) => t.category === 'appointment').length },
          { id: 'handoff', label: 'Doctor Handoffs', count: timeline.filter((t) => t.category === 'handoff').length },
          { id: 'profile', label: 'Care Updates', count: timeline.filter((t) => t.category === 'profile').length }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>{cat.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedCategory === cat.id
                  ? 'bg-blue-800 text-blue-100'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* 3. Chronological Events Stream */}
      {filteredTimeline.length > 0 ? (
        <div className="space-y-4 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 before:z-0">
          {filteredTimeline.map((item, idx) => {
            const isExpanded = !!expandedIds[item.id];
            return (
              <div key={`${item.id}-${idx}`} className="relative z-10 pl-11 flex flex-col group">
                {/* Timeline Axis Bullet Node */}
                <div className="absolute left-3 top-5 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-500 flex items-center justify-center -translate-x-1/2 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500" />
                </div>

                {/* Timeline Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3">
                  {/* Top Header: Date, Source, Privacy Scope, Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.date}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{item.verifiedContext}</span>
                      {item.source && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-blue-600 dark:text-blue-400 font-medium">Source: {item.source}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Privacy & Authorization Scope Tag */}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>{item.privacyScope === 'emergency' ? 'Emergency Accessible' : 'Authorized Care Team'}</span>
                      </span>

                      {/* Status Tag */}
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${
                          item.status === 'flagged'
                            ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            : item.status === 'scheduled'
                            ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        {item.status || 'Verified'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${getCategoryBadgeClass(item.category)}`}>
                        {getCategoryIcon(item.category)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          {item.summary}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Expandable Clinical Record Details */}
                  {isExpanded && item.details && (
                    <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl leading-relaxed space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs uppercase font-mono tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Clinical Details & Verified Audit Notes:</span>
                      </div>
                      <p className="whitespace-pre-line text-slate-700 dark:text-slate-300">
                        {item.details}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <Filter className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No events found for "{selectedCategory}"
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            There are no clinical events matching this filter category. Try selecting "All Events" to view your full longitudinal care journey.
          </p>
          <button
            onClick={() => setSelectedCategory('all')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Show All Events
          </button>
        </div>
      )}
    </div>
  );
};
