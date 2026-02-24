# Architecture Documentation

*Auto-generated on 2026-02-23T12:02:46.309Z*

This document provides an overview of the project's source code structure and exported modules.

## Directory: `src`

### middleware.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `middleware` | Function | - |
| `config` | Variable | - |

## Directory: `src/actions`

### peer-review.ts

| Export Name | Type | Description |
| :--- | :--- | :--- | 
| `getPendingReviews` | Function | - | 
| `submitReview` | Function | - |

## Directory: `src/app`

### fonts.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `cormorantGaramond` | Variable | - |
| `outfit` | Variable | - |
| `jetbrainsMono` | Variable | - |

### layout.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `RootLayout` | Function | - |

### robots.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `robots` | Function | - |

### sitemap.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `sitemap` | Function | - |

## Directory: `src/app/[locale]`

### error.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `Error` | Function | - |

### layout.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `viewport` | Variable | - |
| `generateStaticParams` | Function | - |
| `LocaleLayout` | Function | - |
| `generateMetadata` | Function | - |

### loading.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `Loading` | Function | - |

### not-found.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `NotFound` | Function | - |

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateMetadata` | Function | - |
| `LandingPage` | Function | - |

## Directory: `src/app/[locale]/[...rest]`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateStaticParams` | Function | - |
| `CatchAllPage` | Function | - |

## Directory: `src/app/[locale]/about`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateMetadata` | Function | - |
| `AboutPage` | Function | - |

## Directory: `src/app/[locale]/academy`

### AcademyMain.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `AcademyMain` | Function | - |

### error.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `AcademyError` | Function | - |

### layout.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `AcademyLayout` | Function | - |

### not-found.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `NotFound` | Function | - |

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateMetadata` | Function | - |
| `AcademyMapPage` | Function | - |

## Directory: `src/app/[locale]/academy/achievements`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `AchievementsPage` | Function | - |

## Directory: `src/app/[locale]/academy/certificates`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `CertificatesPage` | Function | - |

## Directory: `src/app/[locale]/academy/competition`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `CompetitionPage` | Function | - |

## Directory: `src/app/[locale]/academy/competition/lobby/[code]`

### LobbyClient.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `LobbyClient` | Function | - |

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateStaticParams` | Function | - |
| `LobbyPage` | Function | - |

## Directory: `src/app/[locale]/academy/competition/race/[code]`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateStaticParams` | Function | - |
| `RacePage` | Function | - |

### RaceClient.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `RaceClient` | Function | - |

## Directory: `src/app/[locale]/academy/competition/results/[code]`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateStaticParams` | Function | - |
| `ResultsPage` | Function | - |

### ResultsClient.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `ResultsClient` | Function | - |

## Directory: `src/app/[locale]/academy/course/[slug]`

### CourseDetailMain.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `CourseDetailMain` | Function | - |

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateMetadata` | Function | - |
| `generateStaticParams` | Function | - |
| `CourseDetailPage` | Function | - |

## Directory: `src/app/[locale]/academy/dashboard`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `DashboardPage` | Function | - |

## Directory: `src/app/[locale]/academy/exploration`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `ExplorationPage` | Function | - |

## Directory: `src/app/[locale]/academy/kiosko`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `KioskPage` | Function | - |

## Directory: `src/app/[locale]/academy/kiosko/components`

### KioskMap.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `KioskMap` | Function | - |

### KioskNomenclature.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `KioskNomenclature` | Function | - |

### KioskStats.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `KioskStats` | Function | - |

### KioskVideo.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `KioskVideo` | Function | - |

## Directory: `src/app/[locale]/academy/lab`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GeoLabPage` | Function | - |

## Directory: `src/app/[locale]/academy/level/[slug]`

### LevelDetailMain.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `LevelDetailMain` | Function | - |

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateStaticParams` | Function | - |
| `generateMetadata` | Function | - |
| `LevelDetailPage` | Function | - |

## Directory: `src/app/[locale]/academy/logbook`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `LogbookPage` | Function | - |

## Directory: `src/app/[locale]/academy/module/[id]`

### ModuleDetailMain.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `ModuleDetailMain` | Function | - |

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateMetadata` | Function | - |
| `generateStaticParams` | Function | - |
| `ModuleDetailPage` | Function | - |

## Directory: `src/app/[locale]/academy/nomenclature`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `metadata` | Variable | - |
| `NomenclaturePage` | Function | - |

## Directory: `src/app/[locale]/academy/simulador`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `metadata` | Variable | - |
| `SimulatorPage` | Function | - |

## Directory: `src/app/[locale]/academy/skills`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `SkillsPage` | Function | - |

## Directory: `src/app/[locale]/academy/tools/chart-plotter`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `ChartPlotterPage` | Function | - |

## Directory: `src/app/[locale]/academy/tools/flashcards`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `FlashcardsPage` | Function | - |

## Directory: `src/app/[locale]/academy/tools/knots`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `KnotsPage` | Function | - |

## Directory: `src/app/[locale]/academy/tools/nomenclature`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `NomenclaturePage` | Function | - |

## Directory: `src/app/[locale]/academy/tools/wind-lab`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `WindLabPage` | Function | - |

## Directory: `src/app/[locale]/academy/unit/[id]`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateMetadata` | Function | - |
| `generateStaticParams` | Function | - |
| `UnitReaderPage` | Function | - |

### UnitReaderMain.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `UnitReaderMain` | Function | - |

## Directory: `src/app/[locale]/academy/wind-lab`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `WindLabPage` | Function | - |

## Directory: `src/app/[locale]/auth/forgot-password`

### ForgotPasswordClient.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `ForgotPasswordClient` | Function | - |

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateMetadata` | Function | - |
| `generateStaticParams` | Function | - |
| `ForgotPasswordPage` | Function | - |

## Directory: `src/app/[locale]/auth/login`

### LoginPageClient.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `LoginPageClient` | Function | - |

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateMetadata` | Function | - |
| `generateStaticParams` | Function | - |
| `LoginPage` | Function | - |

