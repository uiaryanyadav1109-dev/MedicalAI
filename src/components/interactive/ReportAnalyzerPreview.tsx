import React, { useState } from 'react';
import { DEMO_CBC_REPORT } from '../../data/reports';
import { FileText, CheckCircle2, AlertCircle, ArrowUpRight, HelpCircle, Shield, Sparkles } from 'lucide-react';
import { LabResultItem } from '../../types';

export const ReportAnalyzerPreview: React.FC = () => {
  const [selectedAnalyte, setSelectedAnalyte] = useState<LabResultItem>(DEMO_CBC_REPORT.results[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'explanation' | 'doctor_questions'>('overview');

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-xs text-slate-800">{DEMO_CBC_REPORT.reportTitle}</span>
          <span className="text-slate-300">·</span>
          <span className="text-[11px] text-slate-500 font-mono">Demo ID: {DEMO_CBC_REPORT.patientDemoId}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-mono">Illustrative Diagnostic Sample</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        {/* Analyte Table */}
        <div className="lg:col-span-7 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
            <span>Extracted Blood Analytes ({DEMO_CBC_REPORT.results.length})</span>
            <span>Tap an item to view plain explanation</span>
          </div>

          <div className="space-y-2">
            {DEMO_CBC_REPORT.results.map((item) => {
              const isSelected = selectedAnalyte.testName === item.testName;
              return (
                <button
                  key={item.testName}
                  onClick={() => setSelectedAnalyte(item)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900">{item.testName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">LOINC {item.code}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Standard Reference: {item.referenceRange} {item.unit}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-slate-900">
                        {item.value} <span className="text-[11px] font-normal text-slate-500">{item.unit}</span>
                      </div>
                      <div className="text-[10px] uppercase font-medium tracking-wider">
                        {item.status === 'normal' ? (
                          <span className="text-emerald-700">Within Range</span>
                        ) : (
                          <span className="text-amber-700">Borderline Elevation</span>
                        )}
                      </div>
                    </div>
                    <ArrowUpRight
                      className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-300'}`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Intelligence Side Panel */}
        <div className="lg:col-span-5 p-5 bg-slate-50/50 flex flex-col justify-between">
          <div>
            {/* Tab header */}
            <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-lg mb-4 text-xs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-1 px-2 rounded-md font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Explanation
              </button>
              <button
                onClick={() => setActiveTab('doctor_questions')}
                className={`flex-1 py-1 px-2 rounded-md font-medium transition-colors ${
                  activeTab === 'doctor_questions'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Doctor Questions
              </button>
            </div>

            {/* Selected Analyte Card */}
            <div className="space-y-4">
              <div>
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Analyte Overview
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedAnalyte.testName}
                </h3>
              </div>

              {activeTab === 'overview' ? (
                <div className="space-y-3 text-xs leading-relaxed text-slate-700">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Plain Language Translation
                    </div>
                    <p>{selectedAnalyte.explanation}</p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
                    <div className="font-semibold text-slate-900">What does this metric mean?</div>
                    <p className="text-slate-600">
                      Observed result is <span className="font-mono font-semibold text-slate-900">{selectedAnalyte.value} {selectedAnalyte.unit}</span>. Expected biological baseline is <span className="font-mono text-slate-800">{selectedAnalyte.referenceRange} {selectedAnalyte.unit}</span>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs text-slate-700">
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                      Suggested Discussion Points for Your Doctor:
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li>"How does my {selectedAnalyte.testName} compare to my previous baseline tests?"</li>
                      <li>"Are there specific lifestyle or dietary habits that influenced this level?"</li>
                      <li>"When do you recommend we re-test this panel to confirm continuity?"</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-200 text-[11px] text-slate-500">
            Educational translation only. Reference intervals vary between clinical labs. Discuss findings directly with your ordering physician.
          </div>
        </div>
      </div>
    </div>
  );
};
