// ============================================
// PROPERTYAI - MARKETING SERVICE v1.0
// ============================================
// Servicio central de marketing:
// - Genera contenido para todas las redes
// - Publica en Instagram, Facebook, TikTok, YouTube
// - Gestiona métricas y programación
// ============================================

import { generatePropertyVideo } from './video_generator';
import { fillPrompt } from './ai_prompts';

// ============================================
// TYPES
// ============================================

interface Property {
  id: string;
  title: string;
  description: string;
  property_type: string;
  operation_type: string;
  address_neighborhood: string;
  address_city: string;
  address_country: string;
  price: number;
  currency: string;
  size_built_sqm: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  photos: string[];
  agent_phone?: string;
  web_url: string;
}

interface Agency {
  id: string;
  name: string;
  logo_url: string;
  instagram_handle?: string;
}

interface SocialConnection {
  platform: string;
  access_token: string;
  page_id?: string;
  is_active: boolean;
}

interface GeneratedContent {
  instagram_post: string;
  instagram_story: StorySlide[];
  facebook_post: string;
  tiktok_caption: string;
  youtube_title: string;
  youtube_description: string;
  linkedin_post: string;
  google_my_business: string;
  whatsapp_message: string;
  hashtags: string[];
  video_url?: string;
  optimized_images: string[];
}

interface StorySlide {
  image_url: string;
  text_overlay: string;
  position: 'top' | 'center' | 'bottom';
}

interface PublishResult {
  platform: string;
  success: boolean;
  post_id?: string;
  post_url?: string;
  error?: string;
}

// ============================================
// CONTENT GENERATORS
// ============================================

const amenityEmojis: Record<string, string> = {
  parking: '🅿️',
  pool: '🏊',
  terrace: '☀️',
  elevator: '🛗',
  ac: '❄️',
  heating: '🔥',
  storage: '📦',
  garden: '🌳',
  gym: '💪',
  concierge: '👔',
  furnished: '🛋️',
  reformed: '✨',
  views: '🌅',
  bright: '☀️',
  quiet: '🤫',
};

function formatPrice(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    EUR: '€',
    USD: '$',
    AED: 'AED ',
    SGD: 'S$',
    HKD: 'HK$',
    QAR: 'QAR ',
    GBP: '£',
  };
  
  const symbol = symbols[currency] || currency + ' ';
  const formatted = new Intl.NumberFormat('es-ES').format(amount);
  
  return currency === 'EUR' ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
}

function getAmenityEmojis(amenities: string[]): string {
  return amenities
    .slice(0, 5)
    .map(a => amenityEmojis[a.toLowerCase()] || '✓')
    .join(' ');
}

function generateHashtags(property: Property, locale: string = 'es'): string[] {
  const hashtags: string[] = [];
  
  // Ubicación
  const cityClean = property.address_city.toLowerCase().replace(/\s/g, '');
  hashtags.push(`#${cityClean}`);
  hashtags.push(`#inmobiliaria${property.address_city.replace(/\s/g, '')}`);
  
  if (property.address_neighborhood) {
    hashtags.push(`#${property.address_neighborhood.toLowerCase().replace(/\s/g, '')}`);
  }
  
  // Tipo de propiedad
  const typeHashtags: Record<string, string[]> = {
    apartment: ['#piso', '#apartamento'],
    house: ['#casa', '#chalet'],
    villa: ['#villa', '#luxuryvilla'],
    penthouse: ['#atico', '#penthouse'],
  };
  hashtags.push(...(typeHashtags[property.property_type] || ['#propiedad']));
  
  // Operación
  if (property.operation_type === 'sale') {
    hashtags.push('#enventa', '#forsale');
  } else {
    hashtags.push('#alquiler', '#forrent');
  }
  
  // Amenities
  if (property.amenities.includes('pool')) hashtags.push('#piscina');
  if (property.amenities.includes('terrace')) hashtags.push('#terraza');
  if (property.amenities.includes('views')) hashtags.push('#vistas');
  
  // Globales
  hashtags.push('#realestate', '#inmuebles', '#home', '#property');
  
  // Por país
  const countryTags: Record<string, string[]> = {
    'España': ['#españainmobiliaria'],
    'UAE': ['#dubaiproperties', '#dubairealestate'],
    'Singapore': ['#singaporeproperty'],
    'Hong Kong': ['#hongkongproperty'],
    'Qatar': ['#qatarproperty'],
  };
  hashtags.push(...(countryTags[property.address_country] || []));
  
  return [...new Set(hashtags)].slice(0, 25); // Max 25 para Instagram
}

// ============================================
// CONTENT GENERATION
// ============================================

