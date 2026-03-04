export interface Property {
    id: string;
    referenceCode: string;
    title: string;
    slug: string;
    description: string;
    propertyType: 'apartment' | 'villa' | 'penthouse' | 'townhouse' | 'duplex' | 'mansion';
    operationType: 'sale' | 'rent';
    neighborhood: string;
    address: string;
    latitude: number;
    longitude: number;
    price: number;          // AED
    pricePerSqft: number;   // AED
    bedrooms: number;
    bathrooms: number;
    sizeSqft: number;
    yearBuilt: number;
    amenities: string[];
    images: string[];       // rutas en /public/images/properties/
    coverImage: string;
    status: 'available' | 'sold' | 'reserved';
    featured: boolean;
    metaTitle: string;
    metaDescription: string;
}

export const PROPERTIES: Property[] = [
    {
        id: '1', referenceCode: 'LDE-001', title: 'The Pearl Residence',
        slug: 'the-pearl-residence-palm-jumeirah',
        description: 'The most prestigious address on Palm Jumeirah. This extraordinary penthouse commands sweeping views across the Arabian Gulf from every room. Five bedrooms, a private rooftop terrace with infinity pool, and a dedicated concierge floor define this once-in-a-generation offering.',
        propertyType: 'penthouse', operationType: 'sale',
        neighborhood: 'Palm Jumeirah', address: 'Palm Jumeirah, The Palm Tower',
        latitude: 25.1124, longitude: 55.1390,
        price: 45000000, pricePerSqft: 5294,
        bedrooms: 5, bathrooms: 7, sizeSqft: 8500, yearBuilt: 2019,
        amenities: ['Private Pool', 'Concierge', 'Private Elevator', 'Smart Home', 'Wine Cellar', 'Cinema Room', 'Gym', 'Beach Access', '4 Parking Spaces'],
        images: ['/images/properties/prop1-1.jpg', '/images/properties/prop1-2.jpg', '/images/properties/prop1-3.jpg'],
        coverImage: '/images/properties/prop1-1.jpg',
        status: 'available', featured: true,
        metaTitle: 'The Pearl Residence — AED 45M Penthouse | Palm Jumeirah | Luxe Dubai Estates',
        metaDescription: 'Ultra-luxury 5-bedroom penthouse on Palm Jumeirah with private pool and Gulf views. AED 45,000,000.'
    },
    {
        id: '2', referenceCode: 'LDE-002', title: 'Marina Heights Studio',
        slug: 'marina-heights-studio-dubai-marina',
        description: 'A sleek, fully furnished studio in the heart of Dubai Marina. Perfect for young professionals or as an investment property with strong rental yields. Walk to the Marina Walk, restaurants, and the beach in minutes.',
        propertyType: 'apartment', operationType: 'sale',
        neighborhood: 'Dubai Marina', address: 'Dubai Marina, Marina Heights Tower',
        latitude: 25.0780, longitude: 55.1384,
        price: 1200000, pricePerSqft: 2308,
        bedrooms: 0, bathrooms: 1, sizeSqft: 520, yearBuilt: 2018,
        amenities: ['Gym', 'Pool', 'Concierge', '1 Parking Space', 'Balcony', 'Fully Furnished'],
        images: ['/images/properties/prop2-1.jpg', '/images/properties/prop2-2.jpg'],
        coverImage: '/images/properties/prop2-1.jpg',
        status: 'available', featured: false,
        metaTitle: 'Marina Heights Studio — AED 1.2M | Dubai Marina',
        metaDescription: 'Furnished studio apartment in Dubai Marina with marina views. AED 1,200,000.'
    },
    {
        id: '3', referenceCode: 'LDE-003', title: 'Downtown Panorama',
        slug: 'downtown-panorama-downtown-dubai',
        description: 'Wake up to direct Burj Khalifa views every morning. This elegant 2-bedroom apartment in the heart of Downtown Dubai delivers the full spectacle of the city. Floor-to-ceiling glass, designer interiors, and the Dubai Fountain at your feet.',
        propertyType: 'apartment', operationType: 'sale',
        neighborhood: 'Downtown Dubai', address: 'Downtown Dubai, Act One | Act Two',
        latitude: 25.1972, longitude: 55.2744,
        price: 3800000, pricePerSqft: 2111,
        bedrooms: 2, bathrooms: 2, sizeSqft: 1800, yearBuilt: 2020,
        amenities: ['Burj Khalifa View', 'Fountain View', 'Pool', 'Gym', 'Concierge', '1 Parking'],
        images: ['/images/properties/prop3-1.jpg', '/images/properties/prop3-2.jpg'],
        coverImage: '/images/properties/prop3-1.jpg',
        status: 'available', featured: true,
        metaTitle: 'Downtown Panorama — AED 3.8M | Burj Khalifa Views | Downtown Dubai',
        metaDescription: '2-bedroom apartment with direct Burj Khalifa views in Downtown Dubai. AED 3,800,000.'
    },
    {
        id: '4', referenceCode: 'LDE-004', title: 'Creek Harbour Gem',
        slug: 'creek-harbour-gem-dubai-creek',
        description: 'Dubai Creek Harbour is the city\'s most exciting new destination. This spacious 2-bedroom apartment offers panoramic creek and city views, moments from the future world\'s tallest tower. A generational investment opportunity.',
        propertyType: 'apartment', operationType: 'sale',
        neighborhood: 'Dubai Creek Harbour', address: 'Dubai Creek Harbour, Creek Gate',
        latitude: 25.2088, longitude: 55.3319,
        price: 2500000, pricePerSqft: 1786,
        bedrooms: 2, bathrooms: 2, sizeSqft: 1400, yearBuilt: 2022,
        amenities: ['Creek View', 'Pool', 'Gym', 'Kids Play Area', '1 Parking', 'Smart Home'],
        images: ['/images/properties/prop4-1.jpg'],
        coverImage: '/images/properties/prop4-1.jpg',
        status: 'available', featured: false,
        metaTitle: 'Creek Harbour Gem — AED 2.5M | Dubai Creek Harbour',
        metaDescription: '2-bedroom with creek views in Dubai Creek Harbour. AED 2,500,000.'
    },
    {
        id: '5', referenceCode: 'LDE-005', title: 'Jumeirah Bay Masterpiece',
        slug: 'jumeirah-bay-masterpiece-villa',
        description: 'One of only a handful of villas on exclusive Jumeirah Bay Island. This 7-bedroom masterpiece spans 25,000 sq.ft across four floors, with a private jetty, infinity pool, and staff quarters. An unparalleled statement of wealth and taste.',
        propertyType: 'villa', operationType: 'sale',
        neighborhood: 'Jumeirah Bay', address: 'Jumeirah Bay Island, Dubai',
        latitude: 25.2090, longitude: 55.2570,
        price: 120000000, pricePerSqft: 4800,
        bedrooms: 7, bathrooms: 9, sizeSqft: 25000, yearBuilt: 2021,
        amenities: ['Private Jetty', 'Infinity Pool', 'Staff Quarters', 'Private Beach', '6 Parking', 'Cinema', 'Wine Cellar', 'Spa', 'Gym'],
        images: ['/images/properties/prop5-1.jpg', '/images/properties/prop5-2.jpg'],
        coverImage: '/images/properties/prop5-1.jpg',
        status: 'available', featured: true,
        metaTitle: 'Jumeirah Bay Masterpiece — AED 120M Ultra-Luxury Villa',
        metaDescription: '7-bedroom villa on private Jumeirah Bay Island with private jetty. AED 120,000,000.'
    },
    {
        id: '6', referenceCode: 'LDE-006', title: 'Business Bay Executive',
        slug: 'business-bay-executive-apartment',
        description: 'A sharp, contemporary 1-bedroom apartment for the modern executive. Located in the dynamic Business Bay, offering spectacular canal and skyline views. High rental yield potential in one of Dubai\'s fastest-growing districts.',
        propertyType: 'apartment', operationType: 'sale',
        neighborhood: 'Business Bay', address: 'Business Bay, Vogue Tower',
        latitude: 25.1857, longitude: 55.2631,
        price: 1800000, pricePerSqft: 1895,
        bedrooms: 1, bathrooms: 1, sizeSqft: 950, yearBuilt: 2019,
        amenities: ['Canal View', 'Pool', 'Gym', 'Concierge', '1 Parking'],
        images: ['/images/properties/prop6-1.jpg'],
        coverImage: '/images/properties/prop6-1.jpg',
        status: 'available', featured: false,
        metaTitle: 'Business Bay Executive — AED 1.8M | Canal Views',
        metaDescription: '1-bedroom apartment with canal views in Business Bay. AED 1,800,000.'
    },
    {
        id: '7', referenceCode: 'LDE-007', title: 'Emirates Hills Royal Estate',
        slug: 'emirates-hills-royal-estate',
        description: 'Welcome to the Beverly Hills of Dubai. This grand 8-bedroom estate in the ultra-exclusive Emirates Hills community sits on a prime Golf Course plot. Palatial interiors, a 25-meter pool, and total privacy define this rare offering.',
        propertyType: 'mansion', operationType: 'sale',
        neighborhood: 'Emirates Hills', address: 'Emirates Hills, Sector V',
        latitude: 25.0714, longitude: 55.1700,
        price: 85000000, pricePerSqft: 4722,
        bedrooms: 8, bathrooms: 10, sizeSqft: 18000, yearBuilt: 2017,
        amenities: ['Golf Course View', '25m Pool', 'Garage (4)', 'Gym', 'Cinema', 'Staff Quarters', 'Tennis Court', 'Wine Cellar'],
        images: ['/images/properties/prop7-1.jpg', '/images/properties/prop7-2.jpg'],
        coverImage: '/images/properties/prop7-1.jpg',
        status: 'available', featured: true,
        metaTitle: 'Emirates Hills Royal Estate — AED 85M | Golf Course Mansion',
        metaDescription: '8-bedroom mansion on Golf Course in Emirates Hills. AED 85,000,000.'
    },
    {
        id: '8', referenceCode: 'LDE-008', title: 'JBR Beachfront Luxury',
        slug: 'jbr-beachfront-luxury-apartment',
        description: 'Steps from the JBR beach, this 3-bedroom apartment offers the ultimate urban beach lifestyle. A generous terrace with sea views, premium finishes, and the iconic Walk right outside your door. Golden Visa eligible.',
        propertyType: 'apartment', operationType: 'sale',
        neighborhood: 'JBR', address: 'Jumeirah Beach Residence, Sadaf',
        latitude: 25.0755, longitude: 55.1319,
        price: 4200000, pricePerSqft: 1909,
        bedrooms: 3, bathrooms: 3, sizeSqft: 2200, yearBuilt: 2015,
        amenities: ['Sea View', 'Beach Access', 'Pool', 'Gym', 'Concierge', '2 Parking', 'Terrace'],
        images: ['/images/properties/prop8-1.jpg'],
        coverImage: '/images/properties/prop8-1.jpg',
        status: 'available', featured: true,
        metaTitle: 'JBR Beachfront Luxury — AED 4.2M | Sea Views & Beach Access',
        metaDescription: '3-bedroom with direct sea views and beach access at JBR. AED 4,200,000.'
    },
    {
        id: '9', referenceCode: 'LDE-009', title: 'DIFC Signature Loft',
        slug: 'difc-signature-loft-duplex',
        description: 'Power meets design in the heart of Dubai\'s financial district. This stunning duplex loft features double-height ceilings, an art collector\'s gallery wall, and a private roof terrace. Perfect for DIFC professionals who demand the extraordinary.',
        propertyType: 'duplex', operationType: 'sale',
        neighborhood: 'DIFC', address: 'DIFC, Index Tower',
        latitude: 25.2122, longitude: 55.2835,
        price: 5500000, pricePerSqft: 1964,
        bedrooms: 2, bathrooms: 3, sizeSqft: 2800, yearBuilt: 2018,
        amenities: ['Roof Terrace', 'Double-Height Ceilings', 'Concierge', 'Gym', 'Pool', '2 Parking'],
        images: ['/images/properties/prop9-1.jpg'],
        coverImage: '/images/properties/prop9-1.jpg',
        status: 'available', featured: false,
        metaTitle: 'DIFC Signature Loft — AED 5.5M | Duplex with Roof Terrace',
        metaDescription: 'Duplex loft in DIFC with private roof terrace and double-height ceilings. AED 5,500,000.'
    },
    {
        id: '10', referenceCode: 'LDE-010', title: 'Arabian Ranches Family Villa',
        slug: 'arabian-ranches-family-villa',
        description: 'The definitive family villa in the beloved Arabian Ranches community. Four spacious bedrooms, a large garden, private pool, and walking distance to international schools and the golf club. Community living at its finest.',
        propertyType: 'villa', operationType: 'sale',
        neighborhood: 'Arabian Ranches', address: 'Arabian Ranches, Mirador',
        latitude: 25.0339, longitude: 55.2719,
        price: 6800000, pricePerSqft: 1511,
        bedrooms: 4, bathrooms: 5, sizeSqft: 4500, yearBuilt: 2016,
        amenities: ['Private Pool', 'Garden', 'Maid\'s Room', 'Double Garage', 'Golf Course Nearby', 'School Nearby'],
        images: ['/images/properties/prop10-1.jpg'],
        coverImage: '/images/properties/prop10-1.jpg',
        status: 'available', featured: false,
        metaTitle: 'Arabian Ranches Family Villa — AED 6.8M | 4BR with Pool',
        metaDescription: '4-bedroom villa with private pool in Arabian Ranches. AED 6,800,000.'
    },
    {
        id: '11', referenceCode: 'LDE-011', title: 'Palm Garden Townhouse',
        slug: 'palm-garden-townhouse-palm-jumeirah',
        description: 'A rare Palm Jumeirah townhouse with a private garden leading directly to the beach. Four bedrooms arranged across three floors, with a rooftop terrace offering Atlantis views. The Palm\'s most coveted residential product.',
        propertyType: 'townhouse', operationType: 'sale',
        neighborhood: 'Palm Jumeirah', address: 'Palm Jumeirah, Garden Homes',
        latitude: 25.1244, longitude: 55.1469,
        price: 15000000, pricePerSqft: 2885,
        bedrooms: 4, bathrooms: 5, sizeSqft: 5200, yearBuilt: 2008,
        amenities: ['Private Beach', 'Private Garden', 'Rooftop Terrace', '2 Parking', 'Atlantis View'],
        images: ['/images/properties/prop11-1.jpg'],
        coverImage: '/images/properties/prop11-1.jpg',
        status: 'available', featured: true,
        metaTitle: 'Palm Garden Townhouse — AED 15M | Private Beach | Palm Jumeirah',
        metaDescription: '4-bedroom townhouse with private beach on Palm Jumeirah. AED 15,000,000.'
    },
    {
        id: '12', referenceCode: 'LDE-012', title: 'Bluewaters Sky Penthouse',
        slug: 'bluewaters-sky-penthouse',
        description: 'Perched atop the iconic Bluewaters Island, this penthouse offers 360-degree views of Dubai, the Arabian Gulf, and the Ain Dubai wheel. Designer interiors, private beach club membership, and a 1,200 sq.ft terrace complete this extraordinary residence.',
        propertyType: 'penthouse', operationType: 'sale',
        neighborhood: 'Bluewaters Island', address: 'Bluewaters Island, Residences',
        latitude: 25.0806, longitude: 55.1204,
        price: 28000000, pricePerSqft: 4118,
        bedrooms: 4, bathrooms: 5, sizeSqft: 6800, yearBuilt: 2021,
        amenities: ['360° Views', 'Private Terrace', 'Beach Club Access', 'Pool', 'Gym', '2 Parking', 'Concierge'],
        images: ['/images/properties/prop12-1.jpg'],
        coverImage: '/images/properties/prop12-1.jpg',
        status: 'available', featured: true,
        metaTitle: 'Bluewaters Sky Penthouse — AED 28M | 360° Dubai Views',
        metaDescription: 'Penthouse on Bluewaters Island with 360-degree views. AED 28,000,000.'
    },
    {
        id: '13', referenceCode: 'LDE-013', title: 'Al Barari Forest Retreat',
        slug: 'al-barari-forest-retreat-villa',
        description: 'Escape the city without leaving it. Al Barari is Dubai\'s only lush botanical community where 60% of the land is dedicated to greenery. This 6-bedroom villa is surrounded by fragrant gardens, natural streams, and rare botanical species.',
        propertyType: 'villa', operationType: 'sale',
        neighborhood: 'Al Barari', address: 'Al Barari, Bungalows',
        latitude: 25.1124, longitude: 55.3680,
        price: 22000000, pricePerSqft: 2200,
        bedrooms: 6, bathrooms: 7, sizeSqft: 10000, yearBuilt: 2019,
        amenities: ['Botanical Gardens', 'Private Pool', 'Gym', 'Spa', 'Staff Quarters', '3 Parking', 'Stream View'],
        images: ['/images/properties/prop13-1.jpg'],
        coverImage: '/images/properties/prop13-1.jpg',
        status: 'available', featured: false,
        metaTitle: 'Al Barari Forest Retreat — AED 22M | Botanical Villa in Dubai',
        metaDescription: '6-bedroom villa surrounded by botanical gardens in Al Barari. AED 22,000,000.'
    },
    {
        id: '14', referenceCode: 'LDE-014', title: 'City Walk Urban Duplex',
        slug: 'city-walk-urban-duplex',
        description: 'City Walk is Dubai\'s answer to a European boulevard. This premium duplex apartment offers open-plan living, a private terrace, and direct access to the best dining and retail in the city. European elegance meets Arabian luxury.',
        propertyType: 'duplex', operationType: 'sale',
        neighborhood: 'City Walk', address: 'City Walk, Building 21',
        latitude: 25.2048, longitude: 55.2500,
        price: 7200000, pricePerSqft: 2250,
        bedrooms: 3, bathrooms: 4, sizeSqft: 3200, yearBuilt: 2020,
        amenities: ['Private Terrace', 'Pool', 'Gym', 'Concierge', '2 Parking', 'Retail at Doorstep'],
        images: ['/images/properties/prop14-1.jpg'],
        coverImage: '/images/properties/prop14-1.jpg',
        status: 'available', featured: false,
        metaTitle: 'City Walk Urban Duplex — AED 7.2M | 3BR Duplex Dubai',
        metaDescription: '3-bedroom duplex with private terrace at City Walk, Dubai. AED 7,200,000.'
    },
    {
        id: '15', referenceCode: 'LDE-015', title: 'Dubai Hills Grand Mansion',
        slug: 'dubai-hills-grand-mansion',
        description: 'A commanding presence in Dubai\'s most sought-after community. This 6-bedroom mansion on a prime golf course plot features a cinema room, wine cellar, and expansive terraces at every level. School bus stop, park, and hospital all within walking distance.',
        propertyType: 'mansion', operationType: 'sale',
        neighborhood: 'Dubai Hills Estate', address: 'Dubai Hills Estate, Golf Place',
        latitude: 25.1130, longitude: 55.2472,
        price: 35000000, pricePerSqft: 2917,
        bedrooms: 6, bathrooms: 8, sizeSqft: 12000, yearBuilt: 2022,
        amenities: ['Golf Course View', 'Cinema', 'Wine Cellar', 'Pool', 'Gym', 'Staff Quarters', '4 Garage', 'Smart Home'],
        images: ['/images/properties/prop15-1.jpg'],
        coverImage: '/images/properties/prop15-1.jpg',
        status: 'available', featured: true,
        metaTitle: 'Dubai Hills Grand Mansion — AED 35M | Golf Course Mansion',
        metaDescription: '6-bedroom mansion on golf course in Dubai Hills Estate. AED 35,000,000.'
    }
];

export function getPropertyBySlug(slug: string): Property | undefined {
    return PROPERTIES.find(p => p.slug === slug);
}

export function getFeaturedProperties(): Property[] {
    return PROPERTIES.filter(p => p.featured);
}

export function getPropertiesByNeighborhood(neighborhood: string): Property[] {
    return PROPERTIES.filter(p => p.neighborhood.toLowerCase().includes(neighborhood.toLowerCase()));
}
