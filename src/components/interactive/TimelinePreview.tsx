import React, { useState } from 'react';
import { DEMO_TIMELINE } from '../../data/timeline';
import { Calendar, FileText, HeartPulse, Stethoscope, Clock, CheckCircle } from 'lucide-react';
import { TimelineEntry } from '../../types';

export const TimelinePreview: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'consultation' | 'vitals' | 'lab' | 'handoff'>('all');
  const [expandedId, setExpandedId] = useState<string | null>('tl-1');

  const filteredEntries = filter === 'all'
    ? DEMO_TIMELINE
    : DEMO_TIMELINE.filter(e => e.category === filter);

  const getCategoryIcon = (cat: TimelineEntry['category']) => {
    switch (cat) {
      case 'consultation':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'vitals':
        return <HeartPulse className="w-4 h-4 text-rose-600" />;
      case 'lab':
        return <FileText className="w-4 h-4 text-amber-600" />;
      case 'handoff':
        return <Stethoscope className="w-4 h-4 text-emerald-600" />;
      default:
        return <Calendar className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Top Bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-xs text-slate-800">Longitudinal Health Story</span>
          <span className="text-slate-300">·</span>
          <span className="text-[11px] font-mono text-slate-500">March 2026 Cohort</span>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-lg text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All (4)
          </button>
          <button
            onClick={() => setFilter('consultation')}
            className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
              filter === 'consultation' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Consultation
          </button>
          <button
            onClick={() => setFilter('vitals')}
            className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
              filter === 'vitals' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vitals
          </button>
          <button
            onClick={() => setFilter('lab')}
            className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
              filter === 'lab' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Labs
          </button>
          <button
            onClick={() => setFilter('handoff')}
            className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
              filter === 'handoff' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Handoff
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {filteredEntries.map((entry) => {
            const isExpanded = expandedId === entry.id;
            return (
              <div key={entry.id} className="relative group">
                {/* Dot */}
                <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center group-hover:border-blue-500 transition-colors shadow-xs">
                  {getCategoryIcon(entry.category)}
                </div>

                <div
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    isExpanded
                      ? 'border-blue-400 bg-blue-50/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-mono text-slate-500">{entry.date}</span>
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {entry.verifiedContext}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{entry.title}</h3>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">{entry.summary}</p>

                  {isExpanded && entry.details && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 text-xs text-slate-700 bg-white p-3 rounded border border-slate-100 space-y-1">
                      <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider font-mono">
                        Clinical Context & Metadata
                      </div>
                      <p className="leading-relaxed">{entry.details}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Demonstration clinical narrative</span>
          <span className="font-mono text-[11px]">4 events indexed</span>
        </div>
      </div>
    </div>
  );
};
