import React, { useState } from 'react';
import { ChatDocument, DocumentComparisonResult } from '../../types/chat';
import { compareMedicalDocuments } from '../../services/documentProcessor';
import {
  X,
  GitCompare,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';

interface CompareDocumentsModalProps {
  documents: ChatDocument[];
  isOpen: boolean;
  onClose: () => void;
  onInsertToChat: (comparisonText: string) => void;
}

export const CompareDocumentsModal: React.FC<CompareDocumentsModalProps> = ({
  documents,
  isOpen,
  onClose,
  onInsertToChat
}) => {
  const [doc1Id, setDoc1Id] = useState<string>(documents[0]?.id || '');
  const [doc2Id, setDoc2Id] = useState<string>(documents[1]?.id || documents[0]?.id || '');
  const [comparisonResult, setComparisonResult] = useState<DocumentComparisonResult | null>(null);

  if (!isOpen) return null;

  const handleRunComparison = () => {
    const doc1 = documents.find((d) => d.id === doc1Id);
    const doc2 = documents.find((d) => d.id === doc2Id);
    if (!doc1 || !doc2) return;

    const res = compareMedicalDocuments(doc1, doc2);
    setComparisonResult(res);
  };

  const getTrendBadge = (trend: 'improved' | 'worsened' | 'stable' | 'new' | 'unspecified') => {
    switch (trend) {
      case 'improved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            Improved
          </span>
        );
      case 'worsened':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
            <TrendingDown className="w-3 h-3 text-red-600" />
            Elevated / Flag
          </span>
        );
      case 'stable':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
            <Minus className="w-3 h-3 text-slate-500" />
            Stable
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
            Reported
          </span>
        );
    }
  };

  const handleSendToChat = () => {
    if (!comparisonResult) return;

    let markdown = `### Clinical Report Comparison\n\n`;
    markdown += `**Document 1:** ${comparisonResult.doc1Name}\n`;
    markdown += `**Document 2:** ${comparisonResult.doc2Name}\n\n`;
    markdown += `| Analyte / Test | ${comparisonResult.doc1Name.slice(0, 16)}... | ${comparisonResult.doc2Name.slice(0, 16)}... | Delta | Reference | Trend |\n`;
    markdown += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

    comparisonResult.metrics.forEach((m) => {
      markdown += `| **${m.analyte}** | ${m.doc1Value} ${m.unit} | ${m.doc2Value} ${m.unit} | ${m.delta || '—'} | ${m.referenceRange} | ${m.trend} |\n`;
    });

    markdown += `\n**Clinical Differential Summary:**\n${comparisonResult.clinicalSummary}\n\n`;
    markdown += `> ⚠️ **Notice:** Clinical comparison generated for differential review. Always consult your attending physician before altering treatments.`;

    onInsertToChat(markdown);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-900">
              Multi-Document Clinical Comparison Mode
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Document Selectors */}
        <div className="p-4 border-b border-slate-200 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select First Document (Baseline / Prior Report):
            </label>
            <select
              value={doc1Id}
              onChange={(e) => setDoc1Id(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-indigo-600"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.filename}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Second Document (Current / Follow-up Report):
            </label>
            <select
              value={doc2Id}
              onChange={(e) => setDoc2Id(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-indigo-600"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.filename}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Compare Action Button */}
        <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200 flex justify-between items-center">
          <span className="text-xs text-slate-500">
            Compare values, detect trends, and identify new or changed findings.
          </span>
          <button
            onClick={handleRunComparison}
            disabled={!doc1Id || !doc2Id}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:bg-slate-300"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Comparison</span>
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!comparisonResult ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <GitCompare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              Select two uploaded reports above and click &ldquo;Generate Comparison&rdquo;.
            </div>
          ) : (
            <>
              {/* Metrics Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
                      <th className="py-2.5 px-3">Analyte / Metric</th>
                      <th className="py-2.5 px-3">Baseline</th>
                      <th className="py-2.5 px-3">Current</th>
                      <th className="py-2.5 px-3">Change (Delta)</th>
                      <th className="py-2.5 px-3">Reference Range</th>
                      <th className="py-2.5 px-3">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {comparisonResult.metrics.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-semibold text-slate-900">{m.analyte}</td>
                        <td className="py-2 px-3 text-slate-700">
                          {m.doc1Value} {m.unit}
                        </td>
                        <td className="py-2 px-3 text-slate-700 font-medium">
                          {m.doc2Value} {m.unit}
                        </td>
                        <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">
                          {m.delta || '—'}
                        </td>
                        <td className="py-2 px-3 text-slate-500">{m.referenceRange}</td>
                        <td className="py-2 px-3">{getTrendBadge(m.trend)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Differential Clinical Summary */}
              <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 space-y-1.5 text-xs">
                <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Clinical Differential Summary
                </div>
                <p className="text-indigo-950 leading-relaxed">
                  {comparisonResult.clinicalSummary}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
          >
            Close
          </button>

          {comparisonResult && (
            <button
              onClick={handleSendToChat}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Insert Comparison into Active Chat</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
