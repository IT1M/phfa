/**
 * Saudi National Address System Integration
 * Validates and formats Saudi addresses
 */

export interface NationalAddress {
  buildingNumber: string;
  streetName: string;
  district: string;
  city: string;
  postalCode: string;
  additionalNumber: string;
  unitNumber?: string;
  formatted: string;
  formattedAr: string;
}

export class NationalAddressService {
  /**
   * Validate Saudi postal code (5 digits)
   */
  static validatePostalCode(code: string): boolean {
    return /^\d{5}$/.test(code);
  }

  /**
   * Validate building number (4 digits)
   */
  static validateBuildingNumber(number: string): boolean {
    return /^\d{4}$/.test(number);
  }

  /**
   * Validate additional number (4 digits)
   */
  static validateAdditionalNumber(number: string): boolean {
    return /^\d{4}$/.test(number);
  }

  /**
   * Format national address
   */
  static formatAddress(address: NationalAddress, locale: 'en' | 'ar' = 'en'): string {
    if (locale === 'ar') {
      return address.formattedAr;
    }
    return `${address.buildingNumber} ${address.streetName}, ${address.district}, ${address.city} ${address.postalCode}`;
  }

  /**
   * Parse short address code (e.g., "RRRRNNNN" format)
   */
  static parseShortCode(code: string): { postalCode: string; buildingNumber: string } | null {
    if (code.length !== 8) return null;
    
    return {
      postalCode: code.substring(0, 5),
      buildingNumber: code.substring(5, 9)
    };
  }
}

export default NationalAddressService;
