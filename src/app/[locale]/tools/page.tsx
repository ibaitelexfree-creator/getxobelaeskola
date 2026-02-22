import Link from 'next/link';
import { Map, Anchor } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Herramientas Náuticas | Getxo Bela Eskola',
  description: 'Colección de herramientas útiles para la navegación: carta náutica, calculadora, etc.',
};

interface PageProps {
  params: { locale: string };
}

export default function ToolsIndex({ params: { locale } }: PageProps) {
  return (
    <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-brand-blue border-b pb-4">Herramientas Náuticas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Carta Nautica Card */}
        <Link href={`/${locale}/tools/nautical-chart`} className="block group h-full focus:outline-none focus:ring-2 focus:ring-brand-blue rounded-lg">
          <div className="border border-slate-200 rounded-lg p-6 hover:shadow-lg transition bg-white h-full flex flex-col items-start text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/5 rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>

            <div className="flex items-center gap-3 mb-4 text-brand-blue w-full z-10">
              <div className="p-3 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors">
                <Map size={24} className="shrink-0" />
              </div>
              <h2 className="text-xl font-bold group-hover:text-brand-accent transition-colors">Carta Náutica</h2>
            </div>

            <p className="text-slate-600 mb-6 flex-grow text-sm leading-relaxed z-10">
              Explora la costa de Bizkaia con OpenSeaMap. Traza rutas, marca waypoints, mide distancias y calcula rumbos de forma interactiva.
            </p>

            <span className="text-sm font-semibold text-brand-blue group-hover:text-brand-accent mt-auto flex items-center gap-1 transition-colors z-10">
              Abrir Herramienta
              <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </div>
        </Link>

        {/* Placeholder */}
        <div className="border-2 border-slate-200 border-dashed rounded-lg p-6 bg-slate-50 flex flex-col items-center justify-center text-slate-400 h-full min-h-[250px] transition hover:bg-slate-100/50">
          <Anchor size={32} className="mb-3 opacity-50" />
          <p className="text-sm font-medium">Más herramientas próximamente...</p>
          <p className="text-xs text-slate-400 mt-1">Estamos trabajando en ello.</p>
        </div>

      </div>
    </div>
  );
}
