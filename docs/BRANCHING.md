# 🌿 Convención de Ramas (Branches) — Swarm Jules

Para evitar colisiones y mantener el orden en el pipeline serial, cada Jules debe seguir una convención estricta de nombres para sus ramas.

---

## 🏛️ Jules 1: Lead Architect
**Prefix:** `jules/arch-*` o `jules/fix-*`
**Ejemplos:**
- `jules/arch-add-new-contracts`
- `jules/fix-ci-lint-error`
- `jules/arch-update-roles`

---

## 🗄️ Jules 2: Data Master
**Prefix:** `jules/data-*`
**Ejemplos:**
- `jules/data-add-profiles-table`
- `jules/data-fix-rls-policy`
- `jules/data-api-enrollment-logic`

---

## 🎨 Jules 3: UI Engine
**Prefix:** `jules/ui-*`
**Ejemplos:**
- `jules/ui-redesign-hero`
- `jules/ui-add-enrollment-form`
- `jules/ui-fix-mobile-navbar`

---

## 🛡️ Reglas de Validación (CI)
El workflow de GitHub Actions verificará:
1. Que el autor del PR (determinado por el account email en el commit) coincida con el prefijo de la rama.
2. Que la rama nazca siempre de `main` o de la rama del paso anterior en el swarm (e.g., UI puede nacer de Data).
3. **Draft PRs:** Los Jules deben abrir sus PRs como **Draft** hasta que el CI pase todas las pruebas.
