
export interface BoatPart {
    id: string;
    name: string;
    definition: string;
    category: 'structure' | 'rigging' | 'sails' | 'deck';
}

export const BOAT_PARTS: BoatPart[] = [
    // ESTRUCTURA (Clase 3000)
    {
        id: 'proa',
        name: 'Proa',
        definition: 'Parte delantera de la embarcación que corta el agua.',
        category: 'structure'
    },
    {
        id: 'popa',
        name: 'Popa',
        definition: 'Parte trasera o posterior de la embarcación.',
        category: 'structure'
    },
    {
        id: 'babor',
        name: 'Babor',
        definition: 'Lado izquierdo de la embarcación mirando de popa a proa.',
        category: 'structure'
    },
    {
        id: 'estribor',
        name: 'Estribor',
        definition: 'Lado derecho de la embarcación mirando de popa a proa.',
        category: 'structure'
    },
    {
        id: 'casco',
        name: 'Casco',
        definition: 'El cuerpo principal impermeable de la embarcación.',
        category: 'structure'
    },
    {
        id: 'quilla',
        name: 'Quilla',
        definition: 'Pieza estructural inferior que da estabilidad y evita la deriva lateral.',
        category: 'structure'
    },
    {
        id: 'timon',
        name: 'Timón',
        definition: 'Mecanismo sumergido utilizado para dirigir el barco.',
        category: 'structure'
    },
    {
        id: 'cubierta',
        name: 'Cubierta',
        definition: 'Piso superior exterior de la embarcación.',
        category: 'structure'
    },

    // APAREJO (Clase 4000)
    {
        id: 'mastil',
        name: 'Mástil',
        definition: 'Palo vertical que sostiene las velas.',
        category: 'rigging'
    },
    {
        id: 'botavara',
        name: 'Botavara',
        definition: 'Palo horizontal articulado al mástil que sostiene el pujamen de la vela mayor.',
        category: 'rigging'
    },
    {
        id: 'obenques',
        name: 'Obenques',
        definition: 'Cables laterales que sujetan el mástil para que no caiga a los lados.',
        category: 'rigging'
    },
    {
        id: 'estay_proa',
        name: 'Estay de Proa',
        definition: 'Cable que sujeta el mástil desde proa y donde se izan los foques o génovas.',
        category: 'rigging'
    },
    {
        id: 'estay_popa',
        name: 'Estay de Popa (Backstay)',
        definition: 'Cable que sujeta el mástil desde popa.',
        category: 'rigging'
    },

    // VELAS (Clase 5000)
    {
        id: 'mayor',
        name: 'Vela Mayor',
        definition: 'La vela principal y más grande, situada detrás del mástil.',
        category: 'sails'
    },
    {
        id: 'genova',
        name: 'Génova/Foque',
        definition: 'Vela triangular situada a proa del mástil.',
        category: 'sails'
    },
    {
        id: 'spinnaker',
        name: 'Spinnaker',
        definition: 'Vela grande y abolsada para navegar con vientos de popa.',
        category: 'sails'
    },

    // MANIOBRA (Clase 6000)
    {
        id: 'driza',
        name: 'Driza',
        definition: 'Cabo utilizado para izar (subir) las velas.',
        category: 'deck'
    },
    {
        id: 'escota',
        name: 'Escota',
        definition: 'Cabo utilizado para orientar las velas respecto al viento.',
        category: 'deck'
    },
    {
        id: 'contra',
        name: 'Contra (Vang)',
        definition: 'Sistema que tira de la botavara hacia abajo para aplanar la vela mayor.',
        category: 'deck'
    }
];
