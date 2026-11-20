/**
 * Language system for Ms. Mae-Mae.
 *
 * - Built-in packs (instant, offline): English, Spanish, Estonian, French,
 *   Arabic, Chinese, Vietnamese, Haitian Creole.
 * - "Other language": any language the student types, translated by AI
 *   through the server's /api/translate route. If that isn't available the
 *   game falls back to English and says so.
 */
import en from './en';
import es from './es';
import et from './et';
import fr from './fr';
import ar from './ar';
import zh from './zh';
import vi from './vi';
import ht from './ht';

export const LANGUAGES = [
  { code: 'en', name: 'English', speech: 'en-US' },
  { code: 'es', name: 'Español', speech: 'es-US' },
  { code: 'et', name: 'Eesti', speech: 'et-EE' },
  { code: 'fr', name: 'Français', speech: 'fr-FR' },
  { code: 'ar', name: 'العربية', speech: 'ar-SA', rtl: true },
  { code: 'zh', name: '中文', speech: 'zh-CN' },
  { code: 'vi', name: 'Tiếng Việt', speech: 'vi-VN' },
  { code: 'ht', name: 'Kreyòl ayisyen', speech: 'ht-HT' },
];

const PACKS = { en, es, et, fr, ar, zh, vi, ht };

const state = {
  code: 'en',
  pack: en,
  speech: 'en-US',
  rtl: false,
  ai: null, // { name, ui, mentor, frustration, questions: {} }
  aiFailed: false,
};

function interpolate(text, vars = {}) {
  return String(text).replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
}

export function currentLanguage() {
  return {
    code: state.code,
    speech: state.speech,
    rtl: state.rtl,
    isAi: Boolean(state.ai),
    aiFailed: state.aiFailed,
    name: state.ai?.name || LANGUAGES.find((l) => l.code === state.code)?.name || 'English',
  };
}

/** Settings look like { language: 'et' } or { language: 'ai', aiLanguage: 'Swahili' }. */
export async function setLanguage(settings = {}) {
  state.ai = null;
  state.aiFailed = false;

  if (settings.language === 'ai' && settings.aiLanguage) {
    state.code = 'en';
    state.pack = en;
    state.speech = 'en-US';
    state.rtl = false;
    try {
      await prepareAiLanguage(settings.aiLanguage);
    } catch (err) {
      console.warn('AI translation unavailable:', err);
      state.aiFailed = true;
    }
    return currentLanguage();
  }

  const lang = LANGUAGES.find((l) => l.code === settings.language) || LANGUAGES[0];
  state.code = lang.code;
  state.pack = PACKS[lang.code] || en;
  state.speech = lang.speech;
  state.rtl = Boolean(lang.rtl);
  return currentLanguage();
}

/** UI text. Plurals: pass { count } and add `_one` / `_other` keys. */
export function t(key, vars = {}) {
  let lookup = key;
  if (typeof vars.count === 'number') {
    lookup = `${key}_${vars.count === 1 ? 'one' : 'other'}`;
  }
  const text = state.ai?.ui[lookup] ?? state.pack.ui?.[lookup] ?? en.ui[lookup] ?? lookup;
  return interpolate(text, vars);
}

/** Ms. Mae-Mae's lines. */
export function mentor(key, vars = {}) {
  const text = state.ai?.mentor[key] ?? state.pack.mentor?.[key] ?? en.mentor[key] ?? key;
  return interpolate(text, vars);
}

export function frustrationLines(band, reason) {
  const source = state.ai?.frustration || state.pack.frustration || en.frustration;
  const bank = source[band] || source['6-8'] || en.frustration['6-8'];
  return bank[reason] || bank.repeated_wrong_attempts || en.frustration['6-8'].repeated_wrong_attempts;
}

/** Built-in packs: translate a question instantly by its id. */
export function localizeQuestion(question) {
  if (!question) return question;
  const tr = state.ai?.questions[question.id] || state.pack.questions?.[question.id];
  if (!tr) return question;
  return {
    ...question,
    topic: tr.topic || question.topic,
    prompt: tr.prompt || question.prompt,
    steps: tr.steps && tr.steps.length === question.steps.length ? tr.steps : question.steps,
    choices: question.choices.map((c, i) => ({ ...c, label: tr.choices?.[i] || c.label })),
  };
}

/** AI languages: translate a question on the fly (cached). */
export async function localizeQuestionAsync(question) {
  if (!state.ai || !question || state.ai.questions[question.id]) return localizeQuestion(question);
  const strings = [question.topic, question.prompt, ...question.steps, ...question.choices.map((c) => c.label)];
  try {
    const { strings: out } = await requestTranslation(state.ai.name, strings);
    const n = question.steps.length;
    state.ai.questions[question.id] = {
      topic: out[0],
      prompt: out[1],
      steps: out.slice(2, 2 + n),
      choices: out.slice(2 + n),
    };
  } catch (err) {
    console.warn('Could not translate question, showing English:', err);
  }
  return localizeQuestion(question);
}

async function requestTranslation(language, strings) {
  const res = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language, strings }),
  });
  if (!res.ok) throw new Error(`Translate failed: ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data.strings) || data.strings.length !== strings.length) {
    throw new Error('Translation came back incomplete');
  }
  return data;
}

async function prepareAiLanguage(name) {
  const uiKeys = Object.keys(en.ui);
  const mentorKeys = Object.keys(en.mentor);
  const fr = [];
  for (const [band, reasons] of Object.entries(en.frustration)) {
    for (const [reason, lines] of Object.entries(reasons)) {
      lines.forEach((line, i) => fr.push({ band, reason, i, line }));
    }
  }

  const strings = [
    ...uiKeys.map((k) => en.ui[k]),
    ...mentorKeys.map((k) => en.mentor[k]),
    ...fr.map((f) => f.line),
  ];
  const { strings: out, bcp47, rtl } = await requestTranslation(name, strings);

  const ai = { name, ui: {}, mentor: {}, frustration: {}, questions: {} };
  uiKeys.forEach((k, i) => { ai.ui[k] = out[i]; });
  mentorKeys.forEach((k, i) => { ai.mentor[k] = out[uiKeys.length + i]; });
  fr.forEach((f, i) => {
    ai.frustration[f.band] = ai.frustration[f.band] || {};
    ai.frustration[f.band][f.reason] = ai.frustration[f.band][f.reason] || [];
    ai.frustration[f.band][f.reason][f.i] = out[uiKeys.length + mentorKeys.length + i];
  });

  state.ai = ai;
  if (bcp47) state.speech = bcp47;
  state.rtl = Boolean(rtl);
}
