'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gauge, Zap, Search, Activity, Box, ArrowUpRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { runPerformanceAudit, getBundleSizes } from '@/lib/api';

export default function PerformanceAuditor() {
    const [auditLoading, setAuditLoading] = useState(false);
    const [report, setReport] = useState<any>(null);
    const [bundleSizes, setBundleSizes] = useState<any[]>([]);
    const [loadingSizes, setLoadingSizes] = useState(false);

    const fetchBundleSizes = async () => {
        setLoadingSizes(true);
        try {
            const sizes = await getBundleSizes();
            setBundleSizes(sizes);
        } catch (e) {
            console.error('Failed to fetch bundle sizes', e);
        } finally {
            setLoadingSizes(false);
        }
    };

    useEffect(() => {
        fetchBundleSizes();
    }, []);

    const handleRunAudit = async () => {
        setAuditLoading(true);
        try {
            const result = await runPerformanceAudit();
            setReport(result);
        } catch (e) {
            alert('Lighthouse audit failed. Make sure Browserless is configured.');
        } finally {
            setAuditLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-status-green';
        if (score >= 50) return 'text-status-amber';
        return 'text-status-red';
    };

    return (
        <div className="space-y-4 pt-4 border-t border-white/5 mt-4">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <Activity size={16} className="text-buoy-orange" />
                    <span className="text-xs font-mono uppercase tracking-widest text-white/40">Performance Core</span>
                </div>
                <button
                    onClick={handleRunAudit}
                    disabled={auditLoading}
                    className="text-[10px] bg-buoy-orange/10 hover:bg-buoy-orange/20 text-buoy-orange px-2 py-0.5 rounded border border-buoy-orange/20 transition-all flex items-center gap-1"
                >
                    {auditLoading ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
                    Run Audit
                </button>
            </div>

            {/* Performance Scores */}
            <div className="grid grid-cols-4 gap-2">
                {report ? (
                    Object.entries(report.scores).map(([key, score]: any) => (
                        <div key={key} className="glass-panel p-2 rounded-lg text-center border border-white/5">
                            <p className={`text-lg font-display ${getScoreColor(score)}`}>{score}</p>
                            <p className="text-[8px] uppercase tracking-tighter text-white/40">{key}</p>
                        </div>
                    ))
                ) : (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="glass-panel p-2 rounded-lg text-center border border-white/5 opacity-40">
                            <p className="text-lg font-display text-white/20">--</p>
                            <p className="text-[8px] uppercase tracking-tighter text-white/20">Metric</p>
                        </div>
                    ))
                )}
            </div>

            {/* Bundle Analyzer Card */}
            <div className="glass-panel rounded-xl p-3 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Box size={14} className="text-white/40" />
                        <span className="text-[10px] font-medium text-white/60">Next.js Bundle Stats</span>
                    </div>
                    <span className="text-[10px] font-mono text-status-green">Optimal</span>
                </div>

                <div className="space-y-2">
                    {loadingSizes ? (
                        <div className="flex justify-center py-4">
                            <Loader2 size={16} className="text-white/10 animate-spin" />
                        </div>
                    ) : (
                        bundleSizes.map((item, idx) => (
                            <div key={idx} className="flex flex-col gap-1">
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-white/40">{item.name}</span>
                                    <span className="text-white/60 font-mono">{item.size}</span>
                                </div>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: parseInt(item.size) > 100 ? '70%' : '30%' }}
                                        className={`h-full ${item.status === 'warning' ? 'bg-status-amber' : 'bg-status-green'}`}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {report && (
                <div className="p-2 rounded bg-buoy-orange/5 border border-buoy-orange/10">
                    <p className="text-[9px] text-buoy-orange/80 font-mono">
                        LCP: {report.metrics.lcp} | CLS: {report.metrics.cls} | TBT: {report.metrics.tbt}
                    </p>
                </div>
            )}
        </div>
    );
}
