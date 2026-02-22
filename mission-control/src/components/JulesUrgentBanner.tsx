'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMissionStore } from '@/store/useMissionStore';
import { AlertCircle, ExternalLink, ChevronRight } from 'lucide-react';

export default function JulesUrgentBanner() {
    const { julesWaiting, waitingTasks } = useMissionStore();

    if (!julesWaiting || waitingTasks.length === 0) return null;

    const mainTask = waitingTasks[0];
    const count = waitingTasks.length;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-status-amber overflow-hidden sticky top-[80px] z-[40]"
            >
                <div className="px-5 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0 animate-pulse">
                            <AlertCircle size={20} className="text-black" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-black font-black text-xs uppercase tracking-widest leading-none">
                                Jules needs your input {count > 1 ? `(${count} sessions)` : ''}
                            </h3>
                            <p className="text-black/80 font-bold text-[11px] truncate mt-0.5">
                                {mainTask.title}
                            </p>
                        </div>
                    </div>

                    <a
                        href={mainTask.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-black text-white px-4 py-2 rounded-xl flex items-center gap-2 active:scale-95 transition-transform"
                    >
                        <span className="text-[10px] font-black uppercase tracking-tighter">Open IDE</span>
                        <ExternalLink size={14} />
                    </a>
                </div>

                {/* Visual indicator (urgent progress bar) */}
                <motion.div
                    className="h-1 bg-black/20 w-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
            </motion.div>
        </AnimatePresence>
    );
}
