
export interface Vessel {
  id: string;
  name: string;
  type: string;
  specs: {
    length: number; // meters
    beam: number; // meters
    displacement: number; // kg
    sailArea: number; // m2
    price: string; // Estimated range
    level: string; // Required skill level
  };
  description: string;
  image?: string;
}

export const vessels: Vessel[] = [
  {
    id: 'optimist',
    name: 'Optimist',
    type: 'Vela Ligera',
    specs: {
      length: 2.30,
      beam: 1.13,
      displacement: 35,
      sailArea: 3.5,
      price: '2.000€ - 3.500€',
      level: 'Iniciación (Infantil)'
    },
    description: 'La embarcación de iniciación por excelencia para niños hasta 15 años. Estable, segura y simple, es la base de la pirámide de la vela mundial.',
    image: '/images/vessels/optimist.png'
  },
  {
    id: 'laser',
    name: 'ILCA (Laser)',
    type: 'Vela Ligera',
    specs: {
      length: 4.23,
      beam: 1.37,
      displacement: 59,
      sailArea: 7.06,
      price: '6.000€ - 9.000€',
      level: 'Intermedio / Avanzado'
    },
    description: 'El barco olímpico más popular del mundo. Exigente físicamente y técnicamente, premia la táctica y la forma física. Disponible con tres aparejos (4.7, Radial, Standard).',
    image: '/images/vessels/laser.png'
  },
  {
    id: 'j80',
    name: 'J80',
    type: 'Monotipo (Keelboat)',
    specs: {
      length: 8.00,
      beam: 2.51,
      displacement: 1450,
      sailArea: 33.8,
      price: '30.000€ - 45.000€',
      level: 'Avanzado / Equipo'
    },
    description: 'Monotipo deportivo de 8 metros, muy popular en España. Combina la seguridad de un barco con quilla con la emoción de un vela ligera. Ideal para regatas de flota y aprendizaje avanzado.',
    image: '/images/vessels/j80.png'
  },
  {
    id: 'bavaria30',
    name: 'Bavaria 30',
    type: 'Crucero',
    specs: {
      length: 9.45,
      beam: 3.29,
      displacement: 4400,
      sailArea: 51.0,
      price: '50.000€ - 75.000€',
      level: 'Patrón de Yate / Crucero'
    },
    description: 'Crucero familiar robusto y espacioso. Prioriza la comodidad y la seguridad sobre la velocidad pura. Perfecto para iniciarse en la navegación de altura y travesías de fin de semana.',
    image: '/images/vessels/bavaria30.png'
  },
  {
    id: '420',
    name: '420',
    type: 'Vela Ligera Doble',
    specs: {
      length: 4.20,
      beam: 1.63,
      displacement: 80, // Hull weight approx
      sailArea: 13.05, // Main + Jib
      price: '5.000€ - 8.000€',
      level: 'Intermedio (Juvenil)'
    },
    description: 'Barco escuela de dos tripulantes con trapecio y spinnaker. Paso natural después del Optimist para aprender trabajo en equipo y manejo de velas de proa.',
    image: '/images/vessels/420.png'
  }
];
