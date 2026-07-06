import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { GamePhysicsEngine } from './physicsEngine.js';
import { GameManager } from './gameManager.js';

const app = express();
const httpServer = createServer(app);

export const waitingQueue = [];
export const onlineSessions = new Map();
export const playerToRoom = new Map();

const offlineSessions = new Map();
const cpuSessions = new Map();

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

  socket.on('request-active-games', () => {
    const activeGamesList = getActiveGamesList();
    socket.emit('active-games-update', activeGamesList);
  });

  socket.on('admin-request-game-details', (roomId) => {
    const onlineGame = onlineSessions.get(roomId);
    
    if (onlineGame) {
      socket.emit('admin-game-details-update', {
        roomId,
        details: {
          players: onlineGame.players,
          score: onlineGame.instance.scores,
          timeLeft: onlineGame.instance.getRemainingTime(),
          status: 'online'
        }
      });
      return;
    }

    let offlineGame = null;
    let status = '';
    
    if (roomId.startsWith('offline_')) {
      offlineGame = offlineSessions.get(roomId.replace('offline_', ''));
      status = 'offline';
    } else if (roomId.startsWith('cpu_')) {
      offlineGame = cpuSessions.get(roomId.replace('cpu_', ''));
      status = 'cpu';
    }

    if (offlineGame) {
      socket.emit('admin-game-details-update', {
        roomId,
        details: {
          players: status === 'cpu' ? ['Player', 'CPU'] : ['Player 1', 'Player 2'],
          score: null, 
          timeLeft: null, 
          status: status
        }
      });
    }
  });

  socket.on('admin-force-action', ({ roomId, action, targetPlayer }) => {
    const gameData = onlineSessions.get(roomId);
    
    if (gameData) {      
      if (action === 'kick' && targetPlayer) {
        io.to(targetPlayer).emit('kicked-by-admin', {
          reason: 'You were kicked by an admin'
        });
      }

      const remainingPlayer = gameData.players.find(id => id !== targetPlayer);
      if (remainingPlayer) {
        io.to(remainingPlayer).emit('game-over', {
          winner: gameData.players.indexOf(remainingPlayer) === 0 ? 'home' : 'away',
          reason: 'Opponent kicked by admin',
          players: {
            [gameData.players[0]]: 'home',
            [gameData.players[1]]: 'away'
          }
        });
      }
    } else if (action === 'draw') {
      io.to(roomId).emit('game-over', {
        winner: 'draw',
        reason: 'Admin Forced Draw',
        players: {
          [gameData.players[0]]: 'home',
          [gameData.players[1]]: 'away'
        }
      });
    }

    clearInterval(gameData.loop);
      
    if (gameData.instance.countdownTimeout) {
      clearTimeout(gameData.instance.countdownTimeout);
    }

    gameData.players.forEach(pid => {
      playerToRoom.delete(pid);
      const playerSocket = io.sockets.sockets.get(pid);
      if (playerSocket) playerSocket.leave(roomId);
    });

    onlineSessions.delete(roomId);
    io.emit('active-games-update', getActiveGamesList());
  });

  socket.on('request-my-team', () => {
    const roomId = playerToRoom.get(socket.id);
    const gameData = onlineSessions.get(roomId);

    if (gameData && gameData.players) {
      const team = gameData.players.indexOf(socket.id) === 0 ? 'home' : 'away';
      socket.emit('player-assignment', { team });
    }
  });
  
  socket.on('request-score', () => {
    const roomId = playerToRoom.get(socket.id);
    const gameData = onlineSessions.get(roomId);
    
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
      const gameData = onlineSessions.get(roomId);
      
      if (gameData) {
        clearInterval(gameData.instance.loop);
        gameData.players.forEach(pid => playerToRoom.delete(pid));
        onlineSessions.delete(roomId);
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
    const gameData = onlineSessions.get(roomId);

    if (gameData && gameData.instance.isCountdownActive) return;

    if (gameData && !gameData.instance.isPaused && GamePhysicsEngine.isValidMove(data.move)) {
      gameData.instance.setPlayerInput(data.id, data.move);
    }
  });

  socket.on('pause-game', (isPaused) => {
    const roomId = playerToRoom.get(socket.id);
    const gameData = onlineSessions.get(roomId);
    
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

        if (!gameData.instance.isCountdownActive) {
          gameData.instance.triggerCountdown(3800);
        }
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
    const gameData = onlineSessions.get(roomId);

    if (gameData) {
      const { home, away } = gameData.instance.scores;
      let winner = 'draw';
      if (home > away) winner = 'home';
      else if (away > home) winner = 'away';

      io.to(roomId).emit('game-over', {
        winner: winner,
        reason: 'forfeit',
        players: {
          [gameData.players[0]]: 'home',
          [gameData.players[1]]: 'away'
        }
      });

      const remainingPlayerId = gameData.players.find(id => id !== socket.id);
      if (remainingPlayerId) {
        const remainingSocket = io.sockets.sockets.get(remainingPlayerId);
        if (remainingSocket) remainingSocket.leave(roomId);
      }

      clearInterval(gameData.loop);

      if (gameData.instance.countdownTimeout) {
        clearTimeout(gameData.instance.countdownTimeout);
      }

      gameData.instance.isPaused = false;
      gameData.instance.isPausePending = false;
      gameData.instance.pauseRequestedBy = null;
      
      gameData.players.forEach(pid => playerToRoom.delete(pid));
      onlineSessions.delete(roomId);

      io.emit('active-games-update', getActiveGamesList());
    }

    if (offlineSessions.has(socket.id)) {
      offlineSessions.delete(socket.id);
      io.emit('active-games-update', getActiveGamesList());
    }

    if (cpuSessions.has(socket.id)) {
      cpuSessions.delete(socket.id);
      io.emit('active-games-update', getActiveGamesList());
    }

    console.log(`User disconnected and cleaned up: ${socket.id}`);
  });

  socket.on('register-offline-game', (data) => {
    offlineSessions.set(socket.id, { ...data, lastSeen: Date.now() });
    io.emit('active-games-update', getActiveGamesList());
  });

  socket.on('unregister-offline-game', () => {
    offlineSessions.delete(socket.id);
    io.emit('active-games-update', getActiveGamesList());
  });

  socket.on('register-cpu-game', (data) => {
    cpuSessions.set(socket.id, { ...data, lastSeen: Date.now() });
    io.emit('active-games-update', getActiveGamesList());
  });

  socket.on('unregister-cpu-game', () => {
    cpuSessions.delete(socket.id);
    io.emit('active-games-update', getActiveGamesList());
  });
});

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

