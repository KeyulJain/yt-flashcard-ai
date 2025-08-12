require('dotenv').config({ quiet: true });
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { OpenAI } = require('openai');

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 🛡️ Rate limiting middleware — apply early
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 requests per minute
});
app.use(limiter);

// 🔐 Secure CORS config (replace <your-extension-id> with actual extension ID)
const corsOptions = {
  origin: [
    'chrome-extension://<your-extension-id>',
    'moz-extension://*',
    'http://localhost:5050'
  ],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());

app.get('/', (req, res) => res.send('✅ API Live'));

app.post('/api/generate', async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript) return res.status(400).json({ error: 'Transcript is required' });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a flashcard generator. You ONLY extract flashcards directly from the provided transcript. 
Do NOT include trivia or unrelated facts. 
Respond with exactly 5 flashcards in this strict JSON format:
[
  {
    "question": "...",
    "answer": "...",
    "type": "basic"
  },
  ...
]`
        },
        {
          role: 'user',
          content: `Transcript:\n\n${transcript}`
        }
      ],
      max_tokens: 1000
    });

    let raw = completion.choices[0].message.content.trim();

    // 🧼 Clean markdown-style wrapping if present
    if (raw.startsWith('```json') || raw.startsWith('```')) {
      raw = raw.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
    }

    const flashcards = JSON.parse(raw);
    res.json({ flashcards });

  } catch (err) {
    console.error('[Flashcard Error]', err.message || err);
    res.status(500).json({
      error: 'AI response was not valid JSON',
      raw: err.raw || err.message || String(err)
    });
  }
});

app.listen(5050, () => console.log(`🚀 Flashcard API running at http://localhost:5050`));
