import Stripe from 'stripe';

export const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: '2024-06-20' as any, // Latest stable for this major version
          typescript: true,
          appInfo: {
              name: 'Getxo Sailing School',
              version: '0.1.0',
          },
      })
    : null;
