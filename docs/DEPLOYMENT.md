# Deployment Guide 🚀

This document provides comprehensive instructions for deploying the In-Browser Chat Bot in various environments, from local development to production deployment.

## Prerequisites

### System Requirements

- **Node.js**: Version 16.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **Memory**: Minimum 4GB RAM (8GB+ recommended for production)
- **Storage**: Minimum 2GB free space for AI models
- **Network**: Stable internet connection for initial setup

### Browser Compatibility

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## Local Development Setup

### 1. Environment Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/in-browser-chat-bot.git
cd in-browser-chat-bot

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 2. Environment Configuration

Create a `.env` file with the following variables:

```bash
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Development Settings
DEBUG=true
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3000

# NLP Configuration
NLP_ENGINE=winkNLP
NLP_MODEL=wink-eng-lite-web-model

# AI Model Configuration
DEFAULT_AI_MODEL=Llama-3-8B-Instruct-q4f32_1-MLC-1k
AI_MODEL_CACHE_DIR=./models
AI_MODEL_DOWNLOAD_TIMEOUT=300000

# Security
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Start Development Server

```bash
# Start development server with auto-reload
npm run dev

# Or start production-like server
npm start
```

### 4. Access the Application

Open your browser and navigate to:
- **Main Application**: `http://localhost:3000`
- **API Endpoints**: `http://localhost:3000/api/*`
- **Health Check**: `http://localhost:3000/health`

## Production Deployment

### 1. Build Preparation

```bash
# Install production dependencies
npm ci --only=production

# Build the application
npm run build

# Run tests
npm test

# Check code quality
npm run lint
npm run format:check
```

### 2. Environment Configuration

Create a production `.env` file:

```bash
# Production Configuration
NODE_ENV=production
PORT=80
HOST=0.0.0.0

# Security
DEBUG=false
LOG_LEVEL=info
CORS_ORIGIN=https://yourdomain.com

# Performance
WORKER_THREADS=4
CLUSTER_MODE=true
MEMORY_LIMIT=2GB

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
HEALTH_CHECK_INTERVAL=30000
```

### 3. Deployment Options

#### Option A: Static Hosting (Recommended)

**Netlify Deployment:**

