import express from 'express';
import Matter from 'matter-js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { GamePhysicsEngine } from './physicsEngine.js';

const app = express();
const httpServer = createServer(app);

const PHYSICS_WIDTH = 1600;
const PHYSICS_HEIGHT = 900;

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
    methods: ['GET', 'POST']
  }
});

export const game = new GamePhysicsEngine(PHYSICS_WIDTH, PHYSICS_HEIGHT);
const scores = { home: 0, away: 0 };

game.onGoal((side) => {
  console.log(`Goal scored for ${side}!`);
  if (scores[side] !== undefined) {
    scores[side] += 1;
  }
  io.emit('goal-scored', { side, scores });
});

export const runGameTick = (io) => {
  game.update();
  io.emit('game-state', game.getState());
};

if (process.env.NODE_ENV !== 'test') {
  setInterval(() => runGameTick(io), 1000 / 60);
}

app.get('/', (req, res) => {
  res.send('TopDown Tactix Server is running smoothly.');
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  game.addPlayer(socket.id, { x: 400, y: 450 });

  socket.on('request-score', () => {
    socket.emit('current-score', scores);
  });

  socket.on('player-input', (data) => {
    if (!data?.move || !data?.id) return;
    if (GamePhysicsEngine.isValidMove(data.move)) {
      const player = game.players[data.id];
      if (player) Matter.Body.applyForce(player, player.position, data.move);
    }
  });

  socket.on('disconnect', () => {
    game.removePlayer(socket.id);
    io.emit('player-disconnected', socket.id);
  });
});

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () => console.log(`Server running on ${PORT}`));
}
export { app, httpServer, io };