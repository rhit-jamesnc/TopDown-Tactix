import { io as clientIO } from 'socket.io-client';
import { expect, test, beforeAll, afterAll } from 'vitest';
import { httpServer } from './index.js';

let clientSocket;
const TEST_PORT = 9999;

beforeAll(() => {
  return new Promise((resolve) => {
    httpServer.listen(TEST_PORT, () => {
      resolve();
    });
  });
});

afterAll(() => {
  if (clientSocket && clientSocket.connected) {
    clientSocket.disconnect();
  }
  return new Promise((resolve) => {
    httpServer.close(() => {
      resolve();
    });
  });
});

test('should establish a real-time websocket connection', () => {
  clientSocket = clientIO(`http://localhost:${TEST_PORT}`);
  
  return new Promise((resolve, reject) => {
    clientSocket.on('connect', () => {
      expect(clientSocket.connected).toBe(true);
      resolve();
    });
    
    clientSocket.on('connect_error', (err) => {
      reject(err);
    });
    
    setTimeout(() => {
      reject(new Error('Connection timed out!'));
    }, 1000);
  });
});