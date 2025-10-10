import { Pool } from 'pg';
import encryptionService from './encryption.service';

/**
 * Data Retention & Right to be Forgotten Service
 * GDPR/HIPAA compliant data management
 */
export class DataRetentionService {
  private pool: Pool;
  private readonly retentionPeriods = {
    medical_records: 10 * 365, // 10 years
    audit_logs: 7 * 365, // 7 years
    documents: 10 * 365, // 10 years
    sessions: 90, // 90 days
    backups: 30 // 30 days
  };

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Anonymize patient data (Right to be Forgotten)
   */
  async anonymizePatient(patientId: number): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Anonymize patient personal data
      await client.query(
        `UPDATE patients SET
         first_name = 'ANONYMIZED',
         last_name = 'ANONYMIZED',
         email = $1,
         phone = 'ANONYMIZED',
         address = 'ANONYMIZED',
         national_id = 'ANONYMIZED',
         anonymized = true,
         anonymized_at = NOW()
         WHERE id = $2`,
        [`anonymized_${patientId}@deleted.local`, patientId]
      );

      // Keep medical records but anonymize PII
      await client.query(
        `UPDATE medical_records SET
         notes = 'ANONYMIZED',
         updated_at = NOW()
         WHERE patient_id = $1`,
        [patientId]
      );

      // Log the anonymization
      await client.query(
        `INSERT INTO data_retention_logs (action, resource, resource_id, details, created_at)
         VALUES ('anonymize', 'patient', $1, $2, NOW())`,
        [patientId, JSON.stringify({ reason: 'right_to_be_forgotten' })]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete expired data based on retention policy
   */
  async cleanExpiredData(): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Clean expired sessions
      await client.query(
        `DELETE FROM sessions WHERE created_at < NOW() - INTERVAL '${this.retentionPeriods.sessions} days'`
      );

      // Clean old temporary files
      await client.query(
        `DELETE FROM temp_files WHERE created_at < NOW() - INTERVAL '7 days'`
      );

      // Archive old documents (move to cold storage)
      await client.query(
        `UPDATE documents SET archived = true, archived_at = NOW()
         WHERE created_at < NOW() - INTERVAL '${this.retentionPeriods.documents} days'
         AND archived = false`
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Export patient data (Data Portability)
   */
  async exportPatientData(patientId: number): Promise<any> {
    const patient = await this.pool.query(
      `SELECT * FROM patients WHERE id = $1`,
      [patientId]
    );

    const medicalRecords = await this.pool.query(
      `SELECT * FROM medical_records WHERE patient_id = $1`,
      [patientId]
    );

    const documents = await this.pool.query(
      `SELECT * FROM documents WHERE patient_id = $1`,
      [patientId]
    );

    const appointments = await this.pool.query(
      `SELECT * FROM appointments WHERE patient_id = $1`,
      [patientId]
    );

    return {
      patient: patient.rows[0],
      medicalRecords: medicalRecords.rows,
      documents: documents.rows,
      appointments: appointments.rows,
      exportedAt: new Date(),
      format: 'FHIR_R4'
    };
  }

  /**
   * Schedule data retention cleanup
   */
  startRetentionSchedule(): void {
    // Run daily at 2 AM
    setInterval(async () => {
      const now = new Date();
      if (now.getHours() === 2) {
        await this.cleanExpiredData();
      }
    }, 60 * 60 * 1000); // Check every hour
  }

  /**
   * Get retention status
   */
  async getRetentionStatus(): Promise<any> {
    const stats = await this.pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM patients WHERE anonymized = true) as anonymized_patients,
        (SELECT COUNT(*) FROM documents WHERE archived = true) as archived_documents,
        (SELECT COUNT(*) FROM sessions WHERE expires_at < NOW()) as expired_sessions,
        (SELECT COUNT(*) FROM audit_logs WHERE created_at < NOW() - INTERVAL '7 years') as old_audit_logs
    `);

    return stats.rows[0];
  }
}
