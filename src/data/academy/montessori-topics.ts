export interface MontessoriTopic {
    id: string;
    slug: string;
    title: string;
    description: string;
    tags: string[];
    difficulty: 1 | 2 | 3;
    type: 'exercise' | 'reading' | 'practice';
}

export const MONTESSORI_TOPICS: MontessoriTopic[] = [
    {
        id: 'nav-001',
        slug: 'reglamento-luces',
        title: 'Luces y Marcas de Navegación',
        description: 'Domina las señales visuales nocturnas para evitar colisiones.',
        tags: ['seguridad', 'reglamento', 'colregs', 'luces'],
        difficulty: 1,
        type: 'practice'
    },
    {
        id: 'nav-002',
        slug: 'prioridades-paso',
        title: 'Prioridades de Paso (RIPA)',
        description: 'Reglas fundamentales para cruces y alcances en el mar.',
        tags: ['seguridad', 'reglamento', 'colregs', 'prioridad'],
        difficulty: 2,
        type: 'exercise'
    },
    {
        id: 'meteo-001',
        slug: 'lectura-nubes',
        title: 'Interpretación de Nubes',
        description: 'Predice el tiempo observando las formaciones nubosas.',
        tags: ['meteorologia', 'nubes', 'prediccion'],
        difficulty: 2,
        type: 'reading'
    },
    {
        id: 'man-001',
        slug: 'nudos-basicos',
        title: 'Nudos Marineros Esenciales',
        description: 'Aprende el As de Guía, Ballestrinque y Llano.',
        tags: ['maniobra', 'nudos', 'basico'],
        difficulty: 1,
        type: 'practice'
    },
    {
        id: 'man-002',
        slug: 'hombre-al-agua',
        title: 'Maniobra de Hombre al Agua',
        description: 'Protocolo de recuperación de emergencia.',
        tags: ['seguridad', 'maniobra', 'emergencia'],
        difficulty: 3,
        type: 'exercise'
    },
    {
        id: 'tec-001',
        slug: 'trimado-velas',
        title: 'Trimado de Velas (Básico)',
        description: 'Ajuste correcto de escotas y drizas para optimizar el rendimiento.',
        tags: ['tecnica', 'velas', 'trimado'],
        difficulty: 2,
        type: 'practice'
    },
    {
        id: 'seg-001',
        slug: 'equipo-seguridad',
        title: 'Equipo de Seguridad Obligatorio',
        description: 'Chalecos, bengalas y extintores: qué llevar y cómo usarlo.',
        tags: ['seguridad', 'equipo', 'normativa'],
        difficulty: 1,
        type: 'reading'
    },
    {
        id: 'tac-001',
        slug: 'rumbo-optimo',
        title: 'Cálculo de Rumbo Óptimo',
        description: 'Estrategias para llegar antes aprovechando el viento.',
        tags: ['tactica', 'navegacion', 'rumbo'],
        difficulty: 3,
        type: 'exercise'
    }
];
