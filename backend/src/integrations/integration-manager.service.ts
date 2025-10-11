/**
 * Integration Manager Service
 * Centralized management of all external integrations
 */

import { Pool } from 'pg';
import { MOHIntegrationService } from './moh-integration.service';
import { HISIntegrationService } from './his-integration.service';
import { LISIntegrationService } from './lis-integration.service';
import { PharmacyIntegrationService } from './pharmacy-integration.service';
import { WebhookService } from './webhook.service';
import { IntegrationConfig, IntegrationType } from './types';
import { logger } from '../utils/logger';

export class IntegrationManager {
  private mohService?: MOHIntegrationService;
  private hisService?: HISIntegrationService;
  private lisService?: LISIntegrationService;
  private pharmacyService?: PharmacyIntegrationService;
  public webhookService: WebhookService;
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
    this.webhookService = new WebhookService(pool);
    this.initializeIntegrations();
  }

  private async initializeIntegrations(): Promise<void> {
    try {
      const configs = await this.loadIntegrationConfigs();
      
      configs.forEach(config => {
        switch (config.type) {
          case IntegrationType.MOH:
            this.mohService = new MOHIntegrationService(config);
            break;
          case IntegrationType.HIS:
            this.hisService = new HISIntegrationService(config);
            break;
          case IntegrationType.LIS:
            this.lisService = new LISIntegrationService(config);
            break;
          case IntegrationType.PHARMACY:
            this.pharmacyService = new PharmacyIntegrationService(config);
            break;
        }
      });

      logger.info('Integration services initialized');
    } catch (error) {
      logger.error('Failed to initialize integrations:', error);
    }
  }

  private async loadIntegrationConfigs(): Promise<IntegrationConfig[]> {
    const result = await this.pool.query('SELECT * FROM integration_configs WHERE enabled = true');
    return result.rows.map(row => ({
      name: row.name,
      type: row.type,
      baseUrl: row.base_url,
      apiKey: row.api_key,
      credentials: row.credentials,
      timeout: row.timeout,
      retryAttempts: row.retry_attempts,
      enabled: row.enabled
    }));
  }

  getMOHService(): MOHIntegrationService | undefined {
    return this.mohService;
  }

  getHISService(): HISIntegrationService | undefined {
    return this.hisService;
  }

  getLISService(): LISIntegrationService | undefined {
    return this.lisService;
  }

  getPharmacyService(): PharmacyIntegrationService | undefined {
    return this.pharmacyService;
  }

  async testAllConnections(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    if (this.mohService) {
      results.moh = await this.mohService.testConnection();
    }
    if (this.hisService) {
      results.his = await this.hisService.testConnection();
    }
    if (this.lisService) {
      results.lis = await this.lisService.testConnection();
    }
    if (this.pharmacyService) {
      results.pharmacy = await this.pharmacyService.testConnection();
    }

    return results;
  }

  async saveIntegrationConfig(config: IntegrationConfig): Promise<void> {
    await this.pool.query(
      `INSERT INTO integration_configs (name, type, base_url, api_key, credentials, timeout, retry_attempts, enabled)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (name) DO UPDATE SET
         type = EXCLUDED.type,
         base_url = EXCLUDED.base_url,
         api_key = EXCLUDED.api_key,
         credentials = EXCLUDED.credentials,
         timeout = EXCLUDED.timeout,
         retry_attempts = EXCLUDED.retry_attempts,
         enabled = EXCLUDED.enabled`,
      [config.name, config.type, config.baseUrl, config.apiKey, 
       JSON.stringify(config.credentials), config.timeout, config.retryAttempts, config.enabled]
    );

    await this.initializeIntegrations();
  }
}
