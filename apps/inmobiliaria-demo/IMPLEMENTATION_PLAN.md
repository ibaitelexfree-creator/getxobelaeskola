# 🏗️ PLAN DE ABSORCIÓN: Inmobiliaria HTML → SaaS Modular (Dubai Demo)

> **De:** Proyecto HTML estático "Barn Properties Barcelona" + Schema SQL + Bot Telegram  
> **A:** App Next.js 15 premium en monorepo como tenant SaaS → "**LUXE DUBAI ESTATES**"  
> **Ejecutor:** Gemini Flash (modo fast)  
> **Workspace:** `apps/inmobiliaria-demo/` dentro de `getxobelaeskola`

---

## 📊 INVENTARIO DEL PROYECTO ORIGEN

### Lo que existe y es APROVECHABLE:

| Asset | Archivo | Valor | Acción |
|-------|---------|-------|--------|
| **Schema SQL completo** | `propertyai_schema.sql` (602 líneas) | ⭐⭐⭐⭐⭐ CRÍTICO | Adaptar a Supabase + tenant_id |
| **AI Prompts (7 prompts)** | `Telgram bot/ai_prompts.ts` (384 líneas) | ⭐⭐⭐⭐ ALTO | Copiar directo, adaptar a Dubai/inglés |
| **Bot Telegram completo** | `Telgram bot/telegram_bot.ts` (841 líneas) | ⭐⭐⭐⭐ ALTO | Integrar en monorepo como servicio |
| **Emma Knowledge Base** | `Barn/EMMA_KNOWLEDGE_BASE.md` | ⭐⭐⭐ MEDIO | Re-escribir para Dubai market |
| **40 imágenes WebP** | `Barn/images/Barn01-20.webp` | ⭐⭐ BAJO | NO usar, generar nuevas de Dubai |
| **index.html (3700+ líneas)** | `Barn/index.html` (298KB) | ⭐ REFERENCIA | Solo extraer lógica de filtros/modal |
| **Schema docs** | `propertyai_schema_docs.md` | ⭐⭐⭐ MEDIO | Usar como documentación |

### Lo que HAY que crear de cero:

- ✨ Diseño premium "Ultra-luxury Dubai" (dark gold aesthetic)
- 🏙️ 15-20 propiedades ficticias de Dubai (Palm Jumeirah, Downtown, Marina, etc.)
- 🤖 "Aisha" - Asistente AI rebautizada para Dubai
- 🗺️ Mapa interactivo de Dubai (en vez de Barcelona)
- 📊 Market Pulse con datos de Dubai
- 🌐 i18n: Inglés (primary) + Árabe (RTL) + Español

### Estado actual del destino (`apps/inmobiliaria-demo/`):

- ✅ Next.js 16.1.6 bootstrapped (vacío, solo template default)
- ✅ TypeScript configurado
- ✅ Tailwind v4 instalado (pero usaremos Vanilla CSS per GEMINI.md rules)
- ❌ Sin componentes, sin rutas, sin datos

---

## 🏗️ FASES DE IMPLEMENTACIÓN

---

## FASE 0: PREPARACIÓN DE INFRAESTRUCTURA
> **Objetivo:** Tener la base de datos, el tenant registrado, y la estructura de carpetas lista.
> **Tiempo estimado:** 30 min

### Tarea 0.1: Estructura de Carpetas

Crear la siguiente estructura en `apps/inmobiliaria-demo/`:

