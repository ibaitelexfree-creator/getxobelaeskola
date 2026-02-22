'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePolling } from '@/hooks/usePolling';
import { useMissionStore } from '@/store/useMissionStore';
import Dashboard from '@/components/Dashboard';
import TaskLauncher from '@/components/TaskLauncher';
import QueueHistory from '@/components/QueueHistory';
import ControlPanel from '@/components/ControlPanel';
import BottomNav from '@/components/BottomNav';
import { useTranslation } from 'react-i18next';
import VisualRelay from '@/components/VisualRelay';
import Settings from '@/components/Settings';
import AtmosphericHUD from '@/components/AtmosphericHUD';
import JulesUrgentBanner from '@/components/JulesUrgentBanner';
import { Camera, Settings as SettingsIcon, X, Activity } from 'lucide-react';

const views: Record<string, React.ComponentType<any>> = {
    dashboard: Dashboard,
    tasks: TaskLauncher,
    queue: QueueHistory,
    visual: VisualRelay,
    control: ControlPanel,
    settings: Settings,
};

export default function MissionControlPage() {
    usePolling();
    const { activeTab, setActiveTab } = useMissionStore();
    const { t } = useTranslation();
    const [sonarActive, setSonarActive] = useState(false);

    // Fallback safe indexing
    const ActiveView = views[activeTab] || Dashboard;

    const triggerDeepScan = () => {
        setSonarActive(true);
        setTimeout(() => setSonarActive(false), 3000);
    };

    return (
        <main className={`h-screen flex flex-col relative transition-colors duration-1000 ${sonarActive ? 'bg-status-blue/10' : ''}`}>
            <div className="bg-mission-mesh fixed inset-0 -z-10" />

            {/* Pro Atmosphere Layer */}
            <AtmosphericHUD />

            <AnimatePresence>
                {sonarActive && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 4 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2 }}
                        className="fixed inset-0 pointer-events-none z-[200] flex items-center justify-center"
                    >
                        <div className="w-[100vw] h-[100vw] rounded-full border-[10px] border-status-blue/20 blur-md" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header - Fixed/Sticky at top */}
            <header className="px-5 pt-safe pb-4 flex items-center justify-between sticky top-0 z-30 bg-nautical-deep/95 backdrop-blur-md border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                    <div
                        onClick={triggerDeepScan}
                        className="w-10 h-10 rounded-xl bg-buoy-orange/10 flex items-center justify-center border border-buoy-orange/20 shadow-lg shadow-buoy-orange/5 relative overflow-hidden cursor-pointer"
                    >
                        <motion.div
                            className="absolute inset-0 bg-buoy-orange/20"
                            animate={{ opacity: [0.2, 0.5, 0.2] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <span className="text-xl relative z-10">🚀</span>
                    </div>
                    <div className="cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                        <h1 className="text-xl font-display text-glimmer tracking-tight">{t('common.title')}</h1>
                        <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em] active:text-status-blue transition-colors">{t('common.subtitle')}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`p-2.5 rounded-xl transition-all border ${activeTab === 'settings' ? 'bg-brass-gold border-brass-gold text-white shadow-[0_0_15px_rgba(184,134,11,0.3)]' : 'glass-card border-white/10 text-white/60 hover:text-white'}`}
                    >
                        <SettingsIcon size={18} />
                    </button>
                </div>
            </header>

            <JulesUrgentBanner />

            {/* Content Area - Uses flex-1 to fill space and scroll internally */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pt-8 pb-32">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full"
                    >
                        <ActiveView />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Navigation */}
            <BottomNav />
        </main>
    );
}
