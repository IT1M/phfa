import { DocumentProcessorService } from '../services/document-processor.service';
import { QualityAssuranceService } from '../services/quality-assurance.service';
import { ImageEnhancementService } from '../utils/image-enhancement';
import { ProcessingConfig, DocumentType } from '../types/document-processor.types';
import path from 'path';

/**
 * Comprehensive example demonstrating the document processing pipeline
 */
export class DocumentProcessingExample {
  private documentProcessor: DocumentProcessorService;
  private qualityAssurance: QualityAssuranceService;
  private imageEnhancer: ImageEnhancementService;

  constructor() {
    this.documentProcessor = new DocumentProcessorService();
    this.qualityAssurance = new QualityAssuranceService();
    this.imageEnhancer = new ImageEnhancementService();
  }

  /**
   * Example 1: Process a single PDF medical report
   */
  async processPDFReport() {
    console.log('🔄 Processing PDF Medical Report...');
    
    const config: ProcessingConfig = {
      confidence_threshold: 0.8,
      language_preference: 'arabic',
      enhance_images: true,
      extract_forms: true,
      validate_medical_terms: true
    };

    try {
      // Simulate PDF file path
      const pdfPath = './uploads/medical-report.pdf';
      
      const result = await this.documentProcessor.processDocument(pdfPath, config);
      
      console.log('✅ PDF Processing Results:');
      console.log(`Document ID: ${result.document_id}`);
      console.log(`Confidence Score: ${result.confidence_score}`);
      console.log(`Processing Time: ${result.processing_time}ms`);
      console.log(`Language Detected: ${result.language}`);
      
      // Quality assessment
      const quality = await this.qualityAssurance.assessQuality(result);
      console.log('\n📊 Quality Metrics:');
      console.log(`Overall Confidence: ${quality.overall_confidence}`);
      console.log(`Text Clarity: ${quality.text_clarity}`);
      console.log(`Form Completeness: ${quality.form_completeness}`);
      
      // Check if manual review is needed
      const reviewFlags = this.qualityAssurance.flagForReview(result, quality);
      if (reviewFlags.length > 0) {
        console.log('\n⚠️  Manual Review Required:');
        reviewFlags.forEach(flag => console.log(`- ${flag}`));
      }

      return result;
      
    } catch (error) {
      console.error('❌ PDF Processing Failed:', error.message);
      throw error;
    }
  }

  /**
   * Example 2: Process handwritten prescription
   */
  async processHandwrittenPrescription() {
    console.log('🔄 Processing Handwritten Prescription...');
    
    const config: ProcessingConfig = {
      confidence_threshold: 0.6, // Lower threshold for handwriting
      language_preference: 'mixed',
      enhance_images: true,
      extract_forms: false,
      validate_medical_terms: true
    };

    try {
      const imagePath = './uploads/handwritten-prescription.jpg';
      
      // Pre-enhance for handwriting
      const enhancedPath = await this.imageEnhancer.enhanceHandwritten(imagePath);
      
      const result = await this.documentProcessor.processDocument(enhancedPath, config);
      
      console.log('✅ Handwritten Processing Results:');
      console.log(`Medications Found: ${result.entities.medications.length}`);
      console.log(`Patient Info: ${result.entities.patient.name || 'Not detected'}`);
      
      // Show extracted medications
      if (result.entities.medications.length > 0) {
        console.log('\n💊 Extracted Medications:');
        result.entities.medications.forEach((med, index) => {
          console.log(`${index + 1}. ${med.name} - ${med.dosage} - ${med.frequency}`);
        });
      }

      return result;
      
    } catch (error) {
      console.error('❌ Handwritten Processing Failed:', error.message);
      throw error;
    }
  }

