# REWIND RUNNER

> A side-scrolling puzzle platformer built around a time-reversal mechanic — rewind up to five seconds of gameplay to undo mistakes, solve puzzles, and overcome platforming challenges that are impossible to clear moving only forward through time.

Developed for a game development assignment centered on the theme **"Reversal"**, REWIND RUNNER treats time manipulation not as a cosmetic flourish but as the fundamental design axis of every level, mechanic, and puzzle. The rewind system captures and restores the full world state — player position, platform conditions, hazard cycles, triggered events, and environmental destruction — making reversal a first-class gameplay verb rather than a reset button.

---

## Demo

> Watch the gameplay demonstration to see the rewind mechanic, level design, and visual effects in action.

**[https://drive.google.com/file/d/1afg01al2HW2DKWmEjSieiucFyf-G9EbR/view?usp=drivesdk]**

---

## Table of Contents

- [Features](#features)
- [Gameplay](#gameplay)
- [Controls](#controls)
- [Technical Highlights](#technical-highlights)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Reversal Theme Implementation](#reversal-theme-implementation)
- [Challenges & Learnings](#challenges--learnings)
- [Future Improvements](#future-improvements)
- [Author](#author)

---

## Features

### Core Mechanics

| Feature | Description |
|---|---|
| Time Rewind System | Rewind up to 5 seconds of full world state at any moment |
| Rewind Meter | Depletable resource that governs how long you can rewind; recharged at checkpoints |
| Time Echoes | A ghost of the player's recent past rendered in the world as a visual trail |
| Rewind-Only Platforms | Platforms that only materialise while the rewind mechanic is active |

### Level Design

| Feature | Description |
|---|---|
| Multiple Levels | Three hand-crafted levels with increasing complexity and new mechanic introductions |
| Checkpoints | Restore spawn position and refill the rewind meter |
| Moving Platforms | Sinusoidal platforms moving on X or Y axes |
| Crumbling Platforms | Platforms that crack on contact and collapse after a short delay, then respawn |
| Bouncy Platforms | Launch the player to otherwise unreachable vertical heights |
| Environmental Hazards | Spinning blades and laser beams with independent timing and phase offsets |

### Collectibles & Progression

| Feature | Description |
|---|---|
| Collectibles | Standard orbs spread throughout each level |
| Secret Collectibles | Star collectibles hidden in off-path or rewind-gated locations |
| Save System | Persistent save data across sessions |
| Dynamic HUD | Live display of rewind meter, collectible count, level timer, and score |

### Presentation

| Feature | Description |
|---|---|
| Particle System | Burst and continuous particle effects for jumps, deaths, collectibles, and rewind |
| VHS-Inspired Temporal Effects | Screen-space visual distortion tied to the rewind state |
| Parallax Backgrounds | Multi-layer scrolling backgrounds per level with distinct art styles |
| Camera System | Smooth follow camera with world-space clamping |

---

## Gameplay

### Objective

Reach the exit portal at the end of each level. Along the way, collect orbs to build your score, find hidden star collectibles, and use the rewind mechanic to navigate hazards and platform sequences that cannot be completed in a single forward attempt.

### Rewind Mechanic

Hold the rewind key to travel backwards through up to five seconds of recorded world state. Every element of the world rewinds with you: your position and velocity, the state of every platform (including crumbled platforms that reconstruct themselves), hazard positions, collected items, activated switches, and opened doors. Releasing the key resumes forward time from the restored moment.

The rewind meter depletes while rewinding and recharges passively at a slower rate, or fully at a checkpoint. Managing the meter is a core resource loop — knowing when to commit to a sequence and when to spend rewind time is the central skill of the game.

### Collectibles

Standard collectibles award 100 points each. Star collectibles, marked distinctly and placed in harder-to-reach or rewind-gated locations, award 500 points each. Total collectibles collected per level are tracked and displayed on the completion screen.

### Progression

Complete a level by reaching the exit portal. Levels unlock sequentially. The save system records your progress, collectible counts, and best times.

---

## Controls

| Action | Keyboard |
|---|---|
| Move Left | `A` or `Arrow Left` |
| Move Right | `D` or `Arrow Right` |
| Jump | `Space` or `W` or `Arrow Up` |
| Rewind | Hold `Z` or `Left Shift` |
| Interact | `E` |
| Pause | `Escape` |

**Jump feel:** The jump supports variable height — releasing the jump key early applies a cut force that shortens the arc, allowing both short hops and full jumps from the same input. Coyote time and jump buffering are implemented so input at platform edges and just before landing both register correctly.

---

## Technical Highlights

### HTML5 Canvas Rendering

The entire game renders to a single `<canvas>` element at 1280x720. Every frame is cleared and redrawn from scratch using the 2D Canvas API. All sprites are drawn procedurally in code — no external image assets. Platform types, player animation states, hazards, particles, and UI elements are each drawn with their own Canvas draw routines, keeping the asset pipeline entirely self-contained.

### Game Loop

The game loop is driven by `requestAnimationFrame`. Delta time (`dt`) is computed each frame and capped to prevent large time steps from destabilising physics during tab switching or frame drops. The loop runs: input sampling → world update (physics, AI, platform states) → collision resolution → snapshot recording → render.

### Physics System

Physics are computed with semi-implicit Euler integration. Gravity is applied as a constant downward acceleration (`1800 px/s²`). Horizontal movement uses velocity smoothing toward a target speed rather than direct assignment, giving responsive but not instant acceleration. A maximum fall speed cap prevents tunnelling through thin platforms at high velocities.

### Collision Detection

Collision uses AABB (axis-aligned bounding box) overlap testing. For each overlapping platform, the system computes the minimum penetration depth on both axes and resolves in the axis with the smaller overlap, correctly distinguishing top-landings from side-collisions and head-bumps. Moving platforms transfer their velocity to the player during contact.

### State Recording and Rewind

Every game tick, a `WorldSnapshot` is serialised and pushed into a fixed-length circular history buffer sized to hold 5 seconds at 60 frames per second (300 frames). Each snapshot captures the complete state of every dynamic object in the world: player kinematics, platform positions and crack levels, hazard phases, collectible states, switch and door states, and portal state.

During rewind, snapshots are consumed from the tail of the buffer in reverse, and each object's `restoreState()` method is called with the historical values. This produces seamless backwards playback across the full world rather than just the player position.

### Particle System

The particle system maintains a pool of active particles, each with position, velocity, size, colour, lifetime, and an optional gravity multiplier. Burst emitters fire a spread of particles on events (landing, death, collecting, platform collapse). Continuous emitters produce trails during rewind. All particles are drawn as filled circles with alpha decay tied to remaining lifetime.

### Camera System

The camera is a smooth-follow system that interpolates toward the player position each frame using a lerp factor. It clamps to world bounds so the viewport never reveals empty space outside the level. During rendering, the camera transform is applied via `ctx.save()` / `ctx.translate()` / `ctx.restore()`, keeping all world-space draw calls coordinate-agnostic.

### Visual Effects Pipeline

The rendering pass applies a VHS-inspired screen-space effect during rewind: scanline overlays and chromatic colour tinting are composited on top of the world render to make the temporal state perceptually distinct. A parallax background system draws multiple layers at different scroll speeds relative to the camera, computed per-frame from the camera's world position.

---

## Project Structure

```
rewind-runner/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.ts                  # Entry point, canvas setup, game loop
    ├── Game.ts                  # Top-level game state machine (menu, playing, paused, etc.)
    ├── World.ts                 # World update loop, collision resolution, interaction handling
    ├── style.css
    ├── core/
    │   ├── constants.ts         # Physics constants, palette, shared types
    │   ├── input.ts             # Keyboard input mapping and state
    │   └── camera.ts            # Smooth-follow camera with world clamping
    ├── entities/
    │   ├── Player.ts            # Player physics, jump logic, animation, draw
    │   ├── Platform.ts          # All platform types: solid, crumbling, moving, bouncy, rewind-only, spike
    │   ├── Hazard.ts            # Blade and laser hazards with phase-offset timing
    │   ├── Interactables.ts     # Collectibles, switches, doors, portals, checkpoints
    │   └── TimeEcho.ts          # Ghost trail rendered from recent player state history
    ├── levels/
    │   └── LevelData.ts         # Level 1, 2, and 3 definitions (platforms, hazards, collectibles, layout)
    ├── systems/
    │   ├── HistoryBuffer.ts     # Fixed-length circular buffer for snapshot storage
    │   ├── RewindSystem.ts      # Rewind meter, snapshot record/consume, rewind state flags
    │   └── ParticleSystem.ts    # Particle pool, emit, burst, and draw
    ├── fx/
    │   ├── Background.ts        # Parallax multi-layer background renderer
    │   ├── FireEffect.ts        # Ambient fire particle emitters placed in levels
    │   └── VisualEffects.ts     # Screen-space VHS/rewind overlay effects
    ├── audio/
    │   └── AudioManager.ts      # Web Audio API sound synthesis for game events
    └── ui/
        ├── HUD.ts               # In-game heads-up display (meter, score, timer, collectibles)
        ├── MenuSystem.ts        # Main menu, level select, pause, game over, level complete screens
        └── SaveSystem.ts        # localStorage-backed save/load for progress and scores
```

---

## Installation & Setup

**Prerequisites:** Node.js 18 or later.

```bash
# Clone the repository
git clone https://github.com/your-username/rewind-runner.git
cd rewind-runner

# Install dependencies
npm install

# Start the development server
npm run dev
```

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

---

## Reversal Theme Implementation

The assignment theme was **"Reversal"**. The design decision was to make reversal the game's primary verb — not a single mechanic layered on top of a normal platformer, but the axis around which every other system is designed.

**Level design:** Levels contain platform sequences and hazard timings that are intentionally difficult or impossible to complete on a single forward pass. Crumbling platforms collapse before a second jump can be made. Rewind-only platforms do not exist in forward time. These are not obstacles to the rewind mechanic — they are the puzzles that make the rewind mechanic necessary.

**State scope:** The rewind captures the full world state, not just the player. A crumbling platform that has already collapsed will reconstruct itself during rewind. A collectible that was picked up will reappear. A switch that was activated will deactivate. This means rewinding returns to a genuinely earlier state of the world, not a player checkpoint in an otherwise unchanged world.

**Resource cost:** The rewind meter creates tension. Unlimited rewinding would reduce the mechanic to a safety net. The meter forces the player to choose between spending rewind time to recover from a mistake and conserving it for a puzzle section ahead. This makes every use of the rewind a meaningful decision rather than an automatic response to failure.

**Presentation:** Visual and audio feedback is distinct during rewind — the VHS-style screen effect and reversed particle trails make the temporal state legible at a glance. The time echo (ghost of the player's recent past) is visible in forward time as well, giving the player a constant visual reminder that their history exists and can be accessed.

---

## Challenges & Learnings

**Rewind state management** was the most architecturally demanding part of the project. The core challenge was defining a serialisable snapshot format that covered every dynamic object in the world without coupling the snapshot system to each object's internal representation. The solution was a `getState()` / `restoreState()` interface on every entity, with the snapshot system responsible only for storage and retrieval. This kept the rewind logic isolated and made adding new entity types straightforward.

**Canvas rendering performance** required careful attention to draw call ordering and the avoidance of unnecessary state changes. Grouping draws by type, using `ctx.save()` and `ctx.restore()` correctly, and skipping off-screen entities via the camera's visibility check kept frame time acceptable across all three levels.

**Physics balancing** involved iterating on gravity, jump force, and platform placement to produce jump arcs that felt responsive while still being legible and fair. The principal challenge was ensuring that every required jump in every level was reachable under realistic framerate conditions — not just at a fixed 60fps — which required testing the physics integrator against variable delta times and adjusting forces and platform heights to provide adequate clearance margins.

**Game architecture** at this scale required establishing clear ownership boundaries early. The `World` class owns simulation and collision; `Game` owns the state machine and input routing; individual entity classes own their own draw and physics state. Keeping these boundaries enforced made it possible to add systems (particle effects, the save system, the audio manager) without restructuring existing code.

---

## Future Improvements

- **Additional levels** with new mechanic introductions, including time-gated doors that only open within a fixed window of a rewind cycle
- **Expanded temporal mechanics** — rewinding individual objects rather than the whole world, or areas of the level with different time flows
- **Boss encounters** designed around the rewind mechanic: enemies whose attack patterns can only be countered by rewinding to a prior position
- **Enhanced sound design** with a full original soundtrack and procedurally generated audio feedback tied to rewind depth
- **Expanded puzzle systems** using the switch/door framework: pressure plates, timed sequences, and multi-step environmental puzzles
- **Leaderboard and time-trial mode** tracking completion time and rewind usage as separate performance metrics
- **Accessibility options** including configurable rewind meter size and adjustable game speed

---

## Author

Developed as a game development assignment submission.

| | |
|---|---|
| **Project** | REWIND RUNNER |
| **Theme** | Reversal |
| **Stack** | TypeScript, HTML5 Canvas, Vite |
| **Repository** | [github.com/your-username/rewind-runner](https://github.com/your-username/rewind-runner) |

---

*Built from scratch without external game frameworks or engine dependencies.*
