# 🚀 Quick Start Guide - Medical Archive System

## 🎯 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- PostgreSQL installed and running
- Git installed

---

## 📦 Installation

### 1. Clone & Install
```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd medical-archive

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Database Setup
```bash
# Start PostgreSQL (macOS)
brew services start postgresql

# Create database
psql -U postgres -c "CREATE DATABASE medical_docs;"

# Run migrations
cd backend
npm run migrate
cd ..
```

### 3. Environment Configuration
```bash
# Backend environment is already configured
# Check backend/.env for settings

# Default admin credentials:
# Email: admin@medical-docs.com
# Password: admin123
# ⚠️ Change these in production!
```

---

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Frontend:**
```bash
npm run dev
```
Frontend will run on: http://localhost:3000

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on: http://localhost:5000

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **GraphQL**: http://localhost:5000/graphql
- **API Docs**: http://localhost:5000/api-docs

---

## 🎨 Features Tour

### 1. Home Page (/)
- Landing page with feature showcase
- Click "Get Started" to begin
- Enter email to create guest session

### 2. Dashboard (/dashboard)
- Quick action cards for all features
- Document upload zone
- Recent documents view
- Search bar

### 3. Search (/search)
- Basic document search
- Filter by type and date
- Export results

### 4. AI Search (/intelligent-search)
- AI-powered search with Gemini
- Natural language queries
- Smart suggestions

### 5. Security (/security)
- Security score dashboard
- Activity monitoring
- Privacy settings

### 6. Admin Panel (/admin)
- User management
- Analytics and metrics
- Document processing queue
- System monitoring

---

## 🔑 Key Features

### Navigation
✅ All pages linked via dashboard cards  
✅ Intuitive user flow  
✅ Mobile-responsive menu  

### Authentication
✅ Guest sessions (30-day expiry)  
✅ Email-based access  
✅ Session persistence  

### Documents
✅ Upload medical documents  
✅ OCR text extraction  
✅ FHIR standard support  
✅ Search and filter  

### Security
✅ End-to-end encryption  
✅ Audit logging  
✅ Security monitoring  
✅ Privacy controls  

### Internationalization
✅ English/Arabic support  
✅ RTL layout for Arabic  
✅ Dynamic language switching  

### Mobile
✅ Responsive design  
✅ Touch-optimized  
✅ PWA support  
✅ Offline access  

---

## 🎨 UI Features

### Theme
- Toggle dark/light mode (moon/sun icon in header)
- Automatic system preference detection
- Smooth transitions

### Language
- Toggle EN/AR (globe icon in header)
- Full RTL support for Arabic
- Localized content

### Animations
- Smooth page transitions
- Card hover effects
- Loading states
- Staggered animations

---

## 🗄️ Database

### Tables
```sql
visitors         - Guest user sessions
users            - Authenticated users
documents        - Medical documents
medical_entities - Extracted medical data
patient_info     - Patient information
search_queries   - Search history
audit_logs       - Security audit trail
```

### Quick Commands
```bash
# View all tables
psql -U postgres -d medical_docs -c "\dt"

# Count records
psql -U postgres -d medical_docs -c "SELECT COUNT(*) FROM visitors;"

# View users
psql -U postgres -d medical_docs -c "SELECT * FROM users;"
```

---

## 🔧 Configuration

### Frontend (.env - optional)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend (.env)
```env
# Already configured in backend/.env
# Key settings:
PORT=5000
DB_NAME=medical_docs
GEMINI_API_KEY=<your-key>
```

---

## 🧪 Testing

### Manual Testing Flow
1. **Home Page**
   - Click "Get Started"
   - Enter email
   - Accept privacy policy
   - Click "Continue as Guest"

2. **Dashboard**
   - View quick action cards
   - Click each card to navigate
   - Test search bar
   - Try document upload

3. **Features**
   - Test search functionality
   - Try AI search
   - Check security dashboard
   - Access admin panel

4. **UI/UX**
   - Toggle dark mode
   - Switch language (EN/AR)
   - Test mobile view
   - Check animations

### Database Testing
```bash
# Test connection
psql -U postgres -d medical_docs -c "SELECT 'OK' as status;"

