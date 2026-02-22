import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.GRAFANA_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error('GRAFANA_WEBHOOK_URL is not set.');
    return NextResponse.json({ error: 'Configuration Error' }, { status: 500 });
  }

  try {
    const body = await req.json();

    // Forward the error payload to Grafana
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Grafana webhook failed with status ${response.status}: ${errorText}`);
      return NextResponse.json({ error: 'Upstream Error' }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing log request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
