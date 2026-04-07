import * as THREE from 'three';

/**
 * Raycaster system for interaction detection.
 * Handles hover and click detection on 3D objects.
 */
export class InteractionRaycaster {
  constructor(camera, scene, domElement) {
    this.camera = camera;
    this.scene = scene;
    this.domElement = domElement;

    this.raycaster = new THREE.Raycaster();
    this.enabled = true;

    // Raycast from center of screen (for first-person)
    this.centerScreen = new THREE.Vector2(0, 0);

    // Interaction settings
    this.maxDistance = 10; // Maximum interaction distance
    this.raycaster.far = this.maxDistance;

    // State
    this.hoveredObject = null;
    this.selectedObject = null;

    // Objects that can be interacted with
    this.interactables = [];

    // Callbacks
    this.onHoverStart = null;
    this.onHoverEnd = null;
    this.onSelect = null;

    // Visual cursor
    this.cursor = null;
    this.createCursor();
  }

  createCursor() {
    // Create crosshair cursor at screen center
    this.cursor = document.createElement('div');
    this.cursor.id = 'interaction-cursor';
    Object.assign(this.cursor.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      border: '2px solid rgba(255, 255, 255, 0.6)',
      boxShadow: '0 0 4px rgba(0, 0, 0, 0.5)',
      pointerEvents: 'none',
      zIndex: '1000',
      transition: 'all 0.15s ease-out'
    });

    document.body.appendChild(this.cursor);
  }

  // Register an object as interactable
  addInteractable(object, options = {}) {
    const interactable = {
      object,
      type: options.type || 'default',
      data: options.data || {},
      onHover: options.onHover || null,
      onSelect: options.onSelect || null,
      hoverColor: options.hoverColor || null
    };

    // Store original materials for hover effect
    if (object.material) {
      interactable.originalMaterial = object.material.clone();
    }

    // Tag the object for raycasting
    object.userData.interactable = true;
    object.userData.interactableData = interactable;

    this.interactables.push(interactable);
    return this;
  }

  // Remove interactable
  removeInteractable(object) {
    const index = this.interactables.findIndex((i) => i.object === object);
    if (index > -1) {
      this.interactables.splice(index, 1);
      object.userData.interactable = false;
      delete object.userData.interactableData;
    }
    return this;
  }

  // Get all interactable objects for raycasting
  getInteractableObjects() {
    return this.interactables.map((i) => i.object);
  }

  // Perform raycast and update hover state
  update() {
    if (!this.enabled) return;

    // Cast ray from camera center
    this.raycaster.setFromCamera(this.centerScreen, this.camera);

    // Get intersections with interactable objects
    const objects = this.getInteractableObjects();
    const intersects = this.raycaster.intersectObjects(objects, true);

    // Find closest interactable intersection
    let closestInteractable = null;
    for (const intersect of intersects) {
      let obj = intersect.object;

      // Traverse up to find interactable parent
      while (obj && !obj.userData.interactable) {
        obj = obj.parent;
      }

      if (obj && obj.userData.interactable) {
        closestInteractable = {
          object: obj,
          distance: intersect.distance,
          point: intersect.point,
          data: obj.userData.interactableData
        };
        break;
      }
    }

    // Handle hover state changes
    if (closestInteractable) {
      if (this.hoveredObject !== closestInteractable.object) {
        // End previous hover
        if (this.hoveredObject) {
          this.handleHoverEnd(this.hoveredObject);
        }

        // Start new hover
        this.hoveredObject = closestInteractable.object;
        this.handleHoverStart(closestInteractable);
      }

      // Update cursor for hovering
      this.setCursorHover(true);
    } else {
      // End hover if nothing is hovered
      if (this.hoveredObject) {
        this.handleHoverEnd(this.hoveredObject);
        this.hoveredObject = null;
      }

      // Reset cursor
      this.setCursorHover(false);
    }
  }

  handleHoverStart(intersect) {
    const data = intersect.data;

    // Apply hover visual effect
    if (data.hoverColor && intersect.object.material) {
      if (intersect.object.material.emissive) {
        intersect.object.material.emissive.setHex(data.hoverColor);
      }
    }

    // Call hover callback
    if (data.onHover) {
      data.onHover(intersect.object, true);
    }

    // Global callback
    if (this.onHoverStart) {
      this.onHoverStart(intersect);
    }

    // Dispatch event
    this.domElement.dispatchEvent(
      new CustomEvent('objectHoverStart', {
        detail: {
          object: intersect.object,
          point: intersect.point,
          data: data.data,
          type: data.type
        }
      })
    );
  }

  handleHoverEnd(object) {
    const data = object.userData.interactableData;
    if (!data) return;

    // Reset hover visual effect
    if (data.hoverColor && object.material && object.material.emissive) {
      object.material.emissive.setHex(0x000000);
    }

    // Call hover callback
    if (data.onHover) {
      data.onHover(object, false);
    }

    // Global callback
    if (this.onHoverEnd) {
      this.onHoverEnd(object);
    }

    // Dispatch event
    this.domElement.dispatchEvent(
      new CustomEvent('objectHoverEnd', {
        detail: { object, type: data.type }
      })
    );
  }

  // Handle interaction/selection
  interact() {
    if (!this.enabled || !this.hoveredObject) return null;

    const data = this.hoveredObject.userData.interactableData;

    // Set as selected
    this.selectedObject = this.hoveredObject;

    // Call select callback
    if (data.onSelect) {
      data.onSelect(this.hoveredObject, data.data);
    }

    // Global callback
    if (this.onSelect) {
      this.onSelect({
        object: this.hoveredObject,
        data: data.data,
        type: data.type
      });
    }

    // Dispatch event
    this.domElement.dispatchEvent(
      new CustomEvent('objectSelected', {
        detail: {
          object: this.hoveredObject,
          data: data.data,
          type: data.type
        }
      })
    );

    // Visual feedback
    this.setCursorSelect();

    return {
      object: this.hoveredObject,
      data: data.data,
      type: data.type
    };
  }

  setCursorHover(isHovering) {
    if (!this.cursor) return;

    if (isHovering) {
      Object.assign(this.cursor.style, {
        width: '12px',
        height: '12px',
        borderColor: 'rgba(100, 200, 255, 0.9)',
        background: 'rgba(100, 200, 255, 0.3)'
      });
    } else {
      Object.assign(this.cursor.style, {
        width: '8px',
        height: '8px',
        borderColor: 'rgba(255, 255, 255, 0.6)',
        background: 'transparent'
      });
    }
  }

  setCursorSelect() {
    if (!this.cursor) return;

    // Pulse animation on select
    this.cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
    setTimeout(() => {
      this.cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 150);
  }

  showCursor() {
    if (this.cursor) {
      this.cursor.style.display = 'block';
    }
  }

  hideCursor() {
    if (this.cursor) {
      this.cursor.style.display = 'none';
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (enabled) {
      this.showCursor();
    } else {
      this.hideCursor();
    }
  }

  // Check if an object is currently hovered
  isHovered(object) {
    return this.hoveredObject === object;
  }

  // Get currently hovered object
  getHoveredObject() {
    return this.hoveredObject;
  }

  // Get currently selected object
  getSelectedObject() {
    return this.selectedObject;
  }

  // Clear selection
  clearSelection() {
    this.selectedObject = null;
  }

  dispose() {
    // Clear interactables
    this.interactables = [];
    this.hoveredObject = null;
    this.selectedObject = null;

    // Remove cursor
    if (this.cursor && this.cursor.parentNode) {
      this.cursor.parentNode.removeChild(this.cursor);
    }
  }
}

export default InteractionRaycaster;