# View table structure
psql -U postgres -d medical_docs -c "\d visitors"
```

---

## 📱 Mobile Testing

### Browser DevTools
1. Open Chrome DevTools (F12)
2. Click device toolbar icon
3. Select device (iPhone, iPad, etc.)
4. Test all features

### Responsive Breakpoints
```
Mobile:  320px - 767px
Tablet:  768px - 1023px
Desktop: 1024px+
```

---

## 🐛 Troubleshooting

### Frontend Issues

**Port 3000 already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

**Build errors:**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run dev
```

### Backend Issues

**Port 5000 already in use:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

**Database connection failed:**
```bash
# Check PostgreSQL status
brew services list

# Restart PostgreSQL
brew services restart postgresql

# Test connection
psql -U postgres -d medical_docs
```

**Migration errors:**
```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS medical_docs;"
psql -U postgres -c "CREATE DATABASE medical_docs;"

# Run migrations again
cd backend
npm run migrate
```

---

## 📚 API Documentation

### REST Endpoints
```
GET    /api/visitors
POST   /api/visitors
GET    /api/documents
POST   /api/documents
GET    /api/search
POST   /api/intelligent-search
GET    /api/admin/dashboard/metrics
```

### GraphQL
```
http://localhost:5000/graphql
```

### Swagger UI
```
http://localhost:5000/api-docs
```

---

## 🎯 Common Tasks

### Add a New User
```bash
psql -U postgres -d medical_docs -c "
INSERT INTO users (email, password_hash, role) 
VALUES ('user@example.com', 'hashed_password', 'user');
"
```

### View Audit Logs
```bash
psql -U postgres -d medical_docs -c "
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;
"
```

### Clear Guest Sessions
```bash
psql -U postgres -d medical_docs -c "DELETE FROM visitors;"
```

---

## 🚀 Production Deployment

### Build for Production
```bash
# Frontend
npm run build
npm start

# Backend
cd backend
npm run build
npm start
```

### Environment Variables
Update these for production:
- JWT_SECRET
- ENCRYPTION_KEY
- GEMINI_API_KEY
- SMTP credentials
- Database credentials

### SSL Certificates
```bash
# Generate certificates
cd backend
npm run generate:certs

# Or use Let's Encrypt for production
```

---

## 📞 Support

### Logs
- Frontend: Browser console
- Backend: `backend/logs/`
- Database: PostgreSQL logs

### Common Commands
```bash
# View backend logs
tail -f backend/logs/combined.log

# View error logs
tail -f backend/logs/error.log

# Check database
psql -U postgres -d medical_docs
```

---

## ✅ Verification Checklist

After setup, verify:
- [ ] Frontend loads at http://localhost:3000
- [ ] Backend responds at http://localhost:5000
- [ ] Database has 7 tables
- [ ] Can create guest session
- [ ] Can navigate to dashboard
- [ ] Quick action cards work
- [ ] Search functionality works
- [ ] Dark mode toggles
- [ ] Language switches
- [ ] Mobile view responsive

---

## 🎉 You're Ready!

The system is now running and ready to use. Explore the features:

1. **Start at Home** → Create guest session
2. **Go to Dashboard** → See quick action cards
3. **Try Search** → Find documents
4. **Check Security** → View security dashboard
5. **Access Admin** → Manage system

**Enjoy using the Medical Archive System! 🏥📄**

---

**Need Help?**
- Check LAUNCH_CHECKLIST.md for detailed setup
- See IMPROVEMENTS_SUMMARY.md for feature details
- Read FINAL_LAUNCH_SUMMARY.md for complete overview

**Last Updated**: January 11, 2025
