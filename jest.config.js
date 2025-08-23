module.exports = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // File extensions to test
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.test.ts',
    '**/tests/**/*.spec.js',
    '**/tests/**/*.spec.ts',
    '**/*.test.js',
    '**/*.test.ts',
    '**/*.spec.js',
    '**/*.spec.ts'
  ],
  
  // Directories to ignore
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{js,ts}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/coverage/**',
    '!**/*.config.js',
    '!**/*.config.ts',
    '!**/tests/**',
    '!**/test/**',
    '!**/server.js',
    '!**/fallbackJokes.js'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Coverage reporters
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.js'
  ],
  
  // Module name mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@components/(.*)$': '<rootDir>/components/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1'
  },
  
  // Transform configuration
  transform: {
    '^.+\\.(js|ts)$': 'babel-jest'
  },
  
  // Babel configuration
  transformIgnorePatterns: [
    '/node_modules/(?!(wink-nlp|wink-eng-lite-web-model)/)'
  ],
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks between tests
  restoreMocks: true,
  
  // Reset modules between tests
  resetModules: true,
  
  // Collect coverage from untested files
  collectCoverageFrom: [
    '**/*.{js,ts}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/coverage/**',
    '!**/*.config.js',
    '!**/*.config.ts',
    '!**/tests/**',
    '!**/test/**',
    '!**/server.js',
    '!**/fallbackJokes.js'
  ],
  
  // Coverage directory
  coverageDirectory: 'coverage',
  
  // Test results processor
  testResultsProcessor: 'jest-sonar-reporter',
  
  // Global setup and teardown
  globalSetup: '<rootDir>/tests/global-setup.js',
  globalTeardown: '<rootDir>/tests/global-teardown.js'
};
