import express from 'express';
import multer from 'multer';
import path from 'path';
import { DocumentProcessorService } from '../services/document-processor.service';
import { ProcessingConfig, BatchProcessingRequest } from '../types/document-processor.types';
import { authenticate } from '../middleware/auth';
import { validateProcessingRequest } from '../middleware/validation';

const router = express.Router();
const documentProcessor = new DocumentProcessorService();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/documents/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/tiff',
      'audio/mpeg',
      'audio/wav',
      'application/dicom'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  }
});

/**
 * POST /api/documents/process
 * Process a single document
 */
router.post('/process', 
  authenticate,
  upload.single('document'),
  validateProcessingRequest,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'No document file provided'
        });
      }

      const config: ProcessingConfig = {
        confidence_threshold: req.body.confidence_threshold || 0.7,
        language_preference: req.body.language_preference || 'auto',
        enhance_images: req.body.enhance_images !== false,
        extract_forms: req.body.extract_forms !== false,
        validate_medical_terms: req.body.validate_medical_terms !== false,
        ...req.body.config
      };

      const result = await documentProcessor.processDocument(req.file.path, config);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Document processing error:', error);
      res.status(500).json({
        error: 'Document processing failed',
        message: error.message
      });
    }
  }
);

/**
 * POST /api/documents/batch-process
 * Process multiple documents
 */
router.post('/batch-process',
  authenticate,
  upload.array('documents', 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          error: 'No document files provided'
        });
      }

      const config: ProcessingConfig = {
        confidence_threshold: req.body.confidence_threshold || 0.7,
        language_preference: req.body.language_preference || 'auto',
        enhance_images: req.body.enhance_images !== false,
        extract_forms: req.body.extract_forms !== false,
        validate_medical_terms: req.body.validate_medical_terms !== false
      };

      const files = req.files as Express.Multer.File[];
      const results = [];
      const errors = [];

      for (const file of files) {
        try {
          const result = await documentProcessor.processDocument(file.path, config);
          results.push(result);
        } catch (error) {
          errors.push({
            file_path: file.path,
            error_message: error.message,
            error_code: 'PROCESSING_FAILED'
          });
        }
      }

      res.json({
        success: true,
        data: {
          batch_id: `batch_${Date.now()}`,
          total_files: files.length,
          processed_files: results.length,
          failed_files: errors.length,
          results,
          errors,
          processing_time: 0 // Calculate actual time
        }
      });

    } catch (error) {
      console.error('Batch processing error:', error);
      res.status(500).json({
        error: 'Batch processing failed',
        message: error.message
      });
    }
  }
);

/**
 * GET /api/documents/supported-formats
 * Get list of supported document formats
 */
router.get('/supported-formats', (req, res) => {
  res.json({
    success: true,
    data: {
      formats: [
        {
          type: 'PDF',
          extensions: ['.pdf'],
          mime_types: ['application/pdf'],
          description: 'Portable Document Format'
        },
        {
          type: 'DOCX',
          extensions: ['.docx', '.doc'],
          mime_types: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
          description: 'Microsoft Word Document'
        },
        {
          type: 'Images',
          extensions: ['.jpg', '.jpeg', '.png', '.tiff'],
          mime_types: ['image/jpeg', 'image/png', 'image/tiff'],
          description: 'Image files including scanned documents'
        },
        {
          type: 'DICOM',
          extensions: ['.dcm'],
          mime_types: ['application/dicom'],
          description: 'Digital Imaging and Communications in Medicine'
        },
        {
          type: 'Audio',
          extensions: ['.mp3', '.wav', '.m4a'],
          mime_types: ['audio/mpeg', 'audio/wav', 'audio/mp4'],
          description: 'Audio recordings (transcription)'
        }
      ],
      ocr_engines: ['tesseract', 'google_vision', 'azure_cognitive'],
      languages: ['arabic', 'english', 'mixed'],
      max_file_size: '50MB'
    }
  });
});

/**
 * POST /api/documents/validate
 * Validate extracted data
 */
router.post('/validate', authenticate, async (req, res) => {
  try {
    const { entities, validation_rules } = req.body;

    if (!entities) {
      return res.status(400).json({
        error: 'No entities provided for validation'
      });
    }

    // Implement validation logic
    const validationResult = await validateMedicalEntities(entities, validation_rules);

    res.json({
      success: true,
      data: validationResult
    });

  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      error: 'Validation failed',
      message: error.message
    });
  }
});

/**
 * GET /api/documents/processing-status/:id
 * Get processing status for a document
 */
router.get('/processing-status/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // In production, this would query a database or cache
    // For now, return a mock response
    res.json({
      success: true,
      data: {
        document_id: id,
        status: 'completed',
        progress: 100,
        estimated_completion: null,
        current_stage: 'completed'
      }
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      error: 'Failed to get processing status',
      message: error.message
    });
  }
});

/**
 * POST /api/documents/reprocess
 * Reprocess a document with different settings
 */
router.post('/reprocess/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const config: ProcessingConfig = req.body.config || {};

    // In production, retrieve original file path from database
    // For now, return error
    res.status(404).json({
      error: 'Document not found or original file no longer available'
    });

  } catch (error) {
    console.error('Reprocessing error:', error);
    res.status(500).json({
      error: 'Reprocessing failed',
      message: error.message
    });
  }
});

// Helper function for validation
async function validateMedicalEntities(entities: any, rules: any) {
  const errors = [];
  const warnings = [];
  const suggestions = [];

  // Basic validation
  if (!entities.patient?.name) {
    errors.push({
      field: 'patient.name',
      message: 'Patient name is required',
      severity: 'critical'
    });
  }

  if (entities.diagnoses?.length === 0) {
    warnings.push({
      field: 'diagnoses',
      message: 'No diagnoses found in document',
      suggestion: 'Review document for diagnostic information'
    });
  }

  // Validate ICD-10 codes
  for (const diagnosis of entities.diagnoses || []) {
    if (diagnosis.icd10_code && !isValidICD10Code(diagnosis.icd10_code)) {
      errors.push({
        field: 'diagnoses.icd10_code',
        message: `Invalid ICD-10 code: ${diagnosis.icd10_code}`,
        severity: 'medium'
      });
    }
  }

  return {
    is_valid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}

function isValidICD10Code(code: string): boolean {
  // Basic ICD-10 format validation
  const icd10Pattern = /^[A-Z]\d{2}(\.\d{1,3})?$/;
  return icd10Pattern.test(code);
}

export default router;