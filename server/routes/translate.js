/**
 * POST /api/translate  { language: 'Swahili', strings: ['...', ...] }
 *   -> { strings: [...], bcp47: 'sw-KE', rtl: false }
 *
 * Used for the "Other language" option. Translates with Google Gemini, so
 * it needs GEMINI_API_KEY in your .env (and costs a little per use).
 * Optional: GEMINI_MODEL (default gemini-2.5-flash).
 * Results are cached in memory so each string is only translated once.
 */
const express = require('express');
const router = express.Router();

const MAX_STRINGS = 250;
const MAX_CHARS = 600;
const cache = new Map(); // `${language}::${text}` -> translation
const metaCache = new Map(); // language -> { bcp47, rtl }

function cleanLanguage(name) {
  return String(name || '').replace(/[^\p{L} ()-]/gu, '').trim().slice(0, 40);
}

router.post('/', async (req, res) => {
  const language = cleanLanguage(req.body?.language);
  const strings = req.body?.strings;

  if (!language) return res.status(400).json({ error: 'language is required' });
  if (!Array.isArray(strings) || strings.length === 0 || strings.length > MAX_STRINGS) {
    return res.status(400).json({ error: `strings must be an array of 1–${MAX_STRINGS} items` });
  }
  if (strings.some((s) => typeof s !== 'string' || s.length > MAX_CHARS)) {
    return res.status(400).json({ error: `each string must be text under ${MAX_CHARS} characters` });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'AI translation is not set up (missing GEMINI_API_KEY).' });
  }

  const key = (s) => `${language}::${s}`;
  const missing = [...new Set(strings.filter((s) => !cache.has(key(s))))];

  try {
    if (missing.length > 0 || !metaCache.has(language)) {
      const result = await translateWithGemini(apiKey, language, missing);
      missing.forEach((s, i) => cache.set(key(s), result.translations[i] || s));
      metaCache.set(language, { bcp47: result.bcp47, rtl: result.rtl });
    }
    const meta = metaCache.get(language) || {};
    res.json({ strings: strings.map((s) => cache.get(key(s)) || s), bcp47: meta.bcp47, rtl: meta.rtl });
  } catch (err) {
    console.error('Translation failed:', err.message);
    res.status(502).json({ error: 'Translation failed' });
  }
});

async function translateWithGemini(apiKey, language, strings) {
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const prompt = [
    `Translate each string in the JSON array below into ${language}.`,
    'This is a math learning game for students in grades 6–12, guided by a warm "big sister" tutor called Ms. Mae-Mae.',
    'Rules:',
    '- Keep every math expression, number, variable, symbol, unit and emoji exactly as written.',
    '- Keep placeholders in curly braces like {name} exactly as written.',
    '- Keep names (Ms. Mae-Mae, Lumacaw, Fernpaw, Glimmertoad, Coilvine, Number Jungle when used as a name) unchanged.',
    '- Use a friendly, encouraging tone suitable for teenagers.',
    'Respond with JSON: {"translations": [...same length and order...], "bcp47": "<BCP-47 code for this language>", "rtl": <true if written right-to-left>}.',
    '',
    JSON.stringify(strings),
  ].join('\n');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
    }),
  });
  if (!response.ok) throw new Error(`Gemini returned ${response.status}`);

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  const parsed = JSON.parse(text);
  const translations = Array.isArray(parsed.translations) ? parsed.translations : [];
  if (translations.length !== strings.length) throw new Error('Gemini returned the wrong number of strings');

  return {
    translations: translations.map((s) => String(s)),
    bcp47: typeof parsed.bcp47 === 'string' ? parsed.bcp47.slice(0, 20) : undefined,
    rtl: Boolean(parsed.rtl),
  };
}

module.exports = router;
