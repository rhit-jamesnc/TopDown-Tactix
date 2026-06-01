import { Engine, World, Bodies, Body } from 'matter-js';

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
    this.players = {};

    this._createBoundaries();
    this._createBall();
  }

  _createBoundaries() {
    const thickness = 100;
    const w = this.width;
    const h = this.height;

    const wallOptions = {
      isStatic: true,
      restitution: 1,
      friction: 0
    };

    this.walls = [
      Bodies.rectangle(w / 2, -thickness / 2, w, thickness, wallOptions),
      Bodies.rectangle(w / 2, h + thickness / 2, w, thickness, wallOptions),
      Bodies.rectangle(-thickness / 2, h / 2, thickness, h, wallOptions),
      Bodies.rectangle(w + thickness / 2, h / 2, thickness, h, wallOptions)
    ];

    World.add(this.world, this.walls);
  }

  _createBall() {
    const radius = 15;
    const ballOptions = {
      restitution: 1,
      friction: 0,
      frictionAir: 0,
      inertia: Infinity,
      continuousUpdates: true
    };

    this.ball = Bodies.circle(this.width / 2, this.height / 2, radius, ballOptions);
    World.add(this.world, this.ball);
  }

  addPlayer(id, position) {
    const radius = 25;
    const playerOptions = {
      restitution: 0,
      friction: 0,
      frictionAir: 0.1,
      inertia: Infinity
    };

    const playerBody = Bodies.circle(position.x, position.y, radius, playerOptions);
    this.players[id] = playerBody;
    World.add(this.world, playerBody);
  }

  update(deltaTime) {
    Engine.update(this.engine, deltaTime);
  }

  resetPitch() {
    Body.setPosition(this.ball, { x: this.width / 2, y: this.height / 2 });
    Body.setVelocity(this.ball, { x: 0, y: 0 });
    Body.setAngularVelocity(this.ball, 0);
    
    Object.values(this.players).forEach(playerBody => {
      Body.setVelocity(playerBody, { x: 0, y: 0 });
      Body.setAngularVelocity(playerBody, 0);
    });
  }
}