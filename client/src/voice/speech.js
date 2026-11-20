/**
 * Ms. Mae-Mae's voice, using the browser's built-in text-to-speech.
 * Which languages have a voice depends on the device and browser; when
 * there's no voice for a language the game keeps showing captions.
 */

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

// Voice names that are usually female, so Ms. Mae-Mae sounds consistent.
const PREFERRED_NAMES = /female|woman|samantha|zira|aria|jenny|google us english|paulina|monica|lupe|anu|amelie|audrey|hoda|tingting|xiaoxiao|linh|hoaimy/i;

let voicesReady = null;

function loadVoices() {
  if (!synth) return Promise.resolve([]);
  if (voicesReady) return voicesReady;
  voicesReady = new Promise((resolve) => {
    const existing = synth.getVoices();
    if (existing.length) return resolve(existing);
    const done = () => resolve(synth.getVoices());
    synth.addEventListener?.('voiceschanged', done, { once: true });
    setTimeout(done, 1500);
  });
  return voicesReady;
}

export async function findVoice(lang) {
  const voices = await loadVoices();
  const base = (lang || 'en').toLowerCase().split('-')[0];
  const exact = voices.filter((v) => v.lang.toLowerCase() === lang.toLowerCase());
  const sameBase = voices.filter((v) => v.lang.toLowerCase().split(/[-_]/)[0] === base);
  const pool = exact.length ? exact : sameBase;
  if (!pool.length) return null;
  return pool.find((v) => PREFERRED_NAMES.test(v.name)) || pool[0];
}

export async function hasVoice(lang) {
  return Boolean(await findVoice(lang));
}

/** Make math read more naturally aloud. */
function speakable(text) {
  return String(text)
    .replace(/[▶✔✘✦]/g, '')
    .replace(/−/g, '-')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/⁴/g, '^4')
    .replace(/⁷/g, '^7')
    .replace(/ˣ/g, '^x')
    .replace(/ᵗ/g, '^t');
}

let currentToken = 0;

/**
 * Speak a line. Resolves when she finishes (or right away if voice is off
 * or unavailable). A newer call interrupts an older one.
 * Resolves to true if the line was actually spoken.
 */
export async function speak(text, { lang = 'en-US', rate = 0.9, enabled = true } = {}) {
  if (!synth || !enabled || !text) return false;
  const token = ++currentToken;
  synth.cancel();

  const voice = await findVoice(lang);
  if (!voice || token !== currentToken) return false;

  await new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(speakable(text));
    u.voice = voice;
    u.lang = voice.lang;
    u.rate = rate;
    u.pitch = 1.05;
    u.onend = resolve;
    u.onerror = resolve;
    // Safety net in case the browser never fires onend.
    setTimeout(resolve, Math.max(4000, text.length * 120));
    synth.speak(u);
  });
  return token === currentToken;
}

export function stopSpeaking() {
  currentToken += 1;
  synth?.cancel();
}
