export interface WeatherCondition {
    windSpeed: number; // knots
    windDirection: number; // degrees
    waveHeight: number; // meters
    temperature: number; // celsius
    description: string;
}

export interface Regatta {
    id: string;
    name: string;
    description: string;
    boatStats: {
        length: number; // meters
        crew: number;
        speedRecord: number; // knots
        type: string;
    };
    route: [number, number][]; // [lat, lon]
    weatherConditions: WeatherCondition[]; // One per route step (simplified)
}

// Helper to generate mock weather
const generateWeather = (steps: number): WeatherCondition[] => {
    return Array.from({ length: steps }, () => ({
        windSpeed: Math.floor(Math.random() * 30) + 5,
        windDirection: Math.floor(Math.random() * 360),
        waveHeight: Number((Math.random() * 5 + 0.5).toFixed(1)),
        temperature: Math.floor(Math.random() * 15) + 10,
        description: ['Soleado', 'Nublado', 'Tormenta', 'Lluvia ligera', 'Viento fuerte'][Math.floor(Math.random() * 5)]
    }));
};

// Simplified Routes (approximate coordinates)
const ROUTES: Record<string, [number, number][]> = {
    americasCup: [
        [41.3851, 2.1734], [41.3800, 2.1800], [41.3750, 2.1750], [41.3820, 2.1650], [41.3851, 2.1734] // Barcelona Course
    ],
    velux5Oceans: [
        [46.1603, -1.1511], [-33.9249, 18.4241], [-31.9505, 115.8605], [-55.9798, -67.2768], [46.1603, -1.1511] // La Rochelle -> Cape Town -> Fremantle -> Horn -> La Rochelle
    ],
    julesVerne: [
        [48.3904, -4.4861], [0, -20], [-34, 18], [-46, 50], [-46, 115], [-56, -67], [0, -30], [48.3904, -4.4861] // Brest -> Equator -> Good Hope -> Leeuwin -> Horn -> Equator -> Brest
    ],
    volvoOcean: [
        [38.3452, -0.4810], [-33.9249, 18.4241], [22.3193, 114.1694], [-36.8485, 174.7633], [-22.9068, -43.1729], [41.5268, -71.2829], [51.4545, -3.1629], [52.0705, 4.3007] // Alicante -> CT -> HK -> Auckland -> Itajai -> Newport -> Cardiff -> The Hague
    ],
    vendeeGlobe: [
        [46.4967, -1.7853], [0, -25], [-40, 20], [-50, 120], [-56, -67], [0, -35], [46.4967, -1.7853] // Les Sables -> ... -> Les Sables
    ],
    sydneyHobart: [
        [-33.8688, 151.2093], [-35.0, 151.0], [-37.0, 150.5], [-40.0, 149.0], [-42.8821, 147.3272] // Sydney -> Hobart
    ],
    fastnet: [
        [50.7600, -1.3000], [50.0, -3.0], [49.8, -5.0], [51.3, -9.6], [49.8, -5.5], [49.6, -1.6] // Cowes -> Fastnet Rock -> Cherbourg
    ],
    transpac: [
        [33.7405, -118.2786], [30.0, -130.0], [25.0, -145.0], [21.3069, -157.8583] // LA -> Honolulu
    ],
    routeRhum: [
        [48.6493, -2.0257], [45.0, -10.0], [30.0, -30.0], [20.0, -50.0], [16.2650, -61.5510] // St Malo -> Guadeloupe
    ],
    goldenGlobe: [
        [50.1527, -5.0527], [0, -20], [-34, 18], [-46, 115], [-56, -67], [0, -30], [50.1527, -5.0527] // Falmouth -> ... -> Falmouth
    ]
};

// Generate intermediate points for smoother animation (simple interpolation)
const interpolateRoute = (waypoints: [number, number][], segments: number = 20): [number, number][] => {
    const route: [number, number][] = [];
    for (let i = 0; i < waypoints.length - 1; i++) {
        const start = waypoints[i];
        const end = waypoints[i + 1];
        for (let j = 0; j <= segments; j++) {
            const lat = start[0] + (end[0] - start[0]) * (j / segments);
            const lon = start[1] + (end[1] - start[1]) * (j / segments);
            route.push([lat, lon]);
        }
    }
    return route;
};

