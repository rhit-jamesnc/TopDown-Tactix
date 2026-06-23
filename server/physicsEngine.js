import Matter from 'matter-js';
const { Engine, World, Bodies, Body } = Matter;

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
            collisionFilter: 
                { category: CATEGORY_DEFAULT, 
                    mask: CATEGORY_DEFAULT | CATEGORY_PLAYER 
                } 
        };

        const blockerOptions = {
            isStatic: true,
            restitution: 0,
            friction: 0,
            collisionFilter: {
                category: CATEGORY_BLOCKER,
                mask: CATEGORY_PLAYER
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

        this.leftGoalBlocker = Bodies.rectangle(-10, this.height / 2, 20, goalWidth, blockerOptions);
        this.rightGoalBlocker = Bodies.rectangle(this.width + 10, this.height / 2, 20, goalWidth, blockerOptions);
        World.add(this.world, [...this.walls, this.leftGoalBlocker, this.rightGoalBlocker]);
    }

    _createBall() {
        this.ball = Bodies.circle(this.width / 2, this.height / 2, 15, {
            restitution: 1, friction: 0, frictionAir: 0.015, inertia: Infinity, label: 'ball',
            collisionFilter: { 
                category: CATEGORY_DEFAULT, 
                mask: (CATEGORY_DEFAULT | CATEGORY_PLAYER) & ~CATEGORY_BLOCKER
            }
        });
        World.add(this.world, this.ball);
    }

    addPlayer(id, position) {
        const playerBody = Bodies.circle(position.x, position.y, 25, {
            restitution: 0, friction: 0, frictionAir: 0.1, inertia: Infinity,
            collisionFilter: { 
                category: CATEGORY_PLAYER, 
                mask: CATEGORY_DEFAULT | CATEGORY_PLAYER | CATEGORY_BLOCKER
            }
        });
        playerBody.startingPosition = { ...position };
        this.players[id] = playerBody;
        World.add(this.world, playerBody);
    }

    update() {
        const subSteps = 6;
        for (let i = 0; i < subSteps; i++) {
            this._clampVelocities();
            Engine.update(this.engine, 1000 / 60 / subSteps);
        }
    }

    _clampVelocities() {
        if (this.ball) {
            const s = Math.hypot(this.ball.velocity.x, this.ball.velocity.y);
            if (s > 25) Body.setVelocity(this.ball, { x: (this.ball.velocity.x / s) * 25, y: (this.ball.velocity.y / s) * 25 });
        }
        Object.values(this.players).forEach(p => {
            const s = Math.hypot(p.velocity.x, p.velocity.y);
            if (s > 12) Body.setVelocity(p, { x: (p.velocity.x / s) * 12, y: (p.velocity.y / s) * 12 });
        });
    }

    resetPositions() {
        Body.setVelocity(this.ball, { x: 0, y: 0 });
        Body.setPosition(this.ball, { x: this.width / 2, y: this.height / 2 });
        Object.values(this.players).forEach(p => {
            Body.setPosition(p, p.startingPosition);
            Body.setVelocity(p, { x: 0, y: 0 });
            p.force = { x: 0, y: 0 };
        });
    }

    static isValidMove(move) {
        const MAX_FORCE = 0.5;
        return Math.abs(move.x) <= MAX_FORCE && Math.abs(move.y) <= MAX_FORCE;
    }

    onGoal(callback) {
        this.goalCallback = callback;
    }

    getState() {
        return {
            ball: this.ball.position,
            players: Object.fromEntries(Object.entries(this.players).map(([id, p]) => [id, { position: p.position }]))
        };
    }
}