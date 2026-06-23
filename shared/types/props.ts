import { Socket } from 'socket.io-client';

export interface HomePageProps {
  onStartOffline: () => void;
  onStartOnline: () => void;
}

export interface MatchmakingModalProps {
  socket: Socket;
  onCancel: () => void;
}

export interface OnlineGameCanvasProps {
  onExit: () => void;
}