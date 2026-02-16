/**
 * Utility to log events to an external webhook (e.g., n8n, Google Sheets)
 */
export async function logToExternalWebhook(eventType: string, payload: any) {
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

    if (!webhookUrl) {
        // Silent skip if not configured, or log to console
        console.log(`[ExternalLogger] SKIP: No GOOGLE_SHEETS_WEBHOOK_URL defined for event: ${eventType}`);
        return;
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                timestamp: new Date().toISOString(),
                event_type: eventType,
                data: payload,
                environment: process.env.NODE_ENV || 'development'
            }),
        });

        if (!response.ok) {
            console.error(`[ExternalLogger] Error sending to webhook: ${response.statusText}`);
        } else {
            console.log(`[ExternalLogger] Successfully logged ${eventType} to external webhook.`);
        }
    } catch (error) {
        console.error(`[ExternalLogger] Failed to send log to external webhook:`, error);
    }
}
