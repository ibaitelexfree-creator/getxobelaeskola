'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
    Gauge,
    Ruler,
    Thermometer,
    Wind,
    ArrowRightLeft,
    History,
    Trash2
} from 'lucide-react';
import {
    convertSpeed,
    convertDistance,
    convertTemperature,
    convertPressure,
    SpeedUnit,
    DistanceUnit,
    TemperatureUnit,
    PressureUnit
} from '@/lib/utils/unit-converter';

type ConversionType = 'speed' | 'distance' | 'temperature' | 'pressure';

interface HistoryItem {
    id: number;
    type: ConversionType;
    inputValue: number;
    inputUnit: string;
    outputValue: number;
    outputUnit: string;
    timestamp: number;
}

export default function NauticalConverter() {
    const t = useTranslations('tools.converter');

    const [activeTab, setActiveTab] = useState<ConversionType>('speed');
    const [inputValue, setInputValue] = useState<string>('');
    const [result, setResult] = useState<number | null>(null);

    // Unit states
    const [speedInput, setSpeedInput] = useState<SpeedUnit>('knots');
    const [speedOutput, setSpeedOutput] = useState<SpeedUnit>('kmh');

    const [distInput, setDistInput] = useState<DistanceUnit>('nautical_miles');
    const [distOutput, setDistOutput] = useState<DistanceUnit>('km');

    const [tempInput, setTempInput] = useState<TemperatureUnit>('celsius');
    const [tempOutput, setTempOutput] = useState<TemperatureUnit>('fahrenheit');

    const [pressInput, setPressInput] = useState<PressureUnit>('hpa');
    const [pressOutput, setPressOutput] = useState<PressureUnit>('inhg');

    const [history, setHistory] = useState<HistoryItem[]>([]);

    // Load history from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('nautical_converter_history');
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load history', e);
            }
        }
    }, []);

    // Save history
    const addToHistory = (val: number, res: number, iUnit: string, oUnit: string) => {
        const newItem: HistoryItem = {
            id: Date.now(),
            type: activeTab,
            inputValue: val,
            inputUnit: iUnit,
            outputValue: res,
            outputUnit: oUnit,
            timestamp: Date.now()
        };
        const newHistory = [newItem, ...history].slice(0, 10);
        setHistory(newHistory);
        localStorage.setItem('nautical_converter_history', JSON.stringify(newHistory));
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem('nautical_converter_history');
    };

    const handleSwap = () => {
        switch (activeTab) {
            case 'speed':
                setSpeedInput(speedOutput);
                setSpeedOutput(speedInput);
                break;
            case 'distance':
                setDistInput(distOutput);
                setDistOutput(distInput);
                break;
            case 'temperature':
                setTempInput(tempOutput);
                setTempOutput(tempInput);
                break;
            case 'pressure':
                setPressInput(pressOutput);
                setPressOutput(pressInput);
                break;
        }
    };

    const handleConvert = () => {
        const val = parseFloat(inputValue);
        if (isNaN(val)) {
            setResult(null);
            return;
        }

        let res = 0;
        let iUnit = '';
        let oUnit = '';

        switch (activeTab) {
            case 'speed':
                res = convertSpeed(val, speedInput, speedOutput);
                iUnit = t(speedInput);
                oUnit = t(speedOutput);
                break;
            case 'distance':
                res = convertDistance(val, distInput, distOutput);
                iUnit = t(distInput);
                oUnit = t(distOutput);
                break;
            case 'temperature':
                res = convertTemperature(val, tempInput, tempOutput);
                iUnit = t(tempInput);
                oUnit = t(tempOutput);
                break;
            case 'pressure':
                res = convertPressure(val, pressInput, pressOutput);
                iUnit = t(pressInput);
                oUnit = t(pressOutput);
                break;
        }

        setResult(res);
        addToHistory(val, res, iUnit, oUnit);
    };

    // Auto convert when inputs change, but don't add to history automatically
    useEffect(() => {
        const val = parseFloat(inputValue);
        if (isNaN(val)) {
            setResult(null);
            return;
        }

        let res = 0;
        switch (activeTab) {
            case 'speed': res = convertSpeed(val, speedInput, speedOutput); break;
            case 'distance': res = convertDistance(val, distInput, distOutput); break;
            case 'temperature': res = convertTemperature(val, tempInput, tempOutput); break;
            case 'pressure': res = convertPressure(val, pressInput, pressOutput); break;
        }
        setResult(res);
    }, [inputValue, activeTab, speedInput, speedOutput, distInput, distOutput, tempInput, tempOutput, pressInput, pressOutput]);


    const tabs = [
        { id: 'speed', label: t('speed'), icon: Wind },
        { id: 'distance', label: t('distance'), icon: Ruler },
        { id: 'temperature', label: t('temperature'), icon: Thermometer },
        { id: 'pressure', label: t('pressure'), icon: Gauge },
    ];

    return (
        <div className="w-full max-w-4xl mx-auto bg-nautical-deep/50 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-nautical-deep p-6 border-b border-white/10 flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-xl text-accent">
                    <ArrowRightLeft className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-display italic text-white">{t('title')}</h2>
                    <p className="text-white/40 text-sm font-light tracking-wide">{t('subtitle')}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id as ConversionType);
                                setInputValue('');
                                setResult(null);
                            }}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm uppercase tracking-widest font-black transition-all whitespace-nowrap
                                ${isActive
                                    ? 'bg-white/5 text-accent border-b-2 border-accent'
                                    : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Main Content */}
            <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
                {/* Converter Panel */}
                <div className="space-y-8">
                    {/* Input Group */}
                    <div className="space-y-4">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-white/40">{t('input')}</label>
                        <div className="flex gap-4">
                            <input
                                type="number"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="0.00"
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-2xl font-mono text-white placeholder-white/10 focus:outline-none focus:border-accent/50 transition-colors"
                            />
                            <div className="w-1/3 min-w-[120px]">
                                {activeTab === 'speed' && (
                                    <select
                                        value={speedInput}
                                        onChange={(e) => setSpeedInput(e.target.value as SpeedUnit)}
                                        className="w-full h-full bg-nautical-black border border-white/10 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-accent/50"
                                    >
                                        <option value="knots">{t('knots')}</option>
                                        <option value="kmh">{t('kmh')}</option>
                                        <option value="ms">{t('ms')}</option>
                                    </select>
                                )}
                                {activeTab === 'distance' && (
                                    <select
                                        value={distInput}
                                        onChange={(e) => setDistInput(e.target.value as DistanceUnit)}
                                        className="w-full h-full bg-nautical-black border border-white/10 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-accent/50"
                                    >
                                        <option value="nautical_miles">{t('nautical_miles')}</option>
                                        <option value="km">{t('km')}</option>
                                        <option value="meters">{t('meters')}</option>
                                        <option value="feet">{t('feet')}</option>
                                        <option value="fathoms">{t('fathoms')}</option>
                                    </select>
                                )}
                                {activeTab === 'temperature' && (
                                    <select
                                        value={tempInput}
                                        onChange={(e) => setTempInput(e.target.value as TemperatureUnit)}
                                        className="w-full h-full bg-nautical-black border border-white/10 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-accent/50"
                                    >
                                        <option value="celsius">{t('celsius')}</option>
                                        <option value="fahrenheit">{t('fahrenheit')}</option>
                                    </select>
                                )}
                                {activeTab === 'pressure' && (
                                    <select
                                        value={pressInput}
                                        onChange={(e) => setPressInput(e.target.value as PressureUnit)}
                                        className="w-full h-full bg-nautical-black border border-white/10 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-accent/50"
                                    >
                                        <option value="hpa">{t('hpa')}</option>
                                        <option value="mb">{t('mb')}</option>
                                        <option value="inhg">{t('inhg')}</option>
                                    </select>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Swap Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={handleSwap}
                            className="p-2 bg-white/5 rounded-full text-white/40 hover:text-accent hover:bg-white/10 transition-all active:scale-95"
                            title={t('swap')}
                        >
                            <ArrowRightLeft className="w-4 h-4 rotate-90" />
                        </button>
                    </div>

                    {/* Output Group */}
                    <div className="space-y-4">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-white/40">{t('output')}</label>
                        <div className="flex gap-4">
                            <div className="flex-1 bg-nautical-black/50 border border-white/10 rounded-xl px-4 py-3 flex items-center">
                                <span className={`text-2xl font-mono ${result !== null ? 'text-accent' : 'text-white/10'}`}>
                                    {result !== null ? result.toLocaleString('en-US', { maximumFractionDigits: 4 }) : '---'}
                                </span>
                            </div>
                            <div className="w-1/3 min-w-[120px]">
                                {activeTab === 'speed' && (
                                    <select
                                        value={speedOutput}
                                        onChange={(e) => setSpeedOutput(e.target.value as SpeedUnit)}
                                        className="w-full h-full bg-nautical-black border border-white/10 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-accent/50"
                                    >
                                        <option value="knots">{t('knots')}</option>
                                        <option value="kmh">{t('kmh')}</option>
                                        <option value="ms">{t('ms')}</option>
                                    </select>
                                )}
                                {activeTab === 'distance' && (
                                    <select
                                        value={distOutput}
                                        onChange={(e) => setDistOutput(e.target.value as DistanceUnit)}
                                        className="w-full h-full bg-nautical-black border border-white/10 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-accent/50"
                                    >
                                        <option value="nautical_miles">{t('nautical_miles')}</option>
                                        <option value="km">{t('km')}</option>
                                        <option value="meters">{t('meters')}</option>
                                        <option value="feet">{t('feet')}</option>
                                        <option value="fathoms">{t('fathoms')}</option>
                                    </select>
                                )}
                                {activeTab === 'temperature' && (
                                    <select
                                        value={tempOutput}
                                        onChange={(e) => setTempOutput(e.target.value as TemperatureUnit)}
                                        className="w-full h-full bg-nautical-black border border-white/10 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-accent/50"
                                    >
                                        <option value="celsius">{t('celsius')}</option>
                                        <option value="fahrenheit">{t('fahrenheit')}</option>
                                    </select>
                                )}
                                {activeTab === 'pressure' && (
                                    <select
                                        value={pressOutput}
                                        onChange={(e) => setPressOutput(e.target.value as PressureUnit)}
                                        className="w-full h-full bg-nautical-black border border-white/10 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-accent/50"
                                    >
                                        <option value="hpa">{t('hpa')}</option>
                                        <option value="mb">{t('mb')}</option>
                                        <option value="inhg">{t('inhg')}</option>
                                    </select>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleConvert}
                        disabled={!inputValue}
                        className="w-full py-4 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-nautical-black font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-accent/20 active:scale-[0.98]"
                    >
                        {t('convert_btn')}
                    </button>
                </div>

                {/* History Panel */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex flex-col h-full min-h-[300px]">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2 text-white/60">
                            <History className="w-4 h-4" />
                            <span className="text-xs uppercase tracking-widest font-bold">{t('history')}</span>
                        </div>
                        {history.length > 0 && (
                            <button
                                onClick={clearHistory}
                                className="text-white/20 hover:text-red-400 transition-colors p-2"
                                title={t('clear_history')}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                        {history.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-white/20 gap-3">
                                <History className="w-8 h-8 opacity-50" />
                                <span className="text-sm font-light italic">{t('no_history')}</span>
                            </div>
                        ) : (
                            history.map((item) => (
                                <div key={item.id} className="bg-nautical-black/40 rounded-lg p-3 border border-white/5 hover:border-white/10 transition-colors group">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] uppercase text-white/30 font-bold tracking-wider">{t(item.type)}</span>
                                        <span className="text-[10px] text-white/20 font-mono">
                                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between font-mono text-sm">
                                        <div className="text-white/70">
                                            <span className="font-bold text-white">{item.inputValue.toLocaleString()}</span>
                                            <span className="text-xs ml-1">{item.inputUnit}</span>
                                        </div>
                                        <ArrowRightLeft className="w-3 h-3 text-white/20" />
                                        <div className="text-accent text-right">
                                            <span className="font-bold">{item.outputValue.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                                            <span className="text-xs ml-1">{item.outputUnit}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
