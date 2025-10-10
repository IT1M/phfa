/**
 * Seasonal Health Service
 * Manages Hajj, Ramadan, and seasonal health monitoring
 */

import { Pool } from 'pg';
import HijriCalendarService from './hijriCalendar';

interface SeasonalAlert {
  id: number;
  season: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  recommendationsAr: string[];
}

interface HajjHealthMetrics {
  heatStrokeRisk: 'low' | 'medium' | 'high';
  crowdDensity: number;
  temperature: number;
  hydrationReminders: boolean;
  medicalStations: Array<{ name: string; location: string; distance: number }>;
}

interface RamadanSchedule {
  medicationName: string;
  medicationNameAr: string;
  beforeSuhoor: boolean;
  afterIftar: boolean;
  prayerTime?: string;
  dosage: string;
  notes: string;
  notesAr: string;
}

export class SeasonalHealthService {
  private db: Pool;

  constructor(db: Pool) {
    this.db = db;
  }

  /**
   * Get current seasonal alerts
   */
  async getCurrentSeasonalAlerts(): Promise<SeasonalAlert[]> {
    const now = new Date();
    const hijri = HijriCalendarService.getCurrentHijri();
    const alerts: SeasonalAlert[] = [];

    // Check if Ramadan
    if (HijriCalendarService.isRamadan(now)) {
      alerts.push(...await this.getRamadanAlerts());
    }

    // Check if Hajj season
    if (HijriCalendarService.isHajjSeason(now)) {
      alerts.push(...await this.getHajjAlerts());
    }

    // Check summer heat (June-September)
    const month = now.getMonth();
    if (month >= 5 && month <= 8) {
      alerts.push(...await this.getSummerHeatAlerts());
    }

    // Check winter season (December-February)
    if (month === 11 || month <= 1) {
      alerts.push(...await this.getWinterAlerts());
    }

    return alerts;
  }

  /**
   * Get Ramadan-specific health alerts
   */
  private async getRamadanAlerts(): Promise<SeasonalAlert[]> {
    return [
      {
        id: 1,
        season: 'ramadan',
        title: 'Ramadan Fasting Guidelines',
        titleAr: 'إرشادات الصيام في رمضان',
        description: 'Stay hydrated during non-fasting hours and adjust medication schedules',
        descriptionAr: 'حافظ على الترطيب خلال ساعات الإفطار وعدل مواعيد الأدوية',
        severity: 'medium',
        recommendations: [
          'Drink 8-10 glasses of water between Iftar and Suhoor',
          'Consult doctor about medication timing',
          'Avoid excessive sun exposure',
          'Break fast immediately if feeling unwell'
        ],
        recommendationsAr: [
          'اشرب 8-10 أكواب من الماء بين الإفطار والسحور',
          'استشر الطبيب حول مواعيد الأدوية',
          'تجنب التعرض المفرط للشمس',
          'أفطر فوراً إذا شعرت بتوعك'
        ]
      },
      {
        id: 2,
        season: 'ramadan',
        title: 'Diabetic Patients - Ramadan Care',
        titleAr: 'مرضى السكري - العناية في رمضان',
        description: 'Special precautions for diabetic patients during fasting',
        descriptionAr: 'احتياطات خاصة لمرضى السكري أثناء الصيام',
        severity: 'high',
        recommendations: [
          'Monitor blood sugar levels regularly',
          'Adjust insulin doses with doctor guidance',
          'Break fast if blood sugar drops below 70 mg/dL',
          'Avoid sugary foods at Iftar'
        ],
        recommendationsAr: [
          'راقب مستويات السكر في الدم بانتظام',
          'عدل جرعات الأنسولين بإشراف الطبيب',
          'أفطر إذا انخفض السكر عن 70 ملغ/ديسيلتر',
          'تجنب الأطعمة السكرية عند الإفطار'
        ]
      }
    ];
  }

