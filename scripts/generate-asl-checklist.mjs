/**
 * Builds docs/asl-clips.csv: every ASL video clip the game can show, with
 * the English line a signer should interpret. Run after changing questions
 * or Ms. Mae-Mae's lines:
 *
 *   node scripts/generate-asl-checklist.mjs
 */
import { createRequire } from 'module';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const require = createRequire(import.meta.url);
const { QUESTION_BANK } = require(path.join(root, 'server/data/numberJungleQuestions.js'));
const en = (await import(path.join(root, 'client/src/i18n/en.js'))).default;

const rows = [['clip_file', 'when_it_plays', 'english_line']];
const mentorKeys = {
  welcome: 'Start of the quest',
  correct: 'Correct on the first try',
  correctAfterHelp: 'Correct after a hint',
  wrongOpener: 'First wrong answer',
  tryAgainHints: 'After the hint steps',
  tryAgainFull: 'After the full walkthrough',
  revealOpener: 'Third wrong answer (solution)',
  revealAfter: 'After the solution',
  complete: 'Quest complete',
};
for (const [key, when] of Object.entries(mentorKeys)) {
  const line = key === 'correct'
    ? `${en.mentor.correct1} ${en.mentor.joinCrew}`
    : en.mentor[key];
  rows.push([`mentor.${key}.mp4`, when, line]);
}
for (const [key, when] of Object.entries({
  intro: 'Jungle Challenge starts',
  win: 'Jungle Challenge won',
  lose: 'Jungle Challenge lost',
})) {
  rows.push([`challenge.${key}.mp4`, when, en.ui[`challenge.${key}`].replace('{guardian}', '[guardian name]').replace('{name}', '[companion name]')]);
}
for (const reason of ['repeated_wrong_attempts', 'idle_timeout', 'rapid_guessing']) {
  rows.push([`mentor.${reason}.mp4`, `Frustration detector: ${reason.replace(/_/g, ' ')}`, en.frustration['6-8'][reason][0]]);
}
for (const [band, levels] of Object.entries(QUESTION_BANK)) {
  for (const [level, questions] of Object.entries(levels)) {
    for (const q of questions) {
      rows.push([`q.${q.id}.prompt.mp4`, `Grades ${band}, level ${level}: question`, q.prompt]);
      q.steps.forEach((step, i) => {
        rows.push([`q.${q.id}.step${i + 1}.mp4`, `Grades ${band}, level ${level}: walkthrough step ${i + 1}`, step]);
      });
    }
  }
}

// Placeholders become readable notes for the signer.
const readable = (text) => String(text).replace('{name}', "[student's name]").replace('{creature}', '[creature name]');
rows.forEach((r, i) => { if (i > 0) r[2] = readable(r[2]); });

const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
writeFileSync(path.join(root, 'docs/asl-clips.csv'), `${csv}\n`);
console.log(`Wrote ${rows.length - 1} clips to docs/asl-clips.csv`);
