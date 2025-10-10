import { Router } from 'express';
import { VisitorService } from '../services/visitorService';
import { ScheduledExportService } from '../services/scheduledExportService';
import { guestRateLimiter } from '../middleware/rateLimiter';
import { authenticate, authorize } from '../middleware/auth';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();
const visitorService = new VisitorService();
const scheduledExportService = new ScheduledExportService();

// Register visitor with metadata
router.post('/register', guestRateLimiter, async (req, res) => {
  try {
    const { email, language, device_type, city, region, notifications_enabled } = req.body;
    
    const metadata = {
      language,
      device_type,
      city,
      region,
      notifications_enabled,
      user_agent: req.headers['user-agent'],
      ip_address: req.ip
    };

    const visitor = await visitorService.registerVisitor(email, metadata);
    res.json({ success: true, visitor });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Track visitor activity
router.post('/:id/activity', async (req, res) => {
  try {
    const { id } = req.params;
    const activityData = req.body;
    await visitorService.trackActivity(id, activityData);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Export visitors to Excel (comprehensive)
router.get('/export', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate, includeInactive, stream } = req.query;

    const options = {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      includeInactive: includeInactive === 'true'
    };

    // Generate filename with Saudi date format
    const timestamp = new Date().toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');
    const filename = `visitor-export-${timestamp}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Language', 'ar-SA');

    if (stream === 'true') {
      // Use streaming for large datasets
      await visitorService.streamExport(res, options);
    } else {
      // Generate complete workbook
      const workbook = await visitorService.exportToExcel(options);
      await workbook.xlsx.write(res);
    }

    res.end();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Export specific date range
router.post('/export/date-range', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const filepath = await scheduledExportService.exportDateRange(
      new Date(startDate),
      new Date(endDate)
    );

    const filename = path.basename(filepath);
    res.download(filepath, filename, (err) => {
      if (err) {
        res.status(500).json({ error: 'Error downloading file' });
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// List available exports
router.get('/exports/list', authenticate, authorize('admin'), async (req, res) => {
  try {
    const exports = await scheduledExportService.listExports();
    res.json({ exports });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Download specific export file
router.get('/exports/:filename', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { filename } = req.params;
    const exportDir = process.env.EXPORT_DIR || path.join(__dirname, '../../exports');
    const filepath = path.join(exportDir, filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Export file not found' });
    }

    res.download(filepath, filename);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get basic analytics
router.get('/analytics', authenticate, authorize('admin'), async (req, res) => {
  try {
    const analytics = await visitorService.getVisitorAnalytics();
    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get detailed analytics with date range
router.get('/analytics/detailed', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const analytics = await visitorService.getDetailedAnalytics(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
