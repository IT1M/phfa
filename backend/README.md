# Medical Document Management Backend

A comprehensive backend system for medical document processing with OCR, AI-powered entity extraction, and FHIR compliance.

## 🚀 Features

### Core Functionality
- **Document Processing**: PDF, DOCX, DICOM, Images with OCR
- **Medical Entity Extraction**: AI-powered using Google Gemini
- **Arabic Language Support**: Specialized OCR and NLP
- **Quality Assurance**: Confidence scoring and manual review workflows
- **Search & Analytics**: Full-text search with medical entity filtering
- **User Management**: Authentication, authorization, and visitor tracking
- **FHIR Compliance**: Healthcare data standards
- **Audit Logging**: Complete activity tracking

### Document Processing Pipeline
1. **Document Type Detection**: Automatic format identification
2. **Image Enhancement**: OpenCV-based preprocessing
3. **Multi-Engine OCR**: Tesseract with Arabic support
4. **Language Detection**: Arabic/English/Mixed
5. **Medical Entity Recognition**: Gemini AI extraction
6. **Data Validation**: Quality assurance and normalization
7. **Structured Storage**: PostgreSQL with JSONB

## 📋 Prerequisites

### System Requirements
- Node.js 18+ 
- PostgreSQL 14+
- Redis (optional, for caching)

### System Dependencies
```bash
# macOS
brew install opencv tesseract tesseract-lang postgresql

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install libopencv-dev tesseract-ocr tesseract-ocr-ara postgresql-14
```

## 🔧 Installation

### 1. Clone and Install
```bash
git clone <repository>
cd backend
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### 3. Database Setup
```bash
# Create database
createdb medical_documents

# Run migrations
npm run migrate
```

### 4. Start Development Server
```bash
npm run dev
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Database and app configuration
│   ├── database/         # Schema and migrations
│   ├── examples/         # Usage examples
│   ├── graphql/          # GraphQL schema and resolvers
│   ├── middleware/       # Express middleware
│   ├── routes/           # API route handlers
│   ├── services/         # Business logic services
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── server.ts         # Main application entry
├── tests/                # Test files
├── uploads/              # File upload directory
├── temp/                 # Temporary processing files
├── logs/                 # Application logs
└── dist/                 # Compiled JavaScript (production)
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token

### Document Processing
- `POST /api/document-processor/process` - Process single document
- `POST /api/document-processor/batch-process` - Process multiple documents
- `GET /api/document-processor/supported-formats` - List supported formats
- `POST /api/document-processor/validate` - Validate extracted entities
- `GET /api/document-processor/processing-status/:id` - Check processing status

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/:id` - Get document details
- `GET /api/documents` - List user documents

### Search
- `GET /api/search?q=query` - Search documents
- `POST /api/search/extract` - Extract entities from text

### Gemini AI Integration
- `POST /api/gemini/extract-entities` - Extract medical entities
- `POST /api/gemini/parse-query` - Parse natural language queries
- `POST /api/gemini/summarize` - Summarize medical documents
- `POST /api/gemini/translate` - Translate medical text
- `POST /api/gemini/normalize-terms` - Normalize medical terminology
- `POST /api/gemini/icd10-codes` - Extract ICD-10 codes

### Visitors
- `POST /api/visitors/register` - Register visitor
- `GET /api/visitors/analytics` - Get visitor analytics (admin)
- `GET /api/visitors/export` - Export visitor data (admin)

### GraphQL
- `POST /graphql` - GraphQL endpoint for complex queries

## 🔒 Environment Variables

### Required Configuration
```bash
# Server
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medical_documents
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
TEMP_PATH=./temp

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@medical-docs.com

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key

# Rate Limiting
GUEST_RATE_LIMIT=10
AUTH_RATE_LIMIT=100
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Test Document Processing
```bash
npm run test:document-processor
```

### Test Examples
```bash
npm run test:examples
```

### Coverage Report
```bash
npm run test -- --coverage
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run migrate:prod
npm start
```

