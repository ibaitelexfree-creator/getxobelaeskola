export type PropertyType = 'apartment' | 'villa' | 'penthouse' | 'townhouse' | 'duplex' | 'mansion';
export type OperationType = 'sale' | 'rent';
export type PropertyStatus = 'available' | 'sold' | 'reserved';

export interface PropertyFilters {
    propertyType: PropertyType | 'all';
    operationType: OperationType | 'all';
    neighborhood: string;
    priceMin: number;
    priceMax: number;
    bedroomsMin: number;
    sortBy: 'featured' | 'price-asc' | 'price-desc' | 'size-desc' | 'newest';
}

export interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    message: string;
    propertySlug?: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'aisha';
    content: string;
    timestamp: Date;
}
