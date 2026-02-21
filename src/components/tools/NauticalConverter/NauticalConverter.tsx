'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { History, ArrowRightLeft, Trash2, Anchor, Ship, Thermometer, Gauge, Ruler, Waves, LucideIcon } from 'lucide-react';
import * as conversions from '@/lib/utils/conversions';

type UnitCategory = 'speed' | 'distance' | 'depth' | 'temperature' | 'pressure';

interface ConversionHistoryItem {
  id: string;
  value: number;
  fromUnit: string;
  toUnit: string;
  result: number;
  category: UnitCategory;
  timestamp: number;
}

const CATEGORIES: { id: UnitCategory; icon: LucideIcon; units: string[] }[] = [
  {
    id: 'speed',
    icon: Ship,
    units: ['knots', 'kmh', 'ms']
  },
  {
    id: 'distance',
    icon: Ruler,
    units: ['nautical_miles', 'km', 'meters', 'feet']
  },
  {
    id: 'depth',
    icon: Anchor,
    units: ['meters', 'fathoms']
  },
  {
    id: 'temperature',
    icon: Thermometer,
    units: ['celsius', 'fahrenheit']
  },
  {
    id: 'pressure',
    icon: Gauge,
    units: ['hpa', 'mb', 'inhg']
  }
];

