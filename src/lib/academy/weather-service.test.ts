import { describe, it, expect } from 'vitest';
import { WeatherService } from './weather-service';

describe('WeatherService - getConditionAlert', () => {
    it('returns caution for calm wind (< 5 knots)', () => {
        const alert = WeatherService.getConditionAlert(3, 'marinero');
        expect(alert.type).toBe('caution');
        expect(alert.message).toContain('CALMA CHICHA');
    });

    it('returns ideal for moderate wind (5-18 knots)', () => {
        const alert = WeatherService.getConditionAlert(12, 'marinero');
        expect(alert.type).toBe('ideal');
        expect(alert.message).toContain('CONDICIONES IDEALES');
    });

    it('returns caution for strong wind if rank is low', () => {
        const alert = WeatherService.getConditionAlert(20, 'marinero');
        expect(alert.type).toBe('caution');
        expect(alert.message).toContain('RECOMIENDA NAVEGACIÓN CON INSTRUCTOR');
    });

    it('returns ideal for strong wind if rank is high', () => {
        const alert = WeatherService.getConditionAlert(20, 'capitan');
        expect(alert.type).toBe('ideal');
        expect(alert.message).toContain('EXCELENTE PARA ENTRENAMIENTO AVANZADO');
    });

    it('returns warning for extreme wind (> 25 knots)', () => {
        const alert = WeatherService.getConditionAlert(30, 'capitan');
        expect(alert.type).toBe('warning');
        expect(alert.message).toContain('CONDICIONES EXTREMAS');
    });
});