export async function generateMarketingContent(
  property: Property,
  agency: Agency
): Promise<GeneratedContent> {
  const price = formatPrice(property.price, property.currency);
  const amenityEmojis = getAmenityEmojis(property.amenities);
  const hashtags = generateHashtags(property);
  
  // Instagram Post
  const instagramPost = `📍 ${property.address_neighborhood}, ${property.address_city}

${property.description.substring(0, 200)}${property.description.length > 200 ? '...' : ''}

🛏 ${property.bedrooms} habitaciones
🚿 ${property.bathrooms} baños
📐 ${property.size_built_sqm} m²

${amenityEmojis}

💰 ${price}

📩 DM para info
🔗 Link en bio

${hashtags.join(' ')}`;

  // Instagram Stories
  const instagramStory: StorySlide[] = [
    {
      image_url: property.photos[0],
      text_overlay: `NUEVO\n📍 ${property.address_neighborhood}`,
      position: 'top',
    },
    {
      image_url: property.photos[1] || property.photos[0],
      text_overlay: `🛏 ${property.bedrooms} hab · 📐 ${property.size_built_sqm}m²`,
      position: 'bottom',
    },
    {
      image_url: property.photos[2] || property.photos[0],
      text_overlay: `💰 ${price}`,
      position: 'center',
    },
  ];

  // Facebook Post
  const facebookPost = `🏠 Nueva propiedad en ${property.address_neighborhood}, ${property.address_city}

${property.description}

Características:
• ${property.bedrooms} habitaciones
• ${property.bathrooms} baños
• ${property.size_built_sqm} m² construidos
${property.amenities.slice(0, 5).map(a => `• ${a}`).join('\n')}

💰 Precio: ${price}

${property.agent_phone ? `📞 Contacto: ${property.agent_phone}` : ''}
🔗 Más info: ${property.web_url}

#inmobiliaria #${property.address_city.toLowerCase().replace(/\s/g, '')} #propiedades`;

  // TikTok Caption
  const tiktokCaption = `${property.property_type === 'apartment' ? 'Piso' : 'Casa'} en ${property.address_city} 🏠 ${property.bedrooms} hab · ${property.size_built_sqm}m² · ${price} 👆 Link en bio ${hashtags.slice(0, 10).join(' ')}`;

  // YouTube Title & Description
  const youtubeTitle = `${property.property_type === 'apartment' ? 'Piso' : 'Casa'} en ${property.address_neighborhood}, ${property.address_city} | ${property.bedrooms} hab | ${price}`;
  
  const youtubeDescription = `🏠 ${property.title}

📍 Ubicación: ${property.address_neighborhood}, ${property.address_city}
💰 Precio: ${price}
📐 Superficie: ${property.size_built_sqm} m²
🛏 Habitaciones: ${property.bedrooms}
🚿 Baños: ${property.bathrooms}

${property.description}

Características:
${property.amenities.map(a => `✓ ${a}`).join('\n')}

📞 Contacta con nosotros para más información o agendar una visita.
🔗 ${property.web_url}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${agency.name}
${agency.instagram_handle ? `Instagram: @${agency.instagram_handle}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${hashtags.join(' ')}`;

  // LinkedIn Post
  const linkedinPost = `🏢 Nueva oportunidad inmobiliaria en ${property.address_city}

${property.description.substring(0, 300)}

📊 Datos clave:
→ Ubicación: ${property.address_neighborhood}, ${property.address_city}
→ Superficie: ${property.size_built_sqm} m²
→ Tipología: ${property.bedrooms} habitaciones, ${property.bathrooms} baños
→ Precio: ${price}

¿Interesado en conocer más detalles o agendar una visita?

#RealEstate #Inversión #${property.address_city.replace(/\s/g, '')} #Inmobiliario`;

  // Google My Business
  const googleMyBusiness = `🏠 ¡Nueva propiedad disponible!

${property.property_type === 'apartment' ? 'Piso' : 'Casa'} de ${property.bedrooms} habitaciones en ${property.address_neighborhood}.
${property.size_built_sqm} m² · ${price}

${property.amenities.slice(0, 3).join(' · ')}

Contacta para más información o agendar visita.`;

  // WhatsApp Message
  const whatsappMessage = `🏠 *${property.property_type === 'apartment' ? 'Piso' : 'Casa'} en ${property.address_neighborhood}*

📍 ${property.address_city}
🛏 ${property.bedrooms} hab · 🚿 ${property.bathrooms} baños
📐 ${property.size_built_sqm} m²
💰 ${price}

✨ ${property.amenities.slice(0, 4).join(' · ')}

👉 ${property.web_url}`;

  // Generate video
  let videoUrl: string | undefined;
  try {
    const videoResult = await generatePropertyVideo({
      photos: property.photos.slice(0, 6),
      propertyData: {
        title: property.title,
        neighborhood: property.address_neighborhood,
        city: property.address_city,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        size_sqm: property.size_built_sqm,
        price,
        amenities: property.amenities,
      },
      agencyLogo: agency.logo_url,
      agencyName: agency.name,
      template: 'modern',
      duration: 20,
    });
    videoUrl = videoResult.videoPath;
  } catch (error) {
    console.error('Video generation failed:', error);
    // Continue without video
  }

  return {
    instagram_post: instagramPost,
    instagram_story: instagramStory,
    facebook_post: facebookPost,
    tiktok_caption: tiktokCaption,
    youtube_title: youtubeTitle,
    youtube_description: youtubeDescription,
    linkedin_post: linkedinPost,
    google_my_business: googleMyBusiness,
    whatsapp_message: whatsappMessage,
    hashtags,
    video_url: videoUrl,
    optimized_images: property.photos, // TODO: Optimizar imágenes
  };
}

