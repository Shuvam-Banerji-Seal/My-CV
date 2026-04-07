import * as THREE from 'three';

class SceneManager {
  constructor() {
    this.scene = null;
    this.renderer = null;
    this.clock = new THREE.Clock();
    this.animationCallbacks = [];
    this.isRunning = false;
  }

  init(canvas) {
    // Create scene with fog for atmospheric depth
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050510);
    this.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.015);

    // Create renderer with shadows enabled
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Enable shadows
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Tone mapping for better lighting
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.8;

    // Handle window resize
    window.addEventListener('resize', this.onResize.bind(this));

    return this;
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.renderer.setSize(width, height);
    
    // Dispatch custom event for camera and other modules to handle
    window.dispatchEvent(new CustomEvent('sceneResize', { 
      detail: { width, height } 
    }));
  }

  // Register callback to be called every frame
  onUpdate(callback) {
    this.animationCallbacks.push(callback);
    return () => {
      const index = this.animationCallbacks.indexOf(callback);
      if (index > -1) this.animationCallbacks.splice(index, 1);
    };
  }

  // Start animation loop
  start(camera) {
    if (this.isRunning) return;
    this.isRunning = true;
    
    const animate = () => {
      if (!this.isRunning) return;
      
      requestAnimationFrame(animate);
      
      const delta = this.clock.getDelta();
      const elapsed = this.clock.getElapsedTime();

      // Call all registered update callbacks
      for (const callback of this.animationCallbacks) {
        callback(delta, elapsed);
      }

      // Render scene
      this.renderer.render(this.scene, camera);
    };

    animate();
  }

  stop() {
    this.isRunning = false;
  }

  // Add object to scene
  add(object) {
    this.scene.add(object);
    return this;
  }

  // Remove object from scene
  remove(object) {
    this.scene.remove(object);
    return this;
  }

  // Clean up resources
  dispose() {
    this.stop();
    this.animationCallbacks = [];
    this.renderer.dispose();
    window.removeEventListener('resize', this.onResize.bind(this));
  }
}

// Export singleton instance
export const sceneManager = new SceneManager();
export default sceneManager;
