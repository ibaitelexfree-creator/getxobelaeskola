import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { generateMarketingContent, triggerN8nVideo, MarketingProperty } from '@/lib/marketing/marketing-service';
import axios from 'axios';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// Correct Webhook URL: https://controlmanager.cloud/realstate/api/telegram/webhook/

async function sendTelegram(method: 'sendMessage' | 'sendPhoto', payload: any) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
    try {
        await axios.post(url, payload);
    } catch (error: any) {
        console.error(`Telegram API Error (${method}):`, error.response?.status, error.response?.data || error.message);
        throw error;
    }
}

async function sendTelegramMessage(chatId: number, text: string, replyMarkup?: any) {
    await sendTelegram('sendMessage', {
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
        reply_markup: replyMarkup
    });
}

async function sendTelegramPhoto(chatId: number, photoUrl: string, caption: string, replyMarkup?: any) {
    await sendTelegram('sendPhoto', {
        chat_id: chatId,
        photo: photoUrl,
        caption: caption,
        parse_mode: 'Markdown',
        reply_markup: replyMarkup
    });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('Telegram Webhook received:', JSON.stringify(body));

        if (!body.message && !body.callback_query) {
            return NextResponse.json({ ok: true });
        }

        const chatId = body.message?.chat.id || body.callback_query?.message.chat.id;
        const text = body.message?.text;
        const callbackData = body.callback_query?.data;

        // Handle Start command
        if (text === '/start') {
            await sendTelegramMessage(chatId,
                "🚀 *Welcome to the Real Estate AI Marketing Agent*\n\n" +
                "Use /promote to see the latest properties and launch smart marketing campaigns.\n" +
                "Use /help for a list of available commands."
            );
            return NextResponse.json({ ok: true });
        }

        // Handle Help command
        if (text === '/help') {
            await sendTelegramMessage(chatId,
                "📋 *Available Commands:*\n\n" +
                "/promote - List properties ready for marketing promotion.\n" +
                "/status - Check the status of current video rendering tasks.\n" +
                "/help - Show this list of commands."
            );
            return NextResponse.json({ ok: true });
        }

        // Handle Promote command
        if (text === '/promote') {
            const properties = await sql`SELECT id, title, location FROM properties ORDER BY created_at DESC LIMIT 10`;

            if (properties.length === 0) {
                await sendTelegramMessage(chatId, "No properties available for promotion at the moment.");
                return NextResponse.json({ ok: true });
            }

            const keyboard = {
                inline_keyboard: properties.map(p => ([{
                    text: `🏠 ${p.title} (${p.location})`,
                    callback_data: `promo_${p.id}`
                }]))
            };

            await sendTelegramMessage(chatId, "Select a property to start the promotion:", keyboard);
            return NextResponse.json({ ok: true });
        }

        // Handle Status command
        if (text === '/status') {
            const pendingTasks = await sql`
                SELECT p.title, v.status, v.created_at 
                FROM generated_videos v
                JOIN properties p ON v.property_id = p.id
                WHERE v.status = 'processing'
                ORDER BY v.created_at DESC
                LIMIT 5
            `;

            if (pendingTasks.length === 0) {
                await sendTelegramMessage(chatId, "✅ No pending video tasks. All caught up!");
            } else {
                let statusMsg = "⏳ *Current Video Tasks:*\n\n";
                pendingTasks.forEach(task => {
                    statusMsg += `• *${task.title}*: ${task.status} (Started: ${new Date(task.created_at).toLocaleTimeString()})\n`;
                });
                await sendTelegramMessage(chatId, statusMsg);
            }
            return NextResponse.json({ ok: true });
        }

        // Handle Callback queries (buttons)
        if (callbackData && callbackData.startsWith('promo_')) {
            const propertyId = parseInt(callbackData.split('_')[1]);

            // Notify starting
            await sendTelegramMessage(chatId, "⏳ Generating content and triggering n8n Video Engine...");

            // Fetch property
            const [property] = await sql`SELECT * FROM properties WHERE id = ${propertyId}`;

            if (!property) {
                await sendTelegramMessage(chatId, "Error: Property not found.");
                return NextResponse.json({ ok: true });
            }

            // Map to MarketingProperty
            const marketingProperty: MarketingProperty = {
                id: property.id,
                title: property.title,
                description: property.description || '',
                property_type: property.property_type || 'property',
                location: property.location,
                price: Number(property.price),
                currency: 'AED',
                bedrooms: property.bedrooms || 0,
                bathrooms: property.bathrooms || 0,
                amenities: property.amenities || [],
                photos: property.images || [], // Ensure this maps correctly to 'images' field from DB
                web_url: `${process.env.NEXT_PUBLIC_APP_URL}/properties/${property.id}`
            };

            // Generate content
            const content = await generateMarketingContent(marketingProperty);

            // Trigger n8n
            await triggerN8nVideo(propertyId, chatId);

            // Construct Links
            const webUrl = `${process.env.NEXT_PUBLIC_APP_URL}/properties/${property.id}`;
            const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}`;
            const waUrl = `https://wa.me/447541364266?text=${encodeURIComponent(`Hello! I'm interested in the property: ${property.title} (${webUrl})`)}`;

            // Formatting
            const price_formatted = new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(Number(property.price));

            const resultCaption =
                `✨ *Property Promotion Ready: ${property.title}*\n\n` +
                `💰 *Price:* ${price_formatted}\n` +
                `📍 *Location:* [${property.location}](${mapUrl})\n\n` +
                `🔗 [View details on the website](${webUrl})\n` +
                `💬 [Contact Agent via WhatsApp](${waUrl})\n\n` +
                `🎬 *Status:* Video rendering started via n8n. You will receive an alert once it's ready! 🚀`;

            const publishKeyboard = {
                inline_keyboard: [
                    [{ text: "🚀 Publish to All Networks", callback_data: `publish_${propertyId}` }],
                    [{ text: "📝 Edit in Marketing Dashboard", url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/marketing` }]
                ]
            };

            // Send as Photo if available, otherwise as text
            const firstImage = Array.isArray(property.images) && property.images.length > 0 ? property.images[0] : null;

            if (firstImage) {
                await sendTelegramPhoto(chatId, firstImage, resultCaption, publishKeyboard);
            } else {
                await sendTelegramMessage(chatId, resultCaption, publishKeyboard);
            }

            return NextResponse.json({ ok: true });
        }

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        console.error('Telegram Webhook Error:', error);
        return NextResponse.json({ ok: true }); // Always return OK to Telegram to avoid retries
    }
}
