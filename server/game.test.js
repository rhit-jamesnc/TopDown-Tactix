import { io as clientIO } from 'socket.io-client';
import { expect, test, beforeAll, afterAll } from 'vitest';
import { httpServer } from './index.js';

let clientSocket;
const TEST_PORT = 9998;

beforeAll(() => {
  return new Promise((resolve) => httpServer.listen(TEST_PORT, resolve));
});

afterAll(() => {
  if (clientSocket?.connected) clientSocket.disconnect();
  return new Promise((resolve) => httpServer.close(resolve));
});

test('should broadcast game-state event', (done) => {
  clientSocket = clientIO(`http://localhost:${TEST_PORT}`);
  
  clientSocket.on('game-state', (data) => {
    expect(data).toBeDefined();
    done();
  });
});