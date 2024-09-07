const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // To generate unique IDs

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes

// GET route for the notes page (notes.html)
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

// API route to get all saved notes from the db.json file
app.get('/api/notes', (req, res) => {
  fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8', (err, data) => {
    if (err) throw err;
    res.json(JSON.parse(data));
  });
});

// API route to save a new note to the db.json file
app.post('/api/notes', (req, res) => {
  const { title, text } = req.body;
  if (title && text) {
    const newNote = { id: uuidv4(), title, text };

    // Read the existing notes
    fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8', (err, data) => {
      if (err) throw err;
      const notes = JSON.parse(data);
      notes.push(newNote);

      // Write the updated notes back to the db.json file
      fs.writeFile(path.join(__dirname, 'db/db.json'), JSON.stringify(notes, null, 2), (err) => {
        if (err) throw err;
        res.json(newNote);
      });
    });
  } else {
    res.status(400).json({ error: 'Please provide a title and text for the note.' });
  }
});

// DELETE route to remove a note by ID from the db.json file
app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;

  fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8', (err, data) => {
    if (err) throw err;
    let notes = JSON.parse(data);
    notes = notes.filter(note => note.id !== id);

    // Write the updated notes back to the db.json file
    fs.writeFile(path.join(__dirname, 'db/db.json'), JSON.stringify(notes, null, 2), (err) => {
      if (err) throw err;
      res.json({ message: 'Note deleted successfully.' });
    });
  });
});

// Fallback route to return index.html for any unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
