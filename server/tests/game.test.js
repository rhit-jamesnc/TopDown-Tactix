import { io as clientIO } from 'socket.io-client';
import { expect, test, beforeAll, afterAll, beforeEach } from 'vitest';
import { httpServer, io, games, startNewGame } from '../index.js';
import { Body } from 'matter-js';

const TEST_PORT = 9998;
const getActiveGame = () => Array.from(games.values())[0]?.instance;

beforeAll(() => {
  return new Promise((resolve) => httpServer.listen(TEST_PORT, resolve));
});

beforeEach(() => {
  games.clear();
});

afterAll(() => {
  io.close(); 
  
  return new Promise((resolve) => {
    httpServer.close(resolve);
  });
});

const createClientConnection = (port) => {
  const socket = clientIO(`http://localhost:${port}`);
  return new Promise((resolve) => {
    socket.on('connect', () => resolve(socket));
  });
};

test('should broadcast game-state event', async () => {
  const socket = await createClientConnection(TEST_PORT);
  
  startNewGame(socket.id, 'away');
  
  const state = await new Promise((resolve) => {
    socket.on('game-state', resolve);
  });
  
  expect(state).toHaveProperty('ball');
  expect(state).toHaveProperty('players');
  socket.disconnect();
});

test('should update player position on input', async () => {
  const socket = await createClientConnection(TEST_PORT);
  
  startNewGame('home', 'away'); 
  const game = getActiveGame();
  
  socket.emit('player-input', { id: 'home', move: { x: 0.05, y: 0 } });

  await new Promise(resolve => setTimeout(resolve, 50));
  
  for(let i=0; i<10; i++) {
    game.update();
  };
  
  const player = game.players['home'];
  expect(player.velocity.x).toBeGreaterThan(0);
  expect(player.position.x).toBeGreaterThan(100);
  socket.disconnect();
});

test('should add player to game engine on connection', async () => {
  const socket = await createClientConnection(TEST_PORT);
  
  startNewGame(socket.id, 'away');
  const game = getActiveGame();
  
  expect(Object.keys(game.players).length).toBe(2);
  socket.disconnect();
});

test('should remove player from game engine on disconnection', async () => {
  const socket = await createClientConnection(TEST_PORT);
  await new Promise((resolve) => setTimeout(resolve, 50));
  
  socket.disconnect();
  await new Promise((resolve) => setTimeout(resolve, 150));
  
  expect(games.size).toBe(0);
});

test('should ignore malicious input with excessive force', async () => {
  const socket = await createClientConnection(TEST_PORT);
  startNewGame('home', 'away');
  const game = getActiveGame();
    
  socket.emit('player-input', { id: 'home', move: { x: 10, y: 0 } });
  await new Promise(r => setTimeout(r, 50));
    
  const player = game.players['home'];
  expect(player.position.x).toBe(400); 
  socket.disconnect();
});

test('should emit a goal event when the ball crosses the goal line', async () => {
  const socket = await createClientConnection(TEST_PORT);
  
  startNewGame(socket.id, 'away');
  const game = getActiveGame();
  
  const goalEmitted = new Promise((resolve) => socket.on('goal-scored', resolve));
  Body.setPosition(game.ball, { x: -20, y: 450 });
  game.update();

  const eventData = await goalEmitted;
  expect(eventData).toHaveProperty('side');
  socket.disconnect();
});

test('should reset ball and player positions after a goal', async () => {
  startNewGame('home', 'away');
  const game = getActiveGame();

  Body.setPosition(game.ball, { x: -20, y: 450 });
  game.resetPitch();

  expect(game.ball.position.x).toBeCloseTo(800, 0);
  expect(game.ball.position.y).toBeCloseTo(450, 0);
});