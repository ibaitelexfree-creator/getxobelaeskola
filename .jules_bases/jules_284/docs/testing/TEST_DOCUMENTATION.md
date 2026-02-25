# 🧪 Documentación del Sistema de Tests

Este documento detalla la infraestructura, configuración y catálogo de pruebas automatizadas implementadas en el proyecto **Getxo Bela Eskola**.

---

## 🛠️ Infraestructura de Testing

El proyecto utiliza **Vitest** como motor de pruebas principal, aprovechando su velocidad y compatibilidad nativa con Vite/Next.js.

### Configuración Core
- **Motor:** Vitest `^1.0.0`
- **Entorno:** `jsdom` (simulación de navegador para componentes React)
- **Setup:** `vitest.setup.ts` (carga `jest-dom` para aserciones visuales)
- **Alias:** Soporte para `@/*` mapeando a `src/`

### Comandos Disponibles
```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (desarrollo)
npm run test:watch

# Generar reporte de cobertura (si está configurado)
npm run test:coverage
```

---

## 🔍 Catálogo de Tests Implementados

### 1. Gamificación y Progresión
- **Archivo:** `src/lib/gamification/ranks.test.ts`
- **Cobertura:**
  - Lógica de asignación de rangos (Grumete → Capitán) basada en XP.
  - Cálculo de XP estimado sumando progreso académico y logros.
  - Validación de transición entre niveles de rango.

- **Archivo:** `src/lib/gamification/AchievementEngine.test.ts`
- **Cobertura:**
  - Motor de evaluación de logros en tiempo real.
  - Desbloqueo condicional basado en tipo de misión, puntuación y tiempo.
  - Validación de hitos como "Primeros Pasos", "Maestro de Cabos" y "Velocidad Luz".

### 2. Servicios Académicos
- **Archivo:** `src/lib/academy/weather-service.test.ts`
- **Cobertura:**
  - Transformación de datos meteorológicos para herramientas de la academia.
  - Validación de estados de viento y seguridad para la navegación.

### 3. Utilidades y Helpers
- **Archivo:** `src/lib/utils/financial.test.ts`
- **Cobertura:**
  - `parseAmount`: Limpieza y conversión de strings monetarios (soporte para €, comas y puntos).
  - `calculateEndTime`: Lógica de tiempos para reservas y sesiones (cálculo de duración y padding).

---

## 📈 Estrategia de Testing (Fase 9)

La Fase 9 se ha centrado en **Tests Unitarios de Lógica Crítica**. El objetivo es asegurar que el "corazón" del sistema (pagos, progreso, clima) funcione correctamente antes de escalar a pruebas de integración o E2E.

### Reglas de Oro para nuevos tests:
1. **Aislar efectos secundarios:** Usar mocks para llamadas a base de datos o APIs externas.
2. **Naming descriptivo:** Usar `describe` e `it` en español o inglés siguiendo el patrón de la funcionalidad.
3. **Casos borde:** Probar siempre inputs nulos, inválidos o extremos (especialmente en cálculos financieros y de XP).

---

## 🚀 Próximos Pasos (Fase 10+)
- [ ] Implementar Tests de Componentes (React Testing Library).
- [ ] Configurar CI/CD para ejecutar tests en cada Pull Request.
- [ ] Incrementar cobertura en el motor de reservas (`src/components/booking`).
