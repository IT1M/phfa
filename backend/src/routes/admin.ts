import { Router } from 'express';
import { AdminService } from '../services/adminService';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const adminService = new AdminService();

// All routes require admin authentication
router.use(authenticate, authorize('admin'));

// Dashboard Overview
router.get('/dashboard/metrics', async (req, res) => {
  try {
    const metrics = await adminService.getDashboardMetrics();
    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/dashboard/realtime', async (req, res) => {
  try {
    const stats = await adminService.getRealtimeStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Visitor Management
router.get('/visitors', async (req, res) => {
  try {
    const params = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50,
      search: req.query.search as string,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined
    };
    
    const result = await adminService.getVisitorsList(params);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/visitors/timeline', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const timeline = await adminService.getVisitorTimeline(days);
    res.json(timeline);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/visitors/geographic', async (req, res) => {
  try {
    const distribution = await adminService.getGeographicDistribution();
    res.json(distribution);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/visitors/engagement', async (req, res) => {
  try {
    const scores = await adminService.calculateEngagementScores();
    res.json(scores);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Document Management
router.get('/documents/queue', async (req, res) => {
  try {
    const queue = await adminService.getDocumentQueue();
    res.json(queue);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/documents/stats', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const stats = await adminService.getProcessingStats(days);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/documents/failed', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const failed = await adminService.getFailedDocuments(limit);
    res.json(failed);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics
router.get('/analytics/usage-patterns', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const patterns = await adminService.getUsagePatterns(days);
    res.json(patterns);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/analytics/trends', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const trends = await adminService.getTrendAnalysis(days);
    res.json(trends);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/analytics/devices', async (req, res) => {
  try {
    const analytics = await adminService.getDeviceAnalytics();
    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/analytics/languages', async (req, res) => {
  try {
    const distribution = await adminService.getLanguageDistribution();
    res.json(distribution);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Settings
router.get('/settings', async (req, res) => {
  try {
    const config = await adminService.getSystemConfig();
    res.json(config);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/settings/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    await adminService.updateSystemConfig(key, value);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk Operations
router.post('/visitors/bulk-email', async (req, res) => {
  try {
    const { visitorIds, subject, body } = req.body;
    const result = await adminService.bulkEmailVisitors(visitorIds, subject, body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/visitors/export', async (req, res) => {
  try {
    const { visitorIds } = req.body;
    const data = await adminService.exportVisitorData(visitorIds);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
