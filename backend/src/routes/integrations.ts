/**
 * Integration Routes
 */

import express, { Request, Response } from 'express';
import { IntegrationManager } from '../integrations/integration-manager.service';
import { authenticateToken, requireRole } from '../middleware/auth';
import { WebhookEventType } from '../integrations/types';
import { logger } from '../utils/logger';

export function createIntegrationRoutes(integrationManager: IntegrationManager) {
  const router = express.Router();

  // Test all integration connections
  router.get('/test', authenticateToken, requireRole(['admin']), async (req: Request, res: Response) => {
    try {
      const results = await integrationManager.testAllConnections();
      res.json({ success: true, results });
    } catch (error: any) {
      logger.error('Integration test failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // MOH Integration endpoints
  router.get('/moh/patient/:nationalId', authenticateToken, async (req: Request, res: Response) => {
    try {
      const mohService = integrationManager.getMOHService();
      if (!mohService) {
        return res.status(503).json({ error: 'MOH integration not available' });
      }

      const result = await mohService.getPatientByNationalId(req.params.nationalId);
      res.json(result);
    } catch (error: any) {
      logger.error('MOH patient lookup failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/moh/insurance/verify', authenticateToken, async (req: Request, res: Response) => {
    try {
      const mohService = integrationManager.getMOHService();
      if (!mohService) {
        return res.status(503).json({ error: 'MOH integration not available' });
      }

      const { nationalId, insuranceNumber } = req.body;
      const result = await mohService.verifyInsurance(nationalId, insuranceNumber);
      res.json(result);
    } catch (error: any) {
      logger.error('Insurance verification failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // HIS Integration endpoints
  router.get('/his/patient/:patientId', authenticateToken, async (req: Request, res: Response) => {
    try {
      const hisService = integrationManager.getHISService();
      if (!hisService) {
        return res.status(503).json({ error: 'HIS integration not available' });
      }

      const result = await hisService.getPatientRecord(req.params.patientId);
      res.json(result);
    } catch (error: any) {
      logger.error('HIS patient lookup failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/his/admission', authenticateToken, requireRole(['doctor', 'admin']), async (req: Request, res: Response) => {
    try {
      const hisService = integrationManager.getHISService();
      if (!hisService) {
        return res.status(503).json({ error: 'HIS integration not available' });
      }

      const result = await hisService.createAdmission(req.body);
      res.json(result);
    } catch (error: any) {
      logger.error('HIS admission creation failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // LIS Integration endpoints
  router.post('/lis/order', authenticateToken, requireRole(['doctor', 'admin']), async (req: Request, res: Response) => {
    try {
      const lisService = integrationManager.getLISService();
      if (!lisService) {
        return res.status(503).json({ error: 'LIS integration not available' });
      }

      const result = await lisService.orderTest(req.body);
      res.json(result);
    } catch (error: any) {
      logger.error('LIS test order failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/lis/results/:testId', authenticateToken, async (req: Request, res: Response) => {
    try {
      const lisService = integrationManager.getLISService();
      if (!lisService) {
        return res.status(503).json({ error: 'LIS integration not available' });
      }

      const result = await lisService.getTestResults(req.params.testId);
      res.json(result);
    } catch (error: any) {
      logger.error('LIS results lookup failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Pharmacy Integration endpoints
  router.post('/pharmacy/prescription', authenticateToken, requireRole(['doctor', 'admin']), async (req: Request, res: Response) => {
    try {
      const pharmacyService = integrationManager.getPharmacyService();
      if (!pharmacyService) {
        return res.status(503).json({ error: 'Pharmacy integration not available' });
      }

      const result = await pharmacyService.createPrescription(req.body);
      res.json(result);
    } catch (error: any) {
      logger.error('Prescription creation failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/pharmacy/interactions', authenticateToken, async (req: Request, res: Response) => {
    try {
      const pharmacyService = integrationManager.getPharmacyService();
      if (!pharmacyService) {
        return res.status(503).json({ error: 'Pharmacy integration not available' });
      }

      const { medications } = req.body;
      const result = await pharmacyService.checkDrugInteractions(medications);
      res.json(result);
    } catch (error: any) {
      logger.error('Drug interaction check failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Webhook management endpoints
  router.post('/webhooks', authenticateToken, requireRole(['admin']), async (req: Request, res: Response) => {
    try {
      const webhookId = await integrationManager.webhookService.registerWebhook(req.body);
      res.json({ success: true, webhookId });
    } catch (error: any) {
      logger.error('Webhook registration failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/webhooks/:id', authenticateToken, requireRole(['admin']), async (req: Request, res: Response) => {
    try {
      await integrationManager.webhookService.unregisterWebhook(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      logger.error('Webhook deletion failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/webhooks', authenticateToken, requireRole(['admin']), async (req: Request, res: Response) => {
    try {
      const webhooks = await integrationManager.webhookService.listWebhooks();
      res.json({ success: true, webhooks });
    } catch (error: any) {
      logger.error('Webhook listing failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/webhooks/:id/logs', authenticateToken, requireRole(['admin']), async (req: Request, res: Response) => {
    try {
      const logs = await integrationManager.webhookService.getWebhookLogs(req.params.id);
      res.json({ success: true, logs });
    } catch (error: any) {
      logger.error('Webhook logs retrieval failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
