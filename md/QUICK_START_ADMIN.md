# Admin Dashboard - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Run Setup Script
```bash
./setup-admin-dashboard.sh
```

This will:
- ✅ Install dependencies
- ✅ Run database migrations
- ✅ Create necessary directories
- ✅ Verify setup

### Step 2: Configure Environment
Edit `backend/.env`:
```bash
# Required for admin dashboard
GEMINI_API_KEY=your_api_key_here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

### Step 3: Start Services
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
npm run dev
```

### Step 4: Access Dashboard
Open browser: `http://localhost:3000/admin`

## 🎯 First Time Setup

### 1. Create Admin User
```sql
-- Connect to your database
psql -U postgres -d medical_documents

-- Create admin user
INSERT INTO users (email, password_hash, role)
VALUES ('admin@example.com', 'hashed_password', 'admin');
```

### 2. Login
- Go to login page
- Enter admin credentials
- You'll be redirected to dashboard

### 3. Configure Settings
1. Navigate to Settings (`/admin/settings`)
2. Add your Gemini API key
3. Configure SMTP settings
4. Test configurations
5. Save changes

## 📊 Quick Tour

### Dashboard Overview
```
/admin
├─ Real-time metrics
├─ Active users count
├─ Processing queue
├─ Trend charts
└─ Quick stats
```

### Visitor Management
```
/admin/visitors
├─ Visitor table (sortable, searchable)
├─ Bulk email operations
├─ Excel export
├─ Timeline chart
├─ Geographic distribution
└─ Engagement scores
```

### Document Management
```
/admin/documents
├─ Processing queue
├─ Success rate
├─ Failed documents
└─ Processing stats
```

### Analytics
```
/admin/analytics
├─ Trend analysis
├─ Usage patterns
├─ Device distribution
├─ Language preferences
└─ AI insights
```

### Settings
```
/admin/settings
├─ API configuration
├─ Email settings
├─ Security settings
└─ Quick actions
```

## 🎬 Common Tasks

### Export Visitor Data
1. Go to `/admin/visitors`
2. Click "Export All" button
3. Excel file downloads automatically

### Send Bulk Email
1. Go to `/admin/visitors`
2. Select visitors (checkboxes)
3. Click "Email (X)" button
4. Enter subject and body
5. Click send

### Monitor Processing
1. Go to `/admin/documents`
2. View real-time queue
3. Check success rate
4. Review failed items

### View Analytics
1. Go to `/admin/analytics`
2. Select time range (7/30/90 days)
3. Review charts and insights
4. Export reports if needed

### Update Settings
1. Go to `/admin/settings`
2. Modify desired setting
3. Click "Save" button
4. Test configuration

## 🔧 Troubleshooting

### Can't Access Dashboard
```bash
# Check if backend is running
curl http://localhost:5000/health

# Check if frontend is running
curl http://localhost:3000

# Check authentication
# Make sure you're logged in as admin
```

### Database Connection Error
```bash
# Check PostgreSQL is running
pg_isready

# Check connection string in .env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medical_documents
DB_USER=postgres
DB_PASSWORD=your_password
```

### Migration Failed
```bash
# Run migration manually
cd backend
npm run migrate

# Check migration logs
cat logs/migration.log
```

### Real-time Updates Not Working
```bash
# Check API endpoints
curl http://localhost:5000/api/admin/dashboard/metrics

# Check browser console for errors
# Open DevTools > Console
```

## 📱 Mobile Access

The dashboard is responsive and works on mobile:
1. Open browser on mobile device
2. Navigate to `http://your-server-ip:3000/admin`
3. Login with admin credentials
4. Use touch-optimized interface

## 🔐 Security Checklist

- [ ] Change default admin password
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Set strong JWT secret
- [ ] Enable rate limiting
- [ ] Review audit logs regularly
- [ ] Backup database regularly
- [ ] Keep dependencies updated

## 📚 Learn More

- **Full Documentation**: `ADMIN_DASHBOARD_README.md`
- **Features Guide**: `ADMIN_DASHBOARD_FEATURES.md`
- **Implementation Summary**: `ADMIN_DASHBOARD_SUMMARY.md`

## 🆘 Getting Help

### Check Logs
```bash
# Backend logs
tail -f backend/logs/combined.log

# Error logs
tail -f backend/logs/error.log
```

### Common Issues

**Issue**: Dashboard shows no data
**Solution**: Check if database has data, run seed script if needed

**Issue**: Export button not working
**Solution**: Check export directory permissions: `chmod 755 backend/exports`

**Issue**: Email not sending
**Solution**: Verify SMTP settings, test with quick action button

**Issue**: Charts not displaying
**Solution**: Check if data exists for selected time range

## 🎉 You're Ready!

Your admin dashboard is now set up and ready to use. Start by:
1. ✅ Exploring the dashboard overview
2. ✅ Checking visitor statistics
3. ✅ Monitoring document processing
4. ✅ Reviewing analytics
5. ✅ Configuring system settings

## 📞 Support

For issues or questions:
- Check documentation files
- Review error logs
- Check database connectivity
- Verify environment variables

---

**Happy Monitoring! 🚀**
