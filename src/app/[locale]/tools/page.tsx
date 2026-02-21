import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Map, Compass } from 'lucide-react';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    return {
        title: 'Nautical Tools | Getxo Bela Eskola'
    };
}

export default async function ToolsPage({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'nautical_chart' });

    return (
        <div className="container mx-auto px-4 py-16 min-h-screen bg-slate-50/30">
            <div className="mb-12">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-accent mb-2 block">Utilities</span>
                <h1 className="text-4xl md:text-5xl font-display italic text-nautical-blue mb-4">Herramientas Náuticas</h1>
                <p className="text-slate-500 max-w-2xl font-light text-lg">Colección de utilidades digitales para la navegación, planificación de rutas y aprendizaje teórico.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Link href={`/${locale}/tools/nautical-chart`} className="group h-full">
                    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-nautical-blue/10 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden h-full flex flex-col">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-nautical-blue/5 rounded-full -mr-20 -mt-20 transition-transform duration-700 group-hover:scale-[2.5] group-hover:bg-nautical-blue/10" />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-nautical-blue mb-6 group-hover:bg-nautical-blue group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:shadow-nautical-blue/20">
                                <Map size={28} strokeWidth={1.5} />
                            </div>

                            <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-nautical-blue transition-colors font-display italic">{t('title')}</h2>
                            <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-grow font-light">{t('subtitle')}</p>

                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-nautical-blue flex items-center gap-2 group-hover:gap-4 transition-all mt-auto">
                                Acceder Herramienta <span className="text-lg leading-none transform group-hover:translate-x-1 transition-transform">→</span>
                            </span>
                        </div>
                    </div>
                </Link>

                {/* Placeholder for future tools */}
                <div className="bg-slate-50/50 rounded-2xl p-8 border-2 border-slate-200/60 border-dashed flex flex-col items-center justify-center text-center group hover:bg-slate-50 transition-colors h-full min-h-[300px]">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Compass size={32} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-400 mb-1">Próximamente</h3>
                    <p className="text-xs text-slate-400 max-w-[200px]">Más herramientas de navegación en desarrollo...</p>
                </div>
            </div>
        </div>
    );
}
