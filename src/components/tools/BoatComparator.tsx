'use client';

import { useState } from 'react';

interface Boat {
  id: string;
  name: string;
  type: string;
  specs: {
    length: string; // Eslora
    beam: string;   // Manga
    displacement: string; // Desplazamiento
    sailArea: string; // Superficie vélica
    price: string; // Precio estimado
    level: string; // Nivel requerido
  };
  image?: string;
  description: string;
}

const BOATS: Boat[] = [
  {
    id: 'optimist',
    name: 'Optimist',
    type: 'Vela Ligera',
    specs: {
      length: '2.30 m',
      beam: '1.13 m',
      displacement: '35 kg',
      sailArea: '3.5 m²',
      price: '~2.500 €',
      level: 'Principiante (Infantil)'
    },
    description: 'El barco ideal para la iniciación de los más pequeños. Estable y seguro.'
  },
  {
    id: 'laser',
    name: 'Laser (ILCA 7)',
    type: 'Vela Ligera',
    specs: {
      length: '4.23 m',
      beam: '1.37 m',
      displacement: '59 kg',
      sailArea: '7.06 m²',
      price: '~7.000 €',
      level: 'Intermedio'
    },
    description: 'Monoplaza olímpico de gran popularidad. Requiere buena forma física y técnica.'
  },
  {
    id: 'j80',
    name: 'J80',
    type: 'Monotipo / Crucero Regata',
    specs: {
      length: '8.00 m',
      beam: '2.51 m',
      displacement: '1450 kg',
      sailArea: '33.8 m²',
      price: '~40.000 €',
      level: 'Avanzado'
    },
    description: 'Barco de regata muy rápido y divertido, ideal para aprender navegación en equipo.'
  },
  {
    id: 'bavaria30',
    name: 'Bavaria 30',
    type: 'Crucero',
    specs: {
      length: '9.45 m',
      beam: '3.29 m',
      displacement: '4200 kg',
      sailArea: '51 m²',
      price: '~60.000 €',
      level: 'Patrón'
    },
    description: 'Crucero cómodo y seguro para travesías familiares o con amigos.'
  }
];

export default function BoatComparator() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        if (prev.length >= 3) return prev;
        return [...prev, id];
      }
    });
  };

  const selectedBoats = BOATS.filter(b => selectedIds.includes(b.id));

  return (
    <div className="flex flex-col gap-8">
      {/* Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {BOATS.map(boat => {
            const isSelected = selectedIds.includes(boat.id);
            const isDisabled = !isSelected && selectedIds.length >= 3;

            return (
                <div
                    key={boat.id}
                    className={`border rounded-lg p-6 flex flex-col transition-all cursor-pointer ${
                        isSelected ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50' : 'border-gray-200 bg-white hover:border-blue-300'
                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => !isDisabled && toggleSelection(boat.id)}
                    role="button"
                    tabIndex={isDisabled ? -1 : 0}
                    onKeyDown={(e) => {
                        if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault();
                            toggleSelection(boat.id);
                        }
                    }}
                    aria-pressed={isSelected}
                    aria-disabled={isDisabled}
                >
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-gray-900">{boat.name}</h3>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                            {isSelected && (
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-2 font-medium">{boat.type}</p>
                    <p className="text-sm text-gray-600 mb-4 flex-grow">{boat.description}</p>
                    <div className="text-xs text-gray-400 mt-auto">Click para comparar</div>
                </div>
            );
        })}
      </div>

      {/* Comparison Table */}
      {selectedBoats.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mt-8">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="p-4 font-semibold text-gray-600 w-1/4">Especificación</th>
                            {selectedBoats.map(boat => (
                                <th key={boat.id} className="p-4 font-bold text-gray-900 min-w-[150px]">
                                    {boat.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="p-4 text-gray-600 font-medium bg-gray-50/50">Eslora</td>
                            {selectedBoats.map(boat => <td key={boat.id} className="p-4 text-gray-800">{boat.specs.length}</td>)}
                        </tr>
                        <tr>
                            <td className="p-4 text-gray-600 font-medium bg-gray-50/50">Manga</td>
                            {selectedBoats.map(boat => <td key={boat.id} className="p-4 text-gray-800">{boat.specs.beam}</td>)}
                        </tr>
                        <tr>
                            <td className="p-4 text-gray-600 font-medium bg-gray-50/50">Desplazamiento</td>
                            {selectedBoats.map(boat => <td key={boat.id} className="p-4 text-gray-800">{boat.specs.displacement}</td>)}
                        </tr>
                        <tr>
                            <td className="p-4 text-gray-600 font-medium bg-gray-50/50">Superficie Vélica</td>
                            {selectedBoats.map(boat => <td key={boat.id} className="p-4 text-gray-800">{boat.specs.sailArea}</td>)}
                        </tr>
                        <tr>
                            <td className="p-4 text-gray-600 font-medium bg-gray-50/50">Precio Estimado</td>
                            {selectedBoats.map(boat => <td key={boat.id} className="p-4 text-gray-800 font-semibold text-green-700">{boat.specs.price}</td>)}
                        </tr>
                        <tr>
                            <td className="p-4 text-gray-600 font-medium bg-gray-50/50">Nivel Requerido</td>
                            {selectedBoats.map(boat => (
                                <td key={boat.id} className="p-4 text-gray-800">
                                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                                        {boat.specs.level}
                                    </span>
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
      ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">Selecciona al menos una embarcación para ver la tabla comparativa.</p>
          </div>
      )}
    </div>
  );
}
