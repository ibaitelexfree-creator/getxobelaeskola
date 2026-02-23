import { describe, it, expect } from 'vitest';
import { parseAmount } from './financial';
import { calculateEndTime } from './date';

describe('Financial Utils', () => {
    describe('parseAmount', () => {
        it('handles numbers directly', () => {
            expect(parseAmount(123.45)).toBe(123.45);
        });

        it('parses standard dot notation', () => {
            expect(parseAmount("123.45")).toBe(123.45);
        });

        it('parses standard comma notation (European decimal)', () => {
            expect(parseAmount("123,45")).toBe(123.45);
        });

        it('parses European format with thousand separators correctly', () => {
            expect(parseAmount("1.234,56")).toBe(1234.56);
        });

        it('parses European format with multiple thousand separators', () => {
            expect(parseAmount("1.234.567,89")).toBe(1234567.89);
        });

        it('parses US format with thousand separators correctly', () => {
            expect(parseAmount("1,234.56")).toBe(1234.56);
        });

        it('parses US format with multiple thousand separators', () => {
            expect(parseAmount("1,234,567.89")).toBe(1234567.89);
        });

        it('parses European thousand separators without decimal', () => {
            expect(parseAmount("1.234.567")).toBe(1234567);
        });

        it('parses US thousand separators without decimal', () => {
            expect(parseAmount("1,234,567")).toBe(1234567);
        });

        it('handles spaces as thousand separators', () => {
            expect(parseAmount("1 234,56")).toBe(1234.56);
        });

        it('removes currency symbols', () => {
            expect(parseAmount("200 €")).toBe(200);
            expect(parseAmount("€ 45,50")).toBe(45.5);
            expect(parseAmount("€ 1.234,56")).toBe(1234.56);
        });

        it('handles negative values correctly', () => {
            expect(parseAmount("-1.234,56")).toBe(-1234.56);
            expect(parseAmount("-1,234.56")).toBe(-1234.56);
        });

        it('returns 0 for invalid inputs', () => {
            expect(parseAmount(null)).toBe(0);
            expect(parseAmount(undefined)).toBe(0);
            expect(parseAmount("abc")).toBe(0);
            expect(parseAmount("")).toBe(0);
        });
    });
});

describe('Date Utils - Advanced', () => {
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
    });
});
