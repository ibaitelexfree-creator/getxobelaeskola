# PropertyAI - Marketing Automation Module v1.0

## 🎯 La Visión

```
Agente publica propiedad
         ↓
    1 CLICK
         ↓
┌─────────────────────────────────────┐
│  📸 Instagram Post + Stories        │
│  📘 Facebook Post                   │
│  🎵 TikTok Video                    │
│  🎬 YouTube Shorts                  │
│  👔 LinkedIn Post                   │
│  📍 Google My Business              │
│  💬 WhatsApp mensaje listo          │
└─────────────────────────────────────┘
         ↓
   Todo en 30 segundos
   Todo automático
   Todo profesional
```

---

## 📊 Diagrama del Sistema

```
┌─────────────────────────────────────────────────────────────────────┐
│                     MARKETING ENGINE                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐                                                   │
│  │  PROPERTY    │ ← Datos + Fotos + Descripción                     │
│  │  (input)     │                                                   │
│  └──────┬───────┘                                                   │
│         │                                                            │
│         ▼                                                            │
│  ┌──────────────┐                                                   │
│  │  CONTENT     │                                                   │
│  │  GENERATOR   │                                                   │
│  │              │                                                   │
│  │  ├── Text Generator (por red social)                             │
│  │  ├── Image Processor (resize, watermark)                         │
│  │  ├── Video Generator (FFmpeg)                                    │
│  │  └── Hashtag Generator                                           │
│  └──────┬───────┘                                                   │
│         │                                                            │
│         ▼                                                            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │  INSTAGRAM   │    │   TIKTOK     │    │   YOUTUBE    │          │
│  │  Publisher   │    │   Publisher  │    │   Publisher  │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │  FACEBOOK    │    │   LINKEDIN   │    │   GOOGLE     │          │
│  │  Publisher   │    │   Publisher  │    │   MY BUSINESS│          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│                                                                      │
│         │                                                            │
│         ▼                                                            │
│  ┌──────────────┐                                                   │
│  │  SCHEDULER   │ ← Publica ahora o programa                        │
│  │  (opcional)  │                                                   │
│  └──────────────┘                                                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔌 APIs y Conexiones

### Instagram & Facebook (Meta Business API)

```
Endpoint: https://graph.facebook.com/v18.0/
Auth: OAuth 2.0 + Page Access Token

Capacidades:
✅ Publicar fotos (single + carousel)
✅ Publicar videos (Reels)
✅ Publicar Stories
✅ Programar publicaciones
✅ Obtener métricas

Requisitos:
- Meta Business Account
- Facebook Page vinculada
- Instagram Professional Account
- App registrada en Meta Developers
```

### TikTok (Content Posting API)

```
Endpoint: https://open.tiktokapis.com/v2/
Auth: OAuth 2.0

Capacidades:
✅ Subir videos
✅ Publicar directamente
⚠️ Sin programación (se publica al momento)

Requisitos:
- TikTok Business Account
- App registrada en TikTok Developers
- Usuario autoriza la app
```

### YouTube (Data API v3)

```
Endpoint: https://www.googleapis.com/youtube/v3/
Auth: OAuth 2.0

Capacidades:
✅ Subir videos (incluye Shorts si es vertical <60s)
✅ Configurar título, descripción, tags
✅ Programar publicación
✅ Obtener métricas

Requisitos:
- Google Cloud Project
- YouTube channel vinculado
- API Key + OAuth credentials
```

### LinkedIn (Marketing API)

```
Endpoint: https://api.linkedin.com/v2/
Auth: OAuth 2.0

Capacidades:
✅ Publicar posts con imagen
✅ Publicar artículos
⚠️ Video limitado a Company Pages

Requisitos:
- LinkedIn Page (Company o Personal)
- App registrada en LinkedIn Developers
```

### Google My Business (Business Profile API)

```
Endpoint: https://mybusiness.googleapis.com/v4/
Auth: OAuth 2.0

Capacidades:
✅ Publicar posts con foto
✅ Crear ofertas
✅ Crear eventos
✅ Responder reviews

