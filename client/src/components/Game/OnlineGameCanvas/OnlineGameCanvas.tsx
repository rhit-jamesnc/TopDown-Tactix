import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Matter from 'matter-js';
import { MatchmakingModal } from '../../Modals/MatchmakingModal/MatchmakingModal'
import { GameOverModal } from '../../Modals/GameOverModal/GameOverModal';
import { PauseMenuModal } from '../../Modals/PauseMenuModal/PauseMenuModal';
import { Scoreboard } from '../Scoreboard/Scoreboard';
import { CountdownOverlay } from '../CountdownOverlay/CountdownOverlay';
import type { GameState, GameResult } from "../../../../../shared/types/game"
import type { OnlineGameCanvasProps} from "../../../../../shared/types/props"
import '../GameCanvas.css';
import '../../Modals/MatchmakingModal/MatchmakingModal.css'

const socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:4000');

const TARGET_WIDTH = 1600;
const TARGET_HEIGHT = 900;

const GAME_EVENTS = [
  'match-found', 'game-state', 'player-disconnected', 'current-score',
  'goal-scored', 'player-assignment', 'game-over', 'game-timer',
  'pause-pending', 'game-paused'
];

export const OnlineGameCanvas = ({ onExit }: OnlineGameCanvasProps) => {
  const [isSearching, setIsSearching] = useState(true);
  const engineRef = useRef<Matter.Engine | null>(null);
  const visualBodiesRef = useRef<Record<string, Matter.Body>>({});
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const [isPausePending, setIsPausePending] = useState(false);
  const isPausePendingRef = useRef(false);
  const [pauseRequestedBy, setPauseRequestedBy] = useState<string | null>(null);
  const pauseRequestedByRef = useRef<string | null>(null);
  const isTogglingPause = useRef(false);
  const [pauseTimeLeft, setPauseTimeLeft] = useState(30);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [myTeam, setMyTeam] = useState<'home' | 'away' | undefined>(undefined);
  const [scores, setScores] = useState({ home: 0, away: 0 });
  const [scale, setScale] = useState(1);
  const [timeLeft, setTimeLeft] = useState(180);
  const [gameOver, setGameOver] = useState<GameResult | null>(null);
  const [isGameOverSignal, setIsGameOverSignal] = useState(false);
  const isCountdownFrozenRef = useRef(true);
  const [countdownKey, setCountdownKey] = useState(0);
  const [countdownDuration, setCountdownDuration] = useState(5);
  const [isCountdown, setIsCountdown] = useState(false);
  const isCountdownRef = useRef(false);

  const cleanupEvents = useCallback(() => {
    GAME_EVENTS.forEach(event => socket.off(event));
  }, []);

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
    engineRef.current = engine;
    
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: { width: TARGET_WIDTH, height: TARGET_HEIGHT, wireframes: false, background: 'transparent' }
    });

    visualBodiesRef.current = { 
      ball: Matter.Bodies.circle(TARGET_WIDTH / 2, TARGET_HEIGHT / 2, 15, { isStatic: true, render: { fillStyle: '#ffffff' } }) 
    };

    Matter.World.add(engine.world, visualBodiesRef.current.ball);
    Matter.Render.run(render);

    const createVisual = (id: string, color: string, radius: number) => {
      const body = Matter.Bodies.circle(TARGET_WIDTH / 2, TARGET_HEIGHT / 2, radius, { isStatic: true });
      body.render.fillStyle = color;
      visualBodiesRef.current[id] = body;
      Matter.World.add(engine.world, body);
    };

    const handleGameState = (state: GameState) => {
      if (!socket.id) return;

      const playerIds = Object.keys(state.players);
      if (!playerIds.includes(socket.id)) return;

      if (!engineRef.current) return;
      const engine = engineRef.current;
      const visualBodies = visualBodiesRef.current;

      if (state.ball && visualBodies['ball']) Matter.Body.setPosition(visualBodiesRef.current['ball'], state.ball);
      
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
      if (visualBodiesRef.current[id]) {
        Matter.World.remove(engine.world, visualBodiesRef.current[id]);
        delete visualBodiesRef.current[id];
      }
    };

    socket.on('game-state', handleGameState);
    socket.on('player-disconnected', handleDisconnect);
    socket.on('current-score', (data) => setScores({ home: data.home, away: data.away }));
    socket.on('player-assignment', (data) => setMyTeam(data.team));
    socket.on('pause-timer', (time) => setPauseTimeLeft(time));
    socket.emit('request-score');

    socket.on('goal-scored', (data) => {
      if (isCountdownRef.current) return;
      setScores({ home: data.scores.home, away: data.scores.away });
      isCountdownFrozenRef.current = true;
      setCountdownDuration(3);
      setCountdownKey(prev => prev + 1);
    });

    socket.on('pause-pending', (data: { pending: boolean; requestedBy: string }) => {
      isPausePendingRef.current = data.pending;
      setIsPausePending(data.pending);
      setPauseRequestedBy(data.requestedBy);
      pauseRequestedByRef.current = data.requestedBy;
    });

    socket.on('game-paused', (paused) => {
      const wasPaused = isPausedRef.current;
      isPausedRef.current = paused;
      setIsPaused(paused);
      if (paused) {
        isPausePendingRef.current = false;
        setIsPausePending(false);
        setPauseRequestedBy(null);
        pauseRequestedByRef.current = null;
      } else if (wasPaused) {
        isCountdownFrozenRef.current = true;
        setCountdownDuration(3);
        setCountdownKey(prev => prev + 1);
      }
    });

    const activeKeys: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => { 
      if (e.key === 'Escape') {
        if (isCountdownRef.current) return;
        if (isTogglingPause.current) return;

        isTogglingPause.current = true;
        setTimeout(() => { isTogglingPause.current = false; }, 300);

        if (isPausedRef.current) {
          socket.emit('pause-game', false);
        } else if (isPausePendingRef.current) {
          const isMyRequest = pauseRequestedByRef.current === socket.id;

          if (isMyRequest) {
            socket.emit('pause-game', false);
          } else {
            socket.emit('pause-game', true);
          }
        } else {
          socket.emit('pause-game', true);
        }
      }
      activeKeys[e.key.toLowerCase()] = true; 
    };

    const handleKeyUp = (e: KeyboardEvent) => { activeKeys[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const interval = setInterval(() => {
      if (isPausedRef.current || isCountdownFrozenRef.current) return;

      const move = { x: 0, y: 0 };
      const FORCE = 0.012;
      
      if (activeKeys['w'] || activeKeys['arrowup']) move.y -= FORCE;
      if (activeKeys['s'] || activeKeys['arrowdown']) move.y += FORCE;
      if (activeKeys['a'] || activeKeys['arrowleft']) move.x -= FORCE;
      if (activeKeys['d'] || activeKeys['arrowright']) move.x += FORCE;

      if (socket.id) {
        socket.emit('player-input', { move, id: socket.id });
      }
    }, 1000 / 60);
    

    socket.on('game-over', (data) => {
      setIsGameOverSignal(true);
      isCountdownFrozenRef.current = true;

      if (!socket.id) {
        console.error("Game over received, but socket ID is missing.");
        return;
      }

      const myId = socket.id;
    
      setTimeout(() => {
        const myRole = data.players[myId];
        setMyTeam(myRole);

        setGameOver({
            winner: data.winner,
            reason: data.reason
        });
      }, 2000);
    });

    socket.on('game-timer', (time) => setTimeLeft(time));

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(interval);
      cleanupEvents();
      if (engineRef.current) {
        Matter.Render.stop(render);
        Matter.Engine.clear(engineRef.current);
      }
      if (render.canvas) render.canvas.remove();
    };
  }, [cleanupEvents, isSearching]);

  const clearGameVisuals = () => {
    const engine = engineRef.current;
    if (!engine) return;

    Object.keys(visualBodiesRef.current).forEach(id => {
      Matter.World.remove(engine.world, visualBodiesRef.current[id]);
      delete visualBodiesRef.current[id];
    });

    visualBodiesRef.current = {};
  };

  const handlePlayAgain = () => {
    clearGameVisuals();
    setIsGameOverSignal(false);
    setGameOver(null);
    setScores({ home: 0, away: 0 });

    setIsPaused(false);
    isPausedRef.current = false;
    
    setIsPausePending(false);
    isPausePendingRef.current = false;
    
    setPauseRequestedBy(null);
    if (pauseRequestedByRef) pauseRequestedByRef.current = null;
    
    setPauseTimeLeft(30);
    setCountdownKey(0);
    setCountdownDuration(5);
    
    setMyTeam(undefined);
    setIsSearching(true);
  };

  const handleStateChange = useCallback(({ isFrozen }: { isFrozen: boolean }) => {
    setIsCountdown(isFrozen);
    isCountdownRef.current = isFrozen;
  }, []);

  const handleCountdownComplete = useCallback(() => {
    setIsCountdown(false);
    isCountdownFrozenRef.current = false;
    isCountdownRef.current = false;
  }, []);

  return (
    <div className="scaling-wrapper">
      {isPaused && (
        <PauseMenuModal 
          pauseTimeLeft={pauseTimeLeft}
          onResume={() => {
            socket.emit('pause-game', false);
          }} 
          onQuit={() => {
            socket.emit('pause-game', false);
            socket.emit('cancel-match');
            window.location.href = '/';
          }}
          gameType='online'
        />
      )}
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
          onMatchReady={() => setIsSearching(false)}
        />
      ) : (
        <div className="game-container-online" style={{ 
          transform: `scale(${scale})`
        }}>
          <div ref={sceneRef} className="game-canvas" />

          <CountdownOverlay 
            key={countdownKey}
            duration={countdownDuration}
            onStateChange={handleStateChange}
            onCountdownComplete={handleCountdownComplete}
          />

          <div className="pitch-overlay">
            <div className="center-line" />
            <div className="center-circle" />
            <div className="left-goal-crease" />
            <div className="right-goal-crease" />
            <Scoreboard 
              scores={scores} 
              timeLeft={timeLeft} 
              isPausePending={isPausePending}
              pauseRequestedBy={pauseRequestedBy}
              mySocketId={socket.id || null}
              onPause={() => {
                if (isTogglingPause.current) return;
                isTogglingPause.current = true;
                setTimeout(() => { isTogglingPause.current = false; }, 300);

                if (isPausedRef.current || isPausePendingRef.current) {
                  socket.emit('pause-game', false);
                } else {
                  socket.emit('pause-game', true);
                }
              }}
              onAcceptPause={() => {
                socket.emit('pause-game', true); 
              }}
              isOnline={true}
              isGameOver={isGameOverSignal}
              isCountdown={isCountdown}
            />
          </div>
        </div>
        )}
    </div>
  );
};