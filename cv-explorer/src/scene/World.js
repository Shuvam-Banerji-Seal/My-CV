import * as THREE from 'three';
import { Road, STATION_SPACING, LEAD_IN } from './Road.js';
import { Station } from '../objects/Station.js';
import { createYearTexture } from '../utils/labels.js';
import { orderedMilestones, timelineYears, KINDS } from '../data/cvData.js';

/**
 * Sky colours the road walks through. The journey starts in a cold pre-dawn
 * blue and ends in a warm one, so "how far along am I" is legible peripherally
 * without reading a single label.
 */
const ERA_COLORS = [
  new THREE.Color('#050a18'),
  new THREE.Color('#0a1430'),
  new THREE.Color('#101a3a'),
  new THREE.Color('#1a1636'),
  new THREE.Color('#241a33')
];

function eraColorAt(u) {
  const scaled = THREE.MathUtils.clamp(u, 0, 1) * (ERA_COLORS.length - 1);
  const i = Math.min(Math.floor(scaled), ERA_COLORS.length - 2);
  return ERA_COLORS[i].clone().lerp(ERA_COLORS[i + 1], scaled - i);
}

/**
 * Owns the renderer, the scene graph and every static prop. `main.js` drives
 * it; nothing in here knows about the DOM chrome or the controls.
 */
export class World {
  constructor(canvas) {
    this.canvas = canvas;
    this.milestones = orderedMilestones();

    this.scene = new THREE.Scene();
    this.scene.background = ERA_COLORS[0].clone();
    this.scene.fog = new THREE.Fog(ERA_COLORS[0].clone(), 40, 190);

    this.camera = new THREE.PerspectiveCamera(62, 1, 0.1, 900);
    this.#applyProjection();

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.road = new Road(this.milestones.length);
    this.scene.add(this.road.group);

    this.#addLights();
    this.#addGround();
    this.#addStars();
    this.#addHills();
    this.#addStations();
    this.#addYearGates();
    this.#addMotes();

    this.raycaster = new THREE.Raycaster();
  }

  #addLights() {
    this.scene.add(new THREE.HemisphereLight(0x8fb7ff, 0x0a0f1c, 0.55));

    const moon = new THREE.DirectionalLight(0xbcd4ff, 0.8);
    moon.position.set(-60, 90, 40);
    this.scene.add(moon);