## Directory: `src/app/[locale]/auth/register`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateMetadata` | Function | - |
| `generateStaticParams` | Function | - |
| `RegisterPage` | Function | - |

### RegisterPageClient.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `RegisterPage` | Function | - |

## Directory: `src/app/[locale]/auth/reset-password`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateMetadata` | Function | - |
| `generateStaticParams` | Function | - |
| `ResetPasswordPage` | Function | - |

### ResetPasswordClient.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `ResetPasswordClient` | Function | - |

## Directory: `src/app/[locale]/contact`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateMetadata` | Function | - |
| `ContactPage` | Function | - |

## Directory: `src/app/[locale]/cookies`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateMetadata` | Function | - |
| `CookiesPage` | Function | - |

## Directory: `src/app/[locale]/courses`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateMetadata` | Function | - |
| `CoursesPage` | Function | - |

## Directory: `src/app/[locale]/courses/[slug]`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateMetadata` | Function | - |
| `generateStaticParams` | Function | - |
| `CourseDetailPage` | Function | - |

## Directory: `src/app/[locale]/experiences`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateMetadata` | Function | - |
| `generateStaticParams` | Function | - |
| `ExperiencesPage` | Function | - |

## Directory: `src/app/[locale]/instructor`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateMetadata` | Function | - |
| `InstructorPage` | Function | - |

## Directory: `src/app/[locale]/privacy`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateMetadata` | Function | - |
| `PrivacyPage` | Function | - |

## Directory: `src/app/[locale]/rental`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateMetadata` | Function | - |
| `generateStaticParams` | Function | - |
| `RentalPage` | Function | - |

## Directory: `src/app/[locale]/staff`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateMetadata` | Function | - |
| `generateStaticParams` | Function | - |
| `StaffPage` | Function | - |

## Directory: `src/app/[locale]/staff/activity/[userId]`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateStaticParams` | Function | - |
| `StaffActivityPage` | Function | - |

## Directory: `src/app/[locale]/staff/reports`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateStaticParams` | Function | - |
| `FinancialReportsPage` | Function | - |

## Directory: `src/app/[locale]/student/courses`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateStaticParams` | Function | - |
| `MobileCoursesPage` | Function | - |

## Directory: `src/app/[locale]/student/courses/[slug]`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateStaticParams` | Function | - |
| `MobileCourseDetailPage` | Function | - |

## Directory: `src/app/[locale]/student/daily-challenge`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `DailyChallengePage` | Function | - |

## Directory: `src/app/[locale]/student/dashboard`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateMetadata` | Function | - |
| `generateStaticParams` | Function | - |
| `StudentDashboard` | Function | - |

### StudentDashboardClient.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `StudentDashboardClient` | Function | - |

## Directory: `src/app/[locale]/student/membership`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `MembershipPage` | Function | - |

## Directory: `src/app/[locale]/student/membership/card`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `MembershipCardPage` | Function | - |

## Directory: `src/app/[locale]/student/membership/confirmation`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `MembershipConfirmationPage` | Function | - |

## Directory: `src/app/[locale]/student/payment-success`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `PaymentSuccessPage` | Function | - |

## Directory: `src/app/[locale]/student/profile`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateStaticParams` | Function | - |
| `MobileProfilePage` | Function | - |

## Directory: `src/app/[locale]/student/rentals`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateStaticParams` | Function | - |
| `MobileRentalPage` | Function | - |

## Directory: `src/app/[locale]/test-chart`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `TestChartPage` | Function | - |

## Directory: `src/app/[locale]/verify/[hash]`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateStaticParams` | Function | - |
| `VerifyCertificatePage` | Function | - |

### VerifyCertificateClient.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `VerifyCertificateClient` | Function | - |

## Directory: `src/app/[locale]/verify/id/[id]`

### page.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateStaticParams` | Function | - |
| `VerificationPage` | Function | - |

### VerificationPageClient.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `VerificationPageClient` | Function | - |

## Directory: `src/app/api/achievements`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |

## Directory: `src/app/api/admin/academy/student-progress`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |

## Directory: `src/app/api/admin/audit-logs/list`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |

## Directory: `src/app/api/admin/bi`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |

## Directory: `src/app/api/admin/boats/availability`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |

## Directory: `src/app/api/admin/boats/create`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/admin/boats/delete`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/admin/boats/list`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |

## Directory: `src/app/api/admin/boats/maintenance`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |
| `POST` | Function | - |

## Directory: `src/app/api/admin/boats/maintenance/update`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/admin/boats/update`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/admin/calendar/list`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |

## Directory: `src/app/api/admin/course-students`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |

## Directory: `src/app/api/admin/courses/archive`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/admin/courses/create`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/admin/courses/list`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |

## Directory: `src/app/api/admin/courses/update`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/admin/create-staff`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/admin/delete-inscription`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/admin/drive/list`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |

## Directory: `src/app/api/admin/explorer`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |

## Directory: `src/app/api/admin/list-inscriptions`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |

## Directory: `src/app/api/admin/list-staff`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |

## Directory: `src/app/api/admin/log-activity`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/admin/marketing/campaigns`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |
| `POST` | Function | - |

## Directory: `src/app/api/admin/marketing/campaigns/[id]`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `PATCH` | Function | - |
| `DELETE` | Function | - |

## Directory: `src/app/api/admin/marketing/process`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `dynamic` | Variable | - |
| `POST` | Function | Endpoint para procesar automatizaciones de marketing. Puede ser llamado por un Cron Job o manualmente por un Admin. |
| `GET` | Function | Permitimos GET para pruebas rápidas en desarrollo o si se protege adecuadamente. |

## Directory: `src/app/api/admin/newsletters/create`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/admin/notion/fleet`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |

## Directory: `src/app/api/admin/notion/metrics`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |

