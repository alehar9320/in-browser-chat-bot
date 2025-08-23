# API Documentation 📚

This document provides comprehensive information about the In-Browser Chat Bot's API endpoints, data structures, and integration capabilities.

## Overview

The In-Browser Chat Bot provides both client-side and server-side APIs for natural language processing and AI-powered interactions. The system is designed to work entirely locally in the browser while providing optional server-side NLP capabilities for development and testing.

## API Endpoints

### Server-Side Endpoints

#### 1. Text Analysis Endpoint

**Endpoint:** `POST /analyze`

**Description:** Analyzes text using winkNLP for intent classification and entity extraction.

**Request:**
```http
POST /analyze
Content-Type: application/json

{
  "text": "Tell me a joke about programming"
}
```

**Response:**
```json
{
  "originalText": "Tell me a joke about programming",
  "sentenceCount": 1,
  "nouns": ["joke", "programming"],
  "entities": [],
  "message": "Analysis successful!"
}
```

**Error Response:**
```json
{
  "error": "Text input is required."
}
```

**Status Codes:**
- `200 OK`: Analysis successful
- `400 Bad Request`: Missing or invalid input
- `500 Internal Server Error`: Server processing error

#### 2. Health Check Endpoint

**Endpoint:** `GET /health`

**Description:** Returns server health status and configuration information.

**Request:**
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "nlp": {
    "engine": "winkNLP",
    "model": "wink-eng-lite-web-model",
    "status": "ready"
  },
  "server": {
    "uptime": 3600,
    "memory": "64MB",
    "environment": "development"
  }
}
```

### Client-Side APIs

#### 1. ChatBot Class

**Constructor:**
```javascript
const chatbot = new ChatBot({
  enableNLP: true,
  enableAI: true,
  fallbackMode: true
});
```

**Methods:**

##### `initialize()`
Initializes the chatbot and loads required components.

```javascript
await chatbot.initialize();
```

**Returns:** `Promise<boolean>` - Success status

##### `processInput(text)`
Processes user input and generates appropriate response.

```javascript
const response = await chatbot.processInput("Tell me a joke");
```

**Parameters:**
- `text` (string): User input text

**Returns:** `Promise<string>` - Generated response

##### `getStatus()`
Returns current system status and capabilities.

```javascript
const status = chatbot.getStatus();
```

**Returns:** `Object` - Status information

```json
{
  "nlp": {
    "ready": true,
    "engine": "winkNLP",
    "fallback": false
  },
  "ai": {
    "ready": true,
    "model": "Llama-3-8B",
    "loading": false
  },
  "ui": {
    "responsive": true,
    "accessibility": "WCAG 2.1 AA"
  }
}
```

#### 2. NLP Utilities

##### `classifyIntent(text)`
Classifies user intent using NLP or fallback methods.

```javascript
import { classifyIntent } from './nlp-utils.js';

const intent = classifyIntent("I need a joke");
// Returns: { type: 'joke_request', confidence: 0.95 }
```

**Parameters:**
- `text` (string): Input text to classify

**Returns:** `Object` - Intent classification result

##### `extractEntities(text)`
Extracts named entities from text.

```javascript
import { extractEntities } from './nlp-utils.js';

const entities = extractEntities("Tell me about Elon Musk");
// Returns: [{ type: 'PERSON', value: 'Elon Musk' }]
```

#### 3. AI Model Management

##### `loadModel(modelId)`
Loads a specific AI model for content generation.

```javascript
import { loadModel } from './ai-manager.js';

const success = await loadModel('Llama-3-8B-Instruct');
```

**Parameters:**
- `modelId` (string): Model identifier

**Returns:** `Promise<boolean>` - Success status

##### `generateContent(prompt, options)`
Generates content using the loaded AI model.

```javascript
import { generateContent } from './ai-manager.js';

