/**
 * In-Browser Chat Bot with Hybrid Architecture
 * 
 * This implementation follows a hybrid architectural pattern for optimal user experience:
 * 
 * 1. LIGHTWEIGHT INTENT CLASSIFICATION (winkNLP):
 *    - Uses winkNLP for instant, low-latency intent classification
 *    - Processes user input immediately without blocking the UI
 *    - Provides sophisticated NLP analysis including tokenization, sentence parsing, and entity recognition
 *    - Falls back to enhanced keyword matching if NLP isn't available
 * 
 * 2. HEAVY JOKE GENERATION (WebLLM):
 *    - Only activates the multi-gigabyte WebLLM engine after intent confirmation
 *    - Loads in the background without blocking user interaction
 *    - Generates creative, context-aware jokes using the selected language model
 *    - Falls back to pre-defined jokes if AI generation fails
 * 
 * BENEFITS:
 * - Responsive UI: Users can interact immediately while AI loads
 * - Resource Efficiency: Heavy processing only when needed
 * - Privacy First: All processing happens locally in the browser
 * - Graceful Degradation: Multiple fallback layers ensure functionality
 * 
 * ARCHITECTURE FLOW:
 * User Input → winkNLP Intent Classification → Intent Confirmed → WebLLM Joke Generation → Response
 *                ↓ (if NLP fails)
 *            Enhanced Keyword Fallback → Intent Confirmed → WebLLM/Fallback Joke → Response
 */

import { fallbackJokes } from './fallbackJokes.js';
import * as webllm from 'https://esm.run/@mlc-ai/web-llm';

// Global variables for NLP - using the properly loaded libraries
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

// Initialize winkNLP when libraries are ready - using the hybrid architecture
function initializeNLP() {
  try {
    // Check for the properly initialized winkNLP instance
    if (window.nlpInstance && window.its && window.as) {
      nlp = window.nlpInstance;
      its = window.its;
      as = window.as;
      console.log('winkNLP initialized successfully for hybrid architecture');
      return true;
    }
  } catch (error) {
    console.error('Error initializing winkNLP:', error);
  }
  return false;
}

// Enhanced intent classification using winkNLP for the hybrid architecture
function classifyUserIntent(text) {
  if (!nlp) {
    // Fallback to basic keyword matching if NLP isn't ready
    return classifyIntentFallback(text);
  }
  
  try {
    // Use winkNLP for sophisticated intent classification
    const doc = nlp.readDoc(text);
    
    // Extract key information for intent classification
    const tokens = doc.tokens().out();
    const sentences = doc.sentences().out();
    const entities = doc.entities().out(its.detail);
    
    // Enhanced intent classification using NLP features
    const lowerText = text.toLowerCase();
    
    // Check for joke-related patterns with NLP assistance
    const jokePatterns = [
      'joke', 'funny', 'laugh', 'make me laugh', 'tell me something funny',
      'humor', 'hilarious', 'amusing', 'entertaining', 'comedy', 'pun',
      'wit', 'sarcasm', 'satire', 'anecdote', 'story',
    ];
    
    // Use NLP to detect question patterns
    const hasQuestionPattern = sentences.some(sentence => 
      sentence.includes('?') || 
      sentence.toLowerCase().includes('tell') || 
      sentence.toLowerCase().includes('give') ||
      sentence.toLowerCase().includes('can you') ||
      sentence.toLowerCase().includes('would you'),
    );
    
    // Use NLP to detect imperative patterns
    const hasImperativePattern = sentences.some(sentence => 
      sentence.toLowerCase().startsWith('tell') ||
      sentence.toLowerCase().startsWith('give') ||
      sentence.toLowerCase().startsWith('make') ||
      sentence.toLowerCase().startsWith('show'),
    );
    
    // Use NLP to detect emotional context
    const emotionalKeywords = ['bored', 'sad', 'down', 'need cheering', 'cheer me up'];
    const hasEmotionalContext = emotionalKeywords.some(keyword => lowerText.includes(keyword));
    
    // Use NLP token analysis for better understanding
    const tokenTypes = doc.tokens().out(its.type, as.freqTable);
    const hasActionWords = tokenTypes.some(([type, count]) => 
      (type === 'verb' && count > 0) || (type === 'imperative' && count > 0),
    );
    
    // Comprehensive intent classification
    const isJokeIntent = jokePatterns.some(pattern => lowerText.includes(pattern)) ||
                        hasQuestionPattern ||
                        hasImperativePattern ||
                        hasEmotionalContext ||
                        hasActionWords;
    
    console.log('NLP Intent Classification:', {
      text: text,
      tokens: tokens,
      sentences: sentences,
      entities: entities,
      tokenTypes: tokenTypes,
      hasQuestionPattern,
      hasImperativePattern,
      hasEmotionalContext,
      hasActionWords,
      isJokeIntent,
    });
    
    return isJokeIntent;
    
  } catch (error) {
    console.warn('NLP processing failed, falling back to enhanced keyword matching:', error);
    return classifyIntentFallback(text);
  }
}

