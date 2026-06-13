import { io as clientIO } from 'socket.io-client';
import { expect, test, beforeAll, afterAll, beforeEach } from 'vitest';
import { httpServer, game, io } from './index.js';
import { Body } from 'matter-js';

const TEST_PORT = 9998;

beforeAll(() => {
  return new Promise((resolve) => httpServer.listen(TEST_PORT, resolve));
});

beforeEach(() => {
  Object.keys(game.players).forEach(id => game.removePlayer(id));
});

afterAll(() => {
  io.close(); 
  
  return new Promise((resolve) => {
    httpServer.close(resolve);
  });
});

const createClientConnection = (port) => {
  const socket = clientIO(`http://localhost:${port}`);
  return new Promise((resolve, reject) => {
    socket.on('connect', () => resolve(socket));
    socket.on('connect_error', (err) => reject(err));
    setTimeout(() => reject(new Error('Socket connection timed out.')), 1500);
  });
};

test('should broadcast game-state event', async () => {
  const socket = await createClientConnection(TEST_PORT);
  
  const state = await new Promise((resolve) => {
    socket.on('game-state', resolve);
  });
  
  expect(state).toHaveProperty('ball');
  expect(state).toHaveProperty('players');
  socket.disconnect();
});

test('should update player position on input', async () => {
  const socket = await createClientConnection(TEST_PORT);
  
  game.addPlayer('test-player', { x: 100, y: 100 });
  
  socket.emit('player-input', { id: 'test-player', move: { x: 0.02, y: 0 } });
  
  await new Promise((resolve) => setTimeout(resolve, 50));
  
  const player = game.players['test-player'];
  expect(player.position.x).toBeGreaterThan(100);
  socket.disconnect();
});

test('should add player to game engine on connection', async () => {
  const socket = await createClientConnection(TEST_PORT);
  
  await new Promise((resolve) => setTimeout(resolve, 50));
  
  expect(Object.keys(game.players).length).toBe(1);
  socket.disconnect();
});

test('should remove player from game engine on disconnection', async () => {
  const socket = await createClientConnection(TEST_PORT);
  await new Promise((resolve) => setTimeout(resolve, 50));
  
  socket.disconnect();
  await new Promise((resolve) => setTimeout(resolve, 50));
  
  expect(Object.keys(game.players).length).toBe(0);
});

test('should ignore malicious input with excessive force', async () => {
    const socket = await createClientConnection(TEST_PORT);
    game.addPlayer('malicious-player', { x: 100, y: 100 });
    
    socket.emit('player-input', { 
        id: 'malicious-player', 
        move: { x: 10, y: 0 } 
    });
    
    await new Promise(r => setTimeout(r, 50));
    
    const player = game.players['malicious-player'];
    expect(player.position.x).toBe(100); 
    
    socket.disconnect();
});

test('should emit a goal event when the ball crosses the goal line', async () => {
  const socket = await createClientConnection(TEST_PORT);
  
  const goalEmitted = new Promise((resolve) => {
    socket.on('goal-scored', resolve);
  });

  Body.setPosition(game.ball, { x: -20, y: 300 });

  const eventData = await goalEmitted;
  expect(eventData).toHaveProperty('side');
  expect(['home', 'away']).toContain(eventData.side);
  
  socket.disconnect();
});