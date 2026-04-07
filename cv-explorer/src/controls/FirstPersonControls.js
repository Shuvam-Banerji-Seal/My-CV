import * as THREE from 'three';

/**
 * First-person camera controls with pointer lock for mouse look
 * and WASD/Arrow keys for movement. Includes terrain following and collision detection.
 */
export class FirstPersonControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    // Movement settings
    this.moveSpeed = 8; // units per second (reduced for better control)
    this.runMultiplier = 1.8;
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
    this.minPolarAngle = Math.PI * 0.1;
    this.maxPolarAngle = Math.PI * 0.9;

    // Velocity and direction for smooth movement
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();

    // Acceleration/deceleration
    this.acceleration = 40; // Reduced for smoother feel
    this.deceleration = 8;

    // Boundaries
    this.boundaryRadius = 85;
    this.eyeLevel = 1.7;

    // Terrain following
    this.getTerrainHeight = null;
    this.currentTerrainHeight = 0;
    this.heightSmoothFactor = 8; // Smooth terrain following

    // Collision detection
    this.collisionRadius = 0.5;
    this.checkCollision = null; // Callback for collision checking

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

    // Mouse movement
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
        background: rgba(0, 0, 0, 0.8);
        padding: 30px 50px;
        border-radius: 10px;
        border: 1px solid rgba(100, 200, 255, 0.4);
        box-shadow: 0 0 30px rgba(0, 100, 200, 0.2);
      ">
        <h2 style="margin: 0 0 20px 0; color: #64c8ff; text-shadow: 0 0 10px rgba(100, 200, 255, 0.5);">Click to Explore CV</h2>
        <p style="margin: 10px 0; opacity: 0.9;">WASD / Arrow Keys - Move</p>
        <p style="margin: 10px 0; opacity: 0.9;">Mouse - Look Around</p>
        <p style="margin: 10px 0; opacity: 0.9;">Shift - Run</p>
        <p style="margin: 10px 0; opacity: 0.9;">ESC - Release Mouse</p>
        <p style="margin: 15px 0 0 0; font-size: 0.8em; opacity: 0.6;">Walk towards glowing objects to explore</p>
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
      this.domElement.dispatchEvent(new CustomEvent('controlsLocked'));
    } else {
      this.showInstructions();
      // Reset movement state
      this.moveForward = false;
      this.moveBackward = false;
      this.moveLeft = false;
      this.moveRight = false;
      this.isRunning = false;
      this.velocity.set(0, 0, 0);
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
    this.domElement.dispatchEvent(new CustomEvent('interact'));
  }

  update(delta) {
    if (!this.enabled) return;

    // Calculate target direction
    this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
    this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
    this.direction.normalize();

    // Speed with run multiplier
    const currentSpeed = this.moveSpeed * (this.isRunning ? this.runMultiplier : 1);

    // Get camera directions on horizontal plane
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
      this.velocity.lerp(targetVelocity, 1 - Math.exp(-this.acceleration * delta));
    } else {
      this.velocity.multiplyScalar(Math.exp(-this.deceleration * delta));
      if (this.velocity.length() < 0.01) {
        this.velocity.set(0, 0, 0);
      }
    }

    // Apply movement
    if (this.velocity.length() > 0.001) {
      const movement = this.velocity.clone().multiplyScalar(delta);
      const newPosition = this.camera.position.clone().add(movement);

      // Apply collision detection
      if (this.checkCollision) {
        const pushOut = this.checkCollision(newPosition, this.collisionRadius);
        if (pushOut) {
          newPosition.add(pushOut);
          // Reduce velocity in collision direction
          this.velocity.multiplyScalar(0.5);
        }
      }

      // Apply boundary constraints
      this.applyBoundaries(newPosition);

      // Update terrain height with smoothing
      if (this.getTerrainHeight) {
        const targetHeight = this.getTerrainHeight(newPosition.x, newPosition.z) + this.eyeLevel;
        this.currentTerrainHeight = THREE.MathUtils.lerp(
          this.currentTerrainHeight || targetHeight,
          targetHeight,
          this.heightSmoothFactor * delta
        );
        newPosition.y = this.currentTerrainHeight;
      }

      // Update camera position
      this.camera.position.copy(newPosition);
    } else {
      // Even when standing still, follow terrain
      if (this.getTerrainHeight) {
        const targetHeight = this.getTerrainHeight(this.camera.position.x, this.camera.position.z) + this.eyeLevel;
        this.currentTerrainHeight = THREE.MathUtils.lerp(
          this.currentTerrainHeight || targetHeight,
          targetHeight,
          this.heightSmoothFactor * delta
        );
        this.camera.position.y = this.currentTerrainHeight;
      }
    }
  }

  applyBoundaries(position) {
    // Circular boundary constraint
    const distanceFromCenter = Math.sqrt(position.x * position.x + position.z * position.z);

    if (distanceFromCenter > this.boundaryRadius) {
      const scale = this.boundaryRadius / distanceFromCenter;
      position.x *= scale;
      position.z *= scale;
    }
  }

  // Set terrain height callback
  setTerrainHeightCallback(callback) {
    this.getTerrainHeight = callback;
    // Initialize current height
    if (callback) {
      this.currentTerrainHeight = callback(this.camera.position.x, this.camera.position.z) + this.eyeLevel;
      this.camera.position.y = this.currentTerrainHeight;
    }
  }

  // Set collision callback
  setCollisionCallback(callback) {
    this.checkCollision = callback;
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
    document.removeEventListener('pointerlockchange', this._onPointerLockChange);
    document.removeEventListener('pointerlockerror', this._onPointerLockError);
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
    this.domElement.removeEventListener('click', this._onClick);

    if (this.instructions && this.instructions.parentNode) {
      this.instructions.parentNode.removeChild(this.instructions);
    }

    if (this.isLocked) {
      this.unlock();
    }
  }
}

export default FirstPersonControls;
