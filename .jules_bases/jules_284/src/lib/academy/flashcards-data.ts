export interface FlashcardData {
    id: string;
    category: 'luces' | 'banderas' | 'nudos' | 'radio';
    front: {
        type: 'text' | 'image';
        content: string;
        label?: string; // Optional label (e.g. "Bandera A")
    };
    back: {
        type: 'text';
        title: string;
        description: string;
    };
    difficulty: 'facil' | 'medio' | 'dificil';
}

export const FLASHCARDS_DATA: FlashcardData[] = [
    // --- LUCES ---
    {
        id: 'luz-tope',
        category: 'luces',
        front: { type: 'text', content: 'Luz blanca visible en un arco de 225° hacia proa.' },
        back: {
            type: 'text',
            title: 'Luz de Tope',
            description: 'Es obligatoria en buques de propulsión mecánica. Se coloca sobre el eje longitudinal.'
        },
        difficulty: 'facil'
    },
    {
        id: 'luz-alcance',
        category: 'luces',
        front: { type: 'text', content: 'Luz blanca visible en un arco de 135° hacia popa.' },
        back: {
            type: 'text',
            title: 'Luz de Alcance',
            description: 'Se coloca lo más cerca posible de la popa. Indica que el barco está siendo alcanzado.'
        },
        difficulty: 'facil'
    },
    {
        id: 'luz-remolque',
        category: 'luces',
        front: { type: 'text', content: 'Luz amarilla con las mismas características que la luz de alcance.' },
        back: {
            type: 'text',
            title: 'Luz de Remolque',
            description: 'Se usa cuando se está remolcando otro buque, colocada encima de la luz de alcance.'
        },
        difficulty: 'medio'
    },
    // --- BANDERAS (Simuladas con texto por ahora si no hay imágenes) ---
    {
        id: 'flag-alfa',
        category: 'banderas',
        front: { type: 'text', content: '⬜🟦\n(Blanca y Azul, cola de golondrina)', label: 'Bandera ALFA' }, // Placeholder visual
        back: {
            type: 'text',
            title: 'ALFA',
            description: 'Tengo buzo sumergido; manténgase alejado y reduzca velocidad.'
        },
        difficulty: 'facil'
    },
    {
        id: 'flag-bravo',
        category: 'banderas',
        front: { type: 'text', content: '🟥\n(Roja, cola de golondrina)', label: 'Bandera BRAVO' },
        back: {
            type: 'text',
            title: 'BRAVO',
            description: 'Estoy cargando, descargando o transportando mercancías peligrosas.'
        },
        difficulty: 'medio'
    },
    // --- NUDOS ---
    {
        id: 'nudo-llano',
        category: 'nudos',
        front: { type: 'text', content: 'Se usa para unir dos cabos de la misma mena. No es seguro si hay tensión variable.' },
        back: {
            type: 'text',
            title: 'Nudo Llano / Rizo',
            description: 'El nudo básico por excelencia. Derecha sobre izquierda, izquierda sobre derecha.'
        },
        difficulty: 'facil'
    },
    {
        id: 'nudo-as-guia',
        category: 'nudos',
        front: { type: 'text', content: 'Forma una gaza fija que no se corre ni se aprieta bajo tensión.' },
        back: {
            type: 'text',
            title: 'As de Guía',
            description: 'El rey de los nudos. Fundamental para encapillar en bolardos o atar drizas.'
        },
        difficulty: 'facil'
    },
    {
        id: 'nudo-ballestrinque',
        category: 'nudos',
        front: { type: 'text', content: 'Nudo para fijar un cabo a un poste o barra, pero puede soltarse si no hay tensión continua.' },
        back: {
            type: 'text',
            title: 'Ballestrinque',
            description: 'Muy usado para colgar defensas.'
        },
        difficulty: 'medio'
    }
];
