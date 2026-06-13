import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { GamePhysicsEngine } from './physicsEngine.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
    methods: ['GET', 'POST']
  }
});

const game = new GamePhysicsEngine();

setInterval(() => {
  game.update();
  
  const playersData = {};
  for (const id in game.players) {
    playersData[id] = {
      position: game.players[id].position
    };
  }

  io.emit('game-state', { 
    ball: game.ball.position, 
    players: playersData 
  });
}, 1000 / 60);

app.get('/', (req, res) => {
  res.send('TopDown Tactix Server is running smoothly.');
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;
if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

export { app, httpServer, io };