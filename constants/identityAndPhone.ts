export type DocumentType = 'V' | 'E' | 'P';

export interface DocumentTypeOption {
  id: DocumentType;
  label: string;
  shortLabel: string;
  flag: string;
  description: string;
  placeholder: string;
}

export const DOCUMENT_TYPES: DocumentTypeOption[] = [
  {
    id: 'V',
    label: 'Venezolano',
    shortLabel: 'V',
    flag: '🇻🇪',
    description: 'Cédula de Identidad nacional',
    placeholder: '12345678',
  },
  {
    id: 'E',
    label: 'Extranjero',
    shortLabel: 'E',
    flag: '🌐',
    description: 'Cédula de Extranjero en Venezuela',
    placeholder: '81234567',
  },
  {
    id: 'P',
    label: 'Pasaporte',
    shortLabel: 'P',
    flag: '🛂',
    description: 'Pasaporte internacional',
    placeholder: 'ABC123456',
  },
];

export interface PhonePrefixOption {
  prefix: string;
  name: string;
  flag: string;
  isNational: boolean;
  expectedLength?: number;
}

export const NATIONAL_PHONE_PREFIXES: PhonePrefixOption[] = [
  { prefix: '0414', name: 'Movistar', flag: '🇻🇪', isNational: true, expectedLength: 7 },
  { prefix: '0424', name: 'Movistar', flag: '🇻🇪', isNational: true, expectedLength: 7 },
  { prefix: '0412', name: 'Digitel', flag: '🇻🇪', isNational: true, expectedLength: 7 },
  { prefix: '0416', name: 'Movilnet', flag: '🇻🇪', isNational: true, expectedLength: 7 },
  { prefix: '0426', name: 'Movilnet', flag: '🇻🇪', isNational: true, expectedLength: 7 },
];

export const INTERNATIONAL_PHONE_PREFIXES: PhonePrefixOption[] = [
  { prefix: '+58', name: 'Venezuela (Intl)', flag: '🇻🇪', isNational: false },
  { prefix: '+1', name: 'Estados Unidos / Canadá', flag: '🇺🇸', isNational: false },
  { prefix: '+57', name: 'Colombia', flag: '🇨🇴', isNational: false },
  { prefix: '+34', name: 'España', flag: '🇪🇸', isNational: false },
  { prefix: '+56', name: 'Chile', flag: '🇨🇱', isNational: false },
  { prefix: '+507', name: 'Panamá', flag: '🇵🇦', isNational: false },
  { prefix: '+54', name: 'Argentina', flag: '🇦🇷', isNational: false },
  { prefix: '+52', name: 'México', flag: '🇲🇽', isNational: false },
  { prefix: '+55', name: 'Brasil', flag: '🇧🇷', isNational: false },
  { prefix: '+51', name: 'Perú', flag: '🇵🇪', isNational: false },
  { prefix: '+593', name: 'Ecuador', flag: '🇪🇨', isNational: false },
  { prefix: '+351', name: 'Portugal', flag: '🇵🇹', isNational: false },
  { prefix: '+39', name: 'Italia', flag: '🇮🇹', isNational: false },
  { prefix: '+44', name: 'Reino Unido', flag: '🇬🇧', isNational: false },
  { prefix: '+49', name: 'Alemania', flag: '🇩🇪', isNational: false },
];

export const ALL_PHONE_PREFIXES: PhonePrefixOption[] = [
  ...NATIONAL_PHONE_PREFIXES,
  ...INTERNATIONAL_PHONE_PREFIXES,
];

/**
 * Limpia y normaliza el número de cédula según el tipo.
 */
export function cleanDocumentNumber(type: DocumentType, value: string): string {
  if (type === 'P') {
    // Alfanumérico en mayúsculas, sin espacios ni símbolos
    return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  }
  // Solo dígitos para V y E
  return value.replace(/[^0-9]/g, '');
}

/**
 * Valida un documento de identidad según su tipo.
 */
export function validateDocument(
  type: DocumentType,
  rawNumber: string
): { isValid: boolean; error?: string; cleanValue: string } {
  const clean = cleanDocumentNumber(type, rawNumber);

  if (!clean) {
    return {
      isValid: false,
      error: type === 'P' ? 'Ingresa el número de pasaporte' : 'Ingresa el número de cédula',
      cleanValue: '',
    };
  }

  if (type === 'V') {
    if (clean.length < 5 || clean.length > 9) {
      return {
        isValid: false,
        error: 'La cédula debe contener entre 5 y 9 dígitos',
        cleanValue: clean,
      };
    }
  } else if (type === 'E') {
    if (clean.length < 5 || clean.length > 9) {
      return {
        isValid: false,
        error: 'La cédula de extranjero debe contener entre 5 y 9 dígitos',
        cleanValue: clean,
      };
    }
  } else if (type === 'P') {
    if (clean.length < 5 || clean.length > 15) {
      return {
        isValid: false,
        error: 'El pasaporte debe tener entre 5 y 15 caracteres',
        cleanValue: clean,
      };
    }
  }

  return { isValid: true, cleanValue: clean };
}

/**
 * Devuelve el formato canónico para guardar en la BD (ej: "V-12345678", "E-81234567", "P-ABC123")
 */
export function formatFullCedula(type: DocumentType, cleanNumber: string): string {
  return `${type}-${cleanNumber}`;
}

/**
 * Limpia el número telefónico ingresado.
 */
export function cleanPhoneNumber(value: string): string {
  return value.replace(/[^0-9]/g, '');
}

/**
 * Valida el número telefónico según el prefijo.
 */
export function validatePhoneNumber(
  prefix: string,
  rawNumber: string,
  isNational: boolean
): { isValid: boolean; error?: string; cleanValue: string } {
  const clean = cleanPhoneNumber(rawNumber);

  if (!clean) {
    return {
      isValid: false,
      error: 'Ingresa tu número de teléfono',
      cleanValue: '',
    };
  }

  if (isNational) {
    if (clean.length !== 7) {
      return {
        isValid: false,
        error: 'El número debe tener exactamente 7 dígitos (ej: 1234567)',
        cleanValue: clean,
      };
    }
  } else {
    if (clean.length < 7 || clean.length > 12) {
      return {
        isValid: false,
        error: 'El número telefónico debe tener entre 7 y 12 dígitos',
        cleanValue: clean,
      };
    }
  }

  return { isValid: true, cleanValue: clean };
}

/**
 * Devuelve el formato canónico para guardar en la BD (ej: "0414-1234567" o "+57-3001234567")
 */
export function formatFullPhone(prefix: string, cleanNumber: string): string {
  return `${prefix}-${cleanNumber}`;
}