Requisitos:
- Google Business Profile verificado
- Google Cloud Project
```

---

## 🎬 Generador de Videos

### Tecnología

```
FFmpeg + Node.js
├── Input: Fotos de la propiedad
├── Process: Transiciones + texto + música
└── Output: MP4 vertical (9:16) para Reels/TikTok/Shorts
```

### Specs del Video

| Parámetro | Valor |
|-----------|-------|
| Resolución | 1080x1920 (vertical) |
| FPS | 30 |
| Duración | 15-30 segundos |
| Codec | H.264 |
| Audio | AAC 128kbps |
| Formato | MP4 |

### Estructura del Video

```
[0-2s]    Logo agencia + "Nueva propiedad"
[2-5s]    Foto 1 (exterior/fachada) + ubicación
[5-8s]    Foto 2 (salón) + "X habitaciones"
[8-11s]   Foto 3 (cocina) + "X m²"
[11-14s]  Foto 4 (dormitorio) + características
[14-17s]  Foto 5 (baño/terraza)
[17-20s]  Collage 3 fotos + precio
[20-22s]  Call to action + logo + contacto
```

### Transiciones Disponibles

```
- fade: Fundido suave
- slide_left: Desliza desde derecha
- slide_up: Desliza desde abajo
- zoom_in: Zoom hacia dentro
- zoom_out: Zoom hacia fuera
- blur_transition: Desenfoque entre fotos
```

### Música de Fondo

```
Librería: Pixabay / Mixkit (royalty-free)

Géneros por tipo de propiedad:
├── Luxury: Piano suave, elegante
├── Modern: Lo-fi beats, minimal
├── Family: Acústico, cálido
├── Commercial: Corporate, profesional
└── Beach/Resort: Tropical, relajado
```

---

## 📝 Templates de Posts por Red Social

### Instagram (Post/Carousel)

```
📍 {neighborhood}, {city}

{description_short}

🛏 {bedrooms} habitaciones
🚿 {bathrooms} baños  
📐 {size_sqm} m²
{floor_info}

{amenities_emojis}

💰 {price}

📩 DM para info
🔗 Link en bio

{hashtags}
```

### Instagram Stories

```
Slide 1: Foto principal
         "NUEVO" badge
         📍 {neighborhood}

Slide 2: Foto interior
         🛏 {bedrooms} hab
         📐 {size_sqm} m²

Slide 3: Foto destacada
         💰 {price}
         
Slide 4: Logo agencia
         "Desliza arriba" / Link
```

### TikTok / YouTube Shorts

```
(Texto overlay durante el video)

[Inicio]
"Mira este piso en {city} 👀"

[Fotos pasando]
"{bedrooms} hab · {size_sqm}m²"
"Zona {neighborhood}"

[Final]
"Solo {price}"
"Link en bio 👆"
```

### Facebook

```
🏠 Nueva propiedad en {neighborhood}, {city}

{description_medium}

Características:
• {bedrooms} habitaciones
• {bathrooms} baños
• {size_sqm} m² construidos
• {amenities_list}

💰 Precio: {price}

📞 Contacto: {agent_phone}
🔗 Más info: {property_url}

#inmobiliaria #{city_hashtag} #propiedades
```

### LinkedIn

```
🏢 Nueva oportunidad inmobiliaria en {city}

{description_professional}

📊 Datos clave:
→ Ubicación: {neighborhood}, {city}
→ Superficie: {size_sqm} m²
→ Tipología: {property_type}
→ Precio: {price}

Ideal para {target_audience}.

¿Interesado en conocer más detalles o agendar una visita?

#RealEstate #Inversión #{city} #Inmobiliario
```

### Google My Business

```
🏠 ¡Nueva propiedad disponible!

{property_type} de {bedrooms} habitaciones en {neighborhood}.
{size_sqm} m² · {price}

{amenities_short}

Contacta para más información o agendar visita.
```

### WhatsApp (mensaje para compartir)

```
🏠 *{property_type} en {neighborhood}*

📍 {city}
🛏 {bedrooms} hab · 🚿 {bathrooms} baños
📐 {size_sqm} m²
💰 {price}

✨ {amenities_short}

👉 {property_url}
```

---

## 🏷️ Generador de Hashtags

### Por Ubicación

```javascript
function getLocationHashtags(city, neighborhood, country) {
  const hashtags = [];
  
  // Ciudad
  hashtags.push(`#${city.toLowerCase().replace(/\s/g, '')}`);
  hashtags.push(`#inmobiliaria${city.replace(/\s/g, '')}`);
  
  // Barrio
  if (neighborhood) {
    hashtags.push(`#${neighborhood.toLowerCase().replace(/\s/g, '')}`);
  }
  
  // País
  const countryTags = {
    'España': ['#inmobiliariaespaña', '#propiedadesespaña'],
    'UAE': ['#dubaiproperties', '#dubairealestate'],
    'Singapore': ['#singaporeproperty', '#sgrealestate'],
    'Hong Kong': ['#hongkongproperty', '#hkrealestate'],
    'Qatar': ['#qatarproperty', '#doharealestate'],
  };
  
  hashtags.push(...(countryTags[country] || []));
  
  return hashtags;
}
```

### Por Tipo de Propiedad

```javascript
const propertyTypeHashtags = {
  apartment: ['#piso', '#apartamento', '#apartment'],
  house: ['#casa', '#chalet', '#house'],
  villa: ['#villa', '#luxuryvilla', '#villalife'],
  penthouse: ['#atico', '#penthouse', '#luxurypenthouse'],
  office: ['#oficina', '#office', '#workspace'],
  commercial: ['#local', '#localcomercial', '#retail'],
};
```

### Por Características

```javascript
const amenityHashtags = {
  pool: ['#piscina', '#pool'],
  terrace: ['#terraza', '#terrace'],
  views: ['#vistas', '#views', '#seaview'],
  parking: ['#parking', '#garaje'],
  reformed: ['#reformado', '#renovated'],
  luxury: ['#lujo', '#luxury', '#luxuryrealestate'],
};
```

### Hashtags Globales (siempre incluir)

```javascript
const globalHashtags = [
  '#realestate',
  '#property',
  '#home',
  '#forsale',
  '#realtor',
  '#dreamhome',
  '#househunting',
  '#investment',
];
```

---

## 🔄 Flujo de Usuario (Telegram)

### Activación Manual

```
AGENTE: /promocionar

