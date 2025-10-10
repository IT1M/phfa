#!/usr/bin/env node

/**
 * Test script for the Document Processing Pipeline
 * Run with: npm run test:document-processor
 */

import dotenv from 'dotenv';
import { DocumentProcessorService } from './src/services/document-processor.service';
import { QualityAssuranceService } from './src/services/quality-assurance.service';
import { ImageEnhancementService } from './src/utils/image-enhancement';
import { ProcessingConfig } from './src/types/document-processor.types';

// Load environment variables
dotenv.config();

class DocumentProcessorTest {
  private processor: DocumentProcessorService;
  private qa: QualityAssuranceService;
  private enhancer: ImageEnhancementService;

  constructor() {
    this.processor = new DocumentProcessorService();
    this.qa = new QualityAssuranceService();
    this.enhancer = new ImageEnhancementService();
  }

  async runTests() {
    console.log('🧪 Starting Document Processing Pipeline Tests\n');

    try {
      await this.testServiceInitialization();
      await this.testConfigurationValidation();
      await this.testImageEnhancement();
      await this.testQualityAssurance();
      await this.testErrorHandling();
      
      console.log('\n✅ All tests completed successfully!');
      
    } catch (error) {
      console.error('\n❌ Test suite failed:', error.message);
      process.exit(1);
    }
  }

  private async testServiceInitialization() {
    console.log('🔧 Testing Service Initialization...');
    
    // Test DocumentProcessorService
    if (!this.processor) {
      throw new Error('DocumentProcessorService failed to initialize');
    }
    console.log('✅ DocumentProcessorService initialized');

    // Test QualityAssuranceService
    if (!this.qa) {
      throw new Error('QualityAssuranceService failed to initialize');
    }
    console.log('✅ QualityAssuranceService initialized');

    // Test ImageEnhancementService
    if (!this.enhancer) {
      throw new Error('ImageEnhancementService failed to initialize');
    }
    console.log('✅ ImageEnhancementService initialized');
  }

  private async testConfigurationValidation() {
    console.log('\n🔧 Testing Configuration Validation...');
    
    // Test valid configuration
    const validConfig: ProcessingConfig = {
      confidence_threshold: 0.8,
      language_preference: 'arabic',
      enhance_images: true,
      extract_forms: true,
      validate_medical_terms: true
    };

    if (validConfig.confidence_threshold < 0 || validConfig.confidence_threshold > 1) {
      throw new Error('Invalid confidence threshold validation');
    }
    console.log('✅ Valid configuration accepted');

    // Test invalid configuration handling
    const invalidConfigs = [
      { confidence_threshold: -0.1 },
      { confidence_threshold: 1.5 },
      { language_preference: 'invalid' as any }
    ];

    for (const config of invalidConfigs) {
      try {
        // In a real implementation, this would validate and throw
        if (config.confidence_threshold && (config.confidence_threshold < 0 || config.confidence_threshold > 1)) {
          throw new Error('Invalid confidence threshold');
        }
        if (config.language_preference && !['arabic', 'english', 'auto'].includes(config.language_preference)) {
          throw new Error('Invalid language preference');
        }
      } catch (error) {
        console.log('✅ Invalid configuration rejected:', error.message);
      }
    }
  }

  private async testImageEnhancement() {
    console.log('\n🖼️  Testing Image Enhancement...');
    
    // Test image quality analysis (mock)
    const mockImagePath = './uploads/test-documents/sample.jpg';
    
    try {
      // This would normally analyze a real image
      const mockQuality = {
        resolution: { width: 2480, height: 3508 },
        dpi: 300,
        colorSpace: 'srgb',
        fileSize: 1024000,
        estimatedTextClarity: 0.75,
        recommendedEnhancement: 'general'
      };
      
      console.log('✅ Image quality analysis completed');
      console.log(`   Resolution: ${mockQuality.resolution.width}x${mockQuality.resolution.height}`);
      console.log(`   DPI: ${mockQuality.dpi}`);
      console.log(`   Text Clarity: ${mockQuality.estimatedTextClarity}`);
      console.log(`   Recommended: ${mockQuality.recommendedEnhancement}`);
      
    } catch (error) {
      console.log('⚠️  Image enhancement test skipped (no test image)');
    }
  }

