<<<<<<< HEAD

export interface BoatPart {
    id: string;
    name: string;
    definition: string;
    category: 'structure' | 'rigging' | 'sails' | 'deck';
    function: string;
    quiz: {
        question: string;
        options: string[];
        answer: number; // Index of correct option
    };
}

export const BOAT_PARTS: BoatPart[] = [
    // ESTRUCTURA (Clase 3000)
    {
        id: 'proa',
        name: 'Proa',
        definition: 'Parte delantera de la embarcación que corta el agua.',
        category: 'structure',
        function: 'Cortar el agua y definir la dirección de avance.',
        quiz: {
            question: '¿Dónde se encuentra la proa en el barco?',
            options: ['En la parte trasera', 'En la parte delantera', 'En el lado derecho'],
            answer: 1
        }
    },
    {
        id: 'popa',
        name: 'Popa',
        definition: 'Parte trasera o posterior de la embarcación.',
        category: 'structure',
        function: 'Cerrar la estructura del casco por detrás.',
        quiz: {
            question: '¿Cuál es el opuesto de la popa?',
            options: ['Babor', 'Estribor', 'Proa'],
            answer: 2
        }
    },
    {
        id: 'babor',
        name: 'Babor',
        definition: 'Lado izquierdo de la embarcación mirando de popa a proa.',
        category: 'structure',
        function: 'Definir el costado izquierdo para la navegación y reglas de paso.',
        quiz: {
            question: 'Si miras hacia la proa, ¿dónde está Babor?',
            options: ['A la izquierda', 'A la derecha', 'Detrás'],
            answer: 0
        }
    },
    {
        id: 'estribor',
        name: 'Estribor',
        definition: 'Lado derecho de la embarcación mirando de popa a proa.',
        category: 'structure',
        function: 'Definir el costado derecho; los barcos amurados a estribor tienen preferencia.',
        quiz: {
            question: '¿De qué color es la luz de navegación de Estribor?',
            options: ['Roja', 'Verde', 'Blanca'],
            answer: 1
        }
    },
    {
        id: 'casco',
        name: 'Casco',
        definition: 'El cuerpo principal impermeable de la embarcación.',
        category: 'structure',
        function: 'Proporcionar flotabilidad y estructura al barco.',
        quiz: {
            question: '¿Cuál es la función principal del casco?',
            options: ['Sostener las velas', 'Proporcionar flotabilidad', 'Dirigir el barco'],
            answer: 1
        }
    },
    {
        id: 'quilla',
        name: 'Quilla',
        definition: 'Pieza estructural inferior que da estabilidad y evita la deriva lateral.',
        category: 'structure',
        function: 'Contrapesar la fuerza del viento y reducir el abatimiento.',
        quiz: {
            question: '¿Qué evita principalmente la quilla?',
            options: ['Que el barco se hunda', 'El abatimiento (deriva lateral)', 'Que se rompa el mástil'],
            answer: 1
        }
    },
    {
        id: 'timon',
        name: 'Timón',
        definition: 'Mecanismo sumergido utilizado para dirigir el barco.',
        category: 'structure',
        function: 'Controlar el rumbo de la embarcación desviando el flujo de agua.',
        quiz: {
            question: '¿Para qué sirve el timón?',
            options: ['Para frenar', 'Para acelerar', 'Para dirigir el rumbo'],
            answer: 2
        }
    },
    {
        id: 'cubierta',
        name: 'Cubierta',
        definition: 'Piso superior exterior de la embarcación.',
        category: 'structure',
        function: 'Proteger el interior y servir de superficie de trabajo para la tripulación.',
        quiz: {
            question: '¿Cómo se llama el "piso" exterior del barco?',
            options: ['Techo', 'Cubierta', 'Suelo'],
            answer: 1
        }
    },

    // APAREJO (Clase 4000)
    {
        id: 'mastil',
        name: 'Mástil',
        definition: 'Palo vertical que sostiene las velas.',
        category: 'rigging',
        function: 'Soportar la fuerza de las velas y transmitirla al casco.',
        quiz: {
            question: '¿Qué elemento sostiene principalmente las velas?',
            options: ['La botavara', 'El mástil', 'La quilla'],
            answer: 1
        }
    },
    {
        id: 'botavara',
        name: 'Botavara',
        definition: 'Palo horizontal articulado al mástil que sostiene el pujamen de la vela mayor.',
        category: 'rigging',
        function: 'Permitir orientar y aplanar la vela mayor.',
        quiz: {
            question: 'La botavara está unida al...',
            options: ['Casco', 'Mástil', 'Timón'],
            answer: 1
        }
    },
    {
        id: 'obenques',
        name: 'Obenques',
        definition: 'Cables laterales que sujetan el mástil para que no caiga a los lados.',
        category: 'rigging',
        function: 'Sujetar el mástil lateralmente.',
        quiz: {
            question: '¿Qué evitan los obenques?',
            options: ['Que el mástil caiga a proa', 'Que el mástil caiga a los lados', 'Que la botavara se levante'],
            answer: 1
        }
    },
    {
        id: 'estay_proa',
        name: 'Estay de Proa',
        definition: 'Cable que sujeta el mástil desde proa y donde se izan los foques o génovas.',
        category: 'rigging',
        function: 'Sujetar el mástil longitudinalmente (hacia proa) y portar velas de proa.',
        quiz: {
            question: '¿Dónde se sitúa el estay de proa?',
            options: ['En la popa', 'En la proa', 'En el tope del mástil solamente'],
            answer: 1
        }
    },
    {
        id: 'estay_popa',
        name: 'Estay de Popa (Backstay)',
        definition: 'Cable que sujeta el mástil desde popa.',
        category: 'rigging',
        function: 'Impedir que el mástil caiga hacia proa.',
        quiz: {
            question: '¿Qué otro nombre recibe el estay de popa?',
            options: ['Backstay', 'Forestay', 'Shrouds'],
            answer: 0
        }
    },

    // VELAS (Clase 5000)
    {
        id: 'mayor',
        name: 'Vela Mayor',
        definition: 'La vela principal y más grande, situada detrás del mástil.',
        category: 'sails',
        function: 'Generar la mayor parte de la propulsión en rumbos de ceñida.',
        quiz: {
            question: '¿Dónde va situada la vela mayor?',
            options: ['A proa del mástil', 'A popa del mástil', 'En el estay de proa'],
            answer: 1
        }
    },
    {
        id: 'genova',
        name: 'Génova/Foque',
        definition: 'Vela triangular situada a proa del mástil.',
        category: 'sails',
        function: 'Acelerar el flujo de aire sobre la mayor y propulsar el barco.',
        quiz: {
            question: '¿En qué cable se iza el génova?',
            options: ['En el estay de proa', 'En el backstay', 'En los obenques'],
            answer: 0
        }
    },
    {
        id: 'spinnaker',
        name: 'Spinnaker',
        definition: 'Vela grande y abolsada para navegar con vientos de popa.',
        category: 'sails',
        function: 'Maximizar la captura de viento en rumbos portantes (popa).',
        quiz: {
            question: '¿Cuándo se usa el Spinnaker?',
            options: ['Con viento de cara (ceñida)', 'Con viento de popa', 'Con el barco parado'],
            answer: 1
        }
    },

    // MANIOBRA (Clase 6000)
    {
        id: 'driza',
        name: 'Driza',
        definition: 'Cabo utilizado para izar (subir) las velas.',
        category: 'deck',
        function: 'Subir (izar) las velas o banderas.',
        quiz: {
            question: '¿Para qué sirve una driza?',
            options: ['Para cazar la vela', 'Para izar la vela', 'Para amarrar el barco'],
            answer: 1
        }
    },
    {
        id: 'escota',
        name: 'Escota',
        definition: 'Cabo utilizado para orientar las velas respecto al viento.',
        category: 'deck',
        function: 'Controlar el ángulo de la vela respecto al viento (cazar o amollar).',
        quiz: {
            question: 'Si quiero cerrar la vela, ¿qué hago con la escota?',
            options: ['La cazo (tiro de ella)', 'La amollo (suelto)', 'La corto'],
            answer: 0
        }
    },
    {
        id: 'contra',
        name: 'Contra (Vang)',
        definition: 'Sistema que tira de la botavara hacia abajo para aplanar la vela mayor.',
        category: 'deck',
        function: 'Evitar que la botavara suba en rumbos abiertos.',
        quiz: {
            question: '¿Qué efecto tiene cazar la contra?',
            options: ['Levanta la botavara', 'Baja la botavara', 'Mueve la botavara a babor'],
            answer: 1
        }
    }
];
=======

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
>>>>>>> pr-286
