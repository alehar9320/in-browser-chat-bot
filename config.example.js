// Configuration example file
// Copy this to config.js and modify as needed

export const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    environment: process.env.NODE_ENV || 'development'
  },

  // Development Settings
  development: {
    debug: process.env.DEBUG === 'true',
    logLevel: process.env.LOG_LEVEL || 'debug',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  },

  // NLP Configuration
  nlp: {
    engine: process.env.NLP_ENGINE || 'winkNLP',
    model: process.env.NLP_MODEL || 'wink-eng-lite-web-model'
  },

  // AI Model Configuration
  ai: {
    defaultModel: process.env.DEFAULT_AI_MODEL || 'Llama-3-8B-Instruct-q4f32_1-MLC-1k',
    cacheDir: process.env.AI_MODEL_CACHE_DIR || './models',
    downloadTimeout: parseInt(process.env.AI_MODEL_DOWNLOAD_TIMEOUT) || 300000
  },

  // Security
  security: {
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000,
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },

  // Performance
  performance: {
    workerThreads: parseInt(process.env.WORKER_THREADS) || 2,
    clusterMode: process.env.CLUSTER_MODE === 'true',
    memoryLimit: process.env.MEMORY_LIMIT || '1GB'
  },

  // Monitoring
  monitoring: {
    enableMetrics: process.env.ENABLE_METRICS === 'true',
    metricsPort: parseInt(process.env.METRICS_PORT) || 9090,
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000
  },

  // Logging
  logging: {
    format: process.env.LOG_FORMAT || 'json',
    logFile: process.env.LOG_FILE || 'logs/application.log',
    maxSize: process.env.LOG_MAX_SIZE || '10m',
    maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5
  }
};

export default config;
