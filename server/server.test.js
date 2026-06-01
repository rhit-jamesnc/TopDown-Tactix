import { io } from 'socket.io-client';
import { expect, test } from 'vitest';

let clientSocket;

test('should establish a real-time websocket connection', () => {
  clientSocket = io('http://localhost:9999');
  
  return new Promise((resolve, reject) => {
    clientSocket.on('connect', () => {
      expect(clientSocket.connected).toBe(true);
      resolve();
    });
    
    setTimeout(() => {
      reject(new Error('Connection timed out as expected for failing step!'));
    }, 1000);
  });
});