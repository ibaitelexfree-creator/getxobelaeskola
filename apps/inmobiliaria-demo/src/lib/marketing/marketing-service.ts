import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import sql from '@/lib/db';

// ============================================
// TYPES (Adapted for PropertyAI)
// ============================================

export interface MarketingProperty {
    id: number;
    title: string;
    description: string;
    property_type: string;
    location: string;
    price: number;
    currency: string;
    bedrooms: number;
    bathrooms: number;
    amenities: string[];
    photos: string[];
    web_url: string;
}

export interface GeneratedContent {
    instagram_post: string;
    facebook_post: string;
    tiktok_caption: string;
    whatsapp_message: string;
    hashtags: string[];
    price_formatted: string;
}

// ============================================
// HELPERS
// ============================================

const symbols: Record<string, string> = {
    EUR: '€',
    AED: 'AED ',
    USD: '$',
    GBP: '£',
};

function formatPrice(amount: number, currency: string): string {
    const symbol = symbols[currency] || (currency + ' ');
    const formatted = new Intl.NumberFormat('es-ES').format(amount);
    return currency === 'EUR' ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
}

function generateHashtags(property: MarketingProperty): string[] {
    const tags = [
        `#${property.location.replace(/\s/g, '')}`,
        '#inmobiliaria',
        '#realestate',
        '#luxury',
        property.property_type === 'apartment' ? '#piso' : '#casa',
    ];
    if (property.price > 1000000) tags.push('#luxuryhomes', '#luxuryrealestate');
    return [...new Set(tags)].slice(0, 20);
}

// ============================================
// CORE SERVICES
// ============================================

/**
 * Generates marketing content for various platforms based on property data
 */
export async function generateMarketingContent(property: MarketingProperty): Promise<GeneratedContent> {
    const price_formatted = formatPrice(property.price, property.currency || 'EUR');
    const hashtags = generateHashtags(property);

    const instagram_post = `📍 ${property.location}\n\n${property.description.substring(0, 200)}...\n\n🛏 ${property.bedrooms} habitaciones | 🚿 ${property.bathrooms} baños\n💰 ${price_formatted}\n\n📩 Más info por DM\n\n${hashtags.join(' ')}`;

    const facebook_post = `🏠 NUEVA PROPIEDAD EN ${property.location.toUpperCase()}\n\n${property.description}\n\nDetalles:\n• ${property.bedrooms} hab\n• ${property.bathrooms} baños\n• Precio: ${price_formatted}\n\nLink: ${property.web_url}\n\n#inmobiliaria #propiedades`;

    const tiktok_caption = `${property.property_type === 'apartment' ? 'Piso' : 'Casa'} en ${property.location} 🏠 ${property.bedrooms} hab · ${price_formatted} 👆 Link en bio ${hashtags.slice(0, 5).join(' ')}`;

    const whatsapp_message = `🏠 *${property.title}*\n\n📍 ${property.location}\n🛏 ${property.bedrooms} hab · 🚿 ${property.bathrooms} baños\n💰 *${price_formatted}*\n\n👉 Mira las fotos aquí: ${property.web_url}`;

    return {
        instagram_post,
        facebook_post,
        tiktok_caption,
        whatsapp_message,
        hashtags,
        price_formatted
    };
}

export async function triggerN8nVideo(propertyId: number, chatId?: number): Promise<any> {
    const [property] = await sql`SELECT * FROM properties WHERE id = ${propertyId}`;

    if (!property) throw new Error('Property not found');

    const webhookUrl = process.env.N8N_VIDEO_WEBHOOK_URL || "https://n8n.srv1368175.hstgr.cloud/webhook/realstate-video-gen-v2";

    if (!webhookUrl) throw new Error('n8n Webhook URL not configured');

    // Construct App URL for Callback
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://getxobelaeskola.cloud/realstate';

    // Trigger n8n
    const response = await axios.post(webhookUrl, {
        propertyId: property.id.toString(),
        videoType: 'cinematic_pan',
        imageUrl: property.images && property.images.length > 0 ? property.images[0] : 'https://images.unsplash.com/photo-1600585154340-be6199f7d009',
        propertyTitle: property.title,
        propertyType: property.property_type || 'luxury_villa',
        callbackUrl: `${appUrl}/api/video/callback`,
        chatId: chatId ? chatId.toString() : ''
    });

    // Track in DB
    await sql`
    INSERT INTO generated_videos (property_id, video_type, status)
    VALUES (${propertyId}, 'cinematic_pan', 'processing')
  `;

    return response.data;
}

/**
 * Gets active social connections for an agency
 */
export async function getActiveSocialConnections(agencyId?: string) {
    // If agencyId is null, get all active connections for the demo
    return await sql`
    SELECT * FROM social_connections 
    WHERE is_active = true 
    ${agencyId ? sql`AND agency_id = ${agencyId}` : sql``}
  `;
}
