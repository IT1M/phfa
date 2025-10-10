import { pool } from '../config/database';
import Tesseract from 'tesseract.js';
import { logger } from '../utils/logger';
import fs from 'fs/promises';

export class DocumentService {
  async uploadDocument(
    userId: string | null,
    visitorId: string | null,
    file: Express.Multer.File
  ) {
    const result = await pool.query(
      `INSERT INTO documents (user_id, visitor_id, file_name, file_path, file_size, mime_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [userId, visitorId, file.filename, file.path, file.size, file.mimetype]
    );

    const documentId = result.rows[0].id;

    this.processDocument(documentId, file.path);

    return { documentId, status: 'processing' };
  }

  private async processDocument(documentId: string, filePath: string) {
    try {
      await pool.query(
        `UPDATE documents SET processing_status = 'processing' WHERE id = $1`,
        [documentId]
      );

      const { data } = await Tesseract.recognize(filePath, 'eng+ara', {
        logger: (m) => logger.debug(m),
      });

      const extractedText = data.text;
      const confidence = data.confidence;

      await pool.query(
        `UPDATE documents 
         SET extracted_text = $1, ocr_confidence = $2, processing_status = 'completed'
         WHERE id = $3`,
        [extractedText, confidence, documentId]
      );

      await this.extractMedicalEntities(documentId, extractedText);

      logger.info(`Document ${documentId} processed successfully`);
    } catch (error) {
      logger.error(`Document processing error for ${documentId}:`, error);
      await pool.query(
        `UPDATE documents SET processing_status = 'failed' WHERE id = $1`,
        [documentId]
      );
    }
  }

  private async extractMedicalEntities(documentId: string, text: string) {
    const patterns = {
      patient_name: /patient\s*name\s*:?\s*([a-z\s]+)/i,
      patient_id: /patient\s*id\s*:?\s*(\d+)/i,
      diagnosis: /diagnosis\s*:?\s*([a-z\s,]+)/i,
      medication: /medication\s*:?\s*([a-z\s,]+)/i,
      procedure: /procedure\s*:?\s*([a-z\s,]+)/i,
    };

    for (const [entityType, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      if (match) {
        await pool.query(
          `INSERT INTO medical_entities (document_id, entity_type, entity_value, confidence)
           VALUES ($1, $2, $3, $4)`,
          [documentId, entityType, match[1].trim(), 85.0]
        );
      }
    }
  }

  async getDocument(documentId: string, userId: string | null) {
    const result = await pool.query(
      `SELECT d.*, 
              json_agg(json_build_object(
                'type', me.entity_type,
                'value', me.entity_value,
                'confidence', me.confidence
              )) as entities
       FROM documents d
       LEFT JOIN medical_entities me ON d.id = me.document_id
       WHERE d.id = $1 AND (d.user_id = $2 OR $2 IS NULL)
       GROUP BY d.id`,
      [documentId, userId]
    );

    return result.rows[0];
  }

  async listDocuments(userId: string, limit = 50, offset = 0) {
    const result = await pool.query(
      `SELECT id, file_name, processing_status, created_at, ocr_confidence
       FROM documents
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows;
  }
}
