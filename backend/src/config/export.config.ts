export const exportConfig = {
  // Schedule settings (Saudi Arabia timezone)
  schedule: {
    enabled: process.env.ENABLE_SCHEDULED_EXPORTS === 'true',
    hour: parseInt(process.env.EXPORT_SCHEDULE_HOUR || '2'), // 2 AM Saudi time
    minute: parseInt(process.env.EXPORT_SCHEDULE_MINUTE || '0')
  },

  // Storage settings
  storage: {
    provider: process.env.CLOUD_STORAGE_PROVIDER || 'local',
    bucket: process.env.CLOUD_STORAGE_BUCKET,
    path: process.env.CLOUD_STORAGE_PATH || 'exports',
    region: process.env.CLOUD_STORAGE_REGION || 'me-south-1' // Bahrain region for Saudi Arabia
  },

  // Retention settings
  retention: {
    daysToKeep: parseInt(process.env.EXPORT_RETENTION_DAYS || '30')
  },

  // Export directory
  exportDir: process.env.EXPORT_DIR || './exports',

  // Saudi-specific settings
  locale: {
    timezone: 'Asia/Riyadh',
    language: 'ar-SA',
    currency: 'SAR',
    dateFormat: 'dd/mm/yyyy',
    timeFormat: 'HH:mm'
  }
};
