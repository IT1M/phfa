# 🚀 Quick Start Guide

Get the Medical Document Management Backend up and running in minutes!

## ⚡ One-Command Setup

```bash
# Run the automated setup script
./scripts/setup.sh
```

## 📋 Manual Setup (5 minutes)

### 1. Prerequisites Check
```bash
# Check Node.js (18+ required)
node --version

# Check PostgreSQL
psql --version

# Check Tesseract (for OCR)
tesseract --version
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit with your settings (minimum required)
nano .env
```

**Required Environment Variables:**
```bash
DB_PASSWORD=your_postgres_password
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your-secret-key-at-least-32-chars
```

### 4. Database Setup
```bash
# Create database
createdb medical_documents

# Run migrations
npm run migrate
```

### 5. Start Development Server
```bash
npm run dev
```

### 6. Verify Installation
```bash
# Check health endpoint
curl http://localhost:5000/health

# Should return: {"status":"ok","timestamp":"..."}
```

## 🐳 Docker Quick Start

### Option 1: Docker Compose (Recommended)
```bash
# Set your Gemini API key
export GEMINI_API_KEY=your_api_key

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### Option 2: Docker Build
```bash
# Build image
docker build -t medical-docs-backend .

# Run with database
docker run -d --name postgres -e POSTGRES_DB=medical_documents -e POSTGRES_PASSWORD=postgres postgres:15
docker run -d --name backend --link postgres -p 5000:5000 -e DB_HOST=postgres medical-docs-backend
```

## 🧪 Test Your Setup

### Basic Functionality Test
```bash
npm run test:document-processor
```

### API Test
```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Check supported formats
curl http://localhost:5000/api/document-processor/supported-formats
```

### Document Processing Test
```bash
# Upload a test document (requires authentication token)
curl -X POST http://localhost:5000/api/document-processor/process \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "document=@test-document.pdf"
```

## 📁 Project Structure Overview

```
backend/
├── 🚀 src/server.ts              # Main application entry
├── 🔧 src/services/              # Business logic
│   ├── document-processor.service.ts  # Document processing
│   ├── quality-assurance.service.ts   # Quality control
│   └── gemini.service.ts              # AI integration
├── 🛣️  src/routes/               # API endpoints
├── 🔒 src/middleware/            # Authentication, validation
├── 📊 src/database/              # Schema and migrations
├── 🧪 tests/                    # Test files
└── 📚 docs/                     # Documentation
```

## 🔌 Key API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | User login |
| `/api/document-processor/process` | POST | Process document |
| `/api/document-processor/supported-formats` | GET | Supported formats |
| `/api/documents/upload` | POST | Upload document |
| `/api/search` | GET | Search documents |
| `/graphql` | POST | GraphQL queries |

## 🔧 Configuration Options

### Document Processing
```bash
# OCR confidence threshold (0.0-1.0)
OCR_CONFIDENCE_THRESHOLD=0.7

# Processing timeout (milliseconds)
PROCESSING_TIMEOUT=300000

# Maximum batch size
MAX_BATCH_SIZE=10
```

### File Upload
```bash
# Upload directory
UPLOAD_DIR=./uploads

# Maximum file size (bytes)
MAX_FILE_SIZE=52428800

# Temporary processing directory
TEMP_PATH=./temp
```

### Security
```bash
# Rate limiting
GUEST_RATE_LIMIT=10
AUTH_RATE_LIMIT=100

# JWT expiration
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

## 🚨 Troubleshooting

### Common Issues

#### "Database connection failed"
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Check credentials in .env file
cat .env | grep DB_
```

#### "Tesseract not found"
```bash
# macOS
brew install tesseract tesseract-lang

# Ubuntu
sudo apt-get install tesseract-ocr tesseract-ocr-ara
```

#### "Port 5000 already in use"
```bash
# Change port in .env
echo "PORT=5001" >> .env

# Or kill existing process
lsof -ti:5000 | xargs kill -9
```

#### "Permission denied on uploads directory"
```bash
# Fix permissions
chmod 755 uploads/
chmod 755 temp/
```

### Debug Mode
```bash
# Enable verbose logging
DEBUG=* npm run dev

# Database query logging
DB_LOGGING=true npm run dev
```

## 📚 Next Steps

### Development
1. **Read Documentation**: Check `README.md` for detailed info
2. **Explore Examples**: Run `npm run test:examples`
3. **API Testing**: Use Postman collection in `/docs/`
4. **GraphQL**: Visit `http://localhost:5000/graphql`

### Production Deployment
1. **Environment**: Set `NODE_ENV=production`
2. **Database**: Use production PostgreSQL instance
3. **Secrets**: Generate secure JWT and encryption keys
4. **Monitoring**: Set up logging and health checks
5. **SSL**: Configure HTTPS and secure headers

### Integration
1. **Frontend**: Connect React/Next.js frontend
2. **Mobile**: Use REST API for mobile apps
3. **Third-party**: Integrate with EHR systems
4. **Analytics**: Add monitoring and metrics

## 🆘 Getting Help

- **Documentation**: `README.md`, `ARCHITECTURE.md`
- **Examples**: `src/examples/` directory
- **Tests**: `npm test` for working examples
- **Issues**: Create GitHub issue for bugs
- **Support**: Email support@medical-docs.com

## ✅ Success Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL running
- [ ] Dependencies installed (`npm install`)
- [ ] Environment configured (`.env`)
- [ ] Database migrated (`npm run migrate`)
- [ ] Server running (`npm run dev`)
- [ ] Health check passes (`curl localhost:5000/health`)
- [ ] Tests passing (`npm run test:document-processor`)

## 🎉 You're Ready!

Your Medical Document Management Backend is now running!

**Next**: Start building your frontend or integrate with existing systems.

**Happy coding!** 🚀

---

**Need help?** Check the full documentation in `README.md` or create an issue.