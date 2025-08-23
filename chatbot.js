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
    // Load DistilGPT2 model and tokenizer from Transformers.js
    llm = await window.transformers.pipeline('text-generation', 'Xenova/distilgpt2');
    modelLoaded = true;
    modelStatus.textContent = 'Model ready!';
  } catch (e) {
    modelStatus.textContent = 'Model failed to load. Using fallback.';
    modelLoaded = false;
  }
}

// Call loadLLM on page load
window.addEventListener('DOMContentLoaded', loadLLM);

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
  // Prompt engineering: steer the model to tell a joke
  const prompt = `Tell me a short, family-friendly joke about: ${userText}`;
  try {
    const output = await llm(prompt, { max_new_tokens: 40 });
    if (output && output.length && output[0].generated_text) {
      // Remove the prompt from the output if present
      let joke = output[0].generated_text.replace(prompt, '').trim();
      // If the model output is empty, fallback
      if (!joke) joke = fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
      return joke;
    }
  } catch (e) {
    // Fallback on error
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
