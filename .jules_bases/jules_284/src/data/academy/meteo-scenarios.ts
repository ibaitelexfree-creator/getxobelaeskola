export interface MeteoScenario {
    id: string;
    title: string;
    context: string;
    meteoReport: {
        date: string;
        location: string;
        synopsis: string;
        wind: string;
        seaState: string;
        visibility: string;
        pressure: string;
    };
    options: {
        navigable: boolean;
        route_decision: string[];
        sail_plan: string[];
    };
    correctAnswer: {
        navigable: boolean;
        route_idx: number; // Index of correct route option
        sail_idx: number; // Index of correct sail plan option
    };
    explanation: string;
}

export const METEO_SCENARIOS: MeteoScenario[] = [
    {
        id: "galerna-cantabrica",
        title: "Cambio Brusco en la Costa",
        context: "Estás navegando a 2 millas de la costa de Getxo. Es una tarde calurosa de verano. Tienes planeado ir hasta Castro Urdiales (10 millas al oeste).",
        meteoReport: {
            date: "15 Agosto, 16:00 HL",
            location: "Aguas Costeras de Bizkaia",
            synopsis: "Baja térmica formándose en el interior. Descenso rápido de presión (4hPa en última hora).",
            wind: "Sur 2-3 arreciando bruscamente a Noroeste 6-7 (Galerna) en las próximas 1-2 horas.",
            seaState: "Rizada aumentando rápidamente a Fuerte Marejada.",
            visibility: "Buena, reduciéndose a regular con el cambio de viento.",
            pressure: "1012 hPa (bajando rápidamente)"
        },
        options: {
            navigable: false, // Es navegable? (No, para recreo estándar)
            route_decision: [
                "Continuar hacia Castro Urdiales aprovechando el viento portante.",
                "Alejarse mar adentro para evitar la costa.",
                "Regresar inmediatamente a puerto o refugio más cercano.",
                "Mantener rumbo y esperar a ver cómo evoluciona."
            ],
            sail_plan: [
                "Todo el trapo arriba (Mayor y Génova).",
                "Arriar velas, asegurar cubierta y encender motor.",
                "Poner un rizo a la mayor.",
                "Solo Génova."
            ]
        },
        correctAnswer: {
            navigable: false,
            route_idx: 2,
            sail_idx: 1
        },
        explanation: "La caída brusca de presión y el aviso de Galerna indican un cambio violento de viento a NW con rachas muy fuertes (fuerza 8 o más). La seguridad prima: debes regresar a puerto inmediatamente antes de que llegue el frente de racha. Intentar llegar a Castro te expondría a vientos muy fuertes y mar cruzada peligrosa."
    },
    {
        id: "travesia-hendaya",
        title: "Travesía a Hendaya",
        context: "Plan de fin de semana: Navegar desde Getxo hasta Hendaya (aprox. 35 millas al este). Barco: Velero 35 pies.",
        meteoReport: {
            date: "10 Septiembre, 09:00 HL",
            location: "Costa Vasca",
            synopsis: "Anticiclón estable sobre las Azores extendiéndose hacia el Golfo de Vizcaya.",
            wind: "Noroeste (NW) fuerza 3 a 4. Rachas de 15 nudos.",
            seaState: "Marejadilla con áreas de marejada al final del día. Mar de fondo del NW de 1 metro.",
            visibility: "Buena (más de 10 km).",
            pressure: "1020 hPa (estable)"
        },
        options: {
            navigable: true,
            route_decision: [
                "Navegar pegado a la costa (menos de 0.5 millas).",
                "Trazar rumbo directo, manteniéndose a 2-3 millas de la costa.",
                "Cancelar la salida por mal tiempo.",
                "Ir a motor todo el camino contra el viento."
            ],
            sail_plan: [
                "Mayor completa y Génova (o foque).",
                "Solo Mayor.",
                "Tormentín y Mayor con 3 rizos.",
                "A palo seco."
            ]
        },
        correctAnswer: {
            navigable: true,
            route_idx: 1,
            sail_idx: 0
        },
        explanation: "Fuerza 3-4 es ideal para navegar a vela. Un NW te permitirá hacer un rumbo directo o con pocos bordos hacia el Este (través/aleta). Mantenerse a 2-3 millas evita los rebotes de ola en los acantilados y da margen de seguridad. La configuración vélica estándar es adecuada."
    },
    {
        id: "niebla-matinal",
        title: "Salida de Pesca con Niebla",
        context: "Amanecer de otoño. Tienes planeado salir a pescar bonitos a 12 millas de la costa.",
        meteoReport: {
            date: "20 Octubre, 07:00 HL",
            location: "Bizkaia - Alta Mar",
            synopsis: "Pantano barométrico. Aire cálido sobre superficie fría.",
            wind: "Variable fuerza 1 a 2.",
            seaState: "Mar llana o rizada.",
            visibility: "Mala. Bancos de niebla densa (visibilidad < 200m).",
            pressure: "1018 hPa"
        },
        options: {
            navigable: false, // Depende del equipo, pero para escuela/alumno estándar: NO o con mucha precaución.
            route_decision: [
                "Salir despacio tocando la bocina.",
                "Esperar en puerto a que levante la niebla.",
                "Salir a toda velocidad para cruzar la niebla rápido.",
                "Navegar solo con GPS sin vigilancia visual."
            ],
            sail_plan: [
                "A vela para no hacer ruido.",
                "A motor, con luces de navegación encendidas y reflector de radar.",
                "Cualquiera.",
                "Sin velas ni motor, a la deriva."
            ]
        },
        correctAnswer: {
            navigable: false,
            route_idx: 1,
            sail_idx: 1
        },
        explanation: "Con visibilidad inferior a 200m, el riesgo de colisión es altísimo, especialmente con pesqueros o mercantes que frecuentan la zona. Si no tienes radar y experiencia avanzada, la decisión correcta es esperar (la niebla suele levantar a mediodía). Si tuvieras que navegar por fuerza mayor, sería a motor, con luces, señales fónicas y radar."
    }
];
