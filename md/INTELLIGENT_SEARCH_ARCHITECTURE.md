# Intelligent Medical Search - System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                               │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Next.js Frontend (React)                                      │ │
│  │  - Search input with autocomplete                              │ │
│  │  - Real-time suggestions                                       │ │
│  │  - Result display with highlights                              │ │
│  │  - Pagination controls                                         │ │
│  │  - Filter visualization                                        │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTP/REST
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                                  │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Express.js Routes                                             │ │
│  │  - Authentication (JWT)                                        │ │
│  │  - Rate Limiting (100 req/15min)                               │ │
│  │  - Request Validation                                          │ │
│  │  - Error Handling                                              │ │
│  │  - Audit Logging                                               │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    INTELLIGENT SEARCH SERVICE                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Main Search Engine                                            │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │  1. Query Parsing (NLP)                                   │ │ │
│  │  │     - Extract conditions, age, dates, locations           │ │ │
│  │  │     - Normalize medical terms                             │ │ │
│  │  │     - Identify query intent                               │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │  2. Filter Building                                       │ │ │
│  │  │     - Convert parsed query to SQL filters                 │ │ │
│  │  │     - Handle multi-language terms                         │ │ │
│  │  │     - Apply fuzzy matching                                │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │  3. Database Search                                       │ │ │
│  │  │     - Full-text search                                    │ │ │
│  │  │     - Entity matching                                     │ │ │
│  │  │     - Demographic filtering                               │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │  4. Result Processing                                     │ │ │
│  │  │     - Relevance scoring                                   │ │ │
│  │  │     - Snippet extraction                                  │ │ │
│  │  │     - Highlight generation                                │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                    │                              │
                    │                              │
                    ▼                              ▼
┌──────────────────────────────┐  ┌──────────────────────────────────┐
│     GEMINI AI SERVICE        │  │      POSTGRESQL DATABASE         │
│  ┌────────────────────────┐  │  │  ┌────────────────────────────┐ │
│  │  Natural Language      │  │  │  │  Documents Table           │ │
│  │  Processing            │  │  │  │  - Full-text search index  │ │
│  │  - Query parsing       │  │  │  │  - Extracted text          │ │
│  │  - Entity extraction   │  │  │  │  - Metadata                │ │
│  │  - Translation         │  │  │  └────────────────────────────┘ │
│  │  - Normalization       │  │  │  ┌────────────────────────────┐ │
│  │  - ICD-10 mapping      │  │  │  │  Medical Entities Table    │ │
│  └────────────────────────┘  │  │  │  - Entity type index       │ │
└──────────────────────────────┘  │  │  - Entity value index      │ │
                                  │  │  - Confidence scores       │ │
                                  │  └────────────────────────────┘ │
                                  │  ┌────────────────────────────┐ │
                                  │  │  Patient Info Table        │ │
                                  │  │  - Demographics            │ │
                                  │  │  - Date of birth           │ │
                                  │  │  - Gender                  │ │
                                  │  └────────────────────────────┘ │
                                  │  ┌────────────────────────────┐ │
                                  │  │  Search Queries Table      │ │
                                  │  │  - Query history           │ │
                                  │  │  - Results cache           │ │
                                  │  │  - Analytics data          │ │
                                  │  └────────────────────────────┘ │
                                  └──────────────────────────────────┘
```

## Data Flow Diagram

### Search Request Flow

```
User Input
    │
    │ "مرضى السكري فوق 50 سنة في الرياض"
    │
    ▼
┌─────────────────────┐
│  Frontend Component │
│  - Validate input   │
│  - Show loading     │
└─────────────────────┘
    │
    │ POST /api/intelligent-search
    │ { query, page, pageSize }
    │
    ▼
┌─────────────────────┐
│  API Route Handler  │
│  - Authenticate     │
│  - Rate limit       │
│  - Validate         │
└─────────────────────┘
    │
    │ intelligentSearchService.search()
    │
    ▼
