/**
 * Utilidad para sanitizar Información de Identificación Personal (PII)
 * antes de enviar datos a LLMs o logs externos.
 */

// Regex para detectar tarjetas de crédito (16 dígitos, agrupados o no)
// Soporta separadores comunes como espacio o guión
const CREDIT_CARD_REGEX = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;

// Regex para detectar IBANs (Formato general europeo)
// Comienza con 2 letras, 2 dígitos, seguido de bloques alfanuméricos
// Soporta espacios opcionales
const IBAN_REGEX = /\b[A-Z]{2}\d{2}(?:\s?[A-Z0-9]{4}){2,}(?:\s?[A-Z0-9]{1,4})?\b/g;

// Regex para detectar Emails
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

// Regex para detectar DNI / NIE españoles
// DNI: 8 dígitos + Letra
// NIE: X/Y/Z + 7 dígitos + Letra
const DNI_NIE_REGEX = /\b([0-9]{8}|[XYZ][0-9]{7})[TRWAGMYFPDXBNJZSQVHLCKE]\b/gi;

const REPLACEMENT_TEXT = '[CENSURADO_PII]';

/**
 * Reemplaza patrones de PII (Tarjetas, IBANs, Emails, DNIs) en un texto por un placeholder.
 * @param text El texto a sanitizar.
 * @returns El texto sanitizado.
 */
export function sanitizePII(text: string): string {
  if (!text) return text;

  let sanitized = text;

  // El orden importa poco si los patrones son disjuntos, pero
  // procesamos primero los más largos/específicos para evitar reemplazos parciales incorrectos
  // (aunque en este caso son bastante distintos).

  // 1. IBANs (suelen ser largos y contener números/letras)
  sanitized = sanitized.replace(IBAN_REGEX, REPLACEMENT_TEXT);

  // 2. Tarjetas de Crédito
  sanitized = sanitized.replace(CREDIT_CARD_REGEX, REPLACEMENT_TEXT);

  // 3. Emails
  sanitized = sanitized.replace(EMAIL_REGEX, REPLACEMENT_TEXT);

  // 4. DNI / NIE
  sanitized = sanitized.replace(DNI_NIE_REGEX, REPLACEMENT_TEXT);

  return sanitized;
}
