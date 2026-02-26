import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = secretKey ? new Stripe(secretKey, {
    apiVersion: '2024-06-20' as any, // Latest stable for this major version
    typescript: true,
    appInfo: {
        name: 'Getxo Getxo Bela Eskola',
        version: '0.1.0',
    },
}) : null;

if (!stripe && process.env.NODE_ENV === 'production') {
    console.warn('STRIPE_SECRET_KEY is missing in production environment variables');
}
