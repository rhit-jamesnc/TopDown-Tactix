import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Matter from 'matter-js';
import './GameCanvas.css';

const socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:4000');
const TARGET_WIDTH = 1600;
const TARGET_HEIGHT = 900;

interface GameState {
  ball: { x: number; y: number };
  players: { [key: string]: { position: { x: number; y: number } } };
}

interface GoalData {
  scores: { home: number; away: number };
}

export const OnlineGameCanvas = () => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [scale, setScale] = useState(1);

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
    if (!sceneRef.current) return;

    const engine = Matter.Engine.create({ gravity: { x: 0, y: 0 } });
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: TARGET_WIDTH,
        height: TARGET_HEIGHT,
        wireframes: false,
        background: 'transparent',
      }
    });

    const visualBodies: Record<string, Matter.Body> = { 
      ball: Matter.Bodies.circle(TARGET_WIDTH / 2, TARGET_HEIGHT / 2, 15, { 
        isStatic: true,
        render: { fillStyle: '#ffffff' }
      }) 
    };
    Matter.World.add(engine.world, visualBodies.ball);
    Matter.Render.run(render);

    const createVisual = (id: string, color: string, radius: number) => {
      const body = Matter.Bodies.circle(TARGET_WIDTH / 2, TARGET_HEIGHT / 2, radius, { isStatic: true });
      body.render.fillStyle = color;
      visualBodies[id] = body;
      Matter.World.add(engine.world, body);
    };

    socket.on('game-state', (state: GameState) => {
        if (state.ball && visualBodies['ball']) {
            Matter.Body.setPosition(visualBodies['ball'], state.ball);
        }

        if (state.players) {
            Object.entries(state.players).forEach(([id, data]) => {
                if (!visualBodies[id]) {
                    createVisual(id, '#3b82f6', 25);
                }
                if (visualBodies[id]) {
                    Matter.Body.setPosition(visualBodies[id], data.position);
                }
            });
        }
    });

    socket.on('goal-scored', (data: GoalData) => {
      setScores({ p1: data.scores.home, p2: data.scores.away });
    });

    const activeKeys: Record<string, boolean> = {};
    const handleKeyDown = (e: KeyboardEvent) => { activeKeys[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { activeKeys[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const interval = setInterval(() => {
      const move = { x: 0, y: 0 };
      const FORCE = 0.012;
      if (activeKeys['w']) move.y -= FORCE;
      if (activeKeys['s']) move.y += FORCE;
      if (activeKeys['a']) move.x -= FORCE;
      if (activeKeys['d']) move.x += FORCE;

      if (move.x !== 0 || move.y !== 0) {
        socket.emit('player-input', { move, id: socket.id });
      }
    }, 1000 / 60);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(interval);
      socket.off('game-state');
      socket.off('goal-scored');
      
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
      if (render.canvas) render.canvas.remove();
    };
  }, []);

  return (
    <div className="scaling-wrapper">
      <div className="game-container" style={{ 
        width: TARGET_WIDTH, 
        height: TARGET_HEIGHT, 
        transform: `scale(${scale})`
      }}>
        <div ref={sceneRef} className="game-canvas" />
        <div className="pitch-overlay">
          <div className="center-line" />
          <div className="center-circle" />
          <div className="left-goal-crease" />
          <div className="right-goal-crease" />
          <div className="scoreboard">
              <span className="score-value">{scores.p1}</span>
              <span className="score-value">{scores.p2}</span>
          </div>
        </div>
        </div>
    </div>
  );
};