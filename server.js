// Importera nödvändiga paket
const express = require('express');
const cors = require('cors');
const winkNLP = require('wink-nlp');
const model = require('wink-eng-lite-web-model');
const nlp = winkNLP(model);

// Importera nödvändiga funktioner från wink-nlp
const {
    its,
    as
} = nlp;

// Skapa en Express-app
const app = express();
const port = 3000;

// Middleware:
// Aktivera CORS för att låta din front-end (som körs på en annan port) prata med servern.
app.use(cors());
// Tillåt servern att läsa JSON-data från inkommande förfrågningar.
app.use(express.json());

// Skapa en POST-endpoint för textanalys
app.post('/analyze', (req, res) => {
    try {
        const text = req.body.text;
        
        if (!text) {
            return res.status(400).json({ error: 'Text input is required.' });
        }
        
        // Analysera texten med winkNLP
        const doc = nlp.readDoc(text);

        // Exempel på analys:
        // 1. Räkna antalet meningar.
        const sentenceCount = doc.sentences().out().length;

        // 2. Extrahera nyckelord (verkliga substantiv)
        const nouns = doc.tokens().filter(its.pos, 'NOUN').out();

        // 3. Extrahera entiteter (t.ex. datum, platser, personer)
        const entities = doc.entities().out();
        
        // Skicka tillbaka resultatet som JSON
        res.json({
            originalText: text,
            sentenceCount: sentenceCount,
            nouns: nouns,
            entities: entities,
            message: 'Analys lyckades!'
        });

    } catch (error) {
        console.error('Analys misslyckades:', error);
        res.status(500).json({ error: 'Ett serverfel uppstod.' });
    }
});

// Starta servern
app.listen(port, () => {
    console.log(`Server körs på http://localhost:${port}`);
});