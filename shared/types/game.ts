export interface GameState {
  ball: { x: number; y: number };
  players: { [key: string]: { position: { x: number; y: number } } };
}

export interface GameResult {
  winner: string;
  reason: string;
}

export interface GameScores {
  home: number;
  away: number;
}

export interface GameOverModalProps {
  winner: string;
  reason: string;
  scores: GameScores;
  onPlayAgain: () => void;
  onHome: () => void;
}