import { NextResponse } from 'next/server';

export function corsHeaders(request: Request) {
    const origin = request.headers.get('origin');

    const allowedOrigins = [
        'https://getxobelaeskola.cloud',
        'https://getxobelaeskola.vercel.app',
        'capacitor://localhost',
        ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://localhost', 'http://localhost'] : [])
    ];

    const headers: Record<string, string> = {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info',
        'Access-Control-Allow-Credentials': 'true',
    };

    if (origin && allowedOrigins.includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
    } else {
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
