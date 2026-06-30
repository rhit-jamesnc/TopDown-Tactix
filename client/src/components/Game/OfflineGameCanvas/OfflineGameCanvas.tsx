import { useEffect, useRef, useState } from 'react'
import Matter from 'matter-js'
import { GameManager } from '../../../../../server/gameManager'
import { GameOverModal } from '../../Modals/GameOverModal/GameOverModal'
import { PauseMenuModal } from '../../Modals/PauseMenuModal/PauseMenuModal';
import { Scoreboard } from '../Scoreboard/Scoreboard';
import { CountdownOverlay } from '../CountdownOverlay/CountdownOverlay'
import type { GameResult } from "../../../../../shared/types/game"

import '../GameCanvas.css'

export const OfflineGameCanvas = () => {
  const sceneRef = useRef<HTMLDivElement>(null)
  const [gameKey, setGameKey] = useState(0);
  const [scores, setScores] = useState({ home: 0, away: 0 })
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const [timeLeft, setTimeLeft] = useState(180);
  const [gameOver, setGameOver] = useState<GameResult | null>(null);
  const isCountdownFrozenRef = useRef(true);
  const [countdownKey, setCountdownKey] = useState(0);
  const [countdownDuration, setCountdownDuration] = useState(5);

  const triggerUnpauseCountdown = () => {
    if (!isCountdownFrozenRef.current) {
    isCountdownFrozenRef.current = true;
    setCountdownDuration(3);
    setCountdownKey(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (!sceneRef.current) return
 
    const PITCH_WIDTH = window.innerWidth
    const PITCH_HEIGHT = window.innerHeight

    const manager = new GameManager(PITCH_WIDTH, PITCH_HEIGHT)
    const physics = manager.physics;

    physics.addPlayer('home', { x: 200, y: PITCH_HEIGHT / 2 })
    physics.addPlayer('away', { x: PITCH_WIDTH - 200, y: PITCH_HEIGHT / 2 })

    physics.walls.forEach(w => w.render.visible = false)
    
    if (physics.leftGoalBlocker && physics.leftGoalBlocker.render) {
        physics.leftGoalBlocker.render.visible = false;
    }
    if (physics.rightGoalBlocker && physics.rightGoalBlocker.render) {
        physics.rightGoalBlocker.render.visible = false;
}

    if (physics.ball) {
        physics.ball.render.fillStyle = '#ffffff';
    }

    const players = physics.players as { [key: string]: Matter.Body };

    if (players['home']) players['home'].render.fillStyle = 'red';
    if (players['away']) players['away'].render.fillStyle = 'blue';

    manager.onGoal((team: string) => {
        if (team === 'away') {
            setScores(prev => ({ ...prev, away: prev.away + 1 }))
        } else {
            setScores(prev => ({ ...prev, home: prev.home + 1 }))
        }

        isCountdownFrozenRef.current = true;
        manager.resetPitch();

        setCountdownDuration(3);
        setCountdownKey(prev => prev + 1);
    })

    const render = Matter.Render.create({
        element: sceneRef.current,
        engine: physics.engine,
        options: {
            width: PITCH_WIDTH,
            height: PITCH_HEIGHT,
            wireframes: false,
            background: 'transparent',
        }
    })
    
    Matter.Render.run(render)

    const activeKeys: { [key: string]: boolean } = {}
    const handleKeyDown = (e: KeyboardEvent) => { 
        if (e.key === 'Escape') {
            const nextPaused = !isPausedRef.current;
            if (!nextPaused) triggerUnpauseCountdown();
            isPausedRef.current = nextPaused;
            setIsPaused(nextPaused);
        }
        activeKeys[e.key.toLowerCase()] = true 
    }
    const handleKeyUp = (e: KeyboardEvent) => { activeKeys[e.key.toLowerCase()] = false }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    let animationFrameId: number
    const FORCE_MAGNITUDE = 0.012

    const tick = () => {
        if (isPausedRef.current || isCountdownFrozenRef.current) {
            animationFrameId = requestAnimationFrame(tick);
            return;
        }

        const status = manager.getGameStatus();
        if (status !== 'ongoing' || manager.timer <= 0) {
            cancelAnimationFrame(animationFrameId);

            const gameStatus = status as { winner: string, reason: string };

            setGameOver({
                winner: gameStatus.winner,
                reason: gameStatus.reason
            });
            return;
        }

        const homeImpulse = { x: 0, y: 0 }
        const awayImpulse = { x: 0, y: 0 }

        if (activeKeys['w']) homeImpulse.y -= FORCE_MAGNITUDE
        if (activeKeys['s']) homeImpulse.y += FORCE_MAGNITUDE
        if (activeKeys['a']) homeImpulse.x -= FORCE_MAGNITUDE
        if (activeKeys['d']) homeImpulse.x += FORCE_MAGNITUDE

        if (activeKeys['arrowup']) awayImpulse.y -= FORCE_MAGNITUDE
        if (activeKeys['arrowdown']) awayImpulse.y += FORCE_MAGNITUDE
        if (activeKeys['arrowleft']) awayImpulse.x -= FORCE_MAGNITUDE
        if (activeKeys['arrowright']) awayImpulse.x += FORCE_MAGNITUDE

        const players = physics.players as { [key: string]: Matter.Body };

        if (homeImpulse.x !== 0 || homeImpulse.y !== 0) {
            Matter.Body.applyForce(players['home'], players['home'].position, homeImpulse)
        }
        if (awayImpulse.x !== 0 || awayImpulse.y !== 0) {
            Matter.Body.applyForce(players['away'], players['away'].position, awayImpulse)
        }

        manager.update(1/60);
        setTimeLeft(manager.getRemainingTime());

        animationFrameId = requestAnimationFrame(tick)
    }

    tick()

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      cancelAnimationFrame(animationFrameId)
      Matter.Render.stop(render)
      Matter.Engine.clear(physics.engine)
      render.canvas.remove()
    }
  }, [gameKey])

  const handlePlayAgain = () => {
    setGameOver(null);
    setScores({ home: 0, away: 0 });
    setCountdownKey(0);
    setCountdownDuration(5);
    setGameKey(prev => prev + 1);
  };

  return (
    <div className="game-container-offline" key={gameKey}>
      {isPaused && (
        <PauseMenuModal 
            onResume={() => {
                triggerUnpauseCountdown();
                isPausedRef.current = false;
                setIsPaused(false);
            }} 
            onQuit={() => window.location.href = '/'}
            gameType='offline'
        />
        )}
      {gameOver && (
        <GameOverModal 
            winner={gameOver.winner}
            reason={gameOver.reason}
            scores={scores}
            onPlayAgain={handlePlayAgain}
            onHome={() => window.location.href = '/'}
        />
      )}
      <div ref={sceneRef} className="game-canvas" />

      <CountdownOverlay 
        key={countdownKey}
        duration={countdownDuration}
        onStateChange={({ isFrozen }: { isFrozen: boolean }) =>{
            if (!isFrozen) {
                isCountdownFrozenRef.current = false;
            }
        }}
      />

      <div className="pitch-overlay">
        <div className="center-line" />
        <div className="center-circle" />
        <div className="left-goal-crease" />
        <div className="right-goal-crease" />
        <Scoreboard 
            scores={scores} 
            timeLeft={timeLeft} 
            onPause={() => {
                const nextPaused = !isPausedRef.current;
                if (!nextPaused) triggerUnpauseCountdown();
                isPausedRef.current = nextPaused;
                setIsPaused(nextPaused)
            }}
        />
      </div>
    </div>
  )
}