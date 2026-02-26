<<<<<<< HEAD
# Deployment Architecture

The Getxo Bela Eskola project follows a split deployment architecture:
1. **Frontend**: Deployed on **Vercel** as a serverless Next.js application.
2. **Backend/Orchestrator**: Deployed on a **VPS (Hostinger)** using Docker and Docker Compose.

---

## 1. Frontend Deployment (Vercel)

The Next.js user interface, API routes designed for serverless execution, and public-facing interactions are hosted on Vercel.

### Prerequisites for Vercel:
1. A Vercel account linked to the GitHub repository.
2. Environment variables from `.env.vercel` configured in the Vercel project settings.

### Vercel Environment Variables:
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `TELEGRAM_BOT_TOKEN`
- `NEXT_PUBLIC_N8N_WEBHOOK_URL`

### Steps for Vercel Deployment:
1. Push changes to the `main` or `master` branch.
2. Vercel automatically detects the Next.js framework (see `vercel.json` for specific config).
3. The build uses the configured environment variables.
4. Ensure no `localhost` fallbacks are present in API headers or URLs, as Vercel runs in a serverless environment.

---

## 2. Backend Deployment (Hostinger VPS)

Background tasks, the orchestrator, Redis, and internal databases are hosted on a reliable VPS setup.

### Prerequisites for VPS:
1. A VPS with **Docker** and **Docker Compose** installed.
2. Traefik (optional but recommended) to manage reverse proxies and SSL.
3. Your `.env.hostinger` securely placed into the server environment.

### Steps for VPS Deployment:
1. Move to your VPS workspace: `cd /opt/getxo-sailing`
2. Prepare the `docker-compose.yml` (ensuring it does not conflict with the Vercel frontend ports if testing locally).
3. Populate the `.env` file on the VPS relying on `.env.hostinger` reference.
4. Run: `docker-compose up -d`

## Monitoring & Troubleshooting
- **Frontend (Vercel)**: Inspect Vercel Logs under the Deployments tab.
- **Backend (VPS)**: `docker logs <container_name> -f` to monitor orchestrator or DB logs.
=======
# Deploy to Production (VPS + Docker)

Your Getxo Sailing School app is configured for a robust VPS deployment using **GitHub Actions**, **Docker Compose**, and **Traefik**.

## Prerequisites

1.  A VPS with **Docker** and **Docker Compose** installed.
2.  **Traefik** set up as a reverse proxy (configured for the `n8n_default` network in this setup).
3.  A GitHub repository with this code.

## GitHub Actions Configuration

You must configure the following **GitHub Secrets** in your repository (Settings -> Secrets and variables -> Actions):

### Infrastructure Secrets
- `VPS_IP`: The IP address of your VPS.
- `VPS_USER`: The SSH username (e.g., `root`).
- `VPS_SSH_KEY`: Your private SSH key.

### App Secrets (Build-Time)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (Used for admin tasks)
- `NEXT_PUBLIC_APP_URL` (e.g., `https://getxobelaeskola.cloud`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `GOOGLE_CALENDAR_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`

## Deployment Steps

1.  **Configure GitHub Secrets**: Add all variables listed above to your GitHub repository.
2.  **VPS Setup**:
    - Create the directory `/opt/getxo-sailing`.
    - Place your `docker-compose.yml` and `.env` (optional, for runtime overrides) in that directory.
    - Ensure the `n8n_default` network exists: `docker network create n8n_default`.
3.  **Push to GitHub**:
    - Commit and push your changes to the `main` or `master` branch.
    - GitHub Actions will automatically build the image, push it to GHCR, and trigger the update on your VPS.

## Monitoring & Troubleshooting

*   **GitHub Actions**: Check the "Actions" tab in your repository for build/deploy status.
*   **VPS Logs**: Check container logs using `docker logs getxo-web -f`.
*   **Health Check**: Visit `https://getxobelaeskola.cloud/api/health` (if implemented) or check the dashboard.

## Security

- All sensitive keys are injected at build time via GitHub Secrets.
- The `SUPABASE_SERVICE_ROLE_KEY` is not exposed to the client.
- SSH access is restricted via the `VPS_SSH_KEY`.
>>>>>>> pr-286
