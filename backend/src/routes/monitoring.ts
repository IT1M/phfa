import { Router } from 'express';
import { MonitoringService } from '../services/monitoringService';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const monitoringService = new MonitoringService();

// Get current system metrics
router.get('/metrics', authenticate, authorize('admin'), async (req, res) => {
  try {
    const metrics = await monitoringService.collectMetrics();
    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get metrics history
router.get('/metrics/history', authenticate, authorize('admin'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const history = monitoringService.getMetricsHistory(limit);
    res.json({ history });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get export statistics
router.get('/export-stats', authenticate, authorize('admin'), async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const stats = await monitoringService.getExportStatistics(days);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Check system health
router.get('/health', authenticate, authorize('admin'), async (req, res) => {
  try {
    const health = await monitoringService.checkHealth();
    res.json(health);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Generate monitoring report
router.get('/report', authenticate, authorize('admin'), async (req, res) => {
  try {
    const report = await monitoringService.generateReport();
    res.setHeader('Content-Type', 'text/plain');
    res.send(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