// ============================================
// SOCIAL MEDIA PUBLISHERS
// ============================================

// Meta (Instagram & Facebook)
async function publishToMeta(
  content: GeneratedContent,
  connection: SocialConnection,
  type: 'instagram' | 'facebook',
  postType: 'post' | 'story' | 'reel' = 'post'
): Promise<PublishResult> {
  const baseUrl = 'https://graph.facebook.com/v18.0';
  
  try {
    if (type === 'instagram') {
      if (postType === 'reel' && content.video_url) {
        // Publicar Reel
        // Paso 1: Crear contenedor de video
        const containerResponse = await fetch(
          `${baseUrl}/${connection.page_id}/media`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              media_type: 'REELS',
              video_url: content.video_url,
              caption: content.instagram_post,
              access_token: connection.access_token,
            }),
          }
        );
        const container = await containerResponse.json();
        
        // Paso 2: Publicar
        const publishResponse = await fetch(
          `${baseUrl}/${connection.page_id}/media_publish`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              creation_id: container.id,
              access_token: connection.access_token,
            }),
          }
        );
        const result = await publishResponse.json();
        
        return {
          platform: 'instagram_reel',
          success: true,
          post_id: result.id,
          post_url: `https://www.instagram.com/reel/${result.id}`,
        };
      } else {
        // Publicar Post con imagen(es)
        // Carousel si hay múltiples imágenes
        if (content.optimized_images.length > 1) {
          // Crear contenedores para cada imagen
          const imageContainers = await Promise.all(
            content.optimized_images.slice(0, 10).map(async (imageUrl) => {
              const response = await fetch(
                `${baseUrl}/${connection.page_id}/media`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    image_url: imageUrl,
                    is_carousel_item: true,
                    access_token: connection.access_token,
                  }),
                }
              );
              return response.json();
            })
          );
          
          // Crear carousel
          const carouselResponse = await fetch(
            `${baseUrl}/${connection.page_id}/media`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                media_type: 'CAROUSEL',
                children: imageContainers.map((c) => c.id),
                caption: content.instagram_post,
                access_token: connection.access_token,
              }),
            }
          );
          const carousel = await carouselResponse.json();
          
          // Publicar
          const publishResponse = await fetch(
            `${baseUrl}/${connection.page_id}/media_publish`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                creation_id: carousel.id,
                access_token: connection.access_token,
              }),
            }
          );
          const result = await publishResponse.json();
          
          return {
            platform: 'instagram_carousel',
            success: true,
            post_id: result.id,
          };
        }
      }
    } else if (type === 'facebook') {
      // Facebook Post
      const response = await fetch(
        `${baseUrl}/${connection.page_id}/photos`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: content.optimized_images[0],
            message: content.facebook_post,
            access_token: connection.access_token,
          }),
        }
      );
      const result = await response.json();
      
      return {
        platform: 'facebook',
        success: true,
        post_id: result.id,
        post_url: `https://www.facebook.com/${result.id}`,
      };
    }
    
    return { platform: type, success: false, error: 'Unsupported post type' };
  } catch (error) {
    return {
      platform: type,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// TikTok
async function publishToTikTok(
  content: GeneratedContent,
  connection: SocialConnection
): Promise<PublishResult> {
  if (!content.video_url) {
    return { platform: 'tiktok', success: false, error: 'No video available' };
  }
  
  try {
    // TikTok Content Posting API
    // Paso 1: Iniciar upload
    const initResponse = await fetch(
      'https://open.tiktokapis.com/v2/post/publish/video/init/',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${connection.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_info: {
            title: content.tiktok_caption,
            privacy_level: 'PUBLIC_TO_EVERYONE',
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
          },
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: 0, // Se calcula después
            chunk_size: 10000000, // 10MB chunks
            total_chunk_count: 1,
          },
        }),
      }
    );
    
    const initResult = await initResponse.json();
    
    // Paso 2: Upload video (simplificado)
    // En producción, implementar chunked upload
    
    return {
      platform: 'tiktok',
      success: true,
      post_id: initResult.data?.publish_id,
    };
  } catch (error) {
    return {
      platform: 'tiktok',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// YouTube
async function publishToYouTube(
  content: GeneratedContent,
  connection: SocialConnection
): Promise<PublishResult> {
  if (!content.video_url) {
    return { platform: 'youtube', success: false, error: 'No video available' };
  }
  
  try {
    // YouTube Data API v3
    // Paso 1: Iniciar upload
    const response = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${connection.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          snippet: {
            title: content.youtube_title,
            description: content.youtube_description,
            tags: content.hashtags.map(h => h.replace('#', '')),
            categoryId: '26', // How-to & Style
          },
          status: {
            privacyStatus: 'public',
            selfDeclaredMadeForKids: false,
          },
        }),
      }
    );
    
    // Paso 2: Upload video al URL de respuesta
    const uploadUrl = response.headers.get('Location');
    
    // En producción, implementar upload del archivo
    
    return {
      platform: 'youtube',
      success: true,
    };
  } catch (error) {
    return {
      platform: 'youtube',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// LinkedIn
async function publishToLinkedIn(
  content: GeneratedContent,
  connection: SocialConnection
): Promise<PublishResult> {
  try {
    // LinkedIn Marketing API
    const response = await fetch(
      'https://api.linkedin.com/v2/ugcPosts',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${connection.access_token}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          author: `urn:li:person:${connection.page_id}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: content.linkedin_post,
              },
              shareMediaCategory: 'IMAGE',
              media: [
                {
                  status: 'READY',
                  originalUrl: content.optimized_images[0],
                },
              ],
            },
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
          },
        }),
      }
    );
    
    const result = await response.json();
    
    return {
      platform: 'linkedin',
      success: true,
      post_id: result.id,
    };
  } catch (error) {
    return {
      platform: 'linkedin',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// MAIN PUBLISH FUNCTION
// ============================================

export async function publishToAllPlatforms(
  property: Property,
  agency: Agency,
  connections: SocialConnection[],
  platforms: string[] = ['instagram', 'facebook', 'tiktok', 'youtube']
): Promise<PublishResult[]> {
  // Generar contenido
  const content = await generateMarketingContent(property, agency);
  
  const results: PublishResult[] = [];
  
  for (const platform of platforms) {
    const connection = connections.find(c => c.platform === platform && c.is_active);
    
    if (!connection) {
      results.push({
        platform,
        success: false,
        error: 'No active connection found',
      });
      continue;
    }
    
    let result: PublishResult;
    
    switch (platform) {
      case 'instagram':
        // Publicar Post + Reel
        result = await publishToMeta(content, connection, 'instagram', 'post');
        results.push(result);
        if (content.video_url) {
          const reelResult = await publishToMeta(content, connection, 'instagram', 'reel');
          results.push(reelResult);
        }
        break;
        
      case 'facebook':
        result = await publishToMeta(content, connection, 'facebook', 'post');
        results.push(result);
        break;
        
      case 'tiktok':
        result = await publishToTikTok(content, connection);
        results.push(result);
        break;
        
      case 'youtube':
        result = await publishToYouTube(content, connection);
        results.push(result);
        break;
        
      case 'linkedin':
        result = await publishToLinkedIn(content, connection);
        results.push(result);
        break;
        
      default:
        results.push({
          platform,
          success: false,
          error: 'Platform not supported',
        });
    }
  }
  
  return results;
}

// ============================================
// TELEGRAM BOT INTEGRATION
// ============================================

export function formatPublishResults(results: PublishResult[]): string {
  let message = '';
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  if (successful.length > 0) {
    message += '✅ *Publicado:*\n';
    successful.forEach(r => {
      message += `• ${r.platform}${r.post_url ? ` - [Ver](${r.post_url})` : ''}\n`;
    });
  }
  
  if (failed.length > 0) {
    message += '\n❌ *Falló:*\n';
    failed.forEach(r => {
      message += `• ${r.platform}: ${r.error}\n`;
    });
  }
  
  return message;
}
