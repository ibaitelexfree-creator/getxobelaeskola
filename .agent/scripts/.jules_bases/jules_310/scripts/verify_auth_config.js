
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

console.log('--- Auth Configuration Diagnostic ---');
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('App URL:', process.env.NEXT_PUBLIC_APP_URL);

// Calculate the Callback URL that must be in Google Cloud Console
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const googleRedirectUri = `${supabaseUrl}/auth/v1/callback`;

console.log('\n1. MUST BE IN GOOGLE CLOUD CONSOLE (Authorized redirect URIs):');
console.log('👉', googleRedirectUri);

// Calculate the Redirect URL sent from the app to Supabase
const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000';
const locale = 'es'; // default for test
const appRedirectUrl = `${appUrl}/api/auth/callback?next=/${locale}/student/dashboard`;

console.log('\n2. SHOULD BE IN SUPABASE DASHBOARD (Redirect URLs):');
console.log('👉', `${appUrl}/api/auth/callback`);
console.log('👉', 'http://localhost:3000/api/auth/callback (for local development)');

console.log('\n3. REDIRECT URI CURRENTLY BEING SENT:');
console.log('👉', appRedirectUrl);

console.log('\n--- Action Required ---');
if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co')) {
    console.log('❌ ERROR: Supabase URL looks invalid.');
} else {
    console.log('✅ Supabase URL format looks correct.');
}

if (process.env.NEXT_PUBLIC_APP_URL?.includes('localhost') && !process.env.NEXT_PUBLIC_APP_URL.includes('3000')) {
    console.log('⚠️ WARNING: Localhost URL might be missing a port.');
}
