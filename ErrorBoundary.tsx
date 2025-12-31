
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#1a1412] text-[#d4af37] p-8 text-center font-mono">
          <h1 className="text-4xl mb-4">系统过载 | System Overload</h1>
          <p className="mb-8 opacity-80">现实与理想的连接出现了一些波动...</p>
          <div className="bg-black/30 p-4 rounded border border-[#d4af37]/30 max-w-2xl overflow-auto text-left text-xs mb-8">
            <pre className="whitespace-pre-wrap text-red-400">
              {this.state.error && this.state.error.toString()}
            </pre>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 border border-[#d4af37] hover:bg-[#d4af37]/10 transition-colors uppercase tracking-widest"
          >
            重启连接
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
