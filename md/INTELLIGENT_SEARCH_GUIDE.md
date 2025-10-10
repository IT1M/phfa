# Intelligent Medical Search System - Complete Guide

## Overview

An advanced medical search system with natural language processing capabilities that supports both Arabic and English queries. The system uses Google's Gemini AI to understand complex medical queries and convert them into structured database searches.

## Features

### 🔍 Core Search Capabilities

1. **Natural Language Processing**
   - Process queries in Arabic and English
   - Understand medical terminology and synonyms
   - Support complex multi-condition queries
   - Implement fuzzy matching for typos
   - Rank results by medical relevance

2. **Advanced Query Understanding**
   - Age range extraction (e.g., "فوق 50 سنة", "under 40")
   - Date range parsing (e.g., "last month", "الشهر الماضي")
   - Location detection (Saudi cities: Riyadh, Jeddah, Mecca, etc.)
   - Medical condition identification
   - Medication recognition
   - Urgency level assessment

3. **Smart Result Ranking**
   - Text relevance scoring
   - Patient information completeness bonus
   - Medical entity matching
   - Contextual relevance calculation

### 🎯 Query Examples

```javascript
// Arabic Queries
"مرضى السكري فوق 50 سنة في الرياض"
"نساء تحت 40 سنة مع تاريخ سرطان الثدي"
"مرضى حساسية البنسلين"
"حالات طوارئ قلبية في جدة"

// English Queries
"Cardiac patients with diabetes in Jeddah"
"Women under 40 with breast cancer history"
"Patients allergic to penicillin"
"Emergency cases last week"

// Mixed Language
"مرضى diabetes في الرياض"
"Patients with سكري and hypertension"
```

## API Endpoints

### 1. Main Search Endpoint

**POST** `/api/intelligent-search`

Search for patients using natural language queries.

```typescript
// Request
{
  "query": "مرضى السكري فوق 50 سنة في الرياض",
  "page": 1,
  "pageSize": 20,
  "saveQuery": true
}

// Response
{
  "success": true,
  "data": {
    "results": [
      {
        "documentId": "uuid",
        "patientName": "أحمد محمد",
        "patientId": "P12345",
        "relevanceScore": 8.5,
        "matchedConditions": ["diabetes", "السكري"],
        "matchedMedications": ["metformin"],
        "snippet": "...patient diagnosed with type 2 diabetes...",
        "highlights": ["diabetes", "50 years", "Riyadh"],
        "metadata": {
          "fileName": "patient_record.pdf",
          "dateOfBirth": "1970-01-01",
          "gender": "male",
          "entities": [...],
          "extractedData": {...}
        },
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 45,
    "page": 1,
    "pageSize": 20,
    "totalPages": 3,
    "executionTime": 234,
    "query": "مرضى السكري فوق 50 سنة في الرياض",
    "filters": {
      "conditions": ["diabetes", "السكري"],
      "ageRange": { "min": 50 },
      "locations": ["Riyadh", "الرياض"]
    }
  }
}
```

### 2. Search Suggestions

**GET** `/api/intelligent-search/suggestions?limit=10`

Get search suggestions based on user's search history.

```typescript
// Response
{
  "success": true,
  "data": [
    "مرضى السكري فوق 50 سنة",
    "Cardiac patients with diabetes",
    "Women under 40 with breast cancer"
  ]
}
```

### 3. Similar Patients Finder

**POST** `/api/intelligent-search/similar-patients`

Find patients with similar medical conditions.

```typescript
// Request
{
  "documentId": "uuid-of-reference-document",
  "limit": 10
}

// Response
{
  "success": true,
  "data": [
    {
      "documentId": "uuid",
      "patientName": "محمد علي",
      "relevanceScore": 9.2,
      "matchedConditions": ["diabetes", "hypertension"],
      ...
    }
  ]
}
```

### 4. Bulk Search

**POST** `/api/intelligent-search/bulk`

Perform multiple searches at once (max 10 queries).

```typescript
// Request
{
  "queries": [
    "مرضى السكري",
    "Cardiac patients",
    "Cancer patients"
  ]
}

// Response
{
  "success": true,
  "data": {
    "مرضى السكري": { results: [...], total: 45, ... },
    "Cardiac patients": { results: [...], total: 23, ... },
    "Cancer patients": { results: [...], total: 12, ... }
  }
}
```

### 5. Search Analytics

**GET** `/api/intelligent-search/analytics`

Get search analytics for the current user.

```typescript
// Response
{
  "success": true,
  "data": {
    "total_searches": 156,
    "avg_results": 12.5,
    "avg_execution_time": 245,
    "recent_queries": [...]
  }
}
```

### 6. Parse Query (Debug)

**POST** `/api/intelligent-search/parse-query`

Parse a query without executing the search (useful for debugging).

