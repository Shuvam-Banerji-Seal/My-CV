import * as THREE from 'three';

/**
 * Touch-based controls for mobile devices.
 * Features virtual joystick for movement and touch-drag for looking.
 */
export class TouchControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    // Settings
    this.moveSpeed = 8;
    this.lookSpeed = 0.003;
    this.enabled = true;

    // Rotation state
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.minPolarAngle = Math.PI * 0.1;
    this.maxPolarAngle = Math.PI * 0.9;

    // Movement velocity
    this.velocity = new THREE.Vector3();
    this.deceleration = 8;

    // Boundary limits
    this.boundaryRadius = 90;
    this.minY = 1.0;
    this.maxY = 20;
    this.eyeLevel = 1.7;

    // Touch state
    this.joystickTouch = null;
    this.lookTouch = null;
    this.joystickStart = { x: 0, y: 0 };
    this.joystickCurrent = { x: 0, y: 0 };
    this.lastLookPosition = { x: 0, y: 0 };

    // Joystick config
    this.joystickSize = 120;
    this.joystickInnerSize = 50;
    this.joystickMaxDistance = 50;

    // Interaction callback
    this.onInteract = null;

    // Detect if touch device
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (this.isTouchDevice) {
      this.init();
    }
  }

  init() {
    // Initialize euler from camera
    this.euler.setFromQuaternion(this.camera.quaternion);

    // Create UI elements
    this.createJoystick();
    this.createInteractButton();

    // Bind event handlers
    this._onTouchStart = this.onTouchStart.bind(this);
    this._onTouchMove = this.onTouchMove.bind(this);
    this._onTouchEnd = this.onTouchEnd.bind(this);

    // Add touch listeners
    this.domElement.addEventListener('touchstart', this._onTouchStart, { passive: false });
    this.domElement.addEventListener('touchmove', this._onTouchMove, { passive: false });
    this.domElement.addEventListener('touchend', this._onTouchEnd);
    this.domElement.addEventListener('touchcancel', this._onTouchEnd);
  }

  createJoystick() {
    // Joystick container (outer ring)
    this.joystickOuter = document.createElement('div');
    this.joystickOuter.id = 'touch-joystick-outer';
    Object.assign(this.joystickOuter.style, {
      position: 'fixed',
      left: '30px',
      bottom: '30px',
      width: `${this.joystickSize}px`,
      height: `${this.joystickSize}px`,
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '2px solid rgba(100, 200, 255, 0.4)',
      touchAction: 'none',
      zIndex: '1000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    });

    // Joystick inner (movable knob)
    this.joystickInner = document.createElement('div');
    this.joystickInner.id = 'touch-joystick-inner';
    Object.assign(this.joystickInner.style, {
      width: `${this.joystickInnerSize}px`,
      height: `${this.joystickInnerSize}px`,
      borderRadius: '50%',
      background: 'rgba(100, 200, 255, 0.6)',
      boxShadow: '0 0 10px rgba(100, 200, 255, 0.5)',
      transition: 'transform 0.05s ease-out'
    });

    this.joystickOuter.appendChild(this.joystickInner);
    document.body.appendChild(this.joystickOuter);

    // Store joystick center position
    this.updateJoystickBounds();
    window.addEventListener('resize', () => this.updateJoystickBounds());
  }

  updateJoystickBounds() {
    const rect = this.joystickOuter.getBoundingClientRect();
    this.joystickCenter = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  createInteractButton() {
    this.interactButton = document.createElement('div');
    this.interactButton.id = 'touch-interact-button';
    this.interactButton.innerHTML = '⎯';
    Object.assign(this.interactButton.style, {
      position: 'fixed',
      right: '30px',
      bottom: '30px',
      width: '70px',
      height: '70px',
      borderRadius: '50%',
      background: 'rgba(100, 200, 255, 0.2)',
      border: '2px solid rgba(100, 200, 255, 0.5)',
      color: 'white',
      fontSize: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      touchAction: 'none',
      zIndex: '1000',
      userSelect: 'none'
    });

    this.interactButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.interactButton.style.background = 'rgba(100, 200, 255, 0.5)';
      this.interact();
    });

    this.interactButton.addEventListener('touchend', () => {
      this.interactButton.style.background = 'rgba(100, 200, 255, 0.2)';
    });

    document.body.appendChild(this.interactButton);
  }

  onTouchStart(event) {
    if (!this.enabled) return;

    for (const touch of event.changedTouches) {
      const x = touch.clientX;
      const y = touch.clientY;

      // Check if touch is on joystick area (left side of screen, bottom half)
      if (x < window.innerWidth / 3 && y > window.innerHeight / 2) {
        if (!this.joystickTouch) {
          event.preventDefault();
          this.joystickTouch = touch.identifier;
          this.joystickStart = { x, y };
          this.joystickCurrent = { x, y };
          this.updateJoystickVisual();
        }
      } else if (x > window.innerWidth / 3) {
        // Look touch (right 2/3 of screen)
        if (!this.lookTouch) {
          event.preventDefault();
          this.lookTouch = touch.identifier;
          this.lastLookPosition = { x, y };
        }
      }
    }
  }

  onTouchMove(event) {
    if (!this.enabled) return;

    for (const touch of event.changedTouches) {
      if (touch.identifier === this.joystickTouch) {
        event.preventDefault();
        this.joystickCurrent = { x: touch.clientX, y: touch.clientY };
        this.updateJoystickVisual();
      } else if (touch.identifier === this.lookTouch) {
        event.preventDefault();
        const deltaX = touch.clientX - this.lastLookPosition.x;
        const deltaY = touch.clientY - this.lastLookPosition.y;

        // Update look rotation
        this.euler.y -= deltaX * this.lookSpeed;
        this.euler.x -= deltaY * this.lookSpeed;

        // Clamp vertical rotation
        this.euler.x = Math.max(
          Math.PI / 2 - this.maxPolarAngle,
          Math.min(Math.PI / 2 - this.minPolarAngle, this.euler.x)
        );

        this.camera.quaternion.setFromEuler(this.euler);
        this.lastLookPosition = { x: touch.clientX, y: touch.clientY };
      }
    }
  }

  onTouchEnd(event) {
    for (const touch of event.changedTouches) {
      if (touch.identifier === this.joystickTouch) {
        this.joystickTouch = null;
        this.joystickCurrent = { ...this.joystickStart };
        this.resetJoystickVisual();
      } else if (touch.identifier === this.lookTouch) {
        this.lookTouch = null;
      }
    }
  }

  updateJoystickVisual() {
    const dx = this.joystickCurrent.x - this.joystickCenter.x;
    const dy = this.joystickCurrent.y - this.joystickCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDist = this.joystickMaxDistance;

    let moveX = dx;
    let moveY = dy;

    if (distance > maxDist) {
      moveX = (dx / distance) * maxDist;
      moveY = (dy / distance) * maxDist;
    }

    this.joystickInner.style.transform = `translate(${moveX}px, ${moveY}px)`;
  }

  resetJoystickVisual() {
    this.joystickInner.style.transform = 'translate(0, 0)';
  }

  getJoystickInput() {
    if (!this.joystickTouch) return { x: 0, y: 0 };

    const dx = this.joystickCurrent.x - this.joystickCenter.x;
    const dy = this.joystickCurrent.y - this.joystickCenter.y;
    const maxDist = this.joystickMaxDistance;

    return {
      x: Math.max(-1, Math.min(1, dx / maxDist)),
      y: Math.max(-1, Math.min(1, -dy / maxDist)) // Invert Y for forward
    };
  }

  interact() {
    if (this.onInteract) {
      this.onInteract();
    }
    this.domElement.dispatchEvent(new CustomEvent('interact'));
  }

  update(delta) {
    if (!this.enabled || !this.isTouchDevice) return;

    const input = this.getJoystickInput();

    if (Math.abs(input.x) > 0.1 || Math.abs(input.y) > 0.1) {
      // Get camera directions
      const forward = new THREE.Vector3();
      this.camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();

      const right = new THREE.Vector3();
      right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

      // Calculate target velocity
      const targetVelocity = new THREE.Vector3();
      targetVelocity.addScaledVector(forward, input.y * this.moveSpeed);
      targetVelocity.addScaledVector(right, input.x * this.moveSpeed);

      this.velocity.lerp(targetVelocity, 0.2);
    } else {
      // Decelerate
      this.velocity.multiplyScalar(Math.exp(-this.deceleration * delta));
      if (this.velocity.length() < 0.01) {
        this.velocity.set(0, 0, 0);
      }
    }

    // Apply movement
    if (this.velocity.length() > 0) {
      const movement = this.velocity.clone().multiplyScalar(delta);
      const newPosition = this.camera.position.clone().add(movement);

      // Apply boundaries
      this.applyBoundaries(newPosition);
      this.camera.position.copy(newPosition);
    }
  }

  applyBoundaries(position) {
    const distanceFromCenter = Math.sqrt(
      position.x * position.x + position.z * position.z
    );

    if (distanceFromCenter > this.boundaryRadius) {
      const scale = this.boundaryRadius / distanceFromCenter;
      position.x *= scale;
      position.z *= scale;
    }

    position.y = Math.max(this.minY, Math.min(this.maxY, position.y));
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (this.joystickOuter) {
      this.joystickOuter.style.display = enabled ? 'flex' : 'none';
    }
    if (this.interactButton) {
      this.interactButton.style.display = enabled ? 'flex' : 'none';
    }
  }

  show() {
    if (this.joystickOuter) this.joystickOuter.style.display = 'flex';
    if (this.interactButton) this.interactButton.style.display = 'flex';
  }

  hide() {
    if (this.joystickOuter) this.joystickOuter.style.display = 'none';
    if (this.interactButton) this.interactButton.style.display = 'none';
  }

  getDirection() {
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    return direction;
  }

  dispose() {
    if (!this.isTouchDevice) return;

    this.domElement.removeEventListener('touchstart', this._onTouchStart);
    this.domElement.removeEventListener('touchmove', this._onTouchMove);
    this.domElement.removeEventListener('touchend', this._onTouchEnd);
    this.domElement.removeEventListener('touchcancel', this._onTouchEnd);

    if (this.joystickOuter && this.joystickOuter.parentNode) {
      this.joystickOuter.parentNode.removeChild(this.joystickOuter);
    }
    if (this.interactButton && this.interactButton.parentNode) {
      this.interactButton.parentNode.removeChild(this.interactButton);
    }
  }
}

export default TouchControls;
