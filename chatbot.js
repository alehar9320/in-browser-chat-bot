const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const loading = document.getElementById('loading');

let modelLoaded = false;
let llm = null;
const modelStatus = document.getElementById('model-status');

async function loadLLM() {
  modelStatus.textContent = 'Loading model...';
  try {
    // Ensure the backend is set to 'wasm' for browser compatibility
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

// Call loadLLM on page load
window.addEventListener('DOMContentLoaded', () => {
  loadLLM();
  appendMessage('bot', "Hello! I'm JokeBot 🤖. Ask me for a joke about any topic, and I'll do my best to make you laugh!");
});

const jokes = {
  general: [
    "Why don't scientists trust atoms? Because they make up everything!",
    "Why did the scarecrow win an award? Because he was outstanding in his field!",
    "Why did the math book look sad? Because it had too many problems!",
    "Why did the bicycle fall over? Because it was two-tired!",
    "Why can't you give Elsa a balloon? Because she will let it go!"
  ],
  animal: [
    "Why do cows have hooves instead of feet? Because they lactose!",
    "What do you call a fish wearing a bowtie? Sofishticated.",
    "Why did the chicken join a band? Because it had the drumsticks!"
  ],
  tech: [
    "Why do programmers prefer dark mode? Because light attracts bugs!",
    "Why was the computer cold? It left its Windows open!",
    "Why did the smartphone need glasses? Because it lost its contacts!"
  ]
};

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

const fallbackJokes = [
  "Why don't scientists trust atoms? Because they make up everything!",
  "Why did the scarecrow win an award? Because he was outstanding in his field!",
  "Why did the math book look sad? Because it had too many problems!",
  "Why did the bicycle fall over? Because it was two-tired!",
  "Why can't you give Elsa a balloon? Because she will let it go!"
];

async function getLLMJoke(userText) {
  if (!llm) return null;
  // Enhanced prompt for intent-based joke generation
  const prompt = `You are a helpful, family-friendly chatbot that tells jokes. If the user asks for a joke about a specific topic, generate a short joke about that topic. If the topic is unclear, tell a general joke.\nUser: ${userText}\nJokeBot:`;
  try {
    const output = await llm(prompt, { max_new_tokens: 48 });
    if (output && output.length && output[0].generated_text) {
      let joke = output[0].generated_text.replace(prompt, '').trim();
      // Remove any trailing incomplete sentences
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
    // Fallback to static joke
    response = fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
  }

  hideTypingIndicator();
  appendMessage('bot', response);
  chatForm.querySelector('button').disabled = false;
  userInput.disabled = false;
  userInput.focus();
});
