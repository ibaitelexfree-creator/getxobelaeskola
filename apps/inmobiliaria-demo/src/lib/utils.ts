export function formatPrice(price: number, currency = 'AED'): string {
    if (price >= 1_000_000) {
        return `${currency} ${(price / 1_000_000).toFixed(1)}M`;
    }
    return `${currency} ${price.toLocaleString('en-US')}`;
}

export function formatPriceFull(price: number, currency = 'AED'): string {
    return `${currency} ${price.toLocaleString('en-US')}`;
}

export function formatSqft(sqft: number): string {
    return `${sqft.toLocaleString('en-US')} sq.ft`;
}

export function getBadgeForProperty(property: { featured: boolean; status: string; yearBuilt: number }): string | null {
    if (property.status === 'reserved') return 'Reserved';
    if (property.yearBuilt >= 2023) return 'New';
    if (property.featured) return 'Featured';
    return null;
}

export function slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
