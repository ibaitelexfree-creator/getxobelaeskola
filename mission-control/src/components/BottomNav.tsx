'use client';

import { motion } from 'framer-motion';
import { useMissionStore, Tab } from '@/store/useMissionStore';
<<<<<<< HEAD
import { LayoutDashboard, Rocket, ListOrdered, SlidersHorizontal, Radio, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const getTabs = (t: any): { id: Tab; label: string; icon: React.ReactNode }[] => [
    { id: 'dashboard', label: t('nav.dashboard'), icon: <LayoutDashboard size={20} /> },
    { id: 'tasks', label: t('nav.tasks'), icon: <Rocket size={20} /> },
    { id: 'queue', label: t('nav.queue'), icon: <ListOrdered size={20} /> },
    { id: 'visual', label: t('nav.live'), icon: <Radio size={20} /> },
    { id: 'control', label: t('nav.control'), icon: <SlidersHorizontal size={20} /> },
    { id: 'settings', label: t('nav.settings'), icon: <Settings size={20} /> },
=======
import { LayoutDashboard, Rocket, ListOrdered, SlidersHorizontal } from 'lucide-react';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'tasks', label: 'Tasks', icon: <Rocket size={20} /> },
    { id: 'queue', label: 'Queue', icon: <ListOrdered size={20} /> },
    { id: 'control', label: 'Control', icon: <SlidersHorizontal size={20} /> },
>>>>>>> pr-286
];

export default function BottomNav() {
    const { activeTab, setActiveTab } = useMissionStore();
<<<<<<< HEAD
    const { t } = useTranslation();
    const tabs = getTabs(t);

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel safe-area-bottom border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-around py-3 px-6">
=======

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel safe-area-bottom">
            <div className="flex items-center justify-around py-2 px-4">
>>>>>>> pr-286
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
<<<<<<< HEAD
                            className="flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all duration-300 relative group"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTabGlow"
                                    className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-buoy-orange rounded-full blur-[4px] opacity-50"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                            {isActive && (
                                <motion.div
                                    layoutId="activeTabBg"
                                    className="absolute inset-0 bg-white/5 rounded-xl border border-white/10"
                                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                />
                            )}
                            <span className={`relative z-10 transition-all duration-500 transform ${isActive ? 'text-buoy-orange scale-110' : 'text-white/20 group-hover:text-white/40'
                                }`}>
                                {tab.icon}
                            </span>
                            <span className={`relative z-10 text-[9px] font-mono font-bold tracking-[0.15em] transition-all duration-500 ${isActive ? 'text-white/90 translate-y-0 opacity-100' : 'text-white/20 translate-y-1 opacity-0'
                                }`}>
                                {tab.label.toUpperCase()}
=======
                            className="flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl transition-colors relative"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white/5 rounded-xl"
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            )}
                            <span className={`relative z-10 transition-colors ${isActive ? 'text-buoy-orange' : 'text-white/30'
                                }`}>
                                {tab.icon}
                            </span>
                            <span className={`relative z-10 text-2xs font-mono tracking-wider transition-colors ${isActive ? 'text-white/80' : 'text-white/20'
                                }`}>
                                {tab.label}
>>>>>>> pr-286
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
