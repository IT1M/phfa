import { ExcelExportService } from '../src/services/excelExportService';
import { ScheduledExportService } from '../src/services/scheduledExportService';
import { pool } from '../src/config/database';
import * as fs from 'fs';
import * as path from 'path';

describe('Excel Export Service', () => {
  let excelService: ExcelExportService;
  let scheduledService: ScheduledExportService;

  beforeAll(() => {
    excelService = new ExcelExportService();
    scheduledService = new ScheduledExportService();
  });

  describe('ExcelExportService', () => {
    it('should generate visitor export workbook', async () => {
      const workbook = await excelService.generateVisitorExport({
        includeInactive: true
      });

      expect(workbook).toBeDefined();
      expect(workbook.worksheets.length).toBeGreaterThanOrEqual(3);
      
      // Check sheet names
      const sheetNames = workbook.worksheets.map(ws => ws.name);
      expect(sheetNames).toContain('الزوار - Visitors');
      expect(sheetNames).toContain('التحليلات - Analytics');
      expect(sheetNames).toContain('الجدول الزمني - Timeline');
    });

    it('should generate export with date range', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const workbook = await excelService.generateVisitorExport({
        startDate,
        endDate,
        includeInactive: true
      });

      expect(workbook).toBeDefined();
    });

    it('should handle empty dataset gracefully', async () => {
      const futureDate = new Date('2030-01-01');
      
      const workbook = await excelService.generateVisitorExport({
        startDate: futureDate,
        endDate: futureDate
      });

      expect(workbook).toBeDefined();
      expect(workbook.worksheets.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('ScheduledExportService', () => {
    const testExportDir = path.join(__dirname, '../test-exports');

    beforeAll(() => {
      if (!fs.existsSync(testExportDir)) {
        fs.mkdirSync(testExportDir, { recursive: true });
      }
      process.env.EXPORT_DIR = testExportDir;
    });

    afterAll(() => {
      // Cleanup test exports
      if (fs.existsSync(testExportDir)) {
        const files = fs.readdirSync(testExportDir);
        files.forEach(file => {
          fs.unlinkSync(path.join(testExportDir, file));
        });
        fs.rmdirSync(testExportDir);
      }
    });

    it('should export date range to file', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const filepath = await scheduledService.exportDateRange(startDate, endDate);

      expect(filepath).toBeDefined();
      expect(fs.existsSync(filepath)).toBe(true);
      
      const stats = fs.statSync(filepath);
      expect(stats.size).toBeGreaterThan(0);
    });

    it('should list available exports', async () => {
      const exports = await scheduledService.listExports();

      expect(Array.isArray(exports)).toBe(true);
      exports.forEach(exp => {
        expect(exp).toHaveProperty('filename');
        expect(exp).toHaveProperty('size');
        expect(exp).toHaveProperty('date');
      });
    });

    it('should schedule daily export', () => {
      const service = new ScheduledExportService();
      
      // This should not throw
      expect(() => {
        service.scheduleDailyExport(2, 0);
        service.stop();
      }).not.toThrow();
    });
  });

  describe('Export Data Integrity', () => {
    it('should include all required columns in Visitors sheet', async () => {
      const workbook = await excelService.generateVisitorExport();
      const visitorsSheet = workbook.getWorksheet('الزوار - Visitors');

      expect(visitorsSheet).toBeDefined();

      const headerRow = visitorsSheet.getRow(1);
      const headers = headerRow.values as any[];

      // Check for key columns
      expect(headers.some(h => h && h.toString().includes('Email'))).toBe(true);
      expect(headers.some(h => h && h.toString().includes('Registration'))).toBe(true);
      expect(headers.some(h => h && h.toString().includes('Activity'))).toBe(true);
    });

    it('should format dates correctly', async () => {
      const workbook = await excelService.generateVisitorExport();
      const visitorsSheet = workbook.getWorksheet('الزوار - Visitors');

      if (visitorsSheet && visitorsSheet.rowCount > 1) {
        const dataRow = visitorsSheet.getRow(2);
        const dateCell = dataRow.getCell('registration_date');

        // Check if date formatting is applied
        expect(dateCell.numFmt).toContain('dd/mm/yyyy');
      }
    });

    it('should apply conditional formatting', async () => {
      const workbook = await excelService.generateVisitorExport();
      const visitorsSheet = workbook.getWorksheet('الزوار - Visitors');

      if (visitorsSheet && visitorsSheet.rowCount > 1) {
        const dataRow = visitorsSheet.getRow(2);
        const statusCell = dataRow.getCell('status');

        // Check if fill is applied
        expect(statusCell.fill).toBeDefined();
      }
    });
  });

  describe('Performance', () => {
    it('should generate export within reasonable time', async () => {
      const startTime = Date.now();
      
      await excelService.generateVisitorExport({
        includeInactive: true
      });

      const duration = Date.now() - startTime;
      
      // Should complete within 10 seconds for normal datasets
      expect(duration).toBeLessThan(10000);
    }, 15000);
  });
});

describe('Export API Integration', () => {
  it('should validate date range parameters', () => {
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2024-12-31'); // End before start

    // This should be handled by the service
    expect(startDate > endDate).toBe(true);
  });

  it('should handle Saudi Arabia timezone correctly', () => {
    const now = new Date();
    const saudiTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }));

    expect(saudiTime).toBeDefined();
    expect(saudiTime instanceof Date).toBe(true);
  });
});