## Directory: `src/app/api/admin/notion/sync`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/admin/notion/update-dashboard`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/admin/remove-staff`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/admin/rentals/financials`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |

## Directory: `src/app/api/admin/rentals/financials/update`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/admin/rentals/financials/update-date`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `PATCH` | Function | - |

## Directory: `src/app/api/admin/rentals/list`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |

## Directory: `src/app/api/admin/search-students`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |

## Directory: `src/app/api/admin/sessions/attendance`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | Handles session attendance (listing and updating) |
| `POST` | Function | - |

## Directory: `src/app/api/admin/sessions/create`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/admin/sessions/delete`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/admin/sessions/list`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |

## Directory: `src/app/api/admin/sessions/update`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/admin/update-inscription`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/admin/update-log`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/admin/update-profile`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/admin/update-rental`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/admin/update-staff`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/auth/callback`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |

## Directory: `src/app/api/auth/logout`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/bonos`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `dynamic` | Variable | - |
| `GET` | Function | - |

## Directory: `src/app/api/certificates`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |

## Directory: `src/app/api/certificates/[id]`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | GET /api/academy/certificates/[id] Obtiene el detalle completo de un certificado específico (Fase 9). Incluye habilidades demostradas por el alumno. |

## Directory: `src/app/api/certificates/verify/[hash]`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |

## Directory: `src/app/api/checkout`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/checkout/bono`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/checkout/rental`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/contact`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/course/[slug]`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `dynamic` | Variable | - |
| `GET` | Function | - |

## Directory: `src/app/api/courses`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `dynamic` | Variable | - |
| `OPTIONS` | Function | - |
| `GET` | Function | - |

## Directory: `src/app/api/cron/check-alerts`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `dynamic` | Variable | - |
| `GET` | Function | - |

## Directory: `src/app/api/daily-challenge`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |
| `POST` | Function | - |

## Directory: `src/app/api/dashboard/stats`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |

## Directory: `src/app/api/email/send`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | API interna para envío de correos. Protegida: requiere ser Staff o tener un API_SECRET_KEY (opcional para webhooks externos si se desea) API interna para envío de correos. Protegida: requiere ser Staff/Admin O tener un X-API-KEY válido. |

## Directory: `src/app/api/enrollments`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `dynamic` | Variable | - |
| `OPTIONS` | Function | GET /api/enrollments Returns the list of course IDs that the currently authenticated user has successfully purchased. |
| `GET` | Function | - |

## Directory: `src/app/api/evaluaciones`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `dynamic` | Variable | - |
| `OPTIONS` | Function | - |
| `GET` | Function | - |

## Directory: `src/app/api/evaluation/autosave`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `PATCH` | Function | - |
| `POST` | Function | - |

## Directory: `src/app/api/evaluation/history`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |

## Directory: `src/app/api/evaluation/start`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/evaluation/submit`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/legal/consent`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/levels`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `dynamic` | Variable | - |
| `OPTIONS` | Function | - |
| `GET` | Function | - |

## Directory: `src/app/api/logbook/diary`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `dynamic` | Variable | - |
| `GET` | Function | - |
| `POST` | Function | - |
| `DELETE` | Function | - |

## Directory: `src/app/api/logbook/save-tracking`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/logbook/upload-track`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/membership/portal`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/membership/subscribe`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/module/[id]`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `dynamic` | Variable | - |
| `OPTIONS` | Function | - |
| `GET` | Function | - |

## Directory: `src/app/api/newsletter/subscribe`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/notion/sync`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/peer-review`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |
| `POST` | Function | - |

## Directory: `src/app/api/progress`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `dynamic` | Variable | - |
| `OPTIONS` | Function | - |
| `GET` | Function | - |

## Directory: `src/app/api/progress/unit-read`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `dynamic` | Variable | Registra la lectura de una sección de una unidad (Teoría, Práctica o Errores) y recalcula el progreso de la unidad. |
| `OPTIONS` | Function | - |
| `POST` | Function | - |

## Directory: `src/app/api/progress/update`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `OPTIONS` | Function | - |
| `POST` | Function | - |

## Directory: `src/app/api/skills`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | GET /api/academy/skills Devuelve: - Catálogo completo de 12 habilidades con estado (obtenida/no obtenida) - Rango actual del navegante (Grumete → Capitán) - Progreso hacia el siguiente rango |
| `POST` | Function | POST /api/academy/skills/evaluate Fuerza la evaluación manual de habilidades (útil para testing) Normalmente se ejecuta automáticamente vía trigger |

## Directory: `src/app/api/student/dashboard-stats`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `dynamic` | Variable | - |
| `GET` | Function | - |

## Directory: `src/app/api/student/micro-lecciones`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `dynamic` | Variable | - |
| `GET` | Function | - |

## Directory: `src/app/api/student/skills`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |

## Directory: `src/app/api/student/update-profile`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `POST` | Function | - |

## Directory: `src/app/api/students/me/skills`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |

## Directory: `src/app/api/test_module`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |

## Directory: `src/app/api/unit/[id]`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `dynamic` | Variable | - |
| `OPTIONS` | Function | - |
| `GET` | Function | - |

## Directory: `src/app/api/unlock-status`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `dynamic` | Variable | - |
| `OPTIONS` | Function | - |
| `GET` | Function | - |

## Directory: `src/app/api/user/settings`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `PATCH` | Function | - |

## Directory: `src/app/api/verify/[certificate_number]`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |

## Directory: `src/app/api/weather`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `dynamic` | Variable | - |
| `GET` | Function | - |

## Directory: `src/app/api/webhook`

### route.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GET` | Function | - |
| `POST` | Function | - |

## Directory: `src/components/academy`

### AcademyFeedbackProvider.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `AcademyFeedbackProvider` | Function | AcademyFeedbackProvider - Wrapper component that includes all feedback UI Add this to the root layout to enable academy notifications globally |

### AcademySkeleton.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `AcademySkeleton` | Function | - |

### ActivityTracker.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `ActivityTracker` | Function | - |

