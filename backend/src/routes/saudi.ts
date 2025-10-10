/**
 * Saudi-specific API Routes
 */

import express from 'express';
import { Pool } from 'pg';
import HijriCalendarService from '../services/saudi/hijriCalendar';
import PrayerTimesService from '../services/saudi/prayerTimes';
import SeasonalHealthService from '../services/saudi/seasonalHealth';
import NationalAddressService from '../services/saudi/nationalAddress';
import PhoneValidationService from '../services/localization/phoneValidation';

const router = express.Router();

export default function createSaudiRoutes(db: Pool) {
  const seasonalHealth = new SeasonalHealthService(db);

  // Hijri Calendar
  router.get('/hijri/current', (req, res) => {
    const hijri = HijriCalendarService.getCurrentHijri();
    res.json({ success: true, data: hijri });
  });

  router.get('/hijri/convert', (req, res) => {
    const { date } = req.query;
    const gregorian = date ? new Date(date as string) : new Date();
    const hijri = HijriCalendarService.gregorianToHijri(gregorian);
    res.json({ success: true, data: hijri });
  });

  router.get('/hijri/ramadan/:year', (req, res) => {
    const year = parseInt(req.params.year);
    const dates = HijriCalendarService.getRamadanDates(year);
    res.json({ success: true, data: dates });
  });

  router.get('/hijri/hajj/:year', (req, res) => {
    const year = parseInt(req.params.year);
    const dates = HijriCalendarService.getHajjDates(year);
    res.json({ success: true, data: dates });
  });

  // Prayer Times
  router.get('/prayer-times/:city', (req, res) => {
    const { city } = req.params;
    const times = PrayerTimesService.getPrayerTimes(city);
    
    if (!times) {
      return res.status(404).json({ success: false, error: 'City not found' });
    }
    
    res.json({ success: true, data: times });
  });

  router.get('/prayer-times/next/:city', (req, res) => {
    const { city } = req.params;
    const next = PrayerTimesService.getNextPrayer(city);
    
    if (!next) {
      return res.status(404).json({ success: false, error: 'City not found' });
    }
    
    res.json({ success: true, data: next });
  });

  router.get('/prayer-times/cities', (req, res) => {
    const cities = PrayerTimesService.getSaudiCities();
    res.json({ success: true, data: cities });
  });

  // Seasonal Health
  router.get('/seasonal-health/alerts', async (req, res) => {
    try {
      const alerts = await seasonalHealth.getCurrentSeasonalAlerts();
      res.json({ success: true, data: alerts });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch alerts' });
    }
  });

  router.post('/seasonal-health/ramadan-schedule', async (req, res) => {
    try {
      const { visitorId, medications } = req.body;
      const schedule = await seasonalHealth.createRamadanSchedule(visitorId, medications);
      res.json({ success: true, data: schedule });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to create schedule' });
    }
  });

  router.get('/seasonal-health/hajj-metrics/:location', async (req, res) => {
    try {
      const { location } = req.params;
      const metrics = await seasonalHealth.getHajjHealthMetrics(location);
      res.json({ success: true, data: metrics });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch metrics' });
    }
  });

  // National Address
  router.post('/address/validate', (req, res) => {
    const { postalCode, buildingNumber, additionalNumber } = req.body;
    
    const validation = {
      postalCode: NationalAddressService.validatePostalCode(postalCode),
      buildingNumber: NationalAddressService.validateBuildingNumber(buildingNumber),
      additionalNumber: NationalAddressService.validateAdditionalNumber(additionalNumber)
    };
    
    res.json({ success: true, data: validation });
  });

  // Phone Validation
  router.post('/phone/validate', (req, res) => {
    const { phone } = req.body;
    
    const isValid = PhoneValidationService.validateSaudiPhone(phone);
    const formatted = isValid ? PhoneValidationService.formatToInternational(phone) : null;
    const carrier = isValid ? PhoneValidationService.getCarrier(phone) : null;
    
    res.json({ 
      success: true, 
      data: { isValid, formatted, carrier }
    });
  });

  // Regional Health Stats
  router.get('/regional-health/:region', async (req, res) => {
    try {
      const { region } = req.params;
      const result = await db.query(
        'SELECT * FROM regional_health_stats WHERE region = $1 ORDER BY stat_date DESC LIMIT 30',
        [region]
      );
      res.json({ success: true, data: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch stats' });
    }
  });

  // Emergency Contacts
  router.get('/emergency/:region', async (req, res) => {
    try {
      const { region } = req.params;
      const result = await db.query(
        'SELECT * FROM emergency_contacts WHERE region = $1',
        [region]
      );
      res.json({ success: true, data: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch contacts' });
    }
  });

  return router;
}
