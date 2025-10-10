# Admin Dashboard Deployment Guide

## 🚀 Production Deployment

### Prerequisites

- Node.js 18+ installed
- PostgreSQL 13+ installed
- Domain name configured
- SSL certificate ready
- SMTP server credentials
- Gemini API key

### Step 1: Environment Configuration

#### Backend (.env)
```bash
# Production Settings
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://yourdomain.com

# Database
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=medical_documents
DB_USER=your-db-user
DB_PASSWORD=your-secure-password

# JWT
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_REFRESH_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Security
ENCRYPTION_KEY=your-encryption-key-exactly-32-chars
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret

# Rate Limiting
GUEST_RATE_LIMIT=10
AUTH_RATE_LIMIT=100

# Features
ENABLE_DOCUMENT_PROCESSING=true
ENABLE_GEMINI_INTEGRATION=true
ENABLE_AUDIT_LOGGING=true
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_SCHEDULED_EXPORTS=true
ENABLE_AUTOMATED_BACKUPS=true
ENABLE_MONITORING=true

# Paths
UPLOAD_DIR=/var/app/uploads
EXPORT_DIR=/var/app/exports
BACKUP_DIR=/var/app/backups
LOG_FILE_PATH=/var/app/logs
```

#### Frontend (.env.production)
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_NAME=Medical Document Archive
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_ENABLE_ADMIN_DASHBOARD=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Step 2: Database Setup

```bash
# 1. Create production database
createdb medical_documents

# 2. Run all migrations
cd backend
npm run migrate

# 3. Run admin migration
npm run migrate:admin

# 4. Verify tables
psql -d medical_documents -c "\dt"
```

### Step 3: Build Applications

#### Backend
```bash
cd backend
npm install --production
npm run build
```

#### Frontend
```bash
npm install --production
npm run build
```

### Step 4: Process Management (PM2)

#### Install PM2
```bash
npm install -g pm2
```

#### Backend PM2 Configuration (ecosystem.config.js)
```javascript
module.exports = {
  apps: [{
    name: 'medical-backend',
    script: './dist/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    max_memory_restart: '1G',
    autorestart: true,
    watch: false
  }]
};
```

#### Start Services
```bash
# Backend
cd backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Frontend (if not using Vercel/Netlify)
pm2 start npm --name "medical-frontend" -- start
```

### Step 5: Nginx Configuration

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 6: SSL Configuration (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificates
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Step 7: Create Admin User

```sql
-- Connect to database
psql -d medical_documents

-- Create admin user (replace with your details)
INSERT INTO users (email, password_hash, role, created_at)
VALUES (
  'admin@yourdomain.com',
  '$2b$12$your-hashed-password-here',
  'admin',
  NOW()
);

-- Or use bcrypt to hash password first:
-- node -e "console.log(require('bcryptjs').hashSync('your-password', 12))"
```

### Step 8: Security Hardening

#### Firewall
```bash
# Allow only necessary ports
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

#### Database Security
```sql
-- Create restricted database user
CREATE USER app_user WITH PASSWORD 'secure-password';
GRANT CONNECT ON DATABASE medical_documents TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
```

#### File Permissions
```bash
# Set proper permissions
chmod 700 /var/app/uploads
chmod 700 /var/app/exports
chmod 700 /var/app/backups
chmod 700 /var/app/logs

# Set ownership
chown -R app-user:app-user /var/app
```

### Step 9: Monitoring Setup

#### Install Monitoring Tools
```bash
# Install monitoring dependencies
npm install -g pm2-logrotate

# Configure log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

#### Health Check Endpoint
```bash
# Test health endpoint
curl https://api.yourdomain.com/health
```

### Step 10: Backup Configuration

#### Automated Database Backups
```bash
# Create backup script
cat > /usr/local/bin/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/app/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump medical_documents | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"
find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +30 -delete
EOF

chmod +x /usr/local/bin/backup-db.sh

# Add to crontab
crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-db.sh
```

### Step 11: Performance Optimization

#### PostgreSQL Tuning
```sql
-- postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
```

#### Node.js Optimization
```bash
# Increase memory limit
NODE_OPTIONS="--max-old-space-size=2048"
```

### Step 12: Testing Deployment

```bash
# Test backend
curl https://api.yourdomain.com/health
curl https://api.yourdomain.com/api/admin/dashboard/metrics

# Test frontend
curl https://yourdomain.com

# Test admin dashboard
# Open browser: https://yourdomain.com/admin
```

### Step 13: Monitoring & Alerts

#### Setup Uptime Monitoring
- Use services like UptimeRobot, Pingdom, or StatusCake
- Monitor: /health endpoint
- Alert on: downtime, slow response

#### Setup Error Tracking
- Integrate Sentry or similar
- Track: API errors, frontend errors
- Alert on: error rate spikes

#### Setup Performance Monitoring
- Use PM2 monitoring
- Track: CPU, memory, response times
- Alert on: high resource usage

### Step 14: Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations completed
- [ ] Admin user created
- [ ] SSL certificates installed
- [ ] Firewall configured
- [ ] Backups scheduled
- [ ] Monitoring active
- [ ] Health checks passing
- [ ] Admin dashboard accessible
- [ ] Email notifications working
- [ ] API endpoints responding
- [ ] Logs rotating properly
- [ ] Security headers configured
- [ ] CORS configured correctly
- [ ] Rate limiting active

## 🔧 Maintenance

### Daily Tasks
- Check system health dashboard
- Review error logs
- Monitor active users
- Check processing queue

### Weekly Tasks
- Review analytics
- Check backup integrity
- Update dependencies
- Review security logs

### Monthly Tasks
- Database optimization
- Performance review
- Security audit
- Capacity planning

## 🆘 Troubleshooting

### Backend Not Starting
```bash
# Check logs
pm2 logs medical-backend

# Check port
netstat -tulpn | grep 5000

# Check environment
pm2 env 0
```

### Database Connection Issues
```bash
# Test connection
psql -h localhost -U your-user -d medical_documents

# Check PostgreSQL status
sudo systemctl status postgresql
```

### High Memory Usage
```bash
# Check PM2 status
pm2 status

# Restart if needed
pm2 restart medical-backend
```

### Slow Queries
```sql
-- Enable slow query log
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();

-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

## 📞 Support

For deployment issues:
1. Check logs: `/var/app/logs/`
2. Review PM2 logs: `pm2 logs`
3. Check system resources: `htop`
4. Review database logs: `/var/log/postgresql/`

## 🔄 Updates

### Updating Backend
```bash
cd backend
git pull
npm install
npm run build
pm2 restart medical-backend
```

### Updating Frontend
```bash
git pull
npm install
npm run build
pm2 restart medical-frontend
```

### Database Migrations
```bash
cd backend
npm run migrate
pm2 restart medical-backend
```

---

**Deployment Complete! 🎉**

Your admin dashboard is now live and ready for production use.
