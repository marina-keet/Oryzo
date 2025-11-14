const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

// Register
router.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'Champs requis manquants' });
  const hash = bcrypt.hashSync(password, 10);
  db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hash], function(err) {
    if (err) return res.status(400).json({ error: 'Utilisateur ou email déjà utilisé' });
    const token = jwt.sign({ id: this.lastID }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user: { id: this.lastID, username, email } });
  });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'Email ou mot de passe incorrect' });
    if (!bcrypt.compareSync(password, user.password)) return res.status(400).json({ error: 'Email ou mot de passe incorrect' });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  });
});

module.exports = router;
