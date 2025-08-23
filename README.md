# In-Browser Chat Bot 🤖

A sophisticated, privacy-first in-browser chat bot powered by large language models that provides intelligent, contextual responses based on user intent. This application runs entirely locally in the client's browser, ensuring complete privacy while delivering powerful AI capabilities.

## ✨ Features

- 🚀 **Hybrid Architecture**: Lightweight NLP for instant intent classification + heavy AI for content generation
- 🧠 **Advanced NLP**: winkNLP integration for sophisticated natural language understanding
- 🤖 **AI-Powered**: WebLLM integration with multiple model options (Llama, Phi-3, etc.)
- 🔒 **Privacy First**: All processing happens locally in your browser
- ⚡ **Real-time Interaction**: Responsive UI with immediate feedback
- 🎯 **Intent-Based Processing**: Smart understanding of user requests
- 📱 **Cross-Platform**: Works on desktop and mobile browsers
- 🎨 **Modern UI**: Clean, accessible interface with typing indicators

## 🏗️ Architecture

This project implements a sophisticated hybrid architecture that balances performance and user experience:

### Core Components

1. **Intent Classification Layer** (winkNLP)

   - Instant, lightweight natural language processing
   - Real-time user intent detection
   - Fallback to enhanced keyword matching

2. **Content Generation Layer** (WebLLM)

   - Heavy AI model loading in background
   - Multiple model options (Llama 3, Phi-3 Mini, etc.)
   - Graceful degradation to fallback content

3. **User Interface Layer**
   - Responsive chat interface
   - Real-time status indicators
   - Accessibility features (ARIA labels, keyboard navigation)

### Data Flow

```
User Input → winkNLP Intent Classification → Intent Confirmed → WebLLM Generation → Response
                ↓ (if NLP fails)
            Enhanced Keyword Fallback → Intent Confirmed → WebLLM/Fallback → Response
```

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Node.js 16+ (for development server)
- 4GB+ RAM recommended for optimal AI model performance

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/alehar9320/in-browser-chat-bot.git
   cd in-browser-chat-bot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Alternative: Direct Browser Usage

For production use, simply serve the static files from any web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

## 📖 Usage

### Basic Interaction

1. **Ask for a joke**: "Tell me a joke about programming"
2. **Request humor**: "Make me laugh"
3. **Check status**: "What's the current status?"
4. **Model selection**: Use the dropdown to switch between AI models

### Supported Commands

- `status` - Check system status and architecture
- `loading` - Check model loading progress
- Any natural language request for jokes or humor

### Model Options

- **Llama 3 (8B)**: Balanced performance and quality
- **Phi-3 Mini (4K)**: Fast, lightweight option
- **Llama 3.1 (8B)**: Enhanced reasoning capabilities

## 🛠️ Development

### Project Structure

```
in-browser-chat-bot/
├── chatbot.js          # Main application logic
├── server.js           # Development server with NLP endpoints
├── fallbackJokes.js    # Fallback content library
├── index.html          # Main HTML interface
├── style.css           # Application styling
├── package.json        # Dependencies and scripts
├── README.md           # This file
├── CONTRIBUTING.md     # Contribution guidelines
├── LICENSE             # MIT License
├── CHANGELOG.md        # Version history
├── docs/               # Technical documentation
│   ├── ARCHITECTURE.md # Detailed architecture guide
│   ├── API.md          # API documentation
│   └── DEPLOYMENT.md   # Deployment guide
└── tests/              # Test suite
    ├── unit/           # Unit tests
    └── integration/    # Integration tests
```

### Development Scripts

```bash
npm start          # Start development server
npm test           # Run test suite
npm run build      # Build for production
npm run lint       # Run code linting
npm run format     # Format code with Prettier
```

### Key Technologies

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **NLP Engine**: winkNLP with English language model
- **AI Framework**: WebLLM for local model execution
- **Development**: Node.js, Express.js
- **Testing**: Jest, Playwright
- **Linting**: ESLint, Prettier

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# All tests with coverage
npm run test:coverage

# Browser compatibility tests
npm run test:browser
```

### Test Coverage

- Unit tests: Core functions and utilities
- Integration tests: User workflows and API endpoints
- Browser tests: Cross-browser compatibility
- Accessibility tests: WCAG compliance

## 📦 Deployment

### Production Build

```bash
npm run build
```

### Deployment Options

1. **Static Hosting**: Netlify, Vercel, GitHub Pages
2. **CDN**: Cloudflare, AWS CloudFront
3. **Self-hosted**: Nginx, Apache, or any web server

### Environment Variables

```bash
# Development
NODE_ENV=development
PORT=3000

# Production
NODE_ENV=production
PORT=80
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Follow existing code style and patterns
- Include JSDoc comments for new functions
- Write tests for new functionality
- Ensure accessibility compliance
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [winkNLP](https://winkjs.org/wink-nlp/) for natural language processing
- [WebLLM](https://github.com/mlc-ai/web-llm) for local AI model execution
- [MLC AI](https://mlc.ai/) for the WebLLM framework
- Contributors and the open-source community

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/alehar9320/in-browser-chat-bot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/alehar9320/in-browser-chat-bot/discussions)
- **Documentation**: [Project Wiki](https://github.com/alehar9320/in-browser-chat-bot/wiki)

## 🔮 Roadmap

- [ ] Enhanced model selection and management
- [ ] Custom training capabilities
- [ ] Multi-language support
- [ ] Advanced conversation memory
- [ ] Plugin system for extensibility
- [ ] Mobile app versions
- [ ] Enterprise features and deployment tools

---

**Made with ❤️ for privacy-conscious AI enthusiasts**
