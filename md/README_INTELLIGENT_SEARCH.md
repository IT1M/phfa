# 🔍 Intelligent Medical Search System

> Advanced natural language search for medical records with AI-powered query understanding

## Overview

The Intelligent Medical Search System is a comprehensive solution for searching medical records using natural language queries in both Arabic and English. It leverages Google's Gemini AI to understand complex medical queries and convert them into structured database searches.

## ✨ Key Features

### 🧠 Natural Language Processing
- Process queries in **Arabic and English**
- Understand **medical terminology** and synonyms
- Support **complex multi-condition** queries
- Implement **fuzzy matching** for typos
- Rank results by **medical relevance**

### 🎯 Advanced Search Capabilities
- **Age range filtering**: "فوق 50 سنة", "under 40"
- **Date range parsing**: "last month", "الشهر الماضي"
- **Location detection**: Saudi cities (Riyadh, Jeddah, Mecca, etc.)
- **Medical conditions**: Diabetes, hypertension, cancer, etc.
- **Medication recognition**: Metformin, insulin, penicillin, etc.
- **Urgency levels**: Low, medium, high, critical

### 🚀 Smart Features
- **Search suggestions** from history
- **Similar patient finder** based on conditions
- **Bulk search** operations (up to 10 queries)
- **Medical text translation** (Arabic ↔ English)
- **Term normalization** to standard medical terminology
- **ICD-10 code extraction** from diagnoses
- **Search analytics** and performance metrics

## 📋 Query Examples

### Arabic Queries
```
مرضى السكري فوق 50 سنة في الرياض
نساء تحت 40 سنة مع تاريخ سرطان الثدي
مرضى حساسية البنسلين
حالات طوارئ قلبية في جدة
```

### English Queries
```
Cardiac patients with diabetes in Jeddah
Women under 40 with breast cancer history
Patients allergic to penicillin
Emergency cases last week
```

### Mixed Language
```
مرضى diabetes في الرياض
Patients with سكري and hypertension
```

## 🚀 Quick Start

### 1. Prerequisites
```bash
# Ensure backend is running
cd backend
npm install

# Set up environment variables
GEMINI_API_KEY=your_api_key_here
DATABASE_URL=your_database_url
```

### 2. Start the Server
```bash
cd backend
npm run dev
```

### 3. Test the System
```bash
cd backend
npx ts-node test-intelligent-search.ts
```

### 4. Access the UI
```
http://localhost:3000/intelligent-search
```

## 📡 API Endpoints

### Main Search
```typescript
POST /api/intelligent-search
{
  "query": "مرضى السكري فوق 50 سنة",
  "page": 1,
  "pageSize": 20
}
```

### Search Suggestions
```typescript
GET /api/intelligent-search/suggestions?limit=10
```

### Similar Patients
```typescript
POST /api/intelligent-search/similar-patients
{
  "documentId": "uuid",
  "limit": 10
}
```

### Bulk Search
```typescript
POST /api/intelligent-search/bulk
{
  "queries": ["query1", "query2", "query3"]
}
```

### Translation
```typescript
POST /api/intelligent-search/translate
{
  "text": "مريض يعاني من السكري",
  "targetLang": "en"
}
```

