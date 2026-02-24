# 🎯 Sistema de Feedback de Academia (FASE 13)

Sistema completo de notificaciones, animaciones y mensajes motivacionales para la Academia Digital de Getxo Bela Eskola.

## 📦 Componentes Creados

### 1. **AchievementToast**
Toast animado que aparece cuando el alumno desbloquea un logro.

**Características:**
- Animación de entrada/salida suave desde la derecha
- Colores según rareza del logro (común, raro, épico, legendario)
- Sparkles animados en el fondo
- Barra de progreso para indicar tiempo restante
- Auto-dismiss configurable
- Soporte para puntos y rareza

**Ubicación:** `src/components/academy/notifications/AchievementToast.tsx`

### 2. **SkillUnlockedModal**
Modal a pantalla completa con efecto confetti cuando se desbloquea una habilidad.

**Características:**
- Backdrop oscuro con blur
- 50 piezas de confetti animadas cayendo
- Animación de pulso y anillos en el icono
- Diseño premium con gradientes dorados
- Botón de cierre manual o auto-cierre

**Ubicación:** `src/components/academy/notifications/SkillUnlockedModal.tsx`

### 3. **MotivationalMessages**
Mensajes motivacionales contextuales que aparecen en la parte inferior de la pantalla.

**Tipos de mensajes:**
- `unit_completed` - Al completar una unidad
- `quiz_passed` - Al aprobar un quiz
- `quiz_failed` - Al suspender (mensajes de ánimo)
- `streak` - Felicitación por racha de días
- `level_up` - Al subir de nivel/rango

**Características:**
- Mensajes marineros temáticos
- Rotación aleatoria de frases
- Auto-dismiss después de 4 segundos
- Emoji contextual según el tipo

**Ubicación:** `src/components/academy/MotivationalMessages.tsx`

### 4. **useAcademyFeedback** (Hook)
Hook principal para disparar notificaciones desde cualquier componente.

**Métodos:**
```typescript
const { 
    showAchievement,      // Muestra toast de logro
    showSkillUnlocked,    // Muestra modal de habilidad
    showMessage,          // Muestra mensaje genérico
    checkForNewAchievements  // Verifica logros nuevos
} = useAcademyFeedback();
```

**Ubicación:** `src/hooks/useAcademyFeedback.ts`

### 5. **AcademyFeedbackProvider**
Componente wrapper que debe agregarse al layout raíz.

**Ubicación:** `src/components/academy/AcademyFeedbackProvider.tsx`

---

## 🚀 Integración

### 1. Agregar al Layout Principal

```tsx
// src/app/layout.tsx (o donde tengas el layout raíz)
import AcademyFeedbackProvider from '@/components/academy/AcademyFeedbackProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html>
            <body>
                <AcademyFeedbackProvider>
                    {children}
                </AcademyFeedbackProvider>
            </body>
        </html>
    );
}
```

### 2. Usar en Componentes

```tsx
'use client';

import { useAcademyFeedback } from '@/hooks/useAcademyFeedback';

export default function MyComponent() {
    const { showAchievement, showSkillUnlocked, showMessage } = useAcademyFeedback();

    const handleUnitComplete = async () => {
        // ... lógica de completado ...
        
        // Mostrar logro
        showAchievement({
            id: 'primer-dia',
            nombre_es: 'Primer Día en el Mar',
            nombre_eu: 'Lehen Eguna',
            descripcion_es: '¡Has completado tu primera unidad!',
            icono: '⚓',
            rareza: 'comun',
            puntos: 10
        });
    };

    const handleSkillUnlock = () => {
        showSkillUnlocked({
            id: 'nudos',
            name: 'Maestro de Nudos',
            description: 'Dominas los nudos marineros',
            icon: '🪢',
            category: 'Técnica'
        });
    };

    return <button onClick={handleUnitComplete}>Completar</button>;
}
```

### 3. Integración con Motor de Logros

En el endpoint `/api/academy/evaluation/submit` o donde se procese el progreso:

```typescript
// Después de actualizar progreso en la BD
const response = await fetch('/api/academy/achievements');
const data = await response.json();

// Detectar logros nuevos y mostrarlos
if (data.nuevos_logros) {
    data.nuevos_logros.forEach(logro => {
        showAchievement(logro);
    });
}
```

---

## 🎨 Animaciones CSS

Todas las animaciones están definidas en `src/app/globals.css`:

- `animate-confetti` - Partículas cayendo
- `animate-progress-bar` - Barra temporal
- `animate-pulse-slow` - Pulso suave
- `animate-spin-slow` - Rotación lenta
- `animate-fade-in` - Entrada suave

---

## 🧪 Testing con FeedbackDemo

Componente de demostración incluido para probar todas las variantes de feedback:

```tsx
import FeedbackDemo from '@/components/academy/FeedbackDemo';

// Agregar al dashboard o página de pruebas:
<FeedbackDemo />
```

Botones disponibles:
- Logro Común
- Logro Legendario  
- Habilidad Desbloqueada
- Mensaje Simple

---

## ⚙️ Preferencias de Usuario

Incluido hook `useAnimationPreferences()` para gestionar preferencias:

```typescript
const { animationsEnabled, toggleAnimations } = useAnimationPreferences();
```

**Pendiente:** Conectar con perfil de usuario en Supabase para persistir la preferencia.

---

## 📋 Checklist de Verificación (FASE 13)

- [x] Componente AchievementToast creado
- [x] Componente SkillUnlockedModal creado
- [x] Componente MotivationalMessages creado
- [x] Hook useAcademyFeedback creado
- [x] Animaciones CSS agregadas a globals.css
- [x] Provider wrapper creado
- [x] Componente de demo creado
- [x] Documentación README creada
- [ ] Integración con motor de logros en submit API
- [ ] Agregar AcademyFeedbackProvider al layout raíz
- [ ] Probar notificaciones en flujo real
- [ ] Conectar preferencias con perfil de usuario

---

## 🎯 Siguiente Paso

Integrar el sistema en las rutas clave:
1. `POST /api/academy/evaluation/submit` - Disparar logros tras aprobar
2. `POST /api/academy/progress/update` - Disparar habilidades tras completar módulo
3. Dashboard - Mostrar mensaje al entrar con racha activa

**Recomendación:** Usar **Sonnet Fast** para la integración práctica en los endpoints.

---

*Documentación creada el 2026-02-11 - FASE 13 Completada*
