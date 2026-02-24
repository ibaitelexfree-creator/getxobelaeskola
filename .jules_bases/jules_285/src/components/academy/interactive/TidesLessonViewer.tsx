'use client';

import React, { useState } from 'react';
import { TideLesson } from '@/lib/academy/tides-data';
import { ChevronRight, ChevronLeft, Calculator, Info } from 'lucide-react';

interface TidesLessonViewerProps {
  lesson: TideLesson;
}

export default function TidesLessonViewer({ lesson }: TidesLessonViewerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const currentSection = lesson.sections[currentStep];

  const handleNext = () => {
    if (currentStep < lesson.sections.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Basic Markdown parser for Bold text and Lists
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      // Handle Bullet points
      if (line.trim().startsWith('- ')) {
        const text = line.trim().substring(2);
        return (
          <li key={i} className="ml-6 list-disc mb-2">
            {parseBold(text)}
          </li>
        );
      }
      // Handle Headers (rough)
      if (line.startsWith('# ')) {
        return <h3 key={i} className="text-2xl font-bold text-white mt-6 mb-4">{line.substring(2)}</h3>;
      }

      // Regular paragraph (only render if not empty)
      if (line.trim() === '') return <br key={i} />;

      return (
        <p key={i} className="mb-4">
          {parseBold(line)}
        </p>
      );
    });
  };

  const parseBold = (text: string) => {
    return text.split('**').map((part, j) =>
      j % 2 === 1 ? <strong key={j} className="text-white font-bold">{part}</strong> : part
    );
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col md:flex-row shadow-2xl min-h-[600px]">
      {/* Navigation / Sidebar (Mobile: Top, Desktop: Left) */}
      <div className="w-full md:w-64 bg-white/5 border-b md:border-b-0 md:border-r border-white/10 p-6 flex flex-col">
        <h2 className="text-xl font-display italic text-white mb-6 hidden md:block">
          Índice
        </h2>
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
          {lesson.sections.map((section, idx) => (
            <button
              key={section.id}
              onClick={() => setCurrentStep(idx)}
              className={`flex-shrink-0 text-left px-4 py-3 rounded-lg text-sm transition-all duration-200
                ${currentStep === idx
                  ? 'bg-accent text-nautical-black font-bold shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
            >
              <span className="mr-2 opacity-50">{idx + 1}.</span>
              {section.title}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-nautical-black to-[#1a2c42] relative">
        {/* Header of Section */}
        <div className="p-8 border-b border-white/5 bg-black/10">
           <div className="flex items-center gap-3 mb-2">
             <span className="bg-white/10 text-white/60 text-xs font-black px-2 py-1 rounded uppercase tracking-widest">
               Sección {currentStep + 1}/{lesson.sections.length}
             </span>
             {currentSection.interactive && (
               <span className="bg-blue-500/20 text-blue-300 text-xs font-black px-2 py-1 rounded uppercase tracking-widest flex items-center gap-1">
                 <Calculator className="w-3 h-3" /> Interactivo
               </span>
             )}
           </div>
           <h1 className="text-3xl md:text-4xl font-display italic text-white">
             {currentSection.title}
           </h1>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
            {/* Text Content */}
            <div className="prose prose-invert max-w-none mb-8 text-lg text-white/80 leading-relaxed">
               {renderContent(currentSection.content)}
            </div>

            {/* Interactive Widget Injection */}
            {currentSection.interactive === 'rule_12_calculator' && (
              <div className="mt-8 animate-fade-in">
                <RuleOfTwelfthsCalculator />
              </div>
            )}
        </div>

        {/* Footer Navigation */}
        <div className="p-6 border-t border-white/5 flex justify-between items-center bg-black/20 backdrop-blur-sm">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg border border-white/10 transition-colors
              ${currentStep === 0
                ? 'opacity-0 pointer-events-none'
                : 'text-white hover:bg-white/10'
              }`}
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>

          <div className="flex gap-1">
             {lesson.sections.map((_, idx) => (
               <div
                 key={idx}
                 className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'bg-accent w-8' : 'bg-white/20 w-2'}`}
               />
             ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentStep === lesson.sections.length - 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-bold
              ${currentStep === lesson.sections.length - 1
                ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
                : 'bg-accent text-nautical-black hover:bg-white'
              }`}
          >
            {currentStep === lesson.sections.length - 1 ? 'Completado' : 'Siguiente'}
            {currentStep < lesson.sections.length - 1 && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Interactive Widget: Rule of Twelfths Calculator
 */
function RuleOfTwelfthsCalculator() {
  const [startHeightStr, setStartHeightStr] = useState<string>("1.0");
  const [endHeightStr, setEndHeightStr] = useState<string>("4.5");

  const startHeight = parseFloat(startHeightStr) || 0;
  const endHeight = parseFloat(endHeightStr) || 0;

  // Calculate amplitude (Range)
  const range = endHeight - startHeight;
  const twelfth = range / 12;

  // Generate the hourly breakdown
  const hours = [
    { label: 'Hora 0 (Inicio)', factor: 0, height: startHeight },
    { label: '1ª Hora', factor: 1, height: startHeight + (twelfth * 1) },
    { label: '2ª Hora', factor: 2, height: startHeight + (twelfth * (1+2)) }, // 3/12
    { label: '3ª Hora', factor: 3, height: startHeight + (twelfth * (1+2+3)) }, // 6/12 (Half tide)
    { label: '4ª Hora', factor: 3, height: startHeight + (twelfth * (1+2+3+3)) }, // 9/12
    { label: '5ª Hora', factor: 2, height: startHeight + (twelfth * (1+2+3+3+2)) }, // 11/12
    { label: 'Hora 6 (Final)', factor: 1, height: endHeight }, // 12/12
  ];

  return (
    <div className="bg-nautical-black/50 border border-white/10 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-5 h-5 text-accent" />
        <h3 className="text-xl font-bold text-white">Calculadora: Regla de los Duodécimos</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <div className="bg-white/5 p-4 rounded-lg">
             <label htmlFor="startHeight" className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">
               Nivel Inicial (m)
             </label>
             <input
               id="startHeight"
               type="number"
               value={startHeightStr}
               onChange={(e) => setStartHeightStr(e.target.value)}
               step="0.1"
               className="w-full bg-black/40 border border-white/10 rounded px-4 py-2 text-white font-mono focus:border-accent focus:outline-none"
             />
             <p className="text-white/30 text-xs mt-2">Ej: Bajamar o Pleamar</p>
          </div>

          <div className="bg-white/5 p-4 rounded-lg">
             <label htmlFor="endHeight" className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">
               Nivel Final (m)
             </label>
             <input
               id="endHeight"
               type="number"
               value={endHeightStr}
               onChange={(e) => setEndHeightStr(e.target.value)}
               step="0.1"
               className="w-full bg-black/40 border border-white/10 rounded px-4 py-2 text-white font-mono focus:border-accent focus:outline-none"
             />
             <p className="text-white/30 text-xs mt-2">Ej: Siguiente Pleamar o Bajamar</p>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex gap-3 items-start">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200">
              <p className="font-bold mb-1">Amplitud: {Math.abs(range).toFixed(2)}m</p>
              <p>Un duodécimo (1/12) equivale a {Math.abs(twelfth).toFixed(2)}m de cambio.</p>
              <p className="mt-2 text-xs opacity-70">
                {range > 0 ? 'Marea Entrante (Flujo)' : 'Marea Saliente (Reflujo)'}
              </p>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white/5 rounded-lg overflow-hidden border border-white/5">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/10 text-white/60 uppercase text-xs font-bold">
              <tr>
                <th className="px-4 py-3">Intervalo</th>
                <th className="px-4 py-3">Duodécimos</th>
                <th className="px-4 py-3 text-right">Altura (m)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {hours.map((row, idx) => (
                <tr key={idx} className={idx === 0 || idx === 6 ? 'bg-white/5 font-bold text-accent' : 'text-white/80 hover:bg-white/5 transition-colors'}>
                  <td className="px-4 py-3">{row.label}</td>
                  <td className="px-4 py-3 flex gap-1 items-center h-full">
                    {/* Visual representation of twelfths */}
                    {idx > 0 && idx < 6 && Array.from({ length: row.factor }).map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    ))}
                    {(idx === 0 || idx === 6) && <span className="text-xs opacity-50">-</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-lg">
                    {row.height.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
