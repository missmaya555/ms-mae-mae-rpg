# 🎮 Ms. Mae-Mae Academy RPG

> *A multiplayer educational adventure game where students explore worlds, battle creatures, complete quests, level up skills, and earn rewards by learning.*

---

## ✨ What Is This?

Ms. Mae-Mae Academy RPG turns learning into an epic adventure. Students explore immersive worlds, battle creatures, and level up their real-world skills — guided by **Ms. Mae-Mae**, an AI mentor who cheers them on every step of the way.

Think:
- 🎴 **Pokémon** — progression, battles, and creature collection
- 🌐 **Roblox** — social multiplayer worlds
- 🦉 **Duolingo** — streaks, XP, and reward loops
- 🤖 **Ms. Mae-Mae** — your personal AI guide and mentor

---

## 🚀 Features

| Feature | Status |
|---|---|
| Number Jungle quest — grades 6–12 math (30 questions, 2 grade bands × 5 difficulty levels) | ✅ Playable |
| Adaptive difficulty engine | ✅ Playable |
| Ms. Mae-Mae step-by-step walkthroughs + frustration detection | ✅ Playable |
| Character creator (skin tone, hair, outfit, accessories, companion) | ✅ Playable |
| Original collectible jungle creatures | ✅ Playable |
| XP, levels & quest rewards (Golden Shield) | ✅ Playable |
| Real-time multiplayer jungle (Socket.io) with Crew XP goal | ✅ Playable |
| Animated math visuals (number line, tape diagrams, balance scale, graphs) | ✅ Playable |
| 8 built-in languages + any language via AI | ✅ Playable |
| Ms. Mae-Mae's voice (text-to-speech in the chosen language) | ✅ Playable |
| Accessibility: screen reader layer, keyboard play, captions, ASL video panel | ✅ Playable (ASL clips to be recorded) |
| Companion evolution (3 stages), potions & math moves | ✅ Playable |
| Ms. Mae-Mae LLM mentor | 🔧 In Progress |
| Turn-based battle system | 📋 Planned |
| Student dashboard | 📋 Planned |
| Teacher/admin panel | 📋 Planned |

---

## 🌿 Quest 001: The Number Jungle (Grades 6–12)

Each question is brought by a jungle creature. Solve it to befriend the creature and earn XP.

- **Grade bands:** `6-8` (ratios, integers, percents, equations, slope, systems, Pythagorean theorem) and `9-12` (expressions, inequalities, factoring, quadratics, exponents, logarithms, exponential models). Questions live in `server/data/numberJungleQuestions.js`.
- **Adaptive difficulty:** `server/controllers/adaptiveEngine.js` moves students up or down 5 levels based on correctness, attempts and time.
- **Ms. Mae-Mae's walkthroughs:** a wrong answer shows hint steps; a second wrong answer shows the full walkthrough; a third reveals the solution and moves on. `client/src/mentor/frustrationDetector.js` spots repeated misses, rapid guessing and idling, and Ms. Mae-Mae responds.
- **Rewards:** +20 XP per creature befriended, +100 XP quest bonus and the **Golden Shield**. XP, items and creatures are saved to the player's profile.
- **Character creator:** students design their explorer (6 skin tones, 8 hairstyles including locs, braids, puffs and afros, 7 hair colors, 4 outfits, 6 colors, accessories) and pick a companion: **Lumacaw**, **Fernpaw**, **Glimmertoad** or **Coilvine**. All art is original and drawn in SVG (`client/src/art/`).
- **Student-paced feedback:** after a wrong answer, Ms. Mae-Mae explains one step at a time. Each step waits for her to finish speaking (or gives plenty of reading time) and students can press **Next ▶** / Enter when ready.
- **Math animations:** every question has an animated visual (`client/src/visuals/`). The student's companion hops along a number line, tape diagrams fill in, a balance scale shows doing the same thing to both sides, and graphs draw lines and parabolas. The visual follows the walkthrough step by step and plays to the answer on a correct response.
- **Multiplayer:** students in the same grade band share a jungle room and see each other move in real time. They cheer each other on with preset emotes (no free-text chat), and every correct answer fills a shared **Crew XP** goal. The server only accepts known avatar options and cleaned-up nicknames.

---

## 🏗️ Project Structure

