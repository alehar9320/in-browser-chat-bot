import { fallbackJokes } from './fallbackJokes.js';
import * as webllm from "https://esm.run/@mlc-ai/web-llm";

// Global variables for NLP
let nlp = null;
let its = null;
let as = null;

// WebLLM setup
let webllmLoaded = false;
let webllmEngine = null;

const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const modelStatus = document.getElementById('model-status');

// Initialize winkNLP when libraries are ready
function initializeNLP() {
  try {
    if (window.winkNLP && window.model) {
      nlp = window.winkNLP(window.model);
      its = nlp.its;
      as = nlp.as;
      console.log('winkNLP initialized successfully');
      return true;
    }
  } catch (error) {
    console.error('Error initializing winkNLP:', error);
  }
  return false;
}

// Helper: Detect if user is asking for a joke
function isJokeIntent(text) {
  // Enhanced fallback that works without NLP
  const lowerText = text.toLowerCase();
  const jokeKeywords = [
    'joke', 'funny', 'laugh', 'make me laugh', 'tell me something funny',
    'humor', 'hilarious', 'amusing', 'entertaining', 'comedy'
  ];
  
  // Check for joke-related patterns
  const hasJokeKeyword = jokeKeywords.some(keyword => lowerText.includes(keyword));
  const hasQuestionPattern = lowerText.includes('?') && (lowerText.includes('tell') || lowerText.includes('give'));
  
  if (!nlp) {
    // Enhanced fallback if NLP isn't ready
    return hasJokeKeyword || hasQuestionPattern;
  }
  
  try {
    const doc = nlp.readDoc(text);
    const tokens = doc.tokens().out(as.array);
    return hasJokeKeyword || hasQuestionPattern;
  } catch (e) {
    console.warn('NLP processing failed, using enhanced fallback:', e);
    return hasJokeKeyword || hasQuestionPattern;
  }
}

// WebLLM: Load model using proper ES module import
async function loadWebLLM() {
  try {
    if (modelStatus) {
      modelStatus.textContent = 'Loading model...';
    }
    
    console.log('Available models:', webllm.prebuiltAppConfig.model_list.map(m => m.model_id));
    
    // Get the selected model from the dropdown
    const modelSelection = document.getElementById('model-selection');
    const selectedModel = modelSelection ? modelSelection.value : "Llama-3-8B-Instruct-q4f32_1-MLC-1k";
    console.log('Selected model:', selectedModel);
    
    // Create engine instance with progress callback
    webllmEngine = new webllm.MLCEngine();
    webllmEngine.setInitProgressCallback((report) => {
      console.log('Model loading progress:', report.progress);
      if (modelStatus) {
        modelStatus.textContent = `Loading: ${Math.round(report.progress * 100)}%`;
      }
    });
    
    console.log('Initializing WebLLM engine...');
    const config = {
      temperature: 1.0,
      top_p: 1,
    };
    
    await webllmEngine.reload(selectedModel, config);
    webllmLoaded = true;
    
    if (modelStatus) {
      modelStatus.textContent = 'Model ready!';
    }
    
    // Show model selection dropdown
    if (modelSelection) {
      modelSelection.style.display = 'inline-block';
    }
    
    console.log('WebLLM loaded successfully:', selectedModel);
  } catch (e) {
    webllmLoaded = false;
    if (modelStatus) {
      modelStatus.textContent = 'Model failed to load.';
    }
    console.error('WebLLM load error:', e);
    
    // Provide more helpful error information
    console.error('WebLLM initialization failed. This might be due to:');
    console.error('1. Network connectivity issues');
    console.error('2. Model download problems');
    console.error('3. Browser compatibility issues');
    console.error('4. Memory constraints');
  }
}

// Wait for CDN scripts to load and initialize NLP
function waitForLibraries() {
  return new Promise((resolve) => {
    let attempts = 0;
    const maxAttempts = 150; // 15 seconds timeout
    
    const checkLibraries = () => {
      attempts++;
      
      // Debug: Log what's available
      if (attempts % 10 === 0) { // Log every 10th attempt
        console.log(`Library check attempt ${attempts}:`, {
          winkNLP: !!window.winkNLP,
          model: !!window.model,
          scriptErrors: window.scriptErrors || [],
          scriptsLoaded: window.scriptsLoaded || {}
        });
      }
      
      if (window.winkNLP && window.model) {
        console.log('All required libraries are now available');
        resolve(true);
      } else if (attempts >= maxAttempts) {
        console.warn('Timeout waiting for NLP libraries, proceeding with fallback');
        console.log('Final library status:', {
          winkNLP: !!window.winkNLP,
          model: !!window.model,
          scriptErrors: window.scriptErrors || [],
          scriptsLoaded: window.scriptsLoaded || {}
        });
        
        // Provide specific guidance based on what failed
        if (!window.winkNLP) {
          console.error('winkNLP failed to load. Check network connectivity and CDN availability.');
        }
        if (!window.model) {
          console.error('winkNLP model failed to load. This is required for NLP functionality.');
        }
        
        resolve(false);
      } else {
        setTimeout(checkLibraries, 100);
      }
    };
    checkLibraries();
  });
}

