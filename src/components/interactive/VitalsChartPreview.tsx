import React, { useState } from 'react';
import { DEMO_VITALS_DATA } from '../../data/timeline';
import { Activity, Heart, Wind, Calendar } from 'lucide-react';

export const VitalsChartPreview: React.FC = () => {
  const [metric, setMetric] = useState<'bp' | 'hr' | 'spo2'>('bp');

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Top Bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-xs text-slate-800">Longitudinal Vitals Intelligence</span>
            <span className="text-slate-300">·</span>
            <span className="text-[11px] font-mono text-slate-500">Ambulatory Telemetry</span>
          </div>
        </div>

        {/* Metric Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg text-xs">
          <button
            onClick={() => setMetric('bp')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              metric === 'bp' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Blood Pressure
          </button>
          <button
            onClick={() => setMetric('hr')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              metric === 'hr' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Heart Rate
          </button>
          <button
            onClick={() => setMetric('spo2')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              metric === 'spo2' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Oxygen (SpO2)
          </button>
        </div>
      </div>

      <div className="p-5">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            <div className="text-[11px] text-slate-500 font-medium">Latest BP</div>
            <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">117/75 <span className="text-xs font-normal text-slate-500">mmHg</span></div>
            <div className="text-[10px] text-emerald-700 mt-1 font-medium">Optimal Normotensive</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            <div className="text-[11px] text-slate-500 font-medium">Resting Heart Rate</div>
            <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">66 <span className="text-xs font-normal text-slate-500">bpm</span></div>
            <div className="text-[10px] text-slate-600 mt-1 font-medium">Baseline 64–72 bpm</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            <div className="text-[11px] text-slate-500 font-medium">Blood Oxygen</div>
            <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">99% <span className="text-xs font-normal text-slate-500">SpO2</span></div>
            <div className="text-[10px] text-emerald-700 mt-1 font-medium">Normoxic Interval</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            <div className="text-[11px] text-slate-500 font-medium">Recorded Samples</div>
            <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">7 <span className="text-xs font-normal text-slate-500">entries</span></div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">30-day window</div>
          </div>
        </div>

        {/* Clean SVG Trend Chart */}
        <div className="bg-slate-900 text-white rounded-lg p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
            <span className="font-mono">
              {metric === 'bp' && 'Systolic / Diastolic Trend (mmHg)'}
              {metric === 'hr' && 'Resting Pulse Rate (bpm)'}
              {metric === 'spo2' && 'Peripheral Capillary Oxygen Saturation (%)'}
            </span>
            <span className="font-mono text-[11px]">30-Day Clinical Graph</span>
          </div>

          <div className="relative h-48 w-full">
            {/* SVG graph */}
            <svg className="w-full h-full overflow-visible" viewBox="0 0 700 180" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="0" y1="30" x2="700" y2="30" stroke="#334155" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="700" y2="80" stroke="#334155" strokeDasharray="3 3" />
              <line x1="0" y1="130" x2="700" y2="130" stroke="#334155" strokeDasharray="3 3" />

              {metric === 'bp' && (
                <>
                  {/* Systolic Line (top) */}
                  <polyline
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="2.5"
                    points="30,45 140,55 250,35 360,65 470,50 580,60 670,70"
                  />
                  {/* Diastolic Line (bottom) */}
                  <polyline
                    fill="none"
                    stroke="#818CF8"
                    strokeWidth="2.5"
                    points="30,120 140,126 250,114 360,132 470,123 580,129 670,135"
                  />
                  {/* Points */}
                  {[
                    [30, 45, '122'], [140, 55, '120'], [250, 35, '124'],
                    [360, 65, '118'], [470, 50, '121'], [580, 60, '119'], [670, 70, '117']
                  ].map(([x, y, val], idx) => (
                    <g key={idx}>
                      <circle cx={x} cy={y} r="4" fill="#38BDF8" />
                      <text x={x} y={Number(y) - 8} fill="#94A3B8" fontSize="10" fontFamily="monospace" textAnchor="middle">{val}</text>
                    </g>
                  ))}
                  {[
                    [30, 120, '80'], [140, 126, '78'], [250, 114, '82'],
                    [360, 132, '76'], [470, 123, '79'], [580, 129, '77'], [670, 135, '75']
                  ].map(([x, y, val], idx) => (
                    <g key={idx}>
                      <circle cx={x} cy={y} r="4" fill="#818CF8" />
                      <text x={x} y={Number(y) + 16} fill="#94A3B8" fontSize="10" fontFamily="monospace" textAnchor="middle">{val}</text>
                    </g>
                  ))}
                </>
              )}

              {metric === 'hr' && (
                <>
                  <polyline
                    fill="none"
                    stroke="#F43F5E"
                    strokeWidth="2.5"
                    points="30,70 140,85 250,55 360,100 470,78 580,92 670,115"
                  />
                  {[
                    [30, 70, '72'], [140, 85, '70'], [250, 55, '74'],
                    [360, 100, '68'], [470, 78, '71'], [580, 92, '69'], [670, 115, '66']
                  ].map(([x, y, val], idx) => (
                    <g key={idx}>
                      <circle cx={x} cy={y} r="4" fill="#F43F5E" />
                      <text x={x} y={Number(y) - 8} fill="#FDA4AF" fontSize="10" fontFamily="monospace" textAnchor="middle">{val} bpm</text>
                    </g>
                  ))}
                </>
              )}

              {metric === 'spo2' && (
                <>
                  <polyline
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2.5"
                    points="30,90 140,50 250,90 360,50 470,90 580,50 670,25"
                  />
                  {[
                    [30, 90, '98%'], [140, 50, '99%'], [250, 90, '98%'],
                    [360, 50, '99%'], [470, 90, '98%'], [580, 50, '99%'], [670, 25, '100%']
                  ].map(([x, y, val], idx) => (
                    <g key={idx}>
                      <circle cx={x} cy={y} r="4" fill="#10B981" />
                      <text x={x} y={Number(y) - 8} fill="#A7F3D0" fontSize="10" fontFamily="monospace" textAnchor="middle">{val}</text>
                    </g>
                  ))}
                </>
              )}
            </svg>
          </div>

          {/* Dates Bar */}
          <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-4 pt-2 border-t border-slate-800">
            {DEMO_VITALS_DATA.map((d, i) => (
              <span key={i}>{d.date}</span>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            {metric === 'bp' && (
              <>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Systolic (mmHg)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-400" /> Diastolic (mmHg)</span>
              </>
            )}
            {metric === 'hr' && (
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Heart Rate (bpm)</span>
            )}
            {metric === 'spo2' && (
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> SpO2 (%)</span>
            )}
          </div>
          <span className="text-[11px] font-mono text-slate-400">Illustrative example — Clinical mock record</span>
        </div>
      </div>
    </div>
  );
};
