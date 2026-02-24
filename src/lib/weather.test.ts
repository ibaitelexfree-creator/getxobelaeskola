import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { fetchWeatherData } from './weather';
import * as euskalmet from './euskalmet';

// Mock the Euskalmet module
vi.mock('./euskalmet', () => ({
    fetchEuskalmetStationData: vi.fn(),
}));

// Mock global fetch
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('fetchWeatherData', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    // Helper to generate Unisono HTML
    const generateUnisonoHtml = (
        schoolData: { knots: number; dir: number; temp: number; gusts: number; timestamp: string } | null,
        abraData: { knots: number; dir: number; temp: number; gusts: number; timestamp: string } | null
    ) => {
        let html = '<html><body>';

        if (schoolData) {
            html += `
            <table>
                <tr><td colspan="5">Getxo Bela Eskola</td></tr>
                <tr><td>Header</td></tr>
                <tr>
                    <td>${schoolData.timestamp}</td>
                    <td>${schoolData.knots}</td>
                    <td>${schoolData.gusts}</td>
                    <td>${schoolData.dir}</td>
                    <td>${schoolData.temp}</td>
                </tr>
            </table>
            `;
        } else {
             html += '<table><tr><td>Random Table</td></tr></table>';
        }

        if (abraData) {
             html += `
            <table>
                <tr><td colspan="5">R.C. Marítimo Abra (minutos)</td></tr>
                <tr><td>Header</td></tr>
                <tr>
                    <td>${abraData.timestamp}</td>
                    <td>${abraData.knots}</td>
                    <td>${abraData.gusts}</td>
                    <td>${abraData.dir}</td>
                    <td>${abraData.temp}</td>
                </tr>
            </table>
            `;
        }

        html += '</body></html>';
        return html;
    };


    it('should return Getxo Bela Eskola data (Priority 1)', async () => {
        const schoolData = { knots: 10.5, dir: 180, temp: 20, gusts: 15, timestamp: '12:00' };
        const html = generateUnisonoHtml(schoolData, null);

        fetchMock.mockResolvedValueOnce({
            ok: true,
            text: async () => html,
        });

        const result = await fetchWeatherData();

        expect(result).toEqual({
            station: 'Getxo Bela Eskola',
            knots: 10.5,
            kmh: 19.4, // 10.5 * 1.852 = 19.446 -> 19.4
            direction: 180,
            temp: 20,
            timestamp: '12:00',
            gusts: 15,
        });

        expect(euskalmet.fetchEuskalmetStationData).not.toHaveBeenCalled();
    });

    it('should return Punta Galea data (Priority 2) when Getxo Bela Eskola is missing', async () => {
        const html = generateUnisonoHtml(null, null);
        fetchMock.mockResolvedValueOnce({
            ok: true,
            text: async () => html,
        });

        const mockEuskalmetData = {
            readings: [
                { sensorId: 'wind_speed', value: 5.0 }, // m/s
                { sensorId: 'wind_direction', value: 270 },
                { sensorId: 'temperature', value: 18 },
            ]
        };
        (euskalmet.fetchEuskalmetStationData as Mock).mockResolvedValueOnce(mockEuskalmetData);

        const result = await fetchWeatherData();

        expect(euskalmet.fetchEuskalmetStationData).toHaveBeenCalledWith('C042');
        expect(result).toEqual({
            station: 'Punta Galea (Euskalmet)',
            knots: 9.7, // 5.0 * 1.94384 = 9.7192 -> 9.7
            kmh: 18.0, // 5.0 * 3.6 = 18.0
            direction: 270,
            temp: 18,
            timestamp: expect.any(String),
        });
    });

     it('should return R.C. Marítimo Abra data (Priority 3) when Priority 1 & 2 fail', async () => {
        const abraData = { knots: 8.0, dir: 90, temp: 19, gusts: 12, timestamp: '12:05' };
        const html = generateUnisonoHtml(null, abraData);
        fetchMock.mockResolvedValueOnce({
            ok: true,
            text: async () => html,
        });

        (euskalmet.fetchEuskalmetStationData as Mock).mockResolvedValueOnce(null);

        const result = await fetchWeatherData();

        expect(euskalmet.fetchEuskalmetStationData).toHaveBeenCalledWith('C042');
        expect(result).toEqual({
            station: 'R.C. Marítimo Abra',
            knots: 8.0,
            kmh: 14.8, // 8.0 * 1.852 = 14.816 -> 14.8
            direction: 90,
            temp: 19,
            timestamp: '12:05',
            gusts: 12,
        });
    });

    it('should return Puerto de Bilbao data (Priority 4) when all others fail', async () => {
        const html = generateUnisonoHtml(null, null);
        fetchMock.mockResolvedValueOnce({
            ok: true,
            text: async () => html,
        });

        const mockEuskalmetData = {
            readings: [
                { sensorId: 'wind_speed', value: 10.0 }, // m/s
            ]
        };

        (euskalmet.fetchEuskalmetStationData as Mock).mockImplementation(async (stationId) => {
            if (stationId === 'C042') return null;
            if (stationId === 'B090') return mockEuskalmetData;
            return null;
        });

        const result = await fetchWeatherData();

        expect(euskalmet.fetchEuskalmetStationData).toHaveBeenCalledWith('C042');
        expect(euskalmet.fetchEuskalmetStationData).toHaveBeenCalledWith('B090');

        expect(result).toEqual({
            station: 'Puerto de Bilbao (Euskalmet)',
            knots: 19.4,
            kmh: 36.0,
            direction: 0,
            temp: 0,
            timestamp: 'API',
        });
    });

    it('should throw an error if all sources fail', async () => {
        const html = generateUnisonoHtml(null, null);
        fetchMock.mockResolvedValueOnce({
            ok: true,
            text: async () => html,
        });

        (euskalmet.fetchEuskalmetStationData as Mock)
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(null);

        await expect(fetchWeatherData()).rejects.toThrow('No weather data available from Unisono or Euskalmet');
    });

    it('should handle fetch network errors', async () => {
        fetchMock.mockRejectedValueOnce(new Error('Network error'));
        await expect(fetchWeatherData()).rejects.toThrow('Network error');
    });

    // --- New Edge Case Tests ---

    it('should handle Unisono HTML with missing rows or cells', async () => {
        // Table exists but data rows are missing
        const malformedHtml = '<html><body><table><tr><td>Getxo Bela Eskola</td></tr></table></body></html>';
        fetchMock.mockResolvedValueOnce({
            ok: true,
            text: async () => malformedHtml,
        });

        // Mock Euskalmet to succeed so we fall back to it
        (euskalmet.fetchEuskalmetStationData as Mock).mockResolvedValueOnce({
            readings: [{ sensorId: 'wind_speed', value: 5.0 }]
        });

        const result = await fetchWeatherData();
        expect(result.station).toBe('Punta Galea (Euskalmet)');
    });

    it('should handle Unisono HTML with non-numeric data', async () => {
        const html = `
            <table>
                <tr><td>Getxo Bela Eskola</td></tr>
                <tr><td>Header</td></tr>
                <tr>
                    <td>12:00</td>
                    <td>invalid</td>
                    <td>invalid</td>
                    <td>invalid</td>
                    <td>invalid</td>
                </tr>
            </table>
        `;
        fetchMock.mockResolvedValueOnce({
            ok: true,
            text: async () => html,
        });

        // Should fall back to Euskalmet because knots is NaN
        (euskalmet.fetchEuskalmetStationData as Mock).mockResolvedValueOnce({
            readings: [{ sensorId: 'wind_speed', value: 5.0 }]
        });

        const result = await fetchWeatherData();
        expect(result.station).toBe('Punta Galea (Euskalmet)');
    });

    it('should handle Euskalmet data with missing readings array or empty readings', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: true,
            text: async () => generateUnisonoHtml(null, null),
        });

        // C042 returns empty readings
        (euskalmet.fetchEuskalmetStationData as Mock).mockResolvedValueOnce({
            readings: []
        });

        // B090 returns no readings property
        (euskalmet.fetchEuskalmetStationData as Mock).mockResolvedValueOnce({});

        await expect(fetchWeatherData()).rejects.toThrow('No weather data available from Unisono or Euskalmet');
    });

    it('should handle Euskalmet data with missing sensor values', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: true,
            text: async () => generateUnisonoHtml(null, null),
        });

        // C042 has wind sensor but value is null/missing
        (euskalmet.fetchEuskalmetStationData as Mock).mockResolvedValueOnce({
            readings: [{ sensorId: 'wind_speed' }]
        });

        // B090 also fails
        (euskalmet.fetchEuskalmetStationData as Mock).mockResolvedValueOnce(null);

        await expect(fetchWeatherData()).rejects.toThrow();
    });

    it('should respect timeout and signal in fetch', async () => {
        vi.useFakeTimers();

        let capturedSignal: AbortSignal | undefined;
        fetchMock.mockImplementationOnce((url, options) => {
            capturedSignal = options.signal;
            return new Promise((_, reject) => {
                options.signal.addEventListener('abort', () => {
                    const err = new Error('The user aborted a request.');
                    err.name = 'AbortError';
                    reject(err);
                });
            });
        });

        const promise = fetchWeatherData();

        // Fast-forward to trigger the 8s timeout in weather.ts
        vi.advanceTimersByTime(8001);

        await expect(promise).rejects.toThrow();
        expect(capturedSignal?.aborted).toBe(true);

        vi.useRealTimers();
    });

    it('should continue to next source if Unisono fetch returns non-ok status', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: false,
            status: 500,
            text: async () => 'Error',
        });

        // Should skip Unisono parsing and try Euskalmet
        (euskalmet.fetchEuskalmetStationData as Mock).mockResolvedValueOnce({
            readings: [{ sensorId: 'wind_speed', value: 5.0 }]
        });

        const result = await fetchWeatherData();
        expect(result.station).toBe('Punta Galea (Euskalmet)');
    });
});
