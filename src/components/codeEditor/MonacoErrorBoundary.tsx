// ==========================================
// Monaco Editor - Error Boundary
// ==========================================
// Isolates Monaco failures so the rest of the Studio doesn't break.
// Shows a friendly fallback with retry option.

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class MonacoErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error('[MonacoErrorBoundary] Monaco Editor crashed:', error.message, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-slate-950 text-slate-400 p-6">
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-1">
                Monaco Editor Indisponível
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                O editor de código encontrou um erro inesperado. 
                Tente reiniciar ou utilize o editor leve embutido.
              </p>
            </div>

            {this.state.error && (
              <div className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-left">
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertCircle className="w-3 h-3 text-red-400" />
                  <span className="text-[10px] font-bold text-red-300 uppercase tracking-wider">
                    Detalhes do Erro
                  </span>
                </div>
                <code className="text-[10px] text-slate-400 font-mono break-all">
                  {this.state.error.message}
                </code>
              </div>
            )}

            <button
              onClick={this.handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Tentar Reiniciar Editor</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}