import { Engine, World, Bodies, Body, Events } from 'matter-js';

export class GamePhysicsEngine {
    constructor(width = 800, height = 600) {
        this.width = width;
        this.height = height;

        this.engine = Engine.create({
            gravity: { x: 0, y: 0 }
        });

        this.engine.positionIterations = 16;
        this.engine.velocityIterations = 16;

        this.world = this.engine.world;

        this.walls = [];
        this.ball = null;
        this.players = {};
        this.goalCallback = null;

        this._createBoundaries();
        this._createBall();
        this._setupCollisionListeners();
    }

    _createBoundaries() {
        const thickness = 100;
        const w = this.width;
        const h = this.height;
        const goalWidth = 160; 
        const wallHalfHeight = (h - goalWidth) / 2;

        const wallOptions = { isStatic: true, restitution: 1, friction: 0, frictionStatic: 0 };
        const sensorOptions = { isStatic: true, isSensor: true };

        this.walls = [
            Bodies.rectangle(w / 2, -thickness / 2, w, thickness, wallOptions),
            Bodies.rectangle(w / 2, h + thickness / 2, w, thickness, wallOptions),

            Bodies.rectangle(-thickness / 2, wallHalfHeight / 2, thickness, wallHalfHeight, wallOptions),
            Bodies.rectangle(-thickness / 2, h - wallHalfHeight / 2, thickness, wallHalfHeight, wallOptions),

            Bodies.rectangle(w + thickness / 2, wallHalfHeight / 2, thickness, wallHalfHeight, wallOptions),
            Bodies.rectangle(w + thickness / 2, h - wallHalfHeight / 2, thickness, wallHalfHeight, wallOptions),

            Bodies.rectangle(-thickness - 10, h / 2, thickness, goalWidth, wallOptions),
            Bodies.rectangle(w + thickness + 10, h / 2, thickness, goalWidth, wallOptions)
        ];

        this.leftGoalSensor = Bodies.rectangle(-20, h / 2, 40, goalWidth, { ...sensorOptions, label: 'leftGoal' });
        this.rightGoalSensor = Bodies.rectangle(w + 20, h / 2, 40, goalWidth, { ...sensorOptions, label: 'rightGoal' });

        World.add(this.world, [...this.walls, this.leftGoalSensor, this.rightGoalSensor]);
    }

    _createBall() {
        const radius = 15;
        const ballOptions = {
            restitution: 1,
            friction: 0,
            frictionAir: 0,
            inertia: Infinity,
            slop: 0,
            label: 'ball'
        };

        this.ball = Bodies.circle(this.width / 2, this.height / 2, radius, ballOptions);
        World.add(this.world, this.ball);
    }

    _setupCollisionListeners() {
        Events.on(this.engine, 'collisionStart', (event) => {
            event.pairs.forEach((pair) => {
                const labels = [pair.bodyA.label, pair.bodyB.label];
                
                if (labels.includes('ball')) {
                    if (labels.includes('leftGoal')) {
                        this.resetPitch();
                        if (this.goalCallback) {
                            this.goalCallback('away');
                        }
                    } else if (labels.includes('rightGoal')) {
                        this.resetPitch();
                        if (this.goalCallback) {
                            this.goalCallback('home');
                        }
                    }
                }
            });
        });
    }

    addPlayer(id, position) {
        const radius = 25;
        const playerOptions = {
            restitution: 0,
            friction: 0,
            frictionAir: 0.1,
            inertia: Infinity,
            slop: 0
        };

        const playerBody = Bodies.circle(position.x, position.y, radius, playerOptions);
        playerBody.startingPosition = { x: position.x, y: position.y };

        this.players[id] = playerBody;
        World.add(this.world, playerBody);
    }

    update() {
        const FIXED_DELTA = 1000 / 60; 
        const subSteps = 6;
        const stepSize = FIXED_DELTA / subSteps;

        for (let i = 0; i < subSteps; i++) {
            this._clampVelocities();
            Engine.update(this.engine, stepSize);
            this._enforceBoundaries();
        }
    }

    _enforceBoundaries() {
        Object.values(this.players).forEach(player => {
            const radius = 25;
            let currentX = player.position.x;
            let currentY = player.position.y;
            let normalHit = false;

            if (currentX < radius) {
                currentX = radius;
                normalHit = true;
            }
            
            if (currentX > this.width - radius) {
                currentX = this.width - radius;
                normalHit = true;
            }

            if (normalHit) {
                Body.setPosition(player, { x: currentX, y: currentY });
                Body.setVelocity(player, { x: 0, y: player.velocity.y });
            }
        });
    }

    _clampVelocities() {
        const MAX_BALL_SPEED = 25;
        const MAX_PLAYER_SPEED = 12;

        if (this.ball) {
            const speed = Math.hypot(this.ball.velocity.x, this.ball.velocity.y);
            if (speed > MAX_BALL_SPEED) {
                const scale = MAX_BALL_SPEED / speed;
                Body.setVelocity(this.ball, {
                    x: this.ball.velocity.x * scale,
                    y: this.ball.velocity.y * scale
                });
            }
        }

        Object.values(this.players).forEach(player => {
                const speed = Math.hypot(player.velocity.x, player.velocity.y);
                if (speed > MAX_PLAYER_SPEED) {
                    const scale = MAX_PLAYER_SPEED / speed;
                    Body.setVelocity(player, {
                        x: player.velocity.x * scale,
                        y: player.velocity.y * scale
                    });
                }
            });
    }

    resetPitch() {
        Body.setPosition(this.ball, { x: this.width / 2, y: this.height / 2 });
        Body.setVelocity(this.ball, { x: 0, y: 0 });
        Body.setAngularVelocity(this.ball, 0);

        Object.values(this.players).forEach((playerBody) => {
            if (playerBody.startingPosition) {
                Body.setPosition(playerBody, { 
                    x: playerBody.startingPosition.x, 
                    y: playerBody.startingPosition.y 
                });
            }
            Body.setVelocity(playerBody, { x: 0, y: 0 });
            Body.setAngularVelocity(playerBody, 0);
            playerBody.force = { x: 0, y: 0 };
        });
    }

    kickBall(playerId, forceVector) {
        const player = this.players[playerId];
        if (!player || !this.ball) return;

        Body.applyForce(this.ball, this.ball.position, forceVector);
    }

    onGoal(callback) {
        this.goalCallback = callback;
    }
}