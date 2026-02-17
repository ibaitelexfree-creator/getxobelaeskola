'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Compass, Wind, ChevronRight, Award,
    Sparkles, Anchor, Activity, Zap,
    Target, BarChart3, Scan, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

interface Recommendation {
    id: string;
    type: string;
    title: string;
    message: string;
    analysis: string;
    actionLabel: string;
    actionHref: string;
    stats: {
        consistency: number;
        variety: number;
        experience: number;
        specialization: number;
    };
    priority: 'high' | 'critical' | 'medium';
}

interface CareerAdvisorProps {
    recommendations: Recommendation[];
}

export default function CareerAdvisor({ recommendations }: CareerAdvisorProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [showDetail, setShowDetail] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsAnalyzing(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    if (!recommendations || recommendations.length === 0) return null;

    const mainRec = recommendations[0];

    const StatBar = ({ label, value, icon: Icon }: any) => (
        <div className="space-y-1.5 flex-1 min-w-[120px]">
            <div className="flex justify-between items-center text-[8px] uppercase tracking-[0.2em] text-white/40 font-black">
                <span className="flex items-center gap-1.5"><Icon size={10} className="text-accent" /> {label}</span>
                <span>{Math.round(value)}%</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`h-full ${value > 70 ? 'bg-accent' : 'bg-white/40'} shadow-[0_0_10px_rgba(var(--accent-rgb),0.3)]`}
                />
            </div>
        </div>
    );

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
        >
            {/* Neural/Aura Background */}
            <div className="absolute -inset-4 bg-gradient-to-br from-accent/20 via-transparent to-blue-500/10 blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none" />

            <div className={`
                relative z-10 glass-card bg-[#0a1628]/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] 
                overflow-hidden transition-all duration-700
                ${mainRec.priority === 'critical' ? 'ring-1 ring-accent/30 shadow-[0_40px_100px_-20px_rgba(var(--accent-rgb),0.2)]' : 'shadow-2xl'}
            `}>

                <AnimatePresence mode="wait">
                    {isAnalyzing ? (
                        <motion.div
                            key="analyzing"
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-16 flex flex-col items-center justify-center min-h-[300px]"
                        >
                            <div className="relative">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="w-20 h-20 border-t-2 border-r-2 border-accent rounded-full"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Scan className="text-accent animate-pulse" size={24} />
                                </div>
                            </div>
                            <h4 className="mt-8 text-xs font-black uppercase tracking-[0.5em] text-accent animate-pulse">Sincronizando Bitácora...</h4>
                            <p className="mt-2 text-[10px] text-white/20 uppercase tracking-widest">Algoritmo de Carrera Náutica V2.1</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="relative"
                        >
                            {/* Priority Header */}
                            <div className="flex items-center justify-between px-10 pt-8 border-b border-white/5 pb-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-accent/20 border border-accent/40 rounded-full">
                                        <Zap size={10} className="text-accent fill-accent" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-accent">Insight Estratégico</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 opacity-40">
                                        <Activity size={10} />
                                        <span className="text-[8px] uppercase tracking-widest font-bold">Estado: Óptimo</span>
                                    </div>
                                </div>
                                <div className="text-[8px] uppercase tracking-[0.3em] font-black text-white/20">Career AI • Beta</div>
                            </div>

                            <div className="p-10 flex flex-col lg:flex-row gap-12">
                                {/* Left Side: Icon & Stats */}
                                <div className="flex-shrink-0 flex flex-col items-center gap-8 lg:w-48">
                                    <div className="relative group/icon cursor-help" onClick={() => setShowDetail(!showDetail)}>
                                        <div className="w-32 h-32 bg-white/[0.02] border border-white/10 rounded-[2rem] flex items-center justify-center relative overflow-hidden group-hover/icon:border-accent transition-colors">
                                            {/* Dynamic Rings */}
                                            <motion.div
                                                animate={{ rotate: -360 }}
                                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                                className="absolute inset-2 border border-dashed border-white/5 rounded-full"
                                            />
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                                className="absolute inset-8 border border-white/5 rounded-full"
                                            />

                                            <div className="relative z-10 text-accent">
                                                {mainRec.type === 'specialization' && <Target size={40} />}
                                                {mainRec.type === 'path' && <Award size={40} />}
                                                {mainRec.type === 'versatility' && <BarChart3 size={40} />}
                                                {mainRec.type === 'ascension' && <ChevronRight size={40} strokeWidth={3} />}
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-accent text-nautical-black text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                            {mainRec.priority} Step
                                        </div>
                                    </div>
                                </div>

                                {/* Center: Core Message */}
                                <div className="flex-1 space-y-6">
                                    <div>
                                        <h3 className="text-3xl lg:text-4xl font-display font-bold italic text-white mb-4 leading-tight group-hover:text-accent transition-colors">
                                            {mainRec.title}
                                        </h3>
                                        <p className="text-white/60 text-lg leading-relaxed font-light font-serif italic max-w-2xl">
                                            "{mainRec.message}"
                                        </p>
                                    </div>

                                    {/* Intelligence Analysis Block */}
                                    <div className="bg-white/5 border border-white/5 p-6 rounded-2xl border-l-4 border-l-accent">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ShieldCheck size={14} className="text-accent" />
                                            <span className="text-[9px] uppercase tracking-widest font-black text-white/40">Análisis Predictivo</span>
                                        </div>
                                        <p className="text-xs text-white/80 font-medium">
                                            {mainRec.analysis}
                                        </p>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="flex flex-wrap gap-x-8 gap-y-4 pt-4">
                                        <StatBar label="Consistencia" value={mainRec.stats.consistency} icon={Activity} />
                                        <StatBar label="Versatilidad" value={mainRec.stats.variety} icon={BarChart3} />
                                        <StatBar label="Experiencia" value={mainRec.stats.experience} icon={Compass} />
                                    </div>

                                    <div className="pt-8 flex flex-wrap items-center gap-6">
                                        <Link
                                            href={mainRec.actionHref}
                                            className="group/btn relative px-10 py-4 bg-accent text-nautical-black font-black uppercase tracking-[0.2em] text-[10px] rounded-sm overflow-hidden transition-all shadow-2xl hover:shadow-accent/40"
                                        >
                                            <span className="relative z-10 flex items-center gap-3">
                                                {mainRec.actionLabel} <ChevronRight size={14} className="group-hover/btn:translate-x-1.5 transition-transform" />
                                            </span>
                                            <div className="absolute inset-0 bg-white translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                                        </Link>

                                        <div className="hidden sm:flex items-center gap-3">
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-8 h-8 rounded-full border border-nautical-black bg-white/10 flex items-center justify-center text-[10px]">
                                                        ⚓
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest">3 expertos recomiendan esta ruta</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/[0.01] to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 p-8 opacity-[0.02] pointer-events-none">
                    <Compass size={200} strokeWidth={0.5} />
                </div>
            </div>
        </motion.div>
    );
}
