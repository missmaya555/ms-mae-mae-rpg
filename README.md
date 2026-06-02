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
| Multiplayer world exploration | 🔧 In Progress |
| Turn-based battle system | 🔧 In Progress |
| Quest & skill progression | 🔧 In Progress |
| Ms. Mae-Mae AI mentor | 🔧 In Progress |
| XP & reward system | 📋 Planned |
| Student dashboard | 📋 Planned |
| Teacher/admin panel | 📋 Planned |

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
- MongoDB (local or Atlas)
- Anthropic API key ([get one here](https://console.anthropic.com))

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/missmaya555/ms-mae-mae-rpg.git
cd ms-mae-mae-rpg

# 2. Install all dependencies
npm run install:all

# 3. Set up environment variables
cp .env.example .env
# Fill in your values in .env

# 4. Start the dev server
npm run dev
```

The game will be available at `http://localhost:3000` and the API at `http://localhost:5000`.

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