```
apps/inmobiliaria-demo/
├── public/
│   ├── images/
│   │   ├── properties/          # Imágenes de propiedades Dubai
│   │   ├── neighborhoods/       # Fotos de barrios Dubai
│   │   ├── hero/                # Hero banners
│   │   └── team/                # Fotos equipo (ficticias)
│   ├── icons/
│   └── fonts/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout con metadata SEO
│   │   ├── page.tsx             # Landing page principal
│   │   ├── globals.css          # Sistema de diseño completo
│   │   ├── properties/
│   │   │   ├── page.tsx         # Listado con filtros
│   │   │   └── [slug]/
│   │   │       └── page.tsx     # Detalle de propiedad
│   │   ├── neighborhoods/
│   │   │   └── page.tsx         # Guía de barrios Dubai
│   │   ├── about/
│   │   │   └── page.tsx         # Sobre la agencia
│   │   ├── contact/
│   │   │   └── page.tsx         # Formulario de contacto
│   │   └── api/
│   │       ├── properties/
│   │       │   └── route.ts     # GET propiedades (con filtros)
│   │       ├── leads/
│   │       │   └── route.ts     # POST capturar lead
│   │       └── chat/
│   │           └── route.ts     # POST chat con Aisha AI
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx       # Navegación fija
│   │   │   ├── Footer.tsx       # Footer premium
│   │   │   └── MobileNav.tsx    # Menú hamburguesa
│   │   ├── home/
│   │   │   ├── HeroSection.tsx  # Hero full-screen Dubai skyline
│   │   │   ├── FeaturedProperties.tsx  # 6 propiedades destacadas
│   │   │   ├── NeighborhoodGrid.tsx    # Grid de barrios
│   │   │   ├── StatsBar.tsx     # Cifras de la agencia
│   │   │   ├── TestimonialsCarousel.tsx # Testimonios
│   │   │   └── CTASection.tsx   # Call to action
│   │   ├── properties/
│   │   │   ├── PropertyCard.tsx          # Card de propiedad
│   │   │   ├── PropertyGrid.tsx          # Grid responsive
│   │   │   ├── PropertyFilters.tsx       # Filtros avanzados
│   │   │   ├── PropertyDetail.tsx        # Vista detalle completa
│   │   │   ├── PropertyGallery.tsx       # Galería de imágenes
│   │   │   ├── PropertyMap.tsx           # Mini mapa ubicación
│   │   │   ├── MortgageCalculator.tsx    # Calculadora hipoteca
│   │   │   └── PropertyContactForm.tsx   # Formulario interés
│   │   ├── chat/
│   │   │   ├── AishaChatWidget.tsx       # Widget flotante
│   │   │   ├── ChatBubble.tsx            # Burbuja de mensaje
│   │   │   └── QuickReplies.tsx          # Botones rápidos
│   │   ├── map/
│   │   │   ├── DubaiMap.tsx              # Mapa interactivo
│   │   │   └── PropertyMarker.tsx        # Marcador de propiedad
│   │   ├── market/
│   │   │   ├── MarketPulse.tsx           # Dashboard mercado
│   │   │   └── PriceChart.tsx            # Gráfico de precios
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Badge.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── Modal.tsx
│   │       ├── Skeleton.tsx
│   │       └── AnimatedCounter.tsx
│   ├── data/
│   │   ├── properties.ts        # Array de 15-20 propiedades Dubai
│   │   ├── neighborhoods.ts     # Datos de barrios Dubai
│   │   ├── market-data.ts       # Datos ficticios del mercado
│   │   ├── team.ts              # Equipo ficticio
│   │   └── testimonials.ts      # Testimonios ficticios
│   ├── lib/
│   │   ├── constants.ts         # Constantes globales
│   │   ├── utils.ts             # Utilidades (formatPrice, etc.)
│   │   └── types.ts             # TypeScript types
│   └── hooks/
│       ├── usePropertyFilters.ts
│       └── useIntersectionObserver.ts
├── package.json
├── next.config.ts
└── tsconfig.json
```

### Tarea 0.2: Migración del Schema SQL a Supabase

Adaptar `propertyai_schema.sql` añadiendo:

```sql
-- Añadir columna tenant_id a TODAS las tablas principales:
-- agencies → ya actúa como tenant (agency_id es el tenant)
-- Pero dentro de NUESTRO sistema, cada agency tiene un tenant_id padre

ALTER TABLE agencies ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- Adaptar para mercado Dubai:
-- currency: 'AED' en vez de 'EUR'  
-- country: 'UAE' en vez de 'España'
-- language: 'en' en vez de 'es'
-- timezone: 'Asia/Dubai' en vez de 'Europe/Madrid'
```

