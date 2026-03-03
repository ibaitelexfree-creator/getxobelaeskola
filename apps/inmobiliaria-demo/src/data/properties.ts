export type PropertyType = 'Apartment' | 'Villa' | 'Penthouse' | 'Townhouse' | 'Duplex' | 'Mansion';

export interface Property {
    id: string;
    slug: string;
    name: string;
    neighborhood: string;
    price: number;
    type: PropertyType;
    bedrooms: number | 'Studio';
    bathrooms: number;
    sqft: number;
    yearBuilt: number;
    description: string;
    featured: boolean;
    mainImage: string;
    gallery: string[];
    amenities: string[];
    metaTitle: string;
    metaDescription: string;
}

export const PROPERTIES: Property[] = [
    {
        id: 'prop1',
        slug: 'sky-penthouse-palm-jumeirah',
        name: 'The Pearl Penthouse',
        neighborhood: 'Palm Jumeirah',
        price: 45000000,
        type: 'Penthouse',
        bedrooms: 5,
        bathrooms: 6,
        sqft: 8500,
        yearBuilt: 2023,
        description: 'Breathtaking 360-degree views of the Arabian Gulf and the Dubai skyline. This ultra-luxury penthouse in Palm Jumeirah features floor-to-ceiling windows, a private infinity pool, and world-class finishes from top Italian designers.',
        featured: true,
        mainImage: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6199f7c009?auto=format&fit=crop&w=1600&q=80',
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80',
        ],
        amenities: ['Private Pool', 'Gym', 'Cinema Room', 'Smart Home', 'Concierge Service', 'Private Elevator'],
        metaTitle: 'The Pearl Penthouse Palm Jumeirah | Luxe Dubai Estates',
        metaDescription: 'Luxury 5-bedroom penthouse in Palm Jumeirah with private infinity pool and stunning skyline views.'
    },
    {
        id: 'prop2',
        slug: 'marina-royal-duplex',
        name: 'Marina Royal Duplex',
        neighborhood: 'Dubai Marina',
        price: 12500000,
        type: 'Duplex',
        bedrooms: 3,
        bathrooms: 4,
        sqft: 3200,
        yearBuilt: 2021,
        description: 'Expertly designed duplex in the heart of Dubai Marina. High ceilings, designer kitchen, and expansive terraces overlooking the yacht club. A perfect blend of urban density and open-air luxury.',
        featured: true,
        mainImage: 'https://images.unsplash.com/photo-1512918766675-ed41f39c273a?auto=format&fit=crop&w=1600&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1512918766675-ed41f39c273a?auto=format&fit=crop&w=1600&q=80',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
            'https://images.unsplash.com/photo-1600210492493-094705146cfa?auto=format&fit=crop&w=1600&q=80',
        ],
        amenities: ['Terrace', 'Security', 'Shared Pool', 'Spa', 'Valet Parking', 'Marina Views'],
        metaTitle: 'Marina Royal Duplex for Sale | Dubai Marina | Luxe Dubai Estates',
        metaDescription: 'Elegant 3-bedroom duplex with marina views in one of Dubai\'s most sought-after residential towers.'
    },
    {
        id: 'prop3',
        slug: 'emerald-villa-emirates-hills',
        name: 'Emerald Mansion',
        neighborhood: 'Emirates Hills',
        price: 85000000,
        type: 'Mansion',
        bedrooms: 7,
        bathrooms: 9,
        sqft: 15000,
        yearBuilt: 2022,
        description: 'A masterpiece of contemporary architecture in the exclusive Emirates Hills. This grand mansion offers unparalleled privacy, lush gardens, and a grand entrance with double-height ceilings. The property overlooks the championship golf course.',
        featured: true,
        mainImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80',
            'https://images.unsplash.com/photo-1613977252367-a8fe8799b776?auto=format&fit=crop&w=1600&q=80',
            'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80',
        ],
        amenities: ['Gated Community', 'Private Elevator', 'Wine Cellar', 'Landscaped Garden', 'Rooftop Lounge', 'Home Cinema'],
        metaTitle: 'Emerald Mansion Emirates Hills | Ultra-Luxury Property Dubai',
        metaDescription: '7-bedroom contemporary mansion in Emirates Hills featuring private elevator, cinema, and lush gardens.'
    },
    {
        id: 'prop4',
        slug: 'business-bay-executive-loft',
        name: 'Business Bay Executive Loft',
        neighborhood: 'Business Bay',
        price: 3200000,
        type: 'Apartment',
        bedrooms: 1,
        bathrooms: 2,
        sqft: 1100,
        yearBuilt: 2023,
        description: 'Ultra-modern loft with floor-to-ceiling windows offering direct views of the Dubai Canal. Perfect for young professionals seeking a sophisticated urban retreat with direct access to Downtown.',
        featured: false,
        mainImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80',
            'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80',
        ],
        amenities: ['Shared Pool', 'Gym', 'Balcony', 'Canal View', 'Built-in Wardrobes'],
        metaTitle: '1BR Loft for Sale in Business Bay | Luxe Dubai Estates',
        metaDescription: 'Modern 1-bedroom loft in Business Bay with stunning canal views. High ROI investment opportunity.'
    },
    {
        id: 'prop5',
        slug: 'jbr-sky-collection-residence',
        name: 'Sky Collection Residence',
        neighborhood: 'JBR',
        price: 8900000,
        type: 'Apartment',
        bedrooms: 3,
        bathrooms: 4,
        sqft: 2400,
        yearBuilt: 2021,
        description: 'Experience beachfront living at its finest. This 3-bedroom residence in JBR offers the best of both worlds: high-floor views and immediate access to the sand and sea.',
        featured: false,
        mainImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
            'https://images.unsplash.com/photo-1626122045638-7667ff433230?auto=format&fit=crop&w=1600&q=80',
        ],
        amenities: ['Beach Access', 'Gym', 'Pool', 'Parking', 'Steam Room', '24/7 Security'],
        metaTitle: 'JBR Beachfront Luxury for Sale | Luxe Dubai Estates',
        metaDescription: '3-bedroom luxury apartment in JBR with panoramic sea views and direct beach access.'
    },
    {
        id: 'prop6',
        slug: 'dubai-hills-greenview-villa',
        name: 'Greenview Family Villa',
        neighborhood: 'Dubai Hills Estate',
        price: 18500000,
        type: 'Villa',
        bedrooms: 5,
        bathrooms: 6,
        sqft: 6500,
        yearBuilt: 2022,
        description: 'A modern family villa located in the heart of Dubai Hills Estate. This property features a large private garden, open-plan living areas, and high-end finishes throughout.',
        featured: true,
        mainImage: 'https://images.unsplash.com/photo-1600585154340-be6199f7c009?auto=format&fit=crop&w=1600&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1600585154340-be6199f7c009?auto=format&fit=crop&w=1600&q=80',
            'https://images.unsplash.com/photo-1600047509807-ba8f99d6957c?auto=format&fit=crop&w=1600&q=80',
        ],
        amenities: ['Private Garden', 'Community Park', 'BBQ Area', 'Covered Parking', 'Maid\'s Room'],
        metaTitle: '5BR Villa Dubai Hills Estate | Family Luxury Real Estate',
        metaDescription: 'Spacious 5-bedroom family villa in Dubai Hills Estate with garden and community views.'
    },
    {
        id: 'prop7',
        slug: 'difc-signature-loft',
        name: 'DIFC Signature Loft',
        neighborhood: 'DIFC',
        price: 5200000,
        type: 'Duplex',
        bedrooms: 2,
        bathrooms: 3,
        sqft: 2100,
        yearBuilt: 2019,
        description: 'Located in the financial heartbeat of Dubai, this industrial-chic loft features double-height ceilings and artisanal finishes. A rare find for art collectors and sophisticated urbanites.',
        featured: false,
        mainImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80',
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80',
        ],
        amenities: ['Concierge Service', 'Art Gallery Lighting', 'Library', 'Fitness Center', 'Retail Outlets'],
        metaTitle: 'Industrial Loft DIFC for Sale | Luxury Duplex Dubai',
        metaDescription: 'Modern 2-bedroom duplex loft in DIFC with industrial design and signature finishes.'
    },
    {
        id: 'prop8',
        slug: 'jumeirah-bay-island-retreat',
        name: 'Island Retreat Mansion',
        neighborhood: 'Jumeirah Bay',
        price: 145000000,
        type: 'Mansion',
        bedrooms: 6,
        bathrooms: 8,
        sqft: 18000,
        yearBuilt: 2024,
        description: 'An architectural marvel on the private Jumeirah Bay Island. This ultra-exclusive property offers a private beach, a 25-meter infinity pool, and custom-made furniture from world-renowned designers.',
        featured: true,
        mainImage: 'https://images.unsplash.com/photo-1613977252367-a8fe8799b776?auto=format&fit=crop&w=1600&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1613977252367-a8fe8799b776?auto=format&fit=crop&w=1600&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6199f7c009?auto=format&fit=crop&w=1600&q=80',
        ],
        amenities: ['Private Beach', 'Infinity Pool', 'Staff Quarters', 'Home Automation', 'Spa & Wellness Center'],
        metaTitle: 'Jumeirah Bay Island Mansion | Most Expensive Properties Dubai',
        metaDescription: 'Ultra-exclusive 6-bedroom mansion on Jumeirah Bay Island with private beach and pier access.'
    }
];

export const getFeaturedProperties = () => PROPERTIES.filter(p => p.featured);
export const getPropertyBySlug = (slug: string) => PROPERTIES.find(p => p.slug === slug);
export const getPropertiesByNeighborhood = (neighborhood: string) => PROPERTIES.filter(p => p.neighborhood === neighborhood);
