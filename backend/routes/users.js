const express = require('express');
const db = require('../db');
const authenticateToken = require('./authenticateToken');
const router = express.Router();

// Get user profile
router.get('/:id', authenticateToken, (req, res) => {
  db.get('SELECT id, username, email, avatar, bio FROM users WHERE id = ?', [req.params.id], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  });
});

// Update user profile
router.put('/:id', authenticateToken, (req, res) => {
  if (parseInt(req.params.id) !== req.user.id) return res.status(403).json({ error: 'Non autorisé' });
  const { username, bio, avatar } = req.body;
  db.run('UPDATE users SET username = ?, bio = ?, avatar = ? WHERE id = ?', [username, bio, avatar, req.user.id], function(err) {
    if (err) return res.status(400).json({ error: 'Erreur lors de la mise à jour' });
    res.json({ success: true });
  });
});

module.exports = router;