1. **Connect Repository:**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Login to Netlify
   netlify login
   
   # Initialize deployment
   netlify init
   ```

2. **Build Configuration:**
   Create `netlify.toml`:
   ```toml
   [build]
     publish = "."
     command = "npm run build"
   
   [build.environment]
     NODE_VERSION = "16"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   
   [headers]
     [headers./**]
       X-Frame-Options = "DENY"
       X-XSS-Protection = "1; mode=block"
       X-Content-Type-Options = "nosniff"
       Referrer-Policy = "strict-origin-when-cross-origin"
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

**Vercel Deployment:**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Configuration:**
   Create `vercel.json`:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "."
         }
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/index.html"
       }
     ],
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "X-Frame-Options",
             "value": "DENY"
           },
           {
             "key": "X-Content-Type-Options",
             "value": "nosniff"
           }
         ]
       }
     ]
   }
   ```

#### Option B: Self-Hosted Server

**Nginx Configuration:**

1. **Install Nginx:**
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. **Create Site Configuration:**
   ```bash
   sudo nano /etc/nginx/sites-available/chatbot
   ```

3. **Configuration Content:**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       root /var/www/chatbot;
       index index.html;
       
       # Security headers
       add_header X-Frame-Options "DENY" always;
       add_header X-XSS-Protection "1; mode=block" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header Referrer-Policy "strict-origin-when-cross-origin" always;
       
       # Gzip compression
       gzip on;
       gzip_vary on;
       gzip_min_length 1024;
       gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
       
       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
       
       # Handle SPA routing
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # API proxy (if using server-side features)
       location /api/ {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Enable Site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/chatbot /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

**Apache Configuration:**

1. **Create .htaccess file:**
   ```apache
   # Enable rewrite engine
   RewriteEngine On
   
   # Handle SPA routing
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule ^(.*)$ /index.html [QSA,L]
   
   # Security headers
   Header always set X-Frame-Options "DENY"
   Header always set X-XSS-Protection "1; mode=block"
   Header always set X-Content-Type-Options "nosniff"
   Header always set Referrer-Policy "strict-origin-when-cross-origin"
   
   # Cache static assets
   <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg)$">
       Header set Cache-Control "max-age=31536000, public, immutable"
   </FilesMatch>
   
   # Gzip compression
   <IfModule mod_deflate.c>
       AddOutputFilterByType DEFLATE text/plain
       AddOutputFilterByType DEFLATE text/html
       AddOutputFilterByType DEFLATE text/xml
       AddOutputFilterByType DEFLATE text/css
       AddOutputFilterByType DEFLATE application/xml
       AddOutputFilterByType DEFLATE application/xhtml+xml
       AddOutputFilterByType DEFLATE application/rss+xml
       AddOutputFilterByType DEFLATE application/javascript
       AddOutputFilterByType DEFLATE application/x-javascript
   </IfModule>
   ```

#### Option C: Docker Deployment

1. **Create Dockerfile:**
   ```dockerfile
   # Multi-stage build for production
   FROM node:16-alpine AS builder
   
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   RUN npm run build
   
   # Production stage
   FROM nginx:alpine
   
   # Copy built application
   COPY --from=builder /app /usr/share/nginx/html
   
   # Copy nginx configuration
   COPY nginx.conf /etc/nginx/nginx.conf
   
   # Expose port
   EXPOSE 80
   
   # Start nginx
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Create nginx.conf:**
   ```nginx
   events {
       worker_connections 1024;
   }
   
   http {
       include /etc/nginx/mime.types;
       default_type application/octet-stream;
       
       # Gzip compression
       gzip on;
       gzip_vary on;
       gzip_min_length 1024;
       gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
       
       server {
           listen 80;
           server_name localhost;
           
           root /usr/share/nginx/html;
           index index.html;
           
           # Security headers
           add_header X-Frame-Options "DENY" always;
           add_header X-XSS-Protection "1; mode=block" always;
           add_header X-Content-Type-Options "nosniff" always;
           
           # Handle SPA routing
           location / {
               try_files $uri $uri/ /index.html;
           }
           
           # Cache static assets
           location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
               expires 1y;
               add_header Cache-Control "public, immutable";
           }
       }
   }
   ```

3. **Build and Run:**
   ```bash
   # Build image
   docker build -t chatbot .
   
   # Run container
   docker run -d -p 80:80 --name chatbot chatbot
   ```

4. **Docker Compose:**
   ```yaml
   version: '3.8'
   
   services:
     chatbot:
       build: .
       ports:
         - "80:80"
       environment:
         - NODE_ENV=production
       restart: unless-stopped
       healthcheck:
         test: ["CMD", "curl", "-f", "http://localhost/health"]
         interval: 30s
         timeout: 10s
         retries: 3
   ```

## Cloud Platform Deployment

### AWS Deployment

1. **S3 + CloudFront:**
   ```bash
   # Install AWS CLI
   aws configure
   
   # Create S3 bucket
   aws s3 mb s3://your-chatbot-bucket
   
   # Upload files
   aws s3 sync . s3://your-chatbot-bucket --exclude "node_modules/*" --exclude ".git/*"
   
   # Configure bucket for static website
   aws s3 website s3://your-chatbot-bucket --index-document index.html --error-document index.html
   ```

2. **CloudFront Distribution:**
   - Origin: S3 bucket
   - Behaviors: Cache static assets, forward all to origin
   - Error pages: Return 200 for 404s (SPA routing)

### Google Cloud Platform

1. **Cloud Storage + Load Balancer:**
   ```bash
   # Create bucket
   gsutil mb gs://your-chatbot-bucket
   
   # Upload files
   gsutil -m rsync -r . gs://your-chatbot-bucket
   
   # Make bucket public
   gsutil iam ch allUsers:objectViewer gs://your-chatbot-bucket
   ```

2. **Load Balancer Configuration:**
   - Backend: Cloud Storage bucket
   - Frontend: HTTPS with SSL certificate
   - URL rewrite: All paths to index.html

### Azure Deployment

1. **Static Web Apps:**
   ```bash
   # Install Azure CLI
   az login
   
   # Create static web app
   az staticwebapp create --name your-chatbot --source .
   
   # Deploy
   az staticwebapp update --name your-chatbot --source .
   ```

## Performance Optimization

### 1. Asset Optimization

```bash
# Minify JavaScript and CSS
npm run build:minify

# Optimize images
npm run optimize:images

# Generate service worker
npm run generate:sw
```

### 2. Caching Strategy

```javascript
// Service worker for offline support
const CACHE_NAME = 'chatbot-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/chatbot.js',
  '/style.css',
  '/fallbackJokes.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});
```

### 3. CDN Configuration

```bash
# CloudFlare configuration
# Page Rules:
# - Cache Level: Cache Everything
# - Edge Cache TTL: 4 hours
# - Browser Cache TTL: 1 day

# Custom Headers:
# - X-Frame-Options: DENY
# - X-XSS-Protection: 1; mode=block
# - X-Content-Type-Options: nosniff
```

## Monitoring and Maintenance

### 1. Health Checks

```bash
# Create health check script
cat > health-check.sh << 'EOF'
#!/bin/bash
URL="https://yourdomain.com/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ $RESPONSE -eq 200 ]; then
    echo "Health check passed: $RESPONSE"
    exit 0
else
    echo "Health check failed: $RESPONSE"
    exit 1
fi
EOF

chmod +x health-check.sh

# Add to crontab
echo "*/5 * * * * /path/to/health-check.sh" | crontab -
```

### 2. Logging

```javascript
// Structured logging configuration
const logger = {
  info: (message, data = {}) => {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      ...data
    }));
  },
  error: (message, error = {}) => {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      error: error.message || error
    }));
  }
};
```

### 3. Performance Monitoring

```javascript
// Performance metrics collection
const performanceMetrics = {
  collect: () => {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    
    return {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime
    };
  }
};
```

## Security Considerations

### 1. HTTPS Enforcement

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
}
```

### 2. Content Security Policy

```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self';
  frame-ancestors 'none';
">
```

### 3. Rate Limiting

```javascript
// Client-side rate limiting
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }
  
  canMakeRequest() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return true;
    }
    
    return false;
  }
}
```

## Troubleshooting

### Common Issues

1. **Model Loading Failures:**
   ```bash
   # Check browser console for errors
   # Verify network connectivity
   # Check available memory
   # Try alternative CDN sources
   ```

2. **Performance Issues:**
   ```bash
   # Monitor memory usage
   # Check for memory leaks
   # Optimize model loading
   # Implement progressive loading
   ```

3. **Cross-Origin Issues:**
   ```bash
   # Verify CORS configuration
   # Check CDN accessibility
   # Test with different browsers
   # Review security policies
   ```

### Debug Mode

```bash
# Enable debug logging
DEBUG=true npm start

# Check detailed logs
tail -f logs/application.log

# Monitor system resources
htop
iotop
```

---

This deployment guide covers the most common deployment scenarios. For specific platform requirements or advanced configurations, please refer to the platform-specific documentation or open an issue in the project repository.