// Update loading indicator
function updateLoadingStatus(message) {
  const loadingElement = document.getElementById('llm-js-loading');
  if (loadingElement) {
    loadingElement.textContent = message;
  }
}

// Hide loading indicator
function hideLoadingIndicator() {
  const loadingElement = document.getElementById('llm-js-loading');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, starting initialization...');
  
  // Enable UI immediately - don't wait for model loading
  userInput.disabled = false;
  chatForm.querySelector('button').disabled = false;
  
  updateLoadingStatus('Loading NLP libraries...');
  
  // Wait for CDN libraries to load
  console.log('Waiting for CDN libraries...');
  const librariesLoaded = await waitForLibraries();
  console.log('Library loading result:', librariesLoaded);
  
  // Initialize NLP
  if (librariesLoaded && initializeNLP()) {
    console.log('NLP libraries loaded successfully');
    updateLoadingStatus('NLP ready - AI model loading in background...');
    if (modelStatus) {
      modelStatus.textContent = 'NLP + Loading AI...';
    }
  } else {
    console.log('Failed to initialize NLP, using fallback mode');
    updateLoadingStatus('Fallback mode - AI model loading in background...');
    if (modelStatus) {
      modelStatus.textContent = 'Fallback + Loading AI...';
    }
  }
  
  // Hide loading indicator and show chat immediately
  hideLoadingIndicator();
  
  // Show welcome message immediately
  let welcomeMessage = "Hello! I'm JokeBot 🤖. Ask me for a joke about any topic!";
  if (!nlp) {
    welcomeMessage += " (AI model loading in background - will be available soon!)";
  } else {
    welcomeMessage += " (AI model loading in background - will be available soon!)";
  }
  
  appendMessage('bot', welcomeMessage);
  
  // Load WebLLM in background (non-blocking)
  console.log('Starting WebLLM background loading...');
  
  // Show background loading message
  appendMessage('bot', "⏳ Loading AI model in background... This may take a few minutes.");
  
  loadWebLLMInBackground();
});

// Load WebLLM in background without blocking UI
async function loadWebLLMInBackground() {
  try {
    console.log('Background: Starting WebLLM initialization...');
    
    // Update status to show background loading
    if (modelStatus) {
      const currentText = modelStatus.textContent;
      if (currentText.includes('Loading AI...')) {
        modelStatus.textContent = currentText.replace('Loading AI...', 'AI Loading...');
      }
    }
    
    // Create a progress message that we'll update
    const progressMsg = appendMessage('bot', "🔄 Initializing AI model...");
    
    // Set up progress tracking
    let lastProgress = 0;
    const progressInterval = setInterval(() => {
      if (progressMsg && lastProgress < 90) {
        lastProgress += Math.random() * 10;
        progressMsg.textContent = `🔄 Initializing AI model... ${Math.round(lastProgress)}%`;
      }
    }, 2000);
    
    await loadWebLLM();
    
    // Clear progress interval
    clearInterval(progressInterval);
    
    // Model loaded successfully - update UI
    if (webllmLoaded) {
      console.log('Background: WebLLM loaded successfully');
      
      // Update status
      if (modelStatus) {
        const currentModel = document.getElementById('model-selection')?.value || 'Unknown';
        modelStatus.textContent = nlp ? `NLP + ${currentModel}` : `Fallback + ${currentModel}`;
      }
      
      // Show model selection dropdown
      const modelSelection = document.getElementById('model-selection');
      if (modelSelection) {
        modelSelection.style.display = 'inline-block';
      }
      
      // Remove the loading message and notify user that AI is now available
      if (progressMsg && progressMsg.parentNode) {
        progressMsg.parentNode.removeChild(progressMsg);
      }
      appendMessage('bot', "🎉 AI model is now ready! You can now get AI-generated jokes!");
      
      // Update loading status
      updateLoadingStatus('AI model ready!');
      
    } else {
      console.log('Background: WebLLM failed to load');
      if (modelStatus) {
        modelStatus.textContent = nlp ? 'NLP Only' : 'Fallback Only';
      }
      updateLoadingStatus('AI model failed to load - using fallback mode');
      
      // Update the loading message to show failure
      if (progressMsg) {
        progressMsg.textContent = "❌ AI model failed to load. Using fallback mode.";
      }
    }
    
  } catch (error) {
    console.error('Background: WebLLM loading failed:', error);
    if (modelStatus) {
      modelStatus.textContent = nlp ? 'NLP Only' : 'Fallback Only';
    }
    updateLoadingStatus('AI model failed to load - using fallback mode');
    
    // Update the loading message to show failure
    if (progressMsg) {
      progressMsg.textContent = "❌ AI model failed to load. Using fallback mode.";
    }
    
    appendMessage('bot', "⚠️ AI model failed to load. You can still use fallback jokes!");
  }
}

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.className = sender;
  msg.setAttribute('data-msg', text);
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showTypingIndicator() {
  document.getElementById('typing-indicator').style.display = 'flex';
}

