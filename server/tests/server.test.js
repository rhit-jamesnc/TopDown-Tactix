import { io as clientIO } from 'socket.io-client';
import { expect, test, beforeAll, afterAll, beforeEach, afterEach, vi, describe } from 'vitest';
import { httpServer, onlineSessions, playerToRoom, waitingQueue, startNewGame } from '../server.js';
import { GamePhysicsEngine } from '../physicsEngine.js';

const waitFor = async (condition, timeout = 1000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (condition()) return;
    await new Promise(r => setTimeout(r, 10));
  }
  throw new Error('Condition not met within timeout');
};

vi.mock('../physicsEngine.js', () => ({
  GamePhysicsEngine: {
    isValidMove: vi.fn().mockReturnValue(true)
  }
}));

vi.mock('../gameManager.js', () => {
  return {
    GameManager: class {
      constructor() {
        this.scores = { home: 0, away: 0 };
        this.isCountdownActive = false;
        this.isPaused = false;
        this.isPausePending = false;
        this.pauseRequestedBy = null;
        this.countdownTimeout = null;
        this.goalCallback = vi.fn();
        
        this.addPlayer = vi.fn();
        this.triggerCountdown = vi.fn();
        this.onGoal = vi.fn();
        this.setPlayerInput = vi.fn();
        this.applyInputs = vi.fn();
        this.update = vi.fn();
        this.getRemainingTime = vi.fn().mockReturnValue(120);
        this.getGameStatus = vi.fn().mockReturnValue('ongoing');
        this.getState = vi.fn().mockReturnValue({ ball: { x: 400 }, players: {} });
      }
    }
  };
});

let clientSocket1;
let clientSocket2;
const TEST_PORT = 9999;

beforeAll(() => {
  return new Promise((resolve) => httpServer.listen(TEST_PORT, resolve));
});

afterAll(() => {
  return new Promise((resolve) => httpServer.close(resolve));
});

beforeEach(() => {
  waitingQueue.length = 0;
  onlineSessions.clear();
  playerToRoom.clear();
  vi.clearAllMocks();
});

const createClientConnection = () => {
  const socket = clientIO(`http://localhost:${TEST_PORT}`, { multiplex: false });
  return new Promise((resolve, reject) => {
    socket.on('connect', () => resolve(socket));
    socket.on('connect_error', (err) => reject(err));
    setTimeout(() => reject(new Error('Socket connection timed out.')), 1500);
  });
};

const cleanupSockets = (...sockets) => {
  sockets.forEach(s => {
    if (s?.connected) s.disconnect();
  });
};

