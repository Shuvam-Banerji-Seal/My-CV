import * as THREE from 'three';

class Lighting {
  constructor() {
    this.lights = {};
    this.group = new THREE.Group();
  }

  init() {
    this.createAmbientLight();
    this.createMoonlight();
    this.createAccentLights();
    return this;
  }

  // Dim atmospheric ambient light
  createAmbientLight() {
    const ambient = new THREE.AmbientLight(0x1a1a2e, 0.3);
    this.lights.ambient = ambient;
    this.group.add(ambient);
  }

  // Main directional light (moonlight effect)
  createMoonlight() {
    const moonlight = new THREE.DirectionalLight(0x4466aa, 0.8);
    moonlight.position.set(50, 80, 30);
    moonlight.target.position.set(0, 0, 0);
    
    // Shadow configuration (optimized for performance)
    moonlight.castShadow = true;
    moonlight.shadow.mapSize.width = 1024; // Reduced from 2048
    moonlight.shadow.mapSize.height = 1024;
    moonlight.shadow.camera.near = 5;
    moonlight.shadow.camera.far = 150;
    moonlight.shadow.camera.left = -40;
    moonlight.shadow.camera.right = 40;
    moonlight.shadow.camera.top = 40;
    moonlight.shadow.camera.bottom = -40;
    moonlight.shadow.bias = -0.001;
    
    this.lights.moonlight = moonlight;
    this.group.add(moonlight);
    this.group.add(moonlight.target);
  }

  // Accent lights for atmosphere
  createAccentLights() {
    // Subtle rim light from behind
    const rimLight = new THREE.DirectionalLight(0x2233aa, 0.2);
    rimLight.position.set(-30, 20, -50);
    this.lights.rimLight = rimLight;
    this.group.add(rimLight);

    // Ground bounce light (subtle)
    const bounceLight = new THREE.HemisphereLight(0x0a0a15, 0x1a2a1a, 0.15);
    this.lights.bounceLight = bounceLight;
    this.group.add(bounceLight);
  }

  // Create a point light at a specific position (no shadows for performance)
  createPointLight(position, color = 0x66aaff, intensity = 1, distance = 20) {
    const light = new THREE.PointLight(color, intensity, distance, 2);
    light.position.copy(position);
    light.castShadow = false; // Disabled for performance
    
    this.group.add(light);
    return light;
  }

  // Create spotlight (no shadows for performance)
  createSpotlight(position, target, color = 0xffffff, intensity = 2) {
    const spotlight = new THREE.SpotLight(color, intensity);
    spotlight.position.copy(position);
    spotlight.target.position.copy(target);
    spotlight.angle = Math.PI / 8;
    spotlight.penumbra = 0.5;
    spotlight.decay = 2;
    spotlight.distance = 50;
    spotlight.castShadow = false; // Disabled for performance
    
    this.group.add(spotlight);
    this.group.add(spotlight.target);
    return spotlight;
  }

  // Animate lights (for subtle flickering effects)
  update(elapsed) {
    // Subtle moonlight intensity variation
    if (this.lights.moonlight) {
      this.lights.moonlight.intensity = 0.8 + Math.sin(elapsed * 0.3) * 0.05;
    }
  }

  getGroup() {
    return this.group;
  }
}

export const lighting = new Lighting();
export default lighting;
