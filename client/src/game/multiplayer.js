/**
 * Thin wrapper around Socket.io for the shared Number Jungle.
 * If the server can't be reached, the game keeps running in solo mode.
 */
import { io } from 'socket.io-client';

const MOVE_THROTTLE_MS = 100;

export function connectJungle(me, handlers = {}) {
  // Keep retrying: a free server can take ~30 s to wake up.
  const socket = io({
    transports: ['websocket', 'polling'],
    reconnectionDelayMax: 10000,
    timeout: 10000,
  });

  let lastMoveSentAt = 0;
  let pendingMove = null;
  let moveTimer = null;

  socket.on('connect', () => {
    socket.emit('jungle:join', me);
    handlers.onStatus?.('online');
  });
  socket.on('disconnect', () => handlers.onStatus?.('offline'));
  socket.on('connect_error', () => handlers.onStatus?.('offline'));
  socket.io.on('reconnect_attempt', () => handlers.onStatus?.('connecting'));

  socket.on('jungle:roster', (data) => handlers.onRoster?.(data));
  socket.on('jungle:player-joined', (p) => handlers.onJoin?.(p));
  socket.on('jungle:player-moved', (p) => handlers.onMove?.(p));
  socket.on('jungle:player-left', (p) => handlers.onLeave?.(p));
  socket.on('jungle:player-solved', (p) => handlers.onSolved?.(p));
  socket.on('jungle:crew-goal', (p) => handlers.onCrewGoal?.(p));
  socket.on('jungle:emote', (p) => handlers.onEmote?.(p));
  socket.on('jungle:player-avatar', (p) => handlers.onAvatar?.(p));
  socket.on('jungle:full', () => handlers.onStatus?.('full'));

  function sendMove() {
    if (!pendingMove) return;
    socket.emit('jungle:move', pendingMove);
    pendingMove = null;
    lastMoveSentAt = Date.now();
  }

  return {
    get id() {
      return socket.id;
    },
    move(x, y) {
      pendingMove = { x: Math.round(x), y: Math.round(y) };
      const wait = MOVE_THROTTLE_MS - (Date.now() - lastMoveSentAt);
      if (wait <= 0) {
        sendMove();
      } else if (!moveTimer) {
        moveTimer = setTimeout(() => {
          moveTimer = null;
          sendMove();
        }, wait);
      }
    },
    solved(xp) {
      socket.emit('jungle:solved', { xp });
    },
    emote(emote) {
      socket.emit('jungle:emote', { emote });
    },
    updateAvatar(avatar) {
      me.avatar = avatar;
      socket.emit('jungle:avatar', { avatar });
    },
    disconnect() {
      clearTimeout(moveTimer);
      socket.disconnect();
    },
  };
}