BOT: 📢 *Promocionar propiedad*
     
     ¿Qué propiedad quieres promocionar?
     
     [Lista de propiedades recientes como botones]

─────────────────────────────────

AGENTE: [Selecciona propiedad]

BOT: 📱 *Canales disponibles*
     
     Selecciona dónde publicar:
     
     [✅ Instagram] [✅ Facebook]
     [✅ TikTok] [✅ YouTube Shorts]
     [⬜ LinkedIn] [⬜ Google My Business]
     
     [🚀 Publicar ahora]
     [🕐 Programar]
     [👀 Vista previa]

─────────────────────────────────

AGENTE: [Pulsa "Vista previa"]

BOT: 👀 *Vista previa*
     
     📸 *Instagram:*
     "📍 Eixample, Barcelona
     Luminoso piso reformado..."
     
     🎬 *Video (TikTok/Reels):*
     [Video preview - 20 seg]
     
     ¿Todo correcto?
     
     [✅ Publicar] [✏️ Editar texto] [❌ Cancelar]

─────────────────────────────────

AGENTE: [Pulsa "Publicar"]

BOT: ⏳ Publicando...
     
     ✅ Instagram - Publicado
     ✅ Facebook - Publicado
     ✅ TikTok - Publicado
     ✅ YouTube - Publicado
     
     🎉 *¡Todo listo!*
     
     📊 Recibirás métricas en 24h
```

### Activación Automática (post-publicación)

```
[Después de que el agente publica una propiedad]

BOT: 🎉 Propiedad publicada en tu web.
     
     ¿Quieres promocionarla en redes sociales?
     
     [🚀 Sí, publicar en todo]
     [📱 Elegir canales]
     [⏭️ Ahora no]

─────────────────────────────────

AGENTE: [Pulsa "Sí, publicar en todo"]

BOT: ⏳ Generando contenido...
     
     ✅ Textos generados
     ✅ Video creado (18 seg)
     ✅ Imágenes optimizadas
     
     Publicando...
     
     ✅ Instagram Post
     ✅ Instagram Reel
     ✅ Facebook
     ✅ TikTok
     ✅ YouTube Shorts
     
     🎉 ¡Promoción completa!
```

---

## 📊 Base de Datos - Tablas Adicionales

```sql
-- Conexiones de redes sociales por agencia
CREATE TABLE social_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    
    -- Plataforma
    platform VARCHAR(50) NOT NULL,  -- 'instagram', 'facebook', 'tiktok', etc.
    
    -- Credenciales (encriptadas)
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    
    -- IDs de la plataforma
    platform_user_id VARCHAR(255),
    platform_page_id VARCHAR(255),  -- Para Facebook/LinkedIn pages
    platform_username VARCHAR(255),
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Publicaciones en redes
CREATE TABLE social_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    connection_id UUID NOT NULL REFERENCES social_connections(id) ON DELETE CASCADE,
    
    -- Plataforma
    platform VARCHAR(50) NOT NULL,
    post_type VARCHAR(50) NOT NULL,  -- 'post', 'story', 'reel', 'short'
    
    -- Contenido
    content_text TEXT,
    media_urls TEXT[],
    video_url TEXT,
    
    -- Estado
    status VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'published', 'failed', 'scheduled'
    scheduled_for TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    platform_post_id VARCHAR(255),  -- ID del post en la plataforma
    platform_post_url TEXT,
    
    -- Error tracking
    error_message TEXT,
    retry_count INT DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Métricas de posts (se actualizan periódicamente)
