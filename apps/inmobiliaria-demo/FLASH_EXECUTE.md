# 🚀 FLASH_EXECUTE.md — Luxe Dubai Estates Demo
> **Para:** Gemini Flash (modo fast / implementación autónoma)  
> **Workspace:** `c:\Users\User\Desktop\getxobelaeskola`  
> **App target:** `apps/inmobiliaria-demo/` (Next.js 16, TypeScript, ya bootstrapped)  
> **Lee también:** `IMPLEMENTATION_PLAN.md` en este mismo directorio para el plan completo

---

## ⚡ CONTEXTO RÁPIDO

Estás convirtiendo un proyecto de inmobiliaria HTML estático en una app Next.js 15+ premium dentro de un monorepo SaaS. El proyecto se llama **"Luxe Dubai Estates"** — inmobiliaria ficticia de lujo en Dubai para presentar como demo a clientes.

**Assets de referencia en:** `C:\Users\User\Desktop\inmobiliaria\`
- `Barn/index.html` → extraer lógica de filtros JS
- `Barn/EMMA_KNOWLEDGE_BASE.md` → adaptar para Dubai (renombrar Emma → Aisha)
- `Telgram bot/ai_prompts.ts` → copiar prompts, adaptar a inglés/Dubai
- `propertyai_schema.sql` → referencia del schema de DB

---

## 🚫 REGLAS ABSOLUTAS (no negociables)

1. **NO Tailwind** → Vanilla CSS puro con CSS custom properties
2. **NO color purple/violet** en ningún componente
3. **NO placeholders de imagen** → usa `generate_image` tool
4. **SÍ TypeScript** estricto en todos los archivos
5. **SÍ Semantic HTML** → `<header>`, `<main>`, `<section>`, `<nav>`, `<article>`
6. **SÍ IDs únicos** en todos los elementos interactivos
7. **La app DEBE correr** con `npm run dev` desde `apps/inmobiliaria-demo/`

---

## 🎨 SISTEMA DE DISEÑO — "Dubai Midnight Gold"

Copia exactamente estas CSS variables como base de `globals.css`:

```css
/* ELIMINA el @import "tailwindcss" que hay actualmente */
/* REEMPLAZA TODO el globals.css con esto: */

@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #111118;
  --bg-card: #16161f;
  --bg-elevated: #1c1c28;
  --gold-300: #fde047;
  --gold-400: #facc15;
  --gold-500: #d4a843;
  --gold-600: #b8922e;
  --text-primary: #f5f5f5;
  --text-secondary: #a0a0b0;
  --text-muted: #6b6b7b;
  --border-subtle: rgba(255,255,255,0.06);
  --border-gold: rgba(212,168,67,0.3);
  --glass-bg: rgba(22,22,31,0.85);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.4);
  --shadow-gold: 0 4px 20px rgba(212,168,67,0.2);
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-full: 9999px;
  --ease-out: cubic-bezier(0.16,1,0.3,1);
  --duration: 300ms;
}

html { scroll-behavior: smooth; }
body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

.container { width: 100%; max-width: 1400px; margin: 0 auto; padding: 0 2rem; }
@media (max-width: 768px) { .container { padding: 0 1rem; } }

.section { padding: 6rem 0; }
@media (max-width: 768px) { .section { padding: 4rem 0; } }

/* Gold gradient text */
.gold-text {
  background: linear-gradient(135deg, var(--gold-400), var(--gold-600));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Buttons */
.btn-primary {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 0.875rem 2rem; border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--gold-400), var(--gold-600));
  color: #0a0a0f; font-weight: 600; font-size: 0.9rem; letter-spacing: 0.05em;
  text-transform: uppercase; text-decoration: none; border: none; cursor: pointer;
  transition: all var(--duration) var(--ease-out);
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: var(--shadow-gold); }

.btn-secondary {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 0.875rem 2rem; border-radius: var(--radius-full);
  background: transparent; color: var(--gold-400);
  border: 1px solid var(--border-gold); font-weight: 500;
  text-decoration: none; cursor: pointer;
  transition: all var(--duration) var(--ease-out);
}
.btn-secondary:hover { background: rgba(212,168,67,0.1); border-color: var(--gold-400); }

/* Glass card */
.glass-card {
  background: var(--glass-bg); border: 1px solid var(--glass-border, var(--border-subtle));
  border-radius: var(--radius-lg); backdrop-filter: blur(12px);
}

/* Section headers */
.section-label {
  font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--gold-500); font-weight: 600; margin-bottom: 0.75rem;
}
.section-title {
  font-family: var(--font-display); font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 600; line-height: 1.2; color: var(--text-primary);
}

/* Property card */
.property-card {
  background: var(--bg-card); border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg); overflow: hidden;
  transition: transform var(--duration) var(--ease-out), box-shadow var(--duration) var(--ease-out);
  cursor: pointer;
}
.property-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-md), var(--shadow-gold); }
.property-card .card-image { position: relative; height: 260px; overflow: hidden; }
.property-card .card-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 500ms var(--ease-out); }
.property-card:hover .card-image img { transform: scale(1.06); }
.property-card .card-body { padding: 1.5rem; }

