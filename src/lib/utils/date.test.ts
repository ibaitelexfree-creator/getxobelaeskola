<<<<<<< HEAD
import { describe, it, expect } from 'vitest';
import { getSpainTimeInfo, getInitialBookingDate, calculateEndTime } from './date';

describe('getSpainTimeInfo', () => {
    it('returns segments correctly for a known date', () => {
        // 2024-05-15 10:30 UTC -> 12:30 Madrid (roughly)
        // But Intl.DateTimeFormat handles the conversion.
        const testDate = new Date('2024-05-15T10:30:00Z');
        const info = getSpainTimeInfo(testDate);

        expect(info.year).toBe(2024);
        expect(info.month).toBe(5);
        expect(info.day).toBe(15);
        expect(info.hour).toBe(12); // CEST is UTC+2
        expect(info.minute).toBe(30);
    });
});

describe('getInitialBookingDate', () => {
    it('returns today if it is early', () => {
        const morning = { year: 2024, month: 5, day: 15, hour: 10, minute: 0, dateStr: '2024-05-15' };
        const initial = getInitialBookingDate(morning);
        expect(initial.day).toBe('15');
        expect(initial.month).toBe('05');
    });

    it('returns tomorrow if it is late (>= 17:00)', () => {
        const evening = { year: 2024, month: 5, day: 15, hour: 18, minute: 0, dateStr: '2024-05-15' };
        const initial = getInitialBookingDate(evening);
        expect(initial.day).toBe('16'); // Tomorrow
        expect(initial.month).toBe('05');
    });
});

describe('calculateEndTime', () => {
    it('adds 1 hour by default', () => {
        expect(calculateEndTime('10:00:00')).toBe('11:00:00');
    });

    it('adds specific duration', () => {
        expect(calculateEndTime('12:30:00', 3)).toBe('15:30:00');
    });

    it('pads hours correctly', () => {
        expect(calculateEndTime('09:00:00', 1)).toBe('10:00:00');
    });

    it('handles decimal duration correctly', () => {
        // 1.5 hours = 1 hour 30 minutes
        expect(calculateEndTime('10:00:00', 1.5)).toBe('11:30:00');
    });

    it('handles minute overflow from decimal duration', () => {
        // 10:45 + 0.5 hours (30 mins) -> 11:15
        expect(calculateEndTime('10:45:00', 0.5)).toBe('11:15:00');
    });

    it('handles overflow past 24h by extending hours (known limitation)', () => {
        // Current behavior: returns 25:00:00.
        // This confirms the function does not wrap around (modulo 24) or crash.
        expect(calculateEndTime('23:00:00', 2)).toBe('25:00:00');
    });
});
=======
import { describe, it, expect } from 'vitest';
import { getSpainTimeInfo, getInitialBookingDate } from './date';

describe('getSpainTimeInfo', () => {
    it('returns segments correctly for a known date', () => {
        // 2024-05-15 10:30 UTC -> 12:30 Madrid (roughly)
        // But Intl.DateTimeFormat handles the conversion.
        const testDate = new Date('2024-05-15T10:30:00Z');
        const info = getSpainTimeInfo(testDate);

        expect(info.year).toBe(2024);
        expect(info.month).toBe(5);
        expect(info.day).toBe(15);
        expect(info.hour).toBe(12); // CEST is UTC+2
        expect(info.minute).toBe(30);
    });
});

describe('getInitialBookingDate', () => {
    it('returns today if it is early', () => {
        const morning = { year: 2024, month: 5, day: 15, hour: 10, minute: 0, dateStr: '2024-05-15' };
        const initial = getInitialBookingDate(morning);
        expect(initial.day).toBe('15');
        expect(initial.month).toBe('05');
    });

    it('returns tomorrow if it is late (>= 17:00)', () => {
        const evening = { year: 2024, month: 5, day: 15, hour: 18, minute: 0, dateStr: '2024-05-15' };
        const initial = getInitialBookingDate(evening);
        expect(initial.day).toBe('16'); // Tomorrow
        expect(initial.month).toBe('05');
    });
});
>>>>>>> pr-286