**Acción concreta:** Ejecutar SQL en Neon (project: `plain-firefly-45072071`) para:
1. Crear tablas del schema propertyai
2. Insertar agency demo "Luxe Dubai Estates"
3. Insertar 15 propiedades ficticias de Dubai

### Tarea 0.3: Datos Ficticios de Dubai

Crear el array de propiedades en `src/data/properties.ts`:

```typescript
export interface Property {
  id: string;
  referenceCode: string;
  title: string;
  slug: string;
  description: string;
  propertyType: 'apartment' | 'villa' | 'penthouse' | 'townhouse' | 'duplex' | 'mansion';
  operationType: 'sale' | 'rent';
  
  // Location
  neighborhood: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  
  // Pricing (AED)
  price: number;
  pricePerSqft: number;
  
  // Features
  bedrooms: number;
  bathrooms: number;
  sizeSqft: number;
  yearBuilt: number;
  
  // Amenities
  amenities: string[];
  
  // Media
  images: string[];
  coverImage: string;
  virtualTourUrl?: string;
  
  // Status
  status: 'available' | 'sold' | 'reserved';
  featured: boolean;
  
  // SEO
  metaTitle: string;
  metaDescription: string;
}
```

**15 Propiedades de Dubai:**

| # | Nombre | Tipo | Barrio | Precio (AED) | Sq.ft | Beds | Baths |
|---|--------|------|--------|--------------|-------|------|-------|
| 1 | The Pearl Residence | Penthouse | Palm Jumeirah | 45,000,000 | 8,500 | 5 | 7 |
| 2 | Marina Heights Studio | Studio | Dubai Marina | 1,200,000 | 520 | 0 | 1 |
| 3 | Downtown Panorama | Apartment | Downtown Dubai | 3,800,000 | 1,800 | 2 | 2 |
| 4 | Creek Harbour View | Apartment | Dubai Creek Harbour | 2,500,000 | 1,400 | 2 | 2 |
| 5 | Jumeirah Bay Villa | Villa | Jumeirah Bay | 120,000,000 | 25,000 | 7 | 9 |
| 6 | Business Bay Tower | Apartment | Business Bay | 1,800,000 | 950 | 1 | 1 |
| 7 | Emirates Hills Estate | Mansion | Emirates Hills | 85,000,000 | 18,000 | 8 | 10 |
| 8 | JBR Beachfront | Apartment | JBR | 4,200,000 | 2,200 | 3 | 3 |
| 9 | DIFC Loft | Duplex | DIFC | 5,500,000 | 2,800 | 2 | 3 |
| 10 | Arabian Ranches Villa | Villa | Arabian Ranches | 6,800,000 | 4,500 | 4 | 5 |
| 11 | Palm Garden Home | Townhouse | Palm Jumeirah | 15,000,000 | 5,200 | 4 | 5 |
| 12 | Bluewaters Penthouse | Penthouse | Bluewaters Island | 28,000,000 | 6,800 | 4 | 5 |
| 13 | Al Barari Retreat | Villa | Al Barari | 22,000,000 | 10,000 | 6 | 7 |
| 14 | City Walk Duplex | Duplex | City Walk | 7,200,000 | 3,200 | 3 | 4 |
| 15 | Dubai Hills Mansion | Mansion | Dubai Hills Estate | 35,000,000 | 12,000 | 6 | 8 |

---

## FASE 1: SISTEMA DE DISEÑO Y LAYOUT
> **Objetivo:** Crear un diseño premium ultra-luxury que impresione inmediatamente.
> **Tiempo estimado:** 2-3 horas

### Tarea 1.1: `globals.css` - Sistema de Diseño Completo

**Paleta de Colores — "Dubai Midnight Gold":**

