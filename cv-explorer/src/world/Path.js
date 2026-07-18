import * as THREE from 'three';

/**
 * Path — a winding Catmull-Rom curve through the world.
 *
 * Generates:
 *  - A tube geometry rendered as a faintly glowing walkway
 *  - A list of `waypoints` (uniform sample points + tangents) the WorldBuilder
 *    uses to place Books at regular intervals.
 *
 * The curve is designed to stay within the terrain's flat zone (radius < 70)
 * and within the camera boundary (radius < 85). It snakes outward so the
 * player encounters books one at a time as they walk.
 */
export class Path {
  constructor(options = {}) {
    this.group = new THREE.Group();
    this.group.name = 'journeyPath';

    // Control points — a hand-tuned winding route. All within r<70.
    // Order: start near origin, snake outward, end far away.
    const pts = options.points || [
      [0, 0],            // start
      [6, -8],
      [-4, -20],
      [10, -32],
      [-8, -42],
      [6, -52],
      [-12, -60],
      [0, -68]           // end (still inside boundary)
    ];
    this.controlPoints = pts.map(([x, z]) => new THREE.Vector3(x, 0.05, z));

    this.tubeRadius = options.tubeRadius ?? 0.35;
    this.tubeColor = options.tubeColor ?? 0x4488ff;
    this.waypointCount = options.waypointCount ?? 15; // one per book chapter

    this.curve = null;
    this.waypoints = []; // {position, tangent, normal, distance}
    this.tubeMesh = null;
    this.glowMesh = null;

    this.build();
  }

  build() {
    // Build the Catmull-Rom curve through the control points
    this.curve = new THREE.CatmullRomCurve3(
      this.controlPoints,
      false,            // not closed
      'catmullrom',
      0.5                // tension
    );

    // Sample waypoints at uniform parameter values.
    // We place the FIRST waypoint slightly in from the start and the LAST
    // slightly in from the end so books don't sit exactly on the endpoints.
    const n = this.waypointCount;
    const pad = 0.5 / (n + 1); // avoid t=0 and t=1
    for (let i = 0; i < n; i++) {
      const t = pad + (i / (n - 1)) * (1 - 2 * pad);
      const position = this.curve.getPoint(t);
      const tangent = this.curve.getTangent(t).normalize();
      // Normal = perpendicular to tangent on the XZ plane
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      this.waypoints.push({ position, tangent, normal, t });
    }

    this.createTubeMesh();
    this.createGlowRibbon();
    this.createPathStones();
  }

  /**
   * A faintly glowing tube along the curve — the visible walkway.
   */
  createTubeMesh() {
    const geom = new THREE.TubeGeometry(this.curve, 200, this.tubeRadius, 8, false);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x1a2a3a,
      emissive: this.tubeColor,
      emissiveIntensity: 0.25,
      metalness: 0.4,
      roughness: 0.5,
      transparent: true,
      opacity: 0.7
    });
    this.tubeMesh = new THREE.Mesh(geom, mat);
    this.tubeMesh.name = 'pathTube';
    this.tubeMesh.receiveShadow = true;
    this.group.add(this.tubeMesh);
  }

  /**
   * A brighter additive ribbon sitting just above the tube for a magical glow.
   */
  createGlowRibbon() {
    const segments = 200;
    const positions = new Float32Array(segments * 2 * 3);
    const ribbonWidth = 0.25;

    for (let i = 0; i < segments; i++) {
      const t = i / (segments - 1);
      const tNext = (i + 1) / (segments - 1);
      const p = this.curve.getPoint(t);
      const pNext = this.curve.getPoint(tNext);
      const tan = this.curve.getTangent(t).normalize();
      const normal = new THREE.Vector3(-tan.z, 0, tan.x).normalize();

      // Two vertices across the ribbon at point p
      positions[(i * 2) * 3]     = p.x + normal.x * ribbonWidth;
      positions[(i * 2) * 3 + 1] = 0.12;
      positions[(i * 2) * 3 + 2] = p.z + normal.z * ribbonWidth;
      positions[(i * 2 + 1) * 3]     = p.x - normal.x * ribbonWidth;
      positions[(i * 2 + 1) * 3 + 1] = 0.12;
      positions[(i * 2 + 1) * 3 + 2] = p.z - normal.z * ribbonWidth;

      // Connect to the next pair (next segment of the ribbon)
      // (the strip is built via the triangle strip render mode)
      void pNext;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.MeshBasicMaterial({
      color: this.tubeColor,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.glowMesh = new THREE.Mesh(geom, mat);
    this.glowMesh.name = 'pathGlow';
    this.group.add(this.glowMesh);
  }

  /**
   * Small glowing marker stones at each waypoint — visible "breadcrumbs"
   * guiding the player along the path.
   */
  createPathStones() {
    const stoneGeom = new THREE.IcosahedronGeometry(0.18, 0);
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x3a4a5a,
      emissive: this.tubeColor,
      emissiveIntensity: 0.6,
      metalness: 0.3,
      roughness: 0.6
    });

    for (let i = 0; i < this.waypoints.length; i++) {
      const wp = this.waypoints[i];
      const stone = new THREE.Mesh(stoneGeom, stoneMat.clone());
      // Place beside the path (offset along normal) so it doesn't sit ON the tube
      stone.position.copy(wp.position);
      stone.position.x += wp.normal.x * 0.7;
      stone.position.z += wp.normal.z * 0.7;
      stone.position.y = 0.3;
      stone.castShadow = true;
      stone.userData = { type: 'pathStone', index: i };
      this.group.add(stone);
    }
  }

  /**
   * Return waypoint positions for placing books (offset to the side of the
   * path so the player walks PAST the book rather than into it).
   */
  getBookPositions(offset = 3.5) {
    return this.waypoints.map((wp) => ({
      position: new THREE.Vector3(
        wp.position.x + wp.normal.x * offset,
        0,
        wp.position.z + wp.normal.z * offset
      ),
      tangent: wp.tangent.clone(),
      // Have the book face along the path direction so the player sees the
      // cover as they approach
      facingY: Math.atan2(wp.tangent.x, wp.tangent.z),
      index: wp.t
    }));
  }

  update(elapsed) {
    // Gentle pulse on the glow ribbon
    if (this.glowMesh) {
      this.glowMesh.material.opacity = 0.35 + Math.sin(elapsed * 1.5) * 0.1;
    }
    if (this.tubeMesh) {
      this.tubeMesh.material.emissiveIntensity = 0.2 + Math.sin(elapsed * 0.8) * 0.05;
    }
  }

  getGroup() { return this.group; }

  dispose() {
    this.group.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
    });
    this.group.clear();
  }
}

export default Path;