### CertificateCard.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `CertificateCard` | Function | - |

### EmptyState.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `EmptyState` | Function | - |

### FeedbackDemo.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `FeedbackDemo` | Function | DEMO: FeedbackDemo - Component to test the feedback system This shows how to integrate the feedback system in your components |

### InteractiveMission.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `InteractiveMission` | Function | - |

### MotivationalMessages.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `MotivationalMessages` | Function | - |

### UnitSkeleton.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `UnitSkeleton` | Function | - |

### UnlockStatusBadge.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `UnlockStatus` | Type Alias | - |
| `UnlockStatusResponse` | Interface | - |
| `UnlockStatusBadge` | Variable | - |
| `LockedContentOverlay` | Variable | - |

## Directory: `src/components/academy/dashboard`

### AchievementsWidget.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `AchievementsWidget` | Function | - |

### ActivityHeatmap.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `ActivityHeatmap` | Function | - |

### BoatMastery.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `BoatMastery` | Function | - |

### CareerAdvisor.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `CareerAdvisor` | Function | - |

### DailyChallengeWidget.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `DailyChallengeWidget` | Function | - |

### LeafletMap.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `LeafletMap` | Function | - |

### NauticalRadar.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `NauticalRadar` | Function | - |

### NavigationExperienceMap.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `NavigationExperienceMap` | Function | - |

### RadarHistoryModal.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `RadarHistoryModal` | Function | - |

### SkillRadar.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `SkillRadar` | Function | - |

## Directory: `src/components/academy/evaluation`

### CooldownScreen.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `CooldownScreen` | Function | - |

### EvaluationContainer.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `EvaluationContainer` | Function | Contenedor principal de evaluaciones que orquestra el flujo completo usando el hook useEvaluation. |

### index.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `SimpleEvaluation` | Re-export | Re-exports default |
| `EvaluationContainer` | Re-export | Re-exports default |
| `CooldownScreen` | Re-export | Re-exports default |
| `QuizView` | Re-export | Re-exports default |
| `ResultScreen` | Re-export | Re-exports default |
| `useEvaluation` | Re-export | Re-exports useEvaluation |
| `Question` | Re-export | Re-exports Question |
| `EvaluationResult` | Re-export | Re-exports EvaluationResult |
| `EvaluationState` | Re-export | Re-exports EvaluationState |
| `BlockReason` | Re-export | Re-exports BlockReason |
| `BlockInfo` | Re-export | Re-exports BlockInfo |

### QuizView.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `QuizView` | Function | - |

### ResultScreen.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `ResultScreen` | Function | - |

### SimpleEvaluation.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `SimpleEvaluation` | Function | Componente simplificado listo para usar en cualquier página. Maneja automáticamente todos los estados incluyendo bloqueos. Puede recibir: 1. evaluacionId directo 2. entidadTipo + entidadId para buscar la evaluación automáticamente @example <SimpleEvaluation entidadTipo="unidad" entidadId={unidad.id} titulo="Quiz: Seguridad en el Mar" on Complete={() => router.push('/dashboard')} /> |

### types.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `DetailedResult` | Interface | - |
| `EvaluationResult` | Interface | - |
| `QuestionOption` | Interface | - |
| `Question` | Interface | - |
| `BlockReason` | Type Alias | - |
| `BlockInfo` | Interface | - |
| `EvaluationState` | Interface | - |

### useEvaluation.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `useEvaluation` | Function | - |

## Directory: `src/components/academy/gamification`

### RankProgress.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `RankProgress` | Function | - |

## Directory: `src/components/academy/geospatial`

### WaterDemo.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `WaterDemo` | Variable | - |

## Directory: `src/components/academy/interactive`

### Flashcard.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `Flashcard` | Function | - |

### FlashcardGame.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `FlashcardGame` | Function | - |

### KnotViewer.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `KnotViewer` | Function | - |

## Directory: `src/components/academy/interactive-engine`

### InteractiveMission.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `InteractiveMission` | Variable | - |

### MissionCanvas.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `MissionCanvas` | Variable | - |

### MissionFactory.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `MissionFactory` | Variable | - |

### MissionFeedback.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `MissionFeedback` | Variable | - |

### MissionHeader.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `MissionHeader` | Variable | - |

### MissionRegistry.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `MISSION_REGISTRY` | Variable | - |
| `getMissionComponent` | Variable | - |

### store.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `MissionStatus` | Type Alias | - |
| `FeedbackType` | Type Alias | - |
| `useMissionStore` | Variable | - |

### types.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `MissionStatus` | Type Alias | - |
| `MissionType` | Type Alias | - |
| `MissionData` | Interface | - |
| `MissionState` | Interface | - |
| `MissionActions` | Interface | - |

## Directory: `src/components/academy/interactive-engine/missions`

### HotspotMission.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `HotspotMission` | Variable | - |

### InventoryMission.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `InventoryMission` | Variable | - |

### KnotMission.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `KnotMission` | Variable | - |

### SimulatorEmbedMission.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `SimulatorEmbedMission` | Variable | - |

### TacticalScenarioMission.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `TacticalScenarioMission` | Variable | - |

## Directory: `src/components/academy/logbook`

### FleetMastery.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `FleetMastery` | Function | - |

### LeafletLogbookMap.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `LeafletLogbookMap` | Function | - |

### Logbook.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `Logbook` | Function | - |

### LogbookMap.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `LogbookMap` | Function | - |

## Directory: `src/components/academy/montessori`

### BoatDiagram.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `BoatDiagram` | Function | - |

### NomenclatureActivity.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `NomenclatureActivity` | Function | - |

## Directory: `src/components/academy/navigation`

### ConstellationMap.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `ConstellationMap` | Function | - |

## Directory: `src/components/academy/nomenclature`

### NomenclatureLesson.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `NomenclatureLesson` | Function | - |

### ThreePartCard.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `ThreePartCard` | Function | - |

## Directory: `src/components/academy/notifications`

### AchievementToast.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `AchievementToast` | Function | - |

