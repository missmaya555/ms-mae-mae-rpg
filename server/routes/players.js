const express = require('express');
const router = express.Router();
const { AVATAR_OPTIONS, sanitizeAvatar, sanitizeName } = require('../data/avatarOptions');

// In-memory profile store for the demo (MongoDB is switched off in
// server/index.js). Swap for a Player model once the database is back on.
const profiles = new Map();

router.get('/', (req, res) => {
  res.json({ message: 'Players route working' });
});

// Lets the character creator show exactly the options the server accepts.
router.get('/avatar-options', (req, res) => {
  res.json(AVATAR_OPTIONS);
});

router.get('/profile/:name', (req, res) => {
  const name = sanitizeName(req.params.name);
  const profile = profiles.get(name.toLowerCase());
  if (!profile) return res.status(404).json({ error: 'Profile not found' });
  res.json(profile);
});

router.post('/profile', (req, res) => {
  const name = sanitizeName(req.body?.name);
  const gradeBand = ['6-8', '9-12'].includes(req.body?.gradeBand) ? req.body.gradeBand : '6-8';
  const avatar = sanitizeAvatar(req.body?.avatar);

  const existing = profiles.get(name.toLowerCase()) || { xp: 0, items: [], creatures: [] };
  const profile = { ...existing, name, gradeBand, avatar, updatedAt: new Date().toISOString() };
  profiles.set(name.toLowerCase(), profile);

  res.json(profile);
});

module.exports = router;
