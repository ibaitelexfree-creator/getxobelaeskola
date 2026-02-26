/**
 * Utility to sanitize Personally Identifiable Information (PII) from text.
 * Useful before sending data to external services (like LLMs) or logging.
 */

export function sanitizePII(text: string): string {
  if (!text) return text;

  let sanitized = text;

  // 1. Email Addresses
  // Simple regex for email: characters@domain.tld
  const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
  sanitized = sanitized.replace(emailRegex, '[EMAIL]');

  // 2. Spanish Phone Numbers
  // Matches +34 or 0034 optional, then 6/7/8/9 followed by 8 digits, allowing spaces/dots/dashes
  // This is a heuristic and might miss some formats or false positive on others.
  const phoneRegex = /(?:(?:\+|00)34[\s.-]?)?(?:[6789][0-9]{2}[\s.-]?[0-9]{3}[\s.-]?[0-9]{3})\b/g;
  sanitized = sanitized.replace(phoneRegex, '[PHONE]');

  // 3. DNI / NIE (Spanish ID)
  // DNI: 8 digits + Letter
  // NIE: X/Y/Z + 7 digits + Letter
  const dniNieRegex = /\b(?:[XYZ]\d{7}[A-Z]|\d{8}[A-Z])\b/gi;
  sanitized = sanitized.replace(dniNieRegex, '[ID_DOC]');

  // 4. Credit Card Numbers
  // Matches 13-19 digits, potentially grouped with spaces or dashes.
  // Using a more specific grouping to avoid matching simple long numbers.
  // Visa/MasterCard etc usually 16 digits: 4-4-4-4
  const creditCardRegex = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;
  sanitized = sanitized.replace(creditCardRegex, '[CREDIT_CARD]');

  // 5. IP Addresses (IPv4)
  const ipRegex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
  sanitized = sanitized.replace(ipRegex, '[IP_ADDRESS]');

  return sanitized;
}
