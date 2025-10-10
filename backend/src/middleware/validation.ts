import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Validation schema for document processing requests
const processingConfigSchema = Joi.object({
  confidence_threshold: Joi.number().min(0).max(1).default(0.7),
  language_preference: Joi.string().valid('arabic', 'english', 'auto').default('auto'),
  enhance_images: Joi.boolean().default(true),
  extract_forms: Joi.boolean().default(true),
  validate_medical_terms: Joi.boolean().default(true),
  ocr_engines: Joi.array().items(Joi.string().valid('tesseract', 'google_vision', 'azure_cognitive')),
  config: Joi.object().unknown(true)
});

export const validateProcessingRequest = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = processingConfigSchema.validate(req.body, {
    allowUnknown: true,
    stripUnknown: false
  });

  if (error) {
    return res.status(400).json({
      error: 'Invalid request parameters',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  req.body = value;
  next();
};

// Validation schema for batch processing
const batchProcessingSchema = Joi.object({
  config: processingConfigSchema,
  callback_url: Joi.string().uri().optional(),
  priority: Joi.string().valid('low', 'normal', 'high').default('normal')
});

export const validateBatchProcessingRequest = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = batchProcessingSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: 'Invalid batch processing parameters',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  req.body = value;
  next();
};

// Validation schema for medical entities
const medicalEntitiesSchema = Joi.object({
  patient: Joi.object({
    name: Joi.string().optional(),
    age: Joi.string().optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    id: Joi.string().optional(),
    contact: Joi.string().optional(),
    date_of_birth: Joi.string().isoDate().optional(),
    address: Joi.string().optional(),
    insurance_id: Joi.string().optional()
  }).optional(),
  
  diagnoses: Joi.array().items(
    Joi.object({
      condition: Joi.string().required(),
      icd10_code: Joi.string().pattern(/^[A-Z]\d{2}(\.\d{1,3})?$/).optional(),
      confidence: Joi.number().min(0).max(1).required(),
      date: Joi.string().isoDate().optional(),
      severity: Joi.string().valid('mild', 'moderate', 'severe').optional(),
      status: Joi.string().valid('active', 'resolved', 'chronic').optional()
    })
  ).optional(),
  
  medications: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      dosage: Joi.string().optional(),
      frequency: Joi.string().optional(),
      duration: Joi.string().optional(),
      route: Joi.string().optional(),
      prescriber: Joi.string().optional(),
      start_date: Joi.string().isoDate().optional(),
      end_date: Joi.string().isoDate().optional()
    })
  ).optional(),
  
  procedures: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      date: Joi.string().isoDate().optional(),
      provider: Joi.string().optional(),
      location: Joi.string().optional(),
      cpt_code: Joi.string().optional(),
      outcome: Joi.string().optional()
    })
  ).optional(),
  
  lab_results: Joi.array().items(
    Joi.object({
      test_name: Joi.string().required(),
      value: Joi.string().required(),
      unit: Joi.string().optional(),
      reference_range: Joi.string().optional(),
      date: Joi.string().isoDate().optional(),
      status: Joi.string().valid('normal', 'abnormal', 'critical').optional(),
      lab_name: Joi.string().optional()
    })
  ).optional()
});

export const validateMedicalEntities = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = medicalEntitiesSchema.validate(req.body.entities);

  if (error) {
    return res.status(400).json({
      error: 'Invalid medical entities format',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  req.body.entities = value;
  next();
};

// File validation middleware
export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      error: 'No file uploaded'
    });
  }

  // Check file size (already handled by multer, but double-check)
  const maxSize = 50 * 1024 * 1024; // 50MB
  
  if (req.file && req.file.size > maxSize) {
    return res.status(400).json({
      error: 'File size exceeds maximum limit of 50MB'
    });
  }

  if (req.files) {
    const files = req.files as Express.Multer.File[];
    for (const file of files) {
      if (file.size > maxSize) {
        return res.status(400).json({
          error: `File ${file.originalname} exceeds maximum limit of 50MB`
        });
      }
    }
  }

  next();
};

// Validation for reprocessing requests
const reprocessingSchema = Joi.object({
  config: processingConfigSchema.required(),
  reason: Joi.string().optional()
});

export const validateReprocessingRequest = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = reprocessingSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: 'Invalid reprocessing parameters',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  req.body = value;
  next();
};

// Custom validation for Arabic text
export const validateArabicText = (text: string): boolean => {
  const arabicPattern = /[\u0600-\u06FF]/;
  return arabicPattern.test(text);
};

// Custom validation for medical terminology
export const validateMedicalTerms = (terms: string[]): { valid: string[], invalid: string[] } => {
  const medicalTermsPattern = /^[a-zA-Z\u0600-\u06FF\s\-\.]+$/;
  const valid = [];
  const invalid = [];

  for (const term of terms) {
    if (medicalTermsPattern.test(term)) {
      valid.push(term);
    } else {
      invalid.push(term);
    }
  }

  return { valid, invalid };
};

// Validation for confidence scores
export const validateConfidenceScore = (score: number): boolean => {
  return typeof score === 'number' && score >= 0 && score <= 1;
};

// Validation for ICD-10 codes
export const validateICD10Code = (code: string): boolean => {
  const icd10Pattern = /^[A-Z]\d{2}(\.\d{1,3})?$/;
  return icd10Pattern.test(code);
};

// Validation for date formats
export const validateDateFormat = (date: string): boolean => {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(date)) return false;
  
  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
};

// Comprehensive validation for processing results
const processingResultSchema = Joi.object({
  document_id: Joi.string().required(),
  extracted_text: Joi.string().required(),
  entities: medicalEntitiesSchema.required(),
  confidence_score: Joi.number().min(0).max(1).required(),
  processing_time: Joi.number().positive().required(),
  document_type: Joi.string().valid('pdf', 'docx', 'dicom', 'image', 'audio').optional(),
  language: Joi.string().valid('arabic', 'english', 'mixed').optional(),
  metadata: Joi.object().optional(),
  validation_flags: Joi.array().items(Joi.string()).optional()
});

export const validateProcessingResult = (result: any): { isValid: boolean, errors: string[] } => {
  const { error } = processingResultSchema.validate(result);
  
  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => detail.message)
    };
  }

  return { isValid: true, errors: [] };
};