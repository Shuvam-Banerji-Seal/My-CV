import * as THREE from 'three';

export const STATION_SPACING = 26;
export const ROAD_WIDTH = 7;
/** Empty road before the first station and after the last one. */
export const LEAD_IN = 34;
export const LEAD_OUT = 40;
/** How far short of a station the traveller stops, in station spacings. */
export const VIEW_LEAD = 0.95;

/**
 * The spine of the whole experience.
 *
 * Builds a gently meandering curve through 3D space with one control point per
 * milestone, then a ribbon mesh along it. Everything else in the scene (camera,
 * stations, era gates, scenery) positions itself by asking this object for a
 * point at some normalised distance `u`, so the road is the single source of
 * truth for layout.
 */
export class Road {
  constructor(count) {
    this.count = count;
    this.curve = Road.buildCurve(count);
    this.length = this.curve.getLength();
    this.group = new THREE.Group();
    this.group.name = 'road';
    this.#buildSurface();
    this.#buildEdges();
    this.#buildCentreLine();
  }

  /**
   * Control points: straight down -Z, meandering in X and drifting in Y so the
   * walk never feels like a corridor. Deterministic (no RNG) so the layout is
   * identical on every load and testable.
   */
  static buildCurve(count) {
    const points = [];
    const total = Math.max(count, 2);

    points.push(new THREE.Vector3(0, 0, LEAD_IN));

    for (let i = 0; i < total; i++) {
      const z = -i * STATION_SPACING;
      const x = Math.sin(i * 0.31) * 6 + Math.sin(i * 0.11) * 3.5;
      // Non-negative: the ground plane sits just below y = 0, so a road that
      // dipped under it would be clipped out of sight at every trough.
      const y = (Math.sin(i * 0.27) * 0.5 + 0.5) * 1.4;
      points.push(new THREE.Vector3(x, y, z));
    }

    const lastZ = -(total - 1) * STATION_SPACING - LEAD_OUT;
    points.push(new THREE.Vector3(0, 0, lastZ));

    const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
    curve.arcLengthDivisions = total * 24;
    return curve;
  }

  /** Total path length in world units, including the lead-in and lead-out. */
  get pathSpan() {
    const span = this.count > 1 ? (this.count - 1) * STATION_SPACING : 1;
    return LEAD_IN + span + LEAD_OUT;
  }

  /** Distance along the curve, normalised to [0, 1], for milestone `index`. */
  uForStation(index) {
    const travelled = LEAD_IN + index * STATION_SPACING;
    return THREE.MathUtils.clamp(travelled / this.pathSpan, 0, 1);
  }

  /**
   * Where the traveller should stand to *read* station `index`.
   *
   * Standing level with a station puts its plaque at right angles to the view
   * and therefore off-screen, so stop a little short: the plaque then sits
   * ahead and to one side, which is what you want to walk toward.
   */
  viewUForStation(index) {
    const back = VIEW_LEAD * STATION_SPACING;
    const travelled = LEAD_IN + index * STATION_SPACING - back;
    return THREE.MathUtils.clamp(travelled / this.pathSpan, 0, 1);
  }

  pointAt(u) {
    return this.curve.getPointAt(THREE.MathUtils.clamp(u, 0, 1));
  }

  tangentAt(u) {
    return this.curve.getTangentAt(THREE.MathUtils.clamp(u, 0, 1)).normalize();
  }

  /** Unit vector pointing to the road's right-hand side at `u`. */
  rightAt(u) {
    const tangent = this.tangentAt(u);
    return new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
  }

  #buildSurface() {
    const segments = Math.max(this.count * 12, 64);
    const positions = [];
    const uvs = [];
    const indices = [];

    for (let i = 0; i <= segments; i++) {
      const u = i / segments;
      const centre = this.pointAt(u);
      const right = this.rightAt(u).multiplyScalar(ROAD_WIDTH / 2);

      positions.push(
        centre.x - right.x, centre.y + 0.02, centre.z - right.z,
        centre.x + right.x, centre.y + 0.02, centre.z + right.z
      );
      uvs.push(0, u * segments * 0.5, 1, u * segments * 0.5);

      if (i < segments) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      color: 0x1b2436,
      roughness: 0.85,
      metalness: 0.05
    });

    this.surface = new THREE.Mesh(geometry, material);
    this.surface.receiveShadow = true;
    this.group.add(this.surface);
  }

  /** Two glowing kerb lines so the road reads clearly against the dark ground. */
  #buildEdges() {
    const samples = Math.max(this.count * 10, 60);

    for (const side of [-1, 1]) {
      const pts = [];
      for (let i = 0; i <= samples; i++) {
        const u = i / samples;
        const centre = this.pointAt(u);
        const right = this.rightAt(u).multiplyScalar((side * ROAD_WIDTH) / 2);
        pts.push(new THREE.Vector3(centre.x + right.x, centre.y + 0.06, centre.z + right.z));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(pts);
      const material = new THREE.LineBasicMaterial({
        color: 0x5eead4,
        transparent: true,
        opacity: 0.5
      });
      this.group.add(new THREE.Line(geometry, material));
    }
  }

  /** Dashed centre line: the cheapest cue that this is a road you walk along. */
  #buildCentreLine() {
    const dashes = Math.max(this.count * 3, 24);
    for (let i = 0; i < dashes; i++) {
      const u0 = i / dashes;
      const u1 = u0 + 0.4 / dashes;
      if (u1 > 1) break;
      const a = this.pointAt(u0);
      const b = this.pointAt(u1);
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(a.x, a.y + 0.07, a.z),
        new THREE.Vector3(b.x, b.y + 0.07, b.z)
      ]);
      const material = new THREE.LineBasicMaterial({
        color: 0x8fb7ff,
        transparent: true,
        opacity: 0.28
      });
      this.group.add(new THREE.Line(geometry, material));
    }
  }

  dispose() {
    this.group.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  }
}
