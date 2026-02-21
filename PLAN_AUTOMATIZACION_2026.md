# Plan de Implementación: Automatización Híbrida de Bajo Consumo (2026)

Este plan detalla la transición a una infraestructura CI/CD de costo cero, optimizada para ejecución agéntica con Gemini 2.0 Flash.

## 🏗️ Fase 1: Auditoría y Base de Seguridad (Pre-Vuelo)
- [x] **Inventario de Recursos**: Escaneo de dependencias Android/Web y mapeo de cuotas Bitbucket/GitHub.
- [x] **Secrets Vault**: Configuración de `PAT` (GitHub) y `SSH Keys` (Bitbucket) para comunicación entre plataformas.
- [x] **Baseline de Consumo**: Medición del tiempo actual de Gradle vs Meta de 10s.

## 📡 Fase 2: El Puente de Señalización (Bitbucket Side)
- [x] **Alpine-Curl Dispatcher**: Crear `.bitbucket-pipelines.yml` ultra-ligero.
- [x] **Payload Optimization**: Definir el JSON mínimo para `repository_dispatch` (commit, branch, task).
- [ ] **Trigger Logic**: Configurar filtros por rama para evitar disparos innecesarios.

## ⚙️ Fase 3: El Motor de Ejecución (GitHub Side)
- [x] **Dispatch Receiver**: Configurar `on: repository_dispatch` en GitHub Actions.
- [ ] **Dynamic Checkout**: Implementar clonado dinámico desde Bitbucket usando la referencia del payload.
- [ ] **Matrix Orchestration**: Separar flujos de Android y Web para ejecución paralela.

## 📱 Fase 4: Android "Nitro" (Zero-Gradle Linting)
- [ ] **Ktlint Standalone**: Script de ejecución directa via JAR (Meta: <15s).
- [ ] **Detekt CLI**: Integración de análisis de complejidad sin demonio de Gradle.
- [ ] **Baseline migration**: Ignorar deuda técnica antigua para focus en cambios nuevos.

## 🌐 Fase 5: Web "Oxc" (Rust Stack) ✅
- [x] **Oxlint Migration**: Instalado. Baseline: 260 warnings + 1 error en 32ms (423 archivos, 32 threads).
- [x] **Biome Setup**: Configurado + auto-fix. 387 archivos corregidos. Errores: 1214→559 en 148ms.
- [x] **Scripts**: `lint:fast`, `format:check`, `format:fix`, `check:all` en package.json.

## 🏷️ Fase 6: Semantic Auto-Release
- [ ] **Semantic Release**: Automatizar tags de Git y Changelogs basados en Conventional Commits.
- [ ] **Artifact Management**: Configuración de retención de 1 día para ahorrar espacio en GitHub (500MB limit).

## 📊 Fase 7: Auditoría de Eficiencia Agéntica
- [ ] **Analítica de Logs**: Reducción de verbosidad para ahorro de tokens.
- [ ] **Verificación de la Regla de los 10s**: Asegurar que Bitbucket nunca exceda el límite.
- [ ] **Informe de Ahorro**: Proyección anual de consumo 0$.

---
*Orquestado por Antigravity mediante agentes Gemini 2.0 Flash - Febrero 2026*