```typescript
// Request
{
  "query": "مرضى السكري فوق 50 سنة في الرياض"
}

// Response
{
  "success": true,
  "data": {
    "conditions": ["diabetes", "السكري"],
    "ageRange": { "min": 50 },
    "dateRange": null,
    "medications": [],
    "locations": ["Riyadh", "الرياض"],
    "urgencyLevel": null,
    "rawQuery": "مرضى السكري فوق 50 سنة في الرياض"
  }
}
```

### 7. Medical Text Translation

**POST** `/api/intelligent-search/translate`

Translate medical text between Arabic and English.

```typescript
// Request
{
  "text": "مريض يعاني من السكري وارتفاع ضغط الدم",
  "targetLang": "en"
}

// Response
{
  "success": true,
  "data": {
    "original": "مريض يعاني من السكري وارتفاع ضغط الدم",
    "translated": "Patient suffering from diabetes and hypertension",
    "targetLang": "en"
  }
}
```

### 8. Normalize Medical Terms

**POST** `/api/intelligent-search/normalize-terms`

Normalize medical terms to standard terminology.

```typescript
// Request
{
  "text": "المريض عنده سكر وضغط عالي"
}

// Response
{
  "success": true,
  "data": [
    {
      "original": "سكر",
      "normalized": "diabetes mellitus",
      "language": "ar"
    },
    {
      "original": "ضغط عالي",
      "normalized": "hypertension",
      "language": "ar"
    }
  ]
}
```

### 9. Extract ICD-10 Codes

**POST** `/api/intelligent-search/extract-icd10`

Extract ICD-10 codes from diagnoses.

```typescript
// Request
{
  "diagnoses": ["diabetes", "hypertension", "السكري"]
}

// Response
{
  "success": true,
  "data": [
    {
      "diagnosis": "diabetes",
      "icd10": "E11",
      "description": "Type 2 diabetes mellitus"
    },
    {
      "diagnosis": "hypertension",
      "icd10": "I10",
      "description": "Essential (primary) hypertension"
    }
  ]
}
```

## Implementation Details

### Backend Architecture

```
backend/src/
├── services/
│   ├── intelligentSearchService.ts  # Main search logic
│   └── gemini.service.ts            # NLP processing
├── routes/
│   └── intelligentSearch.ts         # API endpoints
└── server.ts                        # Route registration
```

### Key Components

#### 1. IntelligentSearchService

Main service handling search operations:

```typescript
class IntelligentSearchService {
  // Main search with NLP
  async search(query, userId, options)
  
  // Build structured filters
  private buildFilters(parsedQuery)
  
  // Execute database search
  private async executeSearch(query, filters, userId, limit, offset)
  
  // Process search results
  private processSearchResult(row, query, filters)
  
  // Extract snippets and highlights
  private extractSnippet(text, query, length)
  private extractHighlights(text, query, filters)
  
  // Additional features
  async getSearchSuggestions(userId, limit)
  async findSimilarPatients(documentId, userId, limit)
  async bulkSearch(queries, userId)
  async getSearchAnalytics(userId)
}
```

#### 2. GeminiService

NLP processing using Google's Gemini AI:

```typescript
class GeminiService {
  // Parse natural language queries
  async parseSearchQuery(query): Promise<SearchQuery>
  
  // Extract medical entities
  async extractMedicalEntities(text): Promise<MedicalEntities>
  
  // Translate medical text
  async translateMedicalText(text, targetLang)
  
  // Normalize medical terms
  async normalizeMedicalTerms(text)
  
  // Extract ICD-10 codes
  async extractICD10Codes(diagnoses)
}
```

### Database Schema

The search system uses these tables:

```sql
-- Documents with full-text search
CREATE INDEX idx_documents_text_search 
ON documents USING gin(to_tsvector('english', extracted_text));

-- Medical entities for condition/medication matching
CREATE TABLE medical_entities (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  entity_type VARCHAR(100),  -- diagnosis, medication, etc.
  entity_value TEXT,
  confidence DECIMAL(5,2),
  ...
);

-- Patient information for demographic filtering
CREATE TABLE patient_info (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  patient_name VARCHAR(255),
  patient_id VARCHAR(100),
  date_of_birth DATE,
  gender VARCHAR(20),
  ...
);

-- Search query history
CREATE TABLE search_queries (
  id UUID PRIMARY KEY,
  user_id UUID,
  query_text TEXT,
  query_type VARCHAR(50),
  results JSONB,
  result_count INTEGER,
  execution_time INTEGER,
  created_at TIMESTAMP
);
```

### Search Algorithm

1. **Query Parsing** (Gemini AI)
   - Extract conditions, age ranges, dates, locations
   - Normalize medical terminology
   - Identify query intent

2. **Filter Building**
   - Convert parsed query to SQL filters
   - Handle multi-language terms
   - Apply fuzzy matching

3. **Database Search**
   - Full-text search on document text
   - Entity matching for conditions/medications
   - Demographic filtering (age, gender, location)
   - Date range filtering

4. **Result Ranking**
   ```
   final_score = (text_rank * 10) + 
                 (has_patient_name ? 2 : 0) +
                 (has_patient_id ? 1 : 0)
   ```

