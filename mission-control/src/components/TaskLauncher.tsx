'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Zap, Bot, Shuffle, ChevronDown } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useMissionStore } from '@/store/useMissionStore';
import { sendTask, approve, reject } from '@/lib/maestro-client';
import { useTranslation } from 'react-i18next';

type ExecutionMode = 'cascade' | 'flash' | 'clawdbot';

const getModeConfig = (t: any): Record<ExecutionMode, { icon: React.ReactNode; label: string; color: string; desc: string }> => ({
    cascade: { icon: <Shuffle size={16} />, label: t('tasks.modes.cascade.label'), color: 'text-buoy-orange', desc: t('tasks.modes.cascade.desc') },
    flash: { icon: <Zap size={16} />, label: t('tasks.modes.flash.label'), color: 'text-status-amber', desc: t('tasks.modes.flash.desc') },
    clawdbot: { icon: <Bot size={16} />, label: t('tasks.modes.clawdbot.label'), color: 'text-status-blue', desc: t('tasks.modes.clawdbot.desc') },
});

export default function TaskLauncher() {
    const { taskDraft, setTaskDraft, pendingApproval, setPendingApproval, addToHistory, serverUrl } = useMissionStore();
    const { t } = useTranslation();
    const modeConfig = getModeConfig(t);
    const [mode, setMode] = useState<ExecutionMode>('cascade');
    const [sending, setSending] = useState(false);
    const [showModes, setShowModes] = useState(false);
    const [status, setStatus] = useState<{ type: 'error' | 'success', msg: string } | null>(null);

    const handleSubmit = async () => {
        if (!taskDraft.trim() || sending) return;
        setSending(true);
        setStatus(null);

        try {
            await sendTask(taskDraft.trim(), mode);
            Haptics.impact({ style: ImpactStyle.Medium }).catch(() => { });

            addToHistory({
                id: `t_${Date.now()}`,
                title: taskDraft.trim(),
                executor: mode === 'cascade' ? 'jules' : mode,
                status: 'running',
                timestamp: Date.now(),
            });

            setTaskDraft('');
            setStatus({ type: 'success', msg: t('tasks.status.success') });
            setTimeout(() => setStatus(null), 3000);
        } catch (err: any) {
            console.error('Task send failed:', err);
            setStatus({ type: 'error', msg: `Failed: ${err.message || 'Unknown error'}` });
            // Alert user for visibility in APK
            alert(`Error: ${err.message}\nCheck URL: ${serverUrl}`);
        } finally {
            setSending(false);
        }
    };

    const handleApprove = async () => {
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => { });
        await approve();
        setPendingApproval(null);
    };

    const handleReject = async () => {
        Haptics.impact({ style: ImpactStyle.Medium }).catch(() => { });
        await reject();
        setPendingApproval(null);
    };

    const currentMode = modeConfig[mode];

    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-lg font-display text-glimmer">{t('tasks.title')}</h2>
                <p className="text-2xs text-white/30 mt-1">{t('tasks.subtitle')}</p>
            </motion.div>

            {/* Task Input */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel rounded-2xl p-4"
            >
                <textarea
                    value={taskDraft}
                    onChange={(e) => setTaskDraft(e.target.value)}
                    placeholder={t('tasks.placeholder')}
                    rows={4}
                    className="w-full bg-transparent text-sm text-white/90 placeholder:text-white/20 resize-none outline-none font-sans"
                />

                {/* Mode Selector */}
                <div className="mt-3 border-t border-white/5 pt-3">
                    <button
                        onClick={() => setShowModes(!showModes)}
                        className="flex items-center gap-2 text-xs text-white/50 hover:text-white/70 transition-colors"
                    >
                        <span className={currentMode.color}>{currentMode.icon}</span>
                        <span>{currentMode.label}</span>
                        <span className="text-white/20">—</span>
                        <span className="text-white/30">{currentMode.desc}</span>
                        <ChevronDown size={12} className={`ml-auto transition-transform ${showModes ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Mode Options */}
                    {showModes && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 flex flex-col gap-1"
                        >
                            {(Object.entries(modeConfig) as [ExecutionMode, typeof currentMode][]).map(([key, cfg]) => (
                                <button
                                    key={key}
                                    onClick={() => { setMode(key); setShowModes(false); }}
                                    className={`flex items-center gap-2 text-xs p-2 rounded-lg transition-colors ${mode === key ? 'bg-white/5 text-white' : 'text-white/40 hover:bg-white/3 hover:text-white/60'
                                        }`}
                                >
                                    <span className={cfg.color}>{cfg.icon}</span>
                                    <span>{cfg.label}</span>
                                    <span className="text-white/20 ml-auto">{cfg.desc}</span>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </div>

                {/* Submit Button */}
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSubmit}
                    disabled={!taskDraft.trim() || sending}
                    className={`mt-4 w-full btn-primary rounded-xl py-3 flex items-center justify-center gap-2 ${sending ? 'opacity-50' : ''
                        } ${!taskDraft.trim() ? 'opacity-30 cursor-not-allowed' : ''}`}
                >
                    {sending ? (
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                        <Send size={14} />
                    )}
                    <span>{sending ? t('common.sending') : t('tasks.btn_launch')}</span>
                </motion.button>

                {/* Status Message */}
                <AnimatePresence>
                    {status && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`mt-3 p-2 rounded-lg text-[10px] font-mono text-center border ${status.type === 'success'
                                ? 'bg-status-green/10 border-status-green/20 text-status-green'
                                : 'bg-status-red/10 border-status-red/20 text-status-red'
                                }`}
                        >
                            {status.msg}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Pending Approval */}
            {pendingApproval && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card rounded-2xl p-4"
                    style={{ borderColor: 'rgba(255, 215, 64, 0.2)' }}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <span className="status-dot status-dot-amber" />
                        <span className="text-xs font-mono uppercase tracking-widest text-status-amber">
                            {t('tasks.approval.title')}
                        </span>
                    </div>
                    <p className="text-sm text-white/80 mb-2">{pendingApproval.task}</p>
                    <p className="text-2xs text-white/40 mb-4">{pendingApproval.reason}</p>
                    <div className="flex gap-3">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleApprove}
                            className="btn-primary flex-1 py-2.5 text-xs rounded-xl"
                        >
                            ✅ {t('tasks.approval.btn_approve')}
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleReject}
                            className="btn-glass flex-1 py-2.5 text-xs rounded-xl"
                        >
                            ❌ {t('tasks.approval.btn_reject')}
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
