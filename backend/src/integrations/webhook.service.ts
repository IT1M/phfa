/**
 * Webhook Service
 * Manages webhook subscriptions and event delivery
 */

import axios from 'axios';
import crypto from 'crypto';
import { Pool } from 'pg';
import { logger } from '../utils/logger';
import { WebhookConfig, WebhookEventType, WebhookPayload } from './types';

export class WebhookService {
  private pool: Pool;
  private webhooks: Map<string, WebhookConfig> = new Map();

  constructor(pool: Pool) {
    this.pool = pool;
    this.loadWebhooks();
  }

  private async loadWebhooks(): Promise<void> {
    try {
      const result = await this.pool.query('SELECT * FROM webhooks WHERE enabled = true');
      result.rows.forEach(row => {
        this.webhooks.set(row.id, {
          id: row.id,
          url: row.url,
          events: row.events,
          secret: row.secret,
          enabled: row.enabled,
          retryAttempts: row.retry_attempts || 3,
          headers: row.headers || {}
        });
      });
      logger.info(`Loaded ${this.webhooks.size} active webhooks`);
    } catch (error) {
      logger.error('Failed to load webhooks:', error);
    }
  }

  async registerWebhook(config: Omit<WebhookConfig, 'id' | 'secret'>): Promise<string> {
    const id = crypto.randomUUID();
    const secret = crypto.randomBytes(32).toString('hex');

    await this.pool.query(
      `INSERT INTO webhooks (id, url, events, secret, enabled, retry_attempts, headers)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, config.url, config.events, secret, config.enabled, config.retryAttempts, JSON.stringify(config.headers || {})]
    );

    this.webhooks.set(id, { ...config, id, secret });
    logger.info(`Registered webhook: ${id}`);
    return id;
  }

  async unregisterWebhook(id: string): Promise<void> {
    await this.pool.query('DELETE FROM webhooks WHERE id = $1', [id]);
    this.webhooks.delete(id);
    logger.info(`Unregistered webhook: ${id}`);
  }

  async triggerEvent(event: WebhookEventType, data: any): Promise<void> {
    const relevantWebhooks = Array.from(this.webhooks.values())
      .filter(webhook => webhook.events.includes(event));

    if (relevantWebhooks.length === 0) {
      logger.debug(`No webhooks registered for event: ${event}`);
      return;
    }

    logger.info(`Triggering ${relevantWebhooks.length} webhooks for event: ${event}`);

    const deliveryPromises = relevantWebhooks.map(webhook =>
      this.deliverWebhook(webhook, event, data)
    );

    await Promise.allSettled(deliveryPromises);
  }

  private async deliverWebhook(
    webhook: WebhookConfig,
    event: WebhookEventType,
    data: any
  ): Promise<void> {
    const payload: WebhookPayload = {
      event,
      timestamp: new Date(),
      data,
      signature: this.generateSignature(webhook.secret, data)
    };

    let lastError: any;

    for (let attempt = 1; attempt <= webhook.retryAttempts; attempt++) {
      try {
        await axios.post(webhook.url, payload, {
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': payload.signature,
            'X-Webhook-Event': event,
            ...webhook.headers
          },
          timeout: 10000
        });

        await this.logWebhookDelivery(webhook.id, event, 'success', attempt);
        logger.info(`Webhook delivered: ${webhook.id} (attempt ${attempt})`);
        return;
      } catch (error: any) {
        lastError = error;
        logger.warn(`Webhook delivery failed: ${webhook.id} (attempt ${attempt}/${webhook.retryAttempts})`);
        
        if (attempt < webhook.retryAttempts) {
          await this.delay(1000 * Math.pow(2, attempt - 1));
        }
      }
    }

    await this.logWebhookDelivery(webhook.id, event, 'failed', webhook.retryAttempts, lastError?.message);
    logger.error(`Webhook delivery failed after ${webhook.retryAttempts} attempts: ${webhook.id}`);
  }

  private generateSignature(secret: string, data: any): string {
    const payload = JSON.stringify(data);
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  public verifySignature(secret: string, signature: string, data: any): boolean {
    const expectedSignature = this.generateSignature(secret, data);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  private async logWebhookDelivery(
    webhookId: string,
    event: WebhookEventType,
    status: string,
    attempts: number,
    error?: string
  ): Promise<void> {
    try {
      await this.pool.query(
        `INSERT INTO webhook_logs (webhook_id, event, status, attempts, error, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [webhookId, event, status, attempts, error]
      );
    } catch (error) {
      logger.error('Failed to log webhook delivery:', error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getWebhookLogs(webhookId: string, limit: number = 100): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT * FROM webhook_logs WHERE webhook_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [webhookId, limit]
    );
    return result.rows;
  }

  async listWebhooks(): Promise<WebhookConfig[]> {
    return Array.from(this.webhooks.values());
  }
}
