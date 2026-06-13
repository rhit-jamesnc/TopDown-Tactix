import { Engine, World, Bodies, Body } from 'matter-js';

const CATEGORY_DEFAULT = 0x0001;
const CATEGORY_PLAYER = 0x0002;
const CATEGORY_BLOCKER = 0x0004;

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
        this.leftGoalBlocker = null;
        this.rightGoalBlocker = null;
        this.goalCallback = null;
        this.isGoalTriggered = false;

        this._createBoundaries();
        this._createBall();
    }

    _createBoundaries() {
        const thickness = 100;
        const w = this.width;
        const h = this.height;
        const goalWidth = 160; 
        const wallHalfHeight = (h - goalWidth) / 2;

        const wallOptions = { 
            isStatic: true,
            restitution: 1, 
            friction: 0, 
            frictionStatic: 0,
            collisionFilter: {
                category: CATEGORY_DEFAULT,
                mask: CATEGORY_DEFAULT | CATEGORY_PLAYER
            }
        
        };

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

        const blockerOptions = {
            isStatic: true,
            restitution: 0,
            friction: 0,
            collisionFilter: {
                category: CATEGORY_BLOCKER,
                mask: CATEGORY_PLAYER
            }
        };

        this.leftGoalBlocker = Bodies.rectangle(-10, h / 2, 20, goalWidth, blockerOptions);
        this.rightGoalBlocker = Bodies.rectangle(w + 10, h / 2, 20, goalWidth, blockerOptions);

        World.add(this.world, [
            ...this.walls,
            this.leftGoalBlocker,
            this.rightGoalBlocker
        ]);
    }

    _createBall() {
        const radius = 15;
        const ballOptions = {
            restitution: 1,
            friction: 0,
            frictionAir: 0.015,
            inertia: Infinity,
            slop: 0,
            label: 'ball',
            collisionFilter: {
                category: CATEGORY_DEFAULT,
                mask: (CATEGORY_DEFAULT | CATEGORY_PLAYER) & ~CATEGORY_BLOCKER
            }
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
            inertia: Infinity,
            slop: 0,
            collisionFilter: {
                category: CATEGORY_PLAYER,
                mask: CATEGORY_DEFAULT | CATEGORY_PLAYER | CATEGORY_BLOCKER
            }
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

        this.isGoalTriggered = false;

        for (let i = 0; i < subSteps; i++) {
            this._clampVelocities();
            Engine.update(this.engine, stepSize);
            this._checkGoals();
        }
    }

    _checkGoals() {
        if (!this.ball || !this.goalCallback || this.isGoalTriggered) return;

        const radius = 15;
        const x = this.ball.position.x;

        if (x + radius - 1 < 0) {
            this.isGoalTriggered = true;
            if (this.goalCallback) this.goalCallback('away');
            this.resetPitch();
        } else if (x - radius + 1 > this.width) {
            this.isGoalTriggered = true;
            if (this.goalCallback) this.goalCallback('home');
            this.resetPitch();
        }
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
        Body.setVelocity(this.ball, { x: 0, y: 0 });
        Body.setAngularVelocity(this.ball, 0);
        Body.setPosition(this.ball, { x: this.width / 2, y: this.height / 2 });

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

    onGoal(callback) {
        this.goalCallback = callback;
    }

    removePlayer(id) {
        if (this.players[id]) {
            World.remove(this.world, this.players[id]);
            delete this.players[id];
        }
    }

    startLoop(broadcastCallback) {
        this.loop = setInterval(() => {
            this.update();
            broadcastCallback(this.getState());
        }, 1000 / 60);
    }

    getState() {
        const playersData = {};
        for (const id in this.players) {
            playersData[id] = { position: this.players[id].position };
        }
        return { ball: this.ball.position, players: playersData };
    }

    static isValidMove(move) {
        const MAX_FORCE = 0.05;
        if (!move || typeof move.x !== 'number' || typeof move.y !== 'number') {
            return false;
        }
        
        // Check if the force magnitude exceeds our limit
        const magnitude = Math.hypot(move.x, move.y);
        return magnitude <= MAX_FORCE;
    }
}