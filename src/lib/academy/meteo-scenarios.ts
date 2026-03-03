export interface MeteoQuestion {
    id: string;
    text: string;
    options: {
        id: string;
        text: string;
        description?: string;
    }[];
}

export interface MeteoScenario {
    id: string;
    title: string;
    report: string; // The AEMET style text
    difficulty: 'Básico' | 'Intermedio' | 'Avanzado';
    questions: MeteoQuestion[];
    correctAnswers: {
        [questionId: string]: string; // questionId -> optionId
    };
    explanation: string;
}

export const METEO_SCENARIOS: MeteoScenario[] = [
    {
        id: 'scenario-001',
        title: 'Travesía Costera de Verano',
        difficulty: 'Básico',
        report: `BOLETÍN METEOROLÓGICO PARA LA ZONA DEL CANTÁBRICO

VALIDEZ: Lunes, 15 de Julio, 10:00 UTC a 22:00 UTC

SITUACIÓN SINÓPTICA: Anticiclón centrado al oeste de Bretaña extendiendo su influencia sobre el Cantábrico.

PREDICCIÓN:
VIENTO: Componente Nordeste (NE) fuerza 3 a 4, amainando a fuerza 2 al final del día.
ESTADO DE LA MAR: Marejadilla aumentando temporalmente a Marejada en zonas expuestas. Mar de fondo del NO de 1 metro.
VISIBILIDAD: Buena.
FENÓMENOS SIGNIFICATIVOS: Ninguno.`,
        questions: [
            {
                id: 'navigable',
                text: '¿Es seguro salir a navegar para una tripulación de nivel básico?',
                options: [
                    { id: 'yes', text: 'Sí, es seguro.' },
                    { id: 'caution', text: 'Sí, pero con mucha precaución.' },
                    { id: 'no', text: 'No, es peligroso.' }
                ]
            },
            {
                id: 'sail_config',
                text: '¿Qué configuración de velas recomiendas para ceñir?',
                options: [
                    { id: 'full', text: 'Todo el trapo (Mayor y Génova completos).' },
                    { id: 'reef1', text: 'Mayor con 1 rizo y Génova enrollado un 30%.' },
                    { id: 'motor', text: 'Solo motor, no hay viento suficiente.' }
                ]
            },
            {
                id: 'route',
                text: '¿Qué estrategia de ruta es más adecuada para ir hacia el Este?',
                options: [
                    { id: 'offshore', text: 'Bordos largos alejándose de la costa.' },
                    { id: 'coastal', text: 'Navegación costera directa aprovechando el térmico.' }
                ]
            }
        ],
        correctAnswers: {
            'navigable': 'yes',
            'sail_config': 'full',
            'route': 'coastal'
        },
        explanation: "Las condiciones son ideales (Fuerza 3-4 es viento fresco pero manejable, Marejadilla es cómodo). Al ser verano y tener componente NE, es probable que se refiera a un régimen de brisas térmicas que favorecen la navegación costera. 'Todo el trapo' es adecuado para fuerza 3-4 en ceñida para un velero estándar."
    },
    {
        id: 'scenario-002',
        title: 'Frente Frío en Aproximación',
        difficulty: 'Intermedio',
        report: `AVISO DE GALERNA

VALIDEZ: Sábado, 24 de Octubre, 08:00 UTC

SITUACIÓN: Aproximación de un frente frío activo por el noroeste.

PREDICCIÓN:
VIENTO: Suroeste (SW) fuerza 4 a 5, rolando bruscamente a Noroeste (NW) fuerza 7 a 8 con rachas muy fuertes al paso del frente.
ESTADO DE LA MAR: Marejada aumentando rápidamente a Mar Gruesa o Muy Gruesa tras el rolada.
VISIBILIDAD: Regular a mala en precipitaciones.
FENÓMENOS SIGNIFICATIVOS: Probabilidad de tormentas y granizo.`,
        questions: [
            {
                id: 'navigable',
                text: '¿Es aconsejable iniciar una travesía larga ahora?',
                options: [
                    { id: 'yes', text: 'Sí, el viento de SW es favorable para ir al norte.' },
                    { id: 'wait', text: 'No, mejor esperar a que pase el frente.' },
                    { id: 'short', text: 'Sí, pero solo una vuelta corta cerca del puerto.' }
                ]
            },
            {
                id: 'action_port',
                text: 'Si ya estás en el mar y ves llegar el frente (nubes oscuras al NW), ¿qué haces?',
                options: [
                    { id: 'sails_down', text: 'Arriar velas, asegurar todo y preparar motor/tormentín.' },
                    { id: 'continue', text: 'Mantener rumbo y velocidad para escapar del frente.' }
                ]
            }
        ],
        correctAnswers: {
            'navigable': 'wait',
            'action_port': 'sails_down'
        },
        explanation: "Un aviso de Galerna en el Cantábrico es una situación muy peligrosa. La rolada de SW a NW suele ser violenta y súbita, aumentando el viento a fuerza 8 o más en minutos. No se debe salir. Si te pilla en el mar, la prioridad es asegurar la embarcación y la tripulación (arriar mayor, ponerse chalecos) antes de que golpee el viento."
    },
    {
        id: 'scenario-003',
        title: 'Mar de Fondo Elevada',
        difficulty: 'Avanzado',
        report: `PREDICCIÓN MARÍTIMA

VALIDEZ: Domingo, 12 de Febrero

VIENTO: Variable fuerza 2 a 3.
ESTADO DE LA MAR: Mar de fondo del Noroeste de 4 a 5 metros.
VISIBILIDAD: Buena.`,
        questions: [
            {
                id: 'navigable',
                text: 'Hay poco viento (F2-3). ¿Es seguro salir a navegar cerca de la costa?',
                options: [
                    { id: 'yes', text: 'Sí, no hay viento, el mar estará como un plato.' },
                    { id: 'no', text: 'No, el mar de fondo de 4-5m es peligroso, especialmente en barras y bajos.' }
                ]
            },
            {
                id: 'strategy',
                text: 'Si decides salir a alta mar (fuera de la plataforma), ¿cómo afectará la ola?',
                options: [
                    { id: 'surf', text: 'Las olas romperán constantemente.' },
                    { id: 'swell', text: 'Serán ondas largas y tendidas (Swell), incómodas por la falta de viento para estabilizar el barco con las velas.' }
                ]
            }
        ],
        correctAnswers: {
            'navigable': 'no',
            'strategy': 'swell'
        },
        explanation: "Aunque haya poco viento local, un mar de fondo de 4-5 metros indica un temporal lejano muy fuerte. Cerca de la costa, al disminuir la profundidad, estas olas se levantan y rompen con violencia, haciendo peligrosísimas las entradas y salidas de puerto. En alta mar, sería un 'sube y baja' constante (Swell) muy mareante si no hay viento para apoyar las velas."
    }
];
