import { describe, it, expect } from 'vitest';
import { parseAmount } from './financial';

describe('Financial Utils', () => {
    describe('parseAmount', () => {
        it('handles numbers directly', () => {
            expect(parseAmount(123.45)).toBe(123.45);
        });

        it('parses dot notation', () => {
            expect(parseAmount("123.45")).toBe(123.45);
        });

        it('parses comma notation (European)', () => {
            expect(parseAmount("123,45")).toBe(123.45);
        });

        it('removes currency symbols', () => {
            expect(parseAmount("200 €")).toBe(200);
            expect(parseAmount("€ 45,50")).toBe(45.5);
        });

        it('returns 0 for invalid inputs', () => {
            expect(parseAmount(null)).toBe(0);
            expect(parseAmount(undefined)).toBe(0);
            expect(parseAmount("abc")).toBe(0);
        });
    });
});