### JourneyCompletionModal.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `JourneyCompletionModal` | Function | - |

### NotificationContainer.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `NotificationContainer` | Function | - |

### PushNotificationInitializer.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `PushNotificationInitializer` | Function | - |

### RealtimeNotifications.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `RealtimeNotifications` | Function | - |

### SafetyMonitor.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `SafetyMonitor` | Function | - |

### SkillUnlockedModal.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `SkillUnlockedModal` | Function | - |

## Directory: `src/components/academy/peer-review`

### PeerReviewDashboard.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `PeerReviewDashboard` | Function | - |

### RubricForm.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `RubricCriterion` | Interface | - |
| `RubricForm` | Function | - |

### SubmissionViewer.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `SubmissionViewer` | Function | - |

## Directory: `src/components/academy/sailing-simulator`

### AudioManager.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `AudioManager` | Class | - |

### BoatModel.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `BoatModel` | Class | - |

### BoatPhysics.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `BoatState` | Interface | - |
| `BoatPhysics` | Class | - |

### EnvironmentManager.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `EnvironmentManager` | Class | - |

### EventManager.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `EventState` | Interface | - |
| `EventManager` | Class | - |

### FloatingTextManager.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `FloatingTextManager` | Class | - |

### HUDManager.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `HUDManager` | Class | - |

### InputController.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `InputController` | Class | - |

### ObjectiveManager.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `ObjectiveState` | Interface | - |
| `ObjectiveManager` | Class | - |

### RendererSetup.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `RendererContext` | Interface | - |
| `RendererSetup` | Class | - |

### ResizeHandler.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `ResizeHandler` | Class | - |

### SailingSimulator.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `SailingSimulator` | Variable | SailingSimulator v2 (Optimized) This component acts as a bridge between the browser DOM/Inputs and the Web Worker where the 3D engine (Three.js) and Physics run. |

### ScoringManager.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `ScoreEntry` | Interface | - |
| `ScoringManager` | Class | - |

### SimulatorSkeleton.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `SimulatorSkeleton` | Variable | - |

### WakeManager.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `WakeManager` | Class | - |

### WindEffectManager.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `WindEffectManager` | Class | - |

### WindManager.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `ApparentWind` | Interface | - |
| `WindManager` | Class | - |

## Directory: `src/components/academy/simulation`

### WindTunnel.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `WindTunnel` | Function | - |

## Directory: `src/components/academy/simulation/wind-tunnel`

### types.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `Vector2D` | Interface | - |
| `WindPhysicsState` | Interface | - |
| `PhysicsDifficulty` | Type Alias | - |

### WindTunnel.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `WindTunnel` | Variable | - |

## Directory: `src/components/academy/simulation/wind-tunnel/hooks`

### useWindPhysics.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `useWindPhysics` | Function | Hook to manage the physics engine. Returns: - physicsState: Mutable Ref to the current state (Use this for 60fps Canvas drawing) - setSailAngle: Function to update control input - setWindDirection: Function to update environment input - resetPhysics: Function to reset state - runPhysicsStep: Function to be called inside requestAnimationFrame |

## Directory: `src/components/academy/simulation/wind-tunnel/layers`

### ParticleSystem.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `ParticleSystem` | Variable | - |

### WaterBackground.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `WaterBackground` | Variable | - |

## Directory: `src/components/academy/simulation/wind-tunnel/physics`

### aeroModel.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `getLiftCoefficient` | Function | Calculates the Lift Coefficient (Cl) based on Angle of Attack (AoA). AoA is in degrees. Cl is dimensionless (typically 0.0 - 2.0). |
| `getDragCoefficient` | Function | Calculates the Drag Coefficient (Cd) based on AoA and Cl. Drag = Parasitic + Induced. |
| `detectLuffing` | Function | - |
| `detectStall` | Function | - |

### angleUtils.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `deg2rad` | Function | Converts degrees to radians |
| `rad2deg` | Function | Converts radians to degrees |
| `normalizeAngle360` | Function | Normalizes an angle to [0, 360) range. Useful for compass headings. |
| `normalizeAngle180` | Function | Normalizes an angle to [-180, 180] range. Useful for relative angles (like AWA or rudder angle). |
| `angleDifference` | Function | Calculates the smallest difference between two angles. Returns value in range [-180, 180]. Positive means 'target' is clockwise from 'source'. |

### constants.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `PHYSICS_CONSTANTS` | Variable | - |
| `PHYSICS_TOLERANCE` | Variable | - |

### forceModel.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `resolveForces` | Function | Resolves the Lift and Drag forces into Drive (Forward) and Heel (Side) components. Coordinate System: - AWA: 0 degrees = Forward. positive = right (starboard). - Lift: Perpendicular to AWA (L - 90). - Drag: Parallel to AWA. |

### physicsStep.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `stepPhysics` | Function | Executes one physics update step (typically 60fps). Pure function: takes current state + dt, returns new state. |

### vectorUtils.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `polarToCartesian` | Function | Converts polar coordinates to Cartesian vector. 0 degrees = North (Up, -Y), 90 degrees = East (Right, +X) This aligns with navigation convention but swaps standard trig Y axis. |
| `cartesianToPolar` | Function | Converts Cartesian vector to polar coordinates. Returns angle in degrees [0, 360). |
| `addVectors` | Function | Adds two vectors |
| `subtractVectors` | Function | Subtracts v2 from v1 |

## Directory: `src/components/academy/tools/ChartPlotter`

### ChartCanvas.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `ChartCanvas` | Function | - |

### DividerTool.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `DividerTool` | Function | - |

### ParallelRuler.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `ParallelRuler` | Function | - |

## Directory: `src/components/academy/wind-lab`

### WindLabContainer.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `WindLabContainer` | Variable | - |

## Directory: `src/components/academy/wind-lab/audio`

### AudioEngine.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `WindLabAudio` | Class | - |

## Directory: `src/components/academy/wind-lab/controls`

### CompassDial.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `CompassDial` | Variable | - |

