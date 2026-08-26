const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = Number(process.env.PORT || 5000);
const dataDirectory = path.join(__dirname, 'data');
const usersFile = path.join(dataDirectory, 'users.json');

app.use(cors());
app.use(express.json());

function readUsers() {
  fs.mkdirSync(dataDirectory, { recursive: true });
  if (!fs.existsSync(usersFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  } catch (error) {
    console.error('Could not read users.json:', error.message);
    return [];
  }
}

function writeUsers(users) {
  fs.mkdirSync(dataDirectory, { recursive: true });
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

function verifyPassword(password, storedSalt, storedHash) {
  const candidate = crypto.scryptSync(password, storedSalt, 64);
  const expected = Buffer.from(storedHash, 'hex');
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

function publicUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    matricNumber: user.matricNumber || null,
    department: user.department || null,
    createdAt: user.createdAt,
  };
}

function issueToken() {
  return crypto.randomBytes(32).toString('hex');
}

app.get('/', (req, res) => {
  res.json({ message: 'SmartAttend backend is running!' });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'smart-attend-api' });
});

app.post('/api/auth/register', (req, res) => {
  const body = req.body || {};
  const fullName = String(body.fullName || '').trim();
  const email = normalizeEmail(body.email);
  const password = String(body.password || '');
  const role = String(body.role || '').trim().toLowerCase();
  const matricNumber = String(body.matricNumber || '').trim();
  const department = String(body.department || '').trim();

  if (!fullName || !email || !password || !role) {
    return res.status(400).json({ error: 'Full name, email, password, and role are required.' });
  }
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }
  if (!['student', 'lecturer'].includes(role)) {
    return res.status(400).json({ error: 'Role must be student or lecturer.' });
  }
  if (role === 'student' && !matricNumber) {
    return res.status(400).json({ error: 'Matric number is required for students.' });
  }
  if (role === 'lecturer' && !department) {
    return res.status(400).json({ error: 'Department is required for lecturers.' });
  }

  const users = readUsers();
  if (users.some(user => user.email === email)) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const { salt, hash } = hashPassword(password);
  const user = {
    id: crypto.randomUUID(),
    fullName,
    email,
    role,
    matricNumber: role === 'student' ? matricNumber : null,
    department: role === 'lecturer' ? department : null,
    passwordSalt: salt,
    passwordHash: hash,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  writeUsers(users);
  return res.status(201).json({ token: issueToken(), user: publicUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const email = normalizeEmail(req.body && req.body.email);
  const password = String((req.body && req.body.password) || '');
  const user = readUsers().find(candidate => candidate.email === email);

  if (!user || !password || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  return res.json({ token: issueToken(), user: publicUser(user) });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Unexpected server error.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SmartAttend API running on port ${PORT}`);
});
