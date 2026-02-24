import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
    if (process.env.NODE_ENV === 'production') {
        console.warn('STRIPE_SECRET_KEY is missing in environment variables. Stripe functionality will be disabled.');
    }
}

export const stripe = new Stripe(stripeKey || 'dummy_key_for_build', {
    apiVersion: '2024-06-20' as any, // Latest stable for this major version
    typescript: true,
    appInfo: {
        name: 'Getxo Sailing School',
        version: '0.1.0',
    },
});