/* Grid utilities */
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; }
@media (max-width: 1024px) { .grid-3 { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .grid-3, .grid-2 { grid-template-columns: 1fr; } }

/* Animations */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

.animate-fade-up { animation: fadeUp 0.6s var(--ease-out) both; }
.animate-fade-in { animation: fadeIn 0.4s ease both; }

/* Price formatting */
.price-tag { font-family: var(--font-display); font-size: 1.5rem; color: var(--gold-400); font-weight: 600; }
.price-tag-sm { font-size: 1rem; color: var(--gold-400); font-weight: 600; }

/* Badge */
.badge {
  display: inline-block; padding: 0.25rem 0.75rem; border-radius: var(--radius-full);
  font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
}
.badge-gold { background: rgba(212,168,67,0.15); color: var(--gold-400); border: 1px solid var(--border-gold); }
.badge-green { background: rgba(34,197,94,0.15); color: #22c55e; }

/* Specs row */
.specs-row { display: flex; align-items: center; gap: 1.25rem; color: var(--text-secondary); font-size: 0.875rem; }
.spec-item { display: flex; align-items: center; gap: 0.375rem; }

/* Form inputs */
.input-field {
  width: 100%; padding: 0.875rem 1.25rem; background: var(--bg-elevated);
  border: 1px solid var(--border-subtle); border-radius: var(--radius-md);
  color: var(--text-primary); font-size: 1rem; font-family: var(--font-body);
  transition: border-color var(--duration);
  outline: none;
}
.input-field:focus { border-color: var(--gold-500); }
.input-field::placeholder { color: var(--text-muted); }

/* Divider */
.divider { width: 60px; height: 2px; background: linear-gradient(90deg, var(--gold-500), transparent); margin: 1.5rem 0; }

/* Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg-secondary); }
::-webkit-scrollbar-thumb { background: var(--border-gold); border-radius: 3px; }
```

---

## 📦 DATOS FICTICIOS COMPLETOS

### `src/data/properties.ts` — 15 Propiedades de Dubai

```typescript
export interface Property {
  id: string;
  referenceCode: string;
  title: string;
  slug: string;
  description: string;
  propertyType: 'apartment' | 'villa' | 'penthouse' | 'townhouse' | 'duplex' | 'mansion';
  operationType: 'sale' | 'rent';
  neighborhood: string;
  address: string;
  latitude: number;
  longitude: number;
  price: number;          // AED
  pricePerSqft: number;   // AED
  bedrooms: number;
  bathrooms: number;
  sizeSqft: number;
  yearBuilt: number;
  amenities: string[];
  images: string[];       // rutas en /public/images/properties/
  coverImage: string;
  status: 'available' | 'sold' | 'reserved';
  featured: boolean;
  metaTitle: string;
  metaDescription: string;
}

export const PROPERTIES: Property[] = [
  {
    id: '1', referenceCode: 'LDE-001', title: 'The Pearl Residence',
    slug: 'the-pearl-residence-palm-jumeirah',
    description: 'The most prestigious address on Palm Jumeirah. This extraordinary penthouse commands sweeping views across the Arabian Gulf from every room. Five bedrooms, a private rooftop terrace with infinity pool, and a dedicated concierge floor define this once-in-a-generation offering.',
    propertyType: 'penthouse', operationType: 'sale',
    neighborhood: 'Palm Jumeirah', address: 'Palm Jumeirah, The Palm Tower',
    latitude: 25.1124, longitude: 55.1390,
    price: 45000000, pricePerSqft: 5294,
    bedrooms: 5, bathrooms: 7, sizeSqft: 8500, yearBuilt: 2019,
    amenities: ['Private Pool', 'Concierge', 'Private Elevator', 'Smart Home', 'Wine Cellar', 'Cinema Room', 'Gym', 'Beach Access', '4 Parking Spaces'],
    images: ['/images/properties/prop1-1.jpg', '/images/properties/prop1-2.jpg', '/images/properties/prop1-3.jpg'],
    coverImage: '/images/properties/prop1-1.jpg',
    status: 'available', featured: true,
    metaTitle: 'The Pearl Residence — AED 45M Penthouse | Palm Jumeirah | Luxe Dubai Estates',
    metaDescription: 'Ultra-luxury 5-bedroom penthouse on Palm Jumeirah with private pool and Gulf views. AED 45,000,000.'
  },
  {
    id: '2', referenceCode: 'LDE-002', title: 'Marina Heights Studio',
    slug: 'marina-heights-studio-dubai-marina',
    description: 'A sleek, fully furnished studio in the heart of Dubai Marina. Perfect for young professionals or as an investment property with strong rental yields. Walk to the Marina Walk, restaurants, and the beach in minutes.',
    propertyType: 'apartment', operationType: 'sale',
    neighborhood: 'Dubai Marina', address: 'Dubai Marina, Marina Heights Tower',
    latitude: 25.0780, longitude: 55.1384,
    price: 1200000, pricePerSqft: 2308,
    bedrooms: 0, bathrooms: 1, sizeSqft: 520, yearBuilt: 2018,
    amenities: ['Gym', 'Pool', 'Concierge', '1 Parking Space', 'Balcony', 'Fully Furnished'],
    images: ['/images/properties/prop2-1.jpg', '/images/properties/prop2-2.jpg'],
    coverImage: '/images/properties/prop2-1.jpg',
    status: 'available', featured: false,
    metaTitle: 'Marina Heights Studio — AED 1.2M | Dubai Marina',
    metaDescription: 'Furnished studio apartment in Dubai Marina with marina views. AED 1,200,000.'
  },
  {
    id: '3', referenceCode: 'LDE-003', title: 'Downtown Panorama',
    slug: 'downtown-panorama-downtown-dubai',
    description: 'Wake up to direct Burj Khalifa views every morning. This elegant 2-bedroom apartment in the heart of Downtown Dubai delivers the full spectacle of the city. Floor-to-ceiling glass, designer interiors, and the Dubai Fountain at your feet.',
    propertyType: 'apartment', operationType: 'sale',
    neighborhood: 'Downtown Dubai', address: 'Downtown Dubai, Act One | Act Two',
    latitude: 25.1972, longitude: 55.2744,
    price: 3800000, pricePerSqft: 2111,
    bedrooms: 2, bathrooms: 2, sizeSqft: 1800, yearBuilt: 2020,
    amenities: ['Burj Khalifa View', 'Fountain View', 'Pool', 'Gym', 'Concierge', '1 Parking'],
    images: ['/images/properties/prop3-1.jpg', '/images/properties/prop3-2.jpg'],
    coverImage: '/images/properties/prop3-1.jpg',
    status: 'available', featured: true,
    metaTitle: 'Downtown Panorama — AED 3.8M | Burj Khalifa Views | Downtown Dubai',
    metaDescription: '2-bedroom apartment with direct Burj Khalifa views in Downtown Dubai. AED 3,800,000.'
  },
  {
    id: '4', referenceCode: 'LDE-004', title: 'Creek Harbour Gem',
    slug: 'creek-harbour-gem-dubai-creek',
    description: 'Dubai Creek Harbour is the city\'s most exciting new destination. This spacious 2-bedroom apartment offers panoramic creek and city views, moments from the future world\'s tallest tower. A generational investment opportunity.',
    propertyType: 'apartment', operationType: 'sale',
    neighborhood: 'Dubai Creek Harbour', address: 'Dubai Creek Harbour, Creek Gate',
    latitude: 25.2088, longitude: 55.3319,
    price: 2500000, pricePerSqft: 1786,
    bedrooms: 2, bathrooms: 2, sizeSqft: 1400, yearBuilt: 2022,
    amenities: ['Creek View', 'Pool', 'Gym', 'Kids Play Area', '1 Parking', 'Smart Home'],
    images: ['/images/properties/prop4-1.jpg'],
    coverImage: '/images/properties/prop4-1.jpg',
    status: 'available', featured: false,
    metaTitle: 'Creek Harbour Gem — AED 2.5M | Dubai Creek Harbour',
    metaDescription: '2-bedroom with creek views in Dubai Creek Harbour. AED 2,500,000.'
  },
  {
    id: '5', referenceCode: 'LDE-005', title: 'Jumeirah Bay Masterpiece',
    slug: 'jumeirah-bay-masterpiece-villa',
    description: 'One of only a handful of villas on exclusive Jumeirah Bay Island. This 7-bedroom masterpiece spans 25,000 sq.ft across four floors, with a private jetty, infinity pool, and staff quarters. An unparalleled statement of wealth and taste.',
    propertyType: 'villa', operationType: 'sale',
    neighborhood: 'Jumeirah Bay', address: 'Jumeirah Bay Island, Dubai',
    latitude: 25.2090, longitude: 55.2570,
    price: 120000000, pricePerSqft: 4800,
    bedrooms: 7, bathrooms: 9, sizeSqft: 25000, yearBuilt: 2021,
    amenities: ['Private Jetty', 'Infinity Pool', 'Staff Quarters', 'Private Beach', '6 Parking', 'Cinema', 'Wine Cellar', 'Spa', 'Gym'],
    images: ['/images/properties/prop5-1.jpg', '/images/properties/prop5-2.jpg'],
    coverImage: '/images/properties/prop5-1.jpg',
    status: 'available', featured: true,
    metaTitle: 'Jumeirah Bay Masterpiece — AED 120M Ultra-Luxury Villa',
    metaDescription: '7-bedroom villa on private Jumeirah Bay Island with private jetty. AED 120,000,000.'
  },
  {
    id: '6', referenceCode: 'LDE-006', title: 'Business Bay Executive',
    slug: 'business-bay-executive-apartment',
    description: 'A sharp, contemporary 1-bedroom apartment for the modern executive. Located in the dynamic Business Bay, offering spectacular canal and skyline views. High rental yield potential in one of Dubai\'s fastest-growing districts.',
    propertyType: 'apartment', operationType: 'sale',
    neighborhood: 'Business Bay', address: 'Business Bay, Vogue Tower',
    latitude: 25.1857, longitude: 55.2631,
    price: 1800000, pricePerSqft: 1895,
    bedrooms: 1, bathrooms: 1, sizeSqft: 950, yearBuilt: 2019,
    amenities: ['Canal View', 'Pool', 'Gym', 'Concierge', '1 Parking'],
    images: ['/images/properties/prop6-1.jpg'],
    coverImage: '/images/properties/prop6-1.jpg',
    status: 'available', featured: false,
    metaTitle: 'Business Bay Executive — AED 1.8M | Canal Views',
    metaDescription: '1-bedroom apartment with canal views in Business Bay. AED 1,800,000.'
  },
  {
    id: '7', referenceCode: 'LDE-007', title: 'Emirates Hills Royal Estate',
    slug: 'emirates-hills-royal-estate',
    description: 'Welcome to the Beverly Hills of Dubai. This grand 8-bedroom estate in the ultra-exclusive Emirates Hills community sits on a prime Golf Course plot. Palatial interiors, a 25-meter pool, and total privacy define this rare offering.',
    propertyType: 'mansion', operationType: 'sale',
    neighborhood: 'Emirates Hills', address: 'Emirates Hills, Sector V',
    latitude: 25.0714, longitude: 55.1700,
    price: 85000000, pricePerSqft: 4722,
    bedrooms: 8, bathrooms: 10, sizeSqft: 18000, yearBuilt: 2017,
    amenities: ['Golf Course View', '25m Pool', 'Garage (4)', 'Gym', 'Cinema', 'Staff Quarters', 'Tennis Court', 'Wine Cellar'],
    images: ['/images/properties/prop7-1.jpg', '/images/properties/prop7-2.jpg'],
    coverImage: '/images/properties/prop7-1.jpg',
    status: 'available', featured: true,
    metaTitle: 'Emirates Hills Royal Estate — AED 85M | Golf Course Mansion',
    metaDescription: '8-bedroom mansion on Golf Course in Emirates Hills. AED 85,000,000.'
  },
  {
    id: '8', referenceCode: 'LDE-008', title: 'JBR Beachfront Luxury',
    slug: 'jbr-beachfront-luxury-apartment',
    description: 'Steps from the JBR beach, this 3-bedroom apartment offers the ultimate urban beach lifestyle. A generous terrace with sea views, premium finishes, and the iconic Walk right outside your door. Golden Visa eligible.',
    propertyType: 'apartment', operationType: 'sale',
    neighborhood: 'JBR', address: 'Jumeirah Beach Residence, Sadaf',
    latitude: 25.0755, longitude: 55.1319,
    price: 4200000, pricePerSqft: 1909,
    bedrooms: 3, bathrooms: 3, sizeSqft: 2200, yearBuilt: 2015,
    amenities: ['Sea View', 'Beach Access', 'Pool', 'Gym', 'Concierge', '2 Parking', 'Terrace'],
    images: ['/images/properties/prop8-1.jpg'],
    coverImage: '/images/properties/prop8-1.jpg',
    status: 'available', featured: true,
    metaTitle: 'JBR Beachfront Luxury — AED 4.2M | Sea Views & Beach Access',
    metaDescription: '3-bedroom with direct sea views and beach access at JBR. AED 4,200,000.'
  },
  {
    id: '9', referenceCode: 'LDE-009', title: 'DIFC Signature Loft',
    slug: 'difc-signature-loft-duplex',
    description: 'Power meets design in the heart of Dubai\'s financial district. This stunning duplex loft features double-height ceilings, an art collector\'s gallery wall, and a private roof terrace. Perfect for DIFC professionals who demand the extraordinary.',
    propertyType: 'duplex', operationType: 'sale',
    neighborhood: 'DIFC', address: 'DIFC, Index Tower',
    latitude: 25.2122, longitude: 55.2835,
    price: 5500000, pricePerSqft: 1964,
    bedrooms: 2, bathrooms: 3, sizeSqft: 2800, yearBuilt: 2018,
    amenities: ['Roof Terrace', 'Double-Height Ceilings', 'Concierge', 'Gym', 'Pool', '2 Parking'],
    images: ['/images/properties/prop9-1.jpg'],
    coverImage: '/images/properties/prop9-1.jpg',
    status: 'available', featured: false,
    metaTitle: 'DIFC Signature Loft — AED 5.5M | Duplex with Roof Terrace',
    metaDescription: 'Duplex loft in DIFC with private roof terrace and double-height ceilings. AED 5,500,000.'
  },
  {
    id: '10', referenceCode: 'LDE-010', title: 'Arabian Ranches Family Villa',
    slug: 'arabian-ranches-family-villa',
    description: 'The definitive family villa in the beloved Arabian Ranches community. Four spacious bedrooms, a large garden, private pool, and walking distance to international schools and the golf club. Community living at its finest.',
    propertyType: 'villa', operationType: 'sale',
    neighborhood: 'Arabian Ranches', address: 'Arabian Ranches, Mirador',
    latitude: 25.0339, longitude: 55.2719,
    price: 6800000, pricePerSqft: 1511,
    bedrooms: 4, bathrooms: 5, sizeSqft: 4500, yearBuilt: 2016,
    amenities: ['Private Pool', 'Garden', 'Maid\'s Room', 'Double Garage', 'Golf Course Nearby', 'School Nearby'],
    images: ['/images/properties/prop10-1.jpg'],
    coverImage: '/images/properties/prop10-1.jpg',
    status: 'available', featured: false,
    metaTitle: 'Arabian Ranches Family Villa — AED 6.8M | 4BR with Pool',
    metaDescription: '4-bedroom villa with private pool in Arabian Ranches. AED 6,800,000.'
  },
  {
    id: '11', referenceCode: 'LDE-011', title: 'Palm Garden Townhouse',
    slug: 'palm-garden-townhouse-palm-jumeirah',
    description: 'A rare Palm Jumeirah townhouse with a private garden leading directly to the beach. Four bedrooms arranged across three floors, with a rooftop terrace offering Atlantis views. The Palm\'s most coveted residential product.',
    propertyType: 'townhouse', operationType: 'sale',
    neighborhood: 'Palm Jumeirah', address: 'Palm Jumeirah, Garden Homes',
    latitude: 25.1244, longitude: 55.1469,
    price: 15000000, pricePerSqft: 2885,
    bedrooms: 4, bathrooms: 5, sizeSqft: 5200, yearBuilt: 2008,
    amenities: ['Private Beach', 'Private Garden', 'Rooftop Terrace', '2 Parking', 'Atlantis View'],
    images: ['/images/properties/prop11-1.jpg'],
    coverImage: '/images/properties/prop11-1.jpg',
    status: 'available', featured: true,
    metaTitle: 'Palm Garden Townhouse — AED 15M | Private Beach | Palm Jumeirah',
    metaDescription: '4-bedroom townhouse with private beach on Palm Jumeirah. AED 15,000,000.'
  },
  {
    id: '12', referenceCode: 'LDE-012', title: 'Bluewaters Sky Penthouse',
    slug: 'bluewaters-sky-penthouse',
    description: 'Perched atop the iconic Bluewaters Island, this penthouse offers 360-degree views of Dubai, the Arabian Gulf, and the Ain Dubai wheel. Designer interiors, private beach club membership, and a 1,200 sq.ft terrace complete this extraordinary residence.',
    propertyType: 'penthouse', operationType: 'sale',
    neighborhood: 'Bluewaters Island', address: 'Bluewaters Island, Residences',
    latitude: 25.0806, longitude: 55.1204,
    price: 28000000, pricePerSqft: 4118,
    bedrooms: 4, bathrooms: 5, sizeSqft: 6800, yearBuilt: 2021,
    amenities: ['360° Views', 'Private Terrace', 'Beach Club Access', 'Pool', 'Gym', '2 Parking', 'Concierge'],
    images: ['/images/properties/prop12-1.jpg'],
    coverImage: '/images/properties/prop12-1.jpg',
    status: 'available', featured: true,
    metaTitle: 'Bluewaters Sky Penthouse — AED 28M | 360° Dubai Views',
    metaDescription: 'Penthouse on Bluewaters Island with 360-degree views. AED 28,000,000.'
  },
  {
    id: '13', referenceCode: 'LDE-013', title: 'Al Barari Forest Retreat',
    slug: 'al-barari-forest-retreat-villa',
    description: 'Escape the city without leaving it. Al Barari is Dubai\'s only lush botanical community where 60% of the land is dedicated to greenery. This 6-bedroom villa is surrounded by fragrant gardens, natural streams, and rare botanical species.',
    propertyType: 'villa', operationType: 'sale',
    neighborhood: 'Al Barari', address: 'Al Barari, Bungalows',
    latitude: 25.1124, longitude: 55.3680,
    price: 22000000, pricePerSqft: 2200,
    bedrooms: 6, bathrooms: 7, sizeSqft: 10000, yearBuilt: 2019,
    amenities: ['Botanical Gardens', 'Private Pool', 'Gym', 'Spa', 'Staff Quarters', '3 Parking', 'Stream View'],
    images: ['/images/properties/prop13-1.jpg'],
    coverImage: '/images/properties/prop13-1.jpg',
    status: 'available', featured: false,
    metaTitle: 'Al Barari Forest Retreat — AED 22M | Botanical Villa in Dubai',
    metaDescription: '6-bedroom villa surrounded by botanical gardens in Al Barari. AED 22,000,000.'
  },
  {
    id: '14', referenceCode: 'LDE-014', title: 'City Walk Urban Duplex',
    slug: 'city-walk-urban-duplex',
    description: 'City Walk is Dubai\'s answer to a European boulevard. This premium duplex apartment offers open-plan living, a private terrace, and direct access to the best dining and retail in the city. European elegance meets Arabian luxury.',
    propertyType: 'duplex', operationType: 'sale',
    neighborhood: 'City Walk', address: 'City Walk, Building 21',
    latitude: 25.2048, longitude: 55.2500,
    price: 7200000, pricePerSqft: 2250,
    bedrooms: 3, bathrooms: 4, sizeSqft: 3200, yearBuilt: 2020,
    amenities: ['Private Terrace', 'Pool', 'Gym', 'Concierge', '2 Parking', 'Retail at Doorstep'],
    images: ['/images/properties/prop14-1.jpg'],
    coverImage: '/images/properties/prop14-1.jpg',
    status: 'available', featured: false,
    metaTitle: 'City Walk Urban Duplex — AED 7.2M | 3BR Duplex Dubai',
    metaDescription: '3-bedroom duplex with private terrace at City Walk, Dubai. AED 7,200,000.'
  },
  {
    id: '15', referenceCode: 'LDE-015', title: 'Dubai Hills Grand Mansion',
    slug: 'dubai-hills-grand-mansion',
    description: 'A commanding presence in Dubai\'s most sought-after community. This 6-bedroom mansion on a prime golf course plot features a cinema room, wine cellar, and expansive terraces at every level. School bus stop, park, and hospital all within walking distance.',
    propertyType: 'mansion', operationType: 'sale',
    neighborhood: 'Dubai Hills Estate', address: 'Dubai Hills Estate, Golf Place',
    latitude: 25.1130, longitude: 55.2472,
    price: 35000000, pricePerSqft: 2917,
    bedrooms: 6, bathrooms: 8, sizeSqft: 12000, yearBuilt: 2022,
    amenities: ['Golf Course View', 'Cinema', 'Wine Cellar', 'Pool', 'Gym', 'Staff Quarters', '4 Garage', 'Smart Home'],
    images: ['/images/properties/prop15-1.jpg'],
    coverImage: '/images/properties/prop15-1.jpg',
    status: 'available', featured: true,
    metaTitle: 'Dubai Hills Grand Mansion — AED 35M | Golf Course Mansion',
    metaDescription: '6-bedroom mansion on golf course in Dubai Hills Estate. AED 35,000,000.'
  }
];

export function getPropertyBySlug(slug: string): Property | undefined {
  return PROPERTIES.find(p => p.slug === slug);
}

export function getFeaturedProperties(): Property[] {
  return PROPERTIES.filter(p => p.featured);
}

export function getPropertiesByNeighborhood(neighborhood: string): Property[] {
  return PROPERTIES.filter(p => p.neighborhood.toLowerCase().includes(neighborhood.toLowerCase()));
}
```

### `src/data/neighborhoods.ts`

```typescript
export interface Neighborhood {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  avgPricePerSqft: number;
  property_count: number;
  vibe: string[];
  image: string;
  latitude: number;
  longitude: number;
}

export const NEIGHBORHOODS: Neighborhood[] = [
  { id: '1', name: 'Palm Jumeirah', slug: 'palm-jumeirah', tagline: 'The Crown Jewel of Dubai', description: 'The world\'s most iconic man-made island. Home to the most prestigious addresses in the UAE.', avgPricePerSqft: 3500, property_count: 3, vibe: ['Ultra-Luxury', 'Beachfront', 'Iconic'], image: '/images/neighborhoods/palm-jumeirah.jpg', latitude: 25.1124, longitude: 55.1390 },
  { id: '2', name: 'Downtown Dubai', slug: 'downtown-dubai', tagline: 'The Heart of the City', description: 'Where the world\'s tallest building, the best shopping, and the most iconic fountain create an electric atmosphere.', avgPricePerSqft: 2800, property_count: 2, vibe: ['Iconic Views', 'Central', 'Vibrant'], image: '/images/neighborhoods/downtown.jpg', latitude: 25.1972, longitude: 55.2744 },
  { id: '3', name: 'Dubai Marina', slug: 'dubai-marina', tagline: 'Where Lifestyle Meets Waterfront', description: 'The most dynamic urban waterfront destination, with world-class yachting, dining, and nightlife.', avgPricePerSqft: 2200, property_count: 1, vibe: ['Waterfront', 'Young Professionals', 'Lifestyle'], image: '/images/neighborhoods/marina.jpg', latitude: 25.0780, longitude: 55.1384 },
  { id: '4', name: 'Emirates Hills', slug: 'emirates-hills', tagline: 'The Beverly Hills of Dubai', description: 'Dubai\'s most exclusive gated community. Ultra-high-net-worth families, ambassadors, and royalty call this home.', avgPricePerSqft: 4500, property_count: 1, vibe: ['Ultra-Exclusive', 'Gated', 'Golf'], image: '/images/neighborhoods/emirates-hills.jpg', latitude: 25.0714, longitude: 55.1700 },
  { id: '5', name: 'JBR', slug: 'jbr', tagline: 'Beachfront Boulevard Living', description: 'One of the world\'s longest urban beaches, lined with world-class restaurants, shops, and entertainment.', avgPricePerSqft: 2400, property_count: 1, vibe: ['Beach', 'Trendy', 'Social'], image: '/images/neighborhoods/jbr.jpg', latitude: 25.0755, longitude: 55.1319 },
  { id: '6', name: 'DIFC', slug: 'difc', tagline: 'Power & Prestige', description: 'The financial heartbeat of the Middle East. Where executives, artists, and entrepreneurs converge.', avgPricePerSqft: 3200, property_count: 1, vibe: ['Business', 'Culinary', 'Prestige'], image: '/images/neighborhoods/difc.jpg', latitude: 25.2122, longitude: 55.2835 },
  { id: '7', name: 'Business Bay', slug: 'business-bay', tagline: 'Rising Skyline', description: 'A dynamic waterfront district rising rapidly as Dubai\'s second CBD. Exceptional investment opportunity.', avgPricePerSqft: 1800, property_count: 1, vibe: ['Investment', 'Canal Views', 'Growth'], image: '/images/neighborhoods/business-bay.jpg', latitude: 25.1857, longitude: 55.2631 },
  { id: '8', name: 'Dubai Hills Estate', slug: 'dubai-hills-estate', tagline: 'Contemporary Family Living', description: 'Master-planned green community with championship golf, top schools, and premium retail within walking distance.', avgPricePerSqft: 1600, property_count: 1, vibe: ['Family', 'Green', 'Community'], image: '/images/neighborhoods/dubai-hills.jpg', latitude: 25.1130, longitude: 55.2472 },
  { id: '9', name: 'Al Barari', slug: 'al-barari', tagline: "Nature's Urban Sanctuary", description: 'Dubai\'s only botanical community. 60% green space, natural streams, and rare flora surround every home.', avgPricePerSqft: 2000, property_count: 1, vibe: ['Nature', 'Tranquil', 'Wellness'], image: '/images/neighborhoods/al-barari.jpg', latitude: 25.1124, longitude: 55.3680 },
  { id: '10', name: 'Jumeirah Bay', slug: 'jumeirah-bay', tagline: 'Ultra-Exclusive Island Living', description: 'A private island connected by a bridge, accessible only to owners. Among the most exclusive real estate globally.', avgPricePerSqft: 5000, property_count: 1, vibe: ['Island', 'Ultra-Exclusive', 'Private'], image: '/images/neighborhoods/jumeirah-bay.jpg', latitude: 25.2090, longitude: 55.2570 }
];
```

### `src/lib/utils.ts`

```typescript
export function formatPrice(price: number, currency = 'AED'): string {
  if (price >= 1_000_000) {
    return `${currency} ${(price / 1_000_000).toFixed(1)}M`;
  }
  return `${currency} ${price.toLocaleString()}`;
}

export function formatPriceFull(price: number, currency = 'AED'): string {
  return `${currency} ${price.toLocaleString()}`;
}

export function formatSqft(sqft: number): string {
  return `${sqft.toLocaleString()} sq.ft`;
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
```

### `src/lib/types.ts`

```typescript
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
```

---

## 🤖 AISHA — RESPUESTAS DEMO

```typescript
// src/lib/aisha-responses.ts
export function getAishaResponse(message: string): {
  text: string;
  quickReplies?: string[];
} {
  const msg = message.toLowerCase();

  if (msg.includes('budget') || msg.includes('price') || msg.includes('afford') || msg.includes('cost')) {
    return {
      text: "We have properties ranging from AED 1.2M studios to AED 120M island villas. What's your approximate budget? I can immediately shortlist the best options for you.",
      quickReplies: ['Under AED 5M', 'AED 5M - 20M', 'AED 20M+']
    };
  }
  if (msg.includes('villa') || msg.includes('house')) {
    return {
      text: "Our villa collection spans Emirates Hills, Arabian Ranches, Al Barari, and Palm Jumeirah. We currently have stunning options from AED 6.8M to AED 120M. Which community interests you most?",
      quickReplies: ['Emirates Hills', 'Palm Jumeirah', 'Al Barari']
    };
  }
  if (msg.includes('penthouse')) {
    return {
      text: "Our penthouses are truly extraordinary. The Pearl Residence on Palm Jumeirah (AED 45M) and the Bluewaters Sky Penthouse (AED 28M) are our crown jewels. Both are available now — shall I arrange a private viewing?",
      quickReplies: ['View The Pearl', 'View Bluewaters', 'Schedule viewing']
    };
  }
  if (msg.includes('palm')) {
    return {
      text: "Palm Jumeirah is Dubai's most iconic address. We have 3 exceptional properties there — from a beachfront townhouse at AED 15M to The Pearl Residence penthouse at AED 45M. All come with private beach access.",
      quickReplies: ['View Palm properties', 'Schedule viewing']
    };
  }
  if (msg.includes('downtown') || msg.includes('burj')) {
    return {
      text: "Downtown Dubai offers the most iconic living experience — waking up to Burj Khalifa views daily. Our Downtown Panorama apartment (AED 3.8M) is a spectacular option. Would you like full details?",
      quickReplies: ['View Downtown Panorama', 'Other areas']
    };
  }
  if (msg.includes('visit') || msg.includes('viewing') || msg.includes('see') || msg.includes('schedule')) {
    return {
      text: "I'd love to arrange a private viewing for you! Our team is available 7 days a week, including evenings. Please share your email and preferred date, and your dedicated advisor will confirm within the hour.",
      quickReplies: ['This week', 'Next week', 'Contact me directly']
    };
  }
  if (msg.includes('mortgage') || msg.includes('finance') || msg.includes('loan')) {
    return {
      text: "UAE banks offer mortgages up to 75% LTV for residents and 60% for non-residents. Current rates range from 3.5-5% fixed. For a AED 5M property, you'd typically need AED 1.25-2M down payment. Want me to introduce you to our preferred mortgage advisor?",
      quickReplies: ['Yes, connect me', 'Calculate mortgage', 'Tell me more']
    };
  }
  if (msg.includes('golden visa') || msg.includes('residency') || msg.includes('visa')) {
    return {
      text: "Any property purchase above AED 2M qualifies you for the UAE 10-Year Golden Visa! That's permanent residency for you and your family. Most of our portfolio qualifies. It's one of the most compelling reasons to invest in Dubai right now.",
      quickReplies: ['Which properties qualify?', 'Tell me more']
    };
  }
  if (msg.includes('invest') || msg.includes('rental') || msg.includes('yield') || msg.includes('roi')) {
    return {
      text: "Dubai offers some of the world's highest rental yields — typically 5-8% gross, with zero property or income tax. Business Bay, Dubai Marina, and JBR consistently deliver strong returns. Would you like our Investment Guide?",
      quickReplies: ['Send Investment Guide', 'Best areas for ROI']
    };
  }

  return {
    text: "Thank you for your message! I'm Aisha, your AI property advisor. I can help you find the perfect Dubai property, arrange viewings, or answer any questions about the market. What are you looking for?",
    quickReplies: ['Browse villas', 'Browse apartments', 'My budget', 'Schedule viewing']
  };
}
```

---

## 📋 ORDEN DE EJECUCIÓN PARA FLASH

Ejecuta en este orden exacto. **No saltes pasos.**

### ✅ PASO 1 — Limpiar archivos base
- Reemplazar `src/app/globals.css` con el CSS de arriba (eliminar `@import "tailwindcss"`)
- Actualizar `src/app/layout.tsx` → metadata SEO de Luxe Dubai Estates + eliminar Geist fonts
- Limpiar `src/app/page.tsx` (dejarlo vacío, se rellenará en paso 4)
- Actualizar `next.config.ts` para permitir imágenes externas (si se usan)

### ✅ PASO 2 — Crear archivos de datos
- `src/data/properties.ts` → copiar de arriba
- `src/data/neighborhoods.ts` → copiar de arriba
- `src/lib/utils.ts` → copiar de arriba
- `src/lib/types.ts` → copiar de arriba
- `src/lib/aisha-responses.ts` → copiar de arriba

### ✅ PASO 3 — Generar imágenes con `generate_image`
Genera estas imágenes y guárdalas en `public/images/`:

**Hero:**
- `hero-dubai-skyline.jpg` → "Dubai skyline at twilight, Burj Khalifa illuminated, luxury cityscape, cinematic photography, dark sky with golden lights"

**Properties (al menos 6 para las featured):**
- `prop1-1.jpg` → "Ultra luxury penthouse interior Dubai, floor-to-ceiling windows, Arabian Gulf view, dark gold accents, modern"
- `prop3-1.jpg` → "Luxury apartment interior downtown Dubai, Burj Khalifa view, elegant living room, marble floors"
- `prop5-1.jpg` → "Luxury Dubai villa with infinity pool, modern architecture, Palm Jumeirah, aerial view"
- `prop7-1.jpg` → "Grand mansion exterior Dubai, golf course view, palatial architecture, lush garden, dusk"
- `prop8-1.jpg` → "Dubai beachfront apartment terrace, JBR beach view, luxury outdoor furniture"
- `prop12-1.jpg` → "Penthouse rooftop terrace Dubai, sea view, modern furniture, twilight"

**Neighborhoods (al menos 4):**
- `neighborhoods/palm-jumeirah.jpg` → "Palm Jumeirah aerial photography Dubai, iconic palm shape, blue sea, luxury villas"
- `neighborhoods/downtown.jpg` → "Downtown Dubai street level, Burj Khalifa backdrop, modern elegant"
- `neighborhoods/marina.jpg` → "Dubai Marina waterfront, yachts, towers reflected in water, golden hour"
- `neighborhoods/emirates-hills.jpg` → "Emirates Hills Dubai, golf course, luxury villa community, green fairways"

### ✅ PASO 4 — Crear componentes UI base
En `src/components/ui/`:
- `Button.tsx` → componente wrapper del btn-primary/btn-secondary del CSS
- `Badge.tsx` → componente del badge del CSS
- `Modal.tsx` → modal overlay reutilizable
- `Skeleton.tsx` → loading skeleton animado

### ✅ PASO 5 — Crear layout components
En `src/components/layout/`:
- `Header.tsx` → navegación fija con scroll effect + mobile hamburger
- `Footer.tsx` → footer 4 columnas

### ✅ PASO 6 — Actualizar `layout.tsx`
Importar `Header` y `Footer`, añadir `AishaChatWidget` placeholder.

### ✅ PASO 7 — Crear landing page (`src/app/page.tsx`)
Secciones en orden:
1. `HeroSection` (imagen hero + texto animado + CTA)
2. `StatsBar` (4 animated counters)
3. `FeaturedProperties` (6 property cards filtradas por featured)
4. `NeighborhoodGrid` (10 barrios en grid asimétrico)
5. `TestimonialsSection` (3 testimonios ficticios)
6. `CTASection` (banner con 2 botones)

### ✅ PASO 8 — Crear `/properties/page.tsx`
- Sidebar filtros + grid de propiedades
- Implementar `usePropertyFilters` hook
- Filtros: type, operation, neighborhood, price range, bedrooms

### ✅ PASO 9 — Crear `/properties/[slug]/page.tsx`
- `generateStaticParams` con todos los slugs
- `generateMetadata` dinámico por propiedad
- Gallery, specs, description, mortgage calculator, similar properties

### ✅ PASO 10 — Crear `AishaChatWidget.tsx`
- Botón flotante + panel de chat
- Usar `src/lib/aisha-responses.ts`
- Animaciones de typing indicator

### ✅ PASO 11 — Crear páginas secundarias
- `/neighborhoods/page.tsx`
- `/about/page.tsx`
- `/contact/page.tsx`

### ✅ PASO 12 — Verificación final
```powershell
cd apps/inmobiliaria-demo
npm install
npm run build
# Si compila: éxito ✅
# Si falla: leer error y corregir antes de continuar
```

---

## 🎯 CRITERIOS DE ÉXITO

La demo está lista cuando:
- [ ] `npm run build` pasa sin errores
- [ ] La landing page carga en < 3 segundos
- [ ] Las 15 propiedades aparecen en `/properties`
- [ ] Los filtros funcionan (al menos type + neighborhood + price)
- [ ] El detalle de cada propiedad carga con su slug
- [ ] Aisha responde al menos 5 tipos de preguntas diferentes
- [ ] El diseño es dark gold premium (no hay colores blancos/grises básicos)
- [ ] Es responsive en mobile (375px) y desktop (1280px)

---

## ⚠️ ERRORES COMUNES A EVITAR

1. **`@import "tailwindcss"` en CSS** → eliminarlo completamente
2. **Imágenes sin `width`/`height` en `next/image`** → siempre definirlas o usar `fill`
3. **`'use client'` olvidado** → añadirlo en cualquier componente con useState/useEffect
4. **Rutas de imagen absolutas** → usar `/images/...` (relativo a `/public/`)
5. **TypeScript `any`** → definir siempre los tipos correctos
6. **Clases CSS inexistentes** → solo usar las definidas en `globals.css` o `className` con styles inline

---

*Generado por Antigravity | Proyecto: Luxe Dubai Estates Demo | v1.0*
