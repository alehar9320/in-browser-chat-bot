const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const loading = document.getElementById('loading');

let modelLoaded = false;
let llm = null;
const modelStatus = document.getElementById('model-status');

let fallbackJokes = [];
let fallbackJokesLoaded = false;

// Notify when Transformers.js is loaded (for loading indicator)
if (window.transformers) {
  window.dispatchEvent(new Event('transformersLoaded'));
} else {
  const checkTransformers = setInterval(() => {
    if (window.transformers) {
      window.dispatchEvent(new Event('transformersLoaded'));
      clearInterval(checkTransformers);
    }
  }, 50);
}

async function loadFallbackJokes() {
  if (!fallbackJokesLoaded) {
    const module = await import('./fallbackJokes.js');
    fallbackJokes = module.fallbackJokes;
    fallbackJokesLoaded = true;
  }
}

async function loadLLM() {
  modelStatus.textContent = 'Loading model...';
  try {
    if (window.transformers && window.transformers.env) {
      window.transformers.env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.13.0/dist/wasm/';
      await window.transformers.setBackend('wasm');
    }
    llm = await window.transformers.pipeline('text-generation', 'Xenova/tinyllama-1.1b-chat-v1.0');
    modelLoaded = true;
    modelStatus.textContent = 'Model ready!';
  } catch (e) {
    modelStatus.textContent = 'Model failed to load. Using fallback.';
    modelLoaded = false;
    console.error('LLM load error:', e);
  }
}

// Call loadLLM and loadFallbackJokes on page load
window.addEventListener('DOMContentLoaded', async () => {
  await loadFallbackJokes();
  await loadLLM();
  appendMessage('bot', "Hello! I'm JokeBot 🤖. Ask me for a joke about any topic, and I'll do my best to make you laugh!");
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

async function getLLMJoke(userText) {
  if (!llm) return null;
  const prompt = `You are a helpful, family-friendly chatbot that tells jokes. If the user asks for a joke about a specific topic, generate a short joke about that topic. If the topic is unclear, tell a general joke.\nUser: ${userText}\nJokeBot:`;
  try {
    const output = await llm(prompt, { max_new_tokens: 48 });
    if (output && output.length && output[0].generated_text) {
      let joke = output[0].generated_text.replace(prompt, '').trim();
      joke = joke.split('\n')[0].trim();
      if (!joke) joke = fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
      return joke;
    }
  } catch (e) {
    console.error('LLM generation error:', e);
    return fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
  }
  return fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await loadFallbackJokes(); // Ensure fallbackJokes are loaded before use
  const text = userInput.value.trim();
  if (!text) return;
  appendMessage('user', text);
  userInput.value = '';

  showTypingIndicator();
  chatForm.querySelector('button').disabled = true;
  userInput.disabled = true;

  let response = '';
  if (modelLoaded && llm) {
    response = await getLLMJoke(text);
  } else {
    response = fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
  }

  hideTypingIndicator();
  appendMessage('bot', response);
  chatForm.querySelector('button').disabled = false;
  userInput.disabled = false;
  userInput.focus();
});
