/**
 * Saudi Ministry of Health (MOH) Integration Service
 */

import { BaseIntegrationService } from './base-integration.service';
import { IntegrationConfig, MOHPatientData, IntegrationResponse } from './types';
import { logger } from '../utils/logger';

export class MOHIntegrationService extends BaseIntegrationService {
  constructor(config: IntegrationConfig) {
    super(config);
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest('get', '/health');
      return response.success;
    } catch (error) {
      logger.error('[MOH] Connection test failed:', error);
      return false;
    }
  }

  async getPatientByNationalId(nationalId: string): Promise<IntegrationResponse<MOHPatientData>> {
    return this.makeRequest<MOHPatientData>('get', `/patients/${nationalId}`);
  }

  async verifyInsurance(nationalId: string, insuranceNumber: string): Promise<IntegrationResponse<boolean>> {
    return this.makeRequest<boolean>('post', '/insurance/verify', {
      nationalId,
      insuranceNumber
    });
  }

  async getMedicalHistory(nationalId: string): Promise<IntegrationResponse<any[]>> {
    return this.makeRequest<any[]>('get', `/patients/${nationalId}/history`);
  }

  async reportInfectiousDisease(data: {
    patientId: string;
    disease: string;
    diagnosisDate: Date;
    reportedBy: string;
  }): Promise<IntegrationResponse<void>> {
    return this.makeRequest<void>('post', '/reporting/infectious-disease', data);
  }

  async getVaccinationRecords(nationalId: string): Promise<IntegrationResponse<any[]>> {
    return this.makeRequest<any[]>('get', `/patients/${nationalId}/vaccinations`);
  }
}
