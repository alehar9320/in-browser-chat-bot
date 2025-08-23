const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const loading = document.getElementById('loading');

let modelLoaded = false;

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

function simulateModelLoading() {
  loading.style.display = 'block';
  chatForm.querySelector('button').disabled = true;
  userInput.disabled = true;
  return new Promise(resolve => {
    setTimeout(() => {
      loading.style.display = 'none';
      modelLoaded = true;
      chatForm.querySelector('button').disabled = false;
      userInput.disabled = false;
      userInput.focus();
      appendMessage('bot', "Hello! I'm JokeBot. Ask me for a joke about any topic!");
      resolve();
    }, 1500);
  });
}

function getJokeResponse(userText) {
  const text = userText.toLowerCase();
  if (/animal|cat|dog|fish|cow|chicken|bird/.test(text)) {
    return jokes.animal[Math.floor(Math.random() * jokes.animal.length)];
  }
  if (/tech|computer|programmer|code|smartphone|phone|internet|software|hardware/.test(text)) {
    return jokes.tech[Math.floor(Math.random() * jokes.tech.length)];
  }
  if (/joke|funny|laugh|another|more/.test(text)) {
    return jokes.general[Math.floor(Math.random() * jokes.general.length)];
  }
  // If user asks for a joke about a specific topic, but we don't have it
  if (/about|on|regarding|related to/.test(text)) {
    return "I don't have a joke about that topic, but here's one: " + jokes.general[Math.floor(Math.random() * jokes.general.length)];
  }
  return "I'm here to tell jokes! Just ask me for a joke about any topic.";
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = userInput.value.trim();
  if (!text) return;
  appendMessage('user', text);
  userInput.value = '';

  if (!modelLoaded) {
    await simulateModelLoading();
    return;
  }

  showTypingIndicator();
  chatForm.querySelector('button').disabled = true;
  userInput.disabled = true;

  setTimeout(() => {
    hideTypingIndicator();
    const response = getJokeResponse(text);
    appendMessage('bot', response);
    chatForm.querySelector('button').disabled = false;
    userInput.disabled = false;
    userInput.focus();
  }, 1000);
});
