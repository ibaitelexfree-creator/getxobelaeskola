
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AemetService } from './AemetService';

// Mock process.env
const originalEnv = process.env;

describe('AemetService', () => {
    beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv, AEMET_API_KEY: 'test-key' };
        global.fetch = vi.fn();
    });

    afterEach(() => {
        process.env = originalEnv;
        vi.restoreAllMocks();
    });

    it('returns error message if API key is missing', async () => {
        process.env.AEMET_API_KEY = '';
        const result = await AemetService.getGetxoContextString();
        expect(result).toContain('AEMET API Key missing');
    });

    it('fetches and formats coastal forecast correctly', async () => {
        // Mock Step 1: Get Data URL
        const mockResponse1 = {
            ok: true,
            json: async () => ({ estado: 200, datos: 'https://data.url', metadatos: '' })
        };

        // Mock Step 2: Get Actual Data (Coastal)
        const mockResponse2 = {
            ok: true,
            json: async () => ([{
                prediccion: {
                    dia: [{
                        fecha: '2023-10-27',
                        zona: [
                            { nombre: 'AGUAS COSTERAS DE BIZKAIA', viento: 'Norte F4', estado_mar: 'Marejadilla' }
                        ]
                    }]
                }
            }])
        };

        (global.fetch as any)
            .mockResolvedValueOnce(mockResponse1) // Coastal URL request
            .mockResolvedValueOnce(mockResponse2); // Coastal Data request

        const result = await AemetService.getGetxoContextString();

        expect(result).toContain('Costa Bizkaia');
        expect(result).toContain('Wind: Norte F4');
        expect(result).toContain('Sea State: Marejadilla');
        expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('falls back to port forecast if coastal fails', async () => {
        // Mock Step 1 (Coastal) - Fail
        (global.fetch as any).mockResolvedValueOnce({ ok: false, statusText: 'Not Found' });

        // Mock Step 1 (Port) - Success
        const mockResponsePort1 = {
            ok: true,
            json: async () => ({ estado: 200, datos: 'https://port.data.url', metadatos: '' })
        };

        // Mock Step 2 (Port) - Success
        const mockResponsePort2 = {
            ok: true,
            json: async () => ([{
                prediccion: {
                    viento: { texto: 'Variable' },
                    oleaje: { texto: 'Calm' }
                }
            }])
        };

        (global.fetch as any)
            .mockResolvedValueOnce(mockResponsePort1) // Port URL request
            .mockResolvedValueOnce(mockResponsePort2); // Port Data request

        const result = await AemetService.getGetxoContextString();

        expect(result).toContain('Puerto de Bilbao');
        // The implementation currently returns a generic message for port forecast
        expect(result).toContain('Consult detailed port forecast');
    });
});