```css
:root {
  /* Fondo principal */
  --bg-primary: #0a0a0f;         /* Negro profundo */
  --bg-secondary: #111118;       /* Gris oscuro */
  --bg-card: #16161f;            /* Card background */
  --bg-elevated: #1c1c28;        /* Elementos elevados */
  
  /* Acento dorado (NO púrpura, cumpliendo Purple Ban) */
  --gold-50: #fefce8;
  --gold-100: #fef9c3;
  --gold-200: #fef08a;
  --gold-300: #fde047;
  --gold-400: #facc15;
  --gold-500: #d4a843;           /* PRINCIPAL */
  --gold-600: #b8922e;
  --gold-700: #92740d;
  --gold-800: #785f09;
  --gold-900: #6b5507;
  
  /* Texto */
  --text-primary: #f5f5f5;
  --text-secondary: #a0a0b0;
  --text-muted: #6b6b7b;
  --text-gold: var(--gold-500);
  
  /* Estado */
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
  
  /* Bordes */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-gold: rgba(212, 168, 67, 0.3);
  
  /* Glass */
  --glass-bg: rgba(22, 22, 31, 0.8);
  --glass-border: rgba(255, 255, 255, 0.08);
  
  /* Sombras */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
  --shadow-gold: 0 4px 20px rgba(212, 168, 67, 0.15);
  
  /* Tipografía */
  --font-display: 'Playfair Display', serif;  /* Títulos elegantes */
  --font-body: 'Inter', sans-serif;           /* Cuerpo limpio */
  
  /* Spacing scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-24: 6rem;
  
  /* Border radius */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-xl: 28px;
  --radius-full: 9999px;
  
  /* Transitions */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  
  /* Z-index */
  --z-header: 100;
  --z-modal: 200;
  --z-chat: 150;
  --z-toast: 300;
}
```

**Tipografía Google Fonts:**
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

**Elementos base requeridos en CSS:**
- `.container` → max-width: 1400px, padding responsive
- `.section` → padding vertical: 6rem+
- `.glass-card` → glassmorphism con blur
- `.gold-gradient-text` → gradient text dorado
- `.btn-primary` → botón dorado con hover glow
- `.btn-secondary` → botón outline dorado
- `.property-card` → card con hover lift + image zoom
- `.animate-fade-up` → animación entrada desde abajo
- `.animate-fade-in` → fade in simple
- `.price-tag` → formato precio AED
- Responsive breakpoints: 480, 768, 1024, 1280

### Tarea 1.2: `layout.tsx` - Root Layout

```tsx
// Metadata SEO completa para Dubai market
export const metadata: Metadata = {
  title: 'Luxe Dubai Estates | Premium Real Estate in Dubai',
  description: 'Discover luxury properties in Dubai. Palm Jumeirah, Downtown, Marina, Emirates Hills. AI-powered property matching.',
  keywords: 'Dubai real estate, luxury properties, Palm Jumeirah, Downtown Dubai, villas, penthouses',
  // ... Open Graph, Twitter cards, etc.
};
```

**Componentes incluidos en layout:**
- `<Header />` → Navegación fija con logo + search + language
- `<Footer />` → Footer completo con links
- `<AishaChatWidget />` → Chat flotante bottom-right

### Tarea 1.3: `Header.tsx` - Navegación Premium

**Diseño:**
- Fixed top, fondo transparente → se vuelve oscuro al scroll
- Logo "LUXE" en Playfair Display con acento dorado
- Links: Home | Properties | Neighborhoods | About | Contact
- Botón "List Your Property" → gold CTA
- Language switcher: EN | AR | ES
- Hamburger menu en mobile
- Transición suave al hacer scroll

### Tarea 1.4: `Footer.tsx` - Footer Elegante

**Diseño 4 columnas:**
1. **Logo + tagline** + redes sociales (Instagram, LinkedIn, WhatsApp)
2. **Quick Links** → Properties, Neighborhoods, About, Contact
3. **Services** → Buying Guide, Selling, Investment, Golden Visa
4. **Contact** → Dubai Marina address, phone, email, hours

**Bottom bar:** Copyright + Privacy Policy + Terms + RERA License #

---

## FASE 2: LANDING PAGE (HOME)
> **Objetivo:** Crear una landing page que diga "WOW" en 3 segundos.
> **Tiempo estimado:** 3-4 horas

### Tarea 2.1: `HeroSection.tsx`

