import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        // Only initialize if we have the required environment variables
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    // Replace escaped newlines if they exist in the env var
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                }),
            });
            console.log('Firebase Admin Initialized');
        } else {
            console.warn('Firebase Admin skipped: Missing environment variables');
        }
    } catch (error) {
        console.error('Firebase admin initialization error', error);
    }
}

export const firebaseAdmin = admin;
