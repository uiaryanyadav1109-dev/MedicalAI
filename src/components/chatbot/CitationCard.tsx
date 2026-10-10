import React, { useState } from 'react';
import { Citation } from '../../types/chat';
import { FileText, ChevronDown, ChevronUp, ExternalLink, ShieldCheck } from 'lucide-react';

interface CitationCardProps {
  citation: Citation;
  onViewDocument?: (documentId: string, pageNumber?: number) => void;
}

export const CitationCard: React.FC<CitationCardProps> = ({
  citation,
  onViewDocument
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-blue-200/80 bg-blue-50/50 hover:bg-blue-50/90 transition-all text-xs text-slate-700 shadow-2xs overflow-hidden">
      <div
        className="flex items-center justify-between p-2.5 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="p-1 rounded-md bg-blue-600/10 text-blue-700 flex-shrink-0">
            <FileText className="w-3.5 h-3.5" />
          </span>
          <div className="truncate">
            <span className="font-semibold text-slate-900 truncate block">
              {citation.documentName}
            </span>
            <span className="text-[11px] text-slate-500">
              {citation.pageNumber ? `Page ${citation.pageNumber}` : 'Document Reference'}
              {citation.section ? ` • ${citation.section}` : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          {citation.relevanceScore !== undefined && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100/80 text-emerald-800 border border-emerald-200/60">
              <ShieldCheck className="w-2.5 h-2.5" />
              {Math.round(citation.relevanceScore * 100)}% Match
            </span>
          )}
          {onViewDocument && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDocument(citation.documentId, citation.pageNumber);
              }}
              title="View in Document"
              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
            >
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
          <span className="text-slate-400">
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="px-3 pb-2.5 pt-1 border-t border-blue-200/60 bg-white/70">
          <p className="text-[11px] font-mono text-slate-600 leading-relaxed bg-slate-50 p-2 rounded border border-slate-200/70 select-text">
            &ldquo;{citation.snippet}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
};
