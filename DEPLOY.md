# Deploy to Production

Your Getxo Sailing School app is ready for deployment. We recommend **Vercel** as it is the native platform for Next.js.

## Prerequisites

1.  A GitHub repository with this code.
2.  A [Vercel Account](https://vercel.com/signup).
3.  A [Supabase Project](https://supabase.com).

## Environment Variables

You must configure the following environment variables in your Vercel Project Settings:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_public_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Deployment Steps

1.  **Push to GitHub**:
    ```bash
    git add .
    git commit -m "Ready for deploy"
    git push origin main
    ```

2.  **Connect to Vercel**:
    *   Go to Vercel Dashboard -> "Add New..." -> "Project".
    *   Import your GitHub repository.
    *   Vercel will detect Next.js automatically.

3.  **Configure Environment**:
    *   Paste the variables from above into the "Environment Variables" section.

4.  **Deploy**:
    *   Click "Deploy".
    *   Wait for the build to complete.

## Post-Deployment

*   **Custom Domain**: Go to Settings -> Domains and add `getxosailing.com` (or your domain).
*   **Supabase Auth**: Update your "Site URL" and "Redirect URLs" in Supabase Auth settings to match your production domain.
    *   Site URL: `https://your-domain.com`
    *   Redirect URLs: `https://your-domain.com/auth/callback`, `https://your-domain.com/**`
*   **Stripe Webhooks**: Update your webhook endpoint in Stripe Dashboard to `https://your-domain.com/api/webhook`.

## Troubleshooting

*   **Build Errors**: Check the "Build Logs" in Vercel. Common issues are TypeScript errors (we have `ignoreBuildErrors: true` so this should be fine) or missing env vars.
*   **500 Errors**: Check the "Runtime Logs". Usually related to database connection or API keys.

## Performance

The app is configured with `vercel.json` to cache static assets (images) for 1 year. The sitemap and robots.txt are automatically generated.
