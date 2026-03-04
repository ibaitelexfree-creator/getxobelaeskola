# 🚀 Implementación: Panel de Usuario Premium (Luxe Dubai Dashboard)

Actualmente, la zona de usuarios es inexistente o extremadamente básica (solo login/registro). Vamos a transformarla en una experiencia de lujo acorde con el resto de la web.

## 🎯 Objetivos
1. Crear un **Dashboard Interactivo** para usuarios.
2. Implementar sistema de **Favoritos** (Guardar propiedades).
3. Añadir historial de **Propiedades Vistas**.
4. Mejorar el **Header** con perfil de usuario y navegación contextual.
5. Permitir personalización básica del **Perfil**.

---

## 🏗️ Fase 1: Infraestructura de Datos (Supabase)
> **Objetivo:** Preparar la base de datos para almacenar la actividad del usuario.

- [x] **Identificar tablas actuales**: `profiles`, `properties` existen.
- [ ] **Migración SQL**: 
    - Crear tabla `favorites` (user_id, property_slug).
    - Crear tabla `view_history` (user_id, property_slug, viewed_at).
    - Añadir RLS (Row Level Security) para que cada usuario solo vea lo suyo.

---

## 🎨 Fase 2: Componentes de Interacción
> **Objetivo:** Permitir que los usuarios interactúen con las propiedades.

- [ ] **FavoriteButton**: Componente (corazón) para añadir/quitar de favoritos.
- [ ] **Integración en PropertyCard**: Añadir el botón de favoritos en el grid principal.
- [ ] **Toast Notifications**: Feedback visual cuando se guarda una propiedad.

---

## 🏙️ Fase 3: Dashboard (/dashboard)
> **Objetivo:** El centro de mandos del usuario.

- [ ] **Página Principal del Dashboard**:
    - **Welcome Header**: Saludo personalizado con el nombre del usuario.
    - **Stats Cards**: "Propiedades Guardadas", "Búsquedas Recientes", "Mensajes con Aisha".
- [ ] **Sección de Favoritos**: Grid con las propiedades guardadas (reusando `PropertyCard`).
- [ ] **Sección de Historial**: Lista horizontal de propiedades vistas recientemente.
- [ ] **Sección de Perfil**: Formulario para cambiar nombre, apellidos y avatar.

---

## 🔗 Fase 4: Integración y Navegación
> **Objetivo:** Flujo de usuario fluido.

- [ ] **Header Pro**: 
    - Al estar logueado: Sustituir "Login" por Avatar + Dropdown (Dashboard, Perfil, Logout).
    - Al no estar logueado: Mantener botón "Login / Join".
- [ ] **Redirección Post-Login**: Enviar al usuario al Dashboard después de entrar.
- [ ] **Middlewares / Guards**: Asegurar que `/dashboard` solo sea accesible para usuarios autenticados.

---

## 💎 Diseño Estético (Dubai Gold)
- Usaremos **Glassmorphism** avanzado para las tarjetas del panel.
- Micro-animaciones al marcar favoritos.
- Layout minimalista pero expansivo, usando la fuente `Playfair Display` para encabezados de sección.
