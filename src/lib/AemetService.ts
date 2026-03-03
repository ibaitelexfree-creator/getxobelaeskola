
export interface AemetForecast {
  wind: string;
  waves: string;
  seaState: string;
  timestamp: string;
  source: string;
}

interface AemetResponse {
  estado: number;
  datos: string;
  metadatos: string;
}

export class AemetService {
  private static BASE_URL = 'https://opendata.aemet.es/opendata/api';

  private static getApiKey(): string | undefined {
    return process.env.AEMET_API_KEY;
  }

  /**
   * Fetches the consolidated weather string for Getxo (Bilbao/Bizkaia) for LLM context.
   * Prioritizes the Coastal Forecast for Bizkaia as it provides descriptive text suitable for LLMs.
   */
  public static async getGetxoContextString(): Promise<string> {
    try {
      const apiKey = this.getApiKey();
      if (!apiKey) {
        console.warn('AEMET_API_KEY is missing in environment variables.');
        return 'Weather data unavailable (AEMET API Key missing).';
      }

      // We prioritize Coastal Forecast (Bizkaia) because it provides rich text descriptions ("viento", "estado_mar")
      // which are ideal for LLM context.
      const coastalData = await this.fetchCoastalForecast('48'); // 48 = Bizkaia
      if (coastalData) {
        return this.formatForLLM(coastalData);
      }

      // Fallback: Try Port Forecast (Bilbao) if coastal fails
      const portData = await this.fetchPortForecast('4801'); // 4801 = Bilbao
      if (portData) {
        return this.formatForLLM(portData);
      }

      return 'Weather data unavailable from AEMET (No data returned).';
    } catch (error) {
      console.error('Error getting AEMET context:', error);
      return 'Error retrieving weather data from AEMET.';
    }
  }

  private static async fetchAemetData(endpoint: string): Promise<any> {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('AEMET API Key missing');

    const url = `${this.BASE_URL}${endpoint}?api_key=${apiKey}`;

    // Step 1: Request data URL
    const res1 = await fetch(url, {
        next: { revalidate: 3600 }, // Cache for 1 hour
        headers: { 'Accept': 'application/json' }
    });

    if (!res1.ok) throw new Error(`AEMET API Request Failed: ${res1.status} ${res1.statusText}`);

    const json1 = await res1.json() as AemetResponse;
    if (json1.estado !== 200) {
        throw new Error(`AEMET API Error: ${json1.estado} - ${JSON.stringify(json1)}`);
    }

    // Step 2: Fetch actual data
    const res2 = await fetch(json1.datos, {
        next: { revalidate: 3600 }
    });

    if (!res2.ok) throw new Error(`AEMET Data Download Failed: ${res2.status} ${res2.statusText}`);

    return res2.json();
  }

  private static async fetchCoastalForecast(coastId: string): Promise<AemetForecast | null> {
    try {
        const data = await this.fetchAemetData(`/prediccion/maritima/costera/costa/${coastId}`);

        // Expected structure: Array of objects. We take the first one (most recent issue).
        if (!Array.isArray(data) || data.length === 0) return null;

        const report = data[0];
        const prediction = report.prediccion?.dia?.[0]; // Today's prediction

        if (!prediction) return null;

        // Find the zone for Bizkaia
        // Zones usually include "AGUAS COSTERAS DE BIZKAIA"
        const zone = prediction.zona?.find((z: any) =>
            z.nombre && (z.nombre.includes('BIZKAIA') || z.nombre.includes('VIZCAYA'))
        );

        if (zone) {
            return {
                wind: zone.viento || 'No reported wind conditions',
                waves: 'See Sea State',
                seaState: zone.estado_mar || 'No reported sea state',
                timestamp: prediction.fecha || new Date().toISOString(),
                source: `Costa Bizkaia`
            };
        }
        return null;
    } catch (e) {
        console.warn(`Failed to fetch coastal forecast for id ${coastId}:`, e);
        return null;
    }
  }

  private static async fetchPortForecast(portId: string): Promise<AemetForecast | null> {
    try {
      const data = await this.fetchAemetData(`/prediccion/maritima/puerto/${portId}`);

      // Expected structure: Array of objects.
      if (!Array.isArray(data) || data.length === 0) return null;

      const report = data[0];
      // AEMET Port structure varies, but often has a general text or specific time slots.
      // We look for a general text summary if available, or just header info.
      // This is a best-effort fallback.

      return {
        wind: 'Consult detailed port forecast',
        waves: 'Consult detailed port forecast',
        seaState: 'N/A',
        timestamp: new Date().toISOString(),
        source: `Puerto de Bilbao (${portId})`
      };
    } catch (e) {
      console.warn(`Failed to fetch port forecast for id ${portId}:`, e);
      return null;
    }
  }

  private static formatForLLM(data: AemetForecast): string {
    const timestampStr = data.timestamp ? ` (Report date: ${data.timestamp})` : '';

    // Construct a natural language paragraph
    let text = `AEMET Maritime Report for Getxo area (${data.source})${timestampStr}:\n`;

    if (data.wind) {
        text += `- Wind: ${data.wind}\n`;
    }

    if (data.seaState && data.seaState !== 'N/A') {
        text += `- Sea State: ${data.seaState}\n`;
    } else if (data.waves) {
        text += `- Waves: ${data.waves}\n`;
    }

    return text.trim();
  }
}
