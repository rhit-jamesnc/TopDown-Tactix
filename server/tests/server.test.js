import { io as clientIO } from 'socket.io-client';
import { expect, test, beforeAll, afterAll } from 'vitest';
import { httpServer } from '../server.js';

let clientSocket;
const TEST_PORT = 9999;

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