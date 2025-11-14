require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/messages', require('./routes/messages'));

app.get('/', (req, res) => {
  res.send('Oryzo Mini Réseau Social API');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
