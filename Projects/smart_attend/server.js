// server.js
// This is the entry point of our backend - the very first
// file that runs when we start the server

const express = require('express');
const cors = require('cors');

// Create our Express application
const app = express();

// Middleware - these run on EVERY request before reaching our routes
app.use(cors());           // Allows Flutter app to talk to this server
app.use(express.json());   // Allows server to understand JSON data

// A simple test route - if this works, our server is alive
app.get('/', (req, res) => {
  res.json({ message: 'SmartAttend backend is running! 🚀' });
});

// Start the server on port 5000
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});