const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'treasure-hunt-secret-key';

app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173'] }));
app.use(express.json());

function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Register
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  if (username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.status(409).json({ error: 'Username already taken' });
  }

  const password_hash = bcrypt.hashSync(password, 10);
  const { lastInsertRowid } = db.prepare(
    'INSERT INTO users (username, password_hash) VALUES (?, ?)'
  ).run(username, password_hash);

  const token = jwt.sign({ id: lastInsertRowid, username }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, username });
});

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username: user.username });
});

// Save score
app.post('/api/scores', authenticateToken, (req, res) => {
  const { score, result } = req.body;

  if (typeof score !== 'number' || !['win', 'loss', 'tie'].includes(result)) {
    return res.status(400).json({ error: 'Invalid score or result' });
  }

  db.prepare('INSERT INTO scores (user_id, score, result) VALUES (?, ?, ?)').run(
    req.user.id, score, result
  );
  res.status(201).json({ ok: true });
});

// Get current user's score history
app.get('/api/scores/me', authenticateToken, (req, res) => {
  const scores = db.prepare(
    'SELECT score, result, played_at FROM scores WHERE user_id = ? ORDER BY played_at DESC LIMIT 20'
  ).all(req.user.id);
  res.json(scores);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
