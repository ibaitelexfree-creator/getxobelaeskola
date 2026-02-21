import NauticalCalculator from '@/components/tools/NauticalCalculator/NauticalCalculator';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora Náutica | Getxo Bela Eskola',
  description: 'Herramienta para cálculo de rumbo, distancia, tiempo y conversión de coordenadas.',
};

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-nautical-deep pt-32 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="inline-block px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-4">
            <span className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase">
              Herramientas
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display text-white">
            Calculadora <span className="text-white/40 italic">Náutica</span>
          </h1>
          <p className="max-w-2xl mx-auto text-sea-foam/60 font-light leading-relaxed">
            Planifica tu travesía con precisión. Calcula rumbos verdaderos y magnéticos,
            estima tiempos de llegada y convierte coordenadas geográficas.
          </p>
        </div>

        {/* Calculator Component */}
        <NauticalCalculator />

      </div>
    </div>
  );
}
