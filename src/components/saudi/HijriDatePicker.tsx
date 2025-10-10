'use client';

import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
  monthNameAr: string;
}

interface HijriDatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  locale?: 'en' | 'ar';
  showBothCalendars?: boolean;
}

const HIJRI_MONTHS_EN = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
  'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah'
];

const HIJRI_MONTHS_AR = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

export default function HijriDatePicker({
  value = new Date(),
  onChange,
  locale = 'en',
  showBothCalendars = true
}: HijriDatePickerProps) {
  const [gregorianDate, setGregorianDate] = useState(value);
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
  const [calendarType, setCalendarType] = useState<'gregorian' | 'hijri'>('gregorian');

  useEffect(() => {
    // Convert Gregorian to Hijri (simplified - would use actual conversion)
    const convertToHijri = (date: Date): HijriDate => {
      const year = date.getFullYear();
      const hijriYear = Math.floor((year - 622) * 1.030684);
      const month = date.getMonth();
      
      return {
        day: date.getDate(),
        month: month + 1,
        year: hijriYear,
        monthName: HIJRI_MONTHS_EN[month],
        monthNameAr: HIJRI_MONTHS_AR[month]
      };
    };

    setHijriDate(convertToHijri(gregorianDate));
  }, [gregorianDate]);

  const handleGregorianChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setGregorianDate(newDate);
    onChange(newDate);
  };

  const formatGregorian = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const formatHijriDisplay = (hijri: HijriDate | null): string => {
    if (!hijri) return '';
    
    if (locale === 'ar') {
      return `${toArabicNumerals(hijri.day)} ${hijri.monthNameAr} ${toArabicNumerals(hijri.year)} هـ`;
    }
    return `${hijri.day} ${hijri.monthName} ${hijri.year} AH`;
  };

  const toArabicNumerals = (num: number): string => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(d => arabicNumerals[parseInt(d)]).join('');
  };

  return (
    <div className="space-y-3">
      {/* Calendar Type Toggle */}
      {showBothCalendars && (
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setCalendarType('gregorian')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              calendarType === 'gregorian'
                ? 'bg-saudi-green text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {locale === 'ar' ? 'ميلادي' : 'Gregorian'}
          </button>
          <button
            onClick={() => setCalendarType('hijri')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              calendarType === 'hijri'
                ? 'bg-saudi-green text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {locale === 'ar' ? 'هجري' : 'Hijri'}
          </button>
        </div>
      )}

      {/* Gregorian Date Input */}
      <div className="relative">
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          {locale === 'ar' ? 'التاريخ الميلادي' : 'Gregorian Date'}
        </label>
        <div className="relative">
          <input
            type="date"
            value={formatGregorian(gregorianDate)}
            onChange={handleGregorianChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-saudi-green focus:border-transparent"
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          />
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Hijri Date Display */}
      {showBothCalendars && hijriDate && (
        <div className="p-3 bg-saudi-green/10 dark:bg-saudi-green/20 rounded-lg border border-saudi-green/30">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {locale === 'ar' ? 'التاريخ الهجري' : 'Hijri Date'}
          </div>
          <div className="text-lg font-semibold text-saudi-green" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            {formatHijriDisplay(hijriDate)}
          </div>
        </div>
      )}

      {/* Special Islamic Events Indicator */}
      {hijriDate && (
        <>
          {hijriDate.month === 9 && (
            <div className="flex items-center gap-2 p-2 bg-purple-100 dark:bg-purple-900/30 rounded text-sm">
              <span className="text-purple-600 dark:text-purple-400">🌙</span>
              <span className="text-purple-800 dark:text-purple-200">
                {locale === 'ar' ? 'شهر رمضان المبارك' : 'Holy Month of Ramadan'}
              </span>
            </div>
          )}
          {hijriDate.month === 12 && hijriDate.day >= 8 && hijriDate.day <= 13 && (
            <div className="flex items-center gap-2 p-2 bg-green-100 dark:bg-green-900/30 rounded text-sm">
              <span className="text-green-600 dark:text-green-400">🕋</span>
              <span className="text-green-800 dark:text-green-200">
                {locale === 'ar' ? 'موسم الحج' : 'Hajj Season'}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
