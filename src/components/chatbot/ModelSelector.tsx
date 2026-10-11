import React, { useState, useRef, useEffect } from 'react';
import { AIModelConfig, AIProviderId } from '../../types/chat';
import {
  Cpu,
  Check,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Zap,
  Eye,
  Info,
  Search,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface ModelSelectorProps {
  models: AIModelConfig[];
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  autoFallbackEnabled?: boolean;
  onToggleAutoFallback?: (enabled: boolean) => void;
  disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModelId,
  onSelectModel,
  autoFallbackEnabled = true,
  onToggleAutoFallback,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProviderFilter, setSelectedProviderFilter] = useState<string>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const currentModel = models.find((m) => m.id === selectedModelId) || models[0];

  const filteredModels = models.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.providerLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvider =
      selectedProviderFilter === 'all' || m.provider === selectedProviderFilter;
    return matchesSearch && matchesProvider;
  });

  const getProviderIcon = (provider: AIProviderId) => {
    switch (provider) {
      case 'google':
        return <Sparkles className="w-3.5 h-3.5 text-blue-500" />;
      case 'openai':
        return <Zap className="w-3.5 h-3.5 text-emerald-500" />;
      case 'anthropic':
        return <Cpu className="w-3.5 h-3.5 text-amber-500" />;
      case 'groq':
        return <Zap className="w-3.5 h-3.5 text-orange-500" />;
      case 'clinical-engine':
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />;
    }
  };

  const getProviderBadgeColor = (provider: AIProviderId) => {
    switch (provider) {
      case 'google':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800';
      case 'openai':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
      case 'anthropic':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
      case 'groq':
        return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800';
      case 'clinical-engine':
      default:
        return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800';
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all shadow-2xs ${
          isOpen
            ? 'bg-slate-100 dark:bg-slate-800 border-blue-500 ring-2 ring-blue-500/20 text-slate-900 dark:text-white'
            : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        title="Select AI Clinical Reasoning Model"
      >
        <span className="flex items-center gap-1.5">
          {currentModel ? getProviderIcon(currentModel.provider) : <Cpu className="w-3.5 h-3.5 text-blue-500" />}
          <span className="font-semibold max-w-[120px] sm:max-w-[160px] truncate">
            {currentModel ? currentModel.name : 'Select AI Model'}
          </span>
        </span>

        {/* Live Availability Status Dot */}
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            currentModel?.isAvailable ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
          title={currentModel?.isAvailable ? 'Model Ready & Active' : 'Model unconfigured on server'}
        />

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-500' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header & Search */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-blue-600" />
                Select AI Clinical Model
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {models.filter((m) => m.isAvailable).length} Available
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search models or providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Provider Filter Tabs */}
            <div className="flex items-center gap-1 mt-2 overflow-x-auto pb-0.5 no-scrollbar text-[11px]">
              {['all', 'google', 'openai', 'anthropic', 'groq', 'clinical-engine'].map((prov) => (
                <button
                  key={prov}
                  type="button"
                  onClick={() => setSelectedProviderFilter(prov)}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors capitalize whitespace-nowrap cursor-pointer ${
                    selectedProviderFilter === prov
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                  }`}
                >
                  {prov === 'clinical-engine' ? 'Internal Engine' : prov}
                </button>
              ))}
            </div>
          </div>

          {/* Model Options List */}
          <div className="max-h-72 overflow-y-auto p-1.5 space-y-1">
            {filteredModels.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                No matching models found.
              </div>
            ) : (
              filteredModels.map((model) => {
                const isSelected = model.id === selectedModelId;
                const isAvailable = model.isAvailable;

                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      if (isAvailable) {
                        onSelectModel(model.id);
                        setIsOpen(false);
                      }
                    }}
                    disabled={!isAvailable}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800'
                        : isAvailable
                        ? 'hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer'
                        : 'opacity-55 cursor-not-allowed bg-slate-50/50 dark:bg-slate-800/20'
                    }`}
                  >
                    <div className="mt-0.5">{getProviderIcon(model.provider)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {model.name}
                        </span>

                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${getProviderBadgeColor(
                            model.provider
                          )}`}
                        >
                          {model.providerLabel}
                        </span>

                        {model.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                            {model.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {model.description}
                      </p>

                      {/* Capabilities Row */}
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                        {model.supportsVision && (
                          <span className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400 font-medium">
                            <Eye className="w-2.5 h-2.5" /> Multimodal Vision
                          </span>
                        )}
                        <span>• Context: {model.contextWindow}</span>
                        {!isAvailable && (
                          <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-0.5">
                            <AlertCircle className="w-2.5 h-2.5" /> Requires API Key
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-1 text-blue-600 dark:text-blue-400">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer: Automatic Fallback Settings Toggle */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Resilient Auto-Fallback
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Auto-switch if rate limit or network error occurs
                </div>
              </div>
            </div>

            {onToggleAutoFallback && (
              <button
                type="button"
                onClick={() => onToggleAutoFallback(!autoFallbackEnabled)}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  autoFallbackEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                title={autoFallbackEnabled ? 'Auto-fallback enabled' : 'Auto-fallback disabled'}
              >
                <span
                  className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                    autoFallbackEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
