
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

async function findFarida() {
    const sessions = await stripe.checkout.sessions.list({ limit: 20 });
    const s = sessions.data.find(s => s.customer_details?.email === 'faridatransports@gmail.com' || s.metadata?.user_id === '72d8f011-bab5-4f99-b466-d55886d95c47');

    if (s) {
        console.log('ID:', s.id);
        console.log('Email:', s.customer_details?.email);
        console.log('Metadata:', JSON.stringify(s.metadata, null, 2));
        console.log('Amount:', s.amount_total / 100);
        console.log('Created:', new Date(s.created * 1000).toISOString());
    } else {
        console.log('Farida session not found in last 20 sessions.');
    }
}

findFarida().catch(console.error);
