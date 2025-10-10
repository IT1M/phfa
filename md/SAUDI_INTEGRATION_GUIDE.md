# 🇸🇦 Saudi Features Integration Guide

## Quick Integration Steps

### Step 1: Install Dependencies (2 minutes)

```bash
# Root directory
npm install

# Backend
cd backend
npm install
cd ..
```

### Step 2: Run Setup Script (3 minutes)

```bash
chmod +x setup-saudi-features.sh
./setup-saudi-features.sh
```

This automatically:
- ✅ Creates database tables
- ✅ Configures environment variables
- ✅ Verifies services
- ✅ Tests connections

### Step 3: Update Backend Server (1 minute)

Add Saudi routes to your Express server:

```typescript
// backend/src/server.ts

import createSaudiRoutes from './routes/saudi';

// After other routes
app.use('/api/saudi', createSaudiRoutes(db));
```

### Step 4: Use Components (Immediate)

#### Hijri Date Picker
```tsx
import HijriDatePicker from '@/components/saudi/HijriDatePicker';

<HijriDatePicker
  value={date}
  onChange={setDate}
  locale="ar"
  showBothCalendars={true}
/>
```

#### Prayer Times
```tsx
import PrayerTimeReminder from '@/components/saudi/PrayerTimeReminder';

<PrayerTimeReminder
  city="riyadh"
  locale="ar"
  showMedicationReminders={true}
  medications={[
    {
      name: "Metformin",
      nameAr: "ميتفورمين",
      prayerTime: "maghrib",
      dosage: "500mg"
    }
  ]}
/>
```

#### Ramadan Scheduler
```tsx
import RamadanScheduler from '@/components/saudi/RamadanScheduler';

<RamadanScheduler
  locale="ar"
  onSave={(medications) => {
    console.log('Saved:', medications);
  }}
/>
```

---

## API Usage Examples

### Get Current Hijri Date
```typescript
const response = await fetch('/api/saudi/hijri/current');
const { data } = await response.json();
// { day: 15, month: 9, year: 1446, monthName: "Ramadan", ... }
```

### Get Prayer Times
```typescript
const response = await fetch('/api/saudi/prayer-times/riyadh');
const { data } = await response.json();
// { fajr: "05:15", dhuhr: "12:30", ... }
```

### Get Seasonal Alerts
```typescript
const response = await fetch('/api/saudi/seasonal-health/alerts');
const { data } = await response.json();
// [{ season: "ramadan", title: "...", severity: "high", ... }]
```

### Validate Saudi Phone
```typescript
const response = await fetch('/api/saudi/phone/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phone: '0501234567' })
});
const { data } = await response.json();
// { isValid: true, formatted: "+966501234567", carrier: "STC" }
```

### Validate National Address
```typescript
const response = await fetch('/api/saudi/address/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    postalCode: '12345',
    buildingNumber: '1234',
    additionalNumber: '5678'
  })
});
const { data } = await response.json();
// { postalCode: true, buildingNumber: true, additionalNumber: true }
```

---

## Frontend Integration Patterns

### 1. Add to Dashboard

```tsx
// src/app/dashboard/page.tsx

import PrayerTimeReminder from '@/components/saudi/PrayerTimeReminder';
import HijriDatePicker from '@/components/saudi/HijriDatePicker';

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Existing dashboard content */}
      
      {/* Add Prayer Times Widget */}
      <div className="lg:col-span-1">
        <PrayerTimeReminder city="riyadh" locale="ar" />
      </div>
    </div>
  );
}
```

### 2. Add to Profile Settings

```tsx
// src/app/profile/page.tsx

import { useState } from 'react';
import { validateSaudiPhone, formatSaudiPhone } from '@/lib/saudi/validators';

export default function Profile() {
  const [phone, setPhone] = useState('');
  const [isValid, setIsValid] = useState(false);

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    setIsValid(validateSaudiPhone(value));
  };

  return (
    <div>
      <input
        type="tel"
        value={phone}
        onChange={(e) => handlePhoneChange(e.target.value)}
        placeholder="+966 5X XXX XXXX"
        className={isValid ? 'border-green-500' : 'border-red-500'}
      />
      {isValid && (
        <p className="text-green-600">
          ✓ {formatSaudiPhone(phone)}
        </p>
      )}
    </div>
  );
}
```

### 3. Add Ramadan Mode Toggle

