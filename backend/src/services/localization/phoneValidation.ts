/**
 * Saudi Phone Number Validation
 * Validates +966 phone numbers
 */

export class PhoneValidationService {
  /**
   * Validate Saudi phone number
   * Formats: +966XXXXXXXXX, 966XXXXXXXXX, 05XXXXXXXX, 5XXXXXXXX
   */
  static validateSaudiPhone(phone: string): boolean {
    // Remove spaces and dashes
    const cleaned = phone.replace(/[\s-]/g, '');
    
    // Check various formats
    const patterns = [
      /^\+9665\d{8}$/,     // +966XXXXXXXXX
      /^9665\d{8}$/,       // 966XXXXXXXXX
      /^05\d{8}$/,         // 05XXXXXXXX
      /^5\d{8}$/           // 5XXXXXXXX
    ];
    
    return patterns.some(pattern => pattern.test(cleaned));
  }

  /**
   * Format to international format (+966XXXXXXXXX)
   */
  static formatToInternational(phone: string): string {
    const cleaned = phone.replace(/[\s-]/g, '');
    
    if (cleaned.startsWith('+966')) {
      return cleaned;
    }
    if (cleaned.startsWith('966')) {
      return '+' + cleaned;
    }
    if (cleaned.startsWith('05')) {
      return '+966' + cleaned.substring(1);
    }
    if (cleaned.startsWith('5')) {
      return '+966' + cleaned;
    }
    
    return phone;
  }

  /**
   * Format for display (05XX XXX XXXX)
   */
  static formatForDisplay(phone: string): string {
    const international = this.formatToInternational(phone);
    const number = international.replace('+966', '0');
    
    if (number.length === 10) {
      return `${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    }
    
    return phone;
  }

  /**
   * Get carrier from number
   */
  static getCarrier(phone: string): string {
    const cleaned = phone.replace(/[\s-]/g, '').replace(/^\+?966/, '');
    const prefix = cleaned.substring(0, 2);
    
    const carriers: Record<string, string> = {
      '50': 'STC',
      '53': 'STC',
      '54': 'Mobily',
      '55': 'Zain',
      '56': 'Mobily',
      '57': 'Zain',
      '58': 'STC'
    };
    
    return carriers[prefix] || 'Unknown';
  }
}

export default PhoneValidationService;
