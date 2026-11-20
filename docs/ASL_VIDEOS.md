# ASL videos for Ms. Mae-Mae

The game has an **ASL panel** (toggle **🤟 ASL panel** above the game). Whenever
Ms. Mae-Mae says something or a question appears, the panel plays the matching
American Sign Language video. Until a clip exists, the panel shows
"ASL video coming soon" and the file name it's looking for.

## What to record

`docs/asl-clips.csv` lists every clip (135 right now) with:

- `clip_file`: the exact file name to save
- `when_it_plays`: when the game shows it
- `english_line`: the English text to interpret

Open it in Google Sheets or Excel and hand it to your signer. Regenerate it after
changing questions or Ms. Mae-Mae's lines:

```bash
node scripts/generate-asl-checklist.mjs
```

## Recording guidelines

- Work with a **qualified ASL interpreter or Deaf signer**. ASL is its own
  language, so the clips should be natural ASL, not signed English word-for-word.
- Math vocabulary (slope, exponent, factor, etc.) should use signs familiar to
  Deaf students in grades 6–12; fingerspell only when there's no common sign.
- Plain, solid background; signer framed from waist to just above the head;
  good front lighting; no audio needed.
- Keep each clip short (one line each). MP4 (H.264), around 720p.

## Where to put the files

Save each `.mp4` in `client/public/asl/`, named exactly as in the checklist.
No code changes needed. The panel picks them up automatically.

## Other accessibility already in the game

- Every spoken line is also shown as text (captions).
- Correct and wrong answers are marked with ✔ / ✘, not just color.
- Keyboard play: keys 1–4 answer, Enter / Space moves to the next step.
- Screen readers: an accessible layer announces Ms. Mae-Mae's words and offers
  the answers as real buttons (press Tab to reach it).
- Ms. Mae-Mae's voice can be turned off or slowed down.
