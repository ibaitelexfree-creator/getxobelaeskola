import { MontessoriNode } from './types';

export const MOCK_TOPICS: MontessoriNode[] = [
    {
        id: 'safety-basics',
        title: 'Seguridad Básica',
        category: 'Safety',
        difficulty: 1,
        prerequisites: [],
        description: 'Fundamentos de seguridad en el mar y equipo personal.',
        position: { x: 0, y: 0 }
    },
    {
        id: 'knots-101',
        title: 'Nudos Marineros I',
        category: 'General',
        difficulty: 1,
        prerequisites: [],
        description: 'Aprende los nudos esenciales: Llano, As de Guía, Ballestrinque.',
        position: { x: 1, y: 0 }
    },
    {
        id: 'parts-of-boat',
        title: 'Partes del Barco',
        category: 'Sailing',
        difficulty: 1,
        prerequisites: [],
        description: 'Nomenclatura básica: Proa, Popa, Babor, Estribor.',
        position: { x: 2, y: 0 }
    },
    {
        id: 'wind-theory',
        title: 'Teoría del Viento',
        category: 'Meteorology',
        difficulty: 2,
        prerequisites: [], // Independent starter
        description: 'Entender barlovento, sotavento y la rosa de los vientos.',
        position: { x: 0, y: 1 }
    },
    {
        id: 'sailing-points',
        title: 'Rumbos de Navegación',
        category: 'Sailing',
        difficulty: 2,
        prerequisites: ['parts-of-boat', 'wind-theory'],
        description: 'Ceñida, Través, Largo y Empopada.',
        position: { x: 1, y: 1 }
    },
    {
        id: 'colregs-intro',
        title: 'Reglamento (RIPPA)',
        category: 'Navigation',
        difficulty: 2,
        prerequisites: ['safety-basics'],
        description: 'Introducción a las normas de prevención de abordajes.',
        position: { x: 2, y: 1 }
    },
    {
        id: 'trim-basics',
        title: 'Trimado de Velas',
        category: 'Sailing',
        difficulty: 3,
        prerequisites: ['sailing-points'],
        description: 'Ajuste fino de las velas para máxima eficiencia.',
        position: { x: 1, y: 2 }
    },
    {
        id: 'man-overboard',
        title: 'Hombre al Agua',
        category: 'Safety',
        difficulty: 3,
        prerequisites: ['safety-basics', 'sailing-points'],
        description: 'Maniobras de recuperación de emergencia.',
        position: { x: 0, y: 2 }
    },
    {
        id: 'navigation-chart',
        title: 'Carta Náutica',
        category: 'Navigation',
        difficulty: 3,
        prerequisites: ['colregs-intro'],
        description: 'Lectura de cartas, símbolos y trazado de rumbos.',
        position: { x: 2, y: 2 }
    },
    {
        id: 'heavy-weather',
        title: 'Mal Tiempo',
        category: 'Meteorology',
        difficulty: 4,
        prerequisites: ['wind-theory', 'trim-basics'],
        description: 'Tácticas para navegar con viento fuerte y olas.',
        position: { x: 1, y: 3 }
    }
];
