import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { message, stack, componentStack, url } = body;

        // Basic validation
        if (!message) {
            return NextResponse.json({ error: 'Missing error message' }, { status: 400 });
        }

        const webhookUrl = process.env.GRAFANA_WEBHOOK_URL;

        if (!webhookUrl) {
            // Log locally if no webhook is configured
            console.error('[GlobalErrorBoundary] No GRAFANA_WEBHOOK_URL configured. Error:', message);
            return NextResponse.json({ status: 'logged_locally' });
        }

        // Prepare payload for Grafana
        const payload = {
            message,
            stack,
            componentStack,
            url: url || 'unknown',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
        };

        // Send to Grafana
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error(`[GlobalErrorBoundary] Failed to send to Grafana: ${response.status} ${response.statusText}`);
            return NextResponse.json({ error: 'Failed to send to monitoring service' }, { status: 502 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[GlobalErrorBoundary] Internal API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
