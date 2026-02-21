import BoatComparator from '@/components/tools/BoatComparator';

export default function ExplorationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Comparador de Embarcaciones</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explora y compara las especificaciones técnicas de nuestra flota.
            Selecciona hasta 3 modelos para ver sus diferencias.
          </p>
        </div>
        <BoatComparator />
      </div>
    </div>
  );
}
