/**
 * Multiplayer for the Number Jungle.
 *
 * Players in the same grade band share a jungle room. They can see each
 * other's customized avatars move around, cheer each other on with preset
 * emotes (no free-text chat, since players are kids), and every correct
 * answer adds to a shared Crew XP goal.
 */
const { sanitizeAvatar, sanitizeName } = require('../data/avatarOptions');

const WORLD_WIDTH = 960;
const WORLD_MIN_Y = 150;
const WORLD_MAX_Y = 250;
const CREW_XP_GOAL = 500;
const EMOTES = ['wave', 'cheer', 'star', 'thinking'];
const MAX_PLAYERS_PER_ROOM = 30;

// roomId -> { players: Map<socketId, player>, crewXp: number }
const rooms = new Map();

function getRoom(roomId) {
  if (!rooms.has(roomId)) rooms.set(roomId, { players: new Map(), crewXp: 0 });
  return rooms.get(roomId);
}

function clamp(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

module.exports = (io) => {
  io.on('connection', (socket) => {
    let roomId = null;

    socket.on('jungle:join', (payload = {}) => {
      const gradeBand = ['6-8', '9-12'].includes(payload.gradeBand) ? payload.gradeBand : '6-8';
      const nextRoomId = `jungle-${gradeBand}`;
      const room = getRoom(nextRoomId);

      if (room.players.size >= MAX_PLAYERS_PER_ROOM) {
        socket.emit('jungle:full');
        return;
      }

      // Leave any previous room first.
      if (roomId) leaveRoom();
      roomId = nextRoomId;

      const player = {
        id: socket.id,
        name: sanitizeName(payload.name),
        avatar: sanitizeAvatar(payload.avatar),
        x: clamp(payload.x, 40, WORLD_WIDTH - 40),
        y: clamp(payload.y, WORLD_MIN_Y, WORLD_MAX_Y),
        solved: 0,
      };

      room.players.set(socket.id, player);
      socket.join(roomId);

      socket.emit('jungle:roster', {
        you: player.id,
        players: [...room.players.values()].filter((p) => p.id !== socket.id),
        crewXp: room.crewXp,
        crewGoal: CREW_XP_GOAL,
      });
      socket.to(roomId).emit('jungle:player-joined', player);
    });

    socket.on('jungle:move', (payload = {}) => {
      const player = currentPlayer();
      if (!player) return;
      player.x = clamp(payload.x, 40, WORLD_WIDTH - 40);
      player.y = clamp(payload.y, WORLD_MIN_Y, WORLD_MAX_Y);
      socket.to(roomId).emit('jungle:player-moved', { id: player.id, x: player.x, y: player.y });
    });

    socket.on('jungle:solved', (payload = {}) => {
      const player = currentPlayer();
      if (!player) return;
      const room = getRoom(roomId);
      const xp = clamp(payload.xp, 0, 50);
      player.solved += 1;
      room.crewXp += xp;

      io.to(roomId).emit('jungle:player-solved', {
        id: player.id,
        name: player.name,
        solved: player.solved,
        crewXp: room.crewXp,
        crewGoal: CREW_XP_GOAL,
      });

      if (room.crewXp >= CREW_XP_GOAL) {
        io.to(roomId).emit('jungle:crew-goal', { crewGoal: CREW_XP_GOAL });
        room.crewXp = 0;
      }
    });

    socket.on('jungle:emote', (payload = {}) => {
      const player = currentPlayer();
      if (!player || !EMOTES.includes(payload.emote)) return;
      io.to(roomId).emit('jungle:emote', { id: player.id, emote: payload.emote });
    });

    socket.on('disconnect', leaveRoom);

    function currentPlayer() {
      if (!roomId) return null;
      return getRoom(roomId).players.get(socket.id) || null;
    }

    function leaveRoom() {
      if (!roomId) return;
      const room = getRoom(roomId);
      room.players.delete(socket.id);
      socket.to(roomId).emit('jungle:player-left', { id: socket.id });
      socket.leave(roomId);
      if (room.players.size === 0) rooms.delete(roomId);
      roomId = null;
    }
  });
};
