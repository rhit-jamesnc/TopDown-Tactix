import express from 'express';
import Matter from 'matter-js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { GamePhysicsEngine } from './physicsEngine.js';
import { GameManager } from './gameManager.js';

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

  socket.on('request-my-team', () => {
    const roomId = playerToRoom.get(socket.id);
    const gameData = games.get(roomId);

    if (gameData && gameData.players) {
      const team = gameData.players.indexOf(socket.id) === 0 ? 'home' : 'away';
      socket.emit('player-assignment', { team });
    }
  });
  
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
    if (playerToRoom.has(socket.id)) {
      const roomId = playerToRoom.get(socket.id);
      const gameData = games.get(roomId);
      
      if (gameData) {
        clearInterval(gameData.instance.loop);
        gameData.players.forEach(pid => playerToRoom.delete(pid));
        games.delete(roomId);
        io.to(roomId).emit('opponent-disconnected');
      }
    }

    if (waitingQueue.includes(socket.id)) {
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

    if (gameData && gameData.instance.isCountdownActive) return;

    if (gameData && !gameData.instance.isPaused && GamePhysicsEngine.isValidMove(data.move)) {
      const player = gameData.instance.players[data.id];
      if (gameData && !gameData.instance.isPaused && player) {
        Matter.Body.applyForce(player, player.position, data.move);
      }
    }
  });

  socket.on('pause-game', (isPaused) => {
    const roomId = playerToRoom.get(socket.id);
    const gameData = games.get(roomId);
    
    if (gameData) {
      if (isPaused) {
        if (gameData.instance.isPausePending && gameData.instance.pauseRequestedBy !== socket.id) {
          gameData.instance.isPaused = true;
          gameData.instance.isPausePending = false;
          gameData.instance.pauseRequestedBy = null;
          io.to(roomId).emit('pause-pending', { pending: false, requestedBy: null });
          io.to(roomId).emit('game-paused', true);
          return;
        }

        if (!gameData.instance.isPaused) {
          gameData.instance.isPausePending = true;
          gameData.instance.pauseRequestedBy = socket.id; 
          
          io.to(roomId).emit('pause-pending', { 
            pending: true, 
            requestedBy: socket.id 
          });
        }
      } else {
        gameData.instance.isPaused = false;
        gameData.instance.isPausePending = false;
        gameData.instance.pauseRequestedBy = null;
        io.to(roomId).emit('game-paused', false);
        io.to(roomId).emit('pause-pending', { pending: false, requestedBy: null });
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

      if (gameData.instance.countdownTimeout) {
        clearTimeout(gameData.instance.countdownTimeout);
      }

      gameData.instance.isPaused = false;
      gameData.instance.isPausePending = false;
      gameData.instance.pauseRequestedBy = null;
      
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
  
  newGame.addPlayer(player1Id, { x: 400, y: 450 });
  newGame.addPlayer(player2Id, { x: 1200, y: 450 });

  io.to(player1Id).emit('player-assignment', { team: 'home' });
  io.to(player2Id).emit('player-assignment', { team: 'away' });

  let pauseTimeRemaining = 30;

  const triggerCountdown = (durationMs) => {
    newGame.isCountdownActive = true;
    if (newGame.countdownTimeout) clearTimeout(newGame.countdownTimeout);
    
    newGame.countdownTimeout = setTimeout(() => {
      newGame.isCountdownActive = false;
    }, durationMs);
  };

  triggerCountdown(5800);
  
  newGame.onGoal((side, scores) => {
    io.to(roomId).emit('goal-scored', { side, scores: scores });
    triggerCountdown(3800);

    if (newGame.isPausePending) {
      newGame.isPaused = true;
      newGame.isPausePending = false;
      newGame.pauseRequestedBy = null;
      io.to(roomId).emit('pause-pending', { pending: false, requestedBy: null });
      io.to(roomId).emit('game-paused', true);
    }
  });

  const loop = setInterval(() => {
    if (newGame.isPaused) {
        pauseTimeRemaining -= 1/60;
        io.to(roomId).emit('pause-timer', pauseTimeRemaining);

        if (pauseTimeRemaining <= 0) {
            newGame.isPaused = false;
            pauseTimeRemaining = 30;
            io.to(roomId).emit('game-paused', false);
        }
    } else {
        pauseTimeRemaining = 30;
    }

    if (!newGame.isPaused && !newGame.isCountdownActive) {
      newGame.update(1/60);
    }

    io.to(roomId).emit('game-timer', newGame.getRemainingTime());
    io.to(roomId).emit('game-state', newGame.getState());

    const status = newGame.getGameStatus();
    if (status !== 'ongoing') {
        clearInterval(loop);

        newGame.isPaused = false;
        newGame.isPausePending = false;
        newGame.pauseRequestedBy = null;
        io.to(roomId).emit('pause-pending', { pending: false, requestedBy: null });
        io.to(roomId).emit('game-paused', false);

        io.to(roomId).emit('game-over', {
            ...status,
            players: {
              [player1Id]: 'home',
              [player2Id]: 'away'
          }
        });
        
        games.delete(roomId);
        playerToRoom.delete(player1Id);
        playerToRoom.delete(player2Id);
        return; 
    }
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