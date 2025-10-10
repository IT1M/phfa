/**
 * Prayer Times Service
 * Calculates Islamic prayer times for Saudi cities
 * Based on astronomical calculations
 */

interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date: string;
  hijriDate: string;
}

interface Coordinates {
  latitude: number;
  longitude: number;
  timezone: string;
}

// Major Saudi cities coordinates
const SAUDI_CITIES: Record<string, Coordinates> = {
  riyadh: { latitude: 24.7136, longitude: 46.6753, timezone: 'Asia/Riyadh' },
  jeddah: { latitude: 21.5433, longitude: 39.1728, timezone: 'Asia/Riyadh' },
  makkah: { latitude: 21.4225, longitude: 39.8262, timezone: 'Asia/Riyadh' },
  madinah: { latitude: 24.5247, longitude: 39.5692, timezone: 'Asia/Riyadh' },
  dammam: { latitude: 26.4207, longitude: 50.0888, timezone: 'Asia/Riyadh' },
  taif: { latitude: 21.2703, longitude: 40.4158, timezone: 'Asia/Riyadh' },
  tabuk: { latitude: 28.3838, longitude: 36.5550, timezone: 'Asia/Riyadh' },
  buraidah: { latitude: 26.3260, longitude: 43.9750, timezone: 'Asia/Riyadh' },
  khobar: { latitude: 26.2172, longitude: 50.1971, timezone: 'Asia/Riyadh' },
  abha: { latitude: 18.2164, longitude: 42.5053, timezone: 'Asia/Riyadh' }
};

export class PrayerTimesService {
  /**
   * Get prayer times for a specific city and date
   */
  static getPrayerTimes(city: string, date: Date = new Date()): PrayerTimes | null {
    const coords = SAUDI_CITIES[city.toLowerCase()];
    if (!coords) return null;

    return this.calculatePrayerTimes(coords, date);
  }

  /**
   * Get prayer times for custom coordinates
   */
  static getPrayerTimesByCoordinates(
    latitude: number,
    longitude: number,
    date: Date = new Date()
  ): PrayerTimes {
    const coords: Coordinates = {
      latitude,
      longitude,
      timezone: 'Asia/Riyadh'
    };
    return this.calculatePrayerTimes(coords, date);
  }

  /**
   * Get next prayer time
   */
  static getNextPrayer(city: string): { name: string; nameAr: string; time: string } | null {
    const times = this.getPrayerTimes(city);
    if (!times) return null;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const prayers = [
      { name: 'Fajr', nameAr: 'الفجر', time: times.fajr },
      { name: 'Dhuhr', nameAr: 'الظهر', time: times.dhuhr },
      { name: 'Asr', nameAr: 'العصر', time: times.asr },
      { name: 'Maghrib', nameAr: 'المغرب', time: times.maghrib },
      { name: 'Isha', nameAr: 'العشاء', time: times.isha }
    ];

    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerTime = hours * 60 + minutes;
      
      if (prayerTime > currentTime) {
        return prayer;
      }
    }

