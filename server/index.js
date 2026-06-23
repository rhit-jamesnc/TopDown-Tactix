import express from 'express';
import Matter from 'matter-js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { GamePhysicsEngine } from './physicsEngine.js';
import { GameManager } from './GameManager.js';

const app = express();
const httpServer = createServer(app);

export const waitingQueue = [];
export const games = new Map();
export const playerToRoom = new Map();

const PHYSICS_WIDTH = 1600;
const PHYSICS_HEIGHT = 900;

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
    methods: ['GET', 'POST']
  }
});

app.get('/', (req, res) => {
  res.send('TopDown Tactix Server is running smoothly.');
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  socket.on('request-score', () => {
    const roomId = playerToRoom.get(socket.id);
    const gameData = games.get(roomId);
    
    if (gameData) {
      socket.emit('current-score', gameData.instance.scores);
    } else {
      socket.emit('current-score', { home: 0, away: 0 });
    }
  });

  socket.on('request-lobby-status', () => {
    socket.emit('lobby-status', {
      totalOnline: io.engine.clientsCount,
      inQueue: waitingQueue.length
    });
  });

  socket.on('find-match', () => {

    if (waitingQueue.includes(socket.id) || playerToRoom.has(socket.id)) {
      console.log(`User ${socket.id} is already in the queue. Ignoring.`);
      return; 
    }

    waitingQueue.push(socket.id);

    if (waitingQueue.length >= 2) {
      const player1Id = waitingQueue.shift();
      const player2Id = waitingQueue.shift();
      startNewGame(player1Id, player2Id);
    }
  });

  socket.on('player-input', (data) => {
    if (!data?.move || !data?.id) return;

    const roomId = playerToRoom.get(data.id);
    const gameData = games.get(roomId);

    if (gameData && GamePhysicsEngine.isValidMove(data.move)) {
      const player = gameData.instance.players[data.id];
      if (player) {
        Matter.Body.applyForce(player, player.position, data.move);
      }
    }
  });

  socket.on('cancel-match', () => {
    const index = waitingQueue.indexOf(socket.id);
    if (index !== -1) waitingQueue.splice(index, 1);
  });

  socket.on('disconnect', () => {
    const index = waitingQueue.indexOf(socket.id);
    if (index !== -1) waitingQueue.splice(index, 1);

    const roomId = playerToRoom.get(socket.id);
    const gameData = games.get(roomId);

    if (gameData) {
      clearInterval(gameData.instance.loop);
      
      gameData.players.forEach(pid => playerToRoom.delete(pid));
      games.delete(roomId);
      
      io.to(roomId).emit('opponent-disconnected');
    }
    console.log(`User disconnected and cleaned up: ${socket.id}`);
  });
});

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

export const startNewGame = (player1Id, player2Id) => {
  const roomId = `game_${player1Id}_${player2Id}`;
  const newGame = new GameManager(PHYSICS_WIDTH, PHYSICS_HEIGHT);
  
  newGame.addPlayer(player1Id, { x: 1200, y: 450 });
  newGame.addPlayer(player2Id, { x: 400, y: 450 });
  
  newGame.onGoal((side, scores) => {
    io.to(roomId).emit('goal-scored', { side, scores: scores });
  });

  const loop = setInterval(() => {
    newGame.update(1/60);
    io.to(roomId).emit('game-state', newGame.getState());
  }, 1000 / 60);

  games.set(roomId, { 
    instance: newGame, 
    players: [player1Id, player2Id],
    loop: loop
  });

  playerToRoom.set(player1Id, roomId);
  playerToRoom.set(player2Id, roomId);

  io.sockets.sockets.get(player1Id)?.join(roomId);
  io.sockets.sockets.get(player2Id)?.join(roomId);

  io.to(roomId).emit('match-found');
};

export { app, httpServer, io };