5. **Result Processing**
   - Extract relevant snippets
   - Highlight matched terms
   - Calculate relevance scores
   - Format metadata

## Frontend Integration

### React Component

```tsx
import IntelligentSearch from '@/components/search/IntelligentSearch';

function SearchPage() {
  return <IntelligentSearch />;
}
```

### Features

- Real-time search with loading states
- Search suggestions from history
- Example queries for quick start
- Highlighted search results
- Pagination support
- Bilingual interface (Arabic/English)
- Responsive design

## Usage Examples

### Basic Search

```typescript
const response = await fetch('/api/intelligent-search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    query: 'مرضى السكري فوق 50 سنة',
    page: 1,
    pageSize: 20
  })
});

const { data } = await response.json();
console.log(`Found ${data.total} results in ${data.executionTime}ms`);
```

### Find Similar Patients

```typescript
const response = await fetch('/api/intelligent-search/similar-patients', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    documentId: 'patient-uuid',
    limit: 10
  })
});

const { data } = await response.json();
console.log(`Found ${data.length} similar patients`);
```

### Bulk Search

```typescript
const response = await fetch('/api/intelligent-search/bulk', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    queries: [
      'مرضى السكري',
      'Cardiac patients',
      'Cancer patients'
    ]
  })
});

const { data } = await response.json();
Object.entries(data).forEach(([query, results]) => {
  console.log(`${query}: ${results.total} results`);
});
```

## Performance Optimization

### Database Indexes

```sql
-- Full-text search indexes
CREATE INDEX idx_documents_text_search 
ON documents USING gin(to_tsvector('english', extracted_text));

CREATE INDEX idx_medical_entities_search 
ON medical_entities USING gin(to_tsvector('english', entity_value));

-- Entity type index for faster filtering
CREATE INDEX idx_medical_entities_type 
ON medical_entities(entity_type);

-- Patient info indexes
CREATE INDEX idx_patient_info_dob 
ON patient_info(date_of_birth);

CREATE INDEX idx_patient_info_gender 
ON patient_info(gender);
```

### Caching Strategy

```typescript
// Cache parsed queries for 1 hour
const cacheKey = `parsed_query:${query}`;
let parsedQuery = await cache.get(cacheKey);

if (!parsedQuery) {
  parsedQuery = await geminiService.parseSearchQuery(query);
  await cache.set(cacheKey, parsedQuery, 3600);
}
```

### Rate Limiting

```typescript
// Applied via authRateLimiter middleware
// Default: 100 requests per 15 minutes per user
```

## Testing

### Test Search Queries

```bash
# Test Arabic query
curl -X POST http://localhost:5000/api/intelligent-search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query": "مرضى السكري فوق 50 سنة"}'

# Test English query
curl -X POST http://localhost:5000/api/intelligent-search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query": "Cardiac patients with diabetes"}'

# Test mixed query
curl -X POST http://localhost:5000/api/intelligent-search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query": "مرضى diabetes في الرياض"}'
```

### Parse Query Test

```bash
curl -X POST http://localhost:5000/api/intelligent-search/parse-query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query": "مرضى السكري فوق 50 سنة في الرياض"}'
```

## Troubleshooting

### Common Issues

1. **No results found**
   - Check if documents are properly indexed
   - Verify medical entities are extracted
   - Try simpler queries

2. **Slow search performance**
   - Check database indexes
   - Monitor Gemini API response time
   - Consider caching parsed queries

3. **Incorrect query parsing**
   - Review Gemini prompt engineering
   - Add more examples to training
   - Normalize medical terminology

### Debug Mode

```typescript
// Enable detailed logging
const results = await intelligentSearchService.search(query, userId, {
  debug: true
});

// Check parsed query
const parsed = await geminiService.parseSearchQuery(query);
console.log('Parsed query:', JSON.stringify(parsed, null, 2));
```

## Security Considerations

1. **Authentication Required**
   - All endpoints require valid JWT token
   - User can only search their own documents

2. **Rate Limiting**
   - Prevents abuse of Gemini API
   - Limits bulk search to 10 queries

3. **Input Validation**
   - Query length limits
   - SQL injection prevention
   - XSS protection in highlights

4. **Data Privacy**
   - Patient data encrypted at rest
   - Search queries logged for analytics only
   - No sharing of search results between users

## Future Enhancements

1. **Advanced Features**
   - Voice search support
   - Image-based search
   - Predictive search
   - Search filters UI

2. **AI Improvements**
   - Fine-tune Gemini for medical domain
   - Add medical knowledge graph
   - Implement semantic search
   - Support more languages

3. **Performance**
   - Implement Elasticsearch
   - Add Redis caching
   - Optimize database queries
   - Parallel search execution

4. **Analytics**
   - Search quality metrics
   - User behavior analysis
   - Popular search terms
   - Failed search tracking

## Support

For issues or questions:
- Check logs: `backend/logs/`
- Review API responses
- Test with example queries
- Contact development team

---

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Maintained by:** PHFA Development Team
