# System Architecture

TopDown-Tactix is a high-performance, real-time 2D soccer engine. It utilizes a **monorepo architecture** to ensure robust type safety and seamless synchronization between the server-side authoritative logic and the client-side rendering layer.

## 1. Monorepo Strategy
The project is structured into three distinct workspaces (`/client`, `/server`, and `/shared`), orchestrated by `npm/pnpm` workspaces.

* **`/shared` Workspace:** This is the core of our type safety. It contains shared TypeScript interfaces (`game.ts`, `props.ts`) and business logic (`gameEndConditions.js`). By importing these directly into both the frontend and backend, we eliminate runtime serialization mismatches and ensure that a change to a game rule (e.g., win conditions) propagates to both layers instantly.
* **Unified Build Pipeline:** We leverage `concurrently` to manage the dev-server orchestration, allowing developers to start the full stack with a single `npm run start:all` command.

## 2. Architectural Data Flow

1. **Input Collection:** The `client` captures user input and transmits it via `Socket.io`.
2. **Authoritative Simulation:** The `server` acts as the single source of truth. It receives input, validates it, and runs the `Matter.js` physics simulation on a fixed-step tick rate.
3. **State Reconciliation:** The `server` broadcasts the `GameState` (shared interface) to the client. The client updates its visual canvas to match the authoritative positions, ensuring that every player sees the same game state regardless of individual frame rates.

## 3. Dependency & Tooling Logic
* **TypeScript Monorepo Config:** We use a centralized `tsconfig.json` that acts as an "entry point" reference for sub-projects (`tsconfig.app.json`, `tsconfig.node.json`). This ensures uniform compilation targets (`ES2023`) across the entire repository.
* **Physics Isolation:** By separating the `GamePhysicsEngine` from the React rendering components, we maintain a clean separation of concerns, allowing the core engine to be tested independently using `Vitest`.

## 4. Key Design Patterns
* **Separation of Concerns:** The engine logic (physics/game rules) is agnostic of the UI. This allows for both `OfflineGameCanvas` and `OnlineGameCanvas` to consume the same simulation code without duplication.
* **Deterministic Validation:** Using shared logic in `gameEndConditions.js` for both server-side score calculation and client-side UI updates ensures that the "Game Over" trigger is consistent across the entire distributed system.