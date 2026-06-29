# TopDown Tactix

**[▶ Play the Live Demo](https://topdown-tactix.vercel.app/)** | **[View Source Code](https://github.com/rhit-jamesnc/TopDown-Tactix)** | **[Technical Documentation](/docs)**

> **Note for Recruiters:** This project demonstrates a server-authoritative architecture built to prevent cheating and ensure competitive fairness. I invite you to test the engine live at the [Live Demo](https://topdown-tactix.vercel.app/).

A high-performance, real-time 2D multiplayer soccer engine designed to solve the challenges of **deterministic physics synchronization** and **authoritative state management** in web-based environments.

![Project Status](https://img.shields.io/badge/status-active-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white)
![Matter.js](https://img.shields.io/badge/matter.js-physics-blue)

## Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React, TypeScript, Matter.js |
| **Backend** | Node.js, Socket.io |
| **Architecture** | Monorepo (Shared types and logic) |
| **Deployment** | Vercel & Render |

## Key Engineering Challenges

*   **Deterministic Physics:** Implemented gravity-free rigid bodies and custom collision sensors to ensure consistent game states across all connected clients.
*   **Authoritative State:** Built a robust server-side loop to handle goal detection and pitch-reset logic, ensuring a single source of truth for all game events.
*   **Synchronization:** Optimized the client-server communication protocol to maintain a consistent gameplay loop.

## Technical Documentation
For a deeper look into the architectural decisions, physics synchronization logic, and system design, please refer to the [**/docs directory**](https://github.com/rhit-jamesnc/TopDown-Tactix/tree/main/docs). 

*   *Key topics covered:* Deterministic time-stepping, server-authoritative state resolution, and monorepo structural patterns.

## Development Roadmap

### Engine & Core Mechanics
- [x] Physics core, boundary constraints, and rigid body dynamics.
- [x] Authoritative server-side goal detection and pitch-reset.
- [ ] Implement forfeit/win-screen logic for player disconnections.

### Feature Roadmap (TopDown Games)
- [ ] **Game Modes:** Implementation of vs. Computer, Ranked matches, and special ability variants.
- [ ] **Draft System:** Randomly generated player pools with a draft/ban phase.
- [ ] **Player Stats & Leaderboard:** Tracking Win %, average goals, and games played.
- [ ] **Expansion:** Scaling the engine for additional titles (e.g., *TopDown Touchdown*).

## Getting Started

### Prerequisites

*   Node.js (v20+)
*   npm or pnpm

### Installation

```bash
# Clone the repository
git clone [https://github.com/rhit-jamesnc/TopDown-Tactix.git](https://github.com/rhit-jamesnc/TopDown-Tactix.git)
cd TopDown-Tactix

# Install dependencies
pnpm install

# Start the full system (frontend and backend)
npm run start:all
```
---
Developed as a professional software engineering project to demonstrate mastery of full-stack real-time systems.