// Import necessary packages
const express = require('express');
const cors = require('cors');
const winkNLP = require('wink-nlp');
const model = require('wink-eng-lite-web-model');
const nlp = winkNLP(model);

// Import necessary functions from wink-nlp
const {
    its,
    as
} = nlp;

// Create an Express app
const app = express();
const port = 3000;

// Middleware:
// Enable CORS to allow your front-end (running on a different port) to communicate with the server.
app.use(cors());
// Allow the server to read JSON data from incoming requests.
app.use(express.json());

// Create a POST endpoint for text analysis
app.post('/analyze', (req, res) => {
    try {
        const text = req.body.text;
        
        if (!text) {
            return res.status(400).json({ error: 'Text input is required.' });
        }
        
        // Analyze the text with winkNLP
        const doc = nlp.readDoc(text);

        // Example analysis:
        // 1. Count the number of sentences.
        const sentenceCount = doc.sentences().out().length;

        // 2. Extract keywords (real nouns)
        const nouns = doc.tokens().filter(its.pos, 'NOUN').out();

        // 3. Extract entities (e.g., dates, places, people)
        const entities = doc.entities().out();
        
        // Send back the result as JSON
        res.json({
            originalText: text,
            sentenceCount: sentenceCount,
            nouns: nouns,
            entities: entities,
            message: 'Analysis successful!'
        });

    } catch (error) {
        console.error('Analysis failed:', error);
        res.status(500).json({ error: 'A server error occurred.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});