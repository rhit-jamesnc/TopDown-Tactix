import { useEffect, useRef } from 'react'
import Matter from 'matter-js'

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

    const player = Matter.Bodies.circle(200, pitchHeight / 2, 20, {
      label: 'Player1',
      render: { fillStyle: '#3b82f6' },
      frictionAir: 0.06,
      restitution: 0.2
    })

    const ball = Matter.Bodies.circle(pitchWidth / 2, pitchHeight / 2, 12, {
      label: 'Ball',
      render: { fillStyle: '#ffffff' },
      frictionAir: 0.02,
      restitution: 0.8 
    })

    Matter.Composite.add(world, [...walls, player, ball])

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
    <div style={{ position: 'relative' }}>
      <div 
        ref={sceneRef} 
        style={{ 
          border: '4px solid #4b5563', 
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
        }} 
      />
    </div>
  )
}