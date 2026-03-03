export interface WeatherCondition {
    windSpeed: number; // knots
    windDirection: string; // compass (N, NE, etc)
    seaState: string; // Calm, Moderate, Rough, Storm
    temperature: number; // Celsius
    description: string;
}

export interface RegattaStep {
    id: number;
    name: string;
    coordinates: [number, number]; // [lat, lng]
    date: string;
    description: string;
    weather: WeatherCondition;
    distanceFromStart: number; // nm
}

export interface BoatStats {
    name: string;
    type: string;
    length: string;
    beam: string; // Manga
    draft: string; // Calado
    displacement: string;
    sailArea: string;
    crew: number;
    skipper: string;
    year: number;
    winner: boolean;
}

export interface HistoricalRegatta {
    id: string;
    title: string;
    shortDescription: string;
    fullDescription: string;
    year: number;
    location: string;
    boatStats: BoatStats;
    steps: RegattaStep[];
}

export const HISTORICAL_REGATTAS: HistoricalRegatta[] = [
    {
        id: 'americas-cup-1851',
        title: 'Copa América (1851)',
        shortDescription: 'El origen de la leyenda alrededor de la Isla de Wight.',
        fullDescription: 'La regata original que dio nombre al trofeo más antiguo del deporte internacional. La goleta "America" del New York Yacht Club venció a 15 yates del Royal Yacht Squadron en una vuelta a la Isla de Wight.',
        year: 1851,
        location: 'Isla de Wight, UK',
        boatStats: {
            name: 'America',
            type: 'Goleta (Schooner)',
            length: '30.9 m',
            beam: '6.9 m',
            draft: '3.3 m',
            displacement: '156 tons',
            sailArea: '490 m²',
            crew: 6,
            skipper: 'Richard Brown',
            year: 1851,
            winner: true
        },
        steps: [
            {
                id: 1,
                name: 'Salida - Cowes',
                coordinates: [50.7628, -1.2977],
                date: '22 Ago 1851, 10:00',
                description: 'La flota parte hacia el este con viento suave.',
                weather: { windSpeed: 8, windDirection: 'W', seaState: 'Calma', temperature: 18, description: 'Brisa suave del oeste' },
                distanceFromStart: 0
            },
            {
                id: 2,
                name: 'Nab Tower',
                coordinates: [50.6667, -0.9500],
                date: '22 Ago 1851, 11:30',
                description: 'Virada en la boya oriental. El America empieza a ganar posiciones.',
                weather: { windSpeed: 12, windDirection: 'SW', seaState: 'Leve', temperature: 19, description: 'El viento refresca' },
                distanceFromStart: 12
            },
            {
                id: 3,
                name: 'St. Catherine\'s Point',
                coordinates: [50.5756, -1.2981],
                date: '22 Ago 1851, 13:45',
                description: 'Paso por el sur de la isla. El America lidera con ventaja.',
                weather: { windSpeed: 15, windDirection: 'SW', seaState: 'Moderada', temperature: 20, description: 'Mar picada en la punta sur' },
                distanceFromStart: 25
            },
            {
                id: 4,
                name: 'The Needles',
                coordinates: [50.6639, -1.5933],
                date: '22 Ago 1851, 16:00',
                description: 'Los famosos farallones. La reina Victoria observa desde la costa.',
                weather: { windSpeed: 10, windDirection: 'W', seaState: 'Calma', temperature: 19, description: 'Viento cayendo' },
                distanceFromStart: 40
            },
            {
                id: 5,
                name: 'Llegada - Cowes',
                coordinates: [50.7628, -1.2977],
                date: '22 Ago 1851, 20:37',
                description: 'Victoria histórica. "¿Quién es el segundo?", preguntó la Reina. "No hay segundo, Majestad".',
                weather: { windSpeed: 6, windDirection: 'NW', seaState: 'Plana', temperature: 17, description: 'Atardecer tranquilo' },
                distanceFromStart: 53
            }
        ]
    },
    {
        id: 'vendee-globe-2024',
        title: 'Vendée Globe',
        shortDescription: 'La vuelta al mundo en solitario, sin escalas y sin asistencia.',
        fullDescription: 'Considerada el "Everest de los mares", esta regata pone a prueba los límites humanos y tecnológicos. Los IMOCA 60 vuelan sobre el agua gracias a sus foils.',
        year: 2024,
        location: 'Global (Salida: Les Sables-d\'Olonne)',
        boatStats: {
            name: 'IMOCA 60 (Genérico)',
            type: 'Monocasco con Foils',
            length: '18.28 m',
            beam: '5.85 m',
            draft: '4.50 m',
            displacement: '8 tons',
            sailArea: '290 m²',
            crew: 1,
            skipper: 'N/A',
            year: 2024,
            winner: false
        },
        steps: [
            {
                id: 1,
                name: 'Salida - Les Sables',
                coordinates: [46.4967, -1.7967],
                date: 'Noviembre, Day 1',
                description: 'Emoción y despedidas en el canal.',
                weather: { windSpeed: 15, windDirection: 'NW', seaState: 'Moderada', temperature: 12, description: 'Salida limpia' },
                distanceFromStart: 0
            },
            {
                id: 2,
                name: 'Ecuador',
                coordinates: [0, -29.0],
                date: 'Day 8',
                description: 'Paso de los Doldrums. Calor y vientos variables.',
                weather: { windSpeed: 5, windDirection: 'Variable', seaState: 'Calma', temperature: 30, description: 'Tormentas aisladas' },
                distanceFromStart: 3000
            },
            {
                id: 3,
                name: 'Cabo de Buena Esperanza',
                coordinates: [-34.35, 18.47],
                date: 'Day 18',
                description: 'Entrada al Océano Índico. Comienza el sur profundo.',
                weather: { windSpeed: 30, windDirection: 'W', seaState: 'Gruesa', temperature: 10, description: 'Frentes fríos' },
                distanceFromStart: 6500
            },
            {
                id: 4,
                name: 'Cabo Leeuwin',
                coordinates: [-34.37, 115.13],
                date: 'Day 30',
                description: 'Mitad del camino, bajo Australia.',
                weather: { windSpeed: 35, windDirection: 'SW', seaState: 'Muy Gruesa', temperature: 8, description: 'Olas de 6 metros' },
                distanceFromStart: 11000
            },
            {
                id: 5,
                name: 'Punto Nemo',
                coordinates: [-48.87, -123.39],
                date: 'Day 45',
                description: 'El punto más alejado de tierra firme.',
                weather: { windSpeed: 40, windDirection: 'W', seaState: 'Tormenta', temperature: 5, description: 'Condiciones extremas' },
                distanceFromStart: 14000
            },
            {
                id: 6,
                name: 'Cabo de Hornos',
                coordinates: [-55.98, -67.27],
                date: 'Day 55',
                description: 'El hito legendario. Vuelta al Atlántico.',
                weather: { windSpeed: 45, windDirection: 'NW', seaState: 'Tormenta', temperature: 4, description: 'Vientos huracanados' },
                distanceFromStart: 17500
            },
            {
                id: 7,
                name: 'Llegada - Les Sables',
                coordinates: [46.4967, -1.7967],
                date: 'Day 74',
                description: 'Gloria eterna tras dar la vuelta al mundo.',
                weather: { windSpeed: 20, windDirection: 'W', seaState: 'Moderada', temperature: 10, description: 'Recepción triunfal' },
                distanceFromStart: 24000
            }
        ]
    },
    {
        id: 'jules-verne-2017',
        title: 'Trofeo Julio Verne (IDEC Sport)',
        shortDescription: 'El récord de velocidad absoluto alrededor del mundo.',
        fullDescription: 'Francis Joyon y su tripulación batieron el récord en 2017 con el trimarán IDEC Sport, completando la vuelta en 40 días, 23 horas y 30 minutos.',
        year: 2017,
        location: 'Global (Salida: Ushant)',
        boatStats: {
            name: 'IDEC Sport',
            type: 'Trimarán Maxi',
            length: '31.5 m',
            beam: '22.5 m',
            draft: '4.5 m',
            displacement: '18 tons',
            sailArea: '678 m²',
            crew: 6,
            skipper: 'Francis Joyon',
            year: 2017,
            winner: true
        },
        steps: [
            {
                id: 1,
                name: 'Salida - Ushant',
                coordinates: [48.45, -5.1],
                date: 'Day 0',
                description: 'Cruce de la línea imaginaria entre Ushant y Lizard Point.',
                weather: { windSpeed: 25, windDirection: 'N', seaState: 'Agitada', temperature: 11, description: 'Viento fuerte favorable' },
                distanceFromStart: 0
            },
            {
                id: 2,
                name: 'Ecuador',
                coordinates: [0, -25],
                date: 'Day 5',
                description: 'Récord al ecuador. Velocidad media vertiginosa.',
                weather: { windSpeed: 15, windDirection: 'SE', seaState: 'Moderada', temperature: 28, description: 'Alisios constantes' },
                distanceFromStart: 3000
            },
            {
                id: 3,
                name: 'Cabo de Buena Esperanza',
                coordinates: [-34.35, 18.47],
                date: 'Day 12',
                description: 'Entrando en el Océano Índico a velocidades de 35 nudos.',
                weather: { windSpeed: 30, windDirection: 'NW', seaState: 'Gruesa', temperature: 15, description: 'Surfeando olas gigantes' },
                distanceFromStart: 7000
            },
            {
                id: 4,
                name: 'Cabo de Hornos',
                coordinates: [-55.98, -67.27],
                date: 'Day 26',
                description: 'Vuelta al Atlántico con una ventaja enorme sobre el récord anterior.',
                weather: { windSpeed: 35, windDirection: 'W', seaState: 'Muy Gruesa', temperature: 6, description: 'Frío y velocidad' },
                distanceFromStart: 18000
            },
            {
                id: 5,
                name: 'Llegada - Ushant',
                coordinates: [48.45, -5.1],
                date: 'Day 40',
                description: 'Récord mundial absoluto: 40 días.',
                weather: { windSpeed: 20, windDirection: 'SW', seaState: 'Moderada', temperature: 12, description: 'Final histórico' },
                distanceFromStart: 26000
            }
        ]
    },
    {
        id: 'sydney-hobart',
        title: 'Sydney Hobart',
        shortDescription: 'Una de las regatas más difíciles del mundo.',
        fullDescription: '628 millas náuticas desde el puerto de Sydney hasta Hobart, Tasmania. Famosa por sus condiciones meteorológicas impredecibles y a menudo brutales en el Estrecho de Bass.',
        year: 1998,
        location: 'Australia',
        boatStats: {
            name: 'Sayonara',
            type: 'Maxi Yacht',
            length: '24 m',
            beam: '5.5 m',
            draft: '4.0 m',
            displacement: '25 tons',
            sailArea: '350 m²',
            crew: 20,
            skipper: 'Larry Ellison',
            year: 1998,
            winner: true
        },
        steps: [
            {
                id: 1,
                name: 'Salida - Sydney Harbour',
                coordinates: [-33.85, 151.28],
                date: '26 Dic, 13:00',
                description: 'Espectacular salida en el Boxing Day.',
                weather: { windSpeed: 15, windDirection: 'NE', seaState: 'Leve', temperature: 25, description: 'Sol y brisa' },
                distanceFromStart: 0
            },
            {
                id: 2,
                name: 'Estrecho de Bass',
                coordinates: [-39.0, 149.0],
                date: '27 Dic, 18:00',
                description: 'Entrada en el notorio estrecho. Las condiciones empeoran rápidamente.',
                weather: { windSpeed: 45, windDirection: 'SW', seaState: 'Tormenta', temperature: 15, description: 'La tormenta del 98' },
                distanceFromStart: 350
            },
            {
                id: 3,
                name: 'Tasman Island',
                coordinates: [-43.23, 148.0],
                date: '28 Dic, 10:00',
                description: 'Último giro antes de la bahía de la tormenta.',
                weather: { windSpeed: 30, windDirection: 'S', seaState: 'Gruesa', temperature: 12, description: 'Vientos fuertes del sur' },
                distanceFromStart: 580
            },
            {
                id: 4,
                name: 'Llegada - Hobart',
                coordinates: [-42.88, 147.32],
                date: '29 Dic, 08:00',
                description: 'Final en el río Derwent.',
                weather: { windSpeed: 10, windDirection: 'NW', seaState: 'Calma', temperature: 18, description: 'Calma final' },
                distanceFromStart: 628
            }
        ]
    },
    {
        id: 'fastnet-race',
        title: 'Rolex Fastnet Race',
        shortDescription: 'El clásico offshore europeo.',
        fullDescription: 'Desde Cowes hasta la roca Fastnet en Irlanda y vuelta a Plymouth (o Cherburgo en ediciones recientes). Una prueba táctica y de resistencia.',
        year: 1979,
        location: 'Reino Unido / Irlanda',
        boatStats: {
            name: 'Tenacious',
            type: 'Sloop',
            length: '18 m',
            beam: '4.8 m',
            draft: '3.2 m',
            displacement: '14 tons',
            sailArea: '220 m²',
            crew: 12,
            skipper: 'Ted Turner',
            year: 1979,
            winner: true
        },
        steps: [
            {
                id: 1,
                name: 'Salida - Cowes',
                coordinates: [50.76, -1.30],
                date: 'Day 1',
                description: 'Salida técnica por el Solent.',
                weather: { windSpeed: 12, windDirection: 'SW', seaState: 'Leve', temperature: 16, description: 'Brisa del canal' },
                distanceFromStart: 0
            },
            {
                id: 2,
                name: 'Land\'s End',
                coordinates: [50.06, -5.71],
                date: 'Day 2',
                description: 'Dejando atrás Inglaterra, hacia el Mar de Irlanda.',
                weather: { windSpeed: 20, windDirection: 'W', seaState: 'Moderada', temperature: 15, description: 'Mar abierto' },
                distanceFromStart: 180
            },
            {
                id: 3,
                name: 'Fastnet Rock',
                coordinates: [51.38, -9.60],
                date: 'Day 3',
                description: 'El giro mítico alrededor del faro.',
                weather: { windSpeed: 25, windDirection: 'NW', seaState: 'Agitada', temperature: 13, description: 'Olas confusas' },
                distanceFromStart: 360
            },
            {
                id: 4,
                name: 'Llegada - Plymouth',
                coordinates: [50.36, -4.15],
                date: 'Day 5',
                description: 'Regreso y final en el histórico puerto.',
                weather: { windSpeed: 15, windDirection: 'SW', seaState: 'Moderada', temperature: 17, description: 'Navegación rápida' },
                distanceFromStart: 608
            }
        ]
    },
    {
        id: 'volvo-ocean-race',
        title: 'The Ocean Race',
        shortDescription: 'La regata por equipos más dura alrededor del mundo.',
        fullDescription: 'Anteriormente Whitbread Round the World Race. Equipos profesionales compiten en etapas alrededor del planeta, enfrentándose a las peores condiciones del océano.',
        year: 2018,
        location: 'Global (Etapas)',
        boatStats: {
            name: 'Dongfeng Race Team',
            type: 'VO65',
            length: '20.37 m',
            beam: '5.60 m',
            draft: '4.78 m',
            displacement: '12.5 tons',
            sailArea: '578 m²',
            crew: 10,
            skipper: 'Charles Caudrelier',
            year: 2018,
            winner: true
        },
        steps: [
            {
                id: 1,
                name: 'Salida - Alicante',
                coordinates: [38.34, -0.48],
                date: 'Octubre',
                description: 'Inicio en el Mediterráneo.',
                weather: { windSpeed: 10, windDirection: 'E', seaState: 'Leve', temperature: 22, description: 'Vientos ligeros' },
                distanceFromStart: 0
            },
            {
                id: 2,
                name: 'Ciudad del Cabo',
                coordinates: [-33.92, 18.42],
                date: 'Noviembre',
                description: 'Fin de la Etapa 1. Táctica en el Atlántico Sur.',
                weather: { windSpeed: 25, windDirection: 'SE', seaState: 'Moderada', temperature: 20, description: 'Vientos fuertes al llegar' },
                distanceFromStart: 6500
            },
            {
                id: 3,
                name: 'Melbourne',
                coordinates: [-37.81, 144.96],
                date: 'Diciembre',
                description: 'Etapa del Océano Sur. Frío y velocidad.',
                weather: { windSpeed: 40, windDirection: 'W', seaState: 'Gruesa', temperature: 10, description: 'Rugientes Cuarenta' },
                distanceFromStart: 12000
            },
            {
                id: 4,
                name: 'Itajaí',
                coordinates: [-26.91, -48.66],
                date: 'Abril',
                description: 'Tras cruzar Hornos, llegada a Brasil.',
                weather: { windSpeed: 15, windDirection: 'NE', seaState: 'Moderada', temperature: 25, description: 'Calor tropical' },
                distanceFromStart: 19000
            },
            {
                id: 5,
                name: 'La Haya',
                coordinates: [52.10, 4.25],
                date: 'Junio',
                description: 'Gran Final en Europa.',
                weather: { windSpeed: 18, windDirection: 'SW', seaState: 'Agitada', temperature: 18, description: 'Mar del Norte' },
                distanceFromStart: 32000
            }
        ]
    },
    {
        id: 'mini-transat',
        title: 'Mini Transat',
        shortDescription: 'El Atlántico en solitario en barcos de 6.5 metros.',
        fullDescription: 'Una regata iniciática para los grandes navegantes. Cruzar el Atlántico en un barco minúsculo sin asistencia ni comunicación por satélite.',
        year: 2021,
        location: 'Atlántico (Francia -> Caribe)',
        boatStats: {
            name: 'Mini 6.50',
            type: 'Prototipo',
            length: '6.50 m',
            beam: '3.00 m',
            draft: '2.00 m',
            displacement: '1 ton',
            sailArea: '115 m²',
            crew: 1,
            skipper: 'Pierre Le Roy',
            year: 2021,
            winner: true
        },
        steps: [
            {
                id: 1,
                name: 'Salida - Les Sables',
                coordinates: [46.50, -1.80],
                date: 'Septiembre',
                description: 'Comienzo de la aventura.',
                weather: { windSpeed: 15, windDirection: 'NW', seaState: 'Moderada', temperature: 15, description: 'Golfo de Vizcaya' },
                distanceFromStart: 0
            },
            {
                id: 2,
                name: 'Escala - Canarias',
                coordinates: [28.46, -16.25],
                date: 'Octubre',
                description: 'Parada técnica y descanso.',
                weather: { windSpeed: 20, windDirection: 'NE', seaState: 'Leve', temperature: 24, description: 'Alisios comenzando' },
                distanceFromStart: 1350
            },
            {
                id: 3,
                name: 'Mitad del Atlántico',
                coordinates: [20.0, -40.0],
                date: 'Noviembre',
                description: 'Soledad absoluta en medio del océano.',
                weather: { windSpeed: 18, windDirection: 'E', seaState: 'Moderada', temperature: 28, description: 'Alisios establecidos' },
                distanceFromStart: 2500
            },
            {
                id: 4,
                name: 'Llegada - Guadalupe',
                coordinates: [16.25, -61.53],
                date: 'Noviembre',
                description: 'Llegada al Caribe.',
                weather: { windSpeed: 15, windDirection: 'E', seaState: 'Leve', temperature: 30, description: 'Calor y alegría' },
                distanceFromStart: 4050
            }
        ]
    },
    {
        id: 'route-du-rhum',
        title: 'Route du Rhum',
        shortDescription: 'Transatlántica legendaria de Saint-Malo a Guadalupe.',
        fullDescription: 'Cada 4 años, los barcos más rápidos del mundo (Ultim, IMOCA, Class40) compiten en esta ruta histórica del ron.',
        year: 2022,
        location: 'Atlántico Norte',
        boatStats: {
            name: 'Maxi Edmond de Rothschild',
            type: 'Ultim 32/23',
            length: '32 m',
            beam: '23 m',
            draft: '4.5 m',
            displacement: '15.5 tons',
            sailArea: '650 m²',
            crew: 1,
            skipper: 'Charles Caudrelier',
            year: 2022,
            winner: true
        },
        steps: [
            {
                id: 1,
                name: 'Salida - Saint-Malo',
                coordinates: [48.65, -2.03],
                date: 'Noviembre',
                description: 'Salida multitudinaria en el Canal de la Mancha.',
                weather: { windSpeed: 20, windDirection: 'W', seaState: 'Agitada', temperature: 12, description: 'Frentes atlánticos' },
                distanceFromStart: 0
            },
            {
                id: 2,
                name: 'Azores',
                coordinates: [38.5, -28.0],
                date: 'Day 2',
                description: 'Decisión táctica: ¿Norte o Sur del anticiclón?',
                weather: { windSpeed: 25, windDirection: 'SW', seaState: 'Gruesa', temperature: 18, description: 'Mar cruzada' },
                distanceFromStart: 1200
            },
            {
                id: 3,
                name: 'Llegada - Pointe-à-Pitre',
                coordinates: [16.23, -61.53],
                date: 'Day 6',
                description: 'Récord de la prueba.',
                weather: { windSpeed: 15, windDirection: 'E', seaState: 'Leve', temperature: 29, description: 'Vientos alisios' },
                distanceFromStart: 3542
            }
        ]
    },
    {
        id: 'barcelona-world-race',
        title: 'Barcelona World Race',
        shortDescription: 'Vuelta al mundo a dos (Double-handed).',
        fullDescription: 'La primera regata de vuelta al mundo a dos, saliendo y llegando a Barcelona, cruzando el Estrecho de Gibraltar.',
        year: 2011,
        location: 'Global (Salida: Barcelona)',
        boatStats: {
            name: 'Virbac-Paprec 3',
            type: 'IMOCA 60',
            length: '18.28 m',
            beam: '5.80 m',
            draft: '4.50 m',
            displacement: '8.5 tons',
            sailArea: '300 m²',
            crew: 2,
            skipper: 'Jean-Pierre Dick / Loïck Peyron',
            year: 2011,
            winner: true
        },
        steps: [
            {
                id: 1,
                name: 'Salida - Barcelona',
                coordinates: [41.38, 2.17],
                date: '31 Dic',
                description: 'Salida de Año Nuevo frente al Hotel W.',
                weather: { windSpeed: 10, windDirection: 'NW', seaState: 'Calma', temperature: 14, description: 'Mestral suave' },
                distanceFromStart: 0
            },
            {
                id: 2,
                name: 'Estrecho de Gibraltar',
                coordinates: [35.95, -5.60],
                date: 'Day 3',
                description: 'Salida al Atlántico.',
                weather: { windSpeed: 25, windDirection: 'E', seaState: 'Agitada', temperature: 16, description: 'Levante fuerte' },
                distanceFromStart: 500
            },
            {
                id: 3,
                name: 'Cabo de Buena Esperanza',
                coordinates: [-34.35, 18.47],
                date: 'Day 20',
                description: 'Liderando la flota.',
                weather: { windSpeed: 30, windDirection: 'W', seaState: 'Gruesa', temperature: 18, description: 'Olas grandes' },
                distanceFromStart: 6000
            },
            {
                id: 4,
                name: 'Estrecho de Cook',
                coordinates: [-41.2, 174.8],
                date: 'Day 45',
                description: 'Paso entre las islas de Nueva Zelanda.',
                weather: { windSpeed: 20, windDirection: 'N', seaState: 'Agitada', temperature: 15, description: 'Corrientes fuertes' },
                distanceFromStart: 13000
            },
            {
                id: 5,
                name: 'Llegada - Barcelona',
                coordinates: [41.38, 2.17],
                date: 'Day 93',
                description: 'Victoria tras 3 meses de navegación.',
                weather: { windSpeed: 12, windDirection: 'SW', seaState: 'Leve', temperature: 18, description: 'Primavera mediterránea' },
                distanceFromStart: 25000
            }
        ]
    },
    {
        id: 'whitbread-1973',
        title: 'Whitbread (1973)',
        shortDescription: 'La primera vuelta al mundo con tripulación.',
        fullDescription: 'La regata pionera que lo empezó todo. Una aventura peligrosa donde los navegantes eran exploradores.',
        year: 1973,
        location: 'Global (Salida: Portsmouth)',
        boatStats: {
            name: 'Sayula II',
            type: 'Swan 65',
            length: '19.8 m',
            beam: '5.0 m',
            draft: '3.0 m',
            displacement: '30 tons',
            sailArea: '250 m²',
            crew: 12,
            skipper: 'Ramón Carlín',
            year: 1973,
            winner: true
        },
        steps: [
            {
                id: 1,
                name: 'Salida - Portsmouth',
                coordinates: [50.81, -1.08],
                date: 'Sept 1973',
                description: '17 barcos parten hacia lo desconocido.',
                weather: { windSpeed: 15, windDirection: 'SW', seaState: 'Moderada', temperature: 15, description: 'Nublado' },
                distanceFromStart: 0
            },
            {
                id: 2,
                name: 'Ciudad del Cabo',
                coordinates: [-33.92, 18.42],
                date: 'Oct 1973',
                description: 'Primera escala tras el Atlántico.',
                weather: { windSpeed: 20, windDirection: 'SE', seaState: 'Agitada', temperature: 19, description: 'Viento duro' },
                distanceFromStart: 6000
            },
            {
                id: 3,
                name: 'Sydney',
                coordinates: [-33.86, 151.20],
                date: 'Dic 1973',
                description: 'Llegada a Australia tras el Índico.',
                weather: { windSpeed: 15, windDirection: 'NE', seaState: 'Leve', temperature: 25, description: 'Verano austral' },
                distanceFromStart: 12000
            },
            {
                id: 4,
                name: 'Río de Janeiro',
                coordinates: [-22.90, -43.17],
                date: 'Feb 1974',
                description: 'Escala tras el temido Hornos.',
                weather: { windSpeed: 12, windDirection: 'E', seaState: 'Calma', temperature: 30, description: 'Calor húmedo' },
                distanceFromStart: 20000
            },
            {
                id: 5,
                name: 'Llegada - Portsmouth',
                coordinates: [50.81, -1.08],
                date: 'Abril 1974',
                description: 'El Sayula II de México gana por tiempo corregido.',
                weather: { windSpeed: 18, windDirection: 'W', seaState: 'Moderada', temperature: 14, description: 'Bienvenida heroica' },
                distanceFromStart: 27000
            }
        ]
    }
];