export const startNewGame = (player1Id, player2Id, type = 'online') => {
  const roomId = `game_${player1Id}_${player2Id}`;
  const newGame = new GameManager(PHYSICS_WIDTH, PHYSICS_HEIGHT);
  
  newGame.addPlayer(player1Id, { x: 400, y: 450 });
  newGame.addPlayer(player2Id, { x: 1200, y: 450 });

  io.to(player1Id).emit('player-assignment', { team: 'home' });
  io.to(player2Id).emit('player-assignment', { team: 'away' });

  let pauseTimeRemaining = 30;

  newGame.triggerCountdown(5800);
  
  newGame.onGoal((side, scores) => {
    io.to(roomId).emit('goal-scored', { side, scores: scores });
    newGame.triggerCountdown(3800);

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

            if (!newGame.isCountdownActive) {
                newGame.triggerCountdown(3800);
            }
        }
    } else {
        pauseTimeRemaining = 30;
    }

    if (!newGame.isPaused) {
      if (!newGame.isCountdownActive) {
        newGame.applyInputs();
        newGame.update(1/60);
      }
      
      io.to(roomId).emit('game-timer', newGame.getRemainingTime());
      io.to(roomId).emit('game-state', newGame.getState());
    }

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
        
        onlineSessions.delete(roomId);
        playerToRoom.delete(player1Id);
        playerToRoom.delete(player2Id);
        return; 
    }
  }, 1000 / 60);

  onlineSessions.set(roomId, { 
    instance: newGame, 
    players: [player1Id, player2Id],
    loop: loop,
    gameType: type
  });

  playerToRoom.set(player1Id, roomId);
  playerToRoom.set(player2Id, roomId);

  io.sockets.sockets.get(player1Id)?.join(roomId);
  io.sockets.sockets.get(player2Id)?.join(roomId);

  io.emit('active-games-update', getActiveGamesList());
  io.to(roomId).emit('match-found');
};

const getActiveGamesList = () => {
  const online = Array.from(onlineSessions.entries()).map(([roomId, data]) => ({
      roomId,
      players: data.players,
      status: 'online',
      gameType: data.gameType || 'online',
      difficulty: null
  }));
  
  const offline = Array.from(offlineSessions.entries()).map(([socketId, data]) => ({
      roomId: `offline_${socketId}`,
      players: ['Local Player'],
      status: 'offline',
      gameType: data.gameType || data.type || 'offline',
      difficulty: null
  }));

  const cpu = Array.from(cpuSessions.entries()).map(([socketId, data]) => ({
      roomId: `cpu_${socketId}`,
      players: ['Player', 'CPU'],
      status: 'cpu',
      gameType: data.gameType || data.type || 'cpu',
      difficulty: data.difficulty
  }));
  
  return [...online, ...offline, ...cpu];
};

export { app, httpServer, io };