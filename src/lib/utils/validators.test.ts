import { describe, it, expect } from 'vitest';
import { validateIdentityDocument, validateEmail } from './validators';

describe('validateIdentityDocument', () => {
    it('validates DNI correctly', () => {
        expect(validateIdentityDocument('12345678Z', 'DNI').isValid).toBe(true);
        expect(validateIdentityDocument('12345678A', 'DNI').isValid).toBe(false); // Wrong letter
    });

    it('validates NIE correctly', () => {
        expect(validateIdentityDocument('X1234567L', 'NIE').isValid).toBe(true);
        expect(validateIdentityDocument('X1234567A', 'NIE').isValid).toBe(false); // Wrong letter
    });

    it('validates Passport format', () => {
        expect(validateIdentityDocument('A1234567', 'PASPORT').isValid).toBe(true);
        expect(validateIdentityDocument('ABC', 'PASPORT').isValid).toBe(false); // Too short
    });

    it('detects missing value', () => {
        expect(validateIdentityDocument('').isValid).toBe(false);
    });
});

describe('validateEmail', () => {
    it('validates correct email', () => {
        expect(validateEmail('test@example.com').isValid).toBe(true);
        expect(validateEmail('user.name+tag@domain.co.uk').isValid).toBe(true);
    });

    it('rejects invalid email', () => {
        expect(validateEmail('invalid-email').isValid).toBe(false);
        expect(validateEmail('user@').isValid).toBe(false);
        expect(validateEmail('@domain.com').isValid).toBe(false);
        expect(validateEmail('user@domain').isValid).toBe(false); // Missing TLD
    });
});