// Enhanced fallback intent classification for when NLP isn't available
function classifyIntentFallback(text) {
  const lowerText = text.toLowerCase();
  const jokeKeywords = [
    'joke', 'funny', 'laugh', 'make me laugh', 'tell me something funny',
    'humor', 'hilarious', 'amusing', 'entertaining', 'comedy', 'pun',
    'wit', 'sarcasm', 'satire', 'anecdote', 'story',
  ];
  
  // Enhanced pattern matching
  const hasJokeKeyword = jokeKeywords.some(keyword => lowerText.includes(keyword));
  const hasQuestionPattern = lowerText.includes('?') && (
    lowerText.includes('tell') || 
    lowerText.includes('give') || 
    lowerText.includes('can you') ||
    lowerText.includes('would you')
  );
  const hasImperativePattern = lowerText.startsWith('tell') || 
                              lowerText.startsWith('give') || 
                              lowerText.startsWith('make') ||
                              lowerText.startsWith('show');
  const hasEmotionalContext = ['bored', 'sad', 'down', 'need cheering', 'cheer me up']
    .some(keyword => lowerText.includes(keyword));
  
  return hasJokeKeyword || hasQuestionPattern || hasImperativePattern || hasEmotionalContext;
}

// Helper: Detect if user is asking for a joke - now using the hybrid architecture
function isJokeIntent(text) {
  return classifyUserIntent(text);
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
    const selectedModel = modelSelection ? modelSelection.value : 'Llama-3-8B-Instruct-q4f32_1-MLC-1k';
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
          nlpInstance: !!window.nlpInstance,
          its: !!window.its,
          as: !!window.as,
          scriptErrors: window.scriptErrors || [],
          scriptsLoaded: window.scriptsLoaded || {},
        });
      }
      
      if (window.nlpInstance && window.its && window.as) {
        console.log('All required NLP libraries are now available');
        resolve(true);
      } else if (attempts >= maxAttempts) {
        console.warn('Timeout waiting for NLP libraries, proceeding with fallback');
        console.log('Final library status:', {
          nlpInstance: !!window.nlpInstance,
          its: !!window.its,
          as: !!window.as,
          scriptErrors: window.scriptErrors || [],
          scriptsLoaded: window.scriptsLoaded || {},
        });
        
        // Provide specific guidance based on what failed
        if (!window.nlpInstance) {
          console.error('winkNLP instance failed to load. Check network connectivity and CDN availability.');
        }
        if (!window.its) {
          console.error('winkNLP its helper failed to load. This is required for NLP functionality.');
        }
        if (!window.as) {
          console.error('winkNLP as helper failed to load. This is required for NLP functionality.');
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
  console.log('DOM loaded, starting hybrid architecture initialization...');
  
  // Enable UI immediately - don't wait for model loading
  userInput.disabled = false;
  chatForm.querySelector('button').disabled = false;
  
  updateLoadingStatus('Loading NLP libraries for intent classification...');
  
  // Wait for CDN libraries to load
  console.log('Waiting for NLP libraries for hybrid architecture...');
  const librariesLoaded = await waitForLibraries();
  console.log('NLP library loading result:', librariesLoaded);
  
  // Initialize NLP for the hybrid architecture
  if (librariesLoaded && initializeNLP()) {
    console.log('NLP libraries loaded successfully for hybrid architecture');
    updateLoadingStatus('NLP ready for intent classification - AI model loading in background...');
    if (modelStatus) {
      modelStatus.textContent = 'NLP + Loading AI...';
    }
    
    // Show welcome message with NLP confirmation
    let welcomeMessage = 'Hello! I\'m JokeBot 🤖 with advanced NLP intent classification! Ask me for a joke about any topic!';
    welcomeMessage += ' (AI model loading in background for joke generation - will be available soon!)';
    appendMessage('bot', welcomeMessage);
    
  } else {
    console.log('Failed to initialize NLP, using fallback mode for intent classification');
    updateLoadingStatus('Fallback intent classification - AI model loading in background...');
    if (modelStatus) {
      modelStatus.textContent = 'Fallback + Loading AI...';
    }
    
    // Show welcome message with fallback confirmation
    let welcomeMessage = 'Hello! I\'m JokeBot 🤖 with fallback intent classification! Ask me for a joke about any topic!';
    welcomeMessage += ' (AI model loading in background for joke generation - will be available soon!)';
    appendMessage('bot', welcomeMessage);
  }
  
  // Hide loading indicator and show chat immediately
  hideLoadingIndicator();
  
  // Load WebLLM in background (non-blocking) - this is the heavy part of the hybrid architecture
  console.log('Starting WebLLM background loading for joke generation...');
  
  // Show background loading message
  appendMessage('bot', '⏳ Loading AI model in background for joke generation... This may take a few minutes.');
  
  loadWebLLMInBackground();
});