const content = await generateContent("Tell me a joke about cats", {
  maxTokens: 100,
  temperature: 0.8,
  stream: true
});
```

**Parameters:**
- `prompt` (string): Input prompt
- `options` (Object): Generation options

**Returns:** `Promise<string>` - Generated content

## Data Structures

### 1. Intent Classification Result

```typescript
interface IntentResult {
  type: 'joke_request' | 'question' | 'command' | 'unknown';
  confidence: number; // 0.0 to 1.0
  entities: Entity[];
  metadata: {
    processingTime: number;
    method: 'nlp' | 'fallback';
    fallbackReason?: string;
  };
}
```

### 2. Entity Structure

```typescript
interface Entity {
  type: 'PERSON' | 'ORGANIZATION' | 'LOCATION' | 'DATE' | 'TOPIC';
  value: string;
  confidence: number;
  position: {
    start: number;
    end: number;
  };
}
```

### 3. AI Generation Options

```typescript
interface GenerationOptions {
  maxTokens?: number;
  temperature?: number; // 0.0 to 2.0
  topP?: number; // 0.0 to 1.0
  stream?: boolean;
  stopSequences?: string[];
  presencePenalty?: number;
  frequencyPenalty?: number;
}
```

### 4. Chat Message

```typescript
interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  metadata?: {
    intent?: IntentResult;
    processingTime?: number;
    model?: string;
    confidence?: number;
  };
}
```

## Error Handling

### 1. Error Types

```typescript
enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NLP_ERROR = 'NLP_ERROR',
  AI_ERROR = 'AI_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}
```

### 2. Error Response Format

```typescript
interface ErrorResponse {
  error: {
    type: ErrorType;
    message: string;
    code: string;
    details?: any;
    timestamp: string;
    requestId: string;
  };
}
```

### 3. Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INVALID_INPUT` | Invalid or missing input | 400 |
| `NLP_UNAVAILABLE` | NLP engine not ready | 503 |
| `AI_MODEL_LOADING` | AI model still loading | 503 |
| `MODEL_NOT_FOUND` | Requested model unavailable | 404 |
| `GENERATION_FAILED` | Content generation failed | 500 |
| `TIMEOUT` | Request processing timeout | 408 |

## Rate Limiting

### 1. Client-Side Limits

- **Input Length**: Maximum 1000 characters per message
- **Request Frequency**: Maximum 10 requests per minute
- **Model Switching**: Maximum 3 switches per hour

### 2. Server-Side Limits

- **API Calls**: Maximum 100 requests per minute per IP
- **Text Length**: Maximum 5000 characters per analysis
- **Concurrent Users**: Maximum 100 simultaneous connections

## Authentication & Security

### 1. Development Mode

- No authentication required
- CORS enabled for local development
- Debug endpoints available

### 2. Production Mode

- API key authentication (optional)
- Rate limiting per API key
- HTTPS enforcement
- Input sanitization

## Integration Examples

### 1. Basic Integration

```html
<!DOCTYPE html>
<html>
<head>
  <title>ChatBot Integration</title>
</head>
<body>
  <div id="chat-container"></div>
  
  <script type="module">
    import { ChatBot } from './chatbot.js';
    
    const chatbot = new ChatBot();
    
    // Initialize
    chatbot.initialize().then(() => {
      console.log('ChatBot ready!');
    });
    
    // Process user input
    document.getElementById('chat-container').addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = e.target.elements.message.value;
      const response = await chatbot.processInput(input);
      displayResponse(response);
    });
  </script>
</body>
</html>
```

### 2. Advanced Integration with Custom UI