### Docker Deployment
```bash
# Build image
docker build -t medical-docs-backend .

# Run container
docker run -p 5000:5000 --env-file .env medical-docs-backend
```

### Environment Setup
```bash
# Production environment
NODE_ENV=production
PORT=5000

# Use production database
DB_HOST=your-prod-db-host
DB_NAME=medical_documents_prod

# Secure secrets
JWT_SECRET=your-production-jwt-secret
ENCRYPTION_KEY=your-production-encryption-key
```

## 📊 Performance

### Benchmarks
| Operation | Target | Current |
|-----------|--------|---------|
| PDF Processing | < 5s | ~3-4s |
| Image OCR | < 3s | ~2-3s |
| Entity Extraction | < 2s | ~1-2s |
| Search Query | < 1s | ~0.5s |
| Batch (10 docs) | < 60s | ~40-50s |

### Optimization
- **Caching**: Redis for repeated operations
- **Queue System**: Bull/BullMQ for background processing
- **Database**: Optimized indexes and queries
- **File Processing**: Parallel processing for batch operations

## 🔍 Monitoring

### Health Check
```bash
curl http://localhost:5000/health
```

### Logs
```bash
# View logs
tail -f logs/combined.log

# Error logs only
tail -f logs/error.log
```

### Metrics
- Request count and response times
- Document processing statistics
- OCR confidence scores
- Search query performance
- User activity analytics

## 🛠️ Development

### Code Style
```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Database Migrations
```bash
# Run migrations
npm run migrate

# Reset database (development only)
dropdb medical_documents && createdb medical_documents && npm run migrate
```

### Adding New Features
1. Create feature branch
2. Add types in `src/types/`
3. Implement service in `src/services/`
4. Add routes in `src/routes/`
5. Write tests
6. Update documentation

## 🔐 Security

### Data Protection
- **Encryption**: All PII encrypted at rest
- **Authentication**: JWT-based with refresh tokens
- **Authorization**: Role-based access control
- **Rate Limiting**: Configurable per endpoint
- **Input Validation**: Joi schema validation
- **Audit Logging**: Complete activity tracking
- **CORS**: Configurable origin restrictions

### HIPAA Compliance
- PHI encryption and access controls
- Audit trails for all data access
- Secure file handling and cleanup
- User authentication and authorization
- Data retention policies

## 🤝 Contributing

### Development Setup
```bash
git clone <repository>
cd backend
npm install
cp .env.example .env
npm run migrate
npm run dev
```

### Pull Request Process
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Run linting and tests
5. Submit pull request

### Code Standards
- TypeScript strict mode
- ESLint + Prettier formatting
- Comprehensive error handling
- Unit test coverage >90%
- Documentation for public APIs

## 📚 Documentation

### API Documentation
- Swagger/OpenAPI documentation available at `/docs`
- GraphQL playground at `/graphql` (development)
- Postman collection in `/docs/postman/`

### Architecture Documentation
- `ARCHITECTURE.md` - System architecture overview
- `DOCUMENT_PROCESSING_README.md` - Document processing details
- `GEMINI_INTEGRATION.md` - AI integration guide

## 🆘 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check PostgreSQL status
pg_isready -h localhost -p 5432

# Reset connection pool
npm run migrate
```

#### OCR Dependencies
```bash
# macOS
brew reinstall tesseract tesseract-lang

# Ubuntu
sudo apt-get install --reinstall tesseract-ocr tesseract-ocr-ara
```

#### File Upload Issues
```bash
# Check permissions
chmod 755 uploads/
chmod 755 temp/

# Check disk space
df -h
```

#### Memory Issues
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Database query logging
DB_LOGGING=true npm run dev
```

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Issues**: Create GitHub issue
- **Email**: support@medical-docs.com
- **Documentation**: https://docs.medical-docs.com
- **Status Page**: https://status.medical-docs.com

---

**Last Updated**: 2025-10-10  
**Version**: 1.0.0  
**Status**: Production Ready