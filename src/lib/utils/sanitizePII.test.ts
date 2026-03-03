import { describe, it, expect } from 'vitest';
import { sanitizePII } from './sanitizePII';

describe('sanitizePII', () => {
  it('should sanitize email addresses', () => {
    const text = 'Contact me at test@example.com regarding the issue.';
    const result = sanitizePII(text);
    expect(result).toBe('Contact me at [CENSURADO_PII] regarding the issue.');
  });

  it('should sanitize complex email addresses', () => {
    const text = 'My other email is user.name+tag@sub.domain.co.uk.';
    const result = sanitizePII(text);
    expect(result).toBe('My other email is [CENSURADO_PII].');
  });

  it('should sanitize credit card numbers (digits only)', () => {
    const text = 'Payment processed with card 1234567812345678 successfully.';
    const result = sanitizePII(text);
    // Note: The regex currently targets grouped digits (4 groups of 4), or variations.
    // If the input is a solid block of 16 digits, let's verify if the regex catches it.
    // My implementation uses: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g
    // This expects groups of 4. Let's test standard grouped formats first.

    // For solid block: 1234567812345678 matches `\d{4}` 4 times with empty separator?
    // Yes, `[-\s]?` matches empty string too.
    expect(result).toBe('Payment processed with card [CENSURADO_PII] successfully.');
  });

  it('should sanitize credit card numbers (with spaces)', () => {
    const text = 'Card: 1234 5678 1234 5678.';
    const result = sanitizePII(text);
    expect(result).toBe('Card: [CENSURADO_PII].');
  });

  it('should sanitize credit card numbers (with dashes)', () => {
    const text = 'Card: 1234-5678-1234-5678.';
    const result = sanitizePII(text);
    expect(result).toBe('Card: [CENSURADO_PII].');
  });

  it('should sanitize Spanish IBANs', () => {
    // ES + 2 digits + 20 digits (24 total)
    const text = 'Transfer to ES12 1234 1234 1234 1234 1234 please.';
    const result = sanitizePII(text);
    expect(result).toBe('Transfer to [CENSURADO_PII] please.');
  });

  it('should sanitize IBANs without spaces', () => {
    const text = 'IBAN: ES1212341234123412341234';
    const result = sanitizePII(text);
    expect(result).toBe('IBAN: [CENSURADO_PII]');
  });

  it('should sanitize Spanish DNI', () => {
    const text = 'My ID is 12345678Z.';
    const result = sanitizePII(text);
    expect(result).toBe('My ID is [CENSURADO_PII].');
  });

  it('should sanitize Spanish NIE (starts with X/Y/Z)', () => {
    const text = 'NIEs: X1234567L and Y1234567R.';
    const result = sanitizePII(text);
    expect(result).toBe('NIEs: [CENSURADO_PII] and [CENSURADO_PII].');
  });

  it('should handle mixed content', () => {
    const text = 'User 12345678Z paid with 1234 5678 1234 5678 using email foo@bar.com.';
    const result = sanitizePII(text);
    expect(result).toBe('User [CENSURADO_PII] paid with [CENSURADO_PII] using email [CENSURADO_PII].');
  });

  it('should not modify text without PII', () => {
    const text = 'Hello world, this is a safe string with numbers 123 and 4567.';
    const result = sanitizePII(text);
    expect(result).toBe(text);
  });

  it('should handle empty strings', () => {
    expect(sanitizePII('')).toBe('');
  });
});
