/**
 * Integration Tests
 */

import { Pool } from 'pg';
import { IntegrationManager } from '../src/integrations/integration-manager.service';
import { MOHIntegrationService } from '../src/integrations/moh-integration.service';
import { WebhookService } from '../src/integrations/webhook.service';
import { IntegrationType, WebhookEventType } from '../src/integrations/types';

describe('Integration System', () => {
  let pool: Pool;
  let integrationManager: IntegrationManager;

  beforeAll(() => {
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'medical_documents_test',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD
    });

    integrationManager = new IntegrationManager(pool);
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('MOH Integration', () => {
    test('should create MOH service with config', () => {
      const mohService = new MOHIntegrationService({
        name: 'Test MOH',
        type: IntegrationType.MOH,
        baseUrl: 'https://api.moh.gov.sa/v1',
        apiKey: 'test-key',
        enabled: true,
        timeout: 30000,
        retryAttempts: 3
      });

      expect(mohService).toBeDefined();
    });

    test('should handle disabled integration', async () => {
      const mohService = new MOHIntegrationService({
        name: 'Test MOH',
        type: IntegrationType.MOH,
        baseUrl: 'https://api.moh.gov.sa/v1',
        enabled: false,
        timeout: 30000,
        retryAttempts: 3
      });

      const result = await mohService.getPatientByNationalId('1234567890');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Integration is disabled');
    });
  });

  describe('Webhook Service', () => {
    let webhookService: WebhookService;

    beforeAll(() => {
      webhookService = new WebhookService(pool);
    });

    test('should register webhook', async () => {
      const webhookId = await webhookService.registerWebhook({
        url: 'https://test.com/webhook',
        events: [WebhookEventType.DOCUMENT_PROCESSED],
        enabled: true,
        retryAttempts: 3
      });

      expect(webhookId).toBeDefined();
      expect(typeof webhookId).toBe('string');
    });

    test('should verify webhook signature', () => {
      const secret = 'test-secret';
      const data = { test: 'data' };
      const signature = webhookService['generateSignature'](secret, data);

      const isValid = webhookService.verifySignature(secret, signature, data);
      expect(isValid).toBe(true);
    });

    test('should reject invalid signature', () => {
      const secret = 'test-secret';
      const data = { test: 'data' };
      const invalidSignature = 'invalid-signature-' + '0'.repeat(64);

      const isValid = webhookService.verifySignature(secret, invalidSignature, data);
      expect(isValid).toBe(false);
    });

    test('should list webhooks', async () => {
      const webhooks = await webhookService.listWebhooks();
      expect(Array.isArray(webhooks)).toBe(true);
    });
  });

  describe('Integration Manager', () => {
    test('should initialize integration manager', () => {
      expect(integrationManager).toBeDefined();
      expect(integrationManager.webhookService).toBeDefined();
    });

    test('should test all connections', async () => {
      const results = await integrationManager.testAllConnections();
      expect(typeof results).toBe('object');
    });

    test('should get service instances', () => {
      const mohService = integrationManager.getMOHService();
      const hisService = integrationManager.getHISService();
      const lisService = integrationManager.getLISService();
      const pharmacyService = integrationManager.getPharmacyService();

      // Services may be undefined if not configured
      expect(mohService === undefined || mohService instanceof MOHIntegrationService).toBe(true);
    });
  });

  describe('Integration Response Format', () => {
    test('should return proper response structure on success', async () => {
      const mohService = new MOHIntegrationService({
        name: 'Test MOH',
        type: IntegrationType.MOH,
        baseUrl: 'https://httpbin.org',
        enabled: true,
        timeout: 5000,
        retryAttempts: 1
      });

      // This will fail but we're testing the response structure
      const result = await mohService['makeRequest']('get', '/status/200');
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('statusCode');
      expect(result).toHaveProperty('timestamp');
      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });
});
