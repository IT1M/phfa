import { pool } from '../config/database';
import { logger } from '../utils/logger';

export class AdminService {
    // Dashboard Overview Metrics
    async getDashboardMetrics() {
        const [visitors, documents, processing, errors] = await Promise.all([
            this.getVisitorMetrics(),
            this.getDocumentMetrics(),
            this.getProcessingMetrics(),
            this.getErrorMetrics()
        ]);

        return {
            visitors,
            documents,
            processing,
            errors,
            timestamp: new Date().toISOString()
        };
    }

    private async getVisitorMetrics() {
        const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN last_activity > NOW() - INTERVAL '24 hours' THEN 1 END) as active_today,
        COUNT(CASE WHEN last_activity > NOW() - INTERVAL '7 days' THEN 1 END) as active_week,
        COUNT(CASE WHEN registration_date > NOW() - INTERVAL '24 hours' THEN 1 END) as new_today
      FROM visitors
    `);
        return result.rows[0];
    }

    private async getDocumentMetrics() {
        const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN upload_date > NOW() - INTERVAL '24 hours' THEN 1 END) as uploaded_today,
        COUNT(CASE WHEN status = 'processed' THEN 1 END) as processed,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
      FROM documents
    `);
        return result.rows[0];
    }

    private async getProcessingMetrics() {
        const result = await pool.query(`
      SELECT 
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as queued,
        AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_processing_time
      FROM documents
      WHERE started_at IS NOT NULL
    `);
        return result.rows[0];
    }

    private async getErrorMetrics() {
        const result = await pool.query(`
      SELECT 
        COUNT(*) as total_errors,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as errors_today
      FROM system_logs
      WHERE level = 'error'
    `);
        return result.rows[0];
    }

    // Visitor Management
    async getVisitorsList(params: {
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        startDate?: Date;
        endDate?: Date;
    }) {
        const page = params.page || 1;
        const limit = params.limit || 50;
        const offset = (page - 1) * limit;
        const sortBy = params.sortBy || 'registration_date';
        const sortOrder = params.sortOrder || 'desc';

        let whereClause = 'WHERE 1=1';
        const queryParams: any[] = [];

        if (params.search) {
            queryParams.push(`%${params.search}%`);
            whereClause += ` AND email ILIKE $${queryParams.length}`;
        }

        if (params.startDate) {
            queryParams.push(params.startDate);
            whereClause += ` AND registration_date >= $${queryParams.length}`;
        }

        if (params.endDate) {
            queryParams.push(params.endDate);
            whereClause += ` AND registration_date <= $${queryParams.length}`;
        }

        const countQuery = `SELECT COUNT(*) FROM visitors ${whereClause}`;
        const countResult = await pool.query(countQuery, queryParams);
        const total = parseInt(countResult.rows[0].count);

        queryParams.push(limit, offset);
        const dataQuery = `
      SELECT 
        id, email, registration_date, last_activity, activity_count,
        is_active, metadata
      FROM visitors
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
    `;

        const dataResult = await pool.query(dataQuery, queryParams);

        return {
            data: dataResult.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getVisitorTimeline(days: number = 30) {
        const result = await pool.query(`
      SELECT 
        DATE(registration_date) as date,
        COUNT(*) as count
      FROM visitors
      WHERE registration_date > NOW() - INTERVAL '${days} days'
      GROUP BY DATE(registration_date)
      ORDER BY date ASC
    `);
        return result.rows;
    }

    async getGeographicDistribution() {
        const result = await pool.query(`
      SELECT 
        metadata->>'region' as region,
        metadata->>'city' as city,
        COUNT(*) as count
      FROM visitors
      WHERE metadata->>'region' IS NOT NULL
      GROUP BY metadata->>'region', metadata->>'city'
      ORDER BY count DESC
      LIMIT 50
    `);
        return result.rows;
    }

    async calculateEngagementScores() {
        const result = await pool.query(`
      SELECT 
        id, email,
        CASE 
          WHEN activity_count > 50 THEN 'high'
          WHEN activity_count > 20 THEN 'medium'
          ELSE 'low'
        END as engagement_level,
        activity_count,
        EXTRACT(DAYS FROM (NOW() - last_activity)) as days_since_activity
      FROM visitors
      ORDER BY activity_count DESC
      LIMIT 100
    `);
        return result.rows;
    }

    // Document Management
    async getDocumentQueue() {
        const result = await pool.query(`
      SELECT 
        d.id, d.filename, d.status, d.upload_date, d.started_at,
        v.email as uploader_email,
        EXTRACT(EPOCH FROM (NOW() - d.upload_date)) as wait_time
      FROM documents d
      LEFT JOIN visitors v ON d.visitor_id = v.id
      WHERE d.status IN ('pending', 'processing')
      ORDER BY d.upload_date ASC
    `);
        return result.rows;
    }

    async getProcessingStats(days: number = 7) {
        const result = await pool.query(`
      SELECT 
        DATE(upload_date) as date,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'processed' THEN 1 END) as successful,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_time
      FROM documents
      WHERE upload_date > NOW() - INTERVAL '${days} days'
      GROUP BY DATE(upload_date)
      ORDER BY date DESC
    `);
        return result.rows;
    }

    async getFailedDocuments(limit: number = 50) {
        const result = await pool.query(`
      SELECT 
        d.id, d.filename, d.upload_date, d.error_message,
        v.email as uploader_email
      FROM documents d
      LEFT JOIN visitors v ON d.visitor_id = v.id
      WHERE d.status = 'failed'
      ORDER BY d.upload_date DESC
      LIMIT $1
    `, [limit]);
        return result.rows;
    }

    // Analytics
    async getUsagePatterns(days: number = 30) {
        const result = await pool.query(`
      SELECT 
        EXTRACT(HOUR FROM last_activity) as hour,
        COUNT(*) as activity_count
      FROM visitors
      WHERE last_activity > NOW() - INTERVAL '${days} days'
      GROUP BY EXTRACT(HOUR FROM last_activity)
      ORDER BY hour
    `);
        return result.rows;
    }

    async getTrendAnalysis(days: number = 30) {
        const [visitors, documents, searches] = await Promise.all([
            pool.query(`
        SELECT DATE(registration_date) as date, COUNT(*) as count
        FROM visitors
        WHERE registration_date > NOW() - INTERVAL '${days} days'
        GROUP BY DATE(registration_date)
        ORDER BY date
      `),
            pool.query(`
        SELECT DATE(upload_date) as date, COUNT(*) as count
        FROM documents
        WHERE upload_date > NOW() - INTERVAL '${days} days'
        GROUP BY DATE(upload_date)
        ORDER BY date
      `),
            pool.query(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM search_logs
        WHERE created_at > NOW() - INTERVAL '${days} days'
        GROUP BY DATE(created_at)
        ORDER BY date
      `)
        ]);

        return {
            visitors: visitors.rows,
            documents: documents.rows,
            searches: searches.rows
        };
    }

    async getDeviceAnalytics() {
        const result = await pool.query(`
      SELECT 
        metadata->>'device_type' as device,
        COUNT(*) as count,
        AVG(activity_count) as avg_activity
      FROM visitors
      WHERE metadata->>'device_type' IS NOT NULL
      GROUP BY metadata->>'device_type'
      ORDER BY count DESC
    `);
        return result.rows;
    }

    async getLanguageDistribution() {
        const result = await pool.query(`
      SELECT 
        metadata->>'language' as language,
        COUNT(*) as count
      FROM visitors
      WHERE metadata->>'language' IS NOT NULL
      GROUP BY metadata->>'language'
    `);
        return result.rows as Array<{ language: string; count: number }>;
    }

    // System Settings
    async getSystemConfig() {
        const result = await pool.query(`
      SELECT key, value, updated_at
      FROM system_config
      ORDER BY key
    `);
        return result.rows;
    }

    async updateSystemConfig(key: string, value: string) {
        await pool.query(`
      INSERT INTO system_config (key, value, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (key) 
      DO UPDATE SET value = $2, updated_at = NOW()
    `, [key, value]);

        logger.info(`System config updated: ${key}`);
    }

    // Real-time Stats
    async getRealtimeStats() {
        const result = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM visitors WHERE last_activity > NOW() - INTERVAL '5 minutes') as active_users,
        (SELECT COUNT(*) FROM documents WHERE status = 'processing') as processing_docs,
        (SELECT COUNT(*) FROM system_logs WHERE level = 'error' AND created_at > NOW() - INTERVAL '1 hour') as recent_errors,
        (SELECT AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) 
         FROM documents 
         WHERE completed_at > NOW() - INTERVAL '1 hour') as avg_processing_time
    `);
        return result.rows[0];
    }

    // Bulk Operations
    async bulkEmailVisitors(visitorIds: string[], subject: string, body: string) {
        const result = await pool.query(`
      SELECT email FROM visitors WHERE id = ANY($1)
    `, [visitorIds]);

        const emails = result.rows.map((r: any) => r.email);
        
        // TODO: Integrate with email service
        // For now, just log the action
        logger.info(`Bulk email to ${emails.length} visitors: ${subject}`);
        logger.info(`Email body preview: ${body.substring(0, 100)}...`);

        // In production, you would send emails here using the email utility
        // Example: await sendBulkEmail(emails, subject, body);

        return { sent: emails.length, emails };
    }

    async exportVisitorData(visitorIds: string[]) {
        const result = await pool.query(`
      SELECT * FROM visitors WHERE id = ANY($1)
    `, [visitorIds]);
        return result.rows;
    }
}
