import * as THREE from 'three';
import { createPlaqueTexture } from '../utils/labels.js';
import { KINDS } from '../data/cvData.js';

const PILLAR_HEIGHT = 5.2;
const PLAQUE_WIDTH = 7.4;

/**
 * One milestone standing beside the road: a lit pillar, a floating plaque and
 * a halo that brightens as you approach. Stations alternate sides so the walk
 * reads as a two-sided avenue rather than a single wall of text.
 */
export class Station {
  /**
   * @param {object} milestone entry from cvData.milestones
   * @param {number} index position in road order
   * @param {import('../scene/Road.js').Road} road
   */
  constructor(milestone, index, road) {
    this.milestone = milestone;
    this.index = index;
    this.side = index % 2 === 0 ? -1 : 1;
    this.u = road.uForStation(index);

    const kind = KINDS[milestone.kind] ?? KINDS.project;
    this.color = new THREE.Color(kind.color);

    this.group = new THREE.Group();
    this.group.name = `station:${milestone.id}`;
    this.group.userData.stationId = milestone.id;

    const centre = road.pointAt(this.u);
    const right = road.rightAt(this.u);
    const tangent = road.tangentAt(this.u);
    const offset = 7.6;

    this.group.position.set(
      centre.x + right.x * offset * this.side,
      centre.y,
      centre.z + right.z * offset * this.side
    );

    // Angle back toward oncoming travel, so plaques are readable on approach
    // rather than only when you are level with them.
    const lookTarget = new THREE.Vector3(centre.x, centre.y + 2, centre.z).add(
      tangent.clone().multiplyScalar(-11)
    );
    this.group.lookAt(lookTarget);

    this.#buildBase();
    this.#buildPillar();
    this.#buildPlaque(kind);
    this.#buildHalo();

    this.focus = 0;
  }

  #buildBase() {
    const geometry = new THREE.CylinderGeometry(2.5, 2.9, 0.35, 24);
    const material = new THREE.MeshStandardMaterial({
      color: 0x141c2c,
      roughness: 0.9,
      metalness: 0.1
    });
    const base = new THREE.Mesh(geometry, material);
    base.position.y = 0.17;
    base.receiveShadow = true;
    this.group.add(base);
  }

  #buildPillar() {
    const geometry = new THREE.BoxGeometry(0.45, PILLAR_HEIGHT, 0.45);
    this.pillarMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: this.color.clone(),
      emissiveIntensity: 0.65,
      roughness: 0.4,
      metalness: 0.3
    });
    this.pillar = new THREE.Mesh(geometry, this.pillarMaterial);
    this.pillar.position.y = PILLAR_HEIGHT / 2 + 0.3;
    this.pillar.castShadow = true;
    this.group.add(this.pillar);

    // A light on the pillar, so the road itself is lit by the milestones.
    this.lamp = new THREE.PointLight(this.color.getHex(), 6, 26, 2);
    this.lamp.position.set(0, PILLAR_HEIGHT + 0.4, 0);
    this.group.add(this.lamp);
  }

  #buildPlaque(kind) {
    const { texture, aspect } = createPlaqueTexture({
      when: this.milestone.when,
      kindLabel: kind.label,
      title: this.milestone.title,
      org: this.milestone.org,
      color: kind.color
    });

    this.plaqueTexture = texture;
    const height = PLAQUE_WIDTH / aspect;
    const geometry = new THREE.PlaneGeometry(PLAQUE_WIDTH, height);
    this.plaqueMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      opacity: 0.92
    });

    this.plaque = new THREE.Mesh(geometry, this.plaqueMaterial);
    this.plaque.position.set(0, PILLAR_HEIGHT * 0.72, 0.42);
    this.group.add(this.plaque);
  }

  #buildHalo() {
    const geometry = new THREE.RingGeometry(2.7, 3.15, 40);
    this.haloMaterial = new THREE.MeshBasicMaterial({
      color: this.color.clone(),
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.halo = new THREE.Mesh(geometry, this.haloMaterial);
    this.halo.rotation.x = -Math.PI / 2;
    this.halo.position.y = 0.4;
    this.group.add(this.halo);
  }

  /** Objects a raycast may hit to select this station. */
  get pickTargets() {
    return [this.plaque, this.pillar];
  }

  /**
   * @param {number} elapsed seconds since start, for the idle bob
   * @param {number} nearness 0 (far) .. 1 (you are standing at it)
   */
  update(elapsed, nearness) {
    this.focus += (nearness - this.focus) * 0.12;

    const bob = Math.sin(elapsed * 1.1 + this.index) * 0.12;
    this.plaque.position.y = PILLAR_HEIGHT * 0.72 + bob;

    this.plaqueMaterial.opacity = 0.35 + this.focus * 0.62;
    this.pillarMaterial.emissiveIntensity = 0.4 + this.focus * 1.5;
    this.haloMaterial.opacity = 0.1 + this.focus * 0.45;
    this.lamp.intensity = 2 + this.focus * 12;

    this.halo.scale.setScalar(1 + Math.sin(elapsed * 1.6 + this.index) * 0.02 + this.focus * 0.1);
  }

  dispose() {
    this.plaqueTexture.dispose();
    this.group.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  }
}