**Diseño:**
- Full-viewport height (100vh)
- Imagen de fondo: Dubai skyline at twilight (Burj Khalifa + Downtown)
- Overlay gradient oscuro (de abajo hacia arriba)
- Texto centrado animado:
  - Subtítulo: "DUBAI'S PREMIER LUXURY AGENCY" (tracking-wider, gold, small)
  - Título: "Where Dreams\nMeet Skylines" (Playfair Display, 5rem, blanco)
  - CTA: "Explore Properties" → gold button
  - Stat bar debajo: "500+ Properties | AED 12B+ Portfolio | 98% Client Satisfaction"
- Scroll indicator animado bottom-center (chevron-down bounce)

**Nota:** Usar `generate_image` para crear el hero background.

### Tarea 2.2: `FeaturedProperties.tsx`

**Diseño:**
- Section title: "FEATURED COLLECTION" (gold) + "Handpicked Luxury" (white, Playfair)
- Grid 3 columnas (1 en mobile) con las 6 propiedades `featured: true`
- Cada PropertyCard muestra:
  - Imagen con hover zoom (transform: scale 1.05)
  - Badge superior: "NEW" o "EXCLUSIVE" o "FEATURED"
  - Tipo de propiedad (Penthouse, Villa, etc.)
  - Nombre
  - Ubicación con pin icon
  - Precio en AED (formateado: AED 45,000,000)
  - Row de specs: 🛏 5 | 🚿 7 | 📐 8,500 sq.ft
  - Botón "View Details" → subtle, gold underline

### Tarea 2.3: `NeighborhoodGrid.tsx`

**Diseño:**
- Section title: "EXPLORE" + "Dubai's Finest Districts"
- Grid asimétrico (2 grandes + 3 pequeñas, como layout magazine)
- Cada card:
  - Imagen de fondo del barrio
  - Gradient overlay
  - Nombre del barrio
  - Tagline (ej: "The Crown Jewel" para Palm Jumeirah)
  - "X Properties Available" badge
  - Click → navega a `/properties?neighborhood=palm-jumeirah`

**Barrios de Dubai (10):**

| Barrio | Tagline | Avg AED/sqft |
|--------|---------|--------------|
| Palm Jumeirah | The Crown Jewel | 3,500 |
| Downtown Dubai | The Heart of the City | 2,800 |
| Dubai Marina | Where Lifestyle Meets Waterfront | 2,200 |
| Emirates Hills | The Beverly Hills of Dubai | 4,500 |
| Jumeirah Bay | Ultra-Exclusive Island Living | 5,000 |
| JBR | Beachfront Boulevard | 2,400 |
| DIFC | Power & Prestige | 3,200 |
| Business Bay | Rising Skyline | 1,800 |
| Dubai Hills Estate | Contemporary Family Living | 1,600 |
| Al Barari | Nature's Sanctuary | 2,000 |

### Tarea 2.4: `StatsBar.tsx`

**Diseño:**
- Fondo glass, bordes dorados sutiles
- 4 estadísticas con animated counters:
  - 500+ Properties Listed
  - AED 12B+ Portfolio Value
  - 15+ Years Experience
  - 98% Client Satisfaction
- Cada número hace animación countUp al entrar en viewport

### Tarea 2.5: `TestimonialsCarousel.tsx`

