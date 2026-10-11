import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[MedicalAI ErrorBoundary] Caught render exception:', error, errorInfo);
    (window as any).__lastReactError = {
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack
    };
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 border border-rose-200 dark:border-rose-900 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {this.props.fallbackTitle || 'Component Rendering Error'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A non-critical rendering error was intercepted safely by the Medical AI Clinical Safety Guardian.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-left text-[11px] font-mono text-rose-600 dark:text-rose-400 overflow-x-auto max-h-36">
                <div className="font-bold">{this.state.error.name}: {this.state.error.message}</div>
                {this.state.error.stack && (
                  <div className="text-[10px] text-slate-400 mt-1 whitespace-pre-wrap">
                    {this.state.error.stack.slice(0, 300)}...
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={this.handleRetry}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Component</span>
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
