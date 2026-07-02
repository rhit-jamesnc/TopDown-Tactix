import { io as clientIO } from 'socket.io-client';
import { expect, test, beforeAll, afterAll } from 'vitest';
import { httpServer, games, startNewGame } from '../server.js';
import { Body } from 'matter-js';

let clientSocket;
const TEST_PORT = 9999;
const getActiveGame = () => Array.from(games.values())[0]?.instance;


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

test('should establish a real-time websocket connection', async () => {
  clientSocket = await createClientConnection(TEST_PORT);
  expect(clientSocket.connected).toBe(true);
});

test('should handle client disconnections cleanly on the server', async () => {
  const socket = await createClientConnection(TEST_PORT);
  
  expect(socket.connected).toBe(true);
  
  socket.disconnect();
  expect(socket.connected).toBe(false);
});

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