  /**
   * Example 3: Process Arabic medical form
   */
  async processArabicMedicalForm() {
    console.log('🔄 Processing Arabic Medical Form...');
    
    const config: ProcessingConfig = {
      confidence_threshold: 0.75,
      language_preference: 'arabic',
      enhance_images: true,
      extract_forms: true,
      validate_medical_terms: true
    };

    try {
      const formPath = './uploads/arabic-medical-form.pdf';
      
      const result = await this.documentProcessor.processDocument(formPath, config);
      
      console.log('✅ Arabic Form Processing Results:');
      console.log(`Patient Name: ${result.entities.patient.name || 'غير محدد'}`);
      console.log(`Age: ${result.entities.patient.age || 'غير محدد'}`);
      console.log(`Diagnoses: ${result.entities.diagnoses.length}`);
      
      // Show Arabic diagnoses
      if (result.entities.diagnoses.length > 0) {
        console.log('\n🏥 التشخيصات المستخرجة:');
        result.entities.diagnoses.forEach((diagnosis, index) => {
          console.log(`${index + 1}. ${diagnosis.condition} (${diagnosis.confidence})`);
        });
      }

      return result;
      
    } catch (error) {
      console.error('❌ Arabic Form Processing Failed:', error.message);
      throw error;
    }
  }

  /**
   * Example 4: Batch process multiple documents
   */
  async batchProcessDocuments() {
    console.log('🔄 Batch Processing Multiple Documents...');
    
    const documents = [
      './uploads/report1.pdf',
      './uploads/xray-image.jpg',
      './uploads/lab-results.docx'
    ];

    const config: ProcessingConfig = {
      confidence_threshold: 0.7,
      language_preference: 'auto',
      enhance_images: true,
      extract_forms: true,
      validate_medical_terms: true
    };

    const results = [];
    const errors = [];

    for (const docPath of documents) {
      try {
        console.log(`Processing: ${path.basename(docPath)}`);
        const result = await this.documentProcessor.processDocument(docPath, config);
        results.push(result);
        console.log(`✅ Completed: ${result.document_id}`);
        
      } catch (error) {
        console.error(`❌ Failed: ${path.basename(docPath)} - ${error.message}`);
        errors.push({
          file: docPath,
          error: error.message
        });
      }
    }

    console.log(`\n📊 Batch Results: ${results.length} successful, ${errors.length} failed`);
    
    return { results, errors };
  }

  /**
   * Example 5: Quality assurance workflow
   */
  async qualityAssuranceWorkflow() {
    console.log('🔄 Quality Assurance Workflow...');
    
    // Process a document
    const result = await this.processPDFReport();
    
    // Assess quality
    const quality = await this.qualityAssurance.assessQuality(result);
    
    // Create verification interface
    const verification = this.qualityAssurance.createVerificationInterface(result, quality);
    
    console.log('\n🔍 Verification Interface:');
    console.log(`Priority: ${verification.priority}`);
    console.log(`Verification Required: ${verification.verification_required}`);
    
    // Show sections requiring review
    verification.sections.forEach(section => {
      if (section.requires_review) {
        console.log(`⚠️  Section "${section.section}" requires review (confidence: ${section.confidence})`);
      }
    });

    // Show suggested corrections
    if (verification.suggested_corrections.length > 0) {
      console.log('\n💡 Suggested Corrections:');
      verification.suggested_corrections.forEach(suggestion => {
        console.log(`- ${suggestion.field}: ${suggestion.suggestion} (${suggestion.priority})`);
      });
    }

    return verification;
  }

  /**
   * Example 6: Image enhancement showcase
   */
  async imageEnhancementShowcase() {
    console.log('🔄 Image Enhancement Showcase...');
    
    const imagePath = './uploads/poor-quality-scan.jpg';
    
    try {
      // Analyze original image quality
      const quality = await this.imageEnhancer.analyzeImageQuality(imagePath);
      console.log('📊 Original Image Quality:');
      console.log(`Resolution: ${quality.resolution.width}x${quality.resolution.height}`);
      console.log(`DPI: ${quality.dpi}`);
      console.log(`Text Clarity: ${quality.estimatedTextClarity}`);
      console.log(`Recommended Enhancement: ${quality.recommendedEnhancement}`);
      
      // Apply different enhancement types
      const enhancements = [
        { type: 'general', method: 'enhanceForOCR' },
        { type: 'handwritten', method: 'enhanceHandwritten' },
        { type: 'form', method: 'enhanceForm' },
        { type: 'arabic', method: 'enhanceArabicText' }
      ];

      for (const enhancement of enhancements) {
        console.log(`\n🔧 Applying ${enhancement.type} enhancement...`);
        
        const enhancedPath = await (this.imageEnhancer as any)[enhancement.method](imagePath);
        console.log(`✅ Enhanced image saved: ${enhancedPath}`);
        
        // Analyze enhanced quality
        const enhancedQuality = await this.imageEnhancer.analyzeImageQuality(enhancedPath);
        console.log(`Improved Text Clarity: ${enhancedQuality.estimatedTextClarity} (${((enhancedQuality.estimatedTextClarity - quality.estimatedTextClarity) * 100).toFixed(1)}% improvement)`);
      }

    } catch (error) {
      console.error('❌ Image Enhancement Failed:', error.message);
      throw error;
    }
  }