    // If no prayer found today, return Fajr of next day
    return { name: 'Fajr', nameAr: 'الفجر', time: times.fajr };
  }

  /**
   * Calculate prayer times using astronomical formulas
   */
  private static calculatePrayerTimes(coords: Coordinates, date: Date): PrayerTimes {
    const { latitude, longitude } = coords;
    
    // Julian date
    const jd = this.getJulianDate(date);
    
    // Sun declination and equation of time
    const { declination, eqTime } = this.getSunPosition(jd);
    
    // Calculate times
    const fajr = this.calculateTime(latitude, longitude, -18, declination, eqTime, date);
    const sunrise = this.calculateTime(latitude, longitude, -0.833, declination, eqTime, date);
    const dhuhr = this.calculateDhuhr(longitude, eqTime, date);
    const asr = this.calculateAsr(latitude, longitude, declination, eqTime, date);
    const maghrib = this.calculateTime(latitude, longitude, -0.833, declination, eqTime, date, true);
    const isha = this.calculateTime(latitude, longitude, -17, declination, eqTime, date, true);

    return {
      fajr: this.formatTime(fajr),
      sunrise: this.formatTime(sunrise),
      dhuhr: this.formatTime(dhuhr),
      asr: this.formatTime(asr),
      maghrib: this.formatTime(maghrib),
      isha: this.formatTime(isha),
      date: date.toISOString().split('T')[0],
      hijriDate: '' // Will be filled by HijriCalendarService
    };
  }

  /**
   * Get Julian date
   */
  private static getJulianDate(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if (month <= 2) {
      return Math.floor(365.25 * (year - 1)) + 
             Math.floor(30.6001 * (month + 13)) + day + 1720995;
    }
    
    return Math.floor(365.25 * year) + 
           Math.floor(30.6001 * (month + 1)) + day + 1720995;
  }

  /**
   * Get sun position (declination and equation of time)
   */
  private static getSunPosition(jd: number): { declination: number; eqTime: number } {
    const d = jd - 2451545.0;
    const g = 357.529 + 0.98560028 * d;
    const q = 280.459 + 0.98564736 * d;
    const l = q + 1.915 * Math.sin(g * Math.PI / 180) + 0.020 * Math.sin(2 * g * Math.PI / 180);
    
    const e = 23.439 - 0.00000036 * d;
    const ra = Math.atan2(Math.cos(e * Math.PI / 180) * Math.sin(l * Math.PI / 180), 
                          Math.cos(l * Math.PI / 180)) * 180 / Math.PI;
    
    const declination = Math.asin(Math.sin(e * Math.PI / 180) * 
                                  Math.sin(l * Math.PI / 180)) * 180 / Math.PI;
    const eqTime = q - ra;

    return { declination, eqTime };
  }

  /**
   * Calculate prayer time
   */
  private static calculateTime(
    lat: number,
    lng: number,
    angle: number,
    declination: number,
    eqTime: number,
    date: Date,
    sunset: boolean = false
  ): number {
    const hourAngle = Math.acos(
      (Math.sin(angle * Math.PI / 180) - 
       Math.sin(lat * Math.PI / 180) * Math.sin(declination * Math.PI / 180)) /
      (Math.cos(lat * Math.PI / 180) * Math.cos(declination * Math.PI / 180))
    ) * 180 / Math.PI;

    const time = 12 + (sunset ? hourAngle : -hourAngle) / 15 - lng / 15 - eqTime / 60;
    return this.adjustTime(time, date);
  }

  /**
   * Calculate Dhuhr time (solar noon)
   */
  private static calculateDhuhr(lng: number, eqTime: number, date: Date): number {
    const time = 12 - lng / 15 - eqTime / 60;
    return this.adjustTime(time, date);
  }

  /**
   * Calculate Asr time (Shafi method)
   */
  private static calculateAsr(
    lat: number,
    lng: number,
    declination: number,
    eqTime: number,
    date: Date
  ): number {
    const shadowFactor = 1; // Shafi method (shadow = object length)
    const angle = Math.atan(1 / (shadowFactor + Math.tan(Math.abs(lat - declination) * Math.PI / 180)));
    
    const hourAngle = Math.acos(
      (Math.sin(angle) - Math.sin(lat * Math.PI / 180) * Math.sin(declination * Math.PI / 180)) /
      (Math.cos(lat * Math.PI / 180) * Math.cos(declination * Math.PI / 180))
    ) * 180 / Math.PI;

    const time = 12 + hourAngle / 15 - lng / 15 - eqTime / 60;
    return this.adjustTime(time, date);
  }

  /**
   * Adjust time to Saudi timezone
   */
  private static adjustTime(time: number, date: Date): number {
    const offset = 3; // Saudi Arabia is UTC+3
    return time + offset;
  }

  /**
   * Format time as HH:MM
   */
  private static formatTime(time: number): string {
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Get all Saudi cities
   */
  static getSaudiCities(): string[] {
    return Object.keys(SAUDI_CITIES);
  }

  /**
   * Get city coordinates
   */
  static getCityCoordinates(city: string): Coordinates | null {
    return SAUDI_CITIES[city.toLowerCase()] || null;
  }
}

export default PrayerTimesService;