```javascript
import { ChatBot, classifyIntent, generateContent } from './chatbot.js';

class CustomChatInterface {
  constructor() {
    this.chatbot = new ChatBot({
      enableNLP: true,
      enableAI: true,
      fallbackMode: true
    });
    
    this.initialize();
  }
  
  async initialize() {
    await this.chatbot.initialize();
    this.setupEventListeners();
  }
  
  async handleUserInput(text) {
    try {
      // Classify intent first
      const intent = await classifyIntent(text);
      
      if (intent.type === 'joke_request') {
        // Generate AI content
        const content = await generateContent(text, {
          maxTokens: 150,
          temperature: 0.9
        });
        
        this.displayResponse(content, intent);
      } else {
        // Handle other intents
        this.displayResponse("I'm here to tell jokes! Ask me for a joke about any topic.");
      }
    } catch (error) {
      this.handleError(error);
    }
  }
  
  displayResponse(content, intent = null) {
    // Custom display logic
    const responseElement = document.createElement('div');
    responseElement.className = 'response';
    responseElement.textContent = content;
    
    if (intent) {
      responseElement.setAttribute('data-intent', intent.type);
      responseElement.setAttribute('data-confidence', intent.confidence);
    }
    
    this.chatContainer.appendChild(responseElement);
  }
  
  handleError(error) {
    console.error('ChatBot error:', error);
    this.displayResponse("Sorry, I encountered an error. Please try again.");
  }
}
```

### 3. Server-Side Integration

```javascript
import express from 'express';
import { analyzeText } from './nlp-service.js';

const app = express();
app.use(express.json());

// Text analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Text input is required and must be a string',
          code: 'INVALID_INPUT'
        }
      });
    }
    
    const analysis = await analyzeText(text);
    
    res.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      error: {
        type: 'NLP_ERROR',
        message: 'Text analysis failed',
        code: 'ANALYSIS_FAILED',
        details: error.message
      }
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'nlp-analyzer',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.listen(3000, () => {
  console.log('NLP service running on port 3000');
});
```

## Testing

### 1. API Testing

```javascript
// Using Jest for testing
import { ChatBot } from './chatbot.js';

describe('ChatBot API', () => {
  let chatbot;
  
  beforeEach(async () => {
    chatbot = new ChatBot();
    await chatbot.initialize();
  });
  
  test('should process joke requests', async () => {
    const response = await chatbot.processInput('Tell me a joke');
    expect(response).toBeTruthy();
    expect(typeof response).toBe('string');
  });
  
  test('should handle invalid input gracefully', async () => {
    const response = await chatbot.processInput('');
    expect(response).toContain('Please provide some text');
  });
});
```

### 2. Integration Testing

```javascript
// End-to-end testing with Playwright
import { test, expect } from '@playwright/test';

test('complete chat workflow', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Wait for chatbot to initialize
  await page.waitForSelector('#chat-window');
  
  // Send a message
  await page.fill('#user-input', 'Tell me a joke about programming');
  await page.click('button[type="submit"]');
  
  // Wait for response
  await page.waitForSelector('.bot[data-msg]');
  
  // Verify response
  const response = await page.textContent('.bot[data-msg]');
  expect(response).toBeTruthy();
  expect(response.length).toBeGreaterThan(10);
});
```

## Performance Considerations

### 1. Client-Side Optimization

- **Lazy Loading**: Load AI models only when needed
- **Caching**: Cache NLP results and AI responses
- **Debouncing**: Limit rapid successive requests
- **Web Workers**: Process heavy tasks in background

### 2. Server-Side Optimization

- **Connection Pooling**: Reuse database connections
- **Response Caching**: Cache common analysis results
- **Load Balancing**: Distribute requests across instances
- **Compression**: Compress API responses

## Monitoring & Logging

### 1. Performance Metrics

- **Response Time**: Average processing time per request
- **Throughput**: Requests processed per second
- **Error Rate**: Percentage of failed requests
- **Resource Usage**: Memory and CPU utilization

### 2. Logging

```javascript
// Structured logging
logger.info('API request processed', {
  endpoint: '/analyze',
  processingTime: 150,
  inputLength: 25,
  intent: 'joke_request',
  confidence: 0.95
});
```

---

This API documentation provides comprehensive information for integrating and extending the In-Browser Chat Bot. For additional support or questions, please refer to the project's GitHub repository or open an issue.
