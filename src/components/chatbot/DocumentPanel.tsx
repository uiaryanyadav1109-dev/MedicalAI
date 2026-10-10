import React, { useState, useRef } from 'react';
import { ChatDocument } from '../../types/chat';
import {
  X,
  Upload,
  FileText,
  FileSpreadsheet,
  FileImage,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Search,
  Eye,
  Download,
  GitCompare,
  Layers,
  Sparkles
} from 'lucide-react';

interface DocumentPanelProps {
  documents: ChatDocument[];
  isOpen: boolean;
  onClose: () => void;
  onUploadDocuments: (files: File[]) => void;
  onDeleteDocument: (docId: string) => void;
  onOpenCompare: () => void;
  isProcessing?: boolean;
}

export const DocumentPanel: React.FC<DocumentPanelProps> = ({
  documents,
  isOpen,
  onClose,
  onUploadDocuments,
  onDeleteDocument,
  onOpenCompare,
  isProcessing = false
}) => {
  const [searchDocQuery, setSearchDocQuery] = useState('');
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<ChatDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadDocuments(Array.from(e.target.files));
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownloadText = (doc: ChatDocument) => {
    const blob = new Blob([doc.extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.filename}_extracted.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredDocs = documents.filter((d) =>
    !searchDocQuery.trim()
      ? true
      : d.filename.toLowerCase().includes(searchDocQuery.toLowerCase()) ||
        d.extractedText.toLowerCase().includes(searchDocQuery.toLowerCase())
  );

  const getStatusBadge = (status: ChatDocument['processingStatus']) => {
    switch (status) {
      case 'processed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Processed ✓
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 animate-pulse">
            <Clock className="w-3 h-3 text-blue-600 animate-spin" />
            Processing...
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
            <AlertCircle className="w-3 h-3 text-red-600" />
            Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
            Pending
          </span>
        );
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-2xs z-40 transition-opacity"
      />

      {/* Slide-over Drawer */}
      <aside className="fixed top-0 bottom-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h2 className="font-bold text-sm text-slate-900">
              Document Management ({documents.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls & Upload */}
        <div className="p-3.5 border-b border-slate-200 space-y-2.5 bg-white">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:bg-slate-300"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload New Documents</span>
          </button>

          {documents.length >= 2 && (
            <button
              onClick={() => {
                onClose();
                onOpenCompare();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold shadow-2xs transition-colors"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Launch Document Comparison Mode</span>
            </button>
          )}

          {/* Search inside documents */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchDocQuery}
              onChange={(e) => setSearchDocQuery(e.target.value)}
              placeholder="Search in uploaded documents..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-10 px-4 text-slate-400 text-xs">
              <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              {searchDocQuery
                ? 'No documents matched your query.'
                : 'No documents attached to this chat yet. Upload a blood report, prescription, or clinical scan!'}
            </div>
          ) : (
            filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-3 rounded-xl border border-slate-200/90 bg-white hover:border-blue-300 transition-all shadow-2xs space-y-2"
              >
                {/* File Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="p-2 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <span className="font-semibold text-xs text-slate-900 block truncate" title={doc.filename}>
                        {doc.filename}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span>{(doc.fileSize / 1024).toFixed(0)} KB</span>
                        <span>•</span>
                        <span>{doc.pageCount} {doc.pageCount === 1 ? 'Page' : 'Pages'}</span>
                        {doc.metadata?.documentCategory && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{doc.metadata.documentCategory.replace('_', ' ')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Status + Metadata */}
                <div className="flex items-center justify-between pt-1">
                  {getStatusBadge(doc.processingStatus)}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedDocForPreview(doc)}
                      className="p-1.5 rounded-md text-slate-600 hover:text-blue-600 hover:bg-blue-50 text-xs transition-colors flex items-center gap-1"
                      title="Preview Extracted Content"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Preview</span>
                    </button>
                    <button
                      onClick={() => handleDownloadText(doc)}
                      className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs transition-colors"
                      title="Download Extracted Text"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Summary Snippet */}
                {doc.metadata?.summary && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 line-clamp-2">
                    {doc.metadata.summary}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500">
          <p>
            Documents are processed securely using client-side vector chunking and zero external storage leaks.
          </p>
        </div>
      </aside>

      {/* Preview Modal */}
      {selectedDocForPreview && (
        <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900 truncate">
                  {selectedDocForPreview.filename} (Extracted Text & Tables)
                </h3>
              </div>
              <button
                onClick={() => setSelectedDocForPreview(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed select-text bg-slate-50/50">
              {selectedDocForPreview.extractedText || 'No text extracted from this document.'}
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs">
              <span className="text-slate-500">
                {selectedDocForPreview.pageCount} Pages • {selectedDocForPreview.extractedText.length} Characters
              </span>
              <button
                onClick={() => setSelectedDocForPreview(null)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