describe('Server - HTTP Routes', () => {
  test('GET / should return server status', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/`);
    const text = await res.text();
    expect(text).toBe('TopDown Tactix Server is running smoothly.');
  });
});

describe('Server - Lobby and Matchmaking', () => {
  afterEach(() => cleanupSockets(clientSocket1, clientSocket2));

  test('should return lobby status', async () => {
    clientSocket1 = await createClientConnection();
    const status = await new Promise((resolve) => {
      clientSocket1.emit('request-lobby-status');
      clientSocket1.on('lobby-status', resolve);
    });
    expect(status).toHaveProperty('totalOnline');
    expect(status).toHaveProperty('inQueue', 0);
  });

  test('should add player to queue on find-match and cancel-match', async () => {
    clientSocket1 = await createClientConnection();
    
    clientSocket1.emit('find-match');
    await waitFor(() => waitingQueue.includes(clientSocket1.id));
    
    clientSocket1.emit('cancel-match');
    await waitFor(() => !waitingQueue.includes(clientSocket1.id));
  });

  test('should ignore duplicate find-match requests', async () => {
    clientSocket1 = await createClientConnection();
    
    clientSocket1.emit('find-match');
    clientSocket1.emit('find-match');
    await waitFor(() => waitingQueue.length > 0);
    
    expect(waitingQueue.filter(id => id === clientSocket1.id).length).toBe(1);
  });

  test('should start a game when two players join the queue', async () => {
    clientSocket1 = await createClientConnection();
    clientSocket2 = await createClientConnection();
    
    clientSocket1.emit('find-match');
    clientSocket2.emit('find-match');
    
    await waitFor(() => onlineSessions.size === 1);
    
    expect(waitingQueue.length).toBe(0);
    expect(playerToRoom.has(clientSocket1.id)).toBe(true);
    expect(playerToRoom.has(clientSocket2.id)).toBe(true);
  });

  test('should tear down existing game if player requests find-match while in game', async () => {
    clientSocket1 = await createClientConnection();
    clientSocket2 = await createClientConnection();
    startNewGame(clientSocket1.id, clientSocket2.id);

    const opponentDisconnectPromise = new Promise(resolve => {
      clientSocket2.on('opponent-disconnected', resolve);
    });

    clientSocket1.emit('find-match');
    await opponentDisconnectPromise;

    expect(onlineSessions.size).toBe(0);
    expect(playerToRoom.has(clientSocket2.id)).toBe(false);
  });
});

describe('Server - In-Game Data Requests', () => {
  afterEach(() => cleanupSockets(clientSocket1, clientSocket2));

  test('should safely handle data requests when player is not in a room', async () => {
    clientSocket1 = await createClientConnection();
    
    clientSocket1.emit('request-my-team');
    clientSocket1.emit('request-score');
    
    await new Promise(r => setTimeout(r, 150));
    
    expect(playerToRoom.has(clientSocket1.id)).toBe(false);
  });

  test('request-my-team and request-score should return correct data', async () => {
    clientSocket1 = await createClientConnection();
    clientSocket2 = await createClientConnection();
    startNewGame(clientSocket1.id, clientSocket2.id);
    
    const teamPromise = new Promise(resolve => {
      clientSocket1.emit('request-my-team');
      clientSocket1.on('player-assignment', resolve);
    });

    const scorePromise = new Promise(resolve => {
      clientSocket1.emit('request-score');
      clientSocket1.on('current-score', resolve);
    });

    const [teamInfo, scoreInfo] = await Promise.all([teamPromise, scorePromise]);
    expect(teamInfo.team).toBe('home');
    expect(scoreInfo).toEqual({ home: 0, away: 0 });
  });
});

describe('Server - Player Inputs and Pausing', () => {
  afterEach(() => cleanupSockets(clientSocket1, clientSocket2));

  test('should process valid player input', async () => {
    clientSocket1 = await createClientConnection();
    clientSocket2 = await createClientConnection();
    startNewGame(clientSocket1.id, clientSocket2.id);
    
    const roomId = playerToRoom.get(clientSocket1.id);
    const game = onlineSessions.get(roomId).instance;
    GamePhysicsEngine.isValidMove.mockReturnValue(true);
    
    clientSocket1.emit('player-input', { id: clientSocket1.id, move: { x: 1, y: 0 } });
    await waitFor(() => game.setPlayerInput.mock.calls.length > 0);
    
    expect(game.setPlayerInput).toHaveBeenCalledWith(clientSocket1.id, { x: 1, y: 0 });
  });

  test('should fully pause game when both players request pause', async () => {
    clientSocket1 = await createClientConnection();
    clientSocket2 = await createClientConnection();
    startNewGame(clientSocket1.id, clientSocket2.id);
    
    const roomId = playerToRoom.get(clientSocket1.id);
    const game = onlineSessions.get(roomId).instance;

    clientSocket1.emit('pause-game', true);
    await waitFor(() => game.isPausePending === true);

    clientSocket2.emit('pause-game', true);
    await waitFor(() => game.isPaused === true);

    expect(game.isPausePending).toBe(false);
    expect(game.pauseRequestedBy).toBe(null);
  });
  
  test('should toggle pause states correctly for single player', async () => {
    clientSocket1 = await createClientConnection();
    clientSocket2 = await createClientConnection();
    startNewGame(clientSocket1.id, clientSocket2.id);
    
    const roomId = playerToRoom.get(clientSocket1.id);
    const game = onlineSessions.get(roomId).instance;

    clientSocket1.emit('pause-game', true);
    await waitFor(() => game.isPausePending === true);

    clientSocket1.emit('pause-game', false);
    await waitFor(() => game.isPausePending === false);
    expect(game.triggerCountdown).toHaveBeenCalled();
  });
});

describe('Server - Game Loop and Internal Callbacks', () => {
  afterEach(() => cleanupSockets(clientSocket1, clientSocket2));

  test('game loop should emit game-state and update physics', async () => {
    clientSocket1 = await createClientConnection();
    clientSocket2 = await createClientConnection();
    
    const statePromise = new Promise(resolve => {
      clientSocket1.on('game-state', resolve);
    });

    startNewGame(clientSocket1.id, clientSocket2.id);
    const roomId = playerToRoom.get(clientSocket1.id);
    const game = onlineSessions.get(roomId).instance;
    game.isCountdownActive = false; 

    await statePromise;
    expect(game.applyInputs).toHaveBeenCalled();
    expect(game.update).toHaveBeenCalled();
  });

  test('should emit pause-timer while paused', async () => {
    clientSocket1 = await createClientConnection();
    clientSocket2 = await createClientConnection();
    
    const pauseTimerPromise = new Promise(resolve => {
      clientSocket1.on('pause-timer', resolve);
    });

    startNewGame(clientSocket1.id, clientSocket2.id);
    const roomId = playerToRoom.get(clientSocket1.id);
    const game = onlineSessions.get(roomId).instance;
    
    game.isPaused = true;
    
    const timeRemaining = await pauseTimerPromise;
    expect(timeRemaining).toBeLessThan(30);
  });
});

describe('Server - Disconnects', () => {
  afterEach(() => cleanupSockets(clientSocket1, clientSocket2));

  test('should cleanly handle disconnects when user is not in queue or game', async () => {
    clientSocket1 = await createClientConnection();
    
    clientSocket1.disconnect();
    await new Promise(r => setTimeout(r, 150));
    
    expect(playerToRoom.has(clientSocket1.id)).toBe(false);
  });

  test('should handle game over from game loop status check', async () => {
    clientSocket1 = await createClientConnection();
    clientSocket2 = await createClientConnection();
    
    startNewGame(clientSocket1.id, clientSocket2.id);
    const roomId = playerToRoom.get(clientSocket1.id);
    const game = onlineSessions.get(roomId).instance;

    const gameOverPromise = new Promise(resolve => {
      clientSocket1.on('game-over', resolve);
    });

    game.getGameStatus.mockReturnValue({ winner: 'home', reason: 'goal' });
    
    const gameOverData = await gameOverPromise;
    expect(gameOverData.winner).toBe('home');
    expect(onlineSessions.size).toBe(0);
  });

  test('should handle forfeit on disconnect', async () => {
    clientSocket1 = await createClientConnection();
    clientSocket2 = await createClientConnection();
    startNewGame(clientSocket1.id, clientSocket2.id);
    
    const gameOverPromise = new Promise(resolve => {
      clientSocket2.on('game-over', resolve);
    });

    clientSocket1.disconnect();
    
    const gameOverData = await gameOverPromise;
    expect(gameOverData.reason).toBe('forfeit');
    expect(onlineSessions.size).toBe(0);
  });
});