  /**
   * Get Hajj-specific health alerts
   */
  private async getHajjAlerts(): Promise<SeasonalAlert[]> {
    return [
      {
        id: 3,
        season: 'hajj',
        title: 'Hajj Heat Stroke Prevention',
        titleAr: 'الوقاية من ضربة الشمس في الحج',
        description: 'Critical heat safety during Hajj rituals',
        descriptionAr: 'السلامة الحرارية الحرجة أثناء مناسك الحج',
        severity: 'critical',
        recommendations: [
          'Use umbrella during outdoor rituals',
          'Drink water frequently (every 15-20 minutes)',
          'Wear light-colored, loose clothing',
          'Rest in shaded areas when possible',
          'Seek medical help immediately if dizzy or nauseous'
        ],
        recommendationsAr: [
          'استخدم المظلة أثناء المناسك الخارجية',
          'اشرب الماء بشكل متكرر (كل 15-20 دقيقة)',
          'ارتدِ ملابس فاتحة اللون وفضفاضة',
          'استرح في المناطق المظللة عند الإمكان',
          'اطلب المساعدة الطبية فوراً عند الشعور بالدوار أو الغثيان'
        ]
      },
      {
        id: 4,
        season: 'hajj',
        title: 'Crowd Safety and Infectious Diseases',
        titleAr: 'السلامة من الزحام والأمراض المعدية',
        description: 'Prevent respiratory infections in crowded areas',
        descriptionAr: 'الوقاية من العدوى التنفسية في المناطق المزدحمة',
        severity: 'high',
        recommendations: [
          'Wear face mask in crowded areas',
          'Maintain hand hygiene',
          'Get vaccinated (Meningitis, Flu)',
          'Avoid touching face with unwashed hands',
          'Keep distance when possible'
        ],
        recommendationsAr: [
          'ارتدِ الكمامة في المناطق المزدحمة',
          'حافظ على نظافة اليدين',
          'احصل على التطعيمات (الحمى الشوكية، الإنفلونزا)',
          'تجنب لمس الوجه بأيدٍ غير مغسولة',
          'حافظ على المسافة عند الإمكان'
        ]
      }
    ];
  }

  /**
   * Get summer heat alerts
   */
  private async getSummerHeatAlerts(): Promise<SeasonalAlert[]> {
    return [
      {
        id: 5,
        season: 'summer',
        title: 'Extreme Heat Warning',
        titleAr: 'تحذير من الحرارة الشديدة',
        description: 'Temperatures exceeding 45°C - Take precautions',
        descriptionAr: 'درجات حرارة تتجاوز 45 درجة مئوية - اتخذ الاحتياطات',
        severity: 'high',
        recommendations: [
          'Stay indoors during peak hours (12 PM - 4 PM)',
          'Drink water even if not thirsty',
          'Avoid strenuous outdoor activities',
          'Check on elderly family members',
          'Never leave children or pets in cars'
        ],
        recommendationsAr: [
          'ابقَ في الداخل خلال ساعات الذروة (12 ظهراً - 4 عصراً)',
          'اشرب الماء حتى لو لم تشعر بالعطش',
          'تجنب الأنشطة الخارجية المجهدة',
          'تفقد كبار السن من أفراد العائلة',
          'لا تترك الأطفال أو الحيوانات الأليفة في السيارات أبداً'
        ]
      }
    ];
  }

  /**
   * Get winter season alerts
   */
  private async getWinterAlerts(): Promise<SeasonalAlert[]> {
    return [
      {
        id: 6,
        season: 'winter',
        title: 'Flu Season Prevention',
        titleAr: 'الوقاية من موسم الإنفلونزا',
        description: 'Protect yourself during flu season',
        descriptionAr: 'احمِ نفسك خلال موسم الإنفلونزا',
        severity: 'medium',
        recommendations: [
          'Get annual flu vaccination',
          'Wash hands frequently',
          'Avoid close contact with sick people',
          'Cover coughs and sneezes',
          'Stay home if feeling unwell'
        ],
        recommendationsAr: [
          'احصل على تطعيم الإنفلونزا السنوي',
          'اغسل يديك بشكل متكرر',
          'تجنب الاتصال الوثيق بالمرضى',
          'غطِّ فمك عند السعال والعطس',
          'ابقَ في المنزل إذا شعرت بتوعك'
        ]
      }
    ];
  }

