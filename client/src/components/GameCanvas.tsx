import { useEffect, useRef } from 'react'
import Matter from 'matter-js'
import './GameCanvas.css'

export const GameCanvas = () => {
  const sceneRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef(Matter.Engine.create({ gravity: { x: 0, y: 0 } }))

  useEffect(() => {
    if (!sceneRef.current) return

    const engine = engineRef.current
    const world = engine.world

    const pitchWidth = 800
    const pitchHeight = 600
    const wallThickness = 100
    const goalWidth = 160
    const wallHalfHeight = (pitchHeight - goalWidth) / 2

    // Starting positions for resets
    const playerStartPos = { x: 200, y: pitchHeight / 2 }
    const ballStartPos = { x: pitchWidth / 2, y: pitchHeight / 2 }

    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: pitchWidth,
        height: pitchHeight,
        wireframes: false,
        background: '#15803d',
      }
    })

    const wallOptions = {
      isStatic: true,
      restitution: 1,
      friction: 0,
      frictionStatic: 0
    }

    const walls = [
      Matter.Bodies.rectangle(pitchWidth / 2, -wallThickness / 2, pitchWidth, wallThickness, wallOptions),
      Matter.Bodies.rectangle(pitchWidth / 2, pitchHeight + wallThickness / 2, pitchWidth, wallThickness, wallOptions),
      Matter.Bodies.rectangle(-wallThickness / 2, wallHalfHeight / 2, wallThickness, wallHalfHeight, wallOptions),
      Matter.Bodies.rectangle(-wallThickness / 2, pitchHeight - wallHalfHeight / 2, wallThickness, wallHalfHeight, wallOptions),
      Matter.Bodies.rectangle(pitchWidth + wallThickness / 2, wallHalfHeight / 2, wallThickness, wallHalfHeight, wallOptions),
      Matter.Bodies.rectangle(pitchWidth + wallThickness / 2, pitchHeight - wallHalfHeight / 2, wallThickness, wallHalfHeight, wallOptions)
    ]

    const leftGoalBackground = Matter.Bodies.rectangle(-20, pitchHeight / 2, 40, goalWidth, {
      label: 'LeftGoal',
      isStatic: true,
      isSensor: true,
      render: { fillStyle: '#ef4444' }
    })

    const rightGoalBackground = Matter.Bodies.rectangle(pitchWidth + 20, pitchHeight / 2, 40, goalWidth, {
      label: 'RightGoal',
      isStatic: true,
      isSensor: true,
      render: { fillStyle: '#22c55e' }
    })

    const player = Matter.Bodies.circle(playerStartPos.x, playerStartPos.y, 20, {
      label: 'Player1',
      render: { fillStyle: '#3b82f6' },
      frictionAir: 0.06,
      restitution: 0.2
    })

    const ball = Matter.Bodies.circle(ballStartPos.x, ballStartPos.y, 12, {
      label: 'Ball',
      render: { fillStyle: '#ffffff' },
      frictionAir: 0.02,
      restitution: 0.8 
    })

    Matter.Composite.add(world, [...walls, leftGoalBackground, rightGoalBackground, player, ball])

    const runner = Matter.Runner.create()
    Matter.Render.run(render)
    Matter.Runner.run(runner, engine)

    const activeKeys: { [key: string]: boolean } = {}

    const handleKeyDown = (e: KeyboardEvent) => {
      activeKeys[e.key.toLowerCase()] = true
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      activeKeys[e.key.toLowerCase()] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // Reset helper function
    const resetPitch = () => {
      // Reset player position and completely kill momentum
      Matter.Body.setPosition(player, playerStartPos)
      Matter.Body.setVelocity(player, { x: 0, y: 0 })
      Matter.Body.setAngularVelocity(player, 0)

      // Reset ball position and completely kill momentum
      Matter.Body.setPosition(ball, ballStartPos)
      Matter.Body.setVelocity(ball, { x: 0, y: 0 })
      Matter.Body.setAngularVelocity(ball, 0)
    }

    // Collision listener for goals
    Matter.Events.on(engine, 'collisionStart', (event) => {
      const pairs = event.pairs

      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i]

        const isLeftGoal = pair.bodyA === leftGoalBackground || pair.bodyB === leftGoalBackground
        const isRightGoal = pair.bodyA === rightGoalBackground || pair.bodyB === rightGoalBackground
        const isBall = pair.bodyA === ball || pair.bodyB === ball

        if ((isLeftGoal && isBall) || (isRightGoal && isBall)) {
          // Optional: You could trigger score-tracking logic here!
          resetPitch()
          break // Exit loop since reset is handled
        }
      }
    })

    Matter.Events.on(engine, 'beforeUpdate', () => {
      const forceMagnitude = 0.004
      const impulse = { x: 0, y: 0 }

      if (activeKeys['w'] || activeKeys['arrowup']) impulse.y -= forceMagnitude
      if (activeKeys['s'] || activeKeys['arrowdown']) impulse.y += forceMagnitude
      if (activeKeys['a'] || activeKeys['arrowleft']) impulse.x -= forceMagnitude
      if (activeKeys['d'] || activeKeys['arrowright']) impulse.x += forceMagnitude

      if (impulse.x !== 0 || impulse.y !== 0) {
        Matter.Body.applyForce(player, player.position, impulse)
      }

      const maxVelocity = 15
      const clampVelocity = (body: Matter.Body) => {
        let { x, y } = body.velocity
        if (Math.abs(x) > maxVelocity) x = Math.sign(x) * maxVelocity
        if (Math.abs(y) > maxVelocity) y = Math.sign(y) * maxVelocity
        Matter.Body.setVelocity(body, { x, y })
      }

      clampVelocity(player)
      clampVelocity(ball)
    })

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      Matter.Render.stop(render)
      Matter.Runner.stop(runner)
      Matter.Composite.clear(world, false)
      render.canvas.remove()
    }
  }, [])

  return (
    <div className="game-container">
      <div ref={sceneRef} className="game-canvas" />
      <div className="pitch-overlay">
        <div className="center-line" />
        <div className="center-circle" />
        <div className="left-goal-crease" />
        <div className="right-goal-crease" />
      </div>
    </div>
  )
}