export default function NauticalConverter() {
  const t = useTranslations('tools.nautical_converter');
  const [activeCategory, setActiveCategory] = useState<UnitCategory>('speed');
  const [amount, setAmount] = useState<string>('');
  const [fromUnit, setFromUnit] = useState<string>('knots');
  const [toUnit, setToUnit] = useState<string>('kmh');
  const [result, setResult] = useState<number | null>(null);
  const [history, setHistory] = useState<ConversionHistoryItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    setMounted(true);
    const savedHistory = localStorage.getItem('nautical_converter_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('nautical_converter_history', JSON.stringify(history));
    }
  }, [history, mounted]);

  // Reset units when category changes
  useEffect(() => {
    const category = CATEGORIES.find(c => c.id === activeCategory);
    if (category) {
      setFromUnit(category.units[0]);
      setToUnit(category.units[1] || category.units[0]);
      setAmount('');
      setResult(null);
    }
  }, [activeCategory]);

  const handleConvert = () => {
    const val = parseFloat(amount);
    if (isNaN(val)) return;

    let res = 0;

    // Conversion Logic
    if (activeCategory === 'speed') {
      // Base: Knots
      let valInKnots = val;
      if (fromUnit === 'kmh') valInKnots = conversions.kmhToKnots(val);
      if (fromUnit === 'ms') valInKnots = conversions.msToKnots(val);

      if (toUnit === 'knots') res = valInKnots;
      else if (toUnit === 'kmh') res = conversions.knotsToKmh(valInKnots);
      else if (toUnit === 'ms') res = conversions.knotsToMs(valInKnots);
    }
    else if (activeCategory === 'distance') {
      // Base: Meters
      let valInMeters = val;
      if (fromUnit === 'feet') valInMeters = conversions.feetToMeters(val);
      if (fromUnit === 'nautical_miles') valInMeters = conversions.nauticalMilesToKm(val) * 1000;
      if (fromUnit === 'km') valInMeters = val * 1000;

      if (toUnit === 'meters') res = valInMeters;
      else if (toUnit === 'feet') res = conversions.metersToFeet(valInMeters);
      else if (toUnit === 'km') res = valInMeters / 1000;
      else if (toUnit === 'nautical_miles') res = conversions.kmToNauticalMiles(valInMeters / 1000);
    }
    else if (activeCategory === 'depth') {
      // Base: Meters
      let valInMeters = val;
      if (fromUnit === 'fathoms') valInMeters = conversions.fathomsToMeters(val);

      if (toUnit === 'meters') res = valInMeters;
      else if (toUnit === 'fathoms') res = conversions.metersToFathoms(valInMeters);
    }
    else if (activeCategory === 'temperature') {
      // Base: Celsius
      let valInCelsius = val;
      if (fromUnit === 'fahrenheit') valInCelsius = conversions.fahrenheitToCelsius(val);

      if (toUnit === 'celsius') res = valInCelsius;
      else if (toUnit === 'fahrenheit') res = conversions.celsiusToFahrenheit(valInCelsius);
    }
    else if (activeCategory === 'pressure') {
      // Base: hPa
      let valInHpa = val;
      if (fromUnit === 'mb') valInHpa = val; // 1 mb = 1 hPa
      if (fromUnit === 'inhg') valInHpa = conversions.inHgToHpa(val);

      if (toUnit === 'hpa') res = valInHpa;
      else if (toUnit === 'mb') res = valInHpa;
      else if (toUnit === 'inhg') res = conversions.hpaToInHg(valInHpa);
    }

    setResult(res);

    // Add to history
    const newItem: ConversionHistoryItem = {
      id: Date.now().toString(),
      value: val,
      fromUnit,
      toUnit,
      result: res,
      category: activeCategory,
      timestamp: Date.now()
    };

    setHistory(prev => [newItem, ...prev].slice(0, 10)); // Keep last 10
  };

  // Auto-convert when inputs change
  useEffect(() => {
    if (amount && !isNaN(parseFloat(amount))) {
      handleConvert();
    } else {
      setResult(null);
    }
  }, [amount, fromUnit, toUnit]); // eslint-disable-line react-hooks/exhaustive-deps


  const formatResult = (val: number) => {
    // Determine decimals based on magnitude
    if (Math.abs(val) < 0.01) return val.toExponential(4);
    if (Math.abs(val) < 1) return val.toFixed(4);
    if (Math.abs(val) < 10) return val.toFixed(3);
    return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('nautical_converter_history');
  };

  if (!mounted) return null;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-8">

      {/* Category Selection */}
      <div className="grid grid-cols-5 gap-2 md:gap-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`
                flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200
                ${isActive
                  ? 'bg-nautical-deep border border-brand-blue text-brand-blue shadow-[0_0_15px_rgba(21,79,163,0.3)]'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}
              `}
            >
              <Icon className={`w-6 h-6 mb-2 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
              <span className="text-[10px] uppercase tracking-wider font-semibold">{t(cat.id)}</span>
            </button>
          );
        })}
      </div>

      {/* Calculator Card */}
      <div className="bg-nautical-deep border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">

          {/* Input Side */}
          <div className="flex-1 w-full space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
              {t('input')}
            </label>
            <div className="relative group">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-3xl font-mono text-white placeholder-white/20 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="bg-white/10 border-none text-white text-sm rounded-lg px-3 py-2 focus:ring-0 cursor-pointer hover:bg-white/20 transition-colors"
                >
                  {CATEGORIES.find(c => c.id === activeCategory)?.units.map(u => (
                    <option key={u} value={u} className="bg-nautical-deep text-white">
                      {t(`units.${u}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="text-brand-blue/50">
            <ArrowRightLeft className="w-8 h-8 md:rotate-0 rotate-90" />
          </div>

          {/* Result Side */}
          <div className="flex-1 w-full space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
              {t('result')}
            </label>
            <div className="relative">
              <div className="w-full bg-brand-blue/10 border border-brand-blue/30 rounded-xl px-4 py-4 min-h-[74px] flex items-center justify-between">
                <span className={`text-3xl font-mono ${result !== null ? 'text-brand-blue' : 'text-brand-blue/30'}`}>
                  {result !== null ? formatResult(result) : '---'}
                </span>

                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <select
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value)}
                    className="bg-brand-blue/20 border-none text-brand-blue text-sm rounded-lg px-3 py-2 focus:ring-0 cursor-pointer hover:bg-brand-blue/30 transition-colors font-semibold"
                  >
                    {CATEGORIES.find(c => c.id === activeCategory)?.units.map(u => (
                      <option key={u} value={u} className="bg-nautical-deep text-white">
                        {t(`units.${u}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-gray-400" />
              {t('history')}
            </h3>
            <button
              onClick={clearHistory}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              {t('clear_history')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg p-3 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-gray-400">
                    {(() => {
                        const CatIcon = CATEGORIES.find(c => c.id === item.category)?.icon || Waves;
                        return <CatIcon className="w-4 h-4" />;
                    })()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-mono text-gray-300">
                      {formatResult(item.value)} <span className="text-gray-500 text-xs">{t(`units.${item.fromUnit}`)}</span>
                    </span>
                    <span className="text-xs text-gray-600">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <ArrowRightLeft className="w-4 h-4 text-gray-600" />

                <div className="text-right">
                  <span className="text-lg font-mono text-brand-blue font-bold">
                    {formatResult(item.result)}
                  </span>
                  <div className="text-[10px] text-gray-500 uppercase">{t(`units.${item.toUnit}`)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
