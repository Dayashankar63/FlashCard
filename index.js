const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const dataFile = path.join(__dirname, 'data', 'flashcards.json');
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 0;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

function loadData() {
  if (!fs.existsSync(dataFile)) {
    return { decks: [], users: [] };
  }
  const raw = fs.readFileSync(dataFile, 'utf8');
  const data = raw ? JSON.parse(raw) : { decks: [], users: [] };
  return {
    decks: Array.isArray(data.decks) ? data.decks : [],
    users: Array.isArray(data.users) ? data.users : []
  };
}

function saveData(data) {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function findUserByEmail(data, email) {
  return data.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

app.get('/api/decks', (req, res) => {
  const data = loadData();
  const { userId } = req.query;
  if (userId) {
    return res.json(data.decks.filter((deck) => deck.userId === userId));
  }
  res.json(data.decks);
});

app.get('/api/decks/:deckId', (req, res) => {
  const data = loadData();
  const deck = data.decks.find((item) => item.id === req.params.deckId);
  if (!deck) return res.status(404).json({ error: 'Deck not found' });
  res.json(deck);
});

app.post('/api/decks', (req, res) => {
  const data = loadData();
  const { name, description, userId } = req.body;
  if (!name) return res.status(400).json({ error: 'Deck name is required' });
  const newDeck = {
    id: generateId(),
    name,
    description: description || '',
    userId: userId || 'guest',
    cards: []
  };
  data.decks.push(newDeck);
  saveData(data);
  res.status(201).json(newDeck);
});

app.put('/api/decks/:deckId', (req, res) => {
  const data = loadData();
  const deck = data.decks.find((item) => item.id === req.params.deckId);
  if (!deck) return res.status(404).json({ error: 'Deck not found' });
  const { name, description } = req.body;
  if (name) deck.name = name;
  if (description !== undefined) deck.description = description;
  saveData(data);
  res.json(deck);
});

app.delete('/api/decks/:deckId', (req, res) => {
  const data = loadData();
  const index = data.decks.findIndex((item) => item.id === req.params.deckId);
  if (index === -1) return res.status(404).json({ error: 'Deck not found' });
  const [deleted] = data.decks.splice(index, 1);
  saveData(data);
  res.json(deleted);
});

app.get('/api/decks/:deckId/cards', (req, res) => {
  const data = loadData();
  const deck = data.decks.find((item) => item.id === req.params.deckId);
  if (!deck) return res.status(404).json({ error: 'Deck not found' });
  res.json(deck.cards);
});

app.get('/api/decks/:deckId/cards/:cardId', (req, res) => {
  const data = loadData();
  const deck = data.decks.find((item) => item.id === req.params.deckId);
  if (!deck) return res.status(404).json({ error: 'Deck not found' });
  const card = deck.cards.find((item) => item.id === req.params.cardId);
  if (!card) return res.status(404).json({ error: 'Card not found' });
  res.json(card);
});

app.post('/api/decks/:deckId/cards', (req, res) => {
  const data = loadData();
  const deck = data.decks.find((item) => item.id === req.params.deckId);
  if (!deck) return res.status(404).json({ error: 'Deck not found' });
  const { question, answer, difficulty, tags, reviewCount, correctCount, wrongCount, attempts, easeFactor, intervalDays, nextReview, lastReviewed, userId } = req.body;
  if (!question || !answer) return res.status(400).json({ error: 'Question and answer are required' });
  const newCard = {
    id: generateId(),
    question,
    answer,
    difficulty: difficulty || 'medium',
    tags: Array.isArray(tags) ? tags : [],
    reviewCount: reviewCount || 0,
    correctCount: correctCount || 0,
    wrongCount: wrongCount || 0,
    attempts: attempts || 0,
    easeFactor: easeFactor || 2.5,
    intervalDays: intervalDays || 1,
    nextReview: nextReview || new Date().toISOString(),
    lastReviewed: lastReviewed || null,
    userId: userId || deck.userId || 'guest'
  };
  deck.cards.push(newCard);
  saveData(data);
  res.status(201).json(newCard);
});

app.put('/api/decks/:deckId/cards/:cardId', (req, res) => {
  const data = loadData();
  const deck = data.decks.find((item) => item.id === req.params.deckId);
  if (!deck) return res.status(404).json({ error: 'Deck not found' });
  const card = deck.cards.find((item) => item.id === req.params.cardId);
  if (!card) return res.status(404).json({ error: 'Card not found' });
  const { question, answer, difficulty, tags, reviewCount, correctCount, wrongCount, attempts, easeFactor, intervalDays, nextReview, lastReviewed } = req.body;
  if (question !== undefined) card.question = question;
  if (answer !== undefined) card.answer = answer;
  if (difficulty !== undefined) card.difficulty = difficulty;
  if (tags !== undefined) card.tags = Array.isArray(tags) ? tags : card.tags;
  if (reviewCount !== undefined) card.reviewCount = reviewCount;
  if (correctCount !== undefined) card.correctCount = correctCount;
  if (wrongCount !== undefined) card.wrongCount = wrongCount;
  if (attempts !== undefined) card.attempts = attempts;
  if (easeFactor !== undefined) card.easeFactor = easeFactor;
  if (intervalDays !== undefined) card.intervalDays = intervalDays;
  if (nextReview !== undefined) card.nextReview = nextReview;
  if (lastReviewed !== undefined) card.lastReviewed = lastReviewed;
  saveData(data);
  res.json(card);
});

app.delete('/api/decks/:deckId/cards/:cardId', (req, res) => {
  const data = loadData();
  const deck = data.decks.find((item) => item.id === req.params.deckId);
  if (!deck) return res.status(404).json({ error: 'Deck not found' });
  const index = deck.cards.findIndex((item) => item.id === req.params.cardId);
  if (index === -1) return res.status(404).json({ error: 'Card not found' });
  const [deleted] = deck.cards.splice(index, 1);
  saveData(data);
  res.json(deleted);
});

app.post('/api/auth/signup', (req, res) => {
  const data = loadData();
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  if (findUserByEmail(data, email)) return res.status(409).json({ error: 'User already exists' });
  const newUser = { id: generateId(), email, password };
  data.users.push(newUser);
  saveData(data);
  res.status(201).json({ id: newUser.id, email: newUser.email });
});

app.post('/api/auth/login', (req, res) => {
  const data = loadData();
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  const user = findUserByEmail(data, email);
  if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ id: user.id, email: user.email });
});