```tsx
// src/components/layout/Header.tsx

import { useEffect, useState } from 'react';

export default function Header() {
  const [isRamadan, setIsRamadan] = useState(false);

  useEffect(() => {
    fetch('/api/saudi/hijri/current')
      .then(res => res.json())
      .then(({ data }) => {
        setIsRamadan(data.month === 9); // Ramadan is 9th month
      });
  }, []);

  return (
    <header>
      {isRamadan && (
        <div className="bg-purple-600 text-white text-center py-2">
          🌙 رمضان كريم - Ramadan Kareem
        </div>
      )}
      {/* Rest of header */}
    </header>
  );
}
```

---

## Backend Service Usage

### Using Hijri Calendar Service

```typescript
import HijriCalendarService from './services/saudi/hijriCalendar';

// Get current Hijri date
const hijri = HijriCalendarService.getCurrentHijri();
console.log(hijri.formatted); // "15 Ramadan 1446"

// Convert Gregorian to Hijri
const date = new Date('2025-03-15');
const hijriDate = HijriCalendarService.gregorianToHijri(date);

// Check if Ramadan
const isRamadan = HijriCalendarService.isRamadan(new Date());

// Get Ramadan dates for a year
const ramadanDates = HijriCalendarService.getRamadanDates(2025);
console.log(ramadanDates); // { start: Date, end: Date }
```

### Using Prayer Times Service

```typescript
import PrayerTimesService from './services/saudi/prayerTimes';

// Get prayer times for a city
const times = PrayerTimesService.getPrayerTimes('riyadh');
console.log(times);
// { fajr: "05:15", dhuhr: "12:30", asr: "15:45", ... }

// Get next prayer
const next = PrayerTimesService.getNextPrayer('jeddah');
console.log(next);
// { name: "Asr", nameAr: "العصر", time: "15:45" }

// Get all supported cities
const cities = PrayerTimesService.getSaudiCities();
console.log(cities); // ["riyadh", "jeddah", "makkah", ...]
```

### Using Seasonal Health Service

```typescript
import SeasonalHealthService from './services/saudi/seasonalHealth';

const service = new SeasonalHealthService(db);

// Get current seasonal alerts
const alerts = await service.getCurrentSeasonalAlerts();

// Create Ramadan medication schedule
const schedule = await service.createRamadanSchedule(visitorId, [
  {
    name: "Metformin",
    nameAr: "ميتفورمين",
    timing: "morning",
    dosage: "500mg"
  }
]);

// Get Hajj health metrics
const metrics = await service.getHajjHealthMetrics('arafat');
console.log(metrics.heatStrokeRisk); // "high"
```

---

## Database Queries

### Get Visitor's Prayer Reminders

```sql
SELECT 
  pr.*,
  v.email,
  v.preferred_calendar
FROM prayer_reminders pr
JOIN visitors v ON v.id = pr.visitor_id
WHERE pr.visitor_id = $1 
  AND pr.is_active = true
ORDER BY 
  CASE pr.prayer_time
    WHEN 'fajr' THEN 1
    WHEN 'dhuhr' THEN 2
    WHEN 'asr' THEN 3
    WHEN 'maghrib' THEN 4
    WHEN 'isha' THEN 5
  END;
```

### Get Regional Health Statistics

```sql
SELECT 
  region,
  stat_type,
  AVG(stat_value) as avg_value,
  MAX(stat_date) as latest_date
FROM regional_health_stats
WHERE region = $1
  AND stat_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY region, stat_type
ORDER BY stat_type;
```

### Get Emergency Contacts by Region

```sql
SELECT 
  name,
  name_ar,
  phone,
  service_type,
  available_24_7,
  coordinates
FROM emergency_contacts
WHERE region = $1
ORDER BY 
  CASE service_type
    WHEN 'ambulance' THEN 1
    WHEN 'hospital' THEN 2
    WHEN 'clinic' THEN 3
  END,
  name;
```

---

## Environment Variables

### Required Variables

```bash
# backend/.env

# Saudi Features
SAUDI_FEATURES_ENABLED=true
DEFAULT_CITY=riyadh
DEFAULT_LOCALE=ar

# Calendar & Prayer
ENABLE_HIJRI_CALENDAR=true
ENABLE_PRAYER_TIMES=true

# Seasonal Features
ENABLE_RAMADAN_MODE=true
ENABLE_HAJJ_MODE=true

# Compliance
MOH_COMPLIANCE_ENABLED=true
SFDA_INTEGRATION_ENABLED=true
DATA_RESIDENCY=saudi_arabia
```

### Optional Variables