// Load WebLLM in background without blocking UI - this is the heavy part of the hybrid architecture
async function loadWebLLMInBackground() {
  // Create a progress message that we'll update
  const progressMsg = appendMessage('bot', '🔄 Initializing AI model for joke generation...');
  
  try {
    console.log('Background: Starting WebLLM initialization for joke generation...');
    
    // Update status to show background loading
    if (modelStatus) {
      const currentText = modelStatus.textContent;
      if (currentText.includes('Loading AI...')) {
        modelStatus.textContent = currentText.replace('Loading AI...', 'AI Loading...');
      }
    }
    
    // Set up progress tracking
    let lastProgress = 0;
    const progressInterval = setInterval(() => {
      if (progressMsg && lastProgress < 90) {
        lastProgress += Math.random() * 10;
        progressMsg.textContent = `🔄 Initializing AI model for joke generation... ${Math.round(lastProgress)}%`;
      }
    }, 2000);
    
    await loadWebLLM();
    
    // Clear progress interval
    clearInterval(progressInterval);
    
    // Model loaded successfully - update UI
    if (webllmLoaded) {
      console.log('Background: WebLLM loaded successfully for joke generation');
      
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
      appendMessage('bot', '🎉 AI model is now ready for joke generation! You can now get AI-generated jokes!');
      
      // Update loading status
      updateLoadingStatus('AI model ready for joke generation!');
      
    } else {
      console.log('Background: WebLLM failed to load');
      if (modelStatus) {
        modelStatus.textContent = nlp ? 'NLP Only' : 'Fallback Only';
      }
      updateLoadingStatus('AI model failed to load - using fallback mode for joke generation');
      
      // Update the loading message to show failure
      if (progressMsg) {
        progressMsg.textContent = '❌ AI model failed to load. Using fallback mode for joke generation.';
      }
    }
    
  } catch (error) {
    console.error('Background: WebLLM loading failed:', error);
    if (modelStatus) {
      modelStatus.textContent = nlp ? 'NLP Only' : 'Fallback Only';
    }
    updateLoadingStatus('AI model failed to load - using fallback mode for joke generation');
    
    // Update the loading message to show failure
    if (progressMsg) {
      progressMsg.textContent = '❌ AI model failed to load. Using fallback mode for joke generation.';
    }
    
    appendMessage('bot', '⚠️ AI model failed to load. You can still use fallback jokes!');
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
      return '🤔 AI model is still loading in the background. Please wait a moment and try again, or I can tell you a fallback joke instead!';
    }
    return null;
  }
  
  const messages = [
    {
      content: 'You are a helpful, family-friendly chatbot that tells jokes. Keep responses short and funny.',
      role: 'system',
    },
    {
      content: `Tell me a joke about: ${userText}`,
      role: 'user',
    },
  ];
  
  try {
    console.log('Generating joke with WebLLM...');
    
    // Use the streaming API for better user experience
    let curMessage = '';
    const completion = await webllmEngine.chat.completions.create({
      stream: true,
      messages,
      max_tokens: 100,
      temperature: 0.8,
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
  if (!text) {return;}
  
  // Check for status command
  if (text.toLowerCase().includes('status') || text.toLowerCase().includes('loading')) {
    let statusMessage = '📊 Hybrid Architecture Status:\n';
    statusMessage += `• Intent Classification (NLP): ${nlp ? '✅ winkNLP Ready' : '❌ Fallback Mode'}\n`;
    statusMessage += `• Joke Generation (AI): ${webllmLoaded ? '✅ WebLLM Ready' : '⏳ Loading...'}\n`;
    
    if (modelStatus) {
      statusMessage += `• Overall Status: ${modelStatus.textContent}`;
    }
    
    // Add architecture explanation
    statusMessage += '\n\n🏗️ Architecture:\n';
    statusMessage += '• Lightweight NLP for instant intent classification\n';
    statusMessage += '• Heavy WebLLM only for joke generation\n';
    statusMessage += '• Responsive UX with background AI loading';
    
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
  
  // Step 1: Use lightweight NLP for intent classification (hybrid architecture)
  if (isJokeIntent(text)) {
    console.log('Intent classified as joke request - proceeding to joke generation');
    
    // Step 2: Only activate heavy WebLLM for joke generation after intent confirmation
    if (webllmLoaded && webllmEngine) {
      console.log('Using WebLLM for joke generation (hybrid architecture)');
      response = await getWebLLMJoke(text);
    } else {
      console.log('WebLLM not ready, using fallback jokes (hybrid architecture fallback)');
      response = fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
    }
  } else {
    // Not a joke intent - provide helpful guidance
    response = 'I\'m here to tell jokes! Ask me for a joke about any topic. I use advanced NLP to understand your intent and AI to generate creative jokes.';
  }

  hideTypingIndicator();
  appendMessage('bot', response);
  chatForm.querySelector('button').disabled = false;
  userInput.disabled = false;
  userInput.focus();
});
