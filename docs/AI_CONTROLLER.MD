# CPU & AI Controller Documentation

In `TopDown-Tactix`, the AI-driven offline mode is designed to simulate human-like decision-making and reaction times. Unlike the server-authoritative multiplayer mode, the CPU mode runs a local controller that processes game state to generate movement impulses.

## 1. Controller Architecture
The CPU logic is decoupled from the physics engine to ensure the AI can be easily tested and adjusted without side effects.

* **Utility-Based Logic:** The `calculateCpuImpulse` function is a pure utility that takes the current `Matter.Body` positions and returns a `Vector` impulse. This allows us to unit test the AI's logic (e.g., reaction delay, difficulty-based force) in isolation.
* **Movement Continuity:** To avoid the "jitter" associated with standard force application in `Matter.js`, the AI maintains a `lastImpulse` state. This ensures that even during internal "re-thinking" cycles, the physics engine continues to apply the previous force, resulting in fluid movement rather than stop-start stuttering.

## 2. Difficulty Scaling
We implement three distinct tiers of AI intelligence, which scale both mechanical force and cognitive delay.

| Difficulty | Reaction Delay (Frames) | Force Multiplier |
| :--- | :--- | :--- |
| **Academy** | 30 | 0.6x |
| **Reserves** | 15 | 1.0x |
| **First-Team** | 0 | 1.2x |

* **Reaction Delay:** This effectively throttles the AI's "brain." By delaying when the target coordinates are recalculated, we create a perceptible difference in how quickly the AI responds to the ball’s trajectory.
* **Mechanical Force:** By multiplying the base `FORCE_MAGNITUDE` by a difficulty-specific constant, we ensure that higher-difficulty AI moves with more urgency and physical dominance.

## 3. Testing Strategy
We employ a "Frame-Step" testing strategy to ensure AI reliability:
* **Delay Verification:** Tests iterate through the AI's internal `frameCounter` to ensure it returns `{x: 0, y: 0}` for the exact number of frames required by its difficulty level.
* **State Reset:** To prevent cross-test pollution in our `Vitest` suite, we expose a `resetCpuState()` helper. This guarantees that every test starts with a fresh `frameCounter` and `lastImpulse`.
* **Precision Assertions:** Assertions use `toBeCloseTo` to account for the vector math and floating-point precision involved in calculating the impulse components.