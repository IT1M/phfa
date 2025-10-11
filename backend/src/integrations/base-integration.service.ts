/**
 * Base Integration Service
 * Provides common functionality for all external integrations
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { logger } from '../utils/logger';
import { IntegrationConfig, IntegrationResponse } from './types';

export abstract class BaseIntegrationService {
  protected client: AxiosInstance;
  protected config: IntegrationConfig;

  constructor(config: IntegrationConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        logger.info(`[${this.config.name}] Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error(`[${this.config.name}] Request error:`, error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.info(`[${this.config.name}] Response: ${response.status}`);
        return response;
      },
      (error) => {
        logger.error(`[${this.config.name}] Response error:`, error.message);
        return Promise.reject(error);
      }
    );
  }

  protected async makeRequest<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<IntegrationResponse<T>> {
    if (!this.config.enabled) {
      return {
        success: false,
        error: 'Integration is disabled',
        statusCode: 503,
        timestamp: new Date()
      };
    }

    let lastError: any;
    const retries = this.config.retryAttempts || 3;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await this.client[method](endpoint, data, config);
        return {
          success: true,
          data: response.data,
          statusCode: response.status,
          timestamp: new Date()
        };
      } catch (error: any) {
        lastError = error;
        logger.warn(`[${this.config.name}] Attempt ${attempt}/${retries} failed`);
        
        if (attempt < retries) {
          await this.delay(1000 * attempt);
        }
      }
    }

    return {
      success: false,
      error: lastError?.response?.data?.message || lastError?.message || 'Request failed',
      statusCode: lastError?.response?.status || 500,
      timestamp: new Date()
    };
  }

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  abstract testConnection(): Promise<boolean>;
}