  /**
   * Create Ramadan medication schedule
   */
  async createRamadanSchedule(
    visitorId: number,
    medications: Array<{ name: string; nameAr: string; timing: string; dosage: string }>
  ): Promise<RamadanSchedule[]> {
    const schedule: RamadanSchedule[] = [];

    for (const med of medications) {
      const timing = this.determineRamadanTiming(med.timing);
      
      const result = await this.db.query(
        `INSERT INTO prayer_reminders 
         (visitor_id, medication_name, medication_name_ar, prayer_time, dosage, notes, notes_ar)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          visitorId,
          med.name,
          med.nameAr,
          timing.prayerTime,
          med.dosage,
          timing.notes,
          timing.notesAr
        ]
      );

      schedule.push({
        medicationName: med.name,
        medicationNameAr: med.nameAr,
        beforeSuhoor: timing.beforeSuhoor,
        afterIftar: timing.afterIftar,
        prayerTime: timing.prayerTime,
        dosage: med.dosage,
        notes: timing.notes,
        notesAr: timing.notesAr
      });
    }

    return schedule;
  }

  /**
   * Determine optimal Ramadan timing for medication
   */
  private determineRamadanTiming(originalTiming: string): {
    beforeSuhoor: boolean;
    afterIftar: boolean;
    prayerTime: string;
    notes: string;
    notesAr: string;
  } {
    const timing = originalTiming.toLowerCase();

    if (timing.includes('morning') || timing.includes('breakfast')) {
      return {
        beforeSuhoor: true,
        afterIftar: false,
        prayerTime: 'fajr',
        notes: 'Take before Suhoor (pre-dawn meal)',
        notesAr: 'تناول قبل السحور'
      };
    }

    if (timing.includes('evening') || timing.includes('dinner')) {
      return {
        beforeSuhoor: false,
        afterIftar: true,
        prayerTime: 'maghrib',
        notes: 'Take after Iftar (sunset meal)',
        notesAr: 'تناول بعد الإفطار'
      };
    }

    if (timing.includes('night') || timing.includes('bedtime')) {
      return {
        beforeSuhoor: false,
        afterIftar: true,
        prayerTime: 'isha',
        notes: 'Take after Isha prayer',
        notesAr: 'تناول بعد صلاة العشاء'
      };
    }

    // Default to after Iftar
    return {
      beforeSuhoor: false,
      afterIftar: true,
      prayerTime: 'maghrib',
      notes: 'Take after Iftar - Consult doctor for optimal timing',
      notesAr: 'تناول بعد الإفطار - استشر الطبيب للتوقيت الأمثل'
    };
  }

  /**
   * Get Hajj health metrics for a location
   */
  async getHajjHealthMetrics(location: string): Promise<HajjHealthMetrics> {
    // Simulated data - would integrate with real-time APIs
    return {
      heatStrokeRisk: 'high',
      crowdDensity: 85, // percentage
      temperature: 46,
      hydrationReminders: true,
      medicalStations: [
        { name: 'Arafat Medical Center', location: 'Arafat', distance: 0.5 },
        { name: 'Mina Emergency Station', location: 'Mina', distance: 1.2 },
        { name: 'Muzdalifah Clinic', location: 'Muzdalifah', distance: 2.1 }
      ]
    };
  }

  /**
   * Track seasonal disease patterns
   */
  async trackSeasonalDisease(
    region: string,
    diseaseType: string,
    caseCount: number,
    severity: string
  ): Promise<void> {
    const now = new Date();
    const hijri = HijriCalendarService.getCurrentHijri();
    const season = this.getCurrentSeason(now);

    await this.db.query(
      `INSERT INTO seasonal_health_data 
       (season_type, year, region, disease_type, case_count, severity_level)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [season, hijri.year, region, diseaseType, caseCount, severity]
    );
  }

  /**
   * Get current season
   */
  private getCurrentSeason(date: Date): string {
    if (HijriCalendarService.isRamadan(date)) return 'ramadan';
    if (HijriCalendarService.isHajjSeason(date)) return 'hajj';
    
    const month = date.getMonth();
    if (month >= 5 && month <= 8) return 'summer';
    if (month === 11 || month <= 1) return 'winter';
    
    return 'general';
  }
}

export default SeasonalHealthService;
