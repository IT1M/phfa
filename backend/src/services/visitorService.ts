import { pool } from '../config/database';
import { encrypt, decrypt } from '../utils/encryption';
import { sendWelcomeEmail } from '../utils/email';
import { ExcelExportService } from './excelExportService';
import Joi from 'joi';

const emailSchema = Joi.string().email().required();

export class VisitorService {
  private excelExportService: ExcelExportService;

  constructor() {
    this.excelExportService = new ExcelExportService();
  }

  async registerVisitor(email: string, metadata?: any) {
    const { error } = emailSchema.validate(email);
    if (error) {
      throw new Error('Invalid email format');
    }

    const encryptedEmail = encrypt(email);

    // Merge metadata with defaults
    const visitorMetadata = {
      language: metadata?.language || 'en',
      device_type: metadata?.device_type || 'unknown',
      city: metadata?.city || null,
      region: metadata?.region || null,
      notifications_enabled: metadata?.notifications_enabled || 'false',
      ...metadata
    };

    const result = await pool.query(
      `INSERT INTO visitors (email, encrypted_email, metadata)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) 
       DO UPDATE SET 
         last_activity = CURRENT_TIMESTAMP, 
         activity_count = visitors.activity_count + 1,
         metadata = $3
       RETURNING id, email, registration_date`,
      [email, encryptedEmail, JSON.stringify(visitorMetadata)]
    );

    await sendWelcomeEmail(email);

    return result.rows[0];
  }

  async trackActivity(visitorId: string, activityData?: any) {
    const metadata = activityData ? JSON.stringify(activityData) : null;
    
    await pool.query(
      `UPDATE visitors 
       SET last_activity = CURRENT_TIMESTAMP, 
           activity_count = activity_count + 1,
           metadata = CASE 
             WHEN $2::jsonb IS NOT NULL THEN metadata || $2::jsonb 
             ELSE metadata 
           END
       WHERE id = $1`,
      [visitorId, metadata]
    );
  }

  async getVisitorAnalytics() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_visitors,
        COUNT(CASE WHEN last_activity > NOW() - INTERVAL '7 days' THEN 1 END) as active_last_week,
        COUNT(CASE WHEN last_activity > NOW() - INTERVAL '30 days' THEN 1 END) as active_last_month,
        AVG(activity_count) as avg_activity_count,
        COUNT(CASE WHEN metadata->>'language' = 'ar' THEN 1 END) as arabic_users,
        COUNT(CASE WHEN metadata->>'language' = 'en' THEN 1 END) as english_users
      FROM visitors
    `);

    return result.rows[0];
  }

  async getDetailedAnalytics(startDate?: Date, endDate?: Date) {
    const params: any[] = [];
    let dateFilter = '';

    if (startDate) {
      params.push(startDate);
      dateFilter += ` AND registration_date >= $${params.length}`;
    }
    if (endDate) {
      params.push(endDate);
      dateFilter += ` AND registration_date <= $${params.length}`;
    }

    const query = `
      SELECT 
        COUNT(*) as total_visitors,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_visitors,
        AVG(activity_count) as avg_activity,
        COUNT(DISTINCT metadata->>'city') as unique_cities,
        COUNT(DISTINCT metadata->>'region') as unique_regions,
        json_agg(DISTINCT metadata->>'device_type') as device_types,
        json_agg(DISTINCT metadata->>'language') as languages
      FROM visitors
      WHERE 1=1 ${dateFilter}
    `;

    const result = await pool.query(query, params);
    return result.rows[0];
  }

  async exportToExcel(options?: { startDate?: Date; endDate?: Date; includeInactive?: boolean }) {
    return await this.excelExportService.generateVisitorExport(options || {});
  }

  async streamExport(writeStream: NodeJS.WritableStream, options?: any) {
    return await this.excelExportService.streamVisitorExport(writeStream, options || {});
  }
}
