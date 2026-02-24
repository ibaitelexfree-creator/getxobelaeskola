
// Types for AEMET API Responses

export interface AemetResponseWrapper {
  descripcion: string;
  estado: number;
  datos: string; // The URL to fetch the actual data
  metadatos: string;
}

export interface PeriodValue {
  value: string | number;
  periodo: string;
  descripcion?: string;
}

export interface WindValue {
  direccion: string;
  velocidad: number;
  periodo: string;
}

export interface DayForecast {
  fecha: string; // YYYY-MM-DD
  probPrecipitacion: PeriodValue[];
  cotaNieveProv: PeriodValue[];
  estadoCielo: PeriodValue[];
  viento: WindValue[];
  rachaMax: PeriodValue[];
  temperatura: {
    maxima: number;
    minima: number;
    dato?: number;
  };
  sensTermica: {
    maxima: number;
    minima: number;
    dato?: number;
  };
  humedadRelativa: {
    maxima: number;
    minima: number;
    dato?: number;
  };
  uvMax?: number;
}

export interface MunicipalityForecast {
  origen: {
    productor: string;
    web: string;
    enlace: string;
    language: string;
    copyright: string;
    notaLegal: string;
  };
  elaborado: string;
  nombre: string;
  provincia: string;
  prediccion: {
    dia: DayForecast[];
  };
  id: number | string;
  version: number;
}

const GETXO_CODE = '48044'; // Getxo, Bizkaia

/**
 * Fetches data from AEMET using the 2-step process (Metadata -> Data URL -> Data)
 */
async function fetchAemetData<T>(endpoint: string, apiKey: string): Promise<T> {
  // Step 1: Request the data URL
  const initialResponse = await fetch(endpoint, {
    headers: {
      'api_key': apiKey,
      'Accept': 'application/json'
    },
    cache: 'no-store'
  });

  if (!initialResponse.ok) {
    throw new Error(`AEMET API Error (Step 1): ${initialResponse.status} ${initialResponse.statusText}`);
  }

  const initialData = (await initialResponse.json()) as AemetResponseWrapper;

  if (initialData.estado !== 200) {
    throw new Error(`AEMET API Error: ${initialData.descripcion} (Code: ${initialData.estado})`);
  }

  // Step 2: Fetch the actual data from the provided URL
  const dataResponse = await fetch(initialData.datos, {
    cache: 'no-store'
  });

  if (!dataResponse.ok) {
    throw new Error(`AEMET API Error (Step 2): ${dataResponse.status} ${dataResponse.statusText}`);
  }

  return (await dataResponse.json()) as T;
}

/**
 * Get the daily forecast for Getxo
 */
export async function getGetxoForecast(): Promise<MunicipalityForecast | null> {
  const apiKey = process.env.AEMET_API_KEY;
  if (!apiKey) {
    console.warn('AEMET_API_KEY is not defined');
    return null;
  }

  try {
    const endpoint = `https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/${GETXO_CODE}`;
    // The API returns an array, usually with 1 element for the requested municipality
    const data = await fetchAemetData<MunicipalityForecast[]>(endpoint, apiKey);
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Failed to fetch AEMET forecast:', error);
    return null;
  }
}

/**
 * Converts the AEMET forecast JSON into a natural language narrative for LLMs.
 * Focuses on the "Today" forecast (index 0).
 */
export function narrateForecast(forecast: MunicipalityForecast): string {
  if (!forecast || !forecast.prediccion || !forecast.prediccion.dia || forecast.prediccion.dia.length === 0) {
    return "No hay datos de predicción disponibles.";
  }

  const today = forecast.prediccion.dia[0];

  // Format Date safely
  const dateObj = new Date(today.fecha);
  const dateStr = dateObj.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/Madrid'
  });

  // Helper to find the most representative value (longest period or specific one)
  const getMainValue = (arr: PeriodValue[]) => {
    if (!arr || arr.length === 0) return null;
    // Priority: '00-24', then the one covering the current time, or just the first non-empty
    const wholeDay = arr.find(x => x.periodo === '00-24');
    if (wholeDay) return wholeDay;

    // Fallback: take the one with the most description or value
    // For precipitation, we want the highest probability
    return arr.reduce((prev, curr) => {
        const pVal = parseInt(String(prev.value || 0));
        const cVal = parseInt(String(curr.value || 0));
        return cVal > pVal ? curr : prev;
    }, arr[0]);
  };

  const skyValues = today.estadoCielo.filter(x => x.descripcion);
  const sky = skyValues.find(x => x.periodo === '00-24') || skyValues[0] || today.estadoCielo[0];

  const rain = getMainValue(today.probPrecipitacion);

  // Wind: Find the period with highest speed
  const wind = today.viento.reduce((prev, curr) =>
    (curr.velocidad > prev.velocidad) ? curr : prev
  , today.viento[0]);

  const tempMax = today.temperatura.maxima;
  const tempMin = today.temperatura.minima;

  const skyDesc = sky?.descripcion || 'cielos variables';
  const rainProb = rain?.value || 0;
  const windDir = wind?.direccion || 'variable';
  const windSpeed = wind?.velocidad || 0;

  return `Informe meteorológico para ${forecast.nombre} (${forecast.provincia}), para el ${dateStr}. ` +
         `Se esperan ${skyDesc.toLowerCase()}, con una probabilidad de precipitación del ${rainProb}%. ` +
         `El viento soplará de componente ${windDir} con una velocidad de ${windSpeed} km/h. ` +
         `Las temperaturas oscilarán entre una mínima de ${tempMin}ºC y una máxima de ${tempMax}ºC. ` +
         `Humedad relativa máxima del ${today.humedadRelativa.maxima}% y mínima del ${today.humedadRelativa.minima}%.`;
}