function hideTypingIndicator() {
  document.getElementById('typing-indicator').style.display = 'none';
}

async function getWebLLMJoke(userText) {
  if (!webllmLoaded || !webllmEngine) {
    // Check if model is still loading
    if (modelStatus && modelStatus.textContent.includes('Loading')) {
      return "🤔 AI model is still loading in the background. Please wait a moment and try again, or I can tell you a fallback joke instead!";
    }
    return null;
  }
  
  const messages = [
    {
      content: "You are a helpful, family-friendly chatbot that tells jokes. Keep responses short and funny.",
      role: "system",
    },
    {
      content: `Tell me a joke about: ${userText}`,
      role: "user",
    }
  ];
  
  try {
    console.log('Generating joke with WebLLM...');
    
    // Use the streaming API for better user experience
    let curMessage = "";
    const completion = await webllmEngine.chat.completions.create({
      stream: true,
      messages,
      max_tokens: 100,
      temperature: 0.8
    });
    
    for await (const chunk of completion) {
      const curDelta = chunk.choices[0].delta.content;
      if (curDelta) {
        curMessage += curDelta;
      }
    }
    
    // Get the final message
    const finalMessage = await webllmEngine.getMessage();
    let joke = finalMessage || curMessage;
    
    // Clean up the response
    joke = joke.trim();
    if (!joke) {
      joke = fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
    }
    
    console.log('Generated joke:', joke);
    return joke;
    
  } catch (e) {
    console.error('WebLLM generation error:', e);
    return fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
  }
}

// Add model selection change handler
const modelSelection = document.getElementById('model-selection');
if (modelSelection) {
  modelSelection.addEventListener('change', async (e) => {
    const newModel = e.target.value;
    console.log('Model changed to:', newModel);
    
    if (webllmLoaded && webllmEngine) {
      try {
        if (modelStatus) {
          modelStatus.textContent = 'Switching model...';
        }
        
        // Reload with new model
        await webllmEngine.reload(newModel, {
          temperature: 1.0,
          top_p: 1,
        });
        
        if (modelStatus) {
          modelStatus.textContent = 'Model ready!';
        }
        
        console.log('Successfully switched to model:', newModel);
        appendMessage('bot', `Switched to ${newModel} model!`);
      } catch (error) {
        console.error('Failed to switch model:', error);
        if (modelStatus) {
          modelStatus.textContent = 'Model switch failed';
        }
        appendMessage('bot', 'Failed to switch model. Please try again.');
      }
    }
  });
}

// Add status check command
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = userInput.value.trim();
  if (!text) return;
  
      // Check for status command
    if (text.toLowerCase().includes('status') || text.toLowerCase().includes('loading')) {
      let statusMessage = "📊 Current Status:\n";
      statusMessage += `• NLP: ${nlp ? '✅ Ready' : '❌ Not available'}\n`;
      statusMessage += `• AI Model: ${webllmLoaded ? '✅ Ready' : '⏳ Loading...'}\n`;
      
      if (modelStatus) {
        statusMessage += `• Status: ${modelStatus.textContent}`;
      }
      
      appendMessage('user', text);
      userInput.value = '';
      appendMessage('bot', statusMessage);
      return;
    }
  
  appendMessage('user', text);
  userInput.value = '';

  showTypingIndicator();
  chatForm.querySelector('button').disabled = true;
  userInput.disabled = true;

  let response = '';
  if (isJokeIntent(text)) {
    if (webllmLoaded && webllmEngine) {
      response = await getWebLLMJoke(text);
    } else {
      response = fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
    }
  } else {
    response = "I'm here to tell jokes! Ask me for a joke about any topic.";
  }

  hideTypingIndicator();
  appendMessage('bot', response);
  chatForm.querySelector('button').disabled = false;
  userInput.disabled = false;
  userInput.focus();
});
