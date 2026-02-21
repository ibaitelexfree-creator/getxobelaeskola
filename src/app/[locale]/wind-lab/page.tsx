'use client';

import React, { useState, useMemo } from 'react';
import WindRose from '@/components/wind-lab/WindRose';
import { calculateWindStats, WindStats } from '@/lib/wind-lab/utils';
import { ArrowUpRight, Wind, Navigation, Gauge, Anchor } from 'lucide-react';

export default function WindLabPage() {
  const [windAngle, setWindAngle] = useState(45);
  const [windSpeed, setWindSpeed] = useState(12);

  const stats: WindStats = useMemo(() => {
    return calculateWindStats(windAngle, windSpeed);
  }, [windAngle, windSpeed]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-[#0a1628] text-white py-8 px-4 sm:px-8 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Wind className="w-8 h-8 text-[#ca8a04]" />
            <h1 className="text-3xl font-bold tracking-tight">Wind Lab</h1>
          </div>
          <p className="text-slate-300 max-w-2xl">
            Laboratorio interactivo de táctica. Ajusta el viento para analizar la estrategia de navegación, VMG y trimado óptimo.
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Interactive Tool */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 w-full max-w-md flex flex-col items-center">
              <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-[#ca8a04]" />
                Simulador de Viento
              </h2>

              <WindRose
                angle={windAngle}
                speed={windSpeed}
                onChange={(a, s) => {
                  setWindAngle(a);
                  setWindSpeed(s);
                }}
                className="mb-4"
              />

              <div className="w-full mt-4 space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-600">Ángulo Viento (TWA)</span>
                    <span className="text-lg font-bold text-[#0a1628]">{windAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={windAngle}
                    onChange={(e) => setWindAngle(parseInt(e.target.value))}
                    className="w-full accent-[#ca8a04]"
                  />
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-600">Intensidad (TWS)</span>
                    <span className="text-lg font-bold text-[#0a1628]">{windSpeed} kn</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={windSpeed}
                    onChange={(e) => setWindSpeed(parseInt(e.target.value))}
                    className="w-full accent-[#ca8a04]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Analysis Dashboard */}
          <div className="lg:col-span-7 space-y-6">

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Point of Sail Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 col-span-1 sm:col-span-2 border-l-4 border-l-[#ca8a04]">
                <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Rumbo</span>
                <h3 className="text-2xl font-bold text-[#0a1628] mt-1">{stats.pointOfSailLabel}</h3>
                <p className="text-slate-600 mt-2 text-sm">{stats.strategyAdvice}</p>
              </div>

              {/* Speed Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between">
                <div>
                  <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Velocidad Teórica</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <h3 className="text-3xl font-bold text-[#0a1628]">{stats.boatSpeed.toFixed(1)}</h3>
                    <span className="text-sm text-slate-500">kn</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <Gauge className="w-6 h-6 text-blue-600" />
                </div>
              </div>

              {/* VMG Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between">
                <div>
                  <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">VMG (Barlo/Sota)</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <h3 className={`text-3xl font-bold ${stats.vmg >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {stats.vmg.toFixed(1)}
                    </h3>
                    <span className="text-sm text-slate-500">kn</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {stats.vmg > 0 ? 'Ganando barlovento' : 'Ganando sotavento'}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stats.vmg >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                  <ArrowUpRight className={`w-6 h-6 ${stats.vmg >= 0 ? 'text-emerald-600' : 'text-rose-600 rotate-180'}`} />
                </div>
              </div>

               {/* Heel Angle Card */}
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between sm:col-span-2">
                 <div className="w-full">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Escora Estimada</span>
                    <span className="text-sm font-bold text-[#0a1628]">{stats.heelAngle}°</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div
                      className="bg-[#0a1628] h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${(stats.heelAngle / 45) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trim Advice */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-[#0a1628] mb-4 flex items-center gap-2">
                <Anchor className="w-5 h-5 text-[#ca8a04]" />
                Consejos de Trimado
              </h3>
              <ul className="space-y-3">
                {stats.trimAdvice.map((advice, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#ca8a04] flex-shrink-0" />
                    <span className="text-slate-700">{advice}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
