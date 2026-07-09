Here is the updated `TESTING.md` file, incorporating your current testing setup, the transition to integration testing for time-based events, and the inclusion of our core reliability standards.

---

# Testing Strategy: Quality Assurance & Reliability

In the development of `TopDown-Tactix`, we maintain a rigorous testing suite to ensure that our physics engine, game management logic, and network synchronization remain deterministic and resilient. By utilizing **Vitest** for our unit and integration tests, we establish a "Definition of Done" that guarantees stability across all iterations of the game engine.

## 1. Physics Engine Unit Testing

The `physicsEngine.js` file is the heart of the simulation, and we test it in complete isolation from the network layer to verify its mathematical consistency.

* **Kinetic Accuracy:** We test the engine’s handling of momentum by simulating "tackles," where a player body collides with the ball. This ensures that the velocity transfer adheres to the expected physical outcome without erratic jittering.
* **Boundary Integrity:** Our tests confirm that the binary bitmasking system correctly prevents players from clipping through walls while allowing the ball to pass through specific goal-mouth zones.
* **Constraint Validation:** We run stress tests to ensure that `_clampVelocities` successfully caps speed at the defined thresholds (25 units for the ball, 12 for players), even when extreme forces are applied.

## 2. Game Logic & Rule Enforcement

The `gameManager.js` is the central authority for match rules. Testing this file ensures that the game's state machine remains predictable under all circumstances.

* **Atomic Reset Verification:** We use the `gameManager.test.js` file to verify that the `resetPitch()` method acts as an atomic operation. This ensures that when a goal occurs, every entity in the world is snapped back to its start point simultaneously.
* **Goal Area Logic:** We test the detection of the ball crossing the goal boundary. This confirms that the game accurately increments scores and triggers the reset sequence only when the ball has fully traversed the scoring zone.
* **Rule Enforcement:** We validate that the `getGameStatus()` method correctly identifies winners based on both the `winLimit` and the game timer.

## 3. Networking & Integration

Because `TopDown-Tactix` relies on a server-authoritative model, the networking layer is tested through the integration of the `server.js` logic with simulated clients.

* **Anti-Cheat Validation:** We specifically test for malicious input by injecting packets that exceed the `MAX_FORCE` limit. Our tests confirm that the server rejects these inputs, maintaining match integrity.
* **State Synchronization:** We verify that the `game-state` socket event broadcasts the correct coordinates to all clients, ensuring the server remains the single source of truth.
* **Connection Lifecycle:** We test the disconnection sequence to ensure that when a user leaves a room, the server immediately cleans up the game instance, clears the loop intervals, and notifies the remaining opponent to prevent "zombie" game states.

## 4. Time-Based Game Loop Reliability

To handle critical asynchronous game events, we utilize Vitest's `useFakeTimers()` to verify time-dependent logic without relying on real-world wall-clock time.

* **Precise Interval Management:** We use `vi.advanceTimersByTime()` to fast-forward the game loop. This allows us to test "pause-to-resume" logic and match timeouts in milliseconds, ensuring that the `setInterval` calls are correctly cleared and re-initialized as needed.
* **Deterministic Clock Hijacking:** By enabling fake timers *after* socket connections are established, we ensure stable handshakes while retaining complete control over the game loop's temporal progression, preventing race conditions.

## 5. Why This Matters

By maintaining this comprehensive test suite, we achieve:

* **Regression Prevention:** Every new feature is guarded by existing tests, ensuring that changes to the physics engine do not inadvertently break goal detection or scoring logic.
* **Deterministic Assurance:** Because we have isolated the physics engine from the UI, we can run thousands of simulation steps in milliseconds, proving that our physics remain identical across all hardware.
* **Professional Standards:** This approach demonstrates a commitment to quality and robustness, reflecting the same standards used in professional game development for large-scale distributed systems.