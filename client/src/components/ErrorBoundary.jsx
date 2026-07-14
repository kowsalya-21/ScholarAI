import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';

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

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-[32px] p-8 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-955/30 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center text-rose-500 mx-auto animate-pulse">
              <FiAlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
                Something went wrong
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium font-sans">
                An unexpected error occurred while rendering this page.
              </p>
              {this.state.error && (
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-left">
                  <p className="text-xs font-mono text-slate-600 dark:text-slate-405 break-all">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleRetry}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-primary-600 to-secondary-500 text-white rounded-xl text-xs font-extrabold shadow-md hover:opacity-95 transition-all cursor-pointer font-sans"
              >
                <FiRefreshCw className="text-sm" />
                <span>Retry Rendering</span>
              </button>
              <Link
                to="/"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-extrabold transition-all cursor-pointer font-sans text-center"
              >
                <FiHome className="text-sm" />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
