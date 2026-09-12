import React from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-4 text-center">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 shadow-lg shadow-rose-500/10">
              <AlertTriangle className="h-8 w-8 animate-pulse" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Something went wrong</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              An unexpected error occurred. ArdhnariShwar remains stable, and you can easily reload the page or head back home.
            </p>
            {this.state.error && (
              <div className="mt-4 max-h-32 overflow-y-auto rounded-xl bg-black/30 p-3 text-left font-mono text-[11px] text-rose-300 border border-white/5 leading-relaxed">
                {this.state.error.toString()}
              </div>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={this.handleReset}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all duration-200"
              >
                <RotateCcw className="h-4 w-4" /> Reload Page
              </button>
              <a
                href="/"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-200"
              >
                <Home className="h-4 w-4" /> Back to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
