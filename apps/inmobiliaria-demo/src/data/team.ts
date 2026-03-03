export interface TeamMember {
    id: string;
    name: string;
    role: string;
    specialty: string;
    languages: string[];
    image: string;
}

export const TEAM: TeamMember[] = [
    {
        id: '1',
        name: 'Robert Stark',
        role: 'Senior Property Advisor',
        specialty: 'Ultra-Luxury Mansions & Estates',
        languages: ['English', 'German'],
        image: '/images/team/robert.jpg'
    },
    {
        id: '2',
        name: 'Elena Mikhailova',
        role: 'Penthouse Specialist',
        specialty: 'Palm Jumeirah & Beachfront Properties',
        languages: ['Russian', 'English'],
        image: '/images/team/elena.jpg'
    },
    {
        id: '3',
        name: 'Omar Mansour',
        role: 'Real Estate Consultant',
        specialty: 'Investment Opportunities & Rental Yields',
        languages: ['Arabic', 'English', 'French'],
        image: '/images/team/omar.jpg'
    },
    {
        id: '4',
        name: 'Lina Katsumi',
        role: 'Relationship Manager',
        specialty: 'Client Experience & Portfolio Management',
        languages: ['English', 'Japanese', 'Spanish'],
        image: '/images/team/lina.jpg'
    }
];
