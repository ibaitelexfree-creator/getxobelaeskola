<<<<<<< HEAD
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Zap, Bot, Shuffle, ChevronDown, MessagesSquare, Shield, Palette, CheckCircle, Database, Eye, Terminal, Info } from 'lucide-react';
import { useMissionStore } from '@/store/useMissionStore';
import { sendTask, approve, reject, sendQuestion } from '@/lib/maestro-client';

type ExecutionMode = 'cascade' | 'flash' | 'clawdbot';

const modeConfig: Record<ExecutionMode, { icon: React.ReactNode; label: string; color: string; desc: string }> = {
    cascade: { icon: <Shuffle size={16} />, label: 'Cascade', color: 'text-buoy-orange', desc: 'Jules → Flash → ClawdBot' },
    flash: { icon: <Zap size={16} />, label: 'Flash Only', color: 'text-status-amber', desc: 'Gemini Flash direct' },
    clawdbot: { icon: <Bot size={16} />, label: 'ClawdBot', color: 'text-status-blue', desc: 'Direct bypass' },
};

export default function TaskLauncher() {
    const [description, setDescription] = useState('');
    const [mode, setMode] = useState<ExecutionMode>('cascade');
    const [sending, setSending] = useState(false);
    const [showModes, setShowModes] = useState(false);
    const [question, setQuestion] = useState('');
    const [selectedJules, setSelectedJules] = useState<'1' | '2' | '3'>('1');
    const [asking, setAsking] = useState(false);
    const { pendingApproval, setPendingApproval, addToHistory } = useMissionStore();

    const handleSubmit = async () => {
        if (!description.trim() || sending) return;
        setSending(true);

        try {
            await sendTask(description.trim(), mode);
            addToHistory({
                id: `t_${Date.now()}`,
                title: description.trim(),
                executor: mode === 'cascade' ? 'jules' : mode,
                status: 'running',
                timestamp: Date.now(),
            });
            setDescription('');
        } catch (err) {
            console.error('Task send failed:', err);
        } finally {
            setSending(false);
        }
    };

    const handleApprove = async () => {
        await approve();
        setPendingApproval(null);
    };

    const handleReject = async () => {
        await reject();
        setPendingApproval(null);
    };

    const handleAsk = async () => {
        if (!question.trim() || asking) return;
        setAsking(true);
        try {
            await sendQuestion(question.trim(), selectedJules);
            setQuestion('');
        } catch (err) {
            console.error('Question send failed:', err);
        } finally {
            setAsking(false);
        }
    };

    const currentMode = modeConfig[mode];

    const julesConfig = {
        '1': { label: 'Jules 1', role: 'Analytics', icon: <Eye size={14} />, color: 'text-status-blue', desc: 'Tinybird MCP (Read Only). Detecta anomalías y testea entornos Preview de Render.' },
        '2': { label: 'Jules 2', role: 'Data Eng', icon: <Database size={14} />, color: 'text-status-green', desc: 'Neon MCP. Opera en branches, no edita código. Reportes SQL.' },
        '3': { label: 'Jules 3', role: 'Dev ORQ', icon: <Terminal size={14} />, color: 'text-status-amber', desc: 'Context7 + Render MCP. Modifica código, genera branches, previews y aprueba merges.' },
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-lg font-display text-glimmer">Launch Task</h2>
                <p className="text-2xs text-white/30 mt-1">Send tasks to the orchestration cascade</p>
            </motion.div>

            {/* Task Input */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel rounded-2xl p-4"
            >
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the task..."
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
                    disabled={!description.trim() || sending}
                    className={`mt-4 w-full btn-primary rounded-xl py-3 flex items-center justify-center gap-2 ${sending ? 'opacity-50' : ''
                        } ${!description.trim() ? 'opacity-30 cursor-not-allowed' : ''}`}
                >
                    {sending ? (
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                        <Send size={14} />
                    )}
                    <span>{sending ? 'Sending...' : 'Launch Task'}</span>
                </motion.button>
            </motion.div>

            {/* Direct Question Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel rounded-2xl p-4 mt-2"
            >
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-buoy-orange/10 flex items-center justify-center">
                        <MessagesSquare size={16} className="text-buoy-orange" />
                    </div>
                    <div>
                        <h3 className="text-sm font-display text-white/90">Preguntar a Jules</h3>
                        <p className="text-2xs text-white/30 font-mono uppercase tracking-wider">Direct Consultation</p>
                    </div>
                </div>

                {/* Jules Selector */}
                <div className="flex gap-2 mb-4 p-1 bg-white/5 rounded-xl">
                    {(['1', '2', '3'] as const).map((id) => (
                        <button
                            key={id}
                            onClick={() => setSelectedJules(id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-2xs font-mono transition-all ${selectedJules === id
                                ? 'bg-white/10 text-white shadow-lg shadow-black/20'
                                : 'text-white/30 hover:text-white/50'
                                }`}
                        >
                            <span className={selectedJules === id ? julesConfig[id].color : ''}>
                                {julesConfig[id].icon}
                            </span>
                            <span>{julesConfig[id].label}</span>
                        </button>
                    ))}
                </div>

                <div className="flex items-start gap-2 mb-4 p-2 bg-white/5 rounded-lg text-xs">
                    <Info size={14} className="text-white/40 flex-shrink-0 mt-0.5" />
                    <p className="text-white/60 leading-tight">
                        <strong className="text-white/80">{julesConfig[selectedJules].role}:</strong> {julesConfig[selectedJules].desc}
                    </p>
                </div>

                <div className="relative">
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder={`Haz una pregunta al ${julesConfig[selectedJules].role}...`}
                        rows={3}
                        className="w-full bg-white/3 rounded-xl p-3 text-sm text-white/90 placeholder:text-white/20 resize-none outline-none border border-white/5 focus:border-white/10 transition-colors"
                    />

                    <button
                        onClick={handleAsk}
                        disabled={!question.trim() || asking}
                        className={`absolute bottom-3 right-3 p-2 rounded-lg bg-buoy-orange text-black transition-all ${!question.trim() || asking ? 'opacity-30 cursor-not-allowed scale-90' : 'hover:scale-105 active:scale-95 shadow-lg shadow-buoy-orange/20'
                            }`}
                    >
                        {asking ? (
                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                            <Send size={14} />
                        )}
                    </button>
                </div>

                <p className="text-[10px] text-white/20 mt-3 text-center italic">
                    Las preguntas se envían al Hub Central de Telegram
                </p>
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
                            ClawdBot Approval
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
                            ✅ Approve
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleReject}
                            className="btn-glass flex-1 py-2.5 text-xs rounded-xl"
                        >
                            ❌ Reject
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
=======
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Zap, Bot, Shuffle, ChevronDown } from 'lucide-react';
import { useMissionStore } from '@/store/useMissionStore';
import { sendTask, approve, reject } from '@/lib/maestro-client';

type ExecutionMode = 'cascade' | 'flash' | 'clawdbot';

const modeConfig: Record<ExecutionMode, { icon: React.ReactNode; label: string; color: string; desc: string }> = {
    cascade: { icon: <Shuffle size={16} />, label: 'Cascade', color: 'text-buoy-orange', desc: 'Jules → Flash → ClawdBot' },
    flash: { icon: <Zap size={16} />, label: 'Flash Only', color: 'text-status-amber', desc: 'Gemini Flash direct' },
    clawdbot: { icon: <Bot size={16} />, label: 'ClawdBot', color: 'text-status-blue', desc: 'Direct bypass' },
};

export default function TaskLauncher() {
    const [description, setDescription] = useState('');
    const [mode, setMode] = useState<ExecutionMode>('cascade');
    const [sending, setSending] = useState(false);
    const [showModes, setShowModes] = useState(false);
    const { pendingApproval, setPendingApproval, addToHistory } = useMissionStore();

    const handleSubmit = async () => {
        if (!description.trim() || sending) return;
        setSending(true);

        try {
            await sendTask(description.trim(), mode);
            addToHistory({
                id: `t_${Date.now()}`,
                title: description.trim(),
                executor: mode === 'cascade' ? 'jules' : mode,
                status: 'running',
                timestamp: Date.now(),
            });
            setDescription('');
        } catch (err) {
            console.error('Task send failed:', err);
        } finally {
            setSending(false);
        }
    };

    const handleApprove = async () => {
        await approve();
        setPendingApproval(null);
    };

    const handleReject = async () => {
        await reject();
        setPendingApproval(null);
    };

    const currentMode = modeConfig[mode];

    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-lg font-display text-glimmer">Launch Task</h2>
                <p className="text-2xs text-white/30 mt-1">Send tasks to the orchestration cascade</p>
            </motion.div>

            {/* Task Input */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel rounded-2xl p-4"
            >
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the task..."
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
                    disabled={!description.trim() || sending}
                    className={`mt-4 w-full btn-primary rounded-xl py-3 flex items-center justify-center gap-2 ${sending ? 'opacity-50' : ''
                        } ${!description.trim() ? 'opacity-30 cursor-not-allowed' : ''}`}
                >
                    {sending ? (
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                        <Send size={14} />
                    )}
                    <span>{sending ? 'Sending...' : 'Launch Task'}</span>
                </motion.button>
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
                            ClawdBot Approval
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
                            ✅ Approve
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleReject}
                            className="btn-glass flex-1 py-2.5 text-xs rounded-xl"
                        >
                            ❌ Reject
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
>>>>>>> pr-286
