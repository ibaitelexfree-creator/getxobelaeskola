export interface Neighborhood {
    id: string;
    name: string;
    slug: string;
    tagline: string;
    description: string;
    avgPricePerSqft: number;
    property_count: number;
    vibe: string[];
    image: string;
    latitude: number;
    longitude: number;
}

export const NEIGHBORHOODS: Neighborhood[] = [
    { id: '1', name: 'Palm Jumeirah', slug: 'palm-jumeirah', tagline: 'The Crown Jewel of Dubai', description: 'The world\'s most iconic man-made island. Home to the most prestigious addresses in the UAE.', avgPricePerSqft: 3500, property_count: 3, vibe: ['Ultra-Luxury', 'Beachfront', 'Iconic'], image: '/images/neighborhoods/palm-jumeirah.jpg', latitude: 25.1124, longitude: 55.1390 },
    { id: '2', name: 'Downtown Dubai', slug: 'downtown-dubai', tagline: 'The Heart of the City', description: 'Where the world\'s tallest building, the best shopping, and the most iconic fountain create an electric atmosphere.', avgPricePerSqft: 2800, property_count: 2, vibe: ['Iconic Views', 'Central', 'Vibrant'], image: '/images/neighborhoods/downtown.jpg', latitude: 25.1972, longitude: 55.2744 },
    { id: '3', name: 'Dubai Marina', slug: 'dubai-marina', tagline: 'Where Lifestyle Meets Waterfront', description: 'The most dynamic urban waterfront destination, with world-class yachting, dining, and nightlife.', avgPricePerSqft: 2200, property_count: 1, vibe: ['Waterfront', 'Young Professionals', 'Lifestyle'], image: '/images/neighborhoods/marina.jpg', latitude: 25.0780, longitude: 55.1384 },
    { id: '4', name: 'Emirates Hills', slug: 'emirates-hills', tagline: 'The Beverly Hills of Dubai', description: 'Dubai\'s most exclusive gated community. Ultra-high-net-worth families, ambassadors, and royalty call this home.', avgPricePerSqft: 4500, property_count: 1, vibe: ['Ultra-Exclusive', 'Gated', 'Golf'], image: '/images/neighborhoods/emirates-hills.jpg', latitude: 25.0714, longitude: 55.1700 },
    { id: '5', name: 'JBR', slug: 'jbr', tagline: 'Beachfront Boulevard Living', description: 'One of the world\'s longest urban beaches, lined with world-class restaurants, shops, and entertainment.', avgPricePerSqft: 2400, property_count: 1, vibe: ['Beach', 'Trendy', 'Social'], image: '/images/neighborhoods/jbr.jpg', latitude: 25.0755, longitude: 55.1319 },
    { id: '6', name: 'DIFC', slug: 'difc', tagline: 'Power & Prestige', description: 'The financial heartbeat of the Middle East. Where executives, artists, and entrepreneurs converge.', avgPricePerSqft: 3200, property_count: 1, vibe: ['Business', 'Culinary', 'Prestige'], image: '/images/neighborhoods/difc.jpg', latitude: 25.2122, longitude: 55.2835 },
    { id: '7', name: 'Business Bay', slug: 'business-bay', tagline: 'Rising Skyline', description: 'A dynamic waterfront district rising rapidly as Dubai\'s second CBD. Exceptional investment opportunity.', avgPricePerSqft: 1800, property_count: 1, vibe: ['Investment', 'Canal Views', 'Growth'], image: '/images/neighborhoods/business-bay.jpg', latitude: 25.1857, longitude: 55.2631 },
    { id: '8', name: 'Dubai Hills Estate', slug: 'dubai-hills-estate', tagline: 'Contemporary Family Living', description: 'Master-planned green community with championship golf, top schools, and premium retail within walking distance.', avgPricePerSqft: 1600, property_count: 1, vibe: ['Family', 'Green', 'Community'], image: '/images/neighborhoods/dubai-hills.jpg', latitude: 25.1130, longitude: 55.2472 },
    { id: '9', name: 'Al Barari', slug: 'al-barari', tagline: "Nature's Urban Sanctuary", description: 'Dubai\'s only botanical community. 60% green space, natural streams, and rare flora surround every home.', avgPricePerSqft: 2000, property_count: 1, vibe: ['Nature', 'Tranquil', 'Wellness'], image: '/images/neighborhoods/al-barari.jpg', latitude: 25.1124, longitude: 55.3680 },
    { id: '10', name: 'Jumeirah Bay', slug: 'jumeirah-bay', tagline: 'Ultra-Exclusive Island Living', description: 'A private island connected by a bridge, accessible only to owners. Among the most exclusive real estate globally.', avgPricePerSqft: 5000, property_count: 1, vibe: ['Island', 'Ultra-Exclusive', 'Private'], image: '/images/neighborhoods/jumeirah-bay.jpg', latitude: 25.2090, longitude: 55.2570 }
];