### More Endpoints
- `GET /api/intelligent-search/analytics` - Search analytics
- `POST /api/intelligent-search/parse-query` - Debug query parsing
- `POST /api/intelligent-search/normalize-terms` - Normalize medical terms
- `POST /api/intelligent-search/extract-icd10` - Extract ICD-10 codes

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  ┌────────────────────────────────────────────────────┐ │
│  │  IntelligentSearch Component                       │ │
│  │  - Search input with suggestions                   │ │
│  │  - Result display with highlights                  │ │
│  │  - Pagination and filters                          │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  API Routes (Express)                    │
│  ┌────────────────────────────────────────────────────┐ │
│  │  /api/intelligent-search/*                         │ │
│  │  - Authentication & rate limiting                  │ │
│  │  - Request validation                              │ │
│  │  - Response formatting                             │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              IntelligentSearchService                    │
│  ┌────────────────────────────────────────────────────┐ │
│  │  - Query parsing with Gemini AI                    │ │
│  │  - Filter building                                 │ │
│  │  - Database search execution                       │ │
│  │  - Result ranking & processing                     │ │
│  │  - Analytics & suggestions                         │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                ▼                     ▼
┌──────────────────────┐  ┌──────────────────────┐
│   GeminiService      │  │   PostgreSQL DB      │
│  - NLP processing    │  │  - Full-text search  │
│  - Entity extraction │  │  - Medical entities  │
│  - Translation       │  │  - Patient info      │
│  - Normalization     │  │  - Search history    │
└──────────────────────┘  └──────────────────────┘
```

## 📊 Database Schema

### Key Tables
```sql
-- Documents with full-text search
documents (
  id, user_id, extracted_text, 
  extracted_data, created_at, ...
)

-- Medical entities
medical_entities (
  id, document_id, entity_type, 
  entity_value, confidence, ...
)

-- Patient information
patient_info (
  id, document_id, patient_name, 
  date_of_birth, gender, ...
)

-- Search history
search_queries (
  id, user_id, query_text, 
  results, execution_time, ...
)
```

### Indexes
```sql
-- Full-text search
CREATE INDEX idx_documents_text_search 
ON documents USING gin(to_tsvector('english', extracted_text));

-- Entity search
CREATE INDEX idx_medical_entities_search 
ON medical_entities USING gin(to_tsvector('english', entity_value));

-- Type filtering
CREATE INDEX idx_medical_entities_type 
ON medical_entities(entity_type);
```

## 🎨 Frontend Component

```tsx
import IntelligentSearch from '@/components/search/IntelligentSearch';

export default function SearchPage() {
  return (
    <div className="container">
      <IntelligentSearch />
    </div>
  );
}
```

### Features
- ✅ Bilingual interface (Arabic/English)
- ✅ Real-time search with loading states
- ✅ Search suggestions from history
- ✅ Example queries for quick start
- ✅ Highlighted search results
- ✅ Pagination support
- ✅ Filter visualization
- ✅ Responsive design

## 🧪 Testing

### Run Test Suite
```bash
cd backend
npx ts-node test-intelligent-search.ts
```

### Manual Testing
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

# Get suggestions
curl -X GET http://localhost:5000/api/intelligent-search/suggestions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📈 Performance

### Expected Metrics
- **Query parsing**: 500-1000ms (Gemini API)
- **Database search**: 50-200ms (with indexes)
- **Total execution**: 600-1200ms
- **Results per page**: 20 (configurable)
- **Concurrent users**: 100+ (with rate limiting)

### Optimization
- ✅ Database indexes for fast queries
- ✅ Pagination to limit result sets
- ✅ Rate limiting to prevent abuse
- ✅ Query caching ready
- ✅ Execution time tracking

## 🔐 Security

### Authentication
- All endpoints require valid JWT token
- User can only search their own documents
- Token validation on every request

### Rate Limiting
- 100 requests per 15 minutes per user
- Prevents API abuse
- Protects Gemini API quota

### Data Protection
- SQL injection prevention
- XSS protection in highlights
- Encrypted patient data
- Audit logging

## 📚 Documentation

### Complete Guides
- **INTELLIGENT_SEARCH_GUIDE.md** - Full technical documentation
- **INTELLIGENT_SEARCH_QUICK_START.md** - Quick reference guide
- **INTELLIGENT_SEARCH_IMPLEMENTATION.md** - Implementation summary

### Code Documentation
- Inline comments in all services
- TypeScript type definitions
- API endpoint documentation
- Test suite with examples

## 🛠️ Troubleshooting

### No results found?
1. Check if documents are indexed
2. Verify medical entities are extracted
3. Try simpler queries
4. Check database indexes

### Slow performance?
1. Monitor database query time
2. Check Gemini API response time
3. Verify indexes are created
4. Consider query caching

### Incorrect parsing?
1. Review query structure
2. Add more context to query
3. Use example queries as reference
4. Check Gemini API logs

## 🔄 Integration

### With Existing Systems
- ✅ Uses existing authentication (JWT)
- ✅ Integrates with document processing
- ✅ Leverages Gemini service
- ✅ Uses existing database schema
- ✅ Follows existing API patterns

### Future Enhancements
- [ ] Voice search support
- [ ] Image-based search
- [ ] Elasticsearch integration
- [ ] Advanced analytics dashboard
- [ ] Search quality metrics
- [ ] ML-based ranking improvements
- [ ] Multi-language support (French, Spanish)
- [ ] Predictive search
- [ ] Search filters UI

## 💡 Usage Tips

### For Best Results
1. **Be specific** - More details = better results
2. **Use medical terms** - System understands medical terminology
3. **Mix languages** - Arabic and English work together
4. **Save searches** - Use suggestions for quick access
5. **Explore similar** - Find related patients easily

### Example Workflows

#### Find Diabetic Patients in Riyadh
```
Query: "مرضى السكري في الرياض"
→ Returns all diabetic patients in Riyadh
→ Sorted by relevance
→ With highlighted matches
```

#### Find Similar Cases
```
1. Search for a patient
2. Click "Find Similar"
3. Get patients with similar conditions
4. Compare treatment plans
```

#### Bulk Analysis
```
1. Prepare list of queries
2. Use bulk search endpoint
3. Get results for all queries
4. Compare statistics
```

## 📞 Support

### Getting Help
- Check documentation files
- Review test suite examples
- Check backend logs: `backend/logs/`
- Contact development team

### Reporting Issues
- Provide query text
- Include error messages
- Share API responses
- Describe expected behavior

## 🎉 Success Stories

### Use Cases
- **Emergency triage**: Find similar emergency cases quickly
- **Research**: Bulk search for specific conditions
- **Quality assurance**: Track treatment outcomes
- **Patient care**: Find patients needing follow-up
- **Analytics**: Search patterns and trends

### Benefits
- ⚡ **Fast**: Sub-second search results
- 🎯 **Accurate**: AI-powered relevance ranking
- 🌍 **Bilingual**: Arabic and English support
- 🔒 **Secure**: Enterprise-grade security
- 📊 **Insightful**: Built-in analytics

## 📦 Files Structure

```
backend/
├── src/
│   ├── services/
│   │   └── intelligentSearchService.ts
│   └── routes/
│       └── intelligentSearch.ts
└── test-intelligent-search.ts

src/
├── app/
│   └── intelligent-search/
│       └── page.tsx
└── components/
    └── search/
        └── IntelligentSearch.tsx

Documentation/
├── INTELLIGENT_SEARCH_GUIDE.md
├── INTELLIGENT_SEARCH_QUICK_START.md
├── INTELLIGENT_SEARCH_IMPLEMENTATION.md
└── README_INTELLIGENT_SEARCH.md
```

## 🏆 Credits

**Developed by:** PHFA Development Team  
**Version:** 1.0.0  
**Date:** January 2025  
**License:** Proprietary

---

## 🚀 Get Started Now!

1. **Read** the quick start guide
2. **Run** the test suite
3. **Try** example queries
4. **Explore** the UI
5. **Build** amazing search experiences!

For detailed documentation, see:
- [Complete Guide](INTELLIGENT_SEARCH_GUIDE.md)
- [Quick Start](INTELLIGENT_SEARCH_QUICK_START.md)
- [Implementation Details](INTELLIGENT_SEARCH_IMPLEMENTATION.md)

**Happy Searching! 🔍**
