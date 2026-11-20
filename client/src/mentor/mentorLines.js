// Ms. Mae-Mae's frustration-detector responses. The text for each language
// lives in the language packs (client/src/i18n); English is in en.js.
import { frustrationLines } from '../i18n';

export function getMentorLine(gradeBand, reason) {
  const lines = frustrationLines(gradeBand, reason);
  return lines[Math.floor(Math.random() * lines.length)];
}
