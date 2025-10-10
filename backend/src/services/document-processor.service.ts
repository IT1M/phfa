import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
import pdf2pic from 'pdf2pic';
import mammoth from 'mammoth';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DocumentProcessingResult, ProcessingConfig, DocumentType, OCREngine } from '../types/document-processor.types';

export class DocumentProcessorService {
  private genAI: GoogleGenerativeAI;
  private tesseractWorker: any;
  private arabicWorker: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.initializeOCRWorkers();
  }

  private async initializeOCRWorkers() {
    // Initialize Tesseract workers
    this.tesseractWorker = await createWorker('eng');
    this.arabicWorker = await createWorker('ara');
  }

  /**
   * Main document processing pipeline
   */
  async processDocument(
    filePath: string, 
    config: ProcessingConfig = {}
  ): Promise<DocumentProcessingResult> {
    const startTime = Date.now();
    
    try {
      // Step 1: Document type detection
      const documentType = await this.detectDocumentType(filePath);
      
      // Step 2: Extract images/pages from document
      const images = await this.extractImages(filePath, documentType);
      
      // Step 3: Image enhancement and preprocessing
      const enhancedImages = await this.enhanceImages(images);
      
      // Step 4: Text extraction with multiple OCR engines
      const ocrResults = await this.performOCR(enhancedImages, config);
      
      // Step 5: Language detection
      const language = await this.detectLanguage(ocrResults.text);
      
      // Step 6: Medical entity recognition
      const entities = await this.extractMedicalEntities(ocrResults.text, language);
      
      // Step 7: Data validation and normalization
      const normalizedData = await this.validateAndNormalize(entities, ocrResults);
      
      const processingTime = Date.now() - startTime;
      
      return {
        document_id: this.generateDocumentId(),
        extracted_text: ocrResults.text,
        entities: normalizedData.entities,
        confidence_score: ocrResults.confidence,
        processing_time: processingTime,
        document_type: documentType,
        language,
        metadata: {
          file_path: filePath,
          pages_processed: images.length,
          ocr_engine: ocrResults.engine,
          enhancement_applied: true
        }
      };
      
    } catch (error) {
      throw new Error(`Document processing failed: ${error.message}`);
    }
  }

  /**
   * Detect document type based on file extension and content
   */
  private async detectDocumentType(filePath: string): Promise<DocumentType> {
    const extension = path.extname(filePath).toLowerCase();
    
    switch (extension) {
      case '.pdf':
        return DocumentType.PDF;
      case '.docx':
      case '.doc':
        return DocumentType.DOCX;
      case '.dcm':
        return DocumentType.DICOM;
      case '.jpg':
      case '.jpeg':
      case '.png':
      case '.tiff':
        return DocumentType.IMAGE;
      case '.mp3':
      case '.wav':
      case '.m4a':
        return DocumentType.AUDIO;
      default:
        // Try to detect based on file content
        return await this.detectTypeByContent(filePath);
    }
  }

  private async detectTypeByContent(filePath: string): Promise<DocumentType> {
    const buffer = await fs.readFile(filePath);
    const header = buffer.toString('hex', 0, 8);
    
    // PDF magic number
    if (buffer.toString('ascii', 0, 4) === '%PDF') {
      return DocumentType.PDF;
    }
    
    // DICOM magic number
    if (buffer.toString('ascii', 128, 132) === 'DICM') {
      return DocumentType.DICOM;
    }
    
    // Image formats
    if (header.startsWith('ffd8ff')) return DocumentType.IMAGE; // JPEG
    if (header.startsWith('89504e47')) return DocumentType.IMAGE; // PNG
    
    return DocumentType.IMAGE; // Default fallback
  }

  /**
   * Extract images from different document types
   */
  private async extractImages(filePath: string, type: DocumentType): Promise<string[]> {
    switch (type) {
      case DocumentType.PDF:
        return await this.extractImagesFromPDF(filePath);
      case DocumentType.DOCX:
        return await this.extractImagesFromDOCX(filePath);
      case DocumentType.DICOM:
        return await this.extractImagesFromDICOM(filePath);
      case DocumentType.IMAGE:
        return [filePath];
      case DocumentType.AUDIO:
        throw new Error('Audio processing not implemented in this version');
      default:
        return [filePath];
    }
  }

  private async extractImagesFromPDF(filePath: string): Promise<string[]> {
    const convert = pdf2pic.fromPath(filePath, {
      density: 300,
      saveFilename: "page",
      savePath: "./temp/",
      format: "png",
      width: 2480,
      height: 3508
    });
    
    const results = await convert.bulk(-1);
    return results.map(result => result.path);
  }

  private async extractImagesFromDOCX(filePath: string): Promise<string[]> {
    // Extract images from DOCX and convert to images for OCR
    const result = await mammoth.extractRawText({ path: filePath });
    
    // For now, convert the entire document to an image
    // In production, you'd want to extract embedded images
    const tempImagePath = `./temp/docx_${Date.now()}.png`;
    
    // This is a simplified approach - in production you'd use a proper DOCX to image converter
    await sharp({
      create: {
        width: 2480,
        height: 3508,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    })
    .png()
    .toFile(tempImagePath);
    
    return [tempImagePath];
  }

  private async extractImagesFromDICOM(filePath: string): Promise<string[]> {
    // DICOM processing would require specialized libraries like dicom-parser
    // For now, return the file path - implement proper DICOM processing in production
    return [filePath];
  }

  /**
   * Enhance images for better OCR results
   */
  private async enhanceImages(imagePaths: string[]): Promise<string[]> {
    const enhancedPaths: string[] = [];
    
    for (const imagePath of imagePaths) {
      const enhancedPath = `./temp/enhanced_${Date.now()}_${path.basename(imagePath)}`;
      
      await sharp(imagePath)
        .grayscale()
        .normalize()
        .sharpen()
        .threshold(128)
        .png()
        .toFile(enhancedPath);
        
      enhancedPaths.push(enhancedPath);
    }
    
    return enhancedPaths;
  }

  /**
   * Perform OCR with multiple engines and confidence scoring
   */
  private async performOCR(imagePaths: string[], config: ProcessingConfig) {
    let bestResult = { text: '', confidence: 0, engine: OCREngine.TESSERACT };
    
    for (const imagePath of imagePaths) {
      // Try Tesseract English
      const englishResult = await this.runTesseractOCR(imagePath, 'eng');
      
      // Try Tesseract Arabic
      const arabicResult = await this.runTesseractOCR(imagePath, 'ara');
      
      // Try combined Arabic+English
      const combinedResult = await this.runTesseractOCR(imagePath, 'ara+eng');
      
      // Select best result based on confidence
      const results = [englishResult, arabicResult, combinedResult];
      const currentBest = results.reduce((prev, current) => 
        current.confidence > prev.confidence ? current : prev
      );
      
      if (currentBest.confidence > bestResult.confidence) {
        bestResult = currentBest;
      }
    }
    
    return bestResult;
  }

  private async runTesseractOCR(imagePath: string, language: string) {
    const worker = language.includes('ara') ? this.arabicWorker : this.tesseractWorker;
    
    await worker.setParameters({
      tessedit_pageseg_mode: '1',
      tessedit_ocr_engine_mode: '2'
    });
    
    const { data } = await worker.recognize(imagePath);
    
    return {
      text: data.text,
      confidence: data.confidence,
      engine: OCREngine.TESSERACT
    };
  }

  /**
   * Detect language of extracted text
   */
  private async detectLanguage(text: string): Promise<string> {
    const arabicPattern = /[\u0600-\u06FF]/;
    const englishPattern = /[a-zA-Z]/;
    
    const arabicMatches = text.match(arabicPattern);
    const englishMatches = text.match(englishPattern);
    
    const arabicCount = arabicMatches ? arabicMatches.length : 0;
    const englishCount = englishMatches ? englishMatches.length : 0;
    
    if (arabicCount > englishCount) {
      return 'arabic';
    } else if (englishCount > arabicCount) {
      return 'english';
    } else {
      return 'mixed';
    }
  }

  /**
   * Extract medical entities using Gemini AI
   */
  private async extractMedicalEntities(text: string, language: string) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
    Extract medical entities from the following ${language} text. Return a JSON object with the following structure:
    
    {
      "patient": {
        "name": "",
        "age": "",
        "gender": "",
        "id": "",
        "contact": ""
      },
      "diagnoses": [
        {
          "condition": "",
          "icd10_code": "",
          "confidence": 0.0
        }
      ],
      "medications": [
        {
          "name": "",
          "dosage": "",
          "frequency": "",
          "duration": ""
        }
      ],
      "procedures": [
        {
          "name": "",
          "date": "",
          "provider": ""
        }
      ],
      "lab_results": [
        {
          "test_name": "",
          "value": "",
          "unit": "",
          "reference_range": "",
          "date": ""
        }
      ]
    }
    
    Text to analyze:
    ${text}
    
    Return only valid JSON without any additional text or formatting.
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();
    
    try {
      return JSON.parse(this.cleanJsonResponse(jsonText));
    } catch (error) {
      console.error('Failed to parse medical entities JSON:', error);
      return this.getEmptyEntities();
    }
  }

  /**
   * Validate and normalize extracted data
   */
  private async validateAndNormalize(entities: any, ocrResults: any) {
    // Implement validation rules
    const validatedEntities = await this.validateEntities(entities);
    
    // Normalize medical terms
    const normalizedEntities = await this.normalizeMedicalTerms(validatedEntities);
    
    return {
      entities: normalizedEntities,
      validation_flags: this.getValidationFlags(entities, ocrResults.confidence)
    };
  }

  private async validateEntities(entities: any) {
    // Implement validation logic
    // Check for required fields, format validation, etc.
    return entities;
  }

  private async normalizeMedicalTerms(entities: any) {
    // Implement normalization logic
    // Standardize medical terminology, units, etc.
    return entities;
  }

  private getValidationFlags(entities: any, confidence: number) {
    const flags = [];
    
    if (confidence < 0.8) {
      flags.push('LOW_CONFIDENCE_OCR');
    }
    
    if (!entities.patient.name) {
      flags.push('MISSING_PATIENT_NAME');
    }
    
    if (entities.diagnoses.length === 0) {
      flags.push('NO_DIAGNOSES_FOUND');
    }
    
    return flags;
  }

  private cleanJsonResponse(text: string): string {
    // Remove markdown formatting and extra text
    return text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^\s*[\r\n]/gm, '')
      .trim();
  }

  private getEmptyEntities() {
    return {
      patient: {},
      diagnoses: [],
      medications: [],
      procedures: [],
      lab_results: []
    };
  }

  private generateDocumentId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup temporary files
   */
  async cleanup(tempFiles: string[]) {
    for (const file of tempFiles) {
      try {
        await fs.unlink(file);
      } catch (error) {
        console.warn(`Failed to cleanup temp file ${file}:`, error);
      }
    }
  }
}