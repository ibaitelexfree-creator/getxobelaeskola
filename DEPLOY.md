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
