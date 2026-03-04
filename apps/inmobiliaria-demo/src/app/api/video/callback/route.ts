import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import axios from 'axios';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function POST(req: NextRequest) {
    try {
        const { propertyId, videoUrl, chatId, status = 'completed', error } = await req.json();

        if (!propertyId) {
            return NextResponse.json({ error: 'propertyId is required' }, { status: 400 });
        }

        // 1. Update generated_videos table
        if (status === 'completed' && videoUrl) {
            await sql`
                UPDATE generated_videos 
                SET video_url = ${videoUrl}, status = 'completed', updated_at = NOW()
                WHERE property_id = ${propertyId} AND status = 'processing'
            `;

            // 2. Update the property itself
            await sql`
                UPDATE properties 
                SET video_url = ${videoUrl}, video_status = 'ready'
                WHERE id = ${propertyId}
            `;
        } else {
            await sql`
                UPDATE generated_videos 
                SET status = 'failed', error_message = ${error || 'Unknown error'}, updated_at = NOW()
                WHERE property_id = ${propertyId} AND status = 'processing'
            `;

            await sql`UPDATE properties SET video_status = 'failed' WHERE id = ${propertyId}`;
        }

        // 3. Notify Telegram if chatId present
        if (chatId && BOT_TOKEN) {
            const [property] = await sql`SELECT title FROM properties WHERE id = ${propertyId}`;
            const title = property?.title || 'Property';

            const message = status === 'completed'
                ? `🎬 *Video Ready!* 🚀\n\nThe cinematic video for *${title}* has been rendered.\n\n🔗 [Watch Video](${videoUrl})`
                : `❌ *Video Failed*\n\nError generating video for *${title}*.\n${error ? `Error: ${error}` : ''}`;

            try {
                await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'Markdown',
                });
            } catch {
                console.error('Telegram notification failed');
            }
        }

        return NextResponse.json({ success: true });

    } catch (err: any) {
        console.error('Video callback error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
