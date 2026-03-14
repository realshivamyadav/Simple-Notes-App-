const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const dbPath = path.join(__dirname, 'db.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Function to read data from db.json
const readDb = () => {
  const dbRaw = fs.readFileSync(dbPath);
  return JSON.parse(dbRaw);
};

// Function to write data to db.json
const writeDb = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

app.get('/', (req, res) => {
  res.send('API is running...');
});

const JWT_SECRET = 'your-super-secret-key-that-should-be-in-an-env-file';

// Auth middleware
const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Token is not valid' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Signup route
app.post('/api/auth/signup', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const db = readDb();
    const existingUser = db.users.find(user => user.username === username);

    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: db.users.length > 0 ? db.users[db.users.length - 1].id + 1 : 1,
      username,
      password: hashedPassword,
    };

    db.users.push(newUser);
    writeDb(db);

    res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const db = readDb();
    const user = db.users.find(u => u.username === username);

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const payload = {
      user: {
        id: user.id,
        username: user.username
      }
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Notes routes
app.get('/api/notes', auth, (req, res) => {
  try {
    const db = readDb();
    const userNotes = db.notes.filter(note => note.userId === req.user.id);
    res.json(userNotes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/notes', auth, (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ message: 'Note content is required.' });
  }

  try {
    const db = readDb();
    const newNote = {
      id: db.notes.length > 0 ? db.notes[db.notes.length - 1].id + 1 : 1,
      userId: req.user.id,
      content,
      createdAt: new Date().toISOString(),
    };
    db.notes.push(newNote);
    writeDb(db);
    res.status(201).json(newNote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/notes/:id', auth, (req, res) => {
  const noteId = parseInt(req.params.id);
  try {
    const db = readDb();
    const noteIndex = db.notes.findIndex(note => note.id === noteId);

    if (noteIndex === -1) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    if (db.notes[noteIndex].userId !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized.' });
    }

    db.notes.splice(noteIndex, 1);
    writeDb(db);

    res.json({ message: 'Note deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Profile route
app.get('/api/profile', auth, (req, res) => {
  try {
    const db = readDb();
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Don't send the password hash
    const { password, ...userProfile } = user;
    res.json(userProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