**Diseño:**
- Auto-sliding carousel (3 testimonios visibles en desktop, 1 en mobile)
- Cada testimonio:
  - Quote icon dorado (")
  - Texto del testimonio
  - Nombre + título (ej: "Sarah Mitchell, CEO of Mitchell Corp")
  - Estrellas ★★★★★
  - Propiedad comprada (ej: "Purchased Palm Jumeirah Penthouse")

**5 testimonios ficticios de compradores de diferentes nacionalidades.**

### Tarea 2.6: `CTASection.tsx`

**Diseño:**
- Banner full-width con gradiente gold sutil
- "Ready to Find Your\nDream Home in Dubai?"
- Dos botones: "Browse Properties" + "Talk to Aisha (AI)"
- Imagen lateral de Dubai lifestyle

---

## FASE 3: PROPIEDADES (LISTADO + DETALLE)
> **Objetivo:** Sistema completo de búsqueda y visualización de propiedades.
> **Tiempo estimado:** 4-5 horas

### Tarea 3.1: `src/data/properties.ts`

**Crear array completo** con las 15 propiedades de Dubai con TODOS los campos:
- Descripciones en inglés, profesionales (estilo del `DESCRIPTION_PROMPT` de ai_prompts.ts)
- Amenities realistas para cada propiedad
- Coordenadas reales de Dubai para cada ubicación
- Slugs SEO-friendly

### Tarea 3.2: `/properties/page.tsx` - Listado con Filtros

**Layout:**
- Hero mini: "Our Collection" + count total
- Sidebar izquierda (filters) + Grid derecha (resultados)
- En mobile: filtros como bottom sheet / modal

**PropertyFilters.tsx:**
- **Tipo:** All | Apartment | Villa | Penthouse | Townhouse | Duplex | Mansion
- **Operación:** Buy | Rent
- **Barrio:** Dropdown con todos los barrios
- **Precio:** Range slider (AED 1M → 100M+)
- **Dormitorios:** All | Studio | 1+ | 2+ | 3+ | 4+ | 5+
- **Superficie:** Range slider (sq.ft)
- **Amenities:** Checkboxes (pool, gym, beach access, etc.)
- **Ordenar:** Price ↑↓, Size ↑↓, Newest, Featured
- Botón "Clear All" + contador de resultados

**PropertyGrid.tsx:**
- Grid responsive: 3 cols (desktop) → 2 cols (tablet) → 1 col (mobile)
- Animación stagger-in al cargar
- "No results" state elegante si no hay matches

### Tarea 3.3: `/properties/[slug]/page.tsx` - Detalle

**Secciones del detalle:**

1. **Gallery Hero** → Galería de imágenes con lightbox
   - Imagen principal grande + 4 thumbnails
   - Click abre galería fullscreen con arrows
   
2. **Sticky Price Bar** → Barra fija con precio + botones CTA
   - Precio grande "AED 45,000,000"
   - "Schedule Viewing" + "Ask Aisha" buttons
   
3. **Key Specs** → Grid con iconos
   - Beds | Baths | Sq.ft | Type | Year | Location
   
4. **Description** → Texto largo con "Read More" expandible

5. **Amenities** → Grid de iconos con labels
   - Private Pool, Gym, Concierge, Beach Access, etc.
   
6. **Floor Plan** → Plano (placeholder image)

7. **Location Map** → Mini mapa con pin de la ubicación

8. **Mortgage Calculator** → Formulario interactivo
   - Property price (pre-filled)
   - Down payment % slider (20-50%)
   - Interest rate (3-6%)
   - Term (10-30 years)
   - Monthly payment resultado en tiempo real
   
9. **Similar Properties** → 3 propiedades similares

10. **Agent Card** → Foto del agente + contacto + botón WhatsApp

### Tarea 3.4: SEO por Propiedad

Cada `[slug]/page.tsx` debe generar:

```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const property = getPropertyBySlug(params.slug);
  return {
    title: `${property.title} | AED ${formatPrice(property.price)} | Luxe Dubai Estates`,
    description: property.metaDescription,
    openGraph: {
      images: [property.coverImage],
      // ...
    },
  };
}
```

---

## FASE 4: AISHA AI CHAT WIDGET
> **Objetivo:** Chat widget flotante con asistente IA contextual.
> **Tiempo estimado:** 2-3 horas

### Tarea 4.1: `AishaChatWidget.tsx`

**Diseño:**
- Botón flotante bottom-right: avatar circular + badge "Online"
- Click abre panel de chat (slide up animation)
- Panel: 400px ancho, 500px alto
- Header: Foto Aisha + nombre + "Your AI Property Advisor" + close btn
- Cuerpo: scroll de mensajes
- Footer: input + send button

**Funcionalidad (modo DEMO, sin API real):**
- Mensaje de bienvenida: "Hello! I'm Aisha, your AI property advisor. How can I help you find your perfect home in Dubai?"
- Quick replies: "Show luxury villas" | "My budget" | "Schedule viewing"  
- Respuestas pre-scripted por keyword detection (adaptar lógica del HTML original)
- Typing indicator (3 dots animation)
- Timestamps en cada mensaje
- Property cards inline cuando menciona propiedades

**Keywords y respuestas:**

| Keyword | Respuesta Aisha |
|---------|----------------|
| budget, price | "What's your budget range? We have properties from AED 1.2M to AED 120M..." |
| villa | "We have stunning villas in Emirates Hills, Al Barari, and Palm Jumeirah. Which area interests you?" |
| penthouse | "Our penthouse collection includes The Pearl at Palm Jumeirah (AED 45M) and Bluewaters Island (AED 28M)..." |
| palm | "Palm Jumeirah is Dubai's crown jewel! We have [X] properties there..." |
| visit, viewing | "I'd love to arrange a viewing! Please share your email and preferred date." |
| downtown | "Downtown Dubai offers the most iconic living experience, with Burj Khalifa views..." |
| mortgage | "I can help with mortgage calculations! Most banks offer up to 75% LTV for residents..." |
| golden visa | "Properties above AED 2M qualify for UAE Golden Visa (10-year residency)!" |

### Tarea 4.2: `api/chat/route.ts`

API route que en DEMO devuelve respuestas basadas en keywords:

```typescript
export async function POST(request: Request) {
  const { message, propertyId } = await request.json();
  
  // Demo mode: keyword matching
  const response = getAishaResponse(message, propertyId);
  
  // Simulate slight delay for realism
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return Response.json({
    message: response.text,
    suggestedProperties: response.properties || [],
    quickReplies: response.quickReplies || [],
  });
}
```

---

## FASE 5: SECCIONES COMPLEMENTARIAS
> **Objetivo:** Completar todas las páginas para una demo completa.
> **Tiempo estimado:** 2-3 horas

### Tarea 5.1: `/neighborhoods/page.tsx`

- Hero: "Dubai Districts" 
- 10 neighborhood cards con:
  - Gran imagen de fondo
  - Nombre + tagline
  - Stats: Avg price/sqft, Properties available
  - Description (2-3 frases)
  - Key features (ej: "Beach Access", "Family-Friendly", "Nightlife")
  - Link a propiedades filtradas

### Tarea 5.2: `/about/page.tsx`

- Hero: equipo ficticio
- Historia de la agencia (ficticia, foundada 2009 en Dubai)
- Meet the Team (4-5 agentes ficticios con fotos generadas)
- Awards & Recognition (ficticios)
- Partner logos (ficticios, sutiles)

### Tarea 5.3: `/contact/page.tsx`

- Formulario: Name, Email, Phone, Subject, Message
- Mapa de Dubai con pin en Marina
- Datos de contacto
- Horarios de oficina
- Botones: WhatsApp, Telegram, Email
- Note: Form submits to API route que no envía realmente

### Tarea 5.4: `MarketPulse.tsx` (section en home o página independiente)

- Line chart: Dubai Property Price Index (5 años)
- Bar chart: Average AED/sqft by neighborhood
- Stats cards: Year-over-year growth, transaction volume
- Source attribution: "Based on DLD data, Q4 2025"

---

## FASE 6: IMÁGENES Y ASSETS
> **Objetivo:** Generar todas las imágenes necesarias para la demo.
> **Tiempo estimado:** 1-2 horas

### Tarea 6.1: Generar con `generate_image`

**Imágenes necesarias (mínimo):**

| Imagen | Prompt summary | Uso |
|--------|---------------|-----|
| hero_dubai_skyline | Dubai skyline twilight, Burj Khalifa, luxury, cinematic | Hero landing |
| palm_jumeirah_aerial | Palm Jumeirah aerial view, luxury, golden hour | Neighborhood |
| downtown_dubai | Downtown Dubai, Burj Khalifa base, fountains, night | Neighborhood |
| dubai_marina | Dubai Marina yachts, towers, waterfront, sunset | Neighborhood |
| luxury_penthouse_interior | Ultra luxury penthouse interior, Dubai views, gold accents | Property |
| luxury_villa_pool | Modern villa with infinity pool, Dubai skyline | Property |
| luxury_apartment_living | Premium apartment living room, floor-to-ceiling windows | Property |
| luxury_bedroom | Master bedroom, luxury linens, city views | Property |
| luxury_bathroom | Marble bathroom, gold fixtures, spa-like | Property |
| dubai_lifestyle | Luxury lifestyle Dubai, restaurant, views | About/CTA |

### Tarea 6.2: OG Images

- Default OG: "Luxe Dubai Estates" branded 1200x630
- Per-property: Auto-generated si posible, o template con foto

---

## FASE 7: INTEGRACIÓN CON MONOREPO
> **Objetivo:** Conectar con el sistema SaaS existente.
> **Tiempo estimado:** 1-2 horas

### Tarea 7.1: package.json updates

```json
{
  "dependencies": {
    "@repo/ui": "workspace:*",      // Si existe
    "@repo/lib": "workspace:*",     // Si existe
    "@repo/types": "workspace:*"    // Si existe
  }
}
```

### Tarea 7.2: Tenant config

Conectar con Supabase usando variables de entorno del monorepo:

```env
# .env.local de inmobiliaria-demo
NEXT_PUBLIC_TENANT_ID=<uuid del tenant registrado>
NEXT_PUBLIC_TENANT_SLUG=inmobiliaria-demo
NEXT_PUBLIC_SUPABASE_URL=<del .env padre>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<del .env padre>
```

### Tarea 7.3: Mission Control visibility

Registrar la app en Mission Control para que aparezca como un tenant activo en el dashboard.

---

## FASE 8: POLISH & QA
> **Objetivo:** Pulir detalles y asegurar calidad.
> **Tiempo estimado:** 1-2 horas

### Tarea 8.1: Responsive testing

- Mobile (375px): Todo funcional, sin overflow
- Tablet (768px): Grids 2 columnas
- Desktop (1280px): Layout completo
- Large (1440px+): Contenido centrado, sin estiramiento

### Tarea 8.2: Animaciones

- Scroll reveal: Sections aparecen con fade-up al entrar en viewport
- Hover effects: Todos los cards y botones
- Page transitions: Smooth navigation
- Loading states: Skeletons en propiedades
- Counter animation: Stats se animan al ser visibles

### Tarea 8.3: Performance

- Next.js Image optimization (next/image con sizes)
- Font preloading
- CSS minification
- Dynamic imports para componentes pesados (mapa, chart)

### Tarea 8.4: Verificación Final

```bash
cd apps/inmobiliaria-demo
npm run build          # Debe compilar sin errores
npm run lint           # Sin warnings
npm run dev            # Demo funcional completa
```

---

## 📋 RESUMEN EJECUTIVO PARA GEMINI FLASH

| Fase | Tareas | Prioridad | Enfoque |
|------|--------|-----------|---------|
| **0** | Estructura + DB + Datos | P0 | Crear carpetas, datos ficticios |
| **1** | CSS + Layout + Header/Footer | P0 | Sistema de diseño "Dubai Gold" |
| **2** | Landing Page (6 secciones) | P0 | WOW factor, hero impactante |
| **3** | Properties List + Detail | P0 | Core funcionalidad, filtros |
| **4** | Aisha Chat Widget | P1 | Demo mode, keyword responses |
| **5** | Neighborhoods + About + Contact | P1 | Completar navegación |
| **6** | Imágenes generadas | P1 | generate_image para assets |
| **7** | Integración monorepo | P2 | Conectar con SaaS |
| **8** | Polish & QA | P2 | Responsive, animaciones |

**Total estimado:** 15-22 horas de trabajo de implementación.

**Reglas críticas para el implementador:**
1. ❌ NO usar Tailwind → Vanilla CSS con variables
2. ❌ NO purple/violet en paleta → Gold + Black + White
3. ❌ NO placeholders de imágenes → Usar `generate_image`
4. ✅ TypeScript estricto en todos los archivos
5. ✅ Semantic HTML + unique IDs en interactivos
6. ✅ Responsive-first (mobile → desktop)
7. ✅ Animaciones suaves (no exageradas)
8. ✅ SEO metadata en cada página

---

> **Estado:** 📝 Plan creado — Listo para implementación  
> **Siguiente paso:** Ejecutar Fase 0 + Fase 1 (Foundation + Design System)
