import { Socket } from 'socket.io-client';
import type { GameScores } from './game';
import type { ReactNode } from 'react';

export interface HomePageProps {
  onStartOffline: () => void;
  onStartOnline: () => void;
  onStartCpu: (difficulty: 'academy' | 'reserves' | 'first-team') => void;
}

export interface SideMenuProps {
    isOpen: boolean;
}

export interface FeedbackModalProps {
    message: string;
    onClose: () => void;
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
  isCountdown?: boolean;
}

export interface GameOverModalProps {
  winner: string;
  reason: string;
  scores: GameScores;
  myTeam?: 'home' | 'away';
  onPlayAgain: () => void;
  onHome: () => void;
}

export type HelpView = 'main' | 'offline' | 'online' | 'cpu';

export interface PauseMenuProps {
  onResume: () => void;
  onQuit: () => void;
  pauseTimeLeft?: number;
  gameType: HelpView;
}

export interface CountdownOverlayProps {
  duration: number;
  onCountdownComplete?: () => void;
  onStateChange: (state: { isFrozen: boolean }) => void;
}

export interface HelpModalProps {
  initialView?: HelpView;
  onClose: () => void;
}

export interface DifficultySelectionProps {
  onSelect: (difficulty: 'academy' | 'reserves' | 'first-team') => void;
  onBack: () => void;
}

export interface Bug {
  id: string;
  timestamp: string;
  email: string;
  bug: string;
  status: 'active' | 'in-progress' | 'closed';
}

export interface ReportedBugsModalProps {
  bugs: Bug[];
  isAdmin: boolean;
}

export interface BugDetailsModalProps {
    bug: Bug;
    isAdmin: boolean;
    onClose: () => void;
    onStatusChange?: (id: number | string, newStatus: string) => void;
}

export interface ErrorBoundaryProp {
  children: ReactNode;
  fallbackMessage: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
}

export interface PanelWrapperProps {
  children: React.ReactNode;
}

export interface ActiveGamesModalProps {
  isAdmin: boolean;
}

export interface ActiveGameProps {
  roomId: string;
  players: string[];
  status: string;
  gameType: 'online' | 'local' | 'cpu';
  difficulty: string | null;
}

export interface ActiveGameDetailsProp {
    roomId: string;
    onClose: () => void;
}

export interface GameDetails {
    players: string[];
    score: { home: number; away: number } | null;
    timeLeft: number | null;
    status: string;
}

export interface AdminActionEvent {
  action: 'draw' | 'stop' | 'kick';
}

export interface GameStats {
  server: { ping: number; uptime: string; status: string };
  cpu: { academy: number; reserves: number; first: number };
  modes: { offline: number; online: number; cpu: number };
  activityTrend: number[];
}

export interface GameStatisticsModalProps {
  isLiveStats: boolean;
}

export interface SmoothLineChartProps {
  data: number[];
  color?: string;
}

export interface UpdatesModalProps {
  onClose: () => void;
}