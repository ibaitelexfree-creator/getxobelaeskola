
require('dotenv').config({ path: '.env' });

const NOTION_TOKEN = process.env.NOTION_TOKEN;

async function testConnection() {
    console.log('🔍 Testing Notion Integration...');

    // 1. Identify the Bot
    try {
        const meRes = await fetch('https://api.notion.com/v1/users/me', {
            headers: { 'Authorization': `Bearer ${NOTION_TOKEN}`, 'Notion-Version': '2022-06-28' }
        });

        if (!meRes.ok) {
            console.error('❌ Auth Failed:', await meRes.text());
            return;
        }

        const me = await meRes.json();
        console.log(`🤖 Bot Identity: "${me.name}" (ID: ${me.id})`);
        console.log(`ℹ️  This is the name you should look for in "Add connections"`);

    } catch (e) {
        console.error('❌ Connection Error:', e.message);
        return;
    }

    // 2. List Accessible Pages
    try {
        console.log('\n📄 Scanning accessible pages...');
        const searchRes = await fetch('https://api.notion.com/v1/search', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${NOTION_TOKEN}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filter: { value: 'page', property: 'object' },
                page_size: 10
            })
        });

        const data = await searchRes.json();

        if (data.results.length === 0) {
            console.log('⚠️  No pages found. The integration is connected but has no page access.');
            console.log('👉 Go to a page in Notion -> ... menu -> Add connections -> Select the bot name above.');
        } else {
            console.log(`✅ Found ${data.results.length} accessible pages:`);
            data.results.forEach(p => {
                const title = p.properties?.title?.title?.[0]?.plain_text ||
                    p.properties?.Name?.title?.[0]?.plain_text ||
                    "Untitled";
                console.log(`   - [${title}] (ID: ${p.id})`);
            });
        }

    } catch (e) {
        console.error('❌ Search Error:', e.message);
    }
}

testConnection();
