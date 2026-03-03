export interface Testimonial {
    id: string;
    name: string;
    title: string;
    nationality: string;
    propertyPurchased: string;
    text: string;
    avatar?: string;
}

export const TESTIMONIALS: Testimonial[] = [
    {
        id: '1',
        name: 'Alexander Volkov',
        title: 'Tech Entrepreneur',
        nationality: 'Russian',
        propertyPurchased: 'The Pearl Penthouse, Palm Jumeirah',
        text: 'Luxe Dubai Estates provided a level of service I have only experienced in the private banking sector. They found my dream home before it even hit the market.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e'
    },
    {
        id: '2',
        name: 'Sarah Jenkins',
        title: 'Global Consultant',
        nationality: 'British',
        propertyPurchased: 'Emerald Mansion, Emirates Hills',
        text: "The expertise of the team is unmatched. They handled the complex negotiations for our Emirates Hills estate with complete professionalism and discretion.",
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'
    },
    {
        id: '3',
        name: 'Dr. Hamad Al-Qassimi',
        title: 'Medical Director',
        nationality: 'Emirati',
        propertyPurchased: 'Dubai Hills Estate Villa',
        text: "Moving our family to Dubai Hills was a major decision. Luxe Dubai Estates made it seamless, handling everything from property search to Golden Visa guidance.",
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'
    },
    {
        id: '4',
        name: 'Chen Wei',
        title: 'Venture Capitalist',
        nationality: 'Chinese',
        propertyPurchased: 'Marina Royal Duplex',
        text: 'Excellent investment advice. The team provided detailed ROI projections for my Marina property that have already been exceeded within the first six months.',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e'
    },
    {
        id: '5',
        name: 'Isabella Rossi',
        title: 'Fashion Designer',
        nationality: 'Italian',
        propertyPurchased: 'DIFC Signature Loft',
        text: "Finding a space that truly reflects my aesthetic was priority number one. The team found me a signature loft in DIFC that is a living piece of art.",
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80'
    }
];
