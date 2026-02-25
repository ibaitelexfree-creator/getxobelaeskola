# 🔐 Reglas de Protección de Ramas — GitHub Settings

> **Este documento describe las reglas que DEBEN configurarse manualmente en GitHub.**
> Ruta: GitHub → Settings → Rules → Rulesets

---

## 1. Ruleset: `main-protection` (Rama `main`)

| Regla | Valor | Motivo |
| :--- | :--- | :--- |
| **Require a pull request before merging** | ✅ ON | Nadie pushea directo a main |
| **Required approvals** | `1` | Al menos 1 humano revisa |
| **Dismiss stale PR reviews** | ✅ ON | Si cambia el código, se resetea la aprobación |
| **Require review from Code Owners** | ✅ ON | El dueño del área DEBE aprobar |
| **Require status checks to pass** | ✅ ON | CI debe pasar antes de merge |
| **Status checks required** | `🛡️ Lints & Tests`, `🧱 Build Verification` | Jobs del pipeline CI |
| **Require branches to be up to date** | ✅ ON | Evita conflictos fantasma |
| **Require conversation resolution** | ✅ ON | Todos los comentarios resueltos |
| **Restrict force pushes** | ✅ ON | Nadie reescribe historia |
| **Restrict deletions** | ✅ ON | Nadie borra main |
| **Require linear history** | ✅ ON | Solo squash merge, historial limpio |

## 2. Merge Settings (Settings → General)

| Setting | Valor |
| :--- | :--- |
| **Allow merge commits** | ❌ OFF |
| **Allow squash merging** | ✅ ON (Default) |
| **Allow rebase merging** | ❌ OFF |
| **Auto-delete head branches** | ✅ ON |

## 3. Code Security (Settings → Code Security)

| Setting | Valor |
| :--- | :--- |
| **Secret scanning** | ✅ ON |
| **Push protection** | ✅ ON |
| **Dependabot alerts** | ✅ ON |
| **Dependabot security updates** | ✅ ON |

## 4. Convención de Nombres de Ramas

| Prefijo | Quién | Ejemplo |
| :--- | :--- | :--- |
| `feature/urko-*` | Urko (humano) | `feature/urko-new-dashboard` |
| `feature/dev2-*` | Dev 2 | `feature/dev2-payment-flow` |
| `feature/dev3-*` | Dev 3 | `feature/dev3-mobile-nav` |
| `jules/architect-*` | Jules Arquitecto | `jules/architect-refactor-api` |
| `jules/db-*` | Jules DBA | `jules/db-add-indexes` |
| `jules/frontend-*` | Jules Frontend | `jules/frontend-fix-responsive` |
| `jules/qa-*` | Jules QA | `jules/qa-add-tests` |
| `jules/fixer-*` | Jules Fixer | `jules/fixer-ci-errors` |
| `hotfix/*` | Cualquiera (urgencia) | `hotfix/fix-stripe-crash` |
