export interface Neighborhood {
    id: string;
    name: string;
    slug: string;
    tagline: string;
    description: string;
    avgPricePerSqft: number;
    propertyCount: number;
    vibe: string[];
    image: string;
    latitude: number;
    longitude: number;
}

export const NEIGHBORHOODS: Neighborhood[] = [
    {
        id: '1',
        name: 'Palm Jumeirah',
        slug: 'palm-jumeirah',
        tagline: 'The Crown Jewel of Dubai',
        description: "The world's most iconic man-made island. Home to the most prestigious addresses in the UAE, featuring private beaches and ultra-luxury hotels.",
        avgPricePerSqft: 4500,
        propertyCount: 342,
        vibe: ['Ultra-Luxury', 'Beachfront', 'Iconic'],
        image: '/images/neighborhoods/palm-jumeirah.png',
        latitude: 25.1124,
        longitude: 55.1390
    },
    {
        id: '2',
        name: 'Downtown Dubai',
        slug: 'downtown-dubai',
        tagline: 'The Heart of the City',
        description: 'Where the world\'s tallest building, the best shopping, and the most iconic fountain create an electric atmosphere of urban luxury.',
        avgPricePerSqft: 3200,
        propertyCount: 512,
        vibe: ['Iconic Views', 'Central', 'Vibrant'],
        image: '/images/neighborhoods/downtown-dubai.png',
        latitude: 25.1972,
        longitude: 55.2744
    },
    {
        id: '3',
        name: 'Dubai Marina',
        slug: 'dubai-marina',
        tagline: 'Where Lifestyle Meets Waterfront',
        description: 'The most dynamic urban waterfront destination, with world-class yachting, dining, and a stunning skyline of residential towers.',
        avgPricePerSqft: 2400,
        propertyCount: 820,
        vibe: ['Waterfront', 'Young Professionals', 'Lifestyle'],
        image: '/images/neighborhoods/dubai-marina.png',
        latitude: 25.0780,
        longitude: 55.1384
    },
    {
        id: '4',
        name: 'Emirates Hills',
        slug: 'emirates-hills',
        tagline: 'The Beverly Hills of Dubai',
        description: "Dubai's most exclusive gated community. Set around a championship golf course, it is home to royalty and international business leaders.",
        avgPricePerSqft: 5500,
        propertyCount: 120,
        vibe: ['Ultra-Exclusive', 'Gated', 'Golf'],
        image: '/images/neighborhoods/emirates-hills.png',
        latitude: 25.0714,
        longitude: 55.1700
    },
    {
        id: '5',
        name: 'Business Bay',
        slug: 'business-bay',
        tagline: 'The Manhattan of Dubai',
        description: 'A dynamic business and residential hub featuring modern towers along the Dubai Water Canal with direct access to Downtown.',
        avgPricePerSqft: 1800,
        propertyCount: 450,
        vibe: ['Business', 'Canal', 'Modern'],
        image: '/images/neighborhoods/business-bay.png',
        latitude: 25.1857,
        longitude: 55.2631
    },
    {
        id: '6',
        name: 'JBR',
        slug: 'jumeirah-beach-residence',
        tagline: 'Sun-Kissed Urban Living',
        description: 'A massive beachfront community offering a vibrant outdoor lifestyle with "The Walk" featuring endless dining and retail options.',
        avgPricePerSqft: 2200,
        propertyCount: 380,
        vibe: ['Beachfront', 'Lively', 'Tourism'],
        image: '/images/neighborhoods/jbr.png',
        latitude: 25.0755,
        longitude: 55.1319
    },
    {
        id: '7',
        name: 'DIFC',
        slug: 'difc',
        tagline: 'Financial & Artistic Soul',
        description: 'The premier financial center of the MEASA region, blending world-class business environments with high-end art galleries and upscale dining.',
        avgPricePerSqft: 3400,
        propertyCount: 145,
        vibe: ['Sophisticated', 'Finance', 'Dining'],
        image: '/images/neighborhoods/difc.png',
        latitude: 25.2122,
        longitude: 55.2835
    },
    {
        id: '8',
        name: 'Dubai Hills Estate',
        slug: 'dubai-hills-estate',
        tagline: 'Green Heart of Dubai',
        description: 'A vast, sustainably designed master community featuring large parks, a championship golf course, and the iconic Dubai Hills Mall.',
        avgPricePerSqft: 2000,
        propertyCount: 290,
        vibe: ['Family-Friendly', 'Greenery', 'Quiet'],
        image: '/images/neighborhoods/dubai-hills.png',
        latitude: 25.1130,
        longitude: 55.2472
    },
    {
        id: '9',
        name: 'Jumeirah Bay',
        slug: 'jumeirah-bay',
        tagline: 'Private Island Sophistication',
        description: 'A private island community shaped like a seahorse. Home to the Bulgari Resort and some of the world\'s most exclusive villas.',
        avgPricePerSqft: 6800,
        propertyCount: 45,
        vibe: ['Secluded', 'Seafront', 'Wealthy'],
        image: '/images/neighborhoods/jbr.png',
        latitude: 25.2152,
        longitude: 55.2429
    },
    {
        id: '10',
        name: 'MBR City',
        slug: 'mbr-city',
        tagline: 'A Vision of the Future',
        description: 'Home to District One and its massive Crystal Lagoon. Offering high-end villas and apartments with vast green spaces.',
        avgPricePerSqft: 2500,
        propertyCount: 2200,
        vibe: ['Expansive', 'Lagoon', 'Modern'],
        image: '/images/neighborhoods/dubai-hills.png',
        latitude: 25.1528,
        longitude: 55.3093
    },
    {
        id: '11',
        name: 'Tilal Al Ghaf',
        slug: 'tilal-al-ghaf',
        tagline: 'Luxury Lagoon Living',
        description: 'A resort-style community centered around Lagoon Al Ghaf. Combining residential space with recreational lagoon experiences.',
        avgPricePerSqft: 1600,
        propertyCount: 1500,
        vibe: ['Resort', 'Community', 'Lakes'],
        image: '/images/neighborhoods/dubai-hills.png',
        latitude: 25.0210,
        longitude: 55.2110
    },
    {
        id: '12',
        name: 'Al Barari',
        slug: 'al-barari',
        tagline: 'Desert Botanical Oasis',
        description: 'A lush green community with a microclimate. Offering botanical surrounds and some of the quietest mansions in Dubai.',
        avgPricePerSqft: 2800,
        propertyCount: 300,
        vibe: ['Greenery', 'Quiet', 'Botanical'],
        image: '/images/neighborhoods/dubai-hills.png',
        latitude: 25.0880,
        longitude: 55.3260
    },
    {
        id: '13',
        name: 'Bluewaters Island',
        slug: 'bluewaters-island',
        tagline: 'Urban Island Luxury',
        description: 'Home to Ain Dubai. Blending residential, hospitality, and retail in a sophisticated waterfront island setting.',
        avgPricePerSqft: 4000,
        propertyCount: 700,
        vibe: ['Modern', 'Tourism', 'Waterfront'],
        image: '/images/neighborhoods/jbr.png',
        latitude: 25.0710,
        longitude: 55.1220
    }
];
