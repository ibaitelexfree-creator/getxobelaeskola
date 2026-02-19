# ⚡ Análisis de Rendimiento y Optimización (Fase 11)

## 📊 Estado Actual (Subfase 11.1)

### 1. Auditoría de Assets (Imágenes)
Se ha realizado un inventario de las imágenes en `public/images`.
- **Hallazgo**: Existen versiones duplicadas de activos en formato `.png` y `.webp` (ej: `icon-3d-instructor`). El sistema ya está configurado para usar `.webp`, por lo que los archivos `.png` pesados son redundantes.
- **Hallazgo**: Algunas imágenes "legacy" en subcarpetas superan los 800KB.
- **Hallazgo**: La textura de fondo `bg-texture-waves.png` tiene un peso considerable (778KB).

### 2. Auditoría de Bundles (Next.js Build)
- **First Load JS compartido**: ~89.4 kB.
- **Middleware**: 85.2 kB.
- **Páginas Críticas**:
  - `/es/` (Home): 121 kB.
  - `/es/student/dashboard`: ~130 kB (estimado).
  - `/es/courses/[slug]`: ~110 kB.
- **Conclusión**: El tamaño de los bundles de JavaScript está dentro de los límites saludables para una aplicación de este calibre (SLA < 200kB por página).

### 3. Rendimiento de API y Backend
- **Singleton de Supabase**: Actualmente se crea un nuevo cliente de Supabase en cada llamada a `createAdminClient()`.
- **Weather API**: 8 segundos de timeout en el fetch externo de clima.

---

## 🛠️ Plan de Optimización (Subfase 11.2)

### A. Optimización de Assets
1. [ ] Eliminar imágenes `.png` redundantes que ya tengan su versión `.webp` optimizada.
2. [ ] Comprimir agresivamente las texturas (`bg-texture-waves.webp`) y los iconos 3D.
3. [ ] Asegurar que todas las imágenes externas (Unsplash) usen parámetros de tamaño optimizados (`&w=1200&q=80`).

### B. Optimización de Código
1. [ ] **Singleton Supabase**: Refactorizar `src/lib/supabase/admin.ts` y `server.ts` para reutilizar instancias en lugar de crearlas en cada request.
2. [ ] **Dynamic Imports**: Verificar que los componentes pesados (Gráficos Recharts, Mapas Leaflet) se carguen con `ssr: false` y solo cuando sea necesario.
3. [ ] **Caching**: Implementar políticas de caché en las API de clima y datos públicos que no cambian frecuentemente.

### C. Core Web Vitals
1. [ ] Revisar `Priority` en imágenes `LCP` (Hero Carousel).
2. [ ] Verificar dimensiones explícitas en `Next/Image` para evitar Layout Shifts (CLS).
