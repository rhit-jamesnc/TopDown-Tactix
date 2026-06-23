import { useEffect, useRef, useState } from 'react'
import Matter from 'matter-js'
import { GameManager } from '../../../server/gameManager'

import './GameCanvas.css'

export const OfflineGameCanvas = () => {
  const sceneRef = useRef<HTMLDivElement>(null)
  const [scores, setScores] = useState({ p1: 0, p2: 0 })

  useEffect(() => {
    if (!sceneRef.current) return
 
    const PITCH_WIDTH = window.innerWidth
    const PITCH_HEIGHT = window.innerHeight

    const manager = new GameManager(PITCH_WIDTH, PITCH_HEIGHT)
    const physics = manager.physics;

    physics.addPlayer('p1', { x: 200, y: PITCH_HEIGHT / 2 })
    physics.addPlayer('p2', { x: PITCH_WIDTH - 200, y: PITCH_HEIGHT / 2 })

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
    if (players['p1']) players['p1'].render.fillStyle = 'red';
    if (players['p2']) players['p2'].render.fillStyle = 'blue';

    manager.onGoal((team: string) => {
        if (team === 'away') {
            setScores(prev => ({ ...prev, p2: prev.p2 + 1 }))
        } else {
            setScores(prev => ({ ...prev, p1: prev.p1 + 1 }))
        }
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
    const handleKeyDown = (e: KeyboardEvent) => { activeKeys[e.key.toLowerCase()] = true }
    const handleKeyUp = (e: KeyboardEvent) => { activeKeys[e.key.toLowerCase()] = false }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    let animationFrameId: number
    const FORCE_MAGNITUDE = 0.012

    const tick = () => {
        const p1Impulse = { x: 0, y: 0 }
        const p2Impulse = { x: 0, y: 0 }

        if (activeKeys['w']) p1Impulse.y -= FORCE_MAGNITUDE
        if (activeKeys['s']) p1Impulse.y += FORCE_MAGNITUDE
        if (activeKeys['a']) p1Impulse.x -= FORCE_MAGNITUDE
        if (activeKeys['d']) p1Impulse.x += FORCE_MAGNITUDE

        if (activeKeys['arrowup']) p2Impulse.y -= FORCE_MAGNITUDE
        if (activeKeys['arrowdown']) p2Impulse.y += FORCE_MAGNITUDE
        if (activeKeys['arrowleft']) p2Impulse.x -= FORCE_MAGNITUDE
        if (activeKeys['arrowright']) p2Impulse.x += FORCE_MAGNITUDE

        const players = physics.players as { [key: string]: Matter.Body };

        if (p1Impulse.x !== 0 || p1Impulse.y !== 0) {
            Matter.Body.applyForce(players['p1'], players['p1'].position, p1Impulse)
        }
        if (p2Impulse.x !== 0 || p2Impulse.y !== 0) {
            Matter.Body.applyForce(players['p2'], players['p2'].position, p2Impulse)
        }

        manager.update(1/60);

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
  }, [])

  return (
    <div className="game-container-offline">
      <div className="title-overlay-internal">TopDown Tactix</div>
      <div ref={sceneRef} className="game-canvas" />
      <div className="pitch-overlay">
        <div className="center-line" />
        <div className="center-circle" />
        <div className="left-goal-crease" />
        <div className="right-goal-crease" />
        <div className="scoreboard">
            <span className="score-value">{scores.p1}</span>
            <span className="score-separator"> </span>
            <span className="score-value">{scores.p2}</span>
      </div>
      </div>
    </div>
  )
}