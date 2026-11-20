const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Skipping MongoDB for today's demo — using hardcoded questions instead.
// const mongoose = require('mongoose');
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log('✅ MongoDB connected'))
//   .catch(err => console.error('❌ MongoDB connection error:', err.message));

const app = express();
const server = http.createServer(app);
// Vite's dev server runs on 5173; 3000 is kept for older setups.
const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'].filter(Boolean);
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/players', require('./routes/players'));
app.use('/api/quests', require('./routes/quests'));
app.use('/api/ai-mentor', require('./routes/aiMentor'));
app.use('/api/translate', require('./routes/translate'));
require('./sockets/gameSocket')(io);
app.use('/api/quests/number-jungle', require('./routes/numberJungle'));

// In production, the same server also serves the built game (client/dist),
// so one web service runs the whole thing — API, multiplayer and pages.
const path = require('path');
const fs = require('fs');
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^\/(?!api\/|socket\.io\/).*/, (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🎮 Ms. Mae-Mae RPG server running on port ${PORT}`));