# Multi-stage build for Medical Document Management Backend

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Install system dependencies for building
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    pkgconfig \
    cairo-dev \
    pango-dev \
    libjpeg-turbo-dev \
    giflib-dev \
    librsvg-dev \
    pixman-dev

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache \
    tesseract-ocr \
    tesseract-ocr-data-ara \
    tesseract-ocr-data-eng \
    opencv \
    cairo \
    pango \
    libjpeg-turbo \
    giflib \
    librsvg \
    pixman \
    postgresql-client

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Create required directories
RUN mkdir -p uploads/documents temp logs && \
    chown -R nodejs:nodejs uploads temp logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/server.js"]