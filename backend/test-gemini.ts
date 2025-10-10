/**
 * Quick test script for Gemini API integration
 * Run with: npx ts-node test-gemini.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import { geminiService } from './src/services/gemini.service';

async function testGeminiIntegration() {
  console.log('🧪 Testing Gemini API Integration...\n');

  try {
    // Test 1: Extract entities from Arabic medical text
    console.log('Test 1: Extracting medical entities from Arabic text...');
    const arabicText = 'المريض أحمد، 45 سنة، ذكر. التشخيص: السكري من النوع الثاني. الدواء: ميتفورمين 500mg مرتين يومياً';
    const entities = await geminiService.extractMedicalEntities(arabicText);
    console.log('✅ Entities extracted:', JSON.stringify(entities, null, 2));
    console.log('');

    // Test 2: Parse search query
    console.log('Test 2: Parsing natural language search query...');
    const query = 'مرضى السكري في الرياض بين 40-60 سنة';
    const parsed = await geminiService.parseSearchQuery(query);
    console.log('✅ Query parsed:', JSON.stringify(parsed, null, 2));
    console.log('');

    // Test 3: Summarize document
    console.log('Test 3: Summarizing medical document...');
    const document = 'Patient presents with chest pain. ECG shows ST elevation. Diagnosed with MI. Started on aspirin and clopidogrel.';
    const summary = await geminiService.summarizeDocument(document);
    console.log('✅ Summary generated:', JSON.stringify(summary, null, 2));
    console.log('');

    // Test 4: Translate text
    console.log('Test 4: Translating medical text...');
    const englishText = 'Patient has diabetes and hypertension';
    const translation = await geminiService.translateMedicalText(englishText, 'ar');
    console.log('✅ Translation:', translation);
    console.log('');

    // Test 5: Extract ICD-10 codes
    console.log('Test 5: Extracting ICD-10 codes...');
    const diagnoses = ['Type 2 Diabetes', 'Hypertension'];
    const codes = await geminiService.extractICD10Codes(diagnoses);
    console.log('✅ ICD-10 codes:', JSON.stringify(codes, null, 2));
    console.log('');

    console.log('🎉 All tests passed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testGeminiIntegration();
