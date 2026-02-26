const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env');
console.log('Checking .env file at:', envPath);

if (!fs.existsSync(envPath)) {
    console.error('.env file does not exist!');
    process.exit(1);
}

const content = fs.readFileSync(envPath, 'utf8');
console.log('.env content length:', content.length);
console.log('First 20 chars of .env:', JSON.stringify(content.substring(0, 20)));

const result = dotenv.config();

if (result.error) {
    console.error('Error loading .env with dotenv:', result.error);
} else {
    console.log('Successfully loaded .env with dotenv');
}

console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 'undefined');
console.log('APP_URL:', process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'undefined');
