import * as THREE from 'three';

const EYE_HEIGHT = 2.6;
const WALK_SPEED = 0.055; // fraction of the road per second at full tilt
const MAX_PITCH = 0.55;
const MAX_YAW = 1.15;

/**
 * Movement along the road.
 *
 * The camera is always ON the curve: `u` is the only positional state. That is
 * what makes this readable as a timeline rather than a sandbox – you cannot get
 * lost, and every control (keys, wheel, drag, scrubber, deep link) is just a
 * different way of changing one number. Looking around is a yaw/pitch offset
 * applied on top of the road tangent.
 */
export class Journey {
  constructor(road, camera, domElement) {
    this.road = road;
    this.camera = camera;
    this.dom = domElement;

    this.u = 0;
    this.targetU = 0;
    this.yaw = 0;
    this.pitch = 0;
    this.targetYaw = 0;
    this.targetPitch = 0;

    this.keys = new Set();
    this.enabled = true;
    this.dragging = false;
    this.lastPointer = { x: 0, y: 0 };
    this.pointerMoved = 0;

    this.onSelect = null; // set by main.js

    this.#bind();
  }

  #bind() {
    this._onKeyDown = (e) => {
      if (!this.enabled) return;
      const key = e.key.toLowerCase();
      if (['w', 's', 'a', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault();
        this.keys.add(key);
      }
    };
    this._onKeyUp = (e) => this.keys.delete(e.key.toLowerCase());

    this._onPointerDown = (e) => {
      if (!this.enabled) return;
      this.dragging = true;
      this.pointerMoved = 0;
      this.lastPointer = { x: e.clientX, y: e.clientY };
      this.dom.setPointerCapture?.(e.pointerId);
    };

    this._onPointerMove = (e) => {
      if (!this.dragging || !this.enabled) return;
      const dx = e.clientX - this.lastPointer.x;
      const dy = e.clientY - this.lastPointer.y;
      this.lastPointer = { x: e.clientX, y: e.clientY };
      this.pointerMoved += Math.abs(dx) + Math.abs(dy);
      this.targetYaw = THREE.MathUtils.clamp(this.targetYaw - dx * 0.004, -MAX_YAW, MAX_YAW);
      this.targetPitch = THREE.MathUtils.clamp(this.targetPitch - dy * 0.003, -MAX_PITCH, MAX_PITCH);
    };

    this._onPointerUp = (e) => {
      const wasDrag = this.pointerMoved > 6;
      this.dragging = false;
      this.dom.releasePointerCapture?.(e.pointerId);
      if (!wasDrag && this.enabled && this.onSelect) {
        const rect = this.dom.getBoundingClientRect();
        this.onSelect({
          x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
          y: -((e.clientY - rect.top) / rect.height) * 2 + 1
        });
      }
    };

    this._onWheel = (e) => {
      if (!this.enabled) return;
      e.preventDefault();
      this.targetU = THREE.MathUtils.clamp(this.targetU + e.deltaY * 0.00022, 0, 1);
    };

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    this.dom.addEventListener('pointerdown', this._onPointerDown);
    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp);
    this.dom.addEventListener('wheel', this._onWheel, { passive: false });
  }

  /** Snap the traveller to a station, used by the timeline and deep links. */
  goTo(u, { instant = false } = {}) {
    this.targetU = THREE.MathUtils.clamp(u, 0, 1);
    if (instant) this.u = this.targetU;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) this.keys.clear();
  }

  update(dt) {
    if (this.enabled) {
      let move = 0;
      if (this.keys.has('w') || this.keys.has('arrowup')) move += 1;
      if (this.keys.has('s') || this.keys.has('arrowdown')) move -= 1;
      if (move !== 0) {
        this.targetU = THREE.MathUtils.clamp(this.targetU + move * WALK_SPEED * dt, 0, 1);
      }

      let turn = 0;
      if (this.keys.has('a') || this.keys.has('arrowleft')) turn += 1;
      if (this.keys.has('d') || this.keys.has('arrowright')) turn -= 1;
      if (turn !== 0) {
        this.targetYaw = THREE.MathUtils.clamp(this.targetYaw + turn * 1.4 * dt, -MAX_YAW, MAX_YAW);
      }
    }

    // Ease everything so the walk feels like walking, not teleporting.
    this.u += (this.targetU - this.u) * Math.min(1, dt * 3.4);
    this.yaw += (this.targetYaw - this.yaw) * Math.min(1, dt * 6);
    this.pitch += (this.targetPitch - this.pitch) * Math.min(1, dt * 6);

    const position = this.road.pointAt(this.u);
    this.camera.position.set(position.x, position.y + EYE_HEIGHT, position.z);

    const tangent = this.road.tangentAt(this.u);
    const heading = Math.atan2(tangent.x, tangent.z) + this.yaw;
    const look = new THREE.Vector3(
      position.x + Math.sin(heading) * 10,
      position.y + EYE_HEIGHT + Math.tan(this.pitch) * 10,
      position.z + Math.cos(heading) * 10
    );
    this.camera.lookAt(look);

    return this.u;
  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this.dom.removeEventListener('pointerdown', this._onPointerDown);
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerup', this._onPointerUp);
    this.dom.removeEventListener('wheel', this._onWheel);
  }
}
