/**
 * Test script for Intelligent Medical Search System
 * Run with: npx ts-node test-intelligent-search.ts
 */

import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';
let authToken = '';

// Test queries in Arabic and English
const testQueries = [
  'مرضى السكري فوق 50 سنة في الرياض',
  'Cardiac patients with diabetes in Jeddah',
  'Women under 40 with breast cancer history',
  'Patients allergic to penicillin',
  'مرضى القلب في جدة',
  'Emergency cases last week',
];

async function login() {
  console.log('🔐 Logging in...');
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'password123',
    });
    authToken = response.data.token;
    console.log('✅ Login successful\n');
  } catch (error: any) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

async function testSearch(query: string) {
  console.log(`\n🔍 Testing search: "${query}"`);
  try {
    const response = await axios.post(
      `${API_BASE}/intelligent-search`,
      {
        query,
        page: 1,
        pageSize: 5,
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    const { data } = response.data;
    console.log(`✅ Found ${data.total} results in ${data.executionTime}ms`);
    console.log(`📊 Filters applied:`, JSON.stringify(data.filters, null, 2));
    
    if (data.results.length > 0) {
      console.log(`\n📄 Top result:`);
      const result = data.results[0];
      console.log(`   - Patient: ${result.patientName || 'Unknown'}`);
      console.log(`   - Relevance: ${result.relevanceScore.toFixed(2)}`);
      console.log(`   - Conditions: ${result.matchedConditions.join(', ')}`);
      console.log(`   - Medications: ${result.matchedMedications.join(', ')}`);
      console.log(`   - Snippet: ${result.snippet.substring(0, 100)}...`);
    }
  } catch (error: any) {
    console.error('❌ Search failed:', error.response?.data || error.message);
  }
}

async function testParseQuery(query: string) {
  console.log(`\n🧠 Parsing query: "${query}"`);
  try {
    const response = await axios.post(
      `${API_BASE}/intelligent-search/parse-query`,
      { query },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    const { data } = response.data;
    console.log('✅ Parsed query:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error: any) {
    console.error('❌ Parse failed:', error.response?.data || error.message);
  }
}

async function testSuggestions() {
  console.log('\n💡 Getting search suggestions...');
  try {
    const response = await axios.get(
      `${API_BASE}/intelligent-search/suggestions?limit=5`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    const { data } = response.data;
    console.log('✅ Suggestions:');
    data.forEach((suggestion: string, i: number) => {
      console.log(`   ${i + 1}. ${suggestion}`);
    });
  } catch (error: any) {
    console.error('❌ Get suggestions failed:', error.response?.data || error.message);
  }
}

async function testBulkSearch() {
  console.log('\n📦 Testing bulk search...');
  const queries = [
    'مرضى السكري',
    'Cardiac patients',
    'Cancer patients',
  ];

  try {
    const response = await axios.post(
      `${API_BASE}/intelligent-search/bulk`,
      { queries },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    const { data } = response.data;
    console.log('✅ Bulk search results:');
    Object.entries(data).forEach(([query, results]: [string, any]) => {
      console.log(`   - "${query}": ${results.total} results`);
    });
  } catch (error: any) {
    console.error('❌ Bulk search failed:', error.response?.data || error.message);
  }
}

async function testTranslation() {
  console.log('\n🌐 Testing translation...');
  const text = 'مريض يعاني من السكري وارتفاع ضغط الدم';

  try {
    const response = await axios.post(
      `${API_BASE}/intelligent-search/translate`,
      { text, targetLang: 'en' },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    const { data } = response.data;
    console.log('✅ Translation:');
    console.log(`   Original (AR): ${data.original}`);
    console.log(`   Translated (EN): ${data.translated}`);
  } catch (error: any) {
    console.error('❌ Translation failed:', error.response?.data || error.message);
  }
}

async function testNormalization() {
  console.log('\n📝 Testing term normalization...');
  const text = 'المريض عنده سكر وضغط عالي';

  try {
    const response = await axios.post(
      `${API_BASE}/intelligent-search/normalize-terms`,
      { text },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    const { data } = response.data;
    console.log('✅ Normalized terms:');
    data.forEach((term: any) => {
      console.log(`   - "${term.original}" → "${term.normalized}" (${term.language})`);
    });
  } catch (error: any) {
    console.error('❌ Normalization failed:', error.response?.data || error.message);
  }
}

async function testICD10Extraction() {
  console.log('\n🏥 Testing ICD-10 extraction...');
  const diagnoses = ['diabetes', 'hypertension', 'السكري'];

  try {
    const response = await axios.post(
      `${API_BASE}/intelligent-search/extract-icd10`,
      { diagnoses },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    const { data } = response.data;
    console.log('✅ ICD-10 codes:');
    data.forEach((item: any) => {
      console.log(`   - ${item.diagnosis}: ${item.icd10} (${item.description})`);
    });
  } catch (error: any) {
    console.error('❌ ICD-10 extraction failed:', error.response?.data || error.message);
  }
}

async function testAnalytics() {
  console.log('\n📊 Getting search analytics...');
  try {
    const response = await axios.get(
      `${API_BASE}/intelligent-search/analytics`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    const { data } = response.data;
    console.log('✅ Analytics:');
    console.log(`   - Total searches: ${data.total_searches}`);
    console.log(`   - Avg results: ${data.avg_results}`);
    console.log(`   - Avg execution time: ${data.avg_execution_time}ms`);
  } catch (error: any) {
    console.error('❌ Get analytics failed:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Intelligent Search System Tests\n');
  console.log('=' .repeat(60));

  await login();

  // Test 1: Parse queries
  console.log('\n📋 TEST 1: Query Parsing');
  console.log('=' .repeat(60));
  for (const query of testQueries.slice(0, 3)) {
    await testParseQuery(query);
  }

  // Test 2: Search execution
  console.log('\n\n📋 TEST 2: Search Execution');
  console.log('=' .repeat(60));
  for (const query of testQueries.slice(0, 3)) {
    await testSearch(query);
  }

  // Test 3: Suggestions
  console.log('\n\n📋 TEST 3: Search Suggestions');
  console.log('=' .repeat(60));
  await testSuggestions();

  // Test 4: Bulk search
  console.log('\n\n📋 TEST 4: Bulk Search');
  console.log('=' .repeat(60));
  await testBulkSearch();

  // Test 5: Translation
  console.log('\n\n📋 TEST 5: Medical Translation');
  console.log('=' .repeat(60));
  await testTranslation();

  // Test 6: Term normalization
  console.log('\n\n📋 TEST 6: Term Normalization');
  console.log('=' .repeat(60));
  await testNormalization();

  // Test 7: ICD-10 extraction
  console.log('\n\n📋 TEST 7: ICD-10 Code Extraction');
  console.log('=' .repeat(60));
  await testICD10Extraction();

  // Test 8: Analytics
  console.log('\n\n📋 TEST 8: Search Analytics');
  console.log('=' .repeat(60));
  await testAnalytics();

  console.log('\n\n' + '=' .repeat(60));
  console.log('✅ All tests completed!');
  console.log('=' .repeat(60));
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
