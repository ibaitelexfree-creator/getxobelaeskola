export interface NomenclatureCard {
    id: string;
    term_es: string;
    term_eu: string; // Basque
    definition_es: string;
    definition_eu: string;
    question_es: string;
    question_eu: string;
    category: 'general' | 'rigging' | 'sails' | 'safety' | 'dimensions' | 'orientation';
    difficulty: 'basic' | 'intermediate' | 'advanced';
    imagePath?: string; // Optional path to image
    svgPath?: string; // Optional SVG path for inline rendering
}

export const NAUTICAL_TERMS: NomenclatureCard[] = [
    // --- GENERAL & DIMENSIONS ---
    {
        id: 'proa',
        term_es: 'Proa',
        term_eu: 'Branka',
        definition_es: 'Parte delantera de la embarcación.',
        definition_eu: 'Ontziaren aurrealdea.',
        question_es: '¿Qué parte es la más adelantada?',
        question_eu: 'Zein da ontziaren aurrealdea?',
        category: 'general',
        difficulty: 'basic',
        svgPath: 'M100,30 L130,100 L70,100 Z'
    },
    {
        id: 'popa',
        term_es: 'Popa',
        term_eu: 'Txopa',
        definition_es: 'Parte trasera de la embarcación.',
        definition_eu: 'Ontziaren atzealdea.',
        question_es: '¿Qué parte es la más atrasada?',
        question_eu: 'Zein da ontziaren atzealdea?',
        category: 'general',
        difficulty: 'basic',
        svgPath: 'M70,120 L130,120 L125,180 L75,180 Z'
    },
    {
        id: 'babor',
        term_es: 'Babor',
        term_eu: 'Ababor',
        definition_es: 'Costado izquierdo mirando hacia proa. Color rojo.',
        definition_eu: 'Ezkerreko aldea brankara begiratuz. Kolore gorria.',
        question_es: '¿Qué costado tiene la luz roja?',
        question_eu: 'Zein aldetan dago argi gorria?',
        category: 'general',
        difficulty: 'basic',
        svgPath: 'M40,70 L100,70 L100,130 L40,130 Z'
    },
    {
        id: 'estribor',
        term_es: 'Estribor',
        term_eu: 'Istribor',
        definition_es: 'Costado derecho mirando hacia proa. Color verde.',
        definition_eu: 'Eskuineko aldea brankara begiratuz. Kolore berdea.',
        question_es: '¿Qué costado tiene la luz verde?',
        question_eu: 'Zein aldetan dago argi berdea?',
        category: 'general',
        difficulty: 'basic',
        svgPath: 'M100,70 L160,70 L160,130 L100,130 Z'
    },
    {
        id: 'amura',
        term_es: 'Amura',
        term_eu: 'Amura',
        definition_es: 'Partes delanteras de los costados que convergen en la proa.',
        definition_eu: 'Brankarantz doazen ontziaren alboetako aurreko aldeak.',
        question_es: '¿Qué parte del costado converge en la proa?',
        question_eu: 'Zein albo-zati doa brankarantz?',
        category: 'general',
        difficulty: 'intermediate',
        svgPath: 'M100,30 L140,70 L100,70 Z'
    },
    {
        id: 'aleta',
        term_es: 'Aleta',
        term_eu: 'Hegatsa',
        definition_es: 'Partes posteriores de los costados que convergen en la popa.',
        definition_eu: 'Poparantz doazen ontziaren alboetako atzeko aldeak.',
        question_es: '¿Qué parte del costado converge en la popa?',
        question_eu: 'Zein albo-zati doa poparantz?',
        category: 'general',
        difficulty: 'intermediate',
        svgPath: 'M100,130 L140,130 L100,170 Z'
    },
    {
        id: 'eslora',
        term_es: 'Eslora',
        term_eu: 'Luzera',
        definition_es: 'Longitud de la embarcación de proa a popa.',
        definition_eu: 'Ontziaren luzera brankatik txopara.',
        question_es: '¿Cómo se llama la longitud total?',
        question_eu: 'Nola deitzen da ontziaren luzera osoa?',
        category: 'dimensions',
        difficulty: 'basic',
        svgPath: 'M100,20 L100,180'
    },
    {
        id: 'manga',
        term_es: 'Manga',
        term_eu: 'Zabalera',
        definition_es: 'Anchura máxima de la embarcación.',
        definition_eu: 'Ontziaren zabalera maximoa.',
        question_es: '¿Cómo se llama la anchura máxima?',
        question_eu: 'Nola deitzen da ontziaren zabalera maximoa?',
        category: 'dimensions',
        difficulty: 'basic',
        svgPath: 'M40,100 L160,100'
    },
    {
        id: 'orza',
        term_es: 'Orza',
        term_eu: 'Orza',
        definition_es: 'Placa sumergible que reduce el abatimiento lateral.',
        definition_eu: 'Ontzia alborantz lerratzea eragozten duen pieza.',
        question_es: '¿Qué elemento reduce el abatimiento?',
        question_eu: 'Zer piezak murrizten du abatimendua?',
        category: 'general',
        difficulty: 'basic',
        svgPath: 'M95,100 L105,100 L105,140 L95,140 Z'
    },
    {
        id: 'timon',
        term_es: 'Timón',
        term_eu: 'Lema',
        definition_es: 'Pieza articulada a popa que sirve para gobernar.',
        definition_eu: 'Popan kokatutako pieza mugikorra, ontzia gidatzeko.',
        question_es: '¿Qué elemento dirige la embarcación?',
        question_eu: 'Zer piezak gidatzen du ontzia?',
        category: 'general',
        difficulty: 'basic',
        svgPath: 'M90,180 L110,180 L110,210 L90,210 Z'
    },

    // --- RIGGING (JARCIA) ---
    {
        id: 'mastil',
        term_es: 'Mástil',
        term_eu: 'Masta',
        definition_es: 'Palo vertical que sostiene las velas.',
        definition_eu: 'Bela eusten dituen zutoina.',
        question_es: '¿Qué palo sujeta las velas verticalmente?',
        question_eu: 'Zein palok eusten ditu belak bertikalki?',
        category: 'rigging',
        difficulty: 'basic',
        svgPath: 'M98,20 L102,20 L102,150 L98,150 Z'
    },
    {
        id: 'botavara',
        term_es: 'Botavara',
        term_eu: 'Botabara',
        definition_es: 'Palo horizontal que sostiene el pujamen de la mayor.',
        definition_eu: 'Oihal nagusiaren behealdea tenkatzen duen pieza.',
        question_es: '¿Qué palo horizontal sujeta la mayor?',
        question_eu: 'Zein palok eusten du bela nagusiaren behealdea?',
        category: 'rigging',
        difficulty: 'basic',
        svgPath: 'M100,140 L180,140 L180,145 L100,145 Z'
    },
    {
        id: 'estay',
        term_es: 'Estay',
        term_eu: 'Estai',
        definition_es: 'Cable que sujeta el mástil hacia proa.',
        definition_eu: 'Masta aurrerantz eusten duen kablea.',
        question_es: '¿Qué cable sujeta el palo a proa?',
        question_eu: 'Zein kablek eusten du masta brankara?',
        category: 'rigging',
        difficulty: 'intermediate',
        svgPath: 'M100,30 L40,150'
    },
    {
        id: 'obenques',
        term_es: 'Obenques',
        term_eu: 'Obenkeak',
        definition_es: 'Cables que sujetan el mástil lateralmente.',
        definition_eu: 'Masta alboetatik eusten duten kableak.',
        question_es: '¿Qué cables sujetan el palo a los costados?',
        question_eu: 'Zein kablek eusten dute masta alboetara?',
        category: 'rigging',
        difficulty: 'intermediate',
        svgPath: 'M100,30 L40,150 M100,30 L160,150'
    },

    // --- SAILS (VELAS) ---
    {
        id: 'mayor',
        term_es: 'Vela Mayor',
        term_eu: 'Bela Nagusia',
        definition_es: 'Vela principal situada detrás del mástil.',
        definition_eu: 'Masta atzean dagoen bela nagusia.',
        question_es: '¿Cuál es la vela principal?',
        question_eu: 'Zein da bela nagusia?',
        category: 'sails',
        difficulty: 'basic',
        svgPath: 'M105,30 L170,135 L105,135 Z'
    },
    {
        id: 'foque',
        term_es: 'Foque / Génova',
        term_eu: 'Foke / Genova',
        definition_es: 'Vela triangular situada a proa del mástil.',
        definition_eu: 'Masta aurrean dagoen bela triangeluarra.',
        question_es: '¿Qué vela va a proa del mástil?',
        question_eu: 'Zein bela doa mastaren aurrean?',
        category: 'sails',
        difficulty: 'basic',
        svgPath: 'M95,35 L45,145 L95,145 Z'
    },
    {
        id: 'baluma',
        term_es: 'Baluma',
        term_eu: 'Baluma',
        definition_es: 'Borde posterior de la vela que no va sujeto a ningún palo.',
        definition_eu: 'Oihalaren atzeko ertza.',
        question_es: '¿Qué borde de la vela queda libre?',
        question_eu: 'Zein da belaren ertz askea?',
        category: 'sails',
        difficulty: 'advanced',
        svgPath: 'M170,135 L105,30'
    },
    {
        id: 'gratil',
        term_es: 'Gratil',
        term_eu: 'Gratil',
        definition_es: 'Borde de la vela que va sujeto al mástil o al estay.',
        definition_eu: 'Mastari edo estaiari lotua dagoen oihalaren ertza.',
        question_es: '¿Qué borde de la vela va sujeto?',
        question_eu: 'Zein da belaren ertz lotua?',
        category: 'sails',
        difficulty: 'advanced',
        svgPath: 'M105,30 L105,135'
    },

    // --- ORIENTACIÓN ---
    {
        id: 'barlovento',
        term_es: 'Barlovento',
        term_eu: 'Haizealde',
        definition_es: 'Parte de donde viene el viento.',
        definition_eu: 'Haizea datorren aldea.',
        question_es: '¿De dónde viene el viento?',
        question_eu: 'Nondik dator haizea?',
        category: 'orientation',
        difficulty: 'basic',
        svgPath: 'M10,50 L50,50 L40,40 M50,50 L40,60' // Arrow
    },
    {
        id: 'sotavento',
        term_es: 'Sotavento',
        term_eu: 'Haizebe',
        definition_es: 'Parte hacia donde va el viento.',
        definition_eu: 'Haizea doan aldea.',
        question_es: '¿Hacia dónde va el viento?',
        question_eu: 'Nora doa haizea?',
        category: 'orientation',
        difficulty: 'basic',
        svgPath: 'M150,50 L190,50 L180,40 M190,50 L180,60' // Arrow
    }
];
