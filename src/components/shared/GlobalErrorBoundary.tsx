'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console
    console.error('GlobalErrorBoundary caught an error:', error, errorInfo);

    // Send error report to the internal API route
    const payload = {
      title: 'Global Error Boundary Caught Error',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
      timestamp: new Date().toISOString(),
    };

    fetch('/api/monitoring/log-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).catch((err) => {
      console.error('Failed to send error report to monitoring API:', err);
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6 text-center">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We apologize for the inconvenience. An unexpected error has occurred. Our team has been notified.
            </p>
            <button
              onClick={this.handleReset}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
