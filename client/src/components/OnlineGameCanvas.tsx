import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Matter from 'matter-js';
import './GameCanvas.css';

const socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:4000');

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

  useEffect(() => {
    if (!sceneRef.current) return;

    const PITCH_WIDTH = window.innerWidth;
    const PITCH_HEIGHT = window.innerHeight;
    
    // 1. Setup Engine & Renderer
    const engine = Matter.Engine.create({ gravity: { x: 0, y: 0 } });
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: PITCH_WIDTH,
        height: PITCH_HEIGHT,
        wireframes: false,
        background: 'transparent',
      }
    });

    // 2. Camera Focus: Ensure we see the whole pitch
    Matter.Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: PITCH_WIDTH, y: PITCH_HEIGHT }
    });

    const visualBodies: { [key: string]: Matter.Body } = {};
    
    const createVisual = (id: string, color: string, radius: number) => {
      const body = Matter.Bodies.circle(PITCH_WIDTH/2, PITCH_HEIGHT/2, radius, { isStatic: true });
      body.render.fillStyle = color;
      visualBodies[id] = body;
      Matter.World.add(engine.world, body);
    };

    createVisual('ball', '#ffffff', 15);

    // 3. Start Render and Runner Loops
    Matter.Render.run(render);
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // 4. Listen for Server State
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

    // 5. Input Handling
    const activeKeys: { [key: string]: boolean } = {};
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
      
      // Proper Cleanup
      Matter.Runner.stop(runner);
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
    };
  }, []);

  return (
    <div className="game-container">
      <div ref={sceneRef} className="game-canvas" />
      <div className="pitch-overlay">
        <div className="center-line" />
        <div className="center-circle" />
        <div className="scoreboard">
            <span className="score-value">{scores.p1}</span>
            <span className="score-value">{scores.p2}</span>
        </div>
      </div>
    </div>
  );
};