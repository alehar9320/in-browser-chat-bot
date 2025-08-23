import { fallbackJokes } from './fallbackJokes.js';

// winkNLP setup
import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model';
const nlp = winkNLP(model);
const its = nlp.its;
const as = nlp.as;

// WebLLM setup
let webllm = null;
let webllmLoaded = false;
let webllmEngine = null;

const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const modelStatus = document.getElementById('model-status');

// Helper: Detect if user is asking for a joke
function isJokeIntent(text) {
  const doc = nlp.readDoc(text);
  const tokens = doc.tokens().out(as.array);
  // Simple rule: look for 'joke' or 'funny' or 'make me laugh' etc.
  const jokeKeywords = ['joke', 'funny', 'laugh', 'make me laugh', 'tell me something funny'];
  const lowerText = text.toLowerCase();
  return jokeKeywords.some(keyword => lowerText.includes(keyword));
}

// WebLLM: Load Phi-3 Mini (3.8B)
async function loadWebLLM() {
  try {
    if (!window.webllm) throw new Error('WebLLM not loaded');
    webllmEngine = new window.webllm.LLM();
    await webllmEngine.reload('phi3-mini-4k-instruct-q4f16_1');
    webllmLoaded = true;
    if (modelStatus) modelStatus.textContent = 'Model ready!';
    console.log('WebLLM loaded: Phi-3 Mini');
  } catch (e) {
    webllmLoaded = false;
    if (modelStatus) modelStatus.textContent = 'Model failed to load.';
    console.error('WebLLM load error:', e);
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  userInput.disabled = true;
  chatForm.querySelector('button').disabled = true;
  await loadWebLLM();
  appendMessage('bot', "Hello! I'm JokeBot 🤖. Ask me for a joke about any topic, and I'll do my best to make you laugh!");
  userInput.disabled = false;
  chatForm.querySelector('button').disabled = false;
});

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
  if (!webllmLoaded || !webllmEngine) return null;
  const prompt = `You are a helpful, family-friendly chatbot that tells jokes. If the user asks for a joke about a specific topic, generate a short joke about that topic. If the topic is unclear, tell a general joke.\nUser: ${userText}\nJokeBot:`;
  try {
    const result = await webllmEngine.generate(prompt, { max_tokens: 48 });
    let joke = result.choices?.[0]?.text?.trim() || '';
    joke = joke.split('\n')[0].trim();
    if (!joke) joke = fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
    return joke;
  } catch (e) {
    console.error('WebLLM generation error:', e);
    return fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
  }
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = userInput.value.trim();
  if (!text) return;
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