┌─────────────────────┐
│  Parse Query        │
│  (Gemini AI)        │
└─────────────────────┘
    │
    │ {
    │   conditions: ["diabetes"],
    │   ageRange: { min: 50 },
    │   locations: ["Riyadh"]
    │ }
    │
    ▼
┌─────────────────────┐
│  Build SQL Filters  │
│  - Conditions       │
│  - Age range        │
│  - Location         │
└─────────────────────┘
    │
    │ SQL Query with filters
    │
    ▼
┌─────────────────────┐
│  Execute Search     │
│  (PostgreSQL)       │
│  - Full-text        │
│  - Entity match     │
│  - Demographics     │
└─────────────────────┘
    │
    │ Raw results
    │
    ▼
┌─────────────────────┐
│  Process Results    │
│  - Calculate score  │
│  - Extract snippet  │
│  - Generate         │
│    highlights       │
└─────────────────────┘
    │
    │ Processed results
    │
    ▼
┌─────────────────────┐
│  Save Query         │
│  (Analytics)        │
└─────────────────────┘
    │
    │ {
    │   results: [...],
    │   total: 45,
    │   executionTime: 234ms
    │ }
    │
    ▼
┌─────────────────────┐
│  Return Response    │
│  to Frontend        │
└─────────────────────┘
    │
    │ Display results
    │
    ▼
User sees results
```

## Component Architecture

### Backend Components

```
IntelligentSearchService
├── search()
│   ├── Parse query (Gemini)
│   ├── Build filters
│   ├── Execute search
│   ├── Process results
│   └── Save query
├── getSearchSuggestions()
│   └── Query history
├── findSimilarPatients()
│   ├── Get reference conditions
│   └── Search similar
├── bulkSearch()
│   └── Parallel searches
└── getSearchAnalytics()
    └── Aggregate stats

GeminiService
├── parseSearchQuery()
│   ├── Extract conditions
│   ├── Parse age ranges
│   ├── Detect locations
│   └── Identify medications
├── extractMedicalEntities()
│   ├── Patient info
│   ├── Diagnoses
│   ├── Medications
│   └── Lab results
├── translateMedicalText()
│   └── AR ↔ EN
├── normalizeMedicalTerms()
│   └── Standardize
└── extractICD10Codes()
    └── Map diagnoses
```

### Frontend Components

```
IntelligentSearch
├── SearchInput
│   ├── Text input
│   ├── Suggestions dropdown
│   └── Example queries
├── SearchFilters
│   ├── Applied filters
│   └── Filter badges
├── SearchResults
│   ├── Result cards
│   │   ├── Patient info
│   │   ├── Matched conditions
│   │   ├── Snippet
│   │   └── Highlights
│   └── Pagination
└── SearchAnalytics
    ├── Result count
    └── Execution time
```

## Database Schema Relationships

```
┌─────────────────┐
│    documents    │
│  ┌───────────┐  │
│  │ id (PK)   │◄─┼──────────┐
│  │ user_id   │  │          │
│  │ text      │  │          │
│  │ data      │  │          │
│  └───────────┘  │          │
└─────────────────┘          │
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│medical_entities │  │  patient_info   │  │ search_queries  │
│  ┌───────────┐  │  │  ┌───────────┐  │  │  ┌───────────┐  │
│  │ id (PK)   │  │  │  │ id (PK)   │  │  │  │ id (PK)   │  │
│  │ doc_id(FK)│  │  │  │ doc_id(FK)│  │  │  │ user_id   │  │
│  │ type      │  │  │  │ name      │  │  │  │ query     │  │
│  │ value     │  │  │  │ dob       │  │  │  │ results   │  │
│  │ confidence│  │  │  │ gender    │  │  │  │ time      │  │
│  └───────────┘  │  │  └───────────┘  │  │  └───────────┘  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Search Algorithm Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    SEARCH ALGORITHM                          │
└─────────────────────────────────────────────────────────────┘