### HoloDashboard.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `HoloDashboard` | Variable | - |

### HydraulicWinch.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `HydraulicWinch` | Variable | - |

### Tooltip.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `Tooltip` | Variable | Lightweight Tooltip component Shows a message on hover with a fade-in animation. |

## Directory: `src/components/academy/wind-lab/hooks`

### useWindLabAudio.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `useWindLabAudio` | Variable | - |

### useWindLabPhysics.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `useWindLabPhysics` | Variable | - |

## Directory: `src/components/academy/wind-lab/physics`

### PhysicsEngine.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `WindLabState` | Interface | - |
| `DerivedPhysics` | Interface | - |
| `PhysicsEngine` | Class | - |

## Directory: `src/components/academy/wind-lab/visuals`

### GhostBoatOverlay.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GhostBoatOverlay` | Variable | - |

### ParticleSystemCanvas.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `ParticleSystemCanvas` | Variable | - |

### SeaSurfaceCanvas.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `SeaSurfaceCanvas` | Variable | - |

### TrimFeedback.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `TrimFeedback` | Variable | - |

### VectorVisionOverlay.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `VectorVisionOverlay` | Variable | - |

## Directory: `src/components/auth`

### GoogleAuthButton.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `GoogleAuthButton` | Function | - |

### LoginForm.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `LoginForm` | Function | - |

### LogoutButton.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `LogoutButton` | Function | - |

### RegisterForm.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `RegisterForm` | Function | - |

## Directory: `src/components/booking`

### BookingSelector.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `BookingSelector` | Function | - |

## Directory: `src/components/courses`

### CourseCard.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `CourseCard` | Function | - |

### CourseFilters.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `CourseFilters` | Function | - |

### CoursesListClient.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `CoursesListClient` | Function | - |

## Directory: `src/components/dashboard`

### NotificationPermissionBanner.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `NotificationPermissionBanner` | Function | - |

## Directory: `src/components/experiences`

### ExperienceCard.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `ExperienceCard` | Function | - |

### ExperiencesClient.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `ExperiencesClient` | Function | - |

## Directory: `src/components/home`

### ExperienceSection.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `ExperienceSection` | Function | - |

### FeaturesSection.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `FeaturesSection` | Function | - |

### HeroCarousel.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `HeroCarousel` | Function | - |

### ProgramsSection.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `ProgramsSection` | Function | - |

### StatsSection.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `StatsSection` | Function | - |

## Directory: `src/components/instructor`

### IncidentReportModal.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `IncidentReportModal` | Function | - |

### InstructorClient.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `InstructorClient` | Function | - |

## Directory: `src/components/layout`

### AcademyControls.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `AcademyControls` | Function | - |

### ConditionalLayout.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `ConditionalLayout` | Function | - |

### Footer.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `Footer` | Function | - |

### MobileBottomNav.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `MobileBottomNav` | Function | - |

### Navbar.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `Navbar` | Function | - |

## Directory: `src/components/rental`

### RentalCard.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `RentalCard` | Function | - |

### RentalClient.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `RentalClient` | Function | - |

## Directory: `src/components/shared`

### AccessibleModal.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `AccessibleModal` | Function | Modal accesible de alto nivel con Focus Trap, ARIA roles y cierre por teclado. Renderizado vía Portal para evitar saltos de layout. |

### ContactForm.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `ContactForm` | Function | - |

### JsonLd.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `JsonLd` | Function | - |

### LegalConsentModal.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `LegalConsentModal` | Function | - |

### NativeAppRedirect.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `NativeAppRedirect` | Function | - |

### Newsletter.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `Newsletter` | Function | - |

### ScrollToTop.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `ScrollToTop` | Function | - |

### StaggeredEntrance.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `StaggeredEntrance` | Function | - |

### StatusToast.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `StatusToast` | Function | - |

### WeatherPremium.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `WeatherPremium` | Function | - |

## Directory: `src/components/staff`

### AcademicTab.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `AcademicTab` | Function | - |

### AcademyStaffTab.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `AcademyStaffTab` | Function | - |

### ActivityListClient.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `ActivityListClient` | Function | - |

### BITab.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `BITab` | Function | - |

### BoatsTab.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `BoatsTab` | Function | - |

### CalendarView.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `CalendarView` | Function | - |

### CommunicationTab.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `CommunicationTab` | Function | - |

### CoursesTab.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `CoursesTab` | Function | - |

### DataExplorerTab.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `DataExplorerTab` | Function | - |

### DriveExplorerTab.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `DriveExplorerTab` | Function | - |

### FinancialReportsClient.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `FinancialReportsClient` | Function | - |

### MaintenanceModal.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `MaintenanceModal` | Function | - |

### OverviewTab.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `OverviewTab` | Function | - |

### RentalsTab.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `RentalsTab` | Function | - |

### SessionDetailModal.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `SessionDetailModal` | Function | - |

### SessionsSkeleton.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `SessionsSkeleton` | Function | - |

### SessionsTab.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `Session` | Interface | - |
| `SessionsTab` | Function | - |

### StaffActivityContainer.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `StaffActivityContainer` | Function | - |

### StaffClient.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `StaffClient` | Function | - |

### StaffMgmtTab.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `StaffMgmtTab` | Function | - |

### StaffShared.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `ClientDate` | Variable | - |
| `WindGauge` | Variable | - |
| `StaffProfile` | Interface | - |

## Directory: `src/components/staff/marketing`

### CampaignManager.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `CampaignManager` | Function | - |

## Directory: `src/components/student`

### BonoPurchaseModal.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `BonoPurchaseModal` | Function | - |

### BonosWallet.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `BonosWallet` | Function | - |

### DailyChallengeWidget.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `DailyChallengeWidget` | Function | - |

### DailyNauticalQuote.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `DailyNauticalQuote` | Function | - |

### DashboardRefresh.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `DashboardRefresh` | Function | - |

### DashboardSkeleton.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `DashboardSkeleton` | Function | - |

