const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/players', require('./routes/players'));
app.use('/api/quests', require('./routes/quests'));
app.use('/api/ai-mentor', require('./routes/aiMentor'));

// Socket.io (multiplayer)
require('./sockets/gameSocket')(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🎮 Ms. Mae-Mae RPG server running on port ${PORT}`));