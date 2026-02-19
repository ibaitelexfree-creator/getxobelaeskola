
const Stripe = require('stripe');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envLocalPath = path.join(process.cwd(), '.env.local');
    const envPath = path.join(process.cwd(), '.env');
    let content = '';
    if (fs.existsSync(envLocalPath)) content = fs.readFileSync(envLocalPath, 'utf8');
    else if (fs.existsSync(envPath)) content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) process.env[key.trim()] = valueParts.join('=').trim().replace(/^"(.*)"$/, '$1');
    });
}
loadEnv();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function checkRecentSessions() {
    console.log('Checking recent Stripe checkout sessions...');
    const sessions = await stripe.checkout.sessions.list({
        limit: 10,
        expand: ['data.line_items']
    });

    const relevant = sessions.data.map(s => ({
        id: s.id,
        email: s.customer_details?.email,
        status: s.status,
        payment_status: s.payment_status,
        metadata: s.metadata,
        amount: s.amount_total / 100,
        created: new Date(s.created * 1000).toISOString()
    }));

    console.log(JSON.stringify(relevant, null, 2));

    // Find the one for Farida
    const faridaSession = relevant.find(s => s.email === 'faridatransports@gmail.com' || s.metadata.user_id === '72d8f011-bab5-4f99-b466-d55886d95c47');
    if (faridaSession) {
        console.log('\n--- FOUND SESSION FOR FARIDA ---');
        console.log(JSON.stringify(faridaSession, null, 2));
    }
}

checkRecentSessions().catch(console.error);
