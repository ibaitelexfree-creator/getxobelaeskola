
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getGetxoForecast, narrateForecast, MunicipalityForecast } from './aemet';

// Mock data
const mockForecastData: MunicipalityForecast = {
    origen: {
        productor: 'AEMET',
        web: 'https://www.aemet.es',
        enlace: 'https://www.aemet.es/es/eltiempo/prediccion/municipios/getxo-id48044',
        language: 'es',
        copyright: '© AEMET. Autorizado el uso de la información y su reproducción citando a AEMET como autora de la misma.',
        notaLegal: 'https://www.aemet.es/es/nota_legal'
    },
    elaborado: '2023-10-27T08:00:00',
    nombre: 'Getxo',
    provincia: 'Bizkaia',
    prediccion: {
        dia: [
            {
                fecha: '2023-10-27',
                probPrecipitacion: [
                    { value: 10, periodo: '00-24' },
                    { value: 5, periodo: '00-12' },
                    { value: 15, periodo: '12-24' }
                ],
                cotaNieveProv: [],
                estadoCielo: [
                    { value: '11n', periodo: '00-24', descripcion: 'Despejado' },
                    { value: '12n', periodo: '00-12', descripcion: 'Poco nuboso' }
                ],
                viento: [
                    { direccion: 'NO', velocidad: 10, periodo: '00-24' },
                    { direccion: 'N', velocidad: 15, periodo: '12-24' }
                ],
                rachaMax: [],
                temperatura: { maxima: 20, minima: 12 },
                sensTermica: { maxima: 19, minima: 11 },
                humedadRelativa: { maxima: 80, minima: 40 }
            }
        ]
    },
    id: 48044,
    version: 1
};

describe('AEMET Client', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        // Mock environment variable
        vi.stubEnv('AEMET_API_KEY', 'test-api-key');
    });

    describe('getGetxoForecast', () => {
        it('should fetch forecast successfully (2-step process)', async () => {
            const mockInitialResponse = {
                ok: true,
                json: async () => ({
                    estado: 200,
                    datos: 'https://opendata.aemet.es/data-url',
                    metadatos: 'https://opendata.aemet.es/metadata-url'
                })
            };

            const mockDataResponse = {
                ok: true,
                json: async () => [mockForecastData] // API returns array
            };

            global.fetch = vi.fn()
                .mockResolvedValueOnce(mockInitialResponse)
                .mockResolvedValueOnce(mockDataResponse);

            const result = await getGetxoForecast();

            expect(global.fetch).toHaveBeenCalledTimes(2);
            expect(global.fetch).toHaveBeenNthCalledWith(1, expect.stringContaining('municipio/diaria/48044'), expect.objectContaining({
                headers: expect.objectContaining({ 'api_key': 'test-api-key' })
            }));
            expect(global.fetch).toHaveBeenNthCalledWith(2, 'https://opendata.aemet.es/data-url', expect.any(Object));

            expect(result).toEqual(mockForecastData);
        });

        it('should handle API key missing', async () => {
            vi.stubEnv('AEMET_API_KEY', '');
            const result = await getGetxoForecast();
            expect(result).toBeNull();
        });

        it('should handle API errors in step 1', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 401,
                statusText: 'Unauthorized'
            });

            const result = await getGetxoForecast();
            expect(result).toBeNull();
        });
    });

    describe('narrateForecast', () => {
        it('should generate a correct narrative for valid data', () => {
            const narrative = narrateForecast(mockForecastData);

            expect(narrative).toContain('Getxo');
            expect(narrative).toContain('Bizkaia');
            // Check for localized date parts or at least something recognizable
            // Depending on test environment locale, this might vary, but let's check basic numbers
            expect(narrative).toContain('precipitación del 10%'); // Should pick 00-24 value
            expect(narrative).toContain('despejado'); // 00-24 description (lowercased)
            expect(narrative).toContain('viento soplará de componente N'); // Highest speed direction
            expect(narrative).toContain('velocidad de 15 km/h'); // Highest speed
            expect(narrative).toContain('mínima de 12ºC');
            expect(narrative).toContain('máxima de 20ºC');
        });

        it('should handle missing data gracefully', () => {
            const emptyData = { ...mockForecastData, prediccion: { dia: [] } };
            const narrative = narrateForecast(emptyData);
            expect(narrative).toContain('No hay datos');
        });
    });
});