    this.travellerLight = new THREE.PointLight(0xffe6bf, 9, 34, 2);
    this.scene.add(this.travellerLight);
  }

  #addGround() {
    const span = this.milestones.length * STATION_SPACING + 400;
    const geometry = new THREE.PlaneGeometry(600, span, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0x090d18,
      roughness: 1,
      metalness: 0
    });
    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = -span / 2 + LEAD_IN;
    ground.position.y = -0.6;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const grid = new THREE.GridHelper(600, 120, 0x1e3050, 0x141f36);
    grid.position.set(0, -0.57, ground.position.z);
    grid.material.transparent = true;
    grid.material.opacity = 0.28;
    this.scene.add(grid);
  }

  #addStars() {
    const count = 2600;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 300 + Math.random() * 260;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.9 + 0.05);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = Math.abs(radius * Math.cos(phi)) * 0.7 + 20;
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xdfe9ff,
      size: 1.5,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.75,
      depthWrite: false
    });
    this.stars = new THREE.Points(geometry, material);
    this.scene.add(this.stars);
  }

  /** Low-poly silhouettes flanking the road, purely for depth cues. */
  #addHills() {
    const geometry = new THREE.ConeGeometry(1, 1, 5);
    const material = new THREE.MeshStandardMaterial({
      color: 0x0d1524,
      roughness: 1,
      flatShading: true
    });
    const count = 90;
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const t = i / count;
      const z = LEAD_IN - t * (this.milestones.length * STATION_SPACING + 200);
      const distance = 55 + ((i * 37) % 90);
      const height = 14 + ((i * 53) % 34);
      dummy.position.set(side * distance, height / 2 - 2, z + ((i * 29) % 60) - 30);
      dummy.scale.set(height * 0.7, height, height * 0.7);
      dummy.rotation.y = (i * 0.7) % Math.PI;
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    this.scene.add(mesh);
  }

  #addStations() {
    this.stations = this.milestones.map((m, i) => new Station(m, i, this.road));
    this.pickables = [];
    for (const station of this.stations) {
      this.scene.add(station.group);
      this.pickables.push(...station.pickTargets);
    }
  }

  /**
   * A translucent year numeral hovering over the road wherever the calendar
   * year changes, so the chronology is readable at a glance.
   */
  #addYearGates() {
    this.yearGates = [];
    const years = timelineYears();
    const seen = new Set();

    this.milestones.forEach((milestone, index) => {
      const year = Math.floor(milestone.sortKey);
      if (seen.has(year) || !years.includes(year)) return;
      seen.add(year);

      const u = Math.max(this.road.uForStation(index) - 0.008, 0);
      const centre = this.road.pointAt(u);
      const tangent = this.road.tangentAt(u);

      const { texture, aspect } = createYearTexture(year, 'rgba(148, 197, 255, 0.55)');
      const width = 9;
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(width, width / aspect),
        new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          opacity: 0.5,
          depthWrite: false
        })
      );
      mesh.position.set(centre.x, 9.5, centre.z);
      mesh.lookAt(centre.x + tangent.x * 5, 9.5, centre.z + tangent.z * 5);
      mesh.rotateY(Math.PI);
      this.scene.add(mesh);
      this.yearGates.push({ year, mesh, texture });
    });
  }

  /** Slow drifting dust, to give the air some body while you walk. */
  #addMotes() {
    const count = 900;
    const positions = new Float32Array(count * 3);
    const span = this.milestones.length * STATION_SPACING + 120;
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 90;
      positions[i * 3 + 1] = Math.random() * 16 + 0.5;
      positions[i * 3 + 2] = LEAD_IN - Math.random() * span;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.motes = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color: 0x9ad7ff,
        size: 0.5,
        transparent: true,
        opacity: 0.4,
        depthWrite: false
      })
    );
    this.scene.add(this.motes);
  }

  /**
   * Index of the station the traveller is currently reading.
   *
   * Compared against each station's *viewing* position rather than the station
   * itself, so the lit plaque is always the one in front of you.
   */
  nearestStationIndex(u) {
    let best = 0;
    let bestDelta = Infinity;
    this.stations.forEach((_, i) => {
      const delta = Math.abs(this.road.viewUForStation(i) - u);
      if (delta < bestDelta) {
        bestDelta = delta;
        best = i;
      }
    });
    return best;
  }

  stationById(id) {
    return this.stations.find((s) => s.milestone.id === id) ?? null;
  }

  /** Raycast from normalised device coordinates; returns a Station or null. */
  pick(ndc) {
    this.raycaster.setFromCamera(ndc, this.camera);
    const hits = this.raycaster.intersectObjects(this.pickables, false);
    if (!hits.length) return null;
    let object = hits[0].object;
    while (object && !object.userData.stationId) object = object.parent;
    return object ? this.stationById(object.userData.stationId) : null;
  }

  update(elapsed, u) {
    const sky = eraColorAt(u);
    this.scene.background = sky;
    this.scene.fog.color = sky;

    const focusIndex = this.nearestStationIndex(u);
    this.stations.forEach((station, i) => {
      const distance = Math.abs(i - focusIndex);
      const nearness = distance === 0 ? 1 : distance === 1 ? 0.45 : distance <= 3 ? 0.16 : 0;
      station.update(elapsed, nearness);
    });

    this.travellerLight.position.copy(this.camera.position).setY(this.camera.position.y + 1.5);
    this.motes.rotation.y = elapsed * 0.008;
    this.stars.rotation.y = elapsed * 0.002;
  }

  /**
   * Three.js `fov` is vertical, so a portrait phone would otherwise crop the
   * horizontal view badly and hide the plaques standing beside the road.
   * Hold the *horizontal* field of view roughly constant instead.
   */
  #applyProjection() {
    const aspect = window.innerWidth / Math.max(window.innerHeight, 1);
    const hfov = THREE.MathUtils.degToRad(84);
    const vfov = 2 * Math.atan(Math.tan(hfov / 2) / Math.max(aspect, 0.3));
    this.camera.aspect = aspect;
    this.camera.fov = THREE.MathUtils.clamp(THREE.MathUtils.radToDeg(vfov), 55, 100);
    this.camera.updateProjectionMatrix();
  }

  resize() {
    this.#applyProjection();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

export { KINDS, eraColorAt };
