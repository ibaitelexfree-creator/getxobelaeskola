# Getxo Bela Eskola - Web Application ⚓

Modern Learning Management and Fleet Administration system for sailing schools.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase Account & Project
- Resend API Key (optional for development)
- Stripe Account (optional for development)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in the required keys (see [Environment Variables](#environment-variables))

### Execution
```bash
npm run dev
```

## 🛠️ Validation & Utilities

We provide several scripts for maintenance and QA located in the `scripts/` directory:

- **`node scripts/db-sanity-check.js`**: Connects to Supabase to audit critical tables for "test" or "simulated" data before production.
- **`node scripts/test-contact.js`**: Validates the end-to-end flow of the contact form API.
- **`npm run build`**: Regular Next.js build script. Ensure it passes without linting/TS errors before deployment.

## 🔑 Environment Variables

The following keys are required for full functionality:

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Required for admin/cleanup scripts (Server-side only) |
| `RESEND_API_KEY` | API Key for transactional emails |
| `ADMIN_EMAIL` | Email address where contact notifications are sent |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Public Key |
| `STRIPE_SECRET_KEY` | Stripe Secret Key |
| `STRIPE_WEBHOOK_SECRET` | Secret for verifying Stripe webhooks |
| `NEXT_PUBLIC_APP_URL` | Base URL of the application (e.g. localhost:3000) |

## 📖 Further Documentation
- [Architecture & Design System](./docs/ARCHITECTURE.md)
- [Security Checklist](./docs/SECURITY_CHECKLIST.md)
- [Technical Debt & TODOs](./docs/TECHNICAL_DEBT.md)
- [QA Report](./QA_REPORT.md)
