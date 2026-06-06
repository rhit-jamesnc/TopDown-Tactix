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

    const PITCH_WIDTH = window.innerWidth
    const PITCH_HEIGHT = window.innerHeight
    const WALL_THICKNESS = 100
    const GOAL_WIDTH = 160
    const WALL_HALF_HEIGHT = (PITCH_HEIGHT - GOAL_WIDTH) / 2

    const PLAYER_RADIUS = 24
    const BALL_RADIUS = 14
    const FORCE_MAGNITUDE = 0.005
    const MAX_VELOCITY = 15

    const PLAYER1_START_POS = { x: 200, y: PITCH_HEIGHT / 2 }
    const PLAYER2_START_POS = { x: PITCH_WIDTH - 200, y: PITCH_HEIGHT / 2 }
    const BALL_START_POS = { x: PITCH_WIDTH / 2, y: PITCH_HEIGHT / 2 }

    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: PITCH_WIDTH,
        height: PITCH_HEIGHT,
        wireframes: false,
        background: 'transparent',
      }
    })

    const wallOptions = {
      isStatic: true,
      restitution: 1,
      friction: 0,
      frictionStatic: 0
    }

    const walls = [
      Matter.Bodies.rectangle(PITCH_WIDTH / 2, -WALL_THICKNESS / 2, PITCH_WIDTH, WALL_THICKNESS, wallOptions),
      Matter.Bodies.rectangle(PITCH_WIDTH / 2, PITCH_HEIGHT + WALL_THICKNESS / 2, PITCH_WIDTH, WALL_THICKNESS, wallOptions),
      Matter.Bodies.rectangle(-WALL_THICKNESS / 2, WALL_HALF_HEIGHT / 2, WALL_THICKNESS, WALL_HALF_HEIGHT, wallOptions),
      Matter.Bodies.rectangle(-WALL_THICKNESS / 2, PITCH_HEIGHT - WALL_HALF_HEIGHT / 2, WALL_THICKNESS, WALL_HALF_HEIGHT, wallOptions),
      Matter.Bodies.rectangle(PITCH_WIDTH + WALL_THICKNESS / 2, WALL_HALF_HEIGHT / 2, WALL_THICKNESS, WALL_HALF_HEIGHT, wallOptions),
      Matter.Bodies.rectangle(PITCH_WIDTH + WALL_THICKNESS / 2, PITCH_HEIGHT - WALL_HALF_HEIGHT / 2, WALL_THICKNESS, WALL_HALF_HEIGHT, wallOptions)
    ]

    const leftGoalBackground = Matter.Bodies.rectangle(-20, PITCH_HEIGHT / 2, 40, GOAL_WIDTH, {
      label: 'LeftGoal',
      isStatic: true,
      isSensor: true,
      render: { fillStyle: '#ef4444' }
    })

    const rightGoalBackground = Matter.Bodies.rectangle(PITCH_WIDTH + 20, PITCH_HEIGHT / 2, 40, GOAL_WIDTH, {
      label: 'RightGoal',
      isStatic: true,
      isSensor: true,
      render: { fillStyle: '#22c55e' }
    })

    const player1 = Matter.Bodies.circle(PLAYER1_START_POS.x, PLAYER1_START_POS.y, PLAYER_RADIUS, {
      label: 'Player1',
      render: { fillStyle: '#ef4444' },
      frictionAir: 0.06,
      restitution: 0.2
    })

    const player2 = Matter.Bodies.circle(PLAYER2_START_POS.x, PLAYER2_START_POS.y, PLAYER_RADIUS, {
      label: 'Player2',
      render: { fillStyle: '#3b82f6' },
      frictionAir: 0.06,
      restitution: 0.2
    })

    const ball = Matter.Bodies.circle(BALL_START_POS.x, BALL_START_POS.y, BALL_RADIUS, {
      label: 'Ball',
      render: { fillStyle: '#ffffff' },
      frictionAir: 0.02,
      restitution: 0.8 
    })

    Matter.Composite.add(world, [...walls, leftGoalBackground, rightGoalBackground, player1, player2, ball])

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

    const resetPitch = () => {
      Matter.Body.setPosition(player1, PLAYER1_START_POS)
      Matter.Body.setVelocity(player1, { x: 0, y: 0 })
      Matter.Body.setAngularVelocity(player1, 0)

      Matter.Body.setPosition(player2, PLAYER2_START_POS)
      Matter.Body.setVelocity(player2, { x: 0, y: 0 })
      Matter.Body.setAngularVelocity(player2, 0)

      Matter.Body.setPosition(ball, BALL_START_POS)
      Matter.Body.setVelocity(ball, { x: 0, y: 0 })
      Matter.Body.setAngularVelocity(ball, 0)
    }

    Matter.Events.on(engine, 'collisionStart', (event) => {
      const pairs = event.pairs
      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i]
        const isLeftGoal = pair.bodyA === leftGoalBackground || pair.bodyB === leftGoalBackground
        const isRightGoal = pair.bodyA === rightGoalBackground || pair.bodyB === rightGoalBackground
        const isBall = pair.bodyA === ball || pair.bodyB === ball

        if ((isLeftGoal && isBall) || (isRightGoal && isBall)) {
          resetPitch()
          break 
        }
      }
    })

    Matter.Events.on(engine, 'beforeUpdate', () => {
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

      if (p1Impulse.x !== 0 || p1Impulse.y !== 0) {
        Matter.Body.applyForce(player1, player1.position, p1Impulse)
      }
      if (p2Impulse.x !== 0 || p2Impulse.y !== 0) {
        Matter.Body.applyForce(player2, player2.position, p2Impulse)
      }

      const clampVelocity = (body: Matter.Body) => {
        let { x, y } = body.velocity
        if (Math.abs(x) > MAX_VELOCITY) x = Math.sign(x) * MAX_VELOCITY
        if (Math.abs(y) > MAX_VELOCITY) y = Math.sign(y) * MAX_VELOCITY
        Matter.Body.setVelocity(body, { x, y })
      }

      clampVelocity(player1)
      clampVelocity(player2)
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