```
ms-mae-mae-rpg/
├── client/                  # React + Phaser.js frontend
│   ├── public/
│   └── src/
│       ├── components/      # UI components
│       ├── pages/           # App pages (Login, World, Battle, etc.)
│       └── assets/          # Sprites, audio, maps
│
├── server/                  # Node.js + Express backend
│   ├── routes/              # API endpoints
│   ├── controllers/         # Business logic
│   ├── models/              # Database schemas
│   ├── middleware/          # Auth, validation
│   └── sockets/             # Socket.io multiplayer logic
│
├── ai/                      # Ms. Mae-Mae AI mentor (Claude API)
├── database/                # Schemas, migrations, seed data
├── docs/                    # Game design docs, lore, mechanics
├── assets/                  # Shared art, audio, sprites
└── .github/                 # Issue templates, CI workflows
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Game Engine | [Phaser.js](https://phaser.io/) |
| Frontend | React 18 |
| Backend | Node.js + Express |
| Multiplayer | Socket.io |
| Database | MongoDB + Mongoose |
| AI Mentor | Anthropic Claude API |
| Auth | JWT + bcrypt |

---

## ⚡ Getting Started

### Prerequisites
- Node.js v20+
- MongoDB (local or Atlas) — optional for now; the demo runs without it

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/missmaya555/ms-mae-mae-rpg.git
cd ms-mae-mae-rpg

# 2. Install dependencies (server, then client)
npm install
cd client && npm install && cd ..

# 3. Start the server (terminal 1)
npm start

# 4. Start the game (terminal 2)
cd client && npm run dev
```

Open the game at `http://localhost:5173` (the API runs on `http://localhost:5000`). To try multiplayer, open the game in two browser windows and pick the same grade band.

If the server isn't running, the game still works in solo mode with built-in offline questions.

---

## 🐾 Companions: evolution & math moves

Every jungle companion starts as a baby and evolves, Pokémon-style, but math edition:

| Line | Stage 1 | Stage 2 | Stage 3 | Math moves (one learned per stage) |
|---|---|---|---|---|
| Glow | Tadglow | Glimmerlet | Glimmertoad | Glow Eliminate · Number Line Leap · Lumen Burst |
| Vine | Vineworm | Coilsprout | Coilvine | Pattern Sense · Equation Wrap · Infinity Coil |
| Leaf | Sproutpaw | Fernling | Fernpaw | Second Sprout · Factor Fang · Evergreen Guard |
| Sky | Lumachick | Lumafledge | Lumacaw | Hint Beam · Ratio Radar · Solar Solve |

- **Potions:** leveling up earns a **Growth Potion** (levels 2–4) or a **Mega Growth Potion** (level 5+).
- **Evolving:** open **🐾 My Companion**. Stage 2 needs level 3 + a Growth Potion; stage 3 needs level 6 + a Mega Growth Potion. Evolution plays a classic flicker-and-flash sequence, and the companion learns a new move.
- **Math moves** (keys **Z / X / C** or the move buttons): cross out wrong answers, protect your next try, get a free hint step, or watch the math animation before answering. Each move has limited uses per quest. Moves never give away the final step.
- **Research data:** which moves a student used on each question is sent with the answer log (`movesUsed`), so help-seeking can be studied alongside correctness, attempts and time.
- Definitions live in `client/src/game/companions.js`; baby and middle-form art is in `client/src/art/babyForms.js`.

---

## 🌐 Languages, voice & accessibility

- **Built-in languages:** English, Español, Eesti (Estonian), Français, العربية (right-to-left), 中文, Tiếng Việt, Kreyòl ayisyen. Everything is translated, including Ms. Mae-Mae's lines and all 30 questions and walkthroughs (`client/src/i18n/`).
- **Any other language:** students can type a language under **Other language (AI)**. The server translates through Google Gemini, so add `GEMINI_API_KEY=...` to your `.env` (optional: `GEMINI_MODEL`). Without a key the game says so and stays in English.
- **Voice:** Ms. Mae-Mae reads her lines and the questions aloud with the browser's text-to-speech in the chosen language. Students can turn the voice off or slow it down. Available voices depend on the device.
- **Blind / low-vision students:** the canvas is mirrored into an accessible layer that screen readers announce, with real buttons for each answer (press Tab). Keys 1–4 answer, Enter / Space continue.
- **Deaf / hard-of-hearing students:** everything spoken is also captioned, answers are marked ✔ / ✘ (not just by color), and an **ASL panel** plays signer videos for each line. See [`docs/ASL_VIDEOS.md`](docs/ASL_VIDEOS.md) and the clip checklist [`docs/asl-clips.csv`](docs/asl-clips.csv).

---

## 🎯 Game Mechanics

### Progression (Pokémon-style)
Students earn XP by answering questions correctly. XP unlocks new abilities, creatures, and worlds.

### Social Play (Roblox-style)
Students explore shared worlds in real time, trade items, and team up for boss battles.

### Learning Loops (Duolingo-style)
Daily quests, streaks, and spaced repetition keep students coming back and retaining knowledge.

### Ms. Mae-Mae Mentor (AI)
Ms. Mae-Mae gives personalized hints, celebrates wins, and asks Socratic questions — never just giving away the answer.

---

## 🤝 Contributing

We'd love your help building this world! See [CONTRIBUTING.md](./CONTRIBUTING.md) to get started.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/dragon-quest`)
3. Commit your changes (`git commit -m 'Add dragon quest mechanic'`)
4. Push and open a Pull Request

---

## 📄 License

MIT © Ms. Mae-Mae Academy RPG

---

<div align="center">
  <em>Built with ❤️ for students who deserve to love learning.</em>
</div>
