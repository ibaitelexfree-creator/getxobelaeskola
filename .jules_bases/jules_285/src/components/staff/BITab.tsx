
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, PieChart, Pie, AreaChart, Area, Legend
} from 'recharts';
import {
    TrendingUp, Ship, GraduationCap, DollarSign, Target, Activity, Zap, Info,
    Calendar, ChevronDown, RefreshCcw, ArrowUpRight, ArrowDownRight, Download, FileText, Share2
} from 'lucide-react';
import { startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, format, subYears } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { apiUrl } from '@/lib/api';


interface BIData {
    boatProfitability: { name: string; revenue: number; cost: number; profit: number }[];
    courseDemand: Record<string, Record<string, number>>;
    revenueComparison: any[];
    funnel: { step: string; value: number; fill: string }[];
    kpis: {
        totalRevenue: number;
        totalCost: number;
        totalRentals: number;
        totalInscriptions: number;
        activeBoats: number;
        prevPeriodRevenue: number;
        retentionRate: number;
        totalCouponRevenue: number;
    };
}

export default function BITab() {
    const [data, setData] = useState<BIData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Chronos State
    const [dateRange, setDateRange] = useState({
        start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
    });
    const [activePreset, setActivePreset] = useState<'month' | 'quarter' | 'year' | 'custom'>('month');
    const [compareYoY, setCompareYoY] = useState(true);

    // Target Strategy State
    const [monthlyTarget, setMonthlyTarget] = useState(10000); // Default 10k target
    const [isAdjustingTarget, setIsAdjustingTarget] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                startDate: dateRange.start,
                endDate: dateRange.end,
                compare: compareYoY ? 'yoy' : ''
            });
            const res = await fetch(apiUrl(`/api/admin/bi?${params.toString()}`));
            const json = await res.json();
            if (res.ok) {
                setData(json);
            } else {
                setError(json.error || 'Failed to load BI data');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [dateRange, compareYoY]);

    const setPreset = (preset: 'month' | 'quarter' | 'year') => {
        const now = new Date();
        let start, end;
        if (preset === 'month') {
            start = startOfMonth(now);
            end = endOfMonth(now);
        } else if (preset === 'quarter') {
            start = startOfQuarter(now);
            end = endOfQuarter(now);
        } else {
            start = startOfYear(now);
            end = endOfYear(now);
        }
        setDateRange({
            start: format(start, 'yyyy-MM-dd'),
            end: format(end, 'yyyy-MM-dd')
        });
        setActivePreset(preset);
    };

    const handleExportCSV = () => {
        if (!data) return;

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Informe Business Intelligence - Getxo Bela Eskola\n";
        csvContent += `Periodo: ${dateRange.start} al ${dateRange.end}\n\n`;

        // Boat Stats
        csvContent += "RENTABILIDAD FLOTA\nNombre,Ingresos,Gastos,Beneficio\n";
        data.boatProfitability.forEach(p => {
            csvContent += `${p.name},${p.revenue},${p.cost},${p.profit}\n`;
        });

        // KPIs
        csvContent += "\nMETRICAS CLAVE\nMetrica,Valor\n";
        csvContent += `Ingresos Totales,${data.kpis.totalRevenue}€\n`;
        csvContent += `Costes Mantenimiento,${data.kpis.totalCost}€\n`;
        csvContent += `Beneficio Neto,${data.kpis.totalRevenue - data.kpis.totalCost}€\n`;
        csvContent += `Tasa Fidelizacion,${data.kpis.retentionRate}%\n`;

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `BI_Report_${dateRange.start}_${dateRange.end}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        if (!data) return;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(0, 229, 255); // Accent color
        doc.text("GETXO BELA ESKOLA", 14, 20);

        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100);
        doc.text("Business Intelligence Strategic Report", 14, 30);
        doc.setFontSize(10);
        doc.text(`Periodo: ${dateRange.start} a ${dateRange.end}`, 14, 38);

        // KPIs Table
        autoTable(doc, {
            startY: 45,
            head: [['Metrica Principal', 'Valor']],
            body: [
                ['Ingresos Totales', `${data.kpis.totalRevenue.toLocaleString()}€`],
                ['Costes Mantenimiento', `${data.kpis.totalCost.toLocaleString()}€`],
                ['Beneficio Neto', `${(data.kpis.totalRevenue - data.kpis.totalCost).toLocaleString()}€`],
                ['Tasa de Fidelización', `${data.kpis.retentionRate}%`],
                ['Alquileres Realizados', data.kpis.totalRentals.toString()],
                ['Cursos Contratados', data.kpis.totalInscriptions.toString()],
            ],
            theme: 'striped',
            headStyles: { fillColor: [10, 10, 11] }
        });

        // Boat Profitability
        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 15,
            head: [['Embarcacion / Servicio', 'Ingresos (€)', 'Gastos (€)', 'Beneficio (€)']],
            body: data.boatProfitability.map(p => [p.name, p.revenue, p.cost, p.profit]),
            theme: 'grid',
            headStyles: { fillColor: [0, 229, 255], textColor: [0, 0, 0] }
        });

        doc.save(`BI_Report_${dateRange.start}_${dateRange.end}.pdf`);
    };

    const COLORS = ['#00E5FF', '#FF0055', '#FFCC00', '#00FFAA', '#9900FF', '#FF6600'];

    const courseDemandData = useMemo(() => {
        if (!data?.courseDemand) return [];
        const months = new Set<string>();
        Object.values(data.courseDemand).forEach(mObj => {
            Object.keys(mObj).forEach(m => months.add(m));
        });

        return Array.from(months).sort().map(month => {
            const entry: any = { month };
            Object.keys(data.courseDemand).forEach(courseName => {
                entry[courseName] = data.courseDemand[courseName][month] || 0;
            });
            return entry;
        });
    }, [data]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <div className="w-12 h-12 border-t-2 border-accent rounded-full animate-spin" />
            <p className="text-white/40 font-display italic animate-pulse">Analizando bitácoras de inteligencia...</p>
        </div>
    );

    if (error) return <div className="p-10 text-red-500 bg-red-500/10 border border-red-500/20 rounded-sm">{error}</div>;

    return (
        <div className="space-y-12 animate-premium-in pb-20">
            {/* Chronos Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-sm">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-accent/10 rounded-sm">
                        <Calendar className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                        <div className="text-[10px] text-white/30 font-black uppercase tracking-widest">Periodo de Análisis</div>
                        <div className="text-sm font-display text-white italic">Sistema Chronos Active</div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {[
                        { id: 'month', label: 'Este Mes' },
                        { id: 'quarter', label: 'Trimestre' },
                        { id: 'year', label: 'Año Fiscal' }
                    ].map(p => (
                        <button
                            key={p.id}
                            onClick={() => setPreset(p.id as any)}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm border ${activePreset === p.id ? 'bg-accent text-nautical-black border-accent' : 'text-white/40 border-white/10 hover:border-white/20'}`}
                        >
                            {p.label}
                        </button>
                    ))}
                    <div className="h-8 w-px bg-white/10 mx-2" />
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => { setDateRange(prev => ({ ...prev, start: e.target.value })); setActivePreset('custom'); }}
                        className="bg-white/5 border border-white/10 px-3 py-2 text-[10px] text-white/60 outline-none focus:border-accent rounded-sm"
                    />
                    <span className="text-white/20 text-xs">-</span>
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => { setDateRange(prev => ({ ...prev, end: e.target.value })); setActivePreset('custom'); }}
                        className="bg-white/5 border border-white/10 px-3 py-2 text-[10px] text-white/60 outline-none focus:border-accent rounded-sm"
                    />
                    <button
                        onClick={() => setCompareYoY(!compareYoY)}
                        className={`ml-4 px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all rounded-sm ${compareYoY ? 'border-cyan-500/40 text-cyan-400 bg-cyan-400/5' : 'border-white/10 text-white/20'}`}
                    >
                        Compara YoY {compareYoY ? 'ON' : 'OFF'}
                    </button>

                    <div className="h-8 w-px bg-white/10 mx-4" />

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExportCSV}
                            className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-sm transition-all group"
                            title="Exportar CSV"
                        >
                            <FileText className="w-4 h-4 text-white/40 group-hover:text-white" />
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent border border-accent/20 hover:border-accent text-accent hover:text-nautical-black text-[10px] font-black uppercase tracking-widest transition-all rounded-sm group"
                        >
                            <Download className="w-4 h-4" />
                            <span>Exportar PDF</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 1. Header & KPIs */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 border-b border-white/5 pb-12">
                <div className="space-y-3">
                    <span className="text-accent uppercase tracking-[0.6em] text-[10px] font-black block flex items-center gap-2">
                        <Activity className="w-3 h-3" /> BUSINESS INTELLIGENCE
                    </span>
                    <h2 className="text-5xl md:text-7xl font-display text-white italic">
                        Panel de <span className="text-accent">Estrategia</span>
                    </h2>
                    <p className="text-white/30 text-xs max-w-xl leading-relaxed">
                        Datos del {dateRange.start} al {dateRange.end}. Evalúa la rentabilidad de tu flota, la demanda de cursos y el rendimiento financiero frente a objetivos.
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 w-full lg:w-auto">
                    {[
                        {
                            label: 'INGRESOS',
                            value: `${data?.kpis.totalRevenue.toLocaleString()}€`,
                            icon: <DollarSign className="text-accent" />,
                            color: 'border-accent/20',
                            comparison: data?.kpis.prevPeriodRevenue ? {
                                value: ((data.kpis.totalRevenue - data.kpis.prevPeriodRevenue) / data.kpis.prevPeriodRevenue * 100).toFixed(1),
                                positive: data.kpis.totalRevenue >= data.kpis.prevPeriodRevenue
                            } : null
                        },
                        {
                            label: 'INGRESOS CUPONES',
                            value: `${data?.kpis.totalCouponRevenue?.toLocaleString() || 0}€`,
                            icon: <Zap className="text-yellow-400" />,
                            color: 'border-yellow-500/20'
                        },
                        { label: 'COSTES MTTO', value: `${data?.kpis.totalCost.toLocaleString()}€`, icon: <Activity className="text-red-400" />, color: 'border-red-500/20' },
                        { label: 'BENEFICIO NETO', value: `${((data?.kpis.totalRevenue || 0) - (data?.kpis.totalCost || 0)).toLocaleString()}€`, icon: <Target className="text-green-400" />, color: 'border-green-500/20' },
                        { label: 'FIDELIZACIÓN', value: `${data?.kpis.retentionRate}%`, icon: <TrendingUp className="text-purple-400" />, color: 'border-purple-500/20' }
                    ].map((kpi, i) => (
                        <div key={i} className={`glass-card p-6 border ${kpi.color} group hover:bg-white/5 transition-all relative overflow-hidden`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-white/5 rounded-sm">{kpi.icon}</div>
                                {kpi.comparison && (
                                    <div className={`flex items-center gap-1 text-[9px] font-black tracking-tighter ${kpi.comparison.positive ? 'text-green-400' : 'text-red-400'}`}>
                                        {kpi.comparison.positive ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                                        {kpi.comparison.value}% <span className="text-[7px] text-white/20 ml-0.5">YoY</span>
                                    </div>
                                )}
                            </div>
                            <div className="text-2xl font-mono text-white mb-1 group-hover:scale-110 transition-transform origin-left">{kpi.value}</div>
                            <div className="text-[9px] text-white/40 font-black tracking-widest">{kpi.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Visualizations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* A. Conversion Funnel */}
                <div className="glass-panel p-10 space-y-8 min-h-[500px] flex flex-col relative overflow-hidden">
                    <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

                    <header className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-display text-white italic">Embudo de Fidelización</h3>
                            <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black">Conversión de alumnos a clientes recurrentes</p>
                        </div>
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                    </header>

                    <div className="flex-1 w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.funnel} layout="vertical" margin={{ left: 40, right: 40 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="step" type="category" width={140} axisLine={false} tickLine={false} tick={{ fill: '#ffffff60', fontSize: 10, fontWeight: 'bold' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0A0A0B', border: '1px solid #ffffff10', borderRadius: '4px' }}
                                    itemStyle={{ fontSize: '10px' }}
                                    cursor={{ fill: '#ffffff05' }}
                                    formatter={(value) => [value, 'Usuarios']}
                                />
                                <Bar dataKey="value" radius={[0, 20, 20, 0]} barSize={30}>
                                    {data?.funnel.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.6} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* B. Boat Profitability: Revenue vs Cost */}
                <div className="glass-panel p-10 space-y-8 min-h-[500px] flex flex-col">
                    <header className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-display text-white italic">Análisis ROI de Flota</h3>
                            <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black">Ingresos vs Gastos de Mantenimiento</p>
                        </div>
                        <Info className="w-4 h-4 text-white/10" />
                    </header>

                    <div className="flex-1 w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.boatProfitability} layout="vertical" barGap={0}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff01" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={120} axisLine={false} tickLine={false} tick={{ fill: '#ffffff40', fontSize: 10, fontWeight: 'bold' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0A0A0B', border: '1px solid #ffffff10', borderRadius: '4px' }}
                                    itemStyle={{ fontSize: '10px' }}
                                    cursor={{ fill: '#ffffff05' }}
                                    formatter={(value, name) => [`${value}€`, name === 'revenue' ? 'Ingresos' : 'Gastos']}
                                />
                                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                                <Bar dataKey="revenue" name="Ingresos" fill="#00E5FF" fillOpacity={0.6} radius={[0, 4, 4, 0]} barSize={10} />
                                <Bar dataKey="cost" name="Gastos Mtto" fill="#FF0055" fillOpacity={0.6} radius={[0, 4, 4, 0]} barSize={10} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex gap-4 overflow-x-auto pb-2">
                        {data?.boatProfitability.map((p, i) => (
                            <div key={i} className="flex items-center gap-2 whitespace-nowrap">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{p.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* B. Revenue Comparison: Reality vs Target Burn-up */}
                <div className="glass-panel p-10 space-y-8 min-h-[500px] flex flex-col">
                    <header className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-display text-white italic">Velocidad de Ingresos</h3>
                            <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black">Progreso mensual vs Objetivo: {monthlyTarget.toLocaleString()}€</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {isAdjustingTarget ? (
                                <div className="flex items-center gap-2 animate-premium-in">
                                    <input
                                        type="number"
                                        value={monthlyTarget}
                                        onChange={(e) => setMonthlyTarget(Number(e.target.value))}
                                        className="w-24 bg-white/10 border border-accent/40 text-[10px] text-accent p-1 outline-none"
                                        autoFocus
                                    />
                                    <button onClick={() => setIsAdjustingTarget(false)} className="text-[10px] text-accent font-black">OK</button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsAdjustingTarget(true)}
                                    className="p-2 bg-white/5 hover:bg-accent/10 rounded-sm border border-white/5 hover:border-accent/20 transition-all group"
                                    title="Ajustar Objetivo"
                                >
                                    <Target className="w-4 h-4 text-white/40 group-hover:text-accent group-hover:animate-pulse" />
                                </button>
                            )}
                        </div>
                    </header>

                    <div className="flex-1 w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.revenueComparison}>
                                <defs>
                                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff01" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#ffffff20', fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#ffffff20', fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0A0A0B', border: '1px solid #ffffff10', borderRadius: '4px' }}
                                    itemStyle={{ fontSize: '10px' }}
                                />
                                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 20 }} />
                                <Area type="monotone" dataKey="cumulativeActual" name="Progreso Real" stroke="#00E5FF" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
                                {/* Target Line: Linear distribution to target */}
                                <Line
                                    type="monotone"
                                    dataKey={() => monthlyTarget}
                                    name="Objetivo Táctico"
                                    stroke="#FFD700"
                                    strokeDasharray="5 5"
                                    strokeOpacity={0.4}
                                    dot={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* C. Course Demand Over Time */}
                <div className="glass-panel p-10 col-span-full space-y-8 min-h-[500px] flex flex-col relative overflow-hidden">
                    <div className="absolute top-[-20%] right-[-10%] w-[30%] h-[60%] bg-pink-500/5 blur-[120px] rounded-full pointer-events-none" />

                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-display text-white italic">Densidad de Demanda Académica</h3>
                            <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black">Inscripciones por categoría de curso y mes</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-white/40 uppercase tracking-widest">Vista Mensual</span>
                        </div>
                    </header>

                    <div className="flex-1 w-full pt-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={courseDemandData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#ffffff20', fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#ffffff20', fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0A0A0B', border: '1px solid #ffffff10', borderRadius: '4px' }}
                                />
                                <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ paddingLeft: 40, fontSize: 10 }} />
                                {Object.keys(data?.courseDemand || {}).map((courseName, i) => (
                                    <Line
                                        key={courseName}
                                        type="monotone"
                                        dataKey={courseName}
                                        stroke={COLORS[i % COLORS.length]}
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: COLORS[i % COLORS.length], strokeWidth: 0 }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 3. Decision Support Panel */}
            <div className="glass-panel p-12 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 rounded-sm relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
                    <TrendingUp className="w-32 h-32 text-accent" />
                </div>

                <h4 className="text-3xl font-display text-white italic mb-8">Bitácora de Decisiones <span className="text-accent underline underline-offset-8">Sugeridas</span></h4>

                <div className="grid md:grid-cols-3 gap-8 relative z-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-accent font-black tracking-widest text-[10px]">
                            <Ship className="w-3 h-3" /> CAPACIDAD DE FLOTA
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed font-display italic">
                            {data && data.kpis.totalRentals > 50 ?
                                "La demanda de J80 está superando el 80% de utilización los fines de semana. Considera adquirir una unidad adicional para la temporada alta." :
                                "La flota de Optimist tiene baja rotación. Recomendamos lanzar una oferta 'Family Pack' para llenar los huecos de la tarde."}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-pink-500 font-black tracking-widest text-[10px]">
                            <GraduationCap className="w-3 h-3" /> TENDENCIA ACADÉMICA
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed font-display italic">
                            Los cursos de 'Licencia de Navegación' muestran un pico de demanda en {courseDemandData.length > 0 ? courseDemandData[courseDemandData.length - 1].month : 'este mes'}. Refuerza el staff de instructores para evitar lista de espera.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-yellow-400 font-black tracking-widest text-[10px]">
                            <Target className="w-3 h-3" /> OBJETIVOS FINANCIEROS
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed font-display italic">
                            {data && data.revenueComparison.length > 0 &&
                                data.revenueComparison[data.revenueComparison.length - 1].cumulativeActual > monthlyTarget ?
                                "¡Has superado el objetivo táctico! Con un beneficio neto sólido, es el momento ideal para invertir en marketing agresivo para el próximo trimestre." :
                                `Estás al ${data ? ((data.revenueComparison[data.revenueComparison.length - 1]?.cumulativeActual / monthlyTarget) * 100).toFixed(0) : 0}% de tu objetivo. Considera una campaña de email marketing para reactivar antiguos alumnos.`}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
