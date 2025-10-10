#!/bin/bash

echo "🚀 Setting up Admin Dashboard..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend directory exists
if [ ! -d "backend" ]; then
  echo "❌ Backend directory not found!"
  exit 1
fi

# Install backend dependencies if needed
echo -e "${BLUE}📦 Checking backend dependencies...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing backend dependencies...${NC}"
  npm install
fi

# Run database migrations
echo -e "${BLUE}🗄️  Running database migrations...${NC}"
npm run migrate

# Check if migration was successful
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Database migrations completed${NC}"
else
  echo -e "${YELLOW}⚠️  Migration may have failed, check logs${NC}"
fi

cd ..

# Install frontend dependencies if needed
echo -e "${BLUE}📦 Checking frontend dependencies...${NC}"
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing frontend dependencies...${NC}"
  npm install
fi

# Create necessary directories
echo -e "${BLUE}📁 Creating necessary directories...${NC}"
mkdir -p backend/logs
mkdir -p backend/exports
mkdir -p backend/backups

echo ""
echo -e "${GREEN}✅ Admin Dashboard setup complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Configure your .env file in backend/ directory"
echo "2. Start backend: cd backend && npm run dev"
echo "3. Start frontend: npm run dev"
echo "4. Access admin dashboard: http://localhost:3000/admin"
echo ""
echo -e "${YELLOW}📚 Read ADMIN_DASHBOARD_README.md for detailed documentation${NC}"