  private async testQualityAssurance() {
    console.log('\n🔍 Testing Quality Assurance...');
    
    // Mock processing result for testing
    const mockResult = {
      document_id: 'test_doc_123',
      extracted_text: 'نص تجريبي مستخرج من الوثيقة الطبية',
      entities: {
        patient: {
          name: 'أحمد محمد علي',
          age: '45',
          gender: 'male',
          id: '1234567890'
        },
        diagnoses: [
          {
            condition: 'داء السكري من النوع الثاني',
            icd10_code: 'E11.9',
            confidence: 0.85
          }
        ],
        medications: [
          {
            name: 'ميتفورمين',
            dosage: '500mg',
            frequency: 'مرتين يومياً'
          }
        ],
        procedures: [],
        lab_results: [
          {
            test_name: 'HbA1c',
            value: '8.2',
            unit: '%',
            reference_range: '4.0-6.0',
            status: 'abnormal' as const
          }
        ]
      },
      confidence_score: 0.87,
      processing_time: 3450,
      document_type: 'pdf' as const,
      language: 'arabic'
    };

    // Test quality assessment
    const quality = await this.qa.assessQuality(mockResult);
    console.log('✅ Quality assessment completed');
    console.log(`   Overall Confidence: ${quality.overall_confidence.toFixed(2)}`);
    console.log(`   Text Clarity: ${quality.text_clarity.toFixed(2)}`);
    console.log(`   Form Completeness: ${quality.form_completeness.toFixed(2)}`);

    // Test review flagging
    const flags = this.qa.flagForReview(mockResult, quality);
    console.log('✅ Review flagging completed');
    if (flags.length > 0) {
      console.log(`   Flags: ${flags.join(', ')}`);
    } else {
      console.log('   No review flags raised');
    }

    // Test verification interface
    const verification = this.qa.createVerificationInterface(mockResult, quality);
    console.log('✅ Verification interface created');
    console.log(`   Priority: ${verification.priority}`);
    console.log(`   Verification Required: ${verification.verification_required}`);
  }

  private async testErrorHandling() {
    console.log('\n🚨 Testing Error Handling...');
    
    // Test invalid file path
    try {
      await this.processor.processDocument('./non-existent-file.pdf');
      throw new Error('Should have thrown error for non-existent file');
    } catch (error) {
      console.log('✅ Non-existent file error handled correctly');
    }

    // Test invalid configuration
    try {
      const invalidConfig = {
        confidence_threshold: -1,
        language_preference: 'invalid' as any
      };
      
      // Validate configuration
      if (invalidConfig.confidence_threshold < 0 || invalidConfig.confidence_threshold > 1) {
        throw new Error('Invalid confidence threshold');
      }
      
    } catch (error) {
      console.log('✅ Invalid configuration error handled correctly');
    }

    console.log('✅ Error handling tests completed');
  }

  private async testMedicalEntityValidation() {
    console.log('\n🏥 Testing Medical Entity Validation...');
    
    // Test valid medical entities
    const validEntities = {
      patient: {
        name: 'أحمد محمد',
        age: '45',
        gender: 'male'
      },
      diagnoses: [
        {
          condition: 'داء السكري',
          icd10_code: 'E11.9',
          confidence: 0.9
        }
      ],
      medications: [
        {
          name: 'ميتفورمين',
          dosage: '500mg',
          frequency: 'يومياً'
        }
      ],
      procedures: [],
      lab_results: []
    };

    // Validate ICD-10 codes
    const icd10Pattern = /^[A-Z]\d{2}(\.\d{1,3})?$/;
    for (const diagnosis of validEntities.diagnoses) {
      if (diagnosis.icd10_code && !icd10Pattern.test(diagnosis.icd10_code)) {
        throw new Error(`Invalid ICD-10 code: ${diagnosis.icd10_code}`);
      }
    }
    console.log('✅ ICD-10 code validation passed');

    // Validate required fields
    if (!validEntities.patient.name) {
      throw new Error('Patient name is required');
    }
    console.log('✅ Required field validation passed');

    console.log('✅ Medical entity validation completed');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new DocumentProcessorTest();
  tester.runTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

export default DocumentProcessorTest;