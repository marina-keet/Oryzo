const express = require('express');
const multer = require('multer');
const db = require('../db');
const authenticateToken = require('./authenticateToken');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Get all posts
router.get('/', authenticateToken, (req, res) => {
  db.all(`SELECT posts.*, users.username, users.avatar FROM posts JOIN users ON posts.user_id = users.id ORDER BY posts.created_at DESC`, [], (err, posts) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(posts);
  });
});

// Create post (text or image)
router.post('/', authenticateToken, upload.single('image'), (req, res) => {
  const { content } = req.body;
  const image = req.file ? req.file.filename : null;
  db.run('INSERT INTO posts (user_id, content, image) VALUES (?, ?, ?)', [req.user.id, content, image], function(err) {
    if (err) return res.status(400).json({ error: 'Erreur lors de la création du post' });
    res.json({ id: this.lastID, user_id: req.user.id, content, image });
  });
});

// Like/unlike post
router.post('/:id/like', authenticateToken, (req, res) => {
  const postId = req.params.id;
  db.get('SELECT * FROM likes WHERE user_id = ? AND post_id = ?', [req.user.id, postId], (err, like) => {
    if (like) {
      db.run('DELETE FROM likes WHERE id = ?', [like.id], err2 => {
        if (err2) return res.status(500).json({ error: 'Erreur serveur' });
        res.json({ liked: false });
      });
    } else {
      db.run('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [req.user.id, postId], function(err2) {
        if (err2) return res.status(500).json({ error: 'Erreur serveur' });
        res.json({ liked: true });
      });
    }
  });
});

// Get comments for a post
router.get('/:id/comments', authenticateToken, (req, res) => {
  db.all('SELECT comments.*, users.username, users.avatar FROM comments JOIN users ON comments.user_id = users.id WHERE post_id = ? ORDER BY created_at ASC', [req.params.id], (err, comments) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(comments);
  });
});

// Add comment to a post
router.post('/:id/comments', authenticateToken, (req, res) => {
  const { content } = req.body;
  db.run('INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)', [req.user.id, req.params.id, content], function(err) {
    if (err) return res.status(400).json({ error: 'Erreur lors de l\'ajout du commentaire' });
    res.json({ id: this.lastID, user_id: req.user.id, post_id: req.params.id, content });
  });
});

module.exports = router;
