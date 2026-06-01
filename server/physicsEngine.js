import { Engine, World, Bodies } from 'matter-js';

export class GamePhysicsEngine {
  constructor(width = 800, height = 600) {
    this.width = width;
    this.height = height;

    this.engine = Engine.create({
      gravity: { x: 0, y: 0 }
    });

    this.world = this.engine.world;

    this.walls = [];
    this.ball = null;

    this._createBoundaries();
    this._createBall();
  }

  /**
   * Generates static outer boundaries around the perimeter of the pitch layout.
   * Thicker walls prevent high-velocity entities from passing through frames (tunneling).
   */
  _createBoundaries() {
    const thickness = 100;
    const w = this.width;
    const h = this.height;

    const wallOptions = {
      isStatic: true,
      restitution: 1,
      friction: 0
    };

    // Calculate center placements relative to the canvas coordinate system
    this.walls = [
      // Top Wall: spans width, pushed up by half its thickness
      Bodies.rectangle(w / 2, -thickness / 2, w, thickness, wallOptions),
      // Bottom Wall: spans width, pushed down past max height
      Bodies.rectangle(w / 2, h + thickness / 2, w, thickness, wallOptions),
      // Left Wall: spans height, pushed left past 0 axis
      Bodies.rectangle(-thickness / 2, h / 2, thickness, h, wallOptions),
      // Right Wall: spans height, pushed right past max width
      Bodies.rectangle(w + thickness / 2, h / 2, thickness, h, wallOptions)
    ];

    World.add(this.world, this.walls);
  }

  /**
   * Instantiates the match ball at the center of the pitch layout.
   */
  _createBall() {
    const radius = 15;
    const ballOptions = {
      restitution: 1,
      friction: 0,
      frictionAir: 0,
      inertia: Infinity
    };

    // Default spawn point at center-pitch
    this.ball = Bodies.circle(this.width / 2, this.height / 2, radius, ballOptions);
    
    World.add(this.world, this.ball);
  }

  /**
   * Steps the headless physics universe forward in time.
   * @param {number} deltaTime - The step period in milliseconds (e.g., 16.66ms for 60Hz)
   */
  update(deltaTime) {
    Engine.update(this.engine, deltaTime);
  }
}