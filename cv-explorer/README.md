# CV Explorer — A Magical 3D World

An immersive first-person 3D experience where Shuvam Banerji Seal's CV is
presented as a journey through a magical night-time world. Each CV section is
a **floating book** hovering above a stone plinth along a winding path. Walk
up to a book and its cover opens; click (or press SPACE) to read it as a
two-page spread.

> **Note on "Open Design" MCP:** The user requested an "Open Design" MCP for
> 3D world design. No such MCP was available in the environment. The 3D world
> was designed directly in Three.js and the architecture is documented in
> `docs/mermaid_*.svg`. Flagged per the verify-before-assert principle.

## Quick Start

```bash
cd cv-explorer
npm install
npm run dev          # http://localhost:5173/My-CV/
```

## Build / Test / Lint

```bash
npm run build        # production build → dist/
npm test             # run Vitest suite (49 tests)
npm run lint         # ESLint (0 errors, 0 warnings)
```

All three gates must be green before pushing.

## How It Works

### The Journey

The player spawns at the south end of a winding Catmull-Rom path and walks
north. **15 floating books** — one per CV chapter — line the path at regular
intervals, alternating sides. Each book:

- Floats above a stone plinth, gently bobbing and turning
- Has a coloured glow unique to its chapter (publications = gold, projects =
  cyan, skills = green, education = purple, etc.)
- **Opens its cover** when the player walks within 5.5 units
- Can be **read** by clicking or pressing SPACE — this opens the BookReader
  DOM overlay, which pauses the game and renders the chapter as a two-page
  book spread with page navigation (← → / arrow keys)

### Controls

| Input | Action |
|-------|--------|
| WASD / Arrow Keys | Walk the path |
| Mouse | Look around (pointer lock) |
| Shift | Run |
| Space / Click | Open the nearest book |
| ESC | Close book / release mouse |
| ← → | Turn pages in the reader |

### Architecture

```
src/
├── data/cvData.js          # 15 chapters extracted from the LaTeX CV
├── scene/                  # SceneManager, Camera, Lighting, Terrain, Sky (reused)
├── controls/               # FirstPersonControls, TouchControls, Raycaster (reused)
├── world/
│   ├── WorldBuilder.js     # Builds the winding-path world with books
│   ├── Path.js             # Catmull-Rom curve, tube, glow ribbon, path stones
│   ├── Lantern.js          # Hanging glowing lanterns along the path
│   └── Fireflies.js        # GPU-instanced firefly particle system
├── objects/
│   ├── Book.js             # 3D floating book with open/close animation
│   └── FloatingText.js     # Billboard text (reused)
├── ui/
│   ├── BookReader.js       # DOM overlay: two-page book spread reader
│   ├── HUD.js              # Section indicator, prompts, nav hints
│   └── LoadingScreen.js    # (legacy)
├── animations/             # EntrySequence, SectionReveal, TextEffects (reused)
└── main.js                 # Wires everything together
```

See `docs/mermaid_*.svg` for the full component diagram.

### Source of Truth

The LaTeX file `../Shuvam_Banerji_Seal_CV.tex` is the source of truth (per
the repo README). `cvData.js` is extracted from it and organised as 15
ordered chapters. The test suite `tests/cvData.test.js` verifies faithfulness
to the LaTeX — if the `.tex` is updated, re-extract and re-run the tests.

### Test Suite (49 tests)

| File | Tests | Covers |
|------|-------|--------|
| `cvData.test.js` | 17 | Structure, faithfulness to LaTeX, all 15 chapters |
| `Book.test.js` | 10 | Construction, proximity open/close, raycast userData, disposal |
| `Path.test.js` | 10 | Waypoints, boundary constraints, tube/glow mesh, disposal |
| `BookReader.test.js` | 12 | DOM rendering, page navigation, keyboard, XSS escaping |

## Tech Stack

- **Three.js r170** — 3D rendering
- **Vite 6** — build tooling
- **Vitest 3** — unit testing (jsdom environment)
- **ESLint 9** — flat config, 0 errors / 0 warnings
- **anime.js** — UI animations (BookReader, HUD)
- **@chenglou/pretext** — text layout for 3D text panels
