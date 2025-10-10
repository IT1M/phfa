/**
 * Hijri Calendar Service
 * Converts between Gregorian and Hijri dates
 * Provides Islamic calendar functionality
 */

interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
  monthNameAr: string;
  formatted: string;
  formattedAr: string;
}

const HIJRI_MONTHS = [
  { en: 'Muharram', ar: 'محرم' },
  { en: 'Safar', ar: 'صفر' },
  { en: 'Rabi al-Awwal', ar: 'ربيع الأول' },
  { en: 'Rabi al-Thani', ar: 'ربيع الثاني' },
  { en: 'Jumada al-Awwal', ar: 'جمادى الأولى' },
  { en: 'Jumada al-Thani', ar: 'جمادى الثانية' },
  { en: 'Rajab', ar: 'رجب' },
  { en: 'Shaban', ar: 'شعبان' },
  { en: 'Ramadan', ar: 'رمضان' },
  { en: 'Shawwal', ar: 'شوال' },
  { en: 'Dhul Qadah', ar: 'ذو القعدة' },
  { en: 'Dhul Hijjah', ar: 'ذو الحجة' }
];

export class HijriCalendarService {
  /**
   * Convert Gregorian date to Hijri
   */
  static gregorianToHijri(date: Date): HijriDate {
    const jd = this.gregorianToJulian(date);
    return this.julianToHijri(jd);
  }

  /**
   * Convert Hijri date to Gregorian
   */
  static hijriToGregorian(day: number, month: number, year: number): Date {
    const jd = this.hijriToJulian(day, month, year);
    return this.julianToGregorian(jd);
  }

  /**
   * Get current Hijri date
   */
  static getCurrentHijri(): HijriDate {
    return this.gregorianToHijri(new Date());
  }

  /**
   * Check if date is in Ramadan
   */
  static isRamadan(date: Date = new Date()): boolean {
    const hijri = this.gregorianToHijri(date);
    return hijri.month === 9; // Ramadan is 9th month
  }

  /**
   * Check if date is in Hajj season (8-13 Dhul Hijjah)
   */
  static isHajjSeason(date: Date = new Date()): boolean {
    const hijri = this.gregorianToHijri(date);
    return hijri.month === 12 && hijri.day >= 8 && hijri.day <= 13;
  }

  /**
   * Get Ramadan dates for a Gregorian year
   */
  static getRamadanDates(gregorianYear: number): { start: Date; end: Date } {
    // Approximate Hijri year
    const hijriYear = Math.floor((gregorianYear - 622) * 1.030684);
    
    const start = this.hijriToGregorian(1, 9, hijriYear);
    const end = this.hijriToGregorian(29, 9, hijriYear);
    
    return { start, end };
  }

  /**
   * Get Hajj dates for a Gregorian year
   */
  static getHajjDates(gregorianYear: number): { start: Date; end: Date } {
    const hijriYear = Math.floor((gregorianYear - 622) * 1.030684);
    
    const start = this.hijriToGregorian(8, 12, hijriYear);
    const end = this.hijriToGregorian(13, 12, hijriYear);
    
    return { start, end };
  }

  /**
   * Format Hijri date
   */
  static formatHijri(hijri: HijriDate, locale: 'en' | 'ar' = 'en'): string {
    if (locale === 'ar') {
      return `${this.toArabicNumerals(hijri.day)} ${hijri.monthNameAr} ${this.toArabicNumerals(hijri.year)} هـ`;
    }
    return `${hijri.day} ${hijri.monthName} ${hijri.year} AH`;
  }

  /**
   * Convert numbers to Arabic numerals
   */
  private static toArabicNumerals(num: number): string {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(d => arabicNumerals[parseInt(d)]).join('');
  }

  /**
   * Gregorian to Julian Day conversion
   */
  private static gregorianToJulian(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    let a = Math.floor((14 - month) / 12);
    let y = year + 4800 - a;
    let m = month + 12 * a - 3;

    return day + Math.floor((153 * m + 2) / 5) + 365 * y + 
           Math.floor(y / 4) - Math.floor(y / 100) + 
           Math.floor(y / 400) - 32045;
  }

  /**
   * Julian Day to Hijri conversion
   */
  private static julianToHijri(jd: number): HijriDate {
    const l = jd - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    const l2 = l - 10631 * n + 354;
    const j = Math.floor((10985 - l2) / 5316) * 
              Math.floor((50 * l2) / 17719) + 
              Math.floor(l2 / 5670) * 
              Math.floor((43 * l2) / 15238);
    const l3 = l2 - Math.floor((30 - j) / 15) * 
               Math.floor((17719 * j) / 50) - 
               Math.floor(j / 16) * 
               Math.floor((15238 * j) / 43) + 29;
    const month = Math.floor((24 * l3) / 709);
    const day = l3 - Math.floor((709 * month) / 24);
    const year = 30 * n + j - 30;

    const monthInfo = HIJRI_MONTHS[month - 1];

    return {
      day,
      month,
      year,
      monthName: monthInfo.en,
      monthNameAr: monthInfo.ar,
      formatted: `${day} ${monthInfo.en} ${year}`,
      formattedAr: `${this.toArabicNumerals(day)} ${monthInfo.ar} ${this.toArabicNumerals(year)}`
    };
  }

  /**
   * Hijri to Julian Day conversion
   */
  private static hijriToJulian(day: number, month: number, year: number): number {
    return Math.floor((11 * year + 3) / 30) + 
           354 * year + 30 * month - 
           Math.floor((month - 1) / 2) + day + 1948440 - 385;
  }

  /**
   * Julian Day to Gregorian conversion
   */
  private static julianToGregorian(jd: number): Date {
    const a = jd + 32044;
    const b = Math.floor((4 * a + 3) / 146097);
    const c = a - Math.floor((146097 * b) / 4);
    const d = Math.floor((4 * c + 3) / 1461);
    const e = c - Math.floor((1461 * d) / 4);
    const m = Math.floor((5 * e + 2) / 153);

    const day = e - Math.floor((153 * m + 2) / 5) + 1;
    const month = m + 3 - 12 * Math.floor(m / 10);
    const year = 100 * b + d - 4800 + Math.floor(m / 10);

    return new Date(year, month - 1, day);
  }
}

export default HijriCalendarService;
