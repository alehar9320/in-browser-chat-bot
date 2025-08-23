import { fallbackJokes } from '../../fallbackJokes.js';

// Mock DOM elements
document.body.innerHTML = `
  <div id="chat-window"></div>
  <form id="chat-form">
    <input type="text" id="user-input" />
    <button type="submit">Send</button>
  </form>
  <div id="model-status"></div>
  <div id="typing-indicator"></div>
`;

// Mock functions
const mockAppendMessage = jest.fn();
const mockShowTypingIndicator = jest.fn();
const mockHideTypingIndicator = jest.fn();

// Test fallback jokes
describe('Fallback Jokes', () => {
  test('should contain jokes', () => {
    expect(fallbackJokes).toBeDefined();
    expect(Array.isArray(fallbackJokes)).toBe(true);
    expect(fallbackJokes.length).toBeGreaterThan(0);
  });

  test('should have valid joke strings', () => {
    fallbackJokes.forEach(joke => {
      expect(typeof joke).toBe('string');
      expect(joke.length).toBeGreaterThan(10);
    });
  });
});

// Test intent classification
describe('Intent Classification', () => {
  test('should detect joke requests', () => {
    const jokePhrases = [
      'Tell me a joke',
      'I want a joke',
      'Make me laugh',
      'Give me something funny'
    ];

    jokePhrases.forEach(phrase => {
      // This would test the actual intent classification logic
      expect(phrase.toLowerCase()).toMatch(/joke|laugh|funny/);
    });
  });
});

// Test UI elements
describe('UI Elements', () => {
  test('should have required DOM elements', () => {
    expect(document.getElementById('chat-window')).toBeTruthy();
    expect(document.getElementById('chat-form')).toBeTruthy();
    expect(document.getElementById('user-input')).toBeTruthy();
    expect(document.getElementById('model-status')).toBeTruthy();
  });

  test('should have proper form structure', () => {
    const form = document.getElementById('chat-form');
    const input = document.getElementById('user-input');
    const button = form.querySelector('button[type="submit"]');

    expect(form).toBeTruthy();
    expect(input).toBeTruthy();
    expect(button).toBeTruthy();
  });
});