```bash
# Prayer Time Calculation Method
PRAYER_CALCULATION_METHOD=umm_al_qura

# Default Prayer Time Adjustments (minutes)
FAJR_ADJUSTMENT=0
ISHA_ADJUSTMENT=0

# Seasonal Alert Thresholds
HEAT_ALERT_THRESHOLD=45
CROWD_DENSITY_THRESHOLD=80

# Regional Settings
ENABLE_REGIONAL_STATS=true
ENABLE_EMERGENCY_CONTACTS=true
```

---

## Testing

### Test Hijri Calendar

```bash
cd backend
npx ts-node -e "
import HijriCalendarService from './src/services/saudi/hijriCalendar';

const hijri = HijriCalendarService.getCurrentHijri();
console.log('Current Hijri:', hijri.formatted);
console.log('Is Ramadan:', HijriCalendarService.isRamadan());
console.log('Is Hajj:', HijriCalendarService.isHajjSeason());
"
```

### Test Prayer Times

```bash
cd backend
npx ts-node -e "
import PrayerTimesService from './src/services/saudi/prayerTimes';

const times = PrayerTimesService.getPrayerTimes('riyadh');
console.log('Riyadh Prayer Times:', times);

const next = PrayerTimesService.getNextPrayer('riyadh');
console.log('Next Prayer:', next);
"
```

### Test Phone Validation

```bash
cd backend
npx ts-node -e "
import PhoneValidationService from './src/services/localization/phoneValidation';

const tests = ['0501234567', '+966501234567', '501234567'];
tests.forEach(phone => {
  const isValid = PhoneValidationService.validateSaudiPhone(phone);
  const formatted = PhoneValidationService.formatToInternational(phone);
  const carrier = PhoneValidationService.getCarrier(phone);
  console.log({ phone, isValid, formatted, carrier });
});
"
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL status
pg_isready

# Start PostgreSQL
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Verify connection
psql -U postgres -d medical_docs -c "SELECT 1;"
```

### Migration Errors

```bash
# Re-run migration
cd backend
psql -U postgres -d medical_docs -f src/database/migrations/007_saudi_features.sql

# Check tables
psql -U postgres -d medical_docs -c "\dt"
```

### API Endpoint Not Found

```bash
# Verify route is registered in server.ts
grep "saudi" backend/src/server.ts

# Check server logs
cd backend
npm run dev
# Look for "Saudi routes registered" message
```

### TypeScript Compilation Errors

```bash
# Clean and rebuild
cd backend
rm -rf dist
npm run build

# Check for errors
npx tsc --noEmit
```

---

## Performance Optimization

### Database Indexing

Already included in migration:
- ✅ `idx_hijri_events_date`
- ✅ `idx_seasonal_health_season`
- ✅ `idx_prayer_reminders_visitor`
- ✅ `idx_regional_stats_region`
- ✅ `idx_sfda_code`
- ✅ `idx_emergency_region`

### Caching Strategy

```typescript
// Cache prayer times for 24 hours
import NodeCache from 'node-cache';

const prayerCache = new NodeCache({ stdTTL: 86400 });

app.get('/api/saudi/prayer-times/:city', (req, res) => {
  const { city } = req.params;
  const cacheKey = `prayer_${city}_${new Date().toDateString()}`;
  
  let times = prayerCache.get(cacheKey);
  if (!times) {
    times = PrayerTimesService.getPrayerTimes(city);
    prayerCache.set(cacheKey, times);
  }
  
  res.json({ success: true, data: times });
});
```

---

## Security Considerations

### Input Validation

```typescript
import Joi from 'joi';

const phoneSchema = Joi.string()
  .pattern(/^(\+?966|0)?5\d{8}$/)
  .required();

const addressSchema = Joi.object({
  postalCode: Joi.string().pattern(/^\d{5}$/).required(),
  buildingNumber: Joi.string().pattern(/^\d{4}$/).required(),
  additionalNumber: Joi.string().pattern(/^\d{4}$/).required()
});
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const saudiApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/saudi', saudiApiLimiter);
```

---

## Next Steps

1. ✅ Run setup script
2. ✅ Test API endpoints
3. ✅ Integrate components
4. ✅ Configure environment
5. ✅ Test in production

## Support

- 📖 Documentation: `SAUDI_FEATURES_COMPLETE.md`
- ⚖️ Compliance: `SAUDI_COMPLIANCE.md`
- 🚀 Setup: `setup-saudi-features.sh`

---

**🇸🇦 Ready to serve Saudi healthcare!**