  /**
   * Example 7: Medical entity validation
   */
  async medicalEntityValidation() {
    console.log('🔄 Medical Entity Validation...');
    
    // Sample extracted entities (would come from OCR)
    const sampleEntities = {
      patient: {
        name: "أحمد محمد علي",
        age: "45",
        gender: "male",
        id: "1234567890"
      },
      diagnoses: [
        {
          condition: "داء السكري من النوع الثاني",
          icd10_code: "E11.9",
          confidence: 0.85
        },
        {
          condition: "ارتفاع ضغط الدم",
          icd10_code: "I10",
          confidence: 0.92
        }
      ],
      medications: [
        {
          name: "ميتفورمين",
          dosage: "500mg",
          frequency: "مرتين يومياً"
        }
      ],
      lab_results: [
        {
          test_name: "HbA1c",
          value: "8.2",
          unit: "%",
          reference_range: "4.0-6.0",
          status: "abnormal"
        }
      ]
    };

    // Validate entities
    console.log('🔍 Validating Medical Entities...');
    
    // Check patient information
    if (!sampleEntities.patient.name) {
      console.log('⚠️  Missing patient name');
    } else {
      console.log(`✅ Patient: ${sampleEntities.patient.name}`);
    }

    // Validate diagnoses
    sampleEntities.diagnoses.forEach((diagnosis, index) => {
      console.log(`\n🏥 Diagnosis ${index + 1}: ${diagnosis.condition}`);
      console.log(`   ICD-10: ${diagnosis.icd10_code}`);
      console.log(`   Confidence: ${diagnosis.confidence}`);
      
      if (diagnosis.confidence < 0.8) {
        console.log('   ⚠️  Low confidence - requires review');
      }
    });

    // Validate lab results
    sampleEntities.lab_results.forEach((lab, index) => {
      console.log(`\n🧪 Lab Result ${index + 1}: ${lab.test_name}`);
      console.log(`   Value: ${lab.value} ${lab.unit}`);
      console.log(`   Reference: ${lab.reference_range}`);
      console.log(`   Status: ${lab.status}`);
      
      if (lab.status === 'abnormal') {
        console.log('   🚨 Abnormal result - clinical attention required');
      }
    });

    return sampleEntities;
  }

  /**
   * Run all examples
   */
  async runAllExamples() {
    console.log('🚀 Running All Document Processing Examples...\n');
    
    try {
      // Note: These would fail without actual files, but show the workflow
      console.log('Example 1: PDF Report Processing');
      // await this.processPDFReport();
      
      console.log('\nExample 2: Handwritten Prescription');
      // await this.processHandwrittenPrescription();
      
      console.log('\nExample 3: Arabic Medical Form');
      // await this.processArabicMedicalForm();
      
      console.log('\nExample 4: Batch Processing');
      // await this.batchProcessDocuments();
      
      console.log('\nExample 5: Quality Assurance');
      // await this.qualityAssuranceWorkflow();
      
      console.log('\nExample 6: Image Enhancement');
      // await this.imageEnhancementShowcase();
      
      console.log('\nExample 7: Entity Validation');
      await this.medicalEntityValidation();
      
      console.log('\n✅ All examples completed successfully!');
      
    } catch (error) {
      console.error('❌ Example execution failed:', error.message);
    }
  }
}

// Export for use in other files
export default DocumentProcessingExample;

// Run examples if this file is executed directly
if (require.main === module) {
  const example = new DocumentProcessingExample();
  example.runAllExamples();
}