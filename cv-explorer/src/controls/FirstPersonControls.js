import * as THREE from 'three';

/**
 * First-person camera controls with pointer lock for mouse look
 * and WASD/Arrow keys for movement.
 */
export class FirstPersonControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    // Movement settings
    this.moveSpeed = 10; // units per second
    this.runMultiplier = 2; // speed multiplier when running
    this.lookSpeed = 0.002;
    this.enabled = true;

    // Movement state
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.isRunning = false;
    this.isLocked = false;

    // Rotation using Euler angles (YXZ order for FPS-style rotation)
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.minPolarAngle = Math.PI * 0.1; // Looking up limit (rad from top)
    this.maxPolarAngle = Math.PI * 0.9; // Looking down limit

    // Velocity and direction for smooth movement
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();

    // Acceleration/deceleration for smooth feel
    this.acceleration = 50; // units per second^2
    this.deceleration = 10; // friction factor

    // Boundary limits (terrain bounds)
    this.boundaryRadius = 90; // Stay within terrain
    this.minY = 1.0; // Minimum camera height
    this.maxY = 20; // Maximum camera height
    this.eyeLevel = 1.7; // Default eye level

    // Event handlers (bound for cleanup)
    this._onMouseMove = this.onMouseMove.bind(this);
    this._onKeyDown = this.onKeyDown.bind(this);
    this._onKeyUp = this.onKeyUp.bind(this);
    this._onPointerLockChange = this.onPointerLockChange.bind(this);
    this._onPointerLockError = this.onPointerLockError.bind(this);
    this._onClick = this.onClick.bind(this);

    // Interaction callback
    this.onInteract = null;

    this.init();
  }

  init() {
    // Initialize euler from camera's current rotation
    this.euler.setFromQuaternion(this.camera.quaternion);

    // Pointer lock events
    document.addEventListener('pointerlockchange', this._onPointerLockChange);
    document.addEventListener('pointerlockerror', this._onPointerLockError);

    // Mouse movement (only active when locked)
    document.addEventListener('mousemove', this._onMouseMove);

    // Keyboard events
    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);

    // Click to lock
    this.domElement.addEventListener('click', this._onClick);

    // Create instructions overlay
    this.createInstructions();
  }

  createInstructions() {
    this.instructions = document.createElement('div');
    this.instructions.id = 'controls-instructions';
    this.instructions.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        color: white;
        font-family: 'Courier New', monospace;
        pointer-events: none;
        z-index: 100;
        background: rgba(0, 0, 0, 0.7);
        padding: 30px 50px;
        border-radius: 10px;
        border: 1px solid rgba(100, 200, 255, 0.3);
      ">
        <h2 style="margin: 0 0 20px 0; color: #64c8ff;">Click to Explore</h2>
        <p style="margin: 10px 0; opacity: 0.8;">WASD / Arrow Keys - Move</p>
        <p style="margin: 10px 0; opacity: 0.8;">Mouse - Look Around</p>
        <p style="margin: 10px 0; opacity: 0.8;">Shift - Run</p>
        <p style="margin: 10px 0; opacity: 0.8;">Space - Interact</p>
        <p style="margin: 10px 0; opacity: 0.8;">ESC - Release Mouse</p>
      </div>
    `;
    document.body.appendChild(this.instructions);
  }

  showInstructions() {
    if (this.instructions) {
      this.instructions.style.display = 'block';
    }
  }

  hideInstructions() {
    if (this.instructions) {
      this.instructions.style.display = 'none';
    }
  }

  onClick(event) {
    if (!this.isLocked && this.enabled) {
      this.lock();
    }
  }

  lock() {
    this.domElement.requestPointerLock();
  }

  unlock() {
    document.exitPointerLock();
  }

  onPointerLockChange() {
    this.isLocked = document.pointerLockElement === this.domElement;

    if (this.isLocked) {
      this.hideInstructions();
      // Dispatch event for other systems
      this.domElement.dispatchEvent(new CustomEvent('controlsLocked'));
    } else {
      this.showInstructions();
      // Reset movement state when unlocking
      this.moveForward = false;
      this.moveBackward = false;
      this.moveLeft = false;
      this.moveRight = false;
      this.isRunning = false;
      // Dispatch event
      this.domElement.dispatchEvent(new CustomEvent('controlsUnlocked'));
    }
  }

  onPointerLockError() {
    console.error('Pointer lock failed');
  }

  onMouseMove(event) {
    if (!this.isLocked || !this.enabled) return;

    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    // Update euler angles
    this.euler.y -= movementX * this.lookSpeed;
    this.euler.x -= movementY * this.lookSpeed;

    // Clamp vertical rotation
    this.euler.x = Math.max(
      Math.PI / 2 - this.maxPolarAngle,
      Math.min(Math.PI / 2 - this.minPolarAngle, this.euler.x)
    );

    // Apply rotation to camera
    this.camera.quaternion.setFromEuler(this.euler);
  }

  onKeyDown(event) {
    if (!this.enabled) return;

    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.isRunning = true;
        break;
      case 'Space':
        if (this.isLocked) {
          event.preventDefault();
          this.interact();
        }
        break;
    }
  }

  onKeyUp(event) {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.isRunning = false;
        break;
    }
  }

  interact() {
    if (this.onInteract) {
      this.onInteract();
    }
    // Dispatch interaction event
    this.domElement.dispatchEvent(new CustomEvent('interact'));
  }

  update(delta) {
    if (!this.enabled) return;

    // Calculate target direction based on key state
    this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
    this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
    this.direction.normalize();

    // Calculate speed with run multiplier
    const currentSpeed = this.moveSpeed * (this.isRunning ? this.runMultiplier : 1);

    // Get camera's forward and right vectors (on horizontal plane)
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    // Calculate target velocity
    const targetVelocity = new THREE.Vector3();
    targetVelocity.addScaledVector(forward, this.direction.z * currentSpeed);
    targetVelocity.addScaledVector(right, this.direction.x * currentSpeed);

    // Smooth acceleration/deceleration
    if (this.direction.length() > 0) {
      // Accelerate towards target velocity
      this.velocity.lerp(targetVelocity, 1 - Math.exp(-this.acceleration * delta));
    } else {
      // Decelerate when no input
      this.velocity.multiplyScalar(Math.exp(-this.deceleration * delta));

      // Stop completely if very slow
      if (this.velocity.length() < 0.01) {
        this.velocity.set(0, 0, 0);
      }
    }

    // Apply velocity to position
    if (this.velocity.length() > 0) {
      const movement = this.velocity.clone().multiplyScalar(delta);
      const newPosition = this.camera.position.clone().add(movement);

      // Apply boundary constraints
      this.applyBoundaries(newPosition);

      // Update camera position
      this.camera.position.copy(newPosition);
    }
  }

  applyBoundaries(position) {
    // Circular boundary constraint
    const distanceFromCenter = Math.sqrt(
      position.x * position.x + position.z * position.z
    );

    if (distanceFromCenter > this.boundaryRadius) {
      const scale = this.boundaryRadius / distanceFromCenter;
      position.x *= scale;
      position.z *= scale;
    }

    // Height constraints
    position.y = Math.max(this.minY, Math.min(this.maxY, position.y));
  }

  // Set terrain height callback for ground following
  setTerrainHeightCallback(callback) {
    this.getTerrainHeight = callback;
  }

  // Follow terrain height
  updateTerrainFollow(position) {
    if (this.getTerrainHeight) {
      const terrainHeight = this.getTerrainHeight(position.x, position.z);
      position.y = Math.max(terrainHeight + this.eyeLevel, this.minY);
    }
  }

  // Enable/disable controls
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled && this.isLocked) {
      this.unlock();
    }
  }

  // Get camera direction for raycasting
  getDirection() {
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    return direction;
  }

  dispose() {
    // Remove event listeners
    document.removeEventListener('pointerlockchange', this._onPointerLockChange);
    document.removeEventListener('pointerlockerror', this._onPointerLockError);
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
    this.domElement.removeEventListener('click', this._onClick);

    // Remove instructions overlay
    if (this.instructions && this.instructions.parentNode) {
      this.instructions.parentNode.removeChild(this.instructions);
    }

    // Unlock if locked
    if (this.isLocked) {
      this.unlock();
    }
  }
}

export default FirstPersonControls;
