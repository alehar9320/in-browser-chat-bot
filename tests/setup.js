// Test setup file for Jest
const jestDom = require('@testing-library/jest-dom');

// Mock WebLLM for testing
global.webllm = {
  MLCEngine: jest.fn().mockImplementation(() => ({
    setInitProgressCallback: jest.fn(),
    reload: jest.fn().mockResolvedValue(true),
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          [Symbol.asyncIterator]: async function* () {
            yield { choices: [{ delta: { content: 'Test joke' } }] };
          },
        }),
      },
    },
    getMessage: jest.fn().mockResolvedValue('Test joke'),
  })),
  prebuiltAppConfig: {
    model_list: [
      { model_id: 'test-model-1' },
      { model_id: 'test-model-2' },
    ],
  },
};

// Mock winkNLP
global.winkNLP = jest.fn().mockReturnValue({
  readDoc: jest.fn().mockReturnValue({
    tokens: jest.fn().mockReturnValue({
      out: jest.fn().mockReturnValue(['test', 'joke']),
      filter: jest.fn().mockReturnValue({
        out: jest.fn().mockReturnValue(['joke']),
      }),
    }),
    sentences: jest.fn().mockReturnValue({
      out: jest.fn().mockReturnValue(['Tell me a joke']),
    }),
    entities: jest.fn().mockReturnValue({
      out: jest.fn().mockReturnValue([]),
    }),
  }),
  its: {
    pos: 'NOUN',
    detail: 'detail',
  },
  as: {
    freqTable: 'freqTable',
  },
});

// Mock console methods in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
