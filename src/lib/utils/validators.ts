
/**
 * Valida un documento de identidad (DNI, NIE o Pasaporte).
 * Prioriza la validación de documentos españoles (DNI/NIE).
 * Si no coincide con el formato español, intenta validar como pasaporte genérico.
 */
export function validateIdentityDocument(document: string): { isValid: boolean; message?: string; type?: 'DNI' | 'NIE' | 'PASPORT' } {
    // Normalizar: quitar espacios y guiones, y convertir a mayúsculas
    const value = document.replace(/[\s-]/g, '').toUpperCase();

    // Comprobación vacía
    if (!value) {
        return { isValid: false, message: 'El campo es obligatorio.' };
    }

    // 1. Intentar validar como DNI (8 dígitos + 1 letra)
    if (/^[0-9]{8}[A-Z]$/.test(value)) {
        if (isValidDNI(value)) {
            return { isValid: true, type: 'DNI' };
        } else {
            return { isValid: false, message: 'DNI inválido (la letra no coincide).' };
        }
    }

    // 2. Intentar validar como NIE (X/Y/Z + 7 dígitos + 1 letra)
    if (/^[XYZ][0-9]{7}[A-Z]$/.test(value)) {
        if (isValidNIE(value)) {
            return { isValid: true, type: 'NIE' };
        } else {
            return { isValid: false, message: 'NIE inválido (la letra no coincide).' };
        }
    }

    // 3. Otros casos: tratamiento como Pasaporte
    // Formato genérico: al menos 6 caracteres alfanuméricos, máximo 20
    // Evitar caracteres especiales raros
    if (/^[A-Z0-9]{6,20}$/.test(value)) {
        // Validación laxa para pasaporte internacional
        return { isValid: true, type: 'PASPORT' };
    }

    // Si no encaja en ninguno
    return {
        isValid: false,
        message: 'Formato no reconocido. Debe ser un DNI, NIE o Pasaporte válido.'
    };
}

/**
 * Valida el dígito de control del DNI español.
 */
function isValidDNI(dni: string): boolean {
    const letters = "TRWAGMYFPDXBNJZSQVHLCKE";
    const numberPart = parseInt(dni.substring(0, 8), 10);
    const letterPart = dni.substring(8, 9);

    return letters.charAt(numberPart % 23) === letterPart;
}

/**
 * Valida el dígito de control del NIE español.
 */
function isValidNIE(nie: string): boolean {
    let niePrefix = nie.charAt(0);
    let numberPartStr = nie.substring(1, 8);
    let letterPart = nie.substring(8, 9);

    let prefixValue = '';
    if (niePrefix === 'X') prefixValue = '0';
    else if (niePrefix === 'Y') prefixValue = '1';
    else if (niePrefix === 'Z') prefixValue = '2';
    else return false; // No debería pasar si el regex previo coincide

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
