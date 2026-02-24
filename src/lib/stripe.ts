import Stripe from 'stripe';

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_for_build';

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️ STRIPE_SECRET_KEY is missing in environment variables. Using placeholder for build safety.');
}

export const stripe = new Stripe(STRIPE_KEY, {
    apiVersion: '2024-06-20' as any, // Latest stable for this major version
    typescript: true,
    appInfo: {
        name: 'Getxo Sailing School',
        version: '0.1.0',
    },
});