export const HISTORICAL_REGATTAS: Regatta[] = [
    {
        id: 'americas-cup',
        name: "Copa América",
        description: "El trofeo más antiguo del deporte internacional. Una competición de match race donde la tecnología y la velocidad son protagonistas.",
        boatStats: { length: 22.9, crew: 8, speedRecord: 53.3, type: "AC75 Foiling Monohull" },
        route: interpolateRoute(ROUTES.americasCup, 10),
        weatherConditions: generateWeather(50)
    },
    {
        id: 'velux-5-oceans',
        name: "Velux 5 Oceans",
        description: "La vuelta al mundo en solitario con escalas. Una prueba de resistencia extrema para el patrón y el barco.",
        boatStats: { length: 18.28, crew: 1, speedRecord: 30, type: "IMOCA 60" },
        route: interpolateRoute(ROUTES.velux5Oceans, 30),
        weatherConditions: generateWeather(120)
    },
    {
        id: 'jules-verne',
        name: "Jules Verne Trophy",
        description: "El desafío definitivo: vuelta al mundo a vela sin escalas ni asistencia en el menor tiempo posible.",
        boatStats: { length: 32, crew: 6, speedRecord: 48, type: "Maxi Trimaran" },
        route: interpolateRoute(ROUTES.julesVerne, 30),
        weatherConditions: generateWeather(120)
    },
    {
        id: 'volvo-ocean',
        name: "The Ocean Race",
        description: "La vuelta al mundo por equipos más dura. Visita los lugares más remotos y peligrosos del planeta.",
        boatStats: { length: 20, crew: 9, speedRecord: 39, type: "VO65" },
        route: interpolateRoute(ROUTES.volvoOcean, 20),
        weatherConditions: generateWeather(140)
    },
    {
        id: 'vendee-globe',
        name: "Vendée Globe",
        description: "El Everest de los mares: vuelta al mundo en solitario, sin escalas y sin asistencia.",
        boatStats: { length: 18.28, crew: 1, speedRecord: 35, type: "IMOCA 60" },
        route: interpolateRoute(ROUTES.vendeeGlobe, 30),
        weatherConditions: generateWeather(120)
    },
    {
        id: 'sydney-hobart',
        name: "Sydney Hobart",
        description: "Una de las regatas oceánicas más difíciles del mundo, famosa por sus condiciones meteorológicas impredecibles.",
        boatStats: { length: 30.48, crew: 20, speedRecord: 30, type: "Super Maxi" },
        route: interpolateRoute(ROUTES.sydneyHobart, 10),
        weatherConditions: generateWeather(40)
    },
    {
        id: 'fastnet',
        name: "Rolex Fastnet Race",
        description: "Una clásica regata offshore de 600 millas que pone a prueba la estrategia y la navegación táctica.",
        boatStats: { length: 15, crew: 10, speedRecord: 25, type: "Class 40" },
        route: interpolateRoute(ROUTES.fastnet, 10),
        weatherConditions: generateWeather(50)
    },
    {
        id: 'transpac',
        name: "Transpac",
        description: "Desde Los Ángeles hasta Honolulu, una regata famosa por sus vientos alisios y largas planeadas.",
        boatStats: { length: 20, crew: 12, speedRecord: 28, type: "TP52" },
        route: interpolateRoute(ROUTES.transpac, 15),
        weatherConditions: generateWeather(60)
    },
    {
        id: 'route-rhum',
        name: "Route du Rhum",
        description: "Transatlántica en solitario desde Francia hasta Guadalupe. Un sprint oceánico de alto nivel.",
        boatStats: { length: 32, crew: 1, speedRecord: 40, type: "Ultim Trimaran" },
        route: interpolateRoute(ROUTES.routeRhum, 15),
        weatherConditions: generateWeather(60)
    },
    {
        id: 'golden-globe',
        name: "Golden Globe Race",
        description: "Una vuelta al pasado: navegación sin tecnología moderna, recreando la histórica regata de 1968.",
        boatStats: { length: 11, crew: 1, speedRecord: 8, type: "Rustler 36 (Vintage)" },
        route: interpolateRoute(ROUTES.goldenGlobe, 30),
        weatherConditions: generateWeather(120)
    }
];
