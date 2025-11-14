const express = require('express');
const db = require('../db');
const authenticateToken = require('./authenticateToken');
const router = express.Router();

// Get all conversations for user
router.get('/', authenticateToken, (req, res) => {
  db.all(`SELECT DISTINCT u.id, u.username, u.avatar FROM users u
    JOIN messages m ON (u.id = m.sender_id OR u.id = m.receiver_id)
    WHERE (m.sender_id = ? OR m.receiver_id = ?) AND u.id != ?`,
    [req.user.id, req.user.id, req.user.id], (err, users) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(users);
  });
});

// Get messages with a user
router.get('/:id', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at ASC`,
    [req.user.id, req.params.id, req.params.id, req.user.id], (err, messages) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(messages);
  });
});

// Send message
router.post('/:id', authenticateToken, (req, res) => {
  const { content } = req.body;
  db.run('INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)', [req.user.id, req.params.id, content], function(err) {
    if (err) return res.status(400).json({ error: 'Erreur lors de l\'envoi du message' });
    res.json({ id: this.lastID, sender_id: req.user.id, receiver_id: req.params.id, content });
  });
});

module.exports = router;
