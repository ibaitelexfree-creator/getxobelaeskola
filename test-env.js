
console.log('NOTION_TOKEN:', process.env.NOTION_TOKEN ? 'Present' : 'Missing');
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Present' : 'Missing');
fetch('https://google.com').then(r => console.log('Fetch ok')).catch(e => console.error('Fetch failed:', e));
