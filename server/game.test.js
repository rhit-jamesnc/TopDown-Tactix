import { io as clientIO } from 'socket.io-client';
import { expect, test, beforeAll, afterAll } from 'vitest';
import { httpServer, game } from './index.js';

let clientSocket;
const TEST_PORT = 9998;

beforeAll(() => {
  return new Promise((resolve) => httpServer.listen(TEST_PORT, resolve));
});

afterAll(() => {
  if (clientSocket?.connected) clientSocket.disconnect();
  return new Promise((resolve) => httpServer.close(resolve));
});

const createClientConnection = (port) => {
  const socket = clientIO(`http://localhost:${port}`);
  return new Promise((resolve, reject) => {
    socket.on('connect', () => resolve(socket));
    socket.on('connect_error', (err) => reject(err));
    setTimeout(() => reject(new Error('Socket connection timed out.')), 1500);
  });
};

test('should broadcast game-state event', (done) => {
  clientSocket = clientIO(`http://localhost:${TEST_PORT}`);
  
  clientSocket.on('game-state', (data) => {
    expect(data).toHaveProperty('ball');
    expect(data).toHaveProperty('players');
    done();
  });
});

test('should update player position on input', (done) => {
  const socket = clientIO(`http://localhost:${TEST_PORT}`);
  
  game.addPlayer('test-player', { x: 100, y: 100 });
  
  socket.emit('player-input', { id: 'test-player', move: { x: 10, y: 0 } });
  
  setTimeout(() => {
    const player = game.players['test-player'];
    expect(player.position.x).toBeGreaterThan(100);
    done();
  }, 50);
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