app.post('/api/generate-questions', (req, res) => {
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ error: 'Topic is required' });
  const prompt = topic.trim();
  const cards = [
    {
      question: `What is ${prompt}?`,
      answer: `${prompt} is a concept that helps you understand the essential components of ${prompt}.`,
      difficulty: 'medium',
      tags: [prompt]
    },
    {
      question: `How do you apply ${prompt} in practice?`,
      answer: `You apply ${prompt} by breaking it down into practical steps and testing each part separately.`,
      difficulty: 'hard',
      tags: [prompt]
    },
    {
      question: `Why is ${prompt} important?`,
      answer: `${prompt} is important because it helps you solve problems more efficiently and learn faster.`,
      difficulty: 'easy',
      tags: [prompt]
    }
  ];
  res.json({ cards });
});

app.post('/api/explain', (req, res) => {
  const { question, answer } = req.body;
  if (!question || !answer) return res.status(400).json({ error: 'Question and answer are required' });
  res.send(`Answer explanation: ${answer} is the correct response to "${question}" because it captures the main concept, reinforces the key terms, and links them to a practical example.`);
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const server = app.listen(PORT, () => {
  const actualPort = server.address().port;
  console.log(`Flashcard backend running on http://localhost:${actualPort}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    if (process.env.PORT) {
      console.error(`Port ${PORT} is already in use. Use a different port with PORT=your_port npm start or stop the process using port ${PORT}.`);
    } else {
      console.error('Unable to bind the server. Please set PORT to an available port and try again.');
    }
    process.exit(1);
  }
  throw err;
});
