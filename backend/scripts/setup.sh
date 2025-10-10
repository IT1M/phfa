#!/bin/bash

# Medical Document Management Backend Setup Script
# This script helps set up the development environment

set -e

echo "🏥 Medical Document Management Backend Setup"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js found: $NODE_VERSION"
        
        # Check if version is 18 or higher
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$MAJOR_VERSION" -lt 18 ]; then
            print_warning "Node.js version 18+ recommended. Current: $NODE_VERSION"
        fi
    else
        print_error "Node.js not found. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
}

# Check if PostgreSQL is installed
check_postgresql() {
    if command -v psql &> /dev/null; then
        PG_VERSION=$(psql --version | awk '{print $3}')
        print_status "PostgreSQL found: $PG_VERSION"
    else
        print_error "PostgreSQL not found. Please install PostgreSQL 14+"
        print_info "macOS: brew install postgresql"
        print_info "Ubuntu: sudo apt-get install postgresql-14"
        exit 1
    fi
}

# Check system dependencies
check_system_deps() {
    echo ""
    echo "🔍 Checking system dependencies..."
    
    # Check Tesseract
    if command -v tesseract &> /dev/null; then
        TESSERACT_VERSION=$(tesseract --version | head -n1)
        print_status "Tesseract found: $TESSERACT_VERSION"
        
        # Check Arabic language support
        if tesseract --list-langs | grep -q "ara"; then
            print_status "Arabic language support found"
        else
            print_warning "Arabic language support not found"
            print_info "Install with: brew install tesseract-lang (macOS) or apt-get install tesseract-ocr-ara (Ubuntu)"
        fi
    else
        print_warning "Tesseract not found. OCR functionality will be limited."
        print_info "Install with: brew install tesseract (macOS) or apt-get install tesseract-ocr (Ubuntu)"
    fi
    
    # Check OpenCV (optional)
    if pkg-config --exists opencv4; then
        print_status "OpenCV found"
    else
        print_warning "OpenCV not found. Advanced image processing will be limited."
        print_info "Install with: brew install opencv (macOS) or apt-get install libopencv-dev (Ubuntu)"
    fi
}

# Install Node.js dependencies
install_dependencies() {
    echo ""
    echo "📦 Installing Node.js dependencies..."
    
    if [ -f "package.json" ]; then
        npm install
        print_status "Dependencies installed successfully"
    else
        print_error "package.json not found. Are you in the backend directory?"
        exit 1
    fi
}

# Setup environment file
setup_environment() {
    echo ""
    echo "⚙️  Setting up environment configuration..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_status "Environment file created from template"
            print_warning "Please edit .env file with your configuration"
            print_info "Required: DB_PASSWORD, GEMINI_API_KEY, JWT_SECRET"
        else
            print_error ".env.example not found"
            exit 1
        fi
    else
        print_info "Environment file already exists"
    fi
}

# Create required directories
create_directories() {
    echo ""
    echo "📁 Creating required directories..."
    
    mkdir -p uploads/documents
    mkdir -p temp
    mkdir -p logs
    mkdir -p uploads/test-documents
    
    print_status "Directories created successfully"
}

# Setup database
setup_database() {
    echo ""
    echo "🗄️  Setting up database..."
    
    # Check if database exists
    DB_NAME=${DB_NAME:-medical_documents}
    
    if psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        print_info "Database '$DB_NAME' already exists"
    else
        print_info "Creating database '$DB_NAME'..."
        createdb "$DB_NAME" || {
            print_error "Failed to create database. Please create manually:"
            print_info "createdb $DB_NAME"
            return 1
        }
        print_status "Database created successfully"
    fi
    
    # Run migrations
    print_info "Running database migrations..."
    npm run migrate || {
        print_error "Migration failed. Please check your database configuration."
        return 1
    }
    print_status "Database migrations completed"
}

# Run tests
run_tests() {
    echo ""
    echo "🧪 Running tests..."
    
    npm run test:document-processor || {
        print_warning "Some tests failed. This is normal if system dependencies are missing."
    }
    
    print_status "Test suite completed"
}

# Main setup function
main() {
    echo ""
    print_info "Starting setup process..."
    
    # Check prerequisites
    check_node
    check_postgresql
    check_system_deps
    
    # Setup project
    install_dependencies
    setup_environment
    create_directories
    
    # Database setup (optional, requires configuration)
    read -p "Do you want to setup the database now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_database
    else
        print_info "Skipping database setup. Run 'npm run migrate' when ready."
    fi
    
    # Run tests (optional)
    read -p "Do you want to run tests now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        run_tests
    else
        print_info "Skipping tests. Run 'npm test' when ready."
    fi
    
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    print_info "Next steps:"
    echo "1. Edit .env file with your configuration"
    echo "2. Set up your database: npm run migrate"
    echo "3. Start development server: npm run dev"
    echo "4. Visit http://localhost:5000/health to verify"
    echo ""
    print_info "Documentation:"
    echo "- README.md - General documentation"
    echo "- DOCUMENT_PROCESSING_README.md - Document processing guide"
    echo "- ARCHITECTURE.md - System architecture"
    echo ""
    print_status "Happy coding! 🚀"
}

# Run main function
main "$@"