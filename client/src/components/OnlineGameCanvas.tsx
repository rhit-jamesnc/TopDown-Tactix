import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Matter from 'matter-js';
import { MatchmakingModal } from './MatchmakingModal';
import { GameOverModal } from './GameOverModal';
import type { GameState, GameResult } from "../../../shared/types/game"
import type { OnlineGameCanvasProps} from "../../../shared/types/props"
import './GameCanvas.css';
import './MatchmakingModal.css';

const socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:4000');

const TARGET_WIDTH = 1600;
const TARGET_HEIGHT = 900;

export const OnlineGameCanvas = ({ onExit }: OnlineGameCanvasProps) => {
  const [isSearching, setIsSearching] = useState(true);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [myTeam, setMyTeam] = useState<'home' | 'away' | undefined>(undefined);
  const [scores, setScores] = useState({ home: 0, away: 0 });
  const [scale, setScale] = useState(1);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameOver, setGameOver] = useState<GameResult | null>(null);

  useEffect(() => {
    socket.on('match-found', () => {
      setIsSearching(false);
    });

    if (!isSearching) {
      socket.emit('request-my-team');
    }

    return () => {
      socket.off('match-found');
    };
  }, [isSearching]);

  useEffect(() => {
    const updateScale = () => {
      const scaleX = window.innerWidth / TARGET_WIDTH;
      const scaleY = window.innerHeight / TARGET_HEIGHT;
      setScale(Math.min(scaleX, scaleY));
    };
    window.addEventListener('resize', updateScale);
    updateScale();
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  useEffect(() => {
    const handleMatchFound = () => setIsSearching(false);
    socket.on('match-found', handleMatchFound);

    if (isSearching || !sceneRef.current) return;

    const engine = Matter.Engine.create({ gravity: { x: 0, y: 0 } });
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: { width: TARGET_WIDTH, height: TARGET_HEIGHT, wireframes: false, background: 'transparent' }
    });

    const visualBodies: Record<string, Matter.Body> = { 
      ball: Matter.Bodies.circle(TARGET_WIDTH / 2, TARGET_HEIGHT / 2, 15, { isStatic: true, render: { fillStyle: '#ffffff' } }) 
    };
    Matter.World.add(engine.world, visualBodies.ball);
    Matter.Render.run(render);

    const createVisual = (id: string, color: string, radius: number) => {
      const body = Matter.Bodies.circle(TARGET_WIDTH / 2, TARGET_HEIGHT / 2, radius, { isStatic: true });
      body.render.fillStyle = color;
      visualBodies[id] = body;
      Matter.World.add(engine.world, body);
    };

    const handleGameState = (state: GameState) => {
      if (!socket.id) return;

      const playerIds = Object.keys(state.players);
      if (!playerIds.includes(socket.id)) return;

      if (state.ball && visualBodies['ball']) Matter.Body.setPosition(visualBodies['ball'], state.ball);
      
      Object.entries(state.players).forEach(([id, data]) => {
        if (!visualBodies[id]) createVisual(id, (id === socket.id) ? 'blue' : 'red', 25);
        if (visualBodies[id]) {
          Matter.Body.setPosition(visualBodies[id], data.position);
          visualBodies[id].render.fillStyle = id === socket.id ? 'blue' : 'red';
        }
      });
      
      const serverIds = Object.keys(state.players);
      Object.keys(visualBodies).forEach(id => {
        if (id !== 'ball' && !serverIds.includes(id)) {
          Matter.World.remove(engine.world, visualBodies[id]);
          delete visualBodies[id];
        }
      });
    };

    const handleDisconnect = (id: string) => {
      if (visualBodies[id]) {
        Matter.World.remove(engine.world, visualBodies[id]);
        delete visualBodies[id];
      }
    };

    socket.on('game-state', handleGameState);
    socket.on('player-disconnected', handleDisconnect);
    socket.on('current-score', (data) => setScores({ home: data.home, away: data.away }));
    socket.on('goal-scored', (data) => setScores({ home: data.scores.home, away: data.scores.away }));
    socket.emit('request-score');
    socket.on('player-assignment', (data) => setMyTeam(data.team));

    const activeKeys: Record<string, boolean> = {};
    const handleKeyDown = (e: KeyboardEvent) => { activeKeys[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { activeKeys[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const interval = setInterval(() => {
      const move = { x: 0, y: 0 };
      const FORCE = 0.012;
      if (activeKeys['w'] || activeKeys['arrowup']) move.y -= FORCE;
      if (activeKeys['s'] || activeKeys['arrowdown']) move.y += FORCE;
      if (activeKeys['a'] || activeKeys['arrowleft']) move.x -= FORCE;
      if (activeKeys['d'] || activeKeys['arrowright']) move.x += FORCE;
      if (socket.id && (move.x !== 0 || move.y !== 0)) {
        socket.emit('player-input', { move, id: socket.id });
      }
    }, 1000 / 60);
    

    socket.on('game-over', (data) => {
      if (!socket.id) {
        console.error("Game over received, but socket ID is missing.");
        return;
      }
    
      const myId = socket.id;
      const myRole = data.players[myId];
      setMyTeam(myRole);

      setGameOver({
          winner: data.winner,
          reason: data.reason
      });
    });

    socket.on('game-timer', (time) => setTimeLeft(time));

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(interval);
      socket.off('match-found', handleMatchFound);
      socket.off('game-state', handleGameState);
      socket.off('player-disconnected', handleDisconnect);
      socket.off('current-score');
      socket.off('goal-scored');
      socket.off('player-assignment');
      socket.off('game-over');
      socket.off('game-timer');
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
      if (render.canvas) render.canvas.remove();
    };
  }, [isSearching]);

  const handlePlayAgain = () => {
    setGameOver(null);
    setScores({ home: 0, away: 0 });
    
    setMyTeam(undefined);
    setIsSearching(true);

    socket.emit('find-match');
  };

  return (
    <div className="scaling-wrapper">
      {gameOver && (
        <GameOverModal 
          winner={gameOver.winner}
          reason={gameOver.reason}
          scores={{ home: scores.home, away: scores.away }}
          myTeam={myTeam}
          onPlayAgain={handlePlayAgain}
          onHome={() => window.location.href = '/'}
        />
      )}
      {isSearching ? (
        <MatchmakingModal 
          socket={socket} 
          onCancel={() => {
            socket.emit('cancel-match');
            onExit();
          }} 
        />
      ) : (
        <div className="game-container-online" style={{ 
          transform: `scale(${scale})`
        }}>
          <div className="title-overlay-internal">TopDown Tactix</div>
          <div ref={sceneRef} className="game-canvas" />
          <div className="pitch-overlay">
            <div className="center-line" />
            <div className="center-circle" />
            <div className="left-goal-crease" />
            <div className="right-goal-crease" />
            <div className="scoreboard">
                <span className="score-value">{scores.home}</span>
                <span className="timer-display" style={{ color: 'white', margin: '0 20px' }}>
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </span>
                <span className="score-value">{scores.away}</span>
            </div>
          </div>
        </div>
        )}
    </div>
  );
};