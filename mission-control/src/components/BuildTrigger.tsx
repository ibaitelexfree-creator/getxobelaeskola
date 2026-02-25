'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Loader2, CheckCircle2, AlertCircle, ExternalLink, RefreshCw, Smartphone, Globe } from 'lucide-react';
import { triggerBuildByType, getBuildStatusSummary } from '@/lib/api';

const BUILD_CONFIGS = [
    { id: 'gb-web', name: 'Getxo Web', description: 'Production Web Deployment', icon: Globe },
    { id: 'gb-apk', name: 'Getxo APK', description: 'Android Application Build', icon: Smartphone },
    { id: 'mc-web', name: 'Mission Web', description: 'Dashboard & Control Web', icon: Globe },
    { id: 'mc-apk', name: 'Mission APK', description: 'Control Manager App', icon: Smartphone },
];

export default function BuildTrigger() {
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
    const [statusSummary, setStatusSummary] = useState<Record<string, any>>({});
    const [refreshing, setRefreshing] = useState(false);

    const fetchStatus = async () => {
        setRefreshing(true);
        try {
            const summary = await getBuildStatusSummary();
            setStatusSummary(summary);
        } catch (e) {
            console.error('Failed to fetch build status', e);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    const handleTrigger = async (type: string) => {
        setLoadingMap(prev => ({ ...prev, [type]: true }));
        try {
            const result = await triggerBuildByType(type as any);
            if (result.success) {
                // Wait 3 seconds and refresh status
                setTimeout(fetchStatus, 3000);
            }
        } catch (e: any) {
            console.error(`Trigger failed for ${type}`, e);
        } finally {
            setLoadingMap(prev => ({ ...prev, [type]: false }));
        }
    };

    const getStatusColor = (status: string, conclusion: string) => {
        if (status === 'in_progress' || status === 'queued') return 'text-buoy-orange';
        if (conclusion === 'success') return 'text-status-green';
        if (conclusion === 'failure' || conclusion === 'cancelled') return 'text-status-red';
        return 'text-white/40';
    };

    const getStatusIcon = (status: string, conclusion: string) => {
        if (status === 'in_progress' || status === 'queued') return <Loader2 size={14} className="animate-spin" />;
        if (conclusion === 'success') return <CheckCircle2 size={14} />;
        if (conclusion === 'failure' || conclusion === 'cancelled') return <AlertCircle size={14} />;
        return null;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                    <Rocket size={16} className="text-buoy-orange" />
                    <span className="text-xs font-mono uppercase tracking-widest text-white/40">Fleet Build Systems</span>
                </div>
                <button
                    onClick={fetchStatus}
                    disabled={refreshing}
                    className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white"
                >
                    <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {BUILD_CONFIGS.map(({ id, name, description, icon: Icon }) => {
                    const run = statusSummary[id];
                    const isLoading = loadingMap[id];
                    const statusColor = run ? getStatusColor(run.status, run.conclusion) : 'text-white/40';

                    return (
                        <motion.div
                            key={id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-panel rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-buoy-orange/10 transition-colors">
                                        <Icon size={18} className="text-white/60 group-hover:text-buoy-orange transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-white">{name}</h3>
                                        <p className="text-[10px] text-white/40">{description}</p>
                                    </div>
                                </div>
                                {run && (
                                    <div className={`flex items-center gap-1.5 text-[10px] font-mono ${statusColor} bg-black/20 px-2 py-1 rounded-full border border-white/5`}>
                                        {getStatusIcon(run.status, run.conclusion)}
                                        {run.status === 'in_progress' ? 'Running' : (run.conclusion || 'Pending')}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleTrigger(id)}
                                    disabled={isLoading || (run && run.status === 'in_progress')}
                                    className="flex-1 py-2 px-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <Rocket size={14} />
                                    )}
                                    <span className="text-xs font-medium">Trigger</span>
                                </button>

                                {run && (
                                    <a
                                        href={run.html_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                                        title="View on GitHub"
                                    >
                                        <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>

                            <AnimatePresence>
                                {run && run.conclusion === 'failure' && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="mt-3 pt-3 border-t border-status-red/20 overflow-hidden"
                                    >
                                        <p className="text-[10px] text-status-red flex items-center gap-1">
                                            <AlertCircle size={10} />
                                            Build failed. Check actions for logs.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
