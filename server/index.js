import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Body } from 'matter-js';
import { GamePhysicsEngine } from './physicsEngine.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
    methods: ['GET', 'POST']
  }
});

export const game = new GamePhysicsEngine();
const scores = { home: 0, away: 0 };

game.onGoal((side) => {
  console.log(`Goal scored on the ${side} side!`);
  
  if (side === 'left') {
    scores.left += 1;
  } else if (side === 'right') {
    scores.right += 1;
  }

  io.emit('goal-scored', { side, scores });
  game.resetPitch();
});

export const runGameTick = (io) => {
  game.update();
  const playersData = {};
  for (const id in game.players) {
    playersData[id] = { position: game.players[id].position };
  }
  io.emit('game-state', { ball: game.ball.position, players: playersData });
};

if (process.env.NODE_ENV !== 'test') {
  setInterval(() => runGameTick(io), 1000 / 60);
}

app.get('/', (req, res) => {
  res.send('TopDown Tactix Server is running smoothly.');
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  game.addPlayer(socket.id, { x: 400, y: 300 });

  socket.on('player-input', (data) => {
    if (!data || !data.move || !data.id) return;

    if (!GamePhysicsEngine.isValidMove(data.move)) {
        console.warn(`Invalid move attempt from ${socket.id}`);
        return;
    }

    const player = game.players[data.id];
    if (player) {
      Body.applyForce(player, player.position, data.move);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    game.removePlayer(socket.id);
  });
});

const PORT = process.env.PORT || 4000;
if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

export { app, httpServer, io };