CREATE TABLE social_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
    
    -- Métricas comunes
    impressions INT DEFAULT 0,
    reach INT DEFAULT 0,
    likes INT DEFAULT 0,
    comments INT DEFAULT 0,
    shares INT DEFAULT 0,
    saves INT DEFAULT 0,
    clicks INT DEFAULT 0,
    
    -- Video específico
    video_views INT DEFAULT 0,
    watch_time_seconds INT DEFAULT 0,
    
    -- Timestamp de la medición
    measured_at TIMESTAMPTZ DEFAULT NOW()
);

-- Videos generados
CREATE TABLE generated_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    
    -- Video info
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_seconds INT,
    resolution VARCHAR(20),  -- '1080x1920'
    file_size_bytes INT,
    
    -- Template usado
    template_id VARCHAR(50),
    music_track VARCHAR(255),
    
    -- Estado
    status VARCHAR(50) DEFAULT 'processing',  -- 'processing', 'ready', 'failed'
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates de contenido personalizados por agencia
CREATE TABLE content_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,  -- null = template global
    
    -- Tipo
    platform VARCHAR(50) NOT NULL,
    post_type VARCHAR(50) NOT NULL,
    
    -- Contenido
    template_text TEXT NOT NULL,
    
    -- Configuración
    is_default BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_social_connections_agency ON social_connections(agency_id);
CREATE INDEX idx_social_posts_property ON social_posts(property_id);
CREATE INDEX idx_social_posts_status ON social_posts(status);
CREATE INDEX idx_social_metrics_post ON social_metrics(post_id);
```

---

## 🛠️ Implementación para Ibai

### Prioridad de implementación

```
FASE 1 (MVP Marketing):
├── ✅ Generador de textos (ya tenemos IA)
├── ✅ Instagram Post (Meta API)
├── ✅ Facebook Post (Meta API)
└── ✅ WhatsApp mensaje (sin API, solo genera texto)

FASE 2 (Video):
├── 🎬 Generador de videos (FFmpeg)
├── 📱 Instagram Reels
├── 🎵 TikTok
└── 🎬 YouTube Shorts

FASE 3 (Extras):
├── 👔 LinkedIn
├── 📍 Google My Business
├── 📊 Dashboard de métricas
└── 🕐 Programación avanzada
```

### Dependencias

```json
{
  "dependencies": {
    "fluent-ffmpeg": "^2.1.2",
    "axios": "^1.6.0",
    "sharp": "^0.33.0"
  }
}
```

### Endpoints necesarios

```
POST /api/marketing/generate-content
     Body: { property_id, platforms: ['instagram', 'facebook', ...] }
     Response: { texts: {...}, video_url, images: [...] }

POST /api/marketing/publish
     Body: { property_id, platforms, schedule_for? }
     Response: { posts: [{platform, status, url}] }

GET  /api/marketing/posts/:property_id
     Response: { posts: [...] }

GET  /api/marketing/metrics/:post_id
     Response: { impressions, likes, ... }

POST /api/social/connect/:platform
     Response: { auth_url }  // Redirect para OAuth

GET  /api/social/callback/:platform
     // OAuth callback
```

---

## 🌍 Configuración por Mercado

### España
```javascript
{
  language: 'es-ES',
  currency: 'EUR',
  hashtags_locale: ['#inmobiliaria', '#pisos', '#casas'],
  measurement: 'm²',
  platforms_priority: ['instagram', 'facebook', 'tiktok'],
}
```

### Dubai / UAE
```javascript
{
  language: 'en-AE',
  currency: 'AED',
  hashtags_locale: ['#dubailife', '#dubaiproperty', '#uaerealestate'],
  measurement: 'sqft',  // Mostrar ambos: sqft y m²
  platforms_priority: ['instagram', 'tiktok', 'youtube'],
}
```

### Singapore
```javascript
{
  language: 'en-SG',
  currency: 'SGD',
  hashtags_locale: ['#singaporeproperty', '#sgcondo', '#sghomes'],
  measurement: 'sqft',
  platforms_priority: ['instagram', 'facebook', 'linkedin'],
}
```

### Hong Kong
```javascript
{
  language: 'en-HK',  // + zh-HK para posts bilingües
  currency: 'HKD',
  hashtags_locale: ['#hongkongproperty', '#hkrealestate'],
  measurement: 'sqft',
  platforms_priority: ['instagram', 'facebook', 'youtube'],
}
```

### Qatar / Doha
```javascript
{
  language: 'en-QA',  // + ar-QA opcional
  currency: 'QAR',
  hashtags_locale: ['#qatarliving', '#dohalife', '#qatarproperty'],
  measurement: 'sqft',
  platforms_priority: ['instagram', 'tiktok', 'youtube'],
}
```

---

*Siguiente: Código del generador de videos*
