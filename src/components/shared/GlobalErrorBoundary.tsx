'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('GlobalErrorBoundary caught an error:', error, errorInfo);

    // Send error to monitoring API
    // We use a fire-and-forget approach here to avoid blocking or additional errors
    fetch('/api/monitoring/log-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        url: typeof window !== 'undefined' ? window.location.href : '',
      }),
    }).catch((err) => {
      // If logging fails, we just log to console to avoid infinite loops if the error is network related
      console.error('Failed to log error to monitoring service:', err);
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-nautical-black p-4 z-[9999] relative">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="group bg-card/50 border border-card-border p-8 md:p-12 text-center rounded-sm relative overflow-hidden backdrop-blur-sm max-w-lg w-full"
            >
                {/* Background elements */}
                <div className="absolute inset-0 bg-mesh opacity-[0.03]" />
                <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="waves" width="80" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 0 20 Q 20 0 40 20 T 80 20" fill="none" stroke="currentColor" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#waves)" />
                    </svg>
                </div>

                <div className="relative z-10 space-y-6">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                        className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-4xl mx-auto shadow-2xl transition-all duration-700 text-red-400"
                    >
                        ⚠
                    </motion.div>

                    <div className="space-y-2">
                        <h3 className="text-2xl font-display text-white italic">
                            Oops! Something went wrong.
                        </h3>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="text-foreground/60 font-light text-sm mx-auto"
                        >
                            We&apos;ve been notified and are working to fix it.
                        </motion.p>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                             <div className="text-xs text-left bg-black/50 p-4 rounded overflow-auto text-red-300 max-h-40 mt-4 font-mono">
                                {this.state.error.toString()}
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={this.handleReload}
                            className="inline-flex items-center px-6 py-2 bg-accent text-nautical-black font-bold uppercase tracking-widest text-[10px] hover:bg-white transition-all shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)] rounded-sm cursor-pointer"
                        >
                            Reload Page
                        </button>
                        <a
                            href="/"
                            className="inline-flex items-center px-6 py-2 border border-white/20 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all rounded-sm cursor-pointer"
                        >
                            Go Home
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
