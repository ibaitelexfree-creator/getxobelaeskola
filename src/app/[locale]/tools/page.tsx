import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, Calculator, Map } from 'lucide-react';

export default function ToolsPage() {
  const t = useTranslations('tools.index');

  return (
    <div className="min-h-screen bg-black pt-32 pb-12 px-4 relative overflow-hidden">

        {/* Header */}
        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
            <div className="text-center space-y-4 animate-fade-in">
                <span className="text-brand-blue font-mono text-sm tracking-[0.2em] uppercase">
                    {t('eyebrow')}
                </span>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
                    {t('title')}
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                    {t('description')}
                </p>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Nautical Converter Card */}
                <Link href="/tools/nautical-converter" className="group relative block h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl" />
                    <div className="relative h-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-blue/50 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="w-5 h-5 text-brand-blue -translate-x-4 group-hover:translate-x-0 transition-transform duration-300" />
                        </div>

                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-blue group-hover:scale-110 transition-transform duration-300">
                                <Calculator className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-blue transition-colors">
                                    {t('converter.title')}
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    {t('converter.description')}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider group-hover:text-brand-blue/80 transition-colors">
                                {t('converter.cta')}
                            </span>
                        </div>
                    </div>
                </Link>

                {/* Chart Plotter Card */}
                 <Link href="/academy/tools/chart-plotter" className="group relative block h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl" />
                    <div className="relative h-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-blue/50 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="w-5 h-5 text-brand-blue -translate-x-4 group-hover:translate-x-0 transition-transform duration-300" />
                        </div>

                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-blue group-hover:scale-110 transition-transform duration-300">
                                <Map className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-blue transition-colors">
                                    {t('plotter.title')}
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    {t('plotter.description')}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                             <span className="text-xs font-mono text-gray-500 uppercase tracking-wider group-hover:text-brand-blue/80 transition-colors">
                                {t('plotter.cta')}
                            </span>
                        </div>
                    </div>
                </Link>

            </div>
        </div>
    </div>
  );
}
