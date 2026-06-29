import { Socket } from 'socket.io-client';
import type { GameScores } from './game';

export interface HomePageProps {
  onStartOffline: () => void;
  onStartOnline: () => void;
}

export interface MatchmakingModalProps {
  socket: Socket;
  onCancel: () => void;
  onMatchReady: () => void;
}

export interface OnlineGameCanvasProps {
  onExit: () => void;
}

export interface ScoreboardProps {
  scores: { home: number; away: number };
  timeLeft: number;
  isPausePending?: boolean;
  pauseRequestedBy?: string | null;
  mySocketId?: string | null;
  onPause: () => void;
  onAcceptPause?: () => void;
  isOnline?: boolean;
  isGameOver?: boolean;
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
  pauseTimeLeft?: number;
}

export interface CountdownOverlayProps {
  duration: number;
  onCountdownComplete?: () => void;
  onStateChange: (state: { isFrozen: boolean }) => void;
}

export type HelpView = 'main' | 'offline' | 'online';

export interface HelpModalProps {
  initialView?: HelpView;
  onClose: () => void;
}