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
        image: 'https://images.unsplash.com/photo-1544161442-e3dbfe448285?auto=format&fit=crop&w=1200&q=80',
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
        image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
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
        image: 'https://images.unsplash.com/photo-1512918766675-ed41f39c273a?auto=format&fit=crop&w=1200&q=80',
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
        image: 'https://images.unsplash.com/photo-1613977252367-a8fe8799b776?auto=format&fit=crop&w=1200&q=80',
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
        image: 'https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?auto=format&fit=crop&w=1200&q=80',
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
        image: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1200&q=80',
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
        image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80',
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
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        latitude: 25.1130,
        longitude: 55.2472
    }
];
