/**
 * Laboratory Information System (LIS) Integration Service
 */

import { BaseIntegrationService } from './base-integration.service';
import { IntegrationConfig, LISTestResult, IntegrationResponse } from './types';
import { logger } from '../utils/logger';

export class LISIntegrationService extends BaseIntegrationService {
  constructor(config: IntegrationConfig) {
    super(config);
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest('get', '/api/status');
      return response.success;
    } catch (error) {
      logger.error('[LIS] Connection test failed:', error);
      return false;
    }
  }

  async orderTest(data: {
    patientId: string;
    testType: string;
    orderedBy: string;
    priority: 'routine' | 'urgent' | 'stat';
    notes?: string;
  }): Promise<IntegrationResponse<LISTestResult>> {
    return this.makeRequest<LISTestResult>('post', '/api/orders', data);
  }

  async getTestResults(testId: string): Promise<IntegrationResponse<LISTestResult>> {
    return this.makeRequest<LISTestResult>('get', `/api/results/${testId}`);
  }

  async getPatientTests(patientId: string, status?: string): Promise<IntegrationResponse<LISTestResult[]>> {
    const params = status ? `?status=${status}` : '';
    return this.makeRequest<LISTestResult[]>('get', `/api/patients/${patientId}/tests${params}`);
  }

  async getPendingTests(): Promise<IntegrationResponse<LISTestResult[]>> {
    return this.makeRequest<LISTestResult[]>('get', '/api/tests/pending');
  }

  async updateTestStatus(testId: string, status: string, results?: any): Promise<IntegrationResponse<void>> {
    return this.makeRequest<void>('put', `/api/tests/${testId}`, { status, results });
  }

  async getTestHistory(patientId: string, testType: string): Promise<IntegrationResponse<LISTestResult[]>> {
    return this.makeRequest<LISTestResult[]>('get', `/api/patients/${patientId}/history/${testType}`);
  }
}
