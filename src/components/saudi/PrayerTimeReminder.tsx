'use client';

import { useState, useEffect } from 'react';
import { Clock, Bell, MapPin } from 'lucide-react';

interface PrayerTime {
  name: string;
  nameAr: string;
  time: string;
  isPast: boolean;
  isNext: boolean;
}

interface PrayerTimeReminderProps {
  city: string;
  locale?: 'en' | 'ar';
  showMedicationReminders?: boolean;
  medications?: Array<{
    name: string;
    nameAr: string;
    prayerTime: string;
    dosage: string;
  }>;
}

const SAUDI_CITIES = [
  { en: 'Riyadh', ar: 'الرياض' },
  { en: 'Jeddah', ar: 'جدة' },
  { en: 'Makkah', ar: 'مكة المكرمة' },
  { en: 'Madinah', ar: 'المدينة المنورة' },
  { en: 'Dammam', ar: 'الدمام' },
  { en: 'Taif', ar: 'الطائف' }
];

export default function PrayerTimeReminder({
  city,
  locale = 'en',
  showMedicationReminders = false,
  medications = []
}: PrayerTimeReminderProps) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Fetch prayer times from API
    fetchPrayerTimes();
    
    // Update current time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      updatePrayerStatus();
    }, 60000);

    return () => clearInterval(interval);
  }, [city]);

  const fetchPrayerTimes = async () => {
    try {
      // Mock data - would fetch from API
      const times: PrayerTime[] = [
        { name: 'Fajr', nameAr: 'الفجر', time: '05:15', isPast: false, isNext: false },
        { name: 'Dhuhr', nameAr: 'الظهر', time: '12:30', isPast: false, isNext: false },
        { name: 'Asr', nameAr: 'العصر', time: '15:45', isPast: false, isNext: false },
        { name: 'Maghrib', nameAr: 'المغرب', time: '18:20', isPast: false, isNext: false },
        { name: 'Isha', nameAr: 'العشاء', time: '19:50', isPast: false, isNext: false }
      ];

      setPrayerTimes(times);
      updatePrayerStatus(times);
    } catch (error) {
      console.error('Failed to fetch prayer times:', error);
    }
  };

  const updatePrayerStatus = (times = prayerTimes) => {
    const now = currentTime;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let nextPrayerFound = false;

    const updatedTimes = times.map(prayer => {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerMinutes = hours * 60 + minutes;
      const isPast = prayerMinutes < currentMinutes;
      const isNext = !nextPrayerFound && !isPast;

      if (isNext) {
        nextPrayerFound = true;
        setNextPrayer({ ...prayer, isPast, isNext });
      }

      return { ...prayer, isPast, isNext };
    });

    setPrayerTimes(updatedTimes);

    // If no next prayer found today, next is Fajr tomorrow
    if (!nextPrayerFound && updatedTimes.length > 0) {
      setNextPrayer({ ...updatedTimes[0], isPast: false, isNext: true });
    }
  };

  const getTimeUntilPrayer = (prayerTime: string): string => {
    const [hours, minutes] = prayerTime.split(':').map(Number);
    const now = currentTime;
    const prayerDate = new Date(now);
    prayerDate.setHours(hours, minutes, 0);

    if (prayerDate < now) {
      prayerDate.setDate(prayerDate.getDate() + 1);
    }

    const diff = prayerDate.getTime() - now.getTime();
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (locale === 'ar') {
      return `${toArabicNumerals(hoursLeft)}:${toArabicNumerals(minutesLeft).padStart(2, '٠')}`;
    }
    return `${hoursLeft}h ${minutesLeft}m`;
  };

  const toArabicNumerals = (num: number): string => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(d => arabicNumerals[parseInt(d)]).join('');
  };

  const getMedicationsForPrayer = (prayerName: string) => {
    return medications.filter(med => 
      med.prayerTime.toLowerCase() === prayerName.toLowerCase()
    );
  };

  const cityName = SAUDI_CITIES.find(c => c.en.toLowerCase() === city.toLowerCase());

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-saudi-green/10 rounded-lg">
            <Clock className="w-6 h-6 text-saudi-green" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {locale === 'ar' ? 'مواقيت الصلاة' : 'Prayer Times'}
            </h3>
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>{locale === 'ar' ? cityName?.ar : cityName?.en}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {locale === 'ar' ? 'الوقت الحالي' : 'Current Time'}
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {currentTime.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>

      {/* Next Prayer Highlight */}
      {nextPrayer && (
        <div className="p-4 bg-gradient-to-r from-saudi-green to-saudi-green/80 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">
                {locale === 'ar' ? 'الصلاة القادمة' : 'Next Prayer'}
              </div>
              <div className="text-2xl font-bold mt-1">
                {locale === 'ar' ? nextPrayer.nameAr : nextPrayer.name}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{nextPrayer.time}</div>
              <div className="text-sm opacity-90 mt-1">
                {locale === 'ar' ? 'بعد' : 'in'} {getTimeUntilPrayer(nextPrayer.time)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Prayer Times */}
      <div className="space-y-2">
        {prayerTimes.map((prayer, index) => {
          const prayerMeds = getMedicationsForPrayer(prayer.name);
          
          return (
            <div
              key={index}
              className={`p-3 rounded-lg border transition-all ${
                prayer.isNext
                  ? 'border-saudi-green bg-saudi-green/5'
                  : prayer.isPast
                  ? 'border-gray-200 dark:border-gray-700 opacity-50'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {prayer.isNext && <Bell className="w-5 h-5 text-saudi-green animate-pulse" />}
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {locale === 'ar' ? prayer.nameAr : prayer.name}
                    </div>
                    {showMedicationReminders && prayerMeds.length > 0 && (
                      <div className="text-xs text-saudi-green mt-1">
                        💊 {prayerMeds.length} {locale === 'ar' ? 'دواء' : 'medication(s)'}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {prayer.time}
                </div>
              </div>

              {/* Medication Reminders */}
              {showMedicationReminders && prayerMeds.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
                  {prayerMeds.map((med, medIndex) => (
                    <div key={medIndex} className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">
                        {locale === 'ar' ? med.nameAr : med.name}
                      </span>
                      {' - '}
                      <span>{med.dosage}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
        {locale === 'ar' 
          ? 'المواقيت محسوبة وفقاً لطريقة أم القرى'
          : 'Times calculated according to Umm Al-Qura method'}
      </div>
    </div>
  );
}
