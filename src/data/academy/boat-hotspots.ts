export interface BoatHotspot {
    id: string;
    nomenclatureId?: string; // Optional link to 2D nomenclature card
    position: { x: number; y: number; z: number };
    cameraTarget?: { x: number; y: number; z: number }; // Where the camera should look at
    cameraPosition?: { x: number; y: number; z: number }; // Where the camera should be
    label: {
        es: string;
        eu: string;
    };
    description: {
        es: string;
        eu: string;
    };
    category: 'rigging' | 'sails' | 'hull' | 'control' | 'safety';
}

export const BOAT_HOTSPOTS: BoatHotspot[] = [
    // --- HULL (CASCO) ---
    {
        id: 'proa',
        nomenclatureId: 'proa',
        position: { x: 0, y: 0.8, z: 2.0 },
        cameraTarget: { x: 0, y: 0.5, z: 2.0 },
        cameraPosition: { x: 2.0, y: 2.0, z: 4.0 },
        label: {
            es: 'Proa',
            eu: 'Branka'
        },
        description: {
            es: 'Parte delantera de la embarcación que corta el agua.',
            eu: 'Ura mozten duen ontziaren aurrealdea.'
        },
        category: 'hull'
    },
    {
        id: 'popa',
        nomenclatureId: 'popa',
        position: { x: 0, y: 0.8, z: -2.0 },
        cameraTarget: { x: 0, y: 0.5, z: -2.0 },
        cameraPosition: { x: -2.0, y: 2.0, z: -4.0 },
        label: {
            es: 'Popa',
            eu: 'Txopa'
        },
        description: {
            es: 'Parte trasera de la embarcación donde se sitúa el timón.',
            eu: 'Ontziaren atzealdea, lema dagoen tokia.'
        },
        category: 'hull'
    },
    {
        id: 'babor',
        nomenclatureId: 'babor',
        position: { x: -0.6, y: 0.6, z: 0 },
        cameraTarget: { x: 0, y: 0.5, z: 0 },
        cameraPosition: { x: -3.0, y: 2.0, z: 0 },
        label: {
            es: 'Babor',
            eu: 'Ababor'
        },
        description: {
            es: 'Costado izquierdo de la embarcación mirando hacia proa.',
            eu: 'Ontziaren ezkerreko aldea brankara begiratuz.'
        },
        category: 'hull'
    },
    {
        id: 'estribor',
        nomenclatureId: 'estribor',
        position: { x: 0.6, y: 0.6, z: 0 },
        cameraTarget: { x: 0, y: 0.5, z: 0 },
        cameraPosition: { x: 3.0, y: 2.0, z: 0 },
        label: {
            es: 'Estribor',
            eu: 'Istribor'
        },
        description: {
            es: 'Costado derecho de la embarcación mirando hacia proa.',
            eu: 'Ontziaren eskuineko aldea brankara begiratuz.'
        },
        category: 'hull'
    },
    {
        id: 'orza',
        nomenclatureId: 'orza',
        position: { x: 0, y: -0.6, z: -0.2 },
        cameraTarget: { x: 0, y: -1.0, z: -0.2 },
        cameraPosition: { x: 2.0, y: -1.0, z: 0 }, // Underwater view
        label: {
            es: 'Orza',
            eu: 'Orza'
        },
        description: {
            es: 'Placa sumergida que contrarresta el abatimiento lateral.',
            eu: 'Ur azpian dagoen pieza, alboranzko lerratzea saihesten duena.'
        },
        category: 'hull'
    },

    // --- RIGGING (JARCIA) ---
    {
        id: 'mastil',
        nomenclatureId: 'mastil',
        position: { x: 0, y: 2.75, z: 0.5 },
        cameraTarget: { x: 0, y: 2.75, z: 0.5 },
        cameraPosition: { x: 2.0, y: 3.0, z: 2.0 },
        label: {
            es: 'Mástil',
            eu: 'Masta'
        },
        description: {
            es: 'Palo vertical que soporta las velas.',
            eu: 'Bela eusten duen zutoin bertikala.'
        },
        category: 'rigging'
    },
    {
        id: 'botavara',
        nomenclatureId: 'botavara',
        position: { x: 0, y: 1.2, z: -1.0 }, // Approx mid-boom
        cameraTarget: { x: 0, y: 1.2, z: -1.0 },
        cameraPosition: { x: 2.0, y: 2.0, z: -2.0 },
        label: {
            es: 'Botavara',
            eu: 'Botabara'
        },
        description: {
            es: 'Palo horizontal articulado al mástil que extiende la vela mayor.',
            eu: 'Masta lotuta dagoen zutoin horizontala, bela nagusia zabaltzen duena.'
        },
        category: 'rigging'
    },

    // --- SAILS (VELAS) ---
    {
        id: 'mayor',
        nomenclatureId: 'mayor',
        position: { x: 0, y: 2.5, z: -0.5 },
        cameraTarget: { x: 0, y: 2.5, z: -0.5 },
        cameraPosition: { x: 3.0, y: 3.0, z: -1.0 },
        label: {
            es: 'Vela Mayor',
            eu: 'Bela Nagusia'
        },
        description: {
            es: 'Vela principal situada a popa del mástil.',
            eu: 'Mastaren atzealdean dagoen bela nagusia.'
        },
        category: 'sails'
    },

    // --- CONTROL ---
    {
        id: 'timon',
        nomenclatureId: 'timon',
        position: { x: 0, y: 0.5, z: -2.1 },
        cameraTarget: { x: 0, y: 0, z: -2.1 },
        cameraPosition: { x: 0, y: 2.0, z: -4.0 },
        label: {
            es: 'Timón',
            eu: 'Lema'
        },
        description: {
            es: 'Mecanismo para dirigir la embarcación.',
            eu: 'Ontzia gidatzeko mekanismoa.'
        },
        category: 'control'
    }
];
