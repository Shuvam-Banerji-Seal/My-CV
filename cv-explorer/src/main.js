import * as THREE from 'three';
import { World } from './scene/World.js';
import { Journey } from './controls/Journey.js';
import { Hud } from './ui/Hud.js';
import { Panel } from './ui/Panel.js';
import { Intro } from './ui/Intro.js';

/**
 * Bootstraps the 3D CV road.
 *
 * The whole experience is one axis: distance along a curve, which is also
 * distance through time. `World` owns the scene, `Journey` owns the single
 * position value, and the DOM chrome reads from both.
 */
class CVRoad {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.clock = new THREE.Clock();
    this.started = false;
  }

  init() {
    if (!this.canvas) throw new Error('#canvas not found');

    this.world = new World(this.canvas);
    this.milestones = this.world.milestones;

    this.journey = new Journey(this.world.road, this.world.camera, this.canvas);
    this.journey.onSelect = (ndc) => {
      const station = this.world.pick(ndc);
      if (station) this.openStation(station.index);
    };

    this.hud = new Hud(document.getElementById('hud'), this.milestones, (index) =>
      this.journey.goTo(this.world.road.viewUForStation(index))
    );
    this.hud.onOpenRequest(() => this.openNearest());

    this.panel = new Panel(document.getElementById('panel'));
    this.panel.onClose = () => {
      this.journey.setEnabled(true);
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    };

    this.intro = new Intro(document.getElementById('intro'));
    this.intro.onStart = () => {
      this.started = true;
    };

    window.addEventListener('resize', () => this.world.resize());
    window.addEventListener('keydown', (e) => this.#onKey(e));
    // Pasting a #station-id into the address bar of an already-open tab is a
    // same-document navigation, so init() never re-runs: handle it here too.
    window.addEventListener('hashchange', () => this.#applyDeepLink());

    this.#applyDeepLink();
    this.#loop();
  }

  /** `#milestone-id` in the URL jumps straight to that station. */
  #applyDeepLink() {
    const id = window.location.hash.replace(/^#/, '');
    if (!id) return;
    const index = this.milestones.findIndex((m) => m.id === id);
    if (index === -1) return;
    this.journey.goTo(this.world.road.viewUForStation(index), { instant: true });
    this.intro.dismiss();
  }

  #onKey(event) {
    const key = event.key.toLowerCase();
    if (key === 'escape') {
      this.panel.close();
      return;
    }
    if (key === 'e' && !this.panel.isOpen && this.started) {
      event.preventDefault();
      this.openNearest();
    }
  }

  openNearest() {
    this.openStation(this.world.nearestStationIndex(this.journey.u));
  }

  openStation(index) {
    const milestone = this.milestones[index];
    if (!milestone) return;
    this.journey.goTo(this.world.road.viewUForStation(index));
    this.journey.setEnabled(false);
    this.panel.open(milestone);
    window.history.replaceState(null, '', `#${milestone.id}`);
  }

  #loop() {
    requestAnimationFrame(() => this.#loop());

    const dt = Math.min(this.clock.getDelta(), 0.1);
    const elapsed = this.clock.elapsedTime;

    const u = this.journey.update(dt);
    this.world.update(elapsed, u);
    this.hud.setActive(this.world.nearestStationIndex(u));
    this.world.render();
  }
}

const app = new CVRoad();
app.init();
