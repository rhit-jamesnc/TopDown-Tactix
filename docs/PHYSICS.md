# Physics Engine Documentation

The physics engine is built on `Matter.js` and acts as the authoritative simulation layer. In `TopDown-Tactix`, it is designed to prioritize deterministic behavior, essential for consistent real-time multiplayer gameplay.

## 1. Core Engine Configuration
We utilize `Matter.js` with specific overrides to suit a top-down, arcade-style soccer game:

* **Gravity:** Set to `{ x: 0, y: 0 }` to ensure bodies do not drift due to vertical acceleration.
* **Iterations:** Position and velocity iterations are set to `16` to ensure collision precision, even at higher speeds or high player counts.
* **Fixed Time-Stepping:** The engine runs on a sub-stepped update loop:
    ```javascript
    update() {
        const subSteps = 6;
        for (let i = 0; i < subSteps; i++) {
            this._clampVelocities();
            Engine.update(this.engine, 1000 / 60 / subSteps);
        }
    }
    ```
    This ensures the simulation remains stable and deterministic, regardless of frame rate fluctuations.

## 2. Collision Filtering (Category Masking)
To prevent physics conflicts (such as players getting stuck inside the goal blockers or walls), we use a binary bitmasking approach:

* **`CATEGORY_DEFAULT` (0x0001):** Used for world boundaries.
* **`CATEGORY_PLAYER` (0x0002):** Used for player avatars.
* **`CATEGORY_BLOCKER` (0x0004):** Used for goal-mouth blockers that only players can interact with.

The ball is configured to ignore the `CATEGORY_BLOCKER` so that it passes through goal-mouth constraints, while players remain restricted by them.

## 3. Movement and Constraints
* **Velocity Clamping:** The `_clampVelocities` method acts as a speed governor. This prevents "infinite" velocity buildup during collisions and keeps gameplay feeling responsive.
    * **Ball Max Speed:** 25 units.
    * **Player Max Speed:** 12 units.
* **Friction & Inertia:** Players and the ball have `inertia: Infinity` and `friction: 0` to enable constant, predictable movement and to prevent unwanted rotational drag upon contact with boundaries.
* **Force Validation:** The `static isValidMove` method acts as an anti-cheat buffer, ensuring that input forces injected from the client do not exceed defined thresholds (MAX_FORCE = 0.5).

## 4. Deterministic State Reset
The `resetPositions` method provides a clean state synchronization point:
* Sets ball and player velocities to `{ x: 0, y: 0 }`.
* Resets the ball to the center coordinates of the pitch.
* Snaps players back to their `startingPosition`, ensuring that every goal or match start begins from a known, predictable environment.