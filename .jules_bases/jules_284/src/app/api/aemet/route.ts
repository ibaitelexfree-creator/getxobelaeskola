
import { NextRequest, NextResponse } from 'next/server';
import { getGetxoForecast, narrateForecast } from '@/lib/aemet';

export const dynamic = 'force-dynamic'; // Always fetch fresh data

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');
    const isNarrated = format === 'narrated';

    const forecast = await getGetxoForecast();

    if (!forecast) {
      return NextResponse.json(
        { error: 'No se pudo obtener la predicción de AEMET.' },
        { status: 503 }
      );
    }

    if (isNarrated) {
      const narrative = narrateForecast(forecast);
      return NextResponse.json({
        narrative,
        location: forecast.nombre,
        date: forecast.prediccion.dia[0]?.fecha
      });
    }

    return NextResponse.json(forecast);
  } catch (error) {
    console.error('AEMET API Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar la solicitud de AEMET.' },
      { status: 500 }
    );
  }
}
