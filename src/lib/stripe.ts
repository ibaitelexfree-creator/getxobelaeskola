<<<<<<< HEAD
import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = secretKey ? new Stripe(secretKey, {
    apiVersion: '2024-06-20' as any, // Latest stable for this major version
    typescript: true,
    appInfo: {
        name: 'Getxo Sailing School',
        version: '0.1.0',
    },
}) : null;

if (!stripe && process.env.NODE_ENV === 'production') {
    console.warn('STRIPE_SECRET_KEY is missing in production environment variables');
}
=======
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is missing in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20' as any, // Latest stable for this major version
    typescript: true,
    appInfo: {
        name: 'Getxo Sailing School',
        version: '0.1.0',
    },
});
>>>>>>> pr-286
