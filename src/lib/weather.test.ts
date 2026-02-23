import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
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
        // Re-setup global fetch stub after reset (as reset might clear it if it was a spy)
        // But since we used vi.stubGlobal, it stays.
        // However, fetchMock is a vi.fn(), so resetAllMocks resets it to return undefined.
        // We need to re-apply behavior if needed, but we do that in each test.
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
        // Unisono returns no school data
        const html = generateUnisonoHtml(null, null);
        fetchMock.mockResolvedValueOnce({
            ok: true,
            text: async () => html,
        });

        // Mock Euskalmet C042
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
            timestamp: expect.any(String), // We can't predict exact time
        });
    });

     it('should return R.C. Marítimo Abra data (Priority 3) when Priority 1 & 2 fail', async () => {
        const abraData = { knots: 8.0, dir: 90, temp: 19, gusts: 12, timestamp: '12:05' };
        // Unisono returns Abra data but no school data
        const html = generateUnisonoHtml(null, abraData);
        fetchMock.mockResolvedValueOnce({
            ok: true,
            text: async () => html,
        });

        // Mock Euskalmet C042 to fail/return null
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
        // Unisono returns nothing useful
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

        // Use mockImplementation to handle different station IDs explicitly
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
            knots: 19.4, // 10 * 1.94384 = 19.4384 -> 19.4
            kmh: 36.0, // 10 * 3.6 = 36.0
            direction: 0,
            temp: 0,
            timestamp: 'API',
        });
    });

    it('should throw an error if all sources fail', async () => {
         // Unisono returns nothing useful
        const html = generateUnisonoHtml(null, null);
        fetchMock.mockResolvedValueOnce({
            ok: true,
            text: async () => html,
        });

        // Mock Euskalmet C042 and B090 to fail
        (euskalmet.fetchEuskalmetStationData as Mock)
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(null);

        await expect(fetchWeatherData()).rejects.toThrow('No weather data available from Unisono or Euskalmet');
    });

    it('should handle fetch errors', async () => {
        fetchMock.mockRejectedValueOnce(new Error('Network error'));
        await expect(fetchWeatherData()).rejects.toThrow('Network error');
    });
});
