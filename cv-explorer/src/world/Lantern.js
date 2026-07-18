import * as THREE from 'three';

/**
 * Lantern — a hanging glowing lantern placed along the path for ambience.
 * Purely decorative; cheap (one PointLight + one emissive mesh).
 */
export class Lantern {
  constructor(options = {}) {
    this.group = new THREE.Group();
    this.group.position.copy(options.position || new THREE.Vector3());
    this.color = new THREE.Color(options.color ?? 0xffaa44);
    this.intensity = options.intensity ?? 1.2;
    this.height = options.height ?? 3.5;
    this.build();
  }

  build() {
    // Post
    const postGeom = new THREE.CylinderGeometry(0.05, 0.07, this.height, 6);
    const postMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a, metalness: 0.7, roughness: 0.4
    });
    const post = new THREE.Mesh(postGeom, postMat);
    post.position.y = this.height / 2;
    post.castShadow = true;
    this.group.add(post);

    // Arm
    const armGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6);
    const arm = new THREE.Mesh(armGeom, postMat);
    arm.position.set(0.3, this.height - 0.05, 0);
    arm.rotation.z = Math.PI / 2;
    this.group.add(arm);

    // Lantern body (small glowing sphere)
    const bodyGeom = new THREE.SphereGeometry(0.22, 12, 10);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: this.color,
      emissive: this.color,
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.9
    });
    this.body = new THREE.Mesh(bodyGeom, bodyMat);
    this.body.position.set(0.55, this.height - 0.35, 0);
    this.group.add(this.body);

    // Point light
    this.light = new THREE.PointLight(this.color, this.intensity, 12, 1.8);
    this.light.position.copy(this.body.position);
    this.group.add(this.light);

    this.phase = Math.random() * Math.PI * 2;
  }

  update(elapsed) {
    // Subtle flicker
    const flicker = 0.85 + Math.sin(elapsed * 4 + this.phase) * 0.1 + Math.sin(elapsed * 11 + this.phase) * 0.05;
    this.light.intensity = this.intensity * flicker;
    this.body.material.emissiveIntensity = 1.5 * flicker;
  }

  dispose() {
    this.group.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
    this.group.clear();
  }
}

export default Lantern;
