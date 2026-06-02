module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    socket.on('join-world', (worldId) => {
      socket.join(worldId);
      io.to(worldId).emit('player-joined', { playerId: socket.id });
    });

    socket.on('battle-action', (data) => {
      io.to(data.worldId).emit('battle-update', data);
    });

    socket.on('disconnect', () => {
      console.log(`Player disconnected: ${socket.id}`);
    });
  });
};