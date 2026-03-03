import { describe, it, expect } from 'vitest';
import { sanitizePII } from './pii-sanitizer';

describe('sanitizePII', () => {
  it('should sanitize email addresses', () => {
    const text = 'Contact me at john.doe@example.com for more info.';
    const result = sanitizePII(text);
    expect(result).toBe('Contact me at [EMAIL] for more info.');
  });

  it('should sanitize Spanish phone numbers', () => {
    const text = 'My number is 612 345 678. Also +34 612 345 678.';
    const result = sanitizePII(text);
    // Note: The simple regex might replace parts if they are consecutive.
    // Let's see how it behaves.
    // "612 345 678" -> [PHONE]
    // "+34 612 345 678" -> [PHONE]
    expect(result).toBe('My number is [PHONE]. Also [PHONE].');
  });

  it('should sanitize DNI and NIE', () => {
    const text = 'My DNI is 12345678Z and NIE is X1234567L.';
    const result = sanitizePII(text);
    expect(result).toBe('My DNI is [ID_DOC] and NIE is [ID_DOC].');
  });

  it('should sanitize credit card numbers', () => {
    const text = 'Pay with 1234-5678-9012-3456 or 1234 5678 9012 3456.';
    const result = sanitizePII(text);
    expect(result).toBe('Pay with [CREDIT_CARD] or [CREDIT_CARD].');
  });

  it('should sanitize IP addresses', () => {
    const text = 'Server IP is 192.168.1.1 and 10.0.0.1.';
    const result = sanitizePII(text);
    expect(result).toBe('Server IP is [IP_ADDRESS] and [IP_ADDRESS].');
  });

  it('should handle mixed PII', () => {
    const text = 'User john@example.com with ID 12345678Z called from 600123456.';
    const result = sanitizePII(text);
    expect(result).toBe('User [EMAIL] with ID [ID_DOC] called from [PHONE].');
  });

  it('should return empty string if input is empty', () => {
    expect(sanitizePII('')).toBe('');
  });

  it('should not alter text without PII', () => {
    const text = 'Hello world, this is a safe string.';
    expect(sanitizePII(text)).toBe(text);
  });
});
