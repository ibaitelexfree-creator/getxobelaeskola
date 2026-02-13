import { resend, DEFAULT_FROM_EMAIL } from './src/lib/resend';
import { welcomeTemplate } from './src/lib/email-templates';

async function testSim() {
    console.log('--- START EMAIL SIMULATION TEST ---');
    if (!resend) {
        console.log('Resend client is NULL (Expected if no API key)');
    } else {
        console.log('Resend client initialized.');
    }

    const html = welcomeTemplate('Test Sailor');
    console.log('Template generated length:', html.length);

    try {
        // This should trigger the simulation log in src/lib/resend.ts if no key
        // Wait, the simulation logic is in the API ROUTE, not the lib client.
        // Let's check src/app/api/email/send/route.ts
    } catch (e) {
        console.error(e);
    }
}

testSim();
