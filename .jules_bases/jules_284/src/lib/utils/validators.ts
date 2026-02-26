
/**
 * Tipos de documentos de identidad soportados.
 */
export type DocumentType = 'DNI' | 'NIE' | 'PASPORT';

/**
 * Valida un documento de identidad según su tipo.
 */
export function validateIdentityDocument(document: string, type?: DocumentType): { isValid: boolean; message?: string; type: DocumentType } {
    const value = document.replace(/[\s-]/g, '').toUpperCase();

    if (!value) {
        return { isValid: false, message: 'El campo es obligatorio.', type: type || 'DNI' };
    }

    // Si se especifica el tipo, validamos solo para ese tipo
    if (type === 'DNI') {
        if (/^[0-9]{7,8}[A-Z]$/.test(value)) {
            return isValidDNI(value)
                ? { isValid: true, type: 'DNI' }
                : { isValid: false, message: 'La letra del DNI no es válida.', type: 'DNI' };
        }
        return { isValid: false, message: 'Formato de DNI inválido (ej: 12345678Z).', type: 'DNI' };
    }

    if (type === 'NIE') {
        if (/^[XYZ][0-9]{7}[A-Z]$/.test(value)) {
            return isValidNIE(value)
                ? { isValid: true, type: 'NIE' }
                : { isValid: false, message: 'La letra del NIE no es válida.', type: 'NIE' };
        }
        return { isValid: false, message: 'Formato de NIE inválido (ej: X1234567L).', type: 'NIE' };
    }

    if (type === 'PASPORT') {
        // Formato genérico de pasaporte: al menos 6 caracteres alfanuméricos
        if (/^[A-Z0-9]{6,20}$/.test(value)) {
            return { isValid: true, type: 'PASPORT' };
        }
        return { isValid: false, message: 'Pasaporte inválido (6-20 caracteres alfanuméricos).', type: 'PASPORT' };
    }

    // Si NO se especifica tipo (auto-detección - mantener compatibilidad)
    if (/^[0-9]{7,8}[A-Z]$/.test(value)) {
        return isValidDNI(value) ? { isValid: true, type: 'DNI' } : { isValid: false, message: 'DNI inválido.', type: 'DNI' };
    }
    if (/^[XYZ][0-9]{7}[A-Z]$/.test(value)) {
        return isValidNIE(value) ? { isValid: true, type: 'NIE' } : { isValid: false, message: 'NIE inválido.', type: 'NIE' };
    }
    if (/^[A-Z0-9]{6,20}$/.test(value)) {
        return { isValid: true, type: 'PASPORT' };
    }

    return { isValid: false, message: 'Documento no reconocido.', type: 'DNI' };
}

/**
 * Valida el dígito de control del DNI español.
 */
function isValidDNI(dni: string): boolean {
    const letters = "TRWAGMYFPDXBNJZSQVHLCKE";
    const numberPart = parseInt(dni.substring(0, dni.length - 1), 10);
    const letterPart = dni.substring(dni.length - 1);

    return letters.charAt(numberPart % 23) === letterPart;
}

/**
 * Valida el dígito de control del NIE español.
 */
function isValidNIE(nie: string): boolean {
    const niePrefix = nie.charAt(0);
    const numberPartStr = nie.substring(1, nie.length - 1);
    const letterPart = nie.substring(nie.length - 1);

    let prefixValue = '';
    if (niePrefix === 'X') prefixValue = '0';
    else if (niePrefix === 'Y') prefixValue = '1';
    else if (niePrefix === 'Z') prefixValue = '2';
    else return false;

    const numberPart = parseInt(prefixValue + numberPartStr, 10);
    const letters = "TRWAGMYFPDXBNJZSQVHLCKE";

    return letters.charAt(numberPart % 23) === letterPart;
}

/**
 * Valida una dirección de correo electrónico.
 */
export function validateEmail(email: string): { isValid: boolean; message?: string } {
    const value = email.trim();

    if (!value) {
        return { isValid: false, message: 'El campo es obligatorio.' };
    }

    // Regla robusta de email:
    // 1. Debe tener una sola @
    // 2. No debe tener espacios
    // 3. Después de la @ debe haber al menos un punto
    // 4. El TLD debe tener al menos 2 caracteres
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(value)) {
        return {
            isValid: false,
            message: 'El correo electrónico no tiene un formato válido (ejemplo: usuario@dominio.com).'
        };
    }

    return { isValid: true };
}
