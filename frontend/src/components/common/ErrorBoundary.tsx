import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled React Runtime Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 text-slate-800">
          <div className="max-w-xl w-full bg-white border border-slate-300 rounded-xl shadow-lg p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600 border-b border-slate-200 pb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Application Error Encountered</h2>
                <p className="text-xs text-slate-500">A runtime exception occurred while rendering this view.</p>
              </div>
            </div>

            <div className="bg-red-50 text-red-900 p-3 rounded text-xs font-mono border border-red-200 overflow-x-auto">
              <strong>{this.state.error?.name || 'Error'}:</strong> {this.state.error?.message}
            </div>

            {this.state.errorInfo?.componentStack && (
              <details className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                <summary className="font-semibold cursor-pointer text-slate-700">Component Stack Trace</summary>
                <pre className="mt-2 text-[10px] overflow-x-auto whitespace-pre-wrap font-mono text-slate-600">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="flex items-center justify-between pt-2">
              <a
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold border border-slate-300"
              >
                <Home className="w-3.5 h-3.5" />
                Return to Portal Home
              </a>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#133054] hover:bg-[#0e233e] text-white rounded text-xs font-semibold shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
