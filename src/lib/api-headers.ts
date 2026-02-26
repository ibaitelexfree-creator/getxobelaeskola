import { NextResponse } from 'next/server';

export function corsHeaders(request: Request) {
    const origin = request.headers.get('origin');

<<<<<<< HEAD
    const allowedOrigins = [
        'https://getxobelaeskola.cloud',
        'https://getxobelaeskola.vercel.app',
        'capacitor://localhost',
        ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://localhost', 'http://localhost'] : [])
=======
    // In a production environment, you should be more restrictive
    // For now, we allow the main domain and the capacitor address
    const allowedOrigins = [
        'https://getxobelaeskola.cloud',
        'http://localhost:3000',
        'capacitor://localhost',
        'https://localhost',
        'http://localhost'
>>>>>>> pr-286
    ];

    const headers: Record<string, string> = {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info',
        'Access-Control-Allow-Credentials': 'true',
    };

    if (origin && allowedOrigins.includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
<<<<<<< HEAD
    } else {
        headers['Access-Control-Allow-Origin'] = 'https://getxobelaeskola.cloud';
=======
    } else if (!origin) {
        // If no origin (Server to Server or similar), allow all
        headers['Access-Control-Allow-Origin'] = '*';
    } else {
        // For development and simplicity, we can allow the current origin if it's localhost
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            headers['Access-Control-Allow-Origin'] = origin;
        } else {
            // Default to production domain
            headers['Access-Control-Allow-Origin'] = 'https://getxobelaeskola.cloud';
        }
>>>>>>> pr-286
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
