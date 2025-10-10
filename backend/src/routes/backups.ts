import { Router } from 'express';
import { BackupService } from '../services/backupService';
import { authenticate, authorize } from '../middleware/auth';
import * as path from 'path';

const router = Router();
const backupService = new BackupService();

// Perform database backup
router.post('/database', authenticate, authorize('admin'), async (req, res) => {
  try {
    const result = await backupService.backupDatabase();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Perform exports backup
router.post('/exports', authenticate, authorize('admin'), async (req, res) => {
  try {
    const result = await backupService.backupExports();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Perform full backup
router.post('/full', authenticate, authorize('admin'), async (req, res) => {
  try {
    const result = await backupService.performFullBackup();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// List available backups
router.get('/list', authenticate, authorize('admin'), async (req, res) => {
  try {
    const backups = await backupService.listBackups();
    res.json({ backups });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get backup statistics
router.get('/stats', authenticate, authorize('admin'), async (req, res) => {
  try {
    const stats = await backupService.getBackupStatistics();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Restore database from backup
router.post('/restore/:filename', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { filename } = req.params;
    const success = await backupService.restoreDatabase(filename);
    
    if (success) {
      res.json({ success: true, message: 'Database restored successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Database restore failed' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Download backup file
router.get('/download/:filename', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { filename } = req.params;
    const backupDir = process.env.BACKUP_DIR || path.join(__dirname, '../../backups');
    const filepath = path.join(backupDir, filename);

    res.download(filepath, filename);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
