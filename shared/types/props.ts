import { Socket } from 'socket.io-client';
import type { GameScores } from './game';

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

export interface GameOverModalProps {
  winner: string;
  reason: string;
  scores: GameScores;
  myTeam?: 'home' | 'away';
  onPlayAgain: () => void;
  onHome: () => void;
}

export interface PauseMenuProps {
  onResume: () => void;
  onQuit: () => void;
}