'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { triggerBuild } from '@/lib/api';

export default function BuildTrigger() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleTrigger = async () => {
        setLoading(true);
        setStatus('idle');
        try {
            const result = await triggerBuild('android-build.yml');
            if (result.success) {
                setStatus('success');
                setMessage('Build pipeline initiated on GitHub');
            } else {
                setStatus('error');
                setMessage('Failed to start build');
            }
        } catch (e: any) {
            setStatus('error');
            setMessage(e.message || 'Connection error');
        } finally {
            setLoading(false);
            // Reset status after 5 seconds
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel rounded-2xl p-4 border border-white/10"
        >
            <div className="flex items-center gap-2 mb-3">
                <Rocket size={16} className="text-buoy-orange" />
                <span className="text-xs font-mono uppercase tracking-widest text-white/40">Production Build</span>
            </div>

            <p className="text-2xs text-white/40 mb-4">
                Triggers a full Android APK build on GitHub Actions. Estimated time: 10-15 mins.
            </p>

            <button
                onClick={handleTrigger}
                disabled={loading}
                className={`w-full p-4 rounded-xl flex items-center justify-center gap-3 transition-all ${status === 'success' ? 'bg-status-green/20 text-status-green border border-status-green/30' :
                        status === 'error' ? 'bg-status-red/20 text-status-red border border-status-red/30' :
                            'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                    }`}
            >
                {loading ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        <span className="text-sm font-medium">Initiating...</span>
                    </>
                ) : status === 'success' ? (
                    <>
                        <CheckCircle2 size={18} />
                        <span className="text-sm font-medium">Build Started</span>
                    </>
                ) : status === 'error' ? (
                    <>
                        <AlertCircle size={18} />
                        <span className="text-sm font-medium">Try Again</span>
                    </>
                ) : (
                    <>
                        <Rocket size={18} />
                        <span className="text-sm font-medium">Build Production APK</span>
                    </>
                )}
            </button>

            {message && (
                <p className={`mt-3 text-[10px] text-center ${status === 'success' ? 'text-status-green/60' : 'text-status-red/60'
                    }`}>
                    {message}
                </p>
            )}
        </motion.div>
    );
}
