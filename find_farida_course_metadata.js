
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

async function findCourseSession() {
    const sessions = await stripe.checkout.sessions.list({ limit: 100 });
    const herSessions = sessions.data.filter(s => s.customer_details?.email === 'faridatransports@gmail.com' && s.status === 'complete');

    console.log(`Found ${herSessions.length} sessions for Farida.`);
    herSessions.forEach(s => {
        console.log(`Session: ${s.id}`);
        console.log(`  Item: ${s.metadata.item_name}`);
        console.log(`  Mode: ${s.metadata.mode}`);
        console.log(`  CourseID: ${s.metadata.course_id}`);
        console.log(`  EditionID: ${s.metadata.edition_id}`);
        console.log(`  Amount: ${s.amount_total / 100}`);
        console.log('---');
    });
}
findCourseSession();
