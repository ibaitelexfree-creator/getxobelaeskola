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
        avatar: '/images/avatars/avatar-alexander.svg'
    },
    {
        id: '2',
        name: 'Sarah Jenkins',
        title: 'Global Consultant',
        nationality: 'British',
        propertyPurchased: 'Emerald Mansion, Emirates Hills',
        text: "The expertise of the team is unmatched. They handled the complex negotiations for our Emirates Hills estate with complete professionalism and discretion.",
        avatar: '/images/avatars/avatar-sarah.svg'
    },
    {
        id: '3',
        name: 'Dr. Hamad Al-Qassimi',
        title: 'Medical Director',
        nationality: 'Emirati',
        propertyPurchased: 'Dubai Hills Estate Villa',
        text: "Moving our family to Dubai Hills was a major decision. Luxe Dubai Estates made it seamless, handling everything from property search to Golden Visa guidance.",
        avatar: '/images/avatars/avatar-hamad.svg'
    },
    {
        id: '4',
        name: 'Chen Wei',
        title: 'Venture Capitalist',
        nationality: 'Chinese',
        propertyPurchased: 'Marina Royal Duplex',
        text: 'Excellent investment advice. The team provided detailed ROI projections for my Marina property that have already been exceeded within the first six months.',
        avatar: '/images/avatars/avatar-chen.svg'
    },
    {
        id: '5',
        name: 'Isabella Rossi',
        title: 'Fashion Designer',
        nationality: 'Italian',
        propertyPurchased: 'DIFC Signature Loft',
        text: "Finding a space that truly reflects my aesthetic was priority number one. The team found me a signature loft in DIFC that is a living piece of art.",
        avatar: '/images/avatars/avatar-isabella.svg'
    }
];