### EditProfileModal.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `EditProfileModal` | Function | - |

### MembershipWidget.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `MembershipWidget` | Function | - |

### MicroLeccionesPlayer.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `MicroLeccionesPlayer` | Function | - |

### MicroLeccionesWidget.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `MicroLeccion` | Interface | - |
| `MicroLeccionesWidget` | Function | - |

### MobileCourseDetail.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `MobileCourseDetail` | Function | - |

### MobileCourseList.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `MobileCourseList` | Function | - |

### MobileProfileClient.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `MobileProfileClient` | Function | - |

### MobileRentalList.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `MobileRentalList` | Function | - |

### MobileStudentHub.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `MobileStudentHub` | Function | - |

### QuickContact.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `QuickContact` | Function | - |

### SafetySettingsModal.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `SafetySettingsModal` | Function | - |

### StudentProfileSidebar.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `StudentProfileSidebar` | Function | - |

## Directory: `src/components/tools/ChartPlotter`

### ChartCanvas.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `ChartCanvas` | Function | - |

### DividersTool.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `DividersTool` | Function | - |

### ParallelRuler.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `ParallelRuler` | Function | - |

## Directory: `src/components/ui`

### Breadcrumbs.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `BreadcrumbItem` | Interface | - |
| `Breadcrumbs` | Function | - |

### EmptyState.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `EmptyState` | Function | - |

### NauticalImage.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `NauticalImage` | Function | - |

### SearchableSelect.tsx

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `SearchableSelect` | Function | - |

## Directory: `src/data`

### nauticalQuotes.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `NauticalQuote` | Interface | - |
| `getDailyQuote` | Function | Returns the quote of the day based on the current date. Deterministic: all users see the same quote on the same day. |

## Directory: `src/data/academy`

### nautical-nomenclature.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `NomenclatureCard` | Interface | - |
| `NAUTICAL_TERMS` | Variable | - |

## Directory: `src/hooks`

### useAcademyAccess.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `UnlockStatus` | Type Alias | - |
| `EntityType` | Type Alias | - |
| `UnlockStatusMap` | Interface | - |
| `useAcademyAccess` | Function | - |

### useAcademyData.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `Nivel` | Interface | - |
| `ProgresoNivel` | Interface | - |
| `useAcademyData` | Function | - |

### useAcademyFeedback.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `useAcademyFeedback` | Function | - |
| `useAnimationPreferences` | Function | - |

### useCalendarGrid.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `CalendarDay` | Interface | - |
| `useCalendarGrid` | Function | Hook to generate a 42-cell grid (6 weeks) for a given date. Ensures the grid is always full even if the month starts on a Sunday or ends on a Saturday. |

### useFocusTrap.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `useFocusTrap` | Function | Hook para atrapar el foco dentro de un elemento (Focus Trap) Útil para modales y diálogos siguiendo WCAG. |

### useGeolocation.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `LocationPoint` | Interface | - |
| `useGeolocation` | Function | - |

### usePushNotifications.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `PushNotificationState` | Interface | - |
| `usePushNotifications` | Variable | - |

### useSmartTracker.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `LocationPoint` | Interface | - |
| `useSmartTracker` | Function | - |

### useUnitProgress.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `useUnitProgress` | Function | - |

## Directory: `src/lib`

### api-headers.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `corsHeaders` | Function | - |
| `withCors` | Function | - |

### api.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `getApiBaseUrl` | Variable | - |
| `apiUrl` | Variable | - |

### auth-guard.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `UserRole` | Type Alias | - |
| `checkAuth` | Function | - |
| `requireAuth` | Function | - |
| `requireAdmin` | Function | - |
| `requireInstructor` | Function | - |

### email-templates.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `welcomeTemplate` | Variable | Plantilla de bienvenida para nuevos usuarios registrados. |
| `inscriptionTemplate` | Variable | Confirmación de inscripción a un curso presencial u online. |
| `certificateTemplate` | Variable | Notificación de obtención de certificado tras completar un curso. |
| `rentalTemplate` | Variable | Confirmación de reserva de alquiler de material o embarcación. |
| `membershipTemplate` | Variable | Confirmación de suscripción a la membresía de socio. |
| `contactNotificationTemplate` | Variable | Notificación interna para el equipo de la escuela cuando se recibe un nuevo mensaje de contacto. |
| `internalOrderNotificationTemplate` | Variable | Notificación interna para el equipo cuando hay una nueva venta o reserva. |

### euskalmet.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateEuskalmetToken` | Function | - |
| `fetchEuskalmetStationData` | Function | - |
| `fetchEuskalmetAlerts` | Function | - |

### external-logger.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `logToExternalWebhook` | Function | Utility to log events to an external webhook (e.g., n8n, Google Sheets) |

### google-calendar.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `createGoogleEvent` | Function | - |
| `updateGoogleEvent` | Function | - |
| `deleteGoogleEvent` | Function | - |
| `createRentalGoogleEvent` | Function | - |
| `listGoogleEvents` | Function | - |

### google-drive.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `listFiles` | Function | - |
| `getFileInfo` | Function | - |

### platform.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `getPlatform` | Variable | Utility to identify the current platform and handle base URLs |
| `getApiUrl` | Variable | Gets the correct API URL depending on the platform. For Native (Android/iOS), it must be the absolute production URL. For Web, it can be relative or based on the current domain. |
| `platformSelect` | Variable | Helper to conditionally execute logic or return styles based on platform |

### resend.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `resend` | Variable | - |
| `DEFAULT_FROM_EMAIL` | Variable | - |

### stripe.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `stripe` | Variable | - |

### weather.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `WeatherData` | Interface | - |
| `fetchWeatherData` | Function | - |

## Directory: `src/lib/academy`

### boat-parts-data.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `BoatPart` | Interface | - |
| `BOAT_PARTS` | Variable | - |

