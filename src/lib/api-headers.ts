import { NextResponse } from 'next/server';

export function corsHeaders(request: Request) {
    const origin = request.headers.get('origin');

    // In a production environment, you should be more restrictive
    // For now, we allow the main domain and the capacitor address
    const allowedOrigins = [
        'https://getxobelaeskola.cloud',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'capacitor://localhost',
        'https://localhost',
        'http://localhost'
    ];

    const headers: Record<string, string> = {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info',
        'Access-Control-Allow-Credentials': 'true',
    };

    if (origin && allowedOrigins.includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
    } else {
        // If the origin is not allowed or missing, default to the production domain.
        // This ensures that Cross-Origin requests from unauthorized domains are blocked by the browser.
        // Note: Using '*' with Access-Control-Allow-Credentials: true is not allowed.
        headers['Access-Control-Allow-Origin'] = 'https://getxobelaeskola.cloud';
    }

    return headers;
}

export function withCors(response: NextResponse, request: Request) {
    const headers = corsHeaders(request);
    Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
    });
    return response;
}
