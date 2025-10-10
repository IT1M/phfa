/**
 * Saudi-specific validation utilities
 */

export const validateSaudiPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[\s-]/g, '');
  const patterns = [
    /^\+9665\d{8}$/,
    /^9665\d{8}$/,
    /^05\d{8}$/,
    /^5\d{8}$/
  ];
  return patterns.some(pattern => pattern.test(cleaned));
};

export const validatePostalCode = (code: string): boolean => {
  return /^\d{5}$/.test(code);
};

export const validateBuildingNumber = (number: string): boolean => {
  return /^\d{4}$/.test(number);
};

export const formatSaudiPhone = (phone: string): string => {
  const cleaned = phone.replace(/[\s-]/g, '');
  
  if (cleaned.startsWith('+966')) return cleaned;
  if (cleaned.startsWith('966')) return '+' + cleaned;
  if (cleaned.startsWith('05')) return '+966' + cleaned.substring(1);
  if (cleaned.startsWith('5')) return '+966' + cleaned;
  
  return phone;
};

export const SAUDI_REGIONS = [
  { en: 'Riyadh', ar: 'الرياض' },
  { en: 'Makkah', ar: 'مكة المكرمة' },
  { en: 'Madinah', ar: 'المدينة المنورة' },
  { en: 'Eastern Province', ar: 'المنطقة الشرقية' },
  { en: 'Asir', ar: 'عسير' },
  { en: 'Tabuk', ar: 'تبوك' },
  { en: 'Qassim', ar: 'القصيم' },
  { en: 'Hail', ar: 'حائل' },
  { en: 'Northern Borders', ar: 'الحدود الشمالية' },
  { en: 'Jazan', ar: 'جازان' },
  { en: 'Najran', ar: 'نجران' },
  { en: 'Al-Baha', ar: 'الباحة' },
  { en: 'Al-Jouf', ar: 'الجوف' }
];

export const SAUDI_CITIES = [
  { en: 'Riyadh', ar: 'الرياض', region: 'Riyadh' },
  { en: 'Jeddah', ar: 'جدة', region: 'Makkah' },
  { en: 'Makkah', ar: 'مكة المكرمة', region: 'Makkah' },
  { en: 'Madinah', ar: 'المدينة المنورة', region: 'Madinah' },
  { en: 'Dammam', ar: 'الدمام', region: 'Eastern Province' },
  { en: 'Khobar', ar: 'الخبر', region: 'Eastern Province' },
  { en: 'Taif', ar: 'الطائف', region: 'Makkah' },
  { en: 'Tabuk', ar: 'تبوك', region: 'Tabuk' },
  { en: 'Buraidah', ar: 'بريدة', region: 'Qassim' },
  { en: 'Abha', ar: 'أبها', region: 'Asir' }
];