Step 1: Query Parsing (Gemini AI)
┌─────────────────────────────────────────────────────────────┐
│ Input: "مرضى السكري فوق 50 سنة في الرياض"                   │
│                                                              │
│ Gemini AI Analysis:                                          │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ • Identify language: Arabic                            │  │
│ │ • Extract medical terms: "السكري" → "diabetes"         │  │
│ │ • Parse age: "فوق 50 سنة" → { min: 50 }               │  │
│ │ • Detect location: "الرياض" → "Riyadh"                │  │
│ │ • Determine intent: Find diabetic patients             │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ Output: SearchQuery {                                        │
│   conditions: ["diabetes", "السكري"],                       │
│   ageRange: { min: 50 },                                    │
│   locations: ["Riyadh", "الرياض"],                         │
│   rawQuery: "..."                                           │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘

Step 2: Filter Building
┌─────────────────────────────────────────────────────────────┐
│ Convert parsed query to SQL filters:                         │
│                                                              │
│ WHERE conditions:                                            │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ 1. Full-text search on extracted_text                  │  │
│ │    to_tsvector('english', text) @@                     │  │
│ │    plainto_tsquery('english', 'diabetes')              │  │
│ │                                                         │  │
│ │ 2. Medical entity matching                             │  │
│ │    entity_type = 'diagnosis' AND                       │  │
│ │    entity_value ~* 'diabetes|السكري'                   │  │
│ │                                                         │  │
│ │ 3. Age filtering                                       │  │
│ │    EXTRACT(YEAR FROM AGE(date_of_birth)) >= 50         │  │
│ │                                                         │  │
│ │ 4. Location filtering                                  │  │
│ │    extracted_text ~* 'Riyadh|الرياض'                   │  │
│ └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

Step 3: Database Execution
┌─────────────────────────────────────────────────────────────┐
│ PostgreSQL Query Execution:                                  │
│                                                              │
│ 1. Use GIN indexes for full-text search                     │
│ 2. Join with medical_entities table                         │
│ 3. Join with patient_info table                             │
│ 4. Apply all WHERE filters                                  │
│ 5. Calculate relevance score (ts_rank)                      │
│ 6. Group by document                                        │
│ 7. Order by relevance                                       │
│ 8. Apply pagination (LIMIT/OFFSET)                          │
│                                                              │
│ Execution time: ~50-200ms (with indexes)                    │
└─────────────────────────────────────────────────────────────┘

Step 4: Result Ranking
┌─────────────────────────────────────────────────────────────┐
│ Calculate final score for each result:                       │
│                                                              │
│ final_score = (text_rank × 10) +                            │
│               (has_patient_name ? 2 : 0) +                  │
│               (has_patient_id ? 1 : 0)                      │
│                                                              │
│ Sort by: final_score DESC, created_at DESC                  │
└─────────────────────────────────────────────────────────────┘

Step 5: Result Processing
┌─────────────────────────────────────────────────────────────┐
│ For each result:                                             │
│                                                              │
│ 1. Extract matched conditions                               │
│    ┌──────────────────────────────────────────────────┐    │
│    │ Filter entities where type = 'diagnosis'         │    │
│    │ Match against query conditions                   │    │
│    └──────────────────────────────────────────────────┘    │
│                                                              │
│ 2. Extract matched medications                              │
│    ┌──────────────────────────────────────────────────┐    │
│    │ Filter entities where type = 'medication'        │    │
│    │ Match against query medications                  │    │
│    └──────────────────────────────────────────────────┘    │
│                                                              │
│ 3. Generate snippet                                         │
│    ┌──────────────────────────────────────────────────┐    │
│    │ Find text section with most query term matches   │    │
│    │ Extract 300 characters around best match         │    │
│    └──────────────────────────────────────────────────┘    │
│                                                              │
│ 4. Generate highlights                                      │
│    ┌──────────────────────────────────────────────────┐    │
│    │ Extract 50 chars before/after each query term    │    │
│    │ Limit to top 5 highlights                        │    │
│    └──────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

Step 6: Response Formatting
┌─────────────────────────────────────────────────────────────┐
│ Return structured response:                                  │
│                                                              │
│ {                                                            │
│   results: [                                                 │
│     {                                                        │
│       documentId: "uuid",                                    │
│       patientName: "أحمد محمد",                             │
│       relevanceScore: 8.5,                                   │
│       matchedConditions: ["diabetes"],                       │
│       snippet: "...patient with type 2 diabetes...",        │
│       highlights: ["diabetes", "50 years", "Riyadh"]        │
│     }                                                        │
│   ],                                                         │
│   total: 45,                                                 │
│   executionTime: 234,                                        │
│   filters: { ... }                                           │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                           │
└─────────────────────────────────────────────────────────────┘

Layer 1: Authentication
┌─────────────────────────────────────────────────────────────┐
│ JWT Token Validation                                         │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ • Verify token signature                               │  │
│ │ • Check expiration                                     │  │
│ │ • Extract user ID                                      │  │
│ │ • Validate user exists                                 │  │
│ └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

Layer 2: Authorization
┌─────────────────────────────────────────────────────────────┐
│ User Scope Enforcement                                       │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ • User can only search their own documents             │  │
│ │ • WHERE user_id = authenticated_user_id                │  │
│ │ • No cross-user data access                            │  │
│ └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

Layer 3: Rate Limiting
┌─────────────────────────────────────────────────────────────┐
│ Request Throttling                                           │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ • 100 requests per 15 minutes per user                 │  │
│ │ • Prevents API abuse                                   │  │
│ │ • Protects Gemini API quota                            │  │
│ └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

Layer 4: Input Validation
┌─────────────────────────────────────────────────────────────┐
│ Request Sanitization                                         │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ • Validate query length                                │  │
│ │ • Sanitize SQL inputs (parameterized queries)          │  │
│ │ • Escape HTML in highlights (XSS prevention)           │  │
│ │ • Validate pagination parameters                       │  │
│ └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

Layer 5: Audit Logging
┌─────────────────────────────────────────────────────────────┐
│ Activity Tracking                                            │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ • Log all search queries                               │  │
│ │ • Track execution times                                │  │
│ │ • Record result counts                                 │  │
│ │ • Monitor for suspicious patterns                      │  │
│ └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Performance Optimization

```
┌─────────────────────────────────────────────────────────────┐
│              PERFORMANCE OPTIMIZATION STRATEGY               │
└─────────────────────────────────────────────────────────────┘

Database Level
┌─────────────────────────────────────────────────────────────┐
│ • GIN indexes for full-text search                          │
│ • B-tree indexes for entity types                           │
│ • Partial indexes for active documents                      │
│ • Query plan optimization                                   │
│ • Connection pooling                                        │
└─────────────────────────────────────────────────────────────┘

Application Level
┌─────────────────────────────────────────────────────────────┐
│ • Query result caching (Redis ready)                        │
│ • Parsed query caching                                      │
│ • Pagination to limit result sets                           │
│ • Parallel processing for bulk searches                     │
│ • Async/await for non-blocking operations                   │
└─────────────────────────────────────────────────────────────┘

API Level
┌─────────────────────────────────────────────────────────────┐
│ • Response compression (gzip)                               │
│ • HTTP/2 support                                            │
│ • CDN for static assets                                     │
│ • Load balancing                                            │
│ • Request batching                                          │
└─────────────────────────────────────────────────────────────┘

Frontend Level
┌─────────────────────────────────────────────────────────────┐
│ • Debounced search input                                    │
│ • Local suggestion caching                                  │
│ • Lazy loading of results                                   │
│ • Virtual scrolling for large lists                         │
│ • Optimistic UI updates                                     │
└─────────────────────────────────────────────────────────────┘
```

---

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Maintained by:** PHFA Development Team
