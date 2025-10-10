import { AdminService } from '../src/services/adminService';

describe('AdminService', () => {
  let adminService: AdminService;

  beforeEach(() => {
    adminService = new AdminService();
  });

  describe('Dashboard Metrics', () => {
    it('should get dashboard metrics', async () => {
      const metrics = await adminService.getDashboardMetrics();
      
      expect(metrics).toHaveProperty('visitors');
      expect(metrics).toHaveProperty('documents');
      expect(metrics).toHaveProperty('processing');
      expect(metrics).toHaveProperty('errors');
      expect(metrics).toHaveProperty('timestamp');
    });

    it('should get realtime stats', async () => {
      const stats = await adminService.getRealtimeStats();
      
      expect(stats).toHaveProperty('active_users');
      expect(stats).toHaveProperty('processing_docs');
      expect(stats).toHaveProperty('recent_errors');
      expect(stats).toHaveProperty('avg_processing_time');
    });
  });

  describe('Visitor Management', () => {
    it('should get visitors list with pagination', async () => {
      const result = await adminService.getVisitorsList({
        page: 1,
        limit: 10
      });
      
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination).toHaveProperty('page');
      expect(result.pagination).toHaveProperty('limit');
      expect(result.pagination).toHaveProperty('total');
      expect(result.pagination).toHaveProperty('totalPages');
    });

    it('should get visitor timeline', async () => {
      const timeline = await adminService.getVisitorTimeline(30);
      
      expect(Array.isArray(timeline)).toBe(true);
    });

    it('should get geographic distribution', async () => {
      const distribution = await adminService.getGeographicDistribution();
      
      expect(Array.isArray(distribution)).toBe(true);
    });

    it('should calculate engagement scores', async () => {
      const scores = await adminService.calculateEngagementScores();
      
      expect(Array.isArray(scores)).toBe(true);
    });
  });

  describe('Document Management', () => {
    it('should get document queue', async () => {
      const queue = await adminService.getDocumentQueue();
      
      expect(Array.isArray(queue)).toBe(true);
    });

    it('should get processing stats', async () => {
      const stats = await adminService.getProcessingStats(7);
      
      expect(Array.isArray(stats)).toBe(true);
    });

    it('should get failed documents', async () => {
      const failed = await adminService.getFailedDocuments(50);
      
      expect(Array.isArray(failed)).toBe(true);
    });
  });

  describe('Analytics', () => {
    it('should get usage patterns', async () => {
      const patterns = await adminService.getUsagePatterns(30);
      
      expect(Array.isArray(patterns)).toBe(true);
    });

    it('should get trend analysis', async () => {
      const trends = await adminService.getTrendAnalysis(30);
      
      expect(trends).toHaveProperty('visitors');
      expect(trends).toHaveProperty('documents');
      expect(trends).toHaveProperty('searches');
    });

    it('should get device analytics', async () => {
      const devices = await adminService.getDeviceAnalytics();
      
      expect(Array.isArray(devices)).toBe(true);
    });

    it('should get language distribution', async () => {
      const languages = await adminService.getLanguageDistribution();
      
      expect(Array.isArray(languages)).toBe(true);
    });
  });

  describe('Settings', () => {
    it('should get system config', async () => {
      const config = await adminService.getSystemConfig();
      
      expect(Array.isArray(config)).toBe(true);
    });

    it('should update system config', async () => {
      await expect(
        adminService.updateSystemConfig('test_key', 'test_value')
      ).resolves.not.toThrow();
    });
  });

  describe('Bulk Operations', () => {
    it('should handle bulk email visitors', async () => {
      const result = await adminService.bulkEmailVisitors(
        ['visitor-id-1', 'visitor-id-2'],
        'Test Subject',
        'Test Body'
      );
      
      expect(result).toHaveProperty('sent');
      expect(result).toHaveProperty('emails');
    });

    it('should export visitor data', async () => {
      const data = await adminService.exportVisitorData(['visitor-id-1']);
      
      expect(Array.isArray(data)).toBe(true);
    });
  });
});
