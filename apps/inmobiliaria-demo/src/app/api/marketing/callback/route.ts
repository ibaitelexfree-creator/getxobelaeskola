import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import axios from 'axios';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function POST(req: NextRequest) {
    try {
        const { propertyId, videoUrl, chatId, status = 'completed', error } = await req.json();

        if (!propertyId || !videoUrl) {
            return NextResponse.json({ error: 'propertyId and videoUrl are required' }, { status: 400 });
        }

        // 1. Update database
        await sql`
      UPDATE generated_videos 
      SET video_url = ${videoUrl}, status = ${status}
      WHERE property_id = ${propertyId} AND status = 'processing'
    `;

        // 2. Notify Telegram if chatId is present
        if (chatId) {
            const property = await sql`SELECT title FROM properties WHERE id = ${propertyId}`;
            const title = property[0]?.title || 'Property';

            const message = status === 'completed'
                ? `🎬 *Video Ready!* 🚀\n\nThe promotional video for *${title}* has been rendered successfully.\n\n🔗 [Watch Video](${videoUrl})`
                : `❌ *Video Rendering Failed*\n\nThere was an error generating the video for *${title}*.\n${error ? `Error: ${error}` : ''}`;

            await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown'
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Marketing callback error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