### enrollment.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `getUserEnrollments` | Function | Returns a list of course IDs that the user has successfully purchased. @param userId - The user's profile ID (UUID). @returns Array of course IDs (UUIDs). |
| `verifyCourseAccess` | Function | Verifies if a user has access to a specific course by its slug. @param userId - The user's profile ID. @param courseSlug - The unique slug of the course. @returns boolean - true if access is granted. |
| `verifyModuleAccess` | Function | Verifies if a user has access to a specific module. Access is granted if the user owns the parent Course OR if it's unlocked via progress. @param userId - The user's profile ID. @param moduleId - The UUID of the module. @returns boolean - true if access is granted. |
| `verifyUnitAccess` | Function | Verifies if a user has access to a specific unit. Access is granted if the user owns the grandparent Course OR if it's unlocked via progress. @param userId - The user's profile ID. @param unitId - The UUID of the unit. @returns boolean - true if access is granted. |

### flashcards-data.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `FlashcardData` | Interface | - |
| `FLASHCARDS_DATA` | Variable | - |

### knots-data.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `KnotStep` | Interface | - |
| `Knot` | Interface | - |
| `KNOTS_DATA` | Variable | - |

### motivational-messages.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `MOTIVATIONAL_MESSAGES` | Variable | - |
| `getMotivationalMessage` | Function | - |
| `getStreakMessage` | Function | - |

### weather-service.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `TideEvent` | Interface | - |
| `WeatherData` | Interface | - |
| `ConditionAlert` | Interface | - |
| `WeatherService` | Variable | - |

## Directory: `src/lib/certificates`

### pdfGenerator.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateCertificatePDF` | Variable | Genera un PDF de certificado profesional A4 Horizontal |

## Directory: `src/lib/data`

### experiences.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `Experiencia` | Interface | - |
| `ExperienciaTipo` | Type Alias | - |
| `getTipoLabel` | Function | - |
| `getExperienciaName` | Function | - |
| `getExperienciaDescription` | Function | - |
| `formatExperienciaPrice` | Function | - |
| `fetchExperiencias` | Function | - |
| `fetchExperienciaBySlug` | Function | - |
| `groupExperienciasByTipo` | Function | - |

## Directory: `src/lib/gamification`

### AchievementEngine.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `AchievementContext` | Interface | Lightweight Achievement Engine Purpose: Evaluate mission results against a set of rules to unlock achievements. Design: Pure functions, Rule-based, Extensible. |
| `AchievementRule` | Interface | - |
| `evaluateAchievements` | Function | Evaluates all rules against the provided context and returns unlocked achievement IDs. This function is pure and does not trigger side effects (notifications/DB saves). |
| `checkAchievements` | Variable | Legacy wrapper for compatibility with existing code. Adapts simple arguments to the new Context interface. |

### ranks.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `Rank` | Type Alias | - |
| `RANKS` | Variable | - |
| `getRank` | Function | - |
| `getNextRank` | Function | - |
| `calculateEstimatedXP` | Function | - |

## Directory: `src/lib/geospatial`

### water-check.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `isPointInWater` | Function | - |
| `validateBoatPosition` | Function | Simplifies a location check for the sailing simulator or logbook. Returns true if the position is safe for sailing (in water). |

## Directory: `src/lib/logbook`

### pdfReportGenerator.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateLogbookReportPDF` | Variable | Genera un Resumen de Horas de Navegación Profesional |

## Directory: `src/lib/marketing`

### automation-service.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `processMarketingAutomations` | Function | - |

## Directory: `src/lib/safety`

### NuclearAlertSystem.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `NuclearAlertSystem` | Class | - |
| `nuclearAlert` | Variable | - |

## Directory: `src/lib/security`

### rate-limit.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `rateLimit` | Function | Checks if a key has exceeded the rate limit. @param key - Unique identifier (Employee ID, IP, etc.) @param limit - Max requests allowed @param windowSeconds - Time window in seconds @returns { success: boolean, remaining: number, reset: number } |

## Directory: `src/lib/store`

### useAcademyMode.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `useAcademyMode` | Variable | - |

### useMultiplayerStore.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `useMultiplayerStore` | Variable | - |

### useNotificationStore.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `NotificationType` | Type Alias | - |
| `Notification` | Interface | - |
| `useNotificationStore` | Variable | - |

### useSafetySettingsStore.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `useSafetySettingsStore` | Variable | - |

## Directory: `src/lib/stripe`

### webhook-handlers.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `StripeHandlers` | Class | - |

## Directory: `src/lib/supabase`

### admin.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `createAdminClient` | Function | - |

### client.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `createClient` | Function | - |

### server.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `createClient` | Function | - |

## Directory: `src/lib/utils`

### date.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `getSpainTimeInfo` | Function | Utility to handle date and time in Spain timezone. |
| `getInitialBookingDate` | Function | Calculates the initial display date for booking. If it's late (past 17:00), it returns tomorrow. |
| `calculateEndTime` | Function | Calculates end time string given start time HH:mm and duration in hours. |

### financial.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `parseAmount` | Function | Utility to parse currency/amount strings into numbers. Handles both dot and comma as decimal separators. |

### pdf.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `generateCertificatePDF` | Variable | - |

### validators.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `DocumentType` | Type Alias | Tipos de documentos de identidad soportados. |
| `validateIdentityDocument` | Function | Valida un documento de identidad según su tipo. |
| `validateEmail` | Function | Valida una dirección de correo electrónico. |

## Directory: `src/types`

### bonos.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `NivelSocio` | Type Alias | - |
| `EstadoBono` | Type Alias | - |
| `TipoMovimientoBono` | Type Alias | - |
| `TipoBono` | Interface | - |
| `BonoUsuario` | Interface | - |
| `MovimientoBono` | Interface | - |
| `PerfilSocio` | Interface | - |

### competition.ts

| Export Name | Type | Description |
| :--- | :--- | :--- |
| `RaceLobby` | Interface | - |
| `RaceParticipant` | Interface | - |
| `SerializedVector3` | Interface | - |
| `MultiplayerBoatState` | Interface | - |
