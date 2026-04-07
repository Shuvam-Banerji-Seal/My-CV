import * as THREE from 'three';

class Camera {
  constructor() {
    this.camera = null;
    this.targetPosition = new THREE.Vector3();
    this.targetLookAt = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();
    this.isMoving = false;
    this.moveSpeed = 5;
    this.lookSmoothing = 0.1;
    this.eyeLevel = 1.7; // Standard eye level above ground
  }

  init() {
    const aspect = window.innerWidth / window.innerHeight;
    
    this.camera = new THREE.PerspectiveCamera(
      70,     // FOV - wide for immersive feel
      aspect,
      0.1,    // Near plane
      500     // Far plane - enough to see distant terrain
    );
    
    // Initial position (starting point in the valley)
    this.camera.position.set(0, this.eyeLevel, 10);
    this.currentLookAt.set(0, this.eyeLevel, 0);
    this.camera.lookAt(this.currentLookAt);
    
    // Copy initial values
    this.targetPosition.copy(this.camera.position);
    this.targetLookAt.copy(this.currentLookAt);
    
    // Handle window resize
    window.addEventListener('sceneResize', this.onResize.bind(this));
    
    return this;
  }

  onResize(event) {
    const { width, height } = event.detail;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  // Get the camera instance
  getCamera() {
    return this.camera;
  }

  // Set position immediately
  setPosition(x, y, z) {
    this.camera.position.set(x, y, z);
    this.targetPosition.set(x, y, z);
    return this;
  }

  // Move to position smoothly
  moveTo(position, duration = 1) {
    this.targetPosition.copy(position);
    this.isMoving = true;
    this.moveDuration = duration;
    return this;
  }

  // Look at a point smoothly
  lookAt(target) {
    if (target instanceof THREE.Vector3) {
      this.targetLookAt.copy(target);
    } else if (target instanceof THREE.Object3D) {
      this.targetLookAt.copy(target.position);
    } else {
      this.targetLookAt.set(target.x, target.y, target.z);
    }
    return this;
  }

  // Look at immediately
  lookAtImmediate(target) {
    this.lookAt(target);
    this.currentLookAt.copy(this.targetLookAt);
    this.camera.lookAt(this.currentLookAt);
    return this;
  }

  // Get forward direction
  getForward() {
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    return direction;
  }

  // Get right direction
  getRight() {
    const forward = this.getForward();
    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    return right;
  }

  // Move in a direction relative to camera
  moveRelative(forward, right, up = 0, speed = 1) {
    const forwardDir = this.getForward();
    const rightDir = this.getRight();
    
    // Keep movement on horizontal plane
    forwardDir.y = 0;
    forwardDir.normalize();
    
    const movement = new THREE.Vector3();
    movement.addScaledVector(forwardDir, forward * speed);
    movement.addScaledVector(rightDir, right * speed);
    movement.y = up * speed;
    
    this.targetPosition.add(movement);
    return movement;
  }

  // Update camera each frame
  update(delta) {
    // Smooth position interpolation
    if (!this.camera.position.equals(this.targetPosition)) {
      this.camera.position.lerp(this.targetPosition, this.moveSpeed * delta);
      
      // Snap if close enough
      if (this.camera.position.distanceTo(this.targetPosition) < 0.001) {
        this.camera.position.copy(this.targetPosition);
        this.isMoving = false;
      }
    }
    
    // Smooth look-at interpolation
    if (!this.currentLookAt.equals(this.targetLookAt)) {
      this.currentLookAt.lerp(this.targetLookAt, this.lookSmoothing);
      this.camera.lookAt(this.currentLookAt);
    }
  }

  // Shake camera (for effects)
  shake(intensity = 0.1, duration = 0.3) {
    const originalPosition = this.camera.position.clone();
    const startTime = performance.now();
    
    const shakeLoop = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      if (elapsed >= duration) {
        this.camera.position.copy(originalPosition);
        return;
      }
      
      const decay = 1 - (elapsed / duration);
      const shakeIntensity = intensity * decay;
      
      this.camera.position.x = originalPosition.x + (Math.random() - 0.5) * shakeIntensity;
      this.camera.position.y = originalPosition.y + (Math.random() - 0.5) * shakeIntensity;
      this.camera.position.z = originalPosition.z + (Math.random() - 0.5) * shakeIntensity;
      
      requestAnimationFrame(shakeLoop);
    };
    
    shakeLoop();
  }

  // Set FOV with smooth transition
  setFOV(fov, duration = 0.5) {
    const startFOV = this.camera.fov;
    const startTime = performance.now();
    
    const fovLoop = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      
      this.camera.fov = startFOV + (fov - startFOV) * eased;
      this.camera.updateProjectionMatrix();
      
      if (progress < 1) {
        requestAnimationFrame(fovLoop);
      }
    };
    
    fovLoop();
  }
}

export const camera = new Camera();
export default camera;
