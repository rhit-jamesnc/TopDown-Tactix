# State Synchronization Documentation

To maintain a competitive, fair, and responsive multiplayer environment, `TopDown-Tactix` implements a **Server-Authoritative Model**. This ensures that the server is the single source of truth for the game state, preventing client-side cheating and resolving inconsistencies between connected players.

## 1. The Server-Authoritative Loop
The server runs a continuous loop at 60Hz that manages the physics simulation independently of any client’s frame rate.

* **Simulation Step:** The server receives raw input packets from clients, validates them using `GamePhysicsEngine.isValidMove()`, and applies them to the physics world.
* **Update Tick:** The server calls `GameManager.update()` to advance the `Matter.js` world state by a fixed time delta.
* **Broadcast:** After every physics tick, the server serializes the current positions of all entities (ball and players) via `getState()` and broadcasts this snapshot to all connected clients.

## 2. Client-Side Reconciliation
Clients are treated as "dumb terminals" for the physics simulation; they render what the server dictates.

* **Snapshot Rendering:** The `OnlineGameCanvas` receives the `game-state` socket event. It iterates through the player and ball positions provided by the server and updates the local visual bodies accordingly:
    ```javascript
    const handleGameState = (state: GameState) => {
        // Apply authoritative positions from server to local visuals
        if (state.ball) Matter.Body.setPosition(visualBodies['ball'], state.ball);
        // ... update player positions ...
    };
    ```
* **Disconnect Handling:** If a player disconnects, the server cleans up the room and instance, and the client removes the associated visual body via the `player-disconnected` event to ensure the UI stays synchronized with the active player count.

## 3. Atomic State Management (Goal & Reset)
To prevent race conditions—where a client might see a goal scored while another sees the ball still in play—the engine employs an atomic reset process:

1. **Trigger:** The `GameManager` detects a ball overlap with the goal boundary.
2. **Halt & Reset:** The server immediately sets `isGoalTriggered = true`, calls `resetPitch()` to return all bodies to their defined starting positions, and zeroes out all velocities.
3. **Synchronized Event:** The server emits a `goal-scored` event containing the updated score. All clients receive this simultaneously, triggering the `CountdownOverlay` and resetting their local visual scene to the default positions.

## 4. Pause Logic and Synchronization
Pause states are managed via a two-way handshake to ensure the game doesn't stutter unexpectedly:

* **Pending State:** When a player requests a pause, the server tracks the `pauseRequestedBy` ID and emits a `pause-pending` state. This prevents the other player from acting while the pause is finalizing.
* **Hard Pause:** Once confirmed, the server sets `isPaused = true`, which halts both the physics `update()` loop and the broadcast of `game-state` snapshots, effectively "freezing" the game for all connected users until an unpause command is received.