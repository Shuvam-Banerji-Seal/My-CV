# CV Road – the CV as a walk through time

An interactive Three.js version of Shuvam Banerji Seal's CV. Every milestone
stands beside a road in **chronological order**, so walking forward *is* moving
through the timeline: school at the near end, the ongoing Master's thesis
projects at the far end.

Live: <https://shuvam-banerji-seal.github.io/My-CV/>

## Quick start

```bash
cd cv-explorer
npm install
npm run dev          # http://localhost:5173/My-CV/
```

## Build / test / lint

```bash
npm run build        # production build → dist/
npm test             # Vitest suite
npm run lint         # ESLint
```

All three must be green before pushing; GitHub Actions builds and deploys
`cv-explorer/dist` to Pages on every push to `main` that touches this folder.

## The idea

The whole experience has exactly one positional variable: `u`, the normalised
distance along a curve. That constraint is deliberate.

- You cannot get lost, because there is nowhere to go but forward and back.
- Distance along the road always means the same thing: elapsed time.
- Every control – `W`/`S`, the scroll wheel, the timeline rail, a deep link –
  is just a different way of setting the same number.

Looking around is a yaw/pitch offset layered on top of the road's tangent, so
you can look at the scenery without ever leaving the timeline.

## Controls

| Input | Action |
|---|---|
| `W` / `S`, `↑` / `↓`, scroll wheel | Walk forward / back along the road |
| `A` / `D`, `←` / `→`, drag | Look around |
| `E`, click a plaque, or the **Open** button | Read the current milestone |
| `Esc` | Close the reader |
| Timeline rail (right edge) | Jump to any milestone |
| `#milestone-id` in the URL | Deep link straight to a station |

## Architecture

```
src/
  main.js                 bootstrap, the render loop, deep links, keyboard
  data/cvData.js          the CV itself – the only file that changes with the .tex
  scene/Road.js           the curve: layout authority for everything else
  scene/World.js          renderer, lights, sky, ground, era gates, scenery
  objects/Station.js      one milestone: pillar, plaque, halo, lamp
  controls/Journey.js     the single `u` value and how every input changes it
  ui/Hud.js               header, "you are here" readout, timeline rail
  ui/Panel.js             the slide-in reader
  ui/Intro.js             title card / loading screen
  utils/labels.js         canvas-drawn textures for all in-world signage
```

Nothing is fetched at runtime: the plaques and year numerals are drawn onto
canvases at startup, so there are no font files or texture atlases to 404 on
GitHub Pages.

### Layout

`Road` builds a Catmull-Rom curve with one control point per milestone,
meandering in X and undulating in Y (kept non-negative so the surface never
sinks below the ground plane). Two derived positions matter:

- `uForStation(i)` – where milestone *i* physically stands.
- `viewUForStation(i)` – where you stand to *read* it, a little short of the
  station itself. Standing level with a plaque puts it at 90° to your view,
  which is exactly where you cannot see it.

`nearestStationIndex` compares against the *viewing* positions, so the lit
plaque, the HUD readout and the active timeline dot always agree.

### Colour

`KINDS` in `cvData.js` maps each milestone type to one colour, used for the
pillar glow, the timeline dot and the reader's accent. The same colour always
means the same kind of thing. The sky also warms gradually from the start of the
road to the end, so "how far along am I" is readable peripherally.

## Keeping it in sync with the CV

`src/data/cvData.js` is derived from the LaTeX sources in the repository root
(`Shuvam_Banerji_Seal_CV.tex` is the master). When a `.tex` file changes, update
`cvData.js` and run `npm test` – the suite asserts the data stays chronological,
uniquely identified, and faithful on the specific